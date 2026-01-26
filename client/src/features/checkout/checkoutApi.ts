import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithErrorHandling } from "../../app/api/baseApi";
import type { Basket } from "../../app/models/basket";
import { basketApi } from "../basket/basketApi";

export const checkoutApi = createApi({
  reducerPath: "checkoutApi",
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: ["Checkout"],
  endpoints: (builder) => ({
    createPaymentIntent: builder.mutation<Basket, void>({
      query: () => {
        return {
          url: "payments",
          method: "POST",
        };
      },
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled; // After the query is fulfilled we should get our basket
          dispatch(
            basketApi.util.updateQueryData(
              "fetchBasket",
              undefined,
              (draft) => {
                draft.clientSecret = data.clientSecret;
              },
            ),
          );
        } catch (error) {
          console.log("Payment intent creation failed: ", error);
        }
      },
    }),
  }),
});

export const { useCreatePaymentIntentMutation } = checkoutApi;
