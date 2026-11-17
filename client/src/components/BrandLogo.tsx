import React from 'react'

interface BrandLogoProps {
  size?: number
  fontSize?: number
  onClick?: () => void
}

export default function BrandLogo({ size = 26, fontSize = 18, onClick }: BrandLogoProps) {
  return (
    <div
      className="brand-container"
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: onClick ? 'pointer' : 'default' }}
    >
      <div
        style={{
          position: 'relative',
          width: size + 10,
          height: size + 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {/* Crisp vector viewfinder bracket camera */}
        <svg
          width={size + 10}
          height={size + 10}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Top-left corner bracket */}
          <path
            d="M 2 8 L 2 4 C 2 2.9 2.9 2 4 2 L 8 2"
            stroke="#ff6b00"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Top-right corner bracket */}
          <path
            d="M 24 2 L 28 2 C 29.1 2 30 2.9 30 4 L 30 8"
            stroke="#ff6b00"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Bottom-left corner bracket */}
          <path
            d="M 2 24 L 2 28 C 2 29.1 2.9 30 4 30 L 8 30"
            stroke="#ff6b00"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Bottom-right corner bracket */}
          <path
            d="M 24 30 L 28 30 C 29.1 30 30 29.1 30 28 L 30 24"
            stroke="#ff6b00"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Camera body */}
          <rect
            x="7"
            y="9"
            width="12"
            height="14"
            rx="3"
            stroke="#ff6b00"
            strokeWidth="2"
            fill="rgba(255, 107, 0, 0.12)"
          />
          {/* Camera lens cone */}
          <path
            d="M 19 13.5 L 24 10.5 L 24 21.5 L 19 18.5"
            stroke="#ff6b00"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="rgba(255, 107, 0, 0.18)"
          />
        </svg>
      </div>

      <span
        style={{
          fontSize,
          fontWeight: 800,
          letterSpacing: '-0.025em',
          lineHeight: 1,
          fontFamily: 'inherit',
        }}
      >
        <span style={{ color: '#ffffff' }}>Interview</span>
        <span style={{ color: '#ff6b00' }}>Capture</span>
      </span>
    </div>
  )
}
