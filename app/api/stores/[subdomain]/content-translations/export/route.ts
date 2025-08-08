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
      },
      include: {
        storeSettings: true
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get enabled languages
    const languageSettings = store.storeSettings?.languageSettings as any;
    const enabledLanguages = languageSettings?.enabledLanguages || ['en'];

    // Prepare CSV content
    let csv = 'Type,ID,Field,Language,Original,Translation\n';

    // Export products
    const products = await prisma.product.findMany({
      where: { storeId: store.id },
      include: { translations: true }
    });

    for (const product of products) {
      for (const lang of enabledLanguages) {
        const translation = product.translations.find(t => t.language === lang);
        
        // Name field
        csv += `Product,${product.id},name,${lang},"${product.name}","${translation?.name || ''}"\n`;
        
        // Description field
        if (product.description) {
          csv += `Product,${product.id},description,${lang},"${product.description.replace(/"/g, '""')}","${translation?.description?.replace(/"/g, '""') || ''}"\n`;
        }
        
        // Meta title
        if (product.metaTitle) {
          csv += `Product,${product.id},metaTitle,${lang},"${product.metaTitle}","${translation?.metaTitle || ''}"\n`;
        }
        
        // Meta description
        if (product.metaDescription) {
          csv += `Product,${product.id},metaDescription,${lang},"${product.metaDescription}","${translation?.metaDescription || ''}"\n`;
        }
      }
    }

    // Export categories
    const categories = await prisma.category.findMany({
      where: { storeId: store.id },
      include: { translations: true }
    });

    for (const category of categories) {
      for (const lang of enabledLanguages) {
        const translation = category.translations.find(t => t.language === lang);
        
        // Name field
        csv += `Category,${category.id},name,${lang},"${category.name}","${translation?.name || ''}"\n`;
        
        // Description field
        if (category.description) {
          csv += `Category,${category.id},description,${lang},"${category.description.replace(/"/g, '""')}","${translation?.description?.replace(/"/g, '""') || ''}"\n`;
        }
      }
    }

    // Export pages
    const pages = await prisma.page.findMany({
      where: { storeId: store.id },
      include: { translations: true }
    });

    for (const page of pages) {
      for (const lang of enabledLanguages) {
        const translation = page.translations.find(t => t.language === lang);
        
        // Title field
        csv += `Page,${page.id},title,${lang},"${page.title}","${translation?.title || ''}"\n`;
        
        // Content field
        csv += `Page,${page.id},content,${lang},"${page.content.replace(/"/g, '""')}","${translation?.content?.replace(/"/g, '""') || ''}"\n`;
        
        // SEO title
        if (page.seoTitle) {
          csv += `Page,${page.id},seoTitle,${lang},"${page.seoTitle}","${translation?.seoTitle || ''}"\n`;
        }
        
        // SEO description
        if (page.seoDescription) {
          csv += `Page,${page.id},seoDescription,${lang},"${page.seoDescription}","${translation?.seoDescription || ''}"\n`;
        }
      }
    }

    // Export blog posts
    const blogPosts = await prisma.blogPost.findMany({
      where: { storeId: store.id },
      include: { translations: true }
    });

    for (const post of blogPosts) {
      for (const lang of enabledLanguages) {
        const translation = post.translations.find(t => t.language === lang);
        
        // Title field
        csv += `BlogPost,${post.id},title,${lang},"${post.title}","${translation?.title || ''}"\n`;
        
        // Excerpt field
        if (post.excerpt) {
          csv += `BlogPost,${post.id},excerpt,${lang},"${post.excerpt.replace(/"/g, '""')}","${translation?.excerpt?.replace(/"/g, '""') || ''}"\n`;
        }
        
        // Content field
        csv += `BlogPost,${post.id},content,${lang},"${post.content.replace(/"/g, '""')}","${translation?.content?.replace(/"/g, '""') || ''}"\n`;
        
        // SEO title
        if (post.seoTitle) {
          csv += `BlogPost,${post.id},seoTitle,${lang},"${post.seoTitle}","${translation?.seoTitle || ''}"\n`;
        }
        
        // SEO description
        if (post.seoDescription) {
          csv += `BlogPost,${post.id},seoDescription,${lang},"${post.seoDescription}","${translation?.seoDescription || ''}"\n`;
        }
      }
    }

    // Return CSV as downloadable file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="content-translations-${store.subdomain}-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('Error exporting content translations:', error);
    return NextResponse.json(
      { error: 'Failed to export content translations' },
      { status: 500 }
    );
  }
}