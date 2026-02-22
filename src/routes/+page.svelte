<script>
    import { onMount } from 'svelte';
    import { api } from '$lib/api';

    export let data;
    
    let searchQuery = '';
    let showMoreCats = false;
    let moreRef;
    
    let categories = data?.categories || [];
    let topProducts = data?.products || [];
    let priceDropProducts = [];
    let categoryProducts = [];
    let stats = data?.stats || { products: 4998, categories: 531 };
    let loaded = false;
    
    // Settings from admin
    let heroTitle = 'Nájdite *najnižšiu cenu* za pár sekúnd';
    let heroSubtitle = 'Porovnávame ceny z overených obchodov na jednom mieste.';
    let homeCatSections = 3;
    let showHow = true;
    let showVendor = true;
    
    // Animated counters
    let animProducts = 0, animCategories = 0, animStarted = false;
    
    // Banner carousel (mobile)
    let currentBanner = 0;
    let bannerInterval;
    let touchStartX = 0;
    let banners = [
        { badge: 'NOVÉ', title: 'Porovnajte si ceny z overených e-shopov', subtitle: '', color: '#c4956a', icon: '🔍' },
        { badge: 'TIP', title: 'Nájdite najnižšiu cenu za pár sekúnd', subtitle: 'Ušetrite aj 40% porovnaním cien', color: '#6366f1', icon: '💰' },
        { badge: 'HOT', title: 'Sledujte cenové poklesy v reálnom čase', subtitle: 'Denne aktualizované ponuky', color: '#059669', icon: '📉' },
    ];
    
    // Quick actions
    const quickActions = [
        { icon: '🔥', label: 'Hot', href: '/hot' },
        { icon: '📉', label: 'Poklesy', href: '/poklesy' },
        { icon: '⭐', label: 'Nové', href: '/nove' },
        { icon: '🏷️', label: 'Akcie', href: '/akcie' },
        { icon: '📊', label: 'Trendy', href: '/trendy' },
    ];
    
    const popularSearches = ['🔥 iPhone 16', 'notebook', 'slúchadlá', 'Samsung', 'televízor', 'vysávač'];
    
    function totalProducts(cat) {
        let c = cat.product_count || 0;
        if (cat.children) for (const ch of cat.children) c += totalProducts(ch);
        return c;
    }
    
    function animateCount(target, setter, dur = 1000) {
        if (target <= 0) return;
        let s = 0;
        const step = target / (dur / 16);
        const t = setInterval(() => { s += step; if (s >= target) { setter(target); clearInterval(t); } else setter(Math.floor(s)); }, 16);
    }
    
    // Banner carousel
    function nextBanner() { currentBanner = (currentBanner + 1) % banners.length; }
    function goToBanner(i) { currentBanner = i; resetBannerTimer(); }
    function resetBannerTimer() { clearInterval(bannerInterval); bannerInterval = setInterval(nextBanner, 5000); }
    function handleTouchStart(e) { touchStartX = e.touches[0].clientX; }
    function handleTouchEnd(e) {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) currentBanner = Math.min(currentBanner + 1, banners.length - 1);
            else currentBanner = Math.max(currentBanner - 1, 0);
            resetBannerTimer();
        }
    }
    
    // Price drop helpers
    function calcDrop(p) { const old = getOldPrice(p); return old > 0 ? Math.round((1 - (p.price_min || p.price) / old) * 100) : 0; }
    function getOldPrice(p) { return p.price_original || p.old_price || 0; }
    
    function handleSearch(e) {
        e.preventDefault();
        if (searchQuery.trim()) window.location.href = `/hladat?q=${encodeURIComponent(searchQuery)}`;
    }
    function toggleMore() { showMoreCats = !showMoreCats; }
    function handleClickOutside(e) { if (moreRef && !moreRef.contains(e.target)) showMoreCats = false; }
    function fmtPrice(p) { return (p || 0).toFixed(2).replace('.', ','); }
    function fmtNum(n) { return (n || 0).toLocaleString('sk-SK'); }
    
    $: visibleCats = categories.slice(0, 8);
    $: overflowCats = categories.slice(8);
    
    onMount(async () => {
        document.addEventListener('click', handleClickOutside, true);
        bannerInterval = setInterval(nextBanner, 5000);
        
        // Load site settings
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
            }
        } catch(e) {}
        
        // Load categories
        try {
            const catRes = await api.getCategoriesTree();
            if (catRes?.success && Array.isArray(catRes.data)) categories = catRes.data;
            else if (Array.isArray(catRes)) categories = catRes;
        } catch(e) {}
        
        // Load popular products
        try {
            const prodRes = await api.getProducts('limit=8&sort=popular');
            if (prodRes?.success && prodRes?.data?.items) {
                topProducts = prodRes.data.items;
                stats.products = prodRes.data.total || topProducts.length;
            } else if (prodRes?.items) {
                topProducts = prodRes.items;
            }
        } catch(e) {}
        
        // Load price drops
        try {
            const dropRes = await api.getProducts('limit=6&sort=price_drop');
            if (dropRes?.success && dropRes?.data?.items) priceDropProducts = dropRes.data.items;
            else if (dropRes?.items) priceDropProducts = dropRes.items;
        } catch(e) {}
        
        stats.categories = categories.length;
        if (stats.products === 0) stats.products = 4998;
        if (stats.categories === 0 && categories.length === 0) stats.categories = 531;
        loaded = true;
        
        // Animate stats
        if (!animStarted) {
            animStarted = true;
            animateCount(stats.products, v => animProducts = v);
            animateCount(stats.categories, v => animCategories = v);
        }
        
        // Load products for top 3 categories that have products
        const catsWithProducts = categories.filter(c => totalProducts(c) > 0).slice(0, homeCatSections);
        for (const cat of catsWithProducts) {
            try {
                const res = await api.getProducts(`category=${cat.slug}&limit=4&sort=popular`);
                let items = [];
                if (res?.success && res?.data?.items) items = res.data.items;
                else if (res?.items) items = res.items;
                if (items.length > 0) {
                    categoryProducts = [...categoryProducts, { name: cat.name, slug: cat.slug, products: items }];
                }
            } catch(e) {}
        }
        
        return () => {
            document.removeEventListener('click', handleClickOutside, true);
            clearInterval(bannerInterval);
        };
    });
</script>

<svelte:head>
    <title>MegaPrice.sk — Porovnávač cien | Najlepšie ponuky na jednom mieste</title>
    <meta name="description" content="Porovnajte ceny z overených slovenských obchodov. Nájdite najlepšie ponuky na elektroniku, domácnosť a ďalšie.">
</svelte:head>

<div class="hp">

    <!-- ===== MOBILE SEARCH BAR (hidden on desktop) ===== -->
    <section class="m-srch">
        <form on:submit={handleSearch}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Hľadať produkt, značku..." bind:value={searchQuery}>
            <button type="submit">Hľadať</button>
        </form>
    </section>

    <!-- ===== MOBILE BANNER CAROUSEL (hidden on desktop) ===== -->
    <section class="m-banners" on:touchstart={handleTouchStart} on:touchend={handleTouchEnd}>
        <div class="m-banners__track" style="transform:translateX(-{currentBanner * 100}%)">
            {#each banners as b}
            <div class="m-banners__slide" style="background:{b.color}">
                <span class="m-banners__badge">{b.badge}</span>
                <h2 class="m-banners__title">{b.title}</h2>
                {#if b.subtitle}<p class="m-banners__sub">{b.subtitle}</p>{/if}
                <div class="m-banners__deco">{b.icon || '🔍'}</div>
            </div>
            {/each}
        </div>
        <div class="m-banners__dots">
            {#each banners as _, i}<button class="m-banners__dot" class:active={currentBanner===i} on:click={() => goToBanner(i)}></button>{/each}
        </div>
    </section>

    <!-- ===== DESKTOP HERO (hidden on mobile) ===== -->
    <section class="hero">
        <div class="hero__bg"></div>
        <div class="hero__inner">
            <h1 class="hero__title">
                {@html heroTitle.replace(/\*([^*]+)\*/g, '<span class="hero__em">$1</span>')}
            </h1>
            <p class="hero__sub">{heroSubtitle}</p>
            
            <form class="hero__search" on:submit={handleSearch}>
                <svg class="hero__search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" class="hero__input" placeholder="Hľadať produkt, značku alebo kategóriu..." bind:value={searchQuery}>
                <button type="submit" class="hero__btn">Hľadať</button>
            </form>
            
            <div class="hero__tags">
                <span class="hero__tags-label">Populárne:</span>
                {#each popularSearches as term}
                    <a href="/hladat?q={encodeURIComponent(term)}" class="hero__tag">{term}</a>
                {/each}
            </div>
        </div>
    </section>

    <!-- ========== TRUST BAR (floating card with gradient icons) ========== -->
    <section class="trust">
        <div class="trust__inner">
            <div class="trust__item">
                <div class="trust__ic trust__ic--o"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div>
                <div class="trust__txt"><span class="trust__num">{fmtNum(animProducts)}+</span><span class="trust__label">produktov</span></div>
            </div>
            <div class="trust__sep"></div>
            <div class="trust__item">
                <div class="trust__ic trust__ic--b"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
                <div class="trust__txt"><span class="trust__num">{fmtNum(animCategories)}</span><span class="trust__label">kategórií</span></div>
            </div>
            <div class="trust__sep"></div>
            <div class="trust__item">
                <div class="trust__ic trust__ic--g"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                <div class="trust__txt"><span class="trust__num">Overené</span><span class="trust__label">e-shopy</span></div>
            </div>
            <div class="trust__sep"></div>
            <div class="trust__item">
                <div class="trust__ic trust__ic--p"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
                <div class="trust__txt"><span class="trust__num">Denne</span><span class="trust__label">aktualizované</span></div>
            </div>
        </div>
    </section>

    <!-- ===== QUICK ACTIONS (modern pills) ===== -->
    <section class="qa">
        <div class="qa__inner">
            {#each quickActions as qa}
                <a href={qa.href} class="qab">
                    <span class="qab__icon">{qa.icon}</span>
                    <span class="qab__label">{qa.label}</span>
                </a>
            {/each}
        </div>
    </section>

    <!-- ========== CATEGORIES ========== -->
    {#if categories.length > 0}
    <section class="cats">
        <div class="cats__inner">
            <div class="sec-head">
                <div>
                    <h2 class="sec-title">Populárne kategórie</h2>
                    <p class="sec-sub">Prechádzajte produkty podľa kategórií</p>
                </div>
                <a href="/kategorie" class="sec-link">Všetky kategórie <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></a>
            </div>
            
            <div class="cats__grid">
                {#each visibleCats as cat}
                    <a href="/kategoria/{cat.slug}" class="cat-card">
                        <div class="cat-card__img">
                            {#if cat.image_url}
                                <img src={cat.image_url} alt={cat.name} />
                            {:else}
                                <span class="cat-card__emoji">{cat.icon || '📦'}</span>
                            {/if}
                        </div>
                        <div class="cat-card__info">
                            <span class="cat-card__name">{cat.name}</span>
                            {#if totalProducts(cat) > 0}
                                <span class="cat-card__count">{fmtNum(totalProducts(cat))} produktov</span>
                            {/if}
                        </div>
                    </a>
                {/each}
            </div>
            
            {#if overflowCats.length > 0}
            <div class="cats__overflow" bind:this={moreRef}>
                <button class="cats__more-btn" on:click={toggleMore}>
                    {showMoreCats ? 'Skryť' : `Zobraziť ďalších ${overflowCats.length} kategórií`}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transform:rotate({showMoreCats ? 180 : 0}deg);transition:transform .2s"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {#if showMoreCats}
                <div class="cats__grid cats__grid--extra">
                    {#each overflowCats as cat}
                        <a href="/kategoria/{cat.slug}" class="cat-card">
                            <div class="cat-card__img">
                                {#if cat.image_url}<img src={cat.image_url} alt={cat.name} />{:else}<span class="cat-card__emoji">{cat.icon || '📦'}</span>{/if}
                            </div>
                            <div class="cat-card__info">
                                <span class="cat-card__name">{cat.name}</span>
                                {#if totalProducts(cat) > 0}<span class="cat-card__count">{fmtNum(totalProducts(cat))} produktov</span>{/if}
                            </div>
                        </a>
                    {/each}
                </div>
                {/if}
            </div>
            {/if}
        </div>
    </section>
    {/if}

    <!-- ========== TOP PRODUCTS ========== -->
    {#if topProducts.length > 0}
    <section class="products">
        <div class="products__inner">
            <div class="sec-head">
                <div>
                    <h2 class="sec-title">Najporovnávanejšie produkty</h2>
                    <p class="sec-sub">Produkty s najviac ponukami od predajcov</p>
                </div>
                <a href="/produkty" class="sec-link">Všetky produkty <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></a>
            </div>
            
            <div class="prod-grid">
                {#each topProducts as product, i}
                    <a href="/produkt/{product.slug}" class="prod">
                        {#if i < 3}<div class="prod__badge">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>{/if}
                        <div class="prod__img">
                            {#if product.image_url}<img src={product.image_url} alt={product.title}>{:else}<div class="prod__img-ph">📷</div>{/if}
                        </div>
                        <div class="prod__body">
                            {#if product.brand}<span class="prod__brand">{product.brand}</span>{/if}
                            <h3 class="prod__title">{product.title}</h3>
                            <div class="prod__price">
                                {#if product.price_min}<span class="prod__price-from">od</span>{/if}
                                <span class="prod__price-val">{fmtPrice(product.price_min || product.price)} €</span>
                            </div>
                            {#if product.offer_count > 0}
                                <span class="prod__offers">{product.offer_count} {product.offer_count === 1 ? 'ponuka' : product.offer_count < 5 ? 'ponuky' : 'ponúk'}</span>
                            {/if}
                            <div class="prod__cta">Porovnať ceny →</div>
                        </div>
                    </a>
                {/each}
            </div>
        </div>
    </section>
    {/if}

    <!-- ===== CENOVÉ POKLESY (LIVE) ===== -->
    {#if priceDropProducts.length > 0}
    <section class="drops">
        <div class="drops__inner">
            <div class="sec-head">
                <div style="display:flex;align-items:center;gap:8px">
                    <h2 class="sec-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" style="display:inline;vertical-align:-3px"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg> Cenové poklesy</h2>
                    <span class="drops__live">LIVE</span>
                </div>
                <a href="/poklesy" class="sec-link">Všetky <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></a>
            </div>
            <div class="drops__grid">
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
        </div>
    </section>
    {/if}

    <!-- ========== CATEGORY PRODUCT SECTIONS ========== -->
    {#each categoryProducts as catSec}
    <section class="cat-products">
        <div class="cat-products__inner">
            <div class="sec-head">
                <div>
                    <h2 class="sec-title">{catSec.name}</h2>
                    <p class="sec-sub">Najobľúbenejšie v kategórii</p>
                </div>
                <a href="/kategoria/{catSec.slug}" class="sec-link">Všetky v kategórii <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></a>
            </div>
            <div class="prod-grid">
                {#each catSec.products as product}
                    <a href="/produkt/{product.slug}" class="prod">
                        <div class="prod__img">
                            {#if product.image_url}<img src={product.image_url} alt={product.title}>{:else}<div class="prod__img-ph">📷</div>{/if}
                        </div>
                        <div class="prod__body">
                            {#if product.brand}<span class="prod__brand">{product.brand}</span>{/if}
                            <h3 class="prod__title">{product.title}</h3>
                            <div class="prod__price">
                                {#if product.price_min}<span class="prod__price-from">od</span>{/if}
                                <span class="prod__price-val">{fmtPrice(product.price_min || product.price)} €</span>
                            </div>
                            {#if product.offer_count > 0}
                                <span class="prod__offers">{product.offer_count} {product.offer_count === 1 ? 'ponuka' : product.offer_count < 5 ? 'ponuky' : 'ponúk'}</span>
                            {/if}
                            <div class="prod__cta">Porovnať ceny →</div>
                        </div>
                    </a>
                {/each}
            </div>
        </div>
    </section>
    {/each}

    <!-- ========== HOW IT WORKS ========== -->
    {#if showHow}
    <section class="how">
        <div class="how__inner">
            <h2 class="sec-title sec-title--center">Ako funguje MegaPrice?</h2>
            <p class="sec-sub sec-sub--center">Tri jednoduché kroky k najlepšej cene</p>
            <div class="how__grid">
                <div class="how__step">
                    <div class="how__num">1</div>
                    <div class="how__icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
                    <h3 class="how__title">Vyhľadajte</h3>
                    <p class="how__text">Zadajte názov produktu alebo prechádzajte kategórie.</p>
                </div>
                <div class="how__arrow">→</div>
                <div class="how__step">
                    <div class="how__num">2</div>
                    <div class="how__icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 2l4 4-4 4"/><path d="M3 6h18"/><path d="M7 14l-4 4 4 4"/><path d="M21 18H3"/></svg></div>
                    <h3 class="how__title">Porovnajte</h3>
                    <p class="how__text">Porovnajte ceny od rôznych predajcov na jednom mieste.</p>
                </div>
                <div class="how__arrow">→</div>
                <div class="how__step">
                    <div class="how__num">3</div>
                    <div class="how__icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg></div>
                    <h3 class="how__title">Ušetrite</h3>
                    <p class="how__text">Vyberte najlepšiu ponuku a nakúpte priamo u predajcu.</p>
                </div>
            </div>
        </div>
    </section>
    {/if}

    <!-- ========== VENDOR CTA ========== -->
    {#if showVendor}
    <section class="vendor-cta">
        <div class="vendor-cta__inner">
            <div class="vendor-cta__content">
                <h2 class="vendor-cta__title">Ste predajca?</h2>
                <p class="vendor-cta__text">Pridajte svoj e-shop na MegaPrice a získajte prístup k tisícom zákazníkov. Platíte len za kliknutia.</p>
                <div class="vendor-cta__features">
                    <div class="vendor-cta__feat"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>Cielení zákazníci s úmyslom kúpiť</span></div>
                    <div class="vendor-cta__feat"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>Platba za kliknutie (CPC)</span></div>
                    <div class="vendor-cta__feat"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>Jednoduchý XML feed import</span></div>
                </div>
                <a href="/pre-predajcov" class="vendor-cta__btn">Začať predávať →</a>
            </div>
            <div class="vendor-cta__visual">
                <div class="vendor-cta__card">
                    <div class="vendor-cta__card-row"><span>CPC od</span><strong>0,05 €</strong></div>
                    <div class="vendor-cta__card-row"><span>Registrácia</span><strong>Zadarmo</strong></div>
                    <div class="vendor-cta__card-row"><span>Feed import</span><strong>XML / CSV</strong></div>
                </div>
            </div>
        </div>
    </section>
    {/if}

</div>

<style>
.hp{background:#fff}
.sec-head{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:24px;gap:16px}
.sec-title{font-size:22px;font-weight:700;color:#0f172a;margin:0}
.sec-title--center{text-align:center}
.sec-sub{font-size:14px;color:#64748b;margin:4px 0 0;line-height:1.5}
.sec-sub--center{text-align:center}
.sec-link{font-size:13px;font-weight:600;color:#c4956a;text-decoration:none;display:flex;align-items:center;gap:4px;white-space:nowrap;transition:color .15s}
.sec-link:hover{color:#a67b52}

/* ============ HERO ============ */
.hero{
    position:relative;overflow:hidden;
    padding:40px 0 36px;text-align:center;
    background:#0f172a;color:#fff;
}
.hero__bg{
    position:absolute;inset:0;
    background:radial-gradient(ellipse at 30% 0%,rgba(196,149,106,0.12) 0%,transparent 60%),
               radial-gradient(ellipse at 70% 100%,rgba(99,102,241,0.08) 0%,transparent 50%);
}
.hero__inner{position:relative;max-width:680px;margin:0 auto;padding:0 24px}
.hero__title{font-size:36px;font-weight:800;line-height:1.15;margin-bottom:10px;letter-spacing:-.5px}
.hero__em{color:#c4956a}
.hero__sub{font-size:16px;color:#94a3b8;margin-bottom:28px}

.hero__search{
    display:flex;align-items:center;
    background:#fff;border-radius:14px;
    padding:5px;max-width:560px;margin:0 auto 20px;
    box-shadow:0 6px 24px rgba(0,0,0,0.2);position:relative;
}
.hero__search-icon{position:absolute;left:18px;pointer-events:none}
.hero__input{
    flex:1;border:none;background:none;padding:13px 14px 13px 44px;
    font-size:15px;color:#1e293b;outline:none;border-radius:10px;min-width:0;
}
.hero__input::placeholder{color:#94a3b8}
.hero__btn{
    padding:13px 24px;background:#c4956a;color:#fff;border:none;
    border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;
    transition:background .15s;white-space:nowrap;
}
.hero__btn:hover{background:#b8875c}

.hero__tags{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;align-items:center}
.hero__tags-label{font-size:12px;color:#64748b}
.hero__tag{
    padding:4px 10px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);
    border-radius:7px;font-size:11px;color:#94a3b8;text-decoration:none;transition:all .15s;
}
.hero__tag:hover{background:rgba(196,149,106,0.15);color:#c4956a;border-color:rgba(196,149,106,0.3)}

/* ============ TRUST BAR — floating card ============ */
.trust{
    padding:0 16px;margin-top:12px;position:relative;z-index:2;
}
.trust__inner{
    max-width:960px;margin:0 auto;padding:14px 16px;
    background:#fff;border-radius:14px;
    box-shadow:0 4px 20px rgba(0,0,0,0.08);
    display:grid;grid-template-columns:repeat(2,1fr);gap:10px;
}
.trust__item{display:flex;align-items:center;gap:8px}
.trust__ic{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.trust__ic--o{background:linear-gradient(135deg,#fff7ed,#fed7aa);color:#c2410c}
.trust__ic--b{background:linear-gradient(135deg,#eff6ff,#bfdbfe);color:#1d4ed8}
.trust__ic--g{background:linear-gradient(135deg,#ecfdf5,#a7f3d0);color:#15803d}
.trust__ic--p{background:linear-gradient(135deg,#f5f3ff,#ddd6fe);color:#7c3aed}
.trust__txt{display:flex;flex-direction:column;line-height:1.2}
.trust__num{font-size:14px;font-weight:800;color:#0f172a}
.trust__label{font-size:9px;color:#64748b}
.trust__sep{display:none}

/* ============ CATEGORIES ============ */
.cats{padding:48px 0 32px}
.cats__inner{max-width:1200px;margin:0 auto;padding:0 24px}
.cats__grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.cats__grid--extra{margin-top:12px}
.cat-card{
    display:flex;align-items:center;gap:12px;
    padding:14px 16px;background:#fff;border:1px solid #e2e8f0;
    border-radius:10px;text-decoration:none;color:#0f172a;transition:all .15s;
}
.cat-card:hover{border-color:#c4956a;box-shadow:0 2px 12px rgba(196,149,106,0.08);transform:translateY(-1px)}
.cat-card__img{
    width:44px;height:44px;border-radius:8px;overflow:hidden;
    background:#fff;display:flex;align-items:center;justify-content:center;
    flex-shrink:0;border:1px solid #e2e8f0;
}
.cat-card__img img{width:100%;height:100%;object-fit:cover}
.cat-card__emoji{font-size:20px}
.cat-card__info{min-width:0}
.cat-card__name{display:block;font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cat-card__count{font-size:11px;color:#64748b}

.cats__overflow{text-align:center;margin-top:12px}
.cats__more-btn{
    display:inline-flex;align-items:center;gap:6px;
    padding:8px 18px;background:none;border:1px solid #d1d5db;
    border-radius:8px;font-size:12px;font-weight:600;color:#475569;cursor:pointer;transition:all .15s;
}
.cats__more-btn:hover{border-color:#c4956a;color:#c4956a}

/* ============ PRODUCTS ============ */
.products,.cat-products{padding:32px 0;background:#fff}
.cat-products{background:#fff}
.cat-products:nth-child(even){background:#fff}
.products__inner,.cat-products__inner{max-width:1200px;margin:0 auto;padding:0 24px}

.prod-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}

.prod{
    background:#fff;border:1px solid #e2e8f0;border-radius:12px;
    text-decoration:none;color:#0f172a;overflow:hidden;
    transition:all .15s;display:flex;flex-direction:column;position:relative;
}
.cat-products .prod{background:#fff}
.prod:hover{box-shadow:0 6px 20px rgba(0,0,0,0.06);transform:translateY(-2px);border-color:#d1d5db}
.prod__badge{
    position:absolute;top:8px;left:8px;z-index:1;
    font-size:16px;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.15));
}
.prod__img{
    height:160px;background:#f9fafb;display:flex;align-items:center;
    justify-content:center;padding:12px;
}
.prod__img img{max-width:100%;max-height:100%;object-fit:contain}
.prod__img-ph{font-size:36px;opacity:.2}
.prod__body{padding:14px;flex:1;display:flex;flex-direction:column}
.prod__brand{font-size:10px;font-weight:700;color:#c4956a;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px}
.prod__title{
    font-size:13px;font-weight:500;line-height:1.4;margin:0 0 8px;
    display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;color:#1e293b;
}
.prod__price{margin-bottom:2px}
.prod__price-from{font-size:11px;color:#94a3b8}
.prod__price-val{font-size:18px;font-weight:800;color:#0f172a}
.prod__offers{font-size:11px;color:#64748b;margin-bottom:10px}
.prod__cta{
    margin-top:auto;padding:9px;text-align:center;
    background:#fff;border-radius:7px;
    font-size:12px;font-weight:600;color:#c4956a;transition:all .15s;
}
.prod:hover .prod__cta{background:#c4956a;color:#fff}

/* ============ HOW ============ */
.how{padding:48px 0;background:#fff}
.how__inner{max-width:860px;margin:0 auto;padding:0 24px}
.how__grid{display:flex;align-items:flex-start;justify-content:center;gap:12px;margin-top:32px}
.how__step{flex:1;text-align:center;position:relative;padding:0 8px}
.how__num{
    position:absolute;top:-10px;left:50%;transform:translateX(-50%);
    width:24px;height:24px;background:#c4956a;color:#fff;
    font-size:11px;font-weight:700;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 2px 6px rgba(196,149,106,0.3);
}
.how__icon{
    width:64px;height:64px;margin:0 auto 12px;
    background:#fff;border-radius:50%;
    display:flex;align-items:center;justify-content:center;color:#c4956a;border:2px solid #e2e8f0;
}
.how__title{font-size:15px;font-weight:700;color:#0f172a;margin-bottom:6px}
.how__text{font-size:13px;color:#64748b;line-height:1.5}
.how__arrow{color:#d1d5db;font-size:20px;margin-top:30px;flex-shrink:0}

/* ============ VENDOR CTA ============ */
.vendor-cta{padding:48px 0;background:#0f172a;color:#fff}
.vendor-cta__inner{max-width:960px;margin:0 auto;padding:0 24px;display:flex;align-items:center;gap:40px}
.vendor-cta__content{flex:1}
.vendor-cta__title{font-size:24px;font-weight:800;margin:0 0 10px}
.vendor-cta__text{font-size:14px;color:#94a3b8;line-height:1.6;margin-bottom:20px}
.vendor-cta__features{display:flex;flex-direction:column;gap:8px;margin-bottom:24px}
.vendor-cta__feat{display:flex;align-items:center;gap:8px;font-size:13px;color:#e2e8f0}
.vendor-cta__btn{
    display:inline-block;padding:12px 24px;
    background:#c4956a;color:#fff;border-radius:10px;
    text-decoration:none;font-size:14px;font-weight:700;transition:background .15s;
}
.vendor-cta__btn:hover{background:#b8875c}
.vendor-cta__visual{flex-shrink:0}
.vendor-cta__card{
    background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);
    border-radius:14px;padding:20px 24px;min-width:200px;
}
.vendor-cta__card-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:13px}
.vendor-cta__card-row:last-child{border:none}
.vendor-cta__card-row span{color:#94a3b8}
.vendor-cta__card-row strong{color:#c4956a;font-weight:700}

/* ============ MOBILE SEARCH (hidden on desktop) ============ */
.m-srch{padding:12px 16px 0}
.m-srch form{display:flex;align-items:center;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:3px;gap:4px}
.m-srch svg{margin-left:10px;flex-shrink:0}
.m-srch input{flex:1;border:none;padding:10px 8px;font-size:14px;outline:none;font-family:inherit;min-width:0}
.m-srch button{padding:9px 16px;background:#c4956a;color:#fff;border:none;border-radius:9px;font-size:12px;font-weight:700;cursor:pointer;flex-shrink:0}

/* ============ MOBILE BANNERS (hidden on desktop) ============ */
.m-banners{padding:12px 16px 0;overflow:hidden}
.m-banners__track{display:flex;transition:transform .4s ease}
.m-banners__slide{min-width:100%;padding:22px 20px;border-radius:14px;color:#fff;position:relative;overflow:hidden;box-sizing:border-box}
.m-banners__badge{display:inline-block;padding:2px 8px;background:rgba(255,255,255,.25);border-radius:5px;font-size:9px;font-weight:800;letter-spacing:.5px;margin-bottom:8px}
.m-banners__title{font-size:18px;font-weight:800;line-height:1.25;max-width:80%}
.m-banners__sub{font-size:12px;opacity:.75;margin-top:4px;max-width:80%}
.m-banners__deco{position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:52px;opacity:.1}
.m-banners__dots{display:flex;justify-content:center;gap:6px;padding:10px 0 2px}
.m-banners__dot{width:6px;height:6px;border-radius:50%;background:#d1d5db;border:none;padding:0;cursor:pointer;transition:all .3s}
.m-banners__dot.active{background:#c4956a;width:18px;border-radius:3px}

/* ============ QUICK ACTIONS (modern pills) ============ */
.qa{padding:16px 16px 0}
.qa__inner{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;padding-bottom:2px}
.qa__inner::-webkit-scrollbar{display:none}
.qab{display:flex;align-items:center;gap:6px;padding:8px 16px;background:linear-gradient(135deg,#f8fafc,#f1f5f9);border:none;border-radius:100px;font-size:13px;font-weight:600;color:#475569;transition:all .25s;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,.04);white-space:nowrap;text-decoration:none;flex-shrink:0}
.qab:hover{background:linear-gradient(135deg,#fdf8f4,#fcebd8);color:#c4956a;box-shadow:0 2px 8px rgba(196,149,106,.15);transform:translateY(-1px)}
.qab__icon{font-size:15px}
.qab__label{white-space:nowrap}

/* ============ PRICE DROPS ============ */
.drops{padding:32px 0}
.drops__inner{max-width:1200px;margin:0 auto;padding:0 16px}
.drops__live{font-size:9px;font-weight:800;color:#fff;background:#ef4444;padding:2px 8px;border-radius:100px;letter-spacing:.5px;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
.drops__grid{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding:0 0 4px}
.drops__grid::-webkit-scrollbar{display:none}
.dp{min-width:140px;max-width:160px;scroll-snap-align:start;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;background:#fff;position:relative;transition:all .2s;text-decoration:none;color:#0f172a;flex-shrink:0}
.dp:hover{border-color:#059669;box-shadow:0 4px 16px rgba(5,150,105,.08)}
.dp__pct{position:absolute;top:8px;left:8px;background:#dc2626;color:#fff;font-size:10px;font-weight:800;padding:2px 7px;border-radius:6px;z-index:1}
.dp__img{height:90px;background:#f8f9fb;display:flex;align-items:center;justify-content:center;padding:8px}
.dp__img img{max-width:100%;max-height:100%;object-fit:contain}
.dp__ph{font-size:24px;opacity:.2}
.dp__body{padding:10px}
.dp__name{font-size:11px;font-weight:600;color:#1e293b;line-height:1.3;margin-bottom:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.dp__prices{display:flex;align-items:baseline;gap:6px}
.dp__now{font-size:15px;font-weight:900;color:#059669}
.dp__old{font-size:11px;color:#94a3b8;text-decoration:line-through}

/* ============ RESPONSIVE ============ */
@media(min-width:769px){
    /* Hide mobile elements */
    .m-srch{display:none}
    .m-banners{display:none}
    /* Desktop hero */
    .hero{padding:48px 0 56px}
    .hero__title{font-size:36px}
    .hero__search{max-width:580px}
    /* Desktop trust - compact card with gradient icons */
    .trust{padding:0 24px;margin-top:-24px}
    .trust__inner{display:flex;align-items:center;justify-content:center;gap:24px;grid-template-columns:unset;padding:18px 32px;border-radius:16px;max-width:820px;box-shadow:0 4px 24px rgba(0,0,0,0.08)}
    .trust__sep{display:block;width:1px;height:32px;background:#e2e8f0;flex-shrink:0}
    .trust__item{gap:10px;justify-content:center}
    .trust__ic{display:flex;width:38px;height:38px;border-radius:10px}
    .trust__txt{flex-direction:column}
    .trust__num{font-size:15px;font-weight:800;color:#0f172a}
    .trust__label{font-size:10px}
    /* Quick actions centered */
    .qa{padding:20px 24px 0;max-width:1200px;margin:0 auto}
    .qa__inner{justify-content:center;overflow:visible;flex-wrap:wrap}
    .qab{padding:10px 20px}
    /* 5-col categories */
    .cats__grid{grid-template-columns:repeat(5,1fr)}
    /* 4-col products */
    .prod-grid{grid-template-columns:repeat(4,1fr)}
    /* 6-col price drops */
    .drops__inner{padding:0 24px}
    .drops__grid{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;overflow:visible;scroll-snap-type:none}
    .dp{min-width:unset;max-width:unset}
    .dp__img{height:110px}
    /* How */
    .how__grid{flex-direction:row}
    .how__arrow{display:block}
    /* Vendor */
    .vendor-cta__inner{flex-direction:row;text-align:left}
}
@media(min-width:1024px){
    .hero{padding:52px 0 60px}
    .hero__title{font-size:40px}
    .cats__grid{grid-template-columns:repeat(5,1fr)}
    .prod-grid{grid-template-columns:repeat(5,1fr)}
}
@media(max-width:768px){
    .hero{display:none}
    .trust__inner{gap:8px;padding:12px}
    .cats__grid,.prod-grid{grid-template-columns:repeat(2,1fr)}
    .how__grid{flex-direction:column;gap:20px}.how__arrow{display:none}
    .vendor-cta__inner{flex-direction:column;text-align:center}.vendor-cta__features{align-items:center}
    .sec-head{flex-direction:column;align-items:flex-start;gap:6px}
    .cats__inner,.products__inner,.cat-products__inner{padding:0 16px}
    .cats{padding:24px 0 16px}
    .products,.cat-products{padding:24px 0}
}
</style>
