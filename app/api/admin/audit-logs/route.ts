import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import AuditLog from "@/models/audit-log"
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

    // Check if user is an admin
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Get URL and search params
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const action = searchParams.get("action")
    const targetType = searchParams.get("targetType")
    const userId = searchParams.get("userId")

    // Build query
    const query: any = {}

    if (action && action !== "all") {
      query.action = action
    }

    if (targetType && targetType !== "all") {
      query.targetType = targetType
    }

    if (userId) {
      query.user = userId
    }

    // Count total documents
    const total = await AuditLog.countDocuments(query)

    // Calculate pagination
    const skip = (page - 1) * limit
    const pages = Math.ceil(total / limit)

    // Execute query
    const auditLogs = await AuditLog.find(query)
      .populate("user", "firstName lastName email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    return NextResponse.json({
      auditLogs,
      pagination: {
        total,
        page,
        limit,
        pages,
      },
    })
  } catch (error) {
    console.error("Error fetching audit logs:", error)
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 })
  }
}
