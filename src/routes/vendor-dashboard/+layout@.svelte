<script>
    import { page } from '$app/stores';
    import { onMount, setContext } from 'svelte';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    import { writable } from 'svelte/store';
    
    const API_BASE = import.meta.env.VITE_API_URL || 'http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io/api/v1';
    
    const vendorStore = writable(null);
    const shopStore = writable(null);
    const shopsStore = writable([]);
    
    setContext('vendor', vendorStore);
    setContext('shop', shopStore);
    setContext('shops', shopsStore);
    setContext('API_BASE', API_BASE);
    
    let loading = true;
    let shopDropdownOpen = false;
    let profileDropdownOpen = false;
    let mobileMenuOpen = false;
    
    $: vendor = $vendorStore;
    $: shop = $shopStore;
    $: shops = $shopsStore;
    $: creditBalance = shop?.credit_balance || 0;
    
    onMount(async () => {
        if (!browser) return;
        
        const token = localStorage.getItem('vendor_token');
        if (!token) {
            goto('/prihlasenie-predajcu');
            return;
        }
        
        try {
            const res = await fetch(`${API_BASE}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (data.success) {
                vendorStore.set(data.data.vendor);
                shopStore.set(data.data.shop);
                if (data.data.shops) {
                    shopsStore.set(data.data.shops);
                } else {
                    shopsStore.set([data.data.shop]);
                }
            } else {
                localStorage.removeItem('vendor_token');
                goto('/prihlasenie-predajcu');
            }
        } catch (e) {
            localStorage.removeItem('vendor_token');
            goto('/prihlasenie-predajcu');
        }
        loading = false;
    });
    
    function logout() {
        localStorage.removeItem('vendor_token');
        localStorage.removeItem('vendor_remember');
        localStorage.removeItem('selected_shop_id');
        goto('/prihlasenie-predajcu');
    }
    
    async function switchShop(newShop) {
        shopStore.set(newShop);
        localStorage.setItem('selected_shop_id', newShop.id);
        shopDropdownOpen = false;
        window.location.reload();
    }
    
    function formatCredit(amount) {
        return new Intl.NumberFormat('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0);
    }
    
    function closeDropdowns(e) {
        if (!e.target.closest('.vp-dropdown')) {
            shopDropdownOpen = false;
        }
        if (!e.target.closest('.vp-profile-dropdown')) {
            profileDropdownOpen = false;
        }
    }
    
    $: currentPath = $page.url.pathname;
    
    $: pageTitle = getPageTitle(currentPath);
    
    function getPageTitle(path) {
        if (path === '/vendor-dashboard' || path === '/vendor-dashboard/') return 'Prehľad';
        if (path.includes('/produkty')) return 'Produkty';
        if (path.includes('/ppc')) return 'PPC & Kredit';
        if (path.includes('/statistiky')) return 'Štatistiky';
        if (path.includes('/konverzie')) return 'Konverzie';
        if (path.includes('/reporty')) return 'Reporty';
        if (path.includes('/moj-ucet')) return 'Môj účet';
        if (path.includes('/nastavenia')) return 'Nastavenia';
        if (path.includes('/xml-feedy') || path.includes('/feedy')) return 'XML Feedy';
        if (path.includes('/pridat-obchod')) return 'Pridať obchod';
        return 'Dashboard';
    }
    
    const menuItems = [
        { href: '/vendor-dashboard', label: 'Prehľad', icon: 'dashboard' },
        { href: '/vendor-dashboard/produkty', label: 'Produkty', icon: 'inventory_2' },
        { href: '/vendor-dashboard/ppc', label: 'PPC & Kredit', icon: 'ads_click' },
        { href: '/vendor-dashboard/statistiky', label: 'Štatistiky', icon: 'bar_chart' },
        { href: '/vendor-dashboard/konverzie', label: 'Konverzie', icon: 'verified' },
        { href: '/vendor-dashboard/reporty', label: 'Reporty', icon: 'receipt_long' },
    ];
    
    const settingsItems = [
        { href: '/vendor-dashboard/moj-ucet', label: 'Môj účet', icon: 'person' },
        { href: '/vendor-dashboard/nastavenia-predaja', label: 'Nastavenia', icon: 'tune' },
        { href: '/vendor-dashboard/xml-feedy', label: 'XML Feedy', icon: 'rss_feed' },
    ];
    
    function isActive(href, path) {
        if (href === '/vendor-dashboard') {
            return path === '/vendor-dashboard' || path === '/vendor-dashboard/';
        }
        return path.startsWith(href);
    }
    
    $: displayMode = shop?.display_mode || 'free';
    $: shopStatus = shop?.shop_status || 'active';
</script>

<svelte:head>
    <title>{pageTitle} | {shop?.shop_name || 'Vendor Portal'}</title>
    <meta name="robots" content="noindex, nofollow">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</svelte:head>

<svelte:window on:click={closeDropdowns} />

{#if loading}
    <div class="vp-loading">
        <div class="vp-loader"></div>
    </div>
{:else if vendor}
    <div class="vp-app">
        <!-- SIDEBAR -->
        <aside class="vp-sidebar" class:mobile-open={mobileMenuOpen}>
            <div class="vp-sidebar-header">
                <a href="/vendor-dashboard" class="vp-brand">
                    <div class="vp-brand-icon">
                        <span class="material-icons-round">storefront</span>
                    </div>
                    <div class="vp-brand-text">
                        <span class="vp-brand-name">MegaBuy</span>
                        <span class="vp-brand-sub">Vendor Portal</span>
                    </div>
                </a>
            </div>
            
            <nav class="vp-nav">
                <div class="vp-nav-group">
                    {#each menuItems as item}
                        <a href={item.href} class="vp-nav-item" class:active={isActive(item.href, currentPath)} on:click={() => mobileMenuOpen = false}>
                            <span class="material-icons-round">{item.icon}</span>
                            <span class="vp-nav-label">{item.label}</span>
                        </a>
                    {/each}
                </div>
                
                <div class="vp-nav-divider"></div>
                
                <div class="vp-nav-group">
                    <div class="vp-nav-title">Nastavenia</div>
                    {#each settingsItems as item}
                        <a href={item.href} class="vp-nav-item" class:active={isActive(item.href, currentPath)} on:click={() => mobileMenuOpen = false}>
                            <span class="material-icons-round">{item.icon}</span>
                            <span class="vp-nav-label">{item.label}</span>
                        </a>
                    {/each}
                </div>
            </nav>
            
            <div class="vp-sidebar-footer">
                <button class="vp-logout-btn" on:click={logout}>
                    <span class="material-icons-round">logout</span>
                    <span class="vp-nav-label">Odhlásiť sa</span>
                </button>
            </div>
        </aside>
        
        <!-- MOBILE OVERLAY -->
        {#if mobileMenuOpen}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class="vp-overlay" on:click={() => mobileMenuOpen = false}></div>
        {/if}
        
        <!-- MAIN -->
        <div class="vp-main">
            <!-- TOPBAR -->
            <header class="vp-topbar">
                <div class="vp-topbar-left">
                    <button class="vp-mobile-menu" on:click={() => mobileMenuOpen = !mobileMenuOpen}>
                        <span class="material-icons-round">menu</span>
                    </button>
                    <h1 class="vp-page-title">{pageTitle}</h1>
                </div>
                
                <div class="vp-topbar-actions">
                    <!-- Status + Mode badges -->
                    <span class="vp-status-badge {shopStatus}">
                        {#if shopStatus === 'active'}Aktívny{:else if shopStatus === 'pending'}Čaká{:else}Zamietnutý{/if}
                    </span>
                    <span class="vp-mode-badge {displayMode}">
                        {displayMode === 'cpc' ? 'CPC' : displayMode === 'paid' ? 'PAID' : 'FREE'}
                    </span>
                    
                    <!-- Credit -->
                    <a href="/vendor-dashboard/ppc" class="vp-credit" class:low={creditBalance < 5}>
                        <span class="material-icons-round">account_balance_wallet</span>
                        <span>{formatCredit(creditBalance)} €</span>
                    </a>
                    
                    <!-- Shop switcher -->
                    <div class="vp-dropdown">
                        <button class="vp-shop-btn" on:click|stopPropagation={() => shopDropdownOpen = !shopDropdownOpen}>
                            <span>{shop?.shop_name || 'Obchod'}</span>
                            <span class="material-icons-round vp-expand">expand_more</span>
                        </button>
                        {#if shopDropdownOpen}
                            <div class="vp-dropdown-menu">
                                <div class="vp-dropdown-header">Vaše obchody</div>
                                {#each shops as s}
                                    <button class="vp-dropdown-item" class:active={s.id === shop?.id} on:click={() => switchShop(s)} disabled={s.shop_status === 'pending' || s.shop_status === 'rejected'}>
                                        <span class="material-icons-round">store</span>
                                        <span>{s.shop_name}</span>
                                        {#if s.shop_status === 'pending'}
                                            <span class="vp-shop-status pending">čaká</span>
                                        {:else if s.shop_status === 'rejected'}
                                            <span class="vp-shop-status rejected">zamietnutý</span>
                                        {:else if s.id === shop?.id}
                                            <span class="material-icons-round vp-check">check</span>
                                        {/if}
                                    </button>
                                {/each}
                                <div class="vp-dropdown-divider"></div>
                                <a href="/vendor-dashboard/pridat-obchod" class="vp-dropdown-item vp-add" on:click={() => shopDropdownOpen = false}>
                                    <span class="material-icons-round">add</span>
                                    <span>Pridať obchod</span>
                                </a>
                            </div>
                        {/if}
                    </div>
                    
                    <!-- Profile dropdown -->
                    <div class="vp-profile-dropdown">
                        <button class="vp-profile-btn" on:click|stopPropagation={() => profileDropdownOpen = !profileDropdownOpen}>
                            <span class="material-icons-round">person</span>
                        </button>
                        {#if profileDropdownOpen}
                            <div class="vp-profile-menu">
                                <div class="vp-profile-info">
                                    <div class="vp-profile-avatar">
                                        {(vendor.company_name || vendor.email || 'V').charAt(0).toUpperCase()}
                                    </div>
                                    <div class="vp-profile-details">
                                        <strong>{vendor.company_name || 'Predajca'}</strong>
                                        <span>{vendor.email}</span>
                                    </div>
                                </div>
                                <div class="vp-profile-divider"></div>
                                <a href="/vendor-dashboard/moj-ucet" class="vp-profile-item" on:click={() => profileDropdownOpen = false}>
                                    <span class="material-icons-round">person</span>
                                    Môj účet
                                </a>
                                <a href="/vendor-dashboard/nastavenia-predaja" class="vp-profile-item" on:click={() => profileDropdownOpen = false}>
                                    <span class="material-icons-round">tune</span>
                                    Nastavenia predaja
                                </a>
                                <a href="/" class="vp-profile-item" on:click={() => profileDropdownOpen = false}>
                                    <span class="material-icons-round">open_in_new</span>
                                    Zobraziť môj obchod
                                </a>
                                <a href="/" class="vp-profile-item" on:click={() => profileDropdownOpen = false}>
                                    <span class="material-icons-round">storefront</span>
                                    Späť na MegaBuy
                                </a>
                                <div class="vp-profile-divider"></div>
                                <button class="vp-profile-item vp-profile-logout" on:click={logout}>
                                    <span class="material-icons-round">logout</span>
                                    Odhlásiť sa
                                </button>
                            </div>
                        {/if}
                    </div>
                </div>
            </header>
            
            <div class="vp-content">
                <slot />
            </div>
        </div>
    </div>
{/if}

<style>
    :global(*) { margin: 0; padding: 0; box-sizing: border-box; }
    :global(body) { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif; background: #f4f6f8; }
    
    .vp-loading { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .vp-loader { width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    .vp-app { display: flex; min-height: 100vh; }
    
    /* SIDEBAR */
    .vp-sidebar {
        width: 240px;
        background: #0f172a;
        display: flex;
        flex-direction: column;
        position: fixed;
        top: 0; left: 0; bottom: 0;
        z-index: 100;
    }
    
    .vp-sidebar-header {
        padding: 20px 16px 16px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    
    .vp-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
    
    .vp-brand-icon {
        width: 36px; height: 36px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        color: white;
    }
    .vp-brand-icon .material-icons-round { font-size: 20px; }
    
    .vp-brand-text { display: flex; flex-direction: column; }
    .vp-brand-name { font-size: 16px; font-weight: 700; color: #f1f5f9; letter-spacing: -0.3px; }
    .vp-brand-sub { font-size: 9px; color: #475569; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
    
    .vp-nav { flex: 1; padding: 12px 8px; overflow-y: auto; }
    .vp-nav-group { display: flex; flex-direction: column; gap: 1px; }
    .vp-nav-title { font-size: 9px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 1px; padding: 16px 12px 6px; }
    .vp-nav-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 8px 0; }
    
    .vp-nav-item {
        display: flex; align-items: center; gap: 10px;
        padding: 8px 12px; color: #64748b;
        text-decoration: none; border-radius: 8px;
        font-size: 13px; font-weight: 500;
        transition: all 0.12s;
    }
    .vp-nav-item:hover { background: rgba(255,255,255,0.04); color: #cbd5e1; }
    .vp-nav-item.active { background: rgba(99, 102, 241, 0.12); color: #a5b4fc; }
    .vp-nav-item .material-icons-round { font-size: 19px; }
    
    .vp-sidebar-footer { padding: 12px 8px; border-top: 1px solid rgba(255,255,255,0.06); }
    
    .vp-logout-btn {
        display: flex; align-items: center; gap: 10px;
        width: 100%; padding: 8px 12px;
        background: none; border: none;
        color: #64748b; font-size: 13px; font-weight: 500;
        border-radius: 8px; cursor: pointer;
        font-family: inherit; transition: all 0.12s;
    }
    .vp-logout-btn:hover { background: rgba(239, 68, 68, 0.1); color: #f87171; }
    
    /* MAIN */
    .vp-main {
        flex: 1; margin-left: 240px;
        display: flex; flex-direction: column;
        min-height: 100vh;
    }
    
    /* TOPBAR */
    .vp-topbar {
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 24px; height: 56px;
        background: #fff;
        border-bottom: 1px solid #e8ebef;
        position: sticky; top: 0; z-index: 50;
    }
    
    .vp-topbar-left { display: flex; align-items: center; gap: 12px; }
    .vp-page-title { font-size: 17px; font-weight: 700; color: #0f172a; margin: 0; }
    
    .vp-mobile-menu {
        display: none;
        width: 36px; height: 36px;
        background: #f1f5f9; border: none; border-radius: 8px;
        color: #475569; cursor: pointer;
        align-items: center; justify-content: center;
    }
    
    .vp-topbar-actions { display: flex; align-items: center; gap: 8px; }
    
    /* Status + Mode badges */
    .vp-status-badge {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 4px 10px; border-radius: 6px;
        font-size: 11px; font-weight: 700;
    }
    .vp-status-badge.active { background: #ecfdf5; color: #059669; }
    .vp-status-badge.active::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #10b981; }
    .vp-status-badge.pending { background: #fffbeb; color: #b45309; }
    .vp-status-badge.pending::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #f59e0b; }
    .vp-status-badge.rejected { background: #fef2f2; color: #dc2626; }
    
    .vp-mode-badge {
        display: inline-flex; align-items: center;
        padding: 4px 10px; border-radius: 6px;
        font-size: 11px; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.5px;
    }
    .vp-mode-badge.free { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
    .vp-mode-badge.cpc { background: #eef2ff; color: #4f46e5; border: 1px solid #c7d2fe; }
    .vp-mode-badge.paid { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
    
    /* Credit */
    .vp-credit {
        display: flex; align-items: center; gap: 5px;
        padding: 6px 12px;
        background: #f0fdf4; border: 1px solid #bbf7d0;
        border-radius: 8px; color: #16a34a;
        text-decoration: none; font-weight: 700; font-size: 13px;
        transition: all 0.15s;
    }
    .vp-credit:hover { background: #dcfce7; }
    .vp-credit .material-icons-round { font-size: 16px; }
    .vp-credit.low { background: #fef2f2; border-color: #fecaca; color: #dc2626; }
    
    /* Shop switcher */
    .vp-dropdown { position: relative; }
    .vp-shop-btn {
        display: flex; align-items: center; gap: 4px;
        padding: 6px 10px;
        background: #f8fafc; border: 1px solid #e2e8f0;
        border-radius: 8px; color: #334155;
        font-size: 13px; font-weight: 500;
        cursor: pointer; font-family: inherit;
        transition: all 0.12s;
    }
    .vp-shop-btn:hover { background: #f1f5f9; }
    .vp-expand { font-size: 16px !important; }
    
    .vp-dropdown-menu {
        position: absolute; top: calc(100% + 6px); right: 0;
        background: #fff; border: 1px solid #e2e8f0;
        border-radius: 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.12);
        min-width: 220px; overflow: hidden; z-index: 200;
    }
    .vp-dropdown-header {
        padding: 8px 14px; font-size: 10px; font-weight: 700;
        color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;
        background: #f8fafc; border-bottom: 1px solid #e2e8f0;
    }
    .vp-dropdown-divider { height: 1px; background: #e2e8f0; }
    .vp-dropdown-item {
        display: flex; align-items: center; gap: 8px;
        padding: 9px 14px; color: #475569;
        text-decoration: none; font-size: 13px;
        cursor: pointer; background: none; border: none;
        width: 100%; text-align: left; font-family: inherit;
        transition: background 0.1s;
    }
    .vp-dropdown-item:hover { background: #f8fafc; }
    .vp-dropdown-item.active { background: #eef2ff; color: #4f46e5; }
    .vp-dropdown-item .material-icons-round { font-size: 18px; }
    .vp-dropdown-item .vp-check { margin-left: auto; font-size: 16px; }
    .vp-dropdown-item.vp-add { color: #6366f1; font-weight: 600; }
    .vp-dropdown-item:disabled { opacity: 0.5; cursor: not-allowed; }
    
    .vp-shop-status {
        font-size: 10px; font-weight: 700;
        padding: 2px 6px; border-radius: 4px;
        margin-left: auto; text-transform: uppercase;
    }
    .vp-shop-status.pending { background: #fef3c7; color: #92400e; }
    .vp-shop-status.rejected { background: #fee2e2; color: #dc2626; }
    
    /* PROFILE DROPDOWN */
    .vp-profile-dropdown { position: relative; }
    
    .vp-profile-btn {
        width: 36px; height: 36px;
        background: #f1f5f9; border: 1px solid #e2e8f0;
        border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
        color: #475569; cursor: pointer;
        transition: all 0.12s;
    }
    .vp-profile-btn:hover { background: #e2e8f0; }
    .vp-profile-btn .material-icons-round { font-size: 20px; }
    
    .vp-profile-menu {
        position: absolute; top: calc(100% + 6px); right: 0;
        background: #fff; border: 1px solid #e2e8f0;
        border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.12);
        min-width: 260px; overflow: hidden; z-index: 200;
    }
    
    .vp-profile-info {
        display: flex; align-items: center; gap: 12px;
        padding: 14px 16px;
    }
    .vp-profile-avatar {
        width: 40px; height: 40px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        color: white; font-weight: 700; font-size: 16px;
        flex-shrink: 0;
    }
    .vp-profile-details { display: flex; flex-direction: column; min-width: 0; }
    .vp-profile-details strong {
        font-size: 14px; font-weight: 700; color: #0f172a;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .vp-profile-details span {
        font-size: 12px; color: #94a3b8;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    
    .vp-profile-divider { height: 1px; background: #f1f5f9; }
    
    .vp-profile-item {
        display: flex; align-items: center; gap: 10px;
        padding: 10px 16px; color: #475569;
        text-decoration: none; font-size: 13px; font-weight: 500;
        cursor: pointer; background: none; border: none;
        width: 100%; text-align: left; font-family: inherit;
        transition: background 0.1s;
    }
    .vp-profile-item:hover { background: #f8fafc; }
    .vp-profile-item .material-icons-round { font-size: 18px; color: #94a3b8; }
    
    .vp-profile-logout { color: #ef4444; }
    .vp-profile-logout:hover { background: #fef2f2; }
    .vp-profile-logout .material-icons-round { color: #ef4444; }
    
    /* CONTENT */
    .vp-content { flex: 1; padding: 24px; }
    
    /* OVERLAY */
    .vp-overlay {
        display: none;
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.5);
        z-index: 90;
    }
    
    /* MOBILE */
    @media (max-width: 1024px) {
        .vp-sidebar { transform: translateX(-100%); width: 260px; transition: transform 0.2s ease; }
        .vp-sidebar.mobile-open { transform: translateX(0); }
        .vp-overlay { display: block; }
        .vp-main { margin-left: 0; }
        .vp-mobile-menu { display: flex; }
        .vp-status-badge, .vp-mode-badge { display: none; }
    }
    
    @media (max-width: 640px) {
        .vp-content { padding: 16px 12px; }
        .vp-topbar { padding: 0 12px; height: 52px; }
        .vp-credit span:not(.material-icons-round) { display: none; }
    }
</style>
