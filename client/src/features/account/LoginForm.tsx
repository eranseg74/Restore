import { LockOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  loginSchema,
  type LoginSchema,
} from "../../app/lib/schemas/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLazyUserInfoQuery, useLoginMutation } from "./accountApi";

export default function LoginForm() {
  const [login, { isLoading }] = useLoginMutation();
  const [fetchUserInfo] = useLazyUserInfoQuery(); // The difference between useUserInfoQuery and useLazyUserInfoQuery is that the former automatically fetches data when the component renders, while the latter returns a trigger function that can be called to fetch data on demand.
  const location = useLocation();
  const {
    register, // The register function is used to register the input fields into the react hook form
    handleSubmit, // The function that will be executed when submitting the form
    formState: { errors }, // The formState holds various dataon the form such as isLoading, isDirty, errors, etc.
  } = useForm<LoginSchema>({
    //mode: "onBlur", // Validation will trigger on the blur event
    mode: "onTouched", // Validation will trigger when the input is touched
    resolver: zodResolver(loginSchema), // Using zodResolver to integrate Zod schema validation with react hook form
  }); // Initializing the react hook form with the schema type. This will ensure that the form data adheres to the schema defined.
  const navigate = useNavigate();
  const onSubmit = async (data: LoginSchema) => {
    // The function that will be executed when submitting the form. The data parameter will hold the form data adhering to the LoginSchema type.
    await login(data); // Calling the login mutation with the form data
    await fetchUserInfo(); // Fetching the user info after a successful login to update the application state with the authenticated user's information
    navigate(location.state?.from || "/catalog"); // Navigate to where the user came from (previous URL) or, if this state does not exist, to the login page
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
        <Typography variant='h5'>Sign in</Typography>
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
          <Button disabled={isLoading} variant='contained' type='submit'>
            Sign in
          </Button>
          <Typography sx={{ textAlign: "center" }}>
            Don't have an account?
            <Typography
              sx={{ ml: 2 }}
              component={Link}
              to='/register'
              color='primary'
            >
              Sign up
            </Typography>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
