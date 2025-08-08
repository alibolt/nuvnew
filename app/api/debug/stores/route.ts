import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      select: {
        id: true,
        subdomain: true,
        name: true,
      },
    });
    
    return NextResponse.json({
      success: true,
      stores,
      count: stores.length,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}