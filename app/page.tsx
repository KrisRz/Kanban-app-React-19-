import { KanbanBoard } from "@/components/kanban-board-client"
import { getColumns, getTasks, getTeamMembers } from "@/lib/actions"
import { Column, User, Task } from "@/lib/types"

// Define interfaces that match both the database schema and component props
interface ColumnData extends Column {}
interface UserData extends User {}
interface TaskData extends Task {
  column?: Column;
}

// Mock data for when database calls fail
const mockColumns: Column[] = [
  { id: 1, name: 'To Do', order: 1 },
  { id: 2, name: 'In Progress', order: 2 },
  { id: 3, name: 'Done', order: 3 }
];

const mockUsers: User[] = [
  { id: 1, name: 'Alex Johnson', email: 'alex@example.com', role: 'Developer', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: 2, name: 'Taylor Smith', email: 'taylor@example.com', role: 'Designer', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' }
];

const mockTasks: TaskData[] = [
  { id: 1, title: 'Design Homepage', description: 'Create wireframes', status: 'todo', assigneeId: 1, columnId: 1, order: 1, assignee: mockUsers[0], column: mockColumns[0] },
  { id: 2, title: 'Implement Auth', description: 'Set up authentication', status: 'in-progress', assigneeId: 2, columnId: 2, order: 1, assignee: mockUsers[1], column: mockColumns[1] }
];

export default async function Home() {
  // Try to fetch data from the server
  let dbColumns, dbTasks, dbUsers
  
  try {
    dbColumns = await getColumns() || []
    dbTasks = await getTasks() || []
    dbUsers = await getTeamMembers() || []
  } catch (error) {
    console.error("Error fetching data:", error)
    // Use mock data if database calls fail
    return (
      <main className="flex-1 container mx-auto px-4 py-6">
        <KanbanBoard 
          initialColumns={mockColumns} 
          initialTasks={mockTasks} 
          teamMembers={mockUsers} 
        />
      </main>
    )
  }
  
  // If data is empty (which could happen during build), use mock data
  if (dbColumns.length === 0 || dbTasks.length === 0 || dbUsers.length === 0) {
    return (
      <main className="flex-1 container mx-auto px-4 py-6">
        <KanbanBoard 
          initialColumns={mockColumns} 
          initialTasks={mockTasks} 
          teamMembers={mockUsers} 
        />
      </main>
    )
  }
  
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
