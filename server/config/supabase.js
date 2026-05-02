import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// ─── MIGRATION REQUIRED ────────────────────────────────────────────────────────
// Run this SQL in your Supabase SQL editor if the column doesn't exist yet:
//   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS selected_exam TEXT DEFAULT NULL;
// ──────────────────────────────────────────────────────────────────────────────

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
