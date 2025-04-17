"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MapPin, Heart, Share, Calendar, Phone, Mail, Camera } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { ReportPropertyDialog } from "@/components/report-property-dialog"
import { ScheduleTourForm } from "@/components/schedule-tour-form"

export default function PropertyDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<"360" | "video">("360")
  const [currentPanorama, setCurrentPanorama] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [property, setProperty] = useState<any>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [tourDialogOpen, setTourDialogOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [isSaved, setIsSaved] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkingSaved, setCheckingSaved] = useState(true)

  // Fetch property data
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/properties/${propertyId}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Property not found")
          }
          throw new Error("Failed to fetch property details")
        }

        const data = await response.json()
        setProperty(data)
      } catch (error: any) {
        console.error("Error fetching property:", error)
        setError(error.message || "Failed to load property details")
      } finally {
        setLoading(false)
      }
    }

    if (propertyId) {
      fetchProperty()
    }
  }, [propertyId])

  // Check if property is saved
  useEffect(() => {
    const checkIfSaved = async () => {
      if (!user || !propertyId) return

      try {
        setCheckingSaved(true)
        const response = await fetch("/api/saved-properties")

        if (!response.ok) {
          throw new Error("Failed to fetch saved properties")
        }

        const savedProperties = await response.json()
        const isSaved = savedProperties.some((item: any) => item.property._id === propertyId)
        setIsSaved(isSaved)
      } catch (error) {
        console.error("Error checking if property is saved:", error)
      } finally {
        setCheckingSaved(false)
      }
    }

    if (user) {
      checkIfSaved()
    } else {
      setCheckingSaved(false)
    }
  }, [user, propertyId])

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

  const handleContactAgent = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to contact the agent",
        variant: "destructive",
      })
      router.push("/auth/login?callbackUrl=" + encodeURIComponent(window.location.pathname))
      return
    }

    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiver: property.agent._id,
          property: property._id,
          content: message,
        }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      toast({
        title: "Message Sent",
        description: "The agent will contact you shortly.",
      })

      setMessage("")
      setContactDialogOpen(false)
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleScheduleTour = async (date: string, time: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to schedule a tour",
        variant: "destructive",
      })
      router.push("/auth/login?callbackUrl=" + encodeURIComponent(window.location.pathname))
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property: property._id,
          agent: property.agent._id,
          date: `${date}T${time}:00`,
        }),
      })

      if (!response.ok) throw new Error("Failed to schedule tour")

      toast({
        title: "Tour Scheduled",
        description: "Your tour has been scheduled. Check your email for details.",
      })

      setTourDialogOpen(false)
    } catch (error) {
      console.error("Error scheduling tour:", error)
      toast({
        title: "Error",
        description: "Failed to schedule tour. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveProperty = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save this property",
        variant: "destructive",
      })
      router.push("/auth/login?callbackUrl=" + encodeURIComponent(window.location.pathname))
      return
    }

    setIsSubmitting(true)

    try {
      if (isSaved) {
        // Remove from saved properties
        const response = await fetch("/api/saved-properties", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            propertyId: property._id,
          }),
        })

        if (!response.ok) throw new Error("Failed to remove property from saved list")
      } else {
        // Add to saved properties
        const response = await fetch("/api/saved-properties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            property: property._id,
          }),
        })

        if (!response.ok) throw new Error("Failed to save property")
      }

      setIsSaved(!isSaved)

      toast({
        title: isSaved ? "Property Removed" : "Property Saved",
        description: isSaved
          ? "This property has been removed from your saved properties."
          : "This property has been added to your saved properties.",
      })
    } catch (error) {
      console.error("Error saving property:", error)
      toast({
        title: "Error",
        description: "Failed to save property. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleShareProperty = async () => {
    if (!property) return

    const url = window.location.href
    const title = property.title
    const text = `Check out this property: ${property.title}`

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text,
          url,
        })
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(url)
        toast({
          title: "Link Copied",
          description: "Property link copied to clipboard",
        })
      }
    } catch (error) {
      console.error("Error sharing property:", error)
      toast({
        title: "Error",
        description: "Failed to share property",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
          <div className="h-6 w-96 bg-gray-200 rounded mb-6"></div>
          <div className="h-[400px] w-full bg-gray-200 rounded mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="h-12 w-full bg-gray-200 rounded mb-4"></div>
              <div className="h-64 w-full bg-gray-200 rounded mb-8"></div>
            </div>
            <div>
              <div className="h-64 w-full bg-gray-200 rounded mb-4"></div>
              <div className="h-20 w-full bg-gray-200 rounded mb-4"></div>
              <div className="h-40 w-full bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 bg-red-50 rounded-lg">
          <h2 className="text-2xl font-semibold text-red-600 mb-2">Error Loading Property</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button asChild>
            <Link href="/properties">Browse Other Properties</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/properties">Browse Properties</Link>
          </Button>
        </div>
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
                src={
                  property.images && property.images.length > 0
                    ? getImageUrl(property.images[activeImageIndex])
                    : "/placeholder.svg?height=600&width=800"
                }
                alt={property.title}
                fill
                className="object-cover"
                unoptimized={property.images && property.images[activeImageIndex]?.startsWith("http")}
              />
            </div>
            {property.images && property.images.length > 1 && (
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
                      src={getImageUrl(image) || "/placeholder.svg?height=100&width=100"}
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
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="map">Map</TabsTrigger>
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
                    <Camera className="h-5 w-5 text-emerald-600 mr-2" />
                    <span>Property Floor Plan</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center">
                    <Camera className="h-5 w-5 text-emerald-600 mr-2" />
                    <span>Property Disclosure</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center">
                    <Camera className="h-5 w-5 text-emerald-600 mr-2" />
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
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <p className="text-gray-500">Map would be displayed here</p>
                  </div>
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
                  <Calendar className="h-5 w-5 text-emerald-600 mr-2" />
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
              {property.agent ? (
                <>
                  <div className="flex items-center mb-4">
                    <div className="relative h-16 w-16 rounded-full overflow-hidden mr-4">
                      <Image
                        src={property.agent.profileImage || "/placeholder.svg?height=200&width=200"}
                        alt={`${property.agent.firstName} ${property.agent.lastName}`}
                        fill
                        className="object-cover"
                        unoptimized={property.agent.profileImage?.startsWith("http")}
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {property.agent.firstName} {property.agent.lastName}
                      </h3>
                      <p className="text-gray-600 text-sm">Real Estate Agent</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-emerald-600 mr-2" />
                      <span>{property.agent.phoneNumber || "Not provided"}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-emerald-600 mr-2" />
                      <span>{property.agent.email}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Agent information not available</p>
              )}

              <div className="flex items-center space-x-2 mt-4">
                <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Contact Agent</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Contact Agent</DialogTitle>
                      <DialogDescription>
                        Send a message to {property.agent?.firstName} {property.agent?.lastName} about this property.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Textarea
                        placeholder="Enter your message here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-[150px]"
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setContactDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleContactAgent} disabled={isSubmitting}>
                        {isSubmitting ? "Sending..." : "Send Message"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <ReportPropertyDialog propertyId={property._id} />
              </div>
            </CardContent>
          </Card>

          {/* Schedule Tour */}
          <Card>
            <CardContent className="p-6">
              <Dialog open={tourDialogOpen} onOpenChange={setTourDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Tour
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule a Tour</DialogTitle>
                    <DialogDescription>
                      Select a date and time to tour this property with {property.agent?.firstName}{" "}
                      {property.agent?.lastName}.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <ScheduleTourForm
                      propertyId={property._id}
                      agentId={property.agent?._id}
                      onSchedule={handleScheduleTour}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Property Actions</h2>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleSaveProperty}
                  disabled={isSubmitting || checkingSaved}
                >
                  <Heart className={`mr-2 h-4 w-4 ${isSaved ? "fill-rose-500 text-rose-500" : ""}`} />
                  {checkingSaved ? "Checking..." : isSaved ? "Saved" : "Save Property"}
                </Button>
                <Button variant="outline" className="w-full" onClick={handleShareProperty}>
                  <Share className="mr-2 h-4 w-4" />
                  Share Property
                </Button>
                {/* Add this button to view saved properties */}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/saved-properties">
                    <Heart className="mr-2 h-4 w-4 fill-rose-500 text-rose-500" />
                    View Saved Properties
                  </Link>
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
