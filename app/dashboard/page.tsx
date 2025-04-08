"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardData {
  recentProperties: any[]
  savedProperties: any[]
  messages: any[]
  appointments: any[]
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    recentProperties: [],
    savedProperties: [],
    messages: [],
    appointments: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    // Fetch dashboard data
    if (user) {
      // This would normally fetch data from your API
      // For now, we'll just simulate a delay
      const timer = setTimeout(() => {
        setDashboardData({
          recentProperties: [],
          savedProperties: [],
          messages: [],
          appointments: [],
        })
        setIsLoading(false)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [user, loading, router])

  if (loading || isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.firstName}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Properties</CardTitle>
            <CardDescription>Manage your properties</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <Button asChild className="w-full mt-4">
              <Link href="/properties">View Properties</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Saved</CardTitle>
            <CardDescription>Your saved properties</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{dashboardData.savedProperties.length}</p>
            <Button asChild className="w-full mt-4">
              <Link href="/saved">View Saved</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Messages</CardTitle>
            <CardDescription>Your conversations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{dashboardData.messages.length}</p>
            <Button asChild className="w-full mt-4">
              <Link href="/messages">View Messages</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Appointments</CardTitle>
            <CardDescription>Upcoming viewings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{dashboardData.appointments.length}</p>
            <Button asChild className="w-full mt-4">
              <Link href="/appointments">View Appointments</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-center py-10">No recent activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended Properties</CardTitle>
            <CardDescription>Based on your preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-center py-10">No recommendations yet</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto py-10">
      <Skeleton className="h-10 w-64 mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-8 mb-4" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

