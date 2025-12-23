import { createClient } from '@supabase/supabase-js';

// App Configuration
export const Config = {
  API_BASE_URL: 'https://62f5a0d7e673.ngrok-free.app',
  API_TIMEOUT: 10000,
  RAZORPAY_KEY: 'rzp_test_RskJT6GedAcP7G',
  GOOGLE_PLACES_API_KEY: 'AIzaSyDLIWxcRrgqOIpdv4gdniNhOn_PqlhfmWc'
};

// Supabase Configuration
const supabaseUrl = 'https://suczkghtbhntlhclrcmv.supabase.co'; // Replace with your Supabase URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1Y3prZ2h0YmhudGxoY2xyY212Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NzUzNjEsImV4cCI6MjA2OTU1MTM2MX0.q9TB10KB2Cl_dS88TUd2fC5Kh7bzAYv3th-L1NlIqP8'; // Replace with your Supabase anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// You can easily change the URL here when needed
// For different environments, you can create separate config files