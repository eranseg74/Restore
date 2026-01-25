import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithErrorHandling } from "../../app/api/baseApi";
import type { User } from "../../app/models/user";
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
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useUserInfoQuery,
  useLogoutMutation,
  useLazyUserInfoQuery,
} = accountApi;
