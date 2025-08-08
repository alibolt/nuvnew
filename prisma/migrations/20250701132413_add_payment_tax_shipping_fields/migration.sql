-- AlterTable
ALTER TABLE "StoreSettings" ADD COLUMN "emailSettings" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "notificationSettings" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "paymentMethods" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "shippingZones" JSONB;
ALTER TABLE "StoreSettings" ADD COLUMN "taxSettings" JSONB;
