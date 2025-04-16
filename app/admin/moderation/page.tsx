"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import Image from "next/image"

interface Property {
  _id: string
  title: string
  description: string
  price: number
  address: string
  city: string
  state: string
  zipCode: string
  type: string
  status: string
  images: string[]
  agent: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  moderationStatus: "Pending" | "Approved" | "Rejected" | "Flagged"
  moderationNotes?: string
  reportCount: number
  reports: Array<{
    userId: string
    reason: string
    timestamp: string
  }>
  createdAt: string
  updatedAt: string
}

export default function ModerationDashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("Pending")
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [moderationNotes, setModerationNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && user) {
      if (user.role !== "admin") {
        router.push("/dashboard")
        return
      }

      fetchProperties()
    }
  }, [user, loading, router, activeTab])

  const fetchProperties = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/properties?moderationStatus=${activeTab}`)

      if (!response.ok) {
        throw new Error("Failed to fetch properties")
      }

      const data = await response.json()
      setProperties(data)
    } catch (error) {
      console.error("Error fetching properties:", error)
      toast({
        title: "Error",
        description: "Failed to load properties",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property)
    setModerationNotes(property.moderationNotes || "")
  }

  const handleModerateProperty = async (action: "approve" | "reject") => {
    if (!selectedProperty) return

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/properties/moderate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId: selectedProperty._id,
          action,
          notes: moderationNotes,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to moderate property")
      }

      toast({
        title: "Success",
        description: `Property ${action === "approve" ? "approved" : "rejected"} successfully`,
      })

      // Update property in the list
      setProperties((prevProperties) => prevProperties.filter((p) => p._id !== selectedProperty._id))

      setSelectedProperty(null)

      // Refresh properties
      fetchProperties()
    } catch (error) {
      console.error("Error moderating property:", error)
      toast({
        title: "Error",
        description: "Failed to moderate property",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper function to ensure image URLs are valid
  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return "/placeholder.svg?height=300&width=500"

    // If the image URL is already a full URL (starts with http or https), use it as is
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl
    }

    // If it's a blob URL (temporary), use a placeholder instead
    if (imageUrl.startsWith("blob:")) {
      return "/placeholder.svg?height=300&width=500"
    }

    // If it's a relative path starting with /, use it as is
    if (imageUrl.startsWith("/")) {
      return imageUrl
    }

    // Otherwise, assume it's a relative path and add a leading /
    return `/${imageUrl}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge className="bg-amber-500">Pending</Badge>
      case "Approved":
        return <Badge className="bg-green-500">Approved</Badge>
      case "Rejected":
        return <Badge className="bg-red-500">Rejected</Badge>
      case "Flagged":
        return <Badge className="bg-purple-500">Flagged</Badge>
      default:
        return null
    }
  }

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.toLocaleDateString("en-US", { month: "short" })} ${date.getDate()}, ${date.getFullYear()}`
  }

  // Redirect if not an admin
  if (!loading && user && user.role !== "admin") {
    router.push("/dashboard")
    return null
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Content Moderation</h1>
        <Button asChild>
          <Link href="/admin/dashboard">Back to Admin Dashboard</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Property Submissions</CardTitle>
              <CardDescription>Review and moderate property listings</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="Pending" className="space-y-4" onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="Pending">Pending</TabsTrigger>
                  <TabsTrigger value="Flagged">Flagged</TabsTrigger>
                  <TabsTrigger value="Approved">Approved</TabsTrigger>
                  <TabsTrigger value="Rejected">Rejected</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab}>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-40 w-full" />
                      ))}
                    </div>
                  ) : properties.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">No properties found with this status.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {properties.map((property) => (
                        <Card
                          key={property._id}
                          className={`cursor-pointer ${selectedProperty?._id === property._id ? "border-emerald-500" : ""}`}
                          onClick={() => handleSelectProperty(property)}
                        >
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-4">
                              <div className="relative h-24 w-24 rounded-md overflow-hidden flex-shrink-0">
                                <Image
                                  src={getImageUrl(property.images?.[0]) || "/placeholder.svg"}
                                  alt={property.title}
                                  fill
                                  className="object-cover"
                                  unoptimized={property.images?.[0]?.startsWith("http")}
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex flex-col md:flex-row justify-between mb-2">
                                  <div>
                                    <h3 className="font-medium text-lg">{property.title}</h3>
                                    <p className="text-gray-600 text-sm">
                                      {property.address}, {property.city}, {property.state} {property.zipCode}
                                    </p>
                                  </div>
                                  <div className="mt-2 md:mt-0 flex items-center">
                                    {getStatusBadge(property.moderationStatus)}
                                    <span className="text-sm text-gray-500 ml-2">{formatDate(property.createdAt)}</span>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div>
                                    <h4 className="text-sm font-medium">Agent:</h4>
                                    <p className="text-gray-600">
                                      {property.agent.firstName} {property.agent.lastName} ({property.agent.email})
                                    </p>
                                  </div>
                                  {property.reportCount > 0 && (
                                    <div className="flex items-center text-amber-600">
                                      <AlertTriangle className="h-4 w-4 mr-1" />
                                      <span className="text-sm font-medium">
                                        Reported {property.reportCount} time{property.reportCount !== 1 ? "s" : ""}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
              <CardDescription>
                {selectedProperty ? `Review details for "${selectedProperty.title}"` : "Select a property to review"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedProperty ? (
                <div className="space-y-4">
                  {selectedProperty.images && selectedProperty.images.length > 0 && (
                    <div className="relative h-48 w-full rounded-md overflow-hidden">
                      <Image
                        src={getImageUrl(selectedProperty.images[0]) || "/placeholder.svg"}
                        alt={selectedProperty.title}
                        fill
                        className="object-cover"
                        unoptimized={selectedProperty.images[0]?.startsWith("http")}
                      />
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium">Description:</h3>
                    <p className="text-gray-600 p-3 bg-gray-50 rounded-md mt-1">{selectedProperty.description}</p>
                  </div>

                  {selectedProperty.reports && selectedProperty.reports.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium">User Reports:</h3>
                      <div className="space-y-2 mt-1">
                        {selectedProperty.reports.map((report, index) => (
                          <div key={index} className="p-3 bg-red-50 rounded-md border border-red-100">
                            <p className="text-sm text-red-700">{report.reason}</p>
                            <p className="text-xs text-gray-500 mt-1">Reported on {formatDate(report.timestamp)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium">Moderation Notes:</h3>
                    <Textarea
                      placeholder="Add notes about this property..."
                      value={moderationNotes}
                      onChange={(e) => setModerationNotes(e.target.value)}
                      className="min-h-[100px] mt-1"
                      disabled={
                        selectedProperty.moderationStatus !== "Pending" &&
                        selectedProperty.moderationStatus !== "Flagged"
                      }
                    />
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/properties/${selectedProperty._id}`}>View Property</Link>
                    </Button>
                  </div>

                  {(selectedProperty.moderationStatus === "Pending" ||
                    selectedProperty.moderationStatus === "Flagged") && (
                    <div className="flex space-x-2 pt-2">
                      <Button
                        onClick={() => handleModerateProperty("approve")}
                        disabled={isSubmitting}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleModerateProperty("reject")}
                        disabled={isSubmitting}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">Select a property to review</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
