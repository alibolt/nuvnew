-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "customDomain" TEXT,
    "logo" TEXT,
    "description" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#8B9F7E',
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "twitter" TEXT,
    "youtube" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "keywords" TEXT,
    "bannerImage" TEXT,
    "bannerTitle" TEXT,
    "bannerSubtitle" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "themeCode" TEXT NOT NULL DEFAULT 'commerce',
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Store_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "productType" TEXT NOT NULL DEFAULT 'physical',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "storeId" TEXT NOT NULL,
    "categoryId" TEXT,
    "templateId" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "slug" TEXT,
    "tags" JSONB NOT NULL DEFAULT [],
    "images" JSONB NOT NULL DEFAULT [],
    "requiresShipping" BOOLEAN NOT NULL DEFAULT true,
    "weight" REAL,
    "weightUnit" TEXT,
    "dimensions" JSONB,
    "trackQuantity" BOOLEAN NOT NULL DEFAULT true,
    "continueSellingWhenOutOfStock" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "StoreTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "barcode" TEXT,
    "price" REAL NOT NULL,
    "compareAtPrice" REAL,
    "cost" REAL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "weight" REAL,
    "weightUnit" TEXT,
    "trackQuantity" BOOLEAN NOT NULL DEFAULT true,
    "continueSellingWhenOutOfStock" BOOLEAN NOT NULL DEFAULT false,
    "options" JSONB NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductImage_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "storeId" TEXT NOT NULL,
    "templateId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'manual',
    "conditions" JSONB,
    "sortOrder" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Category_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "StoreTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Category_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Menu" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Menu_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "parentId" TEXT,
    "menuId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MenuItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "MenuItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MenuItem_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT,
    "customerId" TEXT,
    "subtotalPrice" REAL NOT NULL,
    "totalTax" REAL NOT NULL DEFAULT 0,
    "totalShipping" REAL NOT NULL DEFAULT 0,
    "totalDiscount" REAL NOT NULL DEFAULT 0,
    "totalPrice" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'open',
    "financialStatus" TEXT NOT NULL DEFAULT 'pending',
    "fulfillmentStatus" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "shippingAddress" JSONB NOT NULL,
    "billingAddress" JSONB NOT NULL,
    "shippingLines" JSONB,
    "tags" JSONB,
    "note" TEXT,
    "noteAttributes" JSONB,
    "discountCodes" JSONB,
    "cancelReason" TEXT,
    "cancelledAt" DATETIME,
    "storeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderLineItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "variantId" TEXT,
    "sku" TEXT,
    "title" TEXT NOT NULL,
    "variantTitle" TEXT,
    "quantity" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "compareAtPrice" REAL,
    "totalPrice" REAL NOT NULL,
    "taxable" BOOLEAN NOT NULL DEFAULT true,
    "requiresShipping" BOOLEAN NOT NULL DEFAULT true,
    "weight" REAL,
    "image" TEXT,
    "customAttributes" JSONB,
    "position" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OrderLineItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "OrderLineItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "OrderLineItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "dateOfBirth" DATETIME,
    "gender" TEXT,
    "addresses" JSONB,
    "note" TEXT,
    "tags" JSONB,
    "acceptsMarketing" BOOLEAN NOT NULL DEFAULT false,
    "emailMarketingConsent" JSONB,
    "smsMarketingConsent" JSONB,
    "taxExempt" BOOLEAN NOT NULL DEFAULT false,
    "taxExemptions" JSONB,
    "ordersCount" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "storeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastOrderAt" DATETIME,
    "customerGroup" TEXT,
    "groupAssignedAt" TEXT,
    "groupAssignedBy" TEXT,
    "groupRemovalReason" TEXT,
    "groupRemovedAt" TEXT,
    CONSTRAINT "Customer_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StoreSectionInstance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "sectionType" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StoreSectionInstance_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "StoreTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SectionBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sectionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SectionBlock_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "StoreSectionInstance" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StoreTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "templateType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB,
    "seoSettings" JSONB,
    "hasEmptySections" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StoreTemplate_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "templateId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Page_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "StoreTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Page_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Blog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Blog_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blogId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "featuredImage" TEXT,
    "author" TEXT NOT NULL,
    "tags" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BlogPost_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BlogPost_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "App" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "category" TEXT NOT NULL,
    "developer" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "pricing" JSONB,
    "features" JSONB NOT NULL,
    "permissions" JSONB NOT NULL,
    "webhooks" JSONB,
    "settings" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AppInstall" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "settings" JSONB,
    "apiKeys" JSONB,
    "webhookUrls" JSONB,
    "permissions" JSONB,
    "data" JSONB,
    "installedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastUsedAt" DATETIME,
    CONSTRAINT "AppInstall_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AppInstall_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ShopifyImport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appInstallId" TEXT NOT NULL,
    "storeUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "data" JSONB,
    "mappingConfig" JSONB,
    "importStats" JSONB,
    "error" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "ShopifyImport_appInstallId_fkey" FOREIGN KEY ("appInstallId") REFERENCES "AppInstall" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "customerId" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedPurchase" BOOLEAN NOT NULL DEFAULT false,
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "authorName" TEXT,
    "authorEmail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'approved',
    "images" JSONB,
    "attributes" JSONB,
    "recommendProduct" BOOLEAN,
    "helpfulVotes" JSONB,
    "response" JSONB,
    "moderationNote" TEXT,
    "moderatedBy" TEXT,
    "moderatedAt" TEXT,
    "submittedAt" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductReview_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProductReview_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StoreSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "timeZone" TEXT NOT NULL DEFAULT 'America/New_York',
    "weekStartsOn" TEXT NOT NULL DEFAULT 'monday',
    "weightUnit" TEXT NOT NULL DEFAULT 'kg',
    "lengthUnit" TEXT NOT NULL DEFAULT 'cm',
    "businessName" TEXT,
    "businessEmail" TEXT,
    "businessPhone" TEXT,
    "businessAddress" TEXT,
    "businessCity" TEXT,
    "businessState" TEXT,
    "businessZip" TEXT,
    "businessCountry" TEXT,
    "businessType" TEXT,
    "taxId" TEXT,
    "businessHours" JSONB,
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "twitterUrl" TEXT,
    "linkedinUrl" TEXT,
    "youtubeUrl" TEXT,
    "tiktokUrl" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT,
    "googleAnalyticsId" TEXT,
    "facebookPixelId" TEXT,
    "tiktokPixelId" TEXT,
    "snapchatPixelId" TEXT,
    "hotjarId" TEXT,
    "clarityId" TEXT,
    "enablePasswordProtection" BOOLEAN NOT NULL DEFAULT false,
    "storePassword" TEXT,
    "enableAgeVerification" BOOLEAN NOT NULL DEFAULT false,
    "minimumAge" INTEGER NOT NULL DEFAULT 18,
    "enableMaintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMessage" TEXT,
    "cookieBannerEnabled" BOOLEAN NOT NULL DEFAULT true,
    "gdprEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "emailSettings" JSONB,
    "notificationSettings" JSONB,
    "paymentMethods" JSONB,
    "shippingZones" JSONB,
    "taxSettings" JSONB,
    "abandonedCartRecovery" JSONB,
    "abandonedCarts" JSONB,
    "activityLogs" JSONB,
    "apiKeys" JSONB,
    "exportJobs" JSONB,
    "importJobs" JSONB,
    "inventory" JSONB,
    "marketingAutomations" JSONB,
    "marketingCampaigns" JSONB,
    "mediaLibrary" JSONB,
    "returnPolicy" JSONB,
    "returns" JSONB,
    "seoSettings" JSONB,
    "staffMembers" JSONB,
    "urlRedirects" JSONB,
    "webhooks" JSONB,
    "alertConfigs" JSONB,
    "alertHistory" JSONB,
    "customerGroups" JSONB,
    "discounts" JSONB,
    "healthCheckConfig" JSONB,
    "healthHistory" JSONB,
    "localizationSettings" JSONB,
    "monitoringConfig" JSONB,
    "notificationHistory" JSONB,
    "performanceConfig" JSONB,
    "performanceHistory" JSONB,
    "reviewSettings" JSONB,
    "searchSettings" JSONB,
    "translations" JSONB,
    "orderTimelines" JSONB,
    CONSTRAINT "StoreSettings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlatformSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platformName" TEXT NOT NULL DEFAULT 'Nuvi SaaS',
    "defaultEmail" TEXT NOT NULL DEFAULT 'noreply@nuvi.com',
    "supportEmail" TEXT NOT NULL DEFAULT 'support@nuvi.com',
    "defaultCurrency" TEXT NOT NULL DEFAULT 'USD',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMessage" TEXT DEFAULT 'Our platform is currently undergoing scheduled maintenance. We''ll be back shortly!',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "copyrightText" TEXT DEFAULT '© 2025 Nuvi SaaS. All rights reserved.',
    "facebookPixelId" TEXT,
    "facebookUrl" TEXT,
    "faviconUrl" TEXT,
    "googleAnalyticsId" TEXT,
    "hotjarId" TEXT,
    "instagramUrl" TEXT,
    "linkedinUrl" TEXT,
    "platformLogoUrl" TEXT,
    "smtpEncryption" TEXT DEFAULT 'TLS',
    "smtpHost" TEXT,
    "smtpPassword" TEXT,
    "smtpPort" INTEGER DEFAULT 587,
    "smtpUsername" TEXT,
    "tiktokPixelId" TEXT,
    "twitterUrl" TEXT,
    "youtubeUrl" TEXT
);

-- CreateTable
CREATE TABLE "PlatformBlog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PlatformBlogPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blogId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "featuredImage" TEXT,
    "author" TEXT NOT NULL,
    "tags" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlatformBlogPost_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "PlatformBlog" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PricingPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "priceMonthly" REAL NOT NULL,
    "priceAnnually" REAL NOT NULL,
    "features" JSONB NOT NULL DEFAULT [],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "messageId" TEXT,
    "provider" TEXT,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmailLog_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SearchIndex" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "keywords" TEXT,
    "boost" REAL NOT NULL DEFAULT 1.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "imageUrl" TEXT,
    "price" REAL,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SearchIndex_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SearchQuery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "normalizedQuery" TEXT NOT NULL,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "clickedResults" JSONB,
    "searchFilters" JSONB,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "sessionId" TEXT,
    "customerId" TEXT,
    "deviceType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SearchQuery_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SearchSynonym" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "synonyms" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SearchSynonym_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SearchBoost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "boost" REAL NOT NULL DEFAULT 2.0,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SearchBoost_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SearchRedirect" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "redirectTo" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SearchRedirect_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SearchSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "enableFuzzySearch" BOOLEAN NOT NULL DEFAULT true,
    "fuzzyThreshold" REAL NOT NULL DEFAULT 0.8,
    "enableSynonyms" BOOLEAN NOT NULL DEFAULT true,
    "enableAutoComplete" BOOLEAN NOT NULL DEFAULT true,
    "autoCompleteMinChars" INTEGER NOT NULL DEFAULT 3,
    "autoCompleteMaxResults" INTEGER NOT NULL DEFAULT 10,
    "searchResultsPerPage" INTEGER NOT NULL DEFAULT 24,
    "enableSpellCorrection" BOOLEAN NOT NULL DEFAULT true,
    "enableSearchHistory" BOOLEAN NOT NULL DEFAULT true,
    "historyRetentionDays" INTEGER NOT NULL DEFAULT 30,
    "enablePopularSearches" BOOLEAN NOT NULL DEFAULT true,
    "popularSearchesCount" INTEGER NOT NULL DEFAULT 10,
    "defaultSortOrder" TEXT NOT NULL DEFAULT 'relevance',
    "enableFacetedSearch" BOOLEAN NOT NULL DEFAULT true,
    "facets" JSONB,
    "filterConfiguration" JSONB,
    "stopWords" JSONB,
    "boostFields" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SearchSettings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GoogleIntegration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "expiresAt" DATETIME,
    "scope" TEXT,
    "analyticsPropertyId" TEXT,
    "analyticsStreamId" TEXT,
    "searchConsoleUrl" TEXT,
    "merchantCenterId" TEXT,
    "adsAccountId" TEXT,
    "businessProfileId" TEXT,
    "autoSyncProducts" BOOLEAN NOT NULL DEFAULT true,
    "syncFrequency" TEXT NOT NULL DEFAULT 'daily',
    "lastSyncAt" DATETIME,
    "syncStatus" TEXT,
    "enableAnalytics" BOOLEAN NOT NULL DEFAULT true,
    "enableSearchConsole" BOOLEAN NOT NULL DEFAULT true,
    "enableMerchantCenter" BOOLEAN NOT NULL DEFAULT false,
    "enableAds" BOOLEAN NOT NULL DEFAULT false,
    "enableBusinessProfile" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GoogleIntegration_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Store_subdomain_key" ON "Store"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "Store_customDomain_key" ON "Store"("customDomain");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Category_storeId_slug_key" ON "Category"("storeId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Menu_storeId_handle_key" ON "Menu"("storeId", "handle");

-- CreateIndex
CREATE INDEX "MenuItem_menuId_position_idx" ON "MenuItem"("menuId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_storeId_createdAt_idx" ON "Order"("storeId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_storeId_status_idx" ON "Order"("storeId", "status");

-- CreateIndex
CREATE INDEX "Order_customerEmail_idx" ON "Order"("customerEmail");

-- CreateIndex
CREATE INDEX "OrderLineItem_orderId_position_idx" ON "OrderLineItem"("orderId", "position");

-- CreateIndex
CREATE INDEX "Customer_storeId_status_idx" ON "Customer"("storeId", "status");

-- CreateIndex
CREATE INDEX "Customer_email_idx" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_storeId_email_key" ON "Customer"("storeId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "StoreSectionInstance_templateId_position_idx" ON "StoreSectionInstance"("templateId", "position");

-- CreateIndex
CREATE INDEX "SectionBlock_sectionId_position_idx" ON "SectionBlock"("sectionId", "position");

-- CreateIndex
CREATE INDEX "StoreTemplate_storeId_templateType_idx" ON "StoreTemplate"("storeId", "templateType");

-- CreateIndex
CREATE INDEX "StoreTemplate_storeId_isDefault_idx" ON "StoreTemplate"("storeId", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "StoreTemplate_storeId_templateType_name_key" ON "StoreTemplate"("storeId", "templateType", "name");

-- CreateIndex
CREATE INDEX "Page_storeId_isPublished_idx" ON "Page"("storeId", "isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "Page_storeId_slug_key" ON "Page"("storeId", "slug");

-- CreateIndex
CREATE INDEX "Blog_storeId_idx" ON "Blog"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Blog_storeId_slug_key" ON "Blog"("storeId", "slug");

-- CreateIndex
CREATE INDEX "BlogPost_storeId_isPublished_idx" ON "BlogPost"("storeId", "isPublished");

-- CreateIndex
CREATE INDEX "BlogPost_blogId_isPublished_idx" ON "BlogPost"("blogId", "isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_blogId_slug_key" ON "BlogPost"("blogId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "App_code_key" ON "App"("code");

-- CreateIndex
CREATE INDEX "AppInstall_storeId_status_idx" ON "AppInstall"("storeId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AppInstall_storeId_appId_key" ON "AppInstall"("storeId", "appId");

-- CreateIndex
CREATE INDEX "ShopifyImport_appInstallId_status_idx" ON "ShopifyImport"("appInstallId", "status");

-- CreateIndex
CREATE INDEX "ProductReview_productId_rating_idx" ON "ProductReview"("productId", "rating");

-- CreateIndex
CREATE INDEX "ProductReview_productId_createdAt_idx" ON "ProductReview"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "ProductReview_productId_status_idx" ON "ProductReview"("productId", "status");

-- CreateIndex
CREATE INDEX "ProductReview_status_idx" ON "ProductReview"("status");

-- CreateIndex
CREATE UNIQUE INDEX "StoreSettings_storeId_key" ON "StoreSettings"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformBlog_name_key" ON "PlatformBlog"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformBlog_slug_key" ON "PlatformBlog"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformBlogPost_slug_key" ON "PlatformBlogPost"("slug");

-- CreateIndex
CREATE INDEX "PlatformBlogPost_blogId_isPublished_idx" ON "PlatformBlogPost"("blogId", "isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformBlogPost_blogId_slug_key" ON "PlatformBlogPost"("blogId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "PricingPlan_name_key" ON "PricingPlan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PricingPlan_slug_key" ON "PricingPlan"("slug");

-- CreateIndex
CREATE INDEX "EmailLog_storeId_idx" ON "EmailLog"("storeId");

-- CreateIndex
CREATE INDEX "EmailLog_status_idx" ON "EmailLog"("status");

-- CreateIndex
CREATE INDEX "EmailLog_createdAt_idx" ON "EmailLog"("createdAt");

-- CreateIndex
CREATE INDEX "SearchIndex_storeId_isActive_idx" ON "SearchIndex"("storeId", "isActive");

-- CreateIndex
CREATE INDEX "SearchIndex_storeId_entityType_idx" ON "SearchIndex"("storeId", "entityType");

-- CreateIndex
CREATE INDEX "SearchIndex_title_idx" ON "SearchIndex"("title");

-- CreateIndex
CREATE INDEX "SearchIndex_updatedAt_idx" ON "SearchIndex"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SearchIndex_storeId_entityType_entityId_key" ON "SearchIndex"("storeId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "SearchQuery_storeId_createdAt_idx" ON "SearchQuery"("storeId", "createdAt");

-- CreateIndex
CREATE INDEX "SearchQuery_storeId_normalizedQuery_idx" ON "SearchQuery"("storeId", "normalizedQuery");

-- CreateIndex
CREATE INDEX "SearchQuery_sessionId_idx" ON "SearchQuery"("sessionId");

-- CreateIndex
CREATE INDEX "SearchSynonym_storeId_isActive_idx" ON "SearchSynonym"("storeId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "SearchSynonym_storeId_term_key" ON "SearchSynonym"("storeId", "term");

-- CreateIndex
CREATE INDEX "SearchBoost_storeId_query_idx" ON "SearchBoost"("storeId", "query");

-- CreateIndex
CREATE INDEX "SearchBoost_storeId_isActive_idx" ON "SearchBoost"("storeId", "isActive");

-- CreateIndex
CREATE INDEX "SearchBoost_startDate_endDate_idx" ON "SearchBoost"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "SearchRedirect_storeId_isActive_idx" ON "SearchRedirect"("storeId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "SearchRedirect_storeId_query_key" ON "SearchRedirect"("storeId", "query");

-- CreateIndex
CREATE UNIQUE INDEX "SearchSettings_storeId_key" ON "SearchSettings"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleIntegration_storeId_key" ON "GoogleIntegration"("storeId");
