export type ProductParams = {
  orderBy: string;
  searchTerm?: string;
  // types and brands cannot be undefined because they are initialized as empty arrays in the catalogSlice
  types: string[];
  brands: string[];
  pageNumber: number;
  pageSize: number;
};
