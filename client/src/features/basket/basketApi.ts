import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithErrorHandling } from "../../app/api/baseApi";
import { type Item, type Basket } from "../../app/models/basket";
import type { Product } from "../../app/models/product";

// When we try to add an item to the basket we can do this from the catalog page that contains a list of products, or from the basket that contains a list of basket items. Since these are two different objects (Product - defined in the product.ts, or Item - defined in the basket.ts). Therefore we need to implement a type guard that will tell us what is the correct object we are working with so we will know to pass the correct parameters:
function isBasketItem(product: Product | Item): product is Item {
  // The product is Item is the return type which is boolean
  // Since only the Item has quantity, if it is a product the result will be undefined. This is how we know if the object is an item or a product
  return (product as Item).quantity !== undefined;
}

export const basketApi = createApi({
  reducerPath: "basketApi",
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: ["Basket"],
  endpoints: (builder) => ({
    fetchBasket: builder.query<Basket, void>({
      query: () => ({ url: "basket" }),
      providesTags: ["Basket"], // This will connect the type tag to the data we are fetching so we will be able to invalidate it by the tag when required
    }),
    addBasketItem: builder.mutation<
      Basket,
      { product: Product | Item; quantity: number }
    >({
      query: ({ product, quantity }) => {
        const productId = isBasketItem(product)
          ? product.productId
          : product.id;
        return {
          url: `basket?productId=${productId}&quantity=${quantity}`,
          method: "POST",
        };
      },
      // Implementing an optimistic feature.
      // The first argument of the async onQueryStarted function is an argument for parameters which are required for the mutation. We do not have to pass if we do not need (instead pass '_'). Here we do need parameters because we want to immediately update the basket state by adding the specified quantity to the relevant product. The second one gives us access to our store feature (we need the dispatch from there). Here we do need to pass some arguments
      // Here we are defining that on adding an item to the basket we want to first set the state of the items quantity so we can immediately display it in the cart icon in the NavBar and if it fails than undo the state update. We change the state by dispatching an updateQueryData action.  This action is a Redux thunk action creator that, when dispatched, creates and applies a set of JSON diff/patch objects to the current state. This immediately updates the Redux state with those changes.
      // The thunk action creator accepts three arguments: the name of the endpoint we are updating (such as 'getPost'. In this case it is the "fetchBasket" endpoint), the appropriate query arg values to construct the desired cache key, and an updateRecipe callback function. The callback receives an Immer-wrapped draft of the current state, and may modify the draft to match the expected results after the mutation completes successfully.
      onQueryStarted: async (
        { product, quantity },
        { dispatch, queryFulfilled },
      ) => {
        let isNewBasket = false;
        const patchResult = dispatch(
          basketApi.util.updateQueryData("fetchBasket", undefined, (draft) => {
            const productId = isBasketItem(product)
              ? product.productId
              : product.id;
            if (!draft?.basketId) isNewBasket = true;
            if (!isNewBasket) {
              const existingItem = draft.items.find(
                (item) => item.productId === productId,
              );
              if (existingItem) {
                existingItem.quantity += quantity;
              } else {
                draft.items.push(
                  isBasketItem(product)
                    ? product
                    : { ...product, productId: product.id, quantity },
                );
              }
            }
          }),
        );
        try {
          // Here we await to the queryFulfilled to end its task. It returns a Promise so we use the await
          await queryFulfilled;
          // Once the queryFulfilled is completed we are dispatching the invalidateTags using the util class. We can also invalidate a specific object and not the entire data that is corelated with the 'Basket' tag by providing an object: ...invalidateTags([{type: "Basket", id: 2 }])
          //dispatch(basketApi.util.invalidateTags(["Basket"])); // Removing the dispatch from here because we are executing it above in the onQueryStarted function
          if (isNewBasket) dispatch(basketApi.util.invalidateTags(["Basket"]));
        } catch (error) {
          console.log(error);
          patchResult.undo(); // If we get an error we want to undo all the changes we made in the store using the dispatch
        }
      },
    }),
    removeBasketItem: builder.mutation<
      void,
      { productId: number; quantity: number }
    >({
      query: ({ productId, quantity }) => ({
        url: `basket?productId=${productId}&quantity=${quantity}`,
        method: "DELETE",
      }),
      onQueryStarted: async (
        { productId, quantity },
        { dispatch, queryFulfilled },
      ) => {
        const patchResult = dispatch(
          basketApi.util.updateQueryData("fetchBasket", undefined, (draft) => {
            const itemIndex = draft.items.findIndex(
              (item) => item.productId === productId,
            );
            if (itemIndex >= 0) {
              draft.items[itemIndex].quantity -= quantity;
              if (draft.items[itemIndex].quantity <= 0) {
                draft.items.splice(itemIndex, 1); // Removing 1 element from the draft array starting at the item index. Basically it removes the item we want
              }
            }
          }),
        );
        try {
          await queryFulfilled;
        } catch (error) {
          console.log(error);
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useFetchBasketQuery,
  useAddBasketItemMutation,
  useRemoveBasketItemMutation,
} = basketApi;
