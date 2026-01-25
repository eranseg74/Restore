import { z } from "zod";

const passwordValidation = new RegExp(
  /(?=^.{6,10}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&amp;*()_+}{&quot;:;'?/&gt;.&lt;,])(?!.*\s).*$/,
);

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().regex(passwordValidation, {
    message:
      "Password must contain 1 lowercase character, 1 uppercase character, 1 number, 1 special and be 6-10 charactrers",
  }),
});

export type RegisterSchema = z.infer<typeof registerSchema>; // Exporting the TypeScript type for the register schema. The infer utility type from Zod is used to extract the type from the schema. We can use this type to type our form data and ensure it adheres to the schema defined above.
