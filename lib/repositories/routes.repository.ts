import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  type QueryDocumentSnapshot,
  type DocumentData,
  type Firestore,
  serverTimestamp,
} from 'firebase/firestore'
import type { RouteInput } from '../validation/schemas'

export interface Route {
  id: string
  name: string
  origin: string
  destination: string
  basePrice: number
  estimatedDurationMinutes: number
  stops?: string[]
  isActive: boolean
  createdAt: Date | null
  updatedAt: Date | null
}

export interface RouteFilters {
  origin?: string
  destination?: string
  isActive?: boolean
}

export interface PaginationOptions {
  pageSize: number
  lastDoc?: QueryDocumentSnapshot<DocumentData> | null
}

export interface PaginatedResult<T> {
  data: T[]
  lastDoc: QueryDocumentSnapshot<DocumentData> | null
  hasMore: boolean
}

export class RoutesRepository {
  private firestore: Firestore
  private collectionName = 'routes'

  constructor(firestore: Firestore) {
    this.firestore = firestore
  }

  /**
   * Convert Firestore document to Route
   */
  private docToRoute(docSnap: QueryDocumentSnapshot<DocumentData>): Route {
    const data = docSnap.data()
    return {
      id: docSnap.id,
      name: data.name || '',
      origin: data.origin || '',
      destination: data.destination || '',
      basePrice: Number(data.basePrice) || 0,
      estimatedDurationMinutes:
        Number(data.estimatedDurationMinutes ?? data.durationMinutes ?? data.estimatedDuration ?? 0) || 0,
      stops: data.stops || [],
      isActive: data.isActive !== false,
      createdAt: data.createdAt?.toDate?.() || null,
      updatedAt: data.updatedAt?.toDate?.() || null,
    }
  }

  /**
   * Get a single route by ID
   */
  async getById(routeId: string): Promise<Route | null> {
    try {
      const docRef = doc(this.firestore, this.collectionName, routeId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return null
      }

      return this.docToRoute(docSnap as QueryDocumentSnapshot<DocumentData>)
    } catch (error) {
      console.error('Error fetching route:', error)
      throw new Error('Failed to fetch route')
    }
  }

  /**
   * Get all routes with optional filters and pagination
   */
  async getAll(
    filters?: RouteFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Route>> {
    try {
      let q = query(collection(this.firestore, this.collectionName))

      // Apply filters
      if (filters?.origin) {
        q = query(q, where('origin', '==', filters.origin))
      }
      if (filters?.destination) {
        q = query(q, where('destination', '==', filters.destination))
      }
      if (filters?.isActive !== undefined) {
        q = query(q, where('isActive', '==', filters.isActive))
      }

      // Order by name
      q = query(q, orderBy('name'))

      // Apply pagination
      if (pagination) {
        q = query(q, limit(pagination.pageSize))
        if (pagination.lastDoc) {
          q = query(q, startAfter(pagination.lastDoc))
        }
      }

      const querySnapshot = await getDocs(q)
      const routes: Route[] = []
      let lastDoc: QueryDocumentSnapshot<DocumentData> | null = null

      querySnapshot.forEach((docSnap) => {
        routes.push(this.docToRoute(docSnap))
        lastDoc = docSnap
      })

      return {
        data: routes,
        lastDoc,
        hasMore: querySnapshot.size === pagination?.pageSize,
      }
    } catch (error) {
      console.error('Error fetching routes:', error)
      throw new Error('Failed to fetch routes')
    }
  }

  /**
   * Create a new route
   */
  async create(routeData: RouteInput): Promise<Route> {
    try {
      const docRef = await addDoc(collection(this.firestore, this.collectionName), {
        ...routeData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      const createdRoute = await this.getById(docRef.id)
      if (!createdRoute) {
        throw new Error('Failed to retrieve created route')
      }

      return createdRoute
    } catch (error) {
      console.error('Error creating route:', error)
      throw new Error('Failed to create route')
    }
  }

  /**
   * Update an existing route
   */
  async update(routeId: string, routeData: Partial<RouteInput>): Promise<Route> {
    try {
      const docRef = doc(this.firestore, this.collectionName, routeId)
      await updateDoc(docRef, {
        ...routeData,
        updatedAt: serverTimestamp(),
      })

      const updatedRoute = await this.getById(routeId)
      if (!updatedRoute) {
        throw new Error('Failed to retrieve updated route')
      }

      return updatedRoute
    } catch (error) {
      console.error('Error updating route:', error)
      throw new Error('Failed to update route')
    }
  }

  /**
   * Delete a route
   */
  async delete(routeId: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, this.collectionName, routeId)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Error deleting route:', error)
      throw new Error('Failed to delete route')
    }
  }

  /**
   * Toggle route active status
   */
  async toggleActive(routeId: string, isActive: boolean): Promise<Route> {
    return this.update(routeId, { isActive })
  }

  /**
   * Get distinct values for filters (for dropdown options)
   */
  async getDistinctOrigins(): Promise<string[]> {
    try {
      const q = query(collection(this.firestore, this.collectionName), orderBy('origin'))
      const querySnapshot = await getDocs(q)
      const origins = new Set<string>()

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data()
        if (data.origin) {
          origins.add(data.origin)
        }
      })

      return Array.from(origins).sort()
    } catch (error) {
      console.error('Error fetching distinct origins:', error)
      return []
    }
  }

  async getDistinctDestinations(): Promise<string[]> {
    try {
      const q = query(collection(this.firestore, this.collectionName), orderBy('destination'))
      const querySnapshot = await getDocs(q)
      const destinations = new Set<string>()

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data()
        if (data.destination) {
          destinations.add(data.destination)
        }
      })

      return Array.from(destinations).sort()
    } catch (error) {
      console.error('Error fetching distinct destinations:', error)
      return []
    }
  }
}

