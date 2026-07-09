interface TimelinePlayheadProps {
  position: number
  onDragStart: () => void
  height: number
}

export function TimelinePlayhead({ position, onDragStart, height }: TimelinePlayheadProps) {
  return (
    <div
      className="absolute top-0 w-0.5 bg-red-500 cursor-col-resize z-20 group"
      style={{
        left: `${position}px`,
        height: `${height}px`,
      }}
      onMouseDown={onDragStart}
    >
      {/* Playhead indicator */}
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full border border-red-400 shadow-lg" />
    </div>
  )
}
