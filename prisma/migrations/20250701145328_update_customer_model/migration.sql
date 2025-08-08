/*
  Warnings:

  - You are about to drop the column `address` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `Customer` table. All the data in the column will be lost.
  - You are about to alter the column `tags` on the `Customer` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - Made the column `firstName` on table `Customer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastName` on table `Customer` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Customer" (
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
    CONSTRAINT "Customer_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Customer" ("acceptsMarketing", "createdAt", "dateOfBirth", "email", "firstName", "gender", "id", "lastName", "phone", "status", "storeId", "tags", "updatedAt") SELECT "acceptsMarketing", "createdAt", "dateOfBirth", "email", "firstName", "gender", "id", "lastName", "phone", "status", "storeId", "tags", "updatedAt" FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
CREATE INDEX "Customer_storeId_status_idx" ON "Customer"("storeId", "status");
CREATE INDEX "Customer_email_idx" ON "Customer"("email");
CREATE UNIQUE INDEX "Customer_storeId_email_key" ON "Customer"("storeId", "email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
