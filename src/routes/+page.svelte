<script>
    import { onMount } from 'svelte';
    
    export let data;
    
    let searchQuery = '';
    let showMoreCats = false;
    let moreRef;
    
    $: stats = data.stats || {
        products: 4998,
        categories: 531,
        shops: 500,
        updates: '24/7'
    };
    
    $: categories = data.categories || [];
    $: topProducts = data.products || [];
    $: visibleCats = categories.slice(0, 8);
    $: overflowCats = categories.slice(8);
    
    const popularSearches = ['notebook', 'iPhone', 'televízor', 'slúchadlá', 'tablet'];
    
    const categoryEmojis = {
        'dom': '🏡', 'záhrada': '🌿', 'domác': '🏠', 'spotrebič': '⚡',
        'elektronik': '📱', 'hračk': '🧸', 'kancelár': '📎', 'kuchyn': '🍳',
        'ostatn': '📦', 'šport': '⚽', 'zdravi': '💊', 'krás': '💄',
        'zvierat': '🐾', 'bazén': '🏊', 'auto': '🚗', 'cestov': '✈️',
        'doplnk': '✨', 'filter': '🔧', 'hry': '🎮', 'hygiena': '🧴',
        'batéri': '🔋', 'pre deti': '👶', 'bublifuk': '🫧', 'kempov': '⛺'
    };
    
    function getCatEmoji(name) {
        const lower = (name || '').toLowerCase();
        for (const [key, emoji] of Object.entries(categoryEmojis)) {
            if (lower.includes(key)) return emoji;
        }
        return '📦';
    }
    
    function totalProducts(cat) {
        let count = cat.product_count || 0;
        if (cat.children) {
            for (const child of cat.children) {
                count += totalProducts(child);
            }
        }
        return count;
    }
    
    function handleSearch(e) {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/hladat?q=${encodeURIComponent(searchQuery)}`;
        }
    }
    
    function toggleMore() {
        showMoreCats = !showMoreCats;
    }
    
    function handleClickOutside(e) {
        if (moreRef && !moreRef.contains(e.target)) {
            showMoreCats = false;
        }
    }
    
    onMount(() => {
        document.addEventListener('click', handleClickOutside, true);
        return () => document.removeEventListener('click', handleClickOutside, true);
    });
</script>

<svelte:head>
    <title>MegaPrice.sk - Porovnávač cien</title>
    <meta name="description" content="Porovnajte ceny z 500+ obchodov. Nájdite najlepšie ponuky a ušetrite.">
</svelte:head>

<div class="mp-home">
    <!-- Hero Section -->
    <section class="mp-hero">
        <div class="mp-hero__container">
            <h1 class="mp-hero__title">
                Porovnajte ceny z <span class="mp-hero__highlight">500+ obchodov</span>
            </h1>
            <p class="mp-hero__subtitle">
                Nájdite najlepšie ponuky a ušetrite. Jeden vyhľadávač, všetky ceny.
            </p>
            
            <form class="mp-hero__search" on:submit={handleSearch}>
                <input 
                    type="text" 
                    class="mp-hero__input" 
                    placeholder="Čo hľadáte? (napr. iPhone)"
                    bind:value={searchQuery}
                >
                <button type="submit" class="mp-hero__btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    Hľadať
                </button>
            </form>
            
            <div class="mp-hero__popular">
                <span>Populárne:</span>
                {#each popularSearches as term}
                    <a href="/hladat?q={encodeURIComponent(term)}">{term}</a>
                {/each}
            </div>
        </div>
    </section>
    
    <!-- Stats Section -->
    <section class="mp-stats">
        <div class="mp-stats__container">
            <div class="mp-stats__grid">
                <div class="mp-stats__item">
                    <div class="mp-stats__icon">📦</div>
                    <div class="mp-stats__number">{stats.products.toLocaleString()}+</div>
                    <div class="mp-stats__label">Produktov</div>
                </div>
                <div class="mp-stats__item">
                    <div class="mp-stats__icon">🏷️</div>
                    <div class="mp-stats__number">{stats.categories}+</div>
                    <div class="mp-stats__label">Kategórií</div>
                </div>
                <div class="mp-stats__item">
                    <div class="mp-stats__icon">🏪</div>
                    <div class="mp-stats__number">{stats.shops}+</div>
                    <div class="mp-stats__label">Obchodov</div>
                </div>
                <div class="mp-stats__item">
                    <div class="mp-stats__icon">🔄</div>
                    <div class="mp-stats__number">{stats.updates}</div>
                    <div class="mp-stats__label">Aktualizácie</div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Categories Section -->
    <section class="mp-categories-section">
        <div class="mp-categories-section__container">
            <div class="mp-section-header">
                <h2 class="mp-section-title">Populárne kategórie</h2>
                <a href="/kategorie" class="mp-section-link">Všetky kategórie →</a>
            </div>
            
            {#if categories.length > 0}
                <div class="mp-cat-row">
                    {#each visibleCats as cat}
                        <a href="/kategoria/{cat.slug}" class="mp-cat-card">
                            <div class="mp-cat-card__visual">
                                {#if cat.image_url}
                                    <img src={cat.image_url} alt={cat.name} />
                                {:else}
                                    <span class="mp-cat-card__emoji">{cat.icon || getCatEmoji(cat.name)}</span>
                                {/if}
                            </div>
                            <span class="mp-cat-card__name">{cat.name}</span>
                            {#if totalProducts(cat) > 0}
                                <span class="mp-cat-card__count">{totalProducts(cat)}</span>
                            {/if}
                        </a>
                    {/each}
                    
                    {#if overflowCats.length > 0}
                        <div class="mp-cat-more-wrap" bind:this={moreRef}>
                            <button class="mp-cat-card mp-cat-card--more" on:click={toggleMore} class:is-open={showMoreCats}>
                                <div class="mp-cat-card__visual mp-cat-card__visual--more">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                                        {#if showMoreCats}
                                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                        {:else}
                                            <line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="14" x2="20" y2="14"/><line x1="4" y1="20" x2="14" y2="20"/>
                                        {/if}
                                    </svg>
                                </div>
                                <span class="mp-cat-card__name">{showMoreCats ? 'Zavrieť' : 'Viac'}</span>
                            </button>
                            
                            {#if showMoreCats}
                                <div class="mp-cat-dropdown">
                                    <div class="mp-cat-dropdown__grid">
                                        {#each overflowCats as cat}
                                            <a href="/kategoria/{cat.slug}" class="mp-cat-dropdown__item">
                                                <span class="mp-cat-dropdown__icon">
                                                    {#if cat.image_url}
                                                        <img src={cat.image_url} alt="" />
                                                    {:else}
                                                        {cat.icon || getCatEmoji(cat.name)}
                                                    {/if}
                                                </span>
                                                <div class="mp-cat-dropdown__info">
                                                    <span class="mp-cat-dropdown__name">{cat.name}</span>
                                                    {#if cat.children && cat.children.length > 0}
                                                        <span class="mp-cat-dropdown__sub">
                                                            {cat.children.slice(0, 3).map(c => c.name).join(' · ')}
                                                            {#if cat.children.length > 3}
                                                                <span class="mp-cat-dropdown__sub-more"> +{cat.children.length - 3}</span>
                                                            {/if}
                                                        </span>
                                                    {/if}
                                                </div>
                                                {#if totalProducts(cat) > 0}
                                                    <span class="mp-cat-dropdown__count">{totalProducts(cat)}</span>
                                                {/if}
                                            </a>
                                        {/each}
                                    </div>
                                    <a href="/kategorie" class="mp-cat-dropdown__all">
                                        Zobraziť všetky kategórie →
                                    </a>
                                </div>
                            {/if}
                        </div>
                    {/if}
                </div>
            {:else}
                <p class="mp-empty-text">Načítavam kategórie...</p>
            {/if}
        </div>
    </section>
    
    <!-- Top Products Section -->
    {#if topProducts.length > 0}
    <section class="mp-products-section">
        <div class="mp-products-section__container">
            <div class="mp-section-header">
                <h2 class="mp-section-title">🏆 Top produkty</h2>
                <a href="/produkty" class="mp-section-link">Zobraziť všetky →</a>
            </div>
            
            <div class="mp-products-grid">
                {#each topProducts as product}
                    <a href="/produkt/{product.slug}" class="mp-product-card">
                        <div class="mp-product-card__badge">TOP</div>
                        <div class="mp-product-card__image">
                            {#if product.image_url}
                                <img src={product.image_url} alt={product.title}>
                            {:else}
                                <div class="mp-product-card__placeholder">📷</div>
                            {/if}
                        </div>
                        <div class="mp-product-card__content">
                            {#if product.brand}
                                <span class="mp-product-card__brand">{product.brand}</span>
                            {/if}
                            <h3 class="mp-product-card__title">{product.title}</h3>
                            <div class="mp-product-card__price">
                                {#if product.price_min}
                                    <span class="mp-product-card__price-from">od</span>
                                {/if}
                                <span class="mp-product-card__price-value">
                                    {(product.price_min || product.price || 0).toFixed(2).replace('.', ',')} €
                                </span>
                            </div>
                            {#if product.offer_count > 1}
                                <span class="mp-product-card__offers">v {product.offer_count} obchodoch</span>
                            {:else}
                                <span class="mp-product-card__offers">v 1 obchode</span>
                            {/if}
                            <button class="mp-product-card__btn">Porovnať ceny →</button>
                        </div>
                    </a>
                {/each}
            </div>
        </div>
    </section>
    {/if}
    
    <!-- How it works -->
    <section class="mp-how-section">
        <div class="mp-how-section__container">
            <h2 class="mp-section-title mp-section-title--center">Ako to funguje</h2>
            
            <div class="mp-how-grid">
                <div class="mp-how-item">
                    <div class="mp-how-item__number">1</div>
                    <div class="mp-how-item__icon">🔍</div>
                    <h3 class="mp-how-item__title">Vyhľadajte produkt</h3>
                    <p class="mp-how-item__text">Zadajte názov produktu alebo prechádzajte kategórie</p>
                </div>
                <div class="mp-how-item">
                    <div class="mp-how-item__number">2</div>
                    <div class="mp-how-item__icon">📊</div>
                    <h3 class="mp-how-item__title">Porovnajte ceny</h3>
                    <p class="mp-how-item__text">Prezrite si ponuky od rôznych predajcov</p>
                </div>
                <div class="mp-how-item">
                    <div class="mp-how-item__number">3</div>
                    <div class="mp-how-item__icon">💰</div>
                    <h3 class="mp-how-item__title">Ušetrite</h3>
                    <p class="mp-how-item__text">Nakúpte za najlepšiu cenu</p>
                </div>
            </div>
        </div>
    </section>
</div>

<style>
/* =============================================
   HOMEPAGE - MEGAPRICE.SK STYLE
   ============================================= */

.mp-home {
    background: #fff;
}

/* Hero Section */
.mp-hero {
    background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
    color: #fff;
    padding: 60px 0 80px;
    text-align: center;
}

.mp-hero__container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 24px;
}

.mp-hero__title {
    font-size: 42px;
    font-weight: 700;
    margin-bottom: 16px;
    line-height: 1.2;
}

.mp-hero__highlight {
    color: #6ee7b7;
}

.mp-hero__subtitle {
    font-size: 18px;
    opacity: 0.9;
    margin-bottom: 32px;
}

.mp-hero__search {
    display: flex;
    max-width: 600px;
    margin: 0 auto 20px;
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.mp-hero__input {
    flex: 1;
    padding: 18px 24px;
    border: none;
    font-size: 16px;
    outline: none;
    color: #1f2937;
}

.mp-hero__input::placeholder {
    color: #9ca3af;
}

.mp-hero__btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 18px 32px;
    background: #c4956a;
    border: none;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.mp-hero__btn:hover {
    background: #b8875c;
}

.mp-hero__popular {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-size: 14px;
    flex-wrap: wrap;
}

.mp-hero__popular span {
    opacity: 0.7;
}

.mp-hero__popular a {
    color: #fff;
    text-decoration: underline;
    text-underline-offset: 2px;
}

.mp-hero__popular a:hover {
    color: #6ee7b7;
}

/* Stats Section */
.mp-stats {
    padding: 60px 0;
    background: #fff;
}

.mp-stats__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
}

.mp-stats__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 32px;
}

.mp-stats__item {
    text-align: center;
    padding: 32px 24px;
    background: #fff;
    border-radius: 16px;
    border: 1px solid #e5e7eb;
    transition: all 0.2s;
}

.mp-stats__item:hover {
    border-color: #c4956a;
    box-shadow: 0 4px 20px rgba(196,149,106,0.15);
}

.mp-stats__icon {
    font-size: 32px;
    margin-bottom: 12px;
}

.mp-stats__number {
    font-size: 36px;
    font-weight: 800;
    color: #1f2937;
    margin-bottom: 4px;
}

.mp-stats__label {
    font-size: 14px;
    color: #6b7280;
}

/* Section Headers */
.mp-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
}

.mp-section-title {
    font-size: 28px;
    font-weight: 700;
    color: #1f2937;
}

.mp-section-title--center {
    text-align: center;
    width: 100%;
    margin-bottom: 40px;
}

.mp-section-link {
    font-size: 14px;
    font-weight: 600;
    color: #c4956a;
}

.mp-section-link:hover {
    text-decoration: underline;
}

/* Categories Section */
.mp-categories-section {
    padding: 60px 0;
    background: #f9fafb;
}

.mp-categories-section__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
}

/* Category Row - horizontal scrollable on mobile */
.mp-cat-row {
    display: flex;
    gap: 12px;
    align-items: stretch;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding: 4px 0 8px;
}
.mp-cat-row::-webkit-scrollbar { display: none; }

/* Category Card */
.mp-cat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    min-width: 120px;
    max-width: 120px;
    padding: 20px 12px 16px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    text-align: center;
    cursor: pointer;
    transition: all 0.22s ease;
    scroll-snap-align: start;
    position: relative;
    text-decoration: none;
    color: inherit;
}
.mp-cat-card:hover {
    border-color: #c4956a;
    box-shadow: 0 8px 24px rgba(196,149,106,0.15);
    transform: translateY(-4px);
}

.mp-cat-card__visual {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: linear-gradient(145deg, #f8fafc, #eef2f7);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    transition: all 0.22s ease;
}
.mp-cat-card:hover .mp-cat-card__visual {
    background: linear-gradient(145deg, #fff5f0, #fef0e7);
    transform: scale(1.08);
}
.mp-cat-card__visual img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 6px;
}
.mp-cat-card__emoji {
    font-size: 26px;
    line-height: 1;
}

.mp-cat-card__visual--more {
    background: linear-gradient(145deg, #f0f4ff, #e8ecf4);
    color: #6b7280;
}
.mp-cat-card.is-open .mp-cat-card__visual--more,
.mp-cat-card--more:hover .mp-cat-card__visual--more {
    background: linear-gradient(145deg, #c4956a, #b8875c);
    color: #fff;
}

.mp-cat-card__name {
    font-size: 12px;
    font-weight: 600;
    color: #374151;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.mp-cat-card__count {
    position: absolute;
    top: 8px;
    right: 8px;
    font-size: 10px;
    font-weight: 700;
    color: #fff;
    background: #c4956a;
    min-width: 20px;
    height: 20px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 6px;
}

/* More Wrap (relative anchor for dropdown) */
.mp-cat-more-wrap {
    position: relative;
    flex-shrink: 0;
}

/* Dropdown */
.mp-cat-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 420px;
    max-height: 460px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.03);
    z-index: 100;
    overflow: hidden;
    animation: dropIn 0.2s ease;
}
@keyframes dropIn {
    from { opacity: 0; transform: translateY(-8px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}

.mp-cat-dropdown__grid {
    max-height: 400px;
    overflow-y: auto;
    padding: 8px;
    scrollbar-width: thin;
    scrollbar-color: #d1d5db transparent;
}

.mp-cat-dropdown__item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 14px;
    border-radius: 12px;
    transition: all 0.15s;
    text-decoration: none;
    color: inherit;
}
.mp-cat-dropdown__item:hover {
    background: #fef7f0;
}

.mp-cat-dropdown__icon {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    background: linear-gradient(145deg, #f8fafc, #eef2f7);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
    overflow: hidden;
}
.mp-cat-dropdown__item:hover .mp-cat-dropdown__icon {
    background: linear-gradient(145deg, #fff5f0, #fef0e7);
}
.mp-cat-dropdown__icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 4px;
}

.mp-cat-dropdown__info {
    flex: 1;
    min-width: 0;
}

.mp-cat-dropdown__name {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
    display: block;
    line-height: 1.3;
}

.mp-cat-dropdown__sub {
    font-size: 11px;
    color: #9ca3af;
    display: block;
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.mp-cat-dropdown__sub-more {
    color: #c4956a;
    font-weight: 600;
}

.mp-cat-dropdown__count {
    font-size: 11px;
    font-weight: 700;
    color: #6b7280;
    background: #f3f4f6;
    padding: 3px 8px;
    border-radius: 8px;
    flex-shrink: 0;
}

.mp-cat-dropdown__all {
    display: block;
    text-align: center;
    padding: 14px;
    font-size: 13px;
    font-weight: 600;
    color: #c4956a;
    border-top: 1px solid #f3f4f6;
    transition: background 0.15s;
}
.mp-cat-dropdown__all:hover {
    background: #fef7f0;
}

/* Products Section */
.mp-products-section {
    padding: 60px 0;
    background: #fff;
}

.mp-products-section__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
}

.mp-products-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
}

.mp-product-card {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #e5e7eb;
    overflow: hidden;
    transition: all 0.2s;
    position: relative;
}

.mp-product-card:hover {
    border-color: #c4956a;
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    transform: translateY(-4px);
}

.mp-product-card__badge {
    position: absolute;
    top: 12px;
    left: 12px;
    padding: 4px 10px;
    background: #c4956a;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    border-radius: 6px;
    z-index: 1;
}

.mp-product-card__image {
    height: 180px;
    background: #f9fafb;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
}

.mp-product-card__image img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

.mp-product-card__placeholder {
    font-size: 48px;
    opacity: 0.3;
}

.mp-product-card__content {
    padding: 16px;
}

.mp-product-card__brand {
    font-size: 12px;
    font-weight: 600;
    color: #c4956a;
    text-transform: uppercase;
    margin-bottom: 6px;
    display: block;
}

.mp-product-card__title {
    font-size: 14px;
    font-weight: 500;
    color: #1f2937;
    line-height: 1.4;
    margin-bottom: 12px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.mp-product-card__price {
    margin-bottom: 4px;
}

.mp-product-card__price-from {
    font-size: 12px;
    color: #6b7280;
    margin-right: 4px;
}

.mp-product-card__price-value {
    font-size: 20px;
    font-weight: 800;
    color: #1f2937;
}

.mp-product-card__offers {
    font-size: 12px;
    color: #6b7280;
    display: block;
    margin-bottom: 12px;
}

.mp-product-card__btn {
    width: 100%;
    padding: 12px;
    background: #c4956a;
    border: none;
    border-radius: 8px;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.mp-product-card__btn:hover {
    background: #b8875c;
}

/* How it works */
.mp-how-section {
    padding: 80px 0;
    background: #f9fafb;
}

.mp-how-section__container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 24px;
}

.mp-how-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 40px;
}

.mp-how-item {
    text-align: center;
    position: relative;
}

.mp-how-item__number {
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 32px;
    height: 32px;
    background: #c4956a;
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.mp-how-item__icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
    background: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.mp-how-item__title {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 8px;
}

.mp-how-item__text {
    font-size: 14px;
    color: #6b7280;
    line-height: 1.6;
}

/* Utility */
.mp-loading {
    text-align: center;
    padding: 40px;
    color: #6b7280;
}

.mp-empty-text {
    text-align: center;
    padding: 40px;
    color: #9ca3af;
}

/* Responsive */
@media (max-width: 1024px) {
    .mp-stats__grid {
        grid-template-columns: repeat(2, 1fr);
    }
    .mp-cat-dropdown {
        width: 360px;
    }
    .mp-products-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .mp-hero {
        padding: 40px 0 60px;
    }
    .mp-hero__title {
        font-size: 28px;
    }
    .mp-hero__search {
        flex-direction: column;
        border-radius: 12px;
    }
    .mp-hero__input {
        border-radius: 12px 12px 0 0;
    }
    .mp-hero__btn {
        justify-content: center;
        border-radius: 0 0 12px 12px;
    }
    .mp-stats__grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
    }
    .mp-stats__item {
        padding: 24px 16px;
    }
    .mp-stats__number {
        font-size: 28px;
    }
    .mp-how-grid {
        grid-template-columns: 1fr;
        gap: 32px;
    }
    .mp-section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }
}

@media (max-width: 480px) {
    .mp-stats__grid {
        grid-template-columns: 1fr;
    }
    .mp-products-grid {
        grid-template-columns: 1fr;
    }
    .mp-cat-card {
        min-width: 100px;
        max-width: 100px;
        padding: 16px 10px 14px;
    }
    .mp-cat-card__visual {
        width: 48px;
        height: 48px;
    }
    .mp-cat-dropdown {
        position: fixed;
        top: auto;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        max-height: 70vh;
        border-radius: 20px 20px 0 0;
        animation: slideUp 0.25s ease;
    }
    @keyframes slideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
    }
}
</style>
