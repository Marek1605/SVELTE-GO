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
    let sliderMin = 0;
    let sliderMax = 1000;
    let rangeTrack;
    let dragging = null;

    let openSections = { price: true, brand: true, sort: true };
    function toggleSection(key) { openSections[key] = !openSections[key]; openSections = openSections; }

    $: {
        const params = $page.url.searchParams;
        minPrice = params.get('min_price') || '';
        maxPrice = params.get('max_price') || '';
        selectedBrand = params.get('brand') || '';
        sort = params.get('sort') || 'newest';
        selectedAttributes = {};
        for (const [key, value] of params.entries()) {
            if (key.startsWith('attr_')) selectedAttributes[key.replace('attr_', '')] = value;
        }
    }

    $: { sliderMin = minPrice ? Number(minPrice) : (priceRange.min || 0); sliderMax = maxPrice ? Number(maxPrice) : (priceRange.max || 1000); }
    $: hasActiveFilters = minPrice || maxPrice || selectedBrand || Object.keys(selectedAttributes).length > 0;
    $: activeFilterCount = (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + (selectedBrand ? 1 : 0) + Object.keys(selectedAttributes).length;
    $: filteredBrands = brands.filter(b => !brandSearch || b.name.toLowerCase().includes(brandSearch.toLowerCase()));
    $: rangeMin = priceRange.min || 0;
    $: rangeMax = priceRange.max || 1000;
    $: rangeSpan = Math.max(rangeMax - rangeMin, 1);
    $: leftPct = Math.max(0, Math.min(100, ((sliderMin - rangeMin) / rangeSpan) * 100));
    $: rightPct = Math.max(0, Math.min(100, ((sliderMax - rangeMin) / rangeSpan) * 100));

    function handleTrackEvent(e) {
        if (!rangeTrack) return;
        const rect = rangeTrack.getBoundingClientRect();
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        let pct = Math.max(0, Math.min(1, (cx - rect.left) / rect.width));
        const val = Math.round(rangeMin + pct * rangeSpan);
        if (dragging === 'min') sliderMin = Math.min(val, sliderMax - 1);
        else if (dragging === 'max') sliderMax = Math.max(val, sliderMin + 1);
    }
    function startDrag(which, e) {
        dragging = which;
        handleTrackEvent(e);
        const onMove = (ev) => { ev.preventDefault(); handleTrackEvent(ev); };
        const onUp = () => {
            dragging = null;
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('touchmove', onMove);
            window.removeEventListener('touchend', onUp);
            minPrice = sliderMin > rangeMin ? sliderMin.toString() : '';
            maxPrice = sliderMax < rangeMax ? sliderMax.toString() : '';
            applyFilters();
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onUp);
    }

    function applyFilters() {
        const params = new URLSearchParams();
        if (minPrice) params.set('min_price', minPrice);
        if (maxPrice) params.set('max_price', maxPrice);
        if (selectedBrand) params.set('brand', selectedBrand);
        if (sort !== 'newest') params.set('sort', sort);
        for (const [name, value] of Object.entries(selectedAttributes)) { if (value) params.set('attr_' + name, value); }
        const qs = params.toString();
        goto(`/kategoria/${category?.slug || ''}${qs ? '?' + qs : ''}`, { replaceState: true });
    }
    function clearFilters() { minPrice=''; maxPrice=''; selectedBrand=''; selectedAttributes={}; sort='newest'; brandSearch=''; if(category?.slug) goto(`/kategoria/${category.slug}`, { replaceState: true }); }
    function selectBrand(b) { selectedBrand = selectedBrand === b ? '' : b; applyFilters(); }
    function clearBrand() { selectedBrand=''; applyFilters(); }
    function clearPrice() { minPrice=''; maxPrice=''; applyFilters(); }
    function clearAttribute(n) { delete selectedAttributes[n]; selectedAttributes={...selectedAttributes}; applyFilters(); }
    function selectAttribute(n, v) { if(selectedAttributes[n]===v){delete selectedAttributes[n]; selectedAttributes={...selectedAttributes};}else{selectedAttributes[n]=v;} applyFilters(); }
    function setQuickPrice(mn, mx) { minPrice=mn?mn.toString():''; maxPrice=mx?mx.toString():''; sliderMin=mn||rangeMin; sliderMax=mx||rangeMax; applyFilters(); }
    function changePage(p) { if(p<1||p>totalPages||!category?.slug) return; const params=new URLSearchParams($page.url.searchParams); params.set('page',p.toString()); goto(`/kategoria/${category.slug}?${params.toString()}`); }
    function openMobileFilter() { mobileFilterOpen=true; document.body.style.overflow='hidden'; }
    function closeMobileFilter() { mobileFilterOpen=false; document.body.style.overflow=''; }
</script>

<svelte:head>
    <title>{category?.name || 'Kategória'} | MegaPrice.sk</title>
    <meta name="description" content="Porovnajte ceny v kategórii {category?.name}. {totalProducts} produktov.">
</svelte:head>

<div class="cat-page">
    <div class="cat-container">
        <nav class="bc">
            <a href="/" class="bc__link">Domov</a>
            {#each ancestors as ancestor}
                <svg class="bc__sep" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                <a href="/kategoria/{ancestor.slug}" class="bc__link">{ancestor.name}</a>
            {/each}
            <svg class="bc__sep" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            <span class="bc__current">{category?.name}</span>
        </nav>

        {#if errorMessage}<div class="cat-error">{errorMessage}</div>{/if}

        {#if category}
            <div class="cat-head">
                <div>
                    <h1 class="cat-title">{category.name}</h1>
                    <span class="cat-count">{totalProducts} produktov</span>
                </div>
                <div class="cat-sort">
                    <span class="cat-sort__label">Zoradiť:</span>
                    <select bind:value={sort} on:change={applyFilters}>
                        <option value="newest">Najnovšie</option>
                        <option value="price_asc">Najlacnejšie</option>
                        <option value="price_desc">Najdrahšie</option>
                        <option value="name_asc">A-Z</option>
                        <option value="name_desc">Z-A</option>
                    </select>
                </div>
            </div>

            {#if hasActiveFilters}
                <div class="chips">
                    {#if selectedBrand}<button class="chip" on:click={clearBrand}>Značka: {selectedBrand} <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>{/if}
                    {#if minPrice || maxPrice}<button class="chip" on:click={clearPrice}>Cena: {minPrice||'0'} – {maxPrice||'∞'} € <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>{/if}
                    {#each Object.entries(selectedAttributes) as [name, value]}<button class="chip" on:click={() => clearAttribute(name)}>{name}: {value} <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>{/each}
                    <button class="chip chip--clear" on:click={clearFilters}>Zrušiť všetky</button>
                </div>
            {/if}

            <div class="cat-layout">
                <!-- STICKY WRAPPER - this is what stays in place -->
                <div class="fl-wrap">
                    <aside class="fl">
                        <div class="fl__head">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                            <span>Filtrovanie</span>
                            {#if hasActiveFilters}<button class="fl__clear" on:click={clearFilters}>Zrušiť ({activeFilterCount})</button>{/if}
                        </div>

                        <div class="fl__scroll">
                            <!-- Price -->
                            <div class="fl__sec">
                                <button class="fl__sec-head" on:click={() => toggleSection('price')}>
                                    <span>Cena</span>
                                    <svg class="fl__chev" class:is-open={openSections.price} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                                </button>
                                {#if openSections.price}
                                    <div class="fl__body">
                                        <div class="fl__price">
                                            <div class="fl__price-field"><input type="number" placeholder="Od" bind:value={minPrice} on:change={applyFilters}><span class="fl__price-unit">€</span></div>
                                            <span class="fl__price-sep">–</span>
                                            <div class="fl__price-field"><input type="number" placeholder="Do" bind:value={maxPrice} on:change={applyFilters}><span class="fl__price-unit">€</span></div>
                                            <button class="fl__price-ok" on:click={applyFilters}>OK</button>
                                        </div>
                                        {#if rangeMax > 0}
                                            <div class="rng" bind:this={rangeTrack}
                                                 on:mousedown={(e) => { const r=rangeTrack.getBoundingClientRect(); const p=(e.clientX-r.left)/r.width; const v=rangeMin+p*rangeSpan; startDrag(Math.abs(v-sliderMin)<Math.abs(v-sliderMax)?'min':'max',e); }}
                                                 on:touchstart|preventDefault={(e) => { const r=rangeTrack.getBoundingClientRect(); const p=(e.touches[0].clientX-r.left)/r.width; const v=rangeMin+p*rangeSpan; startDrag(Math.abs(v-sliderMin)<Math.abs(v-sliderMax)?'min':'max',e); }}>
                                                <div class="rng__track"></div>
                                                <div class="rng__fill" style="left:{leftPct}%;width:{rightPct-leftPct}%"></div>
                                                <div class="rng__thumb" style="left:{leftPct}%"
                                                     on:mousedown|stopPropagation={(e) => startDrag('min',e)}
                                                     on:touchstart|preventDefault|stopPropagation={(e) => startDrag('min',e)}>
                                                    <span class="rng__tip">{sliderMin.toLocaleString('sk')} €</span>
                                                </div>
                                                <div class="rng__thumb" style="left:{rightPct}%"
                                                     on:mousedown|stopPropagation={(e) => startDrag('max',e)}
                                                     on:touchstart|preventDefault|stopPropagation={(e) => startDrag('max',e)}>
                                                    <span class="rng__tip">{sliderMax.toLocaleString('sk')} €</span>
                                                </div>
                                            </div>
                                            <div class="fl__price-range">{formatPrice(rangeMin)} – {formatPrice(rangeMax)}</div>
                                        {/if}
                                        <div class="fl__price-quick">
                                            <button class:is-active={maxPrice==='50'&&!minPrice} on:click={() => setQuickPrice(0,50)}>do 50 €</button>
                                            <button class:is-active={minPrice==='50'&&maxPrice==='100'} on:click={() => setQuickPrice(50,100)}>50 – 100 €</button>
                                            <button class:is-active={minPrice==='100'&&maxPrice==='200'} on:click={() => setQuickPrice(100,200)}>100 – 200 €</button>
                                            <button class:is-active={minPrice==='200'&&!maxPrice} on:click={() => setQuickPrice(200,0)}>od 200 €</button>
                                        </div>
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
                                                {#each filteredBrands.slice(0,20) as brand}
                                                    <label class="fl__opt" class:is-active={selectedBrand===brand.name} on:click|preventDefault={() => selectBrand(brand.name)}>
                                                        <span class="fl__check" class:is-checked={selectedBrand===brand.name}>{#if selectedBrand===brand.name}<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>{/if}</span>
                                                        <span class="fl__opt-name">{brand.name}</span>
                                                        <span class="fl__opt-count">{brand.count}</span>
                                                    </label>
                                                {/each}
                                                {#if filteredBrands.length > 20}<div class="fl__more">+{filteredBrands.length-20} ďalších</div>{/if}
                                                {#if brandSearch && filteredBrands.length===0}<div class="fl__empty">Žiadna značka</div>{/if}
                                            </div>
                                        </div>
                                    {/if}
                                </div>
                            {/if}

                            <!-- Dynamic attributes -->
                            {#each attributes as attr, i}
                                {#if attr.values && attr.values.length > 0}
                                    <div class="fl__sec">
                                        <button class="fl__sec-head" on:click={() => { openSections['attr_'+i]=!openSections['attr_'+i]; openSections=openSections; }}>
                                            <span>{attr.name}</span>
                                            <svg class="fl__chev" class:is-open={openSections['attr_'+i]} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                                        </button>
                                        {#if openSections['attr_'+i] !== false}
                                            <div class="fl__body">
                                                <div class="fl__opts">
                                                    {#each attr.values as val}
                                                        <label class="fl__opt" class:is-active={selectedAttributes[attr.name]===val.value} on:click|preventDefault={() => selectAttribute(attr.name,val.value)}>
                                                            <span class="fl__check" class:is-checked={selectedAttributes[attr.name]===val.value}>{#if selectedAttributes[attr.name]===val.value}<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>{/if}</span>
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
                        </div>
                    </aside>
                </div>

                <!-- CONTENT -->
                <div class="cat-content">
                    <div class="mob-bar">
                        <button class="mob-bar__filter" on:click={openMobileFilter}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                            Filtre {#if activeFilterCount > 0}<span class="mob-bar__badge">{activeFilterCount}</span>{/if}
                        </button>
                        <select class="mob-bar__sort" bind:value={sort} on:change={applyFilters}>
                            <option value="newest">Najnovšie</option><option value="price_asc">Najlacnejšie</option><option value="price_desc">Najdrahšie</option><option value="name_asc">A-Z</option><option value="name_desc">Z-A</option>
                        </select>
                    </div>

                    {#if children.length > 0}
                        <div class="subcats">
                            {#each children as child}
                                <a href="/kategoria/{child.slug}" class="subcat">
                                    <div class="subcat__ico">{#if child.image_url}<img src={child.image_url} alt={child.name} loading="lazy">{:else}<span>{child.name?.charAt(0)?.toUpperCase()||'?'}</span>{/if}</div>
                                    <span class="subcat__name">{child.name}</span>
                                    {#if child.product_count}<span class="subcat__count">{child.product_count}</span>{/if}
                                </a>
                            {/each}
                        </div>
                    {/if}

                    <div class="prods">
                        <div class="prods__info">Zobrazených <strong>{products.length}</strong> z <strong>{totalProducts}</strong> produktov</div>
                        {#if products.length > 0}
                            <div class="prods__grid">
                                {#each products as product}
                                    <article class="pc">
                                        <a href="/produkt/{product.slug}" class="pc__img">{#if product.image_url}<img src={product.image_url} alt={product.title} loading="lazy">{:else}<div class="pc__placeholder"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>{/if}</a>
                                        <div class="pc__body">
                                            {#if product.brand}<span class="pc__brand">{product.brand}</span>{/if}
                                            <h3 class="pc__title"><a href="/produkt/{product.slug}">{product.title}</a></h3>
                                            <div class="pc__bottom">
                                                <div class="pc__price"><span class="pc__price-from">od</span><span class="pc__price-val">{formatPrice(product.price_min || product.price)}</span></div>
                                                {#if product.offer_count > 1}<div class="pc__offers">v {product.offer_count} obchodoch</div>{/if}
                                                <a href="/produkt/{product.slug}" class="pc__btn">Porovnať ceny</a>
                                            </div>
                                        </div>
                                    </article>
                                {/each}
                            </div>
                            {#if totalPages > 1}
                                <nav class="pag">
                                    <button class="pag__btn" disabled={currentPage<=1} on:click={() => changePage(currentPage-1)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button>
                                    {#each Array(Math.min(totalPages,7)) as _,i}{@const pn=currentPage<=4?i+1:currentPage+i-3}{#if pn>0&&pn<=totalPages}<button class="pag__btn" class:is-active={pn===currentPage} on:click={() => changePage(pn)}>{pn}</button>{/if}{/each}
                                    <button class="pag__btn" disabled={currentPage>=totalPages} on:click={() => changePage(currentPage+1)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></button>
                                </nav>
                            {/if}
                        {:else}
                            <div class="empty"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><h2>Žiadne produkty</h2><p>V tejto kategórii sme nenašli žiadne produkty.</p>{#if hasActiveFilters}<button class="empty__btn" on:click={clearFilters}>Zrušiť filtre</button>{/if}</div>
                        {/if}
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>

{#if mobileFilterOpen}
    <div class="mob-overlay" on:click={closeMobileFilter}></div>
    <div class="mob-drawer">
        <div class="mob-drawer__head"><h3>Filtre</h3>{#if hasActiveFilters}<button class="mob-drawer__clear" on:click={clearFilters}>Zrušiť</button>{/if}<button class="mob-drawer__close" on:click={closeMobileFilter}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
        <div class="mob-drawer__body">
            <div class="fl__sec"><div class="fl__sec-head"><span>Cena</span></div><div class="fl__body">
                <div class="fl__price"><div class="fl__price-field"><input type="number" placeholder="Od" bind:value={minPrice}><span class="fl__price-unit">€</span></div><span class="fl__price-sep">–</span><div class="fl__price-field"><input type="number" placeholder="Do" bind:value={maxPrice}><span class="fl__price-unit">€</span></div></div>
                <div class="fl__price-quick"><button class:is-active={maxPrice==='50'&&!minPrice} on:click={() => setQuickPrice(0,50)}>do 50 €</button><button class:is-active={minPrice==='50'&&maxPrice==='100'} on:click={() => setQuickPrice(50,100)}>50–100 €</button><button class:is-active={minPrice==='100'&&maxPrice==='200'} on:click={() => setQuickPrice(100,200)}>100–200 €</button><button class:is-active={minPrice==='200'&&!maxPrice} on:click={() => setQuickPrice(200,0)}>od 200 €</button></div>
            </div></div>
            {#if brands.length > 0}<div class="fl__sec"><div class="fl__sec-head"><span>Značka</span></div><div class="fl__body"><div class="fl__opts">
                {#each brands.slice(0,15) as brand}<label class="fl__opt" class:is-active={selectedBrand===brand.name} on:click|preventDefault={() => selectBrand(brand.name)}><span class="fl__check" class:is-checked={selectedBrand===brand.name}>{#if selectedBrand===brand.name}<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>{/if}</span><span class="fl__opt-name">{brand.name}</span><span class="fl__opt-count">{brand.count}</span></label>{/each}
            </div></div></div>{/if}
            {#each attributes as attr}{#if attr.values && attr.values.length > 0}<div class="fl__sec"><div class="fl__sec-head"><span>{attr.name}</span></div><div class="fl__body"><div class="fl__opts">
                {#each attr.values as val}<label class="fl__opt" class:is-active={selectedAttributes[attr.name]===val.value} on:click|preventDefault={() => selectAttribute(attr.name,val.value)}><span class="fl__check" class:is-checked={selectedAttributes[attr.name]===val.value}>{#if selectedAttributes[attr.name]===val.value}<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>{/if}</span><span class="fl__opt-name">{val.value}</span><span class="fl__opt-count">{val.count}</span></label>{/each}
            </div></div></div>{/if}{/each}
        </div>
        <div class="mob-drawer__foot"><button class="mob-drawer__apply" on:click={() => { applyFilters(); closeMobileFilter(); }}>Zobraziť {totalProducts} produktov</button></div>
    </div>
{/if}

<style>
.cat-page { padding: 12px 0 60px; background: #f5f6f8; min-height: 100vh; }
.cat-container { max-width: 1400px; margin: 0 auto; padding: 0 16px; }
.bc { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; font-size: 13px; color: #6b7280; margin-bottom: 12px; padding: 8px 0; }
.bc__link { color: #6b7280; transition: color 0.15s; } .bc__link:hover { color: #c4956a; }
.bc__sep { color: #d1d5db; flex-shrink: 0; } .bc__current { color: #1f2937; font-weight: 500; }
.cat-error { padding: 12px 16px; background: #fef3c7; border: 1px solid #fbbf24; border-radius: 10px; color: #92400e; font-size: 14px; margin-bottom: 16px; }
.cat-head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 16px; gap: 16px; }
.cat-title { font-size: 28px; font-weight: 800; color: #111; margin: 0; line-height: 1.2; }
.cat-count { font-size: 13px; color: #6b7280; }
.cat-sort { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.cat-sort__label { font-size: 13px; color: #6b7280; }
.cat-sort select { padding: 8px 32px 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; background: #fff; color: #374151; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
.chip { display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: #fef7f0; border: 1px solid #e8c9a8; border-radius: 100px; font-size: 12px; font-weight: 500; color: #92620e; cursor: pointer; transition: all 0.15s; }
.chip:hover { background: #fde4c8; }
.chip--clear { background: none; border: 1px dashed #d1d5db; color: #6b7280; }
.chip--clear:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }

/* === LAYOUT === */
.cat-layout { display: grid; grid-template-columns: 260px 1fr; gap: 24px; align-items: start; }

/* === STICKY WRAPPER === */
.fl-wrap {
    position: sticky;
    top: 12px;
    align-self: start;
}

/* === FILTER BOX === */
.fl {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #e2e5ea;
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 24px);
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.fl__head {
    display: flex; align-items: center; gap: 8px;
    padding: 16px 18px; border-bottom: 1px solid #f0f1f3;
    font-size: 15px; font-weight: 700; color: #1f2937;
    flex-shrink: 0;
}
.fl__head svg { color: #c4956a; }
.fl__clear {
    margin-left: auto; font-size: 11px; color: #ef4444;
    background: #fef2f2; border: none; padding: 4px 10px;
    border-radius: 6px; font-weight: 600; cursor: pointer;
}

/* Scrollable inner - hidden scrollbar */
.fl__scroll {
    overflow-y: auto;
    overflow-x: hidden;
    flex: 1;
    scrollbar-width: none;
}
.fl__scroll::-webkit-scrollbar { display: none; }

.fl__sec { border-bottom: 1px solid #f3f4f6; }
.fl__sec:last-child { border-bottom: none; }
.fl__sec-head {
    display: flex; justify-content: space-between; align-items: center;
    width: 100%; padding: 13px 18px; background: none; border: none;
    font-size: 13px; font-weight: 600; color: #374151;
    cursor: pointer; text-align: left;
}
.fl__sec-head:hover { background: #fafbfc; }
.fl__chev { transition: transform 0.2s; color: #9ca3af; }
.fl__chev.is-open { transform: rotate(180deg); }
.fl__body { padding: 0 16px 16px; }

/* === PRICE INPUTS === */
.fl__price { display: flex; align-items: center; gap: 6px; }
.fl__price-field { position: relative; flex: 1; min-width: 0; }
.fl__price-field input {
    width: 100%; padding: 9px 28px 9px 10px;
    border: 1.5px solid #e5e7eb; border-radius: 8px;
    font-size: 13px; outline: none; background: #fafbfc;
    -moz-appearance: textfield; /* hide spinner Firefox */
    transition: border-color 0.2s;
}
.fl__price-field input::-webkit-outer-spin-button,
.fl__price-field input::-webkit-inner-spin-button {
    -webkit-appearance: none; margin: 0; /* hide spinner Chrome */
}
.fl__price-field input:focus { border-color: #c4956a; background: #fff; }
.fl__price-unit {
    position: absolute; right: 9px; top: 50%; transform: translateY(-50%);
    font-size: 12px; color: #9ca3af; pointer-events: none;
}
.fl__price-sep { color: #c8ccd2; font-size: 14px; flex-shrink: 0; font-weight: 300; }
.fl__price-ok {
    padding: 9px 14px; background: #c4956a; color: #fff;
    border: none; border-radius: 8px; font-size: 12px;
    font-weight: 700; cursor: pointer; flex-shrink: 0;
    letter-spacing: 0.5px; line-height: 1;
    transition: background 0.15s;
    min-width: 38px; text-align: center;
}
.fl__price-ok:hover { background: #b38458; }
.fl__price-range { font-size: 11px; color: #adb5bd; margin-top: 6px; }

/* === RANGE SLIDER === */
.rng {
    position: relative; height: 32px;
    margin: 14px 8px 6px; cursor: pointer;
    touch-action: none; user-select: none;
}
.rng__track {
    position: absolute; top: 50%; left: 0; right: 0;
    height: 4px; transform: translateY(-50%);
    background: #e5e7eb; border-radius: 4px;
}
.rng__fill {
    position: absolute; top: 50%; height: 4px; transform: translateY(-50%);
    background: #c4956a;
    border-radius: 4px; pointer-events: none;
}
.rng__thumb {
    position: absolute; top: 50%;
    width: 16px; height: 16px;
    transform: translate(-50%, -50%);
    background: #c4956a;
    border: 2.5px solid #fff;
    border-radius: 50%;
    cursor: grab; z-index: 2;
    box-shadow: 0 0 0 1px rgba(196,149,106,0.3), 0 1px 4px rgba(0,0,0,0.15);
    transition: box-shadow 0.15s, transform 0.1s;
}
.rng__thumb:hover {
    box-shadow: 0 0 0 4px rgba(196,149,106,0.15), 0 0 0 1px rgba(196,149,106,0.3), 0 2px 6px rgba(0,0,0,0.18);
    transform: translate(-50%, -50%) scale(1.12);
}
.rng__thumb:active { cursor: grabbing; }
.rng__tip {
    position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%);
    background: #374151; color: #fff;
    font-size: 10px; font-weight: 600;
    padding: 3px 7px; border-radius: 5px;
    white-space: nowrap; margin-bottom: 6px;
    opacity: 0; transition: opacity 0.15s; pointer-events: none;
}
.rng__tip::after {
    content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
    border: 4px solid transparent; border-top-color: #374151;
}
.rng__thumb:hover .rng__tip, .rng:active .rng__tip { opacity: 1; }

/* === QUICK PRICE === */
.fl__price-quick { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-top: 10px; }
.fl__price-quick button {
    padding: 7px 4px; font-size: 11.5px; font-weight: 500;
    color: #6b7280; background: #f7f8fa;
    border: 1.5px solid #e5e7eb; border-radius: 7px;
    cursor: pointer; transition: all 0.15s; text-align: center;
}
.fl__price-quick button:hover { border-color: #c4956a; color: #c4956a; background: #fef7f0; }
.fl__price-quick button.is-active { background: #c4956a; color: #fff; border-color: #c4956a; }

/* === BRAND SEARCH === */
.fl__search {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 10px; margin-bottom: 8px;
    background: #f7f8fa; border: 1.5px solid #eef0f4; border-radius: 8px;
}
.fl__search:focus-within { border-color: #c4956a; background: #fff; }
.fl__search svg { color: #9ca3af; flex-shrink: 0; }
.fl__search input { flex: 1; border: none; background: none; font-size: 12px; outline: none; color: #374151; }

/* === OPTIONS LIST === */
.fl__opts { max-height: 240px; overflow-y: auto; scrollbar-width: none; }
.fl__opts::-webkit-scrollbar { display: none; }
.fl__opt {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 4px; border-radius: 6px;
    cursor: pointer; user-select: none;
}
.fl__opt:hover { background: #f8f9fb; }
.fl__opt.is-active { background: #fef7f0; }
.fl__check {
    width: 16px; height: 16px;
    border: 1.5px solid #d1d5db; border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; background: #fff; transition: all 0.15s;
}
.fl__check.is-checked { background: #c4956a; border-color: #c4956a; color: #fff; }
.fl__opt-name { flex: 1; font-size: 13px; color: #374151; line-height: 1.3; }
.fl__opt-count { font-size: 11px; color: #b0b7c0; min-width: 20px; text-align: right; }
.fl__more { font-size: 11px; color: #6b7280; padding: 6px 4px; }
.fl__empty { font-size: 12px; color: #9ca3af; padding: 8px 4px; text-align: center; }

/* === CONTENT === */
.cat-content { min-width: 0; }
.mob-bar { display: none; }
.subcats { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 8px; margin-bottom: 20px; }
.subcat {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; background: #fff;
    border: 1px solid #e5e7eb; border-radius: 10px;
    transition: border-color 0.15s; text-decoration: none;
}
.subcat:hover { border-color: #c4956a; }
.subcat__ico {
    width: 30px; height: 30px; background: #f5f6f8; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; overflow: hidden;
}
.subcat__ico img { width: 100%; height: 100%; object-fit: contain; padding: 2px; }
.subcat__ico span { font-size: 12px; color: #adb5bd; font-weight: 700; }
.subcat__name {
    font-size: 12px; font-weight: 500; color: #374151;
    flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.subcat:hover .subcat__name { color: #c4956a; }
.subcat__count { font-size: 10px; color: #adb5bd; }
.prods__info { font-size: 13px; color: #6b7280; margin-bottom: 12px; }
.prods__info strong { color: #374151; }
.prods__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }

/* === PRODUCT CARD === */
.pc {
    background: #fff; border-radius: 12px; border: 1px solid #e5e7eb;
    overflow: hidden; display: flex; flex-direction: column;
    transition: border-color 0.2s, box-shadow 0.2s;
}
.pc:hover { border-color: #d0d5dd; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
.pc__img { display: block; aspect-ratio: 1; background: #fafbfc; padding: 12px; }
.pc__img img { width: 100%; height: 100%; object-fit: contain; }
.pc__placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.pc__body { padding: 12px 14px 14px; display: flex; flex-direction: column; flex: 1; }
.pc__brand { font-size: 10px; font-weight: 700; color: #c4956a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
.pc__title { font-size: 13px; font-weight: 600; margin: 0 0 auto; line-height: 1.35; }
.pc__title a { color: #1f2937; text-decoration: none; }
.pc__title a:hover { color: #c4956a; }
.pc__bottom { margin-top: 10px; }
.pc__price { margin-bottom: 2px; }
.pc__price-from { font-size: 11px; color: #6b7280; }
.pc__price-val { font-size: 20px; font-weight: 800; color: #111; margin-left: 3px; }
.pc__offers { font-size: 11px; color: #6b7280; margin-bottom: 8px; }
.pc__btn {
    display: block; text-align: center; padding: 9px;
    background: linear-gradient(135deg, #c4956a, #b8875c);
    color: #fff; border-radius: 8px; font-weight: 600;
    font-size: 12px; text-decoration: none; transition: opacity 0.15s;
}
.pc__btn:hover { opacity: 0.9; }

/* === PAGINATION === */
.pag { display: flex; justify-content: center; gap: 6px; margin-top: 32px; }
.pag__btn {
    width: 40px; height: 40px; border: 1px solid #e5e7eb; border-radius: 10px;
    background: #fff; cursor: pointer; font-size: 14px; font-weight: 500;
    display: flex; align-items: center; justify-content: center;
    color: #374151; transition: all 0.15s;
}
.pag__btn:hover { border-color: #c4956a; color: #c4956a; }
.pag__btn.is-active { background: #c4956a; color: #fff; border-color: #c4956a; }
.pag__btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* === EMPTY STATE === */
.empty { text-align: center; padding: 60px 20px; }
.empty svg { margin-bottom: 16px; }
.empty h2 { font-size: 20px; margin: 0 0 8px; color: #1f2937; }
.empty p { color: #6b7280; margin: 0 0 20px; font-size: 14px; }
.empty__btn {
    padding: 10px 20px; border-radius: 8px; font-weight: 600;
    cursor: pointer; border: none; background: #c4956a;
    color: #fff; font-size: 13px;
}

/* === MOBILE DRAWER === */
.mob-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 2000; }
.mob-drawer {
    position: fixed; bottom: 0; left: 0; right: 0; max-height: 85vh;
    background: #fff; border-radius: 20px 20px 0 0; z-index: 2001;
    display: flex; flex-direction: column; animation: slideUp 0.25s ease;
}
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.mob-drawer__head { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-bottom: 1px solid #f3f4f6; }
.mob-drawer__head h3 { font-size: 18px; font-weight: 700; margin: 0; flex: 1; }
.mob-drawer__clear { font-size: 12px; color: #ef4444; background: none; border: none; font-weight: 600; cursor: pointer; }
.mob-drawer__close {
    width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
    background: #f3f4f6; border: none; border-radius: 50%; color: #6b7280; cursor: pointer;
}
.mob-drawer__body { flex: 1; overflow-y: auto; padding: 0 8px; }
.mob-drawer__foot { padding: 12px 16px; border-top: 1px solid #f3f4f6; }
.mob-drawer__apply {
    width: 100%; padding: 14px; background: #c4956a; color: #fff;
    border: none; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer;
}

/* === RESPONSIVE === */
@media (max-width: 900px) {
    .cat-layout { grid-template-columns: 1fr; }
    .fl-wrap { display: none; }
    .cat-sort { display: none; }
    .mob-bar { display: flex; gap: 8px; margin-bottom: 12px; }
    .mob-bar__filter {
        display: flex; align-items: center; gap: 6px;
        padding: 10px 14px; background: #fff; border: 1px solid #e5e7eb;
        border-radius: 10px; font-size: 13px; font-weight: 600;
        color: #374151; cursor: pointer;
    }
    .mob-bar__badge {
        background: #c4956a; color: #fff; font-size: 10px;
        width: 18px; height: 18px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
    }
    .mob-bar__sort {
        flex: 1; padding: 10px; border: 1px solid #e5e7eb;
        border-radius: 10px; font-size: 13px; background: #fff;
    }
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

