import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["info", "success", "warning", "error"],
      default: "info",
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    relatedTo: {
      type: {
        type: String,
        enum: ["property", "message", "appointment", "appeal"],
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
  },
  {
    timestamps: true,
  },
)

// Create indexes for common queries
notificationSchema.index({ createdAt: -1 })
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 })
notificationSchema.index({ user: 1, createdAt: -1 })

const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema)

export default Notification
