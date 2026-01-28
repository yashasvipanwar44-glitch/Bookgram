import { createClient } from '@supabase/supabase-js';

// Access environment variables using Vite's import.meta.env
const env = (import.meta as any).env || {};

// Use the provided credentials as default fallbacks if env vars are missing
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://wjlubflnnsysqadwsopc.supabase.co';
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_frYCQf6xYKSoxBsoIkW0Wg_dkYGM5Te';

export const supabase = createClient(supabaseUrl, supabaseKey);