import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://qkqctjocpqugumtgxztx.supabase.co"
const supabaseKey = "sb_publishable_AVgNVdxXJlLy-xA7sfr5JA_GFQaw3d5"

export const supabase = createClient(supabaseUrl, supabaseKey)