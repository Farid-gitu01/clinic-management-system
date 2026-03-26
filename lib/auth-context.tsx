"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { type User, signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth"
import { auth, database } from "./firebase"
import { ref, get } from "firebase/database"

export type UserRole = "admin" | "doctor" | "patient"

export interface UserProfile {
  experience: string
  uid: string
  email: string
  fullName: string
  phone: string
  role: UserRole
  clinicId: string // Crucial for isolated data
  status: "active" | "inactive"
  createdAt: number
  // Optional fields for doctors/patients
  bio?: string
  specialization?: string
  age?: string
  gender?: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  isAuthenticated: boolean
  hasRole: (role: UserRole | UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true)
      
      if (currentUser) {
        try {
          // STEP 1: Check Global Lookup to find which Clinic this user belongs to
          const lookupRef = ref(database, `userLookup/${currentUser.uid}`)
          const lookupSnapshot = await get(lookupRef)

          if (lookupSnapshot.exists()) {
            const { clinicId } = lookupSnapshot.val()

            // STEP 2: Fetch full profile from the ISOLATED clinic path
            const profileRef = ref(database, `clinics/${clinicId}/users/${currentUser.uid}`)
            const profileSnapshot = await get(profileRef)

            if (profileSnapshot.exists()) {
              setProfile(profileSnapshot.val() as UserProfile)
            } else {
              console.warn("User lookup found clinicId, but profile is missing in clinic node.")
              setProfile(null)
            }
          } else {
            // Fallback for old users or admins not using the clinic lookup yet
            const legacyRef = ref(database, `users/${currentUser.uid}`)
            const legacySnap = await get(legacyRef)
            if (legacySnap.exists()) {
              setProfile(legacySnap.val() as UserProfile)
            } else {
              setProfile(null)
            }
          }
          setUser(currentUser)
        } catch (error) {
          console.error("Auth initialization error:", error)
          setUser(currentUser)
          setProfile(null)
        }
      } else {
        setUser(null)
        setProfile(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!profile) return false
    const roles = Array.isArray(role) ? role : [role]
    return roles.includes(profile.role)
  }

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signOut: handleSignOut,
    isAuthenticated: !!user && !!profile && !!profile.role,
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}