import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import SavedProperty from "@/models/saved-property"
import { getUserFromToken } from "@/lib/auth"

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
    const { property } = body

    if (!property) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 })
    }

    // Check if property is already saved
    const existingSaved = await SavedProperty.findOne({
      user: user.id,
      property,
    })

    if (existingSaved) {
      return NextResponse.json({ message: "Property already saved" }, { status: 200 })
    }

    // Save property
    const savedProperty = await SavedProperty.create({
      user: user.id,
      property,
    })

    return NextResponse.json(savedProperty, { status: 201 })
  } catch (error) {
    console.error("Error saving property:", error)
    return NextResponse.json({ error: "Failed to save property" }, { status: 500 })
  }
}

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

    // Get saved properties
    const savedProperties = await SavedProperty.find({ user: user.id })
      .populate({
        path: "property",
        populate: {
          path: "agent",
          select: "firstName lastName email phoneNumber profileImage",
        },
      })
      .sort({ createdAt: -1 })

    return NextResponse.json(savedProperties)
  } catch (error) {
    console.error("Error fetching saved properties:", error)
    return NextResponse.json({ error: "Failed to fetch saved properties" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
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
    const { propertyId } = body

    if (!propertyId) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 })
    }

    // Delete saved property
    await SavedProperty.findOneAndDelete({
      user: user.id,
      property: propertyId,
    })

    return NextResponse.json({ message: "Property removed from saved list" }, { status: 200 })
  } catch (error) {
    console.error("Error removing saved property:", error)
    return NextResponse.json({ error: "Failed to remove saved property" }, { status: 500 })
  }
}
