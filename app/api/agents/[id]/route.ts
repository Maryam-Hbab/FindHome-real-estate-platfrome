import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/models/user"
import Property from "@/models/property"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Connect to database
    await dbConnect()

    const agentId = params.id

    // Find agent by ID
    const agent = await User.findById(agentId)
      .select("firstName lastName email phoneNumber company licenseNumber profileImage")
      .lean()

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Get agent's properties
    const properties = await Property.find({
      agent: agentId,
      moderationStatus: "Approved",
    })
      .sort({ createdAt: -1 })
      .lean()

    // Return agent with properties
    return NextResponse.json({
      ...agent,
      properties,
    })
  } catch (error) {
    console.error("Error fetching agent:", error)
    return NextResponse.json({ error: "Failed to fetch agent" }, { status: 500 })
  }
}
