import { useAudioTrack, useAudioClip } from '@/hooks/useAudio'
import { useAudioStore } from '@/store/audioStore'
import { createAudioClip, generateId } from '@/utils/file-handler'
import { AdjustmentSlider } from './AdjustmentSlider'

interface AudioPanelProps {
  selectedClipId: string | null
}

export function AudioPanel({ selectedClipId }: AudioPanelProps) {
  const audioTracks = useAudioStore((state) => state.audioTracks)
  const addAudioTrack = useAudioStore((state) => state.addAudioTrack)
  const removeAudioTrack = useAudioStore((state) => state.removeAudioTrack)

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <h3 className="font-semibold text-slate-100">Audio</h3>
        <button
          onClick={() => addAudioTrack()}
          className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
        >
          Add Track
        </button>
      </div>

      {/* Audio Tracks List */}
      <div className="flex-1 overflow-y-auto">
        {audioTracks.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            No audio tracks. Click "Add Track" to create one.
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {audioTracks.map((track) => (
              <AudioTrackItem key={track.id} track={track} onDelete={() => removeAudioTrack(track.id)} />
            ))}
          </div>
        )}
      </div>

      {/* Selected Audio Clip Controls */}
      {selectedClipId && (
        <div className="border-t border-slate-700 p-4 bg-slate-800/50">
          <p className="text-xs text-slate-400 mb-3">Selected Audio Clip</p>
          <AdjustmentSlider
            clipId={selectedClipId}
            label="Volume"
            adjustmentKey="volume"
            min={0}
            max={2.0}
          />
        </div>
      )}
    </div>
  )
}

interface AudioTrackItemProps {
  track: any
  onDelete: () => void
}

function AudioTrackItem({ track, onDelete }: AudioTrackItemProps) {
  const { toggleMute, toggleVisibility, toggleLock } = useAudioTrack(track.id)

  return (
    <div className="bg-slate-800 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-100">{track.name}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleVisibility}
            className={`p-1 rounded transition ${
              track.isVisible ? 'text-slate-300 hover:text-white' : 'text-slate-500'
            }`}
            title={track.isVisible ? 'Hide' : 'Show'}
          >
            {track.isVisible ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
              </svg>
            )}
          </button>
          <button
            onClick={toggleMute}
            className={`p-1 rounded transition ${
              track.isMuted ? 'text-red-400' : 'text-slate-300 hover:text-white'
            }`}
            title={track.isMuted ? 'Unmute' : 'Mute'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6m0 0L5 10m4-4l4-4" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-slate-400 hover:text-red-400 rounded transition"
            title="Delete track"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      <div className="text-xs text-slate-400">{track.clips.length} clips</div>
    </div>
  )
}
