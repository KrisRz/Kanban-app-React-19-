"use client"

import { useState } from "react"
import { UserDialog } from "./user-dialog"

export function UserCreator() {
  const [open, setOpen] = useState(true)
  
  return (
    <UserDialog
      mode="create"
      open={open}
      onOpenChange={setOpen}
      embedded={true}
    />
  )
} 