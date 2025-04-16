import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Property from "@/models/property"
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

    // Extract filter parameters
    const moderationStatus = searchParams.get("moderationStatus")
    const agentId = searchParams.get("agent")

    // Build query
    const query: any = {}

    // If user is not admin, only show their properties
    if (user.role !== "admin") {
      query.agent = user.id
    } else if (agentId) {
      // If admin is filtering by agent
      query.agent = agentId
    }

    // Filter by moderation status if provided
    if (moderationStatus && moderationStatus !== "All") {
      query.moderationStatus = moderationStatus
    }

    // Execute query
    const properties = await Property.find(query).sort({ createdAt: -1 })

    return NextResponse.json(properties)
  } catch (error) {
    console.error("Error fetching properties:", error)
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 })
  }
}
