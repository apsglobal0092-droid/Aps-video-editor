import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  FirestoreError,
} from 'firebase/firestore'
import { db } from './firebase'
import { AuthUser } from './auth'

export interface UserProfile {
  uid: string
  email: string | null
  displayName: string
  photoURL: string | null
  themePreference: 'dark' | 'light'
  languagePreference: string
  createdAt: number
  updatedAt: number
  lastLoginAt: number
  subscriptionStatus: 'free' | 'pro' | 'enterprise'
}

export async function createOrUpdateUserProfile(
  user: AuthUser
): Promise<UserProfile> {
  try {
    const userRef = doc(db, 'users', user.uid)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      // Update last login
      await updateDoc(userRef, {
        lastLoginAt: Timestamp.now(),
      })
      return userDoc.data() as UserProfile
    } else {
      // Create new profile
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL,
        themePreference: 'dark',
        languagePreference: 'en',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastLoginAt: Date.now(),
        subscriptionStatus: 'free',
      }

      await setDoc(userRef, newProfile)
      return newProfile
    }
  } catch (error) {
    console.error('Failed to create/update user profile:', error)
    // Return a default profile if Firestore is not available
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'User',
      photoURL: user.photoURL,
      themePreference: 'dark',
      languagePreference: 'en',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastLoginAt: Date.now(),
      subscriptionStatus: 'free',
    }
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid)
    const userDoc = await getDoc(userRef)
    return userDoc.exists() ? (userDoc.data() as UserProfile) : null
  } catch (error) {
    console.error('Failed to get user profile:', error)
    return null
  }
}

export async function updateUserPreferences(
  uid: string,
  preferences: Partial<UserProfile>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, {
      ...preferences,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Failed to update user preferences:', error)
  }
}
