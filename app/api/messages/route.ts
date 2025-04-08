import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Message from "@/models/message"
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
    const otherUserId = searchParams.get("otherUserId")

    // Build query
    const query: any = {
      $or: [
        { sender: user.id, receiver: otherUserId },
        { sender: otherUserId, receiver: user.id },
      ],
    }

    // If no otherUserId is provided, get all conversations
    if (!otherUserId) {
      query.$or = [{ sender: user.id }, { receiver: user.id }]
    }

    // Execute query
    const messages = await Message.find(query)
      .populate("sender", "firstName lastName email profileImage")
      .populate("receiver", "firstName lastName email profileImage")
      .populate("property", "title images")
      .sort({ createdAt: 1 })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
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

    // Parse request body
    const body = await request.json()

    // Create message
    const message = await Message.create({
      sender: user.id,
      receiver: body.receiver,
      property: body.property,
      content: body.content,
    })

    // Populate message
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "firstName lastName email profileImage")
      .populate("receiver", "firstName lastName email profileImage")
      .populate("property", "title images")

    return NextResponse.json(populatedMessage, { status: 201 })
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 })
  }
}

