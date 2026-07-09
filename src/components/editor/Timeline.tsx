import { useEditorStore } from '@/store'

export function Timeline() {
  const currentProject = useEditorStore((state) => state.currentProject)
  const setSelectedTrack = useEditorStore((state) => state.setSelectedTrack)
  const selectedTrackId = useEditorStore((state) => state.selectedTrackId)

  if (!currentProject) return null

  return (
    <div className="h-64 bg-slate-900 flex flex-col overflow-hidden">
      {/* Tracks */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full">
          {currentProject.timeline.tracks.map((track) => (
            <div
              key={track.id}
              onClick={() => setSelectedTrack(track.id)}
              className={`h-16 border-b border-slate-700 flex items-stretch cursor-pointer transition ${
                selectedTrackId === track.id ? 'bg-blue-900/20' : 'hover:bg-slate-800/30'
              }`}
            >
              {/* Track Label */}
              <div className="w-32 border-r border-slate-700 flex items-center px-3 bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-500/50"></div>
                  <span className="text-sm font-medium text-slate-300 truncate">{track.name}</span>
                </div>
              </div>

              {/* Track Content Area */}
              <div className="flex-1 relative bg-slate-900/50 overflow-x-auto">
                <div className="min-w-full h-full relative">
                  {track.items.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs">
                      Drop items here
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Ruler */}
      <div className="h-6 border-t border-slate-700 bg-slate-850 flex items-center text-xs text-slate-500">
        <div className="w-32"></div>
        <div className="flex-1 relative">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="absolute h-full border-l border-slate-700">
              <span className="text-xs text-slate-600 ml-1">{i * 5}s</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
