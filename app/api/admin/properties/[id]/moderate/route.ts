import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Property from "@/models/property"
import { getUserFromToken } from "@/lib/auth"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Connect to database
    await dbConnect()

    const propertyId = params.id

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

    // Find property
    const property = await Property.findById(propertyId)

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Parse request body
    const { moderationStatus, moderationNotes } = await request.json()

    if (!moderationStatus) {
      return NextResponse.json({ error: "Moderation status is required" }, { status: 400 })
    }

    // Update property
    property.moderationStatus = moderationStatus
    if (moderationNotes) {
      property.moderationNotes = moderationNotes
    }

    // Save property
    await property.save()

    return NextResponse.json({ message: "Property moderation updated successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error moderating property:", error)
    return NextResponse.json({ error: "Failed to moderate property" }, { status: 500 })
  }
}
