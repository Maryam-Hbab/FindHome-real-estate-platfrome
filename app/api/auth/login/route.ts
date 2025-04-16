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
    console.log("Login API called")

    // Connect to database
    await dbConnect()
    console.log("Database connected")

    // Parse request body
    const body = await request.json()
    console.log("Request body:", JSON.stringify(body, null, 2))

    // Validate request data
    const validationResult = loginSchema.safeParse(body)

    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error.errors)
      return NextResponse.json({ error: "Validation error", details: validationResult.error.errors }, { status: 400 })
    }

    const { email, password } = validationResult.data

    // Find user by email
    console.log("Finding user with email:", email)
    const user = await User.findOne({ email })

    if (!user) {
      console.log("User not found")
      return NextResponse.json(
        { error: "No account found with this email address. Please check your email or register." },
        { status: 401 },
      )
    }

    // Check if user is active
    if (user.isActive === false) {
      console.log("User account is inactive")
      return NextResponse.json(
        { error: "Your account has been deactivated. Please contact support for assistance." },
        { status: 403 },
      )
    }

    console.log("User found, checking password")
    // Verify password
    const passwordMatch = await user.comparePassword(password)

    if (!passwordMatch) {
      console.log("Password doesn't match")
      return NextResponse.json({ error: "Incorrect password. Please try again." }, { status: 401 })
    }

    console.log("Password matches, generating JWT")
    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" },
    )

    console.log("JWT generated, creating response")
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
          isActive: user.isActive,
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

    console.log("Login successful")
    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.stack : undefined) : undefined,
      },
      { status: 500 },
    )
  }
}
