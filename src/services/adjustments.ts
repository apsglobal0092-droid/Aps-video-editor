/**
 * Clip Adjustments Model
 * Stores non-destructive adjustment values for each clip
 */

export interface ClipAdjustments {
  clipId: string
  brightness: number // 0.2 to 2.0 (20% to 200%)
  contrast: number // 0.2 to 2.0 (20% to 200%)
  saturation: number // 0 to 2.0 (0% to 200%)
  opacity: number // 0 to 1 (0% to 100%)
  volume: number // 0 to 2.0 (0% to 200%)
  isMuted: boolean
  fadeInDuration: number // seconds
  fadeOutDuration: number // seconds
}

export const DEFAULT_ADJUSTMENTS: Omit<ClipAdjustments, 'clipId'> = {
  brightness: 1.0,
  contrast: 1.0,
  saturation: 1.0,
  opacity: 1.0,
  volume: 1.0,
  isMuted: false,
  fadeInDuration: 0,
  fadeOutDuration: 0,
}

/**
 * Create default adjustments for a clip
 */
export function createDefaultAdjustments(clipId: string): ClipAdjustments {
  return {
    clipId,
    ...DEFAULT_ADJUSTMENTS,
  }
}

/**
 * Validate adjustment value is within bounds
 */
export function validateAdjustmentValue(
  value: number,
  min: number,
  max: number
): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Convert CSS filter values to display percentage
 */
export function adjustmentToPercentage(value: number, min: number = 0.2, max: number = 2.0): number {
  // Map [min, max] to [0, 200]
  const range = max - min
  const normalized = (value - min) / range
  return normalized * 100
}

/**
 * Convert display percentage to adjustment value
 */
export function percentageToAdjustment(
  percentage: number,
  min: number = 0.2,
  max: number = 2.0
): number {
  const range = max - min
  const normalized = percentage / 100
  return min + normalized * range
}

/**
 * Generate CSS filter string from adjustments
 */
export function generateCSSFilter(adjustments: Omit<ClipAdjustments, 'clipId'>): string {
  const filters: string[] = []

  // Brightness filter
  filters.push(`brightness(${adjustments.brightness * 100}%)`)

  // Contrast filter
  filters.push(`contrast(${adjustments.contrast * 100}%)`)

  // Saturation filter
  filters.push(`saturate(${adjustments.saturation * 100}%)`)

  // Opacity via filter (optional, can also use CSS opacity)
  filters.push(`opacity(${adjustments.opacity * 100}%)`)

  return filters.join(' ')
}

/**
 * Generate FFmpeg filter chain from adjustments
 */
export function generateFFmpegFilter(adjustments: Omit<ClipAdjustments, 'clipId'>): string {
  const filters: string[] = []

  // Brightness and contrast combined
  const eq = `eq=brightness=${(adjustments.brightness - 1) * 0.5}:contrast=${adjustments.contrast}`
  filters.push(eq)

  // Saturation
  filters.push(`hue=s=${adjustments.saturation}`)

  return filters.join(',')
}

/**
 * Generate audio filter chain from adjustments
 */
export function generateAudioFilter(adjustments: Pick<ClipAdjustments, 'volume' | 'fadeInDuration' | 'fadeOutDuration'>): string {
  const filters: string[] = []

  // Volume adjustment
  if (adjustments.volume !== 1.0) {
    filters.push(`volume=${adjustments.volume}`)
  }

  // Fade in
  if (adjustments.fadeInDuration > 0) {
    filters.push(`afade=t=in:st=0:d=${adjustments.fadeInDuration}`)
  }

  // Fade out
  if (adjustments.fadeOutDuration > 0) {
    filters.push(`afade=t=out:st=0:d=${adjustments.fadeOutDuration}`)
  }

  return filters.join(',')
}
