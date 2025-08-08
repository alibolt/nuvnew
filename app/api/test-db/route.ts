import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      userCount,
      environment: {
        hasDatabase: !!process.env.DATABASE_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasRedis: !!process.env.KV_REST_API_URL,
        nodeEnv: process.env.NODE_ENV,
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        hasDatabase: !!process.env.DATABASE_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasRedis: !!process.env.KV_REST_API_URL,
        nodeEnv: process.env.NODE_ENV,
      }
    }, { status: 500 });
  }
}