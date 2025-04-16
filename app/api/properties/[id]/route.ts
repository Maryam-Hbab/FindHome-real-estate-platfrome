import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Property from "@/models/property"
import { getUserFromToken } from "@/lib/auth"

// Update the GET function to handle both MongoDB ObjectIds and string IDs
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Connect to database
    await dbConnect()

    // Await the params object before accessing its properties
    const resolvedParams = await params
    const propertyId = resolvedParams.id

    if (!propertyId) {
      console.error("Property ID is undefined")
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 })
    }

    console.log("Fetching property with ID:", propertyId)

    // Find property by ID - handle both MongoDB ObjectId and string IDs
    let property

    try {
      // First try to find by MongoDB ObjectId
      property = await Property.findById(propertyId).populate(
        "agent",
        "firstName lastName email phoneNumber profileImage",
      )
    } catch (error) {
      // If that fails, try to find by custom id field
      console.log("Falling back to find by custom id field")
      property = await Property.findOne({ id: propertyId }).populate(
        "agent",
        "firstName lastName email phoneNumber profileImage",
      )
    }

    if (!property) {
      console.log("Property not found with ID:", propertyId)
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    console.log("Found property:", property.title)
    return NextResponse.json(property)
  } catch (error) {
    console.error("Error fetching property:", error)
    return NextResponse.json({ error: "Failed to fetch property" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Connect to database
    await dbConnect()

    // Await the params object before accessing its properties
    const resolvedParams = await params
    const propertyId = resolvedParams.id

    if (!propertyId) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 })
    }

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

    // Check if user is the agent who created the property or an admin
    if (property.agent.toString() !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()

    // Update property
    const updatedProperty = await Property.findByIdAndUpdate(
      propertyId,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).populate("agent", "firstName lastName email phoneNumber profileImage")

    return NextResponse.json(updatedProperty)
  } catch (error) {
    console.error("Error updating property:", error)
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Connect to database
    await dbConnect()

    // Await the params object before accessing its properties
    const resolvedParams = await params
    const propertyId = resolvedParams.id

    if (!propertyId) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 })
    }

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

    // Check if user is the agent who created the property or an admin
    if (property.agent.toString() !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Delete property
    await Property.findByIdAndDelete(propertyId)

    return NextResponse.json({ message: "Property deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting property:", error)
    return NextResponse.json({ error: "Failed to delete property" }, { status: 500 })
  }
}
