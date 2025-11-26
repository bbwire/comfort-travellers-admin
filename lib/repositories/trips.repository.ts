import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  startAfter,
  type QueryDocumentSnapshot,
  type DocumentData,
  type Firestore,
  serverTimestamp,
} from 'firebase/firestore'
import type { TripInput } from '../validation/schemas'

export type TripStatus = 'scheduled' | 'active' | 'completed' | 'cancelled'

export interface Trip {
  id: string
  title: string
  routeId: string
  vehicleId: string
  departureTime: string
  arrivalTime: string
  totalSeats: number
  seatsBooked: number
  availableSeats: number[]
  status: TripStatus
  notes?: string
  vehicleNumber?: string
  driverName?: string
  conductorName?: string
  isActive: boolean
  createdAt: Date | null
  updatedAt: Date | null
}

export interface TripFilters {
  status?: TripStatus
  routeId?: string
}

export interface PaginationOptions {
  pageSize: number
  lastDoc?: QueryDocumentSnapshot<DocumentData> | null
}

export interface PaginatedTripResult {
  data: Trip[]
  lastDoc: QueryDocumentSnapshot<DocumentData> | null
  hasMore: boolean
}

export class TripsRepository {
  private firestore: Firestore
  private collectionName = 'trips'

  constructor(firestore: Firestore) {
    this.firestore = firestore
  }

  private parseDate(value: string): Date | null {
    if (!value) return null
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return date
  }

  private toISO(value: any): string {
    if (!value) return ''
    if (typeof value === 'string') return value
    if (value instanceof Date) return value.toISOString()
    if (value?.toDate) return value.toDate().toISOString()
    if (typeof value.seconds === 'number') {
      return new Date(value.seconds * 1000).toISOString()
    }
    return ''
  }

  private docToTrip(docSnap: QueryDocumentSnapshot<DocumentData>): Trip {
    const data = docSnap.data()
    const totalSeats = Number(
      data.totalSeats ?? data.seatCapacity ?? data.capacity ?? 0
    )
    const seatsBooked =
      data.seatsBooked ??
      (typeof totalSeats === 'number' && Array.isArray(data.availableSeats)
        ? Math.max(totalSeats - data.availableSeats.length, 0)
        : 0)

    return {
      id: docSnap.id,
      title: data.title || data.name || '',
      routeId: data.routeId || data.route || '',
      vehicleId: data.vehicleId || data.vehicle || '',
      departureTime: this.toISO(data.departureTime),
      arrivalTime: this.toISO(data.arrivalTime),
      totalSeats: totalSeats || 0,
      seatsBooked: Number(seatsBooked) || 0,
      availableSeats: Array.isArray(data.availableSeats)
        ? data.availableSeats.map((seat: any) => Number(seat)).filter((seat: number) => Number.isFinite(seat))
        : [],
      status: data.status || 'scheduled',
      notes: data.notes || '',
      vehicleNumber: data.vehicleNumber || '',
      driverName: data.driverName || '',
      conductorName: data.conductorName || '',
      isActive: data.isActive !== false,
      createdAt: data.createdAt?.toDate?.() || null,
      updatedAt: data.updatedAt?.toDate?.() || null,
    }
  }

  async getAll(filters?: TripFilters, pagination?: PaginationOptions): Promise<PaginatedTripResult> {
    let q = query(collection(this.firestore, this.collectionName), orderBy('departureTime', 'desc'))

    if (filters?.status) {
      q = query(q, where('status', '==', filters.status))
    }

    if (filters?.routeId) {
      q = query(q, where('routeId', '==', filters.routeId))
    }

    if (pagination) {
      q = query(q, limit(pagination.pageSize))
      if (pagination.lastDoc) {
        q = query(q, startAfter(pagination.lastDoc))
      }
    }

    const snapshot = await getDocs(q)
    const trips: Trip[] = []
    let lastDoc: QueryDocumentSnapshot<DocumentData> | null = null

    snapshot.forEach((docSnap) => {
      trips.push(this.docToTrip(docSnap))
      lastDoc = docSnap
    })

    return {
      data: trips,
      lastDoc,
      hasMore: snapshot.size === pagination?.pageSize,
    }
  }

  async getById(tripId: string): Promise<Trip | null> {
    const docRef = doc(this.firestore, this.collectionName, tripId)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) return null
    return this.docToTrip(docSnap as QueryDocumentSnapshot<DocumentData>)
  }

  async create(payload: TripInput): Promise<Trip> {
    const departure = this.parseDate(payload.departureTime)
    const arrival = this.parseDate(payload.arrivalTime)

    const data: any = {
      ...payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    // Ensure Firestore stores timestamps, not strings
    if (departure) {
      data.departureTime = departure
    } else {
      delete data.departureTime
    }

    if (arrival) {
      data.arrivalTime = arrival
    } else {
      delete data.arrivalTime
    }

    const docRef = await addDoc(collection(this.firestore, this.collectionName), data)

    const created = await this.getById(docRef.id)
    if (!created) throw new Error('Failed to retrieve created trip')
    return created
  }

  async update(tripId: string, partial: Partial<TripInput>): Promise<Trip> {
    const docRef = doc(this.firestore, this.collectionName, tripId)

    const departure = partial.departureTime ? this.parseDate(partial.departureTime) : undefined
    const arrival = partial.arrivalTime ? this.parseDate(partial.arrivalTime) : undefined

    const data: any = {
      ...partial,
      updatedAt: serverTimestamp(),
    }

    if (departure) {
      data.departureTime = departure
    } else if ('departureTime' in data) {
      // Don't write an invalid string value
      delete data.departureTime
    }

    if (arrival) {
      data.arrivalTime = arrival
    } else if ('arrivalTime' in data) {
      delete data.arrivalTime
    }

    await updateDoc(docRef, data)

    const updated = await this.getById(tripId)
    if (!updated) throw new Error('Failed to retrieve updated trip')
    return updated
  }

  async delete(tripId: string): Promise<void> {
    const docRef = doc(this.firestore, this.collectionName, tripId)
    await deleteDoc(docRef)
  }
}

