import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Property from "@/models/property"
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

   // Check if user is an agent or admin
   if (user.role !== "agent" && user.role !== "admin") {
     return NextResponse.json({ error: "Not authorized" }, { status: 403 })
   }

   // Build query
   const query: any = { agent: user.id }

   // Aggregate analytics
   const properties = await Property.find(query)
   const totalViews = properties.reduce((sum, property) => sum + property.views, 0)
   const totalInquiries = properties.reduce((sum, property) => sum + property.inquiries, 0)

   return NextResponse.json({
     totalProperties: properties.length,
     totalViews,
     totalInquiries,
   })
 } catch (error) {
   console.error("Error fetching agent analytics:", error)
   return NextResponse.json({ error: "Failed to fetch agent analytics" }, { status: 500 })
 }
}
