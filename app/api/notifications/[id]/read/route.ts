import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Notification from "@/models/notification"
import { getUserFromToken } from "@/lib/auth"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Connect to database
    await dbConnect()

    const notificationId = params.id

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

    // Find notification
    const notification = await Notification.findById(notificationId)

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    // Check if notification belongs to user
    if (notification.user.toString() !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Mark as read
    notification.isRead = true
    await notification.save()

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
  }
}
