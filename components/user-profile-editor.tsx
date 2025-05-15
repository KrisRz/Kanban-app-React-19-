"use client"

import { useState } from "react"
import { UserDialog } from "./user-dialog"
import { User } from "@/lib/types"

interface UserProfileEditorProps {
  user: User
}

export function UserProfileEditor({ user }: UserProfileEditorProps) {
  const [open, setOpen] = useState(true)
  
  return (
    <UserDialog
      mode="edit"
      open={open}
      onOpenChange={setOpen}
      user={user}
      embedded={true}
    />
  )
} 