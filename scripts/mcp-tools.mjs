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

function parseOption(name, fallback) {
  const key = `--${name}`;
  const idx = process.argv.indexOf(key);
  if (idx === -1 || idx + 1 >= process.argv.length) {
    return fallback;
  }
  return process.argv[idx + 1];
}

function toLimit(value, fallback = 20) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(1, Math.min(200, Math.floor(parsed)));
}

function printRows(title, rows) {
  console.log(`\n=== ${title} ===`);
  if (!rows || rows.length === 0) {
    console.log('No rows found.');
    return;
  }
  console.table(rows);
}

async function queryNC() {
  const limit = toLimit(parseOption('limit', '20'));
  const statusRaw = parseOption('status', '');
  const status = statusRaw.trim() === '' ? null : statusRaw;

  const { data, error } = await supabase.rpc('mcp_list_non_conformities', {
    p_limit: limit,
    p_status: status,
  });

  if (error) {
    throw new Error(`mcp_list_non_conformities failed: ${error.message}`);
  }

  printRows('Nao Conformidades', data);
}

async function queryRAC() {
  const limit = toLimit(parseOption('limit', '20'));
  const statusRaw = parseOption('status', '');
  const status = statusRaw.trim() === '' ? null : statusRaw;

  const { data, error } = await supabase.rpc('mcp_list_corrective_actions', {
    p_limit: limit,
    p_status: status,
  });

  if (error) {
    throw new Error(`mcp_list_corrective_actions failed: ${error.message}`);
  }

  printRows('Acoes Corretivas', data);
}

async function queryAssetsAttention() {
  const limit = toLimit(parseOption('limit', '20'));

  const { data, error } = await supabase.rpc('mcp_list_assets_attention', {
    p_limit: limit,
  });

  if (error) {
    throw new Error(`mcp_list_assets_attention failed: ${error.message}`);
  }

  printRows('Ativos com Atencao', data);
}

async function main() {
  const command = process.argv[2] || 'daily';

  if (command === 'nc') {
    await queryNC();
    return;
  }

  if (command === 'rac') {
    await queryRAC();
    return;
  }

  if (command === 'assets') {
    await queryAssetsAttention();
    return;
  }

  if (command === 'daily') {
    await queryNC();
    await queryRAC();
    await queryAssetsAttention();
    return;
  }

  console.error('Unknown command. Use: nc | rac | assets | daily');
  process.exit(2);
}

main().catch((error) => {
  console.error(error.message || String(error));
  process.exit(3);
});
