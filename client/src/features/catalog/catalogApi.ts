// import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react"; // Very important to import from this library and not from the "@reduxjs/toolkit/query" library
import type { Product } from "../../app/models/product";
import { baseQueryWithErrorHandling } from "../../app/api/baseApi";
import type { ProductParams } from "../../app/models/productParams";
import { filterEmptyValues } from "../../app/lib/util";
import type { Pagination } from "../../app/models/pagination";

export const catalogApi = createApi({
  reducerPath: "catalogApi",
  // Instead of defining a base query for every API file we create we defined a baseApi file where we defined a base query with error handling. This way, if we need to change the base url we will do it in a single file
  // baseQuery: fetchBaseQuery({ baseUrl: "https://localhost:5001/api" }),
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: ["Products"],
  endpoints: (builder) => ({
    fetchProducts: builder.query<
      { items: Product[]; pagination: Pagination },
      ProductParams
    >({
      // The second argument - ProductParams is the argument for this query, and the second argument - Product[] is the result of the query
      query: (productParams) => {
        const filteredParams = filterEmptyValues(productParams);
        return {
          url: "products",
          params: filteredParams, // This will append the productParams to the query string
        };
      },
      // transformResponse is a function provided by RTK Query to manipulate the data returned by a query or mutation
      transformResponse: (items: Product[], meta) => {
        const paginationHeader = meta?.response?.headers.get("Pagination");
        const pagination = paginationHeader
          ? JSON.parse(paginationHeader)
          : null;
        return { items, pagination };
      },
    }),
    fetchProductDetails: builder.query<Product, number>({
      query: (productId) => ({ url: `products/${productId}` }),
    }),
    fetchFiters: builder.query<{ brands: []; types: [] }, void>({
      query: () => "products/filters",
    }),
  }),
});

export const {
  useFetchProductDetailsQuery,
  useFetchProductsQuery,
  useFetchFitersQuery,
} = catalogApi;
