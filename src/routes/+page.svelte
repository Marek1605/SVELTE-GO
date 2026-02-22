<script>
    import { onMount } from 'svelte';
    import { api } from '$lib/api';

    let searchQuery = '';
    let showMoreCats = false;
    let moreRef;
    let categories = [];
    let topProducts = [];
    let categoryProducts = [];
    let priceDropProducts = [];
    let stats = { products: 0, categories: 0 };
    let loaded = false;

    let heroTitle = 'Nájdite *najnižšiu cenu* za pár sekúnd';
    let heroSubtitle = 'Porovnávame ceny z overených obchodov na jednom mieste.';
    let homeCatSections = 3;
    let showHow = true;
    let showVendor = true;
    let animProducts = 0, animCategories = 0, animStarted = false;
    let currentBanner = 0;
    let bannerInterval;
    let touchStartX = 0;

    function animateCount(target, setter, dur = 1000) {
        if (target <= 0) return;
        let s = 0; const step = target / (dur / 16);
        const t = setInterval(() => { s += step; if (s >= target) { setter(target); clearInterval(t); } else setter(Math.floor(s)); }, 16);
    }

    const quickActions = [
        { icon: '🔥', label: 'Hot', href: '/hladat?sort=popular' },
        { icon: '📉', label: 'Poklesy', href: '/hladat?sort=price_drop' },
        { icon: '⭐', label: 'Nové', href: '/hladat?sort=newest' },
        { icon: '🏷️', label: 'Akcie', href: '/hladat?sort=deals' },
        { icon: '📊', label: 'Trendy', href: '/hladat?sort=trending' },
    ];
    const popularSearches = ['notebook', 'iPhone 16', 'televízor', 'slúchadlá', 'Samsung Galaxy', 'vysávač'];

    const emojis = {'elektronika':'📱','dom':'🏠','záhrad':'🌳','hračky':'🧸','šport':'⚽','domáce':'🔌','spotrebič':'🔌','dieťa':'👶','zviera':'🐾','zdravie':'💊','krása':'💄','auto':'🚗','oblečen':'👕','nábytok':'🪑','hobby':'🎨','hry':'🎮','kuchyn':'🍳','foto':'📸'};
    function getCatEmoji(name) { const l=(name||'').toLowerCase(); for(const[k,v] of Object.entries(emojis)){if(l.includes(k))return v;} return '📦'; }
    function totalProducts(cat) { let c=cat.product_count||0; if(cat.children) for(const ch of cat.children) c+=totalProducts(ch); return c; }
    function handleSearch(e) { e.preventDefault(); if(searchQuery.trim()) window.location.href='/hladat?q='+encodeURIComponent(searchQuery); }
    function toggleMore() { showMoreCats=!showMoreCats; }
    function fmtPrice(p) { return (p||0).toFixed(2).replace('.',','); }
    function fmtNum(n) { return (n||0).toLocaleString('sk-SK'); }
    function calcDrop(p) {
        if(p.price_old && p.price_min) { const pct=Math.round(((p.price_old-p.price_min)/p.price_old)*100); return pct>0?pct:0; }
        if(p.price_drop && p.price_min) { const old=p.price_min+p.price_drop; return Math.round((p.price_drop/old)*100); }
        if(p.drop_pct) return Math.round(p.drop_pct);
        return 0;
    }
    function getOldPrice(p) { if(p.price_old) return p.price_old; if(p.price_drop && p.price_min) return p.price_min+p.price_drop; return 0; }
    function goToBanner(i) { currentBanner=i; }
    function nextBanner() { currentBanner=(currentBanner+1)%3; }
    function handleTouchStart(e) { touchStartX=e.touches[0].clientX; }
    function handleTouchEnd(e) { const d=touchStartX-e.changedTouches[0].clientX; if(Math.abs(d)>40){if(d>0)currentBanner=Math.min(currentBanner+1,2);else currentBanner=Math.max(currentBanner-1,0);} }

    $: visibleCats = categories.slice(0, 8);
    $: overflowCats = categories.slice(8);

    onMount(async () => {
        bannerInterval = setInterval(nextBanner, 4500);

        try {
            const r = await fetch('/api/v1/site/settings'); const d = await r.json();
            if(d?.success && d?.data) { const s=d.data; if(s.hero_title)heroTitle=s.hero_title; if(s.hero_subtitle)heroSubtitle=s.hero_subtitle; homeCatSections=parseInt(s.home_category_sections)||3; showHow=s.show_how_section!=='false'; showVendor=s.show_vendor_cta!=='false'; }
        } catch(e) {}

        try { const r=await api.getCategories(); if(r?.success) categories=r.data||r.categories||[]; else if(Array.isArray(r)) categories=r; } catch(e) {}
        try { const r=await api.getProducts('sort=popular&limit=5'); topProducts=r?.data?.items||r?.items||[]; } catch(e) {}

        // Price drops
        try {
            const r = await fetch('/api/v1/price-drops'); const d = await r.json();
            if(d?.success && d?.data?.length>0) priceDropProducts=d.data;
            else { const f=await api.getProducts('sort=price_drop&limit=6'); priceDropProducts=f?.data?.items||f?.items||[]; }
        } catch(e) {
            try { const f=await api.getProducts('sort=price_drop&limit=6'); priceDropProducts=f?.data?.items||f?.items||[]; } catch(e2) {}
        }

        try { const r=await fetch('/api/v1/stats'); const d=await r.json(); if(d?.success&&d?.data) stats=d.data; else if(d?.products!==undefined) stats=d; } catch(e) {}

        loaded=true;
        if(!animStarted) { animStarted=true; animateCount(stats.products,v=>animProducts=v); animateCount(stats.categories,v=>animCategories=v); }

        const catsWithProducts = categories.filter(c=>totalProducts(c)>0).slice(0,homeCatSections);
        for(const cat of catsWithProducts) {
            try { const r=await api.getProducts('category='+cat.slug+'&limit=5&sort=popular'); const items=r?.data?.items||r?.items||[]; if(items.length>0) categoryProducts=[...categoryProducts,{name:cat.name,slug:cat.slug,products:items}]; } catch(e) {}
        }

        return () => { if(bannerInterval)clearInterval(bannerInterval); };
    });
</script>

<svelte:head>
    <title>MegaPrice.sk — Porovnávač cien | Najlepšie ponuky</title>
    <meta name="description" content="Porovnajte ceny z overených slovenských obchodov.">
</svelte:head>

<div class="hp">

    <!-- ===== MOBILE HERO ===== -->
    <section class="mh">
        <div class="mh__in">
            <form class="mh__sf" on:submit={handleSearch}>
                <svg class="mh__si" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" placeholder="Hľadať produkt, značku..." bind:value={searchQuery}>
                <button type="submit"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button>
            </form>

            <div class="mh__banner" on:touchstart={handleTouchStart} on:touchend={handleTouchEnd}>
                <div class="mh__track" style="transform:translateX(-{currentBanner*103}%)">
                    <div class="mh__slide mh__slide--1"><span class="mh__badge">NOVÉ</span><div class="mh__title">Porovnaj ceny z overených e-shopov</div><div class="mh__sub">{fmtNum(animProducts)}+ produktov</div></div>
                    <div class="mh__slide mh__slide--2"><span class="mh__badge">PRE E-SHOPY</span><div class="mh__title">Pridajte váš obchod</div><div class="mh__sub">CPC od 0,05 €</div></div>
                    <div class="mh__slide mh__slide--3"><span class="mh__badge">TIP</span><div class="mh__title">Ušetrite aj 40%</div><div class="mh__sub">Porovnajte ceny na jednom mieste</div></div>
                </div>
                <div class="mh__dots">{#each [0,1,2] as i}<button class="mh__dot" class:on={currentBanner===i} on:click={()=>goToBanner(i)}></button>{/each}</div>
            </div>

            <div class="mh__qa">{#each quickActions as qa}<a href={qa.href} class="qa"><span class="qa__i">{qa.icon}</span><span class="qa__l">{qa.label}</span></a>{/each}</div>
        </div>
    </section>

    <!-- ===== DESKTOP HERO ===== -->
    <section class="dh">
        <div class="dh__in cnt">
            <div class="dh__main" on:touchstart={handleTouchStart} on:touchend={handleTouchEnd}>
                <div class="dh__track" style="transform:translateX(-{currentBanner*100}%)">
                    <div class="dh__slide dh__slide--1"><div class="dh__ct"><span class="dh__badge">NOVÉ</span><h2 class="dh__title">{@html heroTitle.replace(/\*([^*]+)\*/g,'<span class="dh__em">$1</span>')}</h2><p class="dh__sub">{heroSubtitle}</p><div class="dh__stats"><span>{fmtNum(animProducts)}+ produktov</span><span>·</span><span>{fmtNum(animCategories)} kategórií</span></div></div></div>
                    <div class="dh__slide dh__slide--2"><div class="dh__ct"><span class="dh__badge">PRE E-SHOPY</span><h2 class="dh__title">Pridajte váš e-shop na <span class="dh__em">MegaPrice</span></h2><p class="dh__sub">Platíte len za kliknutia. CPC od 0,05 €.</p><a href="/prihlasenie-predajcu" class="dh__cta">Začať predávať →</a></div></div>
                    <div class="dh__slide dh__slide--3"><div class="dh__ct"><span class="dh__badge">TIP</span><h2 class="dh__title">Ušetrite aj <span class="dh__em">40%</span> porovnaním cien</h2><p class="dh__sub">Porovnajte ceny z overených obchodov.</p></div></div>
                </div>
                <div class="dh__dots">{#each [0,1,2] as i}<button class="dh__dot" class:on={currentBanner===i} on:click={()=>goToBanner(i)}></button>{/each}</div>
            </div>
            <div class="dh__side">
                <div class="dh__stt">RÝCHLE AKCIE</div>
                {#each quickActions as qa}<a href={qa.href} class="dh__qi"><span>{qa.icon}</span><span class="dh__ql">{qa.label}</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></a>{/each}
                <div class="dh__pop"><span>Populárne:</span><div>{#each popularSearches.slice(0,4) as t}<a href="/hladat?q={encodeURIComponent(t)}">{t}</a>{/each}</div></div>
            </div>
        </div>
    </section>

    <!-- ===== TRUST BAR ===== -->
    <section class="tb">
        <div class="tb__in cnt">
            <div class="tb__i"><div class="tb__ic tb__ic--1"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div><div><strong>{fmtNum(animProducts)}+</strong><span>produktov</span></div></div>
            <div class="tb__i"><div class="tb__ic tb__ic--2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div><div><strong>{fmtNum(animCategories)}</strong><span>kategórií</span></div></div>
            <div class="tb__i"><div class="tb__ic tb__ic--3"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><div><strong>Overené</strong><span>e-shopy</span></div></div>
            <div class="tb__i"><div class="tb__ic tb__ic--4"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div><strong>Denne</strong><span>aktualizované</span></div></div>
        </div>
    </section>

    <!-- ===== CENOVÉ POKLESY ===== -->
    {#if priceDropProducts.length > 0}
    <section class="sec drops">
        <div class="cnt">
            <div class="sec__h"><div><h2 class="sec__t">📉 Cenové poklesy</h2><p class="sec__s">Produkty s najväčším poklesom ceny</p></div><span class="drops__live">● LIVE</span></div>
            <div class="scroll">
                {#each priceDropProducts as dp}
                <a href="/produkt/{dp.slug}" class="card dp">
                    {#if calcDrop(dp)>0}<span class="dp__pct">-{calcDrop(dp)}%</span>{/if}
                    <div class="card__img">{#if dp.image_url}<img src={dp.image_url} alt={dp.title}>{:else}<div class="card__ph">📷</div>{/if}</div>
                    <div class="card__body">
                        <h3 class="card__name">{dp.title}</h3>
                        <div class="dp__prices"><span class="dp__now">{fmtPrice(dp.price_min||dp.price)} €</span>{#if getOldPrice(dp)>0}<span class="dp__old">{fmtPrice(getOldPrice(dp))} €</span>{/if}</div>
                    </div>
                </a>
                {/each}
            </div>
        </div>
    </section>
    {/if}

    <!-- ===== CATEGORIES ===== -->
    {#if categories.length > 0}
    <section class="sec cats">
        <div class="cnt">
            <div class="sec__h"><div><h2 class="sec__t">Kategórie</h2><p class="sec__s">Prechádzajte produkty podľa kategórií</p></div><a href="/kategorie" class="sec__lnk">Všetky →</a></div>
            <div class="cats__g">
                {#each visibleCats as cat}
                <a href="/kategoria/{cat.slug}" class="cc">
                    <div class="cc__ic">{#if cat.image_url}<img src={cat.image_url} alt={cat.name}>{:else}<span>{getCatEmoji(cat.name)}</span>{/if}</div>
                    <div class="cc__info"><span class="cc__name">{cat.name}</span>{#if totalProducts(cat)>0}<span class="cc__cnt">{fmtNum(totalProducts(cat))}</span>{/if}</div>
                </a>
                {/each}
            </div>
            {#if overflowCats.length > 0}
            <div class="cats__more" bind:this={moreRef}><button on:click={toggleMore}>{showMoreCats?'Skryť':'Ďalších '+overflowCats.length+' kategórií'} <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="transform:rotate({showMoreCats?180:0}deg);transition:transform .2s"><polyline points="6 9 12 15 18 9"/></svg></button>
                {#if showMoreCats}<div class="cats__g cats__gx">{#each overflowCats as cat}<a href="/kategoria/{cat.slug}" class="cc"><div class="cc__ic">{#if cat.image_url}<img src={cat.image_url} alt={cat.name}>{:else}<span>{getCatEmoji(cat.name)}</span>{/if}</div><div class="cc__info"><span class="cc__name">{cat.name}</span>{#if totalProducts(cat)>0}<span class="cc__cnt">{fmtNum(totalProducts(cat))}</span>{/if}</div></a>{/each}</div>{/if}
            </div>
            {/if}
        </div>
    </section>
    {/if}

    <!-- ===== MINI VENDOR CTA ===== -->
    {#if showVendor}
    <section class="sec mcta">
        <div class="cnt">
            <a href="/prihlasenie-predajcu" class="mcta__in">
                <div class="mcta__ic">🏪</div>
                <div class="mcta__txt"><strong>Predávate online?</strong><span>CPC od 0,05 € · XML feed · Zadarmo</span></div>
                <span class="mcta__btn">Pridať →</span>
            </a>
        </div>
    </section>
    {/if}

    <!-- ===== TOP PRODUCTS ===== -->
    {#if topProducts.length > 0}
    <section class="sec prods">
        <div class="cnt">
            <div class="sec__h"><div><h2 class="sec__t">TOP porovnania</h2><p class="sec__s">Produkty s najviac ponukami</p></div><a href="/produkty" class="sec__lnk">Všetky →</a></div>
            <div class="scroll">
                {#each topProducts as p, i}
                <a href="/produkt/{p.slug}" class="card">
                    {#if i<3}<div class="card__rk" class:card__rk--1={i===0} class:card__rk--2={i===1} class:card__rk--3={i===2}>{i+1}</div>{/if}
                    <div class="card__img">{#if p.image_url}<img src={p.image_url} alt={p.title}>{:else}<div class="card__ph">📷</div>{/if}</div>
                    <div class="card__body">
                        {#if p.brand}<span class="card__brand">{p.brand}</span>{/if}
                        <h3 class="card__name">{p.title}</h3>
                        {#if p.offer_count>0}<span class="card__offers">{p.offer_count} {p.offer_count===1?'ponuka':p.offer_count<5?'ponuky':'ponúk'}</span>{/if}
                        <div class="card__price">{fmtPrice(p.price_min||p.price)} €</div>
                        <div class="card__cta">Porovnať ceny →</div>
                    </div>
                </a>
                {/each}
            </div>
        </div>
    </section>
    {/if}

    <!-- ===== CATEGORY PRODUCTS ===== -->
    {#each categoryProducts as catSec, idx}
    <section class="sec" class:sec--alt={idx%2===0}>
        <div class="cnt">
            <div class="sec__h"><div><h2 class="sec__t">{catSec.name}</h2><p class="sec__s">Najobľúbenejšie v kategórii</p></div><a href="/kategoria/{catSec.slug}" class="sec__lnk">Všetky →</a></div>
            <div class="scroll">
                {#each catSec.products as p}
                <a href="/produkt/{p.slug}" class="card">
                    <div class="card__img">{#if p.image_url}<img src={p.image_url} alt={p.title}>{:else}<div class="card__ph">📷</div>{/if}</div>
                    <div class="card__body">
                        {#if p.brand}<span class="card__brand">{p.brand}</span>{/if}
                        <h3 class="card__name">{p.title}</h3>
                        <div class="card__price">{fmtPrice(p.price_min||p.price)} €</div>
                        <div class="card__cta">Porovnať ceny →</div>
                    </div>
                </a>
                {/each}
            </div>
        </div>
    </section>
    {/each}

    <!-- ===== HOW IT WORKS ===== -->
    {#if showHow}
    <section class="sec how">
        <div class="cnt">
            <h2 class="sec__t" style="text-align:center;margin-bottom:20px">Ako funguje MegaPrice?</h2>
            <div class="how__g">
                <div class="how__s"><div class="how__n how__n--1">1</div><h3>Vyhľadajte</h3><p>Zadajte produkt alebo prechádzajte kategórie.</p></div>
                <div class="how__s"><div class="how__n how__n--2">2</div><h3>Porovnajte</h3><p>Porovnajte ceny od rôznych predajcov.</p></div>
                <div class="how__s"><div class="how__n how__n--3">3</div><h3>Ušetrite</h3><p>Vyberte najlepšiu ponuku a nakúpte.</p></div>
            </div>
        </div>
    </section>
    {/if}

    <!-- ===== VENDOR CTA ===== -->
    {#if showVendor}
    <section class="vcta">
        <div class="vcta__in cnt">
            <div class="vcta__ct"><span class="vcta__badge">PRE E-SHOPY</span><h2>Získajte zákazníkov</h2><p>Pridajte svoj e-shop na MegaPrice. Platíte len za kliknutia.</p><a href="/prihlasenie-predajcu" class="vcta__btn">Začať predávať →</a></div>
            <div class="vcta__card"><div class="vcta__row"><span>CPC od</span><strong>0,05 €</strong></div><div class="vcta__row"><span>Registrácia</span><strong>Zadarmo</strong></div><div class="vcta__row"><span>Feed import</span><strong>XML / CSV</strong></div></div>
        </div>
    </section>
    {/if}

    <div class="hp__pad"></div>
</div>

<style>
.hp{background:#fafafa}
.cnt{max-width:1280px;margin:0 auto;padding:0 16px}
.sec{padding:24px 0}
.sec--alt{background:#fff}
.sec__h{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:16px;gap:12px}
.sec__t{font-size:18px;font-weight:700;color:#111;margin:0}
.sec__s{font-size:12px;color:#6b7280;margin:2px 0 0}
.sec__lnk{font-size:12px;font-weight:600;color:#c4956a;white-space:nowrap}
.hp__pad{height:72px}

/* === MOBILE HERO === */
.mh{background:#fff;border-bottom:1px solid #eee;padding:12px 16px 0}
.mh__sf{display:flex;align-items:center;position:relative;margin-bottom:12px}
.mh__si{position:absolute;left:12px;top:50%;transform:translateY(-50%)}
.mh__sf input{flex:1;padding:10px 8px 10px 36px;border:1.5px solid #e5e7eb;border-radius:10px 0 0 10px;font-size:14px;outline:none;background:#fff;border-right:none}
.mh__sf input:focus{border-color:#c4956a}
.mh__sf input::placeholder{color:#9ca3af}
.mh__sf button{padding:10px 14px;background:#c4956a;border-radius:0 10px 10px 0;border:1.5px solid #c4956a;display:flex;align-items:center}
.mh__banner{overflow:hidden}
.mh__track{display:flex;transition:transform .35s ease;gap:3%}
.mh__slide{min-width:100%;border-radius:12px;padding:20px 16px}
.mh__slide--1{background:#c4956a;color:#fff}
.mh__slide--2{background:#1e293b;color:#fff}
.mh__slide--3{background:#4f46e5;color:#fff}
.mh__badge{display:inline-block;padding:2px 8px;background:rgba(255,255,255,.2);border-radius:4px;font-size:9px;font-weight:700;letter-spacing:.5px;margin-bottom:6px}
.mh__title{font-size:16px;font-weight:700;line-height:1.3;margin-bottom:3px}
.mh__sub{font-size:12px;opacity:.75}
.mh__dots{display:flex;gap:5px;justify-content:center;padding:10px 0 4px}
.mh__dot{width:6px;height:6px;border-radius:50%;background:#d1d5db;border:none;padding:0;transition:all .2s}
.mh__dot.on{background:#c4956a;width:18px;border-radius:3px}
.mh__qa{display:flex;gap:6px;padding:8px 0 14px;overflow-x:auto;scrollbar-width:none}
.mh__qa::-webkit-scrollbar{display:none}
.qa{display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 12px;min-width:56px;flex-shrink:0;background:#f9fafb;border:1px solid #eee;border-radius:10px;color:#374151}
.qa__i{font-size:16px}
.qa__l{font-size:9px;font-weight:600;color:#6b7280;white-space:nowrap}

/* === DESKTOP HERO === */
.dh{display:none}

/* === TRUST BAR === */
.tb{padding:16px}
.tb__in{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.tb__i{display:flex;align-items:center;gap:8px;background:#fff;padding:10px 12px;border-radius:10px;border:1px solid #eee}
.tb__ic{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.tb__ic--1{background:#fff7ed;color:#c2410c}
.tb__ic--2{background:#eff6ff;color:#1d4ed8}
.tb__ic--3{background:#ecfdf5;color:#15803d}
.tb__ic--4{background:#f5f3ff;color:#7c3aed}
.tb__i div:last-child{display:flex;flex-direction:column}
.tb__i strong{font-size:13px;font-weight:700;color:#111;line-height:1.2}
.tb__i span{font-size:10px;color:#6b7280}

/* === PRICE DROPS === */
.drops__live{font-size:10px;font-weight:700;color:#059669;white-space:nowrap;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.dp{position:relative}
.dp__pct{position:absolute;top:8px;left:8px;padding:2px 6px;background:#ecfdf5;color:#059669;border-radius:5px;font-size:11px;font-weight:800;z-index:1}
.dp__prices{display:flex;align-items:baseline;gap:5px}
.dp__now{font-size:15px;font-weight:800;color:#111}
.dp__old{font-size:11px;color:#9ca3af;text-decoration:line-through}

/* === SHARED SCROLL + CARD === */
.scroll{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:4px;scrollbar-width:none}
.scroll::-webkit-scrollbar{display:none}
.card{min-width:148px;max-width:148px;scroll-snap-align:start;background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden;transition:all .2s;display:flex;flex-direction:column;color:#111;flex-shrink:0;position:relative}
.card:active{transform:scale(.98)}
.card__img{height:110px;display:flex;align-items:center;justify-content:center;padding:8px}
.card__img img{max-width:100%;max-height:100%;object-fit:contain}
.card__ph{font-size:24px;opacity:.12}
.card__body{padding:0 10px 10px;flex:1;display:flex;flex-direction:column}
.card__brand{font-size:9px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:.3px}
.card__name{font-size:12px;font-weight:600;line-height:1.3;margin:2px 0 4px;color:#374151;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:31px}
.card__offers{font-size:10px;color:#c4956a;font-weight:600}
.card__price{margin-top:auto;font-size:16px;font-weight:800;color:#111;padding-top:4px}
.card__cta{text-align:center;padding:7px;background:#fafafa;border-top:1px solid #f3f4f6;margin:8px -10px -10px;font-size:11px;font-weight:700;color:#c4956a}
.card__rk{position:absolute;top:8px;left:8px;width:22px;height:22px;border-radius:6px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#6b7280;z-index:1}
.card__rk--1{background:#fef3c7;color:#92400e}
.card__rk--2{background:#f1f5f9;color:#475569}
.card__rk--3{background:#fff7ed;color:#c2410c}

/* === CATEGORIES === */
.cats__g{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.cats__gx{margin-top:8px}
.cc{display:flex;align-items:center;gap:10px;padding:10px;background:#fff;border:1px solid #eee;border-radius:10px;transition:all .15s}
.cc:active{background:#fef7f0}
.cc__ic{width:36px;height:36px;border-radius:8px;background:#f9fafb;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;font-size:18px}
.cc__ic img{width:100%;height:100%;object-fit:cover;border-radius:8px}
.cc__info{min-width:0;flex:1}
.cc__name{display:block;font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#111}
.cc__cnt{font-size:10px;color:#9ca3af}
.cats__more{text-align:center;margin-top:12px}
.cats__more button{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:none;border:1px solid #e5e7eb;border-radius:8px;font-size:12px;font-weight:600;color:#4b5563}

/* === MINI CTA === */
.mcta{padding:8px 0 16px}
.mcta__in{display:flex;align-items:center;gap:12px;padding:14px 16px;background:#fff;border:1px solid #eee;border-radius:12px}
.mcta__in:active{border-color:#c4956a}
.mcta__ic{width:38px;height:38px;border-radius:10px;background:#fef7f0;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px}
.mcta__txt{flex:1;display:flex;flex-direction:column}
.mcta__txt strong{font-size:13px;font-weight:700;color:#111}
.mcta__txt span{font-size:11px;color:#6b7280}
.mcta__btn{padding:8px 14px;background:#c4956a;color:#fff;border-radius:8px;font-size:11px;font-weight:700;white-space:nowrap;flex-shrink:0}

/* === HOW === */
.how{background:#fff}
.how__g{display:flex;flex-direction:column;gap:10px}
.how__s{display:flex;align-items:flex-start;gap:12px;padding:14px;background:#fafafa;border-radius:10px}
.how__n{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#fff;flex-shrink:0}
.how__n--1{background:#c4956a}
.how__n--2{background:#3b82f6}
.how__n--3{background:#10b981}
.how__s h3{font-size:14px;font-weight:700;color:#111;margin-bottom:2px}
.how__s p{font-size:12px;color:#6b7280;margin:0;line-height:1.5}

/* === VENDOR CTA === */
.vcta{padding:28px 0;background:#1e293b;color:#fff}
.vcta__in{display:flex;flex-direction:column;align-items:center;text-align:center;gap:20px}
.vcta__badge{display:inline-block;padding:3px 10px;background:rgba(196,149,106,.15);color:#c4956a;border-radius:5px;font-size:10px;font-weight:700;letter-spacing:.5px;margin-bottom:6px}
.vcta__ct h2{font-size:20px;font-weight:800;margin:0 0 6px}
.vcta__ct p{font-size:13px;opacity:.65;margin:0 0 14px}
.vcta__btn{display:inline-block;padding:10px 24px;background:#c4956a;color:#fff;border-radius:8px;font-size:13px;font-weight:700}
.vcta__card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px 18px;width:100%;max-width:260px}
.vcta__row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:13px}
.vcta__row:last-child{border:none}
.vcta__row span{color:#94a3b8}
.vcta__row strong{color:#c4956a}

/* ===== TABLET 769px+ ===== */
@media(min-width:769px){
    .cnt{padding:0 32px}
    .sec__t{font-size:20px}
    .hp__pad{display:none}
    .mh{display:none}
    .dh{display:block;padding:24px 0 0;background:#fafafa}
    .dh__in{display:flex;gap:20px;align-items:stretch}
    .dh__main{flex:1;min-width:0;border-radius:16px;overflow:hidden;position:relative}
    .dh__track{display:flex;transition:transform .5s ease}
    .dh__slide{min-width:100%;padding:44px 48px;display:flex;align-items:center;min-height:260px;color:#fff}
    .dh__slide--1{background:#c4956a}
    .dh__slide--2{background:#1e293b}
    .dh__slide--3{background:#4f46e5}
    .dh__ct{max-width:420px}
    .dh__badge{display:inline-block;padding:3px 10px;background:rgba(255,255,255,.2);border-radius:5px;font-size:10px;font-weight:700;letter-spacing:.5px;margin-bottom:10px}
    .dh__title{font-size:28px;font-weight:800;line-height:1.15;letter-spacing:-.3px;margin:0 0 8px}
    .dh__em{opacity:.85}
    .dh__sub{font-size:14px;opacity:.8;margin:0}
    .dh__stats{display:flex;gap:8px;font-size:12px;margin-top:12px;opacity:.7}
    .dh__cta{display:inline-block;margin-top:16px;padding:10px 22px;background:rgba(255,255,255,.2);color:#fff;border-radius:8px;font-size:13px;font-weight:700}
    .dh__dots{position:absolute;bottom:14px;left:50%;transform:translateX(-50%);display:flex;gap:6px}
    .dh__dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.3);border:none;padding:0;cursor:pointer;transition:all .2s}
    .dh__dot.on{background:#fff;width:22px;border-radius:4px}
    .dh__side{width:260px;flex-shrink:0;background:#fff;border-radius:16px;border:1px solid #eee;padding:18px;display:flex;flex-direction:column;gap:2px}
    .dh__stt{font-size:10px;font-weight:700;color:#9ca3af;letter-spacing:1px;margin-bottom:6px}
    .dh__qi{display:flex;align-items:center;gap:10px;padding:9px 8px;border-radius:8px;transition:.15s;color:#111;font-size:14px;font-weight:600}
    .dh__qi:hover{background:#f9fafb;color:#c4956a}
    .dh__ql{flex:1}
    .dh__pop{margin-top:auto;padding-top:10px;border-top:1px solid #f3f4f6}
    .dh__pop span{font-size:10px;color:#9ca3af;display:block;margin-bottom:4px}
    .dh__pop div{display:flex;flex-wrap:wrap;gap:4px}
    .dh__pop a{padding:3px 8px;background:#f3f4f6;border-radius:5px;font-size:11px;color:#4b5563;transition:.2s}
    .dh__pop a:hover{background:#c4956a;color:#fff}

    .tb{padding:20px 32px}
    .tb__in{grid-template-columns:repeat(4,1fr);gap:12px}
    .tb__i{padding:14px 16px}
    .tb__i strong{font-size:15px}

    .cats__g{grid-template-columns:repeat(3,1fr);gap:10px}
    .cc{padding:12px}
    .cc__ic{width:40px;height:40px}
    .cc__name{font-size:13px}

    .scroll{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;overflow:visible;scroll-snap-type:none}
    .card{min-width:unset;max-width:unset}
    .card__img{height:140px}
    .card__name{font-size:13px}
    .card__price{font-size:18px}
    .dp__now{font-size:17px}

    .mcta__in{max-width:520px;margin:0 auto}

    .how__g{flex-direction:row;gap:14px}
    .how__s{flex:1;flex-direction:column;text-align:center;align-items:center;padding:20px 14px;border-radius:14px}
    .how__n{width:40px;height:40px;font-size:16px;margin-bottom:6px}

    .vcta__in{flex-direction:row;text-align:left;gap:40px}
    .vcta__ct h2{font-size:26px}
}

/* ===== DESKTOP 1024px+ ===== */
@media(min-width:1024px){
    .dh__side{width:280px}
    .dh__slide{padding:52px 60px;min-height:300px}
    .dh__title{font-size:32px}
    .cats__g{grid-template-columns:repeat(4,1fr)}
    .scroll{grid-template-columns:repeat(5,1fr)}
}
@media(min-width:1280px){
    .dh__slide{min-height:320px;padding:56px 68px}
    .dh__title{font-size:36px}
    .scroll{grid-template-columns:repeat(6,1fr)}
}
@media(max-width:360px){
    .card{min-width:136px;max-width:136px}
    .mh__title{font-size:15px}
}
</style>
