"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type User, getCurrentUser, setCurrentUser, logoutUser, getUserByEmail } from "@/lib/db"

interface AuthContextType {
  user: Partial<User> | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (user: Omit<User, "id">) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Partial<User> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const user = await getUserByEmail(email)
      if (!user || user.password !== password) {
        return false
      }

      setCurrentUser(user)
      setUser({ id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email })
      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const signup = async (userData: Omit<User, "id">): Promise<boolean> => {
    try {
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
      }

      await import("@/lib/db").then(({ createUser }) => createUser(newUser))

      setCurrentUser(newUser)
      setUser({ id: newUser.id, firstName: newUser.firstName, lastName: newUser.lastName, email: newUser.email })
      return true
    } catch (error) {
      console.error("Signup error:", error)
      return false
    }
  }

  const logout = () => {
    logoutUser()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
