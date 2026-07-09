import React, { useState } from 'react'
import { VideoClip } from '@/types'
import { formatDuration } from '@/utils/file-handler'

interface TimelineClipProps {
  clip: VideoClip
  isSelected: boolean
  onSelect: (e: React.MouseEvent) => void
  onDragStart: (e: React.MouseEvent) => void
  onTrimStart: (e: React.MouseEvent) => void
  onTrimEnd: (e: React.MouseEvent) => void
  thumbnail?: string
  zoom: number
}

export function TimelineClip({
  clip,
  isSelected,
  onSelect,
  onDragStart,
  onTrimStart,
  onTrimEnd,
  thumbnail,
  zoom,
}: TimelineClipProps) {
  const [showContextMenu, setShowContextMenu] = useState(false)

  const clipWidth = (clip.endTime - clip.startTime) * 100 * zoom
  const clipLeft = clip.startTime * 100 * zoom

  return (
    <div
      className={`absolute h-full group transition-all ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      style={{
        left: `${clipLeft}px`,
        width: `${Math.max(clipWidth, 50)}px`,
      }}
      onClick={onSelect}
      onContextMenu={(e) => {
        e.preventDefault()
        setShowContextMenu(true)
      }}
    >
      {/* Clip Container */}
      <div
        className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-700 rounded border border-blue-500 cursor-move overflow-hidden flex flex-col"
        onMouseDown={onDragStart}
      >
        {/* Thumbnail */}
        {thumbnail && (
          <img
            src={thumbnail}
            alt={clip.name}
            className="w-full h-full object-cover"
            draggable={false}
          />
        )}

        {/* Label */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 text-xs text-white truncate opacity-0 group-hover:opacity-100 transition">
          {clip.name}
        </div>
      </div>

      {/* Trim Handles */}
      <div
        className="absolute left-0 top-0 w-1 h-full bg-yellow-400 cursor-col-resize opacity-0 hover:opacity-100 transition hover:w-2"
        onMouseDown={onTrimStart}
      />
      <div
        className="absolute right-0 top-0 w-1 h-full bg-yellow-400 cursor-col-resize opacity-0 hover:opacity-100 transition hover:w-2"
        onMouseDown={onTrimEnd}
      />

      {/* Tooltip */}
      <div className="absolute -top-8 left-0 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition">
        {formatDuration(clip.duration)}
      </div>
    </div>
  )
}
