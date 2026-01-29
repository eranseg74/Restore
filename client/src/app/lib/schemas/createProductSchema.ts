import * as z from "zod";

const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, {
    error: "A file must be uploaded",
  })
  .transform((file) => ({
    ...file,
    preview: URL.createObjectURL(file),
  }));

export const createProductSchema = z
  .object({
    name: z.string("Name of product is required"),
    description: z.string("Description is required").min(10, {
      error: "Description must be at least 10 characteers",
    }),
    price: z.coerce
      .number("Price is required")
      .min(100, { error: "Price must be at least $1.00" }),
    type: z.string("Type of product is required"),
    brand: z.string("Brand of product is required"),
    quantityInStock: z.coerce
      .number("Quantity is required")
      .min(100, { error: "Quantity must be at least 100" }),
    pictureUrl: z.string().optional(),
    file: fileSchema.optional(),
  })
  .refine((data) => data.pictureUrl || data.file, {
    error: "Please provide an image",
    path: ["file"],
  });

export type CreateProductSchema = z.infer<typeof createProductSchema>;
