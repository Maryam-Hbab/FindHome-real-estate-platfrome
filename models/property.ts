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
    coordinates: [number, number]
  }
  bedrooms: number
  bathrooms: number
  area: number
  type: "House" | "Apartment" | "Condo" | "Townhouse" | "Land" | "Commercial"
  status: "For Sale" | "For Rent" | "Sold" | "Rented"
  yearBuilt?: number
  parkingSpaces: number
  features: string[]
  images: string[]
  isFeatured: boolean
  agent: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
  moderationStatus: "Pending" | "Approved" | "Rejected" | "Flagged"
  moderationNotes?: string
  reportCount: number
  reports: [
    {
      userId: mongoose.Types.ObjectId
      reason: string
      timestamp: Date
    },
  ]
  views: number
  inquiries: number
}

const propertySchema = new mongoose.Schema({
  id: {
    type: String,
    index: true,
  },
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
    min: [0, "Price must be positive"],
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
      type: [Number],
      required: [true, "Coordinates are required"],
    },
  },
  bedrooms: {
    type: Number,
    required: [true, "Bedrooms is required"],
    min: [0, "Bedrooms must be positive"],
  },
  bathrooms: {
    type: Number,
    required: [true, "Bathrooms is required"],
    min: [0, "Bathrooms must be positive"],
  },
  area: {
    type: Number,
    required: [true, "Area is required"],
    min: [0, "Area must be positive"],
  },
  type: {
    type: String,
    enum: ["House", "Apartment", "Condo", "Townhouse", "Land", "Commercial"],
    required: [true, "Property type is required"],
  },
  status: {
    type: String,
    enum: ["For Sale", "For Rent", "Sold", "Rented"],
    required: [true, "Status is required"],
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
  moderationStatus: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Flagged"],
    default: "Pending",
  },
  moderationNotes: {
    type: String,
  },
  reportCount: {
    type: Number,
    default: 0,
  },
  reports: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      reason: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  views: {
    type: Number,
    default: 0,
  },
  inquiries: {
    type: Number,
    default: 0,
  },
})

// Check if model exists before creating a new one (for Next.js hot reloading)
const Property = mongoose.models.Property || mongoose.model<IProperty>("Property", propertySchema)

export default Property
