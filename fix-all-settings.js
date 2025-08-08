const fs = require('fs');
const path = require('path');

const pagesToFix = [
  { path: 'emails', component: 'EmailSettingsSimple' },
  { path: 'gift-cards', component: 'GiftCardsFormV2' },
  { path: 'locations', component: 'LocationsFormV2' },
  { path: 'policies', component: 'PoliciesFormV2' },
  { path: 'shipping', component: 'ShippingFormV2' },
  { path: 'taxes', component: 'TaxesFormV2' },
  { path: 'billing', component: 'BillingFormV2' },
  { path: 'store-details', component: 'StoreDetailsFormV2' }
];

pagesToFix.forEach(({ path: pagePath, component }) => {
  const filePath = `/Users/ali/Desktop/nuvi-saas/app/dashboard/stores/[subdomain]/settings/${pagePath}/page.tsx`;
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already has DashboardWrapper
    if (content.includes('DashboardWrapper')) {
      console.log(`✓ ${pagePath} already has DashboardWrapper`);
      return;
    }
    
    // Add DashboardWrapper import
    if (!content.includes("import { DashboardWrapper }")) {
      content = content.replace(
        "import { authOptions } from '@/lib/auth-options';",
        "import { authOptions } from '@/lib/auth-options';\nimport { DashboardWrapper } from '@/components/dashboard/dashboard-wrapper';"
      );
    }
    
    // Find the return statement and replace it
    const returnMatch = content.match(/return \(([\s\S]*?)\);(\s*}\s*)$/);
    if (returnMatch) {
      const newReturn = `return (
    <DashboardWrapper 
      store={store} 
      allStores={allStores} 
      session={session} 
      activeTab="settings"
    >
      ${returnMatch[1].trim()}
    </DashboardWrapper>
  );
}`;
      
      content = content.replace(returnMatch[0], newReturn);
    }
    
    // Add allStores query after store check
    if (!content.includes('allStores')) {
      const storeCheckMatch = content.match(/if \(!store\) \{[\s\S]*?notFound\(\);[\s\S]*?\}/);
      if (storeCheckMatch) {
        const allStoresQuery = `

  // Get all user's stores for the store switcher
  const allStores = await prisma.store.findMany({
    where: {
      userId: session.user.id
    },
    include: {
      _count: {
        select: {
          products: true,
          orders: true,
          categories: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });`;
        
        content = content.replace(
          storeCheckMatch[0],
          storeCheckMatch[0] + allStoresQuery
        );
      }
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${pagePath}`);
  } else {
    console.log(`❌ File not found: ${pagePath}`);
  }
});

console.log('\nAll settings pages processed!');