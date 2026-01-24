import { createSlice } from "@reduxjs/toolkit";
import type { ProductParams } from "../../app/models/productParams";

const initialState: ProductParams = {
  pageNumber: 1,
  pageSize: 8,
  types: [],
  brands: [],
  searchTerm: "",
  orderBy: "name",
};

export const catalogSlice = createSlice({
  name: "catalogSlice",
  initialState,
  reducers: {
    setPageNumber(state, action) {
      state.pageNumber = action.payload;
    },
    setPageSize(state, action) {
      state.pageSize = action.payload;
    },
    setOrderBy(state, action) {
      state.orderBy = action.payload; // Whenever the user changes the order we return to the first page
      state.pageNumber = 1;
    },
    setTypes(state, action) {
      state.types = action.payload; // Whenever the user changes the order we return to the first page
      state.pageNumber = 1;
    },
    setBrands(state, action) {
      state.brands = action.payload; // Whenever the user changes the order we return to the first page
      state.pageNumber = 1;
    },
    setSearchTerm(state, action) {
      state.searchTerm = action.payload; // Whenever the user changes the order we return to the first page
      state.pageNumber = 1;
    },
    resetParams() {
      return initialState;
    },
  },
});

export const {
  setBrands,
  setTypes,
  setPageNumber,
  setPageSize,
  setOrderBy,
  setSearchTerm,
  resetParams,
} = catalogSlice.actions;
