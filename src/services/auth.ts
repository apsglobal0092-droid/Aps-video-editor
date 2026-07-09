import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth'
import { auth } from './firebase'

const googleProvider = new GoogleAuthProvider()

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  isAnonymous: boolean
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<AuthUser> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    if (displayName) {
      await updateProfile(result.user, { displayName })
    }
    return mapFirebaseUser(result.user)
  } catch (error) {
    throw new Error(`Sign up failed: ${error}`)
  }
}

export async function signInWithEmail(email: string, password: string): Promise<AuthUser> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return mapFirebaseUser(result.user)
  } catch (error) {
    throw new Error(`Sign in failed: ${error}`)
  }
}

export async function signInWithGoogle(): Promise<AuthUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return mapFirebaseUser(result.user)
  } catch (error) {
    throw new Error(`Google sign in failed: ${error}`)
  }
}

export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    throw new Error(`Password reset failed: ${error}`)
  }
}

export async function logout(): Promise<void> {
  try {
    await signOut(auth)
  } catch (error) {
    throw new Error(`Logout failed: ${error}`)
  }
}

export function subscribeToAuthChanges(
  callback: (user: AuthUser | null) => void
): () => void {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback(mapFirebaseUser(user))
    } else {
      callback(null)
    }
  })
}

function mapFirebaseUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    isAnonymous: user.isAnonymous,
  }
}
