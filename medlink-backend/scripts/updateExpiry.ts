import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateExpiry() {
  const records = await prisma.accessRecord.findMany({
    where: { status: 'ACTIVE' }
  });
  
  for (const record of records) {
    await prisma.accessRecord.update({
      where: { id: record.id },
      data: { 
        accessExpiryTime: new Date(Date.now() + 8 * 60 * 60 * 1000)
      }
    });
    console.log('Updated:', record.id);
  }
  console.log('Done! All access records now expire in 8 hours');
}

updateExpiry().then(() => process.exit());