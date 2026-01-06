<script lang="ts">
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

        // Filter states
        let minPrice = '';
        let maxPrice = '';
        let selectedBrand = '';
        let selectedFilters: Record<string, string> = {};
        let sort = 'newest';
        let showAllFilters = false;

        // Initialize from URL
        $: {
                const params = $page.url.searchParams;
                minPrice = params.get('min_price') || '';
                maxPrice = params.get('max_price') || '';
                selectedBrand = params.get('brand') || '';
                sort = params.get('sort') || 'newest';
                
                // Load attribute filters from URL
                attributes.forEach(attr => {
                        const key = 'attr_' + encodeURIComponent(attr.name);
                        const value = params.get(key);
                        if (value) {
                                selectedFilters[attr.name] = value;
                        }
                });
        }

        function applyFilters() {
                const params = new URLSearchParams();
                if (minPrice) params.set('min_price', minPrice);
                if (maxPrice) params.set('max_price', maxPrice);
                if (selectedBrand) params.set('brand', selectedBrand);
                if (sort !== 'newest') params.set('sort', sort);
                
                // Add attribute filters
                Object.entries(selectedFilters).forEach(([name, value]) => {
                        if (value) {
                                params.set('attr_' + encodeURIComponent(name), value);
                        }
                });

                const queryString = params.toString();
                goto(`/kategoria/${category.slug}${queryString ? '?' + queryString : ''}`, { replaceState: true });
        }

        function clearFilters() {
                minPrice = '';
                maxPrice = '';
                selectedBrand = '';
                selectedFilters = {};
                sort = 'newest';
                goto(`/kategoria/${category.slug}`, { replaceState: true });
        }

        function selectAttribute(name: string, value: string) {
                if (selectedFilters[name] === value) {
                        delete selectedFilters[name];
                        selectedFilters = { ...selectedFilters };
                } else {
                        selectedFilters[name] = value;
                }
                applyFilters();
        }

        function changePage(newPage: number) {
                if (newPage < 1 || newPage > totalPages) return;
                const params = new URLSearchParams($page.url.searchParams);
                params.set('page', newPage.toString());
                goto(`/kategoria/${category.slug}?${params.toString()}`);
        }

        // Show only top 8 attributes, rest on click
        $: visibleAttributes = showAllFilters ? attributes : attributes.slice(0, 8);
        $: hasMoreFilters = attributes.length > 8;
</script>

<svelte:head>
        <title>{category?.name || 'Kategória'} | MegaPrice.sk</title>
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
                                                                <span class="mp-subcategory-card__count">{child.product_count} produktov</span>
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
                                                        <div class="mp-filter-group__items mp-filter-group__items--scrollable">
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
                                                        <div class="mp-filter-group__items mp-filter-group__items--scrollable">
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
                                                                                        <span class="mp-product-card__price">{formatPrice(product.price_min)}</span>
                                                                                </div>
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
        .mp-filters__header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: var(--mp-space-4);
        }
        .mp-filters__clear {
                font-size: var(--mp-font-size-xs);
                color: var(--mp-primary);
                background: none;
                border: none;
                cursor: pointer;
        }
        .mp-filter-group__subtitle {
                font-size: var(--mp-font-size-xs);
                color: var(--mp-text-light);
                margin-bottom: var(--mp-space-2);
        }
        .mp-filter-group__items--scrollable {
                max-height: 200px;
                overflow-y: auto;
        }
        .mp-filter-checkbox__label {
                flex: 1;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 150px;
        }
        .mp-btn--full {
                width: 100%;
                justify-content: center;
        }
        .mp-subcategories__grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: var(--mp-space-3);
        }
        .mp-subcategory-card {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: var(--mp-space-3);
                background: white;
                border-radius: var(--mp-radius-md);
                box-shadow: var(--mp-shadow-sm);
                transition: all 0.2s;
                text-align: center;
                text-decoration: none;
        }
        .mp-subcategory-card:hover {
                box-shadow: var(--mp-shadow-md);
                transform: translateY(-2px);
        }
        .mp-subcategory-card__icon { font-size: 1.5rem; margin-bottom: var(--mp-space-1); }
        .mp-subcategory-card__name { font-weight: 600; color: var(--mp-text-primary); font-size: var(--mp-font-size-sm); }
        .mp-subcategory-card__count { font-size: var(--mp-font-size-xs); color: var(--mp-text-light); }
        .mp-product-card__placeholder {
                font-size: 3rem;
                opacity: 0.3;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
        }
</style>
