import mongoose from "mongoose"

export interface IMessage extends mongoose.Document {
  sender: mongoose.Types.ObjectId
  receiver: mongoose.Types.ObjectId
  property?: mongoose.Types.ObjectId
  content: string
  isRead: boolean
  createdAt: Date
}

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Sender is required"],
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Receiver is required"],
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
  },
  content: {
    type: String,
    required: [true, "Message content is required"],
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Check if model exists before creating a new one (for Next.js hot reloading)
const Message = mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema)

export default Message

