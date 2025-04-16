export interface RateLimitConfig {
    interval: number
    uniqueTokenPerInterval: number
  }
  
  interface RateLimitStore {
    [key: string]: {
      tokens: string[]
      createdAt: number
    }
  }
  
  // Simple in-memory store for rate limiting
  // In production, you might want to use Redis or another distributed store
  const rateLimitStore: RateLimitStore = {}
  
  export function rateLimit(config: RateLimitConfig) {
    return {
      check: (limit: number, token: string) =>
        new Promise<void>((resolve, reject) => {
          const now = Date.now()
          const windowStart = now - config.interval
  
          // Clean old entries
          Object.keys(rateLimitStore).forEach((key) => {
            const item = rateLimitStore[key]
            if (item.createdAt < windowStart) {
              delete rateLimitStore[key]
            }
          })
  
          // Create new rate limit entry if not exists
          if (!rateLimitStore[token]) {
            rateLimitStore[token] = {
              tokens: [],
              createdAt: now,
            }
          }
  
          const tokenCount = rateLimitStore[token].tokens.length
  
          // Check if limit is reached
          if (tokenCount >= limit) {
            return reject(new Error("Rate limit exceeded"))
          }
  
          // Add token and resolve
          rateLimitStore[token].tokens.push(token)
          return resolve()
        }),
    }
  }
  