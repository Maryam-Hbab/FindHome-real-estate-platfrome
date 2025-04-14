"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, Maximize2, Calendar, TrendingUp, Download, Share } from "lucide-react"

export default function PropertyValuationTool() {
  const [address, setAddress] = useState("")
  const [propertyType, setPropertyType] = useState("house")
  const [bedrooms, setBedrooms] = useState(3)
  const [bathrooms, setBathrooms] = useState(2)
  const [squareFeet, setSquareFeet] = useState(1500)
  const [yearBuilt, setYearBuilt] = useState(2000)
  const [lotSize, setLotSize] = useState(0.25)
  const [condition, setCondition] = useState("good")
  const [isLoading, setIsLoading] = useState(false)
  const [valuationResult, setValuationResult] = useState<null | {
    estimatedValue: number
    valueRange: [number, number]
    confidence: number
    comparables: Array<{
      address: string
      price: number
      bedrooms: number
      bathrooms: number
      squareFeet: number
      distanceInMiles: number
      daysAgo: number
    }>
  }>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call for property valuation
    setTimeout(() => {
      // Mock valuation result
      const baseValue = 350000
      const bedroomValue = bedrooms * 25000
      const bathroomValue = bathrooms * 15000
      const sqftValue = squareFeet * 150
      const ageValue = (2023 - yearBuilt) * -1000
      const lotValue = lotSize * 100000

      const conditionMultiplier =
        condition === "excellent" ? 1.1 : condition === "good" ? 1.0 : condition === "fair" ? 0.9 : 0.8

      const estimatedValue =
        (baseValue + bedroomValue + bathroomValue + sqftValue + ageValue + lotValue) * conditionMultiplier

      // Generate mock comparables
      const comparables = [
        {
          address: "123 Nearby St",
          price: estimatedValue * 0.95,
          bedrooms: bedrooms,
          bathrooms: bathrooms,
          squareFeet: squareFeet - 100,
          distanceInMiles: 0.3,
          daysAgo: 45,
        },
        {
          address: "456 Similar Ave",
          price: estimatedValue * 1.05,
          bedrooms: bedrooms,
          bathrooms: bathrooms + 0.5,
          squareFeet: squareFeet + 150,
          distanceInMiles: 0.5,
          daysAgo: 30,
        },
        {
          address: "789 Comparable Ln",
          price: estimatedValue * 0.98,
          bedrooms: bedrooms - 1,
          bathrooms: bathrooms,
          squareFeet: squareFeet + 50,
          distanceInMiles: 0.7,
          daysAgo: 60,
        },
      ]

      setValuationResult({
        estimatedValue,
        valueRange: [estimatedValue * 0.9, estimatedValue * 1.1],
        confidence: 85,
        comparables,
      })

      setIsLoading(false)
    }, 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Valuation Tool</CardTitle>
        <CardDescription>
          Get an estimated market value for your property based on comparable sales and property details
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!valuationResult ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Property Address</label>
                <Input
                  placeholder="Enter property address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Property Type</label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Condition</label>
                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Bedrooms</label>
                    <span className="text-sm text-gray-500">{bedrooms}</span>
                  </div>
                  <Slider
                    min={1}
                    max={7}
                    step={1}
                    value={[bedrooms]}
                    onValueChange={(value) => setBedrooms(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Bathrooms</label>
                    <span className="text-sm text-gray-500">{bathrooms}</span>
                  </div>
                  <Slider
                    min={1}
                    max={5}
                    step={0.5}
                    value={[bathrooms]}
                    onValueChange={(value) => setBathrooms(value[0])}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Square Feet</label>
                  <span className="text-sm text-gray-500">{squareFeet} sq ft</span>
                </div>
                <div className="relative">
                  <Maximize2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    value={squareFeet}
                    onChange={(e) => setSquareFeet(Number.parseInt(e.target.value) || 0)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Year Built</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      value={yearBuilt}
                      onChange={(e) => setYearBuilt(Number.parseInt(e.target.value) || 0)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Lot Size (acres)</label>
                  <div className="relative">
                    <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      step="0.01"
                      value={lotSize}
                      onChange={(e) => setLotSize(Number.parseFloat(e.target.value) || 0)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Calculating...
                </>
              ) : (
                "Get Property Valuation"
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <Tabs defaultValue="estimate">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="estimate">Estimate</TabsTrigger>
                <TabsTrigger value="comparables">Comparables</TabsTrigger>
              </TabsList>

              <TabsContent value="estimate" className="space-y-6 pt-4">
                <div className="text-center">
                  <h3 className="text-sm font-medium text-gray-500">Estimated Market Value</h3>
                  <div className="text-4xl font-bold text-emerald-600 my-2">
                    ${Math.round(valuationResult.estimatedValue).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Value Range: ${Math.round(valuationResult.valueRange[0]).toLocaleString()} - $
                    {Math.round(valuationResult.valueRange[1]).toLocaleString()}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Confidence Score</span>
                    <span className="text-sm">{valuationResult.confidence}%</span>
                  </div>
                  <Progress value={valuationResult.confidence} className="h-2" />
                  <p className="text-xs text-gray-500">
                    Based on the quality and quantity of comparable properties in your area
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <TrendingUp className="h-5 w-5 text-emerald-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Market Insights</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Property values in this area have increased by 5.2% over the past year. The market is currently
                        favorable for sellers with properties typically selling within 15 days of listing.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Save Report
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="comparables" className="space-y-4 pt-4">
                <h3 className="font-medium">Comparable Properties</h3>
                <p className="text-sm text-gray-600">
                  Recently sold properties in your area with similar characteristics
                </p>

                <div className="space-y-4">
                  {valuationResult.comparables.map((comp, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{comp.address}</h4>
                          <p className="text-sm text-gray-500">
                            {comp.distanceInMiles} miles away • Sold {comp.daysAgo} days ago
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">${Math.round(comp.price).toLocaleString()}</div>
                          <div className="text-sm text-gray-500">${Math.round(comp.price / comp.squareFeet)}/sq ft</div>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span>{comp.bedrooms} beds</span>
                        <span>{comp.bathrooms} baths</span>
                        <span>{comp.squareFeet} sq ft</span>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full" onClick={() => setValuationResult(null)}>
                  Start New Valuation
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
