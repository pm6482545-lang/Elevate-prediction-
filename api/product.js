import { db } from './_lib.js';
const e = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const kes = n => 'KES ' + Number(n).toLocaleString('en-KE');
const SITE = (process.env.SITE_URL || 'https://www.elevatepredictions.co.ke').replace(/\/$/, '');
const LEVEL_PAGE = { 'Pre-Primary': ['lower-primary.html', 'Lower Primary'], 'Lower Primary': ['lower-primary.html', 'Lower Primary'], 'Upper Primary': ['upper-primary.html', 'Upper Primary'], 'Junior School': ['junior-school.html', 'Junior School'], 'Senior School': ['senior-school.html', 'Senior School'] };
const CAT_PAGE = { 'exams-prediction': ['prediction-papers.html', 'Prediction Papers'], 'schemes-of-work': ['teaching.html', 'Teaching Materials'], 'lesson-plans': ['teaching.html', 'Teaching Materials'], 'curriculum-designs': ['teaching.html', 'Teaching Materials'], 'assessment-tools': ['teaching.html', 'Teaching Materials'], 'professional-docs': ['teaching.html', 'Teaching Materials'], 'revision-materials': ['revision-topical.html', 'Revision & Topical'], 'topical-questions': ['revision-topical.html', 'Revision & Topical'], 'notes': ['revision-topical.html', 'Revision & Topical'] };
const CSS = `body{font-family:'Plus Jakarta Sans',sans-serif;background:#070b19;color:#f3f4f6}.glass{background:rgba(255,255,255,.035);border:1px solid rgba(255,215,0,.13)}.pc{transition:.25s}.pc:hover{transform:translateY(-4px);border-color:rgba(245,158,11,.5)}.btn{background:linear-gradient(90deg,#f59e0b,#d97706);color:#000;font-weight:800}.btn:disabled{opacity:.5}.inp{width:100%;background:#0b1329;border:1px solid rgba(255,255,255,.14);border-radius:.75rem;padding:.75rem 1rem;color:#fff;outline:none;font-size:.9rem}.chip{padding:.35rem .8rem;border-radius:999px;font-size:.72rem;font-weight:700;border:1px solid rgba(255,255,255,.15)}.hero{background:radial-gradient(circle at 20% 10%,rgba(245,158,11,.16),transparent 45%),radial-gradient(circle at 85% 30%,rgba(59,130,246,.14),transparent 45%)}`;

const card = x => `<a href="/resources/${e(x.slug)}" class="pc glass rounded-2xl overflow-hidden flex flex-col"><div class="bg-white/5 aspect-[3/4]"><img src="${e(x.cover_url)}" alt="${e(x.title)}" loading="lazy" class="w-full h-full object-cover"></div><div class="p-3"><h3 class="font-bold text-[13px] leading-snug line-clamp-2">${e(x.title)}</h3><p class="text-[11px] text-gray-400 mt-1">${e([x.grade, x.subject].filter(Boolean).join(' · '))}</p><b class="${Number(x.price) === 0 ? 'text-emerald-400' : 'text-amber-400'} text-sm">${Number(x.price) === 0 ? 'FREE' : kes(x.price)}</b></div></a>`;

export default async function handler(req, res) {
  try {
    const slug = String(req.query.slug || '');
    const { data: p } = await db.from('products').select('*, categories(name,slug)').eq('slug', slug).eq('is_published', true).maybeSingle();
    if (!p) {
      res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send('<!DOCTYPE html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Not found</title><body style="font-family:sans-serif;background:#070b19;color:#fff;text-align:center;padding:4rem 1rem"><h1>Resource not found</h1><p><a style="color:#f59e0b" href="/index.html">Browse the full shop</a></p></body>');
    }
    const { data: all } = await db.from('products').select('id,slug,title,cover_url,price,grade,subject,category_id,level').eq('is_published', true).neq('id', p.id).limit(80);
    const rel = (all || []).map(x => ({ x, s: (x.category_id === p.category_id) * 2 + (!!x.grade && x.grade === p.grade) * 2 + (!!x.subject && x.subject === p.subject) + (!!x.level && x.level === p.level) })).sort((a, b) => b.s - a.s).slice(0, 8).map(o => o.x);

    const free = Number(p.price) === 0, cat = p.categories || {};
    const url = `${SITE}/resources/${p.slug}`;
    const title = `${p.title} - Download Now | Elevate Kenya Predictions`;
    const desc = (p.short_desc || p.description || p.title).replace(/\s+/g, ' ').slice(0, 135) + ' Pay with M-Pesa, instant download.';
    const prev = p.preview_urls || [], np = prev.length, total = p.pages || 0;
    const lp = LEVEL_PAGE[p.level], cp = CAT_PAGE[cat.slug];
    const shareText = encodeURIComponent(`${p.title}${np && !free ? ' - read the first ' + np + ' pages free' : ''}. Download via M-Pesa:\n${url}`);
    const old = p.original_price && p.original_price > p.price ? Math.round(100 - p.price / p.original_price * 100) : 0;
    const buyBtn = free
      ? `<a href="/api/download?free=${p.id}" class="btn block text-center px-6 py-4 rounded-xl text-sm"><i class="fa-solid fa-download mr-1"></i> DOWNLOAD FREE</a>`
      : `<button data-buy class="btn w-full px-6 py-4 rounded-xl text-sm"><i class="fa-solid fa-mobile-screen mr-1"></i> VIEW &amp; DOWNLOAD FULL BOOK - ${kes(p.price)}</button>`;

    const ld = [{
      '@context': 'https://schema.org', '@type': 'Product', name: p.title, sku: p.id,
      image: [p.cover_url, ...prev.slice(0, 3)], description: (p.description || p.short_desc || p.title).slice(0, 500),
      brand: { '@type': 'Brand', name: 'Elevate Kenya Predictions' }, category: cat.name,
      offers: { '@type': 'Offer', url, price: String(p.price), priceCurrency: 'KES', availability: 'https://schema.org/InStock', seller: { '@type': 'Organization', name: 'Elevate Kenya Predictions' } }
    }, {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
        ...(lp ? [{ '@type': 'ListItem', position: 2, name: lp[1], item: `${SITE}/${lp[0]}` }] : []),
        { '@type': 'ListItem', position: lp ? 3 : 2, name: p.title, item: url }]
    }];

    const gallery = np ? `<section class="mt-12"><h2 class="text-xl md:text-2xl font-extrabold"><i class="fa-solid fa-book-open-reader text-amber-400 mr-2"></i>Read the first ${np} pages free</h2><p class="text-xs text-gray-400 mt-1">Tap any page to enlarge. ${free ? '' : 'The rest of the book unlocks after payment.'}</p>
<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">${prev.map((u, i) => `<img src="${e(u)}" alt="${e(p.title)} - page ${i + 1}" loading="lazy" data-zoom class="w-full rounded-xl bg-white cursor-zoom-in">`).join('')}</div>
${!free && total > np ? `<div class="relative mt-4 rounded-2xl overflow-hidden border border-amber-500/40"><div class="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 select-none pointer-events-none" aria-hidden="true" style="filter:blur(9px);opacity:.55">${Array.from({ length: 6 }, (_, i) => `<img src="${e(prev[(np - 1 - i + np) % np])}" alt="" class="w-full rounded-lg">`).join('')}</div>
<div class="absolute inset-0 flex flex-col items-center justify-center text-center p-6" style="background:linear-gradient(to top,#070b19 15%,rgba(7,11,25,.82) 60%,rgba(7,11,25,.5))"><div class="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 text-2xl"><i class="fa-solid fa-lock"></i></div>
<h3 class="text-xl font-extrabold mt-3">Pages ${np + 1} to ${total} are locked</h3><p class="text-sm text-gray-300 mt-1 max-w-md">Unlock all ${total} pages. Pay with M-Pesa and download the complete book instantly.</p>
<button data-buy class="btn px-7 py-4 rounded-xl text-sm mt-5">VIEW &amp; DOWNLOAD FULL BOOK HERE - ${kes(p.price)}</button>
<a target="_blank" rel="noopener" href="https://wa.me/254746357349?text=${encodeURIComponent('Hello, I want the full book: ' + p.title)}" class="text-xs text-[#25D366] font-bold mt-3"><i class="fa-brands fa-whatsapp"></i> Prefer to order via WhatsApp?</a></div></div>` : ''}</section>` : '';

    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${e(title)}</title><meta name="description" content="${e(desc)}"><link rel="canonical" href="${e(url)}">
<meta property="og:type" content="product"><meta property="og:site_name" content="Elevate Kenya Predictions"><meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(desc)}"><meta property="og:url" content="${e(url)}"><meta property="og:image" content="${e(p.cover_url)}"><meta property="og:image:secure_url" content="${e(p.cover_url)}"><meta property="product:price:amount" content="${p.price}"><meta property="product:price:currency" content="KES">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${e(title)}"><meta name="twitter:description" content="${e(desc)}"><meta name="twitter:image" content="${e(p.cover_url)}">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
<script src="https://cdn.tailwindcss.com"></script><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>${CSS}</style></head>
<body class="pb-20 md:pb-0">
<nav class="sticky top-0 z-40 bg-[#070b19]/90 backdrop-blur-md border-b border-white/10"><div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between"><a href="/index.html" class="flex items-center gap-2"><img src="/logo.png" class="h-10 w-10 object-contain" alt="Elevate Kenya"><span class="font-extrabold tracking-wider text-sm">ELEVATE KENYA</span></a><div class="flex items-center gap-2"><a href="/index.html" class="text-xs font-bold hover:text-amber-400"><i class="fa-solid fa-store mr-1"></i> Shop</a><a href="/index.html#cart" class="relative text-xl text-amber-400 px-2"><i class="fa-solid fa-cart-shopping"></i></a><a href="https://wa.me/254746357349" target="_blank" class="bg-amber-500 text-black px-3 py-2 rounded-xl text-xs font-extrabold"><i class="fa-brands fa-whatsapp mr-1"></i> Support</a></div></div></nav>
<header class="hero"><div class="max-w-6xl mx-auto px-4 py-8">
<p class="text-[11px] text-gray-400 mb-5"><a href="/index.html" class="hover:text-amber-400">Home</a> &rsaquo; ${lp ? `<a href="/${lp[0]}" class="hover:text-amber-400">${e(lp[1])}</a> &rsaquo; ` : ''}<span class="text-amber-400">${e(p.title)}</span></p>
<div class="grid md:grid-cols-5 gap-8 items-start">
<div class="md:col-span-2 relative"><img src="${e(p.cover_url)}" alt="${e(p.title)} cover" class="w-full rounded-2xl bg-white/5 shadow-2xl">${old ? `<span class="absolute top-3 left-3 bg-red-500 text-white text-xs font-extrabold px-3 py-1 rounded-lg">-${old}%</span>` : ''}</div>
<div class="md:col-span-3"><p class="text-[11px] font-bold text-amber-400 uppercase tracking-wider">${e(cat.name || '')}</p><h1 class="text-2xl md:text-4xl font-extrabold leading-tight mt-1">${e(p.title)}</h1>
<div class="flex flex-wrap gap-1.5 mt-4">${[p.level, p.grade, p.subject, p.term, p.exam_type, p.year, total && total + ' pages', (p.file_ext || 'pdf').toUpperCase()].filter(Boolean).map(x => `<span class="chip">${e(x)}</span>`).join('')}</div>
<div class="mt-5 flex items-end gap-3"><b class="text-4xl ${free ? 'text-emerald-400' : 'text-amber-400'}">${free ? 'FREE' : kes(p.price)}</b>${old ? `<span class="line-through text-gray-500">${kes(p.original_price)}</span>` : ''}</div>
<div class="mt-5 max-w-md">${buyBtn}</div>
<ul class="mt-5 space-y-1.5 text-sm text-gray-300"><li><i class="fa-solid fa-bolt text-amber-400 w-5"></i> Instant download after M-Pesa payment</li><li><i class="fa-solid fa-circle-check text-emerald-400 w-5"></i> CBC aligned, prepared by Mr Peter</li><li><i class="fa-brands fa-whatsapp text-[#25D366] w-5"></i> WhatsApp support if you need help</li></ul>
<div class="mt-6 flex flex-wrap items-center gap-2"><span class="text-xs font-bold text-gray-400">Share:</span>
<a target="_blank" rel="noopener" href="https://wa.me/?text=${shareText}" class="chip hover:bg-[#25D366] hover:text-black"><i class="fa-brands fa-whatsapp mr-1"></i> WhatsApp</a>
<a target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" class="chip hover:bg-[#1877F2]"><i class="fa-brands fa-facebook mr-1"></i> Facebook</a>
<button data-copy class="chip hover:bg-amber-500 hover:text-black"><i class="fa-solid fa-link mr-1"></i> <span>Copy link</span></button></div>
</div></div></div></header>
<main class="max-w-6xl mx-auto px-4 pb-14">
${gallery}
<section class="mt-12 grid md:grid-cols-2 gap-6"><div class="glass rounded-2xl p-6"><h2 class="font-extrabold mb-3">About this resource</h2><p class="text-sm text-gray-300 whitespace-pre-line">${e(p.description || p.short_desc || '')}</p></div>
${p.includes && p.includes.length ? `<div class="glass rounded-2xl p-6"><h2 class="font-extrabold mb-3">What's inside</h2><ul class="space-y-2 text-sm text-gray-300">${p.includes.map(i => `<li><i class="fa-solid fa-circle-check text-emerald-400 mr-2"></i>${e(i)}</li>`).join('')}</ul></div>` : ''}</section>
${rel.length ? `<section class="mt-12"><div class="flex justify-between items-center mb-4"><h2 class="text-xl md:text-2xl font-extrabold"><i class="fa-solid fa-layer-group text-amber-400 mr-2"></i>View related files</h2><a href="/index.html" class="text-xs text-amber-400 font-bold">Full shop <i class="fa-solid fa-arrow-right"></i></a></div><div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">${rel.map(card).join('')}</div></section>` : ''}
<section class="mt-12 glass rounded-2xl p-6"><h2 class="font-extrabold mb-3">Explore more</h2><div class="flex flex-wrap gap-2 text-xs font-bold">${lp ? `<a href="/${lp[0]}" class="chip hover:bg-amber-500 hover:text-black">More ${e(lp[1])} resources</a>` : ''}${cp ? `<a href="/${cp[0]}" class="chip hover:bg-amber-500 hover:text-black">${e(cp[1])}</a>` : ''}<a href="/index.html#cat=${e(cat.slug || '')}" class="chip hover:bg-amber-500 hover:text-black">All ${e(cat.name || 'resources')}</a><a href="/index.html" class="chip bg-amber-500 text-black">Browse the full shop</a></div></section>
</main>
<footer class="bg-[#050814] border-t border-white/10 py-8 text-center text-xs text-gray-500"><p>&copy; 2026 Elevate Kenya Predictions. <a href="/index.html" class="text-amber-400">Back to main shop</a></p></footer>
${free ? '' : `<div class="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[#0b1329]/95 backdrop-blur border-t border-amber-500/30 p-3 flex items-center gap-3"><div><p class="text-[10px] text-gray-400">Full book</p><b class="text-amber-400">${kes(p.price)}</b></div><button data-buy class="btn flex-1 py-3 rounded-xl text-sm">VIEW &amp; DOWNLOAD</button></div>`}
<div id="lb" class="hidden fixed inset-0 z-50 bg-black/90 overflow-y-auto p-3"><img id="lbImg" class="max-w-full mx-auto rounded-lg bg-white"></div>
<div id="modal" class="hidden fixed inset-0 z-50 bg-black/75 overflow-y-auto p-3"><div id="modalBox" class="bg-[#0b1329] border border-white/10 rounded-2xl max-w-md mx-auto my-8 relative"></div></div>
<script>window.PRODUCT=${JSON.stringify({ id: p.id, title: p.title, price: p.price }).replace(/</g, '\\u003c')};</script>
<script src="/product.js"></script></body></html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    res.send(html);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
}
