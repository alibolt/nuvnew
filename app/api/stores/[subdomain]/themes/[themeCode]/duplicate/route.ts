import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

async function copyDirectory(src: string, dest: string) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; themeCode: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subdomain, themeCode } = await params;
    const { name } = await request.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Theme name is required' }, { status: 400 });
    }
    
    // Sanitize theme name for use as directory name
    const newThemeCode = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain,
        userId: session.user.id,
      },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Check if theme exists
    const srcThemePath = path.join(process.cwd(), 'themes', themeCode);
    
    try {
      await fs.access(srcThemePath);
    } catch {
      return NextResponse.json({ error: 'Source theme not found' }, { status: 404 });
    }
    
    // Check if new theme already exists
    const newThemePath = path.join(process.cwd(), 'themes', newThemeCode);
    
    try {
      await fs.access(newThemePath);
      return NextResponse.json({ error: 'Theme with this name already exists' }, { status: 400 });
    } catch {
      // Good, the directory doesn't exist
    }
    
    // Copy theme directory
    await copyDirectory(srcThemePath, newThemePath);
    
    // Update theme metadata
    const themeJsonPath = path.join(newThemePath, 'theme.json');
    try {
      const themeJson = JSON.parse(await fs.readFile(themeJsonPath, 'utf-8'));
      themeJson.name = name;
      themeJson.code = newThemeCode;
      themeJson.duplicatedFrom = themeCode;
      themeJson.duplicatedAt = new Date().toISOString();
      await fs.writeFile(themeJsonPath, JSON.stringify(themeJson, null, 2));
    } catch (error) {
      console.warn('Failed to update theme.json:', error);
    }
    
    // Update index.ts
    const indexPath = path.join(newThemePath, 'index.ts');
    try {
      let indexContent = await fs.readFile(indexPath, 'utf-8');
      indexContent = indexContent.replace(
        /name:\s*['"`].*?['"`]/,
        `name: '${name}'`
      );
      indexContent = indexContent.replace(
        /code:\s*['"`].*?['"`]/,
        `code: '${newThemeCode}'`
      );
      await fs.writeFile(indexPath, indexContent);
    } catch (error) {
      console.warn('Failed to update index.ts:', error);
    }
    
    return NextResponse.json({ 
      success: true, 
      themeCode: newThemeCode,
      message: 'Theme duplicated successfully' 
    });
  } catch (error) {
    console.error('Error duplicating theme:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate theme' },
      { status: 500 }
    );
  }
}