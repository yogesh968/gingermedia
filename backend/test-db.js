const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const failedMedia = await prisma.media.findFirst({
    where: { status: 'FAILED' },
    orderBy: { createdAt: 'desc' }
  });
  console.log("FAILED MEDIA:", failedMedia);
}
main().catch(console.error).finally(() => prisma.$disconnect());
