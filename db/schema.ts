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
  status: statusEnum('status').notNull().default('todo'),
  assigneeId: integer('assignee_id').references(() => users.id),
  columnId: integer('column_id').notNull().references(() => columns.id, { onDelete: 'cascade' }),
  order: serial('order').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Define the users relations
export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks, {
    fields: [users.id],
    references: [tasks.assigneeId]
  })
}));

// Define the columns relations
export const columnsRelations = relations(columns, ({ many }) => ({
  tasks: many(tasks, {
    fields: [columns.id],
    references: [tasks.columnId]
  })
}));

// Define the tasks relations
export const tasksRelations = relations(tasks, ({ one }) => ({
  column: one(columns, {
    fields: [tasks.columnId],
    references: [columns.id]
  }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id]
  })
})); 