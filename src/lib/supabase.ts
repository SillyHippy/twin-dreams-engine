import { createClient } from '@supabase/supabase-js';
import { ACTIVE_BACKEND, BACKEND_PROVIDER } from '@/config/backendConfig';

// Supabase is no longer used in this project, but keeping this file with minimum code
// to prevent import errors until all references are removed
export const supabase = createClient('https://placeholder.supabase.co', 'placeholder-anon-key');

export default supabase;
