import { create } from 'zustand'
import { AudioTrackData, AudioClipData, createAudioTrack, createAudioClip } from '@/services/audioEngine'
import { generateId } from '@/utils/file-handler'

interface AudioStore {
  // Array of audio tracks
  audioTracks: AudioTrackData[]

  // Add new audio track
  addAudioTrack: (name?: string) => string

  // Remove audio track
  removeAudioTrack: (trackId: string) => void

  // Update audio track properties
  updateAudioTrack: (trackId: string, updates: Partial<AudioTrackData>) => void

  // Add audio clip to track
  addAudioClip: (trackId: string, clip: AudioClipData) => void

  // Remove audio clip
  removeAudioClip: (trackId: string, clipId: string) => void

  // Update audio clip
  updateAudioClip: (trackId: string, clipId: string, updates: Partial<AudioClipData>) => void

  // Move audio clip
  moveAudioClip: (trackId: string, clipId: string, newStartTime: number) => void

  // Trim audio clip
  trimAudioClip: (
    trackId: string,
    clipId: string,
    newStartTime: number,
    newEndTime: number
  ) => void

  // Split audio clip
  splitAudioClip: (trackId: string, clipId: string, splitTime: number) => void

  // Toggle track mute
  toggleAudioTrackMute: (trackId: string) => void

  // Toggle track visibility
  toggleAudioTrackVisibility: (trackId: string) => void

  // Toggle track lock
  toggleAudioTrackLock: (trackId: string) => void

  // Get audio clip
  getAudioClip: (trackId: string, clipId: string) => AudioClipData | undefined
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  audioTracks: [],

  addAudioTrack: (name?: string) => {
    const trackId = generateId('audio-track')
    const newTrack = createAudioTrack(trackId, name)
    set((state) => ({
      audioTracks: [...state.audioTracks, newTrack],
    }))
    return trackId
  },

  removeAudioTrack: (trackId) => {
    set((state) => ({
      audioTracks: state.audioTracks.filter((t) => t.id !== trackId),
    }))
  },

  updateAudioTrack: (trackId, updates) => {
    set((state) => ({
      audioTracks: state.audioTracks.map((t) =>
        t.id === trackId ? { ...t, ...updates } : t
      ),
    }))
  },

  addAudioClip: (trackId, clip) => {
    set((state) => ({
      audioTracks: state.audioTracks.map((t) =>
        t.id === trackId ? { ...t, clips: [...t.clips, clip] } : t
      ),
    }))
  },

  removeAudioClip: (trackId, clipId) => {
    set((state) => ({
      audioTracks: state.audioTracks.map((t) =>
        t.id === trackId
          ? { ...t, clips: t.clips.filter((c) => c.id !== clipId) }
          : t
      ),
    }))
  },

  updateAudioClip: (trackId, clipId, updates) => {
    set((state) => ({
      audioTracks: state.audioTracks.map((t) =>
        t.id === trackId
          ? {
              ...t,
              clips: t.clips.map((c) =>
                c.id === clipId ? { ...c, ...updates } : c
              ),
            }
          : t
      ),
    }))
  },

  moveAudioClip: (trackId, clipId, newStartTime) => {
    set((state) => ({
      audioTracks: state.audioTracks.map((t) =>
        t.id === trackId
          ? {
              ...t,
              clips: t.clips.map((c) =>
                c.id === clipId
                  ? {
                      ...c,
                      startTime: newStartTime,
                      endTime: newStartTime + c.duration,
                    }
                  : c
              ),
            }
          : t
      ),
    }))
  },

  trimAudioClip: (trackId, clipId, newStartTime, newEndTime) => {
    set((state) => ({
      audioTracks: state.audioTracks.map((t) =>
        t.id === trackId
          ? {
              ...t,
              clips: t.clips.map((c) =>
                c.id === clipId
                  ? {
                      ...c,
                      startTime: newStartTime,
                      endTime: newEndTime,
                      duration: newEndTime - newStartTime,
                    }
                  : c
              ),
            }
          : t
      ),
    }))
  },

  splitAudioClip: (trackId, clipId, splitTime) => {
    set((state) => ({
      audioTracks: state.audioTracks.map((t) =>
        t.id === trackId
          ? {
              ...t,
              clips: t.clips.flatMap((c) => {
                if (c.id !== clipId || splitTime <= c.startTime || splitTime >= c.endTime) {
                  return [c]
                }

                const firstClip: AudioClipData = {
                  ...c,
                  id: generateId('audio-clip'),
                  endTime: splitTime,
                  duration: splitTime - c.startTime,
                }

                const secondClip: AudioClipData = {
                  ...c,
                  id: generateId('audio-clip'),
                  startTime: splitTime,
                  duration: c.endTime - splitTime,
                }

                return [firstClip, secondClip]
              }),
            }
          : t
      ),
    }))
  },

  toggleAudioTrackMute: (trackId) => {
    set((state) => ({
      audioTracks: state.audioTracks.map((t) =>
        t.id === trackId ? { ...t, isMuted: !t.isMuted } : t
      ),
    }))
  },

  toggleAudioTrackVisibility: (trackId) => {
    set((state) => ({
      audioTracks: state.audioTracks.map((t) =>
        t.id === trackId ? { ...t, isVisible: !t.isVisible } : t
      ),
    }))
  },

  toggleAudioTrackLock: (trackId) => {
    set((state) => ({
      audioTracks: state.audioTracks.map((t) =>
        t.id === trackId ? { ...t, isLocked: !t.isLocked } : t
      ),
    }))
  },

  getAudioClip: (trackId, clipId) => {
    const state = get()
    const track = state.audioTracks.find((t) => t.id === trackId)
    return track?.clips.find((c) => c.id === clipId)
  },
}))
