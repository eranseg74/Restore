import { configureStore } from "@reduxjs/toolkit";
import { counterSlice } from "../../features/contact/counterReducer";
import { useDispatch, useSelector } from "react-redux";
import { catalogApi } from "../../features/catalog/catalogApi";
import { uiSlice } from "../layout/uiSlice";
import { errorApi } from "../../features/about/errorApi";
import { basketApi } from "../../features/basket/basketApi";
import { catalogSlice } from "../../features/catalog/catalogSlice";
import { accountApi } from "../../features/account/accountApi";
import { checkoutApi } from "../../features/checkout/checkoutApi";
import { orderApi } from "../../features/orders/orderApi";
import { adminApi } from "../../features/admin/adminApi";

// LEGACY
// export function configureTheStore() {
//   return legacy_createStore(counterReducer);
// }

export const store = configureStore({
  reducer: {
    // Here we are defining all the slices of state that our Redux store will manage. Each slice corresponds to a specific feature or domain of our application.
    // The reducerPath is a unique key that identifies the slice of state managed by each API service created using Redux Toolkit Query.
    // For example - [catalogApi.reducerPath]: catalogApi.reducer means that we are using the reducer provided by the catalogApi service to manage the state related to catalog data.
    [catalogApi.reducerPath]: catalogApi.reducer, // For every slice we create using the redux toolkit query we need to define a middleware
    [errorApi.reducerPath]: errorApi.reducer,
    [basketApi.reducerPath]: basketApi.reducer,
    [accountApi.reducerPath]: accountApi.reducer,
    [checkoutApi.reducerPath]: checkoutApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    counter: counterSlice.reducer,
    ui: uiSlice.reducer,
    catalog: catalogSlice.reducer,
  },
  middleware: (
    getDefaultMiddleware, // No need to implement the getDefaultMiddleware function. It is provided by the Redux Toolkit Query. Here we are adding the defsault middleware, our own catalogApi middleware. We are configuring this to be used by our Redux store. We need this middleware to handle the API request, intercept, dispatch, actions (related to queries), initiates the fetching process. Also, helps with caching and cache validation. And also helps to catch and handle errors
  ) =>
    getDefaultMiddleware().concat(
      catalogApi.middleware,
      errorApi.middleware,
      basketApi.middleware,
      accountApi.middleware,
      checkoutApi.middleware,
      orderApi.middleware,
      adminApi.middleware,
    ),
});

// Infer the `RootState`, `AppDispatch`, and `AppStore` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
