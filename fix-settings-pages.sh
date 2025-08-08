#!/bin/bash

# Fix all settings pages that are missing DashboardWrapper

fix_page() {
  local file=$1
  local component_name=$2
  
  echo "Fixing: $file"
  
  # Add DashboardWrapper import if missing
  if ! grep -q "DashboardWrapper" "$file"; then
    sed -i '' "s|import { authOptions } from '@/lib/auth-options';|import { authOptions } from '@/lib/auth-options';\nimport { DashboardWrapper } from '@/components/dashboard/dashboard-wrapper';|" "$file"
  fi
  
  # Add allStores query and wrap with DashboardWrapper if missing
  if ! grep -q "allStores" "$file"; then
    # Add allStores query after store check
    sed -i '' '/if (!store) {/,/notFound();/a\
  }\
\
  // Get all user'\''s stores for the store switcher\
  const allStores = await prisma.store.findMany({\
    where: {\
      userId: session.user.id\
    },\
    include: {\
      _count: {\
        select: {\
          products: true,\
          orders: true,\
          categories: true,\
        }\
      }\
    },\
    orderBy: {\
      createdAt: '\''desc'\''\
    }\
  });\
\
  return (\
    <DashboardWrapper \
      store={store} \
      allStores={allStores} \
      session={session} \
      activeTab="settings"\
    >\
      <SettingsClient store={store}>\
        <'$component_name' store={store} />\
      </SettingsClient>\
    </DashboardWrapper>\
  );\
}' "$file"
    
    # Remove old return statement
    sed -i '' '/^  return ($/,/^}$/d' "$file"
  fi
}

# Fix each page
fix_page "/Users/ali/Desktop/nuvi-saas/app/dashboard/stores/[subdomain]/settings/billing/page.tsx" "BillingFormV2"
fix_page "/Users/ali/Desktop/nuvi-saas/app/dashboard/stores/[subdomain]/settings/checkout/page.tsx" "CheckoutFormV2"
fix_page "/Users/ali/Desktop/nuvi-saas/app/dashboard/stores/[subdomain]/settings/currency/page.tsx" "CurrencyFormV2"
fix_page "/Users/ali/Desktop/nuvi-saas/app/dashboard/stores/[subdomain]/settings/custom-data/page.tsx" "CustomDataFormV2"
fix_page "/Users/ali/Desktop/nuvi-saas/app/dashboard/stores/[subdomain]/settings/emails/page.tsx" "EmailSettingsForm"
fix_page "/Users/ali/Desktop/nuvi-saas/app/dashboard/stores/[subdomain]/settings/gift-cards/page.tsx" "GiftCardsFormV2"
fix_page "/Users/ali/Desktop/nuvi-saas/app/dashboard/stores/[subdomain]/settings/locations/page.tsx" "LocationsFormV2"
fix_page "/Users/ali/Desktop/nuvi-saas/app/dashboard/stores/[subdomain]/settings/payments/page.tsx" "PaymentsFormV2"
fix_page "/Users/ali/Desktop/nuvi-saas/app/dashboard/stores/[subdomain]/settings/policies/page.tsx" "PoliciesFormV2"
fix_page "/Users/ali/Desktop/nuvi-saas/app/dashboard/stores/[subdomain]/settings/shipping/page.tsx" "ShippingFormV2"
fix_page "/Users/ali/Desktop/nuvi-saas/app/dashboard/stores/[subdomain]/settings/taxes/page.tsx" "TaxesFormV2"

echo "All settings pages fixed!"