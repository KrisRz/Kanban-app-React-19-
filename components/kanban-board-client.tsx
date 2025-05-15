'use client'

import { useState, forwardRef } from 'react'
import { Button } from "@/components/ui/button"
import { Plus, UserPlus } from "lucide-react"
import { TaskDialog } from './task-dialog'
import { UserDialog } from './user-dialog'
import { 
  updateTaskStatus, 
  updateTaskAssignee as updateTaskAssigneeAction,
  assignTaskAction
} from '@/lib/actions'
import { useToast } from '@/components/ui/use-toast'
import { Task, User, Column } from '@/lib/types'
import SimpleTaskCard from './simple-task-card'

// DroppableColumn component for each status column
interface DroppableColumnProps {
  id: string
  column: Column
  tasks: Task[]
  onDrop: (taskId: number, columnId: string) => void
}

const DroppableColumn = forwardRef<HTMLDivElement, DroppableColumnProps>(
  ({ id, column, tasks: columnTasks, onDrop }, ref) => {
    const [isOver, setIsOver] = useState(false);
    
    // Handle drag over
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setIsOver(true);
    };
    
    // Handle drag leave
    const handleDragLeave = () => {
      setIsOver(false);
    };
    
    // Handle drop
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsOver(false);
      
      // Get the task ID from the dataTransfer
      const taskId = e.dataTransfer.getData('text/plain');
      if (taskId) {
        console.log(`Dropped task ${taskId} into column ${id}`);
        onDrop(parseInt(taskId), id);
      }
    };
    
    // Status colors and icons
    const columnStyle = {
      'todo': { color: 'text-gray-700', bgColor: 'bg-gray-100', borderColor: 'border-gray-200' },
      'in-progress': { color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
      'done': { color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200' }
    }[id.replace('column-', '') as 'todo' | 'in-progress' | 'done'];
    
    return (
      <div 
        ref={ref} 
        className="flex-1"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div 
          className={`bg-white dark:bg-zinc-800 rounded-xl shadow-sm overflow-hidden
            ${isOver ? 'ring-2 ring-primary/50 border-primary' : 'border'} 
            dark:border-zinc-700 transition-all duration-150`}
        >
          {/* Column header */}
          <div className={`px-4 py-3 ${columnStyle.bgColor} dark:bg-opacity-10 border-b ${columnStyle.borderColor} dark:border-zinc-700`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className={`font-semibold ${columnStyle.color} dark:text-white`}>{column.name}</h3>
                <span className="bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                  {columnTasks.length}
                </span>
              </div>
            </div>
          </div>
          
          {/* Column content */}
          <div className="p-3 space-y-3 min-h-[200px]">
            {columnTasks.length === 0 ? (
              <div className="flex items-center justify-center h-20 border border-dashed rounded-lg border-gray-200 dark:border-zinc-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">No tasks</p>
              </div>
            ) : (
              columnTasks.map(task => (
                <SimpleTaskCard
                  key={task.id}
                  task={task}
                  onDragStart={() => console.log('Drag started from column:', id, 'task:', task.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    )
  }
)

DroppableColumn.displayName = 'DroppableColumn'

// Props for the KanbanBoard component
interface KanbanBoardProps {
  initialColumns: Column[]
  initialTasks: Task[]
  teamMembers: User[]
}

export function KanbanBoard({ initialColumns, initialTasks, teamMembers }: KanbanBoardProps) {
  // State initialized with server-fetched data
  const [columns, setColumns] = useState<Column[]>(initialColumns)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  
  // Dialog state
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [editTask, setEditTask] = useState<Task | undefined>(undefined)
  const [editUser, setEditUser] = useState<User | undefined>(undefined)
  
  // Toast
  const { toast } = useToast()
  
  // Group tasks by status
  const todoTasks = tasks
    .filter(task => task.status === 'todo')
    .sort((a, b) => a.order - b.order)
  
  const inProgressTasks = tasks
    .filter(task => task.status === 'in-progress')
    .sort((a, b) => a.order - b.order)
  
  const doneTasks = tasks
    .filter(task => task.status === 'done')
    .sort((a, b) => a.order - b.order)
  
  // Handle drop on a column
  const handleDropOnColumn = async (taskId: number, columnId: string) => {
    // Convert column ID to status (format: 'column-{status}')
    const newStatus = columnId.replace('column-', '') as 'todo' | 'in-progress' | 'done'
    const taskToUpdate = tasks.find(t => t.id === taskId)
    
    if (!taskToUpdate) {
      console.error('Task not found:', taskId)
      return
    }
    
    // Don't do anything if dropped in the same column
    if (taskToUpdate.status === newStatus) {
      console.log('Task dropped in the same column, no action needed')
      return
    }
    
    console.log('Moving task:', { taskId, newStatus, taskToUpdate })
    
    // Find the column ID for the new status
    const targetColumn = columns.find(col => {
      if (newStatus === 'todo' && col.name === 'To Do') return true
      if (newStatus === 'in-progress' && col.name === 'In Progress') return true
      if (newStatus === 'done' && col.name === 'Done') return true
      return false
    })
    
    if (!targetColumn) {
      console.error('Target column not found for status:', newStatus)
      return
    }
    
    try {
      console.log('Found target column:', targetColumn)
      
      // Update task status in state
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus, columnId: targetColumn.id } : task
      )
      setTasks(updatedTasks)
      
      // Update task on the server using server action
      console.log('Updating task on server')
      await updateTaskStatus(taskId, newStatus, targetColumn.id)
      
      toast({
        title: "Task moved",
        description: `Task moved to ${newStatus === 'in-progress' ? 'In Progress' : newStatus === 'done' ? 'Done' : 'To Do'}`
      })
    } catch (error) {
      console.error('Error moving task:', error)
      toast({
        title: "Error",
        description: "Failed to move task",
        variant: "destructive"
      })
    }
  }
  
  async function updateTaskAssignee(taskId: number, memberId: number | null) {
    try {
      // Update locally first
      const updatedTasks = tasks.map(task => {
        if (task.id === taskId) {
          const updatedTask = { ...task, assigneeId: memberId }
          
          if (memberId) {
            const member = teamMembers.find(m => m.id === memberId)
            if (member) {
              updatedTask.assignee = member
            }
          } else {
            delete updatedTask.assignee
          }
          
          return updatedTask
        }
        return task
      })
      
      setTasks(updatedTasks)
      
      // Call server action to update assignee
      const result = await assignTaskAction({ taskId, assigneeId: memberId })
      
      if (result.success) {
        toast({
          title: "Task assigned",
          description: memberId 
            ? `Task assigned to ${teamMembers.find(m => m.id === memberId)?.name || 'user'}`
            : "Task unassigned"
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to assign task",
          variant: "destructive"
        })
        
        // Revert the local state if the server action failed
        setTasks(tasks)
      }
    } catch (error) {
      console.error('Error updating task assignee:', error)
      toast({
        title: "Error",
        description: "Failed to assign task",
        variant: "destructive"
      })
      
      // Revert the local state if the server action failed
      setTasks(tasks)
    }
  }

  // Function to handle opening the dialog for creating a new task
  function handleCreateTask() {
    setDialogMode('create')
    setEditTask(undefined)
    setTaskDialogOpen(true)
  }

  // Function to handle opening the dialog for editing a task
  function handleEditTask(task: Task) {
    setDialogMode('edit')
    setEditTask(task)
    setTaskDialogOpen(true)
  }

  // Function to handle opening the dialog for creating a new user
  function handleCreateUser() {
    setDialogMode('create')
    setEditUser(undefined)
    setUserDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kanban Board</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage tasks and track progress</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateUser} variant="outline" className="flex items-center gap-1">
            <UserPlus className="w-4 h-4" />
            Add User
          </Button>
          <Button onClick={handleCreateTask} className="flex items-center gap-1 bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4" />
            Add Task
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DroppableColumn 
          id="column-todo" 
          column={columns.find(c => c.name === 'To Do')!} 
          tasks={todoTasks} 
          onDrop={handleDropOnColumn}
        />
        
        <DroppableColumn 
          id="column-in-progress" 
          column={columns.find(c => c.name === 'In Progress')!} 
          tasks={inProgressTasks} 
          onDrop={handleDropOnColumn}
        />
        
        <DroppableColumn 
          id="column-done" 
          column={columns.find(c => c.name === 'Done')!} 
          tasks={doneTasks}
          onDrop={handleDropOnColumn}
        />
      </div>
      
      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        mode={dialogMode}
        task={editTask}
        teamMembers={teamMembers}
      />
      
      <UserDialog
        open={userDialogOpen}
        onOpenChange={setUserDialogOpen}
        mode={dialogMode}
        user={editUser}
      />
    </div>
  )
} 