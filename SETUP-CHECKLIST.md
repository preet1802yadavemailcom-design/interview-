# InterviewCapture v2 setup checklist

## Supabase
- [ ] Create a Supabase project
- [ ] Enable Anonymous Sign-Ins
- [ ] Run `supabase/schema.sql` in SQL Editor
- [ ] Copy Project URL and publishable/anon key
- [ ] Put values in `client/.env` (never use service-role key)

## Local test
- [ ] Run `cd client && npm install && npm run dev`
- [ ] Open localhost in Chrome/Edge
- [ ] Create a room and share the invite link with a second device/browser
- [ ] Confirm two-way video and audio
- [ ] Guest explicitly grants recording consent
- [ ] Host confirms consent and starts recording
- [ ] Test both voices, side-by-side video, and stop/save
- [ ] Test optional screen/window/tab capture
- [ ] Play the saved WebM file and verify both sides

## GitHub + Cloudflare
- [ ] Create an empty GitHub repository
- [ ] Push the extracted project root (not only `client`)
- [ ] Connect repository to Cloudflare Pages
- [ ] Root directory: `client`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Add all three `VITE_` environment variables in Cloudflare
- [ ] Deploy and test on HTTPS from two networks

## Before inviting real users
- [ ] Configure a TURN relay with short-lived credentials
- [ ] Test 5–15 minute recordings on target devices
- [ ] Review recording consent wording and local legal requirements
- [ ] Add support/contact and privacy-policy pages
