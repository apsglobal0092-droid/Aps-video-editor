import { useState, useRef, useEffect } from 'react'
import { useEditorStore } from '@/store'
import { useTimelineZoom } from '@/hooks/useTimelineZoom'
import { TimelineClip } from './TimelineClip'
import { TimelinePlayhead } from './TimelinePlayhead'
import { formatDuration } from '@/utils/file-handler'

const PIXELS_PER_SECOND = 100
const MIN_CLIP_WIDTH = 50

export function EnhancedTimeline() {
  const currentProject = useEditorStore((state) => state.currentProject)
  const currentTime = useEditorStore((state) => state.currentTime)
  const setCurrentTime = useEditorStore((state) => state.setCurrentTime)
  const selectedTrackId = useEditorStore((state) => state.selectedTrackId)
  const setSelectedTrack = useEditorStore((state) => state.setSelectedTrack)
  const selectedClipId = useEditorStore((state) => state.selectedClipId)
  const setSelectedClip = useEditorStore((state) => state.setSelectedClip)

  const { zoom, zoomIn, zoomOut, resetZoom } = useTimelineZoom(1)
  const timelineRef = useRef<HTMLDivElement>(null)
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false)

  if (!currentProject) return null

  const timelineWidth = currentProject.timeline.duration * PIXELS_PER_SECOND * zoom
  const playheadPosition = currentTime * PIXELS_PER_SECOND * zoom

  // Handle playhead drag
  useEffect(() => {
    if (!isDraggingPlayhead) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!timelineRef.current) return
      const rect = timelineRef.current.getBoundingClientRect()
      const position = e.clientX - rect.left + timelineRef.current.scrollLeft
      const time = position / (PIXELS_PER_SECOND * zoom)
      setCurrentTime(Math.max(0, Math.min(time, currentProject.timeline.duration)))
    }

    const handleMouseUp = () => {
      setIsDraggingPlayhead(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDraggingPlayhead, zoom, currentProject, setCurrentTime])

  // Handle timeline click
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return
    const rect = timelineRef.current.getBoundingClientRect()
    const position = e.clientX - rect.left + timelineRef.current.scrollLeft
    const time = position / (PIXELS_PER_SECOND * zoom)
    setCurrentTime(Math.max(0, Math.min(time, currentProject.timeline.duration)))
  }

  // Handle zoom with mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return
    e.preventDefault()

    if (e.deltaY > 0) {
      zoomOut()
    } else {
      zoomIn()
    }
  }

  return (
    <div className="h-full w-full flex flex-col bg-slate-900 border-t border-slate-700 overflow-hidden">
      {/* Toolbar */}
      <div className="h-10 border-b border-slate-700 flex items-center px-4 gap-2 bg-slate-850">
        <button
          onClick={zoomOut}
          className="p-1 text-slate-400 hover:text-white transition rounded"
          title="Zoom Out"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        </button>

        <span className="text-xs text-slate-400 w-12 text-center">{Math.round(zoom * 100)}%</span>

        <button
          onClick={zoomIn}
          className="p-1 text-slate-400 hover:text-white transition rounded"
          title="Zoom In"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </button>

        <button
          onClick={resetZoom}
          className="p-1 text-slate-400 hover:text-white transition rounded text-xs"
          title="Reset Zoom"
        >
          100%
        </button>
      </div>

      {/* Timeline Tracks */}
      <div
        ref={timelineRef}
        className="flex-1 overflow-auto relative bg-slate-900"
        onWheel={handleWheel}
      >
        <div style={{ width: `${timelineWidth}px`, minHeight: '100%' }} className="relative">
          {/* Timeline Ruler */}
          <div className="sticky top-0 h-6 border-b border-slate-700 bg-slate-850 flex">
            {[...Array(Math.ceil(currentProject.timeline.duration / 5))].map((_, i) => {
              const time = i * 5
              return (
                <div
                  key={i}
                  className="border-r border-slate-700 flex items-center px-2 text-xs text-slate-500"
                  style={{ width: `${5 * PIXELS_PER_SECOND * zoom}px` }}
                >
                  {formatDuration(time)}
                </div>
              )
            })}
          </div>

          {/* Playhead */}
          <TimelinePlayhead
            position={playheadPosition}
            onDragStart={() => setIsDraggingPlayhead(true)}
            height={currentProject.timeline.tracks.length * 64}
          />

          {/* Tracks */}
          <div className="relative">
            {currentProject.timeline.tracks.map((track, trackIndex) => (
              <div
                key={track.id}
                className={`relative h-16 border-b border-slate-700 flex items-center ${
                  selectedTrackId === track.id ? 'bg-slate-800/50' : 'hover:bg-slate-800/20'
                } cursor-pointer transition`}
                onClick={(e) => {
                  setSelectedTrack(track.id)
                  setSelectedClip(null)
                }}
              >
                {/* Track items */}
                {track.items.map((item: any) => (
                  <div key={item.id} className="relative h-full" onClick={(e) => e.stopPropagation()}>
                    {/* Placeholder for clip rendering */}
                    <div
                      className="absolute top-1 bottom-1 bg-blue-600 rounded border border-blue-500 cursor-move"
                      style={{
                        left: `${item.startTime * PIXELS_PER_SECOND * zoom}px`,
                        width: `${Math.max(
                          MIN_CLIP_WIDTH,
                          (item.endTime - item.startTime) * PIXELS_PER_SECOND * zoom
                        )}px`,
                      }}
                      onClick={() => setSelectedClip(item.id)}
                    >
                      <span className="text-xs text-white p-1 truncate block">{item.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
