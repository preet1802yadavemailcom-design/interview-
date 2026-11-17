import React, { useState } from 'react'
import { Calendar, User, Video, Mic, ArrowRight, X, Sparkles } from 'lucide-react'
import BrandLogo from './BrandLogo'
import { VIDEO_FILTERS } from '../lib/filters'

interface CreateRoomModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (title: string, name: string, cameraOn: boolean, micOn: boolean) => void
  isConnecting: boolean
  hasSupabaseConfig: boolean
  activeFilterId?: string
  onSelectFilter?: (id: string) => void
}

export default function CreateRoomModal({
  isOpen,
  onClose,
  onSubmit,
  isConnecting,
  hasSupabaseConfig,
  activeFilterId = 'studio-warm',
  onSelectFilter,
}: CreateRoomModalProps) {
  const [title, setTitle] = useState('Frontend Developer Interview')
  const [name, setName] = useState('Preet Yadav')
  const [cameraOn, setCameraOn] = useState(true)
  const [micOn, setMicOn] = useState(true)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(title.trim() || 'Frontend Developer Interview', name.trim() || 'Preet Yadav', cameraOn, micOn)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        {/* Top Header Row with Badge & Close */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <span className="modal-step-badge">02 Create Meeting</span>
          <button
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Brand Logo inside modal */}
        <div className="modal-brand-logo-wrap" style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <BrandLogo size={22} fontSize={16} />
        </div>

        {/* Center Glowing Icon */}
        <div className="modal-header-icon-circle">
          <Calendar size={26} strokeWidth={2.2} />
        </div>

        <h2 className="modal-title-text">Create Interview Room</h2>
        <p className="modal-subtitle-text">Set up a new interview or meeting in seconds.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="meeting-title">
              Meeting Title <span className="req">*</span>
            </label>
            <input
              id="meeting-title"
              className="form-control"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Frontend Developer Interview"
              required
              maxLength={60}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="user-name">
              Your Name <span className="req">*</span>
            </label>
            <div className="input-with-icon">
              <User size={17} className="input-icon" />
              <input
                id="user-name"
                className="form-control has-icon"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Preet Yadav"
                required
                maxLength={40}
              />
            </div>
          </div>

          {/* Toggles Row with divider */}
          <div className="toggles-row">
            <div className="toggle-item">
              <Video size={17} style={{ color: cameraOn ? '#ff6b00' : '#64748b' }} />
              <span>Camera On</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={cameraOn}
                  onChange={e => setCameraOn(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="toggle-divider" />

            <div className="toggle-item">
              <Mic size={17} style={{ color: micOn ? '#ff6b00' : '#64748b' }} />
              <span>Microphone On</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={micOn}
                  onChange={e => setMicOn(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* Mic Level Live Meter Preview */}
          {micOn && (
            <div className="mic-test-meter-box">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginBottom: 5 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Mic size={11} color="#ff6b00" /> Mic Input Sensitivity
                </span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>Active • 48 kHz</span>
              </div>
              <div className="mic-test-track">
                <div className="mic-test-fill" />
              </div>
            </div>
          )}

          {/* Ultra HD Camera Filter Selector */}
          {cameraOn && (
            <div className="filter-preset-selector-row">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Sparkles size={13} color="#06b6d4" /> Ultra HD Camera Filter:
                </span>
                <span style={{ fontSize: 10.5, color: '#06b6d4', fontWeight: 600 }}>1080p Studio</span>
              </div>
              <div className="filter-chips-scroll">
                {VIDEO_FILTERS.map(f => (
                  <button
                    key={f.id}
                    type="button"
                    className={`filter-chip-btn ${activeFilterId === f.id ? 'active' : ''}`}
                    onClick={() => onSelectFilter?.(f.id)}
                  >
                    <span>{f.icon}</span>
                    <span>{f.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!hasSupabaseConfig && (
            <div className="config-warning-pill">
              ℹ Live WebRTC signaling requires Supabase credentials in client/.env.
            </div>
          )}

          <button
            type="submit"
            className="btn-primary-orange btn-full-width"
            disabled={isConnecting}
          >
            {isConnecting ? 'Creating Room…' : (
              <>
                Create Room <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
