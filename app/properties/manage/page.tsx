"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react"
import { AppealPropertyDialog } from "@/components/appeal-property-dialog"

interface Property {
  _id: string
  title: string
  price: number
  address: string
  city: string
  state: string
  zipCode: string
  status: string
  type: string
  images: string[]
  moderationStatus: "Pending" | "Approved" | "Rejected" | "Flagged"
  moderationNotes?: string
  createdAt: string
}

export default function ManagePropertiesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("All")

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    // If user is not an agent or admin, redirect to dashboard
    if (!loading && user && user.role !== "agent" && user.role !== "admin") {
      router.push("/dashboard")
      return
    }

    // Fetch properties
    if (user) {
      fetchProperties()
    }
  }, [user, loading, router, activeTab])

  const fetchProperties = async () => {
    try {
      setIsLoading(true)

      // Build query parameters
      const params = new URLSearchParams()

      // If viewing a specific moderation status
      if (activeTab !== "All") {
        params.append("moderationStatus", activeTab)
      }

      // If user is admin, they can see all properties
      // Otherwise, only show the agent's properties
      if (user?.role !== "admin") {
        params.append("agent", user?.id || "")
      }

      const response = await fetch(`/api/properties/manage?${params.toString()}`)

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

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm("Are you sure you want to delete this property?")) {
      return
    }

    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete property")
      }

      toast({
        title: "Success",
        description: "Property deleted successfully",
      })

      // Refresh properties
      fetchProperties()
    } catch (error) {
      console.error("Error deleting property:", error)
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge className="bg-amber-500">Pending Approval</Badge>
      case "Approved":
        return <Badge className="bg-green-500">Approved</Badge>
      case "Rejected":
        return <Badge className="bg-red-500">Rejected</Badge>
      case "Flagged":
        return <Badge className="bg-orange-500">Flagged</Badge>
      default:
        return null
    }
  }

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading || isLoading) {
    return <PropertiesLoadingSkeleton />
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Properties</h1>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/properties/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="All" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="All">All</TabsTrigger>
          <TabsTrigger value="Pending">Pending</TabsTrigger>
          <TabsTrigger value="Approved">Approved</TabsTrigger>
          <TabsTrigger value="Rejected">Rejected</TabsTrigger>
          <TabsTrigger value="Flagged">Flagged</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Your Properties</h2>
              <p className="text-gray-600 mb-6">Manage and track all your property listings.</p>

              {properties.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">No properties found</h3>
                  <p className="text-gray-500 mb-6">
                    {activeTab === "All"
                      ? "You haven't created any properties yet."
                      : `You don't have any ${activeTab.toLowerCase()} properties.`}
                  </p>
                  <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                    <Link href="/properties/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Property
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {properties.map((property) => (
                    <div
                      key={property._id}
                      className="flex flex-col md:flex-row border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="relative h-48 md:h-auto md:w-1/4">
                        <Image
                          src={property.images[0] || "/placeholder.svg"}
                          alt={property.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4 md:p-6 flex-1">
                        <div className="flex flex-col md:flex-row justify-between mb-2">
                          <h3 className="font-semibold text-lg">{property.title}</h3>
                          <div className="mt-2 md:mt-0">{getStatusBadge(property.moderationStatus)}</div>
                        </div>
                        <p className="text-gray-600 mb-2">
                          {property.address}, {property.city}, {property.state} {property.zipCode}
                        </p>
                        <p className="font-bold text-lg text-emerald-600 mb-3">
                          ${property.price.toLocaleString()}
                          {property.status === "For Rent" ? "/month" : ""}
                        </p>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                          <div className="text-sm text-gray-500 mb-2 md:mb-0">
                            <span>Created: {formatDate(property.createdAt)}</span>
                            <span className="mx-2">•</span>
                            <span>{property.type}</span>
                            <span className="mx-2">•</span>
                            <span>{property.status}</span>
                          </div>

                          <div className="flex space-x-2">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/properties/${property._id}`}>View</Link>
                            </Button>

                            {property.moderationStatus === "Approved" && (
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/properties/edit/${property._id}`}>
                                  <Pencil className="mr-1 h-3 w-3" />
                                  Edit
                                </Link>
                              </Button>
                            )}

                            <Button variant="outline" size="sm" onClick={() => handleDeleteProperty(property._id)}>
                              <Trash2 className="mr-1 h-3 w-3" />
                              Delete
                            </Button>

                            {property.moderationStatus === "Rejected" && (
                              <AppealPropertyDialog
                                propertyId={property._id}
                                propertyTitle={property.title}
                                onSuccess={fetchProperties}
                              />
                            )}
                          </div>
                        </div>

                        {property.moderationStatus === "Rejected" && property.moderationNotes && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md">
                            <div className="flex items-start">
                              <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-red-800">Rejection Reason:</h4>
                                <p className="text-red-700 text-sm">{property.moderationNotes}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PropertiesLoadingSkeleton() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-40" />
      </div>

      <Skeleton className="h-10 w-full mb-6" />

      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-full mb-6" />

          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
