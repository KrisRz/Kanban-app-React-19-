import { pgTable, serial, text, timestamp, pgEnum, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Create status enum
export const statusEnum = pgEnum('status', ['todo', 'in-progress', 'done']);

// Users/Assignees table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role'),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Columns table
export const columns = pgTable('columns', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  order: serial('order').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Tasks table
export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').default('todo'),
  assigneeId: integer('assignee_id').references(() => users.id),
  columnId: integer('column_id').references(() => columns.id, { onDelete: 'cascade' }).notNull(),
  order: integer('order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define the users relations
export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks)
}));

// Define the columns relations
export const columnsRelations = relations(columns, ({ many }) => ({
  tasks: many(tasks)
}));

// Define the tasks relations
export const tasksRelations = relations(tasks, ({ one }) => ({
  assignee: one(users),
  column: one(columns)
})); 