import { KanbanBoard } from "@/components/kanban-board-client"
import { getColumns, getTasks, getTeamMembers } from "@/lib/actions"

// Define interfaces that match both the database schema and component props
interface Column {
  id: number;
  name: string;
  order: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string | null;
  avatar: string | null;
}

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: 'todo' | 'in-progress' | 'done';
  assigneeId: number | null;
  columnId: number;
  order: number;
  assignee?: User;
  column?: Column;
}

export default async function Home() {
  // Fetch data from the server
  const dbColumns = await getColumns() || []
  const dbTasks = await getTasks() || []
  const dbUsers = await getTeamMembers() || []
  
  // Map database results to component props
  const columns: Column[] = dbColumns.map(col => ({
    id: col.id,
    name: col.name,
    order: col.order
  }))
  
  const users: User[] = dbUsers.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar
  }))
  
  const tasks: Task[] = dbTasks.map(task => ({
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
