"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardNotificationsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the main notifications page
    router.push("/notifications")
  }, [router])

  // Show loading state while redirecting
  return (
    <div className="container mx-auto py-10">
      <div className="animate-pulse">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
