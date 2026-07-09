import { useAudioStore } from '@/store/audioStore'
import { AudioClipData } from '@/services/audioEngine'

/**
 * Hook for audio track operations
 */
export function useAudioTrack(trackId: string) {
  const audioTracks = useAudioStore((state) => state.audioTracks)
  const updateAudioTrack = useAudioStore((state) => state.updateAudioTrack)
  const toggleAudioTrackMute = useAudioStore((state) => state.toggleAudioTrackMute)
  const toggleAudioTrackVisibility = useAudioStore((state) => state.toggleAudioTrackVisibility)
  const toggleAudioTrackLock = useAudioStore((state) => state.toggleAudioTrackLock)
  const removeAudioTrack = useAudioStore((state) => state.removeAudioTrack)

  const track = audioTracks.find((t) => t.id === trackId)

  return {
    track,
    updateTrack: (updates: any) => updateAudioTrack(trackId, updates),
    toggleMute: () => toggleAudioTrackMute(trackId),
    toggleVisibility: () => toggleAudioTrackVisibility(trackId),
    toggleLock: () => toggleAudioTrackLock(trackId),
    removeTrack: () => removeAudioTrack(trackId),
  }
}

/**
 * Hook for audio clip operations
 */
export function useAudioClip(trackId: string, clipId: string) {
  const getAudioClip = useAudioStore((state) => state.getAudioClip)
  const updateAudioClip = useAudioStore((state) => state.updateAudioClip)
  const removeAudioClip = useAudioStore((state) => state.removeAudioClip)
  const moveAudioClip = useAudioStore((state) => state.moveAudioClip)
  const trimAudioClip = useAudioStore((state) => state.trimAudioClip)
  const splitAudioClip = useAudioStore((state) => state.splitAudioClip)

  const clip = getAudioClip(trackId, clipId)

  return {
    clip,
    updateClip: (updates: Partial<AudioClipData>) => updateAudioClip(trackId, clipId, updates),
    removeClip: () => removeAudioClip(trackId, clipId),
    moveClip: (newStartTime: number) => moveAudioClip(trackId, clipId, newStartTime),
    trimClip: (newStartTime: number, newEndTime: number) =>
      trimAudioClip(trackId, clipId, newStartTime, newEndTime),
    splitClip: (splitTime: number) => splitAudioClip(trackId, clipId, splitTime),
  }
}
