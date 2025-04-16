import mongoose from "mongoose"

const appealSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
      index: true,
    },
    adminNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
)

// Create indexes for common queries
appealSchema.index({ createdAt: -1 })
appealSchema.index({ status: 1, createdAt: -1 })
appealSchema.index({ agent: 1, status: 1, createdAt: -1 })
appealSchema.index({ property: 1, status: 1 })

const Appeal = mongoose.models.Appeal || mongoose.model("Appeal", appealSchema)

export default Appeal
