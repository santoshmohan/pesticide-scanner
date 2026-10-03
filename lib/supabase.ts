import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

// Client-side (Anon Key) - Read-only, RLS protected
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server-side only (Service Role Key) - Full access, bypasses RLS
export const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { 
    auth: { persistSession: false }
  }
);