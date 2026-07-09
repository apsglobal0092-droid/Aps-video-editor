import { useRef } from 'react'

interface VideoUploadCardProps {
  onFileSelect: (file: File) => void
  isLoading: boolean
  progress: number
  error: string | null
}

export function VideoUploadCard({
  onFileSelect,
  isLoading,
  progress,
  error,
}: VideoUploadCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }

  return (
    <div className="glass-lg p-8 text-center cursor-pointer hover:bg-slate-800/50 transition">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div onClick={() => fileInputRef.current?.click()}>
        <svg
          className="w-16 h-16 mx-auto mb-4 text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>

        <h3 className="text-2xl font-bold text-white mb-2">Upload Video</h3>
        <p className="text-slate-400 mb-4">Drag and drop your video or click to browse</p>

        {isLoading && (
          <div className="mt-4">
            <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-slate-400">{progress}%</p>
          </div>
        )}

        {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}

        <div className="mt-6 text-xs text-slate-400">
          <p>Supported formats: MP4, MOV, MKV, WEBM, AVI, M4V</p>
          <p>Maximum file size: 1GB</p>
        </div>
      </div>
    </div>
  )
}
