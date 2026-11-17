# InterviewCapture — Meet. Capture. Save.

**InterviewCapture** is a professional, browser-based two-person interview and meeting recording application.

- **Zero Software Installation:** Both interviewer and guest join directly in any modern desktop browser (Chrome, Edge, Firefox, Brave).
- **Two-Participant Rooms:** Private 12-character invite codes with database-enforced two-seat limit.
- **Local-First Recording:** The video and audio recording is composed and recorded entirely client-side using the Canvas API, Web Audio API, and MediaRecorder API. **Recordings are never uploaded to Supabase or any cloud server.**
- **Dual Microphone Mixing:** Both participants' voices are balanced and mixed with a Web Audio dynamic compressor into a single output audio track.
- **Screen & Tab Capture with Audio:** Optional screen, window, or browser tab capture composed as the main view with participants as picture-in-picture tiles. Includes tab/system audio when shared.
- **Two-Party Mutual Consent:** Technical enforcement of legal recording consent. The host declares the session purpose; the guest explicitly reviews and consents before recording can start.
- **Direct Local Save:** Saves directly to the host's machine using the File System Access API with an automatic browser download fallback.

---

## Architecture

```text
[Host Browser] <============= WebRTC P2P (DTLS-SRTP) =============> [Guest Browser]
  Camera + Mic                                                          Camera + Mic
       |                                                                     |
       +----------------------- Supabase Realtime ---------------------------+
                         (Private Signaling Channel & Presence)
                                         |
                       [PostgreSQL RLS & Membership RPCs]
                                         |
                            Host Recording Pipeline
                         +---------------+---------------+
                         |                               |
                   Canvas 1080p Video            Web Audio Mixer
               (Side-by-side or Screen+PiP;      (Host mic + Guest mic
                camera-off avatar tiles)          + optional screen audio)
                         |                               |
                         +------------ MediaRecorder ----+
                                         |
                                   WebM in Memory
                                         |
                             File System Access / Download
                                         |
                                    Host's Device
```

---

## Project Structure

```text
InterviewCapture/
├── client/                      # Frontend SPA application
│   ├── public/                  # Static assets, favicon, _headers, _redirects
│   ├── src/
│   │   ├── __tests__/           # Vitest automated test suites
│   │   │   ├── recorder.test.ts # Tests for local save & recorder states
│   │   │   ├── room.test.ts     # Tests for room codes & input sanitization
│   │   │   └── webrtc.test.ts   # Tests for ICE & TURN resolution
│   │   ├── lib/
│   │   │   ├── recorder.ts      # Canvas composite, Web Audio mixing & local save
│   │   │   ├── room.ts          # Supabase anonymous auth & Realtime signaling
│   │   │   ├── supabase.ts      # Supabase client instantiation
│   │   │   └── webrtc.ts        # WebRTC PeerConnection & STUN/TURN handling
│   │   ├── App.tsx              # Main meeting room application shell
│   │   ├── main.tsx             # React DOM root entrypoint
│   │   └── styles.css           # Responsive SaaS theme styling
│   ├── .env.example             # Environment variable template
│   ├── package.json             # Scripts & dependencies
│   ├── tsconfig.json            # TypeScript configuration
│   └── vite.config.ts           # Vite & Vitest configuration
├── supabase/
│   └── schema.sql               # PostgreSQL schema, RLS, RPCs & Realtime policies
├── AUDIT-REPORT.md              # Full codebase audit report
├── CLOUDFLARE-DEPLOYMENT.md     # Cloudflare Pages deployment instructions
├── PRODUCTION-READINESS.md      # Production certification matrix
├── SECURITY-REVIEW.md           # Security & threat model review
├── SETUP-GUIDE.md               # Step-by-step setup instructions
├── SUPABASE-SETUP.md            # Supabase dashboard & SQL instructions
├── TEST-REPORT.md               # Automated test execution report
├── START-LOCAL-WINDOWS.bat      # Windows one-click local development launcher
└── BUILD-CHECK-WINDOWS.bat      # Windows one-click build verification
```

---

## Quick Start (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org) v20+ or v22+ (v22.14 LTS recommended)
- A free [Supabase](https://supabase.com) project

### Option A: Windows 1-Click Launcher
Double-click [`START-LOCAL-WINDOWS.bat`](file:///C:/Users/Preet%20Yadav/.gemini/antigravity/scratch/InterviewCapture/START-LOCAL-WINDOWS.bat) in the project root. On first run, it creates `client\.env`, opens it in Notepad for your Supabase credentials, installs dependencies, and boots the Vite dev server.

### Option B: Terminal Setup
1. Navigate into the `client` directory:
   ```bash
   cd client
   ```
2. Copy the environment configuration:
   ```bash
   copy .env.example .env
   ```
3. Open `.env` and fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   VITE_APP_NAME=InterviewCapture
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Run automated test suite:
   ```bash
   npm test
   ```
6. Start the local server:
   ```bash
   npm run dev
   ```
7. Open `http://localhost:5173` in your browser.

---

## Testing Meeting & Recording Locally

To test a two-person interview on a single machine:
1. Open `http://localhost:5173` in a regular Chrome/Edge window.
2. Enter your name and click **Create interview room**.
3. Copy the invite code or invite link.
4. Open an **Incognito / InPrivate Window** (or an alternate browser) and paste the invite link.
5. Enter a guest name and click **Join interview room**.
6. Both windows will connect peer-to-peer.
7. In the Guest window, click **I Agree** on the Recording Consent card.
8. In the Host window, verify the consent checkbox and click **Start recording**.
9. Test screen sharing or microphone muting.
10. Click **Stop Recording**, preview the recording, and click **Save recording** to download the final WebM video.

---

## Production Build & Cloudflare Deployment

To compile the production distribution:
```bash
cd client
npm run build
```

Output is bundled into `client/dist/`.

To deploy to Cloudflare Pages:
1. Push this repository to GitHub.
2. Connect the repository in the **Cloudflare Dashboard** under **Workers & Pages**.
3. Set **Root directory:** `client`, **Build command:** `npm run build`, **Build output:** `dist`.
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your Cloudflare Pages environment variables.
5. For full details, see [`CLOUDFLARE-DEPLOYMENT.md`](file:///C:/Users/Preet%20Yadav/.gemini/antigravity/scratch/InterviewCapture/CLOUDFLARE-DEPLOYMENT.md).

---

## Documentation Links

- [`AUDIT-REPORT.md`](file:///C:/Users/Preet%20Yadav/.gemini/antigravity/scratch/InterviewCapture/AUDIT-REPORT.md) — Architectural and codebase audit findings.
- [`SECURITY-REVIEW.md`](file:///C:/Users/Preet%20Yadav/.gemini/antigravity/scratch/InterviewCapture/SECURITY-REVIEW.md) — Security analysis, threat model, and RLS validation.
- [`TEST-REPORT.md`](file:///C:/Users/Preet%20Yadav/.gemini/antigravity/scratch/InterviewCapture/TEST-REPORT.md) — Terminal test execution results.
- [`SUPABASE-SETUP.md`](file:///C:/Users/Preet%20Yadav/.gemini/antigravity/scratch/InterviewCapture/SUPABASE-SETUP.md) — Database schema and dashboard configuration.
- [`CLOUDFLARE-DEPLOYMENT.md`](file:///C:/Users/Preet%20Yadav/.gemini/antigravity/scratch/InterviewCapture/CLOUDFLARE-DEPLOYMENT.md) — Cloudflare Pages deployment guide.
- [`PRODUCTION-READINESS.md`](file:///C:/Users/Preet%20Yadav/.gemini/antigravity/scratch/InterviewCapture/PRODUCTION-READINESS.md) — Production certification matrix.
