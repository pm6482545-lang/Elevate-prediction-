(()=>{
const P=window.PRODUCT,WA='254746357349';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const kes=n=>'KES '+Number(n).toLocaleString('en-KE');
function checkout(){const t=Number(P.price);
 $('modalBox').innerHTML=`<button data-close class="absolute top-3 right-4 text-3xl text-gray-400">&times;</button><div class="p-6" id="co"><h2 class="text-xl font-extrabold mb-1">Checkout</h2><p class="text-xs text-gray-400 mb-4">Pay securely with M-Pesa and download instantly.</p>
<div class="glass rounded-xl p-3 text-sm mb-4"><div class="flex justify-between gap-3"><span class="truncate">${esc(P.title)}</span><b class="whitespace-nowrap text-amber-400">${kes(t)}</b></div></div>
<label class="text-[11px] font-bold text-gray-400 uppercase">M-Pesa phone number</label><input id="ph" type="tel" inputmode="numeric" class="inp mt-1 mb-3" placeholder="07XX XXX XXX"><label class="text-[11px] font-bold text-gray-400 uppercase">Email (optional)</label><input id="em" type="email" class="inp mt-1 mb-4" placeholder="you@example.com">
<button id="payGo" class="btn w-full py-3.5 rounded-xl text-sm"><i class="fa-solid fa-lock mr-1"></i> PAY ${kes(t)}</button><p id="payMsg" class="text-xs text-red-400 text-center mt-2 min-h-[1rem]"></p>
<a target="_blank" href="https://wa.me/${WA}?text=${encodeURIComponent('Hello, I want to buy: '+P.title+' ('+kes(t)+')')}" class="block text-center text-xs text-[#25D366] font-bold mt-2"><i class="fa-brands fa-whatsapp"></i> Order via WhatsApp instead</a></div>`;
 $('modal').classList.remove('hidden');
 $('payGo').onclick=async()=>{const b=$('payGo');b.disabled=true;$('payMsg').textContent='';
  try{const r=await fetch('/api/stkpush',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:[P.id],phone:$('ph').value,email:$('em').value})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Failed');
   $('co').innerHTML=`<div class="text-center py-8"><i class="fa-solid fa-mobile-screen-button text-5xl text-amber-400 animate-pulse"></i><h3 class="text-lg font-extrabold mt-4">Check your phone</h3><p class="text-sm text-gray-300 mt-2">Enter your M-Pesa PIN to complete payment of <b>${kes(t)}</b>. This page updates automatically.</p></div>`;poll(d.orderId)}
  catch(e){$('payMsg').textContent=e.message;b.disabled=false}}}
async function poll(id){for(let i=0;i<40;i++){await new Promise(r=>setTimeout(r,3000));let d;try{d=await(await fetch('/api/order-status?id='+id)).json()}catch(e){continue}
 if(d.status==='paid')return done(d);if(d.status==='failed'||d.status==='cancelled')return fail(d.status==='cancelled'?'You cancelled the payment.':(d.message||'Payment failed.'))}
 fail('We did not receive confirmation. If money was deducted, WhatsApp us your M-Pesa message and we will send your file right away.')}
function done(d){$('co').innerHTML=`<div class="text-center"><i class="fa-solid fa-circle-check text-5xl text-emerald-400"></i><h3 class="text-xl font-extrabold mt-3">Payment received!</h3><p class="text-xs text-gray-400 mb-4">Download your full book below. The link stays active for 7 days.</p></div><div class="space-y-2">${d.items.map(i=>`<a href="/api/download?token=${d.token}&item=${i.id}" class="btn flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm"><span class="truncate">${esc(i.title)}</span><i class="fa-solid fa-download"></i></a>`).join('')}</div>`}
function fail(m){$('co').innerHTML=`<div class="text-center py-6"><i class="fa-solid fa-circle-xmark text-5xl text-red-400"></i><h3 class="text-lg font-extrabold mt-3">Payment not completed</h3><p class="text-sm text-gray-300 mt-2">${esc(m)}</p><button data-close class="btn px-6 py-3 rounded-xl text-sm mt-5">Close &amp; try again</button><a target="_blank" href="https://wa.me/${WA}" class="block text-xs text-[#25D366] font-bold mt-3">Need help? WhatsApp us</a></div>`}
document.addEventListener('click',e=>{const t=e.target;let b;
 if(t.closest('[data-buy]'))return checkout();
 if(t.closest('[data-close]')||t.id==='modal')return $('modal').classList.add('hidden');
 if(b=t.closest('[data-zoom]')){$('lbImg').src=b.src;$('lb').classList.remove('hidden');return}
 if(t.closest('#lb'))return $('lb').classList.add('hidden');
 if(b=t.closest('[data-copy]')){navigator.clipboard?.writeText(location.href.split('#')[0]).then(()=>{b.querySelector('span').textContent='Copied!'})}});
})();
