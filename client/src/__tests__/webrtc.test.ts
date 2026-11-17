import { describe, it, expect } from 'vitest'
import {
  getDefaultIceServers,
  resolveIceServers,
  getIceConfigSummary,
  buildRtcConfiguration,
} from '../lib/webrtc'

describe('WebRTC ICE Server Configuration & Summaries', () => {
  it('returns valid default STUN servers', () => {
    const stuns = getDefaultIceServers()
    expect(stuns.length).toBeGreaterThanOrEqual(2)
    const allUrls = stuns.flatMap(s => (Array.isArray(s.urls) ? s.urls : [s.urls]))
    expect(allUrls.some(u => u.includes('stun.l.google.com'))).toBe(true)
    expect(allUrls.some(u => u.includes('cloudflare.com'))).toBe(true)
  })

  it('correctly reports STUN-only configuration summary by default', () => {
    const summary = getIceConfigSummary(getDefaultIceServers())
    expect(summary.hasTurn).toBe(false)
    expect(summary.serverTypes).toContain('stun')
    expect(summary.serverTypes).not.toContain('turn')
    expect(summary.serverTypes).not.toContain('turns')
  })

  it('correctly identifies TURN and TURNS servers in summary', () => {
    const serversWithTurn: RTCIceServer[] = [
      { urls: 'stun:stun.example.com' },
      { urls: 'turn:turn.example.com:3478', username: 'demo', credential: 'pwd' },
      { urls: 'turns:turns.example.com:5349?transport=tcp', username: 'demo', credential: 'pwd' },
    ]
    const summary = getIceConfigSummary(serversWithTurn)
    expect(summary.hasTurn).toBe(true)
    expect(summary.serverTypes).toContain('stun')
    expect(summary.serverTypes).toContain('turn')
    expect(summary.serverTypes).toContain('turns')
  })

  it('builds full RTCConfiguration with bundle policy and candidate pool', () => {
    const config = buildRtcConfiguration()
    expect(config.iceCandidatePoolSize).toBe(8)
    expect(config.bundlePolicy).toBe('max-bundle')
    expect(config.iceServers).toBeDefined()
    expect(config.iceServers!.length).toBeGreaterThanOrEqual(2)
  })
})
