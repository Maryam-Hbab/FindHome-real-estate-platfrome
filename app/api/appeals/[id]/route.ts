import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Appeal from "@/models/appeal"
import Property from "@/models/property"
import Notification from "@/models/notification"
import { getUserFromToken } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit-logger"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Connect to database
    await dbConnect()

    const appealId = params.id

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

    // Find appeal
    const appeal = await Appeal.findById(appealId)
      .populate("property", "title address city state zipCode moderationStatus moderationNotes")
      .populate("agent", "firstName lastName email")

    if (!appeal) {
      return NextResponse.json({ error: "Appeal not found" }, { status: 404 })
    }

    // Check if user is authorized to view this appeal
    if (user.role !== "admin" && appeal.agent._id.toString() !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    return NextResponse.json(appeal)
  } catch (error) {
    console.error("Error fetching appeal:", error)
    return NextResponse.json({ error: "Failed to fetch appeal" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Connect to database
    await dbConnect()

    const appealId = params.id

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
      return NextResponse.json({ error: "Only admins can update appeals" }, { status: 403 })
    }

    // Find appeal
    const appeal = await Appeal.findById(appealId)

    if (!appeal) {
      return NextResponse.json({ error: "Appeal not found" }, { status: 404 })
    }

    // Parse request body
    const body = await request.json()
    const { status, adminNotes } = body

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    // Update appeal
    appeal.status = status
    if (adminNotes) {
      appeal.adminNotes = adminNotes
    }
    await appeal.save()

    // If appeal is approved, update property moderation status
    if (status === "Approved") {
      const property = await Property.findById(appeal.property)
      if (property) {
        property.moderationStatus = "Approved"
        await property.save()

        // Create audit log for property moderation update
        await createAuditLog({
          action: "property_moderation_updated",
          userId: user.id,
          targetType: "property",
          targetId: property._id,
          details: {
            previousStatus: "Rejected",
            newStatus: "Approved",
            appealId: appeal._id,
          },
        })
      }
    }

    // Create audit log for appeal update
    await createAuditLog({
      action: "appeal_updated",
      userId: user.id,
      targetType: "appeal",
      targetId: appeal._id,
      details: {
        status,
        adminNotes,
      },
    })

    // Notify agent
    await Notification.create({
      user: appeal.agent,
      title: `Appeal ${status === "Approved" ? "Approved" : "Rejected"}`,
      message:
        status === "Approved"
          ? `Your appeal for property has been approved. The property is now visible on the platform.`
          : `Your appeal for property has been rejected. Please review the admin notes for more information.`,
      type: status === "Approved" ? "success" : "error",
      relatedTo: {
        type: "appeal",
        id: appeal._id,
      },
    })

    return NextResponse.json(appeal)
  } catch (error) {
    console.error("Error updating appeal:", error)
    return NextResponse.json({ error: "Failed to update appeal" }, { status: 500 })
  }
}
