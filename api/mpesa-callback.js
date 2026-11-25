import { db } from './_lib.js';
export default async function handler(req, res) {
  try {
    const cb = req.body?.Body?.stkCallback;
    if (cb?.CheckoutRequestID) {
      const { data: o } = await db.from('orders').select('*, order_items(product_id)').eq('checkout_request_id', cb.CheckoutRequestID).maybeSingle();
      if (o && o.status === 'pending') {
        if (cb.ResultCode === 0) {
          const meta = Object.fromEntries((cb.CallbackMetadata?.Item || []).map(i => [i.Name, i.Value]));
          if (Number(meta.Amount) >= Number(o.total)) {
            await db.from('orders').update({
              status: 'paid', mpesa_receipt: meta.MpesaReceiptNumber, paid_at: new Date().toISOString(),
              token_expires_at: new Date(Date.now() + 7 * 864e5).toISOString(), result_desc: cb.ResultDesc
            }).eq('id', o.id);
            for (const i of o.order_items) {
              const { data: p } = await db.from('products').select('sales_count').eq('id', i.product_id).single();
              if (p) await db.from('products').update({ sales_count: p.sales_count + 1 }).eq('id', i.product_id);
            }
          } else await db.from('orders').update({ status: 'failed', result_desc: 'Amount paid was less than total' }).eq('id', o.id);
        } else {
          await db.from('orders').update({ status: cb.ResultCode === 1032 ? 'cancelled' : 'failed', result_desc: cb.ResultDesc }).eq('id', o.id);
        }
      }
    }
  } catch (e) { console.error(e); }
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
}
