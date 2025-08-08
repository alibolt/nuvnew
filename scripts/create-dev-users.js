// Development user creation script
require('dotenv/config');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createDevUsers() {
  try {
    console.log('Creating development users...');

    // Admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@nuvi.dev' },
      update: {
        role: 'admin',
        password: adminPassword,
        name: 'Admin User'
      },
      create: {
        email: 'admin@nuvi.dev',
        password: adminPassword,
        name: 'Admin User',
        role: 'admin'
      }
    });

    console.log('✅ Admin user created:', admin.email);

    // Regular user
    const userPassword = await bcrypt.hash('user123', 10);
    const user = await prisma.user.upsert({
      where: { email: 'user@nuvi.dev' },
      update: {
        role: 'user',
        password: userPassword,
        name: 'Test User'
      },
      create: {
        email: 'user@nuvi.dev',
        password: userPassword,
        name: 'Test User',
        role: 'user'
      }
    });

    console.log('✅ Regular user created:', user.email);

    // Create a test store for admin
    const store = await prisma.store.upsert({
      where: { subdomain: 'demo' },
      update: {
        userId: admin.id,
        name: 'Demo Store',
        description: 'A demo store for testing'
      },
      create: {
        subdomain: 'demo',
        name: 'Demo Store',
        description: 'A demo store for testing',
        userId: admin.id
      }
    });

    console.log('✅ Demo store created:', store.subdomain);

    console.log('\n🎉 Development users created successfully!');
    console.log('📧 Admin: admin@nuvi.dev / admin123');
    console.log('📧 User: user@nuvi.dev / user123');
    console.log('🏪 Demo store: http://demo.localhost:3000');

  } catch (error) {
    console.error('❌ Error creating development users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDevUsers();