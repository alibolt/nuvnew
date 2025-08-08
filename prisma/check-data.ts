
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking database...');

  const store = await prisma.store.findFirst({
    where: { subdomain: 'default' },
    include: {
      activeTheme: {
        include: {
          sections: true,
        },
      },
    },
  });

  if (!store) {
    console.error('Default store not found.');
    return;
  }

  console.log(`Found store: ${store.name} (ID: ${store.id})`);

  if (!store.activeTheme) {
    console.error('Store does not have an active theme.');
    return;
  }

  console.log(`Active theme: ${store.activeTheme.name} (ID: ${store.activeTheme.id})`);

  if (store.activeTheme.sections.length === 0) {
    console.error('Active theme has no sections.');
    return;
  }

  console.log(`Found ${store.activeTheme.sections.length} sections:`);
  store.activeTheme.sections.forEach((section) => {
    console.log(`- ${section.name} (Type: ${section.type})`);
  });

  console.log('\nDatabase check complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

