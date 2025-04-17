"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Plus } from "lucide-react"
import Link from "next/link"
import PropertyComparison from "@/components/property-comparison"

export default function PropertyComparisonPage() {
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const addPropertyToComparison = (property: any) => {
    if (selectedPropertyIds.length < 3) {
      setSelectedPropertyIds([...selectedPropertyIds, property._id])
      setSearchQuery("")
      setSearchResults([])
    }
  }

  const removePropertyFromComparison = (propertyId: string) => {
    setSelectedPropertyIds(selectedPropertyIds.filter((id) => id !== propertyId))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Compare Properties</h1>
        <p className="text-gray-600">Compare different properties side by side to help make your decision</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {selectedPropertyIds.map((propertyId) => (
          <Card key={propertyId}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Property</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-2">Property ID: {propertyId}</p>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => removePropertyFromComparison(propertyId)}
              >
                Remove
              </Button>
            </CardContent>
          </Card>
        ))}

        {selectedPropertyIds.length < 3 && (
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
                      key={property._id}
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

      {selectedPropertyIds.length > 0 ? (
        <PropertyComparison propertyIds={selectedPropertyIds} onRemoveProperty={removePropertyFromComparison} />
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
