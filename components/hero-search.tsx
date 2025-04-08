"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"

export default function HeroSearch() {
  const router = useRouter()
  const [searchType, setSearchType] = useState("buy")
  const [location, setLocation] = useState("")
  const [propertyType, setPropertyType] = useState("")
  const [priceRange, setPriceRange] = useState("")
  const [bedrooms, setBedrooms] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // Build query parameters
    const params = new URLSearchParams()
    if (location) params.append("location", location)
    if (propertyType) params.append("type", propertyType)
    if (priceRange) params.append("price", priceRange)
    if (bedrooms) params.append("bedrooms", bedrooms)
    params.append("status", searchType === "buy" ? "for-sale" : "for-rent")

    // Navigate to search results page
    router.push(`/properties?${params.toString()}`)
  }

  return (
    <div className="w-full">
      <Tabs defaultValue="buy" onValueChange={setSearchType} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="buy">Buy</TabsTrigger>
          <TabsTrigger value="rent">Rent</TabsTrigger>
        </TabsList>

        <TabsContent value="buy" className="mt-0">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Enter location, neighborhood, or address"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-200000">Under $200k</SelectItem>
                  <SelectItem value="200000-500000">$200k - $500k</SelectItem>
                  <SelectItem value="500000-1000000">$500k - $1M</SelectItem>
                  <SelectItem value="1000000-2000000">$1M - $2M</SelectItem>
                  <SelectItem value="2000000+">$2M+</SelectItem>
                </SelectContent>
              </Select>

              <Select value={bedrooms} onValueChange={setBedrooms}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Bedrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1+ Bed</SelectItem>
                  <SelectItem value="2">2+ Beds</SelectItem>
                  <SelectItem value="3">3+ Beds</SelectItem>
                  <SelectItem value="4">4+ Beds</SelectItem>
                  <SelectItem value="5">5+ Beds</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Search className="mr-2 h-4 w-4" />
              Search Properties
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="rent" className="mt-0">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Enter location, neighborhood, or address"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-1000">Under $1,000/mo</SelectItem>
                  <SelectItem value="1000-2000">$1,000 - $2,000/mo</SelectItem>
                  <SelectItem value="2000-3000">$2,000 - $3,000/mo</SelectItem>
                  <SelectItem value="3000-5000">$3,000 - $5,000/mo</SelectItem>
                  <SelectItem value="5000+">$5,000+/mo</SelectItem>
                </SelectContent>
              </Select>

              <Select value={bedrooms} onValueChange={setBedrooms}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Bedrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1+ Bed</SelectItem>
                  <SelectItem value="2">2+ Beds</SelectItem>
                  <SelectItem value="3">3+ Beds</SelectItem>
                  <SelectItem value="4">4+ Beds</SelectItem>
                  <SelectItem value="5">5+ Beds</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Search className="mr-2 h-4 w-4" />
              Search Rentals
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}

