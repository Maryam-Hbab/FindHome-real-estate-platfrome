import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Property from "@/models/property"
import { getUserFromToken } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Connect to database
    await dbConnect()

    const propertyId = params.id

    // Find property by ID
    const property = await Property.findById(propertyId).populate(
      "agent",
      "firstName lastName email phoneNumber profileImage",
    )

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    return NextResponse.json(property)
  } catch (error) {
    console.error("Error fetching property:", error)
    return NextResponse.json({ error: "Failed to fetch property" }, { status: 500 })
  }
}

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

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

