import fs from 'fs';
import path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';

const streamPipeline = promisify(pipeline);

export async function downloadImage(imageUrl: string, subdomain: string): Promise<string | null> {
  try {
    // Clean and validate URL
    if (!imageUrl || !imageUrl.startsWith('http')) {
      return null;
    }

    // Extract filename from URL
    const urlParts = new URL(imageUrl);
    const pathParts = urlParts.pathname.split('/');
    let filename = pathParts[pathParts.length - 1];

    // If no filename or no extension, generate one
    if (!filename || !filename.includes('.')) {
      filename = `${Date.now()}.jpg`;
    }

    // Remove query parameters from filename
    filename = filename.split('?')[0];

    // Ensure filename has a valid image extension
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const hasValidExtension = validExtensions.some(ext => filename.toLowerCase().endsWith(ext));
    if (!hasValidExtension) {
      filename += '.jpg';
    }

    // Create unique filename to avoid collisions
    const uniqueFilename = `${subdomain}-${Date.now()}-${filename}`;

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', subdomain);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Full path for the file
    const filePath = path.join(uploadDir, uniqueFilename);

    // Download the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    // Save to file
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    // Return the public URL path
    return `/uploads/${subdomain}/${uniqueFilename}`;
  } catch (error) {
    console.error('Error downloading image:', imageUrl, error);
    return null;
  }
}

export async function downloadImages(imageUrls: string[], subdomain: string): Promise<string[]> {
  const downloadPromises = imageUrls.map(url => downloadImage(url, subdomain));
  const results = await Promise.all(downloadPromises);
  return results.filter((url): url is string => url !== null);
}