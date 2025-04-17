"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"

export default function HeroSearch() {
  const router = useRouter()
  const [searchType, setSearchType] = useState("buy")
  const [location, setLocation] = useState("")
  const [propertyType, setPropertyType] = useState("")
  const [priceRange, setPriceRange] = useState("")
  const [bedrooms, setBedrooms] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // Build query parameters
    const params = new URLSearchParams()
    if (location) params.append("location", location)
    if (propertyType) params.append("type", propertyType)
    if (priceRange) params.append("price", priceRange)
    if (bedrooms) params.append("bedrooms", bedrooms)
    params.append("status", searchType === "buy" ? "for-sale" : "for-rent")
  }

  
}
