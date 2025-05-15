"use client"

import React from 'react';
import Link from 'next/link';
import { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ExternalLink, Briefcase, Mail, BarChart4, User as UserIcon, Pencil } from 'lucide-react';

// Map of roles to colors
const roleColors: Record<string, { bg: string; text: string }> = {
  'Developer': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'Designer': { bg: 'bg-purple-100', text: 'text-purple-700' },
  'Product Manager': { bg: 'bg-green-100', text: 'text-green-700' },
  'Marketing': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  'Sales': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'Support': { bg: 'bg-teal-100', text: 'text-teal-700' },
  'Admin': { bg: 'bg-red-100', text: 'text-red-700' },
  'default': { bg: 'bg-gray-100', text: 'text-gray-700' },
};

interface UserCardProps {
  user: User;
  taskCount?: number;
}

export function UserCard({ user, taskCount = 0 }: UserCardProps) {
  // Get the correct role color or default
  const { bg, text } = roleColors[user.role || ''] || roleColors.default;
  
  // Generate initials for avatar fallback
  const initials = user.name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  return (
    <div className="group">
      <div className="p-4 shadow-md rounded-xl border border-gray-200 hover:shadow-lg hover:border-primary/30 transition bg-white dark:bg-zinc-800 dark:border-zinc-700 h-full">
        {/* Main card content that links to user profile */}
        <Link href={`/users/${user.id}`} className="block">
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 dark:border-zinc-700"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-xl font-medium text-white">
                {initials}
              </div>
            )}
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{user.name}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`text-xs px-2 py-1 rounded-md font-medium ${bg} ${text} dark:bg-opacity-20`}>
                  {user.role || 'Team Member'}
                </span>
                
                {taskCount > 0 && (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md dark:bg-zinc-700 dark:text-gray-300">
                    {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Mail className="w-4 h-4 mr-2" />
            <span className="truncate">{user.email}</span>
          </div>
        </Link>
        
        {/* Action buttons - separate from main card link */}
        <div className="mt-4 flex justify-between items-center">
          <Link 
            href={`/users/${user.id}/dashboard`} 
            className="text-xs text-gray-500 hover:text-primary dark:text-gray-400 flex items-center"
          >
            <BarChart4 className="w-3.5 h-3.5 mr-1" />
            Dashboard
          </Link>
          
          <div className="flex gap-1">
            <Link href={`/users/${user.id}`}>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-lg px-2.5"
              >
                <UserIcon className="w-3.5 h-3.5" />
              </Button>
            </Link>
            
            <Link href={`/users/${user.id}/edit`}>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-lg px-2.5"
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 