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
import { CheckCircle, XCircle } from "lucide-react"

interface Appeal {
  _id: string
  property: {
    _id: string
    title: string
    address: string
    city: string
    state: string
    zipCode: string
    moderationStatus: string
    moderationNotes?: string
  }
  agent: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  reason: string
  status: "Pending" | "Approved" | "Rejected"
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

export default function AdminAppealsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [appeals, setAppeals] = useState<Appeal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("Pending")
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && user) {
      if (user.role !== "admin") {
        router.push("/dashboard")
        return
      }

      fetchAppeals()
    }
  }, [user, loading, router, activeTab])

  const fetchAppeals = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/appeals${activeTab !== "all" ? `?status=${activeTab}` : ""}`)

      if (!response.ok) {
        throw new Error("Failed to fetch appeals")
      }

      const data = await response.json()
      setAppeals(data)
    } catch (error) {
      console.error("Error fetching appeals:", error)
      toast({
        title: "Error",
        description: "Failed to load appeals",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectAppeal = (appeal: Appeal) => {
    setSelectedAppeal(appeal)
    setAdminNotes(appeal.adminNotes || "")
  }

  const handleUpdateAppeal = async (status: "Approved" | "Rejected") => {
    if (!selectedAppeal) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/appeals/${selectedAppeal._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          adminNotes,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update appeal")
      }

      toast({
        title: "Success",
        description: `Appeal ${status === "Approved" ? "approved" : "rejected"} successfully`,
      })

      // Update appeal in the list
      setAppeals((prevAppeals) =>
        prevAppeals.map((a) => (a._id === selectedAppeal._id ? { ...a, status, adminNotes } : a)),
      )

      // If the status changed, remove from current tab list
      if (activeTab === "Pending") {
        setAppeals((prevAppeals) => prevAppeals.filter((a) => a._id !== selectedAppeal._id))
        setSelectedAppeal(null)
      }

      // Refresh appeals
      fetchAppeals()
    } catch (error) {
      console.error("Error updating appeal:", error)
      toast({
        title: "Error",
        description: "Failed to update appeal",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge className="bg-amber-500">Pending</Badge>
      case "Approved":
        return <Badge className="bg-green-500">Approved</Badge>
      case "Rejected":
        return <Badge className="bg-red-500">Rejected</Badge>
      default:
        return null
    }
  }

  // Format date function to avoid TypeScript issues
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
        <h1 className="text-3xl font-bold">Manage Appeals</h1>
        <Button asChild>
          <Link href="/admin/dashboard">Back to Admin Dashboard</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Property Appeals</CardTitle>
              <CardDescription>Review and manage property appeals</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="Pending" className="space-y-4" onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="Pending">Pending</TabsTrigger>
                  <TabsTrigger value="Approved">Approved</TabsTrigger>
                  <TabsTrigger value="Rejected">Rejected</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab}>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-40 w-full" />
                      ))}
                    </div>
                  ) : appeals.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">No appeals found with this status.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {appeals.map((appeal) => (
                        <Card
                          key={appeal._id}
                          className={`cursor-pointer ${selectedAppeal?._id === appeal._id ? "border-emerald-500" : ""}`}
                          onClick={() => handleSelectAppeal(appeal)}
                        >
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row justify-between mb-4">
                              <div>
                                <h3 className="font-medium text-lg">{appeal.property.title}</h3>
                                <p className="text-gray-600 text-sm">
                                  {appeal.property.address}, {appeal.property.city}, {appeal.property.state}{" "}
                                  {appeal.property.zipCode}
                                </p>
                              </div>
                              <div className="mt-2 md:mt-0 flex items-center">
                                {getStatusBadge(appeal.status)}
                                <span className="text-sm text-gray-500 ml-2">{formatDate(appeal.createdAt)}</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div>
                                <h4 className="text-sm font-medium">Agent:</h4>
                                <p className="text-gray-600">
                                  {appeal.agent.firstName} {appeal.agent.lastName} ({appeal.agent.email})
                                </p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium">Appeal Reason:</h4>
                                <p className="text-gray-600 line-clamp-2">{appeal.reason}</p>
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
              <CardTitle>Appeal Details</CardTitle>
              <CardDescription>
                {selectedAppeal ? `Review appeal for "${selectedAppeal.property.title}"` : "Select an appeal to review"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedAppeal ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Property Status:</h3>
                    <p className="text-gray-600">{selectedAppeal.property.moderationStatus}</p>
                  </div>

                  {selectedAppeal.property.moderationNotes && (
                    <div>
                      <h3 className="text-sm font-medium">Moderation Notes:</h3>
                      <p className="text-gray-600 p-3 bg-gray-50 rounded-md">
                        {selectedAppeal.property.moderationNotes}
                      </p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium">Appeal Reason:</h3>
                    <p className="text-gray-600 p-3 bg-gray-50 rounded-md">{selectedAppeal.reason}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium">Admin Notes:</h3>
                    <Textarea
                      placeholder="Add notes about this appeal..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="min-h-[100px] mt-1"
                      disabled={selectedAppeal.status !== "Pending"}
                    />
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/properties/${selectedAppeal.property._id}`}>View Property</Link>
                    </Button>
                  </div>

                  {selectedAppeal.status === "Pending" && (
                    <div className="flex space-x-2 pt-2">
                      <Button
                        onClick={() => handleUpdateAppeal("Approved")}
                        disabled={isSubmitting}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleUpdateAppeal("Rejected")}
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
                  <p className="text-muted-foreground">Select an appeal to review</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
