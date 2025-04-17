"use client"

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import SavedProperties from "@/components/saved-properties"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Heart } from "lucide-react"

export default function SavedPropertiesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login?callbackUrl=/saved-properties")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-3/4 bg-gray-200 rounded mb-8"></div>
          <div className="h-32 w-full bg-gray-200 rounded mb-4"></div>
          <div className="h-32 w-full bg-gray-200 rounded mb-4"></div>
          <div className="h-32 w-full bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Heart className="h-6 w-6 mr-2 text-emerald-600" />
            Saved Properties
          </h1>
          <p className="text-gray-600 mt-1">View and manage your saved properties</p>
        </div>
        <Button asChild>
          <Link href="/properties">Browse More Properties</Link>
        </Button>
      </div>

      <SavedProperties />
    </div>
  )
}
