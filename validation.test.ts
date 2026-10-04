import { describe, it, expect } from "vitest";
import { mergeLines, orderSchema, registerSchema } from "@/lib/validation";

describe("mergeLines", () => {
  it("combines duplicate product lines into one", () => {
    const merged = mergeLines([
      { productId: "p1", quantity: 2 },
      { productId: "p2", quantity: 1 },
      { productId: "p1", quantity: 3 },
    ]);
    expect(merged).toHaveLength(2);
    expect(merged.find((l) => l.productId === "p1")?.quantity).toBe(5);
    expect(merged.find((l) => l.productId === "p2")?.quantity).toBe(1);
  });

  it("returns an empty array for no lines", () => {
    expect(mergeLines([])).toEqual([]);
  });
});

describe("registerSchema", () => {
  it("normalises email to lowercase and trims fields", () => {
    const parsed = registerSchema.parse({
      name: "  Rafiqul Islam  ",
      email: "  Rafiqul@Example.com ",
      phone: "+880 1711-234567",
      password: "at-least-8-chars",
    });
    expect(parsed.email).toBe("rafiqul@example.com");
    expect(parsed.name).toBe("Rafiqul Islam");
  });

  it("rejects a short password", () => {
    const result = registerSchema.safeParse({
      name: "A",
      email: "a@b.com",
      phone: "123456",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
});

describe("orderSchema", () => {
  it("rejects an empty cart", () => {
    expect(
      orderSchema.safeParse({ items: [], addressId: "a1", paymentMethod: "cod" }).success
    ).toBe(false);
  });

  it("rejects an unknown payment method", () => {
    expect(
      orderSchema.safeParse({
        items: [{ productId: "p1", quantity: 1 }],
        addressId: "a1",
        paymentMethod: "paypal",
      }).success
    ).toBe(false);
  });

  it("accepts a well-formed order", () => {
    expect(
      orderSchema.safeParse({
        items: [{ productId: "p1", quantity: 2 }],
        addressId: "a1",
        paymentMethod: "cod",
      }).success
    ).toBe(true);
  });
});
