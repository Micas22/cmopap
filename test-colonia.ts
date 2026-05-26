import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const animals = await prisma.animal.findMany({
      where: { colonia: 1 }
    });
    console.log("Animals in colonia 1:", animals);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
