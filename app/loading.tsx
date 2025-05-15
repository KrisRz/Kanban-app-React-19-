import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Loading() {
  // Create three columns with skeleton tasks
  return (
    <main className="flex-1 container mx-auto px-4 py-4">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-28" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* To Do Column */}
          <div className="flex-1">
            <Card>
              <CardHeader className="bg-muted/50">
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="p-4 space-y-4 min-h-[200px]">
                {[1, 2, 3].map(i => (
                  <Card key={`todo-${i}`} className="shadow-sm">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <Skeleton className="h-5 w-4/5" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                    <div className="px-4 py-2 border-t flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
          
          {/* In Progress Column */}
          <div className="flex-1">
            <Card>
              <CardHeader className="bg-muted/50">
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="p-4 space-y-4 min-h-[200px]">
                {[1, 2].map(i => (
                  <Card key={`inprogress-${i}`} className="shadow-sm">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <Skeleton className="h-5 w-4/5" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                    <div className="px-4 py-2 border-t flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-5 w-24" />
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
          
          {/* Done Column */}
          <div className="flex-1">
            <Card>
              <CardHeader className="bg-muted/50">
                <Skeleton className="h-6 w-20" />
              </CardHeader>
              <CardContent className="p-4 space-y-4 min-h-[200px]">
                {[1, 2].map(i => (
                  <Card key={`done-${i}`} className="shadow-sm">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <Skeleton className="h-5 w-4/5" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                    <div className="px-4 py-2 border-t flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
} 