-- AlterTable
ALTER TABLE "Category" ADD COLUMN "description" TEXT;
ALTER TABLE "Category" ADD COLUMN "image" TEXT;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN "customerGroup" TEXT;
ALTER TABLE "Customer" ADD COLUMN "groupAssignedAt" TEXT;
ALTER TABLE "Customer" ADD COLUMN "groupAssignedBy" TEXT;
ALTER TABLE "Customer" ADD COLUMN "groupRemovalReason" TEXT;
ALTER TABLE "Customer" ADD COLUMN "groupRemovedAt" TEXT;

-- AlterTable
ALTER TABLE "StoreSettings" ADD COLUMN "alertConfigs" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "alertHistory" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "customerGroups" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "discounts" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "healthCheckConfig" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "healthHistory" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "localizationSettings" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "monitoringConfig" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "notificationHistory" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "performanceConfig" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "performanceHistory" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "reviewSettings" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "searchSettings" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "translations" JSONB;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProductReview" (
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
    CONSTRAINT "ProductReview_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProductReview_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ProductReview" ("authorEmail", "authorName", "content", "createdAt", "customerId", "helpful", "id", "productId", "rating", "title", "updatedAt", "verified") SELECT "authorEmail", "authorName", "content", "createdAt", "customerId", "helpful", "id", "productId", "rating", "title", "updatedAt", "verified" FROM "ProductReview";
DROP TABLE "ProductReview";
ALTER TABLE "new_ProductReview" RENAME TO "ProductReview";
CREATE INDEX "ProductReview_productId_rating_idx" ON "ProductReview"("productId", "rating");
CREATE INDEX "ProductReview_productId_createdAt_idx" ON "ProductReview"("productId", "createdAt");
CREATE INDEX "ProductReview_productId_status_idx" ON "ProductReview"("productId", "status");
CREATE INDEX "ProductReview_status_idx" ON "ProductReview"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
