import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/models/user"
import Property from "@/models/property"

export async function GET(request: Request) {
  try {
    // Connect to database
    await dbConnect()

    // Get URL and search params
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const specialization = searchParams.get("specialization")
    const sortBy = searchParams.get("sortBy") || "name"

    // Build query
    const query: any = { role: "agent", isActive: { $ne: false } }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ]
    }

    // Execute query
    const agents = await User.find(query)
      .select("firstName lastName email phoneNumber company licenseNumber profileImage createdAt")
      .sort({ firstName: 1, lastName: 1 })
      .lean()

    // Get property counts for each agent
    const agentsWithStats = await Promise.all(
      agents.map(async (agent) => {
        const propertyCount = await Property.countDocuments({
          agent: agent._id,
          moderationStatus: "Approved",
        })

        const forSaleCount = await Property.countDocuments({
          agent: agent._id,
          status: "For Sale",
          moderationStatus: "Approved",
        })

        const forRentCount = await Property.countDocuments({
          agent: agent._id,
          status: "For Rent",
          moderationStatus: "Approved",
        })

        // Explicitly type the returned object to include createdAt
        return {
          ...agent,
          propertyCount,
          forSaleCount,
          forRentCount,
          // Ensure createdAt is properly typed
          createdAt: agent.createdAt,
        }
      }),
    )

    // Sort agents based on sortBy parameter
    const sortedAgents = [...agentsWithStats]

    if (sortBy === "properties") {
      sortedAgents.sort((a, b) => b.propertyCount - a.propertyCount)
    } else if (sortBy === "recent") {
      // Use type assertion to tell TypeScript that createdAt exists
      sortedAgents.sort((a, b) => {
        const dateA = new Date(a.createdAt as string).getTime()
        const dateB = new Date(b.createdAt as string).getTime()
        return dateB - dateA
      })
    }

    return NextResponse.json(sortedAgents)
  } catch (error) {
    console.error("Error fetching agents:", error)
    return NextResponse.json({ error: "Failed to fetch agents" }, { status: 500 })
  }
}
