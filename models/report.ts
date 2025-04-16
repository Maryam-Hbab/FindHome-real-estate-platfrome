import mongoose from "mongoose"

const reportSchema = new mongoose.Schema(
  {
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'contentType'
    },
    contentType: {
      type: String,
      required: true,
      enum: ['Property', 'User', 'Review', 'Message']
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Reviewed', 'Dismissed'],
      default: 'Pending'
    },
    adminNotes: {
      type: String
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
)

// Create indexes for common queries
reportSchema.index({ contentType: 1, contentId: 1 })
reportSchema.index({ reporter: 1 })
reportSchema.index({ status: 1 })
reportSchema.index({ createdAt: -1 })

const Report = mongoose.models.Report || mongoose.model('Report', reportSchema)

export default Report
