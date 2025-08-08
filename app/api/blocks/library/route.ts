import { NextRequest, NextResponse } from 'next/server';

// Simplified version to avoid chunk loading errors
export async function GET(request: NextRequest) {
  return NextResponse.json({
    blocks: [],
    total: 0,
    hasMore: false
  });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}