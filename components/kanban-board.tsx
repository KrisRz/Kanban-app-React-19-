'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  useDroppable
} from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TaskCard } from './task-card'
import { TaskDialog } from './task-dialog'
import { v4 as uuidv4 } from 'uuid'

// Define TeamMember interface here instead of importing it
interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'done'
  assignee?: {
    id: string
    name: string
    avatar?: string
    role?: string
  }
  column_id?: string
  order?: number
  created_at?: string
  updated_at?: string
}

interface Column {
  id: string
  name: string
  order: number
  created_at?: string
  updated_at?: string
}

function DroppableColumn({ id, title, children }: { id: string, title: string, children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({
    id
  })

  return (
    <div className="flex-1">
      <Card>
        <CardHeader className="bg-muted/50">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent ref={setNodeRef} className="p-4 space-y-4 min-h-[200px]">
          {children}
        </CardContent>
      </Card>
    </div>
  )
}

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [columns, setColumns] = useState<Column[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | undefined>(undefined)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')

  // Fetch columns and tasks from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch columns
        const columnsRes = await fetch('/api/columns')
        const columnsData = await columnsRes.json()
        
        if (columnsRes.ok) {
          setColumns(columnsData)
        } else {
          console.error('Failed to fetch columns:', columnsData)
        }
        
        // Fetch team members
        const teamMembersRes = await fetch('/api/users')
        const teamMembersData = await teamMembersRes.json()
        
        if (teamMembersRes.ok) {
          // Convert to expected format
          const processedTeamMembers = teamMembersData.map((user: any) => ({
            id: user.id.toString(),
            name: user.name,
            avatar: user.avatar,
            role: user.role
          }))
          setTeamMembers(processedTeamMembers)
        } else {
          console.error('Failed to fetch team members:', teamMembersData)
        }
        
        // Fetch tasks
        const tasksRes = await fetch('/api/tasks')
        const tasksData = await tasksRes.json()
        
        if (tasksRes.ok) {
          // Process task data to match our component's expected format
          const processedTasks = tasksData.map((task: any) => {
            const taskStatus = task.status || 'todo'
            
            // Find user if assignee_id exists
            let assignee
            if (task.assignee_id) {
              const user = teamMembersData.find((m: any) => m.id === task.assignee_id)
              if (user) {
                assignee = {
                  id: user.id.toString(),
                  name: user.name,
                  avatar: user.avatar,
                  role: user.role
                }
              }
            }
            
            return {
              id: task.id,
              title: task.title,
              description: task.description || '',
              status: taskStatus,
              assignee,
              column_id: task.column_id,
              order: task.order
            }
          })
          
          setTasks(processedTasks)
        } else {
          console.error('Failed to fetch tasks:', tasksData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Get tasks by status
  const todoTasks = tasks.filter(task => task.status === 'todo')
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress')
  const doneTasks = tasks.filter(task => task.status === 'done')

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Require the mouse to move 10px before activating
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      // Press delay of 250ms, with tolerance of 5px of movement
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    const activeTaskId = active.id as string
    const task = tasks.find(t => t.id === activeTaskId) || null
    setActiveTask(task)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    
    if (!over) {
      setActiveTask(null)
      return
    }

    // If task was dropped in a different column
    if (active.id !== over.id) {
      // Get column ID from the over id (format: 'column-{status}')
      const overId = over.id.toString()
      
      if (overId.startsWith('column-')) {
        const newStatus = overId.replace('column-', '') as 'todo' | 'in-progress' | 'done'
        
        // Update task status in state
        const updatedTasks = tasks.map(task => 
          task.id === active.id ? { ...task, status: newStatus } : task
        )
        setTasks(updatedTasks)
        
        // Also update on the server
        const taskToUpdate = tasks.find(t => t.id === active.id)
        if (taskToUpdate) {
          // Find the column ID for the new status
          const targetColumn = columns.find(col => {
            if (newStatus === 'todo' && col.name === 'To Do') return true
            if (newStatus === 'in-progress' && col.name === 'In Progress') return true
            if (newStatus === 'done' && col.name === 'Done') return true
            return false
          })
          
          if (targetColumn) {
            updateTaskOnServer({
              ...taskToUpdate,
              status: newStatus,
              column_id: targetColumn.id
            })
          }
        }
      } else {
        // Task was dropped on another task - we could implement reordering here
        // For now we're just handling column drops
      }
    }
    
    setActiveTask(null)
  }

  // Function to update task on the server
  async function updateTaskOnServer(task: Task) {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          status: task.status,
          assigneeId: task.assignee?.id,
          columnId: task.column_id,
          order: task.order
        }),
      })
      
      if (!response.ok) {
        console.error('Failed to update task:', await response.json())
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  // Function to update task assignee
  function updateTaskAssignee(taskId: string, memberId: string | null) {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        let updatedTask: Task
        
        if (memberId === null || memberId === "unassigned") {
          // Remove assignee
          const { assignee, ...taskWithoutAssignee } = task
          updatedTask = taskWithoutAssignee as Task
        } else {
          // Update assignee
          const member = teamMembers.find(m => m.id === memberId)
          updatedTask = {
            ...task,
            assignee: member
          }
        }
        
        // Update task on server
        updateTaskOnServer(updatedTask)
        
        return updatedTask
      }
      return task
    })
    
    setTasks(updatedTasks)
  }

  // Function to handle opening the dialog for creating a new task
  function handleCreateTask() {
    setDialogMode('create')
    setEditTask(undefined)
    setDialogOpen(true)
  }

  // Function to handle opening the dialog for editing a task
  function handleEditTask(task: Task) {
    setDialogMode('edit')
    setEditTask(task)
    setDialogOpen(true)
  }

  // Function to handle saving a task
  async function handleSaveTask(taskData: Omit<Task, 'id'>) {
    if (dialogMode === 'create') {
      // Create new task
      try {
        // Find the column for this status
        const columnForStatus = columns.find(col => {
          if (taskData.status === 'todo' && col.name === 'To Do') return true
          if (taskData.status === 'in-progress' && col.name === 'In Progress') return true
          if (taskData.status === 'done' && col.name === 'Done') return true
          return false
        })
        
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: taskData.title,
            description: taskData.description,
            status: taskData.status,
            assigneeId: taskData.assignee?.id,
            columnId: columnForStatus?.id,
            order: taskData.status === 'todo' 
              ? todoTasks.length + 1 
              : taskData.status === 'in-progress' 
                ? inProgressTasks.length + 1 
                : doneTasks.length + 1
          }),
        })
        
        if (response.ok) {
          const newTask = await response.json()
          setTasks([...tasks, {
            ...taskData,
            id: newTask.id,
            column_id: newTask.column_id,
            order: newTask.order
          }])
        } else {
          console.error('Failed to create task:', await response.json())
        }
      } catch (error) {
        console.error('Error creating task:', error)
      }
    } else if (dialogMode === 'edit' && editTask) {
      // Update existing task
      const updatedTask = {
        ...editTask,
        ...taskData
      }
      
      // Update locally
      setTasks(tasks.map(task => 
        task.id === editTask.id ? updatedTask : task
      ))
      
      // Update on server
      await updateTaskOnServer(updatedTask)
    }
    
    setDialogOpen(false)
  }

  // Function to handle deleting a task
  async function handleDeleteTask(taskId: string) {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        // Remove task from state
        setTasks(tasks.filter(task => task.id !== taskId))
      } else {
        console.error('Failed to delete task:', await response.json())
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
    
    if (dialogOpen) {
      setDialogOpen(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Kanban Board</h1>
        <Button onClick={handleCreateTask} className="flex items-center gap-1">
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SortableContext items={todoTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <DroppableColumn id="column-todo" title="To Do">
              {todoTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No tasks</p>
              ) : (
                todoTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onAssigneeChange={updateTaskAssignee}
                    onEdit={() => handleEditTask(task)}
                  />
                ))
              )}
            </DroppableColumn>
          </SortableContext>
          
          <SortableContext items={inProgressTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <DroppableColumn id="column-in-progress" title="In Progress">
              {inProgressTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No tasks</p>
              ) : (
                inProgressTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onAssigneeChange={updateTaskAssignee}
                    onEdit={() => handleEditTask(task)}
                  />
                ))
              )}
            </DroppableColumn>
          </SortableContext>
          
          <SortableContext items={doneTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <DroppableColumn id="column-done" title="Done">
              {doneTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No tasks</p>
              ) : (
                doneTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onAssigneeChange={updateTaskAssignee}
                    onEdit={() => handleEditTask(task)}
                  />
                ))
              )}
            </DroppableColumn>
          </SortableContext>
        </div>
        
        <DragOverlay>
          {activeTask ? (
            <div className="w-[calc(100%/3-1rem)]">
              <TaskCard
                task={activeTask}
                onAssigneeChange={updateTaskAssignee}
                onEdit={() => {}}
                isDragging
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        task={editTask}
        onSave={handleSaveTask}
        onDelete={editTask ? () => handleDeleteTask(editTask.id) : undefined}
      />
    </div>
  )
} 