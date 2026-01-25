import { useForm } from "react-hook-form";
import { useRegisterMutation } from "./accountApi";
import {
  registerSchema,
  type RegisterSchema,
} from "../../app/lib/schemas/registerSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockOutlined } from "@mui/icons-material";
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import { Link } from "react-router-dom";

export default function RegisterForm() {
  const [registerUser] = useRegisterMutation();
  const {
    register,
    handleSubmit,
    setError, // Function to manually set form errors. We can use this to set server-side validation errors on specific form fields.
    formState: { errors, isValid, isLoading },
  } = useForm<RegisterSchema>({
    mode: "onTouched",
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterSchema) => {
    try {
      await registerUser(data).unwrap(); // Unwrapping the result to handle any potential errors. The unwrap method is provided by RTK Query to extract the actual response or throw an error if the request failed. We need to unwrap the promise returned by the mutation to properly handle success and error cases such as informing the user that the email is already taken, for example.
    } catch (error) {
      const apiError = error as { message: string }; // Casting the error to a specific type to access the message property. Adjust the type according to your API error structure.
      if (apiError.message && typeof apiError.message === "string") {
        // Checking if the error message exists and is a string
        const errorArray = apiError.message.split(","); // Splitting the error message into an array based on commas. Assuming the server sends multiple errors in a single string separated by commas.
        // This function will go over each error message and set the error for the relevant field using the setError function from react-hook-form. It will give us the server-side validation feedback directly on the form fields. For example - validating if the email is already taken.
        errorArray.forEach((e) => {
          // Iterating over each error message in the array
          if (e.includes("Password")) {
            // Checking if the error message is related to the password field
            setError("password", { message: e }); // Setting the error for the password field using the setError function from react-hook-form
          } else if (e.includes("Email")) {
            // Checking if the error message is related to the email field
            setError("email", { message: e }); // Setting the error for the email field using the setError function from react-hook-form
          }
        });
      }
    }
  };
  return (
    <Container component={Paper} maxWidth='sm' sx={{ borderRadius: 3 }}>
      <Box
        display='flex'
        flexDirection='column'
        alignItems='center'
        marginTop='8'
      >
        <LockOutlined sx={{ mt: 3, color: "secondary.main", fontSize: 40 }} />
        <Typography variant='h5'>Register</Typography>
        <Box
          component='form'
          onSubmit={handleSubmit(onSubmit)}
          width='100%'
          display='flex'
          flexDirection='column'
          gap={3}
          marginY={3}
        >
          <TextField
            fullWidth
            label='Email'
            autoFocus
            {...register("email")}
            // {...register("email", { required: "Email is required" })} No longer needed due to zod schema validation
            error={!!errors.email} // Display error state if there's an error for the email field
            helperText={errors.email?.message} // Display the error message for the email field
          />
          <TextField
            fullWidth
            label='Password'
            type='password'
            {...register("password")}
            error={!!errors.password} // Display error state if there's an error for the password field
            helperText={errors.password?.message} // Display the error message for the password field
          />
          <Button
            disabled={isLoading || !isValid}
            variant='contained'
            type='submit'
          >
            Register
          </Button>
          <Typography sx={{ textAlign: "center" }}>
            Already have an account?
            <Typography
              sx={{ ml: 2 }}
              component={Link}
              to='/login'
              color='primary'
            >
              Sign in here
            </Typography>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
