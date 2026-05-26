const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function test() {
  const h = await prisma.loginHistory.findMany();
  console.log('Login History:', h);
}
test().catch(console.error).finally(() => prisma.$disconnect());
