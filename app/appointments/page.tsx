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
import { Calendar, MapPin, Home, CheckCircle, XCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface Appointment {
  _id: string
  property: {
    _id: string
    title: string
    address: string
    city: string
    state: string
    zipCode: string
    images: string[]
  }
  agent: {
    _id: string
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    profileImage: string
  }
  client: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  date: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  notes?: string
  createdAt: string
  updatedAt: string
}

export default function AppointmentsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [notes, setNotes] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      router.push("/auth/login?callbackUrl=/appointments")
      return
    }

    // Fetch appointments
    if (user) {
      fetchAppointments()
    }
  }, [user, loading, router, activeTab])

  const fetchAppointments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/appointments${activeTab !== "all" ? `?status=${activeTab}` : ""}`)

      if (!response.ok) {
        throw new Error("Failed to fetch appointments")
      }

      const data = await response.json()
      setAppointments(data)
    } catch (error) {
      console.error("Error fetching appointments:", error)
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      setIsUpdating(true)
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          notes: notes || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update appointment")
      }

      toast({
        title: "Success",
        description: `Appointment ${status}`,
      })

      // Refresh appointments
      fetchAppointments()
      setDialogOpen(false)
    } catch (error) {
      console.error("Error updating appointment:", error)
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-500">Pending</Badge>
      case "confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>
      case "completed":
        return <Badge className="bg-blue-500">Completed</Badge>
      default:
        return null
    }
  }

  if (loading || isLoading) {
    return <AppointmentsSkeleton />
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Appointments</h1>
        <Button asChild>
          <Link href="/properties">Browse Properties</Link>
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>Your Appointments</CardTitle>
              <CardDescription>
                {user?.role === "agent"
                  ? "Manage your upcoming property tours with clients."
                  : "Track your scheduled property tours."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <div className="text-center py-10">
                  <h3 className="text-lg font-medium mb-2">No appointments found</h3>
                  <p className="text-gray-500 mb-6">
                    {activeTab === "all"
                      ? "You don't have any appointments yet."
                      : `You don't have any ${activeTab} appointments.`}
                  </p>
                  <Button asChild>
                    <Link href="/properties">Browse Properties</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{appointment.property.title}</h3>
                            <div className="flex items-center text-gray-600 mt-1">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>
                                {appointment.property.address}, {appointment.property.city},{" "}
                                {appointment.property.state} {appointment.property.zipCode}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 md:mt-0 flex items-center">{getStatusBadge(appointment.status)}</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-start">
                            <Calendar className="h-5 w-5 text-emerald-600 mr-2 mt-0.5" />
                            <div>
                              <p className="font-medium">Appointment Time</p>
                              <p className="text-gray-600">{formatDate(appointment.date)}</p>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <Home className="h-5 w-5 text-emerald-600 mr-2 mt-0.5" />
                            <div>
                              <p className="font-medium">{user?.role === "agent" ? "Client" : "Agent"}</p>
                              <p className="text-gray-600">
                                {user?.role === "agent"
                                  ? `${appointment.client.firstName} ${appointment.client.lastName}`
                                  : `${appointment.agent.firstName} ${appointment.agent.lastName}`}
                              </p>
                              <p className="text-gray-600">
                                {user?.role === "agent" ? appointment.client.email : appointment.agent.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        {appointment.notes && (
                          <div className="mb-4">
                            <p className="font-medium">Notes:</p>
                            <p className="text-gray-600 bg-gray-50 p-3 rounded-md">{appointment.notes}</p>
                          </div>
                        )}

                        {/* Action buttons for agents */}
                        {user?.role === "agent" && appointment.status === "pending" && (
                          <div className="flex space-x-2 mt-4">
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  className="bg-emerald-600 hover:bg-emerald-700"
                                  onClick={() => {
                                    setSelectedAppointment(appointment)
                                    setNotes("")
                                  }}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Confirm
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Confirm Appointment</DialogTitle>
                                  <DialogDescription>Add any additional information for the client.</DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                  <Textarea
                                    placeholder="Add notes for the client (optional)"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="min-h-[100px]"
                                  />
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isUpdating}>
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() => updateAppointmentStatus(appointment._id, "confirmed")}
                                    disabled={isUpdating}
                                  >
                                    {isUpdating ? "Confirming..." : "Confirm Appointment"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => updateAppointmentStatus(appointment._id, "cancelled")}
                              disabled={isUpdating}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancel
                            </Button>
                          </div>
                        )}

                        {/* Action buttons for clients */}
                        {user?.role === "user" && appointment.status === "pending" && (
                          <div className="flex space-x-2 mt-4">
                            <Button
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => updateAppointmentStatus(appointment._id, "cancelled")}
                              disabled={isUpdating}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancel Appointment
                            </Button>
                          </div>
                        )}

                        {/* View property button for all */}
                        <div className="mt-4">
                          <Button asChild variant="outline">
                            <Link href={`/properties/${appointment.property._id}`}>View Property</Link>
                          </Button>
                        </div>
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

function AppointmentsSkeleton() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>

      <Skeleton className="h-10 w-full mb-6" />

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
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
