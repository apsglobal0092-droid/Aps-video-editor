/**
 * Application Type Definitions
 * Central location for all TypeScript types and interfaces
 */

// ============================================
// VIDEO & MEDIA TYPES
// ============================================

export interface VideoClip {
  id: string
  name: string
  duration: number
  width: number
  height: number
  fps: number
  format: string
  data?: Blob | ArrayBuffer
  thumbnailUrl?: string
  startTime: number
  endTime: number
  x: number
  y: number
  scale: number
  rotation: number
  opacity: number
}

export interface AudioTrack {
  id: string
  name: string
  duration: number
  data?: Blob | ArrayBuffer
  startTime: number
  endTime: number
  volume: number
  isMuted: boolean
}

// ============================================
// EFFECTS & FILTERS
// ============================================

export interface Effect {
  id: string
  type: 'transition' | 'animation' | 'filter'
  name: string
  duration: number
  startTime: number
  intensity: number
  parameters?: Record<string, unknown>
}

export interface Filter {
  id: string
  name: string
  type: 'brightness' | 'contrast' | 'saturation' | 'hue' | 'blur' | 'custom'
  value: number
  enabled: boolean
}

// ============================================
// TEXT & OVERLAY
// ============================================

export interface TextOverlay {
  id: string
  content: string
  startTime: number
  endTime: number
  x: number
  y: number
  fontSize: number
  fontFamily: string
  fontWeight: 'normal' | 'bold' | 'lighter'
  textAlign: 'left' | 'center' | 'right'
  color: string
  backgroundColor?: string
  opacity: number
  rotation: number
  fontStyle: 'normal' | 'italic'
  textDecoration: 'none' | 'underline' | 'line-through'
}

export interface Sticker {
  id: string
  name: string
  imageUrl: string
  startTime: number
  endTime: number
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  scale: number
}

// ============================================
// TIMELINE & TRACKS
// ============================================

export interface Track {
  id: string
  type: 'video' | 'audio' | 'text' | 'overlay' | 'sticker' | 'transition'
  name: string
  items: (VideoClip | AudioTrack | TextOverlay | Sticker | Effect)[]
  visible: boolean
  locked: boolean
  muted: boolean
  volume: number
  height: number
}

export interface Timeline {
  id: string
  duration: number
  tracks: Track[]
  currentTime: number
  fps: number
  width: number
  height: number
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3' | 'custom'
}

// ============================================
// PROJECT & SETTINGS
// ============================================

export interface ProjectSettings {
  outputFormat: 'mp4' | 'webm' | 'mov' | 'mkv'
  outputQuality: 'low' | 'medium' | 'high' | 'ultra'
  outputResolution: '1080p' | '720p' | '480p' | '4K'
  bitrate: number
  audioCodec: 'aac' | 'mp3' | 'opus'
  audioSampleRate: 44100 | 48000 | 96000
}

export interface Project {
  id: string
  name: string
  description: string
  thumbnail?: string
  timeline: Timeline
  settings: ProjectSettings
  createdAt: number
  updatedAt: number
  version: string
}

// ============================================
// EDITOR STATE
// ============================================

export interface EditorState {
  currentProject: Project | null
  projects: Project[]
  timeline: Timeline | null
  selectedTrackId: string | null
  selectedClipId: string | null
  isPlaying: boolean
  playbackSpeed: number
  currentTime: number
  zoom: number
  history: Project[]
  historyIndex: number
}

// ============================================
// UI STATE
// ============================================

export interface UIState {
  showPreview: boolean
  showTimeline: boolean
  sidebarOpen: boolean
  activePanel: 'adjust' | 'effects' | 'filters' | 'audio' | 'text' | 'overlay' | 'transitions' | null
  isDarkMode: boolean
  previewAspectRatio: '16:9' | '9:16' | '1:1' | '4:3'
  previewFullscreen: boolean
}

// ============================================
// FILE & EXPORT
// ============================================

export interface FileInfo {
  name: string
  size: number
  type: string
  duration?: number
  width?: number
  height?: number
  fps?: number
}

export interface ExportProgress {
  isExporting: boolean
  progress: number
  currentStage: 'preparing' | 'processing' | 'rendering' | 'encoding' | 'complete'
  estimatedTime: number
}

// ============================================
// SUPPORTED FORMATS
// ============================================

export const SUPPORTED_VIDEO_FORMATS = ['mp4', 'mov', 'mkv', 'avi', 'webm', 'm4v']
export const SUPPORTED_AUDIO_FORMATS = ['mp3', 'wav', 'aac', 'ogg', 'm4a']
export const SUPPORTED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'gif']

// ============================================
// ERROR TYPES
// ============================================

export interface AppError {
  code: string
  message: string
  details?: string
  timestamp: number
}
