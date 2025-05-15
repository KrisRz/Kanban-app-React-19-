"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PREDEFINED_AVATARS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface AvatarSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function AvatarSelector({ value, onChange }: AvatarSelectorProps) {
  const [gender, setGender] = useState<"male" | "female">("male")

  return (
    <div className="space-y-4">
      <Tabs 
        defaultValue="male" 
        onValueChange={(value: string) => setGender(value as "male" | "female")} 
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 p-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-zinc-800">
          <TabsTrigger value="male" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:text-primary">Male</TabsTrigger>
          <TabsTrigger value="female" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:text-primary">Female</TabsTrigger>
        </TabsList>
        
        <TabsContent value="male" className="mt-4">
          <div className="grid grid-cols-5 gap-3">
            {PREDEFINED_AVATARS.male.map((avatar, index) => (
              <div 
                key={avatar} 
                className={cn(
                  "relative cursor-pointer rounded-xl p-1.5 transition-all hover:bg-gray-100 dark:hover:bg-zinc-800",
                  value === avatar && "ring-2 ring-primary bg-gray-100 dark:bg-zinc-800"
                )}
                onClick={() => onChange(avatar)}
              >
                <Avatar className="h-16 w-16 mx-auto border-2 border-white dark:border-zinc-700 shadow-sm">
                  <AvatarImage src={avatar} alt={`Male avatar ${index + 1}`} />
                </Avatar>
                {value === avatar && (
                  <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-0.5">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="female" className="mt-4">
          <div className="grid grid-cols-5 gap-3">
            {PREDEFINED_AVATARS.female.map((avatar, index) => (
              <div 
                key={avatar} 
                className={cn(
                  "relative cursor-pointer rounded-xl p-1.5 transition-all hover:bg-gray-100 dark:hover:bg-zinc-800",
                  value === avatar && "ring-2 ring-primary bg-gray-100 dark:bg-zinc-800"
                )}
                onClick={() => onChange(avatar)}
              >
                <Avatar className="h-16 w-16 mx-auto border-2 border-white dark:border-zinc-700 shadow-sm">
                  <AvatarImage src={avatar} alt={`Female avatar ${index + 1}`} />
                </Avatar>
                {value === avatar && (
                  <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-0.5">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 