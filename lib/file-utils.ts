import fs from "fs/promises"

/**
 * Ensures that a directory exists, creating it if necessary
 */
export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    // Check if directory exists
    await fs.access(dirPath)
  } catch (error) {
    // Directory doesn't exist, create it
    try {
      await fs.mkdir(dirPath, { recursive: true })
      console.log(`Created directory: ${dirPath}`)
    } catch (mkdirError) {
      console.error(`Failed to create directory ${dirPath}:`, mkdirError)
      throw mkdirError
    }
  }
}

/**
 * Generates a unique filename for uploaded files
 */
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 15)
  return `${timestamp}-${randomStr}-${originalFilename.replace(/\s/g, "_")}`
}
