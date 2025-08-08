-- AlterTable
ALTER TABLE "StoreSettings" ADD COLUMN "abandonedCartRecovery" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "abandonedCarts" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "activityLogs" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "apiKeys" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "exportJobs" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "importJobs" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "inventory" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "marketingAutomations" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "marketingCampaigns" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "mediaLibrary" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "returnPolicy" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "returns" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "seoSettings" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "staffMembers" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "urlRedirects" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "webhooks" JSONB;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StoreTemplate" (
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
    "hasEmptySections" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StoreTemplate_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StoreTemplate_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_StoreTemplate" ("createdAt", "description", "enabled", "id", "isDefault", "name", "seoSettings", "settings", "storeId", "templateType", "themeId", "updatedAt") SELECT "createdAt", "description", "enabled", "id", "isDefault", "name", "seoSettings", "settings", "storeId", "templateType", "themeId", "updatedAt" FROM "StoreTemplate";
DROP TABLE "StoreTemplate";
ALTER TABLE "new_StoreTemplate" RENAME TO "StoreTemplate";
CREATE INDEX "StoreTemplate_storeId_templateType_idx" ON "StoreTemplate"("storeId", "templateType");
CREATE INDEX "StoreTemplate_storeId_isDefault_idx" ON "StoreTemplate"("storeId", "isDefault");
CREATE UNIQUE INDEX "StoreTemplate_storeId_templateType_name_key" ON "StoreTemplate"("storeId", "templateType", "name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
