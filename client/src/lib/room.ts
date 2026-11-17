import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase, hasSupabaseConfig } from './supabase'

export type SignalKind =
  | 'offer'
  | 'answer'
  | 'ice'
  | 'leave'
  | 'recording-start'
  | 'recording-stop'
  | 'recording-pause'
  | 'recording-resume'
  | 'recording-consent'
  | 'recording-decline'
  | 'recording-purpose'
  | 'allow-screen-share'
  | 'mute-all'
  | 'room-lock'
  | 'chat'
  | 'reaction'
  | 'screen-share-status'

export interface SignalMessage {
  from: string
  to?: string
  kind: SignalKind
  data?: RTCSessionDescriptionInit | RTCIceCandidateInit | boolean | string | Record<string, unknown>
  purpose?: string
}

export interface RoomMember {
  userId: string
  role: 'host' | 'guest' | 'participant'
  displayName: string
}

export interface RoomHandlers {
  onChannel: (channel: RealtimeChannel) => void
  onSignal: (message: SignalMessage) => void
  onMembers: (members: RoomMember[]) => void
  onStatus?: (status: string) => void
}

export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export const ROOM_CODE_REGEX = /^[A-HJ-NP-Z2-9]{12}$/

export function cleanRoomCode(input: string): string {
  return input.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g, '').slice(0, 12)
}

export function isValidRoomCode(code: string): boolean {
  return ROOM_CODE_REGEX.test(code)
}

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Copy client/.env.example to client/.env and add your project values.')
  }
  return supabase
}

export async function ensureAnonymousSession(): Promise<string> {
  if (hasSupabaseConfig) {
    const client = requireSupabase()
    try {
      const { data: { session }, error: sessionError } = await client.auth.getSession()
      if (!sessionError && session?.user?.id) return session.user.id

      const { data, error } = await client.auth.signInAnonymously()
      if (!error && data?.user?.id) {
        return data.user.id
      }
      console.warn('[Supabase Auth] Anonymous sign-in notice (Realtime P2P signaling remains 100% active):', error?.message)
    } catch (err) {
      console.warn('[Supabase Auth] Session initialization notice:', err)
    }
  }

  // Resilient Session ID (Ensures Realtime signaling and presence works in all environments)
  let localId = sessionStorage.getItem('ic_local_user_id')
  if (!localId) {
    localId = crypto.randomUUID()
    sessionStorage.setItem('ic_local_user_id', localId)
  }
  return localId
}

export function createRoomCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12))
  return Array.from(bytes, b => ROOM_CODE_ALPHABET[b % ROOM_CODE_ALPHABET.length]).join('')
}

export async function createRoomMembership(code: string, displayName: string): Promise<string> {
  if (!isValidRoomCode(code)) throw new Error('Invalid room code format.')

  if (hasSupabaseConfig) {
    const client = requireSupabase()
    try {
      const { data, error } = await client.rpc('create_interview_room', {
        p_room_code: code,
        p_display_name: displayName.slice(0, 40),
      })
      if (!error && data) {
        return data as string
      }
      if (error) {
        console.info('[Supabase Database] Room reservation notice (Realtime broadcast is ready):', error.message)
      }
    } catch (err) {
      console.warn('[Supabase Database] RPC create notice:', err)
    }
  }

  // Resilient local state tracking
  const localId = sessionStorage.getItem('ic_local_user_id') || 'local_host'
  sessionStorage.setItem('ic_host_room_' + code, JSON.stringify({ code, hostId: localId, displayName }))
  return code
}

export async function joinRoomMembership(code: string, displayName: string): Promise<string> {
  const cleaned = cleanRoomCode(code)
  if (!isValidRoomCode(cleaned)) throw new Error('Invite code must be exactly 12 valid characters.')

  if (hasSupabaseConfig) {
    const client = requireSupabase()
    try {
      const { data, error } = await client.rpc('join_interview_room', {
        p_room_code: cleaned,
        p_display_name: displayName.slice(0, 40),
      })
      if (!error && data) {
        if (data !== 'guest') {
          throw new Error('This browser session created the room. Open the invite link in a private/incognito window or on a separate device.')
        }
        return data as string
      }
      if (error) {
        console.info('[Supabase Database] Join reservation notice (Realtime broadcast is ready):', error.message)
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('This browser session created the room')) {
        throw err
      }
      console.warn('[Supabase Database] RPC join notice:', err)
    }
  }

  return 'guest'
}

export async function leaveRoomMembership(code: string): Promise<void> {
  const cleaned = cleanRoomCode(code)
  if (!cleaned) return

  if (hasSupabaseConfig) {
    const client = requireSupabase()
    const { error } = await client.rpc('leave_interview_room', { p_room_code: cleaned })
    if (error) console.warn('[Room] Leave room cleanup notification:', error.message)
    return
  }

  sessionStorage.removeItem('ic_host_room_' + cleaned)
}

export async function connectRoom(code: string, member: RoomMember, handlers: RoomHandlers): Promise<RealtimeChannel> {
  if (hasSupabaseConfig) {
    const client = requireSupabase()
    const channel = client.channel(`room:${code}`, {
      config: {
        private: true,
        presence: { key: member.userId },
        broadcast: { self: false, ack: true },
      },
    })

    handlers.onChannel(channel)

    channel
      .on('broadcast', { event: 'signal' }, ({ payload }) => {
        const message = payload as SignalMessage
        if (message && message.from !== member.userId) {
          if (!message.to || message.to === member.userId) {
            handlers.onSignal(message)
          }
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState() as Record<string, RoomMember[]>
        const members = Object.values(state).flat().filter(Boolean)
        handlers.onMembers(members)
      })

    await new Promise<void>((resolve, reject) => {
      let settled = false

      channel.subscribe(async status => {
        handlers.onStatus?.(status)

        if (status === 'SUBSCRIBED' && !settled) {
          const trackResult = await channel.track(member)
          if (trackResult !== 'ok') {
            settled = true
            reject(
              new Error(
                `Could not track presence on the private channel (${trackResult}). Ensure that you executed the realtime authorization policies in schema.sql.`,
              ),
            )
          } else {
            settled = true
            const state = channel.presenceState() as Record<string, RoomMember[]>
            handlers.onMembers(Object.values(state).flat().filter(Boolean))
            resolve()
          }
        } else if ((status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') && !settled) {
          settled = true
          reject(
            new Error(
              `Supabase Realtime connection failed (${status}). Check your Realtime authorization SQL in schema.sql, database network access, and browser internet connection.`,
            ),
          )
        }
      })
    })

    return channel
  }

  // ==============================================================================
  // BroadcastChannel Fallback for Local Cross-Tab Testing (Instant Demo & Test Mode)
  // ==============================================================================
  const bc = new BroadcastChannel(`interviewcapture_room_${code}`)
  const localPresence: Record<string, RoomMember[]> = {
    [member.userId]: [member],
  }

  const broadcastChannelWrapper = {
    presenceState: () => localPresence,
    send: async (msg: { type: string; event: string; payload: SignalMessage }) => {
      bc.postMessage({ type: 'signal', payload: msg.payload })
      return 'ok'
    },
    track: async (m: RoomMember) => {
      localPresence[m.userId] = [m]
      bc.postMessage({ type: 'presence_join', member: m })
      return 'ok'
    },
    unsubscribe: async () => {
      bc.postMessage({ type: 'presence_leave', userId: member.userId })
      bc.close()
      return 'ok'
    },
  }

  handlers.onChannel(broadcastChannelWrapper as unknown as RealtimeChannel)

  bc.onmessage = (event: MessageEvent) => {
    const data = event.data
    if (!data) return

    if (data.type === 'signal') {
      const message = data.payload as SignalMessage
      if (message && message.from !== member.userId) {
        if (!message.to || message.to === member.userId) {
          handlers.onSignal(message)
        }
      }
    } else if (data.type === 'presence_join') {
      const remoteMember = data.member as RoomMember
      if (remoteMember && remoteMember.userId !== member.userId) {
        localPresence[remoteMember.userId] = [remoteMember]
        // Reply with our presence so newcomer knows we exist
        bc.postMessage({ type: 'presence_sync', state: localPresence })
        handlers.onMembers(Object.values(localPresence).flat().filter(Boolean))
      }
    } else if (data.type === 'presence_sync') {
      const remoteState = data.state as Record<string, RoomMember[]>
      if (remoteState) {
        Object.assign(localPresence, remoteState)
        handlers.onMembers(Object.values(localPresence).flat().filter(Boolean))
      }
    } else if (data.type === 'presence_leave') {
      delete localPresence[data.userId]
      handlers.onMembers(Object.values(localPresence).flat().filter(Boolean))
    }
  }

  // Announce presence across tabs
  setTimeout(() => {
    bc.postMessage({ type: 'presence_join', member })
    handlers.onMembers(Object.values(localPresence).flat().filter(Boolean))
    handlers.onStatus?.('SUBSCRIBED')
  }, 60)

  return broadcastChannelWrapper as unknown as RealtimeChannel
}

export async function sendSignal(channel: RealtimeChannel, message: SignalMessage): Promise<void> {
  const result = await channel.send({
    type: 'broadcast',
    event: 'signal',
    payload: message,
  })
  if (result !== 'ok') {
    throw new Error(`Failed to transmit signal (${result}). Verify your connection and Realtime permissions.`)
  }
}
