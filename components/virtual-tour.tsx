"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, Maximize, Minimize, Camera, Video } from "lucide-react"

interface VirtualTourProps {
  propertyId: string
  panoramaUrls: string[]
  videoTourUrl?: string
}

export default function VirtualTour({ propertyId, panoramaUrls, videoTourUrl }: VirtualTourProps) {
  const [activeTab, setActiveTab] = useState<"360" | "video">("360")
  const [currentPanorama, setCurrentPanorama] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null)

  useEffect(() => {
    // Load Pannellum library dynamically
    const loadPannellum = async () => {
      try {
        // @ts-ignore
        await import("pannellum")
        // @ts-ignore
        const pannellum = window.pannellum

        if (pannellum && containerRef.current) {
          // Initialize panorama viewer
          viewerRef.current = pannellum.viewer(containerRef.current, {
            type: "equirectangular",
            panorama: panoramaUrls[currentPanorama],
            autoLoad: true,
            showControls: false,
            compass: true,
            hfov: 100,
            mouseZoom: true,
            friction: 0.2,
            onLoad: () => {
              setLoading(false)
            },
            onError: (err: any) => {
              console.error("Panorama error:", err)
              setLoading(false)
            },
          })
        }
      } catch (error) {
        console.error("Error loading Pannellum:", error)
        setLoading(false)
      }
    }

    if (activeTab === "360") {
      loadPannellum()
    } else {
      setLoading(false)
    }

    // Cleanup
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy()
        viewerRef.current = null
      }
    }
  }, [currentPanorama, activeTab, panoramaUrls])

  const handlePrevious = () => {
    if (currentPanorama > 0) {
      setCurrentPanorama(currentPanorama - 1)
      setLoading(true)
    }
  }

  const handleNext = () => {
    if (currentPanorama < panoramaUrls.length - 1) {
      setCurrentPanorama(currentPanorama + 1)
      setLoading(true)
    }
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  return (
    <div className="w-full">
      <Tabs defaultValue="360" onValueChange={(value) => setActiveTab(value as "360" | "video")}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Virtual Tour</h3>
          <TabsList>
            <TabsTrigger value="360" className="flex items-center">
              <Camera className="h-4 w-4 mr-2" />
              360° Tour
            </TabsTrigger>
            {videoTourUrl && (
              <TabsTrigger value="video" className="flex items-center">
                <Video className="h-4 w-4 mr-2" />
                Video Tour
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <div className="relative rounded-lg overflow-hidden bg-gray-900">
          {activeTab === "360" ? (
            <>
              <div ref={containerRef} className="w-full h-[400px] md:h-[500px]">
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <Skeleton className="h-full w-full" />
                    <div className="absolute">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentPanorama === 0}
                  className="bg-black/50 hover:bg-black/70"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>

                <div className="bg-black/50 text-white px-3 py-1 rounded-md">
                  {currentPanorama + 1} / {panoramaUrls.length}
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleNext}
                  disabled={currentPanorama === panoramaUrls.length - 1}
                  className="bg-black/50 hover:bg-black/70"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              {/* Fullscreen button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
              >
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
            </>
          ) : (
            <div className="w-full h-[400px] md:h-[500px]">
              {videoTourUrl ? (
                <iframe
                  src={videoTourUrl}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-800 text-white">
                  No video tour available
                </div>
              )}
            </div>
          )}
        </div>
      </Tabs>
    </div>
  )
}
