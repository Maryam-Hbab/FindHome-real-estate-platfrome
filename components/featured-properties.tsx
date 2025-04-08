"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bed, Bath, Square, MapPin, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

// Mock property data
const mockProperties = [
  {
    id: "1",
    title: "Modern Apartment with City View",
    price: 450000,
    address: "123 Main St, New York, NY 10001",
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    type: "Apartment",
    status: "For Sale",
    image: "/placeholder.svg?height=300&width=500",
    isFeatured: true,
  },
  {
    id: "2",
    title: "Luxury Villa with Pool",
    price: 1250000,
    address: "456 Ocean Ave, Miami, FL 33139",
    bedrooms: 4,
    bathrooms: 3.5,
    area: 3200,
    type: "House",
    status: "For Sale",
    image: "/placeholder.svg?height=300&width=500",
    isFeatured: true,
  },
  {
    id: "3",
    title: "Cozy Studio in Downtown",
    price: 1800,
    address: "789 Urban St, San Francisco, CA 94105",
    bedrooms: 1,
    bathrooms: 1,
    area: 650,
    type: "Apartment",
    status: "For Rent",
    image: "/placeholder.svg?height=300&width=500",
    isFeatured: true,
  },
  {
    id: "4",
    title: "Spacious Family Home",
    price: 750000,
    address: "101 Suburban Rd, Austin, TX 78701",
    bedrooms: 5,
    bathrooms: 3,
    area: 2800,
    type: "House",
    status: "For Sale",
    image: "/placeholder.svg?height=300&width=500",
    isFeatured: true,
  },
]

export default function FeaturedProperties() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const fetchProperties = async () => {
      try {
        // In a real app, this would be an API call
        // const response = await fetch('/api/properties/featured')
        // const data = await response.json()

        // Using mock data for now
        setTimeout(() => {
          setProperties(mockProperties)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching properties:", error)
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
        <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative">
            <Link href={`/properties/${property.id}`}>
              <Image
                src={property.image || "/placeholder.svg"}
                alt={property.title}
                width={500}
                height={300}
                className="h-48 w-full object-cover"
              />
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
            <Link href={`/properties/${property.id}`} className="hover:text-emerald-600">
              <h3 className="font-semibold text-lg mb-1 line-clamp-1">{property.title}</h3>
            </Link>
            <div className="flex items-center text-gray-500 mb-2">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <p className="text-sm line-clamp-1">{property.address}</p>
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
            <Link href={`/properties/${property.id}`} className="w-full">
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

