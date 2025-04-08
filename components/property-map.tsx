"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

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

interface Property {
  id: string
  title: string
  price: number
  address: string
  status: string
  lat?: number
  lng?: number
  // Add other property fields as needed
}

interface PropertyMapProps {
  properties: Property[]
}

export default function PropertyMap({ properties }: PropertyMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Fix Leaflet icon issues
    fixLeafletIcon()

    // Initialize map only if it doesn't exist yet
    if (!mapRef.current && mapContainerRef.current) {
      try {
        // Create map centered on New York by default
        mapRef.current = L.map(mapContainerRef.current).setView([40.7128, -74.006], 12)

        // Add tile layer (OpenStreetMap)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapRef.current)

        // Add property markers
        // In a real app, you would use the actual lat/lng from the properties
        // For demo, we'll generate random coordinates around New York
        properties.forEach((property, index) => {
          // Generate random coordinates around New York for demo
          const lat = property.lat || 40.7128 + (Math.random() * 0.05 - 0.025)
          const lng = property.lng || -74.006 + (Math.random() * 0.05 - 0.025)

          const marker = L.marker([lat, lng]).addTo(mapRef.current!)

          // Create popup content
          const popupContent = `
            <div class="map-popup">
              <h3 class="font-semibold">${property.title}</h3>
              <p class="text-emerald-600 font-bold">${property.status === "For Rent" ? `$${property.price}/month` : `$${property.price.toLocaleString()}`}</p>
              <p>${property.address}</p>
              <a href="/properties/${property.id}" class="text-emerald-600 hover:underline">View details</a>
            </div>
          `

          // Bind popup to marker
          marker.bindPopup(popupContent)

          // Add click handler
          marker.on("click", () => {
            // Open popup
            marker.openPopup()
          })
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
  }, [properties, toast])

  return <div ref={mapContainerRef} className="h-full w-full" />
}

