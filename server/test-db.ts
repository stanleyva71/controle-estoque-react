import { prisma } from "./lib/prisma";

async function main() {
  const products = await prisma.product.findMany();

  console.log("Produtos no banco:", products);
}

main()
  .catch((error) => {
    console.error("Erro ao consultar banco:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
