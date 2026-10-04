import type { Product as ProductRow } from "@prisma/client";
import type { Product } from "@/types";

/** Convert a database row into the Product shape the UI components expect. */
export function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    genericGroup: row.genericGroup,
    manufacturer: row.manufacturer,
    brand: row.brand,
    category: row.category,
    image: row.image,
    rating: row.rating,
    reviewCount: row.reviewCount,
    price: row.price,
    originalPrice: row.originalPrice,
    discountPercent: row.discountPercent,
    badge: (row.badge as Product["badge"]) ?? undefined,
    inStock: row.inStock,
    stockCount: row.stockCount ?? undefined,
    requiresPrescription: row.requiresPrescription,
    composition: row.composition ?? undefined,
    dosage: row.dosage ?? undefined,
    description: row.description ?? undefined,
  };
}
