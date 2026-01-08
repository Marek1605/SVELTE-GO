<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import '../app.css';
    
    let searchQuery = '';
    let isScrolled = false;
    let wishlistCount = 0;
    let compareCount = 0;
    let navCategories = [];
    
    onMount(async () => {
        // Load categories from API
        try {
            const res = await fetch('/api/v1/categories');
            const data = await res.json();
            if (data.data) {
                // Get only root categories (no parent)
                navCategories = data.data.filter(c => !c.parent_id).slice(0, 10);
            }
        } catch (e) {
            console.error('Failed to load categories:', e);
        }
        
        const updateCounts = () => {
            compareCount = JSON.parse(localStorage.getItem('mp_compare') || '[]').length;
        };
        updateCounts();
        window.addEventListener('storage', updateCounts);
        
        const handleScroll = () => {
            isScrolled = window.scrollY > 100;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        return () => {
            window.removeEventListener('storage', updateCounts);
            window.removeEventListener('scroll', handleScroll);
        };
    });
</script>

<div class="mp-site">
    <!-- ========== HEADER ========== -->
    <header class="mp-header-wrap" class:is-scrolled={isScrolled}>
        
        <!-- Main Header Row -->
        <div class="mp-header">
            <div class="mp-header__container">
                
                <!-- Logo -->
                <a href="/" class="mp-logo">megaprice</a>
                
                <!-- Search Form -->
                <form class="mp-search" on:submit={handleSearch}>
                    <div class="mp-search__box">
                        <input 
                            type="text" 
                            class="mp-search__input" 
                            placeholder="Hľadaj produkt, značku..."
                            bind:value={searchQuery}
                        >
                        <button type="submit" class="mp-search__btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <span>Hľadať</span>
                        </button>
                    </div>
                </form>
                
                <!-- Header Actions -->
                <nav class="mp-actions">
                    <a href="/ucet" class="mp-actions__item">
                        <div class="mp-actions__icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>
                        <span class="mp-actions__label">Môj účet</span>
                    </a>
                    
                    <a href="/oblubene" class="mp-actions__item">
                        <div class="mp-actions__icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </div>
                        <span class="mp-actions__label">Obľúbené</span>
                    </a>
                    
                    <a href="/porovnanie" class="mp-actions__item">
                        <div class="mp-actions__icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M16 3h5v5"></path>
                                <path d="M4 20L21 3"></path>
                                <path d="M21 16v5h-5"></path>
                                <path d="M15 15l6 6"></path>
                                <path d="M4 4l5 5"></path>
                            </svg>
                            {#if compareCount > 0}
                                <span class="mp-actions__badge">{compareCount}</span>
                            {/if}
                        </div>
                        <span class="mp-actions__label">Porovnať</span>
                    </a>
                    
                    <a href="/kosik" class="mp-actions__item">
                        <div class="mp-actions__icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                        </div>
                        <span class="mp-actions__label">Košík</span>
                    </a>
                </nav>
            </div>
        </div>
        
        <!-- Categories Navigation -->
        <nav class="mp-catnav">
            <div class="mp-catnav__container">
                <div class="mp-catnav__scroll">
                    {#each navCategories as cat}
                        <a 
                            href="/kategoria/{cat.slug}" 
                            class="mp-catnav__link"
                            class:is-active={$page.url.pathname.includes(cat.slug)}
                        >
                            <span class="mp-catnav__icon">{cat.icon}</span>
                            <span class="mp-catnav__text">{cat.name}</span>
                        </a>
                    {/each}
                </div>
                
                <!-- Compact Actions (visible when scrolled) -->
                {#if isScrolled}
                    <div class="mp-catnav__actions">
                        <form class="mp-catnav__search" on:submit={handleSearch}>
                            <input type="text" placeholder="Hľadať..." bind:value={searchQuery}>
                            <button type="submit">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </button>
                        </form>
                        <a href="/ucet" class="mp-catnav__btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </a>
                        <a href="/oblubene" class="mp-catnav__btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </a>
                    </div>
                {/if}
            </div>
        </nav>
    </header>
    
    <!-- ========== MAIN CONTENT ========== -->
    <main class="mp-main">
        <slot />
    </main>
    
    <!-- ========== FOOTER ========== -->
    <footer class="mp-footer">
        <div class="mp-footer__main">
            <div class="mp-footer__container">
                <div class="mp-footer__grid">
                    <div class="mp-footer__brand">
                        <a href="/" class="mp-footer__logo">megaprice</a>
                        <p>Porovnávač cien, ktorý vám pomôže nájsť najlepšie ponuky od stoviek overených predajcov na Slovensku.</p>
                    </div>
                    <div class="mp-footer__col">
                        <h4>Informácie</h4>
                        <ul>
                            <li><a href="/o-nas">O nás</a></li>
                            <li><a href="/kontakt">Kontakt</a></li>
                            <li><a href="/pre-predajcov">Pre predajcov</a></li>
                            <li><a href="/pomoc">Pomoc</a></li>
                        </ul>
                    </div>
                    <div class="mp-footer__col">
                        <h4>Právne</h4>
                        <ul>
                            <li><a href="/obchodne-podmienky">Obchodné podmienky</a></li>
                            <li><a href="/ochrana-sukromia">Ochrana súkromia</a></li>
                            <li><a href="/cookies">Cookies</a></li>
                        </ul>
                    </div>
                    <div class="mp-footer__col">
                        <h4>Kontakt</h4>
                        <p class="mp-footer__contact">
                            <strong>Email:</strong> info@megaprice.sk<br>
                            <strong>Telefón:</strong> +421 900 000 000
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <div class="mp-footer__bottom">
            <div class="mp-footer__container">
                <p>© 2024 MegaPrice.sk. Všetky práva vyhradené.</p>
            </div>
        </div>
    </footer>
</div>

<style>
/* =============================================
   MEGAPRICE.SK - EXACT COPY
   ============================================= */

/* Reset & Base */
:global(*) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

:global(html) {
    scroll-behavior: smooth;
}

:global(body) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 15px;
    line-height: 1.6;
    color: #1f2937;
    background: #f8f9fa;
    -webkit-font-smoothing: antialiased;
}

:global(a) {
    text-decoration: none;
    color: inherit;
}

:global(img) {
    max-width: 100%;
    height: auto;
    display: block;
}

:global(button) {
    font-family: inherit;
    cursor: pointer;
}

/* Layout */
.mp-site {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.mp-main {
    flex: 1;
    background: #fff;
}

/* =============================================
   HEADER - EXACT MEGAPRICE.SK COPY
   ============================================= */

.mp-header-wrap {
    position: sticky;
    top: 0;
    z-index: 1000;
    background: #fff;
}

/* Hide main header when scrolled */
.mp-header-wrap.is-scrolled .mp-header {
    display: none;
}

/* Main Header */
.mp-header {
    background: #fff;
    padding: 20px 0;
}

.mp-header__container {
    display: flex;
    align-items: center;
    gap: 40px;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
}

/* Logo - exact megaprice.sk style */
.mp-logo {
    font-size: 26px;
    font-weight: 500;
    color: #c4956a;
    letter-spacing: -0.3px;
    flex-shrink: 0;
}

/* Search - exact megaprice.sk style */
.mp-search {
    flex: 1;
    max-width: 650px;
}

.mp-search__box {
    display: flex;
    align-items: stretch;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
    transition: border-color 0.2s;
}

.mp-search__box:focus-within {
    border-color: #c4956a;
}

.mp-search__input {
    flex: 1;
    padding: 14px 20px;
    border: none;
    outline: none;
    font-size: 15px;
    color: #1f2937;
    background: transparent;
}

.mp-search__input::placeholder {
    color: #9ca3af;
}

.mp-search__btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 28px;
    background: #c4956a;
    border: none;
    color: #fff;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
}

.mp-search__btn:hover {
    background: #b8875c;
}

.mp-search__btn svg {
    flex-shrink: 0;
}

/* Header Actions - exact megaprice.sk style */
.mp-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
}

.mp-actions__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 10px 18px;
    color: #4b5563;
    transition: color 0.2s;
    min-width: 72px;
}

.mp-actions__item:hover {
    color: #c4956a;
}

.mp-actions__icon {
    position: relative;
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.mp-actions__badge {
    position: absolute;
    top: -8px;
    right: -12px;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    background: #c4956a;
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.mp-actions__label {
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
}

/* =============================================
   CATEGORIES NAV - EXACT MEGAPRICE.SK COPY
   ============================================= */

.mp-catnav {
    background: #fff;
    border-top: 1px solid #f3f4f6;
    border-bottom: 1px solid #e5e7eb;
}

.mp-catnav__container {
    display: flex;
    align-items: center;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
}

.mp-catnav__scroll {
    display: flex;
    flex: 1;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.mp-catnav__scroll::-webkit-scrollbar {
    display: none;
}

.mp-catnav__link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 20px;
    color: #374151;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    border-bottom: 3px solid transparent;
    margin-bottom: -1px;
    transition: all 0.15s ease;
}

.mp-catnav__link:hover,
.mp-catnav__link.is-active {
    color: #c4956a;
    background: linear-gradient(180deg, transparent 0%, rgba(196, 149, 106, 0.06) 100%);
    border-bottom-color: #c4956a;
}

.mp-catnav__icon {
    font-size: 18px;
    line-height: 1;
}

.mp-catnav__text {
    line-height: 1;
}

/* Compact Actions (when scrolled) */
.mp-catnav__actions {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-left: 20px;
    margin-left: auto;
    border-left: 1px solid #e5e7eb;
}

.mp-catnav__search {
    display: flex;
    align-items: center;
    background: #f3f4f6;
    border-radius: 8px;
    overflow: hidden;
}

.mp-catnav__search input {
    width: 140px;
    padding: 10px 14px;
    border: none;
    outline: none;
    font-size: 13px;
    background: transparent;
}

.mp-catnav__search input::placeholder {
    color: #9ca3af;
}

.mp-catnav__search button {
    padding: 10px 14px;
    background: #c4956a;
    border: none;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
}

.mp-catnav__search button:hover {
    background: #b8875c;
}

.mp-catnav__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    color: #6b7280;
    transition: all 0.15s ease;
}

.mp-catnav__btn:hover {
    background: #f3f4f6;
    color: #c4956a;
}

/* =============================================
   FOOTER
   ============================================= */

.mp-footer {
    background: #1f2937;
    color: #fff;
    margin-top: auto;
}

.mp-footer__main {
    padding: 60px 0 40px;
}

.mp-footer__container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
}

.mp-footer__grid {
    display: grid;
    grid-template-columns: 1.5fr 1fr 1fr 1fr;
    gap: 48px;
}

.mp-footer__logo {
    font-size: 24px;
    font-weight: 500;
    color: #c4956a;
    display: inline-block;
    margin-bottom: 16px;
}

.mp-footer__brand p {
    font-size: 14px;
    color: #9ca3af;
    line-height: 1.7;
}

.mp-footer__col h4 {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 20px;
    color: #fff;
}

.mp-footer__col ul {
    list-style: none;
}

.mp-footer__col li {
    margin-bottom: 12px;
}

.mp-footer__col a {
    font-size: 14px;
    color: #9ca3af;
    transition: color 0.2s;
}

.mp-footer__col a:hover {
    color: #fff;
}

.mp-footer__contact {
    font-size: 14px;
    color: #9ca3af;
    line-height: 1.8;
}

.mp-footer__contact strong {
    color: #d1d5db;
}

.mp-footer__bottom {
    padding: 20px 0;
    border-top: 1px solid #374151;
}

.mp-footer__bottom p {
    text-align: center;
    font-size: 13px;
    color: #6b7280;
}

/* =============================================
   RESPONSIVE
   ============================================= */

@media (max-width: 1200px) {
    .mp-header__container {
        gap: 24px;
    }
    
    .mp-actions__item {
        padding: 10px 12px;
        min-width: auto;
    }
    
    .mp-footer__grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 40px;
    }
}

@media (max-width: 900px) {
    .mp-actions__label {
        display: none;
    }
    
    .mp-actions__item {
        padding: 10px;
    }
    
    .mp-search__btn span {
        display: none;
    }
    
    .mp-search__btn {
        padding: 14px 18px;
    }
    
    .mp-catnav__link {
        padding: 14px 16px;
    }
    
    .mp-catnav__actions {
        display: none;
    }
}

@media (max-width: 768px) {
    .mp-header {
        padding: 16px 0;
    }
    
    .mp-header__container {
        gap: 16px;
        padding: 0 16px;
    }
    
    .mp-logo {
        font-size: 22px;
    }
    
    .mp-search__input {
        padding: 12px 16px;
    }
    
    .mp-search__btn {
        padding: 12px 14px;
    }
    
    .mp-catnav__container {
        padding: 0 16px;
    }
    
    .mp-catnav__link {
        padding: 12px 14px;
        font-size: 13px;
    }
    
    .mp-catnav__icon {
        font-size: 16px;
    }
    
    .mp-footer__grid {
        grid-template-columns: 1fr;
        gap: 32px;
    }
    
    .mp-footer__main {
        padding: 40px 0 30px;
    }
}

@media (max-width: 480px) {
    .mp-header__container {
        flex-wrap: wrap;
    }
    
    .mp-search {
        order: 3;
        flex: 1 1 100%;
        max-width: 100%;
        margin-top: 12px;
    }
    
    .mp-actions {
        margin-left: auto;
    }
    
    .mp-actions__icon svg {
        width: 22px;
        height: 22px;
    }
}
</style>
