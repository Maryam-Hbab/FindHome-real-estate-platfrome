"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Phone, Mail, Building, MapPin, User, Home, Calendar, Award, MessageSquare } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Agent {
  _id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  company?: string
  licenseNumber?: string
  profileImage?: string
  properties: any[]
}

export default function AgentProfilePage() {
  const params = useParams()
  const { toast } = useToast()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/agents/${params.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch agent")
        }

        const data = await response.json()
        setAgent(data)
      } catch (error) {
        console.error("Error fetching agent:", error)
        toast({
          title: "Error",
          description: "Failed to load agent profile",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchAgent()
    }
  }, [params.id, toast])

  const handleContactAgent = () => {
    toast({
      title: "Message Sent",
      description: "The agent will contact you shortly.",
    })
  }

  if (loading) {
    return <AgentProfileSkeleton />
  }

  if (!agent) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Agent Not Found</h1>
        <p className="text-gray-600 mb-8">The agent you're looking for doesn't exist or has been removed.</p>
        <Link href="/agents">
          <Button className="bg-emerald-600 hover:bg-emerald-700">Browse Agents</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/agents" className="text-emerald-600 hover:text-emerald-700 mb-2 inline-block">
          ← Back to Agents
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Agent Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative h-32 w-32 rounded-full overflow-hidden bg-gray-200 mb-4">
                {agent.profileImage ? (
                  <Image
                    src={agent.profileImage || "/placeholder.svg"}
                    alt={`${agent.firstName} ${agent.lastName}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <User className="h-16 w-16 m-auto text-gray-400" />
                )}
              </div>
              <h1 className="text-2xl font-bold">
                {agent.firstName} {agent.lastName}
              </h1>
              {agent.company && (
                <div className="flex items-center justify-center text-gray-600 mt-1">
                  <Building className="h-4 w-4 mr-1" />
                  {agent.company}
                </div>
              )}
              {agent.licenseNumber && (
                <Badge variant="outline" className="mt-2">
                  License: {agent.licenseNumber}
                </Badge>
              )}
            </div>

            <div className="mt-6 space-y-4">
              {agent.phoneNumber && (
                <div className="flex items-center text-gray-600">
                  <Phone className="h-5 w-5 mr-3 text-emerald-600" />
                  <span>{agent.phoneNumber}</span>
                </div>
              )}
              <div className="flex items-center text-gray-600">
                <Mail className="h-5 w-5 mr-3 text-emerald-600" />
                <span>{agent.email}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-3">Expertise</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Residential</Badge>
                <Badge variant="secondary">Commercial</Badge>
                <Badge variant="secondary">Luxury Homes</Badge>
                <Badge variant="secondary">Investment Properties</Badge>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-3">Languages</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">English</Badge>
                <Badge variant="outline">Spanish</Badge>
              </div>
            </div>

            <div className="mt-6 space-y-2" id="contact">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleContactAgent}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Message
              </Button>
              {agent.phoneNumber && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={`tel:${agent.phoneNumber}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Call Agent
                  </a>
                </Button>
              )}
              <Button variant="outline" className="w-full" asChild>
                <a href={`mailto:${agent.email}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email Agent
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Agent Details */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="properties">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            <TabsContent value="properties" className="mt-6">
              <h2 className="text-xl font-semibold mb-4">
                {agent.properties.length > 0 ? `${agent.properties.length} Active Listings` : "No Active Listings"}
              </h2>

              {agent.properties.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Home className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="text-gray-500 mt-4">This agent has no active property listings</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {agent.properties.map((property) => (
                    <Card key={property._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative h-48">
                        <Image
                          src={
                            property.images && property.images.length > 0
                              ? property.images[0]
                              : "/placeholder.svg?height=300&width=500"
                          }
                          alt={property.title}
                          fill
                          className="object-cover"
                        />
                        <Badge className="absolute top-2 left-2 bg-emerald-600">{property.status}</Badge>
                      </div>
                      <CardContent className="p-4">
                        <Link href={`/properties/${property._id}`} className="hover:text-emerald-600">
                          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{property.title}</h3>
                        </Link>
                        <div className="flex items-center text-gray-500 mb-2">
                          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                          <p className="text-sm line-clamp-1">
                            {property.address}, {property.city}
                          </p>
                        </div>
                        <p className="font-bold text-lg text-emerald-600 mb-3">
                          {property.status === "For Rent"
                            ? `$${property.price.toLocaleString()}/month`
                            : `$${property.price.toLocaleString()}`}
                        </p>
                        <div className="flex justify-between text-gray-600">
                          <div className="flex items-center">
                            <span className="text-sm">{property.bedrooms} beds</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm">{property.bathrooms} baths</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm">{property.area} sq ft</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="about" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">About {agent.firstName}</h2>
                  <p className="text-gray-600 mb-6">
                    {agent.firstName} {agent.lastName} is a dedicated real estate professional with extensive experience
                    in the local market. Specializing in residential and commercial properties, {agent.firstName} is
                    committed to providing exceptional service to clients looking to buy, sell, or rent properties.
                  </p>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Experience</h3>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <Award className="h-5 w-5 text-emerald-600 mr-2 mt-0.5" />
                          <div>
                            <p className="font-medium">Top Performing Agent</p>
                            <p className="text-sm text-gray-600">Recognized for outstanding sales performance</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Calendar className="h-5 w-5 text-emerald-600 mr-2 mt-0.5" />
                          <div>
                            <p className="font-medium">5+ Years in Real Estate</p>
                            <p className="text-sm text-gray-600">Extensive experience in the local property market</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Home className="h-5 w-5 text-emerald-600 mr-2 mt-0.5" />
                          <div>
                            <p className="font-medium">100+ Properties Sold</p>
                            <p className="text-sm text-gray-600">Proven track record of successful transactions</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-2">Specializations</h3>
                      <ul className="list-disc pl-5 space-y-1 text-gray-600">
                        <li>Luxury residential properties</li>
                        <li>Commercial real estate</li>
                        <li>Investment properties</li>
                        <li>First-time homebuyers</li>
                        <li>Property valuation</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-2">Areas Served</h3>
                      <p className="text-gray-600">
                        Specializing in properties located in Downtown, Midtown, West End, and surrounding
                        neighborhoods.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function AgentProfileSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-6 w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Skeleton className="h-32 w-32 rounded-full mb-4" />
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-6 w-24" />
              </div>

              <div className="mt-6 space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>

              <div className="mt-6 pt-6 border-t">
                <Skeleton className="h-6 w-32 mb-3" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Skeleton className="h-10 w-full mb-6" />
          <Skeleton className="h-8 w-48 mb-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
