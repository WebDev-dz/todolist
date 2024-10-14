
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { getClerkInstance } from '@clerk/clerk-expo';




const DATABASE_URL="postgres://postgres.egrsstxcjchpqgschypq:G2A0G0I1@youcef@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"



const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});


  
 

