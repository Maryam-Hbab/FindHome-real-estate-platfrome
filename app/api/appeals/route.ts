import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Appeal from "@/models/appeal"
import Property from "@/models/property"
import Notification from "@/models/notification"
import { getUserFromToken } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit-logger"
import User from "@/models/user"

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
    const status = searchParams.get("status")

    // Build query
    const query: any = {}

    // If user is not admin, only show their appeals
    if (user.role !== "admin") {
      query.agent = user.id
    }

    if (status) {
      query.status = status
    }

    // Execute query
    const appeals = await Appeal.find(query)
      .populate("property", "title address city state zipCode")
      .populate("agent", "firstName lastName email")
      .sort({ createdAt: -1 })

    return NextResponse.json(appeals)
  } catch (error) {
    console.error("Error fetching appeals:", error)
    return NextResponse.json({ error: "Failed to fetch appeals" }, { status: 500 })
  }
}

export async function POST(request: Request) {
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

    // Check if user is an agent
    if (user.role !== "agent") {
      return NextResponse.json({ error: "Only agents can submit appeals" }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { propertyId, reason } = body

    if (!propertyId || !reason) {
      return NextResponse.json({ error: "Property ID and reason are required" }, { status: 400 })
    }

    // Check if property exists and belongs to the agent
    const property = await Property.findById(propertyId)

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    if (property.agent.toString() !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Check if property is rejected (can only appeal rejected properties)
    if (property.moderationStatus !== "Rejected") {
      return NextResponse.json({ error: "Only rejected properties can be appealed" }, { status: 400 })
    }

    // Check if there's already a pending appeal for this property
    const existingAppeal = await Appeal.findOne({
      property: propertyId,
      status: "Pending",
    })

    if (existingAppeal) {
      return NextResponse.json({ error: "An appeal for this property is already pending" }, { status: 400 })
    }

    // Create appeal
    const appeal = await Appeal.create({
      property: propertyId,
      agent: user.id,
      reason,
    })

    // Create audit log
    await createAuditLog({
      action: "appeal_created",
      userId: user.id,
      targetType: "appeal",
      targetId: appeal._id,
      details: {
        propertyId,
        reason,
      },
    })

    // Notify admins
    // Find all admin users
    const admins = await User.find({ role: "admin" })

    if (admins && admins.length > 0) {
      // Create notifications for admins
      const notifications = admins.map((admin) => ({
        user: admin._id,
        title: "New Property Appeal",
        message: `An appeal has been submitted for property "${property.title}" and requires review.`,
        type: "info" as const,
        relatedTo: {
          type: "appeal",
          id: appeal._id,
        },
      }))

      // Save all notifications
      await Notification.insertMany(notifications)
    }

    return NextResponse.json(appeal, { status: 201 })
  } catch (error) {
    console.error("Error creating appeal:", error)
    return NextResponse.json({ error: "Failed to create appeal" }, { status: 500 })
  }
}
