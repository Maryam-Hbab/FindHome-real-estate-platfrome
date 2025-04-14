import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Property from "@/models/property"
import { getUserFromToken } from "@/lib/auth"

// Define the report interface
interface PropertyReport {
  userId: string
  reason: string
  timestamp: Date
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
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

    // Find property
    const property = await Property.findById(propertyId)

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Parse request body
    const { reason } = await request.json()

    if (!reason) {
      return NextResponse.json({ error: "Reason is required" }, { status: 400 })
    }

    // Check if user has already reported this property
    const alreadyReported = property.reports.some((report: PropertyReport) => report.userId.toString() === user.id)

    if (alreadyReported) {
      return NextResponse.json({ error: "You have already reported this property" }, { status: 400 })
    }

    // Add report
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

    return NextResponse.json({ message: "Property reported successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error reporting property:", error)
    return NextResponse.json({ error: "Failed to report property" }, { status: 500 })
  }
}
