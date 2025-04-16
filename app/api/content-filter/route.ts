import { NextResponse } from "next/server"
import { moderatePropertyDescription } from "@/lib/content-moderation"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { text, title } = body

    if (!text && !title) {
      return NextResponse.json({ error: "No content provided for filtering" }, { status: 400 })
    }

    // Check text content
    const textResult = text ? moderatePropertyDescription(text) : null

    // Determine if content is flagged
    const isFlagged = textResult ? textResult.flagged : false

    // Collect reasons for flagging
    const reasons: string[] = []

    if (textResult && textResult.prohibitedTerms.length > 0) {
      reasons.push(...textResult.prohibitedTerms.map((term) => `Contains prohibited term: "${term}"`))
    }

    return NextResponse.json({
      isFlagged,
      reasons,
      moderationScore: textResult ? textResult.moderationScore : 0,
    })
  } catch (error) {
    console.error("Error filtering content:", error)
    return NextResponse.json({ error: "Failed to filter content" }, { status: 500 })
  }
}
