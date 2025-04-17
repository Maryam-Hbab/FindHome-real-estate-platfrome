import mongoose from "mongoose"

export interface ISavedProperty extends mongoose.Document {
  user: mongoose.Types.ObjectId
  property: mongoose.Types.ObjectId
  createdAt: Date
}

const savedPropertySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User is required"],
    index: true,
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: [true, "Property is required"],
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Create a compound index to ensure a user can only save a property once
savedPropertySchema.index({ user: 1, property: 1 }, { unique: true })

// Check if model exists before creating a new one (for Next.js hot reloading)
const SavedProperty =
  mongoose.models.SavedProperty || mongoose.model<ISavedProperty>("SavedProperty", savedPropertySchema)

export default SavedProperty
