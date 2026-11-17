import { useState, useRef, useEffect } from 'react'
import Header from './components/Header'
import LandingPage from './components/LandingPage'
import CreateRoomModal from './components/CreateRoomModal'
import JoinRoomModal from './components/JoinRoomModal'
import LiveWorkspace from './components/LiveWorkspace'
import RecordingModeModal, { type RecordingMode } from './components/RecordingModeModal'
import RecordingPreviewModal from './components/RecordingPreviewModal'
import DashboardView, { type RecordingItem } from './components/DashboardView'

import { supabase, hasSupabaseConfig } from './lib/supabase'
import {
  connectRoom,
  createRoomCode,
  createRoomMembership,
  ensureAnonymousSession,
  joinRoomMembership,
  leaveRoomMembership,
  sendSignal,
  cleanRoomCode,
  isValidRoomCode,
  type RoomMember,
  type SignalMessage,
} from './lib/room'
import { createPeerConnection } from './lib/webrtc'
import { InterviewRecorder, saveRecording, type RecorderResult } from './lib/recorder'
import { VIDEO_FILTERS, computeFilterCss, type FilterAdjustments } from './lib/filters'

export default function App() {
  const initialInvite = cleanRoomCode(new URLSearchParams(window.location.search).get('room') || '')

  // View & Modal State
  const [view, setView] = useState<'landing' | 'dashboard' | 'meeting'>('landing')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(Boolean(initialInvite))
  const [isRecordingModeModalOpen, setIsRecordingModeModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)

  // Ultra HD Camera & Filter Studio State
  const [activeFilterId, setActiveFilterId] = useState<string>('studio-warm')
  const [filterAdjustments, setFilterAdjustments] = useState<FilterAdjustments>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
  })

  const activeFilterCss = computeFilterCss(activeFilterId, filterAdjustments)

  // Meeting & Identity State
  const [meetingTitle, setMeetingTitle] = useState('Frontend Developer Interview')
  const [name, setName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [role, setRole] = useState<'host' | 'guest'>('host')
  const [micOn, setMicOn] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
  const [remotePresent, setRemotePresent] = useState(false)
  const [connected, setConnected] = useState(false)
  const [remoteName, setRemoteName] = useState('Participant')
  const [audioPlaybackBlocked, setAudioPlaybackBlocked] = useState(false)
  const [copiedInvite, setCopiedInvite] = useState(false)

  // Consent & Recording State
  const [hostConsented, setHostConsented] = useState(true)
  const [guestConsented, setGuestConsented] = useState(true)
  const [guestDeclined, setGuestDeclined] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [result, setResult] = useState<RecorderResult | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [saveStatus, setSaveStatus] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [participants, setParticipants] = useState<RoomMember[]>([])
  const screenVideoRef = useRef<HTMLVideoElement | null>(null)

  // In-Meeting Chat
  const [chatMessages, setChatMessages] = useState<{ from: string; text: string; time: string }[]>([])

  // Media & WebRTC Refs
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const channelRef = useRef<Awaited<ReturnType<typeof connectRoom>> | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const userIdRef = useRef('')
  const hostIdRef = useRef('')
  const remoteUserIdRef = useRef('')
  const roleRef = useRef<'host' | 'guest'>('host')
  const candidateQueue = useRef<RTCIceCandidateInit[]>([])
  const recorderRef = useRef(new InterviewRecorder())
  const timerRef = useRef<number | null>(null)
  const offerInProgressRef = useRef(false)
  const membershipRef = useRef(false)
  const recordingRef = useRef(false)
  const handleSignalRef = useRef<(message: SignalMessage) => void>(() => undefined)

  const cameraOnRef = useRef(true)
  cameraOnRef.current = cameraOn

  // Manage video stream element assignment when entering meeting
  useEffect(() => {
    if (view === 'meeting') {
      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current
      }
      if (remoteVideoRef.current && remoteStreamRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current
        void remoteVideoRef.current.play().catch(() => setAudioPlaybackBlocked(true))
      }
    }
  }, [view])

  // Recording Timer
  useEffect(() => {
    if (!recording) return
    timerRef.current = window.setInterval(() => setRecordingSeconds(v => v + 1), 1000)
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [recording])

  // Preview Object URL Lifecycle
  useEffect(() => {
    if (!result) {
      setPreviewUrl('')
      return
    }
    const url = URL.createObjectURL(result.blob)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [result])

  // Prevent accidental page close while recording
  useEffect(() => {
    if (!recording) return
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [recording])

  // Component cleanup
  useEffect(() => {
    return () => {
      localStreamRef.current?.getTracks().forEach(t => t.stop())
      remoteStreamRef.current?.getTracks().forEach(t => t.stop())
      screenStreamRef.current?.getTracks().forEach(t => t.stop())
      pcRef.current?.close()
      if (channelRef.current && supabase) {
        void supabase.removeChannel(channelRef.current)
      }
    }
  }, [])

  async function prepareMedia(withCamera: boolean, withMic: boolean) {
    if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext) {
      throw new Error('Camera and microphone require a secure HTTPS website or localhost.')
    }

    let stream: MediaStream
    try {
      // 1. Attempt Ultra HD camera constraints (1080p up to 4K @ 30-60fps with studio audio)
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920, max: 3840, min: 1280 },
          height: { ideal: 1080, max: 2160, min: 720 },
          frameRate: { ideal: 30, max: 60 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 2,
        },
      })
    } catch (err) {
      console.warn('[Camera] Ultra HD constraints fallback to standard HD:', err)
      // 2. Graceful fallback for older webcams
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
    }

    // Apply initial toggle preferences
    stream.getVideoTracks().forEach(t => {
      t.enabled = withCamera
    })
    stream.getAudioTracks().forEach(t => {
      t.enabled = withMic
    })

    localStreamRef.current = stream
    setCameraOn(withCamera)
    setMicOn(withMic)
    return stream
  }

  function resetPeer() {
    if (pcRef.current) {
      try {
        pcRef.current.close()
      } catch {
        /* ignore */
      }
      pcRef.current = null
    }
    candidateQueue.current = []
    setConnected(false)
  }

  function ensurePeer(): RTCPeerConnection {
    if (pcRef.current && pcRef.current.signalingState !== 'closed') {
      return pcRef.current
    }

    resetPeer()

    const pc = createPeerConnection(
      candidate => {
        const target = roleRef.current === 'host' ? remoteUserIdRef.current || undefined : hostIdRef.current || undefined
        if (channelRef.current) {
          void sendSignal(channelRef.current, {
            from: userIdRef.current,
            to: target,
            kind: 'ice',
            data: candidate.toJSON(),
          }).catch(() => undefined)
        }
      },
      event => {
        let stream = event.streams[0]
        if (!stream) {
          stream = remoteStreamRef.current || new MediaStream()
          if (!stream.getTracks().some(t => t.id === event.track.id)) {
            stream.addTrack(event.track)
          }
        }
        remoteStreamRef.current = stream
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream
          void remoteVideoRef.current.play().catch(() => setAudioPlaybackBlocked(true))
        }
      },
      state => {
        setConnected(state === 'connected')
      },
    )

    if (localStreamRef.current) {
      for (const track of localStreamRef.current.getTracks()) {
        pc.addTrack(track, localStreamRef.current)
      }
    }

    pcRef.current = pc
    return pc
  }

  async function createOffer(guestId: string) {
    if (!channelRef.current || roleRef.current !== 'host' || offerInProgressRef.current) return
    offerInProgressRef.current = true

    try {
      if (pcRef.current?.signalingState && pcRef.current.signalingState !== 'stable') {
        resetPeer()
      }

      const pc = ensurePeer()
      const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
      await pc.setLocalDescription(offer)

      await sendSignal(channelRef.current, {
        from: userIdRef.current,
        to: guestId,
        kind: 'offer',
        data: offer,
        purpose: meetingTitle,
      })
    } catch (err) {
      console.warn('[WebRTC] Create offer failed:', err)
    } finally {
      offerInProgressRef.current = false
    }
  }

  async function handleSignal(message: SignalMessage) {
    try {
      if (message.kind === 'offer' && roleRef.current === 'guest') {
        hostIdRef.current = message.from
      }

      const expectedRemoteId = roleRef.current === 'host' ? remoteUserIdRef.current : hostIdRef.current
      if (expectedRemoteId && message.from !== expectedRemoteId) return

      if (message.kind === 'recording-start') {
        setRecording(true)
        return
      }

      if (message.kind === 'recording-stop') {
        setRecording(false)
        return
      }

      if (message.kind === 'recording-consent' && roleRef.current === 'host') {
        setGuestConsented(true)
        setGuestDeclined(false)
        return
      }

      if (message.kind === 'recording-decline' && roleRef.current === 'host') {
        setGuestConsented(false)
        setGuestDeclined(true)
        return
      }

      if (message.kind === 'leave') {
        setRemotePresent(false)
        setConnected(false)
        resetPeer()
        remoteStreamRef.current?.getTracks().forEach(t => t.stop())
        remoteStreamRef.current = null
        return
      }

      if (message.kind === 'offer' && message.data && roleRef.current === 'guest') {
        hostIdRef.current = message.from
        if (message.purpose) setMeetingTitle(message.purpose)

        if (pcRef.current && pcRef.current.signalingState !== 'stable') {
          resetPeer()
        }

        const pc = ensurePeer()
        await pc.setRemoteDescription(message.data as RTCSessionDescriptionInit)

        const queued = candidateQueue.current.splice(0)
        for (const candidate of queued) {
          await pc.addIceCandidate(candidate).catch(() => undefined)
        }

        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        if (channelRef.current) {
          await sendSignal(channelRef.current, {
            from: userIdRef.current,
            to: message.from,
            kind: 'answer',
            data: answer,
          })
        }
      } else if (message.kind === 'answer' && message.data && roleRef.current === 'host' && pcRef.current) {
        if (pcRef.current.signalingState === 'have-local-offer') {
          await pcRef.current.setRemoteDescription(message.data as RTCSessionDescriptionInit)
          const queued = candidateQueue.current.splice(0)
          for (const candidate of queued) {
            await pcRef.current.addIceCandidate(candidate).catch(() => undefined)
          }
        }
      } else if (message.kind === 'ice' && message.data) {
        const candidate = message.data as RTCIceCandidateInit
        if (pcRef.current?.remoteDescription?.type) {
          await pcRef.current.addIceCandidate(candidate).catch(() => undefined)
        } else {
          candidateQueue.current.push(candidate)
        }
      }
    } catch (err) {
      console.warn('[WebRTC] Signal dispatch error:', err)
    }
  }
  handleSignalRef.current = msg => void handleSignal(msg)

  async function handleStartRoomAsHost(
    title: string,
    displayName: string,
    startCamera: boolean,
    startMic: boolean,
  ) {
    setIsConnecting(true)
    setMeetingTitle(title)
    setName(displayName)
    setRole('host')
    roleRef.current = 'host'

    try {
      const code = createRoomCode()
      setRoomCode(code)
      window.history.pushState({}, '', '?room=' + code)

      const userId = await ensureAnonymousSession()
      userIdRef.current = userId
      hostIdRef.current = userId

      await createRoomMembership(code, displayName)
      membershipRef.current = true

      await prepareMedia(startCamera, startMic)

      const member: RoomMember = { userId, role: 'host', displayName }
      setParticipants([member])
      const channel = await connectRoom(code, member, {
        onChannel: ch => {
          channelRef.current = ch
        },
        onSignal: msg => handleSignalRef.current(msg),
        onMembers: members => {
          setParticipants(members)
          const others = members.filter(m => m.userId !== userId)
          const guest = others.find(m => m.role === 'guest' || m.role === 'participant')
          remoteUserIdRef.current = others[0]?.userId || ''
          setRemotePresent(others.length > 0)
          setRemoteName(others[0]?.displayName || (others.length > 1 ? `${others[0]?.displayName} +${others.length - 1}` : 'Guest'))

          if (guest) void createOffer(guest.userId)

          if (others.length === 0) {
            remoteUserIdRef.current = ''
            setConnected(false)
            resetPeer()
            remoteStreamRef.current?.getTracks().forEach(t => t.stop())
            remoteStreamRef.current = null
          }
        },
      })

      channelRef.current = channel
      setIsCreateModalOpen(false)
      setView('meeting')

      // Check for guest already joined
      const presenceMembers = Object.values(channel.presenceState() as Record<string, RoomMember[]>).flat()
      const guest = presenceMembers.find(m => m.userId !== userId && m.role === 'guest')
      if (guest) void createOffer(guest.userId)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not initialize interview room.')
    } finally {
      setIsConnecting(false)
    }
  }

  async function handleJoinRoomAsGuest(
    code: string,
    displayName: string,
    startCamera: boolean,
    startMic: boolean,
  ) {
    setIsConnecting(true)
    setRoomCode(code)
    setName(displayName)
    setRole('guest')
    roleRef.current = 'guest'

    try {
      const userId = await ensureAnonymousSession()
      userIdRef.current = userId

      await joinRoomMembership(code, displayName)
      membershipRef.current = true

      await prepareMedia(startCamera, startMic)

      const member: RoomMember = { userId, role: 'guest', displayName }
      setParticipants([member])
      const channel = await connectRoom(code, member, {
        onChannel: ch => {
          channelRef.current = ch
        },
        onSignal: msg => handleSignalRef.current(msg),
        onMembers: members => {
          setParticipants(members)
          const others = members.filter(m => m.userId !== userId)
          const host = others.find(m => m.role === 'host')
          remoteUserIdRef.current = others[0]?.userId || ''
          setRemotePresent(others.length > 0)
          setRemoteName(others[0]?.displayName || (others.length > 1 ? `${others[0]?.displayName} +${others.length - 1}` : 'Interviewer'))
          if (host) hostIdRef.current = host.userId
        },
      })

      channelRef.current = channel
      setIsJoinModalOpen(false)
      window.history.pushState({}, '', '?room=' + code)
      setView('meeting')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not join interview room.')
    } finally {
      setIsConnecting(false)
    }
  }

  async function handleConfirmRecordingMode(mode: RecordingMode) {
    setIsRecordingModeModalOpen(false)

    let screenStream: MediaStream | null = null
    try {
      if (mode === 'screen_pip' || mode === 'screen_only') {
        if (!navigator.mediaDevices?.getDisplayMedia) {
          alert('Screen capture is not supported in this browser.')
          return
        }
        screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: { ideal: 30, max: 30 } },
          audio: true,
        })
        screenStreamRef.current = screenStream
      }

      await recorderRef.current.start(
        localStreamRef.current!,
        remoteStreamRef.current || new MediaStream(),
        localVideoRef.current!,
        remoteVideoRef.current || document.createElement('video'),
        screenStream,
        name || 'Interviewer',
        remoteName || 'Interviewee',
        () => cameraOnRef.current,
        () => true,
        activeFilterCss,
      )

      recordingRef.current = true
      setRecordingSeconds(0)
      setRecording(true)

      if (channelRef.current) {
        void sendSignal(channelRef.current, {
          from: userIdRef.current,
          kind: 'recording-start',
        }).catch(() => undefined)
      }
    } catch (err) {
      screenStream?.getTracks().forEach(t => t.stop())
      screenStreamRef.current = null
      console.warn('[Recorder] Failed to start:', err)
      alert(err instanceof Error ? err.message : 'Could not start recording.')
    }
  }

  async function handleStopRecording() {
    try {
      const saved = await recorderRef.current.stop()
      recordingRef.current = false
      setRecording(false)
      setResult(saved)
      setIsPreviewModalOpen(true)

      // Add to local storage for Dashboard view
      try {
        const item: RecordingItem = {
          id: `rec-${Date.now()}`,
          title: meetingTitle || 'Interview Session',
          dateTime: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }) + ' • ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          duration: `${Math.floor(saved.durationMs / 60000)}:${Math.floor((saved.durationMs % 60000) / 1000).toString().padStart(2, '0')}`,
          size: `${(saved.sizeBytes / (1024 * 1024)).toFixed(1)} MB`,
        }
        const existing = JSON.parse(localStorage.getItem('interviewcapture_saved_recordings') || '[]')
        localStorage.setItem('interviewcapture_saved_recordings', JSON.stringify([item, ...existing]))
      } catch {
        /* ignore */
      }

      if (channelRef.current && roleRef.current === 'host') {
        void sendSignal(channelRef.current, {
          from: userIdRef.current,
          kind: 'recording-stop',
        }).catch(() => undefined)
      }
    } catch (err) {
      recordingRef.current = false
      setRecording(false)
      alert(err instanceof Error ? err.message : 'Could not stop recording cleanly.')
    }
  }

  async function handleSaveRecording() {
    if (!result) return
    setIsSaving(true)
    setSaveStatus('')
    try {
      const outcome = await saveRecording(result.blob, result.filename)
      if (outcome === 'cancelled') {
        setSaveStatus('Save cancelled. Your recording is still safely held in memory.')
      } else {
        setSaveStatus(
          outcome === 'saved'
            ? 'File successfully saved to your selected folder!'
            : 'Download started! Check your downloads directory.',
        )
      }
    } catch (err) {
      setSaveStatus(err instanceof Error ? err.message : 'Failed to save recording.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleLeaveMeeting() {
    if (recordingRef.current) {
      alert('Please stop the active recording before leaving the room.')
      return
    }

    if (channelRef.current && userIdRef.current) {
      try {
        await sendSignal(channelRef.current, { from: userIdRef.current, kind: 'leave' })
      } catch {
        /* ignore */
      }
    }

    if (channelRef.current && supabase) {
      await supabase.removeChannel(channelRef.current)
    }
    channelRef.current = null
    resetPeer()

    localStreamRef.current?.getTracks().forEach(t => t.stop())
    localStreamRef.current = null
    remoteStreamRef.current?.getTracks().forEach(t => t.stop())
    remoteStreamRef.current = null
    screenStreamRef.current?.getTracks().forEach(t => t.stop())
    screenStreamRef.current = null

    if (membershipRef.current && roomCode) {
      try {
        await leaveRoomMembership(roomCode)
      } catch {
        /* ignore */
      }
    }
    membershipRef.current = false

    setConnected(false)
    setRemotePresent(false)
    setRecording(false)
    setIsScreenSharing(false)
    setView('landing')
    window.history.replaceState({}, '', window.location.pathname)
  }

  async function handleToggleScreenShare() {
    if (isScreenSharing) {
      screenStreamRef.current?.getTracks().forEach(t => t.stop())
      screenStreamRef.current = null
      setIsScreenSharing(false)
      if (screenVideoRef.current) screenVideoRef.current.srcObject = null
      return
    }

    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        alert('Screen sharing is not supported in this browser. Please use Chrome, Edge, or Firefox.')
        return
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 30, max: 60 } },
        audio: true,
      })

      screenStreamRef.current = stream
      setIsScreenSharing(true)

      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream
        void screenVideoRef.current.play().catch(() => undefined)
      }

      // Handle browser native "Stop sharing" bar click
      stream.getVideoTracks()[0].onended = () => {
        screenStreamRef.current = null
        setIsScreenSharing(false)
        if (screenVideoRef.current) screenVideoRef.current.srcObject = null
      }
    } catch (err) {
      if (err instanceof DOMException && (err.name === 'AbortError' || err.name === 'NotAllowedError')) {
        return
      }
      alert('Could not start screen sharing: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  const handleCopyInvite = async () => {
    const link = `${window.location.origin}${window.location.pathname}?room=${roomCode}`
    try {
      await navigator.clipboard.writeText(link)
      setCopiedInvite(true)
      setTimeout(() => setCopiedInvite(false), 3000)
    } catch {
      window.prompt('Copy room link:', link)
    }
  }

  const handleSendChat = (text: string) => {
    const newMsg = {
      from: name || (role === 'host' ? 'Interviewer' : 'Participant'),
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setChatMessages(prev => [...prev, newMsg])
  }

  return (
    <div>
      {/* 1. Header (shown on Landing & Dashboard) */}
      {view !== 'meeting' && (
        <Header
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          onOpenJoinModal={() => setIsJoinModalOpen(true)}
          onNavigateHome={() => setView('landing')}
          onNavigateDashboard={() => setView('dashboard')}
          activeTab={view === 'dashboard' ? 'dashboard' : 'home'}
        />
      )}

      {/* 2. Main Page Views */}
      {view === 'landing' && (
        <LandingPage
          onStartInterview={() => setIsCreateModalOpen(true)}
          onJoinInterview={() => setIsJoinModalOpen(true)}
        />
      )}

      {view === 'dashboard' && (
        <DashboardView
          onNewMeeting={() => setIsCreateModalOpen(true)}
          onNavigateHome={() => setView('landing')}
        />
      )}

      {view === 'meeting' && (
        <LiveWorkspace
          meetingTitle={meetingTitle}
          roomCode={roomCode}
          isHost={role === 'host'}
          localName={name}
          remoteName={remoteName}
          remotePresent={remotePresent}
          connected={connected}
          recording={recording}
          recordingSeconds={recordingSeconds}
          micOn={micOn}
          cameraOn={cameraOn}
          audioPlaybackBlocked={audioPlaybackBlocked}
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          screenVideoRef={screenVideoRef}
          isScreenSharing={isScreenSharing}
          onToggleScreenShare={handleToggleScreenShare}
          participants={participants}
          onToggleMic={() => {
            const track = localStreamRef.current?.getAudioTracks()[0]
            if (track) {
              track.enabled = !track.enabled
              setMicOn(track.enabled)
            }
          }}
          onToggleCamera={() => {
            const track = localStreamRef.current?.getVideoTracks()[0]
            if (track) {
              track.enabled = !track.enabled
              setCameraOn(track.enabled)
            }
          }}
          onOpenRecordingModal={() => setIsRecordingModeModalOpen(true)}
          onStopRecording={() => void handleStopRecording()}
          onLeaveMeeting={() => void handleLeaveMeeting()}
          onEnableAudio={() => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.muted = false
              void remoteVideoRef.current.play().catch(() => undefined)
              setAudioPlaybackBlocked(false)
            }
          }}
          onCopyInvite={handleCopyInvite}
          copiedInvite={copiedInvite}
          guestConsented={guestConsented}
          guestDeclined={guestDeclined}
          hostConsented={hostConsented}
          onHostConsentChange={setHostConsented}
          onGuestConsentRespond={setGuestConsented}
          onSendChatMessage={handleSendChat}
          chatMessages={chatMessages}
          activeFilterId={activeFilterId}
          activeFilterCss={activeFilterCss}
          filterAdjustments={filterAdjustments}
          onSelectFilter={setActiveFilterId}
          onUpdateAdjustments={setFilterAdjustments}
        />
      )}

      {/* 3. Screen 02: Create Room Modal */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleStartRoomAsHost}
        isConnecting={isConnecting}
        hasSupabaseConfig={hasSupabaseConfig}
        activeFilterId={activeFilterId}
        onSelectFilter={setActiveFilterId}
      />

      {/* 4. Screen 03: Join Room Modal */}
      <JoinRoomModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onSubmit={handleJoinRoomAsGuest}
        initialCode={initialInvite}
        isConnecting={isConnecting}
        hasSupabaseConfig={hasSupabaseConfig}
        activeFilterId={activeFilterId}
        onSelectFilter={setActiveFilterId}
      />

      {/* 5. Screen 05: Choose Recording Mode Modal */}
      <RecordingModeModal
        isOpen={isRecordingModeModalOpen}
        onClose={() => setIsRecordingModeModalOpen(false)}
        onConfirm={handleConfirmRecordingMode}
      />

      {/* 6. Screen 06: Recording Preview & Save Modal */}
      <RecordingPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        onDiscard={() => {
          if (confirm('Discard this recording? It will not be saved.')) {
            setResult(null)
            setIsPreviewModalOpen(false)
          }
        }}
        onSave={() => void handleSaveRecording()}
        result={result}
        previewUrl={previewUrl}
        saveStatus={saveStatus}
        isSaving={isSaving}
      />
    </div>
  )
}
