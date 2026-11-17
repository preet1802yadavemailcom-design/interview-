import React, { useState, useEffect } from 'react'
import {
  Shield,
  Video,
  Play,
  ArrowRight,
  Check,
  Link2,
  Download,
  Mic,
  MicOff,
  VideoOff,
  MonitorUp,
  Users,
  MessageSquare,
  MoreHorizontal,
  PhoneOff,
  Signal,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  HardDrive,
  Cpu,
  Lock,
} from 'lucide-react'
import BrandLogo from './BrandLogo'
import AudioWaveform from './AudioWaveform'

interface LandingPageProps {
  onStartInterview: () => void
  onJoinInterview: () => void
}

export default function LandingPage({
  onStartInterview,
  onJoinInterview,
}: LandingPageProps) {
  // Live ticking timer for hero preview
  const [timerSeconds, setTimerSeconds] = useState(754) // 12:34
  const [mockMicOn, setMockMicOn] = useState(true)
  const [mockCamOn, setMockCamOn] = useState(true)
  const [mockRecording, setMockRecording] = useState(true)

  // Interactive storage calculator
  const [calcMinutes, setCalcMinutes] = useState(30)

  // FAQ Accordion
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0)

  useEffect(() => {
    if (!mockRecording) return
    const interval = setInterval(() => {
      setTimerSeconds(s => s + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [mockRecording])

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60)
    const secs = totalSecs % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // File size calculation: 1080p VP9/Opus is roughly 11.5 MB per minute
  const estimatedSizeMb = Math.round(calcMinutes * 11.8)

  const faqs = [
    {
      q: 'How does InterviewCapture ensure 100% privacy?',
      a: 'Video and audio are recorded directly inside your browser using the MediaRecorder API and Web Audio API. Recorded files are encoded and saved straight to your local computer (via File System Access API or browser download). Zero audio or video bytes are ever uploaded to any cloud server or database.',
    },
    {
      q: 'Do guests need to install software or register an account?',
      a: 'No installation, plugins, or downloads required. Both host and guest join via standard WebRTC inside any modern browser (Chrome, Edge, Brave, Safari, Firefox) with an invitation link or 12-character code.',
    },
    {
      q: 'Can I capture shared screens alongside participant webcams?',
      a: 'Yes! InterviewCapture provides three recording modes: Full Interview (both video tiles composed side-by-side at 1080p), Screen + Interview (Picture-in-Picture layout), and Screen Only with high-definition tab audio mixing.',
    },
    {
      q: 'How does the mutual recording consent system work?',
      a: 'Before recording starts, the host confirms the recording intent, and the remote participant receives a clear consent modal. Recording only initiates when both parties explicitly agree, ensuring strict compliance with ethical and legal standards.',
    },
    {
      q: 'What video format and resolution are produced?',
      a: 'Recordings are generated in high-bitrate WebM (VP9/Opus) or MP4 at full 1080p 30fps with automatic hardware acceleration and loudness normalization.',
    },
  ]

  return (
    <div className="landing-wrapper">
      {/* Environmental Studio Atmospheric Elements on Left & Right */}
      <div className="env-left-accent">
        <img src="/assets/clean_env_left.jpg" alt="" className="env-left-img" />
      </div>
      <div className="env-right-accent" aria-hidden="true">
        <img src="/assets/bg_studio_right_accent.svg" alt="" className="env-right-img" />
      </div>

      {/* Hero Section */}
      <section className="hero-grid" id="home">
        {/* Left Column: Copy & Actions */}
        <div className="hero-left">
          <div className="privacy-badge-pill">
            <Shield size={14} className="privacy-badge-icon" />
            <span>Privacy-First Interview Platform</span>
          </div>

          <h1 className="hero-headline">
            Conduct interviews.
            <br />
            <span className="highlight-orange">Record</span> with confidence.
          </h1>

          <p className="hero-paragraph">
            Run live interviews, capture both participants' video and audio, record your screen when needed,
            and save the final recording directly to your device — with complete privacy.
          </p>

          <div className="hero-cta-group">
            <button className="btn-primary-orange" onClick={onStartInterview}>
              <Video size={18} /> Start an Interview <ArrowRight size={16} />
            </button>
            <button
              className="btn-secondary-dark"
              onClick={() => {
                const el = document.getElementById('how-it-works')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <Play size={14} fill="currentColor" /> See How It Works
            </button>
          </div>

          <div className="hero-checkmarks">
            <div className="check-item">
              <span className="check-circle"><Check size={11} strokeWidth={3} /></span>
              <span>No Installation</span>
            </div>
            <div className="check-item">
              <span className="check-circle"><Check size={11} strokeWidth={3} /></span>
              <span>Browser Based</span>
            </div>
            <div className="check-item">
              <span className="check-circle"><Check size={11} strokeWidth={3} /></span>
              <span>Local Recording</span>
            </div>
            <div className="check-item">
              <span className="check-circle"><Check size={11} strokeWidth={3} /></span>
              <span>Private & Secure</span>
            </div>
          </div>
        </div>

        {/* Right Column: Framed Interactive Preview (Exact match to 01_Home_Landing_Page.png + Live Interactive Micro-Engine) */}
        <div className="preview-window-frame" title="Interactive Workspace Preview">
          {/* Glowing Orange Corner Brackets */}
          <div className="corner-bracket corner-tl" />
          <div className="corner-bracket corner-tr" />
          <div className="corner-bracket corner-bl" />
          <div className="corner-bracket corner-br" />

          <div className="mock-workspace-card">
            {/* Mock Header */}
            <div className="mock-window-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <BrandLogo size={16} fontSize={12} />
              </div>

              <div className="mock-badge mock-badge-title">
                <Calendar size={11} /> Frontend Developer Interview
              </div>

              <div
                className="mock-badge mock-badge-rec"
                onClick={() => setMockRecording(!mockRecording)}
                style={{ cursor: 'pointer' }}
                title="Click to pause/resume live timer simulation"
              >
                <span className={`rec-dot-pulsing ${!mockRecording ? 'paused' : ''}`} />
                <span>Recording 00:{formatTimer(timerSeconds)}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94a3b8' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                  <Users size={12} /> 2
                </span>
                <span style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 12 }}>
                  <span style={{ width: 2.5, height: 5, background: '#10b981', borderRadius: 1 }}></span>
                  <span style={{ width: 2.5, height: 8, background: '#10b981', borderRadius: 1 }}></span>
                  <span style={{ width: 2.5, height: 12, background: '#10b981', borderRadius: 1 }}></span>
                </span>
                <MoreHorizontal size={14} />
              </div>
            </div>

            {/* Mock Dual Video Stage with Photorealistic Portraits & Live Waveforms */}
            <div className="mock-stage-dual">
              {/* Host Mock Tile */}
              <div className="mock-video-tile">
                {mockCamOn ? (
                  <img
                    src="/assets/interviewer_photo.jpg"
                    alt="Interviewer (You)"
                    className="mock-video-img"
                  />
                ) : (
                  <div className="mock-cam-off-placeholder">
                    <VideoOff size={32} color="#64748b" />
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>Camera Off</span>
                  </div>
                )}
                <div className="mock-tile-badge">
                  <span style={{ color: '#f59e0b' }}>👑</span>
                  <span>Interviewer (You)</span>
                  <AudioWaveform active={mockMicOn} color="#ff6b00" height={12} />
                </div>
              </div>

              {/* Guest Mock Tile */}
              <div className="mock-video-tile">
                <img
                  src="/assets/guest_photo.jpg"
                  alt="Interviewee"
                  className="mock-video-img"
                />
                <div className="mock-tile-badge">
                  <span>🎙</span>
                  <span>Interviewee</span>
                  <AudioWaveform active={true} color="#10b981" height={12} />
                </div>
              </div>
            </div>

            {/* Mock Toolbar with Interactive Micro-toggles */}
            <div className="mock-toolbar">
              <div className="mock-tools-center">
                <button
                  className={`mock-tool-btn ${!mockMicOn ? 'muted' : ''}`}
                  onClick={() => setMockMicOn(!mockMicOn)}
                  title="Toggle Mic"
                >
                  {mockMicOn ? <Mic size={16} /> : <MicOff size={16} color="#ff6b75" />}
                  <span>{mockMicOn ? 'Mic' : 'Muted'}</span>
                </button>

                <button
                  className={`mock-tool-btn ${!mockCamOn ? 'muted' : ''}`}
                  onClick={() => setMockCamOn(!mockCamOn)}
                  title="Toggle Camera"
                >
                  {mockCamOn ? <Video size={16} /> : <VideoOff size={16} color="#ff6b75" />}
                  <span>{mockCamOn ? 'Camera' : 'Off'}</span>
                </button>

                <button className="mock-tool-btn" onClick={onStartInterview}>
                  <MonitorUp size={16} /> <span>Share Screen</span>
                </button>

                <button
                  className="mock-tool-btn rec-btn"
                  onClick={() => setMockRecording(!mockRecording)}
                  title="Toggle recording"
                >
                  <span className="mock-rec-stop-icon">
                    <span className="mock-rec-square" />
                  </span>
                  <span>{mockRecording ? 'Stop Recording' : 'Start'}</span>
                </button>

                <button className="mock-tool-btn" onClick={onJoinInterview}>
                  <Users size={16} /> <span>Participants</span>
                </button>

                <button className="mock-tool-btn" onClick={onStartInterview}>
                  <MessageSquare size={16} /> <span>Chat</span>
                </button>

                <button className="mock-tool-btn">
                  <MoreHorizontal size={16} /> <span>More</span>
                </button>
              </div>

              <div className="mock-leave-btn" onClick={onStartInterview} style={{ cursor: 'pointer' }}>
                <PhoneOff size={12} /> Leave
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section" id="how-it-works">
        {/* Contextual Flow Route Background */}
        <div className="how-it-works-flow-bg" aria-hidden="true">
          <img src="/assets/bg_how_it_works_flow.svg" alt="" className="how-it-works-flow-img" />
        </div>

        <div className="section-header-row">
          <div className="orange-bar-title">How It Works</div>
          <div className="section-subtitle">Get started in three simple steps.</div>
        </div>

        <div className="stepper-grid">
          {/* Step 1 */}
          <div className="step-card" onClick={onStartInterview} style={{ cursor: 'pointer' }}>
            <div className="step-num-badge">1</div>
            <div className="step-icon-orange">
              <Video size={20} />
            </div>
            <div className="step-content">
              <b>Create a Room</b>
              <span>Set up your interview in seconds.</span>
            </div>
          </div>

          <div className="step-arrow">→</div>

          {/* Step 2 */}
          <div className="step-card" onClick={onJoinInterview} style={{ cursor: 'pointer' }}>
            <div className="step-num-badge">2</div>
            <div className="step-icon-orange">
              <Link2 size={20} />
            </div>
            <div className="step-content">
              <b>Invite a Guest</b>
              <span>Share the room link or code.</span>
            </div>
          </div>

          <div className="step-arrow">→</div>

          {/* Step 3 */}
          <div className="step-card" onClick={onStartInterview} style={{ cursor: 'pointer' }}>
            <div className="step-num-badge">3</div>
            <div className="step-icon-orange">
              <Download size={20} />
            </div>
            <div className="step-content">
              <b>Record & Save</b>
              <span>Conduct, record, and save locally.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Feature Cards Grid with Contextual Thematic Background Artworks */}
      <section className="features-grid-wrapper" id="features">
        <div className="features-ambient-glow" aria-hidden="true" />
        <div className="features-grid-4">
          {/* Feature 1: Live Interviews */}
          <div className="feature-box">
            <img src="/assets/feature_bg_interviews.svg" alt="" className="feature-box-bg-art" aria-hidden="true" />
            <div className="feature-box-icon icon-orange">
              <Video size={22} />
            </div>
            <h3>Live Interviews</h3>
            <p>HD video & clear audio for natural conversations between two participants.</p>
          </div>

          {/* Feature 2: Screen Capture */}
          <div className="feature-box">
            <img src="/assets/feature_bg_screen.svg" alt="" className="feature-box-bg-art" aria-hidden="true" />
            <div className="feature-box-icon icon-purple">
              <MonitorUp size={22} />
            </div>
            <h3>Screen Capture</h3>
            <p>Share your screen, window, or tab during the interview.</p>
          </div>

          {/* Feature 3: Local Recording */}
          <div className="feature-box">
            <img src="/assets/feature_bg_recording.svg" alt="" className="feature-box-bg-art" aria-hidden="true" />
            <div className="feature-box-icon icon-orange">
              <Download size={22} />
            </div>
            <h3>Local Recording</h3>
            <p>Record both participants and save the video directly to your device.</p>
          </div>

          {/* Feature 4: Consent-First Privacy */}
          <div className="feature-box">
            <img src="/assets/feature_bg_privacy.svg" alt="" className="feature-box-bg-art" aria-hidden="true" />
            <div className="feature-box-icon icon-purple">
              <Shield size={22} />
            </div>
            <h3>Consent-First Privacy</h3>
            <p>Recording starts only with clear consent from both participants.</p>
          </div>
        </div>
      </section>

      {/* Privacy Device Banner with Contextual Vault Circuit Background */}
      <section className="privacy-banner-card">
        <img src="/assets/bg_vault_circuit.svg" alt="" className="privacy-banner-circuit-bg" aria-hidden="true" />

        <div className="privacy-banner-left-visual">
          <img
            src="/assets/laptop_shield.png"
            alt="Your Recordings Stay on Your Device"
            className="privacy-laptop-img"
          />
        </div>

        <div className="privacy-banner-content">
          <h2>
            Your Recordings Stay on <span>Your Device.</span>
          </h2>
          <p>
            InterviewCapture is built with privacy at its core. We never upload, store, or access your recordings.
            The final video is saved directly to your computer, giving you complete control.
          </p>
        </div>

        <div className="privacy-banner-wave-visual">
          <img
            src="/assets/particle_wave_clean.png"
            alt=""
            className="privacy-wave-img"
          />
        </div>
      </section>

      {/* NEW CREATIVE FEATURE: Interactive Local Storage Estimator with Telemetry Background */}
      <section className="storage-estimator-section">
        <div className="estimator-card">
          <img src="/assets/bg_storage_telemetry.svg" alt="" className="estimator-telemetry-bg" aria-hidden="true" />
          <div className="estimator-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="feature-box-icon icon-orange" style={{ width: 36, height: 36, marginBottom: 0 }}>
                <HardDrive size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Local Storage & Bandwidth Estimator</h3>
                <p style={{ fontSize: 12.5, color: '#94a3b8' }}>See how lightweight and device-friendly client-side encoding is.</p>
              </div>
            </div>
            <div className="estimator-badge">
              <Sparkles size={13} color="#ff6b00" />
              <span>Full 1080p 30 FPS VP9/Opus</span>
            </div>
          </div>

          <div className="estimator-body">
            <div className="estimator-slider-row">
              <label htmlFor="duration-slider" style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>
                Interview Duration: <span style={{ color: '#ff6b00', fontWeight: 800 }}>{calcMinutes} minutes</span>
              </label>
              <input
                id="duration-slider"
                type="range"
                min={5}
                max={120}
                step={5}
                value={calcMinutes}
                onChange={e => setCalcMinutes(Number(e.target.value))}
                className="custom-range-slider"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b' }}>
                <span>5 mins</span>
                <span>30 mins</span>
                <span>60 mins</span>
                <span>120 mins</span>
              </div>
            </div>

            <div className="estimator-stats-grid">
              <div className="est-stat-box">
                <span className="est-stat-label">Estimated File Size</span>
                <span className="est-stat-val" style={{ color: '#ff6b00' }}>
                  {estimatedSizeMb >= 1024 ? `${(estimatedSizeMb / 1024).toFixed(2)} GB` : `${estimatedSizeMb} MB`}
                </span>
                <span className="est-stat-sub">Direct local disk write</span>
              </div>

              <div className="est-stat-box">
                <span className="est-stat-label">Cloud Upload Used</span>
                <span className="est-stat-val" style={{ color: '#10b981' }}>0 KB</span>
                <span className="est-stat-sub">100% Zero server uploads</span>
              </div>

              <div className="est-stat-box">
                <span className="est-stat-label">Audio Quality</span>
                <span className="est-stat-val" style={{ color: '#c4a5ff' }}>48 kHz Stereo</span>
                <span className="est-stat-sub">Web Audio compression</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW CREATIVE FEATURE: Frequently Asked Questions (FAQ) Accordion with Knowledge Shield Backdrop */}
      <section className="faq-section" id="faq">
        <img src="/assets/bg_faq_shield.svg" alt="" className="faq-shield-bg" aria-hidden="true" />
        <div className="section-header-row">
          <div className="orange-bar-title">Frequently Asked Questions</div>
          <div className="section-subtitle">Everything you need to know about InterviewCapture.</div>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => {
            const isOpen = expandedFaq === index
            return (
              <div
                key={index}
                className={`faq-item-card ${isOpen ? 'open' : ''}`}
                onClick={() => setExpandedFaq(isOpen ? null : index)}
              >
                <div className="faq-question-row">
                  <span className="faq-question-text">{faq.q}</span>
                  <button className="faq-toggle-btn" aria-label="Toggle answer">
                    {isOpen ? <ChevronUp size={18} color="#ff6b00" /> : <ChevronDown size={18} color="#94a3b8" />}
                  </button>
                </div>
                {isOpen && (
                  <div className="faq-answer-text">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div>© {new Date().getFullYear()} InterviewCapture — Meet. Record. Save.</div>
        <div className="footer-links-group">
          <a href="/privacy.html">Privacy</a>
          <a href="/terms.html">Terms</a>
          <a href="https://preetbeacon.com" target="_blank" rel="noreferrer" className="footer-powered-link">
            Powered by preetbeacon.com
          </a>
        </div>
      </footer>
    </div>
  )
}
