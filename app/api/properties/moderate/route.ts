import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Property from "@/models/property"
import { getUserFromToken } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit-logger"
import { createPropertyModerationNotification } from "@/lib/notification-service"

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

    // Check if user is an admin
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { propertyId, action, notes } = body

    if (!propertyId || !action) {
      return NextResponse.json({ error: "Property ID and action are required" }, { status: 400 })
    }

    // Find property
    const property = await Property.findById(propertyId)

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Update property moderation status
    let newStatus: "Approved" | "Rejected"

    if (action === "approve") {
      newStatus = "Approved"
    } else if (action === "reject") {
      newStatus = "Rejected"
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Update property
    property.moderationStatus = newStatus
    if (notes) {
      property.moderationNotes = notes
    }

    await property.save()

    // Create audit log
    await createAuditLog({
      action: "property_moderation_updated",
      userId: user.id,
      targetType: "property",
      targetId: property._id,
      details: {
        previousStatus: property.moderationStatus,
        newStatus,
        notes,
      },
    })

    // Send notification to the agent
    await createPropertyModerationNotification(
      property._id.toString(),
      property.title,
      property.agent.toString(),
      newStatus,
      notes,
    )

    return NextResponse.json({
      message: `Property ${newStatus.toLowerCase()} successfully`,
      property,
    })
  } catch (error) {
    console.error("Error moderating property:", error)
    return NextResponse.json({ error: "Failed to moderate property" }, { status: 500 })
  }
}
