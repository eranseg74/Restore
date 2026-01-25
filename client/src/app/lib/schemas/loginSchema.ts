// Creating a schema for our form to use. The validation will be according to the following schema
import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
});

export type LoginSchema = z.infer<typeof loginSchema>; // Exporting the type of the schema for usage in the form. This will ensure that the form data adheres to the schema defined above.
