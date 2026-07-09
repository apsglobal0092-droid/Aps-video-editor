import React, { createContext, useEffect, useState } from 'react'
import { subscribeToAuthChanges } from '@/services/auth'
import { createOrUpdateUserProfile, UserProfile } from '@/services/userService'
import { AuthUser } from '@/services/auth'

export interface AuthContextType {
  user: AuthUser | null
  profile: UserProfile | null
  isLoading: boolean
  isGuest: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (authUser) => {
      if (authUser) {
        setUser(authUser)
        setIsGuest(authUser.isAnonymous)

        if (!authUser.isAnonymous) {
          const userProfile = await createOrUpdateUserProfile(authUser)
          setProfile(userProfile)
        }
      } else {
        setUser(null)
        setProfile(null)
        setIsGuest(true)
      }

      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
