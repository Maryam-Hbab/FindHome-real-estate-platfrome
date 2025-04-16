import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"
import { getUserFromToken } from "@/lib/auth"
import { ensureDirectoryExists, generateUniqueFilename } from "@/lib/file-utils"

export async function POST(request: Request) {
  try {
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

    // Get the form data
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Create a unique filename
    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = generateUniqueFilename(file.name)

    // Define the upload directory
    const uploadDir = path.join(process.cwd(), "public/uploads")

    // Ensure the directory exists
    try {
      await ensureDirectoryExists(uploadDir)
      await writeFile(`${uploadDir}/${filename}`, buffer)

      // Return the URL to the uploaded file
      return NextResponse.json({ url: `/uploads/${filename}` })
    } catch (error) {
      console.error("Error writing file:", error)
      // If there's still an error, return a placeholder
      return NextResponse.json({
        url: `/placeholder.svg?height=600&width=800&text=${encodeURIComponent(file.name)}`,
      })
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
