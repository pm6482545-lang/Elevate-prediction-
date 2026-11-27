(()=>{
const CFG=window.PAGE,WA='254746357349';
const sb=supabase.createClient('https://knjikiqfqwycadkejebx.supabase.co','sb_publishable_tVOXUEsbNXamY0GJLlThtg_Jp8bMafb');
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const kes=n=>'KES '+Number(n).toLocaleString('en-KE'),nat=(a,b)=>a.localeCompare(b,undefined,{numeric:true});
let P=[],C=[],cart=[],tab='';
try{cart=JSON.parse(localStorage.getItem('ekp_cart')||'[]')}catch(e){}
const saveCart=()=>{try{localStorage.setItem('ekp_cart',JSON.stringify(cart))}catch(e){}const n=$('cartN');n.textContent=cart.length;n.style.display=cart.length?'flex':'none'};
const cat=id=>C.find(c=>c.id===id)||{},byId=id=>P.find(p=>p.id===id),free=p=>Number(p.price)===0,off=p=>p.original_price&&p.original_price>p.price?Math.round(100-p.price/p.original_price*100):0;
const inPage=p=>(!CFG.cats||CFG.cats.includes(cat(p.category_id).slug))&&(!CFG.levels||CFG.levels.includes(p.level));
const tabVal=p=>CFG.tabBy==='category'?cat(p.category_id).name:p[CFG.tabBy];

function card(p){return `<div class="pc glass rounded-2xl overflow-hidden flex flex-col cursor-pointer" data-open="${p.id}">
<div class="relative bg-white/5 aspect-[3/4]"><img src="${esc(p.cover_url)}" alt="${esc(p.title)}" loading="lazy" class="w-full h-full object-cover" onerror="this.src='logo.png';this.className='w-full h-full object-contain p-8'">
<div class="absolute top-2 left-2 flex flex-col gap-1">${free(p)?'<span class="bg-emerald-500 text-black text-[10px] font-extrabold px-2 py-0.5 rounded">FREE</span>':''}${off(p)?`<span class="bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded">-${off(p)}%</span>`:''}${p.is_bestseller?'<span class="bg-amber-400 text-black text-[10px] font-extrabold px-2 py-0.5 rounded">BESTSELLER</span>':''}</div></div>
<div class="p-3 flex-1 flex flex-col"><p class="text-[10px] font-bold text-amber-400 uppercase">${esc(cat(p.category_id).name)}</p><h3 class="font-bold text-[13px] leading-snug mt-1 line-clamp-2">${esc(p.title)}</h3><p class="text-[11px] text-gray-400 mt-1">${esc([p.grade,p.subject,p.term].filter(Boolean).join(' · '))}</p>
<div class="mt-auto pt-3 flex items-center justify-between gap-2"><div><b class="${free(p)?'text-emerald-400':'text-white'}">${free(p)?'FREE':kes(p.price)}</b>${off(p)?`<span class="block text-[10px] text-gray-500 line-through">${kes(p.original_price)}</span>`:''}</div>
${free(p)?`<a href="/api/download?free=${p.id}" data-stop class="btn text-[11px] px-3 py-2 rounded-lg">Get</a>`:`<button data-add="${p.id}" class="btn text-[11px] px-3 py-2 rounded-lg"><i class="fa-solid fa-cart-plus"></i></button>`}</div></div></div>`}

function ld(L){const s=document.createElement('script');s.type='application/ld+json';s.text=JSON.stringify({'@context':'https://schema.org','@type':'ItemList',itemListElement:L.slice(0,30).map((p,i)=>({'@type':'ListItem',position:i+1,item:{'@type':'Product',name:p.title,image:p.cover_url,description:p.short_desc||p.description||p.title,offers:{'@type':'Offer',price:p.price,priceCurrency:'KES',availability:'https://schema.org/InStock'}}}))});document.head.appendChild(s)}

function render(){
 const L=P.filter(inPage),tabs=[...new Set(L.map(tabVal).filter(Boolean))].sort(nat);
 $('tabs').innerHTML=tabs.length>1?`<button class="chip ${!tab?'on':''}" data-tab="">All</button>`+tabs.map(t=>`<button class="chip ${tab===t?'on':''}" data-tab="${esc(t)}">${esc(t)}</button>`).join(''):'';
 const F=L.filter(p=>!tab||tabVal(p)===tab);
 $('count').textContent=F.length+' resource'+(F.length===1?'':'s');
 $('grid').innerHTML=F.map(card).join('')||`<div class="col-span-full glass rounded-2xl p-10 text-center"><i class="fa-solid fa-folder-open text-4xl text-amber-400/50"></i><h3 class="font-bold mt-3">No files available yet</h3><p class="text-xs text-gray-400 mt-1">New materials are uploaded regularly. Meanwhile, browse the <a class="text-amber-400 underline" href="index.html">full shop</a> or <a class="text-amber-400 underline" target="_blank" href="https://wa.me/${WA}?text=${encodeURIComponent('Hello, I am looking for '+CFG.name+' materials')}">ask us on WhatsApp</a>.</p></div>`;
 const ids=new Set(L.map(p=>p.id)),lv=new Set(L.map(p=>p.level));
 const R=P.filter(p=>!ids.has(p.id)).sort((a,b)=>lv.has(b.level)-lv.has(a.level)).slice(0,8);
 $('relGrid').innerHTML=R.map(card).join('');$('related').style.display=R.length?'block':'none';
}

function openProduct(id){const p=byId(id);if(!p)return;const c=cat(p.category_id);
 const rel=P.filter(x=>x.id!==p.id).map(x=>({x,s:(x.category_id===p.category_id)*2+(!!x.grade&&x.grade===p.grade)*2+(!!x.subject&&x.subject===p.subject)})).filter(o=>o.s>0).sort((a,b)=>b.s-a.s).slice(0,4).map(o=>o.x);
 $('modalBox').innerHTML=`<button data-close class="absolute top-3 right-4 text-3xl text-gray-400 z-10">&times;</button><div class="grid md:grid-cols-5 gap-5 p-5">
<div class="md:col-span-2"><img src="${esc(p.cover_url)}" class="w-full rounded-xl bg-white/5" onerror="this.src='logo.png'"></div>
<div class="md:col-span-3"><p class="text-[11px] font-bold text-amber-400 uppercase">${esc(c.name)}</p><h2 class="text-xl font-extrabold mt-1">${esc(p.title)}</h2>
<div class="flex flex-wrap gap-1.5 mt-3 text-[11px] font-bold">${[p.level,p.grade,p.subject,p.term,p.exam_type,p.year,p.pages&&p.pages+' pages',(p.file_ext||'pdf').toUpperCase()].filter(Boolean).map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</div>
<div class="mt-4 flex items-end gap-3"><b class="text-3xl ${free(p)?'text-emerald-400':'text-amber-400'}">${free(p)?'FREE':kes(p.price)}</b>${off(p)?`<span class="line-through text-gray-500">${kes(p.original_price)}</span><span class="text-red-400 font-bold text-sm">Save ${off(p)}%</span>`:''}</div>
<p class="text-sm text-gray-300 mt-4 whitespace-pre-line">${esc(p.description||p.short_desc||'')}</p>
${p.includes?.length?`<h4 class="font-extrabold text-sm mt-4 mb-2">What's inside</h4><ul class="space-y-1.5 text-sm text-gray-300">${p.includes.map(i=>`<li><i class="fa-solid fa-circle-check text-emerald-400 mr-2"></i>${esc(i)}</li>`).join('')}</ul>`:''}
<div class="mt-6 flex flex-col sm:flex-row gap-2">${free(p)?`<a href="/api/download?free=${p.id}" class="btn text-center px-6 py-3.5 rounded-xl text-sm flex-1"><i class="fa-solid fa-download mr-1"></i> DOWNLOAD FREE</a>`:`<button data-buy="${p.id}" class="btn px-6 py-3.5 rounded-xl text-sm flex-1"><i class="fa-solid fa-mobile-screen mr-1"></i> BUY NOW WITH M-PESA</button><button data-add="${p.id}" class="px-6 py-3.5 rounded-xl text-sm font-bold border border-amber-500/50 text-amber-400">Add to cart</button>`}</div>
${free(p)?'':`<a target="_blank" href="https://wa.me/${WA}?text=${encodeURIComponent('Hello, I want to buy: '+p.title+' ('+kes(p.price)+')')}" class="block text-center text-xs text-[#25D366] font-bold mt-3"><i class="fa-brands fa-whatsapp"></i> Prefer to order via WhatsApp?</a>`}
<p class="text-[11px] text-gray-500 mt-3"><i class="fa-solid fa-bolt text-amber-400"></i> Instant download after payment. No delivery.</p></div></div>
<div class="border-t border-white/10 p-5"><div class="flex justify-between items-center mb-3"><h4 class="font-extrabold text-sm">View related files</h4><a href="index.html#cat=${esc(c.slug||'')}" class="text-xs text-amber-400 font-bold">All ${esc(c.name||'resources')} <i class="fa-solid fa-arrow-right"></i></a></div>
${rel.length?`<div class="grid grid-cols-2 md:grid-cols-4 gap-3">${rel.map(card).join('')}</div>`:''}
<a href="index.html" class="block text-center btn rounded-xl py-3 text-sm mt-4"><i class="fa-solid fa-store mr-1"></i> BROWSE THE FULL SHOP</a></div>`;
 $('modal').classList.remove('hidden');$('modal').scrollTop=0}

function checkout(ids){const l=ids.map(byId).filter(Boolean),t=l.reduce((s,p)=>s+Number(p.price),0);
 $('modalBox').innerHTML=`<button data-close class="absolute top-3 right-4 text-3xl text-gray-400">&times;</button><div class="p-6 max-w-md mx-auto" id="co"><h2 class="text-xl font-extrabold mb-1">Checkout</h2><p class="text-xs text-gray-400 mb-4">Pay securely with M-Pesa and download instantly.</p>
<div class="glass rounded-xl p-3 text-sm space-y-1 mb-4">${l.map(p=>`<div class="flex justify-between gap-3"><span class="truncate">${esc(p.title)}</span><b class="whitespace-nowrap">${kes(p.price)}</b></div>`).join('')}<div class="flex justify-between border-t border-white/10 pt-2 mt-2 font-extrabold"><span>Total</span><span class="text-amber-400">${kes(t)}</span></div></div>
<label class="text-[11px] font-bold text-gray-400 uppercase">M-Pesa phone number</label><input id="ph" type="tel" inputmode="numeric" class="inp mt-1 mb-3" placeholder="07XX XXX XXX"><label class="text-[11px] font-bold text-gray-400 uppercase">Email (optional)</label><input id="em" type="email" class="inp mt-1 mb-4" placeholder="you@example.com">
<button id="payGo" class="btn w-full py-3.5 rounded-xl text-sm"><i class="fa-solid fa-lock mr-1"></i> PAY ${kes(t)}</button><p id="payMsg" class="text-xs text-red-400 text-center mt-2 min-h-[1rem]"></p>
<a target="_blank" href="https://wa.me/${WA}?text=${encodeURIComponent('Hello, I want to buy: '+l.map(p=>p.title).join(', ')+' (Total '+kes(t)+')')}" class="block text-center text-xs text-[#25D366] font-bold mt-2"><i class="fa-brands fa-whatsapp"></i> Order via WhatsApp instead</a></div>`;
 $('modal').classList.remove('hidden');
 $('payGo').onclick=async()=>{const b=$('payGo');b.disabled=true;$('payMsg').textContent='';
  try{const r=await fetch('/api/stkpush',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:ids,phone:$('ph').value,email:$('em').value})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Failed');
   $('co').innerHTML=`<div class="text-center py-8"><i class="fa-solid fa-mobile-screen-button text-5xl text-amber-400 animate-pulse"></i><h3 class="text-lg font-extrabold mt-4">Check your phone</h3><p class="text-sm text-gray-300 mt-2">Enter your M-Pesa PIN to complete payment of <b>${kes(t)}</b>. This page updates automatically.</p></div>`;poll(d.orderId)}
  catch(e){$('payMsg').textContent=e.message;b.disabled=false}}}
async function poll(id){for(let i=0;i<40;i++){await new Promise(r=>setTimeout(r,3000));let d;try{d=await(await fetch('/api/order-status?id='+id)).json()}catch(e){continue}
 if(d.status==='paid')return done(d);if(d.status==='failed'||d.status==='cancelled')return fail(d.status==='cancelled'?'You cancelled the payment.':(d.message||'Payment failed.'))}
 fail('We did not receive confirmation. If money was deducted, WhatsApp us your M-Pesa message and we will send your files right away.')}
function done(d){$('co').innerHTML=`<div class="text-center"><i class="fa-solid fa-circle-check text-5xl text-emerald-400"></i><h3 class="text-xl font-extrabold mt-3">Payment received!</h3><p class="text-xs text-gray-400 mb-4">Download your files below. Links stay active for 7 days on this page.</p></div><div class="space-y-2">${d.items.map(i=>`<a href="/api/download?token=${d.token}&item=${i.id}" class="btn flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm"><span class="truncate">${esc(i.title)}</span><i class="fa-solid fa-download"></i></a>`).join('')}</div><p class="text-[11px] text-gray-500 text-center mt-4">Thank you for shopping with Elevate Kenya Predictions.</p>`}
function fail(m){$('co').innerHTML=`<div class="text-center py-6"><i class="fa-solid fa-circle-xmark text-5xl text-red-400"></i><h3 class="text-lg font-extrabold mt-3">Payment not completed</h3><p class="text-sm text-gray-300 mt-2">${esc(m)}</p><button data-close class="btn px-6 py-3 rounded-xl text-sm mt-5">Close &amp; try again</button><a target="_blank" href="https://wa.me/${WA}" class="block text-xs text-[#25D366] font-bold mt-3">Need help? WhatsApp us</a></div>`}

document.addEventListener('click',e=>{const t=e.target;if(t.closest('[data-stop]'))return e.stopPropagation();let b;
 if(b=t.closest('[data-add]')){e.stopPropagation();const id=b.dataset.add;if(!cart.includes(id))cart.push(id);saveCart();b.innerHTML='<i class="fa-solid fa-check"></i>';return}
 if(b=t.closest('[data-buy]'))return checkout([b.dataset.buy]);
 if(t.closest('[data-close]')||t.id==='modal')return $('modal').classList.add('hidden');
 if(b=t.closest('[data-tab]')){tab=b.dataset.tab;return render()}
 if(b=t.closest('[data-open]'))return openProduct(b.dataset.open)});

(async()=>{saveCart();$('grid').innerHTML=Array(6).fill('<div class="sk rounded-2xl aspect-[3/4]"></div>').join('');
 const [c,p]=await Promise.all([sb.from('categories').select('*').eq('is_active',true).order('sort_order'),sb.from('products').select('id,slug,title,short_desc,description,includes,category_id,level,grade,subject,term,exam_type,year,price,original_price,pages,cover_url,file_ext,is_featured,is_bestseller,sales_count,download_count,created_at').eq('is_published',true).order('created_at',{ascending:false})]);
 C=c.data||[];P=p.data||[];render();ld(P.filter(inPage))})();
})();
