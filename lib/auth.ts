import jwt from "jsonwebtoken"
import dbConnect from "@/lib/db"
import User from "@/models/user"

interface JwtPayload {
  userId: string
  email: string
  role: "user" | "agent" | "admin"
  iat: number
  exp: number
}

export async function verifyJwtToken(token: string): Promise<JwtPayload> {
  try {
    console.log("Verifying JWT token...")
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as JwtPayload
    console.log("JWT token verified successfully")
    return decoded
  } catch (error) {
    console.error("JWT verification error:", error)
    throw new Error(error instanceof Error ? error.message : "Invalid token")
  }
}

export async function getUserFromToken(token: string) {
  try {
    console.log("Getting user from token...")
    const payload = await verifyJwtToken(token)

    // Connect to database
    console.log("Connecting to database...")
    try {
      await dbConnect()
      console.log("Database connected")
    } catch (dbError) {
      console.error("Database connection error:", dbError)
      throw new Error("Database connection failed")
    }

    // Find user by ID
    console.log("Finding user by ID:", payload.userId)
    try {
      const user = await User.findById(payload.userId).select("-password")

      if (!user) {
        console.log("User not found")
        return null
      }

      console.log("User found successfully")
      return {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        company: user.company,
        licenseNumber: user.licenseNumber,
        phoneNumber: user.phoneNumber,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      }
    } catch (findError) {
      console.error("Error finding user:", findError)
      throw new Error("Error finding user")
    }
  } catch (error) {
    console.error("Error getting user from token:", error)
    return null
  }
}

