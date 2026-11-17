import { createClient } from '@supabase/supabase-js'

const defaultUrl = 'https://psvvuyvfrjdeyhajwkug.supabase.co'
const defaultKey = 'sb_publishable_Iv3XlTwXuTg-Ki83TaAzmg_8w3gfpcd'

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || defaultUrl
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || defaultKey

export const isPlaceholderConfig = Boolean(
  !rawUrl ||
  !rawKey ||
  rawUrl.includes('YOUR_PROJECT_REF') ||
  rawKey.includes('YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY')
)

export const hasSupabaseConfig = Boolean(
  rawUrl &&
  rawKey &&
  rawUrl.startsWith('https://') &&
  !isPlaceholderConfig
)

export const supabase = hasSupabaseConfig
  ? createClient(rawUrl, rawKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      realtime: { params: { eventsPerSecond: 15 } },
    })
  : null

