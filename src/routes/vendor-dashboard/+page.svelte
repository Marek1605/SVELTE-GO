<script>
    import { getContext, onMount } from 'svelte';
    import { browser } from '$app/environment';
    
    const vendorStore = getContext('vendor');
    const shopStore = getContext('shop');
    const API_BASE = getContext('API_BASE');
    
    $: vendor = $vendorStore;
    $: shop = $shopStore;
    
    let loading = true;
    let recentClicks = [];
    
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
    
    onMount(async () => {
        if (!browser) return;
        
        const token = localStorage.getItem('vendor_token');
        if (!token) return;
        
        try {
            const [statsRes, clicksRes] = await Promise.all([
                fetch(`${API_BASE}/vendor/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE}/vendor/recent-clicks?limit=5`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            
            const statsData = await statsRes.json();
            if (statsData.success && statsData.data) {
                stats = { ...stats, ...statsData.data };
            }
            
            const clicksData = await clicksRes.json();
            if (clicksData.success && clicksData.data) {
                recentClicks = clicksData.data || [];
            }
        } catch (e) {
            console.error('Error loading data:', e);
        }
        loading = false;
    });
    
    function formatNumber(num, decimals = 0) {
        return (num || 0).toLocaleString('sk-SK', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }
    
    function formatTime(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Práve teraz';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} hod`;
        return date.toLocaleDateString('sk-SK', { day: 'numeric', month: 'short' });
    }
</script>

<div class="dashboard">
    <!-- Welcome Header -->
    <div class="welcome-header">
        <div class="welcome-text">
            <h1>Vitajte späť, {vendor?.company_name || 'Predajca'}</h1>
            <p>Prehľad vášho obchodu za posledných 30 dní</p>
        </div>
        {#if shop?.display_mode === 'cpc'}
            <span class="mode-badge cpc">CPC režim</span>
        {:else}
            <span class="mode-badge free">Free režim</span>
        {/if}
    </div>
    
    {#if loading}
        <div class="loading-state">
            <div class="loader"></div>
        </div>
    {:else}
        <!-- Stats Cards -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon blue">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"/></svg>
                </div>
                <div class="stat-content">
                    <span class="stat-value">{formatNumber(stats.clicks)}</span>
                    <span class="stat-label">Preklikov</span>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon pink">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M9 10h6"/></svg>
                </div>
                <div class="stat-content">
                    <span class="stat-value">{formatNumber(stats.spentCredit, 2)} €</span>
                    <span class="stat-label">Minuté</span>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon green">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/></svg>
                </div>
                <div class="stat-content">
                    <span class="stat-value">{formatNumber(avgCpc, 3)} €</span>
                    <span class="stat-label">CPC</span>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon orange">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                </div>
                <div class="stat-content">
                    <span class="stat-value">{formatNumber(stats.totalProducts)}</span>
                    <span class="stat-label">Produktov</span>
                </div>
            </div>
        </div>
        
        <!-- Credit Section -->
        <div class="credit-card">
            <div class="credit-header">
                <div class="credit-info">
                    <span class="credit-label">Dostupný kredit</span>
                    <span class="credit-value">{formatNumber(currentCredit, 2)} €</span>
                </div>
                <a href="/vendor-dashboard/ppc" class="topup-btn">+ Dobiť</a>
            </div>
            <div class="credit-stats">
                <div class="credit-stat">
                    <span class="cs-value">{formatNumber(remainingClicks)}</span>
                    <span class="cs-label">zostávajúcich klikov</span>
                </div>
                <div class="credit-stat">
                    <span class="cs-value">{formatNumber(stats.conversionRate, 1)}%</span>
                    <span class="cs-label">konverzný pomer</span>
                </div>
            </div>
        </div>
        
        <!-- Two Column Layout -->
        <div class="two-columns">
            <!-- Recent Clicks -->
            <div class="card">
                <div class="card-header">
                    <h2>Posledné prekliky</h2>
                    <a href="/vendor-dashboard/statistiky" class="view-all">Zobraziť všetky →</a>
                </div>
                
                <div class="clicks-list">
                    {#if recentClicks.length === 0}
                        <div class="empty-state">
                            <span class="empty-icon">📊</span>
                            <p>Zatiaľ žiadne prekliky</p>
                        </div>
                    {:else}
                        {#each recentClicks as click}
                            <div class="click-item">
                                <div class="click-product">
                                    <div class="product-thumb">
                                        {#if click.product?.image_url}
                                            <img src={click.product.image_url} alt="">
                                        {:else}
                                            <span>📦</span>
                                        {/if}
                                    </div>
                                    <div class="product-info">
                                        <span class="product-title">{click.product?.title || 'Produkt'}</span>
                                        <span class="product-price">{formatNumber(click.product?.price, 2)} €</span>
                                    </div>
                                </div>
                                <div class="click-meta">
                                    <span class="click-time">{formatTime(click.clicked_at)}</span>
                                    {#if click.charged}
                                        <span class="click-cost">-{formatNumber(click.cost, 3)} €</span>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="card">
                <div class="card-header">
                    <h2>Rýchle akcie</h2>
                </div>
                
                <div class="quick-actions">
                    <a href="/vendor-dashboard/produkty" class="action-item">
                        <div class="action-icon">🛍️</div>
                        <div class="action-content">
                            <strong>Produkty</strong>
                            <span>Spravujte ponuky</span>
                        </div>
                        <span class="action-arrow">→</span>
                    </a>
                    
                    <a href="/vendor-dashboard/xml-feedy" class="action-item">
                        <div class="action-icon">📄</div>
                        <div class="action-content">
                            <strong>XML Feedy</strong>
                            <span>Importujte produkty</span>
                        </div>
                        <span class="action-arrow">→</span>
                    </a>
                    
                    <a href="/vendor-dashboard/statistiky" class="action-item">
                        <div class="action-icon">📊</div>
                        <div class="action-content">
                            <strong>Štatistiky</strong>
                            <span>Podrobné reporty</span>
                        </div>
                        <span class="action-arrow">→</span>
                    </a>
                    
                    <a href="/vendor-dashboard/nastavenia-predaja" class="action-item">
                        <div class="action-icon">⚙️</div>
                        <div class="action-content">
                            <strong>Nastavenia</strong>
                            <span>Profil obchodu</span>
                        </div>
                        <span class="action-arrow">→</span>
                    </a>
                </div>
            </div>
        </div>
        
        <!-- Shop Info -->
        {#if shop}
            <div class="shop-card">
                <div class="shop-header">
                    <div class="shop-logo">
                        {#if shop.shop_logo}
                            <img src={shop.shop_logo} alt="">
                        {:else}
                            <span>🏪</span>
                        {/if}
                    </div>
                    <div class="shop-info">
                        <h3>{shop.shop_name}</h3>
                        {#if shop.shop_url}
                            <a href={shop.shop_url} target="_blank" rel="noopener">{shop.shop_url}</a>
                        {/if}
                    </div>
                    <a href="/vendor-dashboard/nastavenia-predaja" class="edit-btn">Upraviť</a>
                </div>
            </div>
        {/if}
    {/if}
</div>

<style>
.dashboard { max-width: 1200px; margin: 0 auto; }

/* Welcome Header */
.welcome-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
}
.welcome-text h1 { font-size: 22px; font-weight: 700; color: #1a1a2e; margin: 0; }
.welcome-text p { font-size: 14px; color: #6b7280; margin: 4px 0 0; }

.mode-badge {
    font-size: 12px;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 20px;
}
.mode-badge.cpc { background: #dbeafe; color: #1d4ed8; }
.mode-badge.free { background: #d1fae5; color: #059669; }

/* Loading */
.loading-state { text-align: center; padding: 60px; }
.loader {
    width: 36px; height: 36px;
    border: 3px solid #e5e7eb;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 20px;
}
.stat-card {
    background: #fff;
    border-radius: 12px;
    padding: 18px;
    display: flex;
    align-items: center;
    gap: 14px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    border: 1px solid #f1f5f9;
}
.stat-icon {
    width: 42px; height: 42px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.stat-icon svg { width: 20px; height: 20px; }
.stat-icon.blue { background: #dbeafe; color: #2563eb; }
.stat-icon.pink { background: #fce7f3; color: #db2777; }
.stat-icon.green { background: #d1fae5; color: #059669; }
.stat-icon.orange { background: #fef3c7; color: #d97706; }

.stat-value { display: block; font-size: 20px; font-weight: 700; color: #1e293b; }
.stat-label { font-size: 12px; color: #6b7280; }

/* Credit Card */
.credit-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 14px;
    padding: 20px 24px;
    color: #fff;
    margin-bottom: 20px;
}
.credit-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}
.credit-label { font-size: 13px; opacity: 0.9; display: block; }
.credit-value { font-size: 28px; font-weight: 700; }
.topup-btn {
    background: rgba(255,255,255,0.2);
    color: #fff;
    padding: 10px 20px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.2s;
}
.topup-btn:hover { background: rgba(255,255,255,0.3); }

.credit-stats { display: flex; gap: 32px; }
.credit-stat { }
.cs-value { font-size: 18px; font-weight: 700; display: block; }
.cs-label { font-size: 12px; opacity: 0.8; }

/* Two Columns */
.two-columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
}

/* Cards */
.card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    border: 1px solid #f1f5f9;
    overflow: hidden;
}
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #f1f5f9;
}
.card-header h2 { font-size: 15px; font-weight: 600; color: #1e293b; margin: 0; }
.view-all {
    font-size: 13px;
    color: #3b82f6;
    text-decoration: none;
    font-weight: 500;
}
.view-all:hover { text-decoration: underline; }

/* Clicks List */
.clicks-list { }
.click-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    border-bottom: 1px solid #f8fafc;
}
.click-item:last-child { border-bottom: none; }
.click-item:hover { background: #fafbfc; }

.click-product { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
.product-thumb {
    width: 40px; height: 40px;
    border-radius: 8px;
    background: #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
}
.product-thumb img { width: 100%; height: 100%; object-fit: cover; }
.product-info { flex: 1; min-width: 0; }
.product-title {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: #1e293b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.product-price { font-size: 12px; color: #6b7280; }

.click-meta { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.click-time { font-size: 12px; color: #9ca3af; }
.click-cost {
    font-size: 11px;
    font-weight: 600;
    color: #ef4444;
    background: #fef2f2;
    padding: 2px 8px;
    border-radius: 10px;
}

/* Quick Actions */
.quick-actions { padding: 8px; }
.action-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 12px;
    border-radius: 10px;
    text-decoration: none;
    transition: all 0.15s;
}
.action-item:hover { background: #f8fafc; }
.action-icon { font-size: 24px; }
.action-content { flex: 1; }
.action-content strong { display: block; font-size: 14px; color: #1e293b; margin-bottom: 2px; }
.action-content span { font-size: 12px; color: #6b7280; }
.action-arrow { font-size: 16px; color: #d1d5db; transition: all 0.15s; }
.action-item:hover .action-arrow { color: #3b82f6; transform: translateX(4px); }

/* Shop Card */
.shop-card {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    border: 1px solid #f1f5f9;
}
.shop-header { display: flex; align-items: center; gap: 16px; }
.shop-logo {
    width: 52px; height: 52px;
    border-radius: 10px;
    background: #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    overflow: hidden;
}
.shop-logo img { width: 100%; height: 100%; object-fit: cover; }
.shop-info { flex: 1; }
.shop-info h3 { font-size: 16px; font-weight: 600; color: #1e293b; margin: 0 0 4px; }
.shop-info a { font-size: 13px; color: #3b82f6; text-decoration: none; }
.shop-info a:hover { text-decoration: underline; }
.edit-btn {
    font-size: 13px;
    color: #6b7280;
    background: #f1f5f9;
    padding: 8px 16px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 500;
}
.edit-btn:hover { background: #e5e7eb; color: #374151; }

/* Empty State */
.empty-state { text-align: center; padding: 32px 16px; color: #9ca3af; }
.empty-icon { font-size: 32px; margin-bottom: 8px; opacity: 0.5; display: block; }

/* Responsive */
@media (max-width: 1024px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .two-columns { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
    .stats-grid { grid-template-columns: 1fr; }
    .welcome-header { flex-direction: column; gap: 12px; }
    .credit-stats { flex-direction: column; gap: 12px; }
}
</style>
