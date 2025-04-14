"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Search, SlidersHorizontal, X, MapPin } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

// Property amenities options
const amenities = [
  { id: "pool", label: "Swimming Pool" },
  { id: "gym", label: "Gym" },
  { id: "parking", label: "Parking" },
  { id: "security", label: "Security" },
  { id: "elevator", label: "Elevator" },
  { id: "balcony", label: "Balcony" },
  { id: "garden", label: "Garden" },
  { id: "airConditioning", label: "Air Conditioning" },
  { id: "furnished", label: "Furnished" },
  { id: "petFriendly", label: "Pet Friendly" },
]

export default function EnhancedPropertySearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isMobile = useMobile()

  // Search state
  const [location, setLocation] = useState(searchParams.get("location") || "")
  const [propertyType, setPropertyType] = useState(searchParams.get("type") || "")
  const [status, setStatus] = useState(searchParams.get("status") || "for-sale")
  const [minPrice, setMinPrice] = useState(
    searchParams.get("minPrice") ? Number.parseInt(searchParams.get("minPrice")!) : 0,
  )
  const [maxPrice, setMaxPrice] = useState(
    searchParams.get("maxPrice") ? Number.parseInt(searchParams.get("maxPrice")!) : 2000000,
  )
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") || "")
  const [bathrooms, setBathrooms] = useState(searchParams.get("bathrooms") || "")
  const [minArea, setMinArea] = useState(
    searchParams.get("minArea") ? Number.parseInt(searchParams.get("minArea")!) : 0,
  )
  const [maxArea, setMaxArea] = useState(
    searchParams.get("maxArea") ? Number.parseInt(searchParams.get("maxArea")!) : 5000,
  )
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  // Initialize selected amenities from URL
  useEffect(() => {
    const amenitiesParam = searchParams.get("amenities")
    if (amenitiesParam) {
      setSelectedAmenities(amenitiesParam.split(","))
    }

    // Calculate active filters for badges
    const filters: string[] = []
    if (location) filters.push("Location")
    if (propertyType) filters.push("Property Type")
    if (bedrooms) filters.push("Bedrooms")
    if (bathrooms) filters.push("Bathrooms")
    if (minPrice > 0 || maxPrice < 2000000) filters.push("Price")
    if (minArea > 0 || maxArea < 5000) filters.push("Area")
    if (selectedAmenities.length > 0) filters.push("Amenities")

    setActiveFilters(filters)
  }, [searchParams])

  const handleSearch = () => {
    // Build query parameters
    const params = new URLSearchParams()

    if (location) params.append("location", location)
    if (propertyType) params.append("type", propertyType)
    if (status) params.append("status", status)
    if (minPrice > 0) params.append("minPrice", minPrice.toString())
    if (maxPrice < 2000000) params.append("maxPrice", maxPrice.toString())
    if (bedrooms) params.append("bedrooms", bedrooms)
    if (bathrooms) params.append("bathrooms", bathrooms)
    if (minArea > 0) params.append("minArea", minArea.toString())
    if (maxArea < 5000) params.append("maxArea", maxArea.toString())
    if (selectedAmenities.length > 0) params.append("amenities", selectedAmenities.join(","))

    // Navigate to search results page
    router.push(`/properties?${params.toString()}`)
  }

  const clearFilters = () => {
    setLocation("")
    setPropertyType("")
    setMinPrice(0)
    setMaxPrice(2000000)
    setBedrooms("")
    setBathrooms("")
    setMinArea(0)
    setMaxArea(5000)
    setSelectedAmenities([])
  }

  const removeFilter = (filter: string) => {
    switch (filter) {
      case "Location":
        setLocation("")
        break
      case "Property Type":
        setPropertyType("")
        break
      case "Bedrooms":
        setBedrooms("")
        break
      case "Bathrooms":
        setBathrooms("")
        break
      case "Price":
        setMinPrice(0)
        setMaxPrice(2000000)
        break
      case "Area":
        setMinArea(0)
        setMaxArea(5000)
        break
      case "Amenities":
        setSelectedAmenities([])
        break
    }
  }

  const SearchFilters = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Location</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="City, neighborhood, or address"
            className="pl-10"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="for-sale">For Sale</SelectItem>
              <SelectItem value="for-rent">For Rent</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Property Type</label>
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="condo">Condo</SelectItem>
              <SelectItem value="townhouse">Townhouse</SelectItem>
              <SelectItem value="land">Land</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Accordion type="single" collapsible defaultValue="price">
        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="pt-4 pb-2">
              <Slider
                min={0}
                max={2000000}
                step={10000}
                value={[minPrice, maxPrice]}
                onValueChange={(value) => {
                  setMinPrice(value[0])
                  setMaxPrice(value[1])
                }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>${minPrice.toLocaleString()}</span>
              <span>${maxPrice.toLocaleString()}</span>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="rooms">
          <AccordionTrigger>Bedrooms & Bathrooms</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Bedrooms</label>
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
                <label className="text-sm font-medium">Bathrooms</label>
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
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="area">
          <AccordionTrigger>Area (sq ft)</AccordionTrigger>
          <AccordionContent>
            <div className="pt-4 pb-2">
              <Slider
                min={0}
                max={5000}
                step={100}
                value={[minArea, maxArea]}
                onValueChange={(value) => {
                  setMinArea(value[0])
                  setMaxArea(value[1])
                }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{minArea} sq ft</span>
              <span>{maxArea} sq ft</span>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="amenities">
          <AccordionTrigger>Amenities</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-2">
              {amenities.map((amenity) => (
                <div key={amenity.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity.id}
                    checked={selectedAmenities.includes(amenity.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedAmenities([...selectedAmenities, amenity.id])
                      } else {
                        setSelectedAmenities(selectedAmenities.filter((id) => id !== amenity.id))
                      }
                    }}
                  />
                  <label htmlFor={amenity.id} className="text-sm">
                    {amenity.label}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex gap-2">
        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleSearch}>
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
        <Button variant="outline" onClick={clearFilters}>
          Clear
        </Button>
      </div>
    </div>
  )

  return (
    <div className="w-full">
      {/* Mobile View */}
      {isMobile ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search location..."
                className="pl-10"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {activeFilters.length > 0 && (
                    <span className="ml-1 w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">
                      {activeFilters.length}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Search Filters</SheetTitle>
                  <SheetDescription>Refine your property search</SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <SearchFilters />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Active filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                  {filter}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter(filter)} />
                </Badge>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Desktop View */
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Find Your Perfect Property</h3>
          <SearchFilters />

          {/* Active filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-gray-500">Active filters:</span>
              {activeFilters.map((filter) => (
                <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                  {filter}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter(filter)} />
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
