import mongoose from "mongoose"

export interface IAppointment extends mongoose.Document {
  property: mongoose.Types.ObjectId
  agent: mongoose.Types.ObjectId
  client: mongoose.Types.ObjectId
  date: Date
  status: "pending" | "confirmed" | "cancelled" | "completed"
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const appointmentSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: [true, "Property is required"],
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Agent is required"],
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Client is required"],
  },
  date: {
    type: Date,
    required: [true, "Appointment date is required"],
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending",
  },
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Update the updatedAt field on save
appointmentSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  next()
})

// Check if model exists before creating a new one (for Next.js hot reloading)
const Appointment = mongoose.models.Appointment || mongoose.model<IAppointment>("Appointment", appointmentSchema)

export default Appointment

