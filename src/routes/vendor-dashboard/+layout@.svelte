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
    let sidebarOpen = false;
    let shopDropdownOpen = false;
    let accountDropdownOpen = false;
    
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
    
    function toggleSidebar() { sidebarOpen = !sidebarOpen; }
    
    function closeDropdowns(e) {
        if (!e.target.closest('.mkv-shop-dropdown') && !e.target.closest('.mkv-account-dropdown')) {
            shopDropdownOpen = false;
            accountDropdownOpen = false;
        }
    }
    
    $: currentPath = $page.url.pathname;
    $: isOverview = currentPath === '/vendor-dashboard' || currentPath === '/vendor-dashboard/';
    
    const menuItems = [
        { href: '/vendor-dashboard', label: 'Prehľad', icon: '📊', exact: true },
        { href: '/vendor-dashboard/produkty', label: 'Produkty', icon: '📦' },
        { href: '/vendor-dashboard/ppc', label: 'PPC & Kredit', icon: '💰' },
        { href: '/vendor-dashboard/statistiky', label: 'Štatistiky', icon: '📈' },
        { href: '/vendor-dashboard/konverzie', label: 'Konverzie', icon: '✅' },
        { href: '/vendor-dashboard/reporty', label: 'Reporty', icon: '📋' },
    ];
    
    const settingsItems = [
        { href: '/vendor-dashboard/moj-ucet', label: 'Môj účet', icon: '👤' },
        { href: '/vendor-dashboard/nastavenia-predaja', label: 'Nastavenia predaja', icon: '⚙️' },
        { href: '/vendor-dashboard/xml-feedy', label: 'XML Feedy', icon: '📄' },
    ];
</script>

<svelte:head>
    <title>{shop?.shop_name || 'Vendor Portal'} | MegaPrice</title>
    <meta name="robots" content="noindex, nofollow">
</svelte:head>

<svelte:window on:click={closeDropdowns} />

{#if loading}
    <div class="mkv-loading">
        <div class="mkv-spinner"></div>
        <p>Načítavam portál...</p>
    </div>
{:else if vendor}
    <div class="mkv-layout">
        <!-- TOP HEADER - Heureka style -->
        <header class="mkv-header">
            <div class="mkv-header-inner">
                <div class="mkv-header-left">
                    <button class="mkv-menu-toggle" on:click={toggleSidebar}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                    <a href="/vendor-dashboard" class="mkv-logo">
                        <span class="mkv-logo-mega">mega</span><span class="mkv-logo-shops">shops</span>
                    </a>
                </div>
                
                <div class="mkv-header-right">
                    <!-- CREDIT BADGE - Very Prominent -->
                    <a href="/vendor-dashboard/ppc" class="mkv-credit-badge" class:low={creditBalance < 5}>
                        <div class="mkv-credit-icon">💳</div>
                        <div class="mkv-credit-content">
                            <span class="mkv-credit-label">Kredit:</span>
                            <span class="mkv-credit-amount">{formatCredit(creditBalance)} €</span>
                        </div>
                    </a>
                    
                    <!-- Shop Switcher -->
                    <div class="mkv-shop-dropdown">
                        <button class="mkv-shop-btn" on:click|stopPropagation={() => shopDropdownOpen = !shopDropdownOpen}>
                            <span class="mkv-shop-name">{shop?.shop_name || 'Môj obchod'}</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                        
                        {#if shopDropdownOpen}
                            <div class="mkv-dropdown-menu">
                                <div class="mkv-dropdown-header">Vaše obchody</div>
                                {#each shops as s}
                                    <button class="mkv-dropdown-item" class:active={s.id === shop?.id} on:click={() => switchShop(s)}>
                                        <span class="mkv-shop-icon">🏪</span>
                                        <div class="mkv-shop-info">
                                            <span class="mkv-shop-item-name">{s.shop_name}</span>
                                            <span class="mkv-shop-item-url">{s.shop_url || 'Bez URL'}</span>
                                        </div>
                                        {#if s.id === shop?.id}
                                            <svg class="mkv-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        {/if}
                                    </button>
                                {/each}
                                <div class="mkv-dropdown-divider"></div>
                                <a href="/vendor-dashboard/pridat-obchod" class="mkv-dropdown-item mkv-add-shop">
                                    <span>➕</span>
                                    <span>Pridať nový obchod</span>
                                </a>
                            </div>
                        {/if}
                    </div>
                    
                    <!-- Account -->
                    <div class="mkv-account-dropdown">
                        <button class="mkv-account-btn" on:click|stopPropagation={() => accountDropdownOpen = !accountDropdownOpen}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </button>
                        
                        {#if accountDropdownOpen}
                            <div class="mkv-dropdown-menu mkv-account-menu">
                                <div class="mkv-user-info">
                                    <div class="mkv-user-avatar">
                                        {(vendor.company_name || vendor.email || 'V').charAt(0).toUpperCase()}
                                    </div>
                                    <div class="mkv-user-details">
                                        <div class="mkv-user-name">{vendor.company_name || 'Predajca'}</div>
                                        <div class="mkv-user-email">{vendor.email}</div>
                                    </div>
                                </div>
                                <div class="mkv-dropdown-divider"></div>
                                <a href="/vendor-dashboard/moj-ucet" class="mkv-dropdown-item">👤 Môj účet</a>
                                <a href="/vendor-dashboard/nastavenia-predaja" class="mkv-dropdown-item">⚙️ Nastavenia</a>
                                <div class="mkv-dropdown-divider"></div>
                                <a href="/" class="mkv-dropdown-item" target="_blank">🌐 Zobraziť web</a>
                                <div class="mkv-dropdown-divider"></div>
                                <button class="mkv-dropdown-item mkv-logout" on:click={logout}>🚪 Odhlásiť sa</button>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        </header>
        
        <!-- Sidebar Overlay -->
        {#if sidebarOpen}
            <div class="mkv-overlay" on:click={() => sidebarOpen = false} on:keydown={() => {}} role="button" tabindex="0"></div>
        {/if}
        
        <!-- SIDEBAR -->
        <aside class="mkv-sidebar" class:open={sidebarOpen}>
            <nav class="mkv-nav">
                <div class="mkv-nav-section">
                    {#each menuItems as item}
                        <a 
                            href={item.href} 
                            class="mkv-nav-item" 
                            class:active={item.exact ? isOverview : currentPath.startsWith(item.href) && item.href !== '/vendor-dashboard'}
                            on:click={() => sidebarOpen = false}
                        >
                            <span class="mkv-nav-icon">{item.icon}</span>
                            <span class="mkv-nav-text">{item.label}</span>
                        </a>
                    {/each}
                </div>
                
                <div class="mkv-nav-divider"></div>
                
                <div class="mkv-nav-section">
                    <div class="mkv-nav-title">Nastavenia</div>
                    {#each settingsItems as item}
                        <a 
                            href={item.href} 
                            class="mkv-nav-item" 
                            class:active={currentPath.startsWith(item.href)}
                            on:click={() => sidebarOpen = false}
                        >
                            <span class="mkv-nav-icon">{item.icon}</span>
                            <span class="mkv-nav-text">{item.label}</span>
                        </a>
                    {/each}
                </div>
            </nav>
        </aside>
        
        <!-- MAIN -->
        <main class="mkv-main">
            <div class="mkv-content">
                <slot />
            </div>
        </main>
    </div>
{/if}

<style>
    :global(*) { margin: 0; padding: 0; box-sizing: border-box; }
    :global(body) { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f7fa; }
    
    .mkv-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: #f5f7fa; }
    .mkv-spinner { width: 40px; height: 40px; border: 3px solid #e0e0e0; border-top-color: #0079bf; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    .mkv-layout { min-height: 100vh; }
    
    /* HEADER */
    .mkv-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 64px;
        background: #fff;
        border-bottom: 1px solid #e5e7eb;
        z-index: 1000;
        box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    
    .mkv-header-inner {
        max-width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 24px;
    }
    
    .mkv-header-left { display: flex; align-items: center; gap: 20px; }
    
    .mkv-menu-toggle {
        display: none;
        background: #f3f4f6;
        border: none;
        padding: 8px;
        border-radius: 8px;
        cursor: pointer;
        color: #374151;
    }
    
    .mkv-logo { 
        text-decoration: none; 
        font-size: 26px; 
        font-weight: 700;
        display: flex;
        align-items: center;
    }
    .mkv-logo-mega { color: #10b981; }
    .mkv-logo-shops { color: #1f2937; }
    
    .mkv-header-right { display: flex; align-items: center; gap: 16px; }
    
    /* CREDIT BADGE - PROMINENT */
    .mkv-credit-badge {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 16px 8px 12px;
        background: linear-gradient(135deg, #ecfdf5, #d1fae5);
        border: 2px solid #10b981;
        border-radius: 12px;
        color: #047857;
        text-decoration: none;
        transition: all 0.2s;
        box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15);
    }
    
    .mkv-credit-badge:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
    }
    
    .mkv-credit-badge.low {
        background: linear-gradient(135deg, #fef2f2, #fee2e2);
        border-color: #ef4444;
        color: #dc2626;
        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.15);
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }
    
    .mkv-credit-icon { font-size: 24px; }
    
    .mkv-credit-content { display: flex; flex-direction: column; line-height: 1.2; }
    .mkv-credit-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.8; }
    .mkv-credit-amount { font-size: 18px; font-weight: 700; }
    
    /* SHOP DROPDOWN */
    .mkv-shop-dropdown { position: relative; }
    
    .mkv-shop-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        cursor: pointer;
        color: #374151;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s;
    }
    
    .mkv-shop-btn:hover { background: #f3f4f6; border-color: #d1d5db; }
    .mkv-shop-name { max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    
    /* ACCOUNT */
    .mkv-account-dropdown { position: relative; }
    
    .mkv-account-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 50%;
        cursor: pointer;
        color: #6b7280;
        transition: all 0.2s;
    }
    
    .mkv-account-btn:hover { background: #f3f4f6; color: #374151; }
    
    /* DROPDOWN MENUS */
    .mkv-dropdown-menu {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.12);
        min-width: 260px;
        overflow: hidden;
        z-index: 1001;
    }
    
    .mkv-dropdown-header {
        padding: 12px 16px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #9ca3af;
        background: #f9fafb;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .mkv-dropdown-divider { height: 1px; background: #e5e7eb; }
    
    .mkv-dropdown-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        color: #374151;
        text-decoration: none;
        font-size: 14px;
        cursor: pointer;
        background: none;
        border: none;
        width: 100%;
        text-align: left;
        transition: all 0.15s;
    }
    
    .mkv-dropdown-item:hover { background: #f9fafb; color: #0079bf; }
    .mkv-dropdown-item.active { background: #f0f9ff; color: #0079bf; font-weight: 500; }
    .mkv-dropdown-item.mkv-logout { color: #dc2626; }
    .mkv-dropdown-item.mkv-logout:hover { background: #fef2f2; }
    .mkv-dropdown-item.mkv-add-shop { color: #0079bf; font-weight: 500; }
    
    .mkv-shop-icon { font-size: 18px; }
    .mkv-shop-info { flex: 1; display: flex; flex-direction: column; }
    .mkv-shop-item-name { font-weight: 500; color: #1f2937; }
    .mkv-shop-item-url { font-size: 12px; color: #9ca3af; }
    .mkv-check { color: #0079bf; }
    
    .mkv-user-info { display: flex; align-items: center; gap: 12px; padding: 16px; }
    .mkv-user-avatar {
        width: 44px; height: 44px; border-radius: 50%;
        background: linear-gradient(135deg, #0079bf, #00a8e8);
        color: #fff;
        display: flex; align-items: center; justify-content: center;
        font-weight: 700; font-size: 18px;
    }
    .mkv-user-details { flex: 1; }
    .mkv-user-name { font-weight: 600; color: #1f2937; }
    .mkv-user-email { font-size: 13px; color: #9ca3af; }
    
    /* SIDEBAR */
    .mkv-sidebar {
        position: fixed;
        left: 0;
        top: 64px;
        width: 260px;
        height: calc(100vh - 64px);
        background: #fff;
        border-right: 1px solid #e5e7eb;
        overflow-y: auto;
        z-index: 900;
        transition: transform 0.3s ease;
    }
    
    .mkv-nav { padding: 16px 0; }
    .mkv-nav-section { margin-bottom: 8px; }
    .mkv-nav-title {
        font-size: 11px; font-weight: 700; text-transform: uppercase;
        letter-spacing: 0.5px; color: #9ca3af; padding: 12px 20px 8px;
    }
    
    .mkv-nav-item {
        display: flex; align-items: center; gap: 12px;
        padding: 12px 20px;
        color: #6b7280;
        text-decoration: none;
        font-size: 14px; font-weight: 500;
        border-left: 3px solid transparent;
        transition: all 0.15s;
    }
    
    .mkv-nav-item:hover { background: #f9fafb; color: #0079bf; }
    .mkv-nav-item.active { background: #f0f9ff; color: #0079bf; border-left-color: #0079bf; font-weight: 600; }
    .mkv-nav-icon { font-size: 18px; width: 24px; text-align: center; }
    .mkv-nav-divider { height: 1px; background: #e5e7eb; margin: 12px 20px; }
    
    .mkv-overlay { display: none; position: fixed; top: 64px; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); z-index: 899; }
    
    /* MAIN */
    .mkv-main {
        margin-left: 260px;
        margin-top: 64px;
        min-height: calc(100vh - 64px);
        background: #f5f7fa;
    }
    
    .mkv-content { padding: 24px; max-width: 1400px; }
    
    /* MOBILE */
    @media (max-width: 1024px) {
        .mkv-menu-toggle { display: flex; }
        .mkv-sidebar { transform: translateX(-100%); }
        .mkv-sidebar.open { transform: translateX(0); }
        .mkv-overlay { display: block; }
        .mkv-main { margin-left: 0; }
        .mkv-shop-name { max-width: 80px; }
    }
    
    @media (max-width: 640px) {
        .mkv-header-inner { padding: 0 12px; }
        .mkv-header-right { gap: 8px; }
        .mkv-credit-badge { padding: 6px 10px 6px 8px; }
        .mkv-credit-amount { font-size: 15px; }
        .mkv-credit-label { display: none; }
        .mkv-content { padding: 16px; }
        .mkv-logo { font-size: 22px; }
    }
</style>
