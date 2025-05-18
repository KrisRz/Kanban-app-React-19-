'use client'

import { Badge } from './ui/badge'
import { usePathname } from 'next/navigation'
import { useCounterStore } from '@/lib/stores/counter-store'
import { useEffect } from 'react'

export function UserCounter() {
  const pathname = usePathname()
  const { count, fetchCount } = useCounterStore()
  
  // Only fetch once when the component mounts (not polling)
  useEffect(() => {
    fetchCount()
  }, [fetchCount, pathname]) // Re-fetch only on navigation
  
  if (count === null) return null
  
  return (
    <Badge variant="secondary" className="ml-1 text-xs">
      {count}
    </Badge>
  )
} 