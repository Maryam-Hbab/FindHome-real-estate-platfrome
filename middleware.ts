import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

// Define protected routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/properties/create",
  "/properties/edit",
  "/profile",
  "/messages",
  "/appointments",
  "/saved",
]

// Define routes that should redirect to dashboard if already authenticated
const authRoutes = ["/auth/login", "/auth/register"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get token from cookies
  const token = request.cookies.get("auth_token")?.value

  // Check if the path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Check if the path is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // If no token and trying to access protected route, redirect to login
  if (!token && isProtectedRoute) {
    const url = new URL("/auth/login", request.url)
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }

  // If token exists, verify it
  if (token) {
    try {
      // Simple JWT verification without database access
      // We'll use jose library which works in Edge Runtime
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret")

      await jwtVerify(token, secret)

      // If token is valid and user is trying to access auth routes, redirect to dashboard
      if (isAuthRoute) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    } catch (error) {
      // If token verification fails and route is protected, redirect to login
      if (isProtectedRoute) {
        const url = new URL("/auth/login", request.url)
        url.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(url)
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}

