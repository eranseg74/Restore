import { Grid, Typography } from "@mui/material";
import OrderSummary from "../../app/shared/components/OrderSummary";
import CheckoutStepper from "./CheckoutStepper";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { useEffect, useMemo, useRef } from "react";
import { useFetchBasketQuery } from "../basket/basketApi";
import { Elements } from "@stripe/react-stripe-js";
import { useCreatePaymentIntentMutation } from "./checkoutApi";
import { useAppSelector } from "../../app/store/store";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK);

export default function CheckoutPage() {
  const { data: basket } = useFetchBasketQuery();
  const [createPaymentIntent, { isLoading }] = useCreatePaymentIntentMutation();
  const { darkMode } = useAppSelector((state) => state.ui);

  // Since we are in development mode which is wrapped in StrictMode each render happens twice. This is a problem because we do not want to create two payment intents for the same basket in stripe. The technic to avoid this is to create a useRef object and initialize it to false. useRef object do not cause re-render even if they are updated!
  // Then we defined a useEffect that checks the useRef value and if it is false it will execute the desired action once and change the useRef object to true. This will cause a re-render but in the next renders the created current value is true and it will persist as such until we change it so the check in the useEffect fails and the action will not be executed.
  // In production it is not required since there is no double rendering like in development
  const created = useRef(false);

  useEffect(() => {
    if (!created.current) {
      createPaymentIntent();
    }
    created.current = true;
  }, [createPaymentIntent]);

  const options: StripeElementsOptions | undefined = useMemo(() => {
    if (!basket?.clientSecret) {
      return undefined;
    }
    return {
      clientSecret: basket?.clientSecret,
      appearance: {
        labels: "floating",
        theme: darkMode ? "night" : "stripe",
      },
    };
  }, [basket?.clientSecret, darkMode]);

  return (
    <Grid container spacing={2}>
      <Grid size={8}>
        {!stripePromise || !options || isLoading ? (
          <Typography variant='h6'>Loading checkout...</Typography>
        ) : (
          <Elements stripe={stripePromise} options={options}>
            <CheckoutStepper />
          </Elements>
        )}
      </Grid>
      <Grid size={4}>
        <OrderSummary />
      </Grid>
    </Grid>
  );
}
