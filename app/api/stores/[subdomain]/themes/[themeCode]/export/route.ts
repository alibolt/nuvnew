import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; themeCode: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subdomain, themeCode } = await params;
    
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
    const publicThemePath = path.join(process.cwd(), 'public', 'themes', themeCode);
    const srcThemePath = path.join(process.cwd(), 'themes', themeCode);
    
    let themePath: string;
    if (fs.existsSync(publicThemePath)) {
      themePath = publicThemePath;
    } else if (fs.existsSync(srcThemePath)) {
      themePath = srcThemePath;
    } else {
      return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
    }

    // Create a stream for the zip
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Create chunks array to collect the zip data
    const chunks: Buffer[] = [];
    
    archive.on('data', (chunk) => {
      chunks.push(chunk);
    });

    archive.on('error', (err) => {
      throw err;
    });

    // Add theme directory to archive
    archive.directory(themePath, false);
    
    // Add theme metadata
    const metadata = {
      name: themeCode,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      store: {
        subdomain: store.subdomain,
        name: store.name
      }
    };
    
    archive.append(JSON.stringify(metadata, null, 2), { name: 'theme.meta.json' });
    
    // Finalize the archive
    await archive.finalize();
    
    // Wait for all data to be collected
    await new Promise((resolve) => {
      archive.on('end', resolve);
    });

    // Combine all chunks into a single buffer
    const buffer = Buffer.concat(chunks);

    // Return the zip file as a response
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${themeCode}-theme-${Date.now()}.zip"`,
      },
    });
  } catch (error) {
    console.error('Error exporting theme:', error);
    return NextResponse.json(
      { error: 'Failed to export theme' },
      { status: 500 }
    );
  }
}