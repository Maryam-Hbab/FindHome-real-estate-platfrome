"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import bcryptjs from "bcryptjs"

export default function GenerateHash() {
  const [password, setPassword] = useState("")
  const [hash, setHash] = useState("")

  const generateHash = async () => {
    try {
      const salt = await bcryptjs.genSalt(10)
      const passwordHash = await bcryptjs.hash(password, salt)
      setHash(passwordHash)
    } catch (error) {
      console.error("Error generating hash:", error)
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Password Hash Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password to hash"
            />
          </div>

          <Button onClick={generateHash} className="w-full">
            Generate Hash
          </Button>

          {hash && (
            <div className="space-y-2 pt-4">
              <label className="text-sm font-medium">Generated Hash:</label>
              <div className="p-3 bg-gray-100 rounded-md break-all text-sm">{hash}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
