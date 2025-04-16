import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/models/user"
import { getUserFromToken } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit-logger"
import { createNotification } from "@/lib/notification-service"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Connect to database
    await dbConnect()

    const userId = await params.id

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
    const adminUser = await getUserFromToken(token)

    if (!adminUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Check if user is an admin
    if (adminUser.role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Find user
    const user = await User.findById(userId).select("-password")

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Connect to database
    await dbConnect()

    const userId = await params.id

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
    const adminUser = await getUserFromToken(token)

    if (!adminUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Check if user is an admin
    if (adminUser.role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Find user
    const user = await User.findById(userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Parse request body
    const body = await request.json()
    const { firstName, lastName, email, role, isActive } = body

    // Check if trying to deactivate the last admin
    if (user.role === "admin" && (role !== "admin" || isActive === false)) {
      // Count active admins
      const adminCount = await User.countDocuments({ role: "admin", isActive: { $ne: false } })

      if (adminCount <= 1) {
        return NextResponse.json({ error: "Cannot deactivate the last admin" }, { status: 400 })
      }
    }

    // Update user
    const previousRole = user.role
    const previousActiveStatus = user.isActive

    if (firstName) user.firstName = firstName
    if (lastName) user.lastName = lastName
    if (email) user.email = email

    if (role) {
      user.role = role
    }

    if (isActive !== undefined) {
      user.isActive = isActive
    }

    await user.save()

    // Create audit log
    await createAuditLog({
      action: isActive === false ? "user_deactivated" : "user_updated",
      userId: adminUser.id,
      targetType: "user",
      targetId: user._id,
      details: {
        previousRole,
        newRole: user.role,
        previousActiveStatus,
        newActiveStatus: user.isActive,
        updatedFields: Object.keys(body),
      },
    })

    // If role changed, notify the user
    if (previousRole !== user.role) {
      await createNotification({
        userId: user._id.toString(),
        title: "Account Update",
        message: `Your account role has been updated from ${previousRole} to ${user.role}.`,
        type: "info",
      })
    }

    // If account was deactivated, notify the user
    if (previousActiveStatus !== false && isActive === false) {
      await createNotification({
        userId: user._id.toString(),
        title: "Account Deactivated",
        message: "Your account has been deactivated by an administrator. Please contact support for assistance.",
        type: "error",
      })
    }

    // If account was reactivated, notify the user
    if (previousActiveStatus === false && isActive === true) {
      await createNotification({
        userId: user._id.toString(),
        title: "Account Reactivated",
        message: "Your account has been reactivated. You can now log in to the platform.",
        type: "success",
      })
    }

    return NextResponse.json({
      message: isActive === false ? "User deactivated successfully" : "User updated successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
