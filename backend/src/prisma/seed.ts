import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@test.com',
      passwordHash,
      role: Role.ADMIN,
    },
  });
  await prisma.user.upsert({
    where: { email: 'librarian@test.com' },
    update: {},
    create: {
      name: 'Librarian',
      email: 'librarian@test.com',
      passwordHash,
      role: Role.LIBRARIAN,
    },
  });

  await prisma.book.createMany({
    data: [
      {
        title: 'Book 1',
        author: 'Author 1',
        isbn: '1234567890',
        publicationYear: 2008,
        totalQty: 3,
        availableQty: 3,
      },
      {
        title: 'Book 2',
        author: 'Author 2',
        isbn: '0987654321',
        publicationYear: 2017,
        totalQty: 2,
        availableQty: 2,
      },
    ],
    skipDuplicates: true,
  });
}

void main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e: unknown) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
