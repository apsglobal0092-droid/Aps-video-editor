import { useAdjustmentsStore } from '@/store/adjustmentsStore'
import { useState, useEffect } from 'react'

/**
 * Hook for managing a single adjustment value
 */
export function useAdjustment(
  clipId: string,
  adjustmentKey: 'brightness' | 'contrast' | 'saturation' | 'volume' | 'opacity' | 'isMuted' | 'fadeInDuration' | 'fadeOutDuration',
  min: number = 0.2,
  max: number = 2.0
) {
  const getAdjustments = useAdjustmentsStore((state) => state.getAdjustments)
  const updateAdjustment = useAdjustmentsStore((state) => state.updateAdjustment)
  const resetAdjustment = useAdjustmentsStore((state) => state.resetAdjustment)

  const adjustments = getAdjustments(clipId)
  const value = adjustments[adjustmentKey as keyof typeof adjustments]

  const handleChange = (newValue: number | boolean) => {
    if (typeof newValue === 'boolean') {
      updateAdjustment(clipId, adjustmentKey, newValue)
    } else {
      // Validate bounds
      const clamped = Math.max(min, Math.min(max, newValue))
      updateAdjustment(clipId, adjustmentKey, clamped)
    }
  }

  const handleReset = () => {
    resetAdjustment(clipId, adjustmentKey as any)
  }

  return {
    value,
    onChange: handleChange,
    onReset: handleReset,
  }
}

/**
 * Hook for all adjustments of a clip
 */
export function useClipAdjustments(clipId: string) {
  const getAdjustments = useAdjustmentsStore((state) => state.getAdjustments)
  const updateAdjustments = useAdjustmentsStore((state) => state.updateAdjustments)
  const resetAllAdjustments = useAdjustmentsStore((state) => state.resetAllAdjustments)

  const adjustments = getAdjustments(clipId)

  return {
    adjustments,
    updateAdjustments,
    resetAllAdjustments,
  }
}
