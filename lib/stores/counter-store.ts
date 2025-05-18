'use client'

import { create } from 'zustand'
import { getUserCount } from '@/lib/actions'

interface CounterState {
  count: number | null
  fetchCount: () => void
}

export const useCounterStore = create<CounterState>((set) => ({
  count: null,
  fetchCount: async () => {
    try {
      const result = await getUserCount()
      set({ count: Number(result) })
    } catch (error) {
      console.error('Error getting user count:', error)
      set({ count: null })
    }
  }
})) 