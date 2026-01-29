import {
  Box,
  Typography,
  Button,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  Paper,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../app/store/store";
import { useFetchProductsQuery } from "../catalog/catalogApi";
import { currencyFormat } from "../../app/lib/util";
import { Delete, Edit } from "@mui/icons-material";
import AppPagination from "../../app/shared/components/AppPagination";
import { setPageNumber } from "../catalog/catalogSlice";
import { useState } from "react";
import ProductForm from "./ProductForm";
import type { Product } from "../../app/models/product";
import { useDeleteProductMutation } from "./adminApi";

export default function InventoryPage() {
  const productParams = useAppSelector((state) => state.catalog);
  const { data, refetch } = useFetchProductsQuery(productParams);
  const dispatch = useAppDispatch();
  const [editMode, setEditMode] = useState(false);
  const [selectProduct, setSelectProduct] = useState<Product | null>(null);
  const [deleteProduct] = useDeleteProductMutation();

  const handleSelectProduct = (product: Product) => {
    setSelectProduct(product);
    setEditMode(true);
  };

  const handleDeleteProduct = async (productId: number) => {
    await deleteProduct(productId);
    refetch();
  };

  if (editMode) {
    return (
      <ProductForm
        setEditMode={setEditMode}
        product={selectProduct}
        refetch={refetch}
        setSelectedProduct={setSelectProduct}
      />
    );
  }

  return (
    <>
      <Box display='flex' justifyContent='space-between'>
        <Typography sx={{ p: 2 }} variant='h4'>
          Inventory
        </Typography>
        <Button
          onClick={() => setEditMode(true)}
          sx={{ m: 2 }}
          size='large'
          variant='contained'
        >
          Create
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell align='left'>Product</TableCell>
              <TableCell align='right'>Price</TableCell>
              <TableCell align='center'>Type</TableCell>
              <TableCell align='center'>Brand</TableCell>
              <TableCell align='center'>Quantity</TableCell>
              <TableCell align='right'></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data &&
              data.items.map((product) => (
                <TableRow
                  key={product.id}
                  sx={{ "&:last-child td, &:last-chilf th": { border: 0 } }}
                >
                  <TableCell component='th' scope='row'>
                    {product.id}
                  </TableCell>
                  <TableCell align='left'>
                    <Box>
                      <img
                        src={product.pictureUrl}
                        alt={product.name}
                        style={{ height: 50, marginRight: 20 }}
                      />
                      <span>{product.name}</span>
                    </Box>
                  </TableCell>
                  <TableCell align='right'>
                    {currencyFormat(product.price)}
                  </TableCell>
                  <TableCell align='center'>{product.type}</TableCell>
                  <TableCell align='center'>{product.brand}</TableCell>
                  <TableCell align='center'>
                    {product.quantityInStock}
                  </TableCell>
                  <TableCell align='right'>
                    <Button
                      onClick={() => handleSelectProduct(product)}
                      startIcon={<Edit />}
                    />
                    <Button
                      onClick={() => handleDeleteProduct(product.id)}
                      startIcon={<Delete />}
                      color='error'
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <Box sx={{ p: 3 }}>
          {data?.pagination && data.items.length > 0 && (
            <AppPagination
              metadata={data.pagination}
              onPageChange={(page: number) => dispatch(setPageNumber(page))}
            />
          )}
        </Box>
      </TableContainer>
    </>
  );
}
