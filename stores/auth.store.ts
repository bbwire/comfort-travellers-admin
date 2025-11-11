import { defineStore } from 'pinia'
import type { User } from 'firebase/auth'
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  type Auth,
} from 'firebase/auth'
import { doc, getDoc, type Firestore } from 'firebase/firestore'

export interface UserProfile {
  uid: string
  email: string | null
  displayName: string | null
  role: 'admin' | 'agent' | 'customer'
  isActive: boolean
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    profile: null as UserProfile | null,
    loading: true,
    error: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.profile?.role === 'admin',
    isAgent: (state) => state.profile?.role === 'agent',
    canAccessAdmin: (state) => ['admin', 'agent'].includes(state.profile?.role || ''),
  },

  actions: {
    setUser(user: User | null) {
      this.user = user
    },
    setProfile(profile: UserProfile | null) {
      this.profile = profile
    },
    setLoading(loading: boolean) {
      this.loading = loading
    },
    setError(error: string | null) {
      this.error = error
    },

    async fetchUserProfile(uid: string, firestore: Firestore) {
      try {
        const userDoc = await getDoc(doc(firestore, 'users', uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          this.setProfile({
            uid,
            email: data.email || null,
            displayName: data.displayName || null,
            role: data.role || 'customer',
            isActive: data.isActive !== false,
          })
        } else {
          // If user document doesn't exist, create default profile
          this.setProfile({
            uid,
            email: this.user?.email || null,
            displayName: this.user?.displayName || null,
            role: 'customer',
            isActive: true,
          })
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
        this.setError('Failed to fetch user profile')
      }
    },

    async loginWithEmail(email: string, password: string, auth: Auth, firestore: Firestore) {
      try {
        this.setError(null)
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        this.setUser(userCredential.user)
        await this.fetchUserProfile(userCredential.user.uid, firestore)
        return { success: true }
      } catch (error: any) {
        const errorMessage = error.code === 'auth/invalid-credential' 
          ? 'Invalid email or password'
          : error.message || 'Login failed'
        this.setError(errorMessage)
        return { success: false, error: errorMessage }
      }
    },

    async loginWithGoogle(auth: Auth, firestore: Firestore) {
      try {
        this.setError(null)
        const provider = new GoogleAuthProvider()
        const userCredential = await signInWithPopup(auth, provider)
        this.setUser(userCredential.user)
        await this.fetchUserProfile(userCredential.user.uid, firestore)
        return { success: true }
      } catch (error: any) {
        const errorMessage = error.code === 'auth/popup-closed-by-user'
          ? 'Sign-in cancelled'
          : error.message || 'Google sign-in failed'
        this.setError(errorMessage)
        return { success: false, error: errorMessage }
      }
    },

    async logout(auth: Auth) {
      try {
        await signOut(auth)
        this.user = null
        this.profile = null
        this.error = null
        return { success: true }
      } catch (error: any) {
        this.setError(error.message || 'Logout failed')
        return { success: false, error: error.message }
      }
    },
  },
})

