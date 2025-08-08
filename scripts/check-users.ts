import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      password: true
    }
  });

  console.log('📋 Total users:', users.length);
  console.log('\n👥 Users in database:');
  
  users.forEach(user => {
    console.log(`\n- Email: ${user.email}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Has Password: ${user.password ? 'Yes' : 'No'}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());