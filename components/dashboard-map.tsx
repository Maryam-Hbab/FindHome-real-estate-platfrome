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
    _id: "507f1f77bcf86cd799439011", // Added MongoDB-compatible ObjectId
    title: "Modern Apartment with City View",
    price: 450000,
    lat: 40.7128,
    lng: -74.006,
    type: "Apartment",
    status: "For Sale",
    location: {
      type: "Point",
      coordinates: [-74.006, 40.7128], // [longitude, latitude] for New York
    },
  },
  {
    id: "2",
    _id: "507f1f77bcf86cd799439012", // Added MongoDB-compatible ObjectId
    title: "Luxury Villa with Pool",
    price: 1250000,
    lat: 25.7617,
    lng: -80.1918,
    type: "House",
    status: "For Sale",
    location: {
      type: "Point",
      coordinates: [-80.1918, 25.7617], // [longitude, latitude] for Miami
    },
  },
  {
    id: "3",
    _id: "507f1f77bcf86cd799439013", // Added MongoDB-compatible ObjectId
    title: "Cozy Studio in Downtown",
    price: 1800,
    lat: 37.7749,
    lng: -122.4194,
    type: "Apartment",
    status: "For Rent",
    location: {
      type: "Point",
      coordinates: [-122.4194, 37.7749], // [longitude, latitude] for San Francisco
    },
  },
  {
    id: "4",
    _id: "507f1f77bcf86cd799439014", // Added MongoDB-compatible ObjectId
    title: "Spacious Family Home",
    price: 750000,
    lat: 30.2672,
    lng: -97.7431,
    type: "House",
    status: "For Sale",
    location: {
      type: "Point",
      coordinates: [-97.7431, 30.2672], // [longitude, latitude] for Austin
    },
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
