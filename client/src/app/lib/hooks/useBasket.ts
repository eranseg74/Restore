import {
  useClearBasketMutation,
  useFetchBasketQuery,
} from "../../../features/basket/basketApi";
import type { Item } from "../../models/basket";

// Creating a custom hook to manage basket logic
export const useBasket = () => {
  const { data: basket } = useFetchBasketQuery();
  const [clearBasket] = useClearBasketMutation();
  const subtotal =
    basket?.items.reduce(
      (acc: number, cur: Item) => acc + cur.price * cur.quantity,
      0,
    ) ?? 0;
  const deliveryFee = subtotal > 10000 ? 0 : 500; // Since it is a long than 10000 represents 100.00
  let discount = 0;
  if (basket?.coupon) {
    if (basket.coupon.amountOff) {
      discount = basket.coupon.amountOff;
    } else if (basket.coupon.percentOff) {
      discount =
        Math.round(subtotal * (basket.coupon.percentOff / 100) * 100) / 100;
    }
  }
  const total = Math.round((subtotal - discount + deliveryFee) * 100) / 100;

  // To use it as a hook we need to return something from this function
  return { basket, subtotal, deliveryFee, total, clearBasket, discount };
};
