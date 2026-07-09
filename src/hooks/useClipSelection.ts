import { useState, useCallback } from 'react'

/**
 * Hook for managing clip selection
 */
export function useClipSelection() {
  const [selectedClipIds, setSelectedClipIds] = useState<Set<string>>(new Set())

  const selectClip = useCallback(
    (clipId: string, multiSelect: boolean = false) => {
      setSelectedClipIds((prev) => {
        const newSet = new Set(prev)
        if (multiSelect) {
          if (newSet.has(clipId)) {
            newSet.delete(clipId)
          } else {
            newSet.add(clipId)
          }
        } else {
          newSet.clear()
          newSet.add(clipId)
        }
        return newSet
      })
    },
    []
  )

  const deselectClip = useCallback((clipId: string) => {
    setSelectedClipIds((prev) => {
      const newSet = new Set(prev)
      newSet.delete(clipId)
      return newSet
    })
  }, [])

  const deselectAll = useCallback(() => {
    setSelectedClipIds(new Set())
  }, [])

  const isSelected = useCallback(
    (clipId: string) => selectedClipIds.has(clipId),
    [selectedClipIds]
  )

  return {
    selectedClipIds,
    selectClip,
    deselectClip,
    deselectAll,
    isSelected,
  }
}
