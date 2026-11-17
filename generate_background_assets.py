import os

assets_dir = r"C:\Users\Preet Yadav\.gemini\antigravity\scratch\InterviewCapture\client\public\assets"
os.makedirs(assets_dir, exist_ok=True)

# 1. bg_dot_grid.svg - subtle high-tech dot grid pattern
dot_grid_svg = """<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <circle cx="2" cy="2" r="1" fill="rgba(255, 255, 255, 0.08)" />
  <circle cx="22" cy="22" r="1.2" fill="rgba(255, 107, 0, 0.12)" />
</svg>"""

with open(os.path.join(assets_dir, "bg_dot_grid.svg"), "w", encoding="utf-8") as f:
    f.write(dot_grid_svg)

# 2. bg_cyber_mesh.svg - futuristic grid lines with subtle glowing cross points
cyber_mesh_svg = """<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grid-grad-x" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ff6b00" stop-opacity="0.04" />
      <stop offset="50%" stop-color="#8a46ff" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#ff6b00" stop-opacity="0.04" />
    </linearGradient>
  </defs>
  <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1" />
  <circle cx="0" cy="0" r="1.5" fill="#ff6b00" opacity="0.3" />
  <circle cx="100" cy="0" r="1.5" fill="#8a46ff" opacity="0.3" />
  <circle cx="0" cy="100" r="1.5" fill="#8a46ff" opacity="0.3" />
  <circle cx="100" cy="100" r="1.5" fill="#ff6b00" opacity="0.3" />
</svg>"""

with open(os.path.join(assets_dir, "bg_cyber_mesh.svg"), "w", encoding="utf-8") as f:
    f.write(cyber_mesh_svg)

# 3. bg_how_it_works_flow.svg - connected workflow visual route with glowing nodes
how_it_works_svg = """<svg width="1200" height="120" viewBox="0 0 1200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="route-glow" x1="0%" y1="50%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#ff6b00" stop-opacity="0.6" />
      <stop offset="50%" stop-color="#8a46ff" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#ff6b00" stop-opacity="0.7" />
    </linearGradient>
    <linearGradient id="route-glow-subtle" x1="0%" y1="50%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#ff6b00" stop-opacity="0.12" />
      <stop offset="50%" stop-color="#8a46ff" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#ff6b00" stop-opacity="0.12" />
    </linearGradient>
    <filter id="blur-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <!-- Ambient glow line -->
  <path d="M 120 60 L 600 60 L 1080 60" stroke="url(#route-glow)" stroke-width="4" filter="url(#blur-glow)" opacity="0.4" />
  <!-- Crisp dashed connection track -->
  <path d="M 120 60 L 600 60 L 1080 60" stroke="url(#route-glow-subtle)" stroke-width="2" stroke-dasharray="6 6" />
  <!-- Circuit node ticks -->
  <circle cx="120" cy="60" r="18" fill="rgba(255, 107, 0, 0.08)" stroke="#ff6b00" stroke-width="1.5" stroke-dasharray="3 3" />
  <circle cx="600" cy="60" r="18" fill="rgba(138, 70, 255, 0.08)" stroke="#8a46ff" stroke-width="1.5" stroke-dasharray="3 3" />
  <circle cx="1080" cy="60" r="18" fill="rgba(255, 107, 0, 0.08)" stroke="#ff6b00" stroke-width="1.5" stroke-dasharray="3 3" />
  <!-- Pulse points -->
  <circle cx="360" cy="60" r="3" fill="#ff6b00" opacity="0.7" />
  <circle cx="840" cy="60" r="3" fill="#8a46ff" opacity="0.7" />
</svg>"""

with open(os.path.join(assets_dir, "bg_how_it_works_flow.svg"), "w", encoding="utf-8") as f:
    f.write(how_it_works_svg)

# 4. feature_bg_interviews.svg - live video broadcast, dual camera rays, and sound wave
feature_interviews_svg = """<svg width="320" height="240" viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="cam-glow" cx="80%" cy="20%" r="70%">
      <stop offset="0%" stop-color="#ff6b00" stop-opacity="0.18" />
      <stop offset="60%" stop-color="#ff6b00" stop-opacity="0.04" />
      <stop offset="100%" stop-color="#ff6b00" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="320" height="240" fill="url(#cam-glow)" />
  <!-- Subtle aperture / broadcast waves -->
  <circle cx="270" cy="50" r="60" stroke="#ff6b00" stroke-width="1" stroke-opacity="0.12" stroke-dasharray="4 4" />
  <circle cx="270" cy="50" r="40" stroke="#ff6b00" stroke-width="1" stroke-opacity="0.18" />
  <circle cx="270" cy="50" r="20" stroke="#ff6b00" stroke-width="1" stroke-opacity="0.25" stroke-dasharray="2 3" />
  <!-- Audio sine wave lines -->
  <path d="M 10 200 C 40 185, 70 215, 100 200 C 130 185, 160 215, 190 200 C 220 185, 250 215, 280 200 C 295 192, 310 205, 320 200" 
        stroke="#ff6b00" stroke-width="1.5" stroke-opacity="0.14" fill="none" />
  <path d="M 10 215 C 40 205, 70 225, 100 215 C 130 205, 160 225, 190 215 C 220 205, 250 225, 280 215 C 295 210, 310 220, 320 215" 
        stroke="#ff6b00" stroke-width="1" stroke-opacity="0.08" fill="none" />
</svg>"""

with open(os.path.join(assets_dir, "feature_bg_interviews.svg"), "w", encoding="utf-8") as f:
    f.write(feature_interviews_svg)

# 5. feature_bg_screen.svg - holographic display grid & floating window frames
feature_screen_svg = """<svg width="320" height="240" viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="screen-glow" cx="80%" cy="20%" r="70%">
      <stop offset="0%" stop-color="#8a46ff" stop-opacity="0.2" />
      <stop offset="60%" stop-color="#8a46ff" stop-opacity="0.04" />
      <stop offset="100%" stop-color="#8a46ff" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="320" height="240" fill="url(#screen-glow)" />
  <!-- Holographic floating window frame -->
  <rect x="180" y="30" width="120" height="85" rx="8" stroke="#8a46ff" stroke-width="1.5" stroke-opacity="0.22" fill="rgba(138, 70, 255, 0.03)" />
  <line x1="180" y1="48" x2="300" y2="48" stroke="#8a46ff" stroke-width="1" stroke-opacity="0.15" />
  <circle cx="192" cy="39" r="2" fill="#8a46ff" opacity="0.4" />
  <circle cx="200" cy="39" r="2" fill="#8a46ff" opacity="0.3" />
  <circle cx="208" cy="39" r="2" fill="#8a46ff" opacity="0.3" />
  <!-- Nested PiP frame -->
  <rect x="235" y="65" width="55" height="40" rx="4" stroke="#ff6b00" stroke-width="1.2" stroke-opacity="0.28" fill="rgba(255, 107, 0, 0.05)" />
  <!-- Screen grid lines -->
  <line x1="150" y1="160" x2="310" y2="160" stroke="#8a46ff" stroke-width="1" stroke-opacity="0.1" stroke-dasharray="4 4" />
  <line x1="150" y1="180" x2="310" y2="180" stroke="#8a46ff" stroke-width="1" stroke-opacity="0.08" stroke-dasharray="4 4" />
  <line x1="150" y1="200" x2="310" y2="200" stroke="#8a46ff" stroke-width="1" stroke-opacity="0.06" stroke-dasharray="4 4" />
</svg>"""

with open(os.path.join(assets_dir, "feature_bg_screen.svg"), "w", encoding="utf-8") as f:
    f.write(feature_screen_svg)

# 6. feature_bg_recording.svg - local disk write & NVMe stream channels
feature_recording_svg = """<svg width="320" height="240" viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="rec-disk-glow" cx="80%" cy="25%" r="70%">
      <stop offset="0%" stop-color="#ff6b00" stop-opacity="0.2" />
      <stop offset="60%" stop-color="#ff6b00" stop-opacity="0.04" />
      <stop offset="100%" stop-color="#ff6b00" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="320" height="240" fill="url(#rec-disk-glow)" />
  <!-- Hard disk platter rings -->
  <ellipse cx="250" cy="70" rx="55" ry="32" stroke="#ff6b00" stroke-width="1.5" stroke-opacity="0.2" fill="rgba(255,107,0,0.02)" />
  <ellipse cx="250" cy="70" rx="36" ry="20" stroke="#ff6b00" stroke-width="1" stroke-opacity="0.25" stroke-dasharray="3 3" />
  <ellipse cx="250" cy="70" rx="16" ry="9" stroke="#ff6b00" stroke-width="1.5" stroke-opacity="0.35" fill="rgba(255,107,0,0.08)" />
  <!-- Data stream downward lines -->
  <path d="M 230 115 L 230 190" stroke="#ff6b00" stroke-width="1.5" stroke-opacity="0.25" stroke-dasharray="4 4" />
  <path d="M 250 115 L 250 205" stroke="#ff6b00" stroke-width="2" stroke-opacity="0.3" stroke-dasharray="6 3" />
  <path d="M 270 115 L 270 185" stroke="#ff6b00" stroke-width="1.5" stroke-opacity="0.2" stroke-dasharray="4 4" />
  <polygon points="250,212 245,203 255,203" fill="#ff6b00" opacity="0.4" />
</svg>"""

with open(os.path.join(assets_dir, "feature_bg_recording.svg"), "w", encoding="utf-8") as f:
    f.write(feature_recording_svg)

# 7. feature_bg_privacy.svg - cryptographic shield & biometric rings
feature_privacy_svg = """<svg width="320" height="240" viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="priv-glow" cx="80%" cy="25%" r="70%">
      <stop offset="0%" stop-color="#8a46ff" stop-opacity="0.2" />
      <stop offset="60%" stop-color="#8a46ff" stop-opacity="0.04" />
      <stop offset="100%" stop-color="#8a46ff" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="320" height="240" fill="url(#priv-glow)" />
  <!-- Security Shield Silhouette -->
  <path d="M 255 35 Q 285 35, 290 55 C 290 95, 255 125, 255 130 C 255 125, 220 95, 220 55 Q 225 35, 255 35 Z" 
        stroke="#8a46ff" stroke-width="1.5" stroke-opacity="0.25" fill="rgba(138, 70, 255, 0.04)" />
  <!-- Inner lock core -->
  <rect x="247" y="70" width="16" height="13" rx="3" fill="#8a46ff" opacity="0.3" />
  <path d="M 251 70 L 251 65 C 251 62.5, 259 62.5, 259 65 L 259 70" stroke="#8a46ff" stroke-width="1.5" stroke-opacity="0.4" fill="none" />
  <!-- Biometric ripple rings -->
  <circle cx="255" cy="76" r="42" stroke="#8a46ff" stroke-width="1" stroke-opacity="0.12" stroke-dasharray="3 4" />
  <circle cx="255" cy="76" r="60" stroke="#8a46ff" stroke-width="1" stroke-opacity="0.08" stroke-dasharray="6 6" />
</svg>"""

with open(os.path.join(assets_dir, "feature_bg_privacy.svg"), "w", encoding="utf-8") as f:
    f.write(feature_privacy_svg)

# 8. bg_vault_circuit.svg - secure vault circuit trace for the privacy banner
vault_circuit_svg = """<svg width="1200" height="240" viewBox="0 0 1200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="vault-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff6b00" stop-opacity="0.15" />
      <stop offset="50%" stop-color="#8a46ff" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#ff6b00" stop-opacity="0.15" />
    </linearGradient>
  </defs>
  <!-- Circuit traces connecting to the center -->
  <path d="M 50 40 L 200 40 L 250 90 L 450 90" stroke="#ff6b00" stroke-width="1.5" stroke-opacity="0.15" fill="none" />
  <circle cx="50" cy="40" r="3" fill="#ff6b00" opacity="0.3" />
  <circle cx="450" cy="90" r="3" fill="#ff6b00" opacity="0.4" />
  
  <path d="M 1150 200 L 1000 200 L 950 150 L 750 150" stroke="#8a46ff" stroke-width="1.5" stroke-opacity="0.15" fill="none" />
  <circle cx="1150" cy="200" r="3" fill="#8a46ff" opacity="0.3" />
  <circle cx="750" cy="150" r="3" fill="#8a46ff" opacity="0.4" />

  <path d="M 100 200 L 180 120 L 320 120" stroke="#8a46ff" stroke-width="1" stroke-opacity="0.1" stroke-dasharray="4 4" fill="none" />
  <path d="M 1100 40 L 1020 120 L 880 120" stroke="#ff6b00" stroke-width="1" stroke-opacity="0.1" stroke-dasharray="4 4" fill="none" />
</svg>"""

with open(os.path.join(assets_dir, "bg_vault_circuit.svg"), "w", encoding="utf-8") as f:
    f.write(vault_circuit_svg)

# 9. bg_storage_telemetry.svg - audio/video frequency & bitrate waveform
storage_telemetry_svg = """<svg width="1200" height="260" viewBox="0 0 1200 260" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="telemetry-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ff6b00" stop-opacity="0.18" />
      <stop offset="50%" stop-color="#8a46ff" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#10b981" stop-opacity="0.18" />
    </linearGradient>
  </defs>
  <!-- Frequency spectrum bars -->
  <g opacity="0.12">
    <rect x="50" y="160" width="4" height="40" fill="#ff6b00" rx="2" />
    <rect x="62" y="140" width="4" height="60" fill="#ff6b00" rx="2" />
    <rect x="74" y="170" width="4" height="30" fill="#ff6b00" rx="2" />
    <rect x="86" y="130" width="4" height="70" fill="#ff6b00" rx="2" />
    <rect x="98" y="150" width="4" height="50" fill="#ff6b00" rx="2" />
    <rect x="110" y="120" width="4" height="80" fill="#ff6b00" rx="2" />
    <rect x="122" y="165" width="4" height="35" fill="#ff6b00" rx="2" />
    <rect x="134" y="145" width="4" height="55" fill="#ff6b00" rx="2" />

    <rect x="1050" y="140" width="4" height="60" fill="#10b981" rx="2" />
    <rect x="1062" y="120" width="4" height="80" fill="#10b981" rx="2" />
    <rect x="1074" y="150" width="4" height="50" fill="#10b981" rx="2" />
    <rect x="1086" y="135" width="4" height="65" fill="#10b981" rx="2" />
    <rect x="1098" y="160" width="4" height="40" fill="#10b981" rx="2" />
    <rect x="1110" y="125" width="4" height="75" fill="#10b981" rx="2" />
  </g>
  <!-- Continuous telemetry sine curve -->
  <path d="M 0 190 Q 150 130, 300 190 T 600 190 T 900 190 T 1200 190" stroke="url(#telemetry-grad)" stroke-width="2" fill="none" opacity="0.3" />
  <path d="M 0 190 Q 150 230, 300 190 T 600 190 T 900 190 T 1200 190" stroke="url(#telemetry-grad)" stroke-width="1.2" stroke-dasharray="4 4" fill="none" opacity="0.2" />
</svg>"""

with open(os.path.join(assets_dir, "bg_storage_telemetry.svg"), "w", encoding="utf-8") as f:
    f.write(storage_telemetry_svg)

# 10. bg_faq_shield.svg - subtle knowledge security motif
faq_shield_svg = """<svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="faq-shield-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff6b00" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#ff6b00" stop-opacity="0" />
    </radialGradient>
  </defs>
  <circle cx="200" cy="200" r="180" fill="url(#faq-shield-glow)" />
  <path d="M 200 70 Q 280 70, 300 120 C 300 230, 200 310, 200 320 C 200 310, 100 230, 100 120 Q 120 70, 200 70 Z" 
        stroke="#ff6b00" stroke-width="2" stroke-opacity="0.12" stroke-dasharray="6 6" fill="rgba(255, 107, 0, 0.02)" />
  <path d="M 200 110 Q 260 110, 275 145 C 275 225, 200 280, 200 290 C 200 280, 125 225, 125 145 Q 140 110, 200 110 Z" 
        stroke="#8a46ff" stroke-width="1.5" stroke-opacity="0.15" fill="none" />
</svg>"""

with open(os.path.join(assets_dir, "bg_faq_shield.svg"), "w", encoding="utf-8") as f:
    f.write(faq_shield_svg)

print("All 10 background SVGs generated successfully!")
