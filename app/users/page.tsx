import { Suspense } from 'react'
import { getUsers, getUserTaskCounts } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { UserPlus, Users } from 'lucide-react'
import Link from 'next/link'
import { User } from '@/lib/types'
import { UserCard } from '@/components/user-card'

export default function UsersPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            Team Members
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your team and assign tasks
          </p>
        </div>
        <Link href="/users/add">
          <Button className="flex items-center gap-1 bg-primary hover:bg-primary/90">
            <UserPlus className="w-4 h-4" />
            Add User
          </Button>
        </Link>
      </div>
      
      <Suspense fallback={<UsersSkeleton />}>
        <UsersList />
      </Suspense>
    </div>
  )
}

// Skeleton loading state
function UsersSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(6).fill(0).map((_, i) => (
        <div key={i} className="p-4 shadow-md rounded-xl border border-gray-200 bg-white dark:bg-zinc-800 dark:border-zinc-700 h-full animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-zinc-700"></div>
            <div className="flex-1">
              <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-1/3"></div>
            </div>
          </div>
          <div className="mt-4 h-4 bg-gray-200 dark:bg-zinc-700 rounded w-full"></div>
          <div className="mt-4 flex justify-between">
            <div className="h-8 bg-gray-200 dark:bg-zinc-700 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 dark:bg-zinc-700 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

async function UsersList() {
  // Get users directly without artificial delay
  const users = await getUsers()
  
  if (users.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed border-gray-200 dark:border-zinc-700 rounded-xl p-8">
        <Users className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
        <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">No team members yet</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
          Start building your team by adding members to collaborate on tasks.
        </p>
        <Link href="/users/add" className="mt-6 inline-block">
          <Button className="flex items-center gap-1">
            <UserPlus className="w-4 h-4" />
            Add First Team Member
          </Button>
        </Link>
      </div>
    )
  }
  
  // Fetch the actual task counts for all users
  const taskCountsResult = await getUserTaskCounts();
  
  // Use the fetched task counts or default to empty object if there was an error
  const userTaskCounts: Record<number, number> = taskCountsResult.success && taskCountsResult.taskCounts 
    ? taskCountsResult.taskCounts 
    : {};
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map((user: User) => (
        <UserCard 
          key={user.id} 
          user={user} 
          taskCount={userTaskCounts[user.id] ?? 0} 
        />
      ))}
    </div>
  )
} 