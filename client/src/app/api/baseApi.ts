import {
  fetchBaseQuery,
  type BaseQueryApi,
  type FetchArgs,
} from "@reduxjs/toolkit/query";
import { startLoading, stopLoading } from "../layout/uiSlice";
import { toast } from "react-toastify";
import { router } from "../routes/Routes";

const customBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: "include", // This means that any request will be attached with the cookie
});

// Handling the various error types:
type ErrorResponse = string | { title: string } | { errors: string[] };

const sleep = () => new Promise((resolve) => setTimeout(resolve, 1000));

export const baseQueryWithErrorHandling = async (
  args: string | FetchArgs,
  api: BaseQueryApi, // The api gives us access to Redux (to the store) where we can get the status and dispatch actions
  extraOptions: object,
) => {
  api.dispatch(startLoading());
  if (import.meta.env.DEV) await sleep(); // Delay the running by 1 second - only in dev mode
  const result = await customBaseQuery(args, api, extraOptions);
  api.dispatch(stopLoading());
  if (result.error) {
    const status = result.error.status;
    const responseData = result.error.data as ErrorResponse;
    switch (status) {
      case 400:
        if (typeof responseData === "string") {
          toast.error(responseData);
        } else if (
          typeof responseData === "object" &&
          "errors" in responseData
        ) {
          throw Object.values(responseData.errors).flat().join(", ");
        } else {
          toast.error(responseData.title);
        }
        break;
      case 401:
        if (
          typeof responseData === "object" &&
          responseData !== null &&
          "title" in responseData
        )
          toast.error(responseData.title);
        break;
      case 403:
        if (typeof responseData === "object") toast.error("403 Forbidden");
        break;
      case 404:
        if (
          typeof responseData === "object" &&
          responseData !== null &&
          "title" in responseData
        )
          router.navigate("/not-found");
        break;
      case 500:
        if (typeof responseData === "object")
          router.navigate("/server-error", { state: { error: responseData } });
        break;
      default:
        console.log({ status, responseData });
        break;
    }
  }
  return result;
};
