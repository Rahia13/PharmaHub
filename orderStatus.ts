import type { OrderStatus } from "@/types";

export const ORDER_STEPS: OrderStatus[] = [
  "placed",
  "processing",
  "out-for-delivery",
  "delivered",
];
