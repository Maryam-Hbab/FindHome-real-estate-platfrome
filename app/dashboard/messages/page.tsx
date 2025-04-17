"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardMessagesPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the main messages page
    router.push("/messages")
  }, [router])

  // Show loading state while redirecting
  return (
    <div className="container mx-auto py-10">
      <div className="animate-pulse">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[600px] w-full" />
          <Skeleton className="h-[600px] w-full md:col-span-2" />
        </div>
      </div>
    </div>
  )
}
