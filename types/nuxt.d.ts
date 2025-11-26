import type { FirebaseInjection } from './firebase'

declare module '#app' {
  interface NuxtApp {
    $firebase: FirebaseInjection
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $firebase: FirebaseInjection
  }
}

