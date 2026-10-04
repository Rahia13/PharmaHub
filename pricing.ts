// Pricing rules shared by the browser (for instant estimates) and the server
// (the authoritative calculation). Keep this file free of server-only imports.

export const FREE_DELIVERY_THRESHOLD = 699;
export const DELIVERY_CHARGE = 60;
export const PROMO_CODE = "PHARMA10";
export const PROMO_RATE = 0.1;

export function isValidPromo(code: string | null | undefined) {
  return !!code && code.trim().toUpperCase() === PROMO_CODE;
}

export function computeTotals(subtotal: number, promoCode?: string | null) {
  const promoApplied = isValidPromo(promoCode);
  const discount = promoApplied ? Math.round(subtotal * PROMO_RATE) : 0;
  const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  return {
    subtotal,
    promoApplied,
    discount,
    deliveryCharge,
    total: subtotal - discount + deliveryCharge,
  };
}
