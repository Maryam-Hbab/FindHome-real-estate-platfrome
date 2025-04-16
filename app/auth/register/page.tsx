"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth, type UserRole } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

// Import the validation utilities
import { validateEmail, validatePasswordStrength } from "@/lib/validation"

export default function RegisterPage() {
  const [userType, setUserType] = useState<UserRole>("user")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [company, setCompany] = useState("")
  const [licenseNumber, setLicenseNumber] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validation states
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number
    label: string
    color: string
  }>({ score: 0, label: "Too weak", color: "bg-red-500" })

  // Password validation criteria states
  const [hasMinLength, setHasMinLength] = useState(false)
  const [hasUpperCase, setHasUpperCase] = useState(false)
  const [hasLowerCase, setHasLowerCase] = useState(false)
  const [hasNumber, setHasNumber] = useState(false)
  const [hasSpecialChar, setHasSpecialChar] = useState(false)

  const { register } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Validate email on change with more sophisticated checks
  useEffect(() => {
    if (email) {
      const emailValidation = validateEmail(email)
      if (!emailValidation.isValid) {
        setEmailError(emailValidation.message || "Invalid email address")
      } else {
        setEmailError(null)
      }
    } else {
      setEmailError(null)
    }
  }, [email])

  // Validate password on change with detailed criteria
  useEffect(() => {
    if (password) {
      // Check individual criteria
      setHasMinLength(password.length >= 8)
      setHasUpperCase(/[A-Z]/.test(password))
      setHasLowerCase(/[a-z]/.test(password))
      setHasNumber(/\d/.test(password))
      setHasSpecialChar(/[!@#$%^&*(),.?":{}|<>]/.test(password))

      // Calculate overall password strength
      const passwordValidation = validatePasswordStrength(password)

      if (passwordValidation.strength === "weak") {
        setPasswordStrength({
          score: 33,
          label: "Weak",
          color: "bg-red-500",
        })
        setPasswordError(passwordValidation.message || "Password is too weak")
      } else if (passwordValidation.strength === "medium") {
        setPasswordStrength({
          score: 66,
          label: "Medium",
          color: "bg-yellow-500",
        })
        setPasswordError(null)
      } else {
        setPasswordStrength({
          score: 100,
          label: "Strong",
          color: "bg-green-500",
        })
        setPasswordError(null)
      }
    } else {
      // Reset all states when password is empty
      setHasMinLength(false)
      setHasUpperCase(false)
      setHasLowerCase(false)
      setHasNumber(false)
      setHasSpecialChar(false)
      setPasswordStrength({ score: 0, label: "Too weak", color: "bg-red-500" })
      setPasswordError(null)
    }
  }, [password])

  // Validate confirm password on change
  useEffect(() => {
    if (confirmPassword && password) {
      if (confirmPassword !== password) {
        setConfirmPasswordError("Passwords do not match")
      } else {
        setConfirmPasswordError(null)
      }
    } else {
      setConfirmPasswordError(null)
    }
  }, [confirmPassword, password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const validationErrors = []

    if (!firstName) validationErrors.push("First name is required")
    if (!lastName) validationErrors.push("Last name is required")

    if (emailError) {
      validationErrors.push(emailError)
    }

    if (passwordError) {
      validationErrors.push(passwordError)
    }

    if (password !== confirmPassword) {
      validationErrors.push("Passwords do not match")
    }

    if (userType === "agent" && (!company || !licenseNumber)) {
      validationErrors.push("Agents must provide company and license information")
    }

    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join(". "),
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      await register({
        firstName,
        lastName,
        email,
        password,
        role: userType,
        phoneNumber: phoneNumber || undefined,
        company: company || undefined,
        licenseNumber: licenseNumber || undefined,
      })

      // Redirect is handled in the register function
    } catch (error) {
      // Error is handled in the register function
      setIsSubmitting(false)
    }
  }

  const toggleShowPassword = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="text-gray-600 mt-2">Join our real estate platform</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <Tabs defaultValue="user" onValueChange={(value) => setUserType(value as UserRole)}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="user">Regular User</TabsTrigger>
              <TabsTrigger value="agent">Real Estate Agent</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isSubmitting}
                    required
                    aria-invalid={!firstName && "true"}
                    aria-describedby={!firstName ? "firstName-error" : undefined}
                  />
                  {!firstName && (
                    <p id="firstName-error" className="sr-only">
                      First name is required
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isSubmitting}
                    required
                    aria-invalid={!lastName && "true"}
                    aria-describedby={!lastName ? "lastName-error" : undefined}
                  />
                  {!lastName && (
                    <p id="lastName-error" className="sr-only">
                      Last name is required
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                  className={emailError ? "border-red-500 focus-visible:ring-red-500" : ""}
                  aria-invalid={emailError ? "true" : "false"}
                  aria-describedby={emailError ? "email-error" : undefined}
                />
                {emailError && (
                  <p id="email-error" className="text-sm text-red-500 flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                    {emailError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number (optional)</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <TabsContent value="agent" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="Real Estate Company Inc."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    disabled={isSubmitting}
                    required={userType === "agent"}
                    aria-invalid={userType === "agent" && !company ? "true" : "false"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    placeholder="RE12345678"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    disabled={isSubmitting}
                    required={userType === "agent"}
                    aria-invalid={userType === "agent" && !licenseNumber ? "true" : "false"}
                  />
                </div>
              </TabsContent>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    required
                    className={passwordError ? "border-red-500 focus-visible:ring-red-500 pr-10" : "pr-10"}
                    aria-invalid={passwordError ? "true" : "false"}
                    aria-describedby={passwordError ? "password-error" : "password-strength"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={toggleShowPassword}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                    <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                  </Button>
                </div>

                {/* Password strength meter */}
                {password && (
                  <div className="mt-2" id="password-strength">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium">Password strength: </span>
                      <span
                        className={`text-xs font-medium ${
                          passwordStrength.label === "Strong"
                            ? "text-green-600"
                            : passwordStrength.label === "Medium"
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                    <Progress
                      value={passwordStrength.score}
                      className="h-1.5"
                      indicatorClassName={passwordStrength.color}
                    />
                  </div>
                )}

                {passwordError && (
                  <p id="password-error" className="text-sm text-red-500 flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                    {passwordError}
                  </p>
                )}

                {/* Password criteria checklist */}
                {password && (
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="font-medium text-gray-700">Your password must have:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      <div className="flex items-center">
                        {hasMinLength ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1.5" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-gray-400 mr-1.5" />
                        )}
                        <span className={hasMinLength ? "text-green-700" : "text-gray-600"}>At least 8 characters</span>
                      </div>
                      <div className="flex items-center">
                        {hasUpperCase ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1.5" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-gray-400 mr-1.5" />
                        )}
                        <span className={hasUpperCase ? "text-green-700" : "text-gray-600"}>Uppercase letter</span>
                      </div>
                      <div className="flex items-center">
                        {hasLowerCase ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1.5" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-gray-400 mr-1.5" />
                        )}
                        <span className={hasLowerCase ? "text-green-700" : "text-gray-600"}>Lowercase letter</span>
                      </div>
                      <div className="flex items-center">
                        {hasNumber ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1.5" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-gray-400 mr-1.5" />
                        )}
                        <span className={hasNumber ? "text-green-700" : "text-gray-600"}>Number</span>
                      </div>
                      <div className="flex items-center">
                        {hasSpecialChar ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1.5" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-gray-400 mr-1.5" />
                        )}
                        <span className={hasSpecialChar ? "text-green-700" : "text-gray-600"}>Special character</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                  className={confirmPasswordError ? "border-red-500 focus-visible:ring-red-500" : ""}
                  aria-invalid={confirmPasswordError ? "true" : "false"}
                  aria-describedby={confirmPasswordError ? "confirm-password-error" : undefined}
                />
                {confirmPasswordError && (
                  <p id="confirm-password-error" className="text-sm text-red-500 flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                    {confirmPasswordError}
                  </p>
                )}
                {confirmPassword && !confirmPasswordError && (
                  <p className="text-sm text-green-500 flex items-center mt-1">
                    <CheckCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                    Passwords match
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 transition-colors"
                disabled={isSubmitting || !!passwordError || !!emailError || !!confirmPasswordError}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </Tabs>

          <Separator className="my-6" />

          <div className="space-y-4">
            <Button variant="outline" className="w-full">
              Sign up with Google
            </Button>
            <Button variant="outline" className="w-full">
              Sign up with Facebook
            </Button>
            <Button variant="outline" className="w-full">
              Sign up with Apple
            </Button>
          </div>

          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
