import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Fix user role
  const userUpdate = await prisma.user.update({
    where: { email: 'user@nuvi.dev' },
    data: { role: 'USER' }
  });
  
  console.log('✅ Updated user role:', userUpdate.email, userUpdate.role);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());