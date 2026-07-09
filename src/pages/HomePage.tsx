import { useState } from 'react'
import { useEditorStore } from '@/store'
import { useVideoImport, ImportedVideo } from '@/hooks/useVideoImport'
import { VideoUploadCard } from '@/components/home/VideoUploadCard'
import { VideoImportDialog } from '@/components/home/VideoImportDialog'
import { RecentProjectsList } from '@/components/home/RecentProjectsList'
import { databaseService } from '@/services/database'
import { Project } from '@/types'

export function HomePage() {
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importedVideo, setImportedVideo] = useState<ImportedVideo | null>(null)
  const { importVideo, isImporting, importError, importProgress } = useVideoImport()
  const createNewProject = useEditorStore((state) => state.createNewProject)
  const loadProject = useEditorStore((state) => state.loadProject)

  const handleVideoImport = async (file: File) => {
    const video = await importVideo(file)
    if (video) {
      setImportedVideo(video)
      setShowImportDialog(true)
    }
  }

  const handleCreateProject = (name: string, videoFile?: File) => {
    createNewProject(name, 1920, 1080, 30)
    setShowImportDialog(false)
    setImportedVideo(null)
  }

  const handleLoadProject = async (projectId: string) => {
    await loadProject(projectId)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.classList.add('bg-blue-900/30')
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('bg-blue-900/30')
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.classList.remove('bg-blue-900/30')
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleVideoImport(files[0])
    }
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-4xl font-bold text-white">APS Video Editor</h1>
          <p className="text-slate-400 mt-2">Professional video editing in your browser</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Upload Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Create New Project</h2>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="relative"
          >
            <VideoUploadCard
              onFileSelect={handleVideoImport}
              isLoading={isImporting}
              progress={importProgress}
              error={importError}
            />
          </div>
        </div>

        {/* Recent Projects */}
        <RecentProjectsList onProjectSelect={handleLoadProject} />
      </div>

      {/* Import Dialog */}
      {showImportDialog && importedVideo && (
        <VideoImportDialog
          video={importedVideo}
          onConfirm={handleCreateProject}
          onCancel={() => {
            setShowImportDialog(false)
            setImportedVideo(null)
          }}
        />
      )}
    </div>
  )
}
