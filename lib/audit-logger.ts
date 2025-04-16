import AuditLog from "@/models/audit-log"
import type mongoose from "mongoose"

interface AuditLogParams {
  action: string
  userId: string | mongoose.Types.ObjectId
  targetType: string
  targetId: string | mongoose.Types.ObjectId
  details?: any
}

export async function createAuditLog({
  action,
  userId,
  targetType,
  targetId,
  details = {},
}: AuditLogParams): Promise<void> {
  try {
    await AuditLog.create({
      action,
      user: userId,
      targetType,
      targetId,
      details,
    })
  } catch (error) {
    console.error("Error creating audit log:", error)
    // Don't throw error to prevent disrupting the main flow
  }
}
