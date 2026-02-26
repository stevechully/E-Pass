import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
// 🚨 IMPORTANT: Use the Service Role Key here to bypass RLS!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase URL or Service Role Key in environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);