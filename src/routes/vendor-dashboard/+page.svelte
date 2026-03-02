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
    $: displayMode = shop?.display_mode || 'free';
    $: cpcRate = shop?.cpc_rate || 0.05;
    
    onMount(async () => {
        if (!browser) return;
        
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

<div class="mkma-dashboard">
    <!-- Info bar -->
    <div class="mkma-info-bar">
        <span class="material-icons-round">info</span>
        <span>Obchod <strong>{shop?.shop_name || '—'}</strong> — režim <strong>{displayMode === 'cpc' ? 'CPC' : displayMode === 'paid' ? 'PAID' : 'FREE'}</strong> — CPC sadzba <strong>{formatNumber(cpcRate, 3)} €</strong></span>
    </div>

    <!-- Stats Grid -->
    <div class="mkma-stats-grid">
        <div class="mkma-stat-card">
            <div class="mkma-stat-icon clicks">
                <span class="material-icons-round">ads_click</span>
            </div>
            <div class="mkma-stat-body">
                <p class="mkma-stat-value">{formatNumber(stats.clicks)}</p>
                <h3>Preklikov (30 dní)</h3>
            </div>
        </div>
        
        <div class="mkma-stat-card">
            <div class="mkma-stat-icon products">
                <span class="material-icons-round">inventory_2</span>
            </div>
            <div class="mkma-stat-body">
                <p class="mkma-stat-value">{formatNumber(shop?.total_offers || stats.totalProducts)}</p>
                <h3>Produkty</h3>
            </div>
        </div>
        
        <div class="mkma-stat-card">
            <div class="mkma-stat-icon conversions">
                <span class="material-icons-round">verified</span>
            </div>
            <div class="mkma-stat-body">
                <p class="mkma-stat-value">{formatNumber(stats.conversions)}</p>
                <h3>Konverzie</h3>
            </div>
        </div>
        
        <div class="mkma-stat-card">
            <div class="mkma-stat-icon credit">
                <span class="material-icons-round">account_balance_wallet</span>
            </div>
            <div class="mkma-stat-body">
                <p class="mkma-stat-value">{formatNumber(currentCredit, 2)} €</p>
                <h3>Kredit</h3>
            </div>
        </div>
    </div>
    
    <!-- Credit Bar -->
    <div class="mkma-credit-section">
        <div class="mkma-credit-header">
            <span class="mkma-credit-title">Využitie kreditu</span>
        </div>
        <div class="mkma-credit-track">
            <div class="mkma-credit-spent" style="width: {Math.min(100, spentPercent)}%;"></div>
            <div class="mkma-credit-remaining" style="width: {Math.max(0, 100 - spentPercent)}%;"></div>
        </div>
        <div class="mkma-credit-labels">
            <span><span class="mkma-dot red"></span> Minuté: {formatNumber(stats.spentCredit, 2)} €</span>
            <span><span class="mkma-dot green"></span> Zostatok: {formatNumber(currentCredit, 2)} €</span>
        </div>
        <p class="mkma-credit-footnote">Pri priemernom CPC {formatNumber(avgCpc, 3)} € vám zostáva ~{formatNumber(remainingClicks)} klikov</p>
    </div>

    <!-- Settings -->
    <div class="mkma-section-title">Nastavenia</div>
    <div class="mkma-settings-grid">
        <a href="/vendor-dashboard/moj-ucet" class="mkma-settings-card">
            <div class="mkma-settings-card-icon">
                <span class="material-icons-round">person</span>
            </div>
            <div class="mkma-settings-card-text">
                <strong>Môj účet</strong>
                <span>Osobné údaje, heslo a prihlasovanie</span>
            </div>
            <span class="material-icons-round mkma-settings-arrow">chevron_right</span>
        </a>
        <a href="/vendor-dashboard/nastavenia-predaja" class="mkma-settings-card">
            <div class="mkma-settings-card-icon">
                <span class="material-icons-round">tune</span>
            </div>
            <div class="mkma-settings-card-text">
                <strong>Nastavenia predaja</strong>
                <span>Profil obchodu, doprava, XML feed</span>
            </div>
            <span class="material-icons-round mkma-settings-arrow">chevron_right</span>
        </a>
    </div>
    
    <!-- Quick Actions -->
    <div class="mkma-section-title">Rýchle akcie</div>
    <div class="mkma-actions-grid">
        <a href="/vendor-dashboard/ppc" class="mkma-action-btn">
            <span class="material-icons-round">add_card</span>
            Dobiť kredit
        </a>
        <a href="/vendor-dashboard/produkty" class="mkma-action-btn">
            <span class="material-icons-round">inventory_2</span>
            Produkty
        </a>
        <a href="/vendor-dashboard/statistiky" class="mkma-action-btn">
            <span class="material-icons-round">bar_chart</span>
            Štatistiky
        </a>
        <a href="/vendor-dashboard/xml-feedy" class="mkma-action-btn">
            <span class="material-icons-round">rss_feed</span>
            XML Feed
        </a>
    </div>
</div>

<style>
    .mkma-dashboard { width: 100%; }

    /* Info Bar */
    .mkma-info-bar {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 16px;
        background: #fafafe;
        border: 1px solid #e8ebef;
        border-radius: 10px;
        margin-bottom: 20px;
        font-size: 12px;
        color: #64748b;
    }
    .mkma-info-bar .material-icons-round { font-size: 16px; color: #94a3b8; }
    .mkma-info-bar strong { color: #334155; font-weight: 600; }

    /* Stats Grid */
    .mkma-stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 14px;
        margin-bottom: 20px;
    }
    
    .mkma-stat-card {
        background: #fff;
        border: 1px solid #e8ebef;
        border-radius: 14px;
        padding: 18px 20px;
        display: flex;
        align-items: center;
        gap: 14px;
        transition: all 0.15s;
        position: relative;
        overflow: hidden;
    }
    .mkma-stat-card::before {
        content: '';
        position: absolute;
        top: 0; left: 0;
        width: 3px; height: 100%;
        border-radius: 0 3px 3px 0;
        opacity: 0;
        transition: opacity 0.15s;
    }
    .mkma-stat-card:hover::before { opacity: 1; }
    .mkma-stat-card:hover {
        box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        transform: translateY(-1px);
    }
    .mkma-stat-card:nth-child(1)::before { background: #6366f1; }
    .mkma-stat-card:nth-child(2)::before { background: #06b6d4; }
    .mkma-stat-card:nth-child(3)::before { background: #10b981; }
    .mkma-stat-card:nth-child(4)::before { background: #f59e0b; }
    
    .mkma-stat-icon {
        width: 42px; height: 42px;
        border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
    }
    .mkma-stat-icon .material-icons-round { font-size: 22px; }
    .mkma-stat-icon.clicks { background: #eef2ff; color: #6366f1; }
    .mkma-stat-icon.products { background: #ecfeff; color: #06b6d4; }
    .mkma-stat-icon.conversions { background: #ecfdf5; color: #10b981; }
    .mkma-stat-icon.credit { background: #fffbeb; color: #f59e0b; }
    
    .mkma-stat-body { flex: 1; min-width: 0; }
    .mkma-stat-value {
        font-size: 22px; font-weight: 800; color: #0f172a;
        line-height: 1.1; letter-spacing: -0.5px; margin: 0;
    }
    .mkma-stat-card h3 {
        font-size: 12px; font-weight: 500; color: #94a3b8;
        margin: 3px 0 0 0;
    }

    /* Credit Section */
    .mkma-credit-section {
        background: #fff;
        border: 1px solid #e8ebef;
        border-radius: 14px;
        padding: 18px 20px;
        margin-bottom: 20px;
    }
    .mkma-credit-header { margin-bottom: 12px; }
    .mkma-credit-title { font-size: 13px; font-weight: 600; color: #475569; }
    
    .mkma-credit-track {
        height: 8px;
        background: #f1f5f9;
        border-radius: 4px;
        overflow: hidden;
        display: flex;
    }
    .mkma-credit-spent {
        background: #fca5a5;
        transition: width 0.4s ease;
        border-radius: 4px 0 0 4px;
    }
    .mkma-credit-remaining {
        background: #86efac;
        transition: width 0.4s ease;
    }
    
    .mkma-credit-labels {
        display: flex; gap: 20px; margin-top: 10px;
    }
    .mkma-credit-labels span {
        display: flex; align-items: center; gap: 6px;
        font-size: 12px; font-weight: 500; color: #64748b;
    }
    .mkma-dot {
        width: 8px; height: 8px; border-radius: 50%;
        display: inline-block;
    }
    .mkma-dot.red { background: #fca5a5; }
    .mkma-dot.green { background: #86efac; }
    
    .mkma-credit-footnote {
        margin: 8px 0 0 0;
        font-size: 12px; color: #94a3b8;
    }

    /* Section Title */
    .mkma-section-title {
        font-size: 14px; font-weight: 700; color: #0f172a;
        margin-bottom: 12px;
    }

    /* Settings Cards */
    .mkma-settings-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-bottom: 20px;
    }
    
    .mkma-settings-card {
        display: flex; align-items: center; gap: 14px;
        padding: 16px 18px;
        background: #fff;
        border: 1px solid #e8ebef;
        border-radius: 12px;
        text-decoration: none;
        transition: all 0.15s;
    }
    .mkma-settings-card:hover {
        border-color: #c7d2fe;
        background: #fafafe;
        box-shadow: 0 2px 10px rgba(99, 102, 241, 0.06);
    }
    
    .mkma-settings-card-icon {
        width: 38px; height: 38px;
        background: #f8fafc;
        border: 1px solid #e8ebef;
        border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        color: #64748b; flex-shrink: 0;
        transition: all 0.15s;
    }
    .mkma-settings-card:hover .mkma-settings-card-icon {
        background: #eef2ff; color: #6366f1; border-color: #c7d2fe;
    }
    .mkma-settings-card-icon .material-icons-round { font-size: 18px; }
    
    .mkma-settings-card-text { flex: 1; }
    .mkma-settings-card-text strong {
        display: block; font-size: 13px; font-weight: 600; color: #0f172a;
    }
    .mkma-settings-card-text span {
        font-size: 12px; color: #94a3b8;
    }
    
    .mkma-settings-arrow {
        color: #cbd5e1; font-size: 18px !important;
        transition: all 0.15s;
    }
    .mkma-settings-card:hover .mkma-settings-arrow {
        color: #6366f1; transform: translateX(2px);
    }

    /* Quick Actions */
    .mkma-actions-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
    }
    
    .mkma-action-btn {
        display: flex; align-items: center; justify-content: center;
        gap: 8px;
        padding: 13px 14px;
        background: #fff;
        border: 1px solid #e8ebef;
        border-radius: 10px;
        text-decoration: none;
        color: #334155;
        font-weight: 600; font-size: 12px;
        transition: all 0.15s;
    }
    .mkma-action-btn .material-icons-round {
        font-size: 17px; color: #94a3b8;
        transition: color 0.15s;
    }
    .mkma-action-btn:hover {
        border-color: #cbd5e1;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        transform: translateY(-1px);
    }
    .mkma-action-btn:hover .material-icons-round { color: #6366f1; }

    /* Responsive */
    @media (max-width: 1200px) {
        .mkma-stats-grid { grid-template-columns: repeat(2, 1fr); }
        .mkma-actions-grid { grid-template-columns: repeat(2, 1fr); }
    }
    
    @media (max-width: 768px) {
        .mkma-stats-grid { grid-template-columns: 1fr; }
        .mkma-settings-grid { grid-template-columns: 1fr; }
        .mkma-actions-grid { grid-template-columns: repeat(2, 1fr); }
    }
</style>
