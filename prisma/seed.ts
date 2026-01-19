import "dotenv/config";
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  const adminEmail = 'admin@admin.com';
  const adminPassword = 'Waterboy10';
  const saltRounds = 10;

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists, skipping creation.');
    return;
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

  // Create the admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@admin.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '234234234',
      businessName: 'Admin',
      role: 'ADMIN',
      restricted: false,
    },
  });

  console.log('✅ Admin user created successfully!');
  console.log(`   Email: ${admin.email}`);
  console.log(`   ID: ${admin.id}`);
  console.log(`   Role: ${admin.role}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
