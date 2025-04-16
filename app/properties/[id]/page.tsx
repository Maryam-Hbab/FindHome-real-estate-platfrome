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
import dynamic from "next/dynamic"
import { useToast } from "@/components/ui/use-toast"
import { ReportPropertyDialog } from "@/components/report-property-dialog"

// Dynamically import PropertyMap with no SSR
const PropertyMap = dynamic(() => import("@/components/property-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full flex items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
    </div>
  ),
})

export default function PropertyDetailPage() {
  const params = useParams()
  const { toast } = useToast()
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true)
        // Fetch the property data from the API using the ID from the URL
        const response = await fetch(`/api/properties/${params.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch property")
        }

        const data = await response.json()
        console.log("Fetched property data:", data)
        setProperty(data)
      } catch (error) {
        console.error("Error fetching property:", error)
        toast({
          title: "Error",
          description: "Failed to load property details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProperty()
    }
  }, [params.id, toast])

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

  // Helper function to ensure image URLs are valid
  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return "/placeholder.svg?height=600&width=800"

    // If the image URL is already a full URL (starts with http or https), use it as is
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl
    }

    // If it's a blob URL (temporary), use a placeholder instead
    if (imageUrl.startsWith("blob:")) {
      return "/placeholder.svg?height=600&width=800"
    }

    // If it's a relative path starting with /, use it as is
    if (imageUrl.startsWith("/")) {
      return imageUrl
    }

    // Otherwise, assume it's a relative path and add a leading /
    return `/${imageUrl}`
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

  // Ensure images array exists and has at least one item
  const propertyImages =
    property.images && property.images.length > 0 ? property.images : ["/placeholder.svg?height=600&width=800"]

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
            <span>
              {property.address}, {property.city}, {property.state} {property.zipCode}
            </span>
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
                src={getImageUrl(propertyImages[activeImageIndex]) || "/placeholder.svg"}
                alt={property.title}
                fill
                className="object-cover"
                unoptimized={propertyImages[activeImageIndex]?.startsWith("http")}
              />
            </div>
            {propertyImages.length > 1 && (
              <div className="p-4 flex space-x-2 overflow-x-auto">
                {propertyImages.map((image: string, index: number) => (
                  <div
                    key={index}
                    className={`relative h-20 w-32 flex-shrink-0 cursor-pointer ${
                      index === activeImageIndex ? "ring-2 ring-emerald-600" : ""
                    }`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <Image
                      src={getImageUrl(image) || "/placeholder.svg"}
                      alt={`Property image ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized={image?.startsWith("http")}
                    />
                  </div>
                ))}
              </div>
            )}
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
                  <span className="font-medium">{property.yearBuilt || "N/A"}</span>
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
                {property.features && property.features.length > 0 ? (
                  property.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center">
                      <div className="h-2 w-2 bg-emerald-600 rounded-full mr-2"></div>
                      <span>{feature}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No features listed for this property.</p>
                )}
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
                {property.location && property.location.coordinates ? (
                  <PropertyMap
                    properties={[
                      {
                        ...property,
                        lat: property.location.coordinates[1],
                        lng: property.location.coordinates[0],
                      },
                    ]}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <p className="text-gray-500">No location data available for this property.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Financial Calculator */}
          {property.status === "For Sale" && (
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
                    <p className="font-semibold text-emerald-600">
                      $
                      {Math.round(
                        (property.price * 0.8 * 0.00456) / (1 - Math.pow(1 + 0.00456, -360)),
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <Button variant="outline" className="w-full">
                    Customize Calculator
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Agent Information */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Listed By</h2>
              <div className="flex items-center mb-4">
                <div className="relative h-16 w-16 rounded-full overflow-hidden mr-4">
                  <Image
                    src={property.agent?.profileImage || "/placeholder.svg?height=200&width=200"}
                    alt={property.agent ? `${property.agent.firstName} ${property.agent.lastName}` : "Agent"}
                    fill
                    className="object-cover"
                    unoptimized={property.agent?.profileImage?.startsWith("http")}
                  />
                </div>
                <div>
                  <h3 className="font-medium">
                    {property.agent ? `${property.agent.firstName} ${property.agent.lastName}` : "Agent Name"}
                  </h3>
                  <p className="text-gray-600 text-sm">Real Estate Agent</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-emerald-600 mr-2" />
                  <span>{property.agent?.phoneNumber || "(555) 123-4567"}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-emerald-600 mr-2" />
                  <span>{property.agent?.email || "agent@realestate.com"}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-4">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleContactAgent}>
                  Contact Agent
                </Button>
                <ReportPropertyDialog propertyId={property._id} />
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
