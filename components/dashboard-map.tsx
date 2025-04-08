"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useToast } from "@/components/ui/use-toast"

// Fix Leaflet icon issues
const fixLeafletIcon = () => {
  // Only run on the client
  if (typeof window !== "undefined") {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    })
  }
}

// Mock property data
const mockProperties = [
  {
    id: "1",
    title: "Modern Apartment with City View",
    price: 450000,
    lat: 40.7128,
    lng: -74.006,
    type: "Apartment",
    status: "For Sale",
  },
  {
    id: "2",
    title: "Luxury Villa with Pool",
    price: 1250000,
    lat: 40.7148,
    lng: -74.013,
    type: "House",
    status: "For Sale",
  },
  {
    id: "3",
    title: "Cozy Studio in Downtown",
    price: 1800,
    lat: 40.7158,
    lng: -73.998,
    type: "Apartment",
    status: "For Rent",
  },
  {
    id: "4",
    title: "Spacious Family Home",
    price: 750000,
    lat: 40.7118,
    lng: -74.016,
    type: "House",
    status: "For Sale",
  },
]

export default function DashboardMap() {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Fix Leaflet icon issues
    fixLeafletIcon()

    // Initialize map only if it doesn't exist yet
    if (!mapRef.current && mapContainerRef.current) {
      try {
        // Create map
        mapRef.current = L.map(mapContainerRef.current).setView([40.7128, -74.006], 13)

        // Add tile layer (OpenStreetMap)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapRef.current)

        // Add property markers
        mockProperties.forEach((property) => {
          const marker = L.marker([property.lat, property.lng]).addTo(mapRef.current!)

          // Create popup content
          const popupContent = `
            <div class="map-popup">
              <h3 class="font-semibold">${property.title}</h3>
              <p class="text-emerald-600 font-bold">${property.status === "For Rent" ? `$${property.price}/month` : `$${property.price.toLocaleString()}`}</p>
              <p>${property.type} • ${property.status}</p>
              <a href="/properties/${property.id}" class="text-emerald-600 hover:underline">View details</a>
            </div>
          `

          // Bind popup to marker
          marker.bindPopup(popupContent)
        })
      } catch (error) {
        console.error("Error initializing map:", error)
        toast({
          title: "Map Error",
          description: "There was an error loading the map. Please try again later.",
          variant: "destructive",
        })
      }
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [toast])

  return <div ref={mapContainerRef} className="h-full w-full" />
}

