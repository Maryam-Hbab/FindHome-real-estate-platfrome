"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Bed, Bath, Square, MapPin, DollarSign, Calendar, Home, Car, Trash2, Share } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Property {
  id: string
  title: string
  price: number
  address: string
  city: string
  state: string
  zipCode: string
  bedrooms: number
  bathrooms: number
  area: number
  yearBuilt: number
  parkingSpaces: number
  type: string
  status: string
  features: string[]
  image: string
}

interface PropertyComparisonProps {
  properties: Property[]
  onRemoveProperty: (id: string) => void
}

export default function PropertyComparison({ properties, onRemoveProperty }: PropertyComparisonProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [differences, setDifferences] = useState<Record<string, string[]>>({})

  // Calculate differences between properties
  useEffect(() => {
    if (properties.length <= 1) return

    const diffs: Record<string, string[]> = {}

    // Compare numeric properties
    const numericProps = ["price", "bedrooms", "bathrooms", "area", "yearBuilt", "parkingSpaces"]

    numericProps.forEach((prop) => {
      const values = properties.map((p) => (p as any)[prop])
      const min = Math.min(...values)
      const max = Math.max(...values)

      if (min !== max) {
        diffs[prop] = properties.map((p) => {
          const value = (p as any)[prop]
          if (value === max) return "highest"
          if (value === min) return "lowest"
          return ""
        })
      }
    })

    // Compare features
    const allFeatures = new Set<string>()
    properties.forEach((p) => p.features.forEach((f) => allFeatures.add(f)))

    if (allFeatures.size > 0) {
      diffs["features"] = properties.map((p) => {
        const missingFeatures = [...allFeatures].filter((f) => !p.features.includes(f))
        if (missingFeatures.length > 0) return "missing"
        return "all"
      })
    }

    setDifferences(diffs)
  }, [properties])

  if (properties.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Property Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No properties selected for comparison</p>
            <Button asChild>
              <Link href="/properties">Browse Properties</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString()}`
  }

  const getDifferenceClass = (prop: string, index: number) => {
    if (!differences[prop]) return ""

    const diff = differences[prop][index]
    if (diff === "highest") return "text-green-600 font-bold"
    if (diff === "lowest") return "text-red-600 font-bold"
    if (diff === "all") return "text-green-600 font-bold"
    return ""
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
          </TabsList>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="w-1/4 p-2"></th>
                  {properties.map((property, index) => (
                    <th key={property.id} className="p-2 min-w-[250px]">
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gray-100 hover:bg-gray-200"
                          onClick={() => onRemoveProperty(property.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <div className="relative h-40 w-full mb-2 rounded-md overflow-hidden">
                          <Image
                            src={property.image || "/placeholder.svg"}
                            alt={property.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <h3 className="font-medium text-left">{property.title}</h3>
                        <div className="flex items-center text-gray-500 text-sm mt-1">
                          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                          <p className="truncate">{property.address}</p>
                        </div>
                        <p className={`font-bold text-lg mt-1 ${getDifferenceClass("price", index)}`}>
                          {formatPrice(property.price)}
                        </p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {activeTab === "overview" && (
                  <>
                    <tr className="border-t">
                      <td className="p-3 font-medium bg-gray-50">Type</td>
                      {properties.map((property) => (
                        <td key={property.id} className="p-3 text-center">
                          {property.type}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 font-medium bg-gray-50">Status</td>
                      {properties.map((property) => (
                        <td key={property.id} className="p-3 text-center">
                          <Badge className={property.status === "For Sale" ? "bg-blue-600" : "bg-emerald-600"}>
                            {property.status}
                          </Badge>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 font-medium bg-gray-50">
                        <div className="flex items-center">
                          <Bed className="h-4 w-4 mr-2" />
                          Bedrooms
                        </div>
                      </td>
                      {properties.map((property, index) => (
                        <td key={property.id} className={`p-3 text-center ${getDifferenceClass("bedrooms", index)}`}>
                          {property.bedrooms}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 font-medium bg-gray-50">
                        <div className="flex items-center">
                          <Bath className="h-4 w-4 mr-2" />
                          Bathrooms
                        </div>
                      </td>
                      {properties.map((property, index) => (
                        <td key={property.id} className={`p-3 text-center ${getDifferenceClass("bathrooms", index)}`}>
                          {property.bathrooms}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 font-medium bg-gray-50">
                        <div className="flex items-center">
                          <Square className="h-4 w-4 mr-2" />
                          Area
                        </div>
                      </td>
                      {properties.map((property, index) => (
                        <td key={property.id} className={`p-3 text-center ${getDifferenceClass("area", index)}`}>
                          {property.area} sq ft
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 font-medium bg-gray-50">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Price per sq ft
                        </div>
                      </td>
                      {properties.map((property, index) => (
                        <td key={property.id} className={`p-3 text-center`}>
                          ${Math.round(property.price / property.area)}
                        </td>
                      ))}
                    </tr>
                  </>
                )}

                {activeTab === "details" && (
                  <>
                    <tr className="border-t">
                      <td className="p-3 font-medium bg-gray-50">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Year Built
                        </div>
                      </td>
                      {properties.map((property, index) => (
                        <td key={property.id} className={`p-3 text-center ${getDifferenceClass("yearBuilt", index)}`}>
                          {property.yearBuilt}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 font-medium bg-gray-50">
                        <div className="flex items-center">
                          <Car className="h-4 w-4 mr-2" />
                          Parking
                        </div>
                      </td>
                      {properties.map((property, index) => (
                        <td
                          key={property.id}
                          className={`p-3 text-center ${getDifferenceClass("parkingSpaces", index)}`}
                        >
                          {property.parkingSpaces} spaces
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 font-medium bg-gray-50">
                        <div className="flex items-center">
                          <Home className="h-4 w-4 mr-2" />
                          Property Type
                        </div>
                      </td>
                      {properties.map((property) => (
                        <td key={property.id} className="p-3 text-center">
                          {property.type}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 font-medium bg-gray-50">Lot Size</td>
                      {properties.map((property) => (
                        <td key={property.id} className="p-3 text-center">
                          0.25 acres
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 font-medium bg-gray-50">Heating/Cooling</td>
                      {properties.map((property) => (
                        <td key={property.id} className="p-3 text-center">
                          Central A/C
                        </td>
                      ))}
                    </tr>
                  </>
                )}

                {activeTab === "features" && (
                  <>
                    {[
                      "Air Conditioning",
                      "Balcony",
                      "Fireplace",
                      "Garage",
                      "Garden",
                      "Gym",
                      "Pool",
                      "Security System",
                      "Storage",
                      "Washer/Dryer",
                    ].map((feature) => (
                      <tr key={feature} className="border-t">
                        <td className="p-3 font-medium bg-gray-50">{feature}</td>
                        {properties.map((property, index) => (
                          <td key={property.id} className="p-3 text-center">
                            {property.features.includes(feature) ? (
                              <span className="text-green-600">✓</span>
                            ) : (
                              <span className="text-red-600">✗</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                )}

                {activeTab === "location" && (
                  <>
                    <tr className="border-t">
                      <td className="p-3 font-medium bg-gray-50">City</td>
                      {properties.map((property) => (
                        <td key={property.id} className="p-3 text-center">
                          {property.city}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 font-medium bg-gray-50">State</td>
                      {properties.map((property) => (
                        <td key={property.id} className="p-3 text-center">
                          {property.state}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 font-medium bg-gray-50">Zip Code</td>
                      {properties.map((property) => (
                        <td key={property.id} className="p-3 text-center">
                          {property.zipCode}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 font-medium bg-gray-50">Walk Score</td>
                      {properties.map((property) => (
                        <td key={property.id} className="p-3 text-center">
                          85/100
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 font-medium bg-gray-50">Transit Score</td>
                      {properties.map((property) => (
                        <td key={property.id} className="p-3 text-center">
                          75/100
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 font-medium bg-gray-50">School Rating</td>
                      {properties.map((property) => (
                        <td key={property.id} className="p-3 text-center">
                          8/10
                        </td>
                      ))}
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-6">
            <Button variant="outline" className="flex items-center">
              <Share className="h-4 w-4 mr-2" />
              Share Comparison
            </Button>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
