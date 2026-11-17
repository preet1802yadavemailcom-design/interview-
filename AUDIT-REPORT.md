# InterviewCapture — Comprehensive Architectural & Codebase Audit Report

**Date:** November 2026  
**Auditor:** Principal Software Architect & Senior Engineering Team  
**Scope:** Full-stack audit of InterviewCapture codebase (React 19, TypeScript, Vite, Supabase Realtime/RPC, WebRTC, MediaRecorder, Web Audio API, Canvas composition, Security, and Cloudflare Pages deployment).

---

## 1. Executive Summary

InterviewCapture is architected as a two-person, browser-to-browser interview room with local-first recording. Video and audio media are transmitted peer-to-peer over WebRTC, while room presence and signaling are orchestrated via Supabase Realtime over private channels. Recordings are composed directly in the browser using the Canvas API and Web Audio API, then captured via MediaRecorder into a local WebM file saved directly to the host's storage.

The core concept is sound and privacy-preserving. However, several critical gaps, architectural vulnerabilities, and missing production requirements were identified during this audit.

---

## 2. Inventory of Existing Components

| Path | Purpose | Audit Status |
|------|---------|--------------|
| `client/src/App.tsx` | Main application shell, state machine, and meeting room UI | **Needs Improvement** (signaling edge cases, screen audio omission, error resilience) |
| `client/src/lib/room.ts` | Supabase anonymous auth, RPC room reservations, signaling | **Good foundation**, needs stricter typing and disconnect cleanup |
| `client/src/lib/webrtc.ts` | WebRTC PeerConnection factory and ICE configuration | **Incomplete** (STUN only, no configurable TURN, no credential support) |
| `client/src/lib/recorder.ts` | Canvas 1080p composite, Web Audio mixing, MediaRecorder | **Incomplete** (no screen audio capture, camera-off fallback missing, picker error fallback) |
| `client/src/lib/supabase.ts` | Supabase client initialization | **Good**, verifies environment configuration |
| `client/src/styles.css` | SaaS theme styling | **Solid**, needs visual refinement for purpose consent & responsive polish |
| `supabase/schema.sql` | PostgreSQL schema, RLS, RPCs, and Realtime RLS policies | **Strong design**, needs idempotency verification and documentation |
| `client/package.json` | Dependencies and build scripts | **Missing test framework** (no Vitest / unit test runner) |
| `START-LOCAL-WINDOWS.bat` | Windows quickstart helper | **Good** |
| `BUILD-CHECK-WINDOWS.bat` | Windows build verification helper | **Good** |

---

## 3. Detailed Audit Findings

### A. WebRTC & Signaling Reliability
1. **STUN-Only Limitation & Missing TURN Support:**
   - *Finding:* `webrtc.ts` hardcodes only public Google STUN servers. STUN cannot establish direct P2P connections across symmetric NATs or restrictive enterprise/campus firewalls (accounting for 15–20% of internet connections).
   - *Fix:* Implement configurable ICE server configuration supporting STUN and TURN/TURNS via environment variables (`VITE_ICE_SERVERS`, `VITE_TURN_URL`, `VITE_TURN_USERNAME`, `VITE_TURN_CREDENTIAL`), plus secure ephemeral credential fetching.

2. **Early ICE Candidate Discarding Race Condition:**
   - *Finding:* In `App.tsx`, incoming signals are rejected early if `expectedRemoteId` is not yet populated (`if (!expectedRemoteId || message.from !== expectedRemoteId) return`). If ICE candidates arrive before presence sync populates the remote participant ID, those candidates are discarded permanently rather than queued.
   - *Fix:* Ensure ICE candidate queuing handles early candidates before remote peer description is set, keyed by sender ID.

3. **Reconnection & State Collision on Renegotiation:**
   - *Finding:* If a participant disconnects and reconnects or reloads the browser, `ensurePeer()` returns the existing `pcRef.current` even if its `signalingState` is closed or mismatched, causing `InvalidStateError` when setting remote descriptions.
   - *Fix:* Reset and re-instantiate peer connection cleanly whenever a fresh offer is received or connection enters failed/closed state.

### B. Recording Engine & Audio Mixing
1. **Omission of Screen Audio:**
   - *Finding:* In `App.tsx`, `getDisplayMedia` is invoked with `audio: false`, and `recorder.ts` only extracts audio from `localStream` and `remoteStream`. System or tab audio shared by the interviewer is never captured.
   - *Fix:* Request `audio: true` in `getDisplayMedia`, check if screen audio tracks are provided by the browser, and route them into the Web Audio dynamic compressor node alongside microphone tracks. Document browser limitations (supported on Chrome/Edge on Windows/Mac/Linux; not supported on Safari).

2. **Camera-Off Visual State During Recording:**
   - *Finding:* When a participant turns off their camera (`track.enabled = false`), the canvas recorder continues drawing the frozen video frame or blank region.
   - *Fix:* Render a styled participant placeholder with user initials/avatar and "Camera Muted" badge when video tracks are disabled or unavailable.

3. **File System Access API Fallback Resilience:**
   - *Finding:* In `recorder.ts`, `saveRecording` catches `AbortError` (user cancel), but any `SecurityError` or browser picker rejection throws an unhandled error instead of gracefully falling back to standard anchor download.
   - *Fix:* Wrap picker in try-catch that transparently falls back to `URL.createObjectURL` and anchor download upon any picker failure.

### C. Consent & Privacy Workflow
1. **Recording Purpose Specification:**
   - *Finding:* The host could initiate recording without declaring the specific purpose of the interview session, leaving guests unsure of what they were consenting to.
   - *Fix:* Allow host to specify the recording purpose (e.g., "Technical Interview", "User Research", "Internal Review"). Broadcast the purpose to the guest in the consent prompt, requiring mutual explicit confirmation before recording can start.

### D. Supabase & Database Security
1. **Private Realtime Authorization:**
   - *Finding:* RLS on `realtime.messages` verifies `interview_room_members` membership via `split_part(realtime.topic(), ':', 2)`. This is a strong model. However, error feedback when Realtime is disabled or misconfigured in the Supabase dashboard was not clear enough for beginners.
   - *Fix:* Enhance error handling and document exact Supabase dashboard settings (Anonymous Auth, Realtime Broadcast authorization). Ensure schema is re-runnable without errors.

2. **No Cloud Leakage:**
   - *Finding:* Confirmed zero video/audio storage in Supabase. The database strictly stores room reservations, role tokens, display names, and automatic 4-hour expiry timestamps.

### E. Quality Assurance & Automated Testing
1. **No Automated Test Pipeline:**
   - *Finding:* `client/package.json` had no unit testing framework installed. Tests could not be executed from the terminal.
   - *Fix:* Install `vitest` and `@testing-library/react` with jsdom, and create comprehensive unit/integration test suites covering room code generation, ICE configuration, audio mixing logic, WebRTC signaling state machine, and file saving fallbacks.

---

## 4. Remediation Plan

1. **Step 1:** Install `vitest` and test dependencies.
2. **Step 2:** Refactor `webrtc.ts` to support configurable STUN/TURN servers with fallback.
3. **Step 3:** Upgrade `recorder.ts` to support screen audio mixing, camera-off canvas placeholders, and fail-safe file saving.
4. **Step 4:** Enhance `App.tsx` with recording purpose consent flow, robust signaling/reconnection, and refined UI indicators.
5. **Step 5:** Write unit test suites in `client/src/__tests__/` and verify test suite passes.
6. **Step 6:** Validate TypeScript compilation and production Vite build.
7. **Step 7:** Update all documentation (`README.md`, `SETUP-GUIDE.md`, `SUPABASE-SETUP.md`, `CLOUDFLARE-DEPLOYMENT.md`, `SECURITY-REVIEW.md`, `TEST-REPORT.md`, `PRODUCTION-READINESS.md`).
8. **Step 8:** Package clean production release `InterviewCapture-Final-Production.zip`.
