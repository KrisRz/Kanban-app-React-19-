import { eq } from 'drizzle-orm';
import { db } from '../index';
import { tasks, columns } from '../schema';

export interface TaskCreate {
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  assigneeId?: string;
  columnId: number;
}

export interface TaskUpdate {
  id: number;
  title?: string;
  description?: string;
  status?: 'todo' | 'in-progress' | 'done';
  assigneeId?: string;
  columnId?: number;
}

export async function getTasks() {
  return await db.select().from(tasks);
}

export async function getTaskById(id: number) {
  return await db.select().from(tasks).where(eq(tasks.id, id));
}

export async function getTasksByColumnId(columnId: number) {
  return await db.select().from(tasks).where(eq(tasks.columnId, columnId));
}

export async function createTask(task: TaskCreate) {
  return await db.insert(tasks).values(task).returning();
}

export async function updateTask(task: TaskUpdate) {
  const { id, ...updateData } = task;
  return await db
    .update(tasks)
    .set({ ...updateData, updatedAt: new Date() })
    .where(eq(tasks.id, id))
    .returning();
}

export async function deleteTask(id: number) {
  return await db.delete(tasks).where(eq(tasks.id, id)).returning();
}

export async function moveTask(id: number, columnId: number) {
  return await db
    .update(tasks)
    .set({ columnId, updatedAt: new Date() })
    .where(eq(tasks.id, id))
    .returning();
} 