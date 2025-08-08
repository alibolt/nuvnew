import { prisma } from '@/lib/prisma';
import type { Product, ProductVariant, Category, Page, BlogPost } from '@prisma/client';

type ProductWithVariants = Product & {
  variants: ProductVariant[];
  category: Category | null;
};

export class SearchIndexingService {
  /**
   * Index a product for search
   */
  static async indexProduct(product: ProductWithVariants) {
    try {
      // Get lowest price from variants
      const lowestPrice = product.variants.length > 0 
        ? Math.min(...product.variants.map(v => v.price))
        : 0;

      // Build searchable content
      const content = [
        product.name,
        product.description || '',
        product.category?.name || '',
        product.productType,
        ...(product.tags as string[] || []),
        ...product.variants.map(v => v.name),
        product.variants.map(v => v.sku).filter(Boolean).join(' ')
      ].join(' ').toLowerCase();

      // Extract keywords
      const keywords = [
        ...(product.tags as string[] || []),
        product.productType,
        product.category?.name
      ].filter(Boolean).join(', ');

      // Get first image
      const imageUrl = (product.images as string[])?.[0] || null;

      await prisma.searchIndex.upsert({
        where: {
          storeId_entityType_entityId: {
            storeId: product.storeId,
            entityType: 'product',
            entityId: product.id
          }
        },
        create: {
          storeId: product.storeId,
          entityType: 'product',
          entityId: product.id,
          title: product.name,
          content,
          keywords,
          imageUrl,
          price: lowestPrice,
          isActive: product.isActive,
          metadata: {
            categoryId: product.categoryId,
            productType: product.productType,
            variantCount: product.variants.length,
            hasInventory: product.variants.some(v => v.stock > 0)
          }
        },
        update: {
          title: product.name,
          content,
          keywords,
          imageUrl,
          price: lowestPrice,
          isActive: product.isActive,
          metadata: {
            categoryId: product.categoryId,
            productType: product.productType,
            variantCount: product.variants.length,
            hasInventory: product.variants.some(v => v.stock > 0)
          },
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error indexing product:', error);
      throw error;
    }
  }

  /**
   * Index a collection/category for search
   */
  static async indexCategory(category: Category) {
    try {
      const content = [
        category.name,
        category.description || '',
        category.slug
      ].join(' ').toLowerCase();

      await prisma.searchIndex.upsert({
        where: {
          storeId_entityType_entityId: {
            storeId: category.storeId,
            entityType: 'collection',
            entityId: category.id
          }
        },
        create: {
          storeId: category.storeId,
          entityType: 'collection',
          entityId: category.id,
          title: category.name,
          content,
          imageUrl: category.image,
          isActive: true,
          metadata: {
            slug: category.slug,
            type: category.type
          }
        },
        update: {
          title: category.name,
          content,
          imageUrl: category.image,
          isActive: true,
          metadata: {
            slug: category.slug,
            type: category.type
          },
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error indexing category:', error);
      throw error;
    }
  }

  /**
   * Index a page for search
   */
  static async indexPage(page: Page) {
    try {
      const content = [
        page.title,
        page.content,
        page.seoDescription || ''
      ].join(' ').toLowerCase();

      await prisma.searchIndex.upsert({
        where: {
          storeId_entityType_entityId: {
            storeId: page.storeId,
            entityType: 'page',
            entityId: page.id
          }
        },
        create: {
          storeId: page.storeId,
          entityType: 'page',
          entityId: page.id,
          title: page.title,
          content,
          isActive: page.isPublished,
          metadata: {
            slug: page.slug
          }
        },
        update: {
          title: page.title,
          content,
          isActive: page.isPublished,
          metadata: {
            slug: page.slug
          },
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error indexing page:', error);
      throw error;
    }
  }

  /**
   * Index a blog post for search
   */
  static async indexBlogPost(blogPost: BlogPost) {
    try {
      const content = [
        blogPost.title,
        blogPost.excerpt || '',
        blogPost.content,
        blogPost.tags || '',
        blogPost.author
      ].join(' ').toLowerCase();

      const keywords = blogPost.tags || '';

      await prisma.searchIndex.upsert({
        where: {
          storeId_entityType_entityId: {
            storeId: blogPost.storeId,
            entityType: 'blog_post',
            entityId: blogPost.id
          }
        },
        create: {
          storeId: blogPost.storeId,
          entityType: 'blog_post',
          entityId: blogPost.id,
          title: blogPost.title,
          content,
          keywords,
          imageUrl: blogPost.featuredImage,
          isActive: blogPost.isPublished,
          metadata: {
            slug: blogPost.slug,
            author: blogPost.author,
            blogId: blogPost.blogId,
            publishedAt: blogPost.publishedAt
          }
        },
        update: {
          title: blogPost.title,
          content,
          keywords,
          imageUrl: blogPost.featuredImage,
          isActive: blogPost.isPublished,
          metadata: {
            slug: blogPost.slug,
            author: blogPost.author,
            blogId: blogPost.blogId,
            publishedAt: blogPost.publishedAt
          },
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error indexing blog post:', error);
      throw error;
    }
  }

  /**
   * Remove an item from the search index
   */
  static async removeFromIndex(storeId: string, entityType: string, entityId: string) {
    try {
      await prisma.searchIndex.delete({
        where: {
          storeId_entityType_entityId: {
            storeId,
            entityType,
            entityId
          }
        }
      });
    } catch (error) {
      // If the record doesn't exist, that's ok
      if ((error as any).code !== 'P2025') {
        console.error('Error removing from search index:', error);
        throw error;
      }
    }
  }

  /**
   * Bulk index products
   */
  static async bulkIndexProducts(storeId: string) {
    try {
      const products = await prisma.product.findMany({
        where: { storeId },
        include: {
          variants: true,
          category: true
        }
      });

      for (const product of products) {
        await this.indexProduct(product);
      }

      return products.length;
    } catch (error) {
      console.error('Error bulk indexing products:', error);
      throw error;
    }
  }

  /**
   * Rebuild entire search index for a store
   */
  static async rebuildIndex(storeId: string) {
    try {
      // Clear existing index
      await prisma.searchIndex.deleteMany({
        where: { storeId }
      });

      // Index all products
      const products = await prisma.product.findMany({
        where: { storeId },
        include: {
          variants: true,
          category: true
        }
      });

      for (const product of products) {
        await this.indexProduct(product);
      }

      // Index all categories
      const categories = await prisma.category.findMany({
        where: { storeId }
      });

      for (const category of categories) {
        await this.indexCategory(category);
      }

      // Index all pages
      const pages = await prisma.page.findMany({
        where: { storeId }
      });

      for (const page of pages) {
        await this.indexPage(page);
      }

      // Index all blog posts
      const blogPosts = await prisma.blogPost.findMany({
        where: { storeId }
      });

      for (const blogPost of blogPosts) {
        await this.indexBlogPost(blogPost);
      }

      return {
        products: products.length,
        categories: categories.length,
        pages: pages.length,
        blogPosts: blogPosts.length
      };
    } catch (error) {
      console.error('Error rebuilding search index:', error);
      throw error;
    }
  }

  /**
   * Update popularity score for a search result
   */
  static async incrementPopularity(storeId: string, entityType: string, entityId: string) {
    try {
      await prisma.searchIndex.update({
        where: {
          storeId_entityType_entityId: {
            storeId,
            entityType,
            entityId
          }
        },
        data: {
          popularity: {
            increment: 1
          }
        }
      });
    } catch (error) {
      console.error('Error updating popularity:', error);
    }
  }
}