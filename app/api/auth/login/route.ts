import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { z } from "zod"
import dbConnect from "@/lib/db"
import User from "@/models/user"

// Define validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export async function POST(request: Request) {
  try {
    // Connect to database
    await dbConnect()

    // Parse request body
    const body = await request.json()

    // Validate request data
    const validationResult = loginSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ error: "Validation error", details: validationResult.error.errors }, { status: 400 })
    }

    const { email, password } = validationResult.data

    // Find user by email
    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const passwordMatch = await user.comparePassword(password)

    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" },
    )

    // Set HTTP-only cookie with the token
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          company: user.company,
          licenseNumber: user.licenseNumber,
          phoneNumber: user.phoneNumber,
          profileImage: user.profileImage,
        },
      },
      { status: 200 },
    )

    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

