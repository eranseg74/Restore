import { Box } from "@mui/material";
import type { Product } from "../../app/models/product";
import ProductCard from "./ProductCard";

type Props = {
  products: Product[];
};

export default function ProductList({ products }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 3,
        justifyContent: "center",
      }}
    >
      {/* Wrapping the function with () means that we implicitly returning what is inside the parenthesis / brackets. If we wrap it with curly brackets {} we would have to explicitly return -> => { return <li>{product.name} - {product.price}</li> } this equals to (<li>{product.name} - {product.price}</li>) */}
      {products.map((product) => (
        <ProductCard product={product} key={product.id} />
      ))}
    </Box>
  );
}
