/**
 * Video Metadata Detection Service
 * Extracts and normalizes video codec and format information
 */

export interface VideoMetadata {
  resolution: ResolutionType
  frameRate: FrameRateType
  videoCodec: VideoCodecType
  audioCodec: AudioCodecType
  bitrate: number
  duration: number
  fileSize: number
  aspectRatio: AspectRatioType
  rotation: number
  colorSpace?: ColorSpaceType
  width: number
  height: number
}

export type ResolutionType = '4K' | '2K' | '1080P' | '720P' | 'Custom'
export type FrameRateType = 23.976 | 24 | 25 | 29.97 | 30 | 50 | 59.94 | 60 | 90 | 120
export type VideoCodecType = 'H.264' | 'H.265' | 'AV1' | 'VP9' | 'VP8' | 'Unknown'
export type AudioCodecType = 'AAC' | 'MP3' | 'Opus' | 'PCM' | 'Unknown'
export type AspectRatioType = '16:9' | '9:16' | '1:1' | '4:3' | 'Custom'
export type ColorSpaceType = 'BT.709' | 'BT.601' | 'BT.2020' | 'DCI-P3' | 'sRGB' | 'Unknown'

/**
 * Detect resolution type from dimensions
 */
export function detectResolution(width: number, height: number): ResolutionType {
  const pixels = width * height
  const tolerance = 0.02

  // 4K: 3840×2160 or similar
  if (Math.abs(pixels - 3840 * 2160) / (3840 * 2160) < tolerance) return '4K'
  if (Math.abs(pixels - 4096 * 2160) / (4096 * 2160) < tolerance) return '4K'

  // 2K: 2560×1440
  if (Math.abs(pixels - 2560 * 1440) / (2560 * 1440) < tolerance) return '2K'

  // 1080P: 1920×1080
  if (Math.abs(pixels - 1920 * 1080) / (1920 * 1080) < tolerance) return '1080P'

  // 720P: 1280×720
  if (Math.abs(pixels - 1280 * 720) / (1280 * 720) < tolerance) return '720P'

  return 'Custom'
}

/**
 * Detect frame rate type
 */
export function detectFrameRate(fps: number): FrameRateType {
  const rates: FrameRateType[] = [23.976, 24, 25, 29.97, 30, 50, 59.94, 60, 90, 120]
  const closest = rates.reduce((prev, curr) =>
    Math.abs(curr - fps) < Math.abs(prev - fps) ? curr : prev
  )
  return closest
}

/**
 * Detect aspect ratio
 */
export function detectAspectRatio(width: number, height: number): AspectRatioType {
  const ratio = width / height

  if (Math.abs(ratio - 16 / 9) < 0.01) return '16:9'
  if (Math.abs(ratio - 9 / 16) < 0.01) return '9:16'
  if (Math.abs(ratio - 1) < 0.01) return '1:1'
  if (Math.abs(ratio - 4 / 3) < 0.01) return '4:3'

  return 'Custom'
}

/**
 * Parse video codec from MIME type or file extension
 */
export function detectVideoCodec(mimeType: string, filename: string): VideoCodecType {
  const combined = `${mimeType}${filename}`.toLowerCase()

  if (combined.includes('h.265') || combined.includes('hevc') || combined.includes('.hevc'))
    return 'H.265'
  if (combined.includes('h.264') || combined.includes('avc')) return 'H.264'
  if (combined.includes('av1') || combined.includes('.av1')) return 'AV1'
  if (combined.includes('vp9') || combined.includes('.vp9')) return 'VP9'
  if (combined.includes('vp8') || combined.includes('.vp8')) return 'VP8'

  // Default to H.264 for common formats
  if (combined.includes('mp4') || combined.includes('mov')) return 'H.264'

  return 'Unknown'
}

/**
 * Parse audio codec
 */
export function detectAudioCodec(mimeType: string, filename: string): AudioCodecType {
  const combined = `${mimeType}${filename}`.toLowerCase()

  if (combined.includes('aac') || combined.includes('mp4a')) return 'AAC'
  if (combined.includes('mp3')) return 'MP3'
  if (combined.includes('opus')) return 'Opus'
  if (combined.includes('pcm') || combined.includes('wav')) return 'PCM'

  // Default to AAC for common formats
  if (combined.includes('mp4') || combined.includes('m4a')) return 'AAC'

  return 'Unknown'
}

/**
 * Extract all metadata from video file
 */
export async function extractCompleteMetadata(
  file: File,
  width: number,
  height: number,
  duration: number,
  fps: number = 30
): Promise<VideoMetadata> {
  return {
    resolution: detectResolution(width, height),
    frameRate: detectFrameRate(fps),
    videoCodec: detectVideoCodec(file.type, file.name),
    audioCodec: detectAudioCodec(file.type, file.name),
    bitrate: calculateBitrate(file.size, duration),
    duration,
    fileSize: file.size,
    aspectRatio: detectAspectRatio(width, height),
    rotation: 0, // Would need to parse from file for actual rotation
    width,
    height,
  }
}

/**
 * Calculate approximate bitrate from file size and duration
 */
function calculateBitrate(fileSize: number, duration: number): number {
  if (duration === 0) return 0
  return Math.round((fileSize * 8) / duration / 1000) // Result in kbps
}

/**
 * Format bitrate for display
 */
export function formatBitrate(kbps: number): string {
  if (kbps >= 1000) {
    return `${(kbps / 1000).toFixed(1)} Mbps`
  }
  return `${kbps} kbps`
}

/**
 * Format resolution for display
 */
export function formatResolution(resolution: ResolutionType, width: number, height: number): string {
  if (resolution === 'Custom') {
    return `${width}×${height}`
  }
  return `${resolution} (${width}×${height})`
}
