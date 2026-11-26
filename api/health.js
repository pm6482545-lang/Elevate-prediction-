export default async function handler(req, res) {
  const names = ['SUPABASE_URL','SUPABASE_SECRET_KEY','DARAJA_CONSUMER_KEY','DARAJA_CONSUMER_SECRET','DARAJA_PASSKEY','DARAJA_SHORTCODE','DARAJA_TILL','SITE_URL'];
  const env = Object.fromEntries(names.map(n => [n, process.env[n] ? 'set (' + process.env[n].length + ' chars)' : 'MISSING']));
  let lib = 'ok';
  try {
    const { db } = await import('./_lib.js');
    const r = await db.from('categories').select('id', { count: 'exact', head: true });
    lib = r.error ? 'db error: ' + r.error.message : 'ok, database reachable';
  } catch (e) { lib = 'CRASH: ' + e.message; }
  res.json({ env, lib });
}
