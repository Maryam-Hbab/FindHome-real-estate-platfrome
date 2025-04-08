"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Heart, Share, Phone, Mail, Home, Info, FileText, Map, DollarSign } from "lucide-react"
import PropertyMap from "@/components/property-map"
import { useToast } from "@/components/ui/use-toast"

// Mock property data
const mockProperty = {
  id: "1",
  title: "Modern Apartment with City View",
  description:
    "This beautiful modern apartment offers stunning city views and a prime location. The open floor plan features a spacious living area, gourmet kitchen with stainless steel appliances, and a private balcony. The master bedroom includes a walk-in closet and en-suite bathroom. Additional amenities include in-unit laundry, central air conditioning, and access to the building's fitness center and rooftop terrace.",
  price: 450000,
  address: "123 Main St, New York, NY 10001",
  bedrooms: 2,
  bathrooms: 2,
  area: 1200,
  type: "Apartment",
  status: "For Sale",
  yearBuilt: 2015,
  parkingSpaces: 1,
  features: [
    "Central Air Conditioning",
    "In-unit Laundry",
    "Balcony",
    "Stainless Steel Appliances",
    "Hardwood Floors",
    "Walk-in Closet",
    "Fitness Center",
    "Rooftop Terrace",
    "Elevator",
    "Pet Friendly",
  ],
  images: [
    "/placeholder.svg?height=600&width=800",
    "/placeholder.svg?height=600&width=800",
    "/placeholder.svg?height=600&width=800",
    "/placeholder.svg?height=600&width=800",
  ],
  agent: {
    id: "agent1",
    name: "Jane Smith",
    phone: "(555) 123-4567",
    email: "jane.smith@realestate.com",
    image: "/placeholder.svg?height=200&width=200",
  },
}

export default function PropertyDetailPage() {
  const params = useParams()
  const { toast } = useToast()
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        // In a real app, this would be an API call
        // const response = await fetch(`/api/properties/${params.id}`)
        // const data = await response.json()

        // Using mock data for now
        setTimeout(() => {
          setProperty(mockProperty)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching property:", error)
        setLoading(false)
      }
    }

    fetchProperty()
  }, [params.id])

  const handleContactAgent = () => {
    toast({
      title: "Message Sent",
      description: "The agent will contact you shortly.",
    })
  }

  const handleScheduleTour = () => {
    toast({
      title: "Tour Scheduled",
      description: "Your tour has been scheduled. Check your email for details.",
    })
  }

  const handleSaveProperty = () => {
    toast({
      title: "Property Saved",
      description: "This property has been added to your saved properties.",
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Property Not Found</h1>
        <p className="text-gray-600 mb-8">The property you're looking for doesn't exist or has been removed.</p>
        <Link href="/properties">
          <Button className="bg-emerald-600 hover:bg-emerald-700">Browse Properties</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <div className="flex items-center mb-1">
            <Link href="/properties" className="text-emerald-600 hover:text-emerald-700 text-sm">
              Properties
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-sm text-gray-600">{property.type}</span>
          </div>
          <h1 className="text-3xl font-bold">{property.title}</h1>
          <div className="flex items-center text-gray-600 mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{property.address}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Badge className="bg-emerald-600">{property.status}</Badge>
          <span className="text-2xl font-bold">
            {property.status === "For Rent"
              ? `$${property.price.toLocaleString()}/month`
              : `$${property.price.toLocaleString()}`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Property Images */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="relative h-[400px]">
              <Image
                src={property.images[activeImageIndex] || "/placeholder.svg"}
                alt={property.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4 flex space-x-2 overflow-x-auto">
              {property.images.map((image: string, index: number) => (
                <div
                  key={index}
                  className={`relative h-20 w-32 flex-shrink-0 cursor-pointer ${
                    index === activeImageIndex ? "ring-2 ring-emerald-600" : ""
                  }`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`Property image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Property Details */}
          <Tabs defaultValue="details" className="mb-8">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="details">
                <Info className="h-4 w-4 mr-2" />
                Details
              </TabsTrigger>
              <TabsTrigger value="features">
                <Home className="h-4 w-4 mr-2" />
                Features
              </TabsTrigger>
              <TabsTrigger value="documents">
                <FileText className="h-4 w-4 mr-2" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="map">
                <Map className="h-4 w-4 mr-2" />
                Map
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Property Details</h2>
              <p className="text-gray-600 mb-6">{property.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Property Type</span>
                  <span className="font-medium">{property.type}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Bedrooms</span>
                  <span className="font-medium">{property.bedrooms}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Bathrooms</span>
                  <span className="font-medium">{property.bathrooms}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Area</span>
                  <span className="font-medium">{property.area} sq ft</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Year Built</span>
                  <span className="font-medium">{property.yearBuilt}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Parking</span>
                  <span className="font-medium">{property.parkingSpaces} spaces</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="features" className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Property Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {property.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center">
                    <div className="h-2 w-2 bg-emerald-600 rounded-full mr-2"></div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="documents" className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Property Documents</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-emerald-600 mr-2" />
                    <span>Property Floor Plan</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-emerald-600 mr-2" />
                    <span>Property Disclosure</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-emerald-600 mr-2" />
                    <span>Neighborhood Information</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="map" className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-[400px] w-full">
                <PropertyMap properties={[property]} />
              </div>
            </TabsContent>
          </Tabs>

          {/* Financial Calculator */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <DollarSign className="h-5 w-5 text-emerald-600 mr-2" />
                <h2 className="text-xl font-semibold">Mortgage Calculator</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-gray-500 mb-1">Home Price</p>
                  <p className="font-semibold">${property.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Down Payment (20%)</p>
                  <p className="font-semibold">${(property.price * 0.2).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Loan Amount</p>
                  <p className="font-semibold">${(property.price * 0.8).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Interest Rate</p>
                  <p className="font-semibold">4.5%</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Loan Term</p>
                  <p className="font-semibold">30 years</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Monthly Payment</p>
                  <p className="font-semibold text-emerald-600">$1,824</p>
                </div>
              </div>

              <div className="mt-4">
                <Button variant="outline" className="w-full">
                  Customize Calculator
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Agent Information */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Listed By</h2>
              <div className="flex items-center mb-4">
                <div className="relative h-16 w-16 rounded-full overflow-hidden mr-4">
                  <Image
                    src={property.agent.image || "/placeholder.svg"}
                    alt={property.agent.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{property.agent.name}</h3>
                  <p className="text-gray-600 text-sm">Real Estate Agent</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-emerald-600 mr-2" />
                  <span>{property.agent.phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-emerald-600 mr-2" />
                  <span>{property.agent.email}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleContactAgent}>
                  Contact Agent
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Tour */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Calendar className="h-5 w-5 text-emerald-600 mr-2" />
                <h2 className="text-xl font-semibold">Schedule a Tour</h2>
              </div>

              <div className="space-y-4 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="justify-start">
                    <span>Today</span>
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <span>Tomorrow</span>
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <span>Sat, May 20</span>
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <span>Sun, May 21</span>
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" className="justify-start">
                    <span>9:00 AM</span>
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <span>10:00 AM</span>
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <span>11:00 AM</span>
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <span>1:00 PM</span>
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <span>2:00 PM</span>
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <span>3:00 PM</span>
                  </Button>
                </div>
              </div>

              <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleScheduleTour}>
                Schedule Tour
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Property Actions</h2>
              <div className="space-y-2">
                <Button variant="outline" className="w-full" onClick={handleSaveProperty}>
                  <Heart className="mr-2 h-4 w-4" />
                  Save Property
                </Button>
                <Button variant="outline" className="w-full">
                  <Share className="mr-2 h-4 w-4" />
                  Share Property
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Similar Properties */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Similar Properties</h2>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src="/placeholder.svg?height=100&width=100"
                        alt="Similar property"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Modern Apartment in Downtown</h3>
                      <p className="text-emerald-600 text-sm font-semibold">$425,000</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="mr-2">2 beds</span>
                        <span className="mr-2">2 baths</span>
                        <span>1,100 sq ft</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

