import React, { useState, useRef } from 'react'
import {
  Calendar,
  Clock,
  HardDrive,
  Film,
  Trash2,
  Download,
  X,
  Play,
  Pause,
  Volume2,
  FastForward,
  ExternalLink,
  Info,
  CheckCircle2,
} from 'lucide-react'
import type { RecorderResult } from '../lib/recorder'
import { downloadRecording } from '../lib/recorder'

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
  const isMp4 = result ? (result.mimeType.includes('mp4') || result.filename.endsWith('.mp4')) : false
  const formatLabel = isMp4 ? 'MP4 (Universal)' : 'WebM (HD VP9 • Duration Fixed)'

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
              <Film size={14} /> <span>{formatLabel}</span>
            </div>
          </div>
        </div>

        {/* Windows Playback Tip when WebM */}
        <div
          style={{
            margin: '12px 0 16px',
            padding: '12px 14px',
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.22)',
            borderRadius: 10,
            fontSize: 12,
            lineHeight: 1.5,
            color: '#bae6fd',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}
        >
          <Info size={16} color="#38bdf8" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong style={{ color: '#ffffff' }}>Universal Playback Guide:</strong> Your video contains embedded high-precision duration and seek headers.
            <div style={{ marginTop: 4, color: '#94a3b8' }}>
              • <strong style={{ color: '#e2e8f0' }}>Zero-Issue Playback on Windows:</strong> Click <em>"Open in Tab"</em> below to watch full-screen now, or right-click downloaded file &rarr; <em>Open With &rarr; Google Chrome, Edge, or VLC</em>.
              <br />
              • <strong style={{ color: '#e2e8f0' }}>Windows Media Player 0x80070002 Fix:</strong> Caused when Windows lacks the native VP9 codec. Click below to install free from Microsoft Store:
            </div>
            <a
              href="ms-windows-store://pdp/?ProductId=9N4D0MSFG09T"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 8,
                padding: '5px 12px',
                background: 'rgba(56, 189, 248, 0.16)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                borderRadius: 6,
                color: '#38bdf8',
                fontSize: 11.5,
                fontWeight: 600,
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              <ExternalLink size={12} /> Install Free VP9 Codec (Microsoft Store)
            </a>
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
        <div className="preview-actions-row" style={{ flexWrap: 'wrap', gap: 8 }}>
          <button className="btn-secondary-dark btn-discard" onClick={onDiscard} disabled={isSaving}>
            <Trash2 size={15} /> Discard
          </button>
          {previewUrl && (
            <button
              type="button"
              className="btn-secondary-dark"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => window.open(previewUrl, '_blank')}
              title="Watch full-screen video in new tab immediately"
            >
              <ExternalLink size={15} /> Open in Tab
            </button>
          )}
          {result && (
            <button
              type="button"
              className="btn-secondary-dark"
              style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
              onClick={() => downloadRecording(result.blob, result.filename)}
              title="Direct clean download into your Downloads folder"
            >
              <Download size={15} /> Direct Download
            </button>
          )}
          <button className="btn-primary-orange btn-save-device" onClick={onSave} disabled={isSaving}>
            <Download size={16} /> {isSaving ? 'Saving…' : 'Save As…'}
          </button>
        </div>
      </div>
    </div>
  )
}
