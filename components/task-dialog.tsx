"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Task, User } from "@/lib/types"
import { createTaskAction, updateTaskAction, deleteTaskAction } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task | null
  mode: "create" | "edit"
  teamMembers: User[]
}

type FieldErrors = Record<string, string>

export function TaskDialog({
  open,
  onOpenChange,
  task,
  mode,
  teamMembers,
}: TaskDialogProps) {
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [status, setStatus] = useState<"todo" | "in-progress" | "done">("todo")
  const [assigneeId, setAssigneeId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (task && mode === "edit") {
      setTitle(task.title)
      setDescription(task.description || "")
      setStatus(task.status)
      setAssigneeId(task.assigneeId)
    } else {
      setTitle("")
      setDescription("")
      setStatus("todo")
      setAssigneeId(null)
    }
    setFieldErrors({})
  }, [task, mode, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setFieldErrors({})

    try {
      if (mode === "create") {
        const result = await createTaskAction({
          title,
          description,
          status,
          assigneeId
        })
        
        if (result.success) {
          toast({
            title: "Task created",
            description: "Your task has been created successfully."
          })
          onOpenChange(false)
          router.refresh()
        } else {
          if (result.fieldErrors) {
            setFieldErrors(result.fieldErrors)
          }
          toast({
            title: "Error",
            description: result.error || "Failed to create task",
            variant: "destructive"
          })
        }
      } else if (mode === "edit" && task) {
        const result = await updateTaskAction({
          id: task.id,
          title,
          description,
          status,
          assigneeId
        })
        
        if (result.success) {
          toast({
            title: "Task updated",
            description: "Your task has been updated successfully."
          })
          onOpenChange(false)
          router.refresh()
        } else {
          if (result.fieldErrors) {
            setFieldErrors(result.fieldErrors)
          }
          toast({
            title: "Error",
            description: result.error || "Failed to update task",
            variant: "destructive"
          })
        }
      }
    } catch (error) {
      console.error("Error submitting task:", error)
      toast({
        title: "Error",
        description: "There was an error processing your request.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    if (!task) return
    
    setIsLoading(true)
    try {
      const result = await deleteTaskAction({ id: task.id })
      
      if (result.success) {
        toast({
          title: "Task deleted",
          description: "Your task has been deleted successfully."
        })
        onOpenChange(false)
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete task",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error deleting task:", error)
      toast({
        title: "Error",
        description: "There was an error deleting the task.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Create Task" : "Edit Task"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Add a new task to your board"
                : "Make changes to your task"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className={fieldErrors.title ? "border-red-500" : ""}
                />
                {fieldErrors.title && (
                  <p className="text-xs text-red-500">{fieldErrors.title}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <div className="col-span-3 space-y-1">
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={fieldErrors.description ? "border-red-500" : ""}
                />
                {fieldErrors.description && (
                  <p className="text-xs text-red-500">{fieldErrors.description}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <div className="col-span-3 space-y-1">
                <Select
                  value={status}
                  onValueChange={(value: string) => {
                    if (value === "todo" || value === "in-progress" || value === "done") {
                      setStatus(value);
                    }
                  }}
                >
                  <SelectTrigger 
                    id="status" 
                    className={fieldErrors.status ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.status && (
                  <p className="text-xs text-red-500">{fieldErrors.status}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assignee" className="text-right">
                Assignee
              </Label>
              <div className="col-span-3 space-y-1">
                <Select
                  value={assigneeId ? assigneeId.toString() : "none"}
                  onValueChange={(value) =>
                    setAssigneeId(value !== "none" ? parseInt(value) : null)
                  }
                >
                  <SelectTrigger 
                    id="assignee" 
                    className={fieldErrors.assigneeId ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Assign to..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="flex items-center">
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarFallback>UN</AvatarFallback>
                        </Avatar>
                        Unassigned
                      </div>
                    </SelectItem>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id.toString()} className="flex items-center">
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            {member.avatar ? (
                              <AvatarImage src={member.avatar} alt={member.name} />
                            ) : null}
                            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                          </Avatar>
                          {member.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.assigneeId && (
                  <p className="text-xs text-red-500">{fieldErrors.assigneeId}</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            {mode === "edit" && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isLoading}
              >
                Delete
              </Button>
            )}
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : mode === "create" ? "Create" : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 