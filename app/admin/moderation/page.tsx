"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Eye, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface Property {
  _id: string
  title: string
  agent: {
    firstName: string
    lastName: string
    email: string
  }
  moderationStatus: "Pending" | "Approved" | "Rejected" | "Flagged"
  moderationNotes?: string
  reportCount: number
  createdAt: string
}

export default function ModerationPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [moderationStatus, setModerationStatus] = useState<string>("")
  const [moderationNotes, setModerationNotes] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch properties
  useEffect(() => {
    if (!loading && user) {
      if (user.role !== "admin") {
        router.push("/dashboard")
        return
      }

      const fetchProperties = async () => {
        try {
          const response = await fetch(`/api/properties?moderationStatus=${activeTab}`)
          if (!response.ok) throw new Error("Failed to fetch properties")

          const data = await response.json()
          setProperties(data)
          setIsLoading(false)
        } catch (error) {
          console.error("Error fetching properties:", error)
          toast({
            title: "Error",
            description: "Failed to load properties. Please try again.",
            variant: "destructive",
          })
          setIsLoading(false)
        }
      }

      fetchProperties()
    }
  }, [user, loading, router, toast, activeTab])

  // Handle property selection
  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property)
    setModerationStatus(property.moderationStatus)
    setModerationNotes(property.moderationNotes || "")
  }

  // Handle moderation update
  const handleUpdateModeration = async () => {
    if (!selectedProperty) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/properties/${selectedProperty._id}/moderate`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          moderationStatus,
          moderationNotes,
        }),
      })

      if (!response.ok) throw new Error("Failed to update moderation status")

      toast({
        title: "Success",
        description: "Property moderation status updated successfully",
      })

      // Update property in the list
      setProperties((prevProperties) =>
        prevProperties.map((p) =>
          p._id === selectedProperty._id ? { ...p, moderationStatus: moderationStatus as any, moderationNotes } : p,
        ),
      )

      // If the status changed, remove from current tab list
      if (moderationStatus !== activeTab) {
        setProperties((prevProperties) => prevProperties.filter((p) => p._id !== selectedProperty._id))
        setSelectedProperty(null)
      }
    } catch (error) {
      console.error("Error updating moderation status:", error)
      toast({
        title: "Error",
        description: "Failed to update moderation status",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Properties</CardTitle>
              <CardDescription>Review and moderate property listings</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pending" className="space-y-4" onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="flagged">Flagged</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab}>
                  {isLoading ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : properties.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">No properties found with this status.</p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Agent</TableHead>
                            <TableHead>Reports</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {properties.map((property) => (
                            <TableRow
                              key={property._id}
                              className={selectedProperty?._id === property._id ? "bg-muted" : ""}
                            >
                              <TableCell className="font-medium">{property.title}</TableCell>
                              <TableCell>{`${property.agent.firstName} ${property.agent.lastName}`}</TableCell>
                              <TableCell>
                                {property.reportCount > 0 ? (
                                  <span className="flex items-center">
                                    <AlertTriangle className="h-4 w-4 mr-1 text-amber-500" />
                                    {property.reportCount}
                                  </span>
                                ) : (
                                  "0"
                                )}
                              </TableCell>
                              <TableCell>{new Date(property.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={`/properties/${property._id}`}>
                                      <Eye className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleSelectProperty(property)}>
                                    Review
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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
              <CardTitle>Moderation Actions</CardTitle>
              <CardDescription>
                {selectedProperty
                  ? `Review and update status for "${selectedProperty.title}"`
                  : "Select a property to moderate"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedProperty ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Moderation Status</label>
                    <Select value={moderationStatus} onValueChange={setModerationStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">
                          <div className="flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                            Pending
                          </div>
                        </SelectItem>
                        <SelectItem value="Approved">
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            Approved
                          </div>
                        </SelectItem>
                        <SelectItem value="Rejected">
                          <div className="flex items-center">
                            <XCircle className="h-4 w-4 mr-2 text-red-500" />
                            Rejected
                          </div>
                        </SelectItem>
                        <SelectItem value="Flagged">
                          <div className="flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                            Flagged
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Moderation Notes</label>
                    <Textarea
                      placeholder="Add notes about this property..."
                      value={moderationNotes}
                      onChange={(e) => setModerationNotes(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="pt-4">
                    <Button onClick={handleUpdateModeration} disabled={isSubmitting} className="w-full">
                      {isSubmitting ? "Updating..." : "Update Moderation Status"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">Select a property to moderate</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
