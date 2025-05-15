import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Skeleton className="h-5 w-32" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="bg-muted/50">
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Skeleton className="h-32 w-32 rounded-full mb-4" />
              <Skeleton className="h-7 w-40 mb-2" />
              <Skeleton className="h-5 w-24 mb-4" />
              <Skeleton className="h-5 w-48 mb-6" />
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="bg-muted/50">
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="border rounded-md p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3 mt-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 