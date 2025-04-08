import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { z } from "zod"
import dbConnect from "@/lib/db"
import User from "@/models/user"

// Define validation schema
const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["user", "agent", "admin"]),
  company: z.string().optional(),
  licenseNumber: z.string().optional(),
  phoneNumber: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    console.log("Register API called")

    // Parse request body
    const body = await request.json()
    console.log("Request body:", JSON.stringify(body, null, 2))

    // Validate request data
    const validationResult = registerSchema.safeParse(body)

    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error.errors)
      return NextResponse.json({ error: "Validation error", details: validationResult.error.errors }, { status: 400 })
    }

    const { firstName, lastName, email, password, role, company, licenseNumber, phoneNumber } = validationResult.data

    // Connect to database
    console.log("Connecting to database...")
    try {
      await dbConnect()
      console.log("Database connected")
    } catch (dbError) {
      console.error("Database connection error:", dbError)
      return NextResponse.json(
        { error: "Database connection failed", details: dbError instanceof Error ? dbError.message : String(dbError) },
        { status: 500 },
      )
    }

    // Check if user already exists
    console.log("Checking if user exists...")
    try {
      const existingUser = await User.findOne({ email })

      if (existingUser) {
        console.log("User already exists")
        return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
      }
    } catch (findError) {
      console.error("Error checking existing user:", findError)
      return NextResponse.json(
        {
          error: "Error checking existing user",
          details: findError instanceof Error ? findError.message : String(findError),
        },
        { status: 500 },
      )
    }

    // Create user in database
    console.log("Creating user...")
    let user
    try {
      user = await User.create({
        firstName,
        lastName,
        email,
        password, // Will be hashed by the pre-save hook
        role,
        company,
        licenseNumber,
        phoneNumber,
      })
      console.log("User created successfully")
    } catch (createError) {
      console.error("Error creating user:", createError)
      return NextResponse.json(
        {
          error: "Error creating user",
          details: createError instanceof Error ? createError.message : String(createError),
        },
        { status: 500 },
      )
    }

    // Generate JWT token
    console.log("Generating JWT token...")
    let token
    try {
      token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "fallback_secret",
        { expiresIn: "7d" },
      )
      console.log("JWT token generated")
    } catch (jwtError) {
      console.error("Error generating JWT token:", jwtError)
      return NextResponse.json(
        {
          error: "Error generating authentication token",
          details: jwtError instanceof Error ? jwtError.message : String(jwtError),
        },
        { status: 500 },
      )
    }

    // Set HTTP-only cookie with the token
    console.log("Setting auth cookie...")
    const response = NextResponse.json(
      {
        message: "User registered successfully",
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

    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    console.log("Registration completed successfully")
    return response
  } catch (error) {
    console.error("Registration error:", error)
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

