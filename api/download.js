import { db } from './_lib.js';
export default async function handler(req, res) {
  try {
    const { token, item, free } = req.query;
    let pid = null;
    if (free) {
      pid = free;
    } else if (token && item) {
      const { data: o } = await db.from('orders').select('status,token_expires_at,order_items(product_id)').eq('download_token', token).maybeSingle();
      if (!o || o.status !== 'paid' || new Date(o.token_expires_at) < new Date() || !o.order_items.some(i => i.product_id === item))
        return res.status(403).send('Download link invalid or expired. Contact us on WhatsApp for help.');
      pid = item;
    } else return res.status(400).send('Bad request');
    const { data: p } = await db.from('products').select('title,file_path,file_ext,price,download_count').eq('id', pid).eq('is_published', true).maybeSingle();
    if (!p || (free && Number(p.price) !== 0)) return res.status(403).send('Not available');
    const name = p.title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_') + '.' + (p.file_ext || 'pdf');
    const { data: s, error } = await db.storage.from('products').createSignedUrl(p.file_path, 120, { download: name });
    if (error) return res.status(500).send('File error');
    await db.from('products').update({ download_count: (p.download_count || 0) + 1 }).eq('id', pid);
    res.redirect(302, s.signedUrl);
  } catch (e) { console.error(e); res.status(500).send('Server error'); }
}
