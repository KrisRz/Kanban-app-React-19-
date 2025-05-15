import { eq } from 'drizzle-orm';
import { db } from '../index';
import { columns } from '../schema';

export interface ColumnCreate {
  name: string;
  order: number;
}

export interface ColumnUpdate {
  id: number;
  name?: string;
  order?: number;
}

export async function getColumns() {
  return await db.select().from(columns).orderBy(columns.order);
}

export async function getColumnById(id: number) {
  return await db.select().from(columns).where(eq(columns.id, id));
}

export async function createColumn(column: ColumnCreate) {
  return await db.insert(columns).values(column).returning();
}

export async function updateColumn(column: ColumnUpdate) {
  const { id, ...updateData } = column;
  return await db
    .update(columns)
    .set({ ...updateData, updatedAt: new Date() })
    .where(eq(columns.id, id))
    .returning();
}

export async function deleteColumn(id: number) {
  return await db.delete(columns).where(eq(columns.id, id)).returning();
} 