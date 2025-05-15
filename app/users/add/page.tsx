import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { UserCreator } from '@/components/user-creator'

export default function AddUserPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-6">
        <Link href="/users" className="flex items-center gap-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Users</span>
        </Link>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-primary" />
            Add New Team Member
          </h1>
        </div>
        
        <Card className="border-gray-200 dark:border-zinc-700 shadow-md rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-gray-800 dark:text-gray-200">User Information</CardTitle>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Enter the details for the new team member
            </p>
          </CardHeader>
          <CardContent>
            <UserCreator />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 