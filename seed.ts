import { PrismaClient } from "@prisma/client";
import { allProducts, flashDeals, popularProducts } from "../data/mockData";

const prisma = new PrismaClient();

async function main() {
  const flashIds = new Set(flashDeals.map((p) => p.id));
  const popularIds = new Set(popularProducts.map((p) => p.id));

  for (const p of allProducts) {
    const data = {
      slug: p.slug,
      name: p.name,
      genericGroup: p.genericGroup,
      manufacturer: p.manufacturer,
      brand: p.brand,
      category: p.category,
      image: p.image,
      rating: p.rating,
      reviewCount: p.reviewCount,
      price: p.price,
      originalPrice: p.originalPrice,
      discountPercent: p.discountPercent,
      badge: p.badge ?? null,
      inStock: p.inStock,
      stockCount: p.stockCount ?? null,
      requiresPrescription: p.requiresPrescription,
      composition: p.composition ?? null,
      dosage: p.dosage ?? null,
      description: p.description ?? null,
      isFlash: flashIds.has(p.id),
      isPopular: popularIds.has(p.id),
    };
    await prisma.product.upsert({ where: { id: p.id }, update: data, create: { id: p.id, ...data } });
  }
  console.log(`Seeded ${allProducts.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
