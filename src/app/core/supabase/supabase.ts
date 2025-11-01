import { createClient } from '@supabase/supabase-js'
import { environment } from 'src/environments/environment.prod'

const supabaseUrl = environment.SUPABASE_URL
const supabaseKey = environment.SUPABASE_KEY

// Ensure a single Supabase client instance (prevents Navigator Lock issues on HMR/multiple imports)
function getClient() {
	const g: any = (globalThis as any);
	if (!g.__supabaseClient) {
		g.__supabaseClient = createClient(supabaseUrl, supabaseKey, {
			auth: {
				persistSession: true,
				autoRefreshToken: true,
				detectSessionInUrl: true,
			},
		});
	}
	return g.__supabaseClient;
}

export const Supabase = getClient();