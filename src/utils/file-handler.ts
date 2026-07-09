/**
 * File Handler Utilities
 * Manages file validation, reading, and format detection
 */

import { FileInfo, SUPPORTED_VIDEO_FORMATS, SUPPORTED_AUDIO_FORMATS } from '@types/index'

/**
 * Validate video file format
 */
export function isValidVideoFormat(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase()
  return ext ? SUPPORTED_VIDEO_FORMATS.includes(ext) : false
}

/**
 * Validate audio file format
 */
export function isValidAudioFormat(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase()
  return ext ? SUPPORTED_AUDIO_FORMATS.includes(ext) : false
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Format duration to HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds)) return '00:00:00'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  return [hours, minutes, secs].map((v) => String(v).padStart(2, '0')).join(':')
}

/**
 * Read file as ArrayBuffer
 */
export async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result
      if (result instanceof ArrayBuffer) {
        resolve(result)
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'))
      }
    }
    reader.onerror = () => reject(new Error('FileReader error'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Read file as Data URL
 */
export async function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      resolve(result)
    }
    reader.onerror = () => reject(new Error('FileReader error'))
    reader.readAsDataURL(file)
  })
}

/**
 * Extract video metadata from file
 */
export async function extractVideoMetadata(file: File): Promise<FileInfo> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const url = URL.createObjectURL(file)

    const handleMetadata = () => {
      URL.revokeObjectURL(url)
      resolve({
        name: file.name,
        size: file.size,
        type: file.type,
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        fps: 30, // Default, actual FPS detection would require more complex parsing
      })
    }

    const handleError = () => {
      URL.revokeObjectURL(url)
      reject(new Error(`Failed to extract metadata from ${file.name}`))
    }

    video.addEventListener('loadedmetadata', handleMetadata, { once: true })
    video.addEventListener('error', handleError, { once: true })
    video.src = url
  })
}

/**
 * Download blob as file
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Validate file size
 */
export function isFileSizeValid(bytes: number, maxMB: number = 1000): boolean {
  return bytes <= maxMB * 1024 * 1024
}

/**
 * Get MIME type from file extension
 */
export function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    mkv: 'video/x-matroska',
    avi: 'video/x-msvideo',
    webm: 'video/webm',
    m4v: 'video/x-m4v',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    aac: 'audio/aac',
    ogg: 'audio/ogg',
    m4a: 'audio/mp4',
  }
  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream'
}

/**
 * Generate unique ID
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Validate aspect ratio
 */
export function calculateAspectRatio(
  width: number,
  height: number
): '16:9' | '9:16' | '1:1' | '4:3' | 'custom' {
  const ratio = width / height
  const tolerance = 0.05

  if (Math.abs(ratio - 16 / 9) < tolerance) return '16:9'
  if (Math.abs(ratio - 9 / 16) < tolerance) return '9:16'
  if (Math.abs(ratio - 1) < tolerance) return '1:1'
  if (Math.abs(ratio - 4 / 3) < tolerance) return '4:3'

  return 'custom'
}
