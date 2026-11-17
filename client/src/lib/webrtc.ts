export interface IceConfigSummary {
  hasTurn: boolean
  iceServerCount: number
  serverTypes: ('stun' | 'turn' | 'turns')[]
}

/**
 * Returns the default public STUN configuration.
 * Public STUN facilitates direct P2P connection when neither peer is behind symmetric NAT.
 */
export function getDefaultIceServers(): RTCIceServer[] {
  return [
    { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
    { urls: ['stun:stun2.l.google.com:19302', 'stun:stun.cloudflare.com:3478'] },
  ]
}

/**
 * Resolves ICE servers by inspecting environment variables.
 * Supports:
 * - VITE_ICE_SERVERS: Valid JSON string representing RTCIceServer[]
 * - VITE_TURN_URL + VITE_TURN_USERNAME + VITE_TURN_CREDENTIAL: Standard TURN/TURNS configuration
 * Defaults to reliable public STUN servers if no custom TURN servers are defined.
 */
export function resolveIceServers(): RTCIceServer[] {
  // 1. Try parsing JSON array from VITE_ICE_SERVERS
  const rawIceServers = import.meta.env.VITE_ICE_SERVERS as string | undefined
  if (rawIceServers && rawIceServers.trim()) {
    try {
      const parsed = JSON.parse(rawIceServers)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as RTCIceServer[]
      }
    } catch {
      console.warn('[WebRTC] Invalid JSON in VITE_ICE_SERVERS; falling back to standard servers.')
    }
  }

  const defaultStuns = getDefaultIceServers()

  // 2. Try discrete TURN parameters
  const turnUrl = import.meta.env.VITE_TURN_URL as string | undefined
  const turnUsername = import.meta.env.VITE_TURN_USERNAME as string | undefined
  const turnCredential = import.meta.env.VITE_TURN_CREDENTIAL as string | undefined

  if (turnUrl && turnUrl.trim()) {
    const urls = turnUrl.split(',').map(u => u.trim()).filter(Boolean)
    const turnServer: RTCIceServer = { urls }
    if (turnUsername) turnServer.username = turnUsername
    if (turnCredential) turnServer.credential = turnCredential

    return [...defaultStuns, turnServer]
  }

  return defaultStuns
}

export function getIceConfigSummary(servers: RTCIceServer[] = resolveIceServers()): IceConfigSummary {
  const types = new Set<'stun' | 'turn' | 'turns'>()
  let hasTurn = false

  for (const s of servers) {
    const urls = Array.isArray(s.urls) ? s.urls : [s.urls]
    for (const url of urls) {
      if (url.startsWith('turns:')) {
        types.add('turns')
        hasTurn = true
      } else if (url.startsWith('turn:')) {
        types.add('turn')
        hasTurn = true
      } else if (url.startsWith('stun:')) {
        types.add('stun')
      }
    }
  }

  return {
    hasTurn,
    iceServerCount: servers.length,
    serverTypes: Array.from(types),
  }
}

export function buildRtcConfiguration(): RTCConfiguration {
  return {
    iceServers: resolveIceServers(),
    iceCandidatePoolSize: 8,
    bundlePolicy: 'max-bundle',
  }
}

export function createPeerConnection(
  onIce: (candidate: RTCIceCandidate) => void,
  onTrack: (event: RTCTrackEvent) => void,
  onState: (state: RTCPeerConnectionState) => void,
  config?: RTCConfiguration,
): RTCPeerConnection {
  const finalConfig = config || buildRtcConfiguration()
  const pc = new RTCPeerConnection(finalConfig)

  pc.onicecandidate = event => {
    if (event.candidate) {
      onIce(event.candidate)
    }
  }

  pc.ontrack = onTrack

  pc.onconnectionstatechange = () => {
    onState(pc.connectionState)
  }

  pc.oniceconnectionstatechange = () => {
    if (pc.iceConnectionState === 'failed') {
      console.warn('[WebRTC] ICE connection state: failed. Network may require TURN relay.')
    }
  }

  pc.onicecandidateerror = event => {
    // Non-fatal candidate errors (e.g. unreachable STUN reflex or local network filtering)
    if (event.errorCode !== 701) {
      console.debug('[WebRTC] ICE candidate error:', event.errorCode, event.errorText)
    }
  }

  return pc
}
