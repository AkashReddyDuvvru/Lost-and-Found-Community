"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function SignupPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const { signup } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const validateEmail = (email: string) => {
    // Check if email is from SRM domain
    const emailRegex = /^[a-zA-Z0-9._%+-]+@srmist\.edu\.in$/
    if (!emailRegex.test(email)) {
      setEmailError("Please use your SRM email (example@srmist.edu.in)")
      return false
    }
    setEmailError("")
    return true
  }

  const checkPasswordStrength = (password: string) => {
    let strength = 0

    // Length check
    if (password.length >= 8) strength += 25

    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 25

    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 25

    // Contains number or special char
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 25

    setPasswordStrength(strength)

    if (strength < 50) {
      setPasswordError("Password is too weak")
      return false
    } else if (strength < 100) {
      setPasswordError("Password could be stronger")
      return true
    } else {
      setPasswordError("")
      return true
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmail(newEmail)
    if (newEmail) validateEmail(newEmail)
    else setEmailError("")
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    if (newPassword) checkPasswordStrength(newPassword)
    else {
      setPasswordStrength(0)
      setPasswordError("")
    }

    // Check if confirm password matches
    if (confirmPassword && confirmPassword !== newPassword) {
      setPasswordError("Passwords do not match")
    }
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value
    setConfirmPassword(newConfirmPassword)

    if (newConfirmPassword && password !== newConfirmPassword) {
      setPasswordError("Passwords do not match")
    } else if (password) {
      checkPasswordStrength(password)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate all fields
    const isEmailValid = validateEmail(email)
    const isPasswordStrong = checkPasswordStrength(password)
    const doPasswordsMatch = password === confirmPassword

    if (!isEmailValid || !isPasswordStrong || !doPasswordsMatch) {
      setIsLoading(false)
      return
    }

    try {
      const success = await signup({
        firstName,
        lastName,
        email,
        password,
      })

      if (success) {
        toast({
          title: "Account created",
          description: "Your account has been created successfully",
        })
        router.push("/dashboard/overview")
      } else {
        toast({
          title: "Signup failed",
          description: "An error occurred during signup",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Signup error",
        description: "An error occurred during signup",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return "bg-red-500"
    if (passwordStrength <= 50) return "bg-orange-500"
    if (passwordStrength <= 75) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Logo size="large" centered={true} />

          <div className="max-w-md text-center text-sm text-muted-foreground mt-6">
            <p className="mb-4">
              We are proud to share that our Lost and Found website has been officially selected by SRM Institute of
              Science and Technology and is now tied up with the institution as a recognized student-driven initiative.
            </p>
            <p className="mb-4">
              This project was developed as a team by Dhanush, Mohit, and Akash Reddy, with the shared goal of creating
              a reliable and efficient platform to help students and faculty recover lost items across the campus.
            </p>
            <p>
              This recognition from SRM is a major milestone for us, and we look forward to making a meaningful impact
              within the university community.
            </p>
          </div>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-xl">Sign Up</CardTitle>
              <CardDescription>Create an account to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First name</Label>
                    <Input
                      id="first-name"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last name</Label>
                    <Input
                      id="last-name"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="your@srmist.edu.in"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    className={emailError ? "border-red-500" : ""}
                    required
                  />
                  {emailError && <p className="text-xs text-red-500">{emailError}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={handlePasswordChange}
                      className={passwordError ? "border-red-500 pr-10" : "pr-10"}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {password && (
                    <div className="space-y-1 mt-1">
                      <Progress value={passwordStrength} className={`h-1 ${getPasswordStrengthColor()}`} />
                      <div className="flex justify-between text-xs">
                        <span>Weak</span>
                        <span>Strong</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    className={passwordError ? "border-red-500" : ""}
                    required
                  />
                  {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}
