"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Plus, MoreHorizontal, Edit, Trash, Eye, ArrowUpDown, DollarSign, Home, Users } from "lucide-react"

// Define property type
interface Property {
  _id: string
  title: string
  price: number
  address: string
  city: string
  state: string
  status: "For Sale" | "For Rent" | "Sold" | "Rented"
  type: string
  bedrooms: number
  bathrooms: number
  area: number
  createdAt: string
  updatedAt: string
  views: number // This would be tracked in a real application
  inquiries: number // This would be tracked in a real application
}

// Define analytics data type
interface AnalyticsData {
  totalProperties: number
  activeListings: number
  soldProperties: number
  rentedProperties: number
  totalViews: number
  totalInquiries: number
  averagePrice: number
  monthlyViews: { month: string; count: number }[]
  monthlyInquiries: { month: string; count: number }[]
  propertiesByType: { type: string; count: number }[]
  propertiesByStatus: { status: string; count: number }[]
}

export default function ManagePropertiesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [sortConfig, setSortConfig] = useState<{ key: keyof Property; direction: "asc" | "desc" } | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)

  // Fetch properties
  useEffect(() => {
    if (!loading && user) {
      if (user.role !== "agent") {
        router.push("/dashboard")
        return
      }

      const fetchProperties = async () => {
        try {
          const response = await fetch("/api/properties?agent=true")
          if (!response.ok) throw new Error("Failed to fetch properties")

          const data = await response.json()
          setProperties(data)
          setFilteredProperties(data)

          // Generate mock analytics data
          generateMockAnalytics(data)

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
  }, [user, loading, router, toast])

  // Generate mock analytics data
  const generateMockAnalytics = (properties: Property[]) => {
    const totalProperties = properties.length
    const activeListings = properties.filter((p) => p.status === "For Sale" || p.status === "For Rent").length
    const soldProperties = properties.filter((p) => p.status === "Sold").length
    const rentedProperties = properties.filter((p) => p.status === "Rented").length

    // Calculate total views and inquiries (mock data)
    const totalViews = properties.reduce((sum, p) => sum + (p.views || 0), 0)
    const totalInquiries = properties.reduce((sum, p) => sum + (p.inquiries || 0), 0)

    // Calculate average price
    const averagePrice = properties.length > 0 ? properties.reduce((sum, p) => sum + p.price, 0) / properties.length : 0

    // Generate monthly data (mock)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    const monthlyViews = months.map((month) => ({
      month,
      count: Math.floor(Math.random() * 100),
    }))

    const monthlyInquiries = months.map((month) => ({
      month,
      count: Math.floor(Math.random() * 50),
    }))

    // Count properties by type
    const typeCount: Record<string, number> = {}
    properties.forEach((p) => {
      typeCount[p.type] = (typeCount[p.type] || 0) + 1
    })

    const propertiesByType = Object.entries(typeCount).map(([type, count]) => ({
      type,
      count,
    }))

    // Count properties by status
    const statusCount: Record<string, number> = {}
    properties.forEach((p) => {
      statusCount[p.status] = (statusCount[p.status] || 0) + 1
    })

    const propertiesByStatus = Object.entries(statusCount).map(([status, count]) => ({
      status,
      count,
    }))

    setAnalyticsData({
      totalProperties,
      activeListings,
      soldProperties,
      rentedProperties,
      totalViews,
      totalInquiries,
      averagePrice,
      monthlyViews,
      monthlyInquiries,
      propertiesByType,
      propertiesByStatus,
    })
  }

  // Filter properties based on active tab
  useEffect(() => {
    if (properties.length === 0) return

    switch (activeTab) {
      case "all":
        setFilteredProperties(properties)
        break
      case "forSale":
        setFilteredProperties(properties.filter((p) => p.status === "For Sale"))
        break
      case "forRent":
        setFilteredProperties(properties.filter((p) => p.status === "For Rent"))
        break
      case "sold":
        setFilteredProperties(properties.filter((p) => p.status === "Sold"))
        break
      case "rented":
        setFilteredProperties(properties.filter((p) => p.status === "Rented"))
        break
      default:
        setFilteredProperties(properties)
    }
  }, [activeTab, properties])

  // Handle sorting
  const requestSort = (key: keyof Property) => {
    let direction: "asc" | "desc" = "asc"

    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }

    setSortConfig({ key, direction })

    setFilteredProperties((prev) =>
      [...prev].sort((a, b) => {
        if (a[key] < b[key]) {
          return direction === "asc" ? -1 : 1
        }
        if (a[key] > b[key]) {
          return direction === "asc" ? 1 : -1
        }
        return 0
      }),
    )
  }

  // Handle property deletion
  const handleDeleteProperty = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        const response = await fetch(`/api/properties/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) throw new Error("Failed to delete property")

        // Remove property from state
        setProperties((prev) => prev.filter((p) => p._id !== id))
        setFilteredProperties((prev) => prev.filter((p) => p._id !== id))

        toast({
          title: "Property Deleted",
          description: "The property has been deleted successfully",
        })
      } catch (error) {
        console.error("Error deleting property:", error)
        toast({
          title: "Error",
          description: "Failed to delete property. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  // Redirect if not an agent
  if (!loading && user && user.role !== "agent") {
    router.push("/dashboard")
    return null
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Properties</h1>
        <Button asChild>
          <Link href="/properties/create">
            <Plus className="mr-2 h-4 w-4" /> Add Property
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="properties" className="space-y-6">
        <TabsList>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Your Properties</CardTitle>
              <CardDescription>Manage and track all your property listings.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <TabsList>
                  <TabsTrigger
                    value="all"
                    onClick={() => setActiveTab("all")}
                    className={activeTab === "all" ? "bg-primary text-primary-foreground" : ""}
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value="forSale"
                    onClick={() => setActiveTab("forSale")}
                    className={activeTab === "forSale" ? "bg-primary text-primary-foreground" : ""}
                  >
                    For Sale
                  </TabsTrigger>
                  <TabsTrigger
                    value="forRent"
                    onClick={() => setActiveTab("forRent")}
                    className={activeTab === "forRent" ? "bg-primary text-primary-foreground" : ""}
                  >
                    For Rent
                  </TabsTrigger>
                  <TabsTrigger
                    value="sold"
                    onClick={() => setActiveTab("sold")}
                    className={activeTab === "sold" ? "bg-primary text-primary-foreground" : ""}
                  >
                    Sold
                  </TabsTrigger>
                  <TabsTrigger
                    value="rented"
                    onClick={() => setActiveTab("rented")}
                    className={activeTab === "rented" ? "bg-primary text-primary-foreground" : ""}
                  >
                    Rented
                  </TabsTrigger>
                </TabsList>
              </div>

              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No properties found.</p>
                  <Button asChild className="mt-4">
                    <Link href="/properties/create">
                      <Plus className="mr-2 h-4 w-4" /> Add Property
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">
                          <button className="flex items-center" onClick={() => requestSort("title")}>
                            Title
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </button>
                        </TableHead>
                        <TableHead>
                          <button className="flex items-center" onClick={() => requestSort("price")}>
                            Price
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </button>
                        </TableHead>
                        <TableHead>
                          <button className="flex items-center" onClick={() => requestSort("status")}>
                            Status
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </button>
                        </TableHead>
                        <TableHead>
                          <button className="flex items-center" onClick={() => requestSort("type")}>
                            Type
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </button>
                        </TableHead>
                        <TableHead>
                          <button className="flex items-center" onClick={() => requestSort("createdAt")}>
                            Created
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </button>
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProperties.map((property) => (
                        <TableRow key={property._id}>
                          <TableCell className="font-medium">{property.title}</TableCell>
                          <TableCell>${property.price.toLocaleString()}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                property.status === "For Sale"
                                  ? "bg-blue-100 text-blue-800"
                                  : property.status === "For Rent"
                                    ? "bg-green-100 text-green-800"
                                    : property.status === "Sold"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-orange-100 text-orange-800"
                              }`}
                            >
                              {property.status}
                            </span>
                          </TableCell>
                          <TableCell>{property.type}</TableCell>
                          <TableCell>{new Date(property.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                  <Link href={`/properties/${property._id}`}>
                                    <Eye className="mr-2 h-4 w-4" /> View
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/properties/edit/${property._id}`}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteProperty(property._id)}
                                  className="text-red-600"
                                >
                                  <Trash className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : analyticsData?.totalProperties || 0}
                </div>
                <p className="text-xs text-muted-foreground">{analyticsData?.activeListings || 0} active listings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    `$${((analyticsData?.soldProperties || 0) * (analyticsData?.averagePrice || 0)).toLocaleString()}`
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  From {analyticsData?.soldProperties || 0} sold properties
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : analyticsData?.totalViews || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analyticsData?.totalViews && analyticsData.totalProperties
                    ? Math.round(analyticsData.totalViews / analyticsData.totalProperties)
                    : 0}{" "}
                  views per property
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : analyticsData?.totalInquiries || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analyticsData?.totalInquiries && analyticsData.totalProperties
                    ? Math.round(analyticsData.totalInquiries / analyticsData.totalProperties)
                    : 0}{" "}
                  inquiries per property
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Distribution</CardTitle>
                <CardDescription>Breakdown of your properties by type and status</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-sm font-medium mb-2">By Property Type</h4>
                      <div className="space-y-2">
                        {analyticsData?.propertiesByType.map((item) => (
                          <div key={item.type} className="flex items-center">
                            <div className="w-1/3 text-sm">{item.type}</div>
                            <div className="w-2/3 flex items-center gap-2">
                              <div
                                className="h-2 bg-primary rounded-full"
                                style={{
                                  width: `${(item.count / (analyticsData?.totalProperties || 1)) * 100}%`,
                                }}
                              />
                              <span className="text-sm text-muted-foreground">{item.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">By Status</h4>
                      <div className="space-y-2">
                        {analyticsData?.propertiesByStatus.map((item) => (
                          <div key={item.status} className="flex items-center">
                            <div className="w-1/3 text-sm">{item.status}</div>
                            <div className="w-2/3 flex items-center gap-2">
                              <div
                                className={`h-2 rounded-full ${
                                  item.status === "For Sale"
                                    ? "bg-blue-500"
                                    : item.status === "For Rent"
                                      ? "bg-green-500"
                                      : item.status === "Sold"
                                        ? "bg-purple-500"
                                        : "bg-orange-500"
                                }`}
                                style={{
                                  width: `${(item.count / (analyticsData?.totalProperties || 1)) * 100}%`,
                                }}
                              />
                              <span className="text-sm text-muted-foreground">{item.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Monthly views and inquiries for your properties</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="h-[300px] flex items-end gap-2">
                    {analyticsData?.monthlyViews.map((item, index) => (
                      <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full flex flex-col items-center gap-1">
                          <div
                            className="w-full bg-blue-500 rounded-t-sm"
                            style={{ height: `${(item.count / 100) * 200}px` }}
                            title={`${item.count} views`}
                          />
                          <div
                            className="w-full bg-green-500 rounded-t-sm"
                            style={{
                              height: `${(analyticsData.monthlyInquiries[index].count / 100) * 200}px`,
                            }}
                            title={`${analyticsData.monthlyInquiries[index].count} inquiries`}
                          />
                        </div>
                        <span className="text-xs">{item.month}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-sm">Views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-sm">Inquiries</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
