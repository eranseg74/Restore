import type { Product } from "../../app/models/product";
import ProductList from "./ProductList";

type Props = {
  products: Product[];
};

export default function Catalog(props: Props) {
  return (
    <>
      <ProductList products={props.products} />
    </>
  );
}
