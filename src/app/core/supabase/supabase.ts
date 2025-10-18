import { createClient } from '@supabase/supabase-js'
import { environment } from 'src/environments/environment.prod'

const supabaseUrl =  environment.SUPABASE_URL
const supabaseKey = environment.SUPABASE_KEY
export const Supabase = createClient(supabaseUrl, supabaseKey)