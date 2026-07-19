import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  const existing = await prisma.user.findUnique({
    where: { username },
  });

  if (!existing) {
    await prisma.user.create({
      data: {
        username,
        passwordHash: hashPassword(password),
      },
    });
    console.log(`Admin user ${username} created`);
  } else {
    console.log(`Admin user ${username} already exists`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
