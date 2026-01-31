<script>
    import { getContext, onMount } from 'svelte';
    import { browser } from '$app/environment';
    
    const vendorStore = getContext('vendor');
    const shopStore = getContext('shop');
    const API_BASE = getContext('API_BASE');
    
    $: vendor = $vendorStore;
    $: shop = $shopStore;
    
    // Štatistiky
    let stats = {
        clicks: 0,
        spentCredit: 0,
        avgCpc: 0.05,
        conversionRate: 0,
        totalProducts: 0,
        conversions: 0
    };
    
    $: currentCredit = shop?.credit_balance || 0;
    $: avgCpc = stats.avgCpc || 0.05;
    $: remainingClicks = avgCpc > 0 ? Math.floor(currentCredit / avgCpc) : 0;
    $: totalCreditUsed = stats.spentCredit + currentCredit;
    $: spentPercent = totalCreditUsed > 0 ? (stats.spentCredit / totalCreditUsed) * 100 : 0;
    
    onMount(async () => {
        if (!browser) return;
        
        // Načítaj štatistiky z API
        const token = localStorage.getItem('vendor_token');
        if (!token) return;
        
        try {
            const res = await fetch(`${API_BASE}/vendor/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.data) {
                stats = { ...stats, ...data.data };
            }
        } catch (e) {
            console.error('Error loading stats:', e);
        }
    });
    
    function formatNumber(num, decimals = 0) {
        return (num || 0).toLocaleString('sk-SK', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }
</script>

<div class="mkma-dashboard-overview">
    <!-- Minimalist header -->
    <div class="mkma-page-header-slim">
        <span class="mkma-welcome">👋 {vendor?.company_name || 'Predajca'}</span>
    </div>
    
    <!-- Stats Grid - Biele karty s ikonami -->
    <div class="mkma-stats-grid">
        <div class="mkma-stat-card">
            <div class="mkma-stat-icon-wrapper">
                <span class="mkma-stat-icon">👆</span>
            </div>
            <div class="mkma-stat-content">
                <p class="mkma-stat-value">{formatNumber(stats.clicks)}</p>
                <h3>Preklikov (30 dní)</h3>
            </div>
        </div>
        
        <div class="mkma-stat-card">
            <div class="mkma-stat-icon-wrapper">
                <span class="mkma-stat-icon">💸</span>
            </div>
            <div class="mkma-stat-content">
                <p class="mkma-stat-value">{formatNumber(stats.spentCredit, 2)} €</p>
                <h3>Minutý kredit (30 dní)</h3>
            </div>
        </div>
        
        <div class="mkma-stat-card">
            <div class="mkma-stat-icon-wrapper">
                <span class="mkma-stat-icon">📊</span>
            </div>
            <div class="mkma-stat-content">
                <p class="mkma-stat-value">{formatNumber(avgCpc, 3)} €</p>
                <h3>Priemerný CPC</h3>
            </div>
        </div>
        
        <div class="mkma-stat-card">
            <div class="mkma-stat-icon-wrapper">
                <span class="mkma-stat-icon">🎯</span>
            </div>
            <div class="mkma-stat-content">
                <p class="mkma-stat-value">{formatNumber(stats.conversionRate, 1)}%</p>
                <h3>Konverzný pomer</h3>
            </div>
        </div>
    </div>
    
    <!-- Credit Bar -->
    <div class="mkma-credit-bar-container">
        <div class="mkma-credit-bar">
            <div class="mkma-credit-bar-spent" style="width: {Math.min(100, spentPercent)}%;"></div>
            <div class="mkma-credit-bar-remaining" style="width: {Math.max(0, 100 - spentPercent)}%;"></div>
        </div>
        <div class="mkma-credit-bar-labels">
            <span class="mkma-credit-spent">● Minuté: {formatNumber(stats.spentCredit, 2)} €</span>
            <span class="mkma-credit-remaining">● Zostatok: {formatNumber(currentCredit, 2)} €</span>
        </div>
        <p class="mkma-credit-info">Pri priemernom CPC {formatNumber(avgCpc, 3)} € vám zostáva ~{formatNumber(remainingClicks)} klikov</p>
    </div>
    
    <!-- Shop Card -->
    {#if shop}
        <h2 class="mkma-section-title">Váš obchod</h2>
        
        <div class="mkma-shop-card">
            <div class="mkma-shop-header">
                <div class="mkma-shop-logo">
                    {#if shop.shop_logo}
                        <img src={shop.shop_logo} alt={shop.shop_name}>
                    {:else}
                        🏪
                    {/if}
                </div>
                <div class="mkma-shop-info">
                    <h3>{shop.shop_name}</h3>
                    {#if shop.shop_url}
                        <a href={shop.shop_url} target="_blank" rel="noopener" class="mkma-shop-url">
                            {shop.shop_url}
                        </a>
                    {/if}
                </div>
            </div>
            
            <div class="mkma-shop-stats">
                <div class="mkma-shop-stat">
                    <div class="mkma-shop-stat-label">Produkty</div>
                    <div class="mkma-shop-stat-value">{formatNumber(shop.total_offers || stats.totalProducts)}</div>
                </div>
                <div class="mkma-shop-stat">
                    <div class="mkma-shop-stat-label">Kliky</div>
                    <div class="mkma-shop-stat-value">{formatNumber(shop.total_clicks || stats.clicks)}</div>
                </div>
                <div class="mkma-shop-stat">
                    <div class="mkma-shop-stat-label">Konverzie</div>
                    <div class="mkma-shop-stat-value">{formatNumber(stats.conversions)}</div>
                </div>
                <div class="mkma-shop-stat">
                    <div class="mkma-shop-stat-label">Kredit</div>
                    <div class="mkma-shop-stat-value">{formatNumber(shop.credit_balance || 0, 2)} €</div>
                </div>
            </div>
        </div>
    {/if}
    
    <!-- Quick Settings Links -->
    <div class="mkma-quick-settings">
        <h3>⚙️ Nastavenia účtu</h3>
        <div class="mkma-settings-grid">
            <a href="/vendor-dashboard/moj-ucet" class="mkma-settings-link-card">
                <span class="mkma-settings-icon">👤</span>
                <div class="mkma-settings-content">
                    <strong>Môj účet</strong>
                    <p>Osobné údaje, heslo a prihlasovanie</p>
                </div>
                <span class="mkma-settings-arrow">→</span>
            </a>
            <a href="/vendor-dashboard/nastavenia-predaja" class="mkma-settings-link-card">
                <span class="mkma-settings-icon">🛒</span>
                <div class="mkma-settings-content">
                    <strong>Nastavenia predaja</strong>
                    <p>Profil obchodu, doprava, XML feed</p>
                </div>
                <span class="mkma-settings-arrow">→</span>
            </a>
        </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="mkma-quick-actions">
        <h3>🚀 Rýchle akcie</h3>
        <div class="mkma-actions-grid">
            <a href="/vendor-dashboard/ppc" class="mkma-action-btn">
                💰 Dobiť kredit
            </a>
            <a href="/vendor-dashboard/produkty" class="mkma-action-btn">
                🛍️ Produkty
            </a>
            <a href="/vendor-dashboard/statistiky" class="mkma-action-btn">
                📊 Štatistiky a reporty
            </a>
            <a href="/vendor-dashboard/xml-feedy" class="mkma-action-btn">
                📄 XML Feed
            </a>
        </div>
    </div>
</div>

<style>
    .mkma-dashboard-overview {
        width: 100%;
    }
    
    /* Page Header */
    .mkma-page-header {
        margin-bottom: 24px;
    }
    
    .mkma-page-header h1 {
        font-size: 28px;
        font-weight: 700;
        color: #1A202C;
        margin: 0 0 4px;
    }
    
    .mkma-page-header p {
        font-size: 16px;
        color: #718096;
        margin: 0;
    }
    
    /* Slim Header */
    .mkma-page-header-slim {
        margin-bottom: 20px;
    }
    
    .mkma-welcome {
        font-size: 16px;
        color: #718096;
    }
    
    /* Stats Grid */
    .mkma-stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
        margin-bottom: 24px;
    }
    
    .mkma-stat-card {
        background: #FFFFFF;
        border: 1px solid #E4E7EB;
        border-radius: 12px;
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 16px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        transition: all 0.2s;
    }
    
    .mkma-stat-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        transform: translateY(-2px);
    }
    
    .mkma-stat-icon-wrapper {
        width: 48px;
        height: 48px;
        background: #F7FAFC;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }
    
    .mkma-stat-icon {
        font-size: 24px;
    }
    
    .mkma-stat-content {
        flex: 1;
        min-width: 0;
    }
    
    .mkma-stat-value {
        font-size: 24px;
        font-weight: 700;
        color: #1A202C;
        margin: 0;
        line-height: 1.2;
    }
    
    .mkma-stat-card h3 {
        font-size: 13px;
        font-weight: 500;
        color: #718096;
        margin: 4px 0 0 0;
    }
    
    /* Credit Bar */
    .mkma-credit-bar-container {
        background: #FFFFFF;
        border: 1px solid #E4E7EB;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 24px;
    }
    
    .mkma-credit-bar {
        height: 12px;
        background: #E4E7EB;
        border-radius: 6px;
        overflow: hidden;
        display: flex;
    }
    
    .mkma-credit-bar-spent {
        background: #FC8181;
        transition: width 0.3s;
    }
    
    .mkma-credit-bar-remaining {
        background: #68D391;
        transition: width 0.3s;
    }
    
    .mkma-credit-bar-labels {
        display: flex;
        gap: 24px;
        margin-top: 12px;
        font-size: 14px;
    }
    
    .mkma-credit-spent {
        color: #E53E3E;
    }
    
    .mkma-credit-remaining {
        color: #38A169;
    }
    
    .mkma-credit-info {
        margin: 12px 0 0 0;
        font-size: 14px;
        color: #718096;
    }
    
    /* Section Title */
    .mkma-section-title {
        margin: 32px 0 16px;
        font-size: 20px;
        font-weight: 600;
        color: #1A202C;
    }
    
    /* Shop Card */
    .mkma-shop-card {
        background: #FFFFFF;
        border: 1px solid #E4E7EB;
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 24px;
    }
    
    .mkma-shop-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
    }
    
    .mkma-shop-logo {
        width: 56px;
        height: 56px;
        background: #F7FAFC;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        flex-shrink: 0;
        overflow: hidden;
    }
    
    .mkma-shop-logo img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .mkma-shop-info h3 {
        font-size: 18px;
        font-weight: 600;
        color: #1A202C;
        margin: 0 0 4px;
    }
    
    .mkma-shop-url {
        font-size: 14px;
        color: #0066FF;
        text-decoration: none;
    }
    
    .mkma-shop-url:hover {
        text-decoration: underline;
    }
    
    .mkma-shop-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 16px;
    }
    
    .mkma-shop-stat {
        padding: 16px;
        background: #F7FAFC;
        border-radius: 8px;
    }
    
    .mkma-shop-stat-label {
        font-size: 13px;
        color: #718096;
        margin-bottom: 4px;
    }
    
    .mkma-shop-stat-value {
        font-size: 24px;
        font-weight: 700;
        color: #1A202C;
    }
    
    /* Quick Settings */
    .mkma-quick-settings {
        margin-top: 32px;
    }
    
    .mkma-quick-settings h3 {
        margin: 0 0 16px;
        font-size: 18px;
        font-weight: 600;
        color: #1A202C;
    }
    
    .mkma-settings-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 16px;
    }
    
    .mkma-settings-link-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        background: #FFFFFF;
        border: 1px solid #E4E7EB;
        border-radius: 12px;
        text-decoration: none;
        transition: all 0.2s;
    }
    
    .mkma-settings-link-card:hover {
        border-color: #0066FF;
        box-shadow: 0 4px 12px rgba(0, 102, 255, 0.1);
    }
    
    .mkma-settings-icon {
        font-size: 28px;
    }
    
    .mkma-settings-content {
        flex: 1;
    }
    
    .mkma-settings-content strong {
        display: block;
        font-size: 16px;
        font-weight: 600;
        color: #1A202C;
        margin-bottom: 4px;
    }
    
    .mkma-settings-content p {
        margin: 0;
        font-size: 14px;
        color: #718096;
    }
    
    .mkma-settings-arrow {
        font-size: 20px;
        color: #CBD5E0;
        transition: all 0.2s;
    }
    
    .mkma-settings-link-card:hover .mkma-settings-arrow {
        color: #0066FF;
        transform: translateX(4px);
    }
    
    /* Quick Actions */
    .mkma-quick-actions {
        margin-top: 32px;
        padding: 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        color: white;
    }
    
    .mkma-quick-actions h3 {
        margin: 0 0 16px;
        font-size: 20px;
        font-weight: 600;
        color: white;
    }
    
    .mkma-actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;
    }
    
    .mkma-action-btn {
        padding: 12px 16px;
        background: rgba(255,255,255,0.2);
        border-radius: 8px;
        color: white;
        text-decoration: none;
        font-weight: 500;
        transition: all 0.2s;
        text-align: center;
    }
    
    .mkma-action-btn:hover {
        background: rgba(255,255,255,0.3);
        transform: translateY(-2px);
    }
    
    /* Responsive */
    @media (max-width: 1200px) {
        .mkma-stats-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
    
    @media (max-width: 768px) {
        .mkma-stats-grid {
            grid-template-columns: 1fr;
        }
        
        .mkma-page-header h1 {
            font-size: 22px;
        }
    }
</style>
