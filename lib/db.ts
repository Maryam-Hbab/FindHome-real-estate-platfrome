import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

// Define the type for our cached mongoose instance
interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Declare the global variable with proper typing
declare global {
  var mongooseCache: MongooseCache | undefined
}

// Use a different name for the cached instance to avoid confusion with the imported mongoose
const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null }

if (!global.mongooseCache) {
  global.mongooseCache = cached
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    // Use the imported mongoose module, not the cached instance
    cached.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((mongooseInstance) => {
        console.log("MongoDB connected successfully")
        return mongooseInstance
      })
      .catch((error: Error) => {
        console.error("MongoDB connection error:", error)
        throw error
      })
  }

  try {
    cached.conn = await cached.promise
    return cached.conn
  } catch (error: unknown) {
    console.error("Failed to establish MongoDB connection:", error)
    throw error
  }
}

export default dbConnect

