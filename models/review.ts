import mongoose from "mongoose"

export interface IReview extends mongoose.Document {
  property: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  rating: number
  comment: string
  createdAt: Date
}

const reviewSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: [true, "Property is required"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User is required"],
  },
  rating: {
    type: Number,
    required: [true, "Rating is required"],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: [true, "Comment is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Check if model exists before creating a new one (for Next.js hot reloading)
const Review = mongoose.models.Review || mongoose.model<IReview>("Review", reviewSchema)

export default Review

