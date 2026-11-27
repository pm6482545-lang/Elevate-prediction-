import { db } from './_lib.js';
export default async function handler(req, res) {
  const site = (process.env.SITE_URL || 'https://www.elevatepredictions.co.ke').replace(/\/$/, '');
  const { data } = await db.from('products').select('slug,updated_at').eq('is_published', true);
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    (data || []).map(p => `  <url><loc>${site}/resources/${encodeURIComponent(p.slug)}</loc><lastmod>${new Date(p.updated_at).toISOString().slice(0, 10)}</lastmod></url>\n`).join('') + '</urlset>\n';
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.send(xml);
}
