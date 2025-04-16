"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"

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

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()

  // Format relative time function
  const formatTimeAgo = (dateString: string, addSuffix = true) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    let result = ""

    if (diffInSeconds < 60) {
      result = `${diffInSeconds} second${diffInSeconds !== 1 ? "s" : ""}`
    } else {
      const diffInMinutes = Math.floor(diffInSeconds / 60)
      if (diffInMinutes < 60) {
        result = `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""}`
      } else {
        const diffInHours = Math.floor(diffInMinutes / 60)
        if (diffInHours < 24) {
          result = `${diffInHours} hour${diffInHours !== 1 ? "s" : ""}`
        } else {
          const diffInDays = Math.floor(diffInHours / 24)
          if (diffInDays < 30) {
            result = `${diffInDays} day${diffInDays !== 1 ? "s" : ""}`
          } else {
            const diffInMonths = Math.floor(diffInDays / 30)
            if (diffInMonths < 12) {
              result = `${diffInMonths} month${diffInMonths !== 1 ? "s" : ""}`
            } else {
              const diffInYears = Math.floor(diffInMonths / 12)
              result = `${diffInYears} year${diffInYears !== 1 ? "s" : ""}`
            }
          }
        }
      }
    }

    return addSuffix ? `${result} ago` : result
  }

  const fetchNotifications = async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await fetch("/api/notifications?limit=5")

      if (!response.ok) {
        throw new Error("Failed to fetch notifications")
      }

      const data = await response.json()
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchNotifications()

      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000)

      return () => clearInterval(interval)
    }
  }, [user])

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

      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
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

      setUnreadCount(0)

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

  if (!user) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No notifications</div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification._id}
              className={`p-3 cursor-pointer ${!notification.isRead ? "bg-gray-50" : ""}`}
              onClick={() => markAsRead(notification._id)}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}
                >
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{notification.title}</div>
                  <div className="text-sm text-gray-600">{notification.message}</div>
                  <div className="text-xs text-gray-400 mt-1">{formatTimeAgo(notification.createdAt, true)}</div>
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="w-full text-center cursor-pointer">
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
