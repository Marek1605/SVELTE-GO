<script>
    import { onMount } from 'svelte';
    import { api } from '$lib/api';
    
    export let data;
    
    let searchQuery = '';
    let showMoreCats = false;
    let moreRef;
    let categories = data?.categories || [];
    let topProducts = data?.products || [];
    let categoryProducts = [];
    let priceDropProducts = [];
    let stats = data?.stats || { products: 0, categories: 0 };
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
    let banners = [
        { badge: 'NOVÉ', title: 'Porovnajte si ceny z overených e-shopov', subtitle: '', color: '#c4956a', icon: '🔍' },
        { badge: 'PRE E-SHOPY', title: 'Pridajte váš obchod na MegaPrice', subtitle: 'CPC od 0,05 € · Zadarmo', color: '#1e293b', icon: '🏪' },
        { badge: 'TIP', title: 'Ušetrite aj 40% porovnaním cien', subtitle: 'Porovnajte ceny na jednom mieste', color: '#4f46e5', icon: '💰' },
    ];
    $: totalBanners = banners.length;

    function animateCount(target, setter, dur = 1200) {
        if (target <= 0) return;
        let s = 0; const step = target / (dur / 16);
        const t = setInterval(() => { s += step; if (s >= target) { setter(target); clearInterval(t); } else setter(Math.floor(s)); }, 16);
    }
    
    const popularSearches = ['notebook', 'iPhone 16', 'televízor', 'slúchadlá', 'Samsung Galaxy', 'vysávač'];
    const quickActions = [
        { icon: '🔥', label: 'Hot', href: '/hladat?sort=popular' },
        { icon: '📉', label: 'Poklesy', href: '/hladat?sort=price_drop' },
        { icon: '⭐', label: 'Nové', href: '/hladat?sort=newest' },
        { icon: '🏷️', label: 'Akcie', href: '/hladat?sort=deals' },
        { icon: '📊', label: 'Trendy', href: '/hladat?sort=trending' },
    ];
    const categoryEmojis = {
        'elektronika':'📱','dom':'🏠','záhrad':'🌳','hračky':'🧸','hry':'🎮',
        'šport':'⚽','it':'💻','počítač':'💻','domáce':'🔌','spotrebič':'🔌',
        'dieťa':'👶','baby':'👶','zviera':'🐾','zdravie':'💊',
        'krása':'💄','auto':'🚗','foto':'📸','kuchyn':'🍳',
        'nábytok':'🪑','oblečen':'👕','obuv':'👟','hobby':'🎨',
        'grilov':'🔥','kancel':'📎','biela':'🧊','hodin':'⌚','nástroj':'🔧',
    };
    function getCatEmoji(name) {
        const l = (name||'').toLowerCase();
        for (const [k,v] of Object.entries(categoryEmojis)) { if (l.includes(k)) return v; }
        return '📦';
    }
    const catColors = ['#fff7ed','#eff6ff','#ecfdf5','#fdf2f8','#f5f3ff','#fefce8','#fef2f2','#f0fdfa','#f1f5f9','#fff1f2','#f0fdf4','#faf5ff'];

    function totalProducts(cat) {
        let c = cat.product_count || 0;
        if (cat.children) for (const ch of cat.children) c += totalProducts(ch);
        return c;
    }
    function handleSearch(e) { e.preventDefault(); if (searchQuery.trim()) window.location.href = '/hladat?q=' + encodeURIComponent(searchQuery); }
    function toggleMore() { showMoreCats = !showMoreCats; }
    function handleClickOutside(e) { if (moreRef && !moreRef.contains(e.target)) showMoreCats = false; }
    function fmtPrice(p) { return (p || 0).toFixed(2).replace('.', ','); }
    function fmtNum(n) { return (n || 0).toLocaleString('sk-SK'); }
    function calcDrop(p) {
        if (p.drop_pct) return Math.round(p.drop_pct);
        if (p.price_old && p.price_min && p.price_old > p.price_min) return Math.round(((p.price_old - p.price_min) / p.price_old) * 100);
        if (p.price_drop && p.price_min) return Math.round((p.price_drop / (p.price_min + p.price_drop)) * 100);
        return 0;
    }
    function getOldPrice(p) {
        if (p.price_old) return p.price_old;
        if (p.price_drop && p.price_min) return p.price_min + p.price_drop;
        return 0;
    }
    function goToBanner(i) { currentBanner = i; resetBannerTimer(); }
    function nextBanner() { currentBanner = (currentBanner + 1) % totalBanners; }
    function resetBannerTimer() { if (bannerInterval) clearInterval(bannerInterval); bannerInterval = setInterval(nextBanner, 5000); }
    function handleTouchStart(e) { touchStartX = e.touches[0].clientX; }
    function handleTouchEnd(e) {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
            if (diff > 0) currentBanner = Math.min(currentBanner + 1, totalBanners - 1);
            else currentBanner = Math.max(currentBanner - 1, 0);
            resetBannerTimer();
        }
    }

    $: visibleCats = categories.slice(0, 8);
    $: overflowCats = categories.slice(8);

    onMount(async () => {
        document.addEventListener('click', handleClickOutside, true);
        bannerInterval = setInterval(nextBanner, 5000);
        
        // Start animating immediately with whatever data we have
        if (stats.products > 0 || stats.categories > 0) {
            animStarted = true;
            animateCount(stats.products, v => animProducts = v);
            animateCount(stats.categories || categories.length, v => animCategories = v);
        }
        
        try {
            const setRes = await fetch('/api/v1/site/settings');
            const setData = await setRes.json();
            if (setData?.success && setData?.data) {
                const d = setData.data;
                if (d.hero_title) heroTitle = d.hero_title;
                if (d.hero_subtitle) heroSubtitle = d.hero_subtitle;
                homeCatSections = parseInt(d.home_category_sections) || 3;
                showHow = d.show_how_section !== 'false' && d.show_how_it_works !== 'false';
                showVendor = d.show_vendor_cta !== 'false';
                // Load banners from settings
                if (d.home_banners) {
                    try {
                        const parsed = JSON.parse(d.home_banners);
                        if (Array.isArray(parsed) && parsed.length > 0) banners = parsed;
                    } catch(e) {}
                }
            }
        } catch(e) {}
        
        try {
            const catRes = await api.getCategoriesTree ? await api.getCategoriesTree() : await api.getCategories();
            let cats = [];
            if (catRes?.success && Array.isArray(catRes.data)) cats = catRes.data;
            else if (catRes?.success && catRes?.categories) cats = catRes.categories;
            else if (Array.isArray(catRes)) cats = catRes;
            if (cats.length > 0) categories = cats;
        } catch(e) {}
        // Fallback: use layout navCategories if page categories empty
        if (categories.length === 0 && data?.navCategories?.length > 0) {
            categories = data.navCategories;
        }
        
        try {
            const prodRes = await api.getProducts('sort=popular&limit=6');
            let items = [];
            if (prodRes?.success && prodRes?.data?.items) { items = prodRes.data.items; stats.products = prodRes.data.total || items.length; }
            else if (prodRes?.items) items = prodRes.items;
            if (items.length > 0) topProducts = items;
        } catch(e) {}
        
        // Price drops - try dedicated endpoint first, fallback to sort
        try {
            const dropRes = await fetch('/api/v1/price-drops?limit=6');
            const dropData = await dropRes.json();
            if (dropData?.success && dropData?.data?.items) priceDropProducts = dropData.data.items;
            else if (dropData?.items) priceDropProducts = dropData.items;
        } catch(e) {}
        if (priceDropProducts.length === 0) {
            try {
                const dropRes = await api.getProducts('sort=price_drop&limit=6');
                let items = [];
                if (dropRes?.success && dropRes?.data?.items) items = dropRes.data.items;
                else if (dropRes?.items) items = dropRes.items;
                priceDropProducts = items;
            } catch(e) {}
        }
        
        try {
            const sr = await fetch('/api/v1/stats');
            const sd = await sr.json();
            if (sd?.success && sd?.data) stats = sd.data;
            else if (sd?.products !== undefined) stats = sd;
        } catch(e) {}
        
        stats.categories = stats.categories || categories.length;
        stats.products = stats.products || topProducts.length;
        // Ensure we have at least some counts to show
        if (stats.products === 0 && data?.stats?.products) stats.products = data.stats.products;
        if (stats.categories === 0 && data?.stats?.categories) stats.categories = data.stats.categories;
        if (stats.categories === 0) stats.categories = categories.length;
        loaded = true;
        if (!animStarted) { animStarted = true; animateCount(stats.products, v => animProducts = v); animateCount(stats.categories, v => animCategories = v); }
        
        const catsWithProducts = categories.filter(c => totalProducts(c) > 0).slice(0, homeCatSections);
        for (const cat of catsWithProducts) {
            try {
                const res = await api.getProducts('category=' + cat.slug + '&limit=6&sort=popular');
                let items = [];
                if (res?.success && res?.data?.items) items = res.data.items;
                else if (res?.items) items = res.items;
                if (items.length > 0) categoryProducts = [...categoryProducts, { name: cat.name, slug: cat.slug, products: items }];
            } catch(e) {}
        }
        
        return () => { document.removeEventListener('click', handleClickOutside, true); if (bannerInterval) clearInterval(bannerInterval); };
    });
</script>

<svelte:head>
    <title>MegaPrice.sk — Porovnávač cien | Najlepšie ponuky na jednom mieste</title>
    <meta name="description" content="Porovnajte ceny z overených slovenských obchodov. Nájdite najlepšie ponuky na elektroniku, domácnosť a ďalšie.">
</svelte:head>

<div class="hp">

    <!-- ===== SEARCH BAR ===== -->
    <section class="srch">
        <form class="srch__f" on:submit={handleSearch}>
            <svg class="srch__ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Hľadať produkt, značku..." bind:value={searchQuery}>
            <button type="submit"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button>
        </form>
    </section>

    <!-- ===== BANNER CAROUSEL ===== -->
    <section class="banners" on:touchstart={handleTouchStart} on:touchend={handleTouchEnd}>
        <div class="banners__track" style="transform:translateX(-{currentBanner * 100}%)">
            {#each banners as b}
            <div class="banners__slide" style="background:{b.color}">
                <span class="banners__badge">{b.badge}</span>
                <h2 class="banners__title">{b.title}</h2>
                {#if b.subtitle}<p class="banners__sub">{b.subtitle}</p>{/if}
                {#if !b.subtitle && animProducts > 0}<p class="banners__sub">{fmtNum(animProducts)}+ produktov</p>{/if}
                <div class="banners__deco">{b.icon || '🔍'}</div>
            </div>
            {/each}
        </div>
        <div class="banners__dots">
            {#each banners as _, i}<button class="banners__dot" class:active={currentBanner===i} on:click={() => goToBanner(i)}></button>{/each}
        </div>
    </section>

    <!-- ===== TRUST BAR (2×2 colored icons) ===== -->
    <!-- ===== DESKTOP HERO (banner + sidebar) — hidden on mobile ===== -->
    <section class="dhero">
        <div class="dhero__inner">
            <div class="dhero__main" on:touchstart={handleTouchStart} on:touchend={handleTouchEnd}>
                <div class="dhero__track" style="transform:translateX(-{currentBanner * 100}%)">
                    {#each banners as b}
                    <div class="dhero__slide" style="background:{b.color}">
                        <div class="dhero__content">
                            <span class="dhero__badge">{b.badge}</span>
                            <h2 class="dhero__title">{@html heroTitle.replace(/\*([^*]+)\*/g, '<span class="dhero__em">$1</span>')}</h2>
                            <p class="dhero__sub">{b.title}</p>
                            <div class="dhero__stats"><span>{fmtNum(animProducts)}+ produktov</span><span class="dhero__sep">·</span><span>{fmtNum(animCategories)} kategórií</span><span class="dhero__sep">·</span><span>Overené e-shopy</span></div>
                        </div>
                        <div class="dhero__deco">{b.icon || '🔍'}</div>
                    </div>
                    {/each}
                </div>
                <div class="dhero__dots">
                    {#each banners as _, i}<button class="dhero__dot" class:active={currentBanner===i} on:click={() => goToBanner(i)}></button>{/each}
                </div>
            </div>
            <div class="dhero__side">
                <div class="dhero__qa-title">Rýchle akcie</div>
                {#each quickActions as qa}
                    <a href={qa.href} class="dhero__qa-item"><span class="dhero__qa-icon">{qa.icon}</span><span class="dhero__qa-label">{qa.label}</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></a>
                {/each}
                <div class="dhero__qa-tags">
                    <span>Populárne:</span>
                    {#each popularSearches.slice(0,4) as term}<a href="/hladat?q={encodeURIComponent(term)}">{term}</a>{/each}
                </div>
            </div>
        </div>
    </section>

    <!-- ===== TRUST BAR (modern card with gradient icons) ===== -->
    <section class="trust">
        <div class="trust__inner">
            <div class="trust__item">
                <div class="trust__ic trust__ic--o"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div>
                <div class="trust__txt"><span class="trust__num">{fmtNum(animProducts)}+</span><span class="trust__label">produktov</span></div>
            </div>
            <div class="trust__sep"></div>
            <div class="trust__item">
                <div class="trust__ic trust__ic--b"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
                <div class="trust__txt"><span class="trust__num">{fmtNum(animCategories)}</span><span class="trust__label">kategórií</span></div>
            </div>
            <div class="trust__sep"></div>
            <div class="trust__item">
                <div class="trust__ic trust__ic--g"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                <div class="trust__txt"><span class="trust__num">Overené</span><span class="trust__label">e-shopy</span></div>
            </div>
            <div class="trust__sep"></div>
            <div class="trust__item">
                <div class="trust__ic trust__ic--p"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
                <div class="trust__txt"><span class="trust__num">Denne</span><span class="trust__label">aktualizované</span></div>
            </div>
        </div>
    </section>

    <!-- ===== CATEGORIES (colored cards) ===== -->
    {#if categories.length > 0}
    <section class="cats">
        <div class="sec-h"><div><h2 class="sec-t">Kategórie</h2><p class="sec-s">Prechádzajte produkty podľa kategórií</p></div><a href="/kategorie" class="sec-lnk">Všetky →</a></div>
        <div class="cats__grid">
            {#each visibleCats as cat, i}
                <a href="/kategoria/{cat.slug}" class="cc" style="background:{catColors[i%catColors.length]}">
                    <div class="cc__ic">{#if cat.image_url}<img src={cat.image_url} alt={cat.name}/>{:else}<span>{getCatEmoji(cat.name)}</span>{/if}</div>
                    <div class="cc__info"><span class="cc__name">{cat.name}</span>{#if totalProducts(cat)>0}<span class="cc__cnt">{fmtNum(totalProducts(cat))} produktov</span>{/if}</div>
                </a>
            {/each}
        </div>
        {#if overflowCats.length > 0}
        <div class="cats__more" bind:this={moreRef}>
            <button class="cats__mbtn" on:click={toggleMore}>
                {showMoreCats ? 'Skryť' : 'Ďalších ' + overflowCats.length + ' kategórií'}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="transform:rotate({showMoreCats?180:0}deg);transition:transform .2s"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {#if showMoreCats}
            <div class="cats__grid cats__grid--extra">
                {#each overflowCats as cat, i}
                    <a href="/kategoria/{cat.slug}" class="cc" style="background:{catColors[(i+8)%catColors.length]}">
                        <div class="cc__ic">{#if cat.image_url}<img src={cat.image_url} alt={cat.name}/>{:else}<span>{getCatEmoji(cat.name)}</span>{/if}</div>
                        <div class="cc__info"><span class="cc__name">{cat.name}</span>{#if totalProducts(cat)>0}<span class="cc__cnt">{fmtNum(totalProducts(cat))} produktov</span>{/if}</div>
                    </a>
                {/each}
            </div>
            {/if}
        </div>
        {/if}
    </section>
    {/if}

    <!-- ===== CENOVÉ POKLESY ===== -->
    {#if priceDropProducts.length > 0}
    <section class="drops">
        <div class="sec-h">
            <div class="drops__hd"><h2 class="sec-t"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg> Cenové poklesy</h2><span class="drops__live">LIVE</span></div>
        </div>
        <div class="drops__scroll">
            {#each priceDropProducts as dp}
                <a href="/produkt/{dp.slug}" class="dp">
                    {#if calcDrop(dp) > 0}<span class="dp__pct">-{calcDrop(dp)}%</span>{/if}
                    <div class="dp__img">{#if dp.image_url}<img src={dp.image_url} alt={dp.title}>{:else}<div class="dp__ph">📷</div>{/if}</div>
                    <div class="dp__body">
                        <h3 class="dp__name">{dp.title}</h3>
                        <div class="dp__prices">
                            <span class="dp__now">{fmtPrice(dp.price_min || dp.price)} €</span>
                            {#if getOldPrice(dp) > 0}<span class="dp__old">{fmtPrice(getOldPrice(dp))} €</span>{/if}
                        </div>
                    </div>
                </a>
            {/each}
        </div>
    </section>
    {/if}

    <!-- ===== MINI VENDOR CTA ===== -->
    {#if showVendor}
    <section class="minicta">
        <a href="/prihlasenie-predajcu" class="minicta__inner">
            <div class="minicta__icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c4956a" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div>
            <div class="minicta__text"><strong>Predávate online?</strong><span>CPC od 0,05 € · XML feed</span></div>
            <span class="minicta__btn">Pridať →</span>
        </a>
    </section>
    {/if}

    <!-- ===== TOP PRODUCTS ===== -->
    {#if topProducts.length > 0}
    <section class="prods">
        <div class="sec-h"><div><h2 class="sec-t">TOP porovnania</h2><p class="sec-s">Produkty s najviac ponukami</p></div><a href="/produkty" class="sec-lnk">Všetky →</a></div>
        <div class="pscroll">
            {#each topProducts as product, i}
                <a href="/produkt/{product.slug}" class="p">
                    {#if i<3}<div class="p__rk" class:p__rk--1={i===0} class:p__rk--2={i===1} class:p__rk--3={i===2}>{i+1}</div>{/if}
                    <div class="p__img">{#if product.image_url}<img src={product.image_url} alt={product.title}>{:else}<div class="p__ph">📷</div>{/if}</div>
                    <div class="p__body">
                        {#if product.brand}<span class="p__brand">{product.brand}</span>{/if}
                        <h3 class="p__name">{product.title}</h3>
                        {#if product.offer_count>0}<span class="p__offers">{product.offer_count} {product.offer_count===1?'ponuka':product.offer_count<5?'ponuky':'ponúk'}</span>{/if}
                        <div class="p__price"><span class="p__pf">od </span><span class="p__pv">{fmtPrice(product.price_min||product.price)} €</span></div>
                        <div class="p__cta">Porovnať ceny →</div>
                    </div>
                </a>
            {/each}
        </div>
    </section>
    {/if}

    <!-- ===== QUICK ACTIONS (modern, lower) ===== -->
    <section class="qa-section">
        <div class="qa-section__inner">
            {#each quickActions as qa}
                <a href={qa.href} class="qab">
                    <span class="qab__icon">{qa.icon}</span>
                    <span class="qab__label">{qa.label}</span>
                    <svg class="qab__arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </a>
            {/each}
        </div>
    </section>

    <!-- ===== CATEGORY PRODUCTS ===== -->
    {#each categoryProducts as catSec}
    <section class="cprods">
        <div class="sec-h"><div><h2 class="sec-t">{catSec.name}</h2><p class="sec-s">Najobľúbenejšie v kategórii</p></div><a href="/kategoria/{catSec.slug}" class="sec-lnk">Všetky →</a></div>
        <div class="pscroll">
            {#each catSec.products as product}
                <a href="/produkt/{product.slug}" class="p">
                    <div class="p__img">{#if product.image_url}<img src={product.image_url} alt={product.title}>{:else}<div class="p__ph">📷</div>{/if}</div>
                    <div class="p__body">
                        {#if product.brand}<span class="p__brand">{product.brand}</span>{/if}
                        <h3 class="p__name">{product.title}</h3>
                        <div class="p__price"><span class="p__pf">od </span><span class="p__pv">{fmtPrice(product.price_min||product.price)} €</span></div>
                        <div class="p__cta">Porovnať ceny →</div>
                    </div>
                </a>
            {/each}
        </div>
    </section>
    {/each}

    <!-- ===== HOW IT WORKS ===== -->
    {#if showHow}
    <section class="how">
        <div class="how__hd"><h2 class="sec-t">Ako funguje MegaPrice?</h2><p class="sec-s">Tri jednoduché kroky k najlepšej cene</p></div>
        <div class="how__grid">
            <div class="how__step"><div class="how__nw how__nw--1"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c2410c" stroke-width="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div><div class="how__c"><div class="how__sn">Krok 1</div><h3 class="how__st">Vyhľadajte</h3><p class="how__sx">Zadajte názov produktu alebo prechádzajte kategórie.</p></div></div>
            <div class="how__step"><div class="how__nw how__nw--2"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" stroke-width="1.8"><path d="M17 2l4 4-4 4"/><path d="M3 6h18"/><path d="M7 14l-4 4 4 4"/><path d="M21 18H3"/></svg></div><div class="how__c"><div class="how__sn">Krok 2</div><h3 class="how__st">Porovnajte</h3><p class="how__sx">Porovnajte ceny od rôznych predajcov na jednom mieste.</p></div></div>
            <div class="how__step how__step--last"><div class="how__nw how__nw--3"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg></div><div class="how__c"><div class="how__sn">Krok 3</div><h3 class="how__st">Ušetrite</h3><p class="how__sx">Vyberte najlepšiu ponuku a nakúpte priamo u predajcu.</p></div></div>
        </div>
    </section>
    {/if}

    <!-- ===== VENDOR CTA ===== -->
    {#if showVendor}
    <section class="vcta">
        <div class="vcta__inner">
            <span class="vcta__badge">PRE E-SHOPY</span>
            <h2 class="vcta__title">Získajte zákazníkov, ktorí chcú kupovať</h2>
            <p class="vcta__text">Pridajte svoj e-shop na MegaPrice. Platíte len za kliknutia.</p>
            <div class="vcta__feats">
                <div class="vcta__feat"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4956a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>CPC od 0,05 €</span></div>
                <div class="vcta__feat"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4956a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>XML / CSV feed import</span></div>
                <div class="vcta__feat"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4956a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>Registrácia zadarmo</span></div>
                <div class="vcta__feat"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4956a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>Real-time štatistiky</span></div>
            </div>
            <a href="/prihlasenie-predajcu" class="vcta__btn">Začať predávať →</a>
            <div class="vcta__card">
                <div class="vcta__row"><span>CPC od</span><strong>0,05 €</strong></div>
                <div class="vcta__row"><span>Registrácia</span><strong>Zadarmo</strong></div>
                <div class="vcta__row"><span>Feed import</span><strong>XML / CSV</strong></div>
            </div>
        </div>
    </section>
    {/if}

</div>

<style>
.hp{background:#f8fafc;overflow-x:hidden}
.sec-h{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:12px;gap:12px;padding:0 16px}
.sec-t{font-size:18px;font-weight:800;color:#0f172a;margin:0;letter-spacing:-.3px}
.sec-s{font-size:12px;color:#64748b;margin:2px 0 0}
.sec-lnk{font-size:12px;font-weight:600;color:#c4956a;white-space:nowrap}

/* ====== SEARCH ====== */
.srch{padding:12px 16px 0}
.srch__f{display:flex;align-items:center;background:#fff;border:1.5px solid #e5e7eb;border-radius:12px;padding:3px;position:relative}
.srch__ico{position:absolute;left:14px;pointer-events:none}
.srch__f input{flex:1;border:none;background:none;padding:11px 8px 11px 40px;font-size:14px;color:#1e293b;outline:none;font-family:inherit;min-width:0}
.srch__f input::placeholder{color:#94a3b8}
.srch__f button{padding:10px 16px;background:#c4956a;border-radius:9px;color:#fff;border:none;display:flex;align-items:center;cursor:pointer;flex-shrink:0;transition:background .15s}
.srch__f button:hover{background:#b8855c}

/* ====== BANNERS ====== */
.banners{padding:12px 16px 0;position:relative;overflow:hidden}
.banners__track{display:flex;transition:transform .4s cubic-bezier(.25,.46,.45,.94);width:100%}
.banners__slide{min-width:100%;border-radius:14px;padding:22px 20px;position:relative;overflow:hidden;color:#fff;box-sizing:border-box}
.banners__badge{display:inline-block;padding:3px 10px;background:rgba(255,255,255,.2);border-radius:6px;font-size:9px;font-weight:700;letter-spacing:.5px;margin-bottom:8px}
.banners__title{font-size:17px;font-weight:800;margin:0 0 4px;line-height:1.25;letter-spacing:-.2px;max-width:80%}
.banners__sub{font-size:11px;opacity:.75;margin:0;max-width:80%}
.banners__deco{position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:52px;opacity:.1}
.banners__dots{display:flex;gap:6px;justify-content:center;padding:10px 0 2px}
.banners__dot{width:7px;height:7px;border-radius:50%;background:#cbd5e1;border:none;padding:0;cursor:pointer;transition:all .3s}
.banners__dot.active{background:#c4956a;width:20px;border-radius:4px}

/* ====== TRUST BAR (modern card) ====== */
.trust{padding:0 16px;margin-top:12px;position:relative;z-index:2}
.trust__inner{max-width:960px;margin:0 auto;padding:14px 16px;background:#fff;border-radius:14px;box-shadow:0 4px 20px rgba(0,0,0,.08);display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.trust__item{display:flex;align-items:center;gap:8px}
.trust__ic{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.trust__ic--o{background:linear-gradient(135deg,#fff7ed,#fed7aa);color:#c2410c}
.trust__ic--b{background:linear-gradient(135deg,#eff6ff,#bfdbfe);color:#1d4ed8}
.trust__ic--g{background:linear-gradient(135deg,#ecfdf5,#a7f3d0);color:#15803d}
.trust__ic--p{background:linear-gradient(135deg,#f5f3ff,#ddd6fe);color:#7c3aed}
.trust__txt{display:flex;flex-direction:column}
.trust__num{font-size:14px;font-weight:800;color:#0f172a;line-height:1.2}
.trust__label{font-size:9px;color:#64748b}
.trust__sep{display:none}

/* ====== CATEGORIES ====== */
.cats{padding:24px 0 8px}
.cats__grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;padding:0 16px}
.cats__grid--extra{margin-top:8px}
.cc{display:flex;align-items:center;gap:10px;padding:12px;border-radius:12px;transition:all .15s;overflow:hidden}
.cc:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.06)}
.cc__ic{width:40px;height:40px;border-radius:10px;background:rgba(255,255,255,.7);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;font-size:20px}
.cc__ic img{width:100%;height:100%;object-fit:cover;border-radius:10px}
.cc__info{min-width:0;flex:1}
.cc__name{display:block;font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#0f172a;max-width:100px}
.cc__cnt{font-size:10px;color:#64748b}
.cats__more{text-align:center;margin-top:12px;padding:0 16px}
.cats__mbtn{display:inline-flex;align-items:center;gap:6px;padding:8px 18px;background:none;border:1px solid #e2e8f0;border-radius:8px;font-size:12px;font-weight:600;color:#475569;cursor:pointer;transition:all .2s}
.cats__mbtn:hover{border-color:#c4956a;color:#c4956a}

/* ====== CENOVÉ POKLESY ====== */
.drops{padding:24px 0 8px}
.drops__hd{display:flex;align-items:center;gap:8px}
.drops__hd .sec-t{display:flex;align-items:center;gap:6px}
.drops__live{display:inline-flex;padding:2px 8px;background:#ecfdf5;color:#059669;border-radius:100px;font-size:9px;font-weight:800;letter-spacing:.5px;animation:livePulse 2s infinite}
@keyframes livePulse{0%,100%{opacity:1}50%{opacity:.5}}
.drops__scroll{display:flex;gap:10px;overflow-x:auto;-webkit-overflow-scrolling:touch;scroll-snap-type:x mandatory;padding:0 16px 4px;scrollbar-width:none}
.drops__scroll::-webkit-scrollbar{display:none}
.dp{min-width:152px;max-width:152px;scroll-snap-align:start;background:#fff;border:1.5px solid #e2e8f0;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;position:relative;color:#0f172a;flex-shrink:0;transition:all .2s}
.dp:hover{box-shadow:0 4px 16px rgba(0,0,0,.07);transform:translateY(-2px);border-color:#059669}
.dp__pct{position:absolute;top:8px;left:8px;z-index:1;padding:2px 7px;background:#ecfdf5;color:#059669;border-radius:6px;font-size:11px;font-weight:800}
.dp__img{height:100px;display:flex;align-items:center;justify-content:center;padding:8px}
.dp__img img{max-width:100%;max-height:100%;object-fit:contain}
.dp__ph{font-size:24px;opacity:.12}
.dp__body{padding:0 10px 10px}
.dp__name{font-size:11px;font-weight:600;line-height:1.3;margin:0 0 4px;color:#1e293b;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:28px}
.dp__prices{display:flex;align-items:baseline;gap:6px;flex-wrap:wrap}
.dp__now{font-size:16px;font-weight:900;color:#0f172a;letter-spacing:-.3px}
.dp__old{font-size:11px;color:#94a3b8;text-decoration:line-through}

/* ====== MINI CTA ====== */
.minicta{padding:8px 16px 0}
.minicta__inner{display:flex;align-items:center;gap:12px;padding:14px 16px;background:#fff;border:1.5px solid #e2e8f0;border-radius:12px;transition:all .2s}
.minicta__inner:hover{border-color:#c4956a;box-shadow:0 4px 12px rgba(0,0,0,.04)}
.minicta__icon{width:40px;height:40px;border-radius:10px;background:#fef7f0;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.minicta__text{flex:1;min-width:0;display:flex;flex-direction:column}
.minicta__text strong{font-size:13px;font-weight:700;color:#0f172a}
.minicta__text span{font-size:11px;color:#64748b}
.minicta__btn{padding:8px 16px;background:#c4956a;color:#fff;border-radius:8px;font-size:12px;font-weight:700;white-space:nowrap;flex-shrink:0;transition:all .2s}
.minicta__inner:hover .minicta__btn{background:#b8855c}

/* ====== PRODUCTS ====== */
.prods,.cprods{padding:24px 0 8px}
.prods{background:#fff}
.cprods{background:#f8fafc}
.pscroll{display:flex;gap:10px;overflow-x:auto;-webkit-overflow-scrolling:touch;scroll-snap-type:x mandatory;padding:0 16px 6px;scrollbar-width:none}
.pscroll::-webkit-scrollbar{display:none}
.p{min-width:152px;max-width:152px;scroll-snap-align:start;background:#fff;border:1.5px solid #e2e8f0;border-radius:10px;overflow:hidden;display:flex;flex-direction:column;position:relative;color:#0f172a;flex-shrink:0;transition:all .2s}
.p:hover{box-shadow:0 4px 16px rgba(0,0,0,.07);transform:translateY(-2px);border-color:#c4956a}
.p__rk{position:absolute;top:6px;left:6px;z-index:1;width:22px;height:22px;border-radius:6px;background:#1e293b;color:#fff;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800}
.p__rk--1{background:#c4956a}
.p__rk--2{background:#94a3b8}
.p__rk--3{background:#b45309}
.p__img{height:120px;background:#fafbfc;display:flex;align-items:center;justify-content:center;padding:10px}
.p__img img{max-width:100%;max-height:100%;object-fit:contain}
.p__ph{font-size:28px;opacity:.12}
.p__body{padding:10px;flex:1;display:flex;flex-direction:column}
.p__brand{font-size:9px;font-weight:700;color:#c4956a;text-transform:uppercase;letter-spacing:.5px;margin-bottom:1px}
.p__name{font-size:11px;font-weight:600;line-height:1.3;margin:0 0 4px;color:#1e293b;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:28px}
.p__offers{font-size:9px;color:#64748b;margin-bottom:3px}
.p__price{margin-bottom:6px}
.p__pf{font-size:9px;color:#94a3b8}
.p__pv{font-size:16px;font-weight:900;color:#0f172a;letter-spacing:-.3px}
.p__cta{margin-top:auto;padding:8px;text-align:center;border-radius:7px;font-size:10px;font-weight:700;background:#c4956a;color:#fff;transition:background .2s}
.p:hover .p__cta{background:#b8855c}

/* ====== QUICK ACTIONS (modern, lower) ====== */
.qa-section{padding:16px 0}
.qa-section__inner{display:flex;gap:8px;padding:0 16px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.qa-section__inner::-webkit-scrollbar{display:none}
.qab{display:flex;align-items:center;gap:8px;padding:12px 16px;background:#fff;border:1.5px solid #e2e8f0;border-radius:12px;white-space:nowrap;flex-shrink:0;transition:all .2s;color:#0f172a}
.qab:hover{border-color:#c4956a;box-shadow:0 4px 12px rgba(0,0,0,.04)}
.qab__icon{font-size:18px}
.qab__label{font-size:13px;font-weight:700}
.qab__arrow{color:#94a3b8;flex-shrink:0;transition:transform .2s}
.qab:hover .qab__arrow{transform:translateX(2px);color:#c4956a}

/* ====== HOW IT WORKS ====== */
.how{padding:32px 16px;background:#fff}
.how__hd{text-align:center;margin-bottom:24px}
.how__grid{display:flex;flex-direction:column;max-width:360px;margin:0 auto}
.how__step{display:flex;gap:14px;align-items:flex-start;padding:0 0 24px;position:relative}
.how__step--last{padding-bottom:0}
.how__step::before{content:'';position:absolute;left:21px;top:44px;bottom:0;width:2px;background:#e2e8f0}
.how__step--last::before{display:none}
.how__nw{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative;z-index:1}
.how__nw--1{background:#fff7ed}
.how__nw--2{background:#eff6ff}
.how__nw--3{background:#ecfdf5}
.how__c{padding-top:2px}
.how__sn{font-size:9px;font-weight:700;color:#c4956a;text-transform:uppercase;letter-spacing:1px;margin-bottom:1px}
.how__st{font-size:14px;font-weight:700;color:#0f172a;margin-bottom:2px}
.how__sx{font-size:12px;color:#64748b;line-height:1.4}

/* ====== VENDOR CTA ====== */
.vcta{padding:40px 16px;background:#0f172a;color:#fff;text-align:center}
.vcta__inner{max-width:480px;margin:0 auto}
.vcta__badge{display:inline-block;padding:4px 10px;background:rgba(196,149,106,.15);border-radius:6px;font-size:10px;font-weight:700;color:#c4956a;margin-bottom:10px}
.vcta__title{font-size:20px;font-weight:900;letter-spacing:-.3px;margin:0 0 8px;line-height:1.15}
.vcta__text{font-size:13px;color:#94a3b8;line-height:1.5;margin-bottom:14px}
.vcta__feats{display:flex;flex-direction:column;gap:8px;margin-bottom:20px}
.vcta__feat{display:flex;align-items:center;justify-content:center;gap:7px;font-size:12px;color:#e2e8f0}
.vcta__btn{display:inline-block;padding:12px 28px;background:#c4956a;color:#fff;border-radius:10px;font-size:13px;font-weight:700;transition:all .2s}
.vcta__btn:hover{background:#b8855c;transform:translateY(-1px)}
.vcta__card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:16px 20px;margin:20px auto 0;max-width:240px}
.vcta__row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:12px}
.vcta__row:last-child{border:none}
.vcta__row span{color:#94a3b8}
.vcta__row strong{color:#c4956a;font-weight:700}

/* ====== DESKTOP HERO (hidden on mobile) ====== */
.dhero{display:none}

/* ====== DESKTOP (769px+) ====== */
@media(min-width:769px){
    .sec-h{padding:0}
    .sec-t{font-size:22px}
    /* Hide mobile search + banners on desktop */
    .srch{display:none}
    .banners{display:none}
    /* Show desktop hero */
    .dhero{display:block;background:#f8fafc;padding:24px 24px 0}
    .dhero__inner{display:flex;gap:20px;align-items:stretch;max-width:1200px;margin:0 auto}
    .dhero__main{flex:1;min-width:0;border-radius:16px;overflow:hidden;position:relative;background:#0f172a}
    .dhero__track{display:flex;transition:transform .5s cubic-bezier(.25,.46,.45,.94)}
    .dhero__slide{min-width:100%;padding:40px 44px;display:flex;align-items:center;justify-content:space-between;position:relative;min-height:240px;color:#fff}
    .dhero__content{max-width:420px;position:relative;z-index:1}
    .dhero__badge{display:inline-block;padding:3px 10px;background:rgba(255,255,255,.2);border-radius:6px;font-size:10px;font-weight:700;letter-spacing:.5px;margin-bottom:10px}
    .dhero__title{font-size:28px;font-weight:900;line-height:1.15;letter-spacing:-.5px;margin:0 0 8px}
    .dhero__em{color:#fef3c7}
    .dhero__sub{font-size:14px;opacity:.85;line-height:1.5;margin:0}
    .dhero__stats{display:flex;font-size:12px;margin-top:14px;opacity:.7}
    .dhero__sep{margin:0 8px}
    .dhero__deco{position:absolute;right:30px;top:50%;transform:translateY(-50%);font-size:96px;opacity:.06}
    .dhero__dots{position:absolute;bottom:14px;left:50%;transform:translateX(-50%);display:flex;gap:6px}
    .dhero__dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.25);border:none;padding:0;cursor:pointer;transition:all .3s}
    .dhero__dot.active{background:#fff;width:24px;border-radius:4px}
    .dhero__side{width:240px;flex-shrink:0;background:#fff;border-radius:16px;border:1px solid #e2e8f0;padding:16px;display:flex;flex-direction:column;gap:2px}
    .dhero__qa-title{font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px}
    .dhero__qa-item{display:flex;align-items:center;gap:10px;padding:10px 8px;border-radius:8px;transition:all .15s;color:#0f172a;font-size:13px;font-weight:600}
    .dhero__qa-item:hover{background:#f8fafc;color:#c4956a}
    .dhero__qa-icon{font-size:18px;width:28px;text-align:center}
    .dhero__qa-label{flex:1}
    .dhero__qa-tags{margin-top:auto;padding-top:10px;border-top:1px solid #f1f5f9;display:flex;flex-wrap:wrap;gap:4px}
    .dhero__qa-tags span{font-size:10px;color:#94a3b8;width:100%;margin-bottom:2px}
    .dhero__qa-tags a{padding:3px 8px;background:#f1f5f9;border-radius:5px;font-size:10px;color:#475569;transition:all .2s}
    .dhero__qa-tags a:hover{background:#c4956a;color:#fff}
    /* Trust */
    .trust{padding:0 24px;margin-top:20px}
    .trust__inner{grid-template-columns:1fr auto 1fr auto 1fr auto 1fr;padding:18px 28px;gap:0;border-radius:18px;max-width:1200px}
    .trust__sep{display:block;width:1px;height:32px;background:#e2e8f0;flex-shrink:0;justify-self:center;align-self:center}
    .trust__item{justify-content:center;gap:10px}
    .trust__ic{width:38px;height:38px}
    .trust__num{font-size:15px}
    .trust__label{font-size:10px}
    /* Cats */
    .cats{padding:32px 24px 12px;max-width:1200px;margin:0 auto}
    .cats__grid{grid-template-columns:repeat(4,1fr);gap:10px;padding:0}
    .cc{padding:14px;gap:12px}
    .cc__ic{width:44px;height:44px}
    .cc__name{font-size:14px;max-width:unset}
    /* Drops */
    .drops{padding:32px 24px 12px;max-width:1200px;margin:0 auto}
    .drops__scroll{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;overflow:visible;scroll-snap-type:none;padding:0}
    .dp{min-width:unset;max-width:unset}
    .dp__img{height:120px}
    .dp__now{font-size:18px}
    /* Mini CTA */
    .minicta{max-width:560px;margin:8px auto 0;padding:8px 24px 0}
    /* Products */
    .prods,.cprods{padding:32px 24px 12px;max-width:1200px;margin:0 auto}
    .pscroll{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;overflow:visible;scroll-snap-type:none;padding:0}
    .p{min-width:unset;max-width:unset}
    .p__img{height:150px}
    .p__pv{font-size:18px}
    /* Quick actions */
    .qa-section{max-width:1200px;margin:0 auto;padding:24px}
    .qa-section__inner{gap:10px;padding:0;overflow:visible;flex-wrap:wrap;justify-content:center}
    .qab{padding:14px 20px;border-radius:14px}
    /* How */
    .how{padding:48px 24px}
    .how__grid{flex-direction:row;gap:24px;max-width:860px}
    .how__step{flex-direction:column;text-align:center;flex:1;gap:10px;padding:0}
    .how__step::before{display:none}
    .how__step--last::before{display:none}
    .how__nw{margin:0 auto;width:56px;height:56px;border-radius:16px}
    .how__c{padding:0}
    .how__sn,.how__st,.how__sx{text-align:center}
    /* Vendor CTA */
    .vcta{padding:56px 24px}
    .vcta__inner{max-width:600px}
    .vcta__title{font-size:28px}
    .vcta__feats{flex-direction:row;flex-wrap:wrap;gap:16px;justify-content:center}
}
@media(min-width:1024px){
    .dhero__side{width:280px}
    .dhero__slide{padding:48px 56px;min-height:280px}
    .dhero__title{font-size:32px}
    .cats__grid{grid-template-columns:repeat(4,1fr)}
    .drops__scroll{grid-template-columns:repeat(6,1fr)}
    .pscroll{grid-template-columns:repeat(5,1fr)}
}
@media(min-width:1280px){
    .dhero__slide{min-height:300px;padding:52px 64px}
    .dhero__title{font-size:36px}
    .dhero__sub{font-size:15px}
    .dhero__deco{font-size:120px}
}
@media(max-width:360px){
    .srch{padding:10px 12px 0}
    .banners{padding:8px 12px 0}
    .banners__title{font-size:15px;max-width:85%}
    .banners__slide{padding:16px 14px}
    .trust__inner{gap:6px;padding:10px 12px}
    .trust__ic{width:30px;height:30px;border-radius:8px}
    .trust__num{font-size:13px}
    .cats__grid{gap:6px;padding:0 12px}
    .cc{padding:10px;gap:8px}
    .cc__ic{width:34px;height:34px}
    .cc__name{font-size:12px;max-width:80px}
    .drops__scroll{padding:0 12px 4px;gap:8px}
    .pscroll{padding:0 12px 6px;gap:8px}
    .p{min-width:140px;max-width:140px}
    .dp{min-width:140px;max-width:140px}
    .sec-h{padding:0 12px}
    .minicta{padding:8px 12px 0}
    .qa-section__inner{padding:0 12px}
}
</style>
