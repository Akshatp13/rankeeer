import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  console.log('Listing all tables in public schema...');
  // This is a bit tricky with Supabase JS client as it doesn't have a listTables method.
  // We can try to query the information_schema via RPC if enabled, or just try common ones.
  
  // Try to query common tables to see what exists
  const tables = ['profiles', 'user_stats', 'test_results', 'activity_log', 'leaderboard'];
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(0);
    if (error) {
      console.log(`Table '${table}': NOT FOUND (${error.message})`);
    } else {
      console.log(`Table '${table}': EXISTS`);
    }
  }
}

listTables();
