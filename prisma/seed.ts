import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create test users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@nuvi.dev' },
    update: {},
    create: {
      email: 'admin@nuvi.dev',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    }
  });

  const testUser = await prisma.user.upsert({
    where: { email: 'user@nuvi.dev' },
    update: {},
    create: {
      email: 'user@nuvi.dev',
      name: 'Test User',
      password: userPassword,
      role: 'USER',
    }
  });

  console.log('✅ Created test users:', { admin: adminUser.email, user: testUser.email });
  // Create Smart Search app if it doesn't exist
  const searchApp = await prisma.app.upsert({
    where: { code: 'smart-search' },
    update: {},
    create: {
      code: 'smart-search',
      name: 'Smart Search & Discovery',
      description: 'Advanced search with AI-powered suggestions, analytics, and personalization',
      icon: '🔍',
      category: 'search',
      developer: 'Nuvi',
      version: '1.0.0',
      pricing: {
        plans: [
          {
            name: 'Free',
            price: 0,
            features: ['Basic search', 'Up to 1,000 searches/month', 'Basic analytics']
          },
          {
            name: 'Pro',
            price: 49,
            features: ['AI suggestions', 'Unlimited searches', 'Advanced analytics', 'Synonym management']
          },
          {
            name: 'Enterprise',
            price: 99,
            features: ['Everything in Pro', 'Custom filters', 'API access', 'Priority support']
          }
        ]
      },
      features: [
        'AI-powered search suggestions',
        'Real-time search analytics',
        'Synonym management',
        'Faceted filtering',
        'No-results optimization',
        'Search result personalization'
      ],
      permissions: [
        'read_products',
        'read_collections',
        'read_pages',
        'write_search_index'
      ],
      isActive: true,
      isPublic: true
    }
  });

  console.log('✅ Created Smart Search app:', searchApp.code);

  // Create Google Integration app
  const googleApp = await prisma.app.upsert({
    where: { code: 'google-integration' },
    update: {},
    create: {
      code: 'google-integration',
      name: 'Google Integration Suite',
      description: 'Connect your store with Google Analytics, Search Console, Merchant Center, and more',
      icon: '🔗',
      category: 'integration',
      developer: 'Nuvi',
      version: '1.0.0',
      pricing: {
        type: 'free',
        price: 0
      },
      features: [
        'Google Analytics 4 integration',
        'Search Console tracking',
        'Google Merchant Center sync',
        'Google Ads conversion tracking',
        'Google Business Profile management',
        'Real-time data sync',
        'Automated product feed',
        'Performance reports'
      ],
      permissions: [
        'read_analytics',
        'write_analytics',
        'read_products',
        'read_orders',
        'manage_settings'
      ],
      isActive: true,
      isPublic: true
    }
  });

  console.log('✅ Created Google Integration app:', googleApp.code);

  // Create pricing plans
  const freePlan = await prisma.pricingPlan.upsert({
    where: { slug: 'free' },
    update: {},
    create: {
      name: 'Free',
      slug: 'free',
      description: 'Perfect for getting started',
      priceMonthly: 0,
      priceAnnually: 0,
      features: [
        '10 products',
        'Basic analytics',
        'Community support',
        '1 GB storage'
      ],
      isActive: true
    }
  });

  const starterPlan = await prisma.pricingPlan.upsert({
    where: { slug: 'starter' },
    update: {},
    create: {
      name: 'Starter',
      slug: 'starter',
      description: 'Great for small businesses',
      priceMonthly: 29,
      priceAnnually: 290,
      features: [
        '100 products',
        'Advanced analytics',
        'Email support',
        'Custom domain',
        '10 GB storage',
        'Abandoned cart recovery'
      ],
      isActive: true
    }
  });

  const professionalPlan = await prisma.pricingPlan.upsert({
    where: { slug: 'professional' },
    update: {},
    create: {
      name: 'Professional',
      slug: 'professional',
      description: 'For growing businesses',
      priceMonthly: 79,
      priceAnnually: 790,
      features: [
        'Unlimited products',
        'Professional reports',
        'Priority support',
        'Custom domain',
        'API access',
        '100 GB storage',
        'Advanced themes',
        'Multi-currency',
        'Staff accounts'
      ],
      isActive: true
    }
  });

  const enterprisePlan = await prisma.pricingPlan.upsert({
    where: { slug: 'enterprise' },
    update: {},
    create: {
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'For large businesses',
      priceMonthly: 299,
      priceAnnually: 2990,
      features: [
        'Everything in Professional',
        'Dedicated support',
        'Custom integrations',
        'Unlimited storage',
        'Advanced security',
        'Custom checkout',
        'B2B features',
        'SLA guarantee'
      ],
      isActive: true
    }
  });

  console.log('✅ Created pricing plans');
  console.log('✅ Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });