import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Create a response that clears the auth_token cookie
    const response = NextResponse.json({ message: "Logged out successfully" }, { status: 200 })

    // Clear the auth_token cookie
    response.cookies.set({
      name: "auth_token",
      value: "",
      expires: new Date(0),
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

