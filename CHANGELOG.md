# Changelog

## 2.1.0 — Final source handoff

- Added Windows quick-start and build-check scripts.
- Added a production-readiness checklist with explicit verification boundaries.
- Bound room signaling and consent events to the expected remote participant ID in the client.
- Reset remote identity and queued ICE candidates when leaving or re-entering rooms.

## 2.0.0 — Product MVP hardening

- Reworked landing and meeting workspace with responsive visual hierarchy.
- Added 12-character invite links and direct room join from URL.
- Added Supabase RPC room reservations with a database-enforced host/guest seat limit.
- Replaced broad Realtime topic access with private-channel membership checks.
- Added explicit guest consent plus host consent before recording.
- Added visible recording status for the guest.
- Added optional browser screen/window/tab video to the local recording layout.
- Added participant picture-in-picture on screen recordings.
- Added audio mixing of both microphone tracks with a compressor.
- Added preview, Save As support on Chromium, and download fallback.
- Added browser autoplay recovery, permission errors, room expiry, security headers, favicon, social metadata, and setup documentation.

## Known limits in this MVP

- No TURN relay bundled; restrictive networks may not connect.
- Screen system audio is intentionally excluded; the two microphone tracks are included.
- Screen capture is recorded locally by the host and is not transmitted to the guest.
- Long recordings are held in browser memory until saved.
- No independent production security, accessibility, cross-browser, or load audit has been performed.
