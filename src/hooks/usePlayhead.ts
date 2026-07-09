import { useEffect, useRef } from 'react'
import { useEditorStore } from '@/store'

/**
 * Hook for managing playhead synchronization
 */
export function usePlayhead() {
  const isPlaying = useEditorStore((state) => state.isPlaying)
  const currentTime = useEditorStore((state) => state.currentTime)
  const setCurrentTime = useEditorStore((state) => state.setCurrentTime)
  const currentProject = useEditorStore((state) => state.currentProject)

  const animationFrameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(Date.now())
  const playbackSpeedRef = useRef<number>(1)

  useEffect(() => {
    if (!isPlaying || !currentProject) return

    const animate = () => {
      const now = Date.now()
      const deltaTime = (now - lastTimeRef.current) / 1000 // Convert to seconds
      lastTimeRef.current = now

      const newTime = currentTime + deltaTime * playbackSpeedRef.current

      if (newTime >= currentProject.timeline.duration) {
        setCurrentTime(currentProject.timeline.duration)
        useEditorStore.setState({ isPlaying: false })
      } else {
        setCurrentTime(newTime)
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying, currentTime, currentProject, setCurrentTime])

  return {
    currentTime,
    setCurrentTime,
    isPlaying,
  }
}

/**
 * Calculate frame number from time
 */
export function getFrameNumber(time: number, fps: number): number {
  return Math.floor(time * fps)
}

/**
 * Calculate time from frame number
 */
export function getTimeFromFrame(frame: number, fps: number): number {
  return frame / fps
}
