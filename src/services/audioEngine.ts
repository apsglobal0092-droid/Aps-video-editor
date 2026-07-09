/**
 * Audio Track Management
 * Handles multiple audio tracks and their operations
 */

export interface AudioClipData {
  id: string
  trackId: string
  name: string
  startTime: number
  endTime: number
  duration: number
  volume: number
  isMuted: boolean
  fadeInDuration: number
  fadeOutDuration: number
  source: 'imported' | 'extracted' // extracted from video or imported separately
  originalVideoClipId?: string // if extracted from video
  objectUrl?: string
}

export interface AudioTrackData {
  id: string
  name: string
  clips: AudioClipData[]
  volume: number
  isMuted: boolean
  isVisible: boolean
  isLocked: boolean
}

/**
 * Create a new audio track
 */
export function createAudioTrack(
  id: string,
  name: string = `Audio Track ${Date.now()}`
): AudioTrackData {
  return {
    id,
    name,
    clips: [],
    volume: 1.0,
    isMuted: false,
    isVisible: true,
    isLocked: false,
  }
}

/**
 * Create audio clip from imported file
 */
export function createAudioClip(
  id: string,
  trackId: string,
  name: string,
  duration: number,
  startTime: number
): AudioClipData {
  return {
    id,
    trackId,
    name,
    startTime,
    endTime: startTime + duration,
    duration,
    volume: 1.0,
    isMuted: false,
    fadeInDuration: 0,
    fadeOutDuration: 0,
    source: 'imported',
  }
}

/**
 * Extract audio from video clip
 */
export function createExtractedAudioClip(
  id: string,
  trackId: string,
  videoClipId: string,
  name: string,
  duration: number,
  startTime: number
): AudioClipData {
  return {
    id,
    trackId,
    name: `${name} (Audio)`,
    startTime,
    endTime: startTime + duration,
    duration,
    volume: 1.0,
    isMuted: false,
    fadeInDuration: 0,
    fadeOutDuration: 0,
    source: 'extracted',
    originalVideoClipId: videoClipId,
  }
}

/**
 * Check if two audio clips overlap
 */
export function doAudioClipsOverlap(clip1: AudioClipData, clip2: AudioClipData): boolean {
  return clip1.startTime < clip2.endTime && clip2.startTime < clip1.endTime
}

/**
 * Get audio clips at specific time
 */
export function getAudioClipsAtTime(clips: AudioClipData[], time: number): AudioClipData[] {
  return clips.filter((clip) => time >= clip.startTime && time <= clip.endTime)
}
