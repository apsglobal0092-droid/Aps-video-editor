/**
 * IndexedDB Database Service
 * Handles all persistent storage operations for projects and media
 */

import { Project } from '@types/index'

const DB_NAME = 'APSVideoEditor'
const DB_VERSION = 1
const STORES = {
  PROJECTS: 'projects',
  MEDIA: 'media',
  CACHE: 'cache',
}

class DatabaseService {
  private db: IDBDatabase | null = null

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Projects store
        if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
          const projectStore = db.createObjectStore(STORES.PROJECTS, {
            keyPath: 'id',
          })
          projectStore.createIndex('updatedAt', 'updatedAt', { unique: false })
        }

        // Media store
        if (!db.objectStoreNames.contains(STORES.MEDIA)) {
          const mediaStore = db.createObjectStore(STORES.MEDIA, {
            keyPath: 'id',
          })
          mediaStore.createIndex('projectId', 'projectId', { unique: false })
        }

        // Cache store
        if (!db.objectStoreNames.contains(STORES.CACHE)) {
          db.createObjectStore(STORES.CACHE, { keyPath: 'key' })
        }
      }
    })
  }

  // ============================================
  // PROJECT OPERATIONS
  // ============================================

  async saveProject(project: Project): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([STORES.PROJECTS], 'readwrite')
      const store = tx.objectStore(STORES.PROJECTS)
      const request = store.put(project)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getProject(projectId: string): Promise<Project | undefined> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([STORES.PROJECTS], 'readonly')
      const store = tx.objectStore(STORES.PROJECTS)
      const request = store.get(projectId)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async getAllProjects(): Promise<Project[]> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([STORES.PROJECTS], 'readonly')
      const store = tx.objectStore(STORES.PROJECTS)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const projects = request.result as Project[]
        // Sort by updatedAt descending
        projects.sort((a, b) => b.updatedAt - a.updatedAt)
        resolve(projects)
      }
    })
  }

  async deleteProject(projectId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([STORES.PROJECTS, STORES.MEDIA], 'readwrite')

      // Delete project
      const projectStore = tx.objectStore(STORES.PROJECTS)
      projectStore.delete(projectId)

      // Delete associated media
      const mediaStore = tx.objectStore(STORES.MEDIA)
      const mediaIndex = mediaStore.index('projectId')
      mediaIndex.getAll(projectId).onsuccess = (event) => {
        const medias = (event.target as IDBRequest).result
        medias.forEach((media: any) => mediaStore.delete(media.id))
      }

      tx.onerror = () => reject(tx.error)
      tx.oncomplete = () => resolve()
    })
  }

  async updateProject(
    projectId: string,
    updates: Partial<Project>
  ): Promise<Project> {
    const project = await this.getProject(projectId)
    if (!project) throw new Error(`Project ${projectId} not found`)

    const updated = { ...project, ...updates, updatedAt: Date.now() }
    await this.saveProject(updated)
    return updated
  }

  // ============================================
  // MEDIA OPERATIONS
  // ============================================

  async saveMedia(
    projectId: string,
    mediaId: string,
    data: Blob,
    metadata: Record<string, any>
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    const mediaEntry = {
      id: mediaId,
      projectId,
      data,
      metadata,
      createdAt: Date.now(),
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([STORES.MEDIA], 'readwrite')
      const store = tx.objectStore(STORES.MEDIA)
      const request = store.put(mediaEntry)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getMedia(mediaId: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([STORES.MEDIA], 'readonly')
      const store = tx.objectStore(STORES.MEDIA)
      const request = store.get(mediaId)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async getProjectMedia(projectId: string): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([STORES.MEDIA], 'readonly')
      const store = tx.objectStore(STORES.MEDIA)
      const index = store.index('projectId')
      const request = index.getAll(projectId)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async deleteMedia(mediaId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([STORES.MEDIA], 'readwrite')
      const store = tx.objectStore(STORES.MEDIA)
      const request = store.delete(mediaId)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  // ============================================
  // CACHE OPERATIONS
  // ============================================

  async setCache(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    const entry = {
      key,
      value,
      expiresAt: ttl ? Date.now() + ttl : null,
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([STORES.CACHE], 'readwrite')
      const store = tx.objectStore(STORES.CACHE)
      const request = store.put(entry)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getCache(key: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([STORES.CACHE], 'readonly')
      const store = tx.objectStore(STORES.CACHE)
      const request = store.get(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const entry = request.result
        if (!entry) {
          resolve(null)
          return
        }

        // Check if expired
        if (entry.expiresAt && entry.expiresAt < Date.now()) {
          // Delete expired entry
          store.delete(key)
          resolve(null)
        } else {
          resolve(entry.value)
        }
      }
    })
  }

  async clearCache(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([STORES.CACHE], 'readwrite')
      const store = tx.objectStore(STORES.CACHE)
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  // ============================================
  // UTILITY OPERATIONS
  // ============================================

  async getStorageStats(): Promise<{
    projectCount: number
    mediaCount: number
    estimatedSize: string
  }> {
    if (!this.db) throw new Error('Database not initialized')

    const projects = await this.getAllProjects()
    let mediaCount = 0

    for (const project of projects) {
      const media = await this.getProjectMedia(project.id)
      mediaCount += media.length
    }

    return {
      projectCount: projects.length,
      mediaCount,
      estimatedSize: 'Unknown', // Would need estimation logic
    }
  }

  async clearAll(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(
        [STORES.PROJECTS, STORES.MEDIA, STORES.CACHE],
        'readwrite'
      )

      tx.objectStore(STORES.PROJECTS).clear()
      tx.objectStore(STORES.MEDIA).clear()
      tx.objectStore(STORES.CACHE).clear()

      tx.onerror = () => reject(tx.error)
      tx.oncomplete = () => resolve()
    })
  }
}

export const databaseService = new DatabaseService()
