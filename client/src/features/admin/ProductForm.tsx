import { useForm, type FieldValues } from "react-hook-form";
import {
  createProductSchema,
  type CreateProductSchema,
} from "../../app/lib/schemas/createProductSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import AppTextInput from "../../app/shared/components/AppTextInput";
import { useFetchFitersQuery } from "../catalog/catalogApi";
import AppSelectInput from "../../app/shared/components/AppSelectInput";
import AppDropzone from "../../app/shared/components/AppDropzone";
import type { Product } from "../../app/models/product";
import { useEffect } from "react";
import { useCreateProductMutation, useUpdateProductMutation } from "./adminApi";
import { handleApiError } from "../../app/lib/util";

type Props = {
  setEditMode: (value: boolean) => void;
  product: Product | null;
  refetch: () => void;
  setSelectedProduct: (value: Product | null) => void;
};

export default function ProductForm({
  setEditMode,
  product,
  refetch,
  setSelectedProduct,
}: Props) {
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting },
    setError,
  } = useForm({
    mode: "onTouched",
    resolver: zodResolver(createProductSchema),
  });
  const watchFile = watch("file");
  const { data } = useFetchFitersQuery();
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();

  useEffect(() => {
    if (product) {
      reset(product);
    }
    return () => {
      if (watchFile) {
        URL.revokeObjectURL(watchFile.preview);
      }
    };
  }, [product, reset, watchFile]);

  // Creting a FormData object because, when creating or updating a product, the API expects to get a FormData type in the request's body, and not a JSON
  // The FormData interface provides a way to construct a set of key/value pairs representing form fields and their values, which can be sent using the Window/fetch, XMLHttpRequest.send() or navigator.sendBeacon() methods.
  // In React Hook Form, FieldValues is a generic type representing the structure of all the data within the form. It is essentially an object where the keys correspond to the names of the form fields and the values are their respective values.
  const createFormData = (items: FieldValues) => {
    const formData = new FormData();
    for (const key in items) {
      formData.append(key, items[key]);
    }
    return formData;
  };

  const onSubmit = async (data: CreateProductSchema) => {
    try {
      const formData = createFormData(data);
      if (watchFile) {
        formData.append("file", watchFile);
      }
      if (product) {
        await updateProduct({ id: product.id, data: formData }).unwrap();
      } else {
        await createProduct(formData).unwrap();
      }
      setEditMode(false);
      refetch();
      setSelectedProduct(null);
    } catch (error) {
      console.log(error);
      handleApiError<CreateProductSchema>(error, setError, [
        "brand",
        "type",
        "name",
        "description",
        "price",
        "file",
        "pictureUrl",
        "quantityInStock",
      ]);
    }
  };

  return (
    <Box component={Paper} sx={{ p: 4, maxWidth: "lg", mx: "auto" }}>
      <Typography variant='h4' sx={{ mb: 4 }}>
        Product details
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid size={12}>
            <AppTextInput control={control} name='name' label='Product name' />
          </Grid>
          <Grid size={6}>
            {data?.brands && (
              <AppSelectInput
                control={control}
                name='brand'
                label='Brand'
                items={data.brands}
              />
            )}
          </Grid>
          <Grid size={6}>
            {data?.types && (
              <AppSelectInput
                control={control}
                name='type'
                label='Type'
                items={data?.types || []}
              />
            )}
          </Grid>
          <Grid size={6}>
            <AppTextInput
              control={control}
              type='number'
              name='price'
              label='Price in cents'
            />
          </Grid>
          <Grid size={6}>
            <AppTextInput
              control={control}
              type='number'
              name='quantityInStock'
              label='Quantity in stock'
            />
          </Grid>
          <Grid size={12}>
            <AppTextInput
              control={control}
              multiline
              rows={4}
              name='description'
              label='Description'
            />
          </Grid>
          <Grid
            size={12}
            display='flex'
            justifyContent='space-between'
            alignItems='center'
          >
            <AppDropzone control={control} name='file' />
            {watchFile?.preview ? (
              <img
                src={watchFile.preview}
                alt='preview of image'
                style={{ maxHeight: 200 }}
              />
            ) : product?.pictureUrl ? (
              <img
                src={product?.pictureUrl}
                alt='preview of image'
                style={{ maxHeight: 200 }}
              />
            ) : null}
          </Grid>
        </Grid>
        <Box display='flex' justifyContent='space-between' sx={{ mt: 3 }}>
          <Button
            onClick={() => setEditMode(false)}
            variant='contained'
            color='inherit'
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            color='success'
            type='submit'
            loading={isSubmitting}
          >
            Submit
          </Button>
        </Box>
      </form>
    </Box>
  );
}
