import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wjlubflnnsysqadwsopc.supabase.co';
const supabaseKey = 'sb_publishable_frYCQf6xYKSoxBsoIkW0Wg_dkYGM5Te';

export const supabase = createClient(supabaseUrl, supabaseKey);