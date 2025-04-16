"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

interface Notification {
  _id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  relatedTo?: {
    type: string
    id: string
  }
  isRead: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  // Format relative time function to avoid TypeScript issues with date-fns
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? "s" : ""} ago`
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`
    }

    const diffInMonths = Math.floor(diffInDays / 30)
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths !== 1 ? "s" : ""} ago`
    }

    const diffInYears = Math.floor(diffInMonths / 12)
    return `${diffInYears} year${diffInYears !== 1 ? "s" : ""} ago`
  }

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    // Fetch notifications
    if (user) {
      const fetchNotifications = async () => {
        try {
          setIsLoading(true)
          const response = await fetch(`/api/notifications?limit=50${activeTab === "unread" ? "&unread=true" : ""}`)

          if (!response.ok) {
            throw new Error("Failed to fetch notifications")
          }

          const data = await response.json()
          setNotifications(data.notifications)
        } catch (error) {
          console.error("Error fetching notifications:", error)
          toast({
            title: "Error",
            description: "Failed to load notifications",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }

      fetchNotifications()
    }
  }, [user, loading, router, toast, activeTab])

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "PUT",
      })

      if (!response.ok) {
        throw new Error("Failed to mark notification as read")
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) => (notification._id === id ? { ...notification, isRead: true } : notification)),
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      })
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "PUT",
      })

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read")
      }

      // Update local state
      setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))

      toast({
        title: "Success",
        description: "All notifications marked as read",
      })
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      })
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✓"
      case "warning":
        return "⚠"
      case "error":
        return "✗"
      default:
        return "i"
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-600"
      case "warning":
        return "bg-amber-100 text-amber-600"
      case "error":
        return "bg-red-100 text-red-600"
      default:
        return "bg-blue-100 text-blue-600"
    }
  }

  const getRelatedLink = (relatedTo?: { type: string; id: string }) => {
    if (!relatedTo) return null

    switch (relatedTo.type) {
      case "property":
        return `/properties/${relatedTo.id}`
      case "message":
        return `/messages/${relatedTo.id}`
      case "appointment":
        return `/appointments/${relatedTo.id}`
      case "appeal":
        return `/appeals/${relatedTo.id}`
      default:
        return null
    }
  }

  if (loading || isLoading) {
    return <NotificationsSkeleton />
  }

  const hasUnread = notifications.some((notification) => !notification.isRead)

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <div className="flex space-x-2">
          {hasUnread && (
            <Button variant="outline" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Your Notifications</CardTitle>
          <CardDescription>Stay updated with important information about your account and properties</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {notifications.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No notifications found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-4 border rounded-lg ${!notification.isRead ? "bg-gray-50" : ""}`}
                      onClick={() => markAsRead(notification._id)}
                    >
                      <div className="flex items-start space-x-4">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-lg">{notification.title}</div>
                          <div className="text-gray-600 mt-1">{notification.message}</div>
                          <div className="flex justify-between items-center mt-2">
                            <div className="text-sm text-gray-400">{formatTimeAgo(notification.createdAt)}</div>
                            {notification.relatedTo && getRelatedLink(notification.relatedTo) && (
                              <Button variant="outline" size="sm" asChild>
                                <Link href={getRelatedLink(notification.relatedTo)!}>View Details</Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function NotificationsSkeleton() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-48 mb-6" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
