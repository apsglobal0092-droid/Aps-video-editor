import { create } from 'zustand'
import { ClipAdjustments, createDefaultAdjustments, DEFAULT_ADJUSTMENTS } from '@/services/adjustments'

interface AdjustmentsStore {
  // Map of clipId -> adjustments
  adjustments: Map<string, ClipAdjustments>

  // Get adjustments for a clip
  getAdjustments: (clipId: string) => ClipAdjustments

  // Update single adjustment
  updateAdjustment: (
    clipId: string,
    key: keyof Omit<ClipAdjustments, 'clipId'>,
    value: number | boolean
  ) => void

  // Update multiple adjustments
  updateAdjustments: (clipId: string, updates: Partial<Omit<ClipAdjustments, 'clipId'>>) => void

  // Reset specific adjustment
  resetAdjustment: (clipId: string, key: keyof Omit<ClipAdjustments, 'clipId'>) => void

  // Reset all adjustments for a clip
  resetAllAdjustments: (clipId: string) => void

  // Delete adjustments when clip is deleted
  deleteAdjustments: (clipId: string) => void

  // Copy adjustments from one clip to another
  copyAdjustments: (fromClipId: string, toClipId: string) => void
}

export const useAdjustmentsStore = create<AdjustmentsStore>((set, get) => ({
  adjustments: new Map(),

  getAdjustments: (clipId) => {
    const state = get()
    if (!state.adjustments.has(clipId)) {
      const defaultAdj = createDefaultAdjustments(clipId)
      state.adjustments.set(clipId, defaultAdj)
      return defaultAdj
    }
    return state.adjustments.get(clipId)!
  },

  updateAdjustment: (clipId, key, value) => {
    set((state) => {
      const newMap = new Map(state.adjustments)
      const adjustments = newMap.get(clipId) || createDefaultAdjustments(clipId)
      newMap.set(clipId, {
        ...adjustments,
        [key]: value,
      })
      return { adjustments: newMap }
    })
  },

  updateAdjustments: (clipId, updates) => {
    set((state) => {
      const newMap = new Map(state.adjustments)
      const current = newMap.get(clipId) || createDefaultAdjustments(clipId)
      newMap.set(clipId, { ...current, ...updates })
      return { adjustments: newMap }
    })
  },

  resetAdjustment: (clipId, key) => {
    set((state) => {
      const newMap = new Map(state.adjustments)
      const current = newMap.get(clipId) || createDefaultAdjustments(clipId)
      newMap.set(clipId, {
        ...current,
        [key]: DEFAULT_ADJUSTMENTS[key],
      })
      return { adjustments: newMap }
    })
  },

  resetAllAdjustments: (clipId) => {
    set((state) => {
      const newMap = new Map(state.adjustments)
      newMap.set(clipId, createDefaultAdjustments(clipId))
      return { adjustments: newMap }
    })
  },

  deleteAdjustments: (clipId) => {
    set((state) => {
      const newMap = new Map(state.adjustments)
      newMap.delete(clipId)
      return { adjustments: newMap }
    })
  },

  copyAdjustments: (fromClipId, toClipId) => {
    set((state) => {
      const newMap = new Map(state.adjustments)
      const source = newMap.get(fromClipId) || createDefaultAdjustments(fromClipId)
      const copied = { ...source, clipId: toClipId }
      newMap.set(toClipId, copied)
      return { adjustments: newMap }
    })
  },
}))
