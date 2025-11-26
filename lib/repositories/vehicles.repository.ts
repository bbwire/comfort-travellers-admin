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
import type { VehicleInput } from '~/lib/validation/schemas'

export type VehicleStatus = 'online' | 'offline' | 'maintenance'

export interface Vehicle {
  id: string
  vehicleNumber: string
  status: VehicleStatus
  crew: string[]
  notes?: string
  isActive: boolean
  createdAt: Date | null
  updatedAt: Date | null
}

export interface VehicleFilters {
  status?: VehicleStatus
  isActive?: boolean
}

export interface PaginatedVehicleResult {
  data: Vehicle[]
  lastDoc: QueryDocumentSnapshot<DocumentData> | null
  hasMore: boolean
}

export interface PaginationOptions {
  pageSize: number
  lastDoc?: QueryDocumentSnapshot<DocumentData> | null
}

export class VehiclesRepository {
  private firestore: Firestore
  private collectionName = 'vehicles'

  constructor(firestore: Firestore) {
    this.firestore = firestore
  }

  private docToVehicle(docSnap: QueryDocumentSnapshot<DocumentData>): Vehicle {
    const data = docSnap.data()
    return {
      id: docSnap.id,
      vehicleNumber: data.vehicleNumber || '',
      status: data.status || 'offline',
      crew: Array.isArray(data.crew) ? data.crew : [],
      notes: data.notes || '',
      isActive: data.isActive !== false,
      createdAt: data.createdAt?.toDate?.() || null,
      updatedAt: data.updatedAt?.toDate?.() || null,
    }
  }

  async getAll(filters?: VehicleFilters, pagination?: PaginationOptions): Promise<PaginatedVehicleResult> {
    let q = query(collection(this.firestore, this.collectionName), orderBy('vehicleNumber'))

    if (filters?.status) {
      q = query(q, where('status', '==', filters.status))
    }

    if (filters?.isActive !== undefined) {
      q = query(q, where('isActive', '==', filters.isActive))
    }

    if (pagination) {
      q = query(q, limit(pagination.pageSize))
      if (pagination.lastDoc) {
        q = query(q, startAfter(pagination.lastDoc))
      }
    }

    const snapshot = await getDocs(q)
    const vehicles: Vehicle[] = []
    let lastDoc: QueryDocumentSnapshot<DocumentData> | null = null

    snapshot.forEach((docSnap) => {
      vehicles.push(this.docToVehicle(docSnap))
      lastDoc = docSnap
    })

    return {
      data: vehicles,
      lastDoc,
      hasMore: snapshot.size === pagination?.pageSize,
    }
  }

  async getById(vehicleId: string): Promise<Vehicle | null> {
    const docRef = doc(this.firestore, this.collectionName, vehicleId)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) return null
    return this.docToVehicle(docSnap as QueryDocumentSnapshot<DocumentData>)
  }

  async create(payload: VehicleInput): Promise<Vehicle> {
    const docRef = await addDoc(collection(this.firestore, this.collectionName), {
      ...payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    const created = await this.getById(docRef.id)
    if (!created) throw new Error('Failed to retrieve created vehicle')
    return created
  }

  async update(vehicleId: string, payload: Partial<VehicleInput>): Promise<Vehicle> {
    const docRef = doc(this.firestore, this.collectionName, vehicleId)
    await updateDoc(docRef, {
      ...payload,
      updatedAt: serverTimestamp(),
    })

    const updated = await this.getById(vehicleId)
    if (!updated) throw new Error('Failed to retrieve updated vehicle')
    return updated
  }

  async delete(vehicleId: string): Promise<void> {
    const docRef = doc(this.firestore, this.collectionName, vehicleId)
    await deleteDoc(docRef)
  }
}

