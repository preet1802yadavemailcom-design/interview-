# InterviewCapture — Supabase Setup Guide

This guide walks you through setting up Supabase as the backend signaling and membership layer for InterviewCapture.

> [!IMPORTANT]
> **No Video or Audio is Uploaded to Supabase.**  
> Supabase is strictly used for anonymous user authentication, ephemeral 12-character room reservations, and private Realtime channels for WebRTC signaling (offers, answers, ICE candidates, and consent).

---

## 1. Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) and sign in (or create a free account).
2. Click **New Project**.
3. Fill in:
   - **Name:** `InterviewCapture` (or your choice)
   - **Database Password:** Enter a strong password and save it in a password manager.
   - **Region:** Choose the region closest to your primary interviewers and participants.
4. Click **Create new project** and wait 1–2 minutes for the database to provision.

---

## 2. Enable Anonymous Authentication

InterviewCapture uses anonymous sessions so participants do not have to register with an email or password.

1. In your Supabase dashboard sidebar, navigate to **Authentication** (person icon).
2. Click **Sign In / Providers**.
3. Scroll down to the **Anonymous** section.
4. Toggle **Enable Anonymous Sign-Ins** to **ON**.
5. Click **Save**.

---

## 3. Execute the Database Schema & RLS Policies

1. In your Supabase dashboard sidebar, navigate to the **SQL Editor** (`>_` icon).
2. Click **New Query** (or the `+` button).
3. Open the file [`supabase/schema.sql`](file:///C:/Users/Preet%20Yadav/.gemini/antigravity/scratch/InterviewCapture/supabase/schema.sql) from this project.
4. Copy the entire contents of `supabase/schema.sql` and paste them into the SQL Editor.
5. Click **Run** (or press `Ctrl + Enter`).
6. Verify that the output pane displays: `Success. No rows returned`.

### What This SQL Sets Up:
- **`interview_rooms` Table:** Tracks room codes, host user IDs, and automatic 4-hour expiry timestamps.
- **`interview_room_members` Table:** Enforces a strict 2-participant limit (1 host + 1 guest) with database unique constraints.
- **RPC Functions:** `create_interview_room`, `join_interview_room`, and `leave_interview_room`.
- **Row-Level Security (RLS):** Prevents unauthorized direct writes to the tables.
- **Realtime Private Authorization:** Configures RLS policies on `realtime.messages` so that only verified members of `room:<CODE>` can listen to or send WebRTC signals.

---

## 4. Copy Your API Credentials

1. In your Supabase dashboard sidebar, click **Project Settings** (gear icon at bottom left).
2. Click **API** under Configuration.
3. Locate the following two values:
   - **Project URL:** Looks like `https://abcdefghijklm.supabase.co`
   - **Project API Keys → `anon` `public` key:** A long JWT token labeled `anon` `public`.
   
> [!CAUTION]
> **DO NOT** use the `service_role` secret key! The `service_role` key bypasses all Row-Level Security and must NEVER be placed in frontend code or shared publicly. Only use the public `anon` key.

---

## 5. Configure Your Local App

1. In your project folder, navigate to `client/`.
2. Copy `.env.example` to `.env`:
   ```powershell
   copy client\.env.example client\.env
   ```
3. Open `client\.env` in Notepad:
   ```powershell
   notepad client\.env
   ```
4. Paste your Supabase values:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_APP_NAME=InterviewCapture
   ```
5. Save the file (`Ctrl + S`) and close Notepad.

---

## 6. Verification Checklist

- [x] "Enable Anonymous Sign-Ins" is toggled ON under Authentication.
- [x] `supabase/schema.sql` ran with 0 errors in SQL Editor.
- [x] `client/.env` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- [x] Application successfully connects to the room presence channel.
