import { getUserById, getUserTasks } from '@/lib/actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getInitials } from '@/lib/utils'
import { ArrowLeft, Mail, Pencil, CheckCircle2, Clock, CircleDashed, User, Briefcase, CalendarRange, LayoutGrid, ListFilter, BarChart4, UserCog } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Task } from '@/lib/types'
import SimpleTaskCard from '@/components/simple-task-card'

export default async function UserDashboardPage({ params }: { params: { id: string } }) {
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
        <Link href={`/users/${userId}`} className="flex items-center gap-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Profile</span>
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-gray-100 dark:border-zinc-700 shadow-md">
            {user.avatar ? (
              <AvatarImage src={user.avatar} alt={user.name} />
            ) : null}
            <AvatarFallback className="text-xl bg-primary text-white">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}'s Dashboard</h1>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              <span>{user.email}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link href={`/users/${userId}`}>
            <Button variant="outline" size="sm" className="flex items-center gap-1 rounded-lg">
              <User className="h-4 w-4" />
              Profile
            </Button>
          </Link>
          <Link href={`/users/${userId}/edit`}>
            <Button variant="outline" size="sm" className="flex items-center gap-1 rounded-lg">
              <UserCog className="h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Task statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-gray-200 dark:border-zinc-700 shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                <BarChart4 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{taskStats.total}</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Total Tasks</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200 dark:border-zinc-700 shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                <CircleDashed className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{taskStats.todo}</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">To Do</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200 dark:border-zinc-700 shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-3">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{taskStats.inProgress}</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">In Progress</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200 dark:border-zinc-700 shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{taskStats.done}</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Task List Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Assigned Tasks</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-lg flex items-center gap-1">
            <ListFilter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="rounded-lg flex items-center gap-1">
            <LayoutGrid className="h-4 w-4" />
            View
          </Button>
        </div>
      </div>
      
      {/* Tasks Grid */}
      {tasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {tasks.map(task => (
            <SimpleTaskCard 
              key={task.id}
              task={task}
              onDragStart={() => {}}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-gray-200 dark:border-zinc-700 rounded-xl mb-8">
          <Briefcase className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No tasks assigned</p>
          <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
            This user doesn't have any tasks assigned yet.
          </p>
          <Link href="/tasks/add">
            <Button className="mt-4 rounded-lg bg-primary hover:bg-primary/90">
              Assign New Task
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
} 