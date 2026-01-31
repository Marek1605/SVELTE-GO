<script>
    import { getContext, onMount } from 'svelte';
    import { browser } from '$app/environment';
    
    const vendorStore = getContext('vendor');
    const shopStore = getContext('shop');
    const API_BASE = getContext('API_BASE');
    
    $: vendor = $vendorStore;
    $: shop = $shopStore;
    
    let loading = true;
    let stats = {
        total_products: 0,
        total_views: 0,
        total_clicks: 0,
        total_conversions: 0,
        credit_balance: 0
    };
    let recentClicks = [];
    
    onMount(async () => {
        if (!browser) return;
        await loadDashboardData();
        loading = false;
    });
    
    async function loadDashboardData() {
        const token = localStorage.getItem('vendor_token');
        if (!token) return;
        
        try {
            const res = await fetch(`${API_BASE}/vendor/dashboard`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                stats = { ...stats, ...data.data };
                recentClicks = data.data.recent_clicks || [];
            }
        } catch (e) {
            console.log('Dashboard endpoint not available');
        }
    }
    
    function formatNumber(num) {
        return (num || 0).toLocaleString('sk-SK');
    }
</script>

<div class="dash-page">
    <div class="dash-header">
        <h1>👋 Vitajte späť, {vendor?.company_name || 'Predajca'}!</h1>
        <p>Prehľad vášho obchodu <strong>{shop?.shop_name}</strong></p>
    </div>
    
    <div class="dash-stats">
        <div class="dash-stat">
            <div class="dash-stat-icon">📦</div>
            <div class="dash-stat-content">
                <span class="dash-stat-label">Produkty</span>
                <span class="dash-stat-value">{formatNumber(stats.total_products)}</span>
            </div>
        </div>
        <div class="dash-stat">
            <div class="dash-stat-icon">👁️</div>
            <div class="dash-stat-content">
                <span class="dash-stat-label">Zobrazenia</span>
                <span class="dash-stat-value">{formatNumber(stats.total_views)}</span>
            </div>
        </div>
        <div class="dash-stat">
            <div class="dash-stat-icon">👆</div>
            <div class="dash-stat-content">
                <span class="dash-stat-label">Kliky</span>
                <span class="dash-stat-value">{formatNumber(stats.total_clicks)}</span>
            </div>
        </div>
        <div class="dash-stat dash-stat-success">
            <div class="dash-stat-icon">✅</div>
            <div class="dash-stat-content">
                <span class="dash-stat-label">Konverzie</span>
                <span class="dash-stat-value">{formatNumber(stats.total_conversions)}</span>
            </div>
        </div>
    </div>
    
    <div class="dash-grid">
        <div class="dash-card">
            <h3>🚀 Rýchle akcie</h3>
            <div class="dash-actions">
                <a href="/vendor-dashboard/produkty" class="dash-action">📦 Spravovať produkty</a>
                <a href="/vendor-dashboard/ppc" class="dash-action">💰 Dobiť kredit</a>
                <a href="/vendor-dashboard/konverzie" class="dash-action">✅ Nastaviť konverzie</a>
                <a href="/vendor-dashboard/statistiky" class="dash-action">📈 Zobraziť štatistiky</a>
            </div>
        </div>
        
        <div class="dash-card">
            <h3>👆 Posledné kliky</h3>
            {#if recentClicks.length > 0}
                <div class="dash-clicks">
                    {#each recentClicks.slice(0, 5) as click}
                        <div class="dash-click">
                            <span class="dash-click-product">{click.product_name}</span>
                            <span class="dash-click-time">{click.clicked_at}</span>
                        </div>
                    {/each}
                </div>
            {:else}
                <p class="dash-empty">Zatiaľ žiadne kliky</p>
            {/if}
        </div>
    </div>
</div>

<style>
    .dash-page { max-width: 1200px; margin: 0 auto; }
    .dash-header { margin-bottom: 24px; }
    .dash-header h1 { font-size: 28px; font-weight: 700; color: #1f2937; margin: 0 0 8px; }
    .dash-header p { color: #6b7280; margin: 0; }
    
    .dash-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .dash-stat { background: white; border-radius: 12px; padding: 20px; display: flex; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .dash-stat-success { border-left: 4px solid #10b981; }
    .dash-stat-icon { font-size: 28px; }
    .dash-stat-content { display: flex; flex-direction: column; }
    .dash-stat-label { font-size: 13px; color: #6b7280; }
    .dash-stat-value { font-size: 26px; font-weight: 700; color: #1f2937; }
    
    .dash-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
    .dash-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .dash-card h3 { font-size: 16px; font-weight: 600; margin: 0 0 16px; }
    
    .dash-actions { display: flex; flex-direction: column; gap: 8px; }
    .dash-action { display: block; padding: 12px 16px; background: #f9fafb; border-radius: 8px; color: #374151; text-decoration: none; transition: all 0.2s; }
    .dash-action:hover { background: #f0f9ff; color: #0079bf; }
    
    .dash-clicks { display: flex; flex-direction: column; gap: 8px; }
    .dash-click { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .dash-click:last-child { border-bottom: none; }
    .dash-click-product { font-size: 14px; color: #1f2937; }
    .dash-click-time { font-size: 12px; color: #9ca3af; }
    .dash-empty { color: #9ca3af; font-size: 14px; }
</style>
