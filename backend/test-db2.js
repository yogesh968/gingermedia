const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const media = await prisma.media.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3
  });
  console.log("RECENT MEDIA:", media);
}
main().catch(console.error).finally(() => prisma.$disconnect());
