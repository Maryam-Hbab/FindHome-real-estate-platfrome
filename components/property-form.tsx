"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ContentFilterCheck } from "@/components/content-filter-check"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, X } from "lucide-react"
import Image from "next/image"

export default function PropertyForm() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showContentCheck, setShowContentCheck] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    type: "House",
    status: "For Sale",
    yearBuilt: "",
    parkingSpaces: "0",
    features: [] as string[],
    images: [] as string[],
    location: {
      coordinates: [0, 0], // [longitude, latitude]
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFeatureToggle = (feature: string) => {
    setFormData((prev) => {
      const features = [...prev.features]
      if (features.includes(feature)) {
        return { ...prev, features: features.filter((f) => f !== feature) }
      } else {
        return { ...prev, features: [...features, feature] }
      }
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadingImages(true)
      const newFiles = Array.from(e.target.files)
      const uploadedUrls: string[] = []

      try {
        for (const file of newFiles) {
          const formData = new FormData()
          formData.append("file", file)

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            throw new Error("Failed to upload image")
          }

          const data = await response.json()
          uploadedUrls.push(data.url)
        }

        // Update form data with the new image URLs
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls],
        }))

        toast({
          title: "Images uploaded",
          description: `Successfully uploaded ${uploadedUrls.length} images`,
        })
      } catch (error) {
        console.error("Error uploading images:", error)
        toast({
          title: "Upload failed",
          description: "Failed to upload one or more images",
          variant: "destructive",
        })
      } finally {
        setUploadingImages(false)
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    }
  }

  const removeImage = (index: number) => {
    setFormData((prev) => {
      const newImages = [...prev.images]
      newImages.splice(index, 1)
      return {
        ...prev,
        images: newImages,
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setShowContentCheck(true)
  }

  const submitProperty = async () => {
    try {
      setIsSubmitting(true)

      // Convert numeric fields
      const propertyData = {
        ...formData,
        price: Number.parseFloat(formData.price),
        bedrooms: Number.parseInt(formData.bedrooms),
        bathrooms: Number.parseFloat(formData.bathrooms),
        area: Number.parseFloat(formData.area),
        yearBuilt: formData.yearBuilt ? Number.parseInt(formData.yearBuilt) : undefined,
        parkingSpaces: Number.parseInt(formData.parkingSpaces),
        // Use the uploaded image URLs or a default placeholder
        images: formData.images.length > 0 ? formData.images : ["/placeholder.svg?height=600&width=800"],
      }

      // Submit to API
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(propertyData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create property")
      }

      const data = await response.json()

      toast({
        title: "Property Created",
        description: "Your property has been submitted for review and will be published once approved.",
      })

      // Redirect to property management page
      router.push("/properties/manage")
    } catch (error: any) {
      console.error("Error creating property:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create property",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Common property features
  const commonFeatures = [
    "Air Conditioning",
    "Balcony",
    "Fireplace",
    "Garage",
    "Garden",
    "Gym",
    "Pool",
    "Security System",
    "Storage",
    "Washer/Dryer",
  ]

  if (!user || (user.role !== "agent" && user.role !== "admin")) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>Only agents and admins can create property listings.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (showContentCheck) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Content Review</CardTitle>
          <CardDescription>
            We're checking your property description for compliance with our content guidelines.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContentFilterCheck
            content={formData.description}
            onContinue={submitProperty}
            onEdit={() => setShowContentCheck(false)}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Property</CardTitle>
        <CardDescription>Create a new property listing. All fields marked with * are required.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Property Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Modern Apartment with City View"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the property in detail..."
                className="min-h-[150px]"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                <a href="/guidelines" target="_blank" className="text-emerald-600 hover:underline" rel="noreferrer">
                  View our content guidelines
                </a>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g., 450000"
                  required
                />
              </div>

              <div>
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="For Sale">For Sale</SelectItem>
                    <SelectItem value="For Rent">For Rent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g., 123 Main St"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g., New York"
                  required
                />
              </div>

              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g., NY"
                  required
                />
              </div>

              <div>
                <Label htmlFor="zipCode">Zip Code *</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="e.g., 10001"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bedrooms">Bedrooms *</Label>
                <Input
                  id="bedrooms"
                  name="bedrooms"
                  type="number"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  placeholder="e.g., 2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="bathrooms">Bathrooms *</Label>
                <Input
                  id="bathrooms"
                  name="bathrooms"
                  type="number"
                  step="0.5"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  placeholder="e.g., 2.5"
                  required
                />
              </div>

              <div>
                <Label htmlFor="area">Area (sq ft) *</Label>
                <Input
                  id="area"
                  name="area"
                  type="number"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="e.g., 1200"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="type">Property Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="House">House</SelectItem>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="Condo">Condo</SelectItem>
                    <SelectItem value="Townhouse">Townhouse</SelectItem>
                    <SelectItem value="Land">Land</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="yearBuilt">Year Built</Label>
                <Input
                  id="yearBuilt"
                  name="yearBuilt"
                  type="number"
                  value={formData.yearBuilt}
                  onChange={handleChange}
                  placeholder="e.g., 2015"
                />
              </div>

              <div>
                <Label htmlFor="parkingSpaces">Parking Spaces</Label>
                <Input
                  id="parkingSpaces"
                  name="parkingSpaces"
                  type="number"
                  value={formData.parkingSpaces}
                  onChange={handleChange}
                  placeholder="e.g., 1"
                />
              </div>
            </div>

            <div>
              <Label>Property Images</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="mb-2"
                  disabled={uploadingImages}
                >
                  {uploadingImages ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Images
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-500">Upload high-quality images of your property (max 10 images)</p>

                {formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((url, index) => (
                      <div key={index} className="relative">
                        <div className="relative h-24 w-full rounded-md overflow-hidden">
                          <Image
                            src={url || "/placeholder.svg"}
                            alt={`Property image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label>Features</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mt-2">
                {commonFeatures.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`feature-${feature}`}
                      checked={formData.features.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor={`feature-${feature}`} className="text-sm">
                      {feature}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => router.push("/properties/manage")}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Property"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
