# Architecture

```text
Host browser                         Guest browser
  Camera + mic                         Camera + mic
      |                                    |
      +----------- WebRTC P2P -------------+
                     |
              Supabase Realtime
         (private signaling + presence)
                     |
       Host's local recording pipeline
                     |
      +--------------+---------------+
      |                              |
  Canvas video                 Web Audio mix
  (two cameras,                 (host mic +
   optional screen)              guest mic)
      |                              |
      +----------- MediaRecorder ----+
                     |
               WebM in memory
                     |
                Save As / Download
                     |
                Host's device
```

## Responsibilities

- **Cloudflare Pages:** serves the compiled React/Vite frontend over HTTPS.
- **Supabase Auth:** issues an anonymous browser session so each room participant has a user ID.
- **Supabase Postgres RPC:** creates rooms, reserves one host + one guest seat, and removes membership when participants leave.
- **Supabase Realtime:** private channel presence and short-lived signaling messages (offer, answer, ICE, leave, consent, recording indicator). It does not transport the actual video/audio media.
- **WebRTC:** sends live microphone and camera tracks peer-to-peer.
- **Web Audio API:** combines both microphone streams for the host recording.
- **Canvas + MediaRecorder:** renders both faces side-by-side, or optional screen capture with both faces as picture-in-picture, then records a WebM locally.

## Data boundaries

Supabase stores room code, host/guest membership, display name, and expiry time. WebRTC media and the final recording are not uploaded to Supabase. Screen/window/tab capture is local to the host's browser and is not shared with the guest in this MVP.

## Reliability boundary

Public STUN is included for basic connectivity only. A TURN relay is required for dependable connectivity across restrictive networks. Long recordings consume browser memory because the final WebM is held in memory until the user saves it.
