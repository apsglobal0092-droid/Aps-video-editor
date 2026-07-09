import { useState } from 'react'
import { ImportedVideo } from '@/hooks/useVideoImport'
import { formatFileSize, formatDuration } from '@/utils/file-handler'

interface VideoImportDialogProps {
  video: ImportedVideo
  onConfirm: (name: string, file: File) => void
  onCancel: () => void
}

export function VideoImportDialog({
  video,
  onConfirm,
  onCancel,
}: VideoImportDialogProps) {
  const [projectName, setProjectName] = useState(
    video.metadata.name.replace(/\.[^.]+$/, '') || 'Untitled Project'
  )

  const handleConfirm = () => {
    onConfirm(projectName, video.file)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="glass-lg max-w-md w-full mx-4">
        {/* Thumbnail */}
        <div className="relative w-full h-48 mb-4 overflow-hidden rounded-t-glass">
          <img
            src={video.thumbnail}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4">New Project</h2>

          {/* Video Info */}
          <div className="bg-slate-800/50 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Resolution:</span>
              <span className="text-white">
                {video.metadata.width} x {video.metadata.height}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Duration:</span>
              <span className="text-white">
                {formatDuration(video.metadata.duration)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Frame Rate:</span>
              <span className="text-white">{video.metadata.fps} fps</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">File Size:</span>
              <span className="text-white">{formatFileSize(video.metadata.size)}</span>
            </div>
          </div>

          {/* Project Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter project name"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
            >
              Create Project
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
