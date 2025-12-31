// Script de seed para popular banco com dados iniciais
import prisma from "../src/db/client";

async function main() {
  await prisma.user.upsert({
    where: { email: "admin@template.com" },
    update: {},
    create: {
      email: "admin@template.com",
      name: "Admin Default",
    },
  });
  console.log("Seed executado com sucesso! 🌱");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
