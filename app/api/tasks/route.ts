import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tasks, users, columns } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { InferSelectModel } from 'drizzle-orm';

// Define types based on the schema
type User = InferSelectModel<typeof users>;
type Column = InferSelectModel<typeof columns>;
type Task = InferSelectModel<typeof tasks>;

export async function GET() {
  try {
    // Fetch tasks without relations
    const allTasks = await db.select().from(tasks);
    
    // Fetch all users and columns
    const allUsers = await db.select().from(users);
    const allColumns = await db.select().from(columns);
    
    // Map users and columns by ID for quick lookup
    const usersById = Object.fromEntries(allUsers.map((user: User) => [user.id, user]));
    const columnsById = Object.fromEntries(allColumns.map((column: Column) => [column.id, column]));
    
    // Join the data manually
    const data = allTasks.map((task: Task) => ({
      ...task,
      assignee: task.assigneeId ? usersById[task.assigneeId] : null,
      column: columnsById[task.columnId]
    }));
    
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