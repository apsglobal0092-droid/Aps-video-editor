import { FFmpeg, toBlobURL } from '@ffmpeg/ffmpeg'

let ffmpegInstance: FFmpeg | null = null
let initPromise: Promise<void> | null = null
let isInitializing = false

export async function initializeFFmpeg(): Promise<FFmpeg> {
  // Return existing instance if already initialized
  if (ffmpegInstance?.isLoaded()) {
    return ffmpegInstance
  }

  // Return pending promise if already initializing
  if (initPromise) {
    await initPromise
    return ffmpegInstance!
  }

  // Start initialization
  isInitializing = true
  initPromise = performInitialization()

  try {
    await initPromise
    return ffmpegInstance!
  } finally {
    isInitializing = false
  }
}

async function performInitialization(): Promise<void> {
  try {
    const ffmpeg = new FFmpeg()

    // Set up message handler for progress events
    ffmpeg.on('log', ({ message }) => {
      console.debug('[FFmpeg]', message)
    })

    ffmpeg.on('progress', ({ progress, time }) => {
      console.debug('[FFmpeg Progress]', { progress, time })
    })

    // Load FFmpeg WASM
    const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm'

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        'application/wasm'
      ),
    })

    ffmpegInstance = ffmpeg
    console.log('FFmpeg initialized successfully')
  } catch (error) {
    console.error('Failed to initialize FFmpeg:', error)
    throw new Error(`FFmpeg initialization failed: ${error}`)
  }
}

export function getFFmpeg(): FFmpeg {
  if (!ffmpegInstance?.isLoaded()) {
    throw new Error('FFmpeg not initialized. Call initializeFFmpeg() first.')
  }
  return ffmpegInstance
}

export function isFFmpegInitialized(): boolean {
  return ffmpegInstance?.isLoaded() ?? false
}

export function isFFmpegInitializing(): boolean {
  return isInitializing
}
