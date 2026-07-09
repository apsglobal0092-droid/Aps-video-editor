import { useEditorStore, useUIStore } from '@/store'

export function PreviewArea() {
  const currentProject = useEditorStore((state) => state.currentProject)
  const isPlaying = useEditorStore((state) => state.isPlaying)
  const setIsPlaying = useEditorStore((state) => state.setIsPlaying)
  const currentTime = useEditorStore((state) => state.currentTime)
  const setCurrentTime = useEditorStore((state) => state.setCurrentTime)
  const previewFullscreen = useUIStore((state) => state.previewFullscreen)
  const setPreviewFullscreen = useUIStore((state) => state.setPreviewFullscreen)

  if (!currentProject) return null

  return (
    <div className="flex-1 flex flex-col bg-black">
      {/* Video Preview Container */}
      <div className="flex-1 flex items-center justify-center relative">
        <div className="relative w-full h-full bg-black/50 flex items-center justify-center">
          <div className="w-full max-w-4xl aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <svg
                className="w-24 h-24 mx-auto text-slate-600 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-slate-400">Preview Canvas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="bg-slate-900 border-t border-slate-700 p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 text-white hover:text-blue-400 transition"
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Timeline Scrubber */}
          <div className="flex-1">
            <input
              type="range"
              min="0"
              max={currentProject.timeline.duration || 100}
              value={currentTime}
              onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Time Display */}
          <div className="text-sm text-slate-400 w-20 text-right">
            {formatTime(currentTime)} / {formatTime(currentProject.timeline.duration)}
          </div>

          {/* Fullscreen */}
          <button
            onClick={() => setPreviewFullscreen(!previewFullscreen)}
            className="p-2 text-slate-400 hover:text-white transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4m-4 0l5 5m11-5v4m0 0h-4m4 0l-5 5M4 20v-4m0 4h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  return [hours, minutes, secs].map((v) => String(v).padStart(2, '0')).join(':')
}
