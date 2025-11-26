import type { Analytics } from 'firebase/analytics'
import type { FirebaseApp } from 'firebase/app'
import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'
import type { FirebaseStorage } from 'firebase/storage'

export type FirebaseInjection = {
  app: FirebaseApp
  auth: Auth
  firestore: Firestore
  storage: FirebaseStorage
  analytics: Analytics | null
}

