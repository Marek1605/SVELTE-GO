<script>
    import { formatPrice } from '$lib/api';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';

    export let data;

    $: category = data.category;
    $: ancestors = data.ancestors || [];
    $: children = data.children || [];
    $: products = data.products || [];
    $: attributes = data.attributes || [];
    $: brands = data.brands || [];
    $: priceRange = data.priceRange || { min: 0, max: 1000 };
    $: totalProducts = data.total || 0;
    $: currentPage = data.page || 1;
    $: totalPages = data.total_pages || 1;
    $: errorMessage = data.error || null;

    let minPrice = '';
    let maxPrice = '';
    let selectedBrand = '';
    let selectedFilters = {};
    let sort = 'newest';
    let showAllFilters = false;

    $: {
        const params = $page.url.searchParams;
        minPrice = params.get('min_price') || '';
        maxPrice = params.get('max_price') || '';
        selectedBrand = params.get('brand') || '';
        sort = params.get('sort') || 'newest';
    }

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
        selectedFilters = {};
        sort = 'newest';
        if (category?.slug) {
            goto(`/kategoria/${category.slug}`, { replaceState: true });
        }
    }

    function selectAttribute(name, value) {
        if (selectedFilters[name] === value) {
            delete selectedFilters[name];
            selectedFilters = { ...selectedFilters };
        } else {
            selectedFilters[name] = value;
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

    $: visibleAttributes = showAllFilters ? attributes : attributes.slice(0, 8);
    $: hasMoreFilters = attributes.length > 8;
</script>

<svelte:head>
    <title>{category?.name || 'Kategória'} | MegaPrice.sk</title>
    <meta name="description" content="Porovnajte ceny v kategórii {category?.name}. {totalProducts} produktov.">
</svelte:head>

<div class="mp-category-page">
    <div class="mp-container">
        <!-- Breadcrumb -->
        <nav class="mp-breadcrumb">
            <a href="/">Domov</a>
            {#each ancestors as ancestor}
                <span class="mp-breadcrumb__sep">/</span>
                <a href="/kategoria/{ancestor.slug}">{ancestor.name}</a>
            {/each}
            <span class="mp-breadcrumb__sep">/</span>
            <span>{category?.name}</span>
        </nav>

        {#if errorMessage}
            <div class="mp-error-banner">
                <span>⚠️</span> {errorMessage}
            </div>
        {/if}

        {#if category}
            <div class="mp-category-header">
                <h1>{category.name}</h1>
                <span class="mp-category-header__count">{totalProducts} produktov</span>
            </div>

            {#if children.length > 0}
                <div class="mp-subcategories">
                    <h2 class="mp-subcategories__title">Podkategórie</h2>
                    <div class="mp-subcategories__grid">
                        {#each children as child}
                            <a href="/kategoria/{child.slug}" class="mp-subcategory-card">
                                <span class="mp-subcategory-card__icon">{child.icon || '📦'}</span>
                                <span class="mp-subcategory-card__name">{child.name}</span>
                                <span class="mp-subcategory-card__count">{child.product_count || 0} produktov</span>
                            </a>
                        {/each}
                    </div>
                </div>
            {/if}

            <div class="mp-category-layout">
                <!-- Filters Sidebar -->
                <aside class="mp-filters">
                    <div class="mp-filters__header">
                        <h3 class="mp-filters__title">Filtre</h3>
                        <button class="mp-filters__clear" on:click={clearFilters}>Zrušiť všetky</button>
                    </div>

                    <!-- Price Range -->
                    <div class="mp-filter-group">
                        <h4 class="mp-filter-group__title">💰 Cena</h4>
                        <div class="mp-filter-group__subtitle">{formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}</div>
                        <div class="mp-price-range">
                            <input type="number" placeholder="Od" bind:value={minPrice} on:change={applyFilters}>
                            <span>–</span>
                            <input type="number" placeholder="Do" bind:value={maxPrice} on:change={applyFilters}>
                            <span>€</span>
                        </div>
                    </div>

                    <!-- Brands -->
                    {#if brands.length > 0}
                        <div class="mp-filter-group">
                            <h4 class="mp-filter-group__title">🏷️ Značka</h4>
                            <div class="mp-filter-group__items">
                                {#each brands.slice(0, 15) as brand}
                                    <label class="mp-filter-checkbox">
                                        <input
                                            type="radio"
                                            name="brand"
                                            value={brand.name}
                                            checked={selectedBrand === brand.name}
                                            on:change={() => { selectedBrand = brand.name; applyFilters(); }}
                                        >
                                        <span>{brand.name}</span>
                                        <span class="mp-filter-checkbox__count">({brand.count})</span>
                                    </label>
                                {/each}
                            </div>
                        </div>
                    {/if}

                    <!-- Dynamic Attribute Filters -->
                    {#each visibleAttributes as attr}
                        <div class="mp-filter-group">
                            <h4 class="mp-filter-group__title">{attr.name}</h4>
                            <div class="mp-filter-group__items">
                                {#each attr.values.slice(0, 10) as val}
                                    <label class="mp-filter-checkbox">
                                        <input
                                            type="radio"
                                            name="attr_{attr.name}"
                                            value={val.value}
                                            checked={selectedFilters[attr.name] === val.value}
                                            on:change={() => selectAttribute(attr.name, val.value)}
                                        >
                                        <span class="mp-filter-checkbox__label">{val.value}</span>
                                        <span class="mp-filter-checkbox__count">({val.count})</span>
                                    </label>
                                {/each}
                            </div>
                        </div>
                    {/each}

                    {#if hasMoreFilters}
                        <button class="mp-btn mp-btn--secondary mp-btn--full" on:click={() => showAllFilters = !showAllFilters}>
                            {showAllFilters ? '▲ Skryť filtre' : `▼ Zobraziť všetky filtre (${attributes.length})`}
                        </button>
                    {/if}
                </aside>

                <!-- Products -->
                <div class="mp-category-products">
                    <div class="mp-toolbar">
                        <div class="mp-toolbar__count">
                            Zobrazených {products.length} z {totalProducts}
                        </div>
                        <div class="mp-toolbar__sort">
                            <label for="sort">Zoradiť:</label>
                            <select id="sort" bind:value={sort} on:change={applyFilters}>
                                <option value="newest">Najnovšie</option>
                                <option value="price_asc">Najlacnejšie</option>
                                <option value="price_desc">Najdrahšie</option>
                                <option value="name_asc">Názov A-Z</option>
                                <option value="name_desc">Názov Z-A</option>
                            </select>
                        </div>
                    </div>

                    {#if products.length > 0}
                        <div class="mp-products-grid">
                            {#each products as product}
                                <article class="mp-product-card">
                                    <a href="/produkt/{product.slug}" class="mp-product-card__image">
                                        {#if product.image_url}
                                            <img src={product.image_url} alt={product.title} loading="lazy">
                                        {:else}
                                            <div class="mp-product-card__placeholder">📷</div>
                                        {/if}
                                    </a>
                                    <div class="mp-product-card__content">
                                        {#if product.brand}
                                            <span class="mp-product-card__brand">{product.brand}</span>
                                        {/if}
                                        <h3 class="mp-product-card__title">
                                            <a href="/produkt/{product.slug}">{product.title}</a>
                                        </h3>
                                        <div class="mp-product-card__price-section">
                                            <span class="mp-product-card__price-label">od</span>
                                            <span class="mp-product-card__price">{formatPrice(product.price_min || product.price)}</span>
                                        </div>
                                        {#if product.offer_count > 1}
                                            <div class="mp-product-card__offers">
                                                📊 {product.offer_count} ponúk
                                            </div>
                                        {/if}
                                        <a href="/produkt/{product.slug}" class="mp-product-card__btn">
                                            Porovnať ceny
                                        </a>
                                    </div>
                                </article>
                            {/each}
                        </div>

                        {#if totalPages > 1}
                            <nav class="mp-pagination">
                                <button class="mp-pagination__btn" disabled={currentPage <= 1} on:click={() => changePage(currentPage - 1)}>‹</button>
                                {#each Array(Math.min(totalPages, 7)) as _, i}
                                    {@const pageNum = currentPage <= 4 ? i + 1 : currentPage + i - 3}
                                    {#if pageNum > 0 && pageNum <= totalPages}
                                        <button class="mp-pagination__btn" class:active={pageNum === currentPage} on:click={() => changePage(pageNum)}>{pageNum}</button>
                                    {/if}
                                {/each}
                                <button class="mp-pagination__btn" disabled={currentPage >= totalPages} on:click={() => changePage(currentPage + 1)}>›</button>
                            </nav>
                        {/if}
                    {:else}
                        <div class="mp-empty">
                            <div class="mp-empty__icon">🔍</div>
                            <h2 class="mp-empty__title">Žiadne produkty</h2>
                            <p class="mp-empty__text">V tejto kategórii sme nenašli žiadne produkty.</p>
                            <button class="mp-btn mp-btn--primary" on:click={clearFilters}>Zrušiť filtre</button>
                        </div>
                    {/if}
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
.mp-category-page { padding: 16px 0 60px; background: #fff; }
.mp-container { max-width: 1280px; margin: 0 auto; padding: 0 20px; }

.mp-breadcrumb { display: flex; flex-wrap: wrap; gap: 6px; font-size: 12px; color: #6b7280; margin-bottom: 16px; }
.mp-breadcrumb a { color: #6b7280; text-decoration: none; }
.mp-breadcrumb a:hover { color: #ff6b35; }
.mp-breadcrumb__sep { color: #d1d5db; }

.mp-category-header { margin-bottom: 24px; }
.mp-category-header h1 { font-size: 28px; font-weight: 700; color: #1f2937; margin: 0 0 8px; }
.mp-category-header__count { font-size: 14px; color: #6b7280; }

.mp-subcategories { margin-bottom: 32px; }
.mp-subcategories__title { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
.mp-subcategories__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
.mp-subcategory-card { display: flex; flex-direction: column; align-items: center; padding: 16px; background: #f9fafb; border-radius: 12px; text-decoration: none; transition: all 0.2s; }
.mp-subcategory-card:hover { background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-2px); }
.mp-subcategory-card__icon { font-size: 24px; margin-bottom: 8px; }
.mp-subcategory-card__name { font-size: 14px; font-weight: 600; color: #1f2937; text-align: center; }
.mp-subcategory-card__count { font-size: 12px; color: #6b7280; }

.mp-category-layout { display: grid; grid-template-columns: 260px 1fr; gap: 24px; }

/* Filters */
.mp-filters { background: #f9fafb; border-radius: 16px; padding: 20px; height: fit-content; position: sticky; top: 20px; }
.mp-filters__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.mp-filters__title { font-size: 16px; font-weight: 700; margin: 0; }
.mp-filters__clear { font-size: 12px; color: #ff6b35; background: none; border: none; cursor: pointer; }

.mp-filter-group { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb; }
.mp-filter-group__title { font-size: 14px; font-weight: 600; margin-bottom: 12px; }
.mp-filter-group__subtitle { font-size: 12px; color: #6b7280; margin-bottom: 8px; }
.mp-filter-group__items { max-height: 200px; overflow-y: auto; }

.mp-price-range { display: flex; align-items: center; gap: 8px; }
.mp-price-range input { width: 70px; padding: 8px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; }

.mp-filter-checkbox { display: flex; align-items: center; gap: 8px; padding: 6px 0; cursor: pointer; font-size: 13px; }
.mp-filter-checkbox input { accent-color: #ff6b35; }
.mp-filter-checkbox__label { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mp-filter-checkbox__count { color: #9ca3af; font-size: 12px; }

.mp-btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.mp-btn--primary { background: #ff6b35; color: white; border: none; }
.mp-btn--secondary { background: white; color: #1f2937; border: 1px solid #e5e7eb; }
.mp-btn--full { width: 100%; }

/* Toolbar */
.mp-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.mp-toolbar__count { font-size: 14px; color: #6b7280; }
.mp-toolbar__sort { display: flex; align-items: center; gap: 8px; }
.mp-toolbar__sort label { font-size: 14px; color: #6b7280; }
.mp-toolbar__sort select { padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; }

/* Products Grid */
.mp-products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }

.mp-product-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); transition: all 0.2s; }
.mp-product-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.12); transform: translateY(-4px); }
.mp-product-card__image { display: block; aspect-ratio: 1; background: #f9fafb; padding: 16px; }
.mp-product-card__image img { width: 100%; height: 100%; object-fit: contain; }
.mp-product-card__placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 3rem; opacity: 0.3; }
.mp-product-card__content { padding: 16px; }
.mp-product-card__brand { font-size: 11px; font-weight: 600; color: #ff6b35; text-transform: uppercase; letter-spacing: 0.5px; }
.mp-product-card__title { font-size: 14px; font-weight: 600; margin: 8px 0; line-height: 1.4; }
.mp-product-card__title a { color: #1f2937; text-decoration: none; }
.mp-product-card__price-section { margin: 12px 0; }
.mp-product-card__price-label { font-size: 12px; color: #6b7280; }
.mp-product-card__price { font-size: 20px; font-weight: 800; color: #111; margin-left: 4px; }
.mp-product-card__offers { font-size: 12px; color: #6b7280; margin-bottom: 12px; }
.mp-product-card__btn { display: block; text-align: center; padding: 10px; background: linear-gradient(135deg, #ff6b35, #e55a2b); color: white; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 13px; }

/* Pagination */
.mp-pagination { display: flex; justify-content: center; gap: 8px; margin-top: 32px; }
.mp-pagination__btn { width: 40px; height: 40px; border: 1px solid #e5e7eb; border-radius: 8px; background: white; cursor: pointer; font-size: 14px; transition: all 0.2s; }
.mp-pagination__btn:hover { border-color: #ff6b35; color: #ff6b35; }
.mp-pagination__btn.active { background: #ff6b35; color: white; border-color: #ff6b35; }
.mp-pagination__btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Empty */
.mp-empty { text-align: center; padding: 60px 20px; }
.mp-empty__icon { font-size: 4rem; margin-bottom: 16px; }
.mp-empty__title { font-size: 20px; font-weight: 600; margin-bottom: 8px; }
.mp-empty__text { color: #6b7280; margin-bottom: 20px; }

/* Error Banner */
.mp-error-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 20px;
    background: #fef3c7;
    border: 1px solid #f59e0b;
    border-radius: 10px;
    color: #92400e;
    font-size: 14px;
    margin-bottom: 20px;
}

/* Responsive */
@media (max-width: 900px) {
    .mp-category-layout { grid-template-columns: 1fr; }
    .mp-filters { position: relative; top: auto; }
}
@media (max-width: 600px) {
    .mp-products-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .mp-product-card__content { padding: 12px; }
}
</style>
