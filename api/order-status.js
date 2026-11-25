import { db } from './_lib.js';
export default async function handler(req, res) {
  const { data: o } = await db.from('orders').select('status,download_token,result_desc,order_items(product_id,title)').eq('id', String(req.query.id || '')).maybeSingle();
  if (!o) return res.status(404).json({ error: 'Order not found' });
  const paid = o.status === 'paid';
  res.json({
    status: o.status, message: o.result_desc,
    token: paid ? o.download_token : null,
    items: paid ? o.order_items.map(i => ({ id: i.product_id, title: i.title })) : []
  });
}
