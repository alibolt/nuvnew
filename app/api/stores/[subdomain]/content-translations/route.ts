import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get content type from query params
    const { searchParams } = new URL(req.url);
    const contentType = searchParams.get('type') || 'all';
    const contentId = searchParams.get('contentId');
    const language = searchParams.get('language');

    const result: any = {};

    // If contentId is provided, get specific item
    if (contentId) {
      switch (contentType) {
        case 'product':
          const product = await prisma.product.findUnique({
            where: { id: contentId },
            include: { translations: true }
          });
          result.products = product ? [product] : [];
          break;
        case 'category':
          const category = await prisma.category.findUnique({
            where: { id: contentId },
            include: { translations: true }
          });
          result.categories = category ? [category] : [];
          break;
        case 'page':
          const page = await prisma.page.findUnique({
            where: { id: contentId },
            include: { translations: true }
          });
          result.pages = page ? [page] : [];
          break;
        case 'blogPost':
          const blogPost = await prisma.blogPost.findUnique({
            where: { id: contentId },
            include: { translations: true }
          });
          result.blogPosts = blogPost ? [blogPost] : [];
          break;
        case 'collection':
          const collection = await prisma.collection.findUnique({
            where: { id: contentId }
          });
          // Format collection data to look like it has translations
          if (collection) {
            const formattedCollection = {
              ...collection,
              translations: []
            };
            // Check for existing translations in language fields
            const languages = ['tr', 'en', 'de', 'fr', 'es'];
            languages.forEach(lang => {
              if ((collection as any)[`title_${lang}`] || (collection as any)[`description_${lang}`]) {
                formattedCollection.translations.push({
                  language: lang,
                  title: (collection as any)[`title_${lang}`] || collection.title,
                  description: (collection as any)[`description_${lang}`] || collection.description
                });
              }
            });
            result.collections = [formattedCollection];
          } else {
            result.collections = [];
          }
          break;
      }
      return NextResponse.json(result);
    }

    // Otherwise get all items
    // Get product translations
    if (contentType === 'all' || contentType === 'product' || contentType === 'products') {
      const products = await prisma.product.findMany({
        where: { storeId: store.id },
        include: {
          translations: language ? {
            where: { language }
          } : true
        }
      });
      result.products = products;
    }

    // Get category translations
    if (contentType === 'all' || contentType === 'category' || contentType === 'categories') {
      const categories = await prisma.category.findMany({
        where: { storeId: store.id },
        include: {
          translations: language ? {
            where: { language }
          } : true
        }
      });
      result.categories = categories;
    }

    // Get page translations
    if (contentType === 'all' || contentType === 'page' || contentType === 'pages') {
      const pages = await prisma.page.findMany({
        where: { storeId: store.id },
        include: {
          translations: language ? {
            where: { language }
          } : true
        }
      });
      result.pages = pages;
    }

    // Get blog post translations
    if (contentType === 'all' || contentType === 'blogPost' || contentType === 'blogPosts') {
      const blogPosts = await prisma.blogPost.findMany({
        where: { storeId: store.id },
        include: {
          translations: language ? {
            where: { language }
          } : true
        }
      });
      result.blogPosts = blogPosts;
    }

    // Get collection translations
    if (contentType === 'all' || contentType === 'collection' || contentType === 'collections') {
      const collections = await prisma.collection.findMany({
        where: { storeId: store.id }
      });
      
      // Format collections to include translations from language fields
      result.collections = collections.map(collection => {
        const formattedCollection = {
          ...collection,
          translations: []
        };
        
        const languages = ['tr', 'en', 'de', 'fr', 'es'];
        languages.forEach(lang => {
          if ((collection as any)[`title_${lang}`] || (collection as any)[`description_${lang}`]) {
            formattedCollection.translations.push({
              language: lang,
              title: (collection as any)[`title_${lang}`] || collection.title,
              description: (collection as any)[`description_${lang}`] || collection.description
            });
          }
        });
        
        return formattedCollection;
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching content translations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content translations' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const body = await req.json();
    const { contentType, contentId, language, translations } = body;

    let result;

    switch (contentType) {
      case 'product':
        // Check if translation exists
        const existingProductTranslation = await prisma.productTranslation.findUnique({
          where: {
            productId_language: {
              productId: contentId,
              language
            }
          }
        });

        // Handle single field updates - merge with existing data
        const productData = existingProductTranslation ? {
          name: translations.name !== undefined ? translations.name : 
                translations.title !== undefined ? translations.title : existingProductTranslation.name,
          description: translations.description !== undefined ? translations.description : existingProductTranslation.description
        } : {
          name: translations.name || translations.title || '',
          description: translations.description || ''
        };

        if (existingProductTranslation) {
          // Update existing
          result = await prisma.productTranslation.update({
            where: { id: existingProductTranslation.id },
            data: productData
          });
        } else {
          // Create new
          result = await prisma.productTranslation.create({
            data: {
              productId: contentId,
              language,
              ...productData
            }
          });
        }
        break;

      case 'category':
        const existingCategoryTranslation = await prisma.categoryTranslation.findUnique({
          where: {
            categoryId_language: {
              categoryId: contentId,
              language
            }
          }
        });

        // Handle single field updates
        const categoryData = existingCategoryTranslation ? {
          name: translations.name !== undefined ? translations.name : existingCategoryTranslation.name,
          description: translations.description !== undefined ? translations.description : existingCategoryTranslation.description
        } : {
          name: translations.name || '',
          description: translations.description || ''
        };

        if (existingCategoryTranslation) {
          result = await prisma.categoryTranslation.update({
            where: { id: existingCategoryTranslation.id },
            data: categoryData
          });
        } else {
          result = await prisma.categoryTranslation.create({
            data: {
              categoryId: contentId,
              language,
              ...categoryData
            }
          });
        }
        break;

      case 'page':
        const existingPageTranslation = await prisma.pageTranslation.findUnique({
          where: {
            pageId_language: {
              pageId: contentId,
              language
            }
          }
        });

        // Handle single field updates
        const pageData = existingPageTranslation ? {
          title: translations.title !== undefined ? translations.title : existingPageTranslation.title,
          content: translations.content !== undefined ? translations.content : existingPageTranslation.content,
          seoTitle: translations.seoTitle !== undefined ? translations.seoTitle : existingPageTranslation.seoTitle,
          seoDescription: translations.seoDescription !== undefined ? translations.seoDescription : existingPageTranslation.seoDescription
        } : {
          title: translations.title || '',
          content: translations.content || '',
          seoTitle: translations.seoTitle || null,
          seoDescription: translations.seoDescription || null
        };

        if (existingPageTranslation) {
          result = await prisma.pageTranslation.update({
            where: { id: existingPageTranslation.id },
            data: pageData
          });
        } else {
          result = await prisma.pageTranslation.create({
            data: {
              pageId: contentId,
              language,
              ...pageData
            }
          });
        }
        break;

      case 'blogPost':
        const existingBlogPostTranslation = await prisma.blogPostTranslation.findUnique({
          where: {
            blogPostId_language: {
              blogPostId: contentId,
              language
            }
          }
        });

        // Handle single field updates
        const blogPostData = existingBlogPostTranslation ? {
          title: translations.title !== undefined ? translations.title : existingBlogPostTranslation.title,
          content: translations.content !== undefined ? translations.content : existingBlogPostTranslation.content,
          excerpt: translations.excerpt !== undefined ? translations.excerpt : existingBlogPostTranslation.excerpt,
          seoTitle: translations.seoTitle !== undefined ? translations.seoTitle : existingBlogPostTranslation.seoTitle,
          seoDescription: translations.seoDescription !== undefined ? translations.seoDescription : existingBlogPostTranslation.seoDescription
        } : {
          title: translations.title || '',
          content: translations.content || '',
          excerpt: translations.excerpt || null,
          seoTitle: translations.seoTitle || null,
          seoDescription: translations.seoDescription || null
        };

        if (existingBlogPostTranslation) {
          result = await prisma.blogPostTranslation.update({
            where: { id: existingBlogPostTranslation.id },
            data: blogPostData
          });
        } else {
          result = await prisma.blogPostTranslation.create({
            data: {
              blogPostId: contentId,
              language,
              ...blogPostData
            }
          });
        }
        break;

      case 'collection':
        // Collection might not have a translation table, check schema
        const collection = await prisma.collection.findUnique({
          where: { id: contentId }
        });

        if (!collection) {
          return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
        }

        // Update collection directly with language-specific fields
        result = await prisma.collection.update({
          where: { id: contentId },
          data: {
            [`title_${language}`]: translations.title || translations.name,
            [`description_${language}`]: translations.description
          }
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving content translation:', error);
    return NextResponse.json(
      { error: 'Failed to save content translation' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const translationId = searchParams.get('id');
    const contentType = searchParams.get('type');

    if (!translationId || !contentType) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    switch (contentType) {
      case 'product':
        await prisma.productTranslation.delete({
          where: { id: translationId }
        });
        break;
      case 'category':
        await prisma.categoryTranslation.delete({
          where: { id: translationId }
        });
        break;
      case 'page':
        await prisma.pageTranslation.delete({
          where: { id: translationId }
        });
        break;
      case 'blogPost':
        await prisma.blogPostTranslation.delete({
          where: { id: translationId }
        });
        break;
      default:
        return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting content translation:', error);
    return NextResponse.json(
      { error: 'Failed to delete content translation' },
      { status: 500 }
    );
  }
}