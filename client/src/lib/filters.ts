// ==============================================================================
// InterviewCapture — Ultra HD Video Filters & Custom Adjustment Engine
// ==============================================================================

export interface VideoFilterPreset {
  id: string
  name: string
  tag: string
  icon: string
  description: string
  css: string
  badgeColor: string
}

export const VIDEO_FILTERS: VideoFilterPreset[] = [
  {
    id: 'normal',
    name: 'Normal (Natural)',
    tag: 'Raw 1080p',
    icon: '✨',
    description: 'Direct unfiltered webcam feed with natural colors',
    css: 'none',
    badgeColor: '#94a3b8',
  },
  {
    id: 'studio-warm',
    name: 'Studio Warmth',
    tag: 'Podcast / Studio',
    icon: '🔥',
    description: 'Flattering warm skin tones with rich studio contrast',
    css: 'brightness(1.04) contrast(1.08) saturate(1.18) sepia(0.08)',
    badgeColor: '#ff6b00',
  },
  {
    id: 'vibrant-hd',
    name: 'Vibrant Ultra HD',
    tag: 'Crisp HDR',
    icon: '💎',
    description: 'Punchy colors, razor clarity, and boosted dynamic range',
    css: 'contrast(1.15) brightness(1.03) saturate(1.30)',
    badgeColor: '#06b6d4',
  },
  {
    id: 'cool-tech',
    name: 'Cool Cyber Tech',
    tag: 'Modern Tech',
    icon: '❄️',
    description: 'Clean executive aesthetic with subtle cooler highlights',
    css: 'brightness(1.03) contrast(1.12) saturate(0.92)',
    badgeColor: '#818cf8',
  },
  {
    id: 'cinematic-noir',
    name: 'Cinematic Noir',
    tag: 'Classic B&W',
    icon: '🎬',
    description: 'High-contrast black & white documentary film style',
    css: 'grayscale(1) contrast(1.28) brightness(1.05)',
    badgeColor: '#e2e8f0',
  },
  {
    id: 'soft-glow',
    name: 'Soft Beauty Glow',
    tag: 'Skin Smoothing',
    icon: '🌸',
    description: 'Soft-light diffusion with gentle skin-smoothing warmth',
    css: 'brightness(1.07) contrast(1.03) saturate(1.14)',
    badgeColor: '#ec4899',
  },
  {
    id: 'high-contrast',
    name: 'Dramatic Contrast',
    tag: 'Deep Blacks',
    icon: '⚡',
    description: 'Deep shadows, punchy edge definition, and bright highlights',
    css: 'contrast(1.26) brightness(1.02) saturate(1.16)',
    badgeColor: '#f59e0b',
  },
]

export interface FilterAdjustments {
  brightness: number // 80 - 130 (default 100)
  contrast: number   // 80 - 140 (default 100)
  saturation: number // 50 - 160 (default 100)
}

export function computeFilterCss(
  presetId: string,
  adjustments: FilterAdjustments = { brightness: 100, contrast: 100, saturation: 100 },
): string {
  const preset = VIDEO_FILTERS.find(f => f.id === presetId) || VIDEO_FILTERS[0]

  const isAdjusted =
    adjustments.brightness !== 100 ||
    adjustments.contrast !== 100 ||
    adjustments.saturation !== 100

  if (!isAdjusted) {
    return preset.css
  }

  const adjParts: string[] = []
  if (adjustments.brightness !== 100) adjParts.push(`brightness(${adjustments.brightness / 100})`)
  if (adjustments.contrast !== 100) adjParts.push(`contrast(${adjustments.contrast / 100})`)
  if (adjustments.saturation !== 100) adjParts.push(`saturate(${adjustments.saturation / 100})`)

  if (preset.id === 'normal' || preset.css === 'none') {
    return adjParts.join(' ')
  }

  return `${preset.css} ${adjParts.join(' ')}`
}
