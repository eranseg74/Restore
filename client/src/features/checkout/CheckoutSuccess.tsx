import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Typography,
} from "@mui/material";
import type { Order } from "../../app/models/order";
import { Link, useLocation } from "react-router";
import {
  addressString,
  currencyFormat,
  paymentString,
} from "../../app/lib/util";

export default function CheckoutSuccess() {
  const { state } = useLocation(); // Using the useLocation hook to access the state passed from the previous page
  const order = state.data as Order; // Casting the state to the Order type to access the order properties

  if (!order) {
    return <Typography>Problem accessing the order</Typography>;
  }

  return (
    <Container maxWidth='md'>
      <Typography variant='h4' gutterBottom fontWeight='bold'>
        Thanks for your fake order!
      </Typography>
      <Typography variant='body1' color='textSecondary' gutterBottom>
        Your order <strong>#{order.id}</strong> will never be processed as this
        is a fake shop
      </Typography>
      <Paper
        elevation={1}
        sx={{ p: 2, mb: 2, display: "flex", flexDirection: "column", gap: 1.5 }}
      >
        <Box display='flex' justifyContent='space-between'>
          <Typography variant='body2' color='textSecondary'>
            Order date
          </Typography>
          <Typography variant='body2' fontWeight='bold'>
            {order.orderDate}
          </Typography>
        </Box>
        <Divider />
        <Box display='flex' justifyContent='space-between'>
          <Typography variant='body2' color='textSecondary'>
            Payment method
          </Typography>
          <Typography variant='body2' fontWeight='bold'>
            {paymentString(order.paymentSummary)}
          </Typography>
        </Box>
        <Divider />
        <Box display='flex' justifyContent='space-between'>
          <Typography variant='body2' color='textSecondary'>
            Shipping address
          </Typography>
          <Typography variant='body2' fontWeight='bold'>
            {addressString(order.shippingAddress)}
          </Typography>
        </Box>
        <Divider />
        <Box display='flex' justifyContent='space-between'>
          <Typography variant='body2' color='textSecondary'>
            Amount
          </Typography>
          <Typography variant='body2' fontWeight='bold'>
            {currencyFormat(order.total)}
          </Typography>
        </Box>
      </Paper>
      <Box display='flex' justifyContent='flex-start' gap={2}>
        <Button
          variant='contained'
          color='primary'
          component={Link}
          to={`/orders/${order.id}`}
        >
          View your order
        </Button>
        <Button
          variant='outlined'
          color='primary'
          component={Link}
          to='/catalog'
        >
          Continue shopping
        </Button>
      </Box>
    </Container>
  );
}
