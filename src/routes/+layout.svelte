<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import '../app.css';

    export let data;

    let searchQuery = '';
    let catnavSearchQuery = '';
    let isCollapsed = false;
    let wishlistCount = 0;
    let compareCount = 0;
    let mobileMenuOpen = false;
    let megaMenuOpen = false;
    let activeCategoryId = null;
    let activeCategoryData = null;
    let closeTimeout = null;
    let catNavStyle = 'pills';
    let showAllCats = false;
    let editMode = false;
    let hiddenCats = new Set();
    let logoUrl = '';
    let logoSize = 40;
    let showCart = true;
    let showAccount = true;
    let showWishlist = true;
    let showCompare = true;
    let expandedMobileCats = new Set();

    function toggleAllCats() { showAllCats = !showAllCats; if (!showAllCats) editMode = false; }
    function closeAllCats() { showAllCats = false; editMode = false; }
    function toggleEditMode() { editMode = !editMode; }
    function toggleHideCat(catId) {
        const updated = new Set(hiddenCats);
        if (updated.has(catId)) updated.delete(catId); else updated.add(catId);
        hiddenCats = updated;
        try { localStorage.setItem('mp_hidden_cats', JSON.stringify([...hiddenCats])); } catch(e) {}
    }
    function isHidden(catId) { return hiddenCats.has(catId); }
    function showAllCategories() {
        hiddenCats = new Set();
        try { localStorage.setItem('mp_hidden_cats', '[]'); } catch(e) {}
    }
    function toggleMobileCat(catId) {
        const updated = new Set(expandedMobileCats);
        if (updated.has(catId)) updated.delete(catId); else updated.add(catId);
        expandedMobileCats = updated;
    }

    $: navCategories = (data?.navCategories || []).map(cat => {
        const children = (cat.children || []).map(child => {
            const grandchildren = (child.children || []).slice(0, 15);
            return { ...child, grandchildren };
        });
        return { ...cat, children };
    });

    $: visibleCategories = navCategories.filter(cat => !hiddenCats.has(cat.id));
    $: hiddenCount = navCategories.reduce((count, cat) => {
        if (hiddenCats.has(cat.id)) return count + 1;
        const hiddenChildren = (cat.children || []).filter(c => hiddenCats.has(c.id)).length;
        return count + hiddenChildren;
    }, 0);

    function handleSearch(e) { e.preventDefault(); if (searchQuery.trim()) window.location.href = `/hladat?q=${encodeURIComponent(searchQuery)}`; }
    function handleCatnavSearch(e) { e.preventDefault(); if (catnavSearchQuery.trim()) window.location.href = `/hladat?q=${encodeURIComponent(catnavSearchQuery)}`; }
    function scrollCategories(direction) { const list = document.querySelector('.mp-catnav__list'); if (list) list.scrollBy({ left: direction * 200, behavior: 'smooth' }); }
    function closeMobileMenu() { mobileMenuOpen = false; document.body.style.overflow = ''; }
    function openMobileMenu() { mobileMenuOpen = true; document.body.style.overflow = 'hidden'; }
    function openMegaMenu(cat) {
        if (closeTimeout) { clearTimeout(closeTimeout); closeTimeout = null; }
        if (cat.children && cat.children.length > 0) { activeCategoryId = cat.id; activeCategoryData = cat; megaMenuOpen = true; }
    }
    function scheduleMegaClose() { closeTimeout = setTimeout(() => { megaMenuOpen = false; activeCategoryId = null; activeCategoryData = null; }, 150); }
    function cancelMegaClose() { if (closeTimeout) { clearTimeout(closeTimeout); closeTimeout = null; } }
    function handleCategoryMouseEnter(cat) { if (window.innerWidth > 768) openMegaMenu(cat); }
    function handleCategoryMouseLeave() { if (window.innerWidth > 768) scheduleMegaClose(); }

    onMount(() => {
        const SCROLL_THRESHOLD = 200;
        const HYSTERESIS = 50;
        let collapsed = false;
        let ticking = false;
        const update = () => {
            const y = window.scrollY || 0;
            if (y > SCROLL_THRESHOLD && !collapsed) { collapsed = true; isCollapsed = true; }
            else if (y < (SCROLL_THRESHOLD - HYSTERESIS) && collapsed) { collapsed = false; isCollapsed = false; }
            ticking = false;
        };
        const onScroll = () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } };
        update();
        window.addEventListener('scroll', onScroll, { passive: true });

        try {
            const saved = localStorage.getItem('mp_catnav_style');
            if (saved && ['pills','icons','minimal','cards'].includes(saved)) catNavStyle = saved;
        } catch(e) {}
        try {
            const hidden = localStorage.getItem('mp_hidden_cats');
            if (hidden) hiddenCats = new Set(JSON.parse(hidden));
        } catch(e) {}
        const onStorage = (e) => {
            if (e.key === 'mp_catnav_style' && e.newValue) catNavStyle = e.newValue;
        };
        window.addEventListener('storage', onStorage);

        fetch('http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io/api/v1/site/settings')
            .then(r => r.json())
            .then(d => {
                if (d?.data?.logo_url) logoUrl = d.data.logo_url;
                if (d?.data?.logo_size) logoSize = parseInt(d.data.logo_size) || 40;
                showCart = d?.data?.show_cart !== 'false';
                showAccount = d?.data?.show_account !== 'false';
                showWishlist = d?.data?.show_wishlist !== 'false';
                showCompare = d?.data?.show_compare !== 'false';
            })
            .catch(() => {});

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('storage', onStorage);
            if (closeTimeout) clearTimeout(closeTimeout);
        };
    });

    const categoryEmojis = {
        'uncategorized': '📦', 'dom': '🏡', 'záhrada': '🏡', 'domáce': '🔌',
        'spotrebiče': '🔌', 'elektronika': '📱', 'hračky': '🧸', 'kancelárske': '📎',
        'kostýmy': '🎭', 'kuchynské': '🍳', 'ostatné': '📦', 'šport': '⚽',
        'zdravie': '💊', 'krása': '💄', 'zvieratá': '🐾', 'vonkajšie': '🌳',
        'auto': '🚗', 'dieťa': '👶', 'oblečenie': '👕', 'nábytok': '🪑',
        'foto': '📸', 'audio': '🎧', 'digitál': '💻', 'hobby': '🎨',
        'hry': '🎮', 'camping': '⛺', 'barbecue': '🔥', 'baby': '👶'
    };
    function getCategoryEmoji(name) {
        const lower = (name || '').toLowerCase();
        for (const [key, emoji] of Object.entries(categoryEmojis)) { if (lower.includes(key)) return emoji; }
        return '📦';
    }
    function getInitial(name) { return (name || 'K').charAt(0).toUpperCase(); }
</script>

{#if $page.url.pathname.startsWith('/admin') || $page.url.pathname.startsWith('/vendor-dashboard')}
    <slot />
{:else}
<div class="mp-site">
    <header class="mp-header">
        <div class="mp-header__inner">
            <button class="mp-header__burger" on:click={openMobileMenu} aria-label="Menu">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <a href="/" class="mp-header__logo">
                {#if logoUrl}
                    <img src={logoUrl} alt="MegaPrice" class="mp-header__logo-img" style="height:{logoSize}px" />
                {:else}
                    <span class="mp-header__logo-text">megaprice</span>
                {/if}
            </a>
            <form class="mp-search" on:submit={handleSearch}>
                <input type="text" class="mp-search__input" placeholder="Hľadaj produkt, značku..." bind:value={searchQuery}>
                <button type="submit" class="mp-search__btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <span>Hľadať</span>
                </button>
            </form>
            <nav class="mp-header__actions">
                {#if showAccount}<a href="/ucet" class="mp-header__action"><span class="mp-header__action-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span><span>Môj účet</span></a>{/if}
                {#if showWishlist}<a href="/oblubene" class="mp-header__action"><span class="mp-header__action-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>{#if wishlistCount > 0}<span class="mp-header__action-badge">{wishlistCount}</span>{/if}</span><span>Obľúbené</span></a>{/if}
                {#if showCompare}<a href="/porovnanie" class="mp-header__action"><span class="mp-header__action-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 2l4 4-4 4"/><path d="M3 6h18"/><path d="M7 14l-4 4 4 4"/><path d="M21 18H3"/></svg>{#if compareCount > 0}<span class="mp-header__action-badge mp-header__action-badge--blue">{compareCount}</span>{/if}</span><span>Porovnať</span></a>{/if}
                {#if showCart}<a href="/kosik" class="mp-header__action mp-header__action--cart"><span class="mp-header__action-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg></span><span>Košík</span></a>{/if}
            </nav>
        </div>
    </header>

    <nav class="mp-catnav" class:is-collapsed={isCollapsed}>
        <div class="mp-catnav__inner">
            <div class="mp-catnav__list" role="list">
                {#each visibleCategories as cat (cat.id)}
                <div class="mp-catnav__item" role="listitem"
                    on:mouseenter={() => handleCategoryMouseEnter(cat)}
                    on:mouseleave={handleCategoryMouseLeave}>
                    <a href={"/kategoria/" + (cat.slug || cat.id)} class="mp-catnav__link" class:is-active={activeCategoryId === cat.id}>
                        {#if catNavStyle === 'cards'}
                        <span class="cn-card__img">
                            {#if cat.image_url}<img src={cat.image_url} alt="">{:else}<span>{getCategoryEmoji(cat.name)}</span>{/if}
                        </span>
                        {/if}
                        <span class="mp-catnav__label">{cat.name}</span>
                    </a>
                </div>
                {/each}
                <button class="cn-more" on:click={toggleAllCats} title="Všetky kategórie">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                </button>
            </div>
            <div class="mp-catnav__end">
                {#if isCollapsed}
                <div class="mp-catnav__collapsed-actions">
                    <form class="mp-catnav__search-form" on:submit={handleCatnavSearch}>
                        <input type="text" class="mp-catnav__search-input" placeholder="Hľadať..." bind:value={catnavSearchQuery}>
                        <button type="submit" class="mp-catnav__search-btn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button>
                    </form>
                    {#if showWishlist}<a href="/oblubene" class="mp-catnav__action"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></a>{/if}
                    {#if showCompare}<a href="/porovnanie" class="mp-catnav__action mp-catnav__compare"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 2l4 4-4 4"/><path d="M3 6h18"/><path d="M7 14l-4 4 4 4"/><path d="M21 18H3"/></svg></a>{/if}
                </div>
                {/if}
            </div>
        </div>
        {#if showAllCats}
            <div class="cn-drop__overlay" on:click={closeAllCats}></div>
            <div class="cn-drop">
                <div class="cn-drop__head">
                    <h3>Všetky kategórie ({navCategories.length}){#if hiddenCount > 0}<span class="cn-drop__hidden-badge">({hiddenCount} skrytých)</span>{/if}</h3>
                    <div class="cn-drop__head-actions">
                        {#if editMode && hiddenCount > 0}<button class="cn-drop__show-all-btn" on:click={showAllCategories}>Zobraziť všetky</button>{/if}
                        <button class="cn-drop__edit-btn" class:is-active={editMode} on:click={toggleEditMode} title="Upraviť"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                        <button on:click={closeAllCats}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                    </div>
                </div>
                <div class="cn-drop__grid" class:is-edit={editMode}>
                    {#each navCategories as cat}
                    {#if editMode}
                        <div class="cn-drop__cat-group" class:is-hidden={isHidden(cat.id)}>
                            <div class="cn-drop__item-row">
                                <a href={"/kategoria/" + (cat.slug || cat.id)} class="cn-drop__item" on:click={closeAllCats}>
                                    <div class="cn-drop__item-img">{#if cat.image_url}<img src={cat.image_url} alt="">{:else}<span>{getCategoryEmoji(cat.name)}</span>{/if}</div>
                                    <div><span class="cn-drop__item-name">{cat.name}</span>{#if cat.children?.length}<span class="cn-drop__item-count">{cat.children.length} podkategórií</span>{/if}</div>
                                </a>
                                <button class="cn-vis-btn" class:is-hidden={isHidden(cat.id)} on:click={() => toggleHideCat(cat.id)} title={isHidden(cat.id)?'Zobraziť':'Skryť'}>{isHidden(cat.id)?'👁':'✓'}</button>
                            </div>
                        </div>
                    {:else}
                        <a href={"/kategoria/" + (cat.slug || cat.id)} class="cn-drop__item" on:click={closeAllCats}>
                            <div class="cn-drop__item-img">{#if cat.image_url}<img src={cat.image_url} alt="">{:else}<span>{getCategoryEmoji(cat.name)}</span>{/if}</div>
                            <div><span class="cn-drop__item-name">{cat.name}</span>{#if cat.children?.length}<span class="cn-drop__item-count">{cat.children.length} podkat.</span>{/if}</div>
                        </a>
                    {/if}
                    {/each}
                </div>
            </div>
        {/if}
        {#if megaMenuOpen && activeCategoryData}
            <div class="mp-mega" on:mouseenter={cancelMegaClose} on:mouseleave={scheduleMegaClose}>
                <div class="mp-mega__container">
                    {#each activeCategoryData.children || [] as child}
                    <div class="mp-mega__col">
                        <a href={"/kategoria/" + (child.slug || child.id)} class="mp-mega__subcat">
                            <div class="mp-mega__subcat-img">{#if child.image_url}<img src={child.image_url} alt="">{:else}<span>{getInitial(child.name)}</span>{/if}</div>
                            <span class="mp-mega__subcat-name">{child.name}</span>
                        </a>
                        {#if child.grandchildren?.length > 0}
                        <div class="mp-mega__links">
                            {#each child.grandchildren as gc}<a href={"/kategoria/" + (gc.slug || gc.id)} class="mp-mega__link">{gc.name}</a>{/each}
                        </div>
                        {/if}
                    </div>
                    {/each}
                </div>
            </div>
        {/if}
    </nav>

    <main class="mp-main"><slot /></main>

    <footer class="mp-footer">
        <div class="mp-footer__top"><div class="mp-footer__inner">
            <div class="mp-footer__grid">
                <div class="mp-footer__col"><h4>MegaPrice</h4><p>Porovnávač cien z overených slovenských e-shopov. Nájdite najlepšie ponuky rýchlo a jednoducho.</p></div>
                <div class="mp-footer__col"><h4>Kategórie</h4><ul>{#each navCategories.slice(0,6) as cat}<li><a href="/kategoria/{cat.slug}">{cat.name}</a></li>{/each}</ul></div>
                <div class="mp-footer__col"><h4>Pre e-shopy</h4><ul><li><a href="/prihlasenie-predajcu">Pridať e-shop</a></li><li><a href="/prihlasenie-predajcu">XML Feed import</a></li><li><a href="/prihlasenie-predajcu">CPC reklama</a></li></ul></div>
                <div class="mp-footer__col"><h4>Podpora</h4><ul><li><a href="/kontakt">Kontakt</a></li><li><a href="/ochrana-osobnych-udajov">Ochrana údajov</a></li><li><a href="/obchodne-podmienky">Obchodné podmienky</a></li></ul></div>
            </div>
        </div></div>
        <div class="mp-footer__bottom"><span>© 2025 MegaPrice.sk — Všetky práva vyhradené</span><div class="mp-footer__links"><a href="/ochrana-osobnych-udajov">Súkromie</a><a href="/obchodne-podmienky">Podmienky</a></div></div>
    </footer>

    <nav class="mp-bottom-nav">
        <a href="/" class="mp-bottom-nav__item" class:is-active={$page.url.pathname === '/'}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg><span>Domov</span></a>
        <button class="mp-bottom-nav__item" on:click={openMobileMenu}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg><span>Kategórie</span></button>
        {#if showWishlist}<a href="/oblubene" class="mp-bottom-nav__item"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span>Obľúbené</span></a>{/if}
        {#if showAccount}<a href="/ucet" class="mp-bottom-nav__item"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>Účet</span></a>{/if}
    </nav>

    <!-- MOBILE CATEGORY DRAWER with expandable tree -->
    {#if mobileMenuOpen}
        <div class="mm-overlay" on:click={closeMobileMenu}></div>
        <div class="mm-drawer">
            <div class="mm-header">
                <span class="mm-title">Kategórie</span>
                <button class="mm-close" on:click={closeMobileMenu}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <div class="mm-body">
                {#each visibleCategories as cat}
                    <div class="mm-cat" class:mm-cat--open={expandedMobileCats.has(cat.id)}>
                        <div class="mm-cat__row">
                            <a href={"/kategoria/" + (cat.slug || cat.id)} class="mm-cat__link" on:click={closeMobileMenu}>
                                <span class="mm-cat__icon">
                                    {#if cat.image_url}<img src={cat.image_url} alt="">{:else}{getCategoryEmoji(cat.name)}{/if}
                                </span>
                                <span class="mm-cat__name">{cat.name}</span>
                            </a>
                            {#if cat.children?.length > 0}
                            <button class="mm-cat__toggle" on:click={() => toggleMobileCat(cat.id)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="transform:rotate({expandedMobileCats.has(cat.id)?180:0}deg);transition:transform .2s"><polyline points="6 9 12 15 18 9"/></svg>
                            </button>
                            {/if}
                        </div>
                        {#if expandedMobileCats.has(cat.id) && cat.children?.length > 0}
                        <div class="mm-subs">
                            {#each cat.children as child}
                                <a href={"/kategoria/" + (child.slug || child.id)} class="mm-sub" on:click={closeMobileMenu}>
                                    <span class="mm-sub__icon">
                                        {#if child.image_url}<img src={child.image_url} alt="">{:else}{getCategoryEmoji(child.name)}{/if}
                                    </span>
                                    <span class="mm-sub__name">{child.name}</span>
                                    {#if child.grandchildren?.length > 0}<span class="mm-sub__cnt">{child.grandchildren.length}</span>{/if}
                                </a>
                            {/each}
                        </div>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>
    {/if}
</div>
{/if}

<style>
:global(*) { box-sizing: border-box; margin: 0; padding: 0; }
:global(body) { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fff; color: #1f2937; line-height: 1.5; }
:global(a) { text-decoration: none; color: inherit; }
:global(img) { max-width: 100%; height: auto; }
:global(button) { cursor: pointer; border: none; background: none; font-family: inherit; }

.mp-site { display: flex; flex-direction: column; min-height: 100vh; }

/* HEADER */
.mp-header { background: #fff; border-bottom: 1px solid #f0f0f0; position: relative; z-index: 1000; }
.mp-header__inner { display: flex; align-items: center; gap: 20px; padding: 12px 32px; max-width: 1500px; margin: 0 auto; width: 100%; }
.mp-header__burger { display: none; width: 38px; height: 38px; align-items: center; justify-content: center; border: 1px solid #e5e7eb; border-radius: 10px; background: #fff; color: #374151; flex-shrink: 0; }
.mp-header__logo { flex-shrink: 0; }
.mp-header__logo-text { font-size: 22px; font-weight: 800; color: #c4956a; letter-spacing: -.5px; }
.mp-header__logo-img { display: block; }
.mp-search { flex: 1; display: flex; max-width: 600px; }
.mp-search__input { flex: 1; padding: 10px 16px; border: 2px solid #e5e7eb; border-right: none; border-radius: 10px 0 0 10px; font-size: 14px; outline: none; transition: border-color .2s; }
.mp-search__input:focus { border-color: #c4956a; }
.mp-search__btn { padding: 10px 20px; background: #c4956a; border: 2px solid #c4956a; border-radius: 0 10px 10px 0; color: #fff; display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; white-space: nowrap; }
.mp-search__btn:hover { background: #b8855c; border-color: #b8855c; }
.mp-header__actions { display: flex; gap: 4px; margin-left: auto; flex-shrink: 0; }
.mp-header__action { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 10px; border-radius: 8px; transition: .15s; position: relative; }
.mp-header__action:hover { background: #f3f4f6; }
.mp-header__action span:last-child { font-size: 10px; color: #6b7280; font-weight: 500; }
.mp-header__action-badge { position: absolute; top: 0; right: 2px; min-width: 16px; height: 16px; background: #ef4444; color: #fff; border-radius: 8px; font-size: 9px; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 4px; }
.mp-header__action-badge--blue { background: #3b82f6; }
@media (max-width: 768px) {
    .mp-header__inner { gap: 8px; padding: 8px 12px; }
    .mp-header__burger { display: flex; }
    .mp-search { display: none; }
    .mp-header__actions { gap: 0; }
    .mp-header__action { padding: 6px; }
    .mp-header__action span:last-child { display: none; }
}

/* CATEGORY NAV */
.mp-catnav { background: #fff; border-bottom: 1px solid #f0f0f0; position: sticky; top: 0; z-index: 999; transition: all .3s; }
.mp-catnav__inner { display: flex; align-items: center; max-width: 1500px; margin: 0 auto; position: relative; }
.mp-catnav__list { display: flex; overflow-x: auto; scrollbar-width: none; gap: 1px; padding: 6px 8px; flex: 1; }
.mp-catnav__list::-webkit-scrollbar { display: none; }
.mp-catnav__item { flex-shrink: 0; }
.mp-catnav__link { display: flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 8px; font-size: 13px; font-weight: 500; color: #374151; white-space: nowrap; transition: all .15s; }
.mp-catnav__link:hover, .mp-catnav__link.is-active { background: #f3f4f6; color: #c4956a; }
.mp-catnav__label { }
.cn-card__img { width: 26px; height: 26px; border-radius: 6px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #f3f4f6; flex-shrink: 0; }
.cn-card__img img { width: 100%; height: 100%; object-fit: cover; }
.cn-card__img span { font-size: 14px; }
.mp-catnav.is-collapsed { box-shadow: 0 2px 8px rgba(0,0,0,.06); }
.mp-catnav.is-collapsed .mp-catnav__link { padding: 5px 8px; font-size: 12px; }
.mp-catnav.is-collapsed .cn-card__img { width: 22px; height: 22px; border-radius: 5px; }
.mp-catnav__end { display: flex; align-items: center; gap: 6px; padding-right: 12px; padding-left: 8px; flex-shrink: 0; }
.mp-catnav__collapsed-actions { display: flex; align-items: center; gap: 6px; }
.mp-catnav__search-form { display: flex; }
.mp-catnav__search-input { width: 100px; padding: 5px 10px; border: 1.5px solid #e5e7eb; border-right: none; border-radius: 6px 0 0 6px; font-size: 11px; outline: none; transition: all 0.2s; }
.mp-catnav__search-input:focus { border-color: #c4956a; width: 130px; }
.mp-catnav__search-btn { padding: 5px 10px; background: #c4956a; border: none; border-radius: 0 6px 6px 0; color: #fff; }
.mp-catnav__action { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 6px; color: #4b5563; transition: all 0.2s; }
.mp-catnav__action:hover { background: #f3f4f6; color: #c4956a; }
.cn-more { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; color: #6b7280; flex-shrink: 0; transition: all 0.2s; }
.cn-more:hover { background: #f3f4f6; color: #c4956a; border-color: #c4956a; }
@media (max-width: 768px) {
    .mp-catnav__inner { padding: 0 0 0 8px; }
    .mp-catnav__list { padding: 6px 0 6px 0; gap: 3px; }
    .mp-catnav__end { padding-right: 8px; padding-left: 12px; }
    .mp-catnav__collapsed-actions { display: none !important; }
}

/* ALL CATEGORIES DROPDOWN */
.cn-drop__overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 1001; animation: fadeIn 0.2s; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.cn-drop { position: absolute; top: 100%; right: 20px; width: 700px; max-width: 95vw; max-height: 70vh; background: #fff; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); z-index: 1002; overflow: hidden; animation: dropSlide 0.2s ease; }
@keyframes dropSlide { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
.cn-drop__head { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; border-bottom: 1px solid #f3f4f6; }
.cn-drop__head h3 { font-size: 15px; font-weight: 600; color: #1f2937; }
.cn-drop__head button { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: none; background: #f3f4f6; border-radius: 8px; color: #6b7280; transition: all 0.2s; }
.cn-drop__head button:hover { background: #fee2e2; color: #ef4444; }
.cn-drop__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; padding: 8px; max-height: calc(70vh - 56px); overflow-y: auto; }
.cn-drop__item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; transition: background 0.15s; }
.cn-drop__item:hover { background: #fef7f0; }
.cn-drop__item-img { width: 32px; height: 32px; border-radius: 8px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
.cn-drop__item-img img { width: 100%; height: 100%; object-fit: cover; }
.cn-drop__item-img span { font-size: 14px; }
.cn-drop__item-name { font-size: 13px; font-weight: 600; color: #374151; display: block; }
.cn-drop__item-count { font-size: 11px; color: #9ca3af; }
.cn-drop__head-actions { display: flex; align-items: center; gap: 8px; }
.cn-drop__edit-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: 1px solid #e5e7eb; background: #fff; border-radius: 8px; color: #6b7280; transition: all 0.2s; }
.cn-drop__edit-btn:hover { background: #f3f4f6; color: #c4956a; border-color: #c4956a; }
.cn-drop__edit-btn.is-active { background: #c4956a; color: #fff; border-color: #c4956a; }
.cn-drop__show-all-btn { padding: 4px 10px; background: #fff; border: 1px solid #c4956a; border-radius: 6px; color: #c4956a; font-size: 11px; font-weight: 600; transition: all 0.2s; }
.cn-drop__show-all-btn:hover { background: #c4956a; color: #fff; }
.cn-drop__hidden-badge { font-size: 11px; font-weight: 500; color: #ef4444; margin-left: 6px; }
.cn-drop__grid.is-edit { grid-template-columns: 1fr; gap: 0; }
.cn-drop__cat-group { border-bottom: 1px solid #f3f4f6; }
.cn-drop__cat-group:last-child { border-bottom: none; }
.cn-drop__cat-group.is-hidden { opacity: 0.45; }
.cn-drop__item-row { display: flex; align-items: center; gap: 4px; }
.cn-drop__item-row .cn-drop__item { flex: 1; }
.cn-vis-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: 1px solid #e5e7eb; background: #fff; border-radius: 6px; color: #16a34a; flex-shrink: 0; transition: all 0.15s; font-size: 14px; }
.cn-vis-btn:hover { background: #f3f4f6; }
.cn-vis-btn.is-hidden { color: #ef4444; border-color: #fecaca; background: #fef2f2; }

/* MEGA MENU */
.mp-mega { position: absolute; left: 0; right: 0; top: 100%; background: #fff; border-top: 1px solid #e5e7eb; box-shadow: 0 20px 40px rgba(0,0,0,0.12); z-index: 999; animation: megaDrop 0.2s ease; }
@keyframes megaDrop { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
.mp-mega__container { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px 16px; padding: 20px 32px; max-height: 50vh; overflow-y: auto; }
.mp-mega__col { padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
.mp-mega__col:nth-last-child(-n+4) { border-bottom: none; }
.mp-mega__subcat { display: flex; align-items: center; gap: 12px; padding: 4px 0; transition: all 0.15s; margin-bottom: 4px; }
.mp-mega__subcat:hover .mp-mega__subcat-name { color: #c4956a; }
.mp-mega__subcat-img { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
.mp-mega__subcat-img img { width: 100%; height: 100%; object-fit: contain; }
.mp-mega__subcat-img span { font-size: 14px; font-weight: 600; color: #9ca3af; width: 36px; height: 36px; background: #f3f4f6; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
.mp-mega__subcat-name { font-size: 14px; font-weight: 700; color: #1f2937; line-height: 1.2; }
.mp-mega__links { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 0; padding: 2px 0 6px 0; margin: 0; line-height: 1.7; }
.mp-mega__link { font-size: 12px; color: #6b7280; padding: 0; transition: color 0.15s; white-space: nowrap; }
.mp-mega__link::before { content: '·'; color: #9ca3af; margin: 0 5px; }
.mp-mega__link:hover { color: #c4956a; }
@media (max-width: 1200px) { .mp-mega__container { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 900px) { .mp-mega__container { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) { .mp-mega { display: none; } }

/* FOOTER */
.mp-main { flex: 1; }
.mp-footer { background: #1f2937; color: #fff; margin-top: auto; }
.mp-footer__top { padding: 48px 20px; }
.mp-footer__inner { padding: 0 32px; }
.mp-footer__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; }
.mp-footer__col h4 { font-size: 14px; font-weight: 700; margin-bottom: 16px; color: #fff; }
.mp-footer__col ul { list-style: none; }
.mp-footer__col li { margin-bottom: 8px; }
.mp-footer__col a { color: rgba(255,255,255,0.7); font-size: 14px; transition: color 0.2s; }
.mp-footer__col a:hover { color: #fff; }
.mp-footer__col p { color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.8; }
.mp-footer__bottom { background: rgba(0,0,0,0.2); padding: 16px 32px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: rgba(255,255,255,0.6); }
.mp-footer__links { display: flex; gap: 20px; }
.mp-footer__links a { color: rgba(255,255,255,0.6); }
.mp-footer__links a:hover { color: #fff; }
@media (max-width: 768px) { .mp-footer__grid { grid-template-columns: repeat(2, 1fr); gap: 24px; } .mp-footer__top { padding: 32px 20px; } .mp-footer { padding-bottom: 70px; } .mp-footer__bottom { flex-direction: column; gap: 12px; text-align: center; } }

/* BOTTOM NAV */
.mp-bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; border-top: 1px solid #e5e7eb; display: none; justify-content: space-around; padding: 8px 0 calc(8px + env(safe-area-inset-bottom)); z-index: 1100; }
.mp-bottom-nav__item { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 4px 12px; color: #6b7280; font-size: 10px; font-weight: 500; background: none; border: none; font-family: inherit; }
.mp-bottom-nav__item.is-active, .mp-bottom-nav__item:hover { color: #c4956a; }
@media (max-width: 768px) { .mp-bottom-nav { display: flex; } }

/* MOBILE CATEGORY DRAWER — Tree */
.mm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 2000; animation: fadeIn .2s; }
.mm-drawer { position: fixed; top: 0; left: 0; bottom: 0; width: 78vw; max-width: 340px; background: #fff; z-index: 2001; display: flex; flex-direction: column; animation: slideIn 0.25s cubic-bezier(.25,.46,.45,.94); box-shadow: 4px 0 24px rgba(0,0,0,.18); }
@keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
.mm-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: #0f172a; color: #fff; flex-shrink: 0; }
.mm-title { font-size: 16px; font-weight: 700; }
.mm-close { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,.1); border-radius: 8px; color: #fff; }
.mm-body { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; }
.mm-cat { border-bottom: 1px solid #f1f5f9; }
.mm-cat__row { display: flex; align-items: center; }
.mm-cat__link { flex: 1; display: flex; align-items: center; gap: 10px; padding: 12px 14px; color: #1e293b; font-weight: 600; font-size: 14px; min-width: 0; }
.mm-cat__icon { width: 34px; height: 34px; border-radius: 8px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; font-size: 16px; }
.mm-cat__icon img { width: 100%; height: 100%; object-fit: cover; }
.mm-cat__name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mm-cat__toggle { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; color: #94a3b8; flex-shrink: 0; }
.mm-cat--open > .mm-cat__row { background: #f8fafc; }
.mm-cat--open > .mm-cat__row .mm-cat__toggle { color: #c4956a; }
.mm-subs { background: #f8fafc; padding: 0 0 6px 0; animation: expandIn .2s ease; }
@keyframes expandIn { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 600px; } }
.mm-sub { display: flex; align-items: center; gap: 8px; padding: 8px 14px 8px 42px; color: #475569; font-size: 13px; transition: background .1s; }
.mm-sub:hover { background: rgba(196,149,106,.06); color: #c4956a; }
.mm-sub__icon { width: 24px; height: 24px; border-radius: 6px; background: #e2e8f0; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; font-size: 11px; }
.mm-sub__icon img { width: 100%; height: 100%; object-fit: cover; }
.mm-sub__name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mm-sub__cnt { width: 18px; height: 18px; border-radius: 4px; background: #e2e8f0; color: #64748b; font-size: 9px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
</style>
