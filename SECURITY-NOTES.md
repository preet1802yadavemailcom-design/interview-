# Security notes

- Browser frontend uses only the Supabase publishable/anon key. Never add a service-role or secret key to `client/.env` or a GitHub repository.
- Supabase RPC functions create and reserve host/guest memberships. The unique `(room_code, role)` constraint limits each room to one host and one guest.
- Private Realtime channel authorization checks that the signed-in user has a membership row for the matching room code.
- Invite codes are random 12-character bearer links. Share them only with the intended participant.
- Rooms expire after four hours. The host should use **Leave room** to close the room immediately. Browser crashes may leave a reservation until expiry.
- Recording files stay in the host browser and are not uploaded to Supabase.
- Use HTTPS in production. Camera, microphone, and screen capture are restricted by browser security.
- STUN-only WebRTC is not reliable on every network. Add a TURN relay with temporary credentials for production use.
- This starter has not undergone an independent penetration test, privacy audit, load test, or legal review.
