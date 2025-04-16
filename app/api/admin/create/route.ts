import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/models/user"
import bcryptjs from "bcryptjs"
import { createAuditLog } from "@/lib/audit-logger"
import { rateLimit } from "@/lib/rate-limit"

// This should be a strong, environment-specific secret
const ADMIN_CREATION_KEY = process.env.ADMIN_CREATION_KEY

// Allowed IPs for admin creation (comma-separated list)
const ALLOWED_IPS = (process.env.ADMIN_ALLOWED_IPS || "").split(",").map((ip) => ip.trim())

// Rate limiter - 5 attempts per hour
const limiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 10, // Max 10 unique tokens per interval
})

export async function POST(request: Request) {
  try {
    // Get client IP
    const ip = request.headers.get("x-forwarded-for") || "unknown"

    // Check if IP is allowed (skip in development)
    if (process.env.NODE_ENV === "production" && ALLOWED_IPS.length > 0) {
      if (!ALLOWED_IPS.includes(ip)) {
        console.warn(`Unauthorized admin creation attempt from IP: ${ip}`)
        // Return 404 instead of 403 to hide the endpoint's existence
        return NextResponse.json({ error: "Not found" }, { status: 404 })
      }
    }

    // Apply rate limiting
    try {
      await limiter.check(5, `admin_create_${ip}`) // 5 requests per hour per IP
    } catch {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    // Connect to database
    await dbConnect()

    // Parse request body
    const body = await request.json()
    const { firstName, lastName, email, password, adminKey } = body

    // Verify admin creation key
    if (!ADMIN_CREATION_KEY || adminKey !== ADMIN_CREATION_KEY) {
      console.warn(`Invalid admin key used from IP: ${ip}`)
      return NextResponse.json({ error: "Invalid admin creation key" }, { status: 403 })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10)
    const hashedPassword = await bcryptjs.hash(password, salt)

    // Create admin user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "admin",
    })

    // Log the admin creation
    await createAuditLog({
      action: "admin_user_created",
      userId: user._id,
      targetType: "user",
      targetId: user._id,
      details: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdFrom: ip,
      },
    })

    return NextResponse.json(
      {
        message: "Admin user created successfully",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating admin:", error)
    return NextResponse.json({ error: "Failed to create admin user" }, { status: 500 })
  }
}
