import React from 'react'

interface AudioWaveformProps {
  active?: boolean
  color?: string
  height?: number
}

export default function AudioWaveform({
  active = true,
  color = '#ff6b00',
  height = 14,
}: AudioWaveformProps) {
  if (!active) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, height, opacity: 0.4 }}>
        <span style={{ width: 2.5, height: 4, background: color, borderRadius: 1 }} />
        <span style={{ width: 2.5, height: 4, background: color, borderRadius: 1 }} />
        <span style={{ width: 2.5, height: 4, background: color, borderRadius: 1 }} />
        <span style={{ width: 2.5, height: 4, background: color, borderRadius: 1 }} />
      </span>
    )
  }

  return (
    <span
      className="audio-waveform-bars"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 2.5, height }}
      title="Audio transmitting"
    >
      <span className="wave-bar bar-1" style={{ background: color }} />
      <span className="wave-bar bar-2" style={{ background: color }} />
      <span className="wave-bar bar-3" style={{ background: color }} />
      <span className="wave-bar bar-4" style={{ background: color }} />
    </span>
  )
}
