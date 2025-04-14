"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  School,
  Coffee,
  ShoppingBag,
  Utensils,
  Train,
  Bus,
  Car,
  ParkingMeterIcon as Park,
  Heart,
  Shield,
  Building,
  Users,
} from "lucide-react"

interface NeighborhoodInsightsProps {
  neighborhoodData: {
    name: string
    city: string
    state: string
    walkScore: number
    transitScore: number
    bikeScore: number
    crimeRate: "Low" | "Medium" | "High"
    schools: SchoolData[]
    amenities: Amenity[]
    demographics: {
      population: number
      medianAge: number
      medianIncome: number
      homeOwnership: number
    }
    marketTrends: {
      medianHomePrice: number
      priceChange: number
      medianRent: number
      rentChange: number
    }
  }
}

interface SchoolData {
  name: string
  type: "Elementary" | "Middle" | "High" | "Private"
  rating: number
  distance: number
}

interface Amenity {
  name: string
  type: "Restaurant" | "Cafe" | "Shopping" | "Grocery" | "Park" | "Gym" | "Entertainment"
  rating: number
  distance: number
}

export default function NeighborhoodInsights({ neighborhoodData }: NeighborhoodInsightsProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-emerald-600"
    if (score >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    if (score >= 40) return "Average"
    if (score >= 20) return "Below Average"
    return "Poor"
  }

  const getCrimeColor = (rate: string) => {
    if (rate === "Low") return "text-green-600"
    if (rate === "Medium") return "text-yellow-600"
    return "text-red-600"
  }

  const getAmenityIcon = (type: string) => {
    switch (type) {
      case "Restaurant":
        return <Utensils className="h-4 w-4" />
      case "Cafe":
        return <Coffee className="h-4 w-4" />
      case "Shopping":
        return <ShoppingBag className="h-4 w-4" />
      case "Grocery":
        return <ShoppingBag className="h-4 w-4" />
      case "Park":
        return <Park className="h-4 w-4" />
      case "Gym":
        return <Users className="h-4 w-4" />
      case "Entertainment":
        return <Heart className="h-4 w-4" />
      default:
        return <Building className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Neighborhood Insights: {neighborhoodData.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schools">Schools</TabsTrigger>
            <TabsTrigger value="amenities">Amenities</TabsTrigger>
            <TabsTrigger value="market">Market Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Livability Scores</h3>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Walk Score</span>
                    <span className={getScoreColor(neighborhoodData.walkScore)}>
                      {neighborhoodData.walkScore}/100 - {getScoreLabel(neighborhoodData.walkScore)}
                    </span>
                  </div>
                  <Progress value={neighborhoodData.walkScore} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Transit Score</span>
                    <span className={getScoreColor(neighborhoodData.transitScore)}>
                      {neighborhoodData.transitScore}/100 - {getScoreLabel(neighborhoodData.transitScore)}
                    </span>
                  </div>
                  <Progress value={neighborhoodData.transitScore} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Bike Score</span>
                    <span className={getScoreColor(neighborhoodData.bikeScore)}>
                      {neighborhoodData.bikeScore}/100 - {getScoreLabel(neighborhoodData.bikeScore)}
                    </span>
                  </div>
                  <Progress value={neighborhoodData.bikeScore} className="h-2" />
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center">
                      <Shield className="h-4 w-4 mr-1" />
                      Crime Rate
                    </span>
                    <span className={getCrimeColor(neighborhoodData.crimeRate)}>{neighborhoodData.crimeRate}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-lg">Transportation</h3>

                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <Train className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Public Transit</h4>
                      <p className="text-sm text-gray-600">
                        {neighborhoodData.transitScore >= 70
                          ? "Excellent public transportation options available."
                          : neighborhoodData.transitScore >= 40
                            ? "Some public transportation options available."
                            : "Limited public transportation options."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <Car className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Commute</h4>
                      <p className="text-sm text-gray-600">Average commute time: 25 minutes</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-purple-100 p-2 rounded-full mr-3">
                      <Bus className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Bus Lines</h4>
                      <p className="text-sm text-gray-600">5 bus lines within 0.5 miles</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-lg">Demographics</h3>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Population</span>
                    <span className="font-medium">{neighborhoodData.demographics.population.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Median Age</span>
                    <span className="font-medium">{neighborhoodData.demographics.medianAge} years</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Median Household Income</span>
                    <span className="font-medium">${neighborhoodData.demographics.medianIncome.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Home Ownership</span>
                    <span className="font-medium">{neighborhoodData.demographics.homeOwnership}%</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="schools">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {neighborhoodData.schools.map((school, index) => (
                  <div key={index} className="flex items-start p-4 border rounded-lg">
                    <div className="bg-blue-100 p-2 rounded-full mr-4">
                      <School className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{school.name}</h4>
                        <Badge variant={school.rating >= 8 ? "default" : school.rating >= 6 ? "secondary" : "outline"}>
                          {school.rating}/10
                        </Badge>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-gray-600">{school.type}</span>
                        <span className="text-sm text-gray-600">{school.distance} miles away</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-sm text-gray-500 italic">School ratings provided by GreatSchools.org</div>
            </div>
          </TabsContent>

          <TabsContent value="amenities">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {neighborhoodData.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-start p-4 border rounded-lg">
                    <div className="bg-emerald-100 p-2 rounded-full mr-4">{getAmenityIcon(amenity.type)}</div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{amenity.name}</h4>
                        <Badge variant="outline">{amenity.rating}/5</Badge>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-gray-600">{amenity.type}</span>
                        <span className="text-sm text-gray-600">{amenity.distance} miles away</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="market">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Home Prices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">
                      ${neighborhoodData.marketTrends.medianHomePrice.toLocaleString()}
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`text-sm ${neighborhoodData.marketTrends.priceChange >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {neighborhoodData.marketTrends.priceChange >= 0 ? "+" : ""}
                        {neighborhoodData.marketTrends.priceChange}%
                      </span>
                      <span className="text-sm text-gray-600 ml-1">year over year</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-2">Median home price in this neighborhood</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Rental Prices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">
                      ${neighborhoodData.marketTrends.medianRent.toLocaleString()}/mo
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`text-sm ${neighborhoodData.marketTrends.rentChange >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {neighborhoodData.marketTrends.rentChange >= 0 ? "+" : ""}
                        {neighborhoodData.marketTrends.rentChange}%
                      </span>
                      <span className="text-sm text-gray-600 ml-1">year over year</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-2">Median rental price in this neighborhood</div>
                  </CardContent>
                </Card>
              </div>

              <div className="text-sm text-gray-500 italic">
                Market data last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
