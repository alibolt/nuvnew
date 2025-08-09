import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

async function getFileTree(dirPath: string, basePath: string = ''): Promise<FileNode[]> {
  const items = await fs.readdir(dirPath, { withFileTypes: true });
  const files: FileNode[] = [];
  
  for (const item of items) {
    // Skip node_modules, .git, etc.
    if (item.name.startsWith('.') || item.name === 'node_modules') continue;
    
    const itemPath = path.join(dirPath, item.name);
    const relativePath = basePath ? `${basePath}/${item.name}` : item.name;
    
    if (item.isDirectory()) {
      const children = await getFileTree(itemPath, relativePath);
      files.push({
        name: item.name,
        path: relativePath,
        type: 'directory',
        children
      });
    } else {
      files.push({
        name: item.name,
        path: relativePath,
        type: 'file'
      });
    }
  }
  
  return files.sort((a, b) => {
    // Directories first, then files
    if (a.type === 'directory' && b.type === 'file') return -1;
    if (a.type === 'file' && b.type === 'directory') return 1;
    return a.name.localeCompare(b.name);
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; themeCode: string }> }
) {
  try {
    const { subdomain, themeCode } = await params;
    
    // Temporarily bypass auth for testing
    const session = await getServerSession(authOptions);
    let store;
    
    if (session?.user?.id) {
      // Verify store ownership
      store = await prisma.store.findFirst({
        where: {
          subdomain,
          userId: session.user.id,
        },
      });
    } else {
      // For testing: allow access without auth
      store = await prisma.store.findFirst({
        where: {
          subdomain,
        },
      });
    }

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Prioritize source themes directory for code files
    const srcThemePath = path.join(process.cwd(), 'themes', themeCode);
    const publicThemePath = path.join(process.cwd(), 'public', 'themes', themeCode);
    
    let themePath: string;
    try {
      // Check source themes first (has all the code files)
      await fs.access(srcThemePath);
      themePath = srcThemePath;
    } catch {
      try {
        // Fallback to public themes (usually only has JSON configs)
        await fs.access(publicThemePath);
        themePath = publicThemePath;
      } catch {
        return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
      }
    }

    const files = await getFileTree(themePath);
    
    console.log('[Files API] Theme path:', themePath);
    console.log('[Files API] Files found:', files.length);
    console.log('[Files API] File types:', files.map(f => `${f.name} (${f.type})`));
    
    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error loading theme files:', error);
    return NextResponse.json(
      { error: 'Failed to load theme files' },
      { status: 500 }
    );
  }
}