/**
 * Timeline Thumbnail Generator
 * Efficiently generates and caches video thumbnails
 */

export interface ThumbnailOptions {
  width?: number
  height?: number
  quality?: number // 0-1
  count?: number // Number of thumbnails
}

const DEFAULT_WIDTH = 160
const DEFAULT_HEIGHT = 90
const DEFAULT_QUALITY = 0.7
const THUMBNAIL_CACHE = new Map<string, string>()

/**
 * Generate multiple thumbnails for a video
 */
export async function generateThumbnails(
  videoUrl: string,
  duration: number,
  options: ThumbnailOptions = {}
): Promise<string[]> {
  const { width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, quality = DEFAULT_QUALITY, count = 10 } =
    options

  const cacheKey = `${videoUrl}-${count}`
  if (THUMBNAIL_CACHE.has(cacheKey)) {
    return (THUMBNAIL_CACHE.get(cacheKey) as string).split('|')
  }

  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Failed to get canvas context'))
      return
    }

    canvas.width = width
    canvas.height = height

    const thumbnails: string[] = []
    let currentThumbnail = 0

    video.addEventListener(
      'loadedmetadata',
      () => {
        // Calculate time intervals
        const interval = duration / (count - 1)

        const generateNextThumbnail = () => {
          if (currentThumbnail >= count) {
            // All thumbnails generated
            const cached = thumbnails.join('|')
            THUMBNAIL_CACHE.set(cacheKey, cached)
            video.pause()
            URL.revokeObjectURL(videoUrl)
            resolve(thumbnails)
            return
          }

          const time = (currentThumbnail * interval) / duration
          video.currentTime = time
        }

        video.addEventListener(
          'seeked',
          () => {
            ctx.drawImage(video, 0, 0, width, height)
            thumbnails.push(canvas.toDataURL('image/jpeg', quality))
            currentThumbnail++
            generateNextThumbnail()
          },
          { once: true }
        )

        generateNextThumbnail()
      },
      { once: true }
    )

    video.addEventListener(
      'error',
      () => {
        URL.revokeObjectURL(videoUrl)
        reject(new Error('Failed to generate thumbnails'))
      },
      { once: true }
    )

    video.src = videoUrl
  })
}

/**
 * Generate a single thumbnail at specific time
 */
export async function generateThumbnailAtTime(
  videoUrl: string,
  time: number,
  options: ThumbnailOptions = {}
): Promise<string> {
  const { width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, quality = DEFAULT_QUALITY } = options

  const cacheKey = `${videoUrl}-${time}-${width}x${height}`
  if (THUMBNAIL_CACHE.has(cacheKey)) {
    return THUMBNAIL_CACHE.get(cacheKey) as string
  }

  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Failed to get canvas context'))
      return
    }

    canvas.width = width
    canvas.height = height

    video.addEventListener(
      'loadedmetadata',
      () => {
        video.currentTime = Math.min(time, video.duration)
      },
      { once: true }
    )

    video.addEventListener(
      'seeked',
      () => {
        ctx.drawImage(video, 0, 0, width, height)
        const thumbnail = canvas.toDataURL('image/jpeg', quality)
        THUMBNAIL_CACHE.set(cacheKey, thumbnail)
        URL.revokeObjectURL(videoUrl)
        resolve(thumbnail)
      },
      { once: true }
    )

    video.addEventListener(
      'error',
      () => {
        URL.revokeObjectURL(videoUrl)
        reject(new Error('Failed to generate thumbnail'))
      },
      { once: true }
    )

    video.src = videoUrl
    video.crossOrigin = 'anonymous'
  })
}

/**
 * Clear thumbnail cache
 */
export function clearThumbnailCache(): void {
  THUMBNAIL_CACHE.clear()
}

/**
 * Get cache size
 */
export function getThumbnailCacheSize(): number {
  return THUMBNAIL_CACHE.size
}
