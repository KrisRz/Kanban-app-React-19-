import { NextResponse } from 'next/server';
import { db } from '@/db';
import { columns } from '@/db/schema';

export async function GET() {
  try {
    const data = await db.query.columns.findMany({
      orderBy: columns.order
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch columns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch columns' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newColumn = await db.insert(columns).values({
      name: body.name,
      order: body.order || 0
    }).returning();
    
    return NextResponse.json(newColumn[0]);
  } catch (error) {
    console.error('Failed to create column:', error);
    return NextResponse.json(
      { error: 'Failed to create column' },
      { status: 500 }
    );
  }
} 