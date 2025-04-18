"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, TrendingUp, School, Coffee, Car, ParkingMeterIcon as Park } from "lucide-react"

// Mock neighborhood data
const neighborhoods = [
  {
    id: "Maarif",
    name: "Maarif",
    city: "Casablanca",
    description: "A vibrant urban center with high-rise apartments, cultural attractions, and a bustling nightlife.",
    image: "/placeholder.svg?height=300&width=500",
    averagePrice: 750000,
    priceChange: 5.2,
    walkScore: 95,
    transitScore: 98,
    schools: 4.2,
    amenities: ["Restaurants", "Shopping", "Arts", "Nightlife"],
    tags: ["Urban", "Walkable", "Nightlife"],
  },
  {
    id: "Targa",
    name: "Targa",
    city: "Marrakech",
    description:
      "Residential, quiet, many Moroccan and expatriate families.",
    image: "/placeholder.svg?height=300&width=500",
    averagePrice: 1200000,
    priceChange: 3.8,
    walkScore: 92,
    transitScore: 90,
    schools: 4.5,
    amenities: ["Parks", "Schools", "Cafes", "Waterfront"],
    tags: ["Historic", "Family-Friendly", "Scenic"],
  },
  {
    id: "Harhoura & Temara Plage",
    name: "Harhoura & Temara Plage",
    city: "Rabat",
    description: "Seaside areas south of Rabat, very popular for second homes or family homes.",
    image: "/placeholder.svg?height=300&width=500",
    averagePrice: 520000,
    priceChange: 2.9,
    walkScore: 91,
    transitScore: 82,
    schools: 4.0,
    amenities: ["Waterfront", "Parks", "Shopping", "Dining"],
    tags: ["Waterfront", "Trendy", "Active"],
  },
  {
    id: "Anfa Supérieur",
    name: "Anfa Supérieur",
    city: "Casablanca",
    description: "Upscale residential area known for luxury homes, excellent schools, and upscale shopping.",
    image: "/placeholder.svg?height=300&width=500",
    averagePrice: 1500000,
    priceChange: 6.3,
    walkScore: 75,
    transitScore: 45,
    schools: 4.8,
    amenities: ["Shopping", "Parks", "Schools", "Dining"],
    tags: ["Luxury", "Family-Friendly", "Upscale"],
  },
  {
    id: "Ain Diab",
    name: "Ain Diab",
    city: "Casablanca",
    description: "Iconic beachfront neighborhood with Art Deco architecture, vibrant nightlife, and beautiful beaches.",
    image: "/placeholder.svg?height=300&width=500",
    averagePrice: 850000,
    priceChange: 4.7,
    walkScore: 93,
    transitScore: 70,
    schools: 3.5,
    amenities: ["Beach", "Nightlife", "Dining", "Shopping"],
    tags: ["Beachfront", "Nightlife", "Tourist"],
  },
]

// City options for filter
const cities = [
  { value: "all", label: "All Cities" },
  { value: "New York", label: "New York" },
  { value: "San Francisco", label: "San Francisco" },
  { value: "Chicago", label: "Chicago" },
  { value: "Dallas", label: "Dallas" },
  { value: "Miami", label: "Miami" },
]

export default function NeighborhoodsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("all")
  const [selectedTab, setSelectedTab] = useState("all")

  // Filter neighborhoods based on search, city, and tab
  const filteredNeighborhoods = neighborhoods.filter((neighborhood) => {
    const matchesSearch =
      neighborhood.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      neighborhood.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      neighborhood.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCity = selectedCity === "all" || neighborhood.city === selectedCity

    const matchesTab =
      selectedTab === "all" ||
      (selectedTab === "family" && neighborhood.tags.includes("Family-Friendly")) ||
      (selectedTab === "urban" && neighborhood.tags.includes("Urban")) ||
      (selectedTab === "luxury" && neighborhood.tags.includes("Luxury")) ||
      (selectedTab === "waterfront" &&
        (neighborhood.tags.includes("Waterfront") || neighborhood.tags.includes("Beachfront")))

    return matchesSearch && matchesCity && matchesTab
  })

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Explore Neighborhoods</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover the perfect neighborhood for your lifestyle. Explore local amenities, schools, market trends, and
          more to find your ideal community.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search neighborhoods by name or features..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div>
            <select
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              {cities.map((city) => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="mb-10" onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl mx-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="family">Family-Friendly</TabsTrigger>
          <TabsTrigger value="urban">Urban</TabsTrigger>
          <TabsTrigger value="luxury">Luxury</TabsTrigger>
          <TabsTrigger value="waterfront">Waterfront</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Neighborhoods Grid */}
      {filteredNeighborhoods.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-2xl font-semibold mb-2">No neighborhoods found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search criteria</p>
          <Button
            onClick={() => {
              setSearchQuery("")
              setSelectedCity("all")
              setSelectedTab("all")
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredNeighborhoods.map((neighborhood) => (
            <Card key={neighborhood.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <Image
                  src={neighborhood.image || "/placeholder.svg"}
                  alt={neighborhood.name}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{neighborhood.name}</h3>
                  <div className="flex items-center text-emerald-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">+{neighborhood.priceChange}%</span>
                  </div>
                </div>
                <div className="flex items-center text-gray-500 mb-3">
                  <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                  <p className="text-sm">
                    {neighborhood.city}, {neighborhood.state}
                  </p>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">{neighborhood.description}</p>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Average Home Price</p>
                  <p className="font-bold text-lg">${neighborhood.averagePrice.toLocaleString()}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 bg-gray-50 rounded-md">
                    <p className="text-xs text-gray-500">Walk Score</p>
                    <p className="font-bold">{neighborhood.walkScore}</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-md">
                    <p className="text-xs text-gray-500">Transit</p>
                    <p className="font-bold">{neighborhood.transitScore}</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-md">
                    <p className="text-xs text-gray-500">Schools</p>
                    <p className="font-bold">{neighborhood.schools}/5</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {neighborhood.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Link href={`/neighborhoods/${neighborhood.id}`}>View Neighborhood</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Neighborhood Features Section */}
      <div className="mt-20 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Makes a Great Neighborhood?</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            When choosing a neighborhood, consider these important factors that contribute to quality of life.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <School className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Education</h3>
            <p className="text-gray-600">
              Access to quality schools, libraries, and educational resources for all ages.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coffee className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Amenities</h3>
            <p className="text-gray-600">Restaurants, cafes, grocery stores, and shopping options within easy reach.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Car className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Transportation</h3>
            <p className="text-gray-600">Accessibility to public transit, highways, and walkable streets.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Park className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Green Spaces</h3>
            <p className="text-gray-600">Parks, trails, and outdoor recreation areas for an active lifestyle.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-emerald-600 text-white rounded-lg p-8 md:p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Find Properties in Your Favorite Neighborhood</h2>
        <p className="text-xl mb-6 max-w-3xl mx-auto">
          Ready to explore homes in these neighborhoods? Start your search now and find the perfect property.
        </p>
        <Button asChild size="lg" className="bg-white text-emerald-600 hover:bg-gray-100">
          <Link href="/properties">Browse Properties</Link>
        </Button>
      </div>
    </div>
  )
}
