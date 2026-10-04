import { PrismaClient } from "@prisma/client";

// Usage: npm run user:set-role -- someone@example.com pharmacist
const prisma = new PrismaClient();
const roles = ["customer", "pharmacist", "admin"];

async function main() {
  const [email, role] = process.argv.slice(2);
  if (!email || !role || !roles.includes(role)) {
    console.error(`Usage: npm run user:set-role -- <email> <${roles.join("|")}>`);
    process.exit(1);
  }
  const user = await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: { role },
    select: { email: true, role: true },
  });
  console.log(`${user.email} is now "${user.role}".`);
}

main()
  .catch((e) => {
    console.error(e.code === "P2025" ? "No user with that email." : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
