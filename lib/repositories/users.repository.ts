import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  updateDoc,
  type QueryDocumentSnapshot,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore'

export type UserRole = 'admin' | 'agent' | 'customer'

export interface AdminUser {
  id: string
  email: string | null
  displayName: string | null
  role: UserRole
  isActive: boolean
  createdAt: Date | null
  updatedAt: Date | null
}

export interface UserFilters {
  role?: UserRole
  isActive?: boolean
}

export interface PaginationOptions {
  pageSize: number
  lastDoc?: QueryDocumentSnapshot<DocumentData> | null
}

export interface PaginatedUserResult {
  data: AdminUser[]
  lastDoc: QueryDocumentSnapshot<DocumentData> | null
  hasMore: boolean
}

export class UsersRepository {
  private firestore: Firestore
  private collectionName = 'users'

  constructor(firestore: Firestore) {
    this.firestore = firestore
  }

  private docToUser(docSnap: QueryDocumentSnapshot<DocumentData>): AdminUser {
    const data = docSnap.data()
    return {
      id: docSnap.id,
      email: data.email || null,
      displayName: data.displayName || null,
      role: (data.role as UserRole) || 'customer',
      isActive: data.isActive !== false,
      createdAt: data.createdAt?.toDate?.() || null,
      updatedAt: data.updatedAt?.toDate?.() || null,
    }
  }

  async getAll(filters?: UserFilters, pagination?: PaginationOptions): Promise<PaginatedUserResult> {
    let q = query(collection(this.firestore, this.collectionName), orderBy('createdAt', 'desc'))

    if (filters?.role) {
      q = query(q, where('role', '==', filters.role))
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
    const users: AdminUser[] = []
    let lastDoc: QueryDocumentSnapshot<DocumentData> | null = null

    snapshot.forEach((docSnap) => {
      users.push(this.docToUser(docSnap))
      lastDoc = docSnap
    })

    return {
      data: users,
      lastDoc,
      hasMore: snapshot.size === pagination?.pageSize,
    }
  }

  async getById(userId: string): Promise<AdminUser | null> {
    const ref = doc(this.firestore, this.collectionName, userId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    return this.docToUser(snap as QueryDocumentSnapshot<DocumentData>)
  }

  async updateRole(userId: string, role: UserRole): Promise<void> {
    const ref = doc(this.firestore, this.collectionName, userId)
    await updateDoc(ref, { role })
  }

  async updateActive(userId: string, isActive: boolean): Promise<void> {
    const ref = doc(this.firestore, this.collectionName, userId)
    await updateDoc(ref, { isActive })
  }
}


