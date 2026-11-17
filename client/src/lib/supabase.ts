import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isPlaceholderConfig = Boolean(
  !url ||
  !key ||
  url.includes('YOUR_PROJECT_REF') ||
  key.includes('YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY')
)

export const hasSupabaseConfig = Boolean(
  url &&
  key &&
  url.startsWith('https://') &&
  !isPlaceholderConfig
)

export const supabase = hasSupabaseConfig
  ? createClient(url!, key!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      realtime: { params: { eventsPerSecond: 15 } },
    })
  : null

