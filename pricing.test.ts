import { describe, it, expect } from "vitest";
import { computeTotals, isValidPromo, FREE_DELIVERY_THRESHOLD, DELIVERY_CHARGE } from "@/lib/pricing";

describe("isValidPromo", () => {
  it("accepts the promo code case-insensitively and with stray whitespace", () => {
    expect(isValidPromo("PHARMA10")).toBe(true);
    expect(isValidPromo("pharma10")).toBe(true);
    expect(isValidPromo("  Pharma10  ")).toBe(true);
  });

  it("rejects anything else, including null/empty", () => {
    expect(isValidPromo("PHARMA20")).toBe(false);
    expect(isValidPromo("")).toBe(false);
    expect(isValidPromo(null)).toBe(false);
    expect(isValidPromo(undefined)).toBe(false);
  });
});

describe("computeTotals", () => {
  it("charges delivery below the free-delivery threshold", () => {
    const t = computeTotals(FREE_DELIVERY_THRESHOLD - 1);
    expect(t.deliveryCharge).toBe(DELIVERY_CHARGE);
    expect(t.total).toBe(FREE_DELIVERY_THRESHOLD - 1 + DELIVERY_CHARGE);
  });

  it("waives delivery at and above the threshold", () => {
    expect(computeTotals(FREE_DELIVERY_THRESHOLD).deliveryCharge).toBe(0);
    expect(computeTotals(FREE_DELIVERY_THRESHOLD + 500).deliveryCharge).toBe(0);
  });

  it("applies a 10% promo discount before delivery, only with a valid code", () => {
    const withPromo = computeTotals(1000, "PHARMA10");
    expect(withPromo.promoApplied).toBe(true);
    expect(withPromo.discount).toBe(100);
    expect(withPromo.total).toBe(1000 - 100 + DELIVERY_CHARGE);

    const badPromo = computeTotals(1000, "NOPE");
    expect(badPromo.promoApplied).toBe(false);
    expect(badPromo.discount).toBe(0);
  });

  it("never goes negative and handles zero", () => {
    expect(computeTotals(0).total).toBeGreaterThanOrEqual(0);
  });
});
