import mongoose from "mongoose"

export interface IProperty extends mongoose.Document {
  title: string
  description: string
  price: number
  address: string
  city: string
  state: string
  zipCode: string
  location: {
    type: string
    coordinates: [number, number] // [longitude, latitude]
  }
  bedrooms: number
  bathrooms: number
  area: number
  type: string
  status: "For Sale" | "For Rent" | "Sold" | "Rented"
  yearBuilt: number
  parkingSpaces: number
  features: string[]
  images: string[]
  isFeatured: boolean
  agent: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Description is required"],
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
  },
  address: {
    type: String,
    required: [true, "Address is required"],
    trim: true,
  },
  city: {
    type: String,
    required: [true, "City is required"],
    trim: true,
  },
  state: {
    type: String,
    required: [true, "State is required"],
    trim: true,
  },
  zipCode: {
    type: String,
    required: [true, "Zip code is required"],
    trim: true,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  bedrooms: {
    type: Number,
    required: [true, "Number of bedrooms is required"],
  },
  bathrooms: {
    type: Number,
    required: [true, "Number of bathrooms is required"],
  },
  area: {
    type: Number,
    required: [true, "Area is required"],
  },
  type: {
    type: String,
    required: [true, "Property type is required"],
    enum: ["House", "Apartment", "Condo", "Townhouse", "Land", "Commercial"],
  },
  status: {
    type: String,
    required: [true, "Status is required"],
    enum: ["For Sale", "For Rent", "Sold", "Rented"],
  },
  yearBuilt: {
    type: Number,
  },
  parkingSpaces: {
    type: Number,
    default: 0,
  },
  features: {
    type: [String],
    default: [],
  },
  images: {
    type: [String],
    default: [],
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Agent is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Create a geospatial index for location-based queries
propertySchema.index({ location: "2dsphere" })

// Update the updatedAt field on save
propertySchema.pre("save", function (next) {
  this.updatedAt = new Date()
  next()
})

// Check if model exists before creating a new one (for Next.js hot reloading)
const Property = mongoose.models.Property || mongoose.model<IProperty>("Property", propertySchema)

export default Property

