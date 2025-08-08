-- CreateTable
CREATE TABLE "PaymentSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    
    -- Stripe Settings
    "stripeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "stripePublicKey" TEXT,
    "stripeSecretKey" TEXT, -- Will be encrypted before storing
    "stripeWebhookSecret" TEXT, -- Will be encrypted before storing
    "stripeTestMode" BOOLEAN NOT NULL DEFAULT true,
    
    -- PayPal Settings
    "paypalEnabled" BOOLEAN NOT NULL DEFAULT false,
    "paypalClientId" TEXT,
    "paypalClientSecret" TEXT, -- Will be encrypted before storing
    "paypalTestMode" BOOLEAN NOT NULL DEFAULT true,
    
    -- General Payment Settings
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "captureMethod" TEXT NOT NULL DEFAULT 'automatic',
    "statementDescriptor" TEXT,
    "saveCards" BOOLEAN NOT NULL DEFAULT true,
    "requireCVV" BOOLEAN NOT NULL DEFAULT true,
    "requirePostalCode" BOOLEAN NOT NULL DEFAULT false,
    
    -- Digital Wallets
    "enableApplePay" BOOLEAN NOT NULL DEFAULT true,
    "enableGooglePay" BOOLEAN NOT NULL DEFAULT true,
    
    -- Tax Settings
    "taxEnabled" BOOLEAN NOT NULL DEFAULT false,
    "taxInclusive" BOOLEAN NOT NULL DEFAULT false,
    "defaultTaxRate" REAL NOT NULL DEFAULT 0,
    
    -- Test Mode Settings
    "testModeEnabled" BOOLEAN NOT NULL DEFAULT true,
    "testModeShowBanner" BOOLEAN NOT NULL DEFAULT true,
    "testModeAllowTestCards" BOOLEAN NOT NULL DEFAULT true,
    
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    
    CONSTRAINT "PaymentSettings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentSettings_storeId_key" ON "PaymentSettings"("storeId");

-- CreateTable for Tax Regions
CREATE TABLE "TaxRegion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paymentSettingsId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "rate" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    
    CONSTRAINT "TaxRegion_paymentSettingsId_fkey" FOREIGN KEY ("paymentSettingsId") REFERENCES "PaymentSettings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TaxRegion_paymentSettingsId_idx" ON "TaxRegion"("paymentSettingsId");