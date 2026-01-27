import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import {
  AddressElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import Review from "./Review";
import {
  useFetchAddressQuery,
  useUpdateUserAddressMutation,
} from "../account/accountApi";
//import type { Address } from "../../app/models/user";
import type {
  ConfirmationToken,
  StripeAddressElementChangeEvent,
  StripePaymentElementChangeEvent,
} from "@stripe/stripe-js";
import { useBasket } from "../../app/lib/hooks/useBasket";
import { currencyFormat } from "../../app/lib/util";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useCreateOrderMutation } from "../orders/orderApi";

const steps = ["Address", "Payment", "Review"];

export default function CheckoutStepper() {
  const stripe = useStripe();
  const navigate = useNavigate();
  const { basket, clearBasket } = useBasket();
  const [activeStep, setActiveStep] = useState(0);
  const [createOrder] = useCreateOrderMutation();
  // The address data contains the name and few other properties in a single object. If we want to separate the name from the rest of the properties we can use this technic which sets the data as an object that contains a name property and the rest of the properties in another object:
  // const { data: { name, ...restAddress } = {} as Address, isLoading } =
  //   useFetchAddressQuery();
  const { data, isLoading } = useFetchAddressQuery();

  let name, restAddress;
  if (data) {
    ({ name, ...restAddress } = data);
  }

  console.log(name, restAddress);
  const [updateAddress] = useUpdateUserAddressMutation();
  const [saveAddressChecked, setSaveAddressChecked] = useState(false);
  const [addressComplete, setAddressComplete] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmationToken, setConfirmationToken] =
    useState<ConfirmationToken | null>(null);
  const { total } = useBasket();
  const elements = useElements();

  const getStripeAddress = async () => {
    const addressElement = elements?.getElement("address");
    if (!addressElement) {
      return null;
    }
    const {
      value: { name, address },
    } = await addressElement.getValue();
    if (name && address) {
      return { ...address, name };
    }
    return null;
  };

  const confirmPayment = async () => {
    setSubmitting(true);
    try {
      if (!confirmationToken || !basket?.clientSecret) {
        throw new Error("Unable to process payment");
      }

      // Creating the order before confirming the payment with Stripe so the order will be in a pending state in the Backend. When the payment is confirmed, Stripe will notify the server on a successful payment and the order will be complete
      const orderModel = await createOrderModel();
      const orderResult = await createOrder(orderModel);

      // Use stripe.confirmPayment to confirm a PaymentIntent using data collected by the Payment Element. When called, stripe.confirmPayment will attempt to complete any required actions, such as authenticating your user by displaying a 3DS dialog or redirecting them to a bank authorization page. Your user will be redirected to the return_url you pass once the confirmation is complete.
      // By default, stripe.confirmPayment will always redirect to your return_url after a successful confirmation. If you set redirect: "if_required", then stripe.confirmPayment will only redirect if your user chooses a redirect-based payment method. Setting if_required requires that you handle successful confirmations for redirect-based and non-redirect based payment methods separately
      const paymentResult = await stripe?.confirmPayment({
        clientSecret: basket.clientSecret,
        redirect: "if_required",
        confirmParams: {
          confirmation_token: confirmationToken.id,
        },
      });
      if (paymentResult?.paymentIntent?.status === "succeeded") {
        navigate("/checkout/success", { state: orderResult }); // Passing the orderResult as state to the success page. The state: {state: orderResult} is an object that contains the orderResult from the createOrder mutation which mutates the order in the backend and returns the order data so we can access it in the success page
        clearBasket();
      } else if (paymentResult?.error) {
        throw new Error(paymentResult.error.message);
      } else {
        throw new Error("Something went wrong");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
      setActiveStep((step) => step - 1);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to organize the payment summary and the shipping address for creating a new order
  const createOrderModel = async () => {
    const shippingAddress = await getStripeAddress();
    const paymentSummary = confirmationToken?.payment_method_preview.card;
    if (!shippingAddress || !paymentSummary) {
      throw new Error("Problem creating order");
    }
    return { shippingAddress, paymentSummary };
  };

  const handleAddressChange = (event: StripeAddressElementChangeEvent) => {
    setAddressComplete(event.complete);
  };

  const handlePaymentChange = (event: StripePaymentElementChangeEvent) => {
    setPaymentComplete(event.complete);
  };

  const handleNext = async () => {
    if (activeStep === 0 && saveAddressChecked && elements) {
      const address = await getStripeAddress();
      if (address) {
        await updateAddress(address);
      }
    }
    if (activeStep === 1) {
      if (!elements || !stripe) {
        return;
      }
      // Before confirming payment, call elements.submit() to validate the state of the Payment Element and collect any data required for wallets. This is something we have to do in order to get a confirmation token from stripe so we can send it back to stripe in the review phase
      const result = await elements.submit();
      if (result.error) {
        // Note that we are not returning the toast but rather exiting the function and displaying a toast
        return toast.error(result.error.message);
      }
      const stripeResult = await stripe.createConfirmationToken({ elements }); // The elements contain all of the address and payment details
      if (stripeResult.error) {
        return toast.error(stripeResult.error.message);
      }
      setConfirmationToken(stripeResult.confirmationToken);
    }
    if (activeStep === 2) {
      await confirmPayment();
    }
    if (activeStep < 2) setActiveStep((curActiveStep) => curActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((curActiveStep) => curActiveStep - 1);
  };

  if (isLoading) {
    return <Typography variant='h6'>Loading checkout...</Typography>;
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label) => {
          return (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: activeStep === 0 ? "block" : "none" }}>
          <AddressElement
            options={{
              mode: "shipping",
              defaultValues: {
                name,
                address: restAddress,
              },
            }}
            onChange={handleAddressChange}
          />
          <FormControlLabel
            sx={{ display: "flex", justifyContent: "end" }}
            control={
              <Checkbox
                checked={saveAddressChecked}
                onChange={(e) => setSaveAddressChecked(e.target.checked)}
              />
            }
            label='Save as default address'
          />
        </Box>
        <Box sx={{ display: activeStep === 1 ? "block" : "none" }}>
          <PaymentElement
            onChange={handlePaymentChange}
            options={{
              // Turning off the applePay and googlePay payment methods
              wallets: {
                applePay: "never",
                googlePay: "never",
              },
            }}
          />
        </Box>
        <Box sx={{ display: activeStep === 2 ? "block" : "none" }}>
          <Review confirmationToken={confirmationToken} />
        </Box>
      </Box>
      <Box display='flex' paddingTop={2} justifyContent='space-between'>
        <Button onClick={handleBack}>Back</Button>
        <Button
          disabled={
            (activeStep === 0 && !addressComplete) ||
            (activeStep === 1 && !paymentComplete) ||
            submitting
          }
          loading={submitting}
          onClick={handleNext}
        >
          {activeStep === steps.length - 1
            ? `Pay ${currencyFormat(total)}`
            : "Next"}
        </Button>
      </Box>
    </Paper>
  );
}
