<script>
    import { page } from '$app/stores';
    import { onMount, setContext } from 'svelte';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    import { writable } from 'svelte/store';
    
    const API_BASE = import.meta.env.VITE_API_URL || 'http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io/api/v1';
    
    // Stores pre vendor a shop - budú zdieľané s child komponentmi
    const vendorStore = writable(null);
    const shopStore = writable(null);
    
    setContext('vendor', vendorStore);
    setContext('shop', shopStore);
    setContext('API_BASE', API_BASE);
    
    let loading = true;
    let sidebarOpen = false;
    
    $: vendor = $vendorStore;
    $: shop = $shopStore;
    
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
        goto('/prihlasenie-predajcu');
    }
    
    function getInitial(name) {
        return name ? name.charAt(0).toUpperCase() : 'V';
    }
    
    function toggleSidebar() {
        sidebarOpen = !sidebarOpen;
    }
    
    $: currentPath = $page.url.pathname;
    $: isOverview = currentPath === '/vendor-dashboard' || currentPath === '/vendor-dashboard/';
</script>

<svelte:head>
    <title>Vendor Portal | MegaPrice</title>
    <meta name="robots" content="noindex, nofollow">
</svelte:head>

{#if loading}
    <div class="mkma-loading-screen">
        <div class="mkma-spinner"></div>
        <p>Načítavam portál...</p>
    </div>
{:else if vendor}
    <!-- Mobile Toggle -->
    <button class="mkma-mobile-toggle" on:click={toggleSidebar}>☰</button>
    
    <!-- Sidebar Overlay for Mobile -->
    {#if sidebarOpen}
        <div class="mkma-sidebar-overlay" on:click={() => sidebarOpen = false} on:keydown={() => {}} role="button" tabindex="0"></div>
    {/if}
    
    <div class="mkma-frontend-dashboard">
        <aside class="mkma-dashboard-sidebar" class:open={sidebarOpen}>
            <div class="mkma-sidebar-header">
                <h2>🏪 Vendor Portal</h2>
                <p class="mkma-shop-name">{shop?.shop_name || vendor.company_name || 'Môj obchod'}</p>
                <div class="mkma-shop-badges">
                    {#if vendor.status === 'active'}
                        <span class="mkma-badge mkma-badge-success">✓ Aktívny</span>
                    {:else if vendor.status === 'pending'}
                        <span class="mkma-badge mkma-badge-warning">⏳ Čaká na schválenie</span>
                    {:else}
                        <span class="mkma-badge mkma-badge-secondary">{vendor.status}</span>
                    {/if}
                    <span class="mkma-badge mkma-badge-info">
                        {shop?.display_mode === 'cpc' ? '💰 CPC' : '🆓 FREE'} režim
                    </span>
                </div>
            </div>
            
            <nav class="mkma-dashboard-nav">
                <!-- Hlavné menu -->
                <div class="mkma-nav-section">
                    <a href="/vendor-dashboard" class="mkma-nav-item" class:active={isOverview} on:click={() => sidebarOpen = false}>
                        <span class="mkma-nav-icon">📊</span>
                        <span class="mkma-nav-text">Prehľad</span>
                    </a>
                    <a href="/vendor-dashboard/ppc" class="mkma-nav-item" class:active={currentPath.includes('/ppc')} on:click={() => sidebarOpen = false}>
                        <span class="mkma-nav-icon">💰</span>
                        <span class="mkma-nav-text">PPC & Kredit</span>
                    </a>
                    <a href="/vendor-dashboard/produkty" class="mkma-nav-item" class:active={currentPath.includes('/produkty')} on:click={() => sidebarOpen = false}>
                        <span class="mkma-nav-icon">🛍️</span>
                        <span class="mkma-nav-text">Produkty</span>
                    </a>
                    <a href="/vendor-dashboard/statistiky" class="mkma-nav-item" class:active={currentPath.includes('/statistiky')} on:click={() => sidebarOpen = false}>
                        <span class="mkma-nav-icon">📈</span>
                        <span class="mkma-nav-text">Štatistiky</span>
                    </a>
                    <a href="/vendor-dashboard/reporty" class="mkma-nav-item" class:active={currentPath.includes('/reporty')} on:click={() => sidebarOpen = false}>
                        <span class="mkma-nav-icon">📋</span>
                        <span class="mkma-nav-text">Reporty</span>
                    </a>
                </div>
                
                <div class="mkma-nav-divider"></div>
                
                <!-- Nastavenia -->
                <div class="mkma-nav-section">
                    <div class="mkma-nav-section-title">Nastavenia</div>
                    <a href="/vendor-dashboard/moj-ucet" class="mkma-nav-item" class:active={currentPath.includes('/moj-ucet')} on:click={() => sidebarOpen = false}>
                        <span class="mkma-nav-icon">👤</span>
                        <span class="mkma-nav-text">Môj účet</span>
                    </a>
                    <a href="/vendor-dashboard/nastavenia-predaja" class="mkma-nav-item" class:active={currentPath.includes('/nastavenia-predaja')} on:click={() => sidebarOpen = false}>
                        <span class="mkma-nav-icon">🛒</span>
                        <span class="mkma-nav-text">Nastavenia predaja</span>
                    </a>
                    <a href="/vendor-dashboard/xml-feedy" class="mkma-nav-item" class:active={currentPath.includes('/xml-feedy')} on:click={() => sidebarOpen = false}>
                        <span class="mkma-nav-icon">📄</span>
                        <span class="mkma-nav-text">XML Feedy</span>
                    </a>
                </div>
                
                <div class="mkma-nav-divider"></div>
                
                <!-- Späť na web a Odhlásenie -->
                <a href="/" class="mkma-nav-item mkma-nav-back">
                    <span class="mkma-nav-icon">🏠</span>
                    <span class="mkma-nav-text">Späť na MegaPrice</span>
                </a>
                
                <button class="mkma-nav-item mkma-nav-logout" on:click={logout}>
                    <span class="mkma-nav-icon">🚪</span>
                    <span class="mkma-nav-text">Odhlásiť sa</span>
                </button>
            </nav>
            
            <!-- User Info Footer -->
            <div class="mkma-sidebar-footer">
                <div class="mkma-user-info">
                    <div class="mkma-user-avatar">
                        {getInitial(vendor.company_name || vendor.email)}
                    </div>
                    <div class="mkma-user-details">
                        <div class="mkma-user-name">{vendor.company_name || 'Predajca'}</div>
                        <div class="mkma-user-email">{vendor.email}</div>
                    </div>
                </div>
            </div>
        </aside>
        
        <main class="mkma-dashboard-content">
            <div class="mkma-dashboard-inner">
                <slot />
            </div>
        </main>
    </div>
{/if}

<style>
    /* CSS Reset */
    :global(*) {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    
    :global(body) {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        line-height: 1.6;
        overflow-x: hidden;
        background: #F7F8FA;
    }
    
    /* Loading Screen */
    .mkma-loading-screen {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: #F7F8FA;
        color: #718096;
    }
    
    .mkma-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #E4E7EB;
        border-top-color: #0066FF;
        border-radius: 50%;
        animation: mkma-spin 0.8s linear infinite;
        margin-bottom: 16px;
    }
    
    @keyframes mkma-spin {
        to { transform: rotate(360deg); }
    }
    
    /* Main Layout */
    .mkma-frontend-dashboard {
        background: #F7F8FA;
        min-height: 100vh;
        display: flex;
        position: relative;
    }
    
    /* Sidebar */
    .mkma-dashboard-sidebar {
        width: 280px;
        background: #fff;
        border-right: 1px solid #E4E7EB;
        position: fixed;
        left: 0;
        top: 0;
        height: 100vh;
        overflow-y: auto;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        transition: transform 0.3s ease;
    }
    
    .mkma-sidebar-header {
        padding: 24px;
        border-bottom: 1px solid #E4E7EB;
        flex-shrink: 0;
    }
    
    .mkma-sidebar-header h2 {
        font-size: 20px;
        font-weight: 700;
        color: #1A202C;
        margin: 0 0 4px;
    }
    
    .mkma-shop-name {
        font-size: 14px;
        color: #718096;
        margin: 0 0 12px;
    }
    
    .mkma-shop-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }
    
    .mkma-badge {
        display: inline-flex;
        align-items: center;
        padding: 4px 10px;
        font-size: 11px;
        font-weight: 600;
        border-radius: 20px;
    }
    
    .mkma-badge-success {
        background: #dcfce7;
        color: #166534;
    }
    
    .mkma-badge-warning {
        background: #fef3c7;
        color: #92400e;
    }
    
    .mkma-badge-secondary {
        background: #f1f5f9;
        color: #64748b;
    }
    
    .mkma-badge-info {
        background: #dbeafe;
        color: #1e40af;
    }
    
    /* Navigation */
    .mkma-dashboard-nav {
        padding: 16px 0;
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
    }
    
    .mkma-nav-section {
        margin-bottom: 8px;
    }
    
    .mkma-nav-section-title {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #A0AEC0;
        padding: 8px 24px 4px;
        margin-top: 8px;
    }
    
    .mkma-nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 24px;
        color: #4A5568;
        text-decoration: none;
        transition: all 0.2s;
        font-weight: 500;
        font-size: 14px;
        border-left: 3px solid transparent;
        cursor: pointer;
        background: none;
        border-right: none;
        border-top: none;
        border-bottom: none;
        width: 100%;
        text-align: left;
    }
    
    .mkma-nav-item:hover {
        background: #F7FAFC;
        color: #0066FF;
    }
    
    .mkma-nav-item.active {
        background: #EBF5FF;
        color: #0066FF;
        border-left-color: #0066FF;
        font-weight: 600;
    }
    
    .mkma-nav-icon {
        font-size: 18px;
        line-height: 1;
        width: 24px;
        text-align: center;
    }
    
    .mkma-nav-divider {
        height: 1px;
        background: #E4E7EB;
        margin: 16px 24px;
    }
    
    .mkma-nav-back {
        color: #718096;
    }
    
    .mkma-nav-logout {
        color: #E53E3E;
        margin-top: auto;
    }
    
    .mkma-nav-logout:hover {
        background: #FFF5F5;
        color: #C53030;
    }
    
    /* Sidebar Footer */
    .mkma-sidebar-footer {
        padding: 16px 24px;
        border-top: 1px solid #E4E7EB;
        background: #F7FAFC;
        flex-shrink: 0;
    }
    
    .mkma-user-info {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .mkma-user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 16px;
        flex-shrink: 0;
    }
    
    .mkma-user-details {
        flex: 1;
        min-width: 0;
    }
    
    .mkma-user-name {
        font-size: 14px;
        font-weight: 600;
        color: #1A202C;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .mkma-user-email {
        font-size: 12px;
        color: #718096;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    /* Main Content */
    .mkma-dashboard-content {
        flex: 1;
        margin-left: 280px;
        min-height: 100vh;
    }
    
    .mkma-dashboard-inner {
        padding: 32px;
        max-width: 1400px;
    }
    
    /* Mobile */
    .mkma-mobile-toggle {
        display: none;
        position: fixed;
        top: 16px;
        left: 16px;
        z-index: 1001;
        background: #fff;
        border: 1px solid #E4E7EB;
        border-radius: 8px;
        padding: 10px 14px;
        font-size: 20px;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .mkma-sidebar-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 999;
    }
    
    @media (max-width: 1024px) {
        .mkma-mobile-toggle {
            display: block;
        }
        
        .mkma-dashboard-sidebar {
            transform: translateX(-100%);
        }
        
        .mkma-dashboard-sidebar.open {
            transform: translateX(0);
        }
        
        .mkma-sidebar-overlay {
            display: block;
        }
        
        .mkma-dashboard-content {
            margin-left: 0;
        }
        
        .mkma-dashboard-inner {
            padding: 80px 16px 32px;
        }
    }
</style>
