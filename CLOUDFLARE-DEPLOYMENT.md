# InterviewCapture — Cloudflare Pages Deployment Guide

This guide covers deploying InterviewCapture to **Cloudflare Pages** with automated GitHub continuous deployment or direct upload.

---

## 1. Cloudflare Pages Architecture

InterviewCapture compiles into a high-performance, single-page application (SPA) consisting of static HTML, CSS, JavaScript, and WebAssembly/SVG assets.

- **Frontend Hosting:** Cloudflare Global Edge Network (free tier covers 100+ projects and unlimited requests).
- **SPA Routing:** Configured via `client/public/_redirects` (`/* /index.html 200`).
- **Security Headers:** Configured via `client/public/_headers` (Permissions-Policy for camera/microphone, nosniff, frame protection).
- **Media Privacy:** All recordings happen in the visitor's browser. No cloud media storage is used.

---

## 2. Option A: Deploy via GitHub (Recommended)

### Step 1: Push Code to GitHub
1. Open a terminal in the project root:
   ```powershell
   git init
   git add .
   git commit -m "Complete InterviewCapture production build"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/interviewcapture.git
   git push -u origin main
   ```

### Step 2: Connect to Cloudflare Pages
1. Sign in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left navigation, go to **Compute (Workers & Pages)** > **Pages**.
3. Click **Create application** > **Connect to Git**.
4. Select your GitHub repository (`interviewcapture`).
5. Set the **Build configuration**:
   - **Framework preset:** `Vite` (or `None`)
   - **Root directory:** `client`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node.js version:** Cloudflare uses Node 18 or 20 by default. In **Environment variables**, you can optionally add:
     - `NODE_VERSION`: `22`

### Step 3: Add Environment Variables in Cloudflare
Under **Settings** > **Environment variables** (or during project creation):
Add the following production variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://YOUR_PROJECT_ID.supabase.co` | Your live Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Public publishable anon key (safe in browser) |
| `VITE_APP_NAME` | `InterviewCapture` | App name shown in header and titles |
| `VITE_TURN_URL` *(Optional)* | `turn:turn.example.com:3478` | Optional TURN relay for symmetric NAT |
| `VITE_TURN_USERNAME` *(Optional)* | `username` | Optional TURN username |
| `VITE_TURN_CREDENTIAL` *(Optional)* | `password` | Optional TURN password |

Click **Save and Deploy**. Cloudflare will clone, build, and deploy your site in ~45 seconds.

---

## 3. Option B: Direct Drag-and-Drop / Wrangler Deploy

If you prefer deploying without connecting a GitHub repository:

1. Build the production bundle locally:
   ```powershell
   cd client
   npm run build
   ```
2. In Cloudflare Dashboard, go to **Compute (Workers & Pages)** > **Pages** > **Create application** > **Upload assets**.
3. Give your project a name (e.g. `interviewcapture`).
4. Drag and drop the `client/dist` directory into the browser upload box.
5. Add your environment variables in the Cloudflare Pages project settings, then click **Deploy**.

---

## 4. Custom Domain & SSL Verification

1. In Cloudflare Pages, go to **Custom domains** > **Set up a custom domain**.
2. Enter your domain (e.g. `interview.yourdomain.com`).
3. Cloudflare will automatically provision a free universal SSL/TLS certificate.
4. **Important:** WebRTC and camera/microphone access require HTTPS. Cloudflare Pages enforces HTTPS automatically.

---

## 5. Deployment Verification Checklist

- [x] Cloudflare root directory is set to `client`.
- [x] Build command is `npm run build`.
- [x] Output directory is `dist`.
- [x] `_redirects` file routes unknown paths to `/index.html` (prevents 404 on room refresh).
- [x] `_headers` applies strict security policies.
- [x] `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are saved in Pages environment variables.
