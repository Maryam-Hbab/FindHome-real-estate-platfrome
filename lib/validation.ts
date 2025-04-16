/**
 * Email validation utility
 */
export function validateEmail(email: string): { isValid: boolean; message?: string } {
    if (!email) {
      return { isValid: false, message: "Email is required" }
    }
  
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { isValid: false, message: "Please enter a valid email address" }
    }
  
    // Check for common typos in email domains
    const commonTypos = [
      { incorrect: "gmail.co", correct: "gmail.com" },
      { incorrect: "gmail.con", correct: "gmail.com" },
      { incorrect: "gamil.com", correct: "gmail.com" },
      { incorrect: "gmial.com", correct: "gmail.com" },
      { incorrect: "hotmail.co", correct: "hotmail.com" },
      { incorrect: "hotmail.con", correct: "hotmail.com" },
      { incorrect: "hotmial.com", correct: "hotmail.com" },
      { incorrect: "yahooo.com", correct: "yahoo.com" },
      { incorrect: "yaho.com", correct: "yahoo.com" },
      { incorrect: "outloo.com", correct: "outlook.com" },
      { incorrect: "outlok.com", correct: "outlook.com" },
      { incorrect: "outlook.co", correct: "outlook.com" },
    ]
  
    const domain = email.split("@")[1]
    const typo = commonTypos.find((t) => domain === t.incorrect)
  
    if (typo) {
      return {
        isValid: false,
        message: `Did you mean ${email.split("@")[0]}@${typo.correct}?`,
      }
    }
  
    return { isValid: true }
  }
  
  /**
   * Password strength validation
   */
  export function validatePasswordStrength(password: string): {
    isStrong: boolean
    message?: string
    strength: "weak" | "medium" | "strong"
  } {
    if (!password) {
      return {
        isStrong: false,
        message: "Password is required",
        strength: "weak",
      }
    }
  
    if (password.length < 8) {
      return {
        isStrong: false,
        message: "Password must be at least 8 characters long",
        strength: "weak",
      }
    }
  
    // Check for common weak passwords
    const commonPasswords = [
      "password",
      "12345678",
      "qwerty",
      "123456789",
      "password123",
      "admin",
      "welcome",
      "login",
      "abc123",
      "123123",
      "admin123",
    ]
  
    if (commonPasswords.includes(password.toLowerCase())) {
      return {
        isStrong: false,
        message: "This password is too common and easily guessed",
        strength: "weak",
      }
    }
  
    // Check password strength
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
    // Calculate strength score
    let strengthScore = 0
    if (password.length >= 8) strengthScore += 1
    if (password.length >= 12) strengthScore += 1
    if (hasUpperCase) strengthScore += 1
    if (hasLowerCase) strengthScore += 1
    if (hasNumbers) strengthScore += 1
    if (hasSpecialChars) strengthScore += 1
  
    const strength = strengthScore >= 5 ? "strong" : strengthScore >= 3 ? "medium" : "weak"
  
    const isStrong = strength !== "weak"
    let message
  
    if (strength === "weak") {
      message = "Password is weak. Consider adding uppercase letters, numbers, and special characters."
    } else if (strength === "medium") {
      message = "Password strength is medium. Consider adding special characters for stronger security."
    }
  
    return { isStrong, message, strength }
  }
  