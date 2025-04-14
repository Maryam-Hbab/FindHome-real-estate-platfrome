"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Plus } from "lucide-react"
import Link from "next/link"
import PropertyComparison from "@/components/property-comparison"

// Mock property data
const mockProperties = [
  {
    id: "1",
    title: "Modern Apartment with City View",
    price: 450000,
    address: "123 Main St",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    yearBuilt: 2015,
    parkingSpaces: 1,
    type: "Apartment",
    status: "For Sale",
    features: ["Air Conditioning", "Balcony", "Gym", "Security System", "Storage", "Washer/Dryer"],
    image: "/placeholder.svg?height=300&width=500",
  },
  {
    id: "2",
    title: "Luxury Villa with Pool",
    price: 1250000,
    address: "456 Ocean Ave",
    city: "Miami",
    state: "FL",
    zipCode: "33139",
    bedrooms: 4,
    bathrooms: 3.5,
    area: 3200,
    yearBuilt: 2010,
    parkingSpaces: 2,
    type: "House",
    status: "For Sale",
    features: ["Air Conditioning", "Garage", "Garden", "Pool", "Security System"],
    image: "/placeholder.svg?height=300&width=500",
  },
  {
    id: "3",
    title: "Cozy Studio in Downtown",
    price: 1800,
    address: "789 Urban St",
    city: "San Francisco",
    state: "CA",
    zipCode: "94105",
    bedrooms: 1,
    bathrooms: 1,
    area: 650,
    yearBuilt: 2005,
    parkingSpaces: 0,
    type: "Apartment",
    status: "For Rent",
    features: ["Air Conditioning", "Storage", "Washer/Dryer"],
    image: "/placeholder.svg?height=300&width=500",
  },
]

export default function PropertyComparisonPage() {
  const [selectedProperties, setSelectedProperties] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Handle search
  useEffect(() => {
    if (searchQuery.length > 2) {
      setIsSearching(true)

      // Simulate API search
      setTimeout(() => {
        const results = mockProperties.filter(
          (property) =>
            property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
            property.city.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        setSearchResults(results)
        setIsSearching(false)
      }, 500)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const addPropertyToComparison = (property: any) => {
    if (selectedProperties.length < 3) {
      setSelectedProperties([...selectedProperties, property])
      setSearchQuery("")
      setSearchResults([])
    }
  }

  const removePropertyFromComparison = (propertyId: string) => {
    setSelectedProperties(selectedProperties.filter((p) => p.id !== propertyId))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Compare Properties</h1>
        <p className="text-gray-600">Compare different properties side by side to help make your decision</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {selectedProperties.map((property) => (
          <Card key={property.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{property.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-2">{property.address}</p>
              <p className="font-bold text-lg text-emerald-600">${property.price.toLocaleString()}</p>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => removePropertyFromComparison(property.id)}
              >
                Remove
              </Button>
            </CardContent>
          </Card>
        ))}

        {selectedProperties.length < 3 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Add Property</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search properties..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {isSearching && (
                <div className="mt-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-emerald-600 mx-auto"></div>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map((property) => (
                    <div
                      key={property.id}
                      className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                      onClick={() => addPropertyToComparison(property)}
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{property.title}</p>
                          <p className="text-sm text-gray-600">{property.address}</p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery.length > 2 && searchResults.length === 0 && !isSearching && (
                <div className="mt-4 text-center text-gray-500">No properties found. Try a different search.</div>
              )}

              {searchQuery.length <= 2 && (
                <div className="mt-4 text-center">
                  <p className="text-gray-500 mb-4">Search for properties to compare</p>
                  <Button asChild>
                    <Link href="/properties">Browse Properties</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {selectedProperties.length > 0 ? (
        <PropertyComparison properties={selectedProperties} onRemoveProperty={removePropertyFromComparison} />
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">No Properties Selected</h2>
          <p className="text-gray-600 mb-6">Add properties to start comparing</p>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/properties">Browse Properties</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
