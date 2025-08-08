import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedThemes() {
  try {
    console.log('Seeding themes...');

    // Create Modern theme
    const modernTheme = await prisma.theme.upsert({
      where: { code: 'modern' },
      update: {},
      create: {
        code: 'modern',
        name: 'Modern',
        description: 'A clean, modern theme with contemporary design',
        category: 'general',
        version: '1.0.0',
        author: 'Nuvi',
        previewUrl: '/themes/modern/preview.jpg',
        features: ['responsive', 'customizable', 'seo-friendly'],
        settings: {
          colors: {
            primary: '#3B82F6',
            secondary: '#1F2937',
          },
          typography: {
            headingFont: 'Inter',
            bodyFont: 'Inter',
          },
        },
      },
    });

    console.log('Created Modern theme:', modernTheme.id);

    // Create Commerce theme
    const commerceTheme = await prisma.theme.upsert({
      where: { code: 'commerce' },
      update: {},
      create: {
        code: 'commerce',
        name: 'Commerce Pro',
        description: 'Professional e-commerce theme with modern design and conversion optimization',
        category: 'ecommerce',
        version: '1.0.0',
        author: 'Nuvi',
        previewUrl: '/themes/commerce/preview.jpg',
        features: [
          'Product showcase',
          'Shopping cart',
          'User reviews',
          'Wishlist',
          'Search & filters',
          'Mobile responsive',
          'SEO optimized'
        ],
        settings: {
          colors: {
            primary: '#2563EB',
            secondary: '#64748B',
            accent: '#F59E0B',
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
            background: '#FFFFFF',
            surface: '#F8FAFC',
            text: '#1E293B',
            textSecondary: '#64748B',
            border: '#E2E8F0'
          },
          typography: {
            headingFont: 'Inter',
            bodyFont: 'Inter',
            monospaceFont: 'JetBrains Mono',
            headingWeight: '700',
            bodyWeight: '400',
          },
        },
      },
    });

    console.log('Created Commerce theme:', commerceTheme.id);

    // Update test store to use modern theme
    const testStore = await prisma.store.findUnique({
      where: { subdomain: 'test-store' },
    });

    if (testStore) {
      await prisma.store.update({
        where: { id: testStore.id },
        data: {
          activeThemeId: modernTheme.id,
        },
      });
      console.log('Updated test-store to use Modern theme');
    }

    console.log('Theme seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding themes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedThemes();