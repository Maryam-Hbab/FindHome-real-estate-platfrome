"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Phone, Mail, Home, Building, User } from "lucide-react"

interface Agent {
  _id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  company?: string
  licenseNumber?: string
  profileImage?: string
  propertyCount: number
  forSaleCount: number
  forRentCount: number
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([])

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/agents?sortBy=${sortBy}`)

        if (!response.ok) {
          throw new Error("Failed to fetch agents")
        }

        const data = await response.json()
        setAgents(data)
        setFilteredAgents(data)
      } catch (error) {
        console.error("Error fetching agents:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAgents()
  }, [sortBy])

  // Filter agents based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAgents(agents)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = agents.filter(
      (agent) =>
        `${agent.firstName} ${agent.lastName}`.toLowerCase().includes(query) ||
        (agent.company && agent.company.toLowerCase().includes(query)),
    )
    setFilteredAgents(filtered)
  }, [searchQuery, agents])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // The filtering is already handled by the useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Our Real Estate Agents</h1>
        <p className="text-gray-600">
          Connect with our experienced real estate professionals to help you find your perfect property
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search agents by name or company"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <div className="w-full md:w-48">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="properties">Most Properties</SelectItem>
              <SelectItem value="recent">Recently Joined</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <User className="h-12 w-12 mx-auto text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold">No agents found</h2>
          <p className="text-gray-500 mt-2">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <Card key={agent._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="relative h-16 w-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {agent.profileImage ? (
                      <Image
                        src={agent.profileImage || "/placeholder.svg"}
                        alt={`${agent.firstName} ${agent.lastName}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 m-auto text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {agent.firstName} {agent.lastName}
                    </h3>
                    {agent.company && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <Building className="h-3 w-3 mr-1" />
                        {agent.company}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {agent.phoneNumber && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-emerald-600" />
                      <span>{agent.phoneNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2 text-emerald-600" />
                    <span>{agent.email}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Badge variant="outline" className="flex items-center">
                    <Home className="h-3 w-3 mr-1" />
                    {agent.propertyCount} Properties
                  </Badge>
                  {agent.forSaleCount > 0 && (
                    <Badge variant="outline" className="flex items-center">
                      {agent.forSaleCount} For Sale
                    </Badge>
                  )}
                  {agent.forRentCount > 0 && (
                    <Badge variant="outline" className="flex items-center">
                      {agent.forRentCount} For Rent
                    </Badge>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t flex justify-between">
                  <Button asChild variant="outline">
                    <Link href={`/agents/${agent._id}`}>View Profile</Link>
                  </Button>
                  <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                    <Link href={`/agents/${agent._id}#contact`}>Contact</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
