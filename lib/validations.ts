import { z } from 'zod'

// Schema for task creation and update
export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  description: z.string().nullable(),
  status: z.enum(['todo', 'in-progress', 'done']),
  assigneeId: z.number().nullable(),
  columnId: z.number().positive("Column ID must be a positive number"),
  order: z.number().int("Order must be an integer").nonnegative("Order must be non-negative")
})

// Schema for task creation
export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable(),
  status: z.enum(["todo", "in-progress", "done"]),
  assigneeId: z.number().nullable(),
  columnId: z.number().positive("Column ID must be a positive number"),
  order: z.number().int("Order must be an integer").nonnegative("Order must be non-negative")
})

// Schema for task update (all fields optional)
export const updateTaskSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable(),
  status: z.enum(["todo", "in-progress", "done"]),
  assigneeId: z.number().nullable()
})

// Schema for task status update
export const updateTaskStatusSchema = z.object({
  taskId: z.number(),
  status: z.enum(["todo", "in-progress", "done"]),
  columnId: z.number()
})

// Schema for task assignee update
export const updateTaskAssigneeSchema = z.object({
  taskId: z.number(),
  assigneeId: z.number().nullable()
})

// Schema for task deletion
export const deleteTaskSchema = z.object({
  taskId: z.number()
})

export const updateTaskOrderSchema = z.object({
  taskId: z.number(),
  order: z.number().nonnegative(),
  columnId: z.number()
})

// Schema for creating a user
export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  role: z.string().nullable(),
  avatar: z.string().nullable()
})

// Schema for updating a user
export const updateUserSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  role: z.string().nullable(),
  avatar: z.string().nullable()
}) 