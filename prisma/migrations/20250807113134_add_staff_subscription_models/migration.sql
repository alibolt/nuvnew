-- AlterTable
ALTER TABLE "StoreSettings" ADD COLUMN "currency" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "giftCardSettings" JSONB;

-- CreateTable
CREATE TABLE "StaffMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "department" TEXT,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorMethod" TEXT,
    "twoFactorSecret" TEXT,
    "permissions" JSONB,
    "accessRestrictions" JSONB,
    "lastLogin" DATETIME,
    "lastActivity" DATETIME,
    "invitedBy" TEXT,
    "invitedAt" DATETIME,
    "acceptedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StaffMember_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MetafieldDefinition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "appliesTo" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MetafieldDefinition_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Metafield" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "definitionId" TEXT,
    "namespace" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "ownerType" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Metafield_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Metafield_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "MetafieldDefinition" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "billingCycle" TEXT NOT NULL DEFAULT 'monthly',
    "currentPeriodStart" DATETIME NOT NULL,
    "currentPeriodEnd" DATETIME NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "paymentMethod" JSONB,
    "lastPaymentDate" DATETIME,
    "lastPaymentAmount" REAL,
    "nextPaymentDate" DATETIME,
    "nextPaymentAmount" REAL,
    "usage" JSONB,
    "usageLimits" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "PricingPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subscriptionId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "billingPeriodStart" DATETIME NOT NULL,
    "billingPeriodEnd" DATETIME NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "paidAt" DATETIME,
    "paymentMethod" JSONB,
    "lineItems" JSONB,
    "pdfUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GiftCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "initialBalance" REAL NOT NULL,
    "currentBalance" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "recipientEmail" TEXT,
    "recipientName" TEXT,
    "senderName" TEXT,
    "senderEmail" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activatedAt" DATETIME,
    "expiresAt" DATETIME,
    "lastUsedAt" DATETIME,
    "orderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GiftCard_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GiftCard_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GiftCardTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "giftCardId" TEXT NOT NULL,
    "orderId" TEXT,
    "amount" REAL NOT NULL,
    "balance" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GiftCardTransaction_giftCardId_fkey" FOREIGN KEY ("giftCardId") REFERENCES "GiftCard" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GiftCardTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "StaffMember_storeId_idx" ON "StaffMember"("storeId");

-- CreateIndex
CREATE INDEX "StaffMember_email_idx" ON "StaffMember"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StaffMember_storeId_email_key" ON "StaffMember"("storeId", "email");

-- CreateIndex
CREATE INDEX "MetafieldDefinition_storeId_idx" ON "MetafieldDefinition"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "MetafieldDefinition_storeId_namespace_key_key" ON "MetafieldDefinition"("storeId", "namespace", "key");

-- CreateIndex
CREATE INDEX "Metafield_storeId_idx" ON "Metafield"("storeId");

-- CreateIndex
CREATE INDEX "Metafield_ownerType_ownerId_idx" ON "Metafield"("ownerType", "ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Metafield_storeId_namespace_key_ownerType_ownerId_key" ON "Metafield"("storeId", "namespace", "key", "ownerType", "ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_storeId_key" ON "Subscription"("storeId");

-- CreateIndex
CREATE INDEX "Subscription_storeId_idx" ON "Subscription"("storeId");

-- CreateIndex
CREATE INDEX "Subscription_planId_idx" ON "Subscription"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Invoice_subscriptionId_idx" ON "Invoice"("subscriptionId");

-- CreateIndex
CREATE INDEX "Invoice_invoiceNumber_idx" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "GiftCard_code_key" ON "GiftCard"("code");

-- CreateIndex
CREATE INDEX "GiftCard_storeId_status_idx" ON "GiftCard"("storeId", "status");

-- CreateIndex
CREATE INDEX "GiftCard_code_idx" ON "GiftCard"("code");

-- CreateIndex
CREATE INDEX "GiftCard_expiresAt_idx" ON "GiftCard"("expiresAt");

-- CreateIndex
CREATE INDEX "GiftCardTransaction_giftCardId_idx" ON "GiftCardTransaction"("giftCardId");

-- CreateIndex
CREATE INDEX "GiftCardTransaction_orderId_idx" ON "GiftCardTransaction"("orderId");
