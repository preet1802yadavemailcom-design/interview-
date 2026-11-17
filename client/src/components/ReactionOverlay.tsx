import React from 'react'

export interface FloatingReaction {
  id: string
  emoji: string
  x: number
}

interface ReactionOverlayProps {
  reactions: FloatingReaction[]
}

export default function ReactionOverlay({ reactions }: ReactionOverlayProps) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 50,
      }}
      aria-hidden="true"
    >
      {reactions.map(r => (
        <span
          key={r.id}
          className="floating-emoji"
          style={{
            left: `${r.x}%`,
          }}
        >
          {r.emoji}
        </span>
      ))}
    </div>
  )
}
