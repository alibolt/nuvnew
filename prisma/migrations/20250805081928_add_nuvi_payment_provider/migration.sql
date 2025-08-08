-- AlterTable
ALTER TABLE "Order" ADD COLUMN "paymentProvider" TEXT;

-- AlterTable
ALTER TABLE "Store" ADD COLUMN "themeSettings" JSONB;

-- CreateTable
CREATE TABLE "PlatformTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "orderId" TEXT,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlatformTransaction_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlatformTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Category" (
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
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Category_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "StoreTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Category_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Category" ("conditions", "createdAt", "description", "id", "image", "name", "slug", "sortOrder", "storeId", "templateId", "type", "updatedAt") SELECT "conditions", "createdAt", "description", "id", "image", "name", "slug", "sortOrder", "storeId", "templateId", "type", "updatedAt" FROM "Category";
DROP TABLE "Category";
ALTER TABLE "new_Category" RENAME TO "Category";
CREATE UNIQUE INDEX "Category_storeId_slug_key" ON "Category"("storeId", "slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "PlatformTransaction_storeId_idx" ON "PlatformTransaction"("storeId");

-- CreateIndex
CREATE INDEX "PlatformTransaction_orderId_idx" ON "PlatformTransaction"("orderId");

-- CreateIndex
CREATE INDEX "PlatformTransaction_createdAt_idx" ON "PlatformTransaction"("createdAt");
