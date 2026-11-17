import { ArrowRight, ChevronDown } from 'lucide-react'
import BrandLogo from './BrandLogo'

interface HeaderProps {
  onOpenCreateModal: () => void
  onOpenJoinModal: () => void
  onNavigateHome: () => void
  onNavigateDashboard: () => void
  activeTab?: string
}

export default function Header({
  onOpenCreateModal,
  onOpenJoinModal,
  onNavigateHome,
  onNavigateDashboard,
  activeTab = 'home',
}: HeaderProps) {
  return (
    <header className="site-header">
      <BrandLogo size={24} fontSize={18} onClick={onNavigateHome} />

      <nav className="header-nav">
        <a
          href="#home"
          className={`nav-pill-link ${activeTab === 'home' ? 'active' : ''}`}
          onClick={e => {
            e.preventDefault()
            onNavigateHome()
          }}
        >
          Home
        </a>
        <a
          href="#features"
          className="nav-link"
          onClick={e => {
            e.preventDefault()
            const el = document.getElementById('features')
            el?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          Features
        </a>
        <a
          href="#how-it-works"
          className="nav-link"
          onClick={e => {
            e.preventDefault()
            const el = document.getElementById('how-it-works')
            el?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          How It Works
        </a>
        <span
          className="nav-link"
          style={{ cursor: 'pointer' }}
          onClick={onOpenJoinModal}
        >
          Use Cases
        </span>
        <span
          className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
          style={{ cursor: 'pointer' }}
          onClick={onNavigateDashboard}
        >
          Dashboard
        </span>
        <span className="nav-link" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
          Resources <ChevronDown size={13} />
        </span>
      </nav>

      <div className="header-actions">
        <button
          className="btn-header-login"
          onClick={onOpenJoinModal}
        >
          Log in
        </button>
        <button className="btn-primary-orange" onClick={onOpenCreateModal}>
          Get Started <ArrowRight size={15} />
        </button>
      </div>
    </header>
  )
}
