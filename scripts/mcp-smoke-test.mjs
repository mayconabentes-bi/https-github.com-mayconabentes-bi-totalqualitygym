import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('Missing env vars. Expected VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function run() {
  const checks = [];

  const health = await supabase.rpc('mcp_health');
  checks.push(['mcp_health', health]);

  const ncList = await supabase.rpc('mcp_list_non_conformities', { p_limit: 5, p_status: null });
  checks.push(['mcp_list_non_conformities', ncList]);

  const racList = await supabase.rpc('mcp_list_corrective_actions', { p_limit: 5, p_status: null });
  checks.push(['mcp_list_corrective_actions', racList]);

  const assets = await supabase.rpc('mcp_list_assets_attention', { p_limit: 5 });
  checks.push(['mcp_list_assets_attention', assets]);

  let failed = false;

  for (const [name, result] of checks) {
    if (result.error) {
      failed = true;
      console.error(`[FAIL] ${name}: ${result.error.message}`);
      continue;
    }

    const size = Array.isArray(result.data) ? result.data.length : 1;
    console.log(`[OK] ${name} -> ${size} row(s)`);
  }

  if (failed) {
    console.error('\nSmoke test failed. Ensure sql/mcp_phase2_hardening.sql was applied in Supabase SQL Editor.');
    process.exit(2);
  }

  console.log('\nMCP smoke test passed.');
}

run().catch((err) => {
  console.error('Unexpected failure while running MCP smoke test:', err);
  process.exit(3);
});
