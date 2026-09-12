import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL não foi definida.");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const passwordHash = await bcrypt.hash("Admin123!", 10);

  const user = await prisma.user.upsert({
    where: {
      email: "admin@estoque.local",
    },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@estoque.local",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Usuário administrador criado:");
  console.log({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
}

main()
  .catch((error) => {
    console.error("ERRO AO CRIAR ADMIN:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });