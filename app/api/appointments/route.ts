import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Appointment from "@/models/appointment"
import { getUserFromToken } from "@/lib/auth"
import { createNotification } from "@/lib/notification-service"

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
    const { property, agent, date, notes } = body

    if (!property || !agent || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create appointment
    const appointment = await Appointment.create({
      property,
      agent,
      client: user.id,
      date,
      notes,
      status: "pending",
    })

    // Notify agent about the appointment
    await createNotification({
      userId: agent,
      title: "New Tour Request",
      message: `A client has requested a property tour for ${new Date(date).toLocaleString()}`,
      type: "info",
      relatedTo: {
        type: "appointment",
        id: appointment._id,
      },
    })

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error("Error creating appointment:", error)
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 })
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

    // Get URL and search params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    // Build query
    const query: any = {}

    // If user is an agent, show appointments where they are the agent
    if (user.role === "agent") {
      query.agent = user.id
    } else {
      // Otherwise, show appointments where they are the client
      query.client = user.id
    }

    // Filter by status if provided
    if (status) {
      query.status = status
    }

    // Execute query
    const appointments = await Appointment.find(query)
      .populate("property", "title address city state zipCode images")
      .populate("agent", "firstName lastName email phoneNumber profileImage")
      .populate("client", "firstName lastName email")
      .sort({ date: 1 })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 })
  }
}
