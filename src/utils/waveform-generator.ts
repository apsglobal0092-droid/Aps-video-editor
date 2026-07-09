/**
 * Audio Waveform Generator
 * Generates visual waveform data from audio
 */

export interface WaveformData {
  peaks: number[] // Peak amplitudes
  channels: number
  length: number
  sampleRate: number
}

/**
 * Generate waveform data from audio context
 */
export async function generateWaveformFromAudioContext(
  arrayBuffer: ArrayBuffer,
  samples: number = 1000
): Promise<WaveformData> {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const decoded = await audioContext.decodeAudioData(arrayBuffer)

    const peaks: number[] = []
    const rawData = decoded.getChannelData(0)
    const blockSize = Math.floor(rawData.length / samples)

    for (let i = 0; i < samples; i++) {
      let sum = 0
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(rawData[i * blockSize + j])
      }
      peaks.push(sum / blockSize)
    }

    return {
      peaks,
      channels: decoded.numberOfChannels,
      length: decoded.length,
      sampleRate: decoded.sampleRate,
    }
  } catch (error) {
    console.error('Failed to generate waveform:', error)
    throw error
  }
}

/**
 * Normalize waveform peaks to 0-1 range
 */
export function normalizeWaveform(waveformData: WaveformData): WaveformData {
  const max = Math.max(...waveformData.peaks)
  if (max === 0) return waveformData

  return {
    ...waveformData,
    peaks: waveformData.peaks.map((p) => p / max),
  }
}

/**
 * Resample waveform to different resolution
 */
export function resampleWaveform(waveformData: WaveformData, newSampleCount: number): WaveformData {
  if (newSampleCount >= waveformData.peaks.length) {
    return waveformData
  }

  const newPeaks: number[] = []
  const step = waveformData.peaks.length / newSampleCount

  for (let i = 0; i < newSampleCount; i++) {
    const startIdx = Math.floor(i * step)
    const endIdx = Math.floor((i + 1) * step)
    const slice = waveformData.peaks.slice(startIdx, endIdx)
    newPeaks.push(Math.max(...slice))
  }

  return {
    ...waveformData,
    peaks: newPeaks,
  }
}
