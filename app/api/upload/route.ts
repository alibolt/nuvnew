import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return apiResponse.badRequest('No file provided');
    }

    // Check if we're in production (Vercel)
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      // In production, we'll use a placeholder URL
      // You should integrate with Cloudinary, AWS S3, or similar service
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const filename = `${uniqueSuffix}-${file.name}`;
      
      // For now, return a placeholder URL in production
      // TODO: Replace with actual cloud storage integration
      const url = `https://via.placeholder.com/400x400/cccccc/666666?text=${encodeURIComponent(file.name)}`;
      
      console.warn('⚠️ Production file upload needs cloud storage integration!');
      return NextResponse.json({ 
        url,
        warning: 'Using placeholder image - implement cloud storage for production'
      });
    }

    // Development: use local file system
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const filename = `${uniqueSuffix}-${file.name}`;
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename);

    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await writeFile(filepath, buffer);
    } catch (error) {
      // If directory doesn't exist, create it
      const { mkdir } = await import('fs/promises');
      await mkdir(uploadDir, { recursive: true });
      await writeFile(filepath, buffer);
    }

    // Return the URL path
    const url = `/uploads/${filename}`;

    return apiResponse.success(url);
  } catch (error) {
    console.error('[UPLOAD API] Error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}