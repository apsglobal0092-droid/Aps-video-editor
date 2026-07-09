import { useState } from 'react'
import { generateId, readFileAsDataURL, formatFileSize } from '@/utils/file-handler'
import { extractVideoMetadata } from '@/utils/file-handler'

export interface ImportedVideo {
  id: string
  file: File
  metadata: {
    name: string
    size: number
    duration: number
    width: number
    height: number
    fps: number
  }
  thumbnail: string
  objectUrl: string
}

export function useVideoImport() {
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importProgress, setImportProgress] = useState(0)

  const importVideo = async (file: File): Promise<ImportedVideo | null> => {
    setIsImporting(true)
    setImportError(null)
    setImportProgress(0)

    try {
      // Validate file
      const supportedFormats = ['mp4', 'mov', 'mkv', 'webm', 'avi', 'm4v']
      const fileExt = file.name.split('.').pop()?.toLowerCase()

      if (!fileExt || !supportedFormats.includes(fileExt)) {
        throw new Error(`Unsupported file format: ${fileExt}`)
      }

      if (!file.size || file.size > 1000 * 1024 * 1024) {
        throw new Error('File size exceeds 1GB limit')
      }

      setImportProgress(25)

      // Extract metadata
      const metadata = await extractVideoMetadata(file)
      setImportProgress(50)

      // Generate thumbnail
      const thumbnail = await generateVideoThumbnail(file)
      setImportProgress(75)

      // Create object URL
      const objectUrl = URL.createObjectURL(file)
      setImportProgress(100)

      const importedVideo: ImportedVideo = {
        id: generateId('video'),
        file,
        metadata: {
          name: file.name,
          size: file.size,
          duration: metadata.duration || 0,
          width: metadata.width || 1920,
          height: metadata.height || 1080,
          fps: metadata.fps || 30,
        },
        thumbnail,
        objectUrl,
      }

      setIsImporting(false)
      return importedVideo
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to import video'
      setImportError(message)
      setIsImporting(false)
      return null
    }
  }

  const importMultipleVideos = async (files: File[]): Promise<ImportedVideo[]> => {
    const results: ImportedVideo[] = []
    for (const file of files) {
      const result = await importVideo(file)
      if (result) results.push(result)
    }
    return results
  }

  return {
    importVideo,
    importMultipleVideos,
    isImporting,
    importError,
    importProgress,
  }
}

async function generateVideoThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Failed to get canvas context'))
      return
    }

    const url = URL.createObjectURL(file)

    video.addEventListener(
      'loadedmetadata',
      () => {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        video.currentTime = Math.min(1, video.duration / 2)
      },
      { once: true }
    )

    video.addEventListener(
      'seeked',
      () => {
        ctx.drawImage(video, 0, 0)
        const thumbnail = canvas.toDataURL('image/jpeg', 0.7)
        URL.revokeObjectURL(url)
        resolve(thumbnail)
      },
      { once: true }
    )

    video.addEventListener(
      'error',
      () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to generate thumbnail'))
      },
      { once: true }
    )

    video.src = url
  })
}
