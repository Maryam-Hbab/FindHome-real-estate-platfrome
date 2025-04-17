"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Bed, Bath, Square, MapPin, Trash2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export default function SavedProperties() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [savedProperties, setSavedProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch saved properties
    const fetchSavedProperties = async () => {
      if (!user) return

      try {
        setLoading(true)
        const response = await fetch("/api/saved-properties")

        if (!response.ok) {
          throw new Error("Failed to fetch saved properties")
        }

        const data = await response.json()
        setSavedProperties(data)
      } catch (error) {
        console.error("Error fetching saved properties:", error)
        toast({
          title: "Error",
          description: "Failed to load saved properties",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSavedProperties()
  }, [user, toast])

  const handleRemoveProperty = async (id: string) => {
    try {
      const response = await fetch("/api/saved-properties", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: id }),
      })

      if (!response.ok) {
        throw new Error("Failed to remove property")
      }

      // Update local state
      setSavedProperties(savedProperties.filter((item) => item.property._id !== id))

      toast({
        title: "Property Removed",
        description: "Property has been removed from your saved list",
      })
    } catch (error) {
      console.error("Error removing property:", error)
      toast({
        title: "Error",
        description: "Failed to remove property",
        variant: "destructive",
      })
    }
  }

  const formatPrice = (price: number, status: string) => {
    return status === "For Rent" ? `$${price.toLocaleString()}/month` : `$${price.toLocaleString()}`
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  if (savedProperties.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium mb-2">No saved properties</h3>
        <p className="text-gray-500 mb-4">Properties you save will appear here</p>
        <Button asChild>
          <Link href="/properties">Browse Properties</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {savedProperties.map((item) => {
        const property = item.property
        return (
          <Card key={item._id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                <div className="relative h-48 sm:h-auto sm:w-1/3">
                  <Image
                    src={
                      property.images && property.images.length > 0
                        ? property.images[0]
                        : "/placeholder.svg?height=300&width=500"
                    }
                    alt={property.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 sm:w-2/3">
                  <div className="flex justify-between">
                    <div>
                      <Link href={`/properties/${property._id}`} className="hover:text-emerald-600">
                        <h3 className="font-semibold text-lg mb-1">{property.title}</h3>
                      </Link>
                      <div className="flex items-center text-gray-500 mb-2">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        <p className="text-sm">
                          {property.address}, {property.city}, {property.state}
                        </p>
                      </div>
                      <p className="font-bold text-lg text-emerald-600 mb-3">
                        {formatPrice(property.price, property.status)}
                      </p>
                      <div className="flex space-x-4 text-gray-600">
                        <div className="flex items-center">
                          <Bed className="h-4 w-4 mr-1" />
                          <span className="text-sm">{property.bedrooms}</span>
                        </div>
                        <div className="flex items-center">
                          <Bath className="h-4 w-4 mr-1" />
                          <span className="text-sm">{property.bathrooms}</span>
                        </div>
                        <div className="flex items-center">
                          <Square className="h-4 w-4 mr-1" />
                          <span className="text-sm">{property.area} sq ft</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRemoveProperty(property._id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button asChild variant="outline" className="flex-1">
                      <Link href={`/properties/${property._id}`}>View Details</Link>
                    </Button>
                    <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                      <Link href={`/properties/${property._id}`}>Schedule Tour</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
