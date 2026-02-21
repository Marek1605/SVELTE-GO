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
    
    // Mobile banner carousel
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
        'hudob': '🎵', 'herné': '🎮', 'hodin': '⌚', 'kostým': '🎭', 'nástroj': '🔧',
        'sieť': '🌐', 'obchod': '🏪', 'podnik': '📋',
    };
    function getCatEmoji(name) {
        const l = (name || '').toLowerCase();
        for (const [k, v] of Object.entries(categoryEmojis)) { if (l.includes(k)) return v; }
        return '📦';
    }
    const catColors = [
        '#fff7ed','#eff6ff','#fdf2f8','#ecfdf5','#f5f3ff','#fefce8',
        '#fef2f2','#f0fdfa','#f1f5f9','#fff1f2','#f0fdf4','#faf5ff',
    ];
    const catBorders = [
        '#fdba74','#93c5fd','#f9a8d4','#6ee7b7','#c4b5fd','#fde047',
        '#fca5a5','#5eead4','#94a3b8','#fda4af','#86efac','#d8b4fe',
    ];
    
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
    
    $: visibleCats = categories.slice(0, 8);
    $: overflowCats = categories.slice(8);
    
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
                showHow = d.show_how_section !== 'false';
                showVendor = d.show_vendor_cta !== 'false';
            }
        } catch(e) {}
        
        // Load categories
        try {
            const catRes = await api.getCategories();
            if (catRes?.success) categories = catRes.data || catRes.categories || [];
            else if (Array.isArray(catRes)) categories = catRes;
        } catch(e) {}
        
        // Load top products
        try {
            const prodRes = await api.getProducts('sort=popular&limit=5');
            let items = [];
            if (prodRes?.success && prodRes?.data?.items) items = prodRes.data.items;
            else if (prodRes?.items) items = prodRes.items;
            topProducts = items;
        } catch(e) {}
        
        // Load stats
        try {
            const sr = await fetch('/api/v1/stats');
            const sd = await sr.json();
            if (sd?.success && sd?.data) stats = sd.data;
            else if (sd?.products !== undefined) stats = sd;
        } catch(e) {}
        
        loaded = true;
        
        // Animate stats
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
                        <span class="hero__badge-m">NOVÉ</span>
                        <div class="hero__banner-title">Porovnaj ceny</div>
                        <div class="hero__banner-sub">{fmtNum(animProducts)}+ produktov</div>
                    </div>
                    <div class="hero__banner hero__banner--dark">
                        <div class="hero__banner-deco">🏪</div>
                        <span class="hero__badge-m hero__badge-m--gold">PRE E-SHOPY</span>
                        <div class="hero__banner-title">Pridajte váš obchod</div>
                        <div class="hero__banner-sub">CPC od 0,05 € • Zadarmo</div>
                    </div>
                </div>
                <div class="hero__dots">
                    <button class="hero__dot" class:active={currentBanner === 0} on:click={() => currentBanner = 0}></button>
                    <button class="hero__dot" class:active={currentBanner === 1} on:click={() => currentBanner = 1}></button>
                </div>
            </div>

            <!-- Desktop hero content -->
            <div class="hero__desktop">
                <div class="hero__pill">
                    <span class="hero__pill-dot"></span>
                    {fmtNum(animProducts)}+ produktov porovnaných
                </div>
                <h1 class="hero__title">
                    {@html heroTitle.replace(/\*([^*]+)\*/g, '<span class="hero__em">$1</span>')}
                </h1>
                <p class="hero__sub">{heroSubtitle}</p>
                <form class="hero__search" on:submit={handleSearch}>
                    <svg class="hero__search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" class="hero__input" placeholder="Čo hľadáte? napr. iPhone, notebook..." bind:value={searchQuery}>
                    <button type="submit" class="hero__btn">🔍 Hľadať</button>
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

    <!-- ========== QUICK ACTIONS (mobile only) ========== -->
    <section class="qactions">
        {#each quickActions as qa}
            <a href={qa.href} class="qa">
                <span class="qa__icon">{qa.icon}</span>
                <span class="qa__label">{qa.label}</span>
            </a>
        {/each}
    </section>

    <!-- ========== TRUST BAR (floating card) ========== -->
    <section class="trust">
        <div class="trust__inner">
            <div class="trust__item">
                <div class="trust__icon trust__icon--prod">📦</div>
                <div class="trust__text"><span class="trust__num">{fmtNum(animProducts)}+</span><span class="trust__label">produktov</span></div>
            </div>
            <div class="trust__sep"></div>
            <div class="trust__item">
                <div class="trust__icon trust__icon--cat">📂</div>
                <div class="trust__text"><span class="trust__num">{fmtNum(animCategories)}</span><span class="trust__label">kategórií</span></div>
            </div>
            <div class="trust__sep"></div>
            <div class="trust__item">
                <div class="trust__icon trust__icon--shop">🏪</div>
                <div class="trust__text"><span class="trust__num">Overené</span><span class="trust__label">e-shopy</span></div>
            </div>
            <div class="trust__sep"></div>
            <div class="trust__item">
                <div class="trust__icon trust__icon--upd">🔄</div>
                <div class="trust__text"><span class="trust__num">Denne</span><span class="trust__label">aktualizované</span></div>
            </div>
        </div>
    </section>

    <!-- ========== CATEGORIES ========== -->
    {#if categories.length > 0}
    <section class="cats">
        <div class="cats__inner">
            <div class="sec-head">
                <div>
                    <h2 class="sec-title">Hlavné kategórie</h2>
                    <p class="sec-sub">Prechádzajte produkty podľa kategórií</p>
                </div>
                <a href="/kategorie" class="sec-link">Všetky kategórie →</a>
            </div>
            
            <div class="cats__grid">
                {#each visibleCats as cat, i}
                    <a href="/kategoria/{cat.slug}" class="cat-card" style="background:{catColors[i % catColors.length]};border-color:{catBorders[i % catBorders.length]}30">
                        <div class="cat-card__icon">
                            {#if cat.image_url}
                                <img src={cat.image_url} alt={cat.name} />
                            {:else}
                                <span class="cat-card__emoji">{getCatEmoji(cat.name)}</span>
                            {/if}
                        </div>
                        <div class="cat-card__info">
                            <span class="cat-card__name">{cat.name}</span>
                            {#if totalProducts(cat) > 0}
                                <span class="cat-card__count">{fmtNum(totalProducts(cat))} produktov</span>
                            {/if}
                        </div>
                        <span class="cat-card__arrow">→</span>
                    </a>
                {/each}
            </div>
            
            {#if overflowCats.length > 0}
            <div class="cats__overflow" bind:this={moreRef}>
                <button class="cats__more-btn" on:click={toggleMore}>
                    {showMoreCats ? 'Skryť' : `Ďalších ${overflowCats.length} kategórií`}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transform:rotate({showMoreCats ? 180 : 0}deg);transition:transform .2s"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {#if showMoreCats}
                <div class="cats__grid cats__grid--extra">
                    {#each overflowCats as cat, i}
                        <a href="/kategoria/{cat.slug}" class="cat-card" style="background:{catColors[(i + 8) % catColors.length]};border-color:{catBorders[(i + 8) % catBorders.length]}30">
                            <div class="cat-card__icon">
                                {#if cat.image_url}<img src={cat.image_url} alt={cat.name} />{:else}<span class="cat-card__emoji">{getCatEmoji(cat.name)}</span>{/if}
                            </div>
                            <div class="cat-card__info">
                                <span class="cat-card__name">{cat.name}</span>
                                {#if totalProducts(cat) > 0}<span class="cat-card__count">{fmtNum(totalProducts(cat))} produktov</span>{/if}
                            </div>
                            <span class="cat-card__arrow">→</span>
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
                    <h2 class="sec-title">🔥 TOP porovnania</h2>
                    <p class="sec-sub">Produkty s najviac ponukami od predajcov</p>
                </div>
                <a href="/produkty" class="sec-link">Všetky produkty →</a>
            </div>
            
            <div class="prod-grid">
                {#each topProducts as product, i}
                    <a href="/produkt/{product.slug}" class="prod">
                        {#if i < 3}
                        <div class="prod__rank" class:prod__rank--gold={i === 0}>{i + 1}</div>
                        {/if}
                        <div class="prod__fav">♡</div>
                        <div class="prod__img">
                            {#if product.image_url}<img src={product.image_url} alt={product.title}>{:else}<div class="prod__img-ph">📷</div>{/if}
                        </div>
                        <div class="prod__body">
                            {#if product.brand}<span class="prod__brand">{product.brand}</span>{/if}
                            <h3 class="prod__title">{product.title}</h3>
                            {#if product.offer_count > 0}
                                <span class="prod__offers">{product.offer_count} {product.offer_count === 1 ? 'ponuka' : product.offer_count < 5 ? 'ponuky' : 'ponúk'}</span>
                            {/if}
                            <div class="prod__price">
                                {#if product.price_min}<span class="prod__price-from">od</span>{/if}
                                <span class="prod__price-val">{fmtPrice(product.price_min || product.price)} €</span>
                            </div>
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
                <div>
                    <h2 class="sec-title">{catSec.name}</h2>
                    <p class="sec-sub">Najobľúbenejšie v kategórii</p>
                </div>
                <a href="/kategoria/{catSec.slug}" class="sec-link">Všetky v kategórii →</a>
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
                            {#if product.offer_count > 0}
                                <span class="prod__offers">{product.offer_count} {product.offer_count === 1 ? 'ponuka' : product.offer_count < 5 ? 'ponuky' : 'ponúk'}</span>
                            {/if}
                            <div class="prod__price">
                                {#if product.price_min}<span class="prod__price-from">od</span>{/if}
                                <span class="prod__price-val">{fmtPrice(product.price_min || product.price)} €</span>
                            </div>
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
                    <div class="how__icon">🔍</div>
                    <h3 class="how__title">Vyhľadajte</h3>
                    <p class="how__text">Zadajte názov produktu alebo prechádzajte kategórie.</p>
                </div>
                <div class="how__arrow">→</div>
                <div class="how__step">
                    <div class="how__num">2</div>
                    <div class="how__icon">⇄</div>
                    <h3 class="how__title">Porovnajte</h3>
                    <p class="how__text">Porovnajte ceny od rôznych predajcov na jednom mieste.</p>
                </div>
                <div class="how__arrow">→</div>
                <div class="how__step">
                    <div class="how__num">3</div>
                    <div class="how__icon">💰</div>
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
                <span class="vendor-cta__badge">PRE E-SHOPY</span>
                <h2 class="vendor-cta__title">Získajte zákazníkov, ktorí chcú kupovať</h2>
                <p class="vendor-cta__text">Pridajte svoj e-shop na MegaPrice. Platíte len za kliknutia na váš obchod.</p>
                <div class="vendor-cta__features">
                    <div class="vendor-cta__feat"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4956a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>CPC od 0,05 €</span></div>
                    <div class="vendor-cta__feat"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4956a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>XML feed import</span></div>
                    <div class="vendor-cta__feat"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4956a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>Registrácia zadarmo</span></div>
                </div>
                <a href="/prihlasenie-predajcu" class="vendor-cta__btn">Začať predávať →</a>
            </div>
            <div class="vendor-cta__visual">
                <div class="vendor-cta__card">
                    <div class="vendor-cta__card-row"><span>CPC od</span><strong>0,05 €</strong></div>
                    <div class="vendor-cta__card-row"><span>Registrácia</span><strong>Zadarmo</strong></div>
                    <div class="vendor-cta__card-row"><span>Feed import</span><strong>XML / CSV</strong></div>
                    <div class="vendor-cta__card-row"><span>Štatistiky</span><strong>Real-time</strong></div>
                </div>
            </div>
        </div>
    </section>
    {/if}

</div>

<style>
.hp{background:#fafaf9}

/* ============ SECTION HEADS ============ */
.sec-head{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:24px;gap:16px}
.sec-title{font-size:22px;font-weight:800;color:#0f172a;margin:0;letter-spacing:-.3px}
.sec-title--center{text-align:center}
.sec-sub{font-size:14px;color:#64748b;margin:4px 0 0;line-height:1.5}
.sec-sub--center{text-align:center}
.sec-link{font-size:13px;font-weight:600;color:#c4956a;text-decoration:none;display:flex;align-items:center;gap:4px;white-space:nowrap;transition:color .15s}
.sec-link:hover{color:#a67b52}

/* ============ HERO ============ */
.hero{
    position:relative;overflow:hidden;
    text-align:center;color:#fff;
    background:linear-gradient(140deg,#0f172a 0%,#1e293b 50%,#0f172a 100%);
}
.hero__bg{
    position:absolute;inset:0;
    background:radial-gradient(ellipse at 30% 0%,rgba(196,149,106,0.1) 0%,transparent 60%),
               radial-gradient(ellipse at 70% 100%,rgba(99,102,241,0.06) 0%,transparent 50%);
}
.hero__inner{position:relative}

/* Mobile banners */
.hero__banners{display:none;overflow:hidden;position:relative}
.hero__banners-track{display:flex;transition:transform .4s ease}
.hero__banner{min-width:100%;padding:32px 24px 28px;position:relative}
.hero__banner--orange{background:linear-gradient(135deg,#c4956a,#a67b52)}
.hero__banner--dark{background:linear-gradient(135deg,#1e293b,#334155)}
.hero__banner-deco{position:absolute;right:16px;top:12px;font-size:48px;opacity:.15}
.hero__badge-m{display:inline-block;padding:3px 10px;background:rgba(255,255,255,.2);border-radius:6px;font-size:10px;font-weight:700;letter-spacing:.5px;margin-bottom:10px}
.hero__badge-m--gold{background:rgba(196,149,106,.3)}
.hero__banner-title{font-size:24px;font-weight:800;margin-bottom:6px}
.hero__banner-sub{font-size:13px;opacity:.8}
.hero__dots{display:flex;gap:6px;justify-content:center;padding:12px 0}
.hero__dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.25);border:none;padding:0;cursor:pointer;transition:all .2s}
.hero__dot.active{background:#c4956a;width:20px;border-radius:4px}

/* Desktop hero */
.hero__desktop{max-width:680px;margin:0 auto;padding:44px 24px 40px}
.hero__pill{
    display:inline-flex;align-items:center;gap:6px;
    padding:5px 14px;background:rgba(196,149,106,0.12);
    border:1px solid rgba(196,149,106,0.2);border-radius:100px;
    font-size:12px;font-weight:700;color:#c4956a;margin-bottom:18px;
}
.hero__pill-dot{width:6px;height:6px;border-radius:50%;background:#c4956a;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.hero__title{font-size:38px;font-weight:900;line-height:1.12;margin-bottom:10px;letter-spacing:-.8px}
.hero__em{color:#c4956a}
.hero__sub{font-size:16px;color:#94a3b8;margin-bottom:28px}

.hero__search{
    display:flex;align-items:center;
    background:#fff;border-radius:14px;
    padding:5px;max-width:560px;margin:0 auto 18px;
    box-shadow:0 8px 32px rgba(0,0,0,0.25);position:relative;
}
.hero__search-icon{position:absolute;left:18px;pointer-events:none}
.hero__input{
    flex:1;border:none;background:none;padding:14px 14px 14px 44px;
    font-size:15px;color:#1e293b;outline:none;border-radius:10px;min-width:0;
}
.hero__input::placeholder{color:#94a3b8}
.hero__btn{
    padding:14px 26px;background:linear-gradient(135deg,#c4956a,#b8875c);color:#fff;border:none;
    border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;
    transition:transform .1s;white-space:nowrap;
}
.hero__btn:hover{transform:scale(1.02)}

.hero__tags{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;align-items:center}
.hero__tags-label{font-size:12px;color:#64748b}
.hero__tag{
    padding:4px 10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);
    border-radius:7px;font-size:11px;color:#94a3b8;text-decoration:none;transition:all .15s;
}
.hero__tag:hover{background:rgba(196,149,106,0.15);color:#c4956a;border-color:rgba(196,149,106,0.25)}

/* ============ QUICK ACTIONS (mobile) ============ */
.qactions{display:none;justify-content:center;gap:6px;padding:16px 16px 0;overflow-x:auto}
.qa{display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 14px;background:#fff;border-radius:12px;text-decoration:none;min-width:56px;border:1px solid #e2e8f0}
.qa__icon{font-size:20px}
.qa__label{font-size:10px;font-weight:600;color:#475569}

/* ============ TRUST BAR — floating card ============ */
.trust{padding:0 24px;margin-top:-28px;position:relative;z-index:2}
.trust__inner{
    max-width:960px;margin:0 auto;padding:20px 32px;
    background:#fff;border-radius:16px;
    box-shadow:0 4px 24px rgba(0,0,0,0.06);
    display:flex;align-items:center;justify-content:space-between;
}
.trust__item{display:flex;align-items:center;gap:10px;flex:1;justify-content:center}
.trust__icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.trust__icon--prod{background:linear-gradient(135deg,#fff7ed,#fde2c8)}
.trust__icon--cat{background:linear-gradient(135deg,#eff6ff,#bfdbfe)}
.trust__icon--shop{background:linear-gradient(135deg,#ecfdf5,#6ee7b7)}
.trust__icon--upd{background:linear-gradient(135deg,#f5f3ff,#c4b5fd)}
.trust__text{display:flex;flex-direction:column}
.trust__num{font-size:16px;font-weight:800;color:#0f172a}
.trust__label{font-size:11px;color:#64748b}
.trust__sep{width:1px;height:32px;background:#e2e8f0;flex-shrink:0}

/* ============ CATEGORIES ============ */
.cats{padding:40px 0 24px}
.cats__inner{max-width:1200px;margin:0 auto;padding:0 24px}
.cats__grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.cats__grid--extra{margin-top:12px}
.cat-card{
    display:flex;align-items:center;gap:14px;
    padding:18px 16px;border:1.5px solid transparent;
    border-radius:14px;text-decoration:none;color:#0f172a;transition:all .2s;position:relative;
}
.cat-card:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,0.06)}
.cat-card__icon{
    width:48px;height:48px;border-radius:12px;overflow:hidden;
    background:rgba(255,255,255,.6);display:flex;align-items:center;justify-content:center;
    flex-shrink:0;
}
.cat-card__icon img{width:100%;height:100%;object-fit:cover;border-radius:12px}
.cat-card__emoji{font-size:24px}
.cat-card__info{min-width:0;flex:1}
.cat-card__name{display:block;font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cat-card__count{font-size:11px;color:#64748b}
.cat-card__arrow{position:absolute;right:14px;top:50%;transform:translateY(-50%);opacity:0;transition:opacity .15s;color:#c4956a;font-weight:700}
.cat-card:hover .cat-card__arrow{opacity:1}

.cats__overflow{text-align:center;margin-top:12px}
.cats__more-btn{
    display:inline-flex;align-items:center;gap:6px;
    padding:8px 18px;background:none;border:1px solid #d1d5db;
    border-radius:8px;font-size:12px;font-weight:600;color:#475569;cursor:pointer;transition:all .15s;
}
.cats__more-btn:hover{border-color:#c4956a;color:#c4956a}

/* ============ PRODUCTS ============ */
.products,.cat-products{padding:32px 0;background:#fff}
.products__inner,.cat-products__inner{max-width:1200px;margin:0 auto;padding:0 24px}
.prod-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}

.prod{
    background:#fff;border:1.5px solid #e2e8f0;border-radius:14px;
    text-decoration:none;color:#0f172a;overflow:hidden;
    transition:all .2s;display:flex;flex-direction:column;position:relative;
}
.prod:hover{box-shadow:0 8px 24px rgba(0,0,0,0.06);transform:translateY(-2px);border-color:#c4956a}
.prod__rank{
    position:absolute;top:8px;left:8px;z-index:1;
    width:26px;height:26px;border-radius:7px;
    background:#1e293b;color:#fff;display:flex;align-items:center;justify-content:center;
    font-size:11px;font-weight:800;
}
.prod__rank--gold{background:linear-gradient(135deg,#c4956a,#b8875c)}
.prod__fav{
    position:absolute;top:8px;right:8px;z-index:1;
    width:26px;height:26px;border-radius:7px;
    background:#fff;border:1px solid #e2e8f0;display:flex;align-items:center;justify-content:center;
    font-size:12px;color:#d1d5db;cursor:pointer;transition:all .15s;
}
.prod__fav:hover{border-color:#c4956a;color:#c4956a}
.prod__img{
    height:160px;background:#fafaf9;display:flex;align-items:center;
    justify-content:center;padding:16px;
}
.prod__img img{max-width:100%;max-height:100%;object-fit:contain}
.prod__img-ph{font-size:36px;opacity:.15}
.prod__body{padding:14px;flex:1;display:flex;flex-direction:column}
.prod__brand{font-size:10px;font-weight:700;color:#c4956a;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px}
.prod__title{
    font-size:13px;font-weight:600;line-height:1.35;margin:0 0 6px;
    display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;color:#1e293b;min-height:35px;
}
.prod__offers{font-size:11px;color:#94a3b8;margin-bottom:6px}
.prod__price{margin-bottom:10px}
.prod__price-from{font-size:11px;color:#94a3b8}
.prod__price-val{font-size:20px;font-weight:900;color:#0f172a;letter-spacing:-.3px}
.prod__cta{
    margin-top:auto;padding:10px;text-align:center;
    background:#0f172a;border-radius:9px;
    font-size:12px;font-weight:700;color:#fff;transition:background .15s;
}
.prod:hover .prod__cta{background:#c4956a}

/* ============ HOW ============ */
.how{padding:48px 0;background:#fff}
.how__inner{max-width:860px;margin:0 auto;padding:0 24px}
.how__grid{display:flex;align-items:flex-start;justify-content:center;gap:16px;margin-top:32px}
.how__step{flex:1;text-align:center;position:relative;padding:0 8px}
.how__num{
    position:absolute;top:-8px;left:50%;transform:translateX(-50%);
    width:22px;height:22px;background:#c4956a;color:#fff;
    font-size:10px;font-weight:700;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 2px 6px rgba(196,149,106,0.3);z-index:1;
}
.how__icon{
    width:60px;height:60px;margin:0 auto 12px;
    background:#fafaf9;border-radius:16px;
    display:flex;align-items:center;justify-content:center;font-size:24px;
    border:1.5px solid #e2e8f0;
}
.how__title{font-size:15px;font-weight:700;color:#0f172a;margin-bottom:4px}
.how__text{font-size:13px;color:#64748b;line-height:1.5}
.how__arrow{color:#d1d5db;font-size:20px;margin-top:30px;flex-shrink:0}

/* ============ VENDOR CTA ============ */
.vendor-cta{padding:48px 0;background:#0f172a;color:#fff}
.vendor-cta__inner{max-width:960px;margin:0 auto;padding:0 24px;display:flex;align-items:center;gap:48px}
.vendor-cta__content{flex:1}
.vendor-cta__badge{display:inline-block;padding:4px 10px;background:rgba(196,149,106,.15);border-radius:6px;font-size:11px;font-weight:700;color:#c4956a;margin-bottom:12px}
.vendor-cta__title{font-size:26px;font-weight:900;margin:0 0 10px;letter-spacing:-.3px}
.vendor-cta__text{font-size:14px;color:#94a3b8;line-height:1.6;margin-bottom:20px}
.vendor-cta__features{display:flex;flex-direction:column;gap:8px;margin-bottom:24px}
.vendor-cta__feat{display:flex;align-items:center;gap:8px;font-size:13px;color:#e2e8f0}
.vendor-cta__btn{
    display:inline-block;padding:14px 28px;
    background:linear-gradient(135deg,#c4956a,#b8875c);color:#fff;border-radius:10px;
    text-decoration:none;font-size:14px;font-weight:700;transition:transform .1s;
}
.vendor-cta__btn:hover{transform:scale(1.02)}
.vendor-cta__visual{flex-shrink:0}
.vendor-cta__card{
    background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);
    border-radius:14px;padding:18px 22px;min-width:200px;
}
.vendor-cta__card-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:13px}
.vendor-cta__card-row:last-child{border:none}
.vendor-cta__card-row span{color:#78716c}
.vendor-cta__card-row strong{color:#c4956a;font-weight:700}

/* ============ RESPONSIVE ============ */
@media(max-width:1024px){
    .cats__grid{grid-template-columns:repeat(3,1fr)}
    .prod-grid{grid-template-columns:repeat(3,1fr)}
}
@media(max-width:768px){
    .hero__desktop{display:none}
    .hero__banners{display:block}
    .qactions{display:flex}
    .hero{padding:0}
    .trust{margin-top:0;padding:12px 16px}
    .trust__inner{flex-wrap:wrap;gap:12px;padding:14px 16px;justify-content:center;border-radius:12px}
    .trust__sep{display:none}
    .trust__item{flex:0 0 auto;gap:6px}
    .trust__icon{width:32px;height:32px;font-size:14px;border-radius:8px}
    .trust__num{font-size:14px}
    .cats__grid,.prod-grid{grid-template-columns:repeat(2,1fr)}
    .cat-card{padding:12px}
    .cat-card__icon{width:40px;height:40px}
    .cat-card__name{font-size:13px}
    .how__grid{flex-direction:column;gap:20px}.how__arrow{display:none}
    .vendor-cta__inner{flex-direction:column;text-align:center}
    .vendor-cta__features{align-items:center}
    .sec-head{flex-direction:column;align-items:flex-start;gap:6px}
    .prod__img{height:140px}
}
@media(max-width:480px){
    .cats__grid,.prod-grid{grid-template-columns:1fr 1fr}
    .trust__inner{flex-direction:column;gap:8px;padding:14px}
}
</style>
