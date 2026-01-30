import {
  Box,
  Typography,
  Divider,
  Button,
  Paper,
  TextField,
} from "@mui/material";
import { currencyFormat } from "../../lib/util";
import { Link, useLocation } from "react-router-dom";
import { useBasket } from "../../lib/hooks/useBasket";
import { useForm, type FieldValues } from "react-hook-form";
import {
  useAddCouponMutation,
  useRemoveCouponMutation,
} from "../../../features/basket/basketApi";
import { Delete } from "@mui/icons-material";

export default function OrderSummary() {
  const { subtotal, deliveryFee, discount, total, basket } = useBasket();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();
  const [addCoupon] = useAddCouponMutation();
  const [removeCoupon, { isLoading }] = useRemoveCouponMutation();

  const onSubmit = async (data: FieldValues) => {
    await addCoupon(data.code);
  };

  return (
    <Box
      display='flex'
      flexDirection='column'
      alignItems='center'
      maxWidth='lg'
      mx='auto'
    >
      <Paper sx={{ mb: 2, p: 3, width: "100%", borderRadius: 3 }}>
        <Typography variant='h6' component='p' fontWeight='bold'>
          Order summary
        </Typography>
        <Typography variant='body2' sx={{ fontStyle: "italic" }}>
          Orders over $100 qualify for free delivery!
        </Typography>
        <Box mt={2}>
          <Box display='flex' justifyContent='space-between' mb={1}>
            <Typography color='textSecondary'>Subtotal</Typography>
            <Typography>{currencyFormat(subtotal)}</Typography>
          </Box>
          <Box display='flex' justifyContent='space-between' mb={1}>
            <Typography color='textSecondary'>Discount</Typography>
            <Typography color='success'>-{currencyFormat(discount)}</Typography>
          </Box>
          <Box display='flex' justifyContent='space-between' mb={1}>
            <Typography color='textSecondary'>Delivery fee</Typography>
            <Typography>{currencyFormat(deliveryFee)}</Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box display='flex' justifyContent='space-between' mb={1}>
            <Typography color='textSecondary'>Total</Typography>
            <Typography>{currencyFormat(total)}</Typography>
          </Box>
        </Box>

        <Box mt={2}>
          {!location.pathname.includes("checkout") && (
            <Button
              component={Link}
              to='/checkout'
              variant='contained'
              color='primary'
              fullWidth
              sx={{ mb: 1 }}
            >
              Checkout
            </Button>
          )}
          <Button component={Link} to='/catalog' fullWidth>
            Continue Shopping
          </Button>
        </Box>
      </Paper>

      {location.pathname.includes("checkout") && (
        <Paper sx={{ width: "100%", borderRadius: 3, p: 3 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Typography variant='subtitle1' component='label'>
              Do you have a voucher code?
            </Typography>
            {basket?.coupon && (
              <Box
                display='flex'
                alignItems='center'
                justifyContent='space-between'
              >
                <Typography fontWeight='bold' variant='body2'>
                  Voucher "{basket.coupon.name}" applied
                </Typography>
                <Button loading={isLoading} onClick={() => removeCoupon()}>
                  <Delete color='error' />
                </Button>
              </Box>
            )}
            <TextField
              {...register("code", { required: "Voucher code missing" })}
              name='code'
              label='Voucher code'
              variant='outlined'
              fullWidth
              sx={{ my: 2 }}
              disabled={!!basket?.coupon}
            />

            <Button
              type='submit'
              loading={isSubmitting}
              disabled={!!basket?.coupon}
              variant='contained'
              color='primary'
              fullWidth
            >
              Apply code
            </Button>
          </form>
        </Paper>
      )}
    </Box>
  );
}
