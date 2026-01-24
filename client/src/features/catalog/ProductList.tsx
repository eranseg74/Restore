import { Grid } from "@mui/material";
import type { Product } from "../../app/models/product";
import ProductCard from "./ProductCard";

type Props = {
  products: Product[];
};

export default function ProductList({ products }: Props) {
  return (
    <Grid container spacing={3}>
      {/* Wrapping the function with () means that we implicitly returning what is inside the parenthesis / brackets. If we wrap it with curly brackets {} we would have to explicitly return -> => { return <li>{product.name} - {product.price}</li> } this equals to (<li>{product.name} - {product.price}</li>) */}
      {products.map((product) => (
        <Grid size={3} key={product.id} display='flex'>
          <ProductCard product={product} />
        </Grid>
      ))}
    </Grid>
  );
}
