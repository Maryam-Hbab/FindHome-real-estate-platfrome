"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bed, Bath, Square, MapPin, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export default function FeaturedProperties() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch featured properties from API
    const fetchProperties = async () => {
      try {
        setLoading(true)
        // Add featured=true parameter to get only featured properties
        const response = await fetch("/api/properties?featured=true")

        if (!response.ok) {
          throw new Error("Failed to fetch featured properties")
        }

        const data = await response.json()
        setProperties(data)
      } catch (error) {
        console.error("Error fetching featured properties:", error)
        setProperties([])
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  const formatPrice = (price: number, status: string) => {
    return status === "For Rent" ? `$${price.toLocaleString()}/month` : `$${price.toLocaleString()}`
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {properties.map((property) => (
        <Card key={property._id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative">
            <Link href={`/properties/${property._id}`}>
              <div className="relative h-48 w-full">
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
            </Link>
            <Badge className="absolute top-2 left-2 bg-emerald-600">{property.status}</Badge>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white text-rose-500 hover:text-rose-600"
            >
              <Heart className="h-5 w-5" />
            </Button>
          </div>
          <CardContent className="p-4">
            <Link href={`/properties/${property._id}`} className="hover:text-emerald-600">
              <h3 className="font-semibold text-lg mb-1 line-clamp-1">{property.title}</h3>
            </Link>
            <div className="flex items-center text-gray-500 mb-2">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <p className="text-sm line-clamp-1">
                {property.address}, {property.city}, {property.state}
              </p>
            </div>
            <p className="font-bold text-lg text-emerald-600 mb-3">{formatPrice(property.price, property.status)}</p>
            <div className="flex justify-between text-gray-600">
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
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Link href={`/properties/${property._id}`} className="w-full">
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
