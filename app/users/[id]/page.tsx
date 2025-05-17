import { getUserById, getUserTasks } from '@/lib/actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getInitials } from '@/lib/utils'
import { ArrowLeft, Mail, Pencil, CheckCircle2, Clock, CircleDashed, User, Briefcase, CalendarRange, BarChart4 } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Task } from '@/lib/types'

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  const userId = parseInt(params.id)
  
  if (isNaN(userId)) {
    notFound()
  }
  
  const user = await getUserById(userId)
  
  if (!user) {
    notFound()
  }
  
  // Fetch tasks assigned to this user
  const tasksResult = await getUserTasks(userId)
  const tasks: Task[] = tasksResult.success && tasksResult.tasks ? tasksResult.tasks : []
  
  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'todo':
        return { 
          label: 'To Do', 
          icon: <CircleDashed className="h-4 w-4 mr-1" />,
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
        }
      case 'in-progress':
        return { 
          label: 'In Progress', 
          icon: <Clock className="h-4 w-4 mr-1" />,
          className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' 
        }
      case 'done':
        return { 
          label: 'Done', 
          icon: <CheckCircle2 className="h-4 w-4 mr-1" />,
          className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
        }
      default:
        return { 
          label: status, 
          icon: null,
          className: '' 
        }
    }
  }
  
  // Get task statistics
  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length
  }
  
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-6">
        <Link href="/users" className="flex items-center gap-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Users</span>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="border border-gray-200 dark:border-zinc-700 shadow-md rounded-xl overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-700 pb-6">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <User className="h-5 w-5 text-primary" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Avatar className="h-32 w-32 mb-4 border-4 border-gray-100 dark:border-zinc-700 shadow-md">
                {user.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.name} />
                ) : null}
                <AvatarFallback className="text-3xl bg-primary text-white">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
              <div className="inline-block mt-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-sm font-medium">
                {user.role || "Team Member"}
              </div>
              <div className="flex items-center gap-2 mt-4 text-gray-600 dark:text-gray-300">
                <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                <span>{user.email}</span>
              </div>
              
              <div className="w-full mt-6 pt-6 border-t border-gray-100 dark:border-zinc-800">
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="flex flex-col items-center p-2 rounded-lg bg-gray-50 dark:bg-zinc-800">
                    <span className="text-2xl font-bold text-primary">{taskStats.total}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Tasks</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-lg bg-gray-50 dark:bg-zinc-800">
                    <span className="text-2xl font-bold text-yellow-500">{taskStats.inProgress}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">In Progress</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-lg bg-gray-50 dark:bg-zinc-800">
                    <span className="text-2xl font-bold text-green-500">{taskStats.done}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Completed</span>
                  </div>
                </div>
                
                <Link href={`/users/${user.id}/edit`}>
                  <Button className="w-full rounded-lg flex items-center gap-1 bg-primary hover:bg-primary/90">
                    <Pencil className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </Link>
                <Link href={`/users/${user.id}/dashboard`} className="mt-2 inline-block w-full">
                  <Button variant="outline" className="w-full rounded-lg flex items-center justify-center gap-1">
                    <BarChart4 className="h-4 w-4" />
                    View Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="border border-gray-200 dark:border-zinc-700 shadow-md rounded-xl overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-700 pb-6">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Briefcase className="h-5 w-5 text-primary" />
                Assigned Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {tasks.length > 0 ? (
                <div className="space-y-4">
                  {tasks.map(task => {
                    const statusBadge = getStatusBadge(task.status);
                    return (
                      <div 
                        key={task.id} 
                        className="border border-gray-200 dark:border-zinc-700 rounded-xl p-4 hover:shadow-md hover:border-primary/30 transition-all bg-white dark:bg-zinc-800"
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{task.title}</h3>
                          <Badge className={`flex items-center ${statusBadge.className} font-medium`}>
                            {statusBadge.icon}
                            {statusBadge.label}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{task.description}</p>
                        )}
                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 dark:border-zinc-700 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <CalendarRange className="h-3.5 w-3.5" />
                            Updated {new Date().toLocaleDateString()}
                          </div>
                          <div className="font-medium">ID: {task.id}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed border-gray-200 dark:border-zinc-700 rounded-xl">
                  <Briefcase className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No tasks assigned</p>
                  <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
                    This user doesn't have any tasks assigned yet.
                  </p>
                  <Link href="/tasks/add">
                    <Button variant="outline" className="mt-4 rounded-lg">
                      Assign New Task
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 