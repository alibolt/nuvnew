import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

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

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'Invalid CSV format' }, { status: 400 });
    }

    // Parse CSV
    const headers = lines[0].split(',').map(h => h.trim());
    const requiredHeaders = ['Type', 'ID', 'Field', 'Language', 'Original', 'Translation'];
    
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      return NextResponse.json(
        { error: `Missing required headers: ${missingHeaders.join(', ')}` },
        { status: 400 }
      );
    }

    let importedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        if (values.length !== headers.length) continue;

        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });

        const { Type, ID, Field, Language, Translation } = row;
        
        if (!Translation || Translation.trim() === '') continue;

        switch (Type) {
          case 'Product':
            await updateProductTranslation(ID, Language, Field, Translation);
            break;
          case 'Category':
            await updateCategoryTranslation(ID, Language, Field, Translation);
            break;
          case 'Page':
            await updatePageTranslation(ID, Language, Field, Translation);
            break;
          case 'BlogPost':
            await updateBlogPostTranslation(ID, Language, Field, Translation);
            break;
          default:
            throw new Error(`Unknown type: ${Type}`);
        }

        importedCount++;
      } catch (error) {
        errorCount++;
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      imported: importedCount,
      errors: errorCount,
      errorDetails: errors.slice(0, 10) // Limit error details
    });

  } catch (error) {
    console.error('Error importing content translations:', error);
    return NextResponse.json(
      { error: 'Failed to import content translations' },
      { status: 500 }
    );
  }
}

// Helper function to parse CSV line with quoted values
function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

// Helper functions to update translations
async function updateProductTranslation(productId: string, language: string, field: string, value: string) {
  const existing = await prisma.productTranslation.findUnique({
    where: { productId_language: { productId, language } }
  });

  const data: any = { [field]: value };

  if (existing) {
    await prisma.productTranslation.update({
      where: { id: existing.id },
      data
    });
  } else {
    // Get original product data for required fields
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) throw new Error('Product not found');

    await prisma.productTranslation.create({
      data: {
        productId,
        language,
        name: field === 'name' ? value : product.name,
        description: field === 'description' ? value : product.description,
        metaTitle: field === 'metaTitle' ? value : product.metaTitle,
        metaDescription: field === 'metaDescription' ? value : product.metaDescription
      }
    });
  }
}

async function updateCategoryTranslation(categoryId: string, language: string, field: string, value: string) {
  const existing = await prisma.categoryTranslation.findUnique({
    where: { categoryId_language: { categoryId, language } }
  });

  const data: any = { [field]: value };

  if (existing) {
    await prisma.categoryTranslation.update({
      where: { id: existing.id },
      data
    });
  } else {
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });
    
    if (!category) throw new Error('Category not found');

    await prisma.categoryTranslation.create({
      data: {
        categoryId,
        language,
        name: field === 'name' ? value : category.name,
        description: field === 'description' ? value : category.description
      }
    });
  }
}

async function updatePageTranslation(pageId: string, language: string, field: string, value: string) {
  const existing = await prisma.pageTranslation.findUnique({
    where: { pageId_language: { pageId, language } }
  });

  const data: any = { [field]: value };

  if (existing) {
    await prisma.pageTranslation.update({
      where: { id: existing.id },
      data
    });
  } else {
    const page = await prisma.page.findUnique({
      where: { id: pageId }
    });
    
    if (!page) throw new Error('Page not found');

    await prisma.pageTranslation.create({
      data: {
        pageId,
        language,
        title: field === 'title' ? value : page.title,
        content: field === 'content' ? value : page.content,
        seoTitle: field === 'seoTitle' ? value : page.seoTitle,
        seoDescription: field === 'seoDescription' ? value : page.seoDescription
      }
    });
  }
}

async function updateBlogPostTranslation(blogPostId: string, language: string, field: string, value: string) {
  const existing = await prisma.blogPostTranslation.findUnique({
    where: { blogPostId_language: { blogPostId, language } }
  });

  const data: any = { [field]: value };

  if (existing) {
    await prisma.blogPostTranslation.update({
      where: { id: existing.id },
      data
    });
  } else {
    const blogPost = await prisma.blogPost.findUnique({
      where: { id: blogPostId }
    });
    
    if (!blogPost) throw new Error('Blog post not found');

    await prisma.blogPostTranslation.create({
      data: {
        blogPostId,
        language,
        title: field === 'title' ? value : blogPost.title,
        excerpt: field === 'excerpt' ? value : blogPost.excerpt,
        content: field === 'content' ? value : blogPost.content,
        seoTitle: field === 'seoTitle' ? value : blogPost.seoTitle,
        seoDescription: field === 'seoDescription' ? value : blogPost.seoDescription
      }
    });
  }
}