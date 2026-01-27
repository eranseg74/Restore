import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithErrorHandling } from "../../app/api/baseApi";
import { type Address, type User } from "../../app/models/user";
import type { LoginSchema } from "../../app/lib/schemas/loginSchema";
import { router } from "../../app/routes/Routes";
import type { RegisterSchema } from "../../app/lib/schemas/registerSchema";
import { toast } from "react-toastify";

export const accountApi = createApi({
  reducerPath: "accountApi",
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: ["userInfo"],
  endpoints: (builder) => ({
    register: builder.mutation<void, RegisterSchema>({
      query: (creds) => ({
        url: "account/register",
        method: "POST",
        body: creds,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Registration successful - you can now sign in!");
          router.navigate("/login"); // Redirecting the user to the login page after successful registration. The router object is imported from the Routes.tsx file where we defined our routes using react-router-dom's createBrowserRouter function and is of type BrowserRouter. The navigate method is used to programmatically navigate to a different route.
        } catch (error) {
          console.log(error);
          throw error;
        }
      },
    }),
    // Although we are not mutating anything we still use .mutation because it is a POST request
    login: builder.mutation<void, LoginSchema>({
      query: (creds) => ({
        url: "login?useCookies=true",
        method: "POST",
        body: creds,
      }),
      // The onQueryStarted is a function that is called when the individual mutation is started. The function is called with a lifecycle api object containing properties such as queryFulfilled, allowing code to be run when a query is started, when it succeeds, and when it fails (i.e. throughout the lifecycle of an individual query/mutation call).
      // Can be used for optimistic updates.
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled; // Awaiting the result of the query. the queryFulfilled promise will resolve when the query is successful
          // Invalidate the userInfo query to force a refetch after a successful login
          dispatch(accountApi.util.invalidateTags(["userInfo"]));
        } catch (error) {
          console.log(error);
        }
      },
    }),
    userInfo: builder.query<User, void>({
      query: () => "account/user-info",
      providesTags: ["userInfo"],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "account/logout",
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled; // Awaiting the result of the query. the queryFulfilled promise will resolve when the query is successful
          // Invalidate the userInfo query to force a refetch after a successful logout
          dispatch(accountApi.util.invalidateTags(["userInfo"]));
          router.navigate("/");
        } catch (error) {
          console.log(error);
        }
      },
    }),
    fetchAddress: builder.query<Address, void>({
      query: () => ({
        url: "account/address",
      }),
    }),
    updateUserAddress: builder.mutation<Address, Address>({
      query: (address) => ({
        url: "account/address",
        method: "POST",
        body: address,
      }),
      onQueryStarted: async (address, { dispatch, queryFulfilled }) => {
        // Optimistic implementation
        // We are updating the cached data for the fetchAddress query before the mutation is completed successfully. If the mutation fails we will undo the optimistic update
        const patchResult = dispatch(
          accountApi.util.updateQueryData(
            // The updateQueryData method is used to update the cached data for a specific query. It takes three arguments: the name of the query endpoint, the query arguments, and a callback function that receives a draft of the current cached data which can be modified directly (using Immer under the hood).
            "fetchAddress",
            undefined,
            (draft) => {
              // Update the draft with the new address data. The Object.assign method is used to copy the values of all enumerable own properties from one or more source objects to a target object. It will return the target object.
              Object.assign(draft || {}, { ...address });
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch (error) {
          patchResult.undo();
          console.log(error);
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useUserInfoQuery,
  useLogoutMutation,
  useLazyUserInfoQuery,
  useFetchAddressQuery,
  useUpdateUserAddressMutation,
} = accountApi;
