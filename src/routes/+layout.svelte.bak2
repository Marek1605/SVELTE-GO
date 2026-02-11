<script>
    import { page } from '$app/stores';
    import { api } from '$lib/api';
    import { onMount } from 'svelte';
    import '../app.css';
    
    let searchQuery = '';
    let catnavSearchQuery = '';
    let isCollapsed = false;
    let wishlistCount = 0;
    let compareCount = 0;
    let navCategories = [];
    let mobileMenuOpen = false;
    
    let megaMenuOpen = false;
    let activeCategoryId = null;
    let activeCategoryData = null;
    let closeTimeout = null;

    function handleSearch(e) {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/hladat?q=${encodeURIComponent(searchQuery)}`;
        }
    }

    function handleCatnavSearch(e) {
        e.preventDefault();
        if (catnavSearchQuery.trim()) {
            window.location.href = `/hladat?q=${encodeURIComponent(catnavSearchQuery)}`;
        }
    }

    function scrollCategories(direction) {
        const list = document.querySelector('.mp-catnav__list');
        if (list) {
            list.scrollBy({ left: direction * 150, behavior: 'smooth' });
        }
    }
    
    function closeMobileMenu() {
        mobileMenuOpen = false;
        document.body.style.overflow = '';
    }

    function openMegaMenu(cat) {
        if (closeTimeout) {
            clearTimeout(closeTimeout);
            closeTimeout = null;
        }
        if (cat.children && cat.children.length > 0) {
            activeCategoryId = cat.id;
            activeCategoryData = cat;
            megaMenuOpen = true;
        }
    }

    function scheduleMegaClose() {
        closeTimeout = setTimeout(() => {
            megaMenuOpen = false;
            activeCategoryId = null;
            activeCategoryData = null;
        }, 150);
    }

    function cancelMegaClose() {
        if (closeTimeout) {
            clearTimeout(closeTimeout);
            closeTimeout = null;
        }
    }

    function handleCategoryMouseEnter(cat) {
        if (window.innerWidth > 768) {
            openMegaMenu(cat);
        }
    }

    function handleCategoryMouseLeave() {
        if (window.innerWidth > 768) {
            scheduleMegaClose();
        }
    }
    
    onMount(() => {
        const SCROLL_THRESHOLD = 200;
        const HYSTERESIS = 50;
        let collapsed = false;
        let ticking = false;

        const update = () => {
            const y = window.scrollY || 0;
            if (y > SCROLL_THRESHOLD && !collapsed) {
                collapsed = true;
                isCollapsed = true;
            } else if (y < (SCROLL_THRESHOLD - HYSTERESIS) && collapsed) {
                collapsed = false;
                isCollapsed = false;
            }
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });

        (async () => {
            try {
                const res = await api.getCategoriesTree();
                if (res?.success && Array.isArray(res.data)) {
                    // API vracia tree štruktúru - root kategórie s children
                    navCategories = res.data.slice(0, 12).map(cat => {
                        // Children sú už v cat.children z API
                        const children = (cat.children || []).map(child => {
                            // Grandchildren sú v child.children
                            const grandchildren = (child.children || []).slice(0, 15);
                            return { ...child, grandchildren };
                        });
                        return { ...cat, children };
                    });
                }
            } catch (e) {
                console.error('Failed to load categories', e);
            }
        })();

        return () => {
            window.removeEventListener('scroll', onScroll);
            if (closeTimeout) clearTimeout(closeTimeout);
        };
    });

    const categoryEmojis = {
        'uncategorized': '📦', 'dom': '🏡', 'záhrada': '🏡', 'domáce': '🔌',
        'spotrebiče': '🔌', 'elektronika': '📱', 'hračky': '🧸', 'kancelárske': '📎',
        'kostýmy': '🎭', 'kuchynské': '🍳', 'ostatné': '📦', 'šport': '⚽',
        'zdravie': '💊', 'krása': '💄', 'zvieratá': '🐾', 'vonkajšie': '🌳'
    };

    function getCategoryEmoji(name) {
        const lower = (name || '').toLowerCase();
        for (const [key, emoji] of Object.entries(categoryEmojis)) {
            if (lower.includes(key)) return emoji;
        }
        return '📦';
    }

    function getInitial(name) {
        return (name || 'K').charAt(0).toUpperCase();
    }
</script>

{#if $page.url.pathname.startsWith('/admin') || $page.url.pathname.startsWith('/vendor-dashboard')}
    <slot />
{:else}
<div class="mp-site">
    <header class="mp-header">
        <div class="mp-header__inner">
            <a href="/" class="mp-header__logo">
                <span class="mp-header__logo-text">megaprice</span>
            </a>
            
            <form class="mp-search" on:submit={handleSearch}>
                <input type="text" class="mp-search__input" placeholder="Hľadaj produkt, značku..." bind:value={searchQuery}>
                <button type="submit" class="mp-search__btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <span>Hľadať</span>
                </button>
            </form>
            
            <nav class="mp-header__actions">
                <a href="/ucet" class="mp-header__action">
                    <span class="mp-header__action-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                    </span>
                    <span>Môj účet</span>
                </a>
                <a href="/oblubene" class="mp-header__action">
                    <span class="mp-header__action-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        {#if wishlistCount > 0}<span class="mp-header__action-badge">{wishlistCount}</span>{/if}
                    </span>
                    <span>Obľúbené</span>
                </a>
                <a href="/porovnanie" class="mp-header__action">
                    <span class="mp-header__action-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M17 2l4 4-4 4"/><path d="M3 6h18"/><path d="M7 14l-4 4 4 4"/><path d="M21 18H3"/>
                        </svg>
                        {#if compareCount > 0}<span class="mp-header__action-badge mp-header__action-badge--blue">{compareCount}</span>{/if}
                    </span>
                    <span>Porovnať</span>
                </a>
                <a href="/kosik" class="mp-header__action mp-header__action--cart">
                    <span class="mp-header__action-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                    </span>
                    <span>Košík</span>
                </a>
            </nav>
        </div>
    </header>

    <nav class="mp-catnav" class:is-collapsed={isCollapsed}>
        <div class="mp-catnav__inner">
            <button class="mp-catnav__arrow mp-catnav__arrow--left" on:click={() => scrollCategories(-1)}>‹</button>
            
            <div class="mp-catnav__list">
                {#each navCategories as cat}
                    <a 
                        href={"/kategoria/" + (cat.slug || cat.id)} 
                        class="mp-catnav__item" 
                        class:is-active={activeCategoryId === cat.id}
                        on:mouseenter={() => handleCategoryMouseEnter(cat)}
                        on:mouseleave={handleCategoryMouseLeave}
                    >
                        <span class="mp-catnav__item-img">
                            {#if cat.image_url}
                                <img src={cat.image_url} alt="">
                            {:else}
                                <span>{cat.icon || getCategoryEmoji(cat.name)}</span>
                            {/if}
                        </span>
                        {cat.name}
                    </a>
                {/each}
            </div>
            
            <button class="mp-catnav__arrow mp-catnav__arrow--right" on:click={() => scrollCategories(1)}>›</button>

            <div class="mp-catnav__right">
                <form class="mp-catnav__search-form" on:submit={handleCatnavSearch}>
                    <input type="text" class="mp-catnav__search-input" placeholder="Hľadať..." bind:value={catnavSearchQuery}>
                    <button type="submit" class="mp-catnav__search-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                    </button>
                </form>
                <a href="/oblubene" class="mp-catnav__action">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </a>
                <a href="/porovnanie" class="mp-catnav__action mp-catnav__compare">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M17 2l4 4-4 4"/><path d="M3 6h18"/><path d="M7 14l-4 4 4 4"/><path d="M21 18H3"/>
                    </svg>
                </a>
                <a href="/kosik" class="mp-catnav__action">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                </a>
            </div>
        </div>

        <!-- MEGA MENU - profibuy.sk štýl s CPC farbami -->
        {#if megaMenuOpen && activeCategoryData}
            <div class="mp-mega" on:mouseenter={cancelMegaClose} on:mouseleave={scheduleMegaClose}>
                <div class="mp-mega__container">
                    {#each activeCategoryData.children || [] as subcategory}
                        <div class="mp-mega__col">
                            <a href={"/kategoria/" + (subcategory.slug || subcategory.id)} class="mp-mega__subcat">
                                <div class="mp-mega__subcat-img">
                                    {#if subcategory.image_url}
                                        <img src={subcategory.image_url} alt="">
                                    {:else}
                                        <span>{getInitial(subcategory.name)}</span>
                                    {/if}
                                </div>
                                <span class="mp-mega__subcat-name">{subcategory.name}</span>
                            </a>
                            {#if subcategory.grandchildren && subcategory.grandchildren.length > 0}
                                <div class="mp-mega__links">
                                    {#each subcategory.grandchildren.slice(0, 10) as grandchild}
                                        <a href={"/kategoria/" + (grandchild.slug || grandchild.id)} class="mp-mega__link">{grandchild.name}</a>
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
        <div class="mp-footer__top">
            <div class="mp-footer__inner">
                <div class="mp-footer__grid">
                    <div class="mp-footer__col">
                        <h4>O nás</h4>
                        <ul><li><a href="/o-nas">O MegaPrice</a></li><li><a href="/kontakt">Kontakt</a></li><li><a href="/kariera">Kariéra</a></li></ul>
                    </div>
                    <div class="mp-footer__col">
                        <h4>Pre zákazníkov</h4>
                        <ul><li><a href="/ako-nakupovat">Ako nakupovať</a></li><li><a href="/obchodne-podmienky">Obchodné podmienky</a></li><li><a href="/ochrana-udajov">Ochrana údajov</a></li></ul>
                    </div>
                    <div class="mp-footer__col">
                        <h4>Pre predajcov</h4>
                        <ul><li><a href="/prihlasenie-predajcu">Prihlásenie predajcu</a></li><li><a href="/registracia-predajcu">Registrácia predajcu</a></li><li><a href="/ako-to-funguje">Ako to funguje</a></li></ul>
                    </div>
                    <div class="mp-footer__col">
                        <h4>Kontakt</h4>
                        <p><a href="mailto:info@megaprice.sk">info@megaprice.sk</a><br>+421 xxx xxx xxx</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="mp-footer__bottom">
            <p>© 2026 megaprice. Všetky práva vyhradené.</p>
            <div class="mp-footer__links"><a href="/obchodne-podmienky">Obchodné podmienky</a><a href="/ochrana-udajov">GDPR</a><a href="/cookies">Cookies</a></div>
        </div>
    </footer>

    <nav class="mp-bottom-nav">
        <a href="/" class="mp-bottom-nav__item" class:is-active={$page.url.pathname === '/'}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>Domov</span>
        </a>
        <a href="/kategorie" class="mp-bottom-nav__item">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span>Kategórie</span>
        </a>
        <a href="/oblubene" class="mp-bottom-nav__item">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span>Obľúbené</span>
        </a>
        <a href="/ucet" class="mp-bottom-nav__item">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>Účet</span>
        </a>
    </nav>

    {#if mobileMenuOpen}
        <div class="mp-mobile-overlay" on:click={closeMobileMenu}></div>
        <div class="mp-mobile-menu">
            <div class="mp-mobile-menu__header">
                <span class="mp-mobile-menu__title">Kategórie</span>
                <button class="mp-mobile-menu__close" on:click={closeMobileMenu}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
            <div class="mp-mobile-menu__content">
                {#each navCategories as cat}
                    <a href={"/kategoria/" + (cat.slug || cat.id)} class="mp-mobile-menu__link" on:click={closeMobileMenu}>
                        <span class="mp-mobile-menu__icon">{cat.icon || getCategoryEmoji(cat.name)}</span>
                        {cat.name}
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

.mp-header { background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.08); position: relative; z-index: 1000; }
.mp-header__inner { display: flex; align-items: center; gap: 24px; padding: 12px 20px; max-width: 1400px; margin: 0 auto; }
.mp-header__logo { flex-shrink: 0; }
.mp-header__logo-text { font-size: 24px; font-weight: 700; color: #ff6b35; }

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

/* CATNAV */
.mp-catnav { background: #fff; border-bottom: 1px solid #e5e7eb; position: sticky; top: 0; z-index: 998; }
.mp-catnav__inner { display: flex; align-items: center; max-width: 100%; padding: 0 20px; position: relative; }

.mp-catnav__list { display: flex; gap: 0; flex: 1; overflow-x: auto; scrollbar-width: none; }
.mp-catnav__list::-webkit-scrollbar { display: none; }
.mp-catnav__item { display: flex; align-items: center; gap: 8px; padding: 12px 16px; color: #374151; font-weight: 600; font-size: 13px; white-space: nowrap; transition: all 0.15s; border-bottom: 2px solid transparent; margin-bottom: -1px; }
.mp-catnav__item:hover, .mp-catnav__item.is-active { background: #fef7f0; color: #c4956a; border-bottom-color: #c4956a; }
.mp-catnav__item-img { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px; background: #f8fafc; overflow: hidden; flex-shrink: 0; }
.mp-catnav__item-img img { width: 100%; height: 100%; object-fit: contain; }
.mp-catnav__item-img span { font-size: 16px; }
.mp-catnav__item:hover .mp-catnav__item-img { background: #fff5f0; }

.mp-catnav__right { position: absolute; right: 20px; top: 50%; transform: translateY(-50%); display: flex; align-items: center; gap: 12px; padding-left: 12px; border-left: 1px solid #e5e7eb; background: #fff; opacity: 0; visibility: hidden; pointer-events: none; transition: all 0.3s ease; }
.mp-catnav.is-collapsed .mp-catnav__right { opacity: 1; visibility: visible; pointer-events: auto; }

.mp-catnav__search-form { display: flex; }
.mp-catnav__search-input { width: 120px; padding: 8px 12px; border: 2px solid #e5e7eb; border-right: none; border-radius: 8px 0 0 8px; font-size: 12px; outline: none; transition: all 0.2s; }
.mp-catnav__search-input:focus { border-color: #ff6b35; width: 150px; }
.mp-catnav__search-btn { padding: 8px 12px; background: #ff6b35; border: none; border-radius: 0 8px 8px 0; color: #fff; }

.mp-catnav__action { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 8px; color: #4b5563; transition: all 0.2s; }
.mp-catnav__action:hover { background: #f3f4f6; color: #ff6b35; }
.mp-catnav__compare:hover { color: #3b82f6; }

.mp-catnav__arrow { display: none; }

@media (max-width: 768px) {
    .mp-catnav__inner { padding: 0; }
    .mp-catnav__list { padding: 0 36px; }
    .mp-catnav__item { padding: 12px 14px; font-size: 12px; }
    .mp-catnav__arrow { position: absolute; top: 0; bottom: 0; width: 36px; display: flex; align-items: center; justify-content: center; background: linear-gradient(90deg, #fff 60%, transparent); color: #6b7280; border: none; font-size: 20px; z-index: 5; }
    .mp-catnav__arrow--left { left: 0; }
    .mp-catnav__arrow--right { right: 0; background: linear-gradient(-90deg, #fff 60%, transparent); }
    .mp-catnav__right { display: none !important; }
}

/* MEGA MENU - moderný dropdown */
.mp-mega {
    position: absolute;
    left: 0;
    right: 0;
    top: 100%;
    background: #fff;
    border-top: 1px solid #e5e7eb;
    box-shadow: 0 20px 40px rgba(0,0,0,0.12);
    z-index: 999;
    animation: megaDrop 0.2s ease;
}
@keyframes megaDrop {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
}

.mp-mega__container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px 16px;
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px 24px;
    max-height: 50vh;
    overflow-y: auto;
}

.mp-mega__col {
    padding: 8px 0;
    border-bottom: 1px solid #f3f4f6;
}
.mp-mega__col:nth-last-child(-n+4) { border-bottom: none; }

/* Podkategória - profibuy štýl (bez pozadia) */
.mp-mega__subcat {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 4px 0;
    transition: all 0.15s;
    margin-bottom: 4px;
}
.mp-mega__subcat:hover .mp-mega__subcat-name { color: #c4956a; }

.mp-mega__subcat-img {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
}
.mp-mega__subcat-img img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}
.mp-mega__subcat-img span {
    font-size: 14px;
    font-weight: 600;
    color: #9ca3af;
    width: 36px;
    height: 36px;
    background: #f3f4f6;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.mp-mega__subcat-name {
    font-size: 14px;
    font-weight: 700;
    color: #1f2937;
    line-height: 1.2;
}

/* 3. úroveň - inline linky s bodkami (všetky s bodkou) */
.mp-mega__links {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 0;
    padding: 2px 0 6px 0;
    margin: 0;
    line-height: 1.7;
}

.mp-mega__link {
    font-size: 12px;
    color: #6b7280;
    padding: 0;
    transition: color 0.15s;
    white-space: nowrap;
}
.mp-mega__link::before {
    content: '•';
    color: #9ca3af;
    margin: 0 5px;
}
.mp-mega__link:hover { color: #c4956a; }
.mp-mega__more { color: #c4956a; font-weight: 500; }

@media (max-width: 1200px) {
    .mp-mega__container { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 900px) {
    .mp-mega__container { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
    .mp-mega { display: none; }
}

/* MAIN */
.mp-main { flex: 1; }

/* FOOTER */
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

@media (max-width: 768px) {
    .mp-footer__grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
    .mp-footer__top { padding: 32px 20px; }
    .mp-footer { padding-bottom: 70px; }
    .mp-footer__bottom { flex-direction: column; gap: 12px; text-align: center; }
}

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
