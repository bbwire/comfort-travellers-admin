import { defineStore } from 'pinia'
import type { Firestore } from 'firebase/firestore'
import { VehiclesRepository, type Vehicle, type VehicleFilters, type PaginationOptions } from '~/lib/repositories/vehicles.repository'
import type { VehicleInput } from '~/lib/validation/schemas'

export const useVehiclesStore = defineStore('vehicles', {
  state: () => ({
    vehicles: [] as Vehicle[],
    currentVehicle: null as Vehicle | null,
    loading: false,
    error: null as string | null,
    filters: {
      status: undefined,
      isActive: undefined,
    } as VehicleFilters,
    pageSize: 20,
    lastDoc: null as any,
    hasMore: false,
  }),

  actions: {
    setLoading(value: boolean) {
      this.loading = value
    },
    setError(message: string | null) {
      this.error = message
    },
    setFilters(filters: Partial<VehicleFilters>) {
      this.filters = { ...this.filters, ...filters }
    },
    resetFilters() {
      this.filters = {
        status: undefined,
        isActive: undefined,
      }
    },
    getRepository(firestore: Firestore) {
      return new VehiclesRepository(firestore)
    },
    async fetchVehicles(firestore: Firestore, reset = false) {
      try {
        this.setLoading(true)
        this.setError(null)

        if (reset) {
          this.vehicles = []
          this.lastDoc = null
        }

        const repository = this.getRepository(firestore)
        const pagination: PaginationOptions = {
          pageSize: this.pageSize,
          lastDoc: this.lastDoc,
        }

        const result = await repository.getAll(this.filters, pagination)
        this.vehicles = reset ? result.data : [...this.vehicles, ...result.data]
        this.lastDoc = result.lastDoc
        this.hasMore = result.hasMore
      } catch (error: any) {
        this.setError(error.message || 'Failed to fetch vehicles')
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    async fetchVehicleById(firestore: Firestore, vehicleId: string) {
      try {
        this.setLoading(true)
        this.setError(null)
        const repository = this.getRepository(firestore)
        const vehicle = await repository.getById(vehicleId)
        if (!vehicle) throw new Error('Vehicle not found')
        this.currentVehicle = vehicle
        return vehicle
      } catch (error: any) {
        this.setError(error.message || 'Failed to load vehicle')
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    async createVehicle(firestore: Firestore, payload: VehicleInput) {
      try {
        this.setLoading(true)
        this.setError(null)
        const repository = this.getRepository(firestore)
        const vehicle = await repository.create(payload)
        this.vehicles.unshift(vehicle)
        return { success: true, vehicle }
      } catch (error: any) {
        const message = error.message || 'Failed to create vehicle'
        this.setError(message)
        return { success: false, error: message }
      } finally {
        this.setLoading(false)
      }
    },
    async updateVehicle(firestore: Firestore, vehicleId: string, payload: Partial<VehicleInput>) {
      try {
        this.setLoading(true)
        this.setError(null)
        const repository = this.getRepository(firestore)
        const updated = await repository.update(vehicleId, payload)

        const index = this.vehicles.findIndex((vehicle) => vehicle.id === vehicleId)
        if (index !== -1) {
          this.vehicles[index] = updated
        }
        if (this.currentVehicle?.id === vehicleId) {
          this.currentVehicle = updated
        }
        return { success: true, vehicle: updated }
      } catch (error: any) {
        const message = error.message || 'Failed to update vehicle'
        this.setError(message)
        return { success: false, error: message }
      } finally {
        this.setLoading(false)
      }
    },
    async deleteVehicle(firestore: Firestore, vehicleId: string) {
      try {
        this.setLoading(true)
        this.setError(null)
        const repository = this.getRepository(firestore)
        await repository.delete(vehicleId)
        this.vehicles = this.vehicles.filter((vehicle) => vehicle.id !== vehicleId)
        if (this.currentVehicle?.id === vehicleId) {
          this.currentVehicle = null
        }
        return { success: true }
      } catch (error: any) {
        const message = error.message || 'Failed to delete vehicle'
        this.setError(message)
        return { success: false, error: message }
      } finally {
        this.setLoading(false)
      }
    },
  },
})

