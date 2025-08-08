/*
  Warnings:

  - You are about to drop the `OrderItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `address` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `Order` table. All the data in the column will be lost.
  - Added the required column `billingAddress` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingAddress` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotalPrice` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPrice` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "OrderItem";
PRAGMA foreign_keys=on;

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
    CONSTRAINT "OrderLineItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderLineItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "OrderLineItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
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
    CONSTRAINT "Order_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("createdAt", "customerEmail", "customerId", "customerName", "customerPhone", "id", "orderNumber", "status", "storeId", "updatedAt") SELECT "createdAt", "customerEmail", "customerId", "customerName", "customerPhone", "id", "orderNumber", "status", "storeId", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE INDEX "Order_storeId_createdAt_idx" ON "Order"("storeId", "createdAt");
CREATE INDEX "Order_storeId_status_idx" ON "Order"("storeId", "status");
CREATE INDEX "Order_customerEmail_idx" ON "Order"("customerEmail");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "OrderLineItem_orderId_position_idx" ON "OrderLineItem"("orderId", "position");
