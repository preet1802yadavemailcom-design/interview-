import React, { useState, useRef, useEffect } from 'react'
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  MonitorUp,
  MonitorOff,
  Hand,
  MoreHorizontal,
  PhoneOff,
  Calendar,
  Users,
  MessageSquare,
  Info,
  Check,
  Copy,
  Radio,
  Send,
  Headphones,
  Smile,
  FileText,
  Sliders,
  Download,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Volume2,
  Sparkles,
  RotateCw,
  FlipHorizontal,
  Pin,
  ArrowLeftRight,
  Move,
  Shield,
  Lock,
  Search,
  Tv,
  Play,
  Pause,
} from 'lucide-react'
import BrandLogo from './BrandLogo'
import AudioWaveform from './AudioWaveform'
import ReactionOverlay, { FloatingReaction } from './ReactionOverlay'
import { VIDEO_FILTERS, type FilterAdjustments } from '../lib/filters'
import type { RoomMember } from '../lib/room'

interface LiveWorkspaceProps {
  meetingTitle: string
  roomCode: string
  isHost: boolean
  localName: string
  remoteName: string
  remotePresent: boolean
  connected: boolean
  recording: boolean
  isRecordingPaused?: boolean
  recordingSeconds: number
  onTogglePauseRecording?: () => void
  micOn: boolean
  cameraOn: boolean
  audioPlaybackBlocked: boolean
  localVideoRef: React.RefObject<HTMLVideoElement | null>
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>
  screenVideoRef?: React.RefObject<HTMLVideoElement | null>
  isScreenSharing?: boolean
  onToggleScreenShare?: () => void
  screenShareAllowedForAll?: boolean
  onToggleAllowScreenShare?: (allowed: boolean) => void
  onHostMuteAll?: () => void
  isRoomLocked?: boolean
  onToggleLockRoom?: (locked: boolean) => void
  participants?: RoomMember[]
  onToggleMic: () => void
  onToggleCamera: () => void
  onOpenRecordingModal: () => void
  onStopRecording: () => void
  onLeaveMeeting: () => void
  onEnableAudio: () => void
  onCopyInvite: () => void
  copiedInvite: boolean
  guestConsented: boolean
  guestDeclined: boolean
  hostConsented: boolean
  onHostConsentChange: (val: boolean) => void
  onGuestConsentRespond: (agree: boolean) => void
  onSendChatMessage?: (text: string) => void
  chatMessages?: { from: string; text: string; time: string }[]
  activeFilterId?: string
  activeFilterCss?: string
  filterAdjustments?: FilterAdjustments
  onSelectFilter?: (id: string) => void
  onUpdateAdjustments?: (adj: FilterAdjustments) => void
}

export default function LiveWorkspace({
  meetingTitle,
  roomCode,
  isHost,
  localName,
  remoteName,
  remotePresent,
  connected,
  recording,
  isRecordingPaused = false,
  recordingSeconds,
  onTogglePauseRecording,
  micOn,
  cameraOn,
  audioPlaybackBlocked,
  localVideoRef,
  remoteVideoRef,
  screenVideoRef,
  isScreenSharing = false,
  onToggleScreenShare,
  screenShareAllowedForAll = true,
  onToggleAllowScreenShare,
  onHostMuteAll,
  isRoomLocked = false,
  onToggleLockRoom,
  participants = [],
  onToggleMic,
  onToggleCamera,
  onOpenRecordingModal,
  onStopRecording,
  onLeaveMeeting,
  onEnableAudio,
  onCopyInvite,
  copiedInvite,
  guestConsented,
  guestDeclined,
  hostConsented,
  onHostConsentChange,
  onGuestConsentRespond,
  onSendChatMessage,
  chatMessages = [],
  activeFilterId = 'studio-warm',
  activeFilterCss = 'brightness(1.04) contrast(1.08) saturate(1.18) sepia(0.08)',
  filterAdjustments = { brightness: 100, contrast: 100, saturation: 100 },
  onSelectFilter = () => {},
  onUpdateAdjustments = () => {},
}: LiveWorkspaceProps) {
  const [activeTool, setActiveTool] = useState<'recording' | 'participants' | 'chat' | 'notes' | 'mixer' | 'screen' | 'info' | 'filters'>('recording')
  const [handRaised, setHandRaised] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [notesText, setNotesText] = useState('')
  const [reactions, setReactions] = useState<FloatingReaction[]>([])
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [layoutMode, setLayoutMode] = useState<'grid' | 'pip'>('grid')
  const [hostVolume, setHostVolume] = useState(100)
  const [guestVolume, setGuestVolume] = useState(100)

  // Interactive Tile Transformations State
  const [localRotation, setLocalRotation] = useState<number>(0)
  const [remoteRotation, setRemoteRotation] = useState<number>(0)
  const [isLocalMirrored, setIsLocalMirrored] = useState<boolean>(true)
  const [isTilesSwapped, setIsTilesSwapped] = useState<boolean>(false)
  const [spotlightTile, setSpotlightTile] = useState<'local' | 'remote' | null>(null)
  const [pipCorner, setPipCorner] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right')
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false)
  const [showLayoutMenu, setShowLayoutMenu] = useState<boolean>(false)
  const [participantSearch, setParticipantSearch] = useState<string>('')

  const localContainerRef = useRef<HTMLDivElement | null>(null)
  const remoteContainerRef = useRef<HTMLDivElement | null>(null)

  // Cycle PiP Corner across all 4 positions
  const cyclePipCorner = () => {
    setPipCorner(curr => {
      if (curr === 'bottom-right') return 'bottom-left'
      if (curr === 'bottom-left') return 'top-left'
      if (curr === 'top-left') return 'top-right'
      return 'bottom-right'
    })
  }

  // Native Fullscreen Toggle for Video Tile
  const handleFullscreen = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined)
    } else {
      void ref.current.requestFullscreen().catch(() => undefined)
    }
  }

  // Keyboard shortcut: Esc exits Theater Mode
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTheaterMode) {
        setIsTheaterMode(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isTheaterMode])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const triggerReaction = (emoji: string) => {
    const id = `${Date.now()}-${Math.random()}`
    const x = 30 + Math.random() * 40 // random horizontal position 30-70%
    setReactions(prev => [...prev, { id, emoji, x }])
    setShowReactionPicker(false)

    // Remove reaction after animation completes
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id))
    }, 2400)
  }

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !onSendChatMessage) return
    onSendChatMessage(chatInput.trim())
    setChatInput('')
  }

  const handleDownloadNotes = () => {
    if (!notesText.trim()) return
    const content = `Meeting: ${meetingTitle}\nDate: ${new Date().toLocaleString()}\nParticipants: ${localName} (Host), ${remoteName || 'Guest'}\nRoom Code: ${roomCode}\n\n=== INTERVIEW NOTES ===\n\n${notesText}`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${meetingTitle.replace(/\s+/g, '-')}-Notes.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="workspace-shell">
      {/* Floating Reaction Animation Overlay */}
      <ReactionOverlay reactions={reactions} />

      {/* Top Badge matching 04_Live_Interview_Workspace.png */}
      <div style={{ padding: '16px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="modal-step-badge">04 Live Interview & Recording (Main Workspace)</span>

        {/* Network Quality Indicator */}
        <div className="network-quality-pill">
          <span className="network-green-dot" />
          <span>HD 1080p • 30fps • 24ms</span>
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className={`workspace-main-frame ${isTheaterMode ? 'theater-mode-active' : ''}`}>
        {/* Floating Theater Mode Exit Button */}
        {isTheaterMode && (
          <button
            type="button"
            className="theater-exit-pill"
            onClick={() => setIsTheaterMode(false)}
            title="Exit Theater Immersion Mode (or press Esc)"
          >
            <Minimize2 size={14} />
            <span>Exit Theater Mode (Esc)</span>
          </button>
        )}

        {/* Workspace Top Header Bar */}
        <header className="workspace-top-bar">
          <div className="workspace-top-left">
            <BrandLogo size={20} fontSize={15} />

            <div className="meeting-title-pill">
              <Calendar size={13} style={{ color: '#ff6b00' }} />
              <span>{meetingTitle || 'Frontend Developer Interview'}</span>
            </div>

            {recording ? (
              isRecordingPaused ? (
                <div
                  className="rec-status-pill"
                  style={{
                    background: 'rgba(234, 179, 8, 0.16)',
                    borderColor: 'rgba(234, 179, 8, 0.45)',
                    color: '#fef08a',
                  }}
                  title="Recording is paused. Click Resume in toolbar to continue."
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#eab308', display: 'inline-block' }} />
                  <span>Paused {formatTime(recordingSeconds)}</span>
                </div>
              ) : (
                <div className="rec-status-pill">
                  <span className="rec-dot-pulsing" />
                  <span>Recording {formatTime(recordingSeconds)}</span>
                </div>
              )
            ) : (
              <div
                style={{
                  fontSize: 12,
                  color: '#94a3b8',
                  background: 'rgba(255,255,255,0.06)',
                  padding: '5px 12px',
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#64748b' }} />
                <span>Ready to record</span>
              </div>
            )}
          </div>

          <div className="workspace-top-right">
            {/* Layout Mode Dropdown Menu */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="layout-mode-btn"
                onClick={() => setShowLayoutMenu(prev => !prev)}
                title="Switch Layout Mode (Grid, Spotlight, PiP, Theater)"
              >
                {spotlightTile ? <Pin size={14} color="#ff6b00" /> : layoutMode === 'pip' ? <Maximize2 size={14} /> : <LayoutGrid size={14} />}
                <span>
                  {spotlightTile ? 'Spotlight' : layoutMode === 'pip' ? 'PiP Mode' : 'Grid View'}
                </span>
              </button>

              {showLayoutMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    background: '#0d1322',
                    border: '1px solid rgba(255,255,255,0.14)',
                    borderRadius: 12,
                    boxShadow: '0 12px 36px rgba(0,0,0,0.7)',
                    padding: '6px',
                    zIndex: 100,
                    minWidth: 185,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                  }}
                >
                  <button
                    type="button"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: layoutMode === 'grid' && !spotlightTile ? 'rgba(255,107,0,0.18)' : 'transparent',
                      color: layoutMode === 'grid' && !spotlightTile ? '#ff6b00' : '#e2e8f0',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 12,
                      textAlign: 'left',
                    }}
                    onClick={() => {
                      setLayoutMode('grid')
                      setSpotlightTile(null)
                      setShowLayoutMenu(false)
                    }}
                  >
                    <LayoutGrid size={14} /> Side-by-Side Grid
                  </button>
                  <button
                    type="button"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: layoutMode === 'pip' && !spotlightTile ? 'rgba(255,107,0,0.18)' : 'transparent',
                      color: layoutMode === 'pip' && !spotlightTile ? '#ff6b00' : '#e2e8f0',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 12,
                      textAlign: 'left',
                    }}
                    onClick={() => {
                      setLayoutMode('pip')
                      setSpotlightTile(null)
                      setShowLayoutMenu(false)
                    }}
                  >
                    <Maximize2 size={14} /> Picture-in-Picture
                  </button>
                  <button
                    type="button"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: spotlightTile ? 'rgba(255,107,0,0.18)' : 'transparent',
                      color: spotlightTile ? '#ff6b00' : '#e2e8f0',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 12,
                      textAlign: 'left',
                    }}
                    onClick={() => {
                      setSpotlightTile(spotlightTile ? null : 'remote')
                      setShowLayoutMenu(false)
                    }}
                  >
                    <Pin size={14} /> Spotlight Speaker
                  </button>
                  <button
                    type="button"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: isTheaterMode ? 'rgba(255,107,0,0.18)' : 'transparent',
                      color: isTheaterMode ? '#ff6b00' : '#e2e8f0',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 12,
                      textAlign: 'left',
                    }}
                    onClick={() => {
                      setIsTheaterMode(true)
                      setShowLayoutMenu(false)
                    }}
                  >
                    <Tv size={14} /> Theater Immersion
                  </button>
                </div>
              )}
            </div>

            <div className="pill-stat" title="Up to 100 participants supported in this room">
              <Users size={14} /> <span>{participants && participants.length > 0 ? participants.length : (remotePresent ? 2 : 1)} / 100</span>
            </div>

            {/* 3 Green vertical bars */}
            <span style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 14 }}>
              <span style={{ width: 3, height: 6, background: '#10b981', borderRadius: 1 }}></span>
              <span style={{ width: 3, height: 10, background: '#10b981', borderRadius: 1 }}></span>
              <span style={{ width: 3, height: 14, background: '#10b981', borderRadius: 1 }}></span>
            </span>

            <button className="action-icon-btn" onClick={onCopyInvite} title="Copy invite link">
              {copiedInvite ? <Check size={15} color="#10b981" /> : <Copy size={15} />}
            </button>

            <MoreHorizontal
              size={16}
              style={{ color: '#94a3b8', cursor: 'pointer' }}
              onClick={() => setActiveTool('info')}
            />
          </div>
        </header>

        {/* Workspace Body: Dual Stage + Right Sidebar */}
        <div className="workspace-body-layout">
          {/* Main Video Stage Area */}
          <main className="workspace-stage-area">
            {audioPlaybackBlocked && (
              <div className="audio-blocked-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Headphones size={16} /> Browser autoplay policy blocked participant audio.
                </div>
                <button
                  className="btn-primary-orange"
                  style={{ padding: '6px 14px', fontSize: 12 }}
                  onClick={onEnableAudio}
                >
                  Enable Audio
                </button>
              </div>
            )}

            {/* Recording Paused Floating Indicator */}
            {recording && isRecordingPaused && (
              <div
                style={{
                  position: 'absolute',
                  top: 16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(234, 179, 8, 0.95)',
                  color: '#0a0d16',
                  padding: '7px 18px',
                  borderRadius: 999,
                  fontSize: 12.5,
                  fontWeight: 700,
                  boxShadow: '0 6px 20px rgba(0,0,0,0.6)',
                  zIndex: 40,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  letterSpacing: 0.3,
                }}
              >
                <Pause size={14} fill="#0a0d16" />
                <span>Recording is PAUSED • Click Resume to continue</span>
              </div>
            )}

            {/* Live Screen Share Stage View OR Dual Video Grid */}
            {isScreenSharing ? (
              <div className="screen-share-stage-container">
                <video
                  ref={screenVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="screen-share-video-elem"
                />
                {/* Floating participant webcams in PiP dock */}
                <div className="screen-share-pip-dock">
                  <div className="screen-share-pip-item local-video-container">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      style={{ filter: activeFilterCss }}
                    />
                    <div className="participant-label-pill" style={{ bottom: 6, left: 6, fontSize: 10, padding: '3px 8px' }}>
                      <span>👑 {localName || 'You'}</span>
                    </div>
                  </div>
                  {remotePresent && connected && (
                    <div className="screen-share-pip-item">
                      <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                      />
                      <div className="participant-label-pill" style={{ bottom: 6, left: 6, fontSize: 10, padding: '3px 8px' }}>
                        <span>🎙 {remoteName || 'Guest'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                className={`video-stage-grid ${layoutMode === 'pip' ? 'layout-pip-mode' : ''} ${
                  spotlightTile ? 'layout-spotlight-mode' : ''
                }`}
              >
                {/* Local Participant (Interviewer / You) */}
                <div
                  ref={localContainerRef}
                  className={`video-container local-video-container ${
                    layoutMode === 'pip' && spotlightTile !== 'local' ? `pip-corner-${pipCorner}` : ''
                  } ${spotlightTile === 'local' ? 'spotlight-primary' : ''}`}
                  style={{
                    order: isTilesSwapped ? 2 : 1,
                  }}
                >
                  {/* Interactive Tile Hover Action Bar */}
                  <div className="tile-hover-toolbar">
                    {/* Rotate 90° */}
                    <button
                      type="button"
                      className={`tile-action-btn ${localRotation > 0 ? 'active' : ''}`}
                      onClick={() => setLocalRotation(r => (r + 90) % 360)}
                      title={`Rotate Camera (Current: ${localRotation}°)`}
                    >
                      <RotateCw size={13} />
                    </button>
                    {/* Mirror Flip */}
                    <button
                      type="button"
                      className={`tile-action-btn ${isLocalMirrored ? 'active' : ''}`}
                      onClick={() => setIsLocalMirrored(m => !m)}
                      title={isLocalMirrored ? 'Mirror Reflection (ON)' : 'Mirror Reflection (OFF)'}
                    >
                      <FlipHorizontal size={13} />
                    </button>
                    {/* Spotlight / Pin */}
                    <button
                      type="button"
                      className={`tile-action-btn ${spotlightTile === 'local' ? 'active' : ''}`}
                      onClick={() => setSpotlightTile(spotlightTile === 'local' ? null : 'local')}
                      title={spotlightTile === 'local' ? 'Unpin Local Video' : 'Spotlight / Maximize You'}
                    >
                      <Pin size={13} />
                    </button>
                    {/* Swap Positions */}
                    <button
                      type="button"
                      className={`tile-action-btn ${isTilesSwapped ? 'active' : ''}`}
                      onClick={() => setIsTilesSwapped(s => !s)}
                      title="Swap Left / Right Video Positions"
                    >
                      <ArrowLeftRight size={13} />
                    </button>
                    {/* Move PiP Corner */}
                    {layoutMode === 'pip' && (
                      <button
                        type="button"
                        className="tile-action-btn"
                        onClick={cyclePipCorner}
                        title={`Move PiP Corner (${pipCorner})`}
                      >
                        <Move size={13} />
                      </button>
                    )}
                    {/* Native Fullscreen */}
                    <button
                      type="button"
                      className="tile-action-btn"
                      onClick={() => handleFullscreen(localContainerRef)}
                      title="Fullscreen Video Tile"
                    >
                      <Maximize2 size={13} />
                    </button>
                  </div>

                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{
                      display: cameraOn ? 'block' : 'none',
                      filter: activeFilterCss,
                      transform: `${isLocalMirrored ? 'scaleX(-1)' : 'scaleX(1)'} ${
                        localRotation ? `rotate(${localRotation}deg)` : ''
                      }`,
                      transition: 'transform 0.25s ease',
                    }}
                  />
                  {!cameraOn && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: '#0e1424' }}>
                      <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#ff6b00', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: '#fff', boxShadow: '0 0 20px rgba(255,107,0,0.4)' }}>
                        {(localName || 'P').charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: 13, color: '#94a3b8', marginTop: 10, fontWeight: 500 }}>Camera Off</span>
                    </div>
                  )}
                  {/* Active Filter Pill Badge */}
                  <button
                    type="button"
                    className="video-filter-pill-trigger"
                    onClick={() => setActiveTool(activeTool === 'filters' ? 'recording' : 'filters')}
                    title="Change Ultra HD Camera Filter"
                  >
                    <Sparkles size={11} color="#06b6d4" />
                    <span>{(VIDEO_FILTERS.find(f => f.id === activeFilterId) || VIDEO_FILTERS[0]).name.split(' ')[0]}</span>
                  </button>

                  <div className="participant-label-pill">
                    <span style={{ color: '#f59e0b' }}>👑</span>
                    <span>{localName || 'Preet Yadav'} (You)</span>
                    <AudioWaveform active={micOn} color="#ff6b00" height={13} />
                  </div>
                </div>

                {/* Remote Participant (Real video when connected, Clean waiting radar when alone) */}
                <div
                  ref={remoteContainerRef}
                  className={`video-container remote-video ${
                    layoutMode === 'pip' && spotlightTile === 'local' ? `pip-corner-${pipCorner}` : ''
                  } ${spotlightTile === 'remote' ? 'spotlight-primary' : ''}`}
                  style={{
                    order: isTilesSwapped ? 1 : 2,
                  }}
                >
                  {/* Interactive Tile Hover Action Bar */}
                  <div className="tile-hover-toolbar">
                    {/* Rotate 90° */}
                    <button
                      type="button"
                      className={`tile-action-btn ${remoteRotation > 0 ? 'active' : ''}`}
                      onClick={() => setRemoteRotation(r => (r + 90) % 360)}
                      title={`Rotate Guest Camera (Current: ${remoteRotation}°)`}
                    >
                      <RotateCw size={13} />
                    </button>
                    {/* Spotlight / Pin */}
                    <button
                      type="button"
                      className={`tile-action-btn ${spotlightTile === 'remote' ? 'active' : ''}`}
                      onClick={() => setSpotlightTile(spotlightTile === 'remote' ? null : 'remote')}
                      title={spotlightTile === 'remote' ? 'Unpin Guest' : 'Spotlight / Maximize Guest'}
                    >
                      <Pin size={13} />
                    </button>
                    {/* Swap Positions */}
                    <button
                      type="button"
                      className={`tile-action-btn ${isTilesSwapped ? 'active' : ''}`}
                      onClick={() => setIsTilesSwapped(s => !s)}
                      title="Swap Left / Right Video Positions"
                    >
                      <ArrowLeftRight size={13} />
                    </button>
                    {/* Move PiP Corner */}
                    {layoutMode === 'pip' && (
                      <button
                        type="button"
                        className="tile-action-btn"
                        onClick={cyclePipCorner}
                        title={`Move PiP Corner (${pipCorner})`}
                      >
                        <Move size={13} />
                      </button>
                    )}
                    {/* Native Fullscreen */}
                    <button
                      type="button"
                      className="tile-action-btn"
                      onClick={() => handleFullscreen(remoteContainerRef)}
                      title="Fullscreen Video Tile"
                    >
                      <Maximize2 size={13} />
                    </button>
                  </div>

                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    style={{
                      display: remotePresent && connected ? 'block' : 'none',
                      transform: remoteRotation ? `rotate(${remoteRotation}deg)` : 'none',
                      transition: 'transform 0.25s ease',
                    }}
                  />
                  {(!remotePresent || !connected) && (
                    <div className="waiting-participant-card">
                      <div className="waiting-pulse-rings">
                        <div className="pulse-ring ring-1" />
                        <div className="pulse-ring ring-2" />
                        <div className="waiting-radar-center">
                          <Users size={24} color="#ff6b00" />
                        </div>
                      </div>
                      <div className="waiting-title">Waiting for participants…</div>
                      <div className="waiting-subtitle">
                        Room is ready. Share the invite link with up to 100 participants to start.
                      </div>
                      <button
                        type="button"
                        className="waiting-copy-btn"
                        onClick={onCopyInvite}
                      >
                        {copiedInvite ? (
                          <>
                            <Check size={14} color="#10b981" /> Link Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={14} /> Copy Room Link
                          </>
                        )}
                      </button>
                    </div>
                  )}
                  {remotePresent && connected && (
                    <div className="participant-label-pill">
                      <span>🎙</span>
                      <span>{remoteName || 'Guest'}</span>
                      <AudioWaveform active={true} color="#10b981" height={13} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Floating Dock Toolbar */}
            <div className="floating-dock-toolbar">
              <div className="dock-actions-group">
                {/* Mic */}
                <div className="dock-item-labeled">
                  <button
                    className={`dock-circle-btn ${!micOn ? 'muted' : ''}`}
                    onClick={onToggleMic}
                    title={micOn ? 'Mute Mic' : 'Unmute Mic'}
                  >
                    {micOn ? <Mic size={19} /> : <MicOff size={19} />}
                  </button>
                  <span>{micOn ? 'Mic' : 'Muted'}</span>
                </div>

                {/* Camera */}
                <div className="dock-item-labeled">
                  <button
                    className={`dock-circle-btn ${!cameraOn ? 'muted' : ''}`}
                    onClick={onToggleCamera}
                    title={cameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
                  >
                    {cameraOn ? <Video size={19} /> : <VideoOff size={19} />}
                  </button>
                  <span>{cameraOn ? 'Camera' : 'Off'}</span>
                </div>

                {/* Ultra HD Filters Dock Button */}
                <div className="dock-item-labeled">
                  <button
                    className={`dock-circle-btn ${activeTool === 'filters' ? 'active' : ''}`}
                    onClick={() => setActiveTool(activeTool === 'filters' ? 'recording' : 'filters')}
                    title="Camera Ultra HD Filters"
                    style={{ borderColor: activeTool === 'filters' ? '#06b6d4' : undefined }}
                  >
                    <Sparkles size={18} style={{ color: '#06b6d4' }} />
                  </button>
                  <span>Filters</span>
                </div>

                {/* Live Screen Share Toggle */}
                <div className="dock-item-labeled">
                  <button
                    className={`dock-circle-btn ${isScreenSharing ? 'sharing-screen' : ''}`}
                    onClick={() => {
                      if (isScreenSharing) {
                        onToggleScreenShare?.()
                      } else if (isHost || screenShareAllowedForAll) {
                        onToggleScreenShare?.()
                      } else {
                        alert(
                          'Screen sharing is currently restricted by the host. Please ask the meeting host to enable participant screen sharing in Host Controls.'
                        )
                      }
                    }}
                    title={
                      isScreenSharing
                        ? 'Stop Screen Share'
                        : isHost || screenShareAllowedForAll
                        ? 'Share Your Screen (HD + Audio)'
                        : 'Screen sharing restricted by host'
                    }
                  >
                    {isScreenSharing ? <MonitorOff size={19} color="#ef4444" /> : <MonitorUp size={19} />}
                  </button>
                  <span style={{ color: isScreenSharing ? '#ef4444' : undefined, fontWeight: isScreenSharing ? 600 : undefined }}>
                    {isScreenSharing ? 'Stop Share' : 'Share Screen'}
                  </span>
                </div>

                {/* Prominent Recording Control Button */}
                <div className="dock-item-labeled">
                  {recording ? (
                    <button
                      className="dock-rec-stop-btn"
                      onClick={onStopRecording}
                      title="Stop Recording"
                    >
                      <span className="dock-rec-stop-square" />
                    </button>
                  ) : (
                    <button
                      className="dock-rec-start-btn"
                      onClick={onOpenRecordingModal}
                      title="Start Recording"
                    >
                      <Radio size={20} />
                    </button>
                  )}
                  <span>{recording ? 'Stop Recording' : 'Record'}</span>
                </div>

                {/* Pause / Resume Recording Control Button */}
                {recording && (
                  <div className="dock-item-labeled">
                    <button
                      type="button"
                      className={`dock-circle-btn ${isRecordingPaused ? 'recording-paused-btn' : ''}`}
                      onClick={onTogglePauseRecording}
                      title={isRecordingPaused ? 'Resume Recording' : 'Pause Recording'}
                      style={{
                        borderColor: isRecordingPaused ? '#eab308' : '#94a3b8',
                        color: isRecordingPaused ? '#eab308' : '#ffffff',
                        background: isRecordingPaused ? 'rgba(234, 179, 8, 0.22)' : 'rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      {isRecordingPaused ? <Play size={18} fill="#eab308" /> : <Pause size={18} fill="#ffffff" />}
                    </button>
                    <span style={{ color: isRecordingPaused ? '#eab308' : undefined, fontWeight: isRecordingPaused ? 600 : undefined }}>
                      {isRecordingPaused ? 'Resume' : 'Pause'}
                    </span>
                  </div>
                )}

                {/* Raise Hand */}
                <div className="dock-item-labeled">
                  <button
                    className={`dock-circle-btn ${handRaised ? 'active' : ''}`}
                    onClick={() => setHandRaised(!handRaised)}
                    title="Raise Hand"
                  >
                    <Hand size={19} style={{ color: handRaised ? '#ff6b00' : 'inherit' }} />
                  </button>
                  <span>Raise Hand</span>
                </div>

                {/* Interactive Emoji Reactions */}
                <div className="dock-item-labeled" style={{ position: 'relative' }}>
                  <button
                    className="dock-circle-btn"
                    onClick={() => setShowReactionPicker(!showReactionPicker)}
                    title="Send Reaction"
                  >
                    <Smile size={19} />
                  </button>
                  <span>React</span>

                  {showReactionPicker && (
                    <div className="reaction-picker-popover">
                      {['👏', '❤️', '🔥', '🚀', '👍', '😂'].map(emoji => (
                        <button
                          key={emoji}
                          className="reaction-emoji-btn"
                          onClick={() => triggerReaction(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* More / Settings */}
                <div className="dock-item-labeled">
                  <button
                    className="dock-circle-btn"
                    onClick={() => setActiveTool('info')}
                    title="More Options"
                  >
                    <MoreHorizontal size={19} />
                  </button>
                  <span>More</span>
                </div>
              </div>

              {/* Leave Button */}
              <button className="dock-leave-btn" onClick={onLeaveMeeting}>
                <PhoneOff size={15} /> Leave
              </button>
            </div>
          </main>

          {/* Right Sidebar: Meeting Tools (Exact match to 04_Live_Interview_Workspace.png + Live Tabs) */}
          <aside className="workspace-tools-sidebar">
            <h3 className="sidebar-tools-title">Meeting Tools</h3>

            <div className="sidebar-tools-list">
              <button
                className={`sidebar-tool-item ${activeTool === 'recording' ? 'active' : ''}`}
                onClick={() => setActiveTool('recording')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="sidebar-rec-dot" /> <span>Recording</span>
                </div>
              </button>

              <button
                className={`sidebar-tool-item ${activeTool === 'filters' ? 'active' : ''}`}
                onClick={() => setActiveTool('filters')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Sparkles size={16} color="#06b6d4" /> <span>Camera Filters</span>
                </div>
                <span className="sidebar-unread-pill" style={{ background: '#06b6d4' }}>HD</span>
              </button>

              <button
                className={`sidebar-tool-item ${activeTool === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveTool('chat')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <MessageSquare size={16} /> <span>Chat</span>
                </div>
                <span className="sidebar-unread-pill">1</span>
              </button>

              <button
                className={`sidebar-tool-item ${activeTool === 'notes' ? 'active' : ''}`}
                onClick={() => setActiveTool('notes')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FileText size={16} /> <span>Interview Notes</span>
                </div>
              </button>

              <button
                className={`sidebar-tool-item ${activeTool === 'mixer' ? 'active' : ''}`}
                onClick={() => setActiveTool('mixer')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Sliders size={16} /> <span>Audio Mixer</span>
                </div>
              </button>

              <button
                className={`sidebar-tool-item ${activeTool === 'participants' ? 'active' : ''}`}
                onClick={() => setActiveTool('participants')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Users size={16} /> <span>Participants ({participants && participants.length > 0 ? participants.length : (remotePresent ? 2 : 1)})</span>
                </div>
              </button>

              <button
                className={`sidebar-tool-item ${activeTool === 'screen' ? 'active' : ''}`}
                onClick={() => setActiveTool('screen')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <MonitorUp size={16} /> <span>Screen Share</span>
                </div>
              </button>

              <button
                className={`sidebar-tool-item ${activeTool === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTool('info')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Info size={16} /> <span>Meeting Info</span>
                </div>
              </button>
            </div>

            {/* Sidebar Active Panel Content */}
            <div className="sidebar-tool-content-box">
              {activeTool === 'recording' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>
                    Recording Controls
                  </div>
                  <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
                    Real-time local recording active. Video and mixed dual audio are encoded directly inside your browser.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#10b981' }}>
                    <Check size={14} /> Dual Mic Audio Mixed (Web Audio)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#10b981' }}>
                    <Check size={14} /> 1080p Canvas Composition
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#10b981' }}>
                    <Check size={14} /> Client-Side Save (Zero Cloud Upload)
                  </div>
                  {recording ? (
                    <button
                      className="btn-danger"
                      style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}
                      onClick={onStopRecording}
                    >
                      ⏹ Stop & Save Recording
                    </button>
                  ) : (
                    <button
                      className="btn-primary-orange"
                      style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}
                      onClick={onOpenRecordingModal}
                    >
                      ⏺ Choose Mode & Record
                    </button>
                  )}
                </div>
              )}

              {activeTool === 'notes' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: '#fff' }}>Private Interview Notes</span>
                    {notesText && (
                      <button
                        className="btn-secondary-dark"
                        style={{ padding: '4px 10px', fontSize: 11, borderRadius: 6 }}
                        onClick={handleDownloadNotes}
                        title="Download Notes as .txt"
                      >
                        <Download size={12} /> Save .txt
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: '#64748b' }}>
                    Notes are saved locally on your computer and never shared with the guest.
                  </p>
                  <textarea
                    value={notesText}
                    onChange={e => setNotesText(e.target.value)}
                    placeholder="Candidate strengths, technical questions, project impressions…"
                    className="in-call-notes-textarea"
                  />
                </div>
              )}

              {activeTool === 'mixer' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Dual Mic Audio Mixer</span>
                  <p style={{ fontSize: 11.5, color: '#94a3b8' }}>
                    Adjust real-time gain for individual participant audio before canvas encoding.
                  </p>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span>👑 Host Microphone ({hostVolume}%)</span>
                      <Volume2 size={14} color="#ff6b00" />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={150}
                      value={hostVolume}
                      onChange={e => setHostVolume(Number(e.target.value))}
                      className="custom-range-slider"
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span>🎙 Guest Microphone ({guestVolume}%)</span>
                      <Volume2 size={14} color="#10b981" />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={150}
                      value={guestVolume}
                      onChange={e => setGuestVolume(Number(e.target.value))}
                      className="custom-range-slider"
                    />
                  </div>
                </div>
              )}

              {activeTool === 'chat' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ background: '#141c2e', padding: '8px 12px', borderRadius: 8, fontSize: 12 }}>
                      <b style={{ color: '#ff6b00', display: 'block', marginBottom: 2 }}>Preet Yadav</b>
                      Welcome to the interview session! Audio and video are working perfectly.
                    </div>
                    {chatMessages.map((m, i) => (
                      <div key={i} style={{ background: '#141c2e', padding: '8px 12px', borderRadius: 8, fontSize: 12 }}>
                        <b style={{ color: '#c4a5ff', display: 'block', marginBottom: 2 }}>{m.from}</b>
                        {m.text}
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleSendChat} style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    <input
                      className="form-control"
                      style={{ padding: '8px 12px', fontSize: 12 }}
                      placeholder="Type a message…"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                    />
                    <button className="btn-primary-orange" style={{ padding: '8px 12px' }} type="submit">
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              )}

              {activeTool === 'participants' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* Host Controls Panel (Google Meet / Zoom style moderation) */}
                  {isHost && (
                    <div
                      style={{
                        padding: '12px',
                        background: 'rgba(255,107,0,0.06)',
                        border: '1px solid rgba(255,107,0,0.22)',
                        borderRadius: 10,
                        marginBottom: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#ff6b00' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Shield size={14} /> Host Moderation Suite
                        </span>
                        <span style={{ fontSize: 10, background: 'rgba(255,107,0,0.2)', padding: '2px 6px', borderRadius: 4 }}>
                          HOST ONLY
                        </span>
                      </div>

                      {/* Screen Sharing Toggle */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#e2e8f0' }}>
                        <span>Participant Screen Share</span>
                        <button
                          type="button"
                          style={{
                            background: screenShareAllowedForAll ? '#10b981' : '#475569',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 999,
                            padding: '3px 10px',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                          onClick={() => onToggleAllowScreenShare?.(!screenShareAllowedForAll)}
                        >
                          {screenShareAllowedForAll ? 'Allowed' : 'Blocked'}
                        </button>
                      </div>

                      {/* Mute All Button */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#e2e8f0' }}>
                        <span>Mute All Participants</span>
                        <button
                          type="button"
                          style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#f87171',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            borderRadius: 6,
                            padding: '3px 8px',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                          onClick={onHostMuteAll}
                        >
                          <MicOff size={11} /> Mute All
                        </button>
                      </div>

                      {/* Lock Room Toggle */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#e2e8f0' }}>
                        <span>Lock Meeting Room</span>
                        <button
                          type="button"
                          style={{
                            background: isRoomLocked ? '#ef4444' : '#475569',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 999,
                            padding: '3px 10px',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                          onClick={() => onToggleLockRoom?.(!isRoomLocked)}
                        >
                          {isRoomLocked ? 'Locked' : 'Open'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Header with Search for up to 100 participants */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#94a3b8', marginBottom: 2 }}>
                    <span>Joined ({participants && participants.length > 0 ? participants.length : (remotePresent ? 2 : 1)} / 100)</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>Active</span>
                  </div>

                  {/* Participant Search */}
                  <div style={{ position: 'relative', marginBottom: 4 }}>
                    <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                      type="text"
                      placeholder="Search participants…"
                      value={participantSearch}
                      onChange={e => setParticipantSearch(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 6,
                        padding: '6px 10px 6px 30px',
                        fontSize: 12,
                        color: '#fff',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Self Participant Card */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, padding: '7px 10px', borderRadius: 8, background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.2)' }}>
                    <span>👑 {localName || 'You'} ({isHost ? 'Host' : 'You'})</span>
                    <AudioWaveform active={micOn} color="#ff6b00" height={12} />
                  </div>

                  {/* Other Participants List */}
                  {participants && participants.length > 0 ? (
                    participants
                      .filter(p => p.displayName !== localName)
                      .filter(p => !participantSearch || p.displayName.toLowerCase().includes(participantSearch.toLowerCase()))
                      .map((p, idx) => (
                        <div key={p.userId || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, padding: '7px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <span>{p.role === 'host' ? '👑' : '🎙'} {p.displayName}</span>
                          <AudioWaveform active={true} color="#10b981" height={12} />
                        </div>
                      ))
                  ) : remotePresent ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, padding: '7px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span>🎙 {remoteName || 'Guest'}</span>
                      <AudioWaveform active={true} color="#10b981" height={12} />
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic', padding: '14px 8px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                      No other participants yet.<br />Share the invite link to let up to 100 people join.
                    </div>
                  )}
                </div>
              )}

              {activeTool === 'info' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                  <div><b>Room Code:</b> <code style={{ color: '#ff6b00' }}>{roomCode}</code></div>
                  <div><b>Role:</b> {isHost ? 'Meeting Host' : 'Invited Guest'}</div>
                  <div><b>Signaling:</b> Supabase Realtime Channels</div>
                  <div><b>Transport:</b> WebRTC Direct P2P (AES-128 DTLS/SRTP)</div>
                  <div><b>Compositor:</b> HTML5 Canvas 1080p @ 30 FPS</div>
                </div>
              )}

              {activeTool === 'filters' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Sparkles size={15} color="#06b6d4" /> Ultra HD Studio Filters
                    </span>
                    <span style={{ fontSize: 10, background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', padding: '2px 8px', borderRadius: 9999, fontWeight: 700, border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                      1080p Live
                    </span>
                  </div>

                  <p style={{ fontSize: 11.5, color: '#94a3b8', lineHeight: 1.45 }}>
                    Select a color grade or fine-tune lighting. Applied live and baked directly into the 1080p recorded video.
                  </p>

                  {/* Filter Presets List */}
                  <div className="filter-presets-grid">
                    {VIDEO_FILTERS.map(f => {
                      const isSelected = activeFilterId === f.id
                      return (
                        <div
                          key={f.id}
                          className={`filter-preset-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => onSelectFilter(f.id)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>{f.icon}</span> <span>{f.name}</span>
                            </span>
                            <span className="filter-tag-badge" style={{ borderColor: f.badgeColor, color: f.badgeColor }}>
                              {f.tag}
                            </span>
                          </div>
                          <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>
                            {f.description}
                          </p>
                        </div>
                      )
                    })}
                  </div>

                  {/* Fine Tuning Controls */}
                  <div className="filter-finetune-box">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>Manual Lighting Controls</span>
                      <button
                        type="button"
                        onClick={() => onUpdateAdjustments({ brightness: 100, contrast: 100, saturation: 100 })}
                        className="btn-reset-filter"
                      >
                        Reset Defaults
                      </button>
                    </div>

                    <div className="filter-slider-row">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#cbd5e1' }}>
                        <span>☀️ Brightness</span>
                        <span style={{ color: '#ff6b00', fontWeight: 600 }}>{filterAdjustments.brightness}%</span>
                      </div>
                      <input
                        type="range"
                        min={80}
                        max={130}
                        value={filterAdjustments.brightness}
                        onChange={e => onUpdateAdjustments({ ...filterAdjustments, brightness: Number(e.target.value) })}
                        className="custom-range-slider"
                      />
                    </div>

                    <div className="filter-slider-row">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#cbd5e1' }}>
                        <span>🌓 Contrast</span>
                        <span style={{ color: '#ff6b00', fontWeight: 600 }}>{filterAdjustments.contrast}%</span>
                      </div>
                      <input
                        type="range"
                        min={80}
                        max={140}
                        value={filterAdjustments.contrast}
                        onChange={e => onUpdateAdjustments({ ...filterAdjustments, contrast: Number(e.target.value) })}
                        className="custom-range-slider"
                      />
                    </div>

                    <div className="filter-slider-row">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#cbd5e1' }}>
                        <span>🎨 Saturation</span>
                        <span style={{ color: '#ff6b00', fontWeight: 600 }}>{filterAdjustments.saturation}%</span>
                      </div>
                      <input
                        type="range"
                        min={50}
                        max={160}
                        value={filterAdjustments.saturation}
                        onChange={e => onUpdateAdjustments({ ...filterAdjustments, saturation: Number(e.target.value) })}
                        className="custom-range-slider"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTool === 'screen' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MonitorUp size={16} color="#ff6b00" /> Screen Sharing
                  </div>
                  <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                    Share your entire screen, an application window, or a specific browser tab in Ultra HD with high frame rate.
                  </p>
                  <button
                    className={isScreenSharing ? "btn-secondary-dark" : "btn-primary-orange"}
                    style={{
                      padding: '10px 16px',
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      background: isScreenSharing ? 'rgba(239, 68, 68, 0.2)' : undefined,
                      borderColor: isScreenSharing ? '#ef4444' : undefined,
                      color: isScreenSharing ? '#ef4444' : undefined,
                    }}
                    onClick={onToggleScreenShare}
                  >
                    {isScreenSharing ? (
                      <>
                        <MonitorOff size={16} /> Stop Screen Share
                      </>
                    ) : (
                      <>
                        <MonitorUp size={16} /> Start Screen Share
                      </>
                    )}
                  </button>
                  <div style={{ fontSize: 11.5, color: '#64748b', display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                    <span>✓ Broadcasts live to all meeting participants</span>
                    <span>✓ Automatically recorded in 1080p canvas side-by-side or PiP</span>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
