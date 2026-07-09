import { useClipAdjustments } from '@/hooks/useAdjustments'
import { generateCSSFilter } from '@/services/adjustments'
import { AdjustmentSlider } from './AdjustmentSlider'
import { useEditorStore } from '@/store'

interface AdjustmentPanelProps {
  clipId: string | null
}

export function AdjustmentPanel({ clipId }: AdjustmentPanelProps) {
  if (!clipId) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 text-sm">
        Select a clip to adjust
      </div>
    )
  }

  const { adjustments, resetAllAdjustments } = useClipAdjustments(clipId)
  const cssFilter = generateCSSFilter({
    brightness: adjustments.brightness,
    contrast: adjustments.contrast,
    saturation: adjustments.saturation,
    opacity: adjustments.opacity,
    volume: adjustments.volume,
    isMuted: adjustments.isMuted,
    fadeInDuration: adjustments.fadeInDuration,
    fadeOutDuration: adjustments.fadeOutDuration,
  })

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <h3 className="font-semibold text-slate-100">Video Adjustments</h3>
        <button
          onClick={() => resetAllAdjustments(clipId)}
          className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition"
        >
          Reset All
        </button>
      </div>

      {/* Sliders */}
      <div className="flex-1 overflow-y-auto">
        <AdjustmentSlider
          clipId={clipId}
          label="Brightness"
          adjustmentKey="brightness"
          min={0.2}
          max={2.0}
        />
        <AdjustmentSlider
          clipId={clipId}
          label="Contrast"
          adjustmentKey="contrast"
          min={0.2}
          max={2.0}
        />
        <AdjustmentSlider
          clipId={clipId}
          label="Saturation"
          adjustmentKey="saturation"
          min={0}
          max={2.0}
        />
        <AdjustmentSlider
          clipId={clipId}
          label="Opacity"
          adjustmentKey="opacity"
          min={0}
          max={1.0}
        />
      </div>

      {/* Filter Preview Info */}
      <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/50">
        <p className="text-xs text-slate-400 mb-2">CSS Filter (Preview):</p>
        <code className="text-xs bg-slate-950 p-2 rounded block text-slate-300 break-words">
          {cssFilter}
        </code>
      </div>
    </div>
  )
}
