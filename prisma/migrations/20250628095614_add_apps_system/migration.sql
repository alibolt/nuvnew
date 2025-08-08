-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Page_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Blog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Blog_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blogId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "featuredImage" TEXT,
    "author" TEXT NOT NULL,
    "tags" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BlogPost_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BlogPost_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "App" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "category" TEXT NOT NULL,
    "developer" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "pricing" JSONB,
    "features" JSONB NOT NULL,
    "permissions" JSONB NOT NULL,
    "webhooks" JSONB,
    "settings" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AppInstall" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "settings" JSONB,
    "apiKeys" JSONB,
    "webhookUrls" JSONB,
    "permissions" JSONB,
    "data" JSONB,
    "installedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastUsedAt" DATETIME,
    CONSTRAINT "AppInstall_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AppInstall_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ShopifyImport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appInstallId" TEXT NOT NULL,
    "storeUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "data" JSONB,
    "mappingConfig" JSONB,
    "importStats" JSONB,
    "error" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "ShopifyImport_appInstallId_fkey" FOREIGN KEY ("appInstallId") REFERENCES "AppInstall" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Page_storeId_isPublished_idx" ON "Page"("storeId", "isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "Page_storeId_slug_key" ON "Page"("storeId", "slug");

-- CreateIndex
CREATE INDEX "Blog_storeId_idx" ON "Blog"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Blog_storeId_slug_key" ON "Blog"("storeId", "slug");

-- CreateIndex
CREATE INDEX "BlogPost_storeId_isPublished_idx" ON "BlogPost"("storeId", "isPublished");

-- CreateIndex
CREATE INDEX "BlogPost_blogId_isPublished_idx" ON "BlogPost"("blogId", "isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_blogId_slug_key" ON "BlogPost"("blogId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "App_code_key" ON "App"("code");

-- CreateIndex
CREATE INDEX "AppInstall_storeId_status_idx" ON "AppInstall"("storeId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AppInstall_storeId_appId_key" ON "AppInstall"("storeId", "appId");

-- CreateIndex
CREATE INDEX "ShopifyImport_appInstallId_status_idx" ON "ShopifyImport"("appInstallId", "status");
