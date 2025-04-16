"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Home, Users, FileText, AlertTriangle, Activity, Shield } from "lucide-react"

interface DashboardStats {
  pendingProperties: number
  totalProperties: number
  totalUsers: number
  totalAgents: number
  flaggedProperties: number
  pendingAppeals: number
  totalMessages: number
  totalAppointments: number
}

export default function AdminDashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    pendingProperties: 0,
    totalProperties: 0,
    totalUsers: 0,
    totalAgents: 0,
    flaggedProperties: 0,
    pendingAppeals: 0,
    totalMessages: 0,
    totalAppointments: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && user) {
      if (user.role !== "admin") {
        router.push("/dashboard")
        return
      }

      fetchStats()
    }
  }, [user, loading, router])

  const fetchStats = async () => {
    try {
      setIsLoading(true)

      // Fetch pending properties count
      const pendingPropertiesResponse = await fetch("/api/properties?moderationStatus=Pending")
      const pendingProperties = await pendingPropertiesResponse.json()

      // Fetch flagged properties count
      const flaggedPropertiesResponse = await fetch("/api/properties?moderationStatus=Flagged")
      const flaggedProperties = await flaggedPropertiesResponse.json()

      // Fetch pending appeals count
      const pendingAppealsResponse = await fetch("/api/appeals?status=Pending")
      const pendingAppeals = await pendingAppealsResponse.json()

      // For now, we'll just use the length of these arrays
      // In a real app, you'd have dedicated API endpoints for stats
      setStats({
        pendingProperties: pendingProperties.length,
        totalProperties: 0, // Would fetch from a stats API
        totalUsers: 0,
        totalAgents: 0,
        flaggedProperties: flaggedProperties.length,
        pendingAppeals: pendingAppeals.length,
        totalMessages: 0,
        totalAppointments: 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Redirect if not an admin
  if (!loading && user && user.role !== "admin") {
    router.push("/dashboard")
    return null
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className={stats.pendingProperties > 0 ? "border-amber-500" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Home className="mr-2 h-5 w-5 text-emerald-600" />
                  Pending Properties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.pendingProperties}</div>
                <p className="text-sm text-gray-500">Properties awaiting moderation</p>
                <Button asChild variant="outline" className="w-full mt-4">
                  <Link href="/admin/moderation">View Moderation Queue</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className={stats.flaggedProperties > 0 ? "border-purple-500" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-purple-600" />
                  Flagged Properties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.flaggedProperties}</div>
                <p className="text-sm text-gray-500">Properties flagged for review</p>
                <Button asChild variant="outline" className="w-full mt-4">
                  <Link href="/admin/moderation?tab=Flagged">Review Flagged</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className={stats.pendingAppeals > 0 ? "border-blue-500" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-blue-600" />
                  Pending Appeals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.pendingAppeals}</div>
                <p className="text-sm text-gray-500">Appeals awaiting review</p>
                <Button asChild variant="outline" className="w-full mt-4">
                  <Link href="/admin/appeals">Review Appeals</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Users className="mr-2 h-5 w-5 text-emerald-600" />
                  Users & Agents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalUsers}</div>
                <p className="text-sm text-gray-500">Total users ({stats.totalAgents} agents)</p>
                <Button asChild variant="outline" className="w-full mt-4">
                  <Link href="/admin/users">Manage Users</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-emerald-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest actions on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <p>Activity log will appear here</p>
                </div>
                <Button asChild variant="outline" className="w-full mt-4">
                  <Link href="/admin/audit-logs">View Audit Logs</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-emerald-600" />
                  Admin Actions
                </CardTitle>
                <CardDescription>Quick access to common admin tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/admin/moderation">Property Moderation</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/admin/appeals">Manage Appeals</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/admin/users">User Management</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/admin/settings">Platform Settings</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
