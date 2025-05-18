'use client'

import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'
import { Users } from 'lucide-react'
import { Badge } from './ui/badge'
import { usePathname } from 'next/navigation'
import { UserCounter } from './user-counter'

export function Navbar() {
  const pathname = usePathname()
  
  return (
    <div className="w-full flex justify-center mt-4">
      <nav className="border-2 border-gray-300 dark:border-gray-700 w-[95%]">
        <div className="flex h-16 items-center px-8 w-full">
          <Link href="/" className="font-bold text-xl">
            Kanban Board
          </Link>
          <div className="ml-auto flex items-center space-x-4">
            <Link 
              href="/users" 
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <Users className="h-4 w-4" />
              <span>Users</span>
              <UserCounter />
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </div>
  )
} 