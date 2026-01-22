// import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react"; // Very important to import from this library and not from the "@reduxjs/toolkit/query" library
import type { Product } from "../../app/models/product";
import { baseQueryWithErrorHandling } from "../../app/api/baseApi";

export const catalogApi = createApi({
  reducerPath: "catalogApi",
  // Instead of defining a base query for every API file we create we defined a baseApi file where we defined a base query with error handling. This way, if we need to change the base url we will do it in a single file
  // baseQuery: fetchBaseQuery({ baseUrl: "https://localhost:5001/api" }),
  baseQuery: baseQueryWithErrorHandling,
  endpoints: (builder) => ({
    fetchProducts: builder.query<Product[], void>({
      query: () => ({ url: "products" }),
    }),
    fetchProductDetails: builder.query<Product, number>({
      query: (productId) => ({ url: `products/${productId}` }),
    }),
  }),
});

export const { useFetchProductDetailsQuery, useFetchProductsQuery } =
  catalogApi;
