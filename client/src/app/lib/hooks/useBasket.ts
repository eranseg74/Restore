import {
  useClearBasketMutation,
  useFetchBasketQuery,
} from "../../../features/basket/basketApi";

// Creating a custom hook to manage basket logic
export const useBasket = () => {
  const { data: basket } = useFetchBasketQuery();
  const [clearBasket] = useClearBasketMutation();
  const subtotal =
    basket?.items.reduce((acc, cur) => acc + cur.price * cur.quantity, 0) ?? 0;
  const deliveryFee = subtotal > 10000 ? 0 : 500; // Since it is a long than 10000 represents 100.00
  const total = subtotal + deliveryFee;

  // To use it as a hook we need to return something from this function
  return { basket, subtotal, deliveryFee, total, clearBasket };
};
