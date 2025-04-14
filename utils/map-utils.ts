// Helper function to dynamically load Leaflet
export const loadLeaflet = async () => {
    // Only import Leaflet in the browser
    if (typeof window !== "undefined") {
      try {
        const L = (await import("leaflet")).default
        await import("leaflet/dist/leaflet.css")
  
        // Fix Leaflet icon issues
        delete (L.Icon.Default.prototype as any)._getIconUrl;
  
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        })
  
        return L
      } catch (error) {
        console.error("Error loading Leaflet:", error)
        return null
      }
    }
    return null
  }
  