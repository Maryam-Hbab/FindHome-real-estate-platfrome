import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Property from "@/models/property"
import User from "@/models/user"
import { getUserFromToken } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit-logger"
import { createNotification } from "@/lib/notification-service"

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

    // Parse request body
    const body = await request.json()
    const { contentId, contentType, reason } = body

    if (!contentId || !contentType || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Handle different content types
    if (contentType === "property") {
      // Find property
      const property = await Property.findById(contentId)

      if (!property) {
        return NextResponse.json({ error: "Property not found" }, { status: 404 })
      }

      // Add report to property
      property.reports.push({
        userId: user.id,
        reason,
        timestamp: new Date(),
      })

      // Increment report count
      property.reportCount += 1

      // Auto-flag if report count exceeds threshold (e.g., 3)
      if (property.reportCount >= 3 && property.moderationStatus !== "Rejected") {
        property.moderationStatus = "Flagged"
      }

      // Save property
      await property.save()

      // Create audit log
      await createAuditLog({
        action: "property_reported",
        userId: user.id,
        targetType: "property",
        targetId: property._id,
        details: {
          reason,
          propertyTitle: property.title,
        },
      })

      // Notify admins
      const admins = await User.find({ role: "admin" })
      for (const admin of admins) {
        await createNotification({
          userId: admin._id,
          title: "Property Reported",
          message: `A property "${property.title}" has been reported and may require review.`,
          type: "warning",
          relatedTo: {
            type: "property",
            id: property._id,
          },
        })
      }

      return NextResponse.json({ message: "Property reported successfully" })
    } else {
      // Handle other content types (user, review, message, etc.)
      return NextResponse.json({ error: "Unsupported content type" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error reporting content:", error)
    return NextResponse.json({ error: "Failed to report content" }, { status: 500 })
  }
}
