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
    let brandSearch = '';
    let mobileFilterOpen = false;

    // Collapsible sections state
    let openSections = { price: true, brand: true, sort: true };

    function toggleSection(key) {
        openSections[key] = !openSections[key];
        openSections = openSections;
    }

    $: {
        const params = $page.url.searchParams;
        minPrice = params.get('min_price') || '';
        maxPrice = params.get('max_price') || '';
        selectedBrand = params.get('brand') || '';
        sort = params.get('sort') || 'newest';
        selectedAttributes = {};
        for (const [key, value] of params.entries()) {
            if (key.startsWith('attr_')) {
                selectedAttributes[key.replace('attr_', '')] = value;
            }
        }
    }

    $: hasActiveFilters = minPrice || maxPrice || selectedBrand || Object.keys(selectedAttributes).length > 0;
    $: activeFilterCount = (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + (selectedBrand ? 1 : 0) + Object.keys(selectedAttributes).length;

    // Brand search filter
    $: filteredBrands = brands.filter(b =>
        !brandSearch || b.name.toLowerCase().includes(brandSearch.toLowerCase())
    );

    function applyFilters() {
        const params = new URLSearchParams();
        if (minPrice) params.set('min_price', minPrice);
        if (maxPrice) params.set('max_price', maxPrice);
        if (selectedBrand) params.set('brand', selectedBrand);
        if (sort !== 'newest') params.set('sort', sort);
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
        brandSearch = '';
        if (category?.slug) goto(`/kategoria/${category.slug}`, { replaceState: true });
    }

    function selectBrand(brand) {
        selectedBrand = selectedBrand === brand ? '' : brand;
        applyFilters();
    }

    function clearBrand() { selectedBrand = ''; applyFilters(); }
    function clearPrice() { minPrice = ''; maxPrice = ''; applyFilters(); }
    function clearAttribute(name) { delete selectedAttributes[name]; selectedAttributes = { ...selectedAttributes }; applyFilters(); }

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

    function openMobileFilter() { mobileFilterOpen = true; document.body.style.overflow = 'hidden'; }
    function closeMobileFilter() { mobileFilterOpen = false; document.body.style.overflow = ''; }
</script>

<svelte:head>
    <title>{category?.name || 'Kategória'} | MegaPrice.sk</title>
    <meta name="description" content="Porovnajte ceny v kategórii {category?.name}. {totalProducts} produktov.">
</svelte:head>

<div class="cat-page">
    <div class="cat-container">
        <!-- Breadcrumb -->
        <nav class="bc">
            <a href="/" class="bc__link">Domov</a>
            {#each ancestors as ancestor}
                <svg class="bc__sep" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                <a href="/kategoria/{ancestor.slug}" class="bc__link">{ancestor.name}</a>
            {/each}
            <svg class="bc__sep" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            <span class="bc__current">{category?.name}</span>
        </nav>

        {#if errorMessage}
            <div class="cat-error">{errorMessage}</div>
        {/if}

        {#if category}
            <div class="cat-head">
                <div>
                    <h1 class="cat-title">{category.name}</h1>
                    <span class="cat-count">{totalProducts} produktov</span>
                </div>
                <!-- Sort (desktop) -->
                <div class="cat-sort">
                    <select bind:value={sort} on:change={applyFilters}>
                        <option value="newest">Najnovšie</option>
                        <option value="price_asc">Najlacnejšie</option>
                        <option value="price_desc">Najdrahšie</option>
                        <option value="name_asc">A-Z</option>
                        <option value="name_desc">Z-A</option>
                    </select>
                </div>
            </div>

            <!-- Active filter chips -->
            {#if hasActiveFilters}
                <div class="chips">
                    {#if selectedBrand}
                        <button class="chip" on:click={clearBrand}>
                            <span>Značka: {selectedBrand}</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                    {/if}
                    {#if minPrice || maxPrice}
                        <button class="chip" on:click={clearPrice}>
                            <span>Cena: {minPrice || '0'} – {maxPrice || '∞'} €</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                    {/if}
                    {#each Object.entries(selectedAttributes) as [name, value]}
                        <button class="chip" on:click={() => clearAttribute(name)}>
                            <span>{name}: {value}</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                    {/each}
                    <button class="chip chip--clear" on:click={clearFilters}>Zrušiť všetky</button>
                </div>
            {/if}

            <div class="cat-layout">
                <!-- LEFT SIDEBAR -->
                <aside class="fl">
                    <div class="fl__head">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
                        <span>Filtre</span>
                        {#if hasActiveFilters}
                            <button class="fl__clear" on:click={clearFilters}>Zrušiť</button>
                        {/if}
                    </div>

                    <!-- Price -->
                    <div class="fl__sec">
                        <button class="fl__sec-head" on:click={() => toggleSection('price')}>
                            <span>Cena</span>
                            <svg class="fl__chev" class:is-open={openSections.price} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                        </button>
                        {#if openSections.price}
                            <div class="fl__body">
                                <div class="fl__price">
                                    <div class="fl__price-field">
                                        <input type="number" placeholder="Od" bind:value={minPrice} on:change={applyFilters}>
                                        <span class="fl__price-unit">€</span>
                                    </div>
                                    <span class="fl__price-sep">–</span>
                                    <div class="fl__price-field">
                                        <input type="number" placeholder="Do" bind:value={maxPrice} on:change={applyFilters}>
                                        <span class="fl__price-unit">€</span>
                                    </div>
                                </div>
                                {#if priceRange.max > 0}
                                    <div class="fl__hint">{formatPrice(priceRange.min)} – {formatPrice(priceRange.max)}</div>
                                {/if}
                            </div>
                        {/if}
                    </div>

                    <!-- Brand -->
                    {#if brands.length > 0}
                        <div class="fl__sec">
                            <button class="fl__sec-head" on:click={() => toggleSection('brand')}>
                                <span>Značka</span>
                                <svg class="fl__chev" class:is-open={openSections.brand} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                            </button>
                            {#if openSections.brand}
                                <div class="fl__body">
                                    {#if brands.length > 8}
                                        <div class="fl__search">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                            <input type="text" placeholder="Hľadať značku..." bind:value={brandSearch}>
                                        </div>
                                    {/if}
                                    <div class="fl__opts">
                                        {#each filteredBrands.slice(0, 20) as brand}
                                            <label class="fl__opt" class:is-active={selectedBrand === brand.name}>
                                                <span class="fl__check" class:is-checked={selectedBrand === brand.name}>
                                                    {#if selectedBrand === brand.name}
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                                                    {/if}
                                                </span>
                                                <input type="radio" name="brand" class="sr-only" checked={selectedBrand === brand.name} on:change={() => selectBrand(brand.name)}>
                                                <span class="fl__opt-name">{brand.name}</span>
                                                <span class="fl__opt-count">{brand.count}</span>
                                            </label>
                                        {/each}
                                        {#if filteredBrands.length > 20}
                                            <div class="fl__more">+{filteredBrands.length - 20} ďalších</div>
                                        {/if}
                                        {#if brandSearch && filteredBrands.length === 0}
                                            <div class="fl__empty">Žiadne výsledky</div>
                                        {/if}
                                    </div>
                                </div>
                            {/if}
                        </div>
                    {/if}

                    <!-- Dynamic attributes -->
                    {#each attributes as attr, i}
                        {#if attr.values && attr.values.length > 0}
                            <div class="fl__sec">
                                <button class="fl__sec-head" on:click={() => { openSections['attr_'+i] = !openSections['attr_'+i]; openSections = openSections; }}>
                                    <span>{attr.name}</span>
                                    <svg class="fl__chev" class:is-open={openSections['attr_'+i]} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                                </button>
                                {#if openSections['attr_'+i] !== false}
                                    <div class="fl__body">
                                        <div class="fl__opts">
                                            {#each attr.values as val}
                                                <label class="fl__opt" class:is-active={selectedAttributes[attr.name] === val.value}>
                                                    <span class="fl__check" class:is-checked={selectedAttributes[attr.name] === val.value}>
                                                        {#if selectedAttributes[attr.name] === val.value}
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                                                        {/if}
                                                    </span>
                                                    <input type="radio" name="attr_{attr.name}" class="sr-only" checked={selectedAttributes[attr.name] === val.value} on:change={() => selectAttribute(attr.name, val.value)}>
                                                    <span class="fl__opt-name">{val.value}</span>
                                                    <span class="fl__opt-count">{val.count}</span>
                                                </label>
                                            {/each}
                                        </div>
                                    </div>
                                {/if}
                            </div>
                        {/if}
                    {/each}
                </aside>

                <!-- RIGHT CONTENT -->
                <div class="cat-content">
                    <!-- Mobile filter bar -->
                    <div class="mob-bar">
                        <button class="mob-bar__filter" on:click={openMobileFilter}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
                            Filtre
                            {#if activeFilterCount > 0}<span class="mob-bar__badge">{activeFilterCount}</span>{/if}
                        </button>
                        <select class="mob-bar__sort" bind:value={sort} on:change={applyFilters}>
                            <option value="newest">Najnovšie</option>
                            <option value="price_asc">Najlacnejšie</option>
                            <option value="price_desc">Najdrahšie</option>
                            <option value="name_asc">A-Z</option>
                            <option value="name_desc">Z-A</option>
                        </select>
                    </div>

                    <!-- Subcategories -->
                    {#if children.length > 0}
                        <div class="subcats">
                            {#each children as child}
                                <a href="/kategoria/{child.slug}" class="subcat">
                                    <div class="subcat__img">
                                        {#if child.image_url}
                                            <img src={child.image_url} alt={child.name} loading="lazy">
                                        {:else}
                                            <span>{child.name?.charAt(0)?.toUpperCase() || '?'}</span>
                                        {/if}
                                    </div>
                                    <span class="subcat__name">{child.name}</span>
                                </a>
                            {/each}
                        </div>
                    {/if}

                    <!-- Products -->
                    <div class="prods">
                        <div class="prods__info">
                            <span>Zobrazených {products.length} z {totalProducts}</span>
                        </div>

                        {#if products.length > 0}
                            <div class="prods__grid">
                                {#each products as product}
                                    <article class="pc">
                                        <a href="/produkt/{product.slug}" class="pc__img">
                                            {#if product.image_url}
                                                <img src={product.image_url} alt={product.title} loading="lazy">
                                            {:else}
                                                <div class="pc__placeholder">
                                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                                </div>
                                            {/if}
                                        </a>
                                        <div class="pc__body">
                                            {#if product.brand}
                                                <span class="pc__brand">{product.brand}</span>
                                            {/if}
                                            <h3 class="pc__title"><a href="/produkt/{product.slug}">{product.title}</a></h3>
                                            <div class="pc__price">
                                                <span class="pc__price-from">od</span>
                                                <span class="pc__price-val">{formatPrice(product.price_min || product.price)}</span>
                                            </div>
                                            {#if product.offer_count > 1}
                                                <div class="pc__offers">{product.offer_count} ponúk</div>
                                            {/if}
                                            <a href="/produkt/{product.slug}" class="pc__btn">Porovnať ceny</a>
                                        </div>
                                    </article>
                                {/each}
                            </div>

                            {#if totalPages > 1}
                                <nav class="pag">
                                    <button class="pag__btn" disabled={currentPage <= 1} on:click={() => changePage(currentPage - 1)}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                                    </button>
                                    {#each Array(Math.min(totalPages, 7)) as _, i}
                                        {@const pageNum = currentPage <= 4 ? i + 1 : currentPage + i - 3}
                                        {#if pageNum > 0 && pageNum <= totalPages}
                                            <button class="pag__btn" class:is-active={pageNum === currentPage} on:click={() => changePage(pageNum)}>{pageNum}</button>
                                        {/if}
                                    {/each}
                                    <button class="pag__btn" disabled={currentPage >= totalPages} on:click={() => changePage(currentPage + 1)}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                                    </button>
                                </nav>
                            {/if}
                        {:else}
                            <div class="empty">
                                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                <h2>Žiadne produkty</h2>
                                <p>V tejto kategórii sme nenašli žiadne produkty.</p>
                                {#if hasActiveFilters}
                                    <button class="empty__btn" on:click={clearFilters}>Zrušiť filtre</button>
                                {/if}
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>

<!-- Mobile filter drawer -->
{#if mobileFilterOpen}
    <div class="mob-overlay" on:click={closeMobileFilter}></div>
    <div class="mob-drawer">
        <div class="mob-drawer__head">
            <h3>Filtre</h3>
            {#if hasActiveFilters}
                <button class="mob-drawer__clear" on:click={clearFilters}>Zrušiť všetky</button>
            {/if}
            <button class="mob-drawer__close" on:click={closeMobileFilter}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>
        <div class="mob-drawer__body">
            <!-- Price -->
            <div class="fl__sec">
                <div class="fl__sec-head"><span>Cena</span></div>
                <div class="fl__body">
                    <div class="fl__price">
                        <div class="fl__price-field">
                            <input type="number" placeholder="Od" bind:value={minPrice}>
                            <span class="fl__price-unit">€</span>
                        </div>
                        <span class="fl__price-sep">–</span>
                        <div class="fl__price-field">
                            <input type="number" placeholder="Do" bind:value={maxPrice}>
                            <span class="fl__price-unit">€</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Brand -->
            {#if brands.length > 0}
                <div class="fl__sec">
                    <div class="fl__sec-head"><span>Značka</span></div>
                    <div class="fl__body">
                        <div class="fl__opts">
                            {#each brands.slice(0, 15) as brand}
                                <label class="fl__opt" class:is-active={selectedBrand === brand.name}>
                                    <span class="fl__check" class:is-checked={selectedBrand === brand.name}>
                                        {#if selectedBrand === brand.name}
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                                        {/if}
                                    </span>
                                    <input type="radio" name="m_brand" class="sr-only" on:change={() => selectBrand(brand.name)}>
                                    <span class="fl__opt-name">{brand.name}</span>
                                    <span class="fl__opt-count">{brand.count}</span>
                                </label>
                            {/each}
                        </div>
                    </div>
                </div>
            {/if}
            <!-- Attributes -->
            {#each attributes as attr}
                {#if attr.values && attr.values.length > 0}
                    <div class="fl__sec">
                        <div class="fl__sec-head"><span>{attr.name}</span></div>
                        <div class="fl__body">
                            <div class="fl__opts">
                                {#each attr.values as val}
                                    <label class="fl__opt" class:is-active={selectedAttributes[attr.name] === val.value}>
                                        <span class="fl__check" class:is-checked={selectedAttributes[attr.name] === val.value}>
                                            {#if selectedAttributes[attr.name] === val.value}
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                                            {/if}
                                        </span>
                                        <input type="radio" name="m_attr_{attr.name}" class="sr-only" on:change={() => selectAttribute(attr.name, val.value)}>
                                        <span class="fl__opt-name">{val.value}</span>
                                        <span class="fl__opt-count">{val.count}</span>
                                    </label>
                                {/each}
                            </div>
                        </div>
                    </div>
                {/if}
            {/each}
        </div>
        <div class="mob-drawer__foot">
            <button class="mob-drawer__apply" on:click={() => { applyFilters(); closeMobileFilter(); }}>
                Zobraziť {totalProducts} produktov
            </button>
        </div>
    </div>
{/if}

<style>
/* === BASE === */
.cat-page { padding: 12px 0 60px; background: #f8f9fb; min-height: 100vh; }
.cat-container { max-width: 1400px; margin: 0 auto; padding: 0 12px; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; }

/* Breadcrumb */
.bc { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; font-size: 13px; color: #6b7280; margin-bottom: 12px; padding: 8px 0; }
.bc__link { color: #6b7280; transition: color 0.15s; }
.bc__link:hover { color: #c4956a; }
.bc__sep { color: #d1d5db; flex-shrink: 0; }
.bc__current { color: #1f2937; font-weight: 500; }

.cat-error { padding: 12px 16px; background: #fef3c7; border: 1px solid #fbbf24; border-radius: 10px; color: #92400e; font-size: 14px; margin-bottom: 16px; }

/* Category header */
.cat-head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 16px; gap: 16px; }
.cat-title { font-size: 28px; font-weight: 800; color: #111; margin: 0; line-height: 1.2; }
.cat-count { font-size: 13px; color: #6b7280; }
.cat-sort { flex-shrink: 0; }
.cat-sort select { padding: 8px 32px 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; background: #fff; color: #374151; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; }

/* Active filter chips */
.chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
.chip { display: flex; align-items: center; gap: 6px; padding: 5px 10px; background: #fef7f0; border: 1px solid #e8c9a8; border-radius: 100px; font-size: 12px; font-weight: 500; color: #92620e; cursor: pointer; transition: all 0.15s; }
.chip:hover { background: #fde4c8; border-color: #c4956a; }
.chip--clear { background: none; border: 1px dashed #d1d5db; color: #6b7280; }
.chip--clear:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }

/* Layout */
.cat-layout { display: grid; grid-template-columns: 220px 1fr; gap: 16px; align-items: start; }

/* === FILTER SIDEBAR === */
.fl { position: sticky; top: 40px; max-height: calc(100vh - 50px); overflow-y: auto; background: #fff; border-radius: 14px; border: 1px solid #eef0f4; scrollbar-width: thin; scrollbar-color: #d1d5db transparent; }
.fl::-webkit-scrollbar { width: 4px; }
.fl::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
.fl__head { display: flex; align-items: center; gap: 8px; padding: 14px 16px; border-bottom: 1px solid #eef0f4; font-size: 14px; font-weight: 700; color: #1f2937; }
.fl__head svg { color: #c4956a; }
.fl__clear { margin-left: auto; font-size: 11px; color: #ef4444; background: #fef2f2; border: none; padding: 3px 8px; border-radius: 4px; font-weight: 600; cursor: pointer; }
.fl__clear:hover { background: #fee2e2; }

/* Filter section */
.fl__sec { border-bottom: 1px solid #f3f4f6; }
.fl__sec:last-child { border-bottom: none; }
.fl__sec-head { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 12px 16px; background: none; border: none; font-size: 13px; font-weight: 600; color: #374151; cursor: pointer; text-align: left; }
.fl__sec-head:hover { background: #fafbfc; }
.fl__chev { transition: transform 0.2s; color: #9ca3af; }
.fl__chev.is-open { transform: rotate(180deg); }
.fl__body { padding: 0 12px 12px; }

/* Price filter */
.fl__price { display: flex; align-items: center; gap: 6px; }
.fl__price-field { position: relative; flex: 1; }
.fl__price-field input { width: 100%; padding: 8px 28px 8px 10px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; outline: none; transition: border-color 0.2s; }
.fl__price-field input:focus { border-color: #c4956a; }
.fl__price-unit { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); font-size: 12px; color: #9ca3af; pointer-events: none; }
.fl__price-sep { color: #d1d5db; font-size: 13px; }
.fl__hint { font-size: 11px; color: #9ca3af; margin-top: 6px; }

/* Brand search */
.fl__search { display: flex; align-items: center; gap: 6px; padding: 6px 10px; margin-bottom: 6px; background: #f9fafb; border: 1px solid #eef0f4; border-radius: 8px; }
.fl__search svg { color: #9ca3af; flex-shrink: 0; }
.fl__search input { flex: 1; border: none; background: none; font-size: 12px; outline: none; color: #374151; }
.fl__search input::placeholder { color: #c0c4cc; }

/* Options list */
.fl__opts { max-height: 220px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #e5e7eb transparent; }
.fl__opts::-webkit-scrollbar { width: 3px; }
.fl__opts::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 3px; }
.fl__opt { display: flex; align-items: center; gap: 8px; padding: 6px 4px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
.fl__opt:hover { background: #f8f9fb; }
.fl__opt.is-active { background: #fef7f0; }
.fl__check { width: 18px; height: 18px; border: 1.5px solid #d1d5db; border-radius: 4px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s; background: #fff; }
.fl__check.is-checked { background: #c4956a; border-color: #c4956a; color: #fff; }
.fl__opt-name { flex: 1; font-size: 13px; color: #374151; line-height: 1.3; }
.fl__opt-count { font-size: 11px; color: #adb5bd; min-width: 20px; text-align: right; }
.fl__more { font-size: 11px; color: #6b7280; padding: 6px 4px; }
.fl__empty { font-size: 12px; color: #9ca3af; padding: 8px 4px; text-align: center; }

/* === CONTENT === */
.cat-content { min-width: 0; }

/* Mobile filter bar - hidden on desktop */
.mob-bar { display: none; }

/* Subcategories */
.subcats { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 6px; margin-bottom: 20px; }
.subcat { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: #fff; border: 1px solid #eef0f4; border-radius: 8px; transition: all 0.15s; }
.subcat:hover { border-color: #c4956a; box-shadow: 0 2px 8px rgba(196,149,106,0.1); }
.subcat__img { width: 28px; height: 28px; background: #f8f9fb; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
.subcat__img img { width: 100%; height: 100%; object-fit: contain; padding: 2px; }
.subcat__img span { font-size: 12px; color: #adb5bd; font-weight: 600; }
.subcat__name { font-size: 12px; font-weight: 500; color: #374151; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.subcat:hover .subcat__name { color: #c4956a; }

/* Products info */
.prods__info { font-size: 13px; color: #6b7280; margin-bottom: 12px; }

/* Product grid */
.prods__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 12px; }

/* Product card */
.pc { background: #fff; border-radius: 12px; border: 1px solid #eef0f4; overflow: hidden; transition: all 0.2s; display: flex; flex-direction: column; }
.pc:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); border-color: #d5dae2; transform: translateY(-2px); }
.pc__img { display: block; aspect-ratio: 1; background: #fafbfc; padding: 12px; }
.pc__img img { width: 100%; height: 100%; object-fit: contain; }
.pc__placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.pc__body { padding: 12px 14px 14px; display: flex; flex-direction: column; flex: 1; }
.pc__brand { font-size: 10px; font-weight: 700; color: #c4956a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
.pc__title { font-size: 13px; font-weight: 600; margin: 0 0 8px; line-height: 1.35; flex: 1; }
.pc__title a { color: #1f2937; }
.pc__title a:hover { color: #c4956a; }
.pc__price { margin-bottom: 4px; }
.pc__price-from { font-size: 11px; color: #6b7280; }
.pc__price-val { font-size: 20px; font-weight: 800; color: #111; margin-left: 3px; }
.pc__offers { font-size: 11px; color: #6b7280; margin-bottom: 8px; }
.pc__btn { display: block; text-align: center; padding: 9px; background: linear-gradient(135deg, #c4956a, #b8875c); color: #fff; border-radius: 8px; font-weight: 600; font-size: 12px; transition: all 0.15s; margin-top: auto; }
.pc__btn:hover { background: linear-gradient(135deg, #b8875c, #a67a50); }

/* Pagination */
.pag { display: flex; justify-content: center; gap: 6px; margin-top: 32px; }
.pag__btn { width: 40px; height: 40px; border: 1px solid #e5e7eb; border-radius: 10px; background: #fff; cursor: pointer; font-size: 14px; font-weight: 500; display: flex; align-items: center; justify-content: center; transition: all 0.15s; color: #374151; }
.pag__btn:hover { border-color: #c4956a; color: #c4956a; }
.pag__btn.is-active { background: #c4956a; color: #fff; border-color: #c4956a; }
.pag__btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* Empty state */
.empty { text-align: center; padding: 60px 20px; }
.empty svg { margin-bottom: 16px; }
.empty h2 { font-size: 20px; margin: 0 0 8px; color: #1f2937; }
.empty p { color: #6b7280; margin: 0 0 20px; font-size: 14px; }
.empty__btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; background: #c4956a; color: #fff; font-size: 13px; }

/* === MOBILE DRAWER === */
.mob-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 2000; animation: fadeIn 0.2s; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.mob-drawer { position: fixed; bottom: 0; left: 0; right: 0; max-height: 85vh; background: #fff; border-radius: 20px 20px 0 0; z-index: 2001; display: flex; flex-direction: column; animation: slideUp 0.25s ease; }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.mob-drawer__head { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-bottom: 1px solid #f3f4f6; }
.mob-drawer__head h3 { font-size: 18px; font-weight: 700; margin: 0; flex: 1; }
.mob-drawer__clear { font-size: 12px; color: #ef4444; background: none; border: none; font-weight: 600; }
.mob-drawer__close { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: #f3f4f6; border: none; border-radius: 50%; color: #6b7280; }
.mob-drawer__body { flex: 1; overflow-y: auto; padding: 0 8px; }
.mob-drawer__foot { padding: 12px 16px; border-top: 1px solid #f3f4f6; }
.mob-drawer__apply { width: 100%; padding: 14px; background: #c4956a; color: #fff; border: none; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; }

/* === RESPONSIVE === */
@media (max-width: 900px) {
    .cat-layout { grid-template-columns: 1fr; gap: 0; }
    .fl { display: none; }
    .cat-sort { display: none; }
    .mob-bar { display: flex; gap: 8px; margin-bottom: 12px; }
    .mob-bar__filter { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-weight: 600; color: #374151; cursor: pointer; }
    .mob-bar__badge { background: #c4956a; color: #fff; font-size: 10px; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .mob-bar__sort { flex: 1; padding: 8px 10px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; background: #fff; }
}
@media (max-width: 600px) {
    .cat-title { font-size: 22px; }
    .subcats { grid-template-columns: repeat(2, 1fr); }
    .prods__grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .pc__body { padding: 10px; }
    .pc__price-val { font-size: 17px; }
    .pc__btn { padding: 8px; font-size: 11px; }
}
</style>
