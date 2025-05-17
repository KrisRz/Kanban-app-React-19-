'use client'

import { forwardRef } from 'react'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, User, Edit } from "lucide-react"
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Badge } from './ui/badge'

interface User {
  id: number
  name: string
  email: string
  role: string | null
  avatar: string | null
}

interface Task {
  id: number
  title: string
  description: string | null
  status: 'todo' | 'in-progress' | 'done'
  assigneeId: number | null
  columnId: number
  order: number
  assignee?: User
}

interface TaskCardProps {
  task: Task
  teamMembers: User[]
  onAssigneeChange: (taskId: number, memberId: number | null) => void
  onEdit: () => void
  isDragging?: boolean
}

export const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(
  ({ task, teamMembers, onAssigneeChange, onEdit, isDragging = false }, ref) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition
    } = useSortable({
      id: task.id.toString(),
      data: { type: 'task', task }
    })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1
    }

    // Get initials from name for avatar fallback
    function getInitials(name: string) {
      return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    }

    // Status badge colors
    const statusColor = {
      'todo': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'in-progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'done': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    }[task.status]

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="shadow-sm hover:shadow transition-all relative cursor-grab active:cursor-grabbing hover:border-blue-500 hover:border-2 rounded-lg bg-white dark:bg-gray-800 overflow-hidden"
        {...attributes}
        {...listeners}
      >
        <div className="p-4 space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{task.title}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger 
                className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Assign to</DropdownMenuLabel>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onAssigneeChange(task.id, null);
                }}>
                  <User className="mr-2 h-4 w-4" />
                  Unassigned
                </DropdownMenuItem>
                {teamMembers.map(member => (
                  <DropdownMenuItem 
                    key={member.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAssigneeChange(task.id, member.id);
                    }}
                  >
                    <Avatar className="h-6 w-6 mr-2">
                      {member.avatar ? (
                        <AvatarImage src={member.avatar} alt={member.name} />
                      ) : null}
                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    {member.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {task.description ? (
            <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
          ) : null}
        </div>
        
        <div className="px-4 py-2 border-t flex justify-between items-center">
          {task.assignee ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                {task.assignee.avatar ? (
                  <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                ) : null}
                <AvatarFallback>{getInitials(task.assignee.name)}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{task.assignee.name}</span>
            </div>
          ) : (
            <div></div>
          )}
          <Badge className={statusColor}>
            {task.status === 'todo' ? 'To Do' : 
             task.status === 'in-progress' ? 'In Progress' : 'Done'}
          </Badge>
        </div>
      </div>
    );
  }
)

TaskCard.displayName = 'TaskCard'; 