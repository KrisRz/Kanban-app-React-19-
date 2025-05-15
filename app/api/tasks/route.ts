import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tasks } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const data = await db.query.tasks.findMany({
      with: {
        assignee: true,
        column: true
      }
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newTask = await db.insert(tasks).values({
      title: body.title,
      description: body.description,
      status: body.status,
      assigneeId: body.assigneeId,
      columnId: body.columnId,
      order: body.order || 0
    }).returning();
    
    return NextResponse.json(newTask[0]);
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
} 