import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zjxfiemvbogwfwllnwxh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqeGZpZW12Ym9nd2Z3bGxud3hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMTkzNjUsImV4cCI6MjA4MTY5NTM2NX0.kpHw4QjroVC2w_5gL3vGwZia1LdP3jMBIjnbdDJYsf4";

export const supabase = createClient(supabaseUrl, supabaseKey);
