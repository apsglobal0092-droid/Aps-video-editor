import { useEditorStore } from '@/store'
import { useAdjustmentsStore } from '@/store/adjustmentsStore'
import { generateCSSFilter } from '@/services/adjustments'
import { formatDuration } from '@/utils/file-handler'

interface PreviewCanvasProps {
  videoElement?: HTMLVideoElement
}

export function PreviewCanvas({ videoElement }: PreviewCanvasProps) {
  const currentProject = useEditorStore((state) => state.currentProject)
  const currentTime = useEditorStore((state) => state.currentTime)
  const selectedClipId = useEditorStore((state) => state.selectedClipId)
  const getAdjustments = useAdjustmentsStore((state) => state.getAdjustments)

  if (!currentProject) return null

  // Get adjustments for selected clip
  const adjustments = selectedClipId ? getAdjustments(selectedClipId) : null
  const cssFilter = adjustments ? generateCSSFilter({
    brightness: adjustments.brightness,
    contrast: adjustments.contrast,
    saturation: adjustments.saturation,
    opacity: adjustments.opacity,
    volume: adjustments.volume,
    isMuted: adjustments.isMuted,
    fadeInDuration: adjustments.fadeInDuration,
    fadeOutDuration: adjustments.fadeOutDuration,
  }) : 'none'

  const timeline = currentProject.timeline
  const aspectRatio = timeline.width / timeline.height

  return (
    <div className="w-full h-full flex flex-col bg-black">
      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        <div
          className="w-full max-w-4xl aspect-video bg-slate-900 rounded-lg flex items-center justify-center relative shadow-2xl"
          style={{
            filter: cssFilter,
            transition: 'filter 50ms linear', // Smooth real-time updates
          }}
        >
          {/* Placeholder for actual video rendering */}
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
            <p className="text-slate-400 mb-2">Preview Canvas</p>
            {selectedClipId && (
              <p className="text-xs text-slate-500">Editing: {selectedClipId}</p>
            )}
          </div>

          {/* Active Adjustment Indicator */}
          {adjustments && (
            <div className="absolute top-4 right-4 bg-blue-900/80 rounded px-3 py-2 text-xs text-blue-100">
              <div className="font-medium mb-1">Adjustments Active</div>
              <div className="space-y-0.5 text-blue-200">
                {adjustments.brightness !== 1 && <div>Brightness: {Math.round(adjustments.brightness * 100)}%</div>}
                {adjustments.contrast !== 1 && <div>Contrast: {Math.round(adjustments.contrast * 100)}%</div>}
                {adjustments.saturation !== 1 && <div>Saturation: {Math.round(adjustments.saturation * 100)}%</div>}
                {adjustments.opacity !== 1 && <div>Opacity: {Math.round(adjustments.opacity * 100)}%</div>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Playback Controls */}
      <div className="h-24 bg-slate-900 border-t border-slate-700 p-4 space-y-3">
        {/* Timeline Scrubber */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 w-12">
            {formatDuration(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={timeline.duration || 100}
            value={currentTime}
            onChange={(e) => useEditorStore.setState({ currentTime: parseFloat(e.target.value) })}
            className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-slate-400 w-12 text-right">
            {formatDuration(timeline.duration)}
          </span>
        </div>

        {/* Info */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            {timeline.width}×{timeline.height} • {timeline.fps} FPS
          </span>
          <span>{selectedClipId ? 'Clip selected' : 'Select a clip to adjust'}</span>
        </div>
      </div>
    </div>
  )
}
