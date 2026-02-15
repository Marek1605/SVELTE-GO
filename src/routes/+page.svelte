<script>
    import { onMount } from 'svelte';
    
    export let data;
    
    let searchQuery = '';
    let showMoreCats = false;
    let moreRef;
    let statsVisible = false;
    let statsRef;
    
    $: stats = data.stats || { products: 0, categories: 0, shops: 0, updates: '24/7' };
    $: categories = data.categories || [];
    $: topProducts = data.products || [];
    $: visibleCats = categories.slice(0, 8);
    $: overflowCats = categories.slice(8);
    
    // Animated counters
    let animProducts = 0, animCategories = 0;
    
    function animateCount(target, setter, duration = 1200) {
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setter(target); clearInterval(timer); }
            else setter(Math.floor(start));
        }, 16);
    }
    
    const popularSearches = ['notebook', 'iPhone 15', 'televízor 55"', 'slúchadlá', 'Samsung Galaxy', 'robotický vysávač'];
    
    function totalProducts(cat) {
        let count = cat.product_count || 0;
        if (cat.children) for (const child of cat.children) count += totalProducts(child);
        return count;
    }
    
    function handleSearch(e) {
        e.preventDefault();
        if (searchQuery.trim()) window.location.href = `/hladat?q=${encodeURIComponent(searchQuery)}`;
    }
    
    function toggleMore() { showMoreCats = !showMoreCats; }
    function handleClickOutside(e) { if (moreRef && !moreRef.contains(e.target)) showMoreCats = false; }
    
    onMount(() => {
        document.addEventListener('click', handleClickOutside, true);
        
        // Intersection observer for stats animation
        if (statsRef) {
            const obs = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting && !statsVisible) {
                    statsVisible = true;
                    animateCount(stats.products, v => animProducts = v);
                    animateCount(stats.categories, v => animCategories = v);
                }
            }, { threshold: 0.3 });
            obs.observe(statsRef);
        }
        
        return () => document.removeEventListener('click', handleClickOutside, true);
    });
    
    function fmtPrice(p) { return (p || 0).toFixed(2).replace('.', ','); }
    function fmtNum(n) { return (n || 0).toLocaleString('sk-SK'); }
</script>

<svelte:head>
    <title>MegaPrice.sk — Porovnávač cien | Najlepšie ponuky na jednom mieste</title>
    <meta name="description" content="Porovnajte ceny z overených slovenských obchodov. Nájdite najlepšie ponuky na elektroniku, domácnosť a ďalšie kategórie.">
</svelte:head>

<div class="hp">

    <!-- ========== HERO ========== -->
    <section class="hero">
        <div class="hero__bg"></div>
        <div class="hero__inner">
            <div class="hero__badge">Porovnávač cien pre Slovensko</div>
            <h1 class="hero__title">
                Nájdite <span class="hero__em">najnižšiu cenu</span> za pár sekúnd
            </h1>
            <p class="hero__sub">
                Porovnávame ceny z overených obchodov na jednom mieste. Ušetrite čas aj peniaze.
            </p>
            
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

    <!-- ========== TRUST BAR ========== -->
    <section class="trust" bind:this={statsRef}>
        <div class="trust__inner">
            <div class="trust__item">
                <div class="trust__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>
                <div class="trust__data">
                    <span class="trust__num">{fmtNum(statsVisible ? animProducts : 0)}+</span>
                    <span class="trust__label">produktov</span>
                </div>
            </div>
            <div class="trust__sep"></div>
            <div class="trust__item">
                <div class="trust__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
                <div class="trust__data">
                    <span class="trust__num">{fmtNum(statsVisible ? animCategories : 0)}</span>
                    <span class="trust__label">kategórií</span>
                </div>
            </div>
            <div class="trust__sep"></div>
            <div class="trust__item">
                <div class="trust__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div class="trust__data">
                    <span class="trust__num">Overené</span>
                    <span class="trust__label">obchody</span>
                </div>
            </div>
            <div class="trust__sep"></div>
            <div class="trust__item">
                <div class="trust__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div class="trust__data">
                    <span class="trust__num">Denne</span>
                    <span class="trust__label">aktualizované</span>
                </div>
            </div>
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
                            {#if product.image_url}
                                <img src={product.image_url} alt={product.title}>
                            {:else}
                                <div class="prod__img-ph">📷</div>
                            {/if}
                        </div>
                        <div class="prod__body">
                            {#if product.brand}
                                <span class="prod__brand">{product.brand}</span>
                            {/if}
                            <h3 class="prod__title">{product.title}</h3>
                            <div class="prod__price">
                                {#if product.price_min}
                                    <span class="prod__price-from">od</span>
                                {/if}
                                <span class="prod__price-val">{fmtPrice(product.price_min || product.price)} €</span>
                            </div>
                            {#if product.offer_count > 0}
                                <span class="prod__offers">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h18v18H3z"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                                    {product.offer_count} {product.offer_count === 1 ? 'ponuka' : product.offer_count < 5 ? 'ponuky' : 'ponúk'}
                                </span>
                            {/if}
                            <div class="prod__cta">Porovnať ceny →</div>
                        </div>
                    </a>
                {/each}
            </div>
        </div>
    </section>
    {/if}

    <!-- ========== HOW IT WORKS ========== -->
    <section class="how">
        <div class="how__inner">
            <h2 class="sec-title sec-title--center">Ako funguje MegaPrice?</h2>
            <p class="sec-sub sec-sub--center">Tri jednoduché kroky k najlepšej cene</p>
            
            <div class="how__grid">
                <div class="how__step">
                    <div class="how__num">1</div>
                    <div class="how__icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </div>
                    <h3 class="how__title">Vyhľadajte</h3>
                    <p class="how__text">Zadajte názov produktu alebo prechádzajte kategórie. Máme tisíce produktov z overených obchodov.</p>
                </div>
                <div class="how__arrow">→</div>
                <div class="how__step">
                    <div class="how__num">2</div>
                    <div class="how__icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 2l4 4-4 4"/><path d="M3 6h18"/><path d="M7 14l-4 4 4 4"/><path d="M21 18H3"/></svg>
                    </div>
                    <h3 class="how__title">Porovnajte</h3>
                    <p class="how__text">Porovnajte ceny od rôznych predajcov na jednom mieste. Prehľadne a transparentne.</p>
                </div>
                <div class="how__arrow">→</div>
                <div class="how__step">
                    <div class="how__num">3</div>
                    <div class="how__icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                    </div>
                    <h3 class="how__title">Ušetrite</h3>
                    <p class="how__text">Vyberte najlepšiu ponuku a nakúpte priamo u predajcu. Žiadne skryté poplatky.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- ========== VENDOR CTA ========== -->
    <section class="vendor-cta">
        <div class="vendor-cta__inner">
            <div class="vendor-cta__content">
                <h2 class="vendor-cta__title">Ste predajca?</h2>
                <p class="vendor-cta__text">Pridajte svoj e-shop na MegaPrice a získajte prístup k tisícom zákazníkov, ktorí aktívne porovnávajú ceny. Platíte len za kliknutia.</p>
                <div class="vendor-cta__features">
                    <div class="vendor-cta__feat">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                        <span>Cielení zákazníci s úmyslom kúpiť</span>
                    </div>
                    <div class="vendor-cta__feat">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                        <span>Platba za kliknutie (CPC model)</span>
                    </div>
                    <div class="vendor-cta__feat">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                        <span>Jednoduchý XML feed import</span>
                    </div>
                </div>
                <a href="/pre-predajcov" class="vendor-cta__btn">Začať predávať →</a>
            </div>
            <div class="vendor-cta__visual">
                <div class="vendor-cta__card">
                    <div class="vendor-cta__card-row"><span>Denne návštevy</span><strong>2 500+</strong></div>
                    <div class="vendor-cta__card-row"><span>Priemerný CTR</span><strong>4.2%</strong></div>
                    <div class="vendor-cta__card-row"><span>CPC od</span><strong>0,05 €</strong></div>
                </div>
            </div>
        </div>
    </section>

</div>

<style>
/* ============ GLOBAL ============ */
.hp { background: #fff; }
.sec-head { display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:28px;gap:16px }
.sec-title { font-size:24px;font-weight:700;color:#0f172a;margin:0 }
.sec-title--center { text-align:center }
.sec-sub { font-size:15px;color:#64748b;margin:4px 0 0;line-height:1.5 }
.sec-sub--center { text-align:center }
.sec-link { font-size:14px;font-weight:600;color:#c4956a;text-decoration:none;display:flex;align-items:center;gap:4px;white-space:nowrap;transition:color .15s }
.sec-link:hover { color:#a67b52 }

/* ============ HERO ============ */
.hero {
    position: relative; overflow: hidden;
    padding: 72px 0 64px; text-align: center;
    background: #0f172a;
    color: #fff;
}
.hero__bg {
    position:absolute;inset:0;
    background: radial-gradient(ellipse at 30% 0%, rgba(196,149,106,0.15) 0%, transparent 60%),
                radial-gradient(ellipse at 70% 100%, rgba(99,102,241,0.1) 0%, transparent 50%);
}
.hero__inner { position:relative;max-width:720px;margin:0 auto;padding:0 24px }
.hero__badge {
    display:inline-block;padding:6px 16px;margin-bottom:20px;
    background:rgba(196,149,106,0.15);border:1px solid rgba(196,149,106,0.3);
    border-radius:20px;font-size:12px;font-weight:600;color:#c4956a;
    letter-spacing:0.3px;text-transform:uppercase;
}
.hero__title { font-size:44px;font-weight:800;line-height:1.15;margin-bottom:16px;letter-spacing:-0.5px }
.hero__em { color:#c4956a }
.hero__sub { font-size:17px;color:#94a3b8;margin-bottom:36px;line-height:1.6 }

/* Search bar */
.hero__search {
    display:flex;align-items:center;
    background:#fff;border-radius:14px;
    padding:6px;max-width:600px;margin:0 auto 24px;
    box-shadow:0 8px 32px rgba(0,0,0,0.2);
    position:relative;
}
.hero__search-icon { position:absolute;left:20px;pointer-events:none }
.hero__input {
    flex:1;border:none;background:none;padding:14px 16px 14px 46px;
    font-size:16px;color:#1e293b;outline:none;border-radius:10px;
    min-width:0;
}
.hero__input::placeholder { color:#94a3b8 }
.hero__btn {
    padding:14px 28px;background:#c4956a;color:#fff;border:none;
    border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;
    transition:background .15s;white-space:nowrap;
}
.hero__btn:hover { background:#b8875c }

/* Tags */
.hero__tags { display:flex;flex-wrap:wrap;justify-content:center;gap:8px;align-items:center }
.hero__tags-label { font-size:13px;color:#64748b }
.hero__tag {
    padding:5px 12px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);
    border-radius:8px;font-size:12px;color:#94a3b8;text-decoration:none;
    transition:all .15s;
}
.hero__tag:hover { background:rgba(196,149,106,0.15);color:#c4956a;border-color:rgba(196,149,106,0.3) }

/* ============ TRUST BAR ============ */
.trust {
    padding:0;margin-top:-28px;position:relative;z-index:2;
}
.trust__inner {
    max-width:800px;margin:0 auto;padding:20px 32px;
    background:#fff;border-radius:16px;
    box-shadow:0 4px 24px rgba(0,0,0,0.08);
    display:flex;align-items:center;justify-content:center;gap:28px;
}
.trust__item { display:flex;align-items:center;gap:12px }
.trust__icon { color:#c4956a;flex-shrink:0 }
.trust__num { font-size:18px;font-weight:800;color:#0f172a;display:block }
.trust__label { font-size:12px;color:#64748b;display:block }
.trust__sep { width:1px;height:36px;background:#e2e8f0 }

/* ============ CATEGORIES ============ */
.cats { padding:56px 0 }
.cats__inner { max-width:1200px;margin:0 auto;padding:0 24px }
.cats__grid {
    display:grid;grid-template-columns:repeat(4,1fr);gap:16px;
}
.cats__grid--extra { margin-top:16px }
.cat-card {
    display:flex;align-items:center;gap:14px;
    padding:16px 18px;background:#f8fafc;border:1px solid #e2e8f0;
    border-radius:12px;text-decoration:none;color:#0f172a;
    transition:all .15s;
}
.cat-card:hover { border-color:#c4956a;box-shadow:0 4px 16px rgba(196,149,106,0.1);transform:translateY(-2px) }
.cat-card__img {
    width:48px;height:48px;border-radius:10px;overflow:hidden;
    background:#fff;display:flex;align-items:center;justify-content:center;
    flex-shrink:0;border:1px solid #e2e8f0;
}
.cat-card__img img { width:100%;height:100%;object-fit:cover }
.cat-card__emoji { font-size:22px }
.cat-card__info { min-width:0 }
.cat-card__name { display:block;font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis }
.cat-card__count { font-size:12px;color:#64748b }

.cats__overflow { text-align:center;margin-top:16px }
.cats__more-btn {
    display:inline-flex;align-items:center;gap:6px;
    padding:10px 20px;background:none;border:1px solid #d1d5db;
    border-radius:10px;font-size:13px;font-weight:600;color:#475569;
    cursor:pointer;transition:all .15s;
}
.cats__more-btn:hover { border-color:#c4956a;color:#c4956a }

/* ============ PRODUCTS ============ */
.products { padding:24px 0 56px;background:#f8fafc }
.products__inner { max-width:1200px;margin:0 auto;padding:0 24px }
.prod-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:16px }

.prod {
    background:#fff;border:1px solid #e2e8f0;border-radius:14px;
    text-decoration:none;color:#0f172a;overflow:hidden;
    transition:all .15s;display:flex;flex-direction:column;
    position:relative;
}
.prod:hover { box-shadow:0 8px 24px rgba(0,0,0,0.08);transform:translateY(-3px);border-color:#d1d5db }
.prod__badge {
    position:absolute;top:10px;left:10px;z-index:1;
    font-size:18px;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.15));
}
.prod__img {
    height:180px;background:#f9fafb;display:flex;align-items:center;
    justify-content:center;padding:16px;
}
.prod__img img { max-width:100%;max-height:100%;object-fit:contain }
.prod__img-ph { font-size:40px;opacity:.2 }
.prod__body { padding:16px;flex:1;display:flex;flex-direction:column }
.prod__brand { font-size:11px;font-weight:700;color:#c4956a;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px }
.prod__title {
    font-size:14px;font-weight:500;line-height:1.4;margin:0 0 10px;
    display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
    color:#1e293b;
}
.prod__price { margin-bottom:4px }
.prod__price-from { font-size:12px;color:#94a3b8 }
.prod__price-val { font-size:20px;font-weight:800;color:#0f172a }
.prod__offers {
    display:flex;align-items:center;gap:4px;
    font-size:12px;color:#64748b;margin-bottom:12px;
}
.prod__cta {
    margin-top:auto;padding:10px;text-align:center;
    background:#f8fafc;border-radius:8px;
    font-size:13px;font-weight:600;color:#c4956a;
    transition:all .15s;
}
.prod:hover .prod__cta { background:#c4956a;color:#fff }

/* ============ HOW IT WORKS ============ */
.how { padding:64px 0;background:#fff }
.how__inner { max-width:900px;margin:0 auto;padding:0 24px }
.how__grid { display:flex;align-items:flex-start;justify-content:center;gap:12px;margin-top:40px }
.how__step { flex:1;text-align:center;position:relative;padding:0 8px }
.how__num {
    position:absolute;top:-12px;left:50%;transform:translateX(-50%);
    width:28px;height:28px;background:#c4956a;color:#fff;
    font-size:13px;font-weight:700;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 2px 8px rgba(196,149,106,0.3);
}
.how__icon {
    width:72px;height:72px;margin:0 auto 16px;
    background:#f8fafc;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    color:#c4956a;
    border:2px solid #e2e8f0;
}
.how__title { font-size:17px;font-weight:700;color:#0f172a;margin-bottom:8px }
.how__text { font-size:14px;color:#64748b;line-height:1.6 }
.how__arrow { color:#d1d5db;font-size:24px;margin-top:36px;flex-shrink:0 }

/* ============ VENDOR CTA ============ */
.vendor-cta { padding:64px 0;background:#0f172a;color:#fff }
.vendor-cta__inner { max-width:1000px;margin:0 auto;padding:0 24px;display:flex;align-items:center;gap:48px }
.vendor-cta__content { flex:1 }
.vendor-cta__title { font-size:28px;font-weight:800;margin:0 0 12px }
.vendor-cta__text { font-size:15px;color:#94a3b8;line-height:1.6;margin-bottom:24px }
.vendor-cta__features { display:flex;flex-direction:column;gap:10px;margin-bottom:28px }
.vendor-cta__feat { display:flex;align-items:center;gap:10px;font-size:14px;color:#e2e8f0 }
.vendor-cta__btn {
    display:inline-block;padding:14px 28px;
    background:#c4956a;color:#fff;border-radius:10px;
    text-decoration:none;font-size:15px;font-weight:700;
    transition:background .15s;
}
.vendor-cta__btn:hover { background:#b8875c }
.vendor-cta__visual { flex-shrink:0 }
.vendor-cta__card {
    background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);
    border-radius:16px;padding:24px 28px;min-width:220px;
}
.vendor-cta__card-row { display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:14px }
.vendor-cta__card-row:last-child { border:none }
.vendor-cta__card-row span { color:#94a3b8 }
.vendor-cta__card-row strong { color:#c4956a;font-weight:700 }

/* ============ RESPONSIVE ============ */
@media(max-width:1024px){
    .cats__grid{grid-template-columns:repeat(3,1fr)}
    .prod-grid{grid-template-columns:repeat(3,1fr)}
}
@media(max-width:768px){
    .hero{padding:48px 0 52px}
    .hero__title{font-size:30px}
    .hero__search{flex-direction:column;border-radius:12px}
    .hero__input{padding:14px 16px;border-radius:12px 12px 0 0;text-align:center}
    .hero__search-icon{display:none}
    .hero__btn{border-radius:0 0 12px 12px;width:100%}
    .trust__inner{flex-wrap:wrap;gap:20px;padding:20px}
    .trust__sep{display:none}
    .cats__grid{grid-template-columns:repeat(2,1fr)}
    .prod-grid{grid-template-columns:repeat(2,1fr)}
    .how__grid{flex-direction:column;gap:24px}
    .how__arrow{display:none}
    .vendor-cta__inner{flex-direction:column;text-align:center}
    .vendor-cta__features{align-items:center}
    .sec-head{flex-direction:column;align-items:flex-start;gap:8px}
}
@media(max-width:480px){
    .cats__grid{grid-template-columns:1fr}
    .prod-grid{grid-template-columns:1fr}
    .trust__inner{flex-direction:column;gap:12px}
}
</style>
