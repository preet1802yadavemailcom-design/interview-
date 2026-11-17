import { useState, useRef } from 'react'
import {
  LayoutDashboard,
  Calendar,
  Film,
  BarChart3,
  Settings,
  Search,
  Plus,
  Play,
  Download,
  MoreHorizontal,
  Trash2,
  Clock,
  HardDrive,
  Users,
  ShieldCheck,
  FileSpreadsheet,
  X,
} from 'lucide-react'
import BrandLogo from './BrandLogo'

export interface RecordingItem {
  id: string
  title: string
  dateTime: string
  duration: string
  size: string
  url?: string
}

const DEFAULT_SAMPLE_RECORDINGS: RecordingItem[] = [
  {
    id: 'rec-1',
    title: 'Frontend Developer Interview',
    dateTime: 'Mar 8, 2025 • 11:00 AM',
    duration: '12:34',
    size: '142.6 MB',
  },
  {
    id: 'rec-2',
    title: 'Project Discussion',
    dateTime: 'Mar 6, 2025 • 04:30 PM',
    duration: '28:17',
    size: '318.4 MB',
  },
  {
    id: 'rec-3',
    title: 'Internship Interview',
    dateTime: 'Mar 4, 2025 • 10:00 AM',
    duration: '18:05',
    size: '206.2 MB',
  },
]

interface DashboardViewProps {
  onNewMeeting: () => void
  onNavigateHome: () => void
  onPlayRecording?: (item: RecordingItem) => void
}

export default function DashboardView({
  onNewMeeting,
  onNavigateHome,
  onPlayRecording,
}: DashboardViewProps) {
  const [activeNav, setActiveNav] = useState<'dashboard' | 'meetings' | 'recordings' | 'analytics' | 'settings'>('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [playingItem, setPlayingItem] = useState<RecordingItem | null>(null)
  const [recordings, setRecordings] = useState<RecordingItem[]>(() => {
    try {
      const stored = localStorage.getItem('interviewcapture_saved_recordings')
      if (stored) {
        const parsed = JSON.parse(stored)
        return [...parsed, ...DEFAULT_SAMPLE_RECORDINGS]
      }
    } catch {
      /* ignore */
    }
    return DEFAULT_SAMPLE_RECORDINGS
  })

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLocalVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPlayingItem({
      id: `local-${Date.now()}`,
      title: file.name,
      dateTime: 'Local Disk Video',
      duration: 'Full Recording',
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      url,
    })
  }

  const filtered = recordings.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleDelete = (id: string) => {
    setRecordings(prev => prev.filter(r => r.id !== id))
    try {
      const stored = localStorage.getItem('interviewcapture_saved_recordings')
      if (stored) {
        const parsed = JSON.parse(stored).filter((r: RecordingItem) => r.id !== id)
        localStorage.setItem('interviewcapture_saved_recordings', JSON.stringify(parsed))
      }
    } catch {
      /* ignore */
    }
  }

  const handleExportCsv = () => {
    const headers = 'ID,Meeting Title,Date & Time,Duration,Size\n'
    const rows = filtered.map(r => `"${r.id}","${r.title}","${r.dateTime}","${r.duration}","${r.size}"`).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `interview-recordings-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="dashboard-shell">
      {/* Top Badge matching 07_Recordings_Dashboard.png */}
      <div style={{ padding: '16px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="modal-step-badge">07 Dashboard (Your Recordings)</span>
        <button
          className="btn-secondary-dark"
          style={{ padding: '6px 14px', fontSize: 12, borderRadius: 999 }}
          onClick={handleExportCsv}
        >
          <FileSpreadsheet size={14} color="#10b981" /> Export CSV
        </button>
      </div>

      <div className="dashboard-layout-frame">
        {/* Left Sidebar */}
        <aside className="dashboard-sidebar">
          <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <BrandLogo size={22} fontSize={16} onClick={onNavigateHome} />
          </div>

          <nav className="dashboard-nav-list">
            <button
              className={`dashboard-nav-item ${activeNav === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveNav('dashboard')}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>
            <button
              className={`dashboard-nav-item ${activeNav === 'meetings' ? 'active' : ''}`}
              onClick={() => setActiveNav('meetings')}
            >
              <Calendar size={18} />
              <span>Meetings</span>
            </button>
            <button
              className={`dashboard-nav-item ${activeNav === 'recordings' ? 'active' : ''}`}
              onClick={() => setActiveNav('recordings')}
            >
              <Film size={18} />
              <span>Recordings</span>
            </button>
            <button
              className={`dashboard-nav-item ${activeNav === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveNav('analytics')}
            >
              <BarChart3 size={18} />
              <span>Analytics</span>
            </button>
            <button
              className={`dashboard-nav-item ${activeNav === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveNav('settings')}
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="dashboard-main-content">
          {/* Top Quick Stats Metric Cards */}
          <div className="dashboard-stats-grid">
            <div className="dash-stat-card">
              <div className="dash-stat-icon icon-orange">
                <Clock size={18} />
              </div>
              <div>
                <span className="dash-stat-label">Total Duration</span>
                <span className="dash-stat-value">58m 56s</span>
              </div>
            </div>

            <div className="dash-stat-card">
              <div className="dash-stat-icon icon-purple">
                <HardDrive size={18} />
              </div>
              <div>
                <span className="dash-stat-label">Local Storage</span>
                <span className="dash-stat-value">667.2 MB</span>
              </div>
            </div>

            <div className="dash-stat-card">
              <div className="dash-stat-icon icon-orange">
                <Users size={18} />
              </div>
              <div>
                <span className="dash-stat-label">Interviews Recorded</span>
                <span className="dash-stat-value">{recordings.length}</span>
              </div>
            </div>

            <div className="dash-stat-card">
              <div className="dash-stat-icon icon-green">
                <ShieldCheck size={18} />
              </div>
              <div>
                <span className="dash-stat-label">Data Privacy</span>
                <span className="dash-stat-value" style={{ color: '#10b981' }}>100% Local</span>
              </div>
            </div>
          </div>

          {/* Header Row */}
          <div className="dashboard-header-row">
            <div>
              <h1 className="dashboard-title">Your Recordings</h1>
              <p className="dashboard-subtitle">Manage, view, and replay all your local interview recordings.</p>
            </div>

            <div className="dashboard-header-actions">
              <div className="dashboard-search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search recordings…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>

              <button
                type="button"
                className="btn-secondary-dark"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', fontSize: 13 }}
                onClick={() => fileInputRef.current?.click()}
                title="Open and play any recorded video from your computer"
              >
                <Film size={15} color="#ff6b00" /> Play Local Video
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="video/*,.webm,.mp4"
                style={{ display: 'none' }}
                onChange={handleLocalVideoUpload}
              />

              <button className="btn-primary-orange" onClick={onNewMeeting}>
                <Plus size={16} /> New Meeting
              </button>
            </div>
          </div>

          {/* Recordings Table */}
          <div className="dashboard-table-container">
            <table className="recordings-table">
              <thead>
                <tr>
                  <th style={{ width: 44 }}>
                    <input
                      type="checkbox"
                      className="custom-table-checkbox"
                      checked={selectedIds.length === filtered.length && filtered.length > 0}
                      onChange={e => {
                        if (e.target.checked) setSelectedIds(filtered.map(r => r.id))
                        else setSelectedIds([])
                      }}
                    />
                  </th>
                  <th>Meeting Title</th>
                  <th>Date & Time</th>
                  <th>Duration</th>
                  <th>Size</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const isSelected = selectedIds.includes(item.id)
                  return (
                    <tr key={item.id} className={isSelected ? 'selected-row' : ''}>
                      <td>
                        <input
                          type="checkbox"
                          className="custom-table-checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(item.id)}
                        />
                      </td>
                      <td className="cell-title">
                        <b>{item.title}</b>
                      </td>
                      <td className="cell-date">{item.dateTime}</td>
                      <td className="cell-duration">{item.duration}</td>
                      <td className="cell-size">{item.size}</td>
                      <td className="cell-actions">
                        <button
                          className="table-action-icon-btn"
                          title="Play preview"
                          onClick={() => setPlayingItem(item)}
                        >
                          <Play size={15} fill="currentColor" />
                        </button>
                        <button
                          className="table-action-icon-btn"
                          title="Download"
                          onClick={() => {
                            alert(`Downloading ${item.title} (${item.size}) to your local computer.`)
                          }}
                        >
                          <Download size={15} />
                        </button>
                        <button
                          className="table-action-icon-btn"
                          title="Delete"
                          onClick={() => handleDelete(item.id)}
                        >
                          <MoreHorizontal size={15} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Floating Modal Video Player for Dashboard playback */}
      {playingItem && (
        <div className="modal-backdrop" onClick={() => setPlayingItem(null)}>
          <div className="preview-modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <span className="modal-step-badge">Replay Recording</span>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginTop: 6 }}>{playingItem.title}</h3>
              </div>
              <button
                onClick={() => setPlayingItem(null)}
                className="modal-close-btn"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="preview-video-container">
              {playingItem.url ? (
                <video src={playingItem.url} controls autoPlay className="preview-video-element" />
              ) : (
                <img
                  src="/assets/recording_preview_frame.jpg"
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#94a3b8' }}>
              <span>{playingItem.dateTime}</span>
              <span>Duration: {playingItem.duration} • Size: {playingItem.size}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
