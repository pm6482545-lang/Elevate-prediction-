import { db, normPhone, DARAJA, darajaToken } from './_lib.js';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { items, phone, email } = req.body || {};
    if (!Array.isArray(items) || !items.length || items.length > 30) return res.status(400).json({ error: 'Your cart is empty.' });
    const { data: prods, error } = await db.from('products').select('id,title,price').in('id', items).eq('is_published', true);
    if (error || !prods?.length) return res.status(400).json({ error: 'Products not found.' });
    const total = Math.ceil(prods.reduce((s, p) => s + Number(p.price), 0));
    const msisdn = normPhone(phone);
    if (total > 0 && !msisdn) return res.status(400).json({ error: 'Enter a valid Safaricom number e.g. 0712345678.' });
    const { data: order, error: oe } = await db.from('orders').insert({
      phone: msisdn || '0', email: email || null, total, status: total === 0 ? 'paid' : 'pending',
      paid_at: total === 0 ? new Date().toISOString() : null,
      token_expires_at: new Date(Date.now() + 7 * 864e5).toISOString()
    }).select().single();
    if (oe) throw oe;
    await db.from('order_items').insert(prods.map(p => ({ order_id: order.id, product_id: p.id, title: p.title, price: p.price })));
    if (total === 0) return res.json({ orderId: order.id, free: true });

    const ts = new Date(Date.now() + 3 * 36e5).toISOString().replace(/\D/g, '').slice(0, 14);
    const pass = Buffer.from(process.env.DARAJA_SHORTCODE + process.env.DARAJA_PASSKEY + ts).toString('base64');
    const token = await darajaToken();
    const r = await fetch(`${DARAJA}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        BusinessShortCode: process.env.DARAJA_SHORTCODE, Password: pass, Timestamp: ts,
        TransactionType: 'CustomerBuyGoodsOnline', Amount: total, PartyA: msisdn,
        PartyB: process.env.DARAJA_TILL, PhoneNumber: msisdn,
        CallBackURL: `${process.env.SITE_URL}/api/mpesa-callback`,
        AccountReference: order.order_no, TransactionDesc: 'Learning resources'
      })
    });
    const j = await r.json();
    if (j.ResponseCode !== '0') {
      await db.from('orders').update({ status: 'failed', result_desc: j.errorMessage || j.ResponseDescription || 'STK push failed' }).eq('id', order.id);
      return res.status(502).json({ error: 'Could not send the M-Pesa prompt. Please try again.' });
    }
    await db.from('orders').update({ checkout_request_id: j.CheckoutRequestID, merchant_request_id: j.MerchantRequestID }).eq('id', order.id);
    res.json({ orderId: order.id, orderNo: order.order_no });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error. Please try again.' }); }
}
