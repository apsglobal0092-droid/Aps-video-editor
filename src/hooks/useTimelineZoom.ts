import { useState, useCallback } from 'react'

const MIN_ZOOM = 0.1
const MAX_ZOOM = 5
const ZOOM_STEP = 0.1

/**
 * Hook for timeline zoom management
 */
export function useTimelineZoom(initialZoom: number = 1) {
  const [zoom, setZoom] = useState(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, initialZoom)))

  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(MAX_ZOOM, prev + ZOOM_STEP))
  }, [])

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(MIN_ZOOM, prev - ZOOM_STEP))
  }, [])

  const resetZoom = useCallback(() => {
    setZoom(1)
  }, [])

  const setZoomLevel = useCallback((level: number) => {
    setZoom(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, level)))
  }, [])

  return {
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoomLevel,
  }
}

/**
 * Calculate pixel width for a given time duration
 */
export function getPixelWidth(duration: number, zoom: number, containerWidth: number): number {
  const basePixelsPerSecond = containerWidth / 30 // 30 seconds base view
  return basePixelsPerSecond * zoom
}

/**
 * Calculate time from pixel position
 */
export function getTimeFromPixel(pixels: number, zoom: number, containerWidth: number): number {
  const basePixelsPerSecond = containerWidth / 30
  return pixels / (basePixelsPerSecond * zoom)
}
