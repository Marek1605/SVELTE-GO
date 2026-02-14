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

    $: navCategories = (data?.navCategories || []).map(cat => {
        const children = (cat.children || []).map(child => {
            const grandchildren = (child.children || []).slice(0, 15);
            return { ...child, grandchildren };
        });
        return { ...cat, children };
    });

    // Filtered categories for nav bar (excludes hidden)
    $: visibleCategories = navCategories.filter(cat => !hiddenCats.has(cat.id));
    // Count hidden
    $: hiddenCount = navCategories.reduce((count, cat) => {
        if (hiddenCats.has(cat.id)) return count + 1;
        const hiddenChildren = (cat.children || []).filter(c => hiddenCats.has(c.id)).length;
        return count + hiddenChildren;
    }, 0);

    function handleSearch(e) { e.preventDefault(); if (searchQuery.trim()) window.location.href = `/hladat?q=${encodeURIComponent(searchQuery)}`; }
    function handleCatnavSearch(e) { e.preventDefault(); if (catnavSearchQuery.trim()) window.location.href = `/hladat?q=${encodeURIComponent(catnavSearchQuery)}`; }
    function scrollCategories(direction) { const list = document.querySelector('.mp-catnav__list'); if (list) list.scrollBy({ left: direction * 200, behavior: 'smooth' }); }
    function closeMobileMenu() { mobileMenuOpen = false; document.body.style.overflow = ''; }
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

        // Load hidden categories
        try {
            const hidden = localStorage.getItem('mp_hidden_cats');
            if (hidden) hiddenCats = new Set(JSON.parse(hidden));
        } catch(e) {}

        // Listen for admin style changes
        const onStorage = (e) => {
            if (e.key === 'mp_catnav_style' && e.newValue) catNavStyle = e.newValue;
        };
        window.addEventListener('storage', onStorage);

        // Load site logo
        fetch('http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io/api/v1/site/settings')
            .then(r => r.json())
            .then(d => { if (d?.data?.logo_url) logoUrl = d.data.logo_url; })
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
            <a href="/" class="mp-header__logo">
                {#if logoUrl}
                    <img src={logoUrl} alt="MegaPrice" class="mp-header__logo-img" />
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
                <a href="/ucet" class="mp-header__action"><span class="mp-header__action-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span><span>Môj účet</span></a>
                <a href="/oblubene" class="mp-header__action"><span class="mp-header__action-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>{#if wishlistCount > 0}<span class="mp-header__action-badge">{wishlistCount}</span>{/if}</span><span>Obľúbené</span></a>
                <a href="/porovnanie" class="mp-header__action"><span class="mp-header__action-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 2l4 4-4 4"/><path d="M3 6h18"/><path d="M7 14l-4 4 4 4"/><path d="M21 18H3"/></svg>{#if compareCount > 0}<span class="mp-header__action-badge mp-header__action-badge--blue">{compareCount}</span>{/if}</span><span>Porovnať</span></a>
                <a href="/kosik" class="mp-header__action mp-header__action--cart"><span class="mp-header__action-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg></span><span>Košík</span></a>
            </nav>
        </div>
    </header>

    <nav class="mp-catnav" class:is-collapsed={isCollapsed}>
        <div class="mp-catnav__inner">
            <button class="mp-catnav__arrow mp-catnav__arrow--left" on:click={() => scrollCategories(-1)}>‹</button>

            <div class="mp-catnav__list">
                {#if catNavStyle === 'pills'}
                    {#each visibleCategories as cat}
                        <a href={"/kategoria/" + (cat.slug || cat.id)} class="cn-pill" class:is-active={activeCategoryId === cat.id}
                            on:mouseenter={() => handleCategoryMouseEnter(cat)} on:mouseleave={handleCategoryMouseLeave}>
                            <span class="cn-pill__ico">
                                {#if cat.image_url}<img src={cat.image_url} alt="">{:else}<span>{getCategoryEmoji(cat.name)}</span>{/if}
                            </span>
                            <span class="cn-pill__txt">{cat.name}</span>
                        </a>
                    {/each}

                {:else if catNavStyle === 'icons'}
                    {#each visibleCategories as cat}
                        <a href={"/kategoria/" + (cat.slug || cat.id)} class="cn-ico" class:is-active={activeCategoryId === cat.id}
                            on:mouseenter={() => handleCategoryMouseEnter(cat)} on:mouseleave={handleCategoryMouseLeave}>
                            <div class="cn-ico__circle">
                                {#if cat.image_url}<img src={cat.image_url} alt="">{:else}<span>{getCategoryEmoji(cat.name)}</span>{/if}
                            </div>
                            <span class="cn-ico__name">{cat.name}</span>
                        </a>
                    {/each}

                {:else if catNavStyle === 'minimal'}
                    {#each visibleCategories as cat}
                        <a href={"/kategoria/" + (cat.slug || cat.id)} class="cn-min" class:is-active={activeCategoryId === cat.id}
                            on:mouseenter={() => handleCategoryMouseEnter(cat)} on:mouseleave={handleCategoryMouseLeave}>
                            {cat.name}
                        </a>
                    {/each}

                {:else if catNavStyle === 'cards'}
                    {#each visibleCategories as cat}
                        <a href={"/kategoria/" + (cat.slug || cat.id)} class="cn-card" class:is-active={activeCategoryId === cat.id}
                            on:mouseenter={() => handleCategoryMouseEnter(cat)} on:mouseleave={handleCategoryMouseLeave}>
                            <div class="cn-card__img">
                                {#if cat.image_url}<img src={cat.image_url} alt="">{:else}<span>{getCategoryEmoji(cat.name)}</span>{/if}
                            </div>
                            <span class="cn-card__name">{cat.name}</span>
                        </a>
                    {/each}
                {/if}
            </div>

            <button class="mp-catnav__arrow mp-catnav__arrow--right" on:click={() => scrollCategories(1)}>›</button>

            <!-- END SECTION: always visible, contains ≡ + collapsed search/actions -->
            <div class="mp-catnav__end">
                <button class="cn-more" on:click={toggleAllCats} title="Všetky kategórie">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                </button>
                {#if isCollapsed}
                    <div class="mp-catnav__collapsed-actions">
                        <form class="mp-catnav__search-form" on:submit={handleCatnavSearch}>
                            <input type="text" class="mp-catnav__search-input" placeholder="Hľadať..." bind:value={catnavSearchQuery}>
                            <button type="submit" class="mp-catnav__search-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button>
                        </form>
                        <a href="/oblubene" class="mp-catnav__action"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></a>
                        <a href="/porovnanie" class="mp-catnav__action mp-catnav__compare"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 2l4 4-4 4"/><path d="M3 6h18"/><path d="M7 14l-4 4 4 4"/><path d="M21 18H3"/></svg></a>
                        <a href="/kosik" class="mp-catnav__action"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg></a>
                    </div>
                {/if}
            </div>
        </div>

        <!-- MEGA MENU -->
        {#if megaMenuOpen && activeCategoryData}
            <div class="mp-mega" on:mouseenter={cancelMegaClose} on:mouseleave={scheduleMegaClose}>
                <div class="mp-mega__container">
                    {#each (activeCategoryData.children || []).filter(c => !hiddenCats.has(c.id)) as subcategory}
                        <div class="mp-mega__col">
                            <a href={"/kategoria/" + (subcategory.slug || subcategory.id)} class="mp-mega__subcat">
                                <div class="mp-mega__subcat-img">
                                    {#if subcategory.image_url}<img src={subcategory.image_url} alt="">{:else}<span>{getInitial(subcategory.name)}</span>{/if}
                                </div>
                                <span class="mp-mega__subcat-name">{subcategory.name}</span>
                            </a>
                            {#if subcategory.grandchildren && subcategory.grandchildren.filter(g => !hiddenCats.has(g.id)).length > 0}
                                <div class="mp-mega__links">
                                    {#each subcategory.grandchildren.filter(g => !hiddenCats.has(g.id)).slice(0, 10) as grandchild}
                                        <a href={"/kategoria/" + (grandchild.slug || grandchild.id)} class="mp-mega__link">{grandchild.name}</a>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>
        {/if}

        <!-- ALL CATEGORIES DROPDOWN -->
        {#if showAllCats}
            <div class="cn-drop__overlay" on:click={closeAllCats}></div>
            <div class="cn-drop">
                <div class="cn-drop__head">
                    <h3>Všetky kategórie ({navCategories.length}){#if hiddenCount > 0}<span class="cn-drop__hidden-badge">{hiddenCount} skrytých</span>{/if}</h3>
                    <div class="cn-drop__head-actions">
                        <button class="cn-drop__edit-btn" class:is-active={editMode} on:click={toggleEditMode} title="Upraviť viditeľnosť">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        {#if editMode && hiddenCount > 0}
                            <button class="cn-drop__show-all-btn" on:click={showAllCategories}>Zobraziť všetky</button>
                        {/if}
                        <button on:click={closeAllCats}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                    </div>
                </div>
                <div class="cn-drop__grid" class:is-edit={editMode}>
                    {#each navCategories as cat}
                        <div class="cn-drop__cat-group" class:is-hidden={hiddenCats.has(cat.id)}>
                            <div class="cn-drop__item-row">
                                <a href={editMode ? null : "/kategoria/" + (cat.slug || cat.id)} class="cn-drop__item" on:click={() => { if (!editMode) closeAllCats(); }}>
                                    <div class="cn-drop__item-img">
                                        {#if cat.image_url}<img src={cat.image_url} alt="">{:else}<span>{getCategoryEmoji(cat.name)}</span>{/if}
                                    </div>
                                    <div>
                                        <span class="cn-drop__item-name">{cat.name}</span>
                                        {#if cat.children?.length}<span class="cn-drop__item-count">{cat.children.length} podkategórií</span>{/if}
                                    </div>
                                </a>
                                {#if editMode}
                                    <button class="cn-vis-btn" class:is-hidden={hiddenCats.has(cat.id)} on:click|stopPropagation={() => toggleHideCat(cat.id)} title={hiddenCats.has(cat.id) ? 'Zobraziť' : 'Skryť'}>
                                        {#if hiddenCats.has(cat.id)}
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                        {:else}
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                        {/if}
                                    </button>
                                {/if}
                            </div>
                            <!-- Subcategories in edit mode -->
                            {#if editMode && cat.children?.length > 0 && !hiddenCats.has(cat.id)}
                                <div class="cn-drop__subcats">
                                    {#each cat.children as sub}
                                        <div class="cn-drop__subcat-row" class:is-hidden={hiddenCats.has(sub.id)}>
                                            <span class="cn-drop__subcat-name">{sub.name}</span>
                                            <button class="cn-vis-btn cn-vis-btn--sm" class:is-hidden={hiddenCats.has(sub.id)} on:click|stopPropagation={() => toggleHideCat(sub.id)}>
                                                {#if hiddenCats.has(sub.id)}
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                                {:else}
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                                {/if}
                                            </button>
                                        </div>
                                    {/each}
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
        <div class="mp-footer__top"><div class="mp-footer__inner"><div class="mp-footer__grid">
            <div class="mp-footer__col"><h4>O nás</h4><ul><li><a href="/o-nas">O MegaPrice</a></li><li><a href="/kontakt">Kontakt</a></li><li><a href="/kariera">Kariéra</a></li></ul></div>
            <div class="mp-footer__col"><h4>Pre zákazníkov</h4><ul><li><a href="/ako-nakupovat">Ako nakupovať</a></li><li><a href="/obchodne-podmienky">Obchodné podmienky</a></li><li><a href="/ochrana-udajov">Ochrana údajov</a></li></ul></div>
            <div class="mp-footer__col"><h4>Pre predajcov</h4><ul><li><a href="/prihlasenie-predajcu">Prihlásenie predajcu</a></li><li><a href="/registracia-predajcu">Registrácia predajcu</a></li><li><a href="/ako-to-funguje">Ako to funguje</a></li></ul></div>
            <div class="mp-footer__col"><h4>Kontakt</h4><p><a href="mailto:info@megaprice.sk">info@megaprice.sk</a><br>+421 xxx xxx xxx</p></div>
        </div></div></div>
        <div class="mp-footer__bottom"><p>© 2026 megaprice. Všetky práva vyhradené.</p><div class="mp-footer__links"><a href="/obchodne-podmienky">Obchodné podmienky</a><a href="/ochrana-udajov">GDPR</a><a href="/cookies">Cookies</a></div></div>
    </footer>

    <nav class="mp-bottom-nav">
        <a href="/" class="mp-bottom-nav__item" class:is-active={$page.url.pathname === '/'}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg><span>Domov</span></a>
        <a href="/kategorie" class="mp-bottom-nav__item"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg><span>Kategórie</span></a>
        <a href="/oblubene" class="mp-bottom-nav__item"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span>Obľúbené</span></a>
        <a href="/ucet" class="mp-bottom-nav__item"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>Účet</span></a>
    </nav>

    {#if mobileMenuOpen}
        <div class="mp-mobile-overlay" on:click={closeMobileMenu}></div>
        <div class="mp-mobile-menu">
            <div class="mp-mobile-menu__header">
                <span class="mp-mobile-menu__title">Kategórie</span>
                <button class="mp-mobile-menu__close" on:click={closeMobileMenu}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <div class="mp-mobile-menu__content">
                {#each visibleCategories as cat}
                    <a href={"/kategoria/" + (cat.slug || cat.id)} class="mp-mobile-menu__link" on:click={closeMobileMenu}>
                        <span class="mp-mobile-menu__icon">{getCategoryEmoji(cat.name)}</span>{cat.name}
                    </a>
                {/each}
            </div>
        </div>
    {/if}
</div>
{/if}

<style>
:global(*) { box-sizing: border-box; margin: 0; padding: 0; }
:global(body) { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1f2937; line-height: 1.5; }
:global(a) { text-decoration: none; color: inherit; }
:global(img) { max-width: 100%; height: auto; }
:global(button) { cursor: pointer; font-family: inherit; }
.mp-site { min-height: 100vh; display: flex; flex-direction: column; }

/* HEADER */
.mp-header { background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.08); position: relative; z-index: 1000; }
.mp-header__inner { display: flex; align-items: center; gap: 24px; padding: 12px 20px; max-width: 1400px; margin: 0 auto; }
.mp-header__logo { flex-shrink: 0; }
.mp-header__logo-text { font-size: 24px; font-weight: 700; color: #ff6b35; }
.mp-header__logo-img { height: 40px; max-width: 200px; object-fit: contain; display: block; }
.mp-search { flex: 1; max-width: 600px; margin: 0 auto; display: flex; }
.mp-search__input { flex: 1; padding: 12px 20px; border: 2px solid #e5e7eb; border-right: none; border-radius: 10px 0 0 10px; font-size: 15px; outline: none; transition: border-color 0.2s; }
.mp-search__input:focus { border-color: #ff6b35; }
.mp-search__input::placeholder { color: #9ca3af; }
.mp-search__btn { padding: 12px 24px; background: #ff6b35; border: none; border-radius: 0 10px 10px 0; color: #fff; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 8px; transition: background 0.2s; }
.mp-search__btn:hover { background: #e55a2b; }
.mp-header__actions { display: flex; gap: 6px; flex-shrink: 0; }
.mp-header__action { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 8px 12px; border-radius: 10px; color: #4b5563; font-size: 11px; font-weight: 500; transition: all 0.2s; }
.mp-header__action:hover { background: #f3f4f6; color: #ff6b35; }
.mp-header__action--cart { background: #ff6b35; color: #fff !important; }
.mp-header__action--cart:hover { background: #e55a2b; }
.mp-header__action-icon { position: relative; display: flex; }
.mp-header__action-badge { position: absolute; top: -6px; right: -6px; background: #ff6b35; color: #fff; font-size: 10px; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.mp-header__action-badge--blue { background: #3b82f6; }
@media (max-width: 768px) {
    .mp-header__inner { gap: 12px; padding: 10px 16px; }
    .mp-search { display: none; }
    .mp-header__actions { gap: 4px; }
    .mp-header__action { padding: 8px; }
    .mp-header__action span:last-child { display: none; }
}

/* ═══ CATNAV ═══ */
.mp-catnav { background: #fff; border-bottom: 1px solid #e5e7eb; position: sticky; top: 0; z-index: 998; }
.mp-catnav__inner { display: flex; align-items: center; max-width: 100%; padding: 0 0 0 16px; position: relative; }
.mp-catnav__list { display: flex; gap: 4px; flex: 1; min-width: 0; overflow: hidden; padding: 6px 0; }
.mp-catnav__list::-webkit-scrollbar { display: none; }

/* END SECTION - ≡ covers any partial category with white bg */
.mp-catnav__end { display: flex; align-items: center; gap: 6px; flex-shrink: 0; padding: 0 12px 0 16px; position: relative; z-index: 5; background: #fff; }
.mp-catnav__end::before { content: ''; position: absolute; left: -20px; top: 0; bottom: 0; width: 20px; background: linear-gradient(to right, transparent, #fff); pointer-events: none; }
.mp-catnav__collapsed-actions { display: flex; align-items: center; gap: 8px; padding-left: 8px; border-left: 1px solid #e5e7eb; animation: fadeActions 0.2s ease; }
@keyframes fadeActions { from { opacity: 0; } to { opacity: 1; } }

/* PILLS variant */
.cn-pill { display: flex; align-items: center; gap: 8px; padding: 6px 14px 6px 6px; background: #f3f4f6; border: 1.5px solid transparent; border-radius: 100px; color: #374151; font-weight: 600; font-size: 13px; white-space: nowrap; transition: all 0.2s; flex-shrink: 0; }
.cn-pill:hover { background: #fef7f0; border-color: #c4956a; color: #c4956a; }
.cn-pill.is-active { background: #c4956a; color: #fff; border-color: #c4956a; }
.cn-pill__ico { width: 28px; height: 28px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
.cn-pill__ico img { width: 100%; height: 100%; object-fit: cover; }
.cn-pill__ico span { font-size: 14px; }
.cn-pill.is-active .cn-pill__ico { background: rgba(255,255,255,0.25); }
.cn-pill__txt { line-height: 1; }

/* ICONS variant */
.cn-ico { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 4px 8px; border-radius: 10px; transition: all 0.2s; flex-shrink: 0; }
.cn-ico:hover { background: #fef7f0; }
.cn-ico.is-active .cn-ico__circle { border-color: #c4956a; box-shadow: 0 0 0 3px rgba(196,149,106,0.15); }
.cn-ico__circle { width: 44px; height: 44px; border-radius: 50%; border: 2px solid #e5e7eb; background: #fff; display: flex; align-items: center; justify-content: center; overflow: hidden; transition: all 0.2s; }
.cn-ico:hover .cn-ico__circle { border-color: #c4956a; transform: scale(1.08); }
.cn-ico__circle img { width: 100%; height: 100%; object-fit: cover; }
.cn-ico__circle span { font-size: 18px; }
.cn-ico__name { font-size: 10px; font-weight: 500; color: #6b7280; max-width: 64px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: center; }
.cn-ico:hover .cn-ico__name { color: #c4956a; }

/* MINIMAL variant */
.cn-min { padding: 12px 18px; font-size: 14px; font-weight: 500; color: #4b5563; position: relative; white-space: nowrap; transition: color 0.2s; flex-shrink: 0; }
.cn-min::after { content: ''; position: absolute; bottom: 0; left: 18px; right: 18px; height: 2px; background: #c4956a; transform: scaleX(0); transition: transform 0.2s; }
.cn-min:hover { color: #c4956a; }
.cn-min:hover::after, .cn-min.is-active::after { transform: scaleX(1); }
.cn-min.is-active { color: #c4956a; font-weight: 600; }

/* CARDS variant */
.cn-card { display: flex; align-items: center; gap: 8px; padding: 7px 14px 7px 7px; background: rgba(243,244,246,0.6); border: 1px solid #e5e7eb; border-radius: 12px; font-size: 13px; font-weight: 600; color: #374151; white-space: nowrap; transition: all 0.2s; flex-shrink: 0; }
.cn-card:hover { background: #fff; border-color: #c4956a; box-shadow: 0 4px 12px rgba(196,149,106,0.1); transform: translateY(-1px); }
.cn-card.is-active { background: #c4956a; color: #fff; border-color: #c4956a; }
.cn-card__img { width: 32px; height: 32px; border-radius: 8px; background: #fff; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
.cn-card__img img { width: 100%; height: 100%; object-fit: cover; }
.cn-card__img span { font-size: 16px; }
.cn-card__name { line-height: 1; }

/* Collapsed sizes - compact but readable */
.mp-catnav.is-collapsed { border-bottom: 1px solid #f3f4f6; }
.mp-catnav.is-collapsed .mp-catnav__inner { padding: 0 0 0 12px; }
.mp-catnav.is-collapsed .mp-catnav__list { padding: 4px 0; gap: 3px; }
.mp-catnav.is-collapsed .mp-catnav__end { padding: 0 8px 0 12px; gap: 4px; }
.mp-catnav.is-collapsed .cn-pill { padding: 3px 8px 3px 3px; font-size: 12px; gap: 5px; font-weight: 700; color: #1f2937; }
.mp-catnav.is-collapsed .cn-pill__ico { width: 20px; height: 20px; }
.mp-catnav.is-collapsed .cn-pill__ico span { font-size: 10px; }
.mp-catnav.is-collapsed .cn-ico { padding: 2px 6px; gap: 2px; }
.mp-catnav.is-collapsed .cn-ico__circle { width: 28px; height: 28px; border-width: 1.5px; }
.mp-catnav.is-collapsed .cn-ico__name { font-size: 10px; max-width: 56px; font-weight: 600; color: #374151; }
.mp-catnav.is-collapsed .cn-min { padding: 6px 10px; font-size: 12px; font-weight: 700; color: #1f2937; }
.mp-catnav.is-collapsed .cn-card { padding: 3px 8px 3px 3px; font-size: 12px; font-weight: 700; color: #1f2937; }
.mp-catnav.is-collapsed .cn-card__img { width: 22px; height: 22px; border-radius: 5px; }
.mp-catnav.is-collapsed .cn-more { width: 28px; height: 28px; }
.mp-catnav.is-collapsed .cn-more svg { width: 14px; height: 14px; }

/* RIGHT PANEL (now inside end section) */
.mp-catnav__search-form { display: flex; }
.mp-catnav__search-input { width: 100px; padding: 5px 10px; border: 1.5px solid #e5e7eb; border-right: none; border-radius: 6px 0 0 6px; font-size: 11px; outline: none; transition: all 0.2s; }
.mp-catnav__search-input:focus { border-color: #ff6b35; width: 130px; }
.mp-catnav__search-btn { padding: 5px 10px; background: #ff6b35; border: none; border-radius: 0 6px 6px 0; color: #fff; }
.mp-catnav__action { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 6px; color: #4b5563; transition: all 0.2s; }
.mp-catnav__action:hover { background: #f3f4f6; color: #ff6b35; }
.mp-catnav__compare:hover { color: #3b82f6; }

/* ARROWS (mobile) */
.mp-catnav__arrow { display: none; }

/* MORE BUTTON (≡) */
.cn-more { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; color: #6b7280; flex-shrink: 0; transition: all 0.2s; }
.cn-more:hover { background: #f3f4f6; color: #c4956a; border-color: #c4956a; }

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

/* EDIT MODE */
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
.cn-vis-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: 1px solid #e5e7eb; background: #fff; border-radius: 6px; color: #16a34a; flex-shrink: 0; transition: all 0.15s; }
.cn-vis-btn:hover { background: #f3f4f6; }
.cn-vis-btn.is-hidden { color: #ef4444; border-color: #fecaca; background: #fef2f2; }
.cn-vis-btn--sm { width: 24px; height: 24px; }
.cn-drop__subcats { padding: 2px 8px 8px 52px; display: flex; flex-wrap: wrap; gap: 4px; }
.cn-drop__subcat-row { display: flex; align-items: center; gap: 4px; padding: 3px 8px; background: #f9fafb; border-radius: 6px; transition: opacity 0.15s; }
.cn-drop__subcat-row.is-hidden { opacity: 0.45; }
.cn-drop__subcat-name { font-size: 12px; color: #4b5563; white-space: nowrap; }
@media (max-width: 768px) {
    .mp-catnav__inner { padding: 0 0 0 8px; }
    .mp-catnav__list { padding: 6px 0 6px 0; gap: 3px; }
    .mp-catnav__end { padding-right: 8px; padding-left: 12px; }
    .mp-catnav__collapsed-actions { display: none !important; }
    .mp-catnav__arrow { display: none; }
}

/* MEGA MENU */
.mp-mega { position: absolute; left: 0; right: 0; top: 100%; background: #fff; border-top: 1px solid #e5e7eb; box-shadow: 0 20px 40px rgba(0,0,0,0.12); z-index: 999; animation: megaDrop 0.2s ease; }
@keyframes megaDrop { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
.mp-mega__container { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px 16px; max-width: 1400px; margin: 0 auto; padding: 20px 24px; max-height: 50vh; overflow-y: auto; }
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
.mp-mega__link::before { content: '•'; color: #9ca3af; margin: 0 5px; }
.mp-mega__link:hover { color: #c4956a; }
@media (max-width: 1200px) { .mp-mega__container { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 900px) { .mp-mega__container { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) { .mp-mega { display: none; } }

/* FOOTER */
.mp-main { flex: 1; }
.mp-footer { background: #1f2937; color: #fff; margin-top: auto; }
.mp-footer__top { padding: 48px 20px; }
.mp-footer__inner { max-width: 1400px; margin: 0 auto; }
.mp-footer__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; }
.mp-footer__col h4 { font-size: 14px; font-weight: 700; margin-bottom: 16px; color: #fff; }
.mp-footer__col ul { list-style: none; }
.mp-footer__col li { margin-bottom: 8px; }
.mp-footer__col a { color: rgba(255,255,255,0.7); font-size: 14px; transition: color 0.2s; }
.mp-footer__col a:hover { color: #fff; }
.mp-footer__col p { color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.8; }
.mp-footer__bottom { background: rgba(0,0,0,0.2); padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: rgba(255,255,255,0.6); max-width: 1400px; margin: 0 auto; }
.mp-footer__links { display: flex; gap: 20px; }
.mp-footer__links a { color: rgba(255,255,255,0.6); }
.mp-footer__links a:hover { color: #fff; }
@media (max-width: 768px) { .mp-footer__grid { grid-template-columns: repeat(2, 1fr); gap: 24px; } .mp-footer__top { padding: 32px 20px; } .mp-footer { padding-bottom: 70px; } .mp-footer__bottom { flex-direction: column; gap: 12px; text-align: center; } }

/* BOTTOM NAV */
.mp-bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; border-top: 1px solid #e5e7eb; display: none; justify-content: space-around; padding: 8px 0 calc(8px + env(safe-area-inset-bottom)); z-index: 1100; }
.mp-bottom-nav__item { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 4px 12px; color: #6b7280; font-size: 10px; font-weight: 500; }
.mp-bottom-nav__item.is-active, .mp-bottom-nav__item:hover { color: #ff6b35; }
@media (max-width: 768px) { .mp-bottom-nav { display: flex; } }

/* MOBILE MENU */
.mp-mobile-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1200; }
.mp-mobile-menu { position: fixed; top: 0; left: 0; bottom: 0; width: 300px; max-width: 85vw; background: #fff; z-index: 1300; display: flex; flex-direction: column; animation: slideIn 0.3s ease; }
@keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
.mp-mobile-menu__header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: linear-gradient(135deg, #ff6b35, #e55a2b); color: #fff; }
.mp-mobile-menu__title { font-size: 18px; font-weight: 700; }
.mp-mobile-menu__close { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.2); border: none; border-radius: 50%; color: #fff; }
.mp-mobile-menu__content { flex: 1; overflow-y: auto; padding: 8px; }
.mp-mobile-menu__link { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 10px; color: #374151; font-weight: 500; font-size: 15px; }
.mp-mobile-menu__link:hover { background: #f3f4f6; }
.mp-mobile-menu__icon { font-size: 18px; }
</style>
