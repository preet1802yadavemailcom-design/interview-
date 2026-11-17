import React, { useState, useRef } from 'react'
import { Calendar, Clock, HardDrive, Film, Trash2, Download, X, Play, Pause, Volume2, FastForward } from 'lucide-react'
import type { RecorderResult } from '../lib/recorder'

interface RecordingPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  onDiscard: () => void
  onSave: () => void
  result: RecorderResult | null
  previewUrl: string
  saveStatus: string
  isSaving: boolean
}

export default function RecordingPreviewModal({
  isOpen,
  onClose,
  onDiscard,
  onSave,
  result,
  previewUrl,
  saveStatus,
  isSaving,
}: RecordingPreviewModalProps) {
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  if (!isOpen) return null

  const formatDuration = (ms: number) => {
    const mins = Math.floor(ms / 60000)
    const secs = Math.floor((ms % 60000) / 1000)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const sizeMb = result ? (result.sizeBytes / (1024 * 1024)).toFixed(1) : '142.6'
  const durationStr = result ? formatDuration(result.durationMs) : '12:34'

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed)
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="preview-modal-card" onClick={e => e.stopPropagation()}>
        {/* Top Header Row with Badge & Close */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span className="modal-step-badge">06 Recording Preview</span>
          <button
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Video Player (Plays real video if available, falls back to reference frame) */}
        <div className="preview-video-container">
          {previewUrl ? (
            <video
              ref={videoRef}
              className="preview-video-element"
              src={previewUrl}
              controls
              autoPlay
              playsInline
            />
          ) : (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <img
                src="/assets/recording_preview_frame.jpg"
                alt="Recording Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          )}
        </div>

        {/* Playback Speed Controls Toolbar */}
        <div className="playback-speed-bar">
          <span style={{ fontSize: 11.5, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 5 }}>
            <FastForward size={13} color="#ff6b00" /> Playback Speed:
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            {[0.75, 1, 1.25, 1.5, 2].map(speed => (
              <button
                key={speed}
                className={`speed-pill-btn ${playbackSpeed === speed ? 'active' : ''}`}
                onClick={() => handleSpeedChange(speed)}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Recording Details Bar */}
        <div className="recording-metadata-section">
          <div className="recording-details-heading">Recording Details</div>

          <div className="metadata-chips-row">
            <div className="meta-chip">
              <Calendar size={14} /> <span>{currentDate}</span>
            </div>
            <div className="meta-chip">
              <Clock size={14} /> <span>{durationStr}</span>
            </div>
            <div className="meta-chip">
              <HardDrive size={14} /> <span>{sizeMb} MB</span>
            </div>
            <div className="meta-chip">
              <Film size={14} /> <span>MP4 (H.264)</span>
            </div>
          </div>
        </div>

        {saveStatus && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              fontSize: 13,
              marginBottom: 16,
              background: saveStatus.includes('successfully') || saveStatus.includes('started')
                ? 'rgba(16, 185, 129, 0.15)'
                : 'rgba(255, 107, 0, 0.15)',
              color: saveStatus.includes('successfully') || saveStatus.includes('started')
                ? '#34d399'
                : '#ffaa66',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {saveStatus}
          </div>
        )}

        {/* Actions Row */}
        <div className="preview-actions-row">
          <button className="btn-secondary-dark btn-discard" onClick={onDiscard} disabled={isSaving}>
            <Trash2 size={16} /> Discard
          </button>
          <button className="btn-primary-orange btn-save-device" onClick={onSave} disabled={isSaving}>
            <Download size={16} /> {isSaving ? 'Saving…' : 'Save to My Device'}
          </button>
        </div>
      </div>
    </div>
  )
}
