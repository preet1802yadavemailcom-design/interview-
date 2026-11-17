# InterviewCapture — Step-by-Step Setup Guide

This guide is written for anyone running or deploying InterviewCapture on Windows 11, macOS, or Linux.

---

## 1. Quick Start (Windows 11)

If you are on Windows 11:

1. **Verify Node.js:**
   Open PowerShell or Command Prompt and run:
   ```cmd
   node -v
   npm -v
   ```
   If Node is not installed, download the current LTS installer from [https://nodejs.org](https://nodejs.org).

2. **One-Click Local Start:**
   Double-click the file [`START-LOCAL-WINDOWS.bat`](file:///C:/Users/Preet%20Yadav/.gemini/antigravity/scratch/InterviewCapture/START-LOCAL-WINDOWS.bat) located in the project root folder.
   - On first run, it creates `client\.env` from `.env.example`.
   - It opens `client\.env` in Notepad so you can insert your Supabase credentials.
   - Once saved and closed, press any key: it installs dependencies and starts the Vite local server.

3. **Verify Build:**
   Double-click [`BUILD-CHECK-WINDOWS.bat`](file:///C:/Users/Preet%20Yadav/.gemini/antigravity/scratch/InterviewCapture/BUILD-CHECK-WINDOWS.bat) to run TypeScript typechecks and production bundling.

---

## 2. Manual Command-Line Setup

### Step 1: Open Terminal in the `client` Directory
```powershell
cd client
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```powershell
copy .env.example .env
```
Open `.env` in your text editor:
```powershell
notepad .env
```
Fill in your Supabase project credentials:
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_APP_NAME=InterviewCapture
```

### Step 3: Install Dependencies
```powershell
npm install
```

### Step 4: Run Automated Tests
```powershell
npm test
```
This runs the Vitest test suite covering room codes, WebRTC configurations, audio mixing, and file saving.

### Step 5: Start the Development Server
```powershell
npm run dev
```
Open the localhost URL displayed in the terminal (typically `http://localhost:5173`).

---

## 3. How to Test a Meeting Call (Two Participants on One Machine)

Because Supabase tracks one membership per browser session:

1. **Open Host Window:** Open Chrome or Edge normally at `http://localhost:5173`.
   - Enter your name (e.g. "Interviewer").
   - Click **Create interview room**.
   - Allow camera and microphone access.
   - Click the **Copy invite code** or **Share invite** button.

2. **Open Guest Window:** Open an **Incognito / Private Window** (or a second browser such as Firefox or Edge).
   - Paste the invite link into the address bar (or enter the 12-character code).
   - Enter your name (e.g. "Candidate").
   - Click **Join interview room**.
   - Allow camera and microphone access.

3. **Verify Live Call:**
   - Both windows will automatically negotiate WebRTC peer-to-peer audio and video.
   - The status in both windows will change to `Connected (P2P) · audio and video are live`.

4. **Test Mutual Consent & Recording:**
   - On the Guest window, view the **Recording Consent** card displaying the interview purpose.
   - Click **I Agree**.
   - On the Host window, verify the checkbox **I confirm recording consent & purpose** is checked.
   - Click **Start recording**.
   - The active red REC indicator and running timer will display on both screens.
   - After testing, click **Stop Recording**.
   - Preview the video, then click **Save recording** to download the WebM file.

---

## 4. Troubleshooting Common Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| `"Supabase is not configured"` | Missing `client/.env` file | Create `client/.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. |
| `"Supabase sign-in failed: Anonymous provider disabled"` | Anonymous auth not enabled in Supabase | Go to Supabase Dashboard > Authentication > Providers > Anonymous, and turn it ON. |
| `"You created this room. Open the invite link on a different browser"` | Opening guest link in same session | Use an Incognito/Private window or a second browser. |
| `"Camera/mic requires secure HTTPS"` | Testing over unencrypted non-localhost IP | Use `http://localhost:5173` or deploy over HTTPS via Cloudflare Pages. |
| WebRTC stuck at `"Connecting…"` on enterprise network | Firewall blocking direct UDP P2P | Configure a TURN relay in `client/.env` via `VITE_TURN_URL`. |
| Browser cannot play participant audio | Browser autoplay policy | Click the **Enable participant audio** button that appears. Wearing headphones is recommended. |
