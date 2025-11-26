import { defineStore } from 'pinia'
import type { Firestore } from 'firebase/firestore'
import { UsersRepository, type AdminUser, type UserFilters, type PaginationOptions, type UserRole } from '~/lib/repositories/users.repository'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [] as AdminUser[],
    currentUser: null as AdminUser | null,
    loading: false,
    error: null as string | null,
    filters: {
      role: undefined,
      isActive: undefined,
    } as UserFilters,
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
    setFilters(filters: Partial<UserFilters>) {
      this.filters = { ...this.filters, ...filters }
    },
    resetFilters() {
      this.filters = {
        role: undefined,
        isActive: undefined,
      }
    },
    getRepository(firestore: Firestore) {
      return new UsersRepository(firestore)
    },
    async fetchUsers(firestore: Firestore, reset = false) {
      try {
        this.setLoading(true)
        this.setError(null)

        if (reset) {
          this.users = []
          this.lastDoc = null
        }

        const repository = this.getRepository(firestore)
        const pagination: PaginationOptions = {
          pageSize: this.pageSize,
          lastDoc: this.lastDoc,
        }

        const result = await repository.getAll(this.filters, pagination)
        this.users = reset ? result.data : [...this.users, ...result.data]
        this.lastDoc = result.lastDoc
        this.hasMore = result.hasMore
      } catch (error: any) {
        this.setError(error.message || 'Failed to fetch users')
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    async fetchUserById(firestore: Firestore, userId: string) {
      try {
        this.setLoading(true)
        this.setError(null)
        const repository = this.getRepository(firestore)
        const user = await repository.getById(userId)
        if (!user) throw new Error('User not found')
        this.currentUser = user
        return user
      } catch (error: any) {
        this.setError(error.message || 'Failed to load user')
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    async updateUserRole(firestore: Firestore, userId: string, role: UserRole) {
      try {
        this.setLoading(true)
        this.setError(null)
        const repository = this.getRepository(firestore)
        await repository.updateRole(userId, role)

        const existing = this.users.find((user) => user.id === userId)
        if (existing) existing.role = role
        if (this.currentUser?.id === userId) {
          this.currentUser.role = role
        }
        return { success: true }
      } catch (error: any) {
        const message = error.message || 'Failed to update role'
        this.setError(message)
        return { success: false, error: message }
      } finally {
        this.setLoading(false)
      }
    },
    async updateUserActive(firestore: Firestore, userId: string, isActive: boolean) {
      try {
        this.setLoading(true)
        this.setError(null)
        const repository = this.getRepository(firestore)
        await repository.updateActive(userId, isActive)

        const existing = this.users.find((user) => user.id === userId)
        if (existing) existing.isActive = isActive
        if (this.currentUser?.id === userId) {
          this.currentUser.isActive = isActive
        }
        return { success: true }
      } catch (error: any) {
        const message = error.message || 'Failed to update status'
        this.setError(message)
        return { success: false, error: message }
      } finally {
        this.setLoading(false)
      }
    },
  },
})


