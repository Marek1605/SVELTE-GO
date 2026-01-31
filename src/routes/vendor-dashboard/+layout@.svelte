<script>
    import { page } from '$app/stores';
    import { onMount, setContext } from 'svelte';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    import { writable } from 'svelte/store';
    
    const API_BASE = import.meta.env.VITE_API_URL || 'http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io/api/v1';
    
    // Stores
    const vendorStore = writable(null);
    const shopStore = writable(null);
    const shopsStore = writable([]); // Všetky shopy vendora
    
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
                // Načítaj všetky shopy vendora
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
        // Reload stránky pre načítanie nových dát
        window.location.reload();
    }
    
    function formatCredit(amount) {
        return new Intl.NumberFormat('sk-SK', { 
            minimumFractionDigits: 2,
            maximumFractionDigits: 2 
        }).format(amount || 0) + ' €';
    }
    
    function toggleSidebar() {
        sidebarOpen = !sidebarOpen;
    }
    
    function closeDropdowns(e) {
        if (!e.target.closest('.shop-dropdown') && !e.target.closest('.account-dropdown')) {
            shopDropdownOpen = false;
            accountDropdownOpen = false;
        }
    }
    
    $: currentPath = $page.url.pathname;
    $: isOverview = currentPath === '/vendor-dashboard' || currentPath === '/vendor-dashboard/';
    
    // Menu items
    const menuItems = [
        { href: '/vendor-dashboard', label: 'Prehľad', icon: '📊', exact: true },
        { href: '/vendor-dashboard/produkty', label: 'Produkty', icon: '📦' },
        { href: '/vendor-dashboard/ppc', label: 'PPC & Kredit', icon: '💰' },
        { href: '/vendor-dashboard/statistiky', label: 'Štatistiky', icon: '📈' },
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
    <div class="loading-screen">
        <div class="spinner"></div>
        <p>Načítavam portál...</p>
    </div>
{:else if vendor}
    <div class="dashboard-layout">
        <!-- TOP HEADER - Heureka style -->
        <header class="top-header">
            <div class="header-left">
                <button class="mobile-toggle" on:click={toggleSidebar}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
                <a href="/vendor-dashboard" class="logo">
                    <span class="logo-text">mega</span><span class="logo-accent">shops</span>
                </a>
            </div>
            
            <div class="header-right">
                <!-- Credit Badge -->
                <a href="/vendor-dashboard/ppc" class="credit-badge" class:low={creditBalance < 5}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                        <path d="M12 12h.01"/>
                    </svg>
                    <span class="credit-amount">{formatCredit(creditBalance)}</span>
                </a>
                
                <!-- Shop Switcher Dropdown -->
                <div class="shop-dropdown">
                    <button class="shop-switcher" on:click|stopPropagation={() => shopDropdownOpen = !shopDropdownOpen}>
                        <span class="shop-name">{shop?.shop_name || 'Môj obchod'}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                    
                    {#if shopDropdownOpen}
                        <div class="dropdown-menu shop-menu">
                            <div class="dropdown-header">Vaše obchody</div>
                            {#each shops as s}
                                <button 
                                    class="dropdown-item" 
                                    class:active={s.id === shop?.id}
                                    on:click={() => switchShop(s)}
                                >
                                    <span class="shop-icon">🏪</span>
                                    <span class="shop-info">
                                        <span class="shop-item-name">{s.shop_name}</span>
                                        <span class="shop-item-url">{s.shop_url || 'Bez URL'}</span>
                                    </span>
                                    {#if s.id === shop?.id}
                                        <svg class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    {/if}
                                </button>
                            {/each}
                            <div class="dropdown-divider"></div>
                            <a href="/vendor-dashboard/pridat-obchod" class="dropdown-item add-shop">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="16"></line>
                                    <line x1="8" y1="12" x2="16" y2="12"></line>
                                </svg>
                                <span>Pridať nový obchod</span>
                            </a>
                        </div>
                    {/if}
                </div>
                
                <!-- Account Dropdown -->
                <div class="account-dropdown">
                    <button class="account-btn" on:click|stopPropagation={() => accountDropdownOpen = !accountDropdownOpen}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </button>
                    
                    {#if accountDropdownOpen}
                        <div class="dropdown-menu account-menu">
                            <div class="dropdown-user">
                                <div class="user-avatar">
                                    {(vendor.company_name || vendor.email || 'V').charAt(0).toUpperCase()}
                                </div>
                                <div class="user-info">
                                    <div class="user-name">{vendor.company_name || 'Predajca'}</div>
                                    <div class="user-email">{vendor.email}</div>
                                </div>
                            </div>
                            <div class="dropdown-divider"></div>
                            <a href="/vendor-dashboard/moj-ucet" class="dropdown-item">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                Môj účet
                            </a>
                            <a href="/vendor-dashboard/nastavenia-predaja" class="dropdown-item">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="3"></circle>
                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                                </svg>
                                Nastavenia
                            </a>
                            <div class="dropdown-divider"></div>
                            <a href="/" class="dropdown-item" target="_blank">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                    <polyline points="15 3 21 3 21 9"></polyline>
                                    <line x1="10" y1="14" x2="21" y2="3"></line>
                                </svg>
                                Zobraziť web
                            </a>
                            <div class="dropdown-divider"></div>
                            <button class="dropdown-item logout" on:click={logout}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                                Odhlásiť sa
                            </button>
                        </div>
                    {/if}
                </div>
            </div>
        </header>
        
        <!-- Sidebar Overlay -->
        {#if sidebarOpen}
            <div class="sidebar-overlay" on:click={() => sidebarOpen = false} on:keydown={() => {}} role="button" tabindex="0"></div>
        {/if}
        
        <!-- SIDEBAR -->
        <aside class="sidebar" class:open={sidebarOpen}>
            <nav class="sidebar-nav">
                <!-- Main Menu -->
                <div class="nav-section">
                    {#each menuItems as item}
                        <a 
                            href={item.href} 
                            class="nav-item" 
                            class:active={item.exact ? isOverview : currentPath.includes(item.href.split('/').pop())}
                            on:click={() => sidebarOpen = false}
                        >
                            <span class="nav-icon">{item.icon}</span>
                            <span class="nav-text">{item.label}</span>
                        </a>
                    {/each}
                </div>
                
                <div class="nav-divider"></div>
                
                <!-- Settings -->
                <div class="nav-section">
                    <div class="nav-section-title">Nastavenia</div>
                    {#each settingsItems as item}
                        <a 
                            href={item.href} 
                            class="nav-item" 
                            class:active={currentPath.includes(item.href.split('/').pop())}
                            on:click={() => sidebarOpen = false}
                        >
                            <span class="nav-icon">{item.icon}</span>
                            <span class="nav-text">{item.label}</span>
                        </a>
                    {/each}
                </div>
            </nav>
        </aside>
        
        <!-- MAIN CONTENT -->
        <main class="main-content">
            <div class="content-inner">
                <slot />
            </div>
        </main>
    </div>
{/if}

<style>
    :global(*) {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    
    :global(body) {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background: #f5f7fa;
        overflow-x: hidden;
    }
    
    /* Loading */
    .loading-screen {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: #f5f7fa;
    }
    
    .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #e0e0e0;
        border-top-color: #0079bf;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    /* Layout */
    .dashboard-layout {
        min-height: 100vh;
    }
    
    /* TOP HEADER */
    .top-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 60px;
        background: #fff;
        border-bottom: 1px solid #e0e6ed;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 24px;
        z-index: 1000;
    }
    
    .header-left {
        display: flex;
        align-items: center;
        gap: 16px;
    }
    
    .mobile-toggle {
        display: none;
        background: none;
        border: none;
        padding: 8px;
        cursor: pointer;
        color: #5f6d7e;
    }
    
    .logo {
        text-decoration: none;
        font-size: 22px;
        font-weight: 700;
    }
    
    .logo-text {
        color: #0079bf;
    }
    
    .logo-accent {
        color: #ff6b35;
    }
    
    .header-right {
        display: flex;
        align-items: center;
        gap: 16px;
    }
    
    /* Credit Badge */
    .credit-badge {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: #f0f7ff;
        border: 1px solid #0079bf;
        border-radius: 8px;
        color: #0079bf;
        text-decoration: none;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.2s;
    }
    
    .credit-badge:hover {
        background: #e0efff;
    }
    
    .credit-badge.low {
        background: #fff5f5;
        border-color: #e53e3e;
        color: #e53e3e;
    }
    
    /* Shop Switcher */
    .shop-dropdown {
        position: relative;
    }
    
    .shop-switcher {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: #fff;
        border: 1px solid #e0e6ed;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        color: #1a2b3c;
        transition: all 0.2s;
    }
    
    .shop-switcher:hover {
        border-color: #0079bf;
    }
    
    .shop-name {
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    
    /* Account Button */
    .account-dropdown {
        position: relative;
    }
    
    .account-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: #f5f7fa;
        border: 1px solid #e0e6ed;
        border-radius: 50%;
        cursor: pointer;
        color: #5f6d7e;
        transition: all 0.2s;
    }
    
    .account-btn:hover {
        background: #e8ecf0;
        color: #0079bf;
    }
    
    /* Dropdown Menus */
    .dropdown-menu {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        background: #fff;
        border: 1px solid #e0e6ed;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.12);
        min-width: 280px;
        overflow: hidden;
        z-index: 1001;
    }
    
    .dropdown-header {
        padding: 12px 16px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        color: #8a94a6;
        background: #f8fafc;
    }
    
    .dropdown-user {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
    }
    
    .user-avatar {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: linear-gradient(135deg, #0079bf, #00a8e8);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 18px;
    }
    
    .user-info {
        flex: 1;
    }
    
    .user-name {
        font-weight: 600;
        color: #1a2b3c;
    }
    
    .user-email {
        font-size: 13px;
        color: #8a94a6;
    }
    
    .dropdown-divider {
        height: 1px;
        background: #e0e6ed;
        margin: 4px 0;
    }
    
    .dropdown-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        color: #5f6d7e;
        text-decoration: none;
        font-size: 14px;
        cursor: pointer;
        background: none;
        border: none;
        width: 100%;
        text-align: left;
        transition: all 0.15s;
    }
    
    .dropdown-item:hover {
        background: #f5f7fa;
        color: #0079bf;
    }
    
    .dropdown-item.active {
        background: #f0f7ff;
        color: #0079bf;
    }
    
    .dropdown-item.logout {
        color: #e53e3e;
    }
    
    .dropdown-item.logout:hover {
        background: #fff5f5;
    }
    
    .dropdown-item.add-shop {
        color: #0079bf;
    }
    
    .shop-icon {
        font-size: 20px;
    }
    
    .shop-info {
        flex: 1;
        display: flex;
        flex-direction: column;
    }
    
    .shop-item-name {
        font-weight: 500;
        color: #1a2b3c;
    }
    
    .shop-item-url {
        font-size: 12px;
        color: #8a94a6;
    }
    
    .check-icon {
        color: #0079bf;
    }
    
    /* SIDEBAR */
    .sidebar {
        position: fixed;
        left: 0;
        top: 60px;
        width: 260px;
        height: calc(100vh - 60px);
        background: #fff;
        border-right: 1px solid #e0e6ed;
        overflow-y: auto;
        z-index: 900;
        transition: transform 0.3s ease;
    }
    
    .sidebar-nav {
        padding: 16px 0;
    }
    
    .nav-section {
        margin-bottom: 8px;
    }
    
    .nav-section-title {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #8a94a6;
        padding: 12px 20px 8px;
    }
    
    .nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 20px;
        color: #5f6d7e;
        text-decoration: none;
        font-size: 14px;
        font-weight: 500;
        border-left: 3px solid transparent;
        transition: all 0.15s;
    }
    
    .nav-item:hover {
        background: #f5f7fa;
        color: #0079bf;
    }
    
    .nav-item.active {
        background: #f0f7ff;
        color: #0079bf;
        border-left-color: #0079bf;
        font-weight: 600;
    }
    
    .nav-icon {
        font-size: 18px;
        width: 24px;
        text-align: center;
    }
    
    .nav-divider {
        height: 1px;
        background: #e0e6ed;
        margin: 12px 20px;
    }
    
    /* Sidebar Overlay */
    .sidebar-overlay {
        display: none;
        position: fixed;
        top: 60px;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.4);
        z-index: 899;
    }
    
    /* MAIN CONTENT */
    .main-content {
        margin-left: 260px;
        margin-top: 60px;
        min-height: calc(100vh - 60px);
        background: #f5f7fa;
    }
    
    .content-inner {
        padding: 24px;
        max-width: 1400px;
    }
    
    /* MOBILE */
    @media (max-width: 1024px) {
        .mobile-toggle {
            display: flex;
        }
        
        .sidebar {
            transform: translateX(-100%);
        }
        
        .sidebar.open {
            transform: translateX(0);
        }
        
        .sidebar-overlay {
            display: block;
        }
        
        .main-content {
            margin-left: 0;
        }
        
        .shop-name {
            max-width: 100px;
        }
        
        .credit-badge .credit-amount {
            display: none;
        }
        
        .credit-badge {
            padding: 8px 12px;
        }
    }
    
    @media (max-width: 640px) {
        .top-header {
            padding: 0 12px;
        }
        
        .header-right {
            gap: 8px;
        }
        
        .shop-switcher {
            padding: 6px 10px;
        }
        
        .shop-name {
            max-width: 80px;
            font-size: 13px;
        }
        
        .content-inner {
            padding: 16px;
        }
        
        .dropdown-menu {
            min-width: 260px;
        }
    }
</style>
