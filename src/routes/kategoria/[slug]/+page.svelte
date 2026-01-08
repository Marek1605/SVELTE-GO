<script>
    import { formatPrice } from '$lib/api';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';

    export let data;

    $: category = data.category;
    $: ancestors = data.ancestors || [];
    $: children = data.children || [];
    $: products = data.products || [];
    $: brands = data.brands || [];
    $: priceRange = data.priceRange || { min: 0, max: 1000 };
    $: totalProducts = data.total || 0;
    $: currentPage = data.page || 1;
    $: totalPages = data.total_pages || 1;
    $: errorMessage = data.error || null;

    let minPrice = '';
    let maxPrice = '';
    let selectedBrand = '';
    let sort = 'newest';
    let showFilters = true;

    $: {
        const params = $page.url.searchParams;
        minPrice = params.get('min_price') || '';
        maxPrice = params.get('max_price') || '';
        selectedBrand = params.get('brand') || '';
        sort = params.get('sort') || 'newest';
    }

    $: hasActiveFilters = minPrice || maxPrice || selectedBrand;

    function applyFilters() {
        const params = new URLSearchParams();
        if (minPrice) params.set('min_price', minPrice);
        if (maxPrice) params.set('max_price', maxPrice);
        if (selectedBrand) params.set('brand', selectedBrand);
        if (sort !== 'newest') params.set('sort', sort);

        const queryString = params.toString();
        goto(`/kategoria/${category?.slug || ''}${queryString ? '?' + queryString : ''}`, { replaceState: true });
    }

    function clearFilters() {
        minPrice = '';
        maxPrice = '';
        selectedBrand = '';
        sort = 'newest';
        if (category?.slug) {
            goto(`/kategoria/${category.slug}`, { replaceState: true });
        }
    }

    function selectBrand(brand) {
        if (selectedBrand === brand) {
            selectedBrand = '';
        } else {
            selectedBrand = brand;
        }
        applyFilters();
    }

    function changePage(newPage) {
        if (newPage < 1 || newPage > totalPages) return;
        if (!category?.slug) return;
        const params = new URLSearchParams($page.url.searchParams);
        params.set('page', newPage.toString());
        goto(`/kategoria/${category.slug}?${params.toString()}`);
    }
</script>

<svelte:head>
    <title>{category?.name || 'Kategória'} | MegaPrice.sk</title>
    <meta name="description" content="Porovnajte ceny v kategórii {category?.name}. {totalProducts} produktov.">
</svelte:head>

<div class="category-page">
    <div class="container">
        <!-- Breadcrumb -->
        <nav class="breadcrumb">
            <a href="/">Domov</a>
            {#each ancestors as ancestor}
                <span class="sep">/</span>
                <a href="/kategoria/{ancestor.slug}">{ancestor.name}</a>
            {/each}
            <span class="sep">/</span>
            <span class="current">{category?.name}</span>
        </nav>

        {#if errorMessage}
            <div class="error-banner">⚠️ {errorMessage}</div>
        {/if}

        {#if category}
            <!-- Category Header -->
            <div class="category-header">
                <h1>{category.name}</h1>
                <span class="product-count">{totalProducts} produktov</span>
            </div>

            <!-- FILTERS BAR - VŽDY HORE -->
            <div class="filters-bar">
                <div class="filters-bar__toggle">
                    <button class="toggle-btn" on:click={() => showFilters = !showFilters}>
                        🎛️ Filtre
                        {#if hasActiveFilters}
                            <span class="active-badge">!</span>
                        {/if}
                        <span class="arrow" class:open={showFilters}>▼</span>
                    </button>
                    
                    {#if hasActiveFilters}
                        <button class="clear-btn" on:click={clearFilters}>✕ Zrušiť filtre</button>
                    {/if}
                </div>

                {#if showFilters}
                    <div class="filters-content">
                        <!-- Price Filter -->
                        <div class="filter-group">
                            <label class="filter-label">💰 Cena</label>
                            <div class="price-inputs">
                                <input 
                                    type="number" 
                                    placeholder="Od" 
                                    bind:value={minPrice} 
                                    on:change={applyFilters}
                                >
                                <span>–</span>
                                <input 
                                    type="number" 
                                    placeholder="Do" 
                                    bind:value={maxPrice} 
                                    on:change={applyFilters}
                                >
                                <span>€</span>
                            </div>
                            {#if priceRange.max > 0}
                                <div class="price-hint">
                                    {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
                                </div>
                            {/if}
                        </div>

                        <!-- Brand Filter -->
                        {#if brands.length > 0}
                            <div class="filter-group filter-group--brands">
                                <label class="filter-label">🏷️ Značka</label>
                                <div class="brand-chips">
                                    {#each brands.slice(0, 12) as brand}
                                        <button 
                                            class="brand-chip" 
                                            class:active={selectedBrand === brand.name}
                                            on:click={() => selectBrand(brand.name)}
                                        >
                                            {brand.name}
                                            <span class="count">({brand.count})</span>
                                        </button>
                                    {/each}
                                    {#if brands.length > 12}
                                        <span class="more-brands">+{brands.length - 12} ďalších</span>
                                    {/if}
                                </div>
                            </div>
                        {/if}

                        <!-- Sort -->
                        <div class="filter-group">
                            <label class="filter-label">📊 Zoradiť</label>
                            <select bind:value={sort} on:change={applyFilters}>
                                <option value="newest">Najnovšie</option>
                                <option value="price_asc">Najlacnejšie</option>
                                <option value="price_desc">Najdrahšie</option>
                                <option value="name_asc">A-Z</option>
                                <option value="name_desc">Z-A</option>
                            </select>
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Subcategories -->
            {#if children.length > 0}
                <div class="subcategories">
                    <h2 class="subcategories__title">Podkategórie</h2>
                    <div class="subcategories__grid">
                        {#each children as child}
                            <a href="/kategoria/{child.slug}" class="subcat-card">
                                <span class="subcat-card__icon">📦</span>
                                <span class="subcat-card__name">{child.name}</span>
                                <span class="subcat-card__count">{child.product_count || 0} produktov</span>
                            </a>
                        {/each}
                    </div>
                </div>
            {/if}

            <!-- Products -->
            <div class="products-section">
                <div class="products-header">
                    <span class="results-count">Zobrazených {products.length} z {totalProducts}</span>
                </div>

                {#if products.length > 0}
                    <div class="products-grid">
                        {#each products as product}
                            <article class="product-card">
                                <a href="/produkt/{product.slug}" class="product-card__image">
                                    {#if product.image_url}
                                        <img src={product.image_url} alt={product.title} loading="lazy">
                                    {:else}
                                        <div class="product-card__placeholder">📦</div>
                                    {/if}
                                </a>
                                <div class="product-card__content">
                                    {#if product.brand}
                                        <span class="product-card__brand">{product.brand}</span>
                                    {/if}
                                    <h3 class="product-card__title">
                                        <a href="/produkt/{product.slug}">{product.title}</a>
                                    </h3>
                                    <div class="product-card__price-section">
                                        <span class="product-card__price-label">od</span>
                                        <span class="product-card__price">{formatPrice(product.price_min || product.price)}</span>
                                    </div>
                                    {#if product.offer_count > 1}
                                        <div class="product-card__offers">
                                            📊 {product.offer_count} ponúk
                                        </div>
                                    {/if}
                                    <a href="/produkt/{product.slug}" class="product-card__btn">
                                        Porovnať ceny
                                    </a>
                                </div>
                            </article>
                        {/each}
                    </div>

                    {#if totalPages > 1}
                        <nav class="pagination">
                            <button class="pagination__btn" disabled={currentPage <= 1} on:click={() => changePage(currentPage - 1)}>‹</button>
                            {#each Array(Math.min(totalPages, 7)) as _, i}
                                {@const pageNum = currentPage <= 4 ? i + 1 : currentPage + i - 3}
                                {#if pageNum > 0 && pageNum <= totalPages}
                                    <button class="pagination__btn" class:active={pageNum === currentPage} on:click={() => changePage(pageNum)}>{pageNum}</button>
                                {/if}
                            {/each}
                            <button class="pagination__btn" disabled={currentPage >= totalPages} on:click={() => changePage(currentPage + 1)}>›</button>
                        </nav>
                    {/if}
                {:else}
                    <div class="empty-state">
                        <div class="empty-state__icon">🔍</div>
                        <h2>Žiadne produkty</h2>
                        <p>V tejto kategórii sme nenašli žiadne produkty.</p>
                        {#if hasActiveFilters}
                            <button class="btn btn--primary" on:click={clearFilters}>Zrušiť filtre</button>
                        {/if}
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>

<style>
.category-page {
    padding: 16px 0 60px;
    background: #fff;
    min-height: 100vh;
}

.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Breadcrumb */
.breadcrumb {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 16px;
}
.breadcrumb a { color: #6b7280; text-decoration: none; }
.breadcrumb a:hover { color: #c4956a; }
.breadcrumb .sep { color: #d1d5db; }
.breadcrumb .current { color: #374151; }

.error-banner {
    padding: 14px 20px;
    background: #fef3c7;
    border: 1px solid #f59e0b;
    border-radius: 10px;
    color: #92400e;
    margin-bottom: 20px;
}

/* Category Header */
.category-header {
    margin-bottom: 20px;
}
.category-header h1 {
    font-size: 32px;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 4px;
}
.product-count {
    font-size: 14px;
    color: #6b7280;
}

/* ========== FILTERS BAR ========== */
.filters-bar {
    background: #f8fafc;
    border-radius: 16px;
    padding: 16px 20px;
    margin-bottom: 24px;
}

.filters-bar__toggle {
    display: flex;
    align-items: center;
    gap: 16px;
}

.toggle-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    color: #374151;
    position: relative;
}

.toggle-btn:hover {
    border-color: #c4956a;
}

.active-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 16px;
    height: 16px;
    background: #ef4444;
    color: white;
    border-radius: 50%;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.arrow {
    font-size: 10px;
    transition: transform 0.2s;
}
.arrow.open {
    transform: rotate(180deg);
}

.clear-btn {
    padding: 8px 14px;
    background: #fee2e2;
    border: none;
    border-radius: 8px;
    color: #dc2626;
    font-size: 13px;
    cursor: pointer;
}
.clear-btn:hover {
    background: #fecaca;
}

.filters-content {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.filter-group--brands {
    flex: 1;
    min-width: 300px;
}

.filter-label {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
}

.price-inputs {
    display: flex;
    align-items: center;
    gap: 8px;
}

.price-inputs input {
    width: 80px;
    padding: 10px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
}

.price-inputs span {
    color: #9ca3af;
}

.price-hint {
    font-size: 11px;
    color: #9ca3af;
}

.brand-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.brand-chip {
    padding: 6px 12px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s;
}

.brand-chip:hover {
    border-color: #c4956a;
}

.brand-chip.active {
    background: #c4956a;
    border-color: #c4956a;
    color: white;
}

.brand-chip .count {
    font-size: 11px;
    opacity: 0.7;
}

.more-brands {
    padding: 6px 12px;
    color: #6b7280;
    font-size: 12px;
}

.filter-group select {
    padding: 10px 32px 10px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
    background: white;
    cursor: pointer;
    min-width: 150px;
}

/* ========== SUBCATEGORIES ========== */
.subcategories {
    margin-bottom: 32px;
}

.subcategories__title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #1f2937;
}

.subcategories__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
}

.subcat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 16px;
    background: #f9fafb;
    border-radius: 12px;
    text-decoration: none;
    transition: all 0.2s;
}

.subcat-card:hover {
    background: #fff;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transform: translateY(-2px);
}

.subcat-card__icon {
    font-size: 28px;
    margin-bottom: 10px;
}

.subcat-card__name {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
    text-align: center;
    margin-bottom: 4px;
}

.subcat-card__count {
    font-size: 12px;
    color: #6b7280;
}

/* ========== PRODUCTS ========== */
.products-section {
    margin-top: 24px;
}

.products-header {
    margin-bottom: 16px;
}

.results-count {
    font-size: 14px;
    color: #6b7280;
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
}

.product-card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    transition: all 0.2s;
}

.product-card:hover {
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    transform: translateY(-4px);
}

.product-card__image {
    display: block;
    aspect-ratio: 1;
    background: #f9fafb;
    padding: 16px;
}

.product-card__image img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.product-card__placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    opacity: 0.3;
}

.product-card__content {
    padding: 16px;
}

.product-card__brand {
    font-size: 11px;
    font-weight: 600;
    color: #c4956a;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.product-card__title {
    font-size: 14px;
    font-weight: 600;
    margin: 8px 0;
    line-height: 1.4;
}

.product-card__title a {
    color: #1f2937;
    text-decoration: none;
}

.product-card__price-section {
    margin: 12px 0;
}

.product-card__price-label {
    font-size: 12px;
    color: #6b7280;
}

.product-card__price {
    font-size: 22px;
    font-weight: 800;
    color: #111;
    margin-left: 4px;
}

.product-card__offers {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 12px;
}

.product-card__btn {
    display: block;
    text-align: center;
    padding: 12px;
    background: linear-gradient(135deg, #c4956a, #b8875c);
    color: white;
    border-radius: 10px;
    text-decoration: none;
    font-weight: 600;
    font-size: 13px;
    transition: all 0.2s;
}

.product-card__btn:hover {
    background: linear-gradient(135deg, #b8875c, #a67a50);
}

/* Pagination */
.pagination {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 40px;
}

.pagination__btn {
    width: 44px;
    height: 44px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: white;
    cursor: pointer;
    font-size: 15px;
    font-weight: 500;
    transition: all 0.2s;
}

.pagination__btn:hover {
    border-color: #c4956a;
    color: #c4956a;
}

.pagination__btn.active {
    background: #c4956a;
    color: white;
    border-color: #c4956a;
}

.pagination__btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 80px 20px;
}

.empty-state__icon {
    font-size: 4rem;
    margin-bottom: 16px;
}

.empty-state h2 {
    font-size: 22px;
    margin-bottom: 8px;
    color: #1f2937;
}

.empty-state p {
    color: #6b7280;
    margin-bottom: 24px;
}

.btn {
    padding: 12px 24px;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
}

.btn--primary {
    background: #c4956a;
    color: white;
}

.btn--primary:hover {
    background: #b8875c;
}

/* Responsive */
@media (max-width: 768px) {
    .category-header h1 {
        font-size: 24px;
    }
    
    .filters-content {
        flex-direction: column;
        gap: 16px;
    }
    
    .filter-group--brands {
        min-width: auto;
    }
    
    .subcategories__grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    }
    
    .products-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
    }
    
    .product-card__content {
        padding: 12px;
    }
    
    .product-card__price {
        font-size: 18px;
    }
}
</style>
