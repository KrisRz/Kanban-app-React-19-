import { getUserById } from '@/lib/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, UserCog } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { UserProfileEditor } from '@/components/user-profile-editor'

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userId = parseInt(id)
  
  if (isNaN(userId)) {
    notFound()
  }
  
  const user = await getUserById(userId)
  
  if (!user) {
    notFound()
  }
  
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-6">
        <Link href={`/users/${userId}`} className="flex items-center gap-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Profile</span>
        </Link>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UserCog className="w-6 h-6 text-primary" />
            Edit User Profile
          </h1>
        </div>
        
        <Card className="border-gray-200 dark:border-zinc-700 shadow-md rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-gray-800 dark:text-gray-200">User Information</CardTitle>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Update {user.name}'s profile details
            </p>
          </CardHeader>
          <CardContent>
            <UserProfileEditor user={user} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 