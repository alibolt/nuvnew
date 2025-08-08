
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding commerce theme...');

  const manifestPath = path.join(process.cwd(), 'themes', 'minimal', 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  const theme = await prisma.theme.upsert({
    where: { code: manifest.theme.code },
    update: {},
    create: {
      code: manifest.theme.code,
      name: manifest.theme.name,
      description: manifest.theme.description,
      category: manifest.theme.category,
      version: manifest.theme.version,
      author: manifest.theme.author,
      features: manifest.features || [],
      settings: manifest.settings || [],
    },
  });

  console.log(`Theme '${theme.name}' seeded with id: ${theme.id}`);

  const allSections = [
    ...manifest.sections.structural,
    ...manifest.sections.content,
    ...manifest.sections.product,
    ...manifest.sections.collection,
  ];

  for (const sectionType of allSections) {
    await prisma.themeSection.upsert({
      where: { themeId_type: { themeId: theme.id, type: sectionType } },
      update: {},
      create: {
        themeId: theme.id,
        type: sectionType,
        name: sectionType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        schema: [], // You might want to define a proper schema later
      },
    });
  }

  console.log(`Seeded ${allSections.length} sections for theme '${theme.name}'`);

  const user = await prisma.user.upsert({
    where: { email: 'dev@nuvi.com' },
    update: {},
    create: {
      email: 'dev@nuvi.com',
      name: 'Dev User',
    },
  });

  console.log(`Upserted default user with id: ${user.id}`);

  const store = await prisma.store.upsert({
    where: { subdomain: 'default' },
    update: { activeThemeId: theme.id },
    create: {
      name: 'Default Store',
      subdomain: 'default',
      userId: user.id,
      activeThemeId: theme.id,
    },
  });

  console.log(`Upserted default store with id: ${store.id}`);

  

  // Seed templates and section instances
  for (const templateKey in manifest.templates) {
    const templateManifest = manifest.templates[templateKey];
    const templatePath = path.join(process.cwd(), 'themes', 'minimal', templateManifest.file);
    if (fs.existsSync(templatePath)) {
      const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));

      const storeTemplate = await prisma.storeTemplate.upsert({
        where: { storeId_templateType_name: { storeId: store.id, templateType: templateData.type, name: templateData.name } },
        update: {},
        create: {
          storeId: store.id,
          themeId: theme.id,
          templateType: templateData.type,
          name: templateData.name,
          isDefault: true,
        }
      });

      for (const section of templateData.sections) {
        await prisma.storeSectionInstance.create({
          data: {
            templateId: storeTemplate.id,
            sectionType: section.type,
            position: templateData.sections.indexOf(section),
            enabled: true,
            settings: section.settings,
          }
        });
      }
    }
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
