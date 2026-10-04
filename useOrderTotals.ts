"use client";

import { useCart } from "@/context/CartContext";
import { useCheckout } from "@/context/CheckoutContext";

import { FREE_DELIVERY_THRESHOLD, DELIVERY_CHARGE } from "@/lib/pricing";

export function useOrderTotals() {
  const { itemCount, subtotal, savings } = useCart();
  const { promoCode, promoDiscountFor } = useCheckout();

  const promoDiscount = promoDiscountFor(subtotal);
  const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const remainingForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const total = subtotal - promoDiscount + deliveryCharge;

  return {
    itemCount,
    subtotal,
    savings,
    promoCode,
    promoDiscount,
    deliveryCharge,
    remainingForFreeDelivery,
    total,
  };
}
