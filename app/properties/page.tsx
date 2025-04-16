"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bed, Bath, Square, MapPin, Search, SlidersHorizontal } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import PropertyMap from "@/components/property-map"

export default function PropertiesPage() {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid")

  // Filter states
  const [location, setLocation] = useState(searchParams.get("location") || "")
  const [propertyType, setPropertyType] = useState(searchParams.get("type") || "")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000])
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") || "")
  const [bathrooms, setBathrooms] = useState("")
  const [status, setStatus] = useState(searchParams.get("status") || "for-sale")

  useEffect(() => {
    // Fetch properties from API with filters
    const fetchProperties = async () => {
      try {
        setLoading(true)

        // Build query parameters
        const params = new URLSearchParams()

        if (location) params.append("location", location)
        if (propertyType && propertyType !== "all") params.append("type", propertyType)

        // Handle status
        if (status === "for-sale") {
          params.append("status", "For Sale")
        } else if (status === "for-rent") {
          params.append("status", "For Rent")
        }

        // Handle price range
        if (priceRange[0] > 0) params.append("minPrice", priceRange[0].toString())
        if (priceRange[1] < 2000000) params.append("maxPrice", priceRange[1].toString())

        // Handle bedrooms
        if (bedrooms && bedrooms !== "any") params.append("bedrooms", bedrooms)

        // Handle bathrooms
        if (bathrooms && bathrooms !== "any") params.append("bathrooms", bathrooms)

        // Fetch properties from API
        const response = await fetch(`/api/properties?${params.toString()}`)

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
  }, [location, propertyType, priceRange, bedrooms, bathrooms, status])

  const formatPrice = (price: number, status: string) => {
    return status === "For Rent" ? `$${price.toLocaleString()}/month` : `$${price.toLocaleString()}`
  }

  const toggleFilters = () => {
    setFiltersOpen(!filtersOpen)
  }

  const handleApplyFilters = () => {
    // This will trigger the useEffect to fetch properties with the current filters
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Properties</h1>
          <p className="text-gray-600">Find your perfect property</p>
        </div>

        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            onClick={() => setViewMode("grid")}
            className={viewMode === "grid" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
          >
            Grid View
          </Button>
          <Button
            variant={viewMode === "map" ? "default" : "outline"}
            onClick={() => setViewMode("map")}
            className={viewMode === "map" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
          >
            Map View
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters */}
        <div className="lg:w-1/4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Filters</h2>
              <Button variant="ghost" size="sm" onClick={toggleFilters} className="lg:hidden">
                {filtersOpen ? "Hide" : "Show"}
              </Button>
            </div>

            <div className={`space-y-6 ${filtersOpen ? "block" : "hidden lg:block"}`}>
              <div className="space-y-2">
                <label className="font-medium">Location</label>
                <Input
                  placeholder="City, neighborhood, or address"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="font-medium">Property Type</label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="House">House</SelectItem>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="Condo">Condo</SelectItem>
                    <SelectItem value="Townhouse">Townhouse</SelectItem>
                    <SelectItem value="Land">Land</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="font-medium">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="For Sale" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="for-sale">For Sale</SelectItem>
                    <SelectItem value="for-rent">For Rent</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="font-medium">Price Range</label>
                <div className="pt-6 pb-2">
                  <Slider
                    defaultValue={[0, 2000000]}
                    max={2000000}
                    step={50000}
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>${priceRange[0].toLocaleString()}</span>
                  <span>${priceRange[1].toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-medium">Bedrooms</label>
                <Select value={bedrooms} onValueChange={setBedrooms}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="font-medium">Bathrooms</label>
                <Select value={bathrooms} onValueChange={setBathrooms}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleApplyFilters}>
                <Search className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Property Listings */}
        <div className="lg:w-3/4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
            </div>
          ) : (
            <>
              {viewMode === "grid" ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-gray-600">{properties.length} properties found</p>
                    <div className="flex items-center">
                      <Button variant="outline" size="sm" className="flex items-center">
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        Sort by: Newest
                      </Button>
                    </div>
                  </div>

                  {properties.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow-md text-center">
                      <h3 className="text-xl font-semibold mb-2">No properties found</h3>
                      <p className="text-gray-600 mb-4">Try adjusting your search filters</p>
                      <Button
                        onClick={() => {
                          setLocation("")
                          setPropertyType("")
                          setPriceRange([0, 2000000])
                          setBedrooms("")
                          setBathrooms("")
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            <p className="font-bold text-lg text-emerald-600 mb-3">
                              {formatPrice(property.price, property.status)}
                            </p>
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
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-[600px] w-full">
                    <PropertyMap properties={properties} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
