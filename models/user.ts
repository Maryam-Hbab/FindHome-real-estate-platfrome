import mongoose from "mongoose"
import bcryptjs from "bcryptjs" // Changed from bcrypt to bcryptjs

export interface IUser extends mongoose.Document {
  email: string
  password: string
  firstName: string
  lastName: string
  role: "user" | "agent" | "admin"
  company?: string
  licenseNumber?: string
  phoneNumber?: string
  profileImage?: string
  createdAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"],
  },
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true,
  },
  role: {
    type: String,
    enum: ["user", "agent", "admin"],
    default: "user",
  },
  company: {
    type: String,
    trim: true,
  },
  licenseNumber: {
    type: String,
    trim: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  profileImage: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcryptjs.genSalt(10) // Changed from bcrypt to bcryptjs
    this.password = await bcryptjs.hash(this.password, salt) // Changed from bcrypt to bcryptjs
    next()
  } catch (error: any) {
    next(error)
  }
})

// Check the comparePassword method to ensure it's working correctly
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    console.log("Comparing passwords");
    
    // Check if the hash starts with $2a$ (bcryptjs) or $2b$ (bcrypt)
    const isMatch = await bcryptjs.compare(candidatePassword, this.password);
    console.log("Password match result:", isMatch);
    return isMatch;
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
}

// Check if model exists before creating a new one (for Next.js hot reloading)
const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema)

export default User
