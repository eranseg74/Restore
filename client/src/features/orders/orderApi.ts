import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithErrorHandling } from "../../app/api/baseApi";
import { type CreateOrder, type Order } from "../../app/models/order";

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    fetchOrders: builder.query<Order[], void>({
      query: () => "orders",
      providesTags: ["Order"],
    }),
    fetchOrderDetails: builder.query<Order, number>({
      query: (id) => ({
        url: `orders/${id}`,
      }),
    }),
    createOrder: builder.mutation<Order, CreateOrder>({
      query: (order) => ({
        url: "orders",
        method: "POST",
        body: order,
      }),
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useFetchOrderDetailsQuery,
  useFetchOrdersQuery,
} = orderApi;
