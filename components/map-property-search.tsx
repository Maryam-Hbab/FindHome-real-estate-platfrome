"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Bed, Bath, Square, MapPin, List, MapIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import dynamic from "next/dynamic"

// Dynamically import the map component to avoid SSR issues
const PropertyMapWithNoSSR = dynamic(() => import("@/components/property-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full flex items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
    </div>
  ),
})

export default function MapPropertySearch() {
  const [viewMode, setViewMode] = useState<"list" | "map">("map")
  const [properties, setProperties] = useState<any[]>([])
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const mapRef = useRef<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Fetch properties from API
    const fetchProperties = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/properties")

        if (!response.ok) {
          throw new Error("Failed to fetch properties")
        }

        const data = await response.json()
        setProperties(data)
      } catch (error) {
        console.error("Error fetching properties:", error)
        setProperties([])
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  const handlePropertyClick = (propertyId: string) => {
    setSelectedProperty(propertyId)

    // Find the property
    const property = properties.find((p) => (p.id || p._id) === propertyId)

    // Center map on the property if map ref is available
    if (mapRef.current && property) {
      let lat, lng

      if (property.lat && property.lng) {
        lat = property.lat
        lng = property.lng
      } else if (property.location && property.location.coordinates) {
        lat = property.location.coordinates[1] // GeoJSON format: [longitude, latitude]
        lng = property.location.coordinates[0]
      }

      if (lat && lng) {
        mapRef.current.setView([lat, lng], 15)
      }
    }
  }

  const formatPrice = (price: number, status: string) => {
    return status === "For Rent" ? `$${price.toLocaleString()}/month` : `$${price.toLocaleString()}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Property Search</h1>
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "map")}>
          <TabsList>
            <TabsTrigger value="list" className="flex items-center">
              <List className="h-4 w-4 mr-2" />
              List View
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center">
              <MapIcon className="h-4 w-4 mr-2" />
              Map View
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-[600px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Property List */}
          {viewMode === "list" ? (
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} formatPrice={formatPrice} />
              ))}
            </div>
          ) : (
            <>
              {/* Property List Sidebar */}
              <div className="h-[600px] overflow-y-auto pr-2">
                {properties.map((property) => (
                  <div
                    key={property._id}
                    className={`mb-4 cursor-pointer transition-all ${
                      selectedProperty === (property.id || property._id)
                        ? "ring-2 ring-emerald-500 rounded-lg shadow-lg"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => handlePropertyClick(property.id || property._id)}
                  >
                    <PropertyCard property={property} formatPrice={formatPrice} compact={true} />
                  </div>
                ))}
              </div>

              {/* Map */}
              <div className="lg:col-span-2 h-[600px] bg-gray-100 rounded-lg overflow-hidden">
                <PropertyMapWithNoSSR
                  properties={properties}
                  selectedProperty={selectedProperty}
                  onMarkerClick={handlePropertyClick}
                  mapRef={mapRef}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

interface PropertyCardProps {
  property: any
  formatPrice: (price: number, status: string) => string
  compact?: boolean
}

function PropertyCard({ property, formatPrice, compact = false }: PropertyCardProps) {
  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow ${compact ? "flex" : ""}`}>
      <div className={`relative ${compact ? "w-1/3 flex-shrink-0" : ""}`}>
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
      </div>
      <CardContent className={`p-4 ${compact ? "w-2/3" : ""}`}>
        <Link href={`/properties/${property._id}`} className="hover:text-emerald-600">
          <h3 className={`font-semibold ${compact ? "text-base line-clamp-1" : "text-lg mb-1 line-clamp-1"}`}>
            {property.title}
          </h3>
        </Link>
        <div className="flex items-center text-gray-500 mb-2">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <p className="text-sm line-clamp-1">
            {property.address}, {property.city}, {property.state}
          </p>
        </div>
        <p className="font-bold text-lg text-emerald-600 mb-3">{formatPrice(property.price, property.status)}</p>

        {!compact && (
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
        )}

        {compact && (
          <div className="flex gap-3 text-gray-600 text-xs">
            <span>{property.bedrooms} beds</span>
            <span>{property.bathrooms} baths</span>
            <span>{property.area} sq ft</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
