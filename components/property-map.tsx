"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

// Type definitions for Leaflet and Leaflet Draw
// These are only used for TypeScript type checking
type LeafletMap = any
type LeafletMarker = any
type LeafletLatLngBounds = any
type LeafletFeatureGroup = any

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
  selectedProperty?: string | null
  onMarkerClick?: (propertyId: string) => void
  mapRef?: React.MutableRefObject<any | null>
  drawingEnabled?: boolean
  onAreaDrawn?: (bounds: any) => void
}

export default function PropertyMap({
  properties,
  selectedProperty = null,
  onMarkerClick,
  mapRef,
  drawingEnabled = false,
  onAreaDrawn,
}: PropertyMapProps) {
  const internalMapRef = useRef<LeafletMap | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<{ [key: string]: LeafletMarker }>({})
  const drawControlRef = useRef<any>(null)
  const { toast } = useToast()
  const router = useRouter()
  const [mapInitialized, setMapInitialized] = useState(false)
  const [leaflet, setLeaflet] = useState<any>(null)

  // Dynamically import Leaflet only on the client side
  useEffect(() => {
    // Only import Leaflet in the browser
    const loadLeaflet = async () => {
      try {
        // Dynamic imports to avoid SSR issues
        const L = (await import("leaflet")).default

        // Import CSS in a way that works with Next.js
        if (typeof document !== "undefined") {
          // Only load CSS on the client side
          const link = document.createElement("link")
          link.rel = "stylesheet"
          link.href = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
          document.head.appendChild(link)
        }

        // Fix Leaflet icon issues
        // Use type assertion to bypass TypeScript's type checking
        delete (L.Icon.Default.prototype as any)._getIconUrl

        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        })

        setLeaflet(L)
      } catch (error) {
        console.error("Error loading Leaflet:", error)
        toast({
          title: "Map Error",
          description: "There was an error loading the map. Please try again later.",
          variant: "destructive",
        })
      }
    }

    loadLeaflet()
  }, [toast])

  // Create custom marker icons
  const createCustomIcon = (L: any, isSelected: boolean) => {
    return L.divIcon({
      className: "custom-marker-icon",
      html: `<div class="w-8 h-8 flex items-center justify-center rounded-full ${
        isSelected ? "bg-emerald-600" : "bg-white"
      } text-${isSelected ? "white" : "emerald-600"} font-bold border-2 border-emerald-600 shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    })
  }

  // Initialize map
  useEffect(() => {
    // Only initialize map when Leaflet is loaded and we have a container
    if (!leaflet || !mapContainerRef.current || internalMapRef.current) return

    const L = leaflet

    try {
      // Create map centered on first property or default location
      const firstProperty = properties[0]
      const initialLat = firstProperty?.lat || 40.7128
      const initialLng = firstProperty?.lng || -74.006

      // Create the map
      const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 12)

      // Add tile layer (OpenStreetMap)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      // Store map reference
      internalMapRef.current = map

      // If external ref is provided, store the map there too
      if (mapRef) {
        mapRef.current = map
      }

      // Add drawing controls if enabled
      if (drawingEnabled && onAreaDrawn) {
        // Load Leaflet Draw plugin
        import("leaflet-draw").then(() => {
          if (!internalMapRef.current) return

          // Create feature group for drawn items
          const drawnItems = new L.FeatureGroup()
          internalMapRef.current.addLayer(drawnItems)

          // Initialize draw control
          // Use type assertion to bypass TypeScript errors
          const DrawControl = (L.Control as any).Draw
          const drawControl = new DrawControl({
            draw: {
              polyline: false,
              polygon: true,
              circle: false,
              marker: false,
              rectangle: true,
              circlemarker: false,
            },
            edit: {
              featureGroup: drawnItems,
            },
          })
          internalMapRef.current.addControl(drawControl)
          drawControlRef.current = drawControl

          // Handle draw events
          // Use string literals for event names to bypass TypeScript errors
          internalMapRef.current.on("draw:created", (event: any) => {
            const layer = event.layer
            drawnItems.addLayer(layer)

            // Get bounds of drawn shape
            const bounds = layer.getBounds()
            if (onAreaDrawn) {
              onAreaDrawn(bounds)
            }

            // Show toast notification
            toast({
              title: "Area Selected",
              description: "Showing properties in the selected area",
            })
          })

          // Clear previous drawings when starting a new one
          internalMapRef.current.on("draw:drawstart", () => {
            drawnItems.clearLayers()
          })
        })
      }

      setMapInitialized(true)
    } catch (error) {
      console.error("Error initializing map:", error)
      toast({
        title: "Map Error",
        description: "There was an error loading the map. Please try again later.",
        variant: "destructive",
      })
    }

    // Cleanup function
    return () => {
      if (internalMapRef.current && !mapRef) {
        internalMapRef.current.remove()
        internalMapRef.current = null
      }
    }
  }, [leaflet, properties, toast, mapRef, drawingEnabled, onAreaDrawn])

  // Add property markers when properties change or map is initialized
  useEffect(() => {
    if (!leaflet || !internalMapRef.current || !mapInitialized) return

    const L = leaflet

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => {
      marker.remove()
    })
    markersRef.current = {}

    // Add property markers
    properties.forEach((property) => {
      // Skip if no coordinates
      if (!property.lat || !property.lng) return

      const isSelected = selectedProperty === property.id
      const icon = createCustomIcon(L, isSelected)

      const marker = L.marker([property.lat, property.lng], { icon }).addTo(internalMapRef.current!)

      // Store marker reference
      markersRef.current[property.id] = marker

      // Create popup content
      const popupContent = `
        <div class="map-popup">
          <h3 class="font-semibold">${property.title}</h3>
          <p class="text-emerald-600 font-bold">${property.status === "For Rent" ? `${property.price}/month` : `${property.price.toLocaleString()}`}</p>
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

        // Call onMarkerClick if provided
        if (onMarkerClick) {
          onMarkerClick(property.id)
        }
      })
    })

    // If a property is selected, center map on it
    if (selectedProperty) {
      const property = properties.find((p) => p.id === selectedProperty)
      if (property?.lat && property?.lng) {
        internalMapRef.current.setView([property.lat, property.lng], 15)

        // Open popup for selected property
        const marker = markersRef.current[selectedProperty]
        if (marker) {
          marker.openPopup()
        }
      }
    }
  }, [leaflet, properties, selectedProperty, mapInitialized, onMarkerClick])

  return <div ref={mapContainerRef} className="h-full w-full" />
}
