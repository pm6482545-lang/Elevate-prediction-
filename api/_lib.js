import { createClient } from '@supabase/supabase-js';
export const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
export const normPhone = p => {
  p = String(p || '').replace(/\D/g, '');
  if (/^0[17]\d{8}$/.test(p)) p = '254' + p.slice(1);
  else if (/^[17]\d{8}$/.test(p)) p = '254' + p;
  return /^254[17]\d{8}$/.test(p) ? p : null;
};
export const DARAJA = process.env.DARAJA_BASE_URL || 'https://api.safaricom.co.ke';
export async function darajaToken() {
  const auth = Buffer.from(`${process.env.DARAJA_CONSUMER_KEY}:${process.env.DARAJA_CONSUMER_SECRET}`).toString('base64');
  const r = await fetch(`${DARAJA}/oauth/v1/generate?grant_type=client_credentials`, { headers: { Authorization: `Basic ${auth}` } });
  const j = await r.json();
  if (!j.access_token) throw new Error('Could not authenticate with M-Pesa');
  return j.access_token;
}
