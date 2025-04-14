"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import EnhancedPropertySearch from "@/components/enhanced-property-search"
import MapPropertySearch from "@/components/map-property-search"
import { useMobile } from "@/hooks/use-mobile"
import { List, MapPin } from "lucide-react"

export default function PropertySearchPage() {
  const [searchMode, setSearchMode] = useState<"list" | "map">("list")
  const isMobile = useMobile()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find Your Perfect Property</h1>
        <p className="text-gray-600">Use our advanced search tools to find properties that match your exact criteria</p>
      </div>

      <div className="mb-6">
        <EnhancedPropertySearch />
      </div>

      {!isMobile && (
        <div className="mb-6">
          <Tabs defaultValue="list" onValueChange={(value) => setSearchMode(value as "list" | "map")}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="list" className="flex items-center">
                <List className="h-4 w-4 mr-2" />
                List View
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Map View
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {searchMode === "map" ? (
        <MapPropertySearch />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-3">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Search Results</h2>
              {isMobile && (
                <Button variant="outline" onClick={() => setSearchMode(searchMode === "list" ? "map" : "list")}>
                  {searchMode === "list" ? (
                    <>
                      <MapPin className="h-4 w-4 mr-2" />
                      Map View
                    </>
                  ) : (
                    <>
                      <List className="h-4 w-4 mr-2" />
                      List View
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* This would be replaced with actual search results */}
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">Use the search filters above to find properties</p>
              <Button className="bg-emerald-600 hover:bg-emerald-700">Browse All Properties</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
