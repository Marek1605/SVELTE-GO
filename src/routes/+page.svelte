<script>
    import { onMount } from 'svelte';
    import { api } from '$lib/api';
    
    let searchQuery = '';
    let showMoreCats = false;
    let moreRef;
    
    let categories = [];
    let topProducts = [];
    let categoryProducts = [];
    let stats = { products: 0, categories: 0 };
    let loaded = false;
    
    // Settings from admin
    let heroTitle = 'Nájdite *najnižšiu cenu* za pár sekúnd';
    let heroSubtitle = 'Porovnávame ceny z overených obchodov na jednom mieste.';
    let homeCatSections = 3;
    let showHow = true;
    let showVendor = true;
    
    // Animated counters
    let animProducts = 0, animCategories = 0, animStarted = false;
    
    // Banner carousel
    let currentBanner = 0;
    let bannerInterval;

    function animateCount(target, setter, dur = 1000) {
        if (target <= 0) return;
        let s = 0;
        const step = target / (dur / 16);
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
        'elektronika': '📱', 'dom': '🏠', 'záhrad': '🏠', 'hračky': '🧸', 'hry': '🧸',
        'šport': '⚽', 'it': '💻', 'počítač': '💻', 'domáce': '🔌', 'spotrebič': '🔌',
        'dieťa': '👶', 'matka': '👶', 'baby': '👶', 'zviera': '🐾', 'zdravie': '💊',
        'krása': '💄', 'auto': '🚗', 'foto': '📸', 'video': '📸', 'kuchyn': '🍳',
        'nábytok': '🪑', 'oblečen': '👕', 'obuv': '👟', 'hobby': '🎨', 'záhrada': '🌳',
        'grilov': '🔥', 'bezpečn': '🔒', 'kancel': '📎', 'displej': '🖥️', 'biela': '🧊',
        'hudob': '🎵', 'herné': '🎮', 'hodin': '⌚', 'kostým': '🎭',
    };
    function getCatEmoji(name) {
        const l = (name || '').toLowerCase();
        for (const [k, v] of Object.entries(categoryEmojis)) { if (l.includes(k)) return v; }
        return '📦';
    }
    const catGradients = [
        ['#fef7f0','#fde2c8'], ['#eff6ff','#bfdbfe'], ['#fdf2f8','#f9a8d4'],
        ['#ecfdf5','#6ee7b7'], ['#f5f3ff','#c4b5fd'], ['#fff7ed','#fdba74'],
        ['#fefce8','#fde047'], ['#fef2f2','#fca5a5'], ['#f0fdfa','#5eead4'],
        ['#f1f5f9','#94a3b8'], ['#fff1f2','#fda4af'], ['#f0fdf4','#86efac'],
    ];
    function getCatGradient(i) { const g = catGradients[i % catGradients.length]; return `linear-gradient(135deg,${g[0]},${g[1]})`; }
    
    function totalProducts(cat) {
        let c = cat.product_count || 0;
        if (cat.children) for (const ch of cat.children) c += totalProducts(ch);
        return c;
    }
    
    function handleSearch(e) {
        e.preventDefault();
        if (searchQuery.trim()) window.location.href = `/hladat?q=${encodeURIComponent(searchQuery)}`;
    }
    function toggleMore() { showMoreCats = !showMoreCats; }
    function handleClickOutside(e) { if (moreRef && !moreRef.contains(e.target)) showMoreCats = false; }
    function fmtPrice(p) { return (p || 0).toFixed(2).replace('.', ','); }
    function fmtNum(n) { return (n || 0).toLocaleString('sk-SK'); }
    
    $: visibleCats = categories.slice(0, 10);
    $: desktopCats = categories.filter(c => totalProducts(c) > 0).slice(0, 5);
    $: overflowCats = categories.slice(10);
    
    onMount(async () => {
        document.addEventListener('click', handleClickOutside, true);
        
        // Banner auto-rotate
        bannerInterval = setInterval(() => { currentBanner = (currentBanner + 1) % 2; }, 5000);
        
        // Load site settings
        try {
            const setRes = await fetch('/api/v1/site/settings');
            const setData = await setRes.json();
            if (setData?.success && setData?.data) {
                const d = setData.data;
                if (d.hero_title) heroTitle = d.hero_title;
                if (d.hero_subtitle) heroSubtitle = d.hero_subtitle;
                homeCatSections = parseInt(d.home_category_sections) || 3;
                showHow = d.show_how_it_works !== 'false';
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
        
        stats.categories = categories.length;
        loaded = true;
        
        if (!animStarted) {
            animStarted = true;
            animateCount(stats.products, v => animProducts = v);
            animateCount(stats.categories, v => animCategories = v);
        }
        
        // Load products for top categories
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
            if (bannerInterval) clearInterval(bannerInterval);
        };
    });
</script>

<svelte:head>
    <title>MegaPrice.sk — Porovnávač cien | Najlepšie ponuky na jednom mieste</title>
    <meta name="description" content="Porovnajte ceny z overených slovenských obchodov. Nájdite najlepšie ponuky na elektroniku, domácnosť a ďalšie.">
</svelte:head>

<div class="hp">

    <!-- ========== HERO (desktop: dark, mobile: banner carousel) ========== -->
    <section class="hero">
        <div class="hero__bg"></div>
        <div class="hero__inner">
            <!-- Mobile banner carousel -->
            <div class="hero__banners">
                <div class="hero__banners-track" style="transform:translateX(-{currentBanner * 100}%)">
                    <div class="hero__banner hero__banner--orange">
                        <div class="hero__banner-deco">🔍</div>
                        <span class="hero__badge">NOVÉ</span>
                        <div class="hero__banner-title">Porovnaj ceny<br>z overených obchodov</div>
                        <div class="hero__banner-sub">{fmtNum(animProducts)}+ produktov • {fmtNum(animCategories)} kategórií</div>
                        <div class="hero__banner-btn">Začať porovnávať →</div>
                    </div>
                    <div class="hero__banner hero__banner--dark">
                        <div class="hero__banner-deco">🏪</div>
                        <span class="hero__badge hero__badge--gold">PRE E-SHOPY</span>
                        <div class="hero__banner-title">Pridajte<br>váš obchod</div>
                        <div class="hero__banner-sub">CPC od 0,05 € • XML feed • Zadarmo</div>
                        <a href="/prihlasenie-predajcu" class="hero__banner-btn hero__banner-btn--gold">Registrovať →</a>
                    </div>
                </div>
                <div class="hero__dots">
                    <button class="hero__dot" class:active={currentBanner === 0} on:click={() => currentBanner = 0}></button>
                    <button class="hero__dot" class:active={currentBanner === 1} on:click={() => currentBanner = 1}></button>
                </div>
            </div>

            <!-- Desktop hero content -->
            <div class="hero__desktop">
                <h1 class="hero__title">
                    {@html heroTitle.replace(/\*([^*]+)\*/g, '<span class="hero__em">$1</span>')}
                </h1>
                <p class="hero__sub">{heroSubtitle}</p>
                <form class="hero__search" on:submit={handleSearch}>
                    <svg class="hero__search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" class="hero__input" placeholder="Čo hľadáte? napr. iPhone, notebook..." bind:value={searchQuery}>
                    <button type="submit" class="hero__btn">Hľadať</button>
                </form>
                <div class="hero__tags">
                    <span class="hero__tags-label">Populárne:</span>
                    {#each popularSearches as term}
                        <a href="/hladat?q={encodeURIComponent(term)}" class="hero__tag">{term}</a>
                    {/each}
                </div>
            </div>
        </div>
    </section>

    <!-- ========== QUICK ACTIONS (mobile + tablet) ========== -->
    <section class="qactions">
        {#each quickActions as qa}
            <a href={qa.href} class="qa">
                <span class="qa__icon">{qa.icon}</span>
                <span class="qa__label">{qa.label}</span>
            </a>
        {/each}
    </section>

    <!-- ========== TRUST BAR ========== -->
    <section class="trust">
        <div class="trust__inner">
            <div class="trust__item">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                <span class="trust__num">{fmtNum(animProducts)}+</span>
                <span class="trust__label">produktov</span>
            </div>
            <div class="trust__sep"></div>
            <div class="trust__item">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                <span class="trust__num">{fmtNum(animCategories)}</span>
                <span class="trust__label">kategórií</span>
            </div>
            <div class="trust__sep"></div>
            <div class="trust__item">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span class="trust__num">Overené</span>
                <span class="trust__label">e-shopy</span>
            </div>
            <div class="trust__sep"></div>
            <div class="trust__item">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span class="trust__num">Denne</span>
                <span class="trust__label">aktualizované</span>
            </div>
        </div>
    </section>

    <!-- ========== CATEGORIES ========== -->
    {#if categories.length > 0}
    <section class="cats">
        <div class="cats__inner">
            <div class="sec-head">
                <h2 class="sec-title">Kategórie</h2>
                <a href="/kategorie" class="sec-link">Všetky →</a>
            </div>
            <!-- Swipeable row (mobile) + Grid (desktop) -->
            <div class="cats__scroll">
                {#each visibleCats as cat, i}
                    <a href="/kategoria/{cat.slug}" class="cat-card">
                        <div class="cat-card__icon" style="background:{getCatGradient(i)}">
                            {#if cat.image_url}
                                <img src={cat.image_url} alt={cat.name} />
                            {:else}
                                <span>{getCatEmoji(cat.name)}</span>
                            {/if}
                        </div>
                        <div class="cat-card__info">
                            <span class="cat-card__name">{cat.name}</span>
                            {#if totalProducts(cat) > 0}
                                <span class="cat-card__count">{fmtNum(totalProducts(cat))} prod.</span>
                            {/if}
                        </div>
                    </a>
                {/each}
            </div>
            {#if overflowCats.length > 0}
            <div class="cats__overflow" bind:this={moreRef}>
                <button class="cats__more-btn" on:click={toggleMore}>
                    {showMoreCats ? 'Skryť' : `Ďalších ${overflowCats.length} kategórií`}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transform:rotate({showMoreCats ? 180 : 0}deg);transition:transform .2s"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {#if showMoreCats}
                <div class="cats__extra">
                    {#each overflowCats as cat, i}
                        <a href="/kategoria/{cat.slug}" class="cat-card">
                            <div class="cat-card__icon" style="background:{getCatGradient(i + 10)}">
                                {#if cat.image_url}<img src={cat.image_url} alt={cat.name} />{:else}<span>{getCatEmoji(cat.name)}</span>{/if}
                            </div>
                            <div class="cat-card__info">
                                <span class="cat-card__name">{cat.name}</span>
                                {#if totalProducts(cat) > 0}<span class="cat-card__count">{fmtNum(totalProducts(cat))} prod.</span>{/if}
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

    <!-- ========== FLASH DEAL ========== -->
    {#if topProducts.length > 0}
    <section class="flash">
        <a href="/produkt/{topProducts[0]?.slug}" class="flash__inner">
            <div class="flash__text">
                <div class="flash__title">⚡ Najväčší pokles</div>
                <div class="flash__sub">Cena klesla práve teraz!</div>
            </div>
            <div class="flash__price">
                <div class="flash__price-label">ušetríte</div>
                <div class="flash__price-val">-48 €</div>
            </div>
        </a>
    </section>
    {/if}

    <!-- ========== TOP PRODUCTS ========== -->
    {#if topProducts.length > 0}
    <section class="products">
        <div class="products__inner">
            <div class="sec-head">
                <div>
                    <h2 class="sec-title">🏆 Najporovnávanejšie produkty</h2>
                    <p class="sec-sub">Produkty s najviac ponukami od predajcov</p>
                </div>
                <a href="/produkty" class="sec-link">Všetky →</a>
            </div>
            <div class="prod-grid">
                {#each topProducts as product, i}
                    <a href="/produkt/{product.slug}" class="prod">
                        {#if i < 3}<div class="prod__badge">{i === 0 ? '🏆 1' : i === 1 ? '🥈 2' : '🥉 3'}</div>{/if}
                        <div class="prod__fav">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        </div>
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

    <!-- ========== CATEGORY PRODUCT SECTIONS ========== -->
    {#each categoryProducts as catSec}
    <section class="cat-products">
        <div class="cat-products__inner">
            <div class="sec-head">
                <h2 class="sec-title">{catSec.name}</h2>
                <a href="/kategoria/{catSec.slug}" class="sec-link">Všetky →</a>
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
                    <div class="how__icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
                    <h3 class="how__title">Vyhľadajte</h3>
                    <p class="how__text">Zadajte názov produktu alebo prechádzajte kategórie.</p>
                </div>
                <div class="how__arrow">→</div>
                <div class="how__step">
                    <div class="how__num">2</div>
                    <div class="how__icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 2l4 4-4 4"/><path d="M3 6h18"/><path d="M7 14l-4 4 4 4"/><path d="M21 18H3"/></svg></div>
                    <h3 class="how__title">Porovnajte</h3>
                    <p class="how__text">Porovnajte ceny od rôznych predajcov na jednom mieste.</p>
                </div>
                <div class="how__arrow">→</div>
                <div class="how__step">
                    <div class="how__num">3</div>
                    <div class="how__icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg></div>
                    <h3 class="how__title">Ušetrite</h3>
                    <p class="how__text">Vyberte najlepšiu ponuku a nakúpte priamo u predajcu.</p>
                </div>
            </div>
        </div>
    </section>
    {/if}

    <!-- ========== NEWSLETTER / PRICE ALERTS ========== -->
    <section class="newsletter">
        <div class="newsletter__inner">
            <div class="newsletter__icon">📬</div>
            <h2 class="newsletter__title">Cenové alerty</h2>
            <p class="newsletter__sub">Dostanete notifikáciu keď cena klesne</p>
            <form class="newsletter__form" on:submit|preventDefault>
                <input type="email" class="newsletter__input" placeholder="váš@email.sk">
                <button type="submit" class="newsletter__btn">Sledovať</button>
            </form>
        </div>
    </section>

    <!-- ========== VENDOR CTA ========== -->
    {#if showVendor}
    <section class="vendor-cta">
        <div class="vendor-cta__inner">
            <div class="vendor-cta__content">
                <h2 class="vendor-cta__title">Ste predajca?</h2>
                <p class="vendor-cta__text">Pridajte svoj e-shop na MegaPrice a získajte prístup k tisícom zákazníkov. Platíte len za kliknutia.</p>
                <div class="vendor-cta__features">
                    <div class="vendor-cta__feat"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>Cielení zákazníci s úmyslom kúpiť</span></div>
                    <div class="vendor-cta__feat"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>Platba za kliknutie (CPC)</span></div>
                    <div class="vendor-cta__feat"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>Jednoduchý XML feed import</span></div>
                </div>
                <a href="/prihlasenie-predajcu" class="vendor-cta__btn">Začať predávať →</a>
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
/* ============ BASE ============ */
.hp{background:#fff}
.sec-head{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:20px;gap:12px}
.sec-title{font-size:22px;font-weight:800;color:#0f172a;margin:0}
.sec-title--center{text-align:center}
.sec-sub{font-size:13px;color:#64748b;margin:3px 0 0;line-height:1.5}
.sec-sub--center{text-align:center}
.sec-link{font-size:13px;font-weight:600;color:#c4956a;text-decoration:none;display:flex;align-items:center;gap:4px;white-space:nowrap}
.sec-link:hover{color:#a67b52}

/* ============ HERO ============ */
.hero{position:relative;overflow:hidden;background:#0f172a;color:#fff}
.hero__bg{position:absolute;inset:0;background:radial-gradient(ellipse at 30% 0%,rgba(196,149,106,0.12),transparent 60%),radial-gradient(ellipse at 70% 100%,rgba(99,102,241,0.06),transparent 50%)}
.hero__inner{position:relative;max-width:680px;margin:0 auto;padding:0 24px}

/* Desktop hero */
.hero__desktop{padding:40px 0 36px;text-align:center}
.hero__title{font-size:34px;font-weight:800;line-height:1.15;margin-bottom:10px;letter-spacing:-.5px}
.hero__em{color:#c4956a}
.hero__sub{font-size:15px;color:#94a3b8;margin-bottom:24px}
.hero__search{display:flex;align-items:center;background:#fff;border-radius:14px;padding:5px;max-width:580px;margin:0 auto;box-shadow:0 6px 24px rgba(0,0,0,0.2);position:relative}
.hero__search-icon{position:absolute;left:18px;pointer-events:none}
.hero__input{flex:1;border:none;background:none;padding:13px 14px 13px 44px;font-size:15px;color:#1e293b;outline:none;border-radius:10px;min-width:0}
.hero__input::placeholder{color:#94a3b8}
.hero__btn{padding:13px 24px;background:#c4956a;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;transition:background .15s;white-space:nowrap}
.hero__btn:hover{background:#b8875c}
.hero__tags{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;align-items:center;margin-top:10px}
.hero__tags-label{font-size:12px;color:#64748b}
.hero__tag{padding:4px 10px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:7px;font-size:11px;color:#94a3b8;text-decoration:none;transition:all .15s}
.hero__tag:hover{background:rgba(196,149,106,0.15);color:#c4956a;border-color:rgba(196,149,106,0.3)}

/* Mobile banners - hidden on desktop */
.hero__banners{display:none;overflow:hidden;border-radius:16px;margin:8px 0}
.hero__banners-track{display:flex;transition:transform .5s ease}
.hero__banner{min-width:100%;padding:18px;color:#fff;position:relative;overflow:hidden;border-radius:16px}
.hero__banner--orange{background:linear-gradient(135deg,#ff6b35,#ff8f5e)}
.hero__banner--dark{background:linear-gradient(135deg,#1e293b,#334155)}
.hero__banner-deco{position:absolute;right:12px;bottom:-5px;font-size:56px;opacity:0.12}
.hero__badge{font-size:9px;background:rgba(255,255,255,0.2);padding:3px 10px;border-radius:100px;font-weight:700}
.hero__badge--gold{background:rgba(196,149,106,0.2);color:#c4956a}
.hero__banner-title{font-size:20px;font-weight:900;margin:8px 0 4px;line-height:1.1}
.hero__banner-sub{font-size:11px;opacity:0.7;margin-bottom:10px}
.hero__banner-btn{display:inline-block;padding:8px 18px;background:#fff;border-radius:10px;font-size:11px;font-weight:800;color:#ff6b35;text-decoration:none}
.hero__banner-btn--gold{background:#c4956a;color:#fff}
.hero__dots{display:flex;justify-content:center;gap:5px;margin-top:8px}
.hero__dot{width:18px;height:4px;border-radius:3px;background:#e5e7eb;border:none;cursor:pointer;padding:0;transition:all .2s}
.hero__dot.active{background:#ff6b35;width:24px}

/* ============ QUICK ACTIONS (mobile only) ============ */
.qactions{display:none;padding:6px 8px 10px;justify-content:space-between}
.qa{text-align:center;flex:1;text-decoration:none}
.qa__icon{width:40px;height:40px;border-radius:12px;background:#fff5f0;margin:0 auto 3px;display:flex;align-items:center;justify-content:center;font-size:18px}
.qa__label{font-size:9px;font-weight:700;color:#374151}

/* ============ TRUST BAR ============ */
.trust{padding:0;margin-top:-24px;position:relative;z-index:2}
.trust__inner{max-width:900px;margin:0 auto;padding:18px 32px;background:#fff;border-radius:14px;box-shadow:0 4px 20px rgba(0,0,0,0.06);display:flex;align-items:center;justify-content:space-between}
.trust__item{display:flex;align-items:center;gap:8px;flex:1;justify-content:center}
.trust__item svg{color:#c4956a;flex-shrink:0}
.trust__num{font-size:16px;font-weight:800;color:#0f172a}
.trust__label{font-size:12px;color:#64748b}
.trust__sep{width:1px;height:28px;background:#e2e8f0;flex-shrink:0}

/* ============ CATEGORIES ============ */
.cats{padding:32px 0 16px}
.cats__inner{max-width:1200px;margin:0 auto;padding:0 24px}
.cats__scroll{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}
.cat-card{display:flex;align-items:center;gap:12px;padding:14px 16px;background:#fff;border:1.5px solid #e2e8f0;border-radius:12px;text-decoration:none;color:#0f172a;transition:all .15s}
.cat-card:hover{border-color:#c4956a;box-shadow:0 2px 12px rgba(196,149,106,0.08);transform:translateY(-1px)}
.cat-card__icon{width:46px;height:46px;border-radius:12px;overflow:hidden;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:22px;box-shadow:0 2px 8px rgba(0,0,0,0.04)}
.cat-card__icon img{width:100%;height:100%;object-fit:cover}
.cat-card__info{min-width:0}
.cat-card__name{display:block;font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#0f172a}
.cat-card__count{font-size:11px;color:#94a3b8}
.cats__overflow{text-align:center;margin-top:12px}
.cats__more-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 18px;background:none;border:1px solid #d1d5db;border-radius:8px;font-size:12px;font-weight:600;color:#475569;cursor:pointer;font-family:inherit;transition:all .15s}
.cats__more-btn:hover{border-color:#c4956a;color:#c4956a}
.cats__extra{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-top:12px}

/* ============ FLASH DEAL ============ */
.flash{padding:0 24px;max-width:1200px;margin:8px auto 0}
.flash__inner{display:flex;align-items:center;gap:10px;padding:12px 16px;background:linear-gradient(135deg,#ff6b35,#ff4444);border-radius:14px;text-decoration:none;color:#fff;transition:opacity .15s;position:relative;overflow:hidden}
.flash__inner:hover{opacity:0.95}
.flash__inner::after{content:'';position:absolute;right:-10px;top:-10px;width:60px;height:60px;background:rgba(255,255,255,0.06);border-radius:50%}
.flash__text{flex:1}
.flash__title{font-size:14px;font-weight:900}
.flash__sub{font-size:10px;opacity:0.7;margin-top:1px}
.flash__price{background:rgba(0,0,0,0.15);border-radius:10px;padding:6px 12px;text-align:center;flex-shrink:0}
.flash__price-label{font-size:8px;opacity:0.7}
.flash__price-val{font-size:18px;font-weight:900;line-height:1}

/* ============ PRODUCTS ============ */
.products,.cat-products{padding:24px 0}
.products__inner,.cat-products__inner{max-width:1200px;margin:0 auto;padding:0 24px}
.prod-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.prod{background:#fff;border:1.5px solid #e2e8f0;border-radius:12px;text-decoration:none;color:#0f172a;overflow:hidden;transition:all .15s;display:flex;flex-direction:column;position:relative}
.prod:hover{box-shadow:0 6px 20px rgba(0,0,0,0.06);transform:translateY(-2px);border-color:#d1d5db}
.prod__badge{position:absolute;top:8px;left:8px;z-index:1;padding:3px 8px;background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:6px;font-size:9px;font-weight:800;color:#fff}
.prod__fav{position:absolute;top:8px;right:8px;z-index:1;width:28px;height:28px;background:rgba(255,255,255,0.9);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,0.08)}
.prod__img{height:160px;background:#f9fafb;display:flex;align-items:center;justify-content:center;padding:12px}
.prod__img img{max-width:100%;max-height:100%;object-fit:contain}
.prod__img-ph{font-size:40px;opacity:.15}
.prod__body{padding:14px;flex:1;display:flex;flex-direction:column}
.prod__brand{font-size:10px;font-weight:700;color:#c4956a;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px}
.prod__title{font-size:13px;font-weight:600;line-height:1.35;margin:0 0 6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;color:#1e293b}
.prod__price{margin-bottom:2px}
.prod__price-from{font-size:11px;color:#94a3b8}
.prod__price-val{font-size:19px;font-weight:800;color:#0f172a}
.prod__offers{font-size:11px;color:#64748b;margin-bottom:8px}
.prod__cta{margin-top:auto;padding:9px;text-align:center;background:#fdf8f4;border-radius:8px;font-size:12px;font-weight:600;color:#c4956a;transition:all .15s}
.prod:hover .prod__cta{background:#c4956a;color:#fff}

/* ============ HOW ============ */
.how{padding:40px 0;background:#f8f9fb}
.how__inner{max-width:860px;margin:0 auto;padding:0 24px}
.how__grid{display:flex;align-items:flex-start;justify-content:center;gap:10px;margin-top:28px}
.how__step{flex:1;text-align:center;position:relative;padding:0 8px}
.how__num{position:absolute;top:-8px;left:50%;transform:translateX(-50%);width:22px;height:22px;background:#c4956a;color:#fff;font-size:10px;font-weight:700;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(196,149,106,0.3);z-index:1}
.how__icon{width:60px;height:60px;margin:0 auto 10px;background:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#c4956a;border:2px solid #e2e8f0}
.how__title{font-size:15px;font-weight:700;color:#0f172a;margin-bottom:4px}
.how__text{font-size:12px;color:#64748b;line-height:1.5}
.how__arrow{color:#d1d5db;font-size:18px;margin-top:28px;flex-shrink:0}

/* ============ NEWSLETTER ============ */
.newsletter{padding:0 24px;margin:8px auto 0;max-width:1200px}
.newsletter__inner{background:linear-gradient(135deg,#0c1222,#1e293b);border-radius:14px;padding:24px;text-align:center;color:#fff}
.newsletter__icon{font-size:24px;margin-bottom:4px}
.newsletter__title{font-size:16px;font-weight:800}
.newsletter__sub{font-size:12px;color:rgba(255,255,255,0.4);margin:3px 0 14px}
.newsletter__form{display:flex;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:3px;max-width:400px;margin:0 auto}
.newsletter__input{flex:1;border:none;padding:10px 12px;font-size:12px;outline:none;background:none;color:#fff;font-family:inherit}
.newsletter__input::placeholder{color:rgba(255,255,255,0.3)}
.newsletter__btn{padding:10px 20px;background:linear-gradient(135deg,#ff6b35,#ff8f5e);border:none;border-radius:8px;color:#fff;font-size:11px;font-weight:800;font-family:inherit;cursor:pointer;flex-shrink:0}

/* ============ VENDOR CTA ============ */
.vendor-cta{padding:40px 0;background:#0f172a;color:#fff}
.vendor-cta__inner{max-width:960px;margin:0 auto;padding:0 24px;display:flex;align-items:center;gap:36px}
.vendor-cta__content{flex:1}
.vendor-cta__title{font-size:22px;font-weight:800;margin:0 0 8px}
.vendor-cta__text{font-size:13px;color:#94a3b8;line-height:1.6;margin-bottom:16px}
.vendor-cta__features{display:flex;flex-direction:column;gap:6px;margin-bottom:20px}
.vendor-cta__feat{display:flex;align-items:center;gap:6px;font-size:12px;color:#e2e8f0}
.vendor-cta__btn{display:inline-block;padding:12px 24px;background:#c4956a;color:#fff;border-radius:10px;text-decoration:none;font-size:13px;font-weight:700;transition:background .15s}
.vendor-cta__btn:hover{background:#b8875c}
.vendor-cta__visual{flex-shrink:0}
.vendor-cta__card{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:18px 22px;min-width:190px}
.vendor-cta__card-row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:12px}
.vendor-cta__card-row:last-child{border:none}
.vendor-cta__card-row span{color:#94a3b8}
.vendor-cta__card-row strong{color:#c4956a;font-weight:700}

/* ============ RESPONSIVE ============ */

/* Tablet */
@media(max-width:1024px){
    .cats__scroll{grid-template-columns:repeat(3,1fr)}
    .cats__extra{grid-template-columns:repeat(3,1fr)}
    .prod-grid{grid-template-columns:repeat(3,1fr)}
}

/* Tablet small / large phone */
@media(max-width:768px){
    /* Show mobile elements, hide desktop */
    .hero__desktop{display:none}
    .hero__banners{display:block}
    .hero{background:#fff;padding:8px 0 0}
    .hero__bg{display:none}
    .hero__inner{max-width:100%;padding:0 12px}
    .qactions{display:flex}
    
    /* Trust bar inline */
    .trust{margin-top:0;padding:8px 12px}
    .trust__inner{flex-wrap:wrap;gap:10px;padding:12px 16px;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.04)}
    .trust__sep{display:none}
    .trust__item{flex:1 1 40%;min-width:120px}
    .trust__num{font-size:14px}
    .trust__label{font-size:10px}
    
    /* Categories: horizontal scroll */
    .cats{padding:12px 0 8px}
    .cats__inner{padding:0 10px}
    .cats__scroll{display:flex;gap:6px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;padding-bottom:4px}
    .cats__scroll::-webkit-scrollbar{height:3px}
    .cats__scroll::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:4px}
    .cat-card{min-width:130px;flex-shrink:0;scroll-snap-align:start;padding:10px 12px;gap:8px}
    .cat-card__icon{width:38px;height:38px;border-radius:10px;font-size:18px}
    .cat-card__name{font-size:12px}
    .cat-card__count{font-size:9px}
    .cats__extra{display:flex;gap:6px;overflow-x:auto;margin-top:8px}
    .cats__extra .cat-card{min-width:130px;flex-shrink:0}
    
    /* Flash deal */
    .flash{padding:0 10px;margin:4px auto 0}
    .flash__title{font-size:13px}
    
    /* Products 2-col */
    .prod-grid{grid-template-columns:repeat(2,1fr);gap:8px}
    .products,.cat-products{padding:12px 0}
    .products__inner,.cat-products__inner{padding:0 10px}
    .prod__img{height:120px}
    .prod__body{padding:10px}
    .prod__price-val{font-size:16px}
    .prod__cta{padding:8px;font-size:11px}
    
    /* Section heads */
    .sec-head{flex-direction:column;align-items:flex-start;gap:4px;margin-bottom:10px}
    .sec-title{font-size:16px}
    .sec-sub{font-size:11px}
    
    /* How it works */
    .how{padding:20px 0}
    .how__grid{flex-direction:column;gap:16px}
    .how__arrow{display:none}
    .how__icon{width:48px;height:48px}
    
    /* Newsletter */
    .newsletter{padding:0 10px;margin-top:8px}
    .newsletter__inner{padding:16px}
    .newsletter__title{font-size:14px}
    
    /* Vendor CTA */
    .vendor-cta{padding:24px 0}
    .vendor-cta__inner{flex-direction:column;text-align:center;gap:16px;padding:0 16px}
    .vendor-cta__features{align-items:center}
    .vendor-cta__title{font-size:18px}
}

/* Small mobile */
@media(max-width:480px){
    .hero__banner-title{font-size:18px}
    .trust__inner{flex-direction:column;gap:6px;padding:10px 12px}
    .trust__item{justify-content:flex-start;gap:6px}
    .cat-card{min-width:110px;padding:8px 10px;gap:6px}
    .cat-card__icon{width:34px;height:34px;font-size:16px}
    .cat-card__name{font-size:11px}
    .prod-grid{gap:6px}
    .prod__img{height:100px;padding:8px}
    .prod__body{padding:8px}
    .prod__title{font-size:12px}
    .prod__price-val{font-size:15px}
    .prod__badge{font-size:8px;padding:2px 6px}
    .prod__fav{width:24px;height:24px}
    .how__step{padding:0 4px}
    .how__title{font-size:13px}
    .how__text{font-size:11px}
}

/* Very small mobile */
@media(max-width:360px){
    .hero__banner{padding:14px}
    .hero__banner-title{font-size:16px}
    .cat-card{min-width:100px}
    .qa__icon{width:36px;height:36px;font-size:16px}
    .qa__label{font-size:8px}
}
</style>
