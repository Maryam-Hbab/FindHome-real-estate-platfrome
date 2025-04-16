"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface ContentFilterCheckProps {
  content: string
  onContinue: () => void
  onEdit: () => void
}

export function ContentFilterCheck({ content, onContinue, onEdit }: ContentFilterCheckProps) {
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<{
    isFlagged: boolean
    reasons: string[]
  } | null>(null)

  const checkContent = async () => {
    if (!content.trim()) {
      onContinue()
      return
    }

    setIsChecking(true)

    try {
      const response = await fetch("/api/content-filter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: content }),
      })

      if (!response.ok) {
        throw new Error("Failed to check content")
      }

      const data = await response.json()

      setResult(data)

      if (!data.isFlagged) {
        // If content is clean, continue automatically
        onContinue()
      }
    } catch (error) {
      console.error("Error checking content:", error)
      // On error, allow continuing anyway
      onContinue()
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div>
      {result?.isFlagged ? (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Content Warning</AlertTitle>
            <AlertDescription>
              Your content may violate our guidelines. Please review and edit before submitting.
            </AlertDescription>
          </Alert>

          <div className="bg-red-50 p-4 rounded-md border border-red-200">
            <h4 className="font-medium mb-2">Issues detected:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {result.reasons.map((reason, index) => (
                <li key={index} className="text-sm text-red-700">
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex space-x-3 justify-end">
            <Button variant="outline" onClick={onEdit}>
              Edit Content
            </Button>
            <Button onClick={onContinue}>Continue Anyway</Button>
          </div>
        </div>
      ) : (
        <Button onClick={checkContent} disabled={isChecking}>
          {isChecking ? "Checking..." : "Check Content"}
        </Button>
      )}
    </div>
  )
}
