import { defineStore } from 'pinia'
import type { Firestore } from 'firebase/firestore'
import { TripsRepository, type Trip, type TripFilters, type PaginationOptions } from '~/lib/repositories/trips.repository'
import type { TripInput } from '~/lib/validation/schemas'

export const useTripsStore = defineStore('trips', {
  state: () => ({
    trips: [] as Trip[],
    currentTrip: null as Trip | null,
    loading: false,
    error: null as string | null,
    filters: {
      status: undefined,
      routeId: undefined,
    } as TripFilters,
    pageSize: 20,
    lastDoc: null as any,
    hasMore: false,
  }),

  actions: {
    setLoading(loading: boolean) {
      this.loading = loading
    },
    setError(message: string | null) {
      this.error = message
    },
    setFilters(filters: Partial<TripFilters>) {
      this.filters = { ...this.filters, ...filters }
    },
    resetFilters() {
      this.filters = {
        status: undefined,
        routeId: undefined,
      }
    },
    getRepository(firestore: Firestore) {
      return new TripsRepository(firestore)
    },
    async fetchTrips(firestore: Firestore, reset = false) {
      try {
        this.setLoading(true)
        this.setError(null)

        if (reset) {
          this.trips = []
          this.lastDoc = null
        }

        const repository = this.getRepository(firestore)
        const pagination: PaginationOptions = {
          pageSize: this.pageSize,
          lastDoc: this.lastDoc,
        }

        const result = await repository.getAll(this.filters, pagination)

        if (reset) {
          this.trips = result.data
        } else {
          this.trips = [...this.trips, ...result.data]
        }

        this.lastDoc = result.lastDoc
        this.hasMore = result.hasMore
      } catch (error: any) {
        this.setError(error.message || 'Failed to fetch trips')
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    async fetchTripById(firestore: Firestore, tripId: string) {
      try {
        this.setLoading(true)
        this.setError(null)
        const repository = this.getRepository(firestore)
        const trip = await repository.getById(tripId)
        if (!trip) throw new Error('Trip not found')
        this.currentTrip = trip
        return trip
      } catch (error: any) {
        this.setError(error.message || 'Failed to load trip')
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    async createTrip(firestore: Firestore, payload: TripInput) {
      try {
        this.setLoading(true)
        this.setError(null)
        const repository = this.getRepository(firestore)
        const trip = await repository.create(payload)
        this.trips.unshift(trip)
        return { success: true, trip }
      } catch (error: any) {
        const message = error.message || 'Failed to create trip'
        this.setError(message)
        return { success: false, error: message }
      } finally {
        this.setLoading(false)
      }
    },
    async updateTrip(firestore: Firestore, tripId: string, payload: Partial<TripInput>) {
      try {
        this.setLoading(true)
        this.setError(null)
        const repository = this.getRepository(firestore)
        const updated = await repository.update(tripId, payload)

        const index = this.trips.findIndex((trip) => trip.id === tripId)
        if (index !== -1) {
          this.trips[index] = updated
        }
        if (this.currentTrip?.id === tripId) {
          this.currentTrip = updated
        }
        return { success: true, trip: updated }
      } catch (error: any) {
        const message = error.message || 'Failed to update trip'
        this.setError(message)
        return { success: false, error: message }
      } finally {
        this.setLoading(false)
      }
    },
    async deleteTrip(firestore: Firestore, tripId: string) {
      try {
        this.setLoading(true)
        this.setError(null)
        const repository = this.getRepository(firestore)
        await repository.delete(tripId)
        this.trips = this.trips.filter((trip) => trip.id !== tripId)
        if (this.currentTrip?.id === tripId) {
          this.currentTrip = null
        }
        return { success: true }
      } catch (error: any) {
        const message = error.message || 'Failed to delete trip'
        this.setError(message)
        return { success: false, error: message }
      } finally {
        this.setLoading(false)
      }
    },
  },
})

