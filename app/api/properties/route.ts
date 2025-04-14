import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Property from "@/models/property"
import { getUserFromToken } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    // Connect to database
    await dbConnect()

    // Get URL and search params
    const { searchParams } = new URL(request.url)

    // Extract filter parameters
    const location = searchParams.get("location")
    const propertyType = searchParams.get("type")
    const status = searchParams.get("status")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const minBedrooms = searchParams.get("bedrooms")
    const featured = searchParams.get("featured")
    const moderationStatus = searchParams.get("moderationStatus")

    // Build query
    const query: any = {}

    // By default, only show approved properties to regular users
    if (!moderationStatus) {
      query.moderationStatus = "Approved"
    } else {
      // Allow admins to filter by moderation status
      query.moderationStatus = moderationStatus
    }

    if (location) {
      query.$or = [
        { address: { $regex: location, $options: "i" } },
        { city: { $regex: location, $options: "i" } },
        { state: { $regex: location, $options: "i" } },
        { zipCode: { $regex: location, $options: "i" } },
      ]
    }

    if (propertyType && propertyType !== "all") {
      query.type = propertyType
    }

    if (status === "for-sale") {
      query.status = "For Sale"
    } else if (status === "for-rent") {
      query.status = "For Rent"
    }

    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number.parseInt(minPrice)
      if (maxPrice) query.price.$lte = Number.parseInt(maxPrice)
    }

    if (minBedrooms && minBedrooms !== "any") {
      query.bedrooms = { $gte: Number.parseInt(minBedrooms) }
    }

    if (featured === "true") {
      query.isFeatured = true
    }

    // Execute query
    const properties = await Property.find(query)
      .populate("agent", "firstName lastName email phoneNumber profileImage")
      .sort({ createdAt: -1 })

    return NextResponse.json(properties)
  } catch (error) {
    console.error("Error fetching properties:", error)
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 })
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

    // Check if user is an agent or admin
    if (user.role !== "agent" && user.role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()

    // Set initial moderation status
    // If user is admin, auto-approve, otherwise set to pending
    const moderationStatus = user.role === "admin" ? "Approved" : "Pending"

    // Create property
    const property = await Property.create({
      ...body,
      agent: user.id,
      moderationStatus,
    })

    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    console.error("Error creating property:", error)
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 })
  }
}
