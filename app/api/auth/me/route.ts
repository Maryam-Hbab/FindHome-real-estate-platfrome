import { NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    console.log("Me API called")

    // Get the token from cookies
    const cookieHeader = request.headers.get("cookie")

    if (!cookieHeader) {
      console.log("No cookie header found")
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
      console.log("No auth_token cookie found")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log("Auth token found, verifying...")

    // Get user from token
    try {
      const user = await getUserFromToken(token)

      if (!user) {
        console.log("Invalid or expired token")
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
      }

      console.log("User authenticated successfully")
      return NextResponse.json(user)
    } catch (tokenError) {
      console.error("Token verification error:", tokenError)
      return NextResponse.json(
        {
          error: "Authentication error",
          details: tokenError instanceof Error ? tokenError.message : String(tokenError),
        },
        { status: 401 },
      )
    }
  } catch (error) {
    console.error("Auth error:", error)
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

