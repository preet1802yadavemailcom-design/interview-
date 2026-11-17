# InterviewCapture — Instant Hosting & Deployment Guide

This guide explains how to host **InterviewCapture** live on the web for free with 100% privacy, HTTPS, and full Ultra HD recording capabilities.

---

## ⚡ Method 1: Instant Drag & Drop (10 Seconds, Zero Commands)

The easiest and fastest method. No Node.js or terminal required.

### Using Cloudflare Pages (Recommended — Unlimited Free Bandwidth & Free SSL):
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com/) and sign up or log in.
2. In the left sidebar, click **Workers & Pages** > **Pages** > **Create application**.
3. Select the **Upload assets** tab.
4. Project name me daaliye: `interviewcapture` (ya jo bhi aapko pasand ho).
5. Drag and drop the **`client/dist`** folder (ya unzip karke saari files) upload box me daal dijiye.
6. Click **Deploy site**.
7. **Done!** Aapki site instantly live ho jayegi (e.g. `https://interviewcapture.pages.dev`).

### Using Netlify Drop:
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag and drop the **`client/dist`** folder.
3. Site instantly live ho jayegi free HTTPS URL ke saath.

---

## 🚀 Method 2: Git Repository Connect (Automated Deployments)

Best if you want to push updates via GitHub.

### Step 1: Push Codebase to GitHub
```bash
git init
git add .
git commit -m "InterviewCapture production release"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/interviewcapture.git
git push -u origin main
```

### Step 2: Connect to Cloudflare Pages or Vercel

#### On Cloudflare Pages:
* **Root directory:** leave blank (or `client`)
* **Build command:** `npm run build`
* **Build output directory:** `client/dist` (or `dist` if root directory is set to `client`)

#### On Vercel:
* Simply import the GitHub repo. Vercel automatically detects the pre-configured `vercel.json` and configures everything.

#### On Netlify:
* Simply import the GitHub repo. Netlify automatically detects the pre-configured `netlify.toml` and configures everything.

---

## 🔑 Supabase Live Signaling (Two-Person Calls)

InterviewCapture connects participants peer-to-peer via WebRTC using Supabase Realtime for instant handshake signaling.

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **Project Settings** > **API**.
3. Copy your:
   - **Project URL**
   - **anon / public key**
4. In your hosting dashboard (Cloudflare Pages / Vercel / Netlify Settings > **Environment variables**), add:
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOi...`
5. Save & Redeploy.

> **Note:** If Supabase credentials are not added yet, single-user Ultra HD recording, screen sharing, camera filters, audio mixer, and local recording test work immediately out of the box!

---

## 🔒 Security & Privacy Notice
* **Zero Cloud Storage:** All audio and video streams are processed directly in the browser via Web Audio API, Canvas Compositor, and MediaRecorder API.
* **Direct-to-Device Save:** Recordings save directly to the user's hard drive.
* **HTTPS Required:** Browser camera, microphone, and screen recording APIs require HTTPS. Cloudflare, Vercel, and Netlify provide free automatic SSL certificates.
