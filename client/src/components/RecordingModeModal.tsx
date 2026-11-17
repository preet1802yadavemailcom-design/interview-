import { useState } from 'react'
import { Users, MonitorUp, Circle, X } from 'lucide-react'
import BrandLogo from './BrandLogo'

export type RecordingMode = 'interview' | 'screen_pip' | 'screen_only'

interface RecordingModeModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (mode: RecordingMode) => void
}

export default function RecordingModeModal({
  isOpen,
  onClose,
  onConfirm,
}: RecordingModeModalProps) {
  const [selectedMode, setSelectedMode] = useState<RecordingMode>('interview')

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        {/* Top Header Row with Badge & Close */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <span className="modal-step-badge">05 Choose Recording Mode</span>
          <button
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Center Glowing Icon */}
        <div className="modal-header-icon-circle">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="3" y="6" width="14" height="16" rx="3" stroke="#ff6b00" strokeWidth="2.2" fill="rgba(255, 107, 0, 0.15)" />
            <path d="M 17 11 L 24 7 L 24 21 L 17 17" stroke="#ff6b00" strokeWidth="2.2" strokeLinejoin="round" fill="rgba(255, 107, 0, 0.2)" />
          </svg>
        </div>

        <h2 className="modal-title-text">Choose Recording Mode</h2>
        <p className="modal-subtitle-text">Select what you want to record.</p>

        <div className="recording-modes-list">
          {/* Option 1: Both Participants */}
          <div
            className={`mode-option-card ${selectedMode === 'interview' ? 'selected' : ''}`}
            onClick={() => setSelectedMode('interview')}
          >
            <div className="mode-left">
              <div className="mode-icon-circle">
                <Users size={20} />
              </div>
              <div className="mode-info">
                <b>Interview (Both Participants)</b>
                <span>Record both videos and audio (Recommended)</span>
              </div>
            </div>
            <div className={`custom-radio ${selectedMode === 'interview' ? 'checked' : ''}`}>
              {selectedMode === 'interview' && <div className="radio-dot" />}
            </div>
          </div>

          {/* Option 2: Screen + Interview (PiP) */}
          <div
            className={`mode-option-card ${selectedMode === 'screen_pip' ? 'selected' : ''}`}
            onClick={() => setSelectedMode('screen_pip')}
          >
            <div className="mode-left">
              <div className="mode-icon-circle">
                <MonitorUp size={20} />
              </div>
              <div className="mode-info">
                <b>Screen + Interview (PiP)</b>
                <span>Record screen with participant videos</span>
              </div>
            </div>
            <div className={`custom-radio ${selectedMode === 'screen_pip' ? 'checked' : ''}`}>
              {selectedMode === 'screen_pip' && <div className="radio-dot" />}
            </div>
          </div>

          {/* Option 3: Screen Only */}
          <div
            className={`mode-option-card ${selectedMode === 'screen_only' ? 'selected' : ''}`}
            onClick={() => setSelectedMode('screen_only')}
          >
            <div className="mode-left">
              <div className="mode-icon-circle">
                <MonitorUp size={20} />
              </div>
              <div className="mode-info">
                <b>Screen Only</b>
                <span>Record only your screen with audio</span>
              </div>
            </div>
            <div className={`custom-radio ${selectedMode === 'screen_only' ? 'checked' : ''}`}>
              {selectedMode === 'screen_only' && <div className="radio-dot" />}
            </div>
          </div>
        </div>

        <button
          className="btn-primary-orange btn-full-width"
          style={{ padding: '15px', borderRadius: 14, marginTop: 10, fontSize: 15 }}
          onClick={() => onConfirm(selectedMode)}
        >
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              border: '2px solid #ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffffff' }} />
          </span>
          Start Recording
        </button>
      </div>
    </div>
  )
}
