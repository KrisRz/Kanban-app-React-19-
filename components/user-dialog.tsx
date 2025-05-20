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
import { User, Task } from "@/lib/types"
import { createUserAction, updateUserAction, deleteUserAction, getUserTasks } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"
import { Loader2, Image, AlertCircle, Trash2, ClipboardList, User as UserIcon, Mail, Briefcase } from "lucide-react"
import { AvatarSelector } from "./avatar-selector"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  user?: User
  embedded?: boolean
}

type FieldErrors = Record<string, string>

const MAX_FILE_SIZE = 2 * 1024 * 1024; // Reduced to 2MB for base64 storage
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

// Define available roles for the select dropdown
const AVAILABLE_ROLES = [
  "Developer",
  "Designer",
  "Product Manager",
  "Marketing",
  "Sales",
  "Support",
  "Admin",
  "Team Lead",
  "Project Manager",
  "QA Analyst"
];

export function UserDialog({
  open,
  onOpenChange,
  mode = 'create',
  user,
  embedded = false
}: UserDialogProps) {
  const [name, setName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [role, setRole] = useState<string>("")
  const [avatar, setAvatar] = useState<string>("")
  const [tempAvatar, setTempAvatar] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [avatarTab, setAvatarTab] = useState<string>("predefined")
  const [uploadError, setUploadError] = useState<string>("")
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false)
  const [showTasksDialog, setShowTasksDialog] = useState<boolean>(false)
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([])
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (user && mode === "edit") {
      setName(user.name)
      setEmail(user.email)
      setRole(user.role || "")
      setAvatar(user.avatar || "")
      setTempAvatar(user.avatar || "")
    } else {
      setName("")
      setEmail("")
      setRole("")
      setAvatar("")
      setTempAvatar("")
    }
    setFieldErrors({})
    setUploadError("")
  }, [user, mode, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setFieldErrors({})

    try {
      const userData = {
        name,
        email,
        role: role || null,
        avatar: tempAvatar || null
      }

      let result;
      
      if (mode === "create") {
        result = await createUserAction(userData)
      } else if (mode === "edit" && user) {
        result = await updateUserAction({
          id: user.id,
          ...userData
        })
      } else {
        throw new Error("Invalid mode or missing user data")
      }
      
      if (result.success) {
        toast({
          title: mode === "create" ? "User created" : "User updated",
          description: `User has been ${mode === "create" ? "created" : "updated"} successfully.`
        })
        onOpenChange(false)
        router.refresh()
        
        // Redirect to users list page after successful create or update
        if (mode === "edit" && !embedded) {
          router.push("/users")
        } else if (mode === "edit" && embedded) {
          router.push(`/users/${user?.id}`)
        } else if (mode === "create") {
          router.push("/users")
        }
      } else {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors)
        }
        toast({
          title: "Error",
          description: result.error || "There was an error processing your request.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error submitting user:", error)
      toast({
        title: "Error",
        description: "There was an error processing your request.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDeleteClick() {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Check if user has assigned tasks first
      const tasksResult = await getUserTasks(user.id);
      
      if (tasksResult.success && tasksResult.tasks && tasksResult.tasks.length > 0) {
        // User has assigned tasks, show tasks dialog directly
        setAssignedTasks(tasksResult.tasks);
        setShowTasksDialog(true);
      } else {
        // No assigned tasks, show confirmation dialog
        setShowDeleteDialog(true);
      }
    } catch (error) {
      console.error("Error checking user tasks:", error);
      toast({
        title: "Error",
        description: "There was an error checking user tasks.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteUserAction(user.id);
      
      if (result.success) {
        toast({
          title: "User deleted",
          description: "User has been deleted successfully."
        });
        onOpenChange(false);
        router.push("/users");
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete user.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "There was an error deleting the user.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setUploadError("")
    
    if (!file) return
    
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setUploadError("Please upload a valid image file (JPEG, PNG, GIF, or WebP)")
      return
    }
    
    // Validate file size - reduced to 2MB since base64 increases size
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`)
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        // The result is already a base64 string that can be stored directly
        setTempAvatar(e.target.result.toString())
      }
    }
    reader.readAsDataURL(file)
  }

  function handleRandomAvatar() {
    // Generate a random avatar from randomuser.me
    const gender = Math.random() > 0.5 ? 'men' : 'women'
    const id = Math.floor(Math.random() * 99) + 1
    const newAvatar = `https://randomuser.me/api/portraits/${gender}/${id}.jpg`
    setTempAvatar(newAvatar)
  }

  // Render the dialog content
  const dialogContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-5">
        {/* Name field */}
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="name" className="text-gray-700 dark:text-gray-300 font-medium">Full Name</Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -mt-2 text-gray-500">
              <UserIcon className="h-4 w-4" />
            </div>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10 rounded-lg border-gray-300 dark:border-gray-700 focus:ring-primary"
              placeholder="John Doe"
              required
            />
          </div>
          {fieldErrors.name && (
            <p className="text-sm text-red-500 mt-1">{fieldErrors.name}</p>
          )}
        </div>

        {/* Email field */}
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">Email Address</Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -mt-2 text-gray-500">
              <Mail className="h-4 w-4" />
            </div>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 rounded-lg border-gray-300 dark:border-gray-700 focus:ring-primary"
              placeholder="john.doe@example.com"
              required
            />
          </div>
          {fieldErrors.email && (
            <p className="text-sm text-red-500 mt-1">{fieldErrors.email}</p>
          )}
        </div>

        {/* Role field - now a select dropdown */}
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="role" className="text-gray-700 dark:text-gray-300 font-medium">Role</Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -mt-2 text-gray-500 z-10">
              <Briefcase className="h-4 w-4" />
            </div>
            <Select 
              value={role} 
              onValueChange={(value) => setRole(value)}
            >
              <SelectTrigger className="w-full pl-10 rounded-lg border-gray-300 dark:border-gray-700 focus:ring-primary">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_ROLES.map((roleOption) => (
                  <SelectItem key={roleOption} value={roleOption}>
                    {roleOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {fieldErrors.role && (
            <p className="text-sm text-red-500 mt-1">{fieldErrors.role}</p>
          )}
        </div>

        {/* Avatar field */}
        <div className="grid w-full items-center gap-1.5">
          <Label className="text-gray-700 dark:text-gray-300 font-medium">Profile Picture</Label>
          <Tabs defaultValue="predefined" onValueChange={(value: string) => setAvatarTab(value)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="predefined">Choose Avatar</TabsTrigger>
              <TabsTrigger value="upload">Upload Image</TabsTrigger>
            </TabsList>
            
            <TabsContent value="predefined" className="mt-2">
              <AvatarSelector value={tempAvatar} onChange={setTempAvatar} />
            </TabsContent>
            
            <TabsContent value="upload" className="mt-2">
              <div className="flex flex-col gap-4">
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 rounded-lg border-gray-300 dark:border-gray-700"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    <Image className="mr-2 h-4 w-4" />
                    Select Image
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="rounded-lg border-gray-300 dark:border-gray-700 flex items-center gap-1"
                    onClick={handleRandomAvatar}
                  >
                    Random Avatar
                  </Button>
                </div>
                <Input 
                  id="avatar-upload"
                  type="file" 
                  accept="image/png, image/jpeg, image/gif, image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                
                {uploadError && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{uploadError}</AlertDescription>
                  </Alert>
                )}
                
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Accepted formats: JPEG, PNG, GIF, WebP. Maximum size: 2MB.
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Avatar preview */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-100 dark:border-zinc-700">
          <Avatar className="h-16 w-16 border-2 border-gray-200 dark:border-gray-700">
            {tempAvatar ? (
              <AvatarImage src={tempAvatar} alt={name} />
            ) : null}
            <AvatarFallback className="text-lg bg-primary text-white">{getInitials(name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{name || 'User Preview'}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {role || 'No role selected'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
        {!embedded && (
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}
            className="rounded-lg border-gray-300 dark:border-gray-700">
            Cancel
          </Button>
        )}
        {mode === "edit" && (
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDeleteClick}
            disabled={isLoading || isDeleting}
            className="rounded-lg"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </>
            )}
          </Button>
        )}
        <Button type="submit" disabled={isLoading || isDeleting} className="rounded-lg bg-primary hover:bg-primary/90">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === 'create' ? 'Creating...' : 'Updating...'}
            </>
          ) : (
            <>{mode === 'create' ? 'Create User' : 'Update User'}</>
          )}
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              and remove their data from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showTasksDialog} onOpenChange={setShowTasksDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <ClipboardList className="mr-2 h-5 w-5" />
              Cannot Delete User
            </AlertDialogTitle>
            <AlertDialogDescription>
              This user has {assignedTasks.length} task{assignedTasks.length === 1 ? '' : 's'} assigned and cannot be deleted.
              <span className="block mt-2 text-sm font-medium">
                Please reassign or complete these tasks before deleting this user.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowTasksDialog(false)}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );

  // If embedded, return just the content
  if (embedded) {
    return dialogContent;
  }

  // Otherwise, return the dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create User' : 'Edit User'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new team member to your project.'
              : 'Edit the details of this team member.'}
          </DialogDescription>
        </DialogHeader>
        {dialogContent}
      </DialogContent>
    </Dialog>
  );
} 