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
    $: attributes = data.attributes || [];
    $: priceRange = data.priceRange || { min: 0, max: 1000 };
    $: totalProducts = data.total || 0;
    $: currentPage = data.page || 1;
    $: totalPages = data.total_pages || 1;
    $: errorMessage = data.error || null;

    let minPrice = '';
    let maxPrice = '';
    let selectedBrand = '';
    let selectedAttributes = {};
    let sort = 'newest';

    $: {
        const params = $page.url.searchParams;
        minPrice = params.get('min_price') || '';
        maxPrice = params.get('max_price') || '';
        selectedBrand = params.get('brand') || '';
        sort = params.get('sort') || 'newest';
        
        // Load attribute filters from URL
        selectedAttributes = {};
        for (const [key, value] of params.entries()) {
            if (key.startsWith('attr_')) {
                selectedAttributes[key.replace('attr_', '')] = value;
            }
        }
    }

    $: hasActiveFilters = minPrice || maxPrice || selectedBrand || Object.keys(selectedAttributes).length > 0;

    function applyFilters() {
        const params = new URLSearchParams();
        if (minPrice) params.set('min_price', minPrice);
        if (maxPrice) params.set('max_price', maxPrice);
        if (selectedBrand) params.set('brand', selectedBrand);
        if (sort !== 'newest') params.set('sort', sort);
        
        // Add attribute filters
        for (const [name, value] of Object.entries(selectedAttributes)) {
            if (value) params.set('attr_' + name, value);
        }

        const queryString = params.toString();
        goto(`/kategoria/${category?.slug || ''}${queryString ? '?' + queryString : ''}`, { replaceState: true });
    }

    function clearFilters() {
        minPrice = '';
        maxPrice = '';
        selectedBrand = '';
        selectedAttributes = {};
        sort = 'newest';
        if (category?.slug) {
            goto(`/kategoria/${category.slug}`, { replaceState: true });
        }
    }

    function selectBrand(brand) {
        selectedBrand = selectedBrand === brand ? '' : brand;
        applyFilters();
    }

    function selectAttribute(attrName, value) {
        if (selectedAttributes[attrName] === value) {
            delete selectedAttributes[attrName];
            selectedAttributes = { ...selectedAttributes };
        } else {
            selectedAttributes[attrName] = value;
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
            <div class="category-header">
                <h1>{category.name}</h1>
                <span class="product-count">{totalProducts} produktov</span>
            </div>

            <div class="main-layout">
                <!-- LEFT SIDEBAR - FILTERS -->
                <aside class="sidebar">
                    <div class="sidebar-header">
                        <h3>🎛️ Filtre</h3>
                        {#if hasActiveFilters}
                            <button class="clear-btn" on:click={clearFilters}>Zrušiť</button>
                        {/if}
                    </div>

                    <!-- Price Filter -->
                    <div class="filter-section">
                        <h4>💰 Cena</h4>
                        <div class="price-inputs">
                            <input type="number" placeholder="Od" bind:value={minPrice} on:change={applyFilters}>
                            <span>–</span>
                            <input type="number" placeholder="Do" bind:value={maxPrice} on:change={applyFilters}>
                            <span>€</span>
                        </div>
                        {#if priceRange.max > 0}
                            <div class="price-hint">{formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}</div>
                        {/if}
                    </div>

                    <!-- Brand Filter -->
                    {#if brands.length > 0}
                        <div class="filter-section">
                            <h4>🏷️ Značka</h4>
                            <div class="filter-list">
                                {#each brands.slice(0, 15) as brand}
                                    <label class="filter-item" class:active={selectedBrand === brand.name}>
                                        <input type="radio" name="brand" checked={selectedBrand === brand.name} on:change={() => selectBrand(brand.name)}>
                                        <span class="filter-name">{brand.name}</span>
                                        <span class="filter-count">({brand.count})</span>
                                    </label>
                                {/each}
                                {#if brands.length > 15}
                                    <div class="more-items">+{brands.length - 15} ďalších</div>
                                {/if}
                            </div>
                        </div>
                    {/if}

                    <!-- Attribute Filters from Admin Settings -->
                    {#each attributes as attr}
                        {#if attr.values && attr.values.length > 0}
                            <div class="filter-section">
                                <h4>{attr.name}</h4>
                                <div class="filter-list">
                                    {#each attr.values as val}
                                        <label class="filter-item" class:active={selectedAttributes[attr.name] === val.value}>
                                            <input 
                                                type="radio" 
                                                name="attr_{attr.name}" 
                                                checked={selectedAttributes[attr.name] === val.value} 
                                                on:change={() => selectAttribute(attr.name, val.value)}
                                            >
                                            <span class="filter-name">{val.value}</span>
                                            <span class="filter-count">({val.count})</span>
                                        </label>
                                    {/each}
                                </div>
                            </div>
                        {/if}
                    {/each}

                    <!-- Sort -->
                    <div class="filter-section">
                        <h4>📊 Zoradiť</h4>
                        <select bind:value={sort} on:change={applyFilters}>
                            <option value="newest">Najnovšie</option>
                            <option value="price_asc">Najlacnejšie</option>
                            <option value="price_desc">Najdrahšie</option>
                            <option value="name_asc">A-Z</option>
                            <option value="name_desc">Z-A</option>
                        </select>
                    </div>
                </aside>

                <!-- RIGHT CONTENT -->
                <div class="content">
                    <!-- Subcategories -->
                    {#if children.length > 0}
                        <div class="subcategories">
                            <h2 class="section-title">Podkategórie</h2>
                            <div class="subcategories-grid">
                                {#each children as child}
                                    <a href="/kategoria/{child.slug}" class="subcat-card">
                                        <div class="subcat-image">
                                            {#if child.image_url}
                                                <img src={child.image_url} alt={child.name} loading="lazy">
                                            {:else}
                                                <div class="subcat-placeholder">📦</div>
                                            {/if}
                                        </div>
                                        <div class="subcat-info">
                                            <span class="subcat-name">{child.name}</span>
                                            <span class="subcat-count">{child.product_count || 0} produktov</span>
                                        </div>
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
                                        <a href="/produkt/{product.slug}" class="product-image">
                                            {#if product.image_url}
                                                <img src={product.image_url} alt={product.title} loading="lazy">
                                            {:else}
                                                <div class="product-placeholder">📦</div>
                                            {/if}
                                        </a>
                                        <div class="product-content">
                                            {#if product.brand}
                                                <span class="product-brand">{product.brand}</span>
                                            {/if}
                                            <h3 class="product-title">
                                                <a href="/produkt/{product.slug}">{product.title}</a>
                                            </h3>
                                            <div class="product-price-section">
                                                <span class="price-label">od</span>
                                                <span class="price-value">{formatPrice(product.price_min || product.price)}</span>
                                            </div>
                                            {#if product.offer_count > 1}
                                                <div class="product-offers">📊 {product.offer_count} ponúk</div>
                                            {/if}
                                            <a href="/produkt/{product.slug}" class="product-btn">Porovnať ceny</a>
                                        </div>
                                    </article>
                                {/each}
                            </div>

                            {#if totalPages > 1}
                                <nav class="pagination">
                                    <button class="page-btn" disabled={currentPage <= 1} on:click={() => changePage(currentPage - 1)}>‹</button>
                                    {#each Array(Math.min(totalPages, 7)) as _, i}
                                        {@const pageNum = currentPage <= 4 ? i + 1 : currentPage + i - 3}
                                        {#if pageNum > 0 && pageNum <= totalPages}
                                            <button class="page-btn" class:active={pageNum === currentPage} on:click={() => changePage(pageNum)}>{pageNum}</button>
                                        {/if}
                                    {/each}
                                    <button class="page-btn" disabled={currentPage >= totalPages} on:click={() => changePage(currentPage + 1)}>›</button>
                                </nav>
                            {/if}
                        {:else}
                            <div class="empty-state">
                                <div class="empty-icon">🔍</div>
                                <h2>Žiadne produkty</h2>
                                <p>V tejto kategórii sme nenašli žiadne produkty.</p>
                                {#if hasActiveFilters}
                                    <button class="btn-primary" on:click={clearFilters}>Zrušiť filtre</button>
                                {/if}
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
.category-page { padding: 16px 0 60px; background: #fff; min-height: 100vh; }
.container { max-width: 1400px; margin: 0 auto; padding: 0 20px; }

.breadcrumb { display: flex; flex-wrap: wrap; gap: 6px; font-size: 13px; color: #6b7280; margin-bottom: 16px; }
.breadcrumb a { color: #6b7280; text-decoration: none; }
.breadcrumb a:hover { color: #c4956a; }
.breadcrumb .sep { color: #d1d5db; }
.breadcrumb .current { color: #374151; }

.error-banner { padding: 14px 20px; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 10px; color: #92400e; margin-bottom: 20px; }

.category-header { margin-bottom: 24px; }
.category-header h1 { font-size: 32px; font-weight: 700; color: #1f2937; margin: 0 0 4px; }
.product-count { font-size: 14px; color: #6b7280; }

.main-layout { display: grid; grid-template-columns: 260px 1fr; gap: 32px; align-items: start; }

/* Sidebar */
.sidebar { background: #f8fafc; border-radius: 16px; padding: 20px; position: sticky; top: 20px; }
.sidebar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; }
.sidebar-header h3 { font-size: 16px; font-weight: 700; margin: 0; color: #1f2937; }
.clear-btn { font-size: 12px; color: #dc2626; background: #fee2e2; border: none; padding: 4px 10px; border-radius: 6px; cursor: pointer; }
.clear-btn:hover { background: #fecaca; }

.filter-section { margin-bottom: 24px; }
.filter-section h4 { font-size: 14px; font-weight: 600; color: #374151; margin: 0 0 12px; }

.price-inputs { display: flex; align-items: center; gap: 8px; }
.price-inputs input { width: 70px; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; }
.price-inputs span { color: #9ca3af; font-size: 14px; }
.price-hint { font-size: 12px; color: #9ca3af; margin-top: 8px; }

.filter-list { max-height: 200px; overflow-y: auto; }
.filter-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; margin-bottom: 4px; border-radius: 8px; cursor: pointer; transition: background 0.15s; }
.filter-item:hover { background: #f1f5f9; }
.filter-item.active { background: #fef3c7; }
.filter-item input { accent-color: #c4956a; }
.filter-name { flex: 1; font-size: 14px; color: #374151; }
.filter-count { font-size: 12px; color: #9ca3af; }
.more-items { font-size: 12px; color: #6b7280; padding: 8px 10px; }

.filter-section select { width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; background: white; cursor: pointer; }

/* Content */
.content { min-width: 0; }
.section-title { font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 16px; }

.subcategories { margin-bottom: 32px; }
.subcategories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
.subcat-card { display: flex; flex-direction: column; background: #fff; border-radius: 12px; text-decoration: none; transition: all 0.2s; border: 1px solid #e5e7eb; overflow: hidden; }
.subcat-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.12); transform: translateY(-4px); border-color: #c4956a; }
.subcat-image { aspect-ratio: 1; background: #f9fafb; display: flex; align-items: center; justify-content: center; padding: 16px; }
.subcat-image img { width: 100%; height: 100%; object-fit: contain; }
.subcat-placeholder { font-size: 3rem; opacity: 0.3; }
.subcat-info { padding: 12px 14px; background: #fff; border-top: 1px solid #f1f5f9; }
.subcat-name { display: block; font-size: 13px; font-weight: 600; color: #1f2937; margin-bottom: 4px; line-height: 1.3; }
.subcat-count { font-size: 11px; color: #6b7280; }

.products-header { margin-bottom: 16px; }
.results-count { font-size: 14px; color: #6b7280; }

.products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
.product-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); transition: all 0.2s; }
.product-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.12); transform: translateY(-4px); }
.product-image { display: block; aspect-ratio: 1; background: #f9fafb; padding: 16px; }
.product-image img { width: 100%; height: 100%; object-fit: contain; }
.product-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 3rem; opacity: 0.3; }
.product-content { padding: 16px; }
.product-brand { font-size: 11px; font-weight: 600; color: #c4956a; text-transform: uppercase; letter-spacing: 0.5px; }
.product-title { font-size: 14px; font-weight: 600; margin: 8px 0; line-height: 1.4; }
.product-title a { color: #1f2937; text-decoration: none; }
.product-price-section { margin: 12px 0; }
.price-label { font-size: 12px; color: #6b7280; }
.price-value { font-size: 22px; font-weight: 800; color: #111; margin-left: 4px; }
.product-offers { font-size: 12px; color: #6b7280; margin-bottom: 12px; }
.product-btn { display: block; text-align: center; padding: 12px; background: linear-gradient(135deg, #c4956a, #b8875c); color: white; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 13px; transition: all 0.2s; }
.product-btn:hover { background: linear-gradient(135deg, #b8875c, #a67a50); }

.pagination { display: flex; justify-content: center; gap: 8px; margin-top: 40px; }
.page-btn { width: 44px; height: 44px; border: 1px solid #e5e7eb; border-radius: 10px; background: white; cursor: pointer; font-size: 15px; font-weight: 500; transition: all 0.2s; }
.page-btn:hover { border-color: #c4956a; color: #c4956a; }
.page-btn.active { background: #c4956a; color: white; border-color: #c4956a; }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.empty-state { text-align: center; padding: 80px 20px; }
.empty-icon { font-size: 4rem; margin-bottom: 16px; }
.empty-state h2 { font-size: 22px; margin-bottom: 8px; color: #1f2937; }
.empty-state p { color: #6b7280; margin-bottom: 24px; }
.btn-primary { padding: 12px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; border: none; background: #c4956a; color: white; }
.btn-primary:hover { background: #b8875c; }

@media (max-width: 900px) {
    .main-layout { grid-template-columns: 1fr; }
    .sidebar { position: relative; top: auto; }
}

@media (max-width: 600px) {
    .category-header h1 { font-size: 24px; }
    .subcategories-grid { grid-template-columns: repeat(2, 1fr); }
    .products-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .product-content { padding: 12px; }
    .price-value { font-size: 18px; }
}
</style>
