import Notification from "@/models/notification"
import User from "@/models/user"

interface NotificationData {
  userId: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  relatedTo?: {
    type: string
    id: string
  }
}

export async function createNotification(data: NotificationData): Promise<boolean> {
  try {
    await Notification.create({
      user: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      relatedTo: data.relatedTo,
    })

    return true
  } catch (error) {
    console.error("Error creating notification:", error)
    return false
  }
}

export async function createPropertySubmissionNotification(
  propertyId: string,
  propertyTitle: string,
  agentId: string,
): Promise<boolean> {
  try {
    // Find all admin users
    const admins = await User.find({ role: "admin" })

    if (!admins || admins.length === 0) {
      console.log("No admin users found to notify")
      return false
    }

    // Create a notification for each admin
    const notifications = admins.map((admin) => ({
      user: admin._id,
      title: "New Property Submission",
      message: `A new property "${propertyTitle}" has been submitted and requires review.`,
      type: "info" as const,
      relatedTo: {
        type: "property",
        id: propertyId,
      },
    }))

    // Save all notifications
    await Notification.insertMany(notifications)

    return true
  } catch (error) {
    console.error("Error creating property submission notification:", error)
    return false
  }
}

export async function createPropertyModerationNotification(
  propertyId: string,
  propertyTitle: string,
  agentId: string,
  moderationStatus: "Approved" | "Rejected",
  notes?: string,
): Promise<boolean> {
  try {
    const notificationMessage =
      moderationStatus === "Approved"
        ? `Your property "${propertyTitle}" has been approved and is now visible on the platform.`
        : `Your property "${propertyTitle}" has been rejected. Please review the notes for more information: ${
            notes || "No notes provided."
          }`

    await Notification.create({
      user: agentId,
      title: `Property ${moderationStatus}`,
      message: notificationMessage,
      type: moderationStatus === "Approved" ? "success" : "error",
      relatedTo: {
        type: "property",
        id: propertyId,
      },
    })

    return true
  } catch (error) {
    console.error("Error creating property moderation notification:", error)
    return false
  }
}
