import mongoose from "mongoose"

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      required: true,
      index: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
)

// Create indexes for common queries
auditLogSchema.index({ createdAt: -1 })
auditLogSchema.index({ action: 1, createdAt: -1 })
auditLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 })
auditLogSchema.index({ user: 1, createdAt: -1 })

const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema)

export default AuditLog
