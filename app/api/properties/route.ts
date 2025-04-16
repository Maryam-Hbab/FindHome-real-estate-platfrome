import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Property from "@/models/property"
import { getUserFromToken } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit-logger"
import { moderatePropertyListing } from "@/lib/content-moderation"

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

    console.log("Query:", JSON.stringify(query, null, 2))

    // Execute query
    const properties = await Property.find(query)
      .populate("agent", "firstName lastName email phoneNumber profileImage")
      .sort({ createdAt: -1 })

    console.log(`Found ${properties.length} properties matching the query`)
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

    // Moderate the property content
    const moderationResult = moderatePropertyListing({
      title: body.title,
      description: body.description,
    })

    // Set initial moderation status based on result and user role
    // If user is admin, auto-approve, otherwise check moderation result
    let moderationStatus = user.role === "admin" ? "Approved" : "Pending"

    // If content is flagged, mark it for review
    if (moderationResult.flagged) {
      moderationStatus = "Flagged"
    }

    // Create property with moderation status
    const property = await Property.create({
      ...body,
      agent: user.id,
      moderationStatus,
      moderationNotes: moderationResult.flagged
        ? `Flagged for review. Prohibited terms: ${moderationResult.prohibitedTerms.join(", ")}`
        : undefined,
    })

    // Create audit log
    await createAuditLog({
      action: "property_created",
      userId: user.id,
      targetType: "property",
      targetId: property._id,
      details: {
        propertyTitle: property.title,
        moderationStatus,
      },
    })

    // If property is pending (created by agent), notify admins
    if (moderationStatus === "Pending") {
      // You can implement notification logic here
      // This could be a call to a notification service
    }

    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    console.error("Error creating property:", error)
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 })
  }
}
