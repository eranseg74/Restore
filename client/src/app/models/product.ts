// 2 ways that are almost the same for modeling - type and interface

// INTERFACE
// export interface Product {
//   id: number;
//   name: string;
//   description: string;
//   price: number;
//   pictureUrl: string;
//   type: string;
//   brand: string;
//   quantityInStock: number;
// }

// TYPE
export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  pictureUrl: string;
  type: string;
  brand: string;
  quantityInStock: number;
};
