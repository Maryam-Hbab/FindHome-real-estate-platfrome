"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

interface Appeal {
  _id: string
  property: {
    _id: string
    title: string
    address: string
    city: string
    state: string
    zipCode: string
  }
  reason: string
  status: "Pending" | "Approved" | "Rejected"
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

export default function AppealsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [appeals, setAppeals] = useState<Appeal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  // Format date function to avoid TypeScript issues with date-fns
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.toLocaleDateString("en-US", { month: "short" })} ${date.getDate()}, ${date.getFullYear()}`
  }

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    // Fetch appeals
    if (user) {
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

      fetchAppeals()
    }
  }, [user, loading, router, toast, activeTab])

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

  if (loading || isLoading) {
    return <AppealsSkeleton />
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Property Appeals</h1>
        <Button asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Your Appeals</CardTitle>
          <CardDescription>Track the status of your property appeals</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="Pending">Pending</TabsTrigger>
              <TabsTrigger value="Approved">Approved</TabsTrigger>
              <TabsTrigger value="Rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {appeals.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No appeals found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appeals.map((appeal) => (
                    <Card key={appeal._id}>
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
                            <span className="text-sm text-gray-500 ml-2">Submitted {formatDate(appeal.createdAt)}</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium">Your Appeal Reason:</h4>
                            <p className="text-gray-600 mt-1 p-3 bg-gray-50 rounded-md">{appeal.reason}</p>
                          </div>

                          {appeal.adminNotes && (
                            <div>
                              <h4 className="text-sm font-medium">Admin Response:</h4>
                              <p className="text-gray-600 mt-1 p-3 bg-gray-50 rounded-md">{appeal.adminNotes}</p>
                            </div>
                          )}

                          <div className="flex justify-end">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/properties/${appeal.property._id}`}>View Property</Link>
                            </Button>
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
  )
}

function AppealsSkeleton() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-48 mb-6" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
