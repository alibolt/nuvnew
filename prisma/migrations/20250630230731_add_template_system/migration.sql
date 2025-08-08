/*
  Warnings:

  - You are about to drop the column `storeId` on the `StoreSectionInstance` table. All the data in the column will be lost.
  - Added the required column `templateId` to the `StoreSectionInstance` table without a default value. This is not possible if the table is not empty.

*/
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
    CONSTRAINT "MenuItem_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MenuItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "MenuItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "dateOfBirth" DATETIME,
    "gender" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "zipCode" TEXT,
    "notes" TEXT,
    "tags" TEXT,
    "acceptsMarketing" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "storeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Customer_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StoreTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "templateType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB,
    "seoSettings" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StoreTemplate_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StoreTemplate_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "templateId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Category_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Category_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "StoreTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Category" ("createdAt", "id", "name", "slug", "storeId", "updatedAt") SELECT "createdAt", "id", "name", "slug", "storeId", "updatedAt" FROM "Category";
DROP TABLE "Category";
ALTER TABLE "new_Category" RENAME TO "Category";
CREATE UNIQUE INDEX "Category_storeId_slug_key" ON "Category"("storeId", "slug");
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT,
    "customerId" TEXT,
    "totalAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "storeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "address" TEXT,
    "notes" TEXT,
    CONSTRAINT "Order_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("address", "createdAt", "customerEmail", "customerName", "customerPhone", "id", "notes", "orderNumber", "status", "storeId", "totalAmount", "updatedAt") SELECT "address", "createdAt", "customerEmail", "customerName", "customerPhone", "id", "notes", "orderNumber", "status", "storeId", "totalAmount", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE TABLE "new_Page" (
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
    CONSTRAINT "Page_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Page_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "StoreTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Page" ("content", "createdAt", "id", "isPublished", "publishedAt", "seoDescription", "seoTitle", "slug", "storeId", "title", "updatedAt") SELECT "content", "createdAt", "id", "isPublished", "publishedAt", "seoDescription", "seoTitle", "slug", "storeId", "title", "updatedAt" FROM "Page";
DROP TABLE "Page";
ALTER TABLE "new_Page" RENAME TO "Page";
CREATE INDEX "Page_storeId_isPublished_idx" ON "Page"("storeId", "isPublished");
CREATE UNIQUE INDEX "Page_storeId_slug_key" ON "Page"("storeId", "slug");
CREATE TABLE "new_Product" (
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
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Product_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "StoreTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("categoryId", "createdAt", "description", "id", "isActive", "name", "storeId", "updatedAt") SELECT "categoryId", "createdAt", "description", "id", "isActive", "name", "storeId", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE TABLE "new_ProductVariant" (
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
INSERT INTO "new_ProductVariant" ("createdAt", "id", "name", "options", "price", "productId", "sku", "stock", "updatedAt") SELECT "createdAt", "id", "name", "options", "price", "productId", "sku", "stock", "updatedAt" FROM "ProductVariant";
DROP TABLE "ProductVariant";
ALTER TABLE "new_ProductVariant" RENAME TO "ProductVariant";
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");
CREATE TABLE "new_StoreSectionInstance" (
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
INSERT INTO "new_StoreSectionInstance" ("createdAt", "enabled", "id", "position", "sectionType", "settings", "updatedAt") SELECT "createdAt", "enabled", "id", "position", "sectionType", "settings", "updatedAt" FROM "StoreSectionInstance";
DROP TABLE "StoreSectionInstance";
ALTER TABLE "new_StoreSectionInstance" RENAME TO "StoreSectionInstance";
CREATE INDEX "StoreSectionInstance_templateId_position_idx" ON "StoreSectionInstance"("templateId", "position");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Menu_storeId_handle_key" ON "Menu"("storeId", "handle");

-- CreateIndex
CREATE INDEX "MenuItem_menuId_position_idx" ON "MenuItem"("menuId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_storeId_email_key" ON "Customer"("storeId", "email");

-- CreateIndex
CREATE INDEX "StoreTemplate_storeId_templateType_idx" ON "StoreTemplate"("storeId", "templateType");

-- CreateIndex
CREATE INDEX "StoreTemplate_storeId_isDefault_idx" ON "StoreTemplate"("storeId", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "StoreTemplate_storeId_templateType_name_key" ON "StoreTemplate"("storeId", "templateType", "name");
