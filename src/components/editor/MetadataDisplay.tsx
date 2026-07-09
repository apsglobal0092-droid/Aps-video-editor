import { VideoMetadata, formatBitrate, formatResolution } from '@/services/metadata'
import { formatFileSize, formatDuration } from '@/utils/file-handler'

interface MetadataDisplayProps {
  metadata: VideoMetadata
}

export function MetadataDisplay({ metadata }: MetadataDisplayProps) {
  const metadataItems = [
    { label: 'Resolution', value: formatResolution(metadata.resolution, metadata.width, metadata.height) },
    { label: 'Frame Rate', value: `${metadata.frameRate} FPS` },
    { label: 'Video Codec', value: metadata.videoCodec },
    { label: 'Audio Codec', value: metadata.audioCodec },
    { label: 'Bitrate', value: formatBitrate(metadata.bitrate) },
    { label: 'Duration', value: formatDuration(metadata.duration) },
    { label: 'File Size', value: formatFileSize(metadata.fileSize) },
    { label: 'Aspect Ratio', value: metadata.aspectRatio },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {metadataItems.map((item) => (
        <div key={item.label} className="bg-slate-800/50 rounded-lg p-3">
          <p className="text-xs text-slate-400 mb-1">{item.label}</p>
          <p className="text-sm font-medium text-white">{item.value}</p>
        </div>
      ))}
    </div>
  )
}
