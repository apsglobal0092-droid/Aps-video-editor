import { useEffect, useState } from 'react'
import { initializeFFmpeg } from '@/services/ffmpeg'
import { databaseService } from '@/services/database'
import { useEditorStore, useUIStore } from '@/store'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { HomePage } from '@/pages/HomePage'
import { EditorPage } from '@/pages/EditorPage'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const currentProject = useEditorStore((state) => state.currentProject)
  const [ffmpegReady, setFFmpegReady] = useState(false)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize database
        await databaseService.initialize()

        // Preload FFmpeg (don't block app startup)
        const ffmpegInitPromise = initializeFFmpeg()
          .then(() => setFFmpegReady(true))
          .catch((error) => console.error('FFmpeg initialization queued', error))

        setIsLoading(false)
      } catch (error) {
        console.error('App initialization error:', error)
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [])

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin"></div>
          <p className="text-slate-300 font-medium">Initializing APS Video Editor...</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="w-full h-full bg-slate-950">
          {currentProject ? <EditorPage /> : <HomePage />}
        </div>
      </AuthProvider>
    </ErrorBoundary>
  )
}
