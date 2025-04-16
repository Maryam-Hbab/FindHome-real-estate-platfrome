import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Notification from "@/models/notification"
import { getUserFromToken } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    // Connect to database
    await dbConnect()

    // Get the token from cookies
    const cookieHeader = request.headers.get("cookie")

    if (!cookieHeader) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Parse cookies
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((cookie) => {
        const [name, value] = cookie.split("=")
        return [name, value]
      }),
    )

    const token = cookies.auth_token

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get user from token
    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get URL and search params
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const unreadOnly = searchParams.get("unread") === "true"

    // Build query
    const query: any = { user: user.id }

    if (unreadOnly) {
      query.isRead = false
    }

    // Count unread notifications
    const unreadCount = await Notification.countDocuments({ user: user.id, isRead: false })

    // Execute query
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(limit)

    return NextResponse.json({
      notifications,
      unreadCount,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
