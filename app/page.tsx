import { KanbanBoard } from "@/components/kanban-board-client"
import { getColumns, getTasks, getTeamMembers } from "@/lib/actions"
import { Column, User, Task } from "@/lib/types"

// Define interfaces that match both the database schema and component props
interface ColumnData extends Column {}
interface UserData extends User {}
interface TaskData extends Task {
  column?: Column;
}

export default async function Home() {
  // Fetch data from the server
  const dbColumns = await getColumns() || []
  const dbTasks = await getTasks() || []
  const dbUsers = await getTeamMembers() || []
  
  // Map database results to component props
  const columns: Column[] = dbColumns.map((col: any) => ({
    id: col.id,
    name: col.name,
    order: col.order
  }))
  
  const users: User[] = dbUsers.map((user: any) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar
  }))
  
  const tasks: TaskData[] = dbTasks.map((task: any) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    assigneeId: task.assigneeId,
    columnId: task.columnId,
    order: task.order,
    assignee: task.assignee ? {
      id: task.assignee.id,
      name: task.assignee.name,
      email: task.assignee.email,
      role: task.assignee.role,
      avatar: task.assignee.avatar
    } : undefined,
    column: task.column ? {
      id: task.column.id,
      name: task.column.name,
      order: task.column.order
    } : undefined
  }))

  return (
    <main className="flex-1 container mx-auto px-4 py-6">
      <KanbanBoard 
        initialColumns={columns} 
        initialTasks={tasks} 
        teamMembers={users} 
      />
    </main>
  )
}
