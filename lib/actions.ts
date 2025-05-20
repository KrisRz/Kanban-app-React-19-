'use server'

import { db } from '@/db'
import { columns, tasks, users } from '@/db/schema'
import { eq, desc, asc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import { 
  createTaskSchema, 
  updateTaskSchema, 
  updateTaskStatusSchema, 
  updateTaskAssigneeSchema,
  deleteTaskSchema
} from './validations'
import { cache } from 'react'
import { Task, User, Column } from "./types"
import { sql } from 'drizzle-orm'

/**
 * Get all columns with their order
 */
export async function getColumns() {
  try {
    const data = await db.query.columns.findMany({
      orderBy: columns.order
    })
    return data
  } catch (error) {
    console.error('Failed to fetch columns:', error)
    return []
  }
}

/**
 * Get all tasks with their columns and assignees
 */
export async function getTasks() {
  try {
    // Use direct query to avoid type mismatch issues
    const taskData = await db.select().from(tasks)
    
    // If needed, fetch assignees and columns separately
    const usersData = await db.select().from(users)
    const columnsData = await db.select().from(columns)
    
    // Manually map relationships
    const data = taskData.map((task: typeof tasks.$inferSelect) => {
      const assignee = task.assigneeId ? usersData.find((u: typeof users.$inferSelect) => u.id === task.assigneeId) : null
      const column = columnsData.find((c: typeof columns.$inferSelect) => c.id === task.columnId)
      
      return {
        ...task,
        assignee,
        column
      }
    })
    
    return data
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
    return []
  }
}

/**
 * Get tasks for a specific column
 */
export async function getTasksByColumn(columnId: number) {
  try {
    const columnTasks = await db.query.tasks.findMany({
      where: eq(tasks.columnId, columnId),
      with: {
        assignee: true
      },
      orderBy: tasks.order
    })
    return { tasks: columnTasks }
  } catch (error) {
    console.error(`Failed to fetch tasks for column ${columnId}:`, error)
    return { error: `Failed to fetch tasks for column ${columnId}` }
  }
}

/**
 * Get all team members (users)
 */
export async function getTeamMembers() {
  try {
    const data = await db.query.users.findMany()
    return data
  } catch (error) {
    console.error('Failed to fetch team members:', error)
    return []
  }
}

/**
 * Get all users from the database
 */
export async function getUsers() {
  try {
    const allUsers = await db.query.users.findMany({
      orderBy: [desc(users.name)]
    });
    return allUsers;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

/**
 * Get a user by ID
 */
export async function getUserById(id: number) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id)
    });
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Create a new task
 */
export async function createTask(taskData: {
  title: string
  description: string | null
  status: 'todo' | 'in-progress' | 'done'
  assigneeId: number | null
  columnId: number
  order: number
}) {
  try {
    // Validate task data
    const validatedData = createTaskSchema.parse(taskData);
    
    // Insert task into database
    const newTask = await db.insert(tasks).values(validatedData).returning()
    revalidatePath('/')
    return newTask[0]
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      console.error('Task validation failed:', error.errors)
      throw new Error(`Validation error: ${error.errors.map(err => err.message).join(', ')}`)
    }
    console.error('Failed to create task:', error)
    throw new Error('Failed to create task')
  }
}

/**
 * Update a task
 */
export async function updateTask(
  taskId: number,
  taskData: Partial<{
    title: string
    description: string | null
    status: 'todo' | 'in-progress' | 'done'
    assigneeId: number | null
    columnId: number
    order: number
  }>
) {
  try {
    // Validate task data
    const validatedData = updateTaskSchema.parse(taskData);
    
    const updatedTask = await db
      .update(tasks)
      .set(validatedData)
      .where(eq(tasks.id, taskId))
      .returning()
    
    revalidatePath('/')
    return updatedTask[0]
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      console.error('Task validation failed:', error.errors)
      throw new Error(`Validation error: ${error.errors.map(err => err.message).join(', ')}`)
    }
    console.error('Failed to update task:', error)
    throw new Error('Failed to update task')
  }
}

/**
 * Update task status and column
 */
export async function updateTaskStatus(
  taskId: number,
  status: 'todo' | 'in-progress' | 'done',
  columnId: number
) {
  try {
    // Validate task status data
    const validatedData = updateTaskStatusSchema.parse({ taskId, status, columnId });
    
    const updatedTask = await db
      .update(tasks)
      .set({
        status: validatedData.status,
        columnId: validatedData.columnId
      })
      .where(eq(tasks.id, validatedData.taskId))
      .returning()
    
    revalidatePath('/')
    return updatedTask[0]
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      console.error('Task status validation failed:', error.errors)
      throw new Error(`Validation error: ${error.errors.map(err => err.message).join(', ')}`)
    }
    console.error('Failed to update task status:', error)
    throw new Error('Failed to update task status')
  }
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: number) {
  try {
    // Validate task id
    const validatedData = deleteTaskSchema.parse({ taskId });
    
    await db.delete(tasks).where(eq(tasks.id, validatedData.taskId))
    revalidatePath('/')
    return { success: true }
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      console.error('Task deletion validation failed:', error.errors)
      throw new Error(`Validation error: ${error.errors.map(err => err.message).join(', ')}`)
    }
    console.error('Failed to delete task:', error)
    throw new Error('Failed to delete task')
  }
}

/**
 * Update a task's assignee
 */
export async function updateTaskAssignee(taskId: number, assigneeId: number | null) {
  try {
    // Validate task assignee data
    const validatedData = updateTaskAssigneeSchema.parse({ taskId, assigneeId });
    
    const updatedTask = await db
      .update(tasks)
      .set({ assigneeId: validatedData.assigneeId })
      .where(eq(tasks.id, validatedData.taskId))
      .returning()
    
    revalidatePath('/')
    return updatedTask[0]
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      console.error('Task assignee validation failed:', error.errors)
      throw new Error(`Validation error: ${error.errors.map(err => err.message).join(', ')}`)
    }
    console.error('Failed to update task assignee:', error)
    throw new Error('Failed to update task assignee')
  }
}

/**
 * Get all data needed for the Kanban board
 * This function is cached and will only re-run when the cache is invalidated
 */
export const getKanbanData = cache(async () => {
  try {
    // Get columns
    const columnsData = await db.query.columns.findMany({
      orderBy: columns.order
    });
    
    // Get tasks
    const taskData = await db.select().from(tasks);
    
    // Get users
    const usersData = await db.select().from(users);
    
    // Manually map relationships
    const tasksWithRelations = taskData.map((task: typeof tasks.$inferSelect) => {
      const assignee = task.assigneeId ? usersData.find((u: typeof users.$inferSelect) => u.id === task.assigneeId) : null;
      const column = columnsData.find((c: typeof columns.$inferSelect) => c.id === task.columnId);
      
      return {
        ...task,
        assignee,
        column
      };
    });
    
    return {
      columns: columnsData,
      tasks: tasksWithRelations,
      users: usersData
    };
  } catch (error: unknown) {
    console.error('Failed to fetch Kanban data:', error);
    return {
      columns: [],
      tasks: [],
      users: []
    };
  }
});

/**
 * Direct action to create a task from the dialog
 */
export async function createTaskAction(data: {
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'done'
  assigneeId: number | null
}) {
  try {
    // Parse and validate the input
    const validatedData = createTaskSchema.parse(data);

    // Determine the column based on the status
    const column = await db.query.columns.findFirst({
      where: (columns, { eq }) => {
        if (validatedData.status === "todo") {
          return eq(columns.name, "To Do");
        } else if (validatedData.status === "in-progress") {
          return eq(columns.name, "In Progress");
        } else {
          return eq(columns.name, "Done");
        }
      }
    });

    if (!column) {
      throw new Error("Could not find appropriate column for task status");
    }

    // Count existing tasks in the column to determine order
    const tasksInColumn = await db.query.tasks.findMany({
      where: eq(tasks.columnId, column.id)
    });
    const order = tasksInColumn.length;

    // Create the task
    const result = await db.insert(tasks).values({
      title: validatedData.title,
      description: validatedData.description,
      status: validatedData.status,
      assigneeId: validatedData.assigneeId as number | null,
      columnId: column.id,
      order: order
    }).returning();

    const createdTask = result[0];
    if (!createdTask) {
      throw new Error("Failed to create task")
    }

    // Revalidate the path
    revalidatePath("/");

    return { success: true, task: createdTask };
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("Validation error:", error.errors);
      const fieldErrors = error.errors.reduce((acc, err) => {
        const path = err.path.join('.')
        acc[path] = err.message
        return acc
      }, {} as Record<string, string>)
      
      return { 
        success: false, 
        error: "Validation failed", 
        fieldErrors 
      }
    }
    console.error("Error creating task:", error);
    return { success: false, error: "Failed to create task" };
  }
}

/**
 * Direct action to update a task from the dialog
 */
export async function updateTaskAction(data: {
  id: number
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'done'
  assigneeId: number | null
}) {
  try {
    // Validate the data
    const validatedData = updateTaskSchema.parse(data)
    
    // Check if task exists
    const existingTask = await db.query.tasks.findFirst({
      where: eq(tasks.id, validatedData.id)
    })
    
    if (!existingTask) {
      return { success: false, error: "Task not found" }
    }
    
    // Check if status has changed, which means moving to a different column
    if (existingTask.status !== validatedData.status) {
      // Find column for the new status
      const columns = await db.query.columns.findMany({
        orderBy: (columns, { asc }) => [asc(columns.order)],
      })
      
      const statusToColumnMap: Record<string, number> = {
        todo: columns.find(c => c.name.toLowerCase() === "to do")?.id || 1,
        "in-progress": columns.find(c => c.name.toLowerCase() === "in progress")?.id || 2,
        done: columns.find(c => c.name.toLowerCase() === "done")?.id || 3,
      }
      
      const newColumnId = statusToColumnMap[validatedData.status]
      
      // Get highest order in the new column
      const tasksInNewColumn = await db.query.tasks.findMany({
        where: eq(tasks.columnId, newColumnId),
        orderBy: (tasks, { desc }) => [desc(tasks.order)],
      })
      
      const newOrder = tasksInNewColumn.length > 0 ? tasksInNewColumn[0].order + 1 : 0
      
      // Update task with new column and order
      const result = await db.update(tasks)
        .set({
          title: validatedData.title,
          description: validatedData.description,
          status: validatedData.status,
          assigneeId: validatedData.assigneeId as number | null,
          columnId: newColumnId,
          order: newOrder
        })
        .where(eq(tasks.id, validatedData.id))
        .returning()
      
      const updatedTask = result[0];
      if (!updatedTask) {
        throw new Error("Failed to update task")
      }
      
      revalidatePath("/")
      return { success: true, task: updatedTask }
    } else {
      // Just update the task details, not moving columns
      const result = await db.update(tasks)
        .set({
          title: validatedData.title,
          description: validatedData.description,
          assigneeId: validatedData.assigneeId as number | null
        })
        .where(eq(tasks.id, validatedData.id))
        .returning()
      
      const updatedTask = result[0];
      if (!updatedTask) {
        throw new Error("Failed to update task")
      }
      
      revalidatePath("/")
      return { success: true, task: updatedTask }
    }
  } catch (error) {
    console.error("Error updating task:", error)
    
    if (error instanceof ZodError) {
      const fieldErrors = error.errors.reduce((acc, err) => {
        const path = err.path.join('.')
        acc[path] = err.message
        return acc
      }, {} as Record<string, string>)
      
      return { 
        success: false, 
        error: "Validation failed", 
        fieldErrors 
      }
    }
    
    return { 
      success: false, 
      error: "Failed to update task. Please try again."
    }
  }
}

/**
 * Direct action to delete a task
 */
export async function deleteTaskAction(data: { id: number }) {
  try {
    // Transform the input to match the schema
    const deleteData = { taskId: data.id };
    
    // Validate the data
    const validatedData = deleteTaskSchema.parse(deleteData)
    
    // Check if task exists
    const existingTask = await db.query.tasks.findFirst({
      where: eq(tasks.id, data.id)
    })
    
    if (!existingTask) {
      return { success: false, error: "Task not found" }
    }
    
    // Delete the task
    await db.delete(tasks).where(eq(tasks.id, data.id))
    
    // Revalidate the path
    revalidatePath('/')
    
    return { success: true, id: data.id }
  } catch (error) {
    console.error("Error deleting task:", error)
    
    if (error instanceof ZodError) {
      return { 
        success: false, 
        error: "Invalid task ID"
      }
    }
    
    return { 
      success: false, 
      error: "Failed to delete task. Please try again."
    }
  }
}

/**
 * Direct action to assign a task to a user
 */
export async function assignTaskAction(data: {
  taskId: number
  assigneeId: number | null
}) {
  try {
    // Check if task exists
    const existingTask = await db.query.tasks.findFirst({
      where: eq(tasks.id, data.taskId)
    })
    
    if (!existingTask) {
      return { success: false, error: "Task not found" }
    }
    
    // Update the task's assignee
    const result = await db.update(tasks)
      .set({ assigneeId: data.assigneeId })
      .where(eq(tasks.id, data.taskId))
      .returning()
    
    // Revalidate the path
    revalidatePath('/')
    
    return { success: true, task: result[0], taskId: data.taskId, assigneeId: data.assigneeId }
  } catch (error) {
    console.error("Error assigning task:", error)
    return { 
      success: false, 
      error: "Failed to assign task. Please try again.",
      taskId: data.taskId
    }
  }
}

/**
 * Create a new user
 */
export async function createUserAction(data: {
  name: string;
  email: string;
  role: string | null;
  avatar: string | null;
}) {
  try {
    // Check if email is already in use
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, data.email)
    });
    
    if (existingUser) {
      return { 
        success: false, 
        error: "Email already in use",
        fieldErrors: { email: "This email is already in use" }
      };
    }
    
    // Store the avatar directly (whether it's a base64 string or URL)
    // Base64 strings from FileReader already start with "data:image/"
    
    // Insert the user
    try {
      // Try PostgreSQL-style with returning
      const result = await db.insert(users).values({
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: data.avatar
      }).returning();
      
      // Revalidate the path
      revalidatePath('/');
      
      return { success: true, user: result[0] };
    } catch (e) {
      // If returning() fails, use MySQL approach
      await db.insert(users).values({
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: data.avatar
      });
      
      // Fetch the user we just created
      const newUser = await db.query.users.findFirst({
        where: eq(users.email, data.email)
      });
      
      // Revalidate the path
      revalidatePath('/');
      
      return { success: true, user: newUser };
    }
  } catch (error) {
    console.error("Error creating user:", error);
    
    return { 
      success: false, 
      error: "Failed to create user. Please try again."
    };
  }
}

/**
 * Update an existing user
 */
export async function updateUserAction(data: {
  id: number;
  name: string;
  email: string;
  role: string | null;
  avatar: string | null;
}) {
  try {
    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, data.id)
    });
    
    if (!existingUser) {
      return { success: false, error: "User not found" };
    }
    
    // Check if email is already in use by another user
    if (data.email !== existingUser.email) {
      const emailInUse = await db.query.users.findFirst({
        where: eq(users.email, data.email)
      });
      
      if (emailInUse) {
        return { 
          success: false, 
          error: "Email already in use",
          fieldErrors: { email: "This email is already in use" }
        };
      }
    }
    
    // Store the avatar directly (whether it's a base64 string or URL)
    // If no new avatar is provided, keep the existing one
    const avatarToUse = data.avatar || existingUser.avatar;
    
    // Update the user
    try {
      // Try PostgreSQL-style with returning
      const result = await db.update(users)
        .set({
          name: data.name,
          email: data.email,
          role: data.role,
          avatar: avatarToUse
        })
        .where(eq(users.id, data.id))
        .returning();
      
      // Revalidate the path
      revalidatePath('/');
      
      return { success: true, user: result[0] };
    } catch (e) {
      // If returning() fails, use MySQL approach
      await db.update(users)
        .set({
          name: data.name,
          email: data.email,
          role: data.role,
          avatar: avatarToUse
        })
        .where(eq(users.id, data.id));
      
      // Fetch the updated user
      const updatedUser = await db.query.users.findFirst({
        where: eq(users.id, data.id)
      });
      
      // Revalidate the path
      revalidatePath('/');
      
      return { success: true, user: updatedUser };
    }
  } catch (error) {
    console.error("Error updating user:", error);
    
    return { 
      success: false, 
      error: "Failed to update user. Please try again."
    };
  }
}

/**
 * Delete a user
 */
export async function deleteUserAction(userId: number) {
  try {
    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });
    
    if (!existingUser) {
      return { success: false, error: "User not found" };
    }
    
    // Check if user has tasks assigned
    const userTasks = await db.query.tasks.findMany({
      where: eq(tasks.assigneeId, userId)
    });
    
    // Prevent deletion if user has assigned tasks
    if (userTasks.length > 0) {
      const taskCount = userTasks.length;
      const taskWord = taskCount === 1 ? "task" : "tasks";
      return { 
        success: false, 
        error: `Cannot delete this user as they have ${taskCount} ${taskWord} assigned.`,
        hasAssignedTasks: true,
        taskCount
      };
    }
    
    // Delete the user
    await db.delete(users).where(eq(users.id, userId));
    
    // Revalidate the path
    revalidatePath('/users');
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    
    return { 
      success: false, 
      error: "Failed to delete user. Please try again."
    };
  }
}

/**
 * Get tasks assigned to a specific user
 */
export async function getUserTasks(userId: number) {
  try {
    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });
    
    if (!existingUser) {
      return { success: false, error: "User not found" };
    }
    
    // Get tasks assigned to this user
    const userTasks = await db.query.tasks.findMany({
      where: eq(tasks.assigneeId, userId),
      orderBy: [tasks.status, tasks.title]
    });
    
    return { 
      success: true, 
      tasks: userTasks
    };
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    
    return { 
      success: false, 
      error: "Failed to fetch user tasks."
    };
  }
}

/**
 * Get the total count of users
 */
export async function getUserCount() {
  try {
    const count = await db.select({ count: sql`count(*)` }).from(users);
    return count[0].count;
  } catch (error) {
    console.error('Error getting user count:', error);
    return 0;
  }
}

/**
 * Get task counts for all users
 */
export async function getUserTaskCounts() {
  try {
    // First get all tasks that have assigneeId
    const assignedTasks = await db.query.tasks.findMany({
      where: sql`${tasks.assigneeId} IS NOT NULL`
    });
    
    // Count tasks per user
    const taskCounts: Record<number, number> = {};
    
    // Initialize counts
    const allUsers = await db.query.users.findMany();
    allUsers.forEach(user => {
      taskCounts[user.id] = 0;
    });
    
    // Count tasks for each user
    assignedTasks.forEach(task => {
      if (task.assigneeId !== null) {
        if (taskCounts[task.assigneeId] === undefined) {
          taskCounts[task.assigneeId] = 1;
        } else {
          taskCounts[task.assigneeId]++;
        }
      }
    });
    
    return { success: true, taskCounts };
  } catch (error) {
    console.error('Error getting user task counts:', error);
    return { success: false, error: "Failed to fetch task counts" };
  }
} 