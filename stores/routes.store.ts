import { defineStore } from 'pinia'
import type { Firestore } from 'firebase/firestore'
import { RoutesRepository, type Route, type RouteFilters, type PaginationOptions } from '~/lib/repositories/routes.repository'
import type { RouteInput } from '~/lib/validation/schemas'

export const useRoutesStore = defineStore('routes', {
  state: () => ({
    routes: [] as Route[],
    currentRoute: null as Route | null,
    loading: false,
    error: null as string | null,
    lastDoc: null as any,
    hasMore: false,
    filters: {
      origin: undefined as string | undefined,
      destination: undefined as string | undefined,
      isActive: undefined as boolean | undefined,
    } as RouteFilters,
    pageSize: 20,
    distinctOrigins: [] as string[],
    distinctDestinations: [] as string[],
  }),

  getters: {
    activeRoutes: (state) => state.routes.filter((route) => route.isActive),
    inactiveRoutes: (state) => state.routes.filter((route) => !route.isActive),
    routesByOrigin: (state) => (origin: string) =>
      state.routes.filter((route) => route.origin === origin),
    routesByDestination: (state) => (destination: string) =>
      state.routes.filter((route) => route.destination === destination),
  },

  actions: {
    setLoading(loading: boolean) {
      this.loading = loading
    },

    setError(error: string | null) {
      this.error = error
    },

    setFilters(filters: Partial<RouteFilters>) {
      this.filters = { ...this.filters, ...filters }
    },

    resetFilters() {
      this.filters = {
        origin: undefined,
        destination: undefined,
        isActive: undefined,
      }
    },

    /**
     * Initialize repository instance
     */
    getRepository(firestore: Firestore): RoutesRepository {
      return new RoutesRepository(firestore)
    },

    /**
     * Fetch routes with pagination and filters
     */
    async fetchRoutes(firestore: Firestore, reset = false) {
      try {
        this.setLoading(true)
        this.setError(null)

        if (reset) {
          this.routes = []
          this.lastDoc = null
        }

        const repository = this.getRepository(firestore)
        const pagination: PaginationOptions = {
          pageSize: this.pageSize,
          lastDoc: this.lastDoc,
        }

        const result = await repository.getAll(this.filters, pagination)

        if (reset) {
          this.routes = result.data
        } else {
          this.routes = [...this.routes, ...result.data]
        }

        this.lastDoc = result.lastDoc
        this.hasMore = result.hasMore
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to fetch routes'
        this.setError(errorMessage)
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * Load more routes (pagination)
     */
    async loadMore(firestore: Firestore) {
      if (!this.hasMore || this.loading) {
        return
      }
      await this.fetchRoutes(firestore, false)
    },

    /**
     * Fetch a single route by ID
     */
    async fetchRouteById(firestore: Firestore, routeId: string) {
      try {
        this.setLoading(true)
        this.setError(null)

        const repository = this.getRepository(firestore)
        const route = await repository.getById(routeId)

        if (!route) {
          throw new Error('Route not found')
        }

        this.currentRoute = route
        return route
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to fetch route'
        this.setError(errorMessage)
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * Create a new route
     */
    async createRoute(firestore: Firestore, routeData: RouteInput) {
      try {
        this.setLoading(true)
        this.setError(null)

        const repository = this.getRepository(firestore)
        const newRoute = await repository.create(routeData)

        // Add to local state
        this.routes.unshift(newRoute)

        return { success: true, route: newRoute }
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to create route'
        this.setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * Update an existing route
     */
    async updateRoute(firestore: Firestore, routeId: string, routeData: Partial<RouteInput>) {
      try {
        this.setLoading(true)
        this.setError(null)

        const repository = this.getRepository(firestore)
        const updatedRoute = await repository.update(routeId, routeData)

        // Update in local state
        const index = this.routes.findIndex((r) => r.id === routeId)
        if (index !== -1) {
          this.routes[index] = updatedRoute
        }

        if (this.currentRoute?.id === routeId) {
          this.currentRoute = updatedRoute
        }

        return { success: true, route: updatedRoute }
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to update route'
        this.setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * Delete a route
     */
    async deleteRoute(firestore: Firestore, routeId: string) {
      try {
        this.setLoading(true)
        this.setError(null)

        const repository = this.getRepository(firestore)
        await repository.delete(routeId)

        // Remove from local state
        this.routes = this.routes.filter((r) => r.id !== routeId)

        if (this.currentRoute?.id === routeId) {
          this.currentRoute = null
        }

        return { success: true }
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to delete route'
        this.setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * Toggle route active status
     */
    async toggleRouteActive(firestore: Firestore, routeId: string, isActive: boolean) {
      return this.updateRoute(firestore, routeId, { isActive })
    },

    /**
     * Fetch distinct origins and destinations for filter dropdowns
     */
    async fetchFilterOptions(firestore: Firestore) {
      try {
        const repository = this.getRepository(firestore)
        const [origins, destinations] = await Promise.all([
          repository.getDistinctOrigins(),
          repository.getDistinctDestinations(),
        ])

        this.distinctOrigins = origins
        this.distinctDestinations = destinations
      } catch (error) {
        console.error('Error fetching filter options:', error)
      }
    },

    /**
     * Clear current route
     */
    clearCurrentRoute() {
      this.currentRoute = null
    },
  },
})

