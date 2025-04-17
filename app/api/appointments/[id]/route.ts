import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Appointment from "@/models/appointment"
import { getUserFromToken } from "@/lib/auth"
import { createNotification } from "@/lib/notification-service"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Connect to database
    await dbConnect()

    const appointmentId = params.id

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

    // Find appointment
    const appointment = await Appointment.findById(appointmentId)

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    // Check if user is authorized to update this appointment
    if (appointment.agent.toString() !== user.id && appointment.client.toString() !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { status, notes } = body

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    // Update appointment
    appointment.status = status
    if (notes) {
      appointment.notes = notes
    }
    await appointment.save()

    // Notify the other party
    const notifyUserId = user.id === appointment.agent.toString() ? appointment.client : appointment.agent
    const statusMessage =
      status === "confirmed"
        ? "confirmed"
        : status === "cancelled"
          ? "cancelled"
          : status === "completed"
            ? "marked as completed"
            : status

    await createNotification({
      userId: notifyUserId.toString(),
      title: `Appointment ${statusMessage}`,
      message: `Your appointment has been ${statusMessage}${notes ? `: "${notes}"` : "."}`,
      type: status === "confirmed" ? "success" : status === "cancelled" ? "error" : "info",
      relatedTo: {
        type: "appointment",
        id: appointment._id,
      },
    })

    return NextResponse.json(appointment)
  } catch (error) {
    console.error("Error updating appointment:", error)
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 })
  }
}
