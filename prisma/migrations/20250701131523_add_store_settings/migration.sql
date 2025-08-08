-- CreateTable
CREATE TABLE "ProductReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "customerId" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "authorName" TEXT,
    "authorEmail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductReview_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProductReview_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
    CONSTRAINT "StoreSettings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Store" (
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
    "activeThemeId" TEXT,
    "themeSettings" JSONB,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Store_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Store_activeThemeId_fkey" FOREIGN KEY ("activeThemeId") REFERENCES "Theme" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Store" ("activeThemeId", "address", "bannerImage", "bannerSubtitle", "bannerTitle", "createdAt", "customDomain", "description", "email", "facebook", "id", "instagram", "keywords", "logo", "metaDescription", "metaTitle", "name", "phone", "primaryColor", "subdomain", "themeSettings", "twitter", "updatedAt", "userId", "youtube") SELECT "activeThemeId", "address", "bannerImage", "bannerSubtitle", "bannerTitle", "createdAt", "customDomain", "description", "email", "facebook", "id", "instagram", "keywords", "logo", "metaDescription", "metaTitle", "name", "phone", "primaryColor", "subdomain", "themeSettings", "twitter", "updatedAt", "userId", "youtube" FROM "Store";
DROP TABLE "Store";
ALTER TABLE "new_Store" RENAME TO "Store";
CREATE UNIQUE INDEX "Store_subdomain_key" ON "Store"("subdomain");
CREATE UNIQUE INDEX "Store_customDomain_key" ON "Store"("customDomain");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ProductReview_productId_rating_idx" ON "ProductReview"("productId", "rating");

-- CreateIndex
CREATE INDEX "ProductReview_productId_createdAt_idx" ON "ProductReview"("productId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StoreSettings_storeId_key" ON "StoreSettings"("storeId");
