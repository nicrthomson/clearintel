const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('Please provide ADMIN_EMAIL and ADMIN_PASSWORD environment variables');
    process.exit(1);
  }

  try {
    // Create or update organization
    const organization = await prisma.organization.upsert({
      where: { domain: 'clear-intel.com' },
      update: {},
      create: {
        name: 'Clear Intel',
        domain: 'clear-intel.com',
        subscription: 'ENTERPRISE',
        maxUsers: 5,
        maxReadOnlyUsers: 20,
      },
    });

    // Create or update admin user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        isOrgAdmin: true,
        role: 'ADMIN',
        organization: {
          connect: { id: organization.id }
        }
      },
      create: {
        email,
        password: hashedPassword,
        name: 'System Admin',
        isOrgAdmin: true,
        role: 'ADMIN',
        organization: {
          connect: { id: organization.id }
        }
      },
    });

    console.log('Organization admin setup completed successfully');
    console.log('Organization:', organization.name);
    console.log('Admin user:', user.email);
  } catch (error) {
    console.error('Error setting up organization admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
