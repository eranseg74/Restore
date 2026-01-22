import { configureStore } from "@reduxjs/toolkit";
import { counterSlice } from "../../features/contact/counterReducer";
import { useDispatch, useSelector } from "react-redux";
import { catalogApi } from "../../features/catalog/catalogApi";
import { uiSlice } from "../layout/uiSlice";

// LEGACY
// export function configureTheStore() {
//   return legacy_createStore(counterReducer);
// }

export const store = configureStore({
  reducer: {
    [catalogApi.reducerPath]: catalogApi.reducer, // For every slice we create using the redux toolkit query we need to define a middleware
    counter: counterSlice.reducer,
    ui: uiSlice.reducer,
  },
  middleware: (
    getDefaultMiddleware, // No need to implement the getDefaultMiddleware function. It is provided by the Redux Toolkit Query. Here we are adding the defsault middleware, our own catalogApi middleware. We are configuring this to be used by our Redux store. We need this middleware to handle the API request, intercept, dispatch, actions (related to queries), initiates the fetching process. Also, helps with caching and cache validation. And oalso helps to catch and handle errors
  ) => getDefaultMiddleware().concat(catalogApi.middleware),
});

// Infer the `RootState`, `AppDispatch`, and `AppStore` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
