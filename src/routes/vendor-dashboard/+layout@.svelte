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
    let accountDropdownOpen = false;
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
            accountDropdownOpen = false;
        }
    }
    
    $: currentPath = $page.url.pathname;
    
    // Page titles mapping
    $: pageTitle = getPageTitle(currentPath);
    
    function getPageTitle(path) {
        if (path === '/vendor-dashboard' || path === '/vendor-dashboard/') return 'Prehľad';
        if (path.includes('/produkty')) return 'Produkty';
        if (path.includes('/ppc')) return 'PPC & Kredit';
        if (path.includes('/statistiky')) return 'Štatistiky';
        if (path.includes('/konverzie')) return 'Konverzie';
        if (path.includes('/reporty')) return 'Reporty';
        if (path.includes('/moj-ucet')) return 'Môj účet';
        if (path.includes('/nastavenia-predaja')) return 'Nastavenia predaja';
        if (path.includes('/xml-feedy') || path.includes('/feedy')) return 'XML Feedy';
        return 'Dashboard';
    }
    
    const menuItems = [
        { href: '/vendor-dashboard', label: 'Prehľad', icon: 'dashboard' },
        { href: '/vendor-dashboard/produkty', label: 'Produkty', icon: 'inventory' },
        { href: '/vendor-dashboard/ppc', label: 'PPC & Kredit', icon: 'paid' },
        { href: '/vendor-dashboard/statistiky', label: 'Štatistiky', icon: 'analytics' },
        { href: '/vendor-dashboard/konverzie', label: 'Konverzie', icon: 'check_circle' },
        { href: '/vendor-dashboard/reporty', label: 'Reporty', icon: 'description' },
    ];
    
    const settingsItems = [
        { href: '/vendor-dashboard/moj-ucet', label: 'Môj účet', icon: 'person' },
        { href: '/vendor-dashboard/nastavenia-predaja', label: 'Nastavenia', icon: 'settings' },
        { href: '/vendor-dashboard/xml-feedy', label: 'XML Feedy', icon: 'rss_feed' },
    ];
    
    function isActive(href) {
        if (href === '/vendor-dashboard') {
            return currentPath === '/vendor-dashboard' || currentPath === '/vendor-dashboard/';
        }
        return currentPath.startsWith(href);
    }
</script>

<svelte:head>
    <title>{pageTitle} | Vendor Portal</title>
    <meta name="robots" content="noindex, nofollow">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet">
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
                        <span class="vp-brand-name">MegaShop</span>
                        <span class="vp-brand-sub">Vendor Portal</span>
                    </div>
                </a>
            </div>
            
            <nav class="vp-nav">
                <div class="vp-nav-group">
                    {#each menuItems as item}
                        <a href={item.href} class="vp-nav-item" class:active={isActive(item.href)} on:click={() => mobileMenuOpen = false}>
                            <span class="material-icons-round">{item.icon}</span>
                            <span class="vp-nav-label">{item.label}</span>
                        </a>
                    {/each}
                </div>
                
                <div class="vp-nav-divider"></div>
                
                <div class="vp-nav-group">
                    <div class="vp-nav-title">Nastavenia</div>
                    {#each settingsItems as item}
                        <a href={item.href} class="vp-nav-item" class:active={isActive(item.href)} on:click={() => mobileMenuOpen = false}>
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
            <div class="vp-overlay" on:click={() => mobileMenuOpen = false} on:keydown={() => {}} role="button" tabindex="0"></div>
        {/if}
        
        <!-- MAIN CONTENT -->
        <div class="vp-main">
            <!-- TOP BAR -->
            <header class="vp-topbar">
                <div class="vp-topbar-left">
                    <button class="vp-mobile-menu" on:click={() => mobileMenuOpen = !mobileMenuOpen}>
                        <span class="material-icons-round">menu</span>
                    </button>
                </div>
                
                <div class="vp-topbar-right">
                    <!-- Credit -->
                    <a href="/vendor-dashboard/ppc" class="vp-credit" class:low={creditBalance < 5}>
                        <span class="material-icons-round">account_balance_wallet</span>
                        <span class="vp-credit-value">{formatCredit(creditBalance)} €</span>
                    </a>
                    
                    <!-- Shop Switcher -->
                    <div class="vp-dropdown">
                        <button class="vp-shop-btn" on:click|stopPropagation={() => shopDropdownOpen = !shopDropdownOpen}>
                            <span class="vp-shop-name">{shop?.shop_name || 'Obchod'}</span>
                            <span class="material-icons-round">expand_more</span>
                        </button>
                        {#if shopDropdownOpen}
                            <div class="vp-dropdown-menu">
                                <div class="vp-dropdown-header">Vaše obchody</div>
                                {#each shops as s}
                                    <button class="vp-dropdown-item" class:active={s.id === shop?.id} on:click={() => switchShop(s)}>
                                        <span class="material-icons-round">store</span>
                                        <span>{s.shop_name}</span>
                                        {#if s.id === shop?.id}
                                            <span class="material-icons-round vp-check">check</span>
                                        {/if}
                                    </button>
                                {/each}
                                <div class="vp-dropdown-divider"></div>
                                <a href="/vendor-dashboard/pridat-obchod" class="vp-dropdown-item vp-add">
                                    <span class="material-icons-round">add</span>
                                    <span>Pridať obchod</span>
                                </a>
                            </div>
                        {/if}
                    </div>
                    
                    <!-- Account -->
                    <div class="vp-dropdown">
                        <button class="vp-avatar-btn" on:click|stopPropagation={() => accountDropdownOpen = !accountDropdownOpen}>
                            <span class="vp-avatar">{(vendor.company_name || vendor.email || 'V').charAt(0).toUpperCase()}</span>
                        </button>
                        {#if accountDropdownOpen}
                            <div class="vp-dropdown-menu vp-account-menu">
                                <div class="vp-user-info">
                                    <div class="vp-user-avatar">{(vendor.company_name || vendor.email || 'V').charAt(0).toUpperCase()}</div>
                                    <div>
                                        <div class="vp-user-name">{vendor.company_name || 'Predajca'}</div>
                                        <div class="vp-user-email">{vendor.email}</div>
                                    </div>
                                </div>
                                <div class="vp-dropdown-divider"></div>
                                <a href="/vendor-dashboard/moj-ucet" class="vp-dropdown-item">
                                    <span class="material-icons-round">person</span>
                                    <span>Môj účet</span>
                                </a>
                                <a href="/vendor-dashboard/nastavenia-predaja" class="vp-dropdown-item">
                                    <span class="material-icons-round">settings</span>
                                    <span>Nastavenia</span>
                                </a>
                                <div class="vp-dropdown-divider"></div>
                                <button class="vp-dropdown-item vp-logout" on:click={logout}>
                                    <span class="material-icons-round">logout</span>
                                    <span>Odhlásiť sa</span>
                                </button>
                            </div>
                        {/if}
                    </div>
                </div>
            </header>
            
            <!-- PAGE CONTENT -->
            <div class="vp-content">
                <slot />
            </div>
        </div>
    </div>
{/if}

<style>
    :global(*) { margin: 0; padding: 0; box-sizing: border-box; }
    :global(body) { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #f8fafc; }
    
    /* LOADING */
    .vp-loading { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f8fafc; }
    .vp-loader { width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    /* APP LAYOUT */
    .vp-app { display: flex; min-height: 100vh; }
    
    /* SIDEBAR */
    .vp-sidebar {
        width: 240px;
        background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
        display: flex;
        flex-direction: column;
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        z-index: 100;
    }
    
    .vp-sidebar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 16px;
        border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    
    .vp-brand {
        display: flex;
        align-items: center;
        gap: 12px;
        text-decoration: none;
    }
    
    .vp-brand-icon {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
    }
    
    .vp-brand-icon .material-icons-round { font-size: 22px; }
    
    .vp-brand-text { display: flex; flex-direction: column; }
    .vp-brand-name { font-size: 18px; font-weight: 700; color: #fff; }
    .vp-brand-sub { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
    
    /* NAV */
    .vp-nav { flex: 1; padding: 16px 12px; overflow-y: auto; }
    .vp-nav-group { display: flex; flex-direction: column; gap: 4px; }
    .vp-nav-title { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 12px 8px; }
    .vp-nav-divider { height: 1px; background: rgba(255,255,255,0.08); margin: 16px 0; }
    
    .vp-nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        color: #94a3b8;
        text-decoration: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.15s;
    }
    
    .vp-nav-item:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; }
    .vp-nav-item.active { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
    .vp-nav-item .material-icons-round { font-size: 20px; }
    
    .vp-sidebar-footer { padding: 16px 12px; border-top: 1px solid rgba(255,255,255,0.08); }
    
    .vp-logout-btn {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 10px 12px;
        background: none;
        border: none;
        color: #94a3b8;
        font-size: 14px;
        font-weight: 500;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.15s;
    }
    
    .vp-logout-btn:hover { background: rgba(239, 68, 68, 0.15); color: #f87171; }
    
    /* MAIN */
    .vp-main {
        flex: 1;
        margin-left: 240px;
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }
    
    /* TOPBAR */
    .vp-topbar {
        height: 56px;
        background: #fff;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding: 0 24px;
        position: sticky;
        top: 0;
        z-index: 50;
    }
    
    .vp-topbar-left { display: flex; align-items: center; gap: 16px; }
    
    .vp-mobile-menu {
        display: none;
        width: 40px;
        height: 40px;
        background: #f1f5f9;
        border: none;
        border-radius: 8px;
        color: #475569;
        cursor: pointer;
    }
    
    .vp-topbar-right { display: flex; align-items: center; gap: 12px; }
    
    /* CREDIT */
    .vp-credit {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 14px;
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        border-radius: 8px;
        color: #059669;
        text-decoration: none;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.15s;
    }
    
    .vp-credit:hover { background: #d1fae5; }
    .vp-credit .material-icons-round { font-size: 18px; }
    
    .vp-credit.low {
        background: #fef2f2;
        border-color: #fecaca;
        color: #dc2626;
    }
    
    /* SHOP BTN */
    .vp-shop-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        color: #475569;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s;
    }
    
    .vp-shop-btn:hover { background: #f1f5f9; border-color: #cbd5e1; }
    .vp-shop-name { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    
    /* AVATAR */
    .vp-avatar-btn {
        width: 40px;
        height: 40px;
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
    }
    
    .vp-avatar {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: 16px;
    }
    
    /* DROPDOWN */
    .vp-dropdown { position: relative; }
    
    .vp-dropdown-menu {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.12);
        min-width: 220px;
        overflow: hidden;
        z-index: 200;
    }
    
    .vp-dropdown-header {
        padding: 10px 14px;
        font-size: 11px;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
    }
    
    .vp-dropdown-divider { height: 1px; background: #e2e8f0; }
    
    .vp-dropdown-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        color: #475569;
        text-decoration: none;
        font-size: 14px;
        cursor: pointer;
        background: none;
        border: none;
        width: 100%;
        text-align: left;
        transition: all 0.15s;
    }
    
    .vp-dropdown-item:hover { background: #f8fafc; color: #1e293b; }
    .vp-dropdown-item.active { background: #eff6ff; color: #3b82f6; }
    .vp-dropdown-item .material-icons-round { font-size: 18px; }
    .vp-dropdown-item .vp-check { margin-left: auto; color: #3b82f6; }
    .vp-dropdown-item.vp-add { color: #3b82f6; font-weight: 500; }
    .vp-dropdown-item.vp-logout { color: #dc2626; }
    .vp-dropdown-item.vp-logout:hover { background: #fef2f2; }
    
    /* ACCOUNT MENU */
    .vp-user-info {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px;
    }
    
    .vp-user-avatar {
        width: 44px;
        height: 44px;
        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: 18px;
    }
    
    .vp-user-name { font-weight: 600; color: #1e293b; }
    .vp-user-email { font-size: 12px; color: #64748b; }
    
    /* CONTENT */
    .vp-content {
        flex: 1;
        padding: 20px 24px;
    }
    
    /* MOBILE */
    .vp-overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        z-index: 90;
    }
    
    @media (max-width: 1024px) {
        .vp-sidebar {
            transform: translateX(-100%);
            width: 260px;
        }
        
        .vp-sidebar.mobile-open { transform: translateX(0); }
        .vp-overlay { display: block; }
        
        .vp-main { margin-left: 0; }
        
        .vp-mobile-menu { display: flex; align-items: center; justify-content: center; }
        
        .vp-topbar { justify-content: space-between; }
    }
    
    @media (max-width: 640px) {
        .vp-topbar { padding: 0 16px; }
        .vp-content { padding: 16px; }
        .vp-page-title { font-size: 18px; }
        .vp-credit-value { display: none; }
        .vp-shop-name { max-width: 80px; }
    }
</style>
