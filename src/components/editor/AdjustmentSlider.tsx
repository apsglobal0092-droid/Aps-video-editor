import { useState } from 'react'
import { useAdjustment } from '@/hooks/useAdjustments'
import { validateAdjustmentValue, adjustmentToPercentage, percentageToAdjustment } from '@/services/adjustments'

interface AdjustmentSliderProps {
  clipId: string
  label: string
  adjustmentKey: 'brightness' | 'contrast' | 'saturation' | 'volume' | 'opacity'
  min?: number
  max?: number
  step?: number
  showPercentage?: boolean
}

export function AdjustmentSlider({
  clipId,
  label,
  adjustmentKey,
  min = 0.2,
  max = 2.0,
  step = 0.05,
  showPercentage = true,
}: AdjustmentSliderProps) {
  const { value, onChange, onReset } = useAdjustment(clipId, adjustmentKey, min, max)
  const [isDragging, setIsDragging] = useState(false)

  const displayValue = showPercentage
    ? Math.round(adjustmentToPercentage(value as number, min, max))
    : Math.round((value as number) * 100) / 100

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    onChange(validateAdjustmentValue(newValue, min, max))
  }

  const handleDoubleClick = () => {
    onReset()
  }

  return (
    <div className="py-4 px-4 border-b border-slate-700 last:border-b-0">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-mono text-blue-400 cursor-pointer hover:text-blue-300 transition"
            onDoubleClick={handleDoubleClick}
            title="Double-click to reset"
          >
            {displayValue}%
          </span>
          <button
            onClick={onReset}
            className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition"
            title="Reset to default"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Slider */}
      <div className="space-y-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 transition"
          style={{
            background: `linear-gradient(to right, rgb(51, 65, 85) 0%, rgb(59, 130, 246) ${((value as number - min) / (max - min)) * 100}%, rgb(51, 65, 85) ${((value as number - min) / (max - min)) * 100}%, rgb(51, 65, 85) 100%)`,
          }}
        />
      </div>

      {/* Range labels */}
      <div className="flex justify-between text-xs text-slate-500 mt-2">
        <span>{Math.round(min * 100)}%</span>
        <span>100%</span>
        <span>{Math.round(max * 100)}%</span>
      </div>
    </div>
  )
}
