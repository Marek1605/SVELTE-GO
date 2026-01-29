<script>
    import { getContext, onMount } from 'svelte';
    import { browser } from '$app/environment';
    
    const vendorStore = getContext('vendor');
    const shopStore = getContext('shop');
    const API_BASE = getContext('API_BASE');
    
    $: vendor = $vendorStore;
    $: shop = $shopStore;
    
    let loading = true;
    let period = '7days';
    let clicksByDay = [];
    let topProducts = [];
    let recentClicks = [];
    
    let stats = {
        totalClicks: 0,
        totalCost: 0,
        avgCpc: 0.05,
        conversions: 0,
        conversionRate: 0
    };
    
    onMount(async () => {
        if (!browser) return;
        await loadData();
    });
    
    async function loadData() {
        loading = true;
        const token = localStorage.getItem('vendor_token');
        if (!token) return;
        
        try {
            const [statsRes, detailRes, clicksRes] = await Promise.all([
                fetch(`${API_BASE}/vendor/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE}/vendor/statistics?period=${period}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE}/vendor/recent-clicks?limit=15`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            
            const statsData = await statsRes.json();
            if (statsData.success && statsData.data) {
                stats = { ...stats, ...statsData.data };
            }
            
            const detailData = await detailRes.json();
            if (detailData.success && detailData.data) {
                clicksByDay = detailData.data.clicks_by_day || [];
                topProducts = detailData.data.top_products || [];
            }
            
            const clicksData = await clicksRes.json();
            if (clicksData.success && clicksData.data) {
                recentClicks = clicksData.data || [];
            }
        } catch (e) {
            console.error('Error loading stats:', e);
        }
        loading = false;
    }
    
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
    
    function changePeriod(newPeriod) {
        period = newPeriod;
        loadData();
    }
    
    $: maxClicks = Math.max(...clicksByDay.map(d => d.clicks || 0), 1);
    $: totalChartClicks = clicksByDay.reduce((a, b) => a + (b.clicks || 0), 0);
    $: totalChartCost = clicksByDay.reduce((a, b) => a + (b.cost || 0), 0);
</script>

<div class="stats-page">
    <div class="page-header">
        <div class="header-left">
            <h1>Štatistiky</h1>
            <p class="subtitle">Prehľad výkonnosti vašich produktov</p>
        </div>
        <div class="period-tabs">
            <button class:active={period === '7days'} on:click={() => changePeriod('7days')}>7 dní</button>
            <button class:active={period === '30days'} on:click={() => changePeriod('30days')}>30 dní</button>
            <button class:active={period === '90days'} on:click={() => changePeriod('90days')}>90 dní</button>
            <button class:active={period === 'year'} on:click={() => changePeriod('year')}>Rok</button>
        </div>
    </div>
    
    {#if loading}
        <div class="loading-state">
            <div class="loader"></div>
            <p>Načítavam štatistiky...</p>
        </div>
    {:else}
        <!-- KPI Cards -->
        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-icon blue">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"/></svg>
                </div>
                <div class="kpi-content">
                    <span class="kpi-value">{formatNumber(stats.totalClicks)}</span>
                    <span class="kpi-label">Celkom preklikov</span>
                </div>
            </div>
            
            <div class="kpi-card">
                <div class="kpi-icon pink">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M9 10h6M9 14h4"/></svg>
                </div>
                <div class="kpi-content">
                    <span class="kpi-value">{formatNumber(stats.totalCost, 2)} €</span>
                    <span class="kpi-label">Minutý kredit</span>
                </div>
            </div>
            
            <div class="kpi-card">
                <div class="kpi-icon green">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/></svg>
                </div>
                <div class="kpi-content">
                    <span class="kpi-value">{formatNumber(stats.avgCpc, 3)} €</span>
                    <span class="kpi-label">Priemerný CPC</span>
                </div>
            </div>
            
            <div class="kpi-card">
                <div class="kpi-icon orange">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>
                </div>
                <div class="kpi-content">
                    <span class="kpi-value">{formatNumber(stats.conversionRate, 1)}%</span>
                    <span class="kpi-label">Konverzia</span>
                </div>
            </div>
        </div>
        
        <!-- Main Content Grid -->
        <div class="content-grid">
            <!-- Chart -->
            <div class="card chart-card">
                <div class="card-header">
                    <h2>Prekliky za obdobie</h2>
                    <div class="chart-summary">
                        <span><strong>{formatNumber(totalChartClicks)}</strong> klikov</span>
                        <span class="divider">•</span>
                        <span><strong>{formatNumber(totalChartCost, 2)} €</strong> náklady</span>
                    </div>
                </div>
                
                <div class="chart-area">
                    {#if clicksByDay.length === 0}
                        <div class="empty-state">
                            <span class="empty-icon">📊</span>
                            <p>Zatiaľ žiadne dáta</p>
                        </div>
                    {:else}
                        <div class="bar-chart">
                            {#each clicksByDay as day}
                                <div class="bar-col" title="{day.clicks} klikov, {formatNumber(day.cost, 2)} €">
                                    <div class="bar-track">
                                        <div class="bar-fill" style="height: {Math.max(4, (day.clicks / maxClicks) * 100)}%"></div>
                                    </div>
                                    <span class="bar-date">{day.day?.split('-')[2] || ''}</span>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>
            
            <!-- Recent Clicks -->
            <div class="card recent-card">
                <div class="card-header">
                    <h2>Posledné prekliky</h2>
                    <span class="badge">{recentClicks.length}</span>
                </div>
                
                <div class="recent-list">
                    {#if recentClicks.length === 0}
                        <div class="empty-state small">
                            <p>Zatiaľ žiadne prekliky</p>
                        </div>
                    {:else}
                        {#each recentClicks as click}
                            <div class="recent-item">
                                <div class="product-thumb">
                                    {#if click.product?.image_url}
                                        <img src={click.product.image_url} alt="">
                                    {:else}
                                        <span>📦</span>
                                    {/if}
                                </div>
                                <div class="product-info">
                                    <span class="product-title">{click.product?.title || 'Neznámy'}</span>
                                    <span class="product-price">{formatNumber(click.product?.price, 2)} €</span>
                                </div>
                                <div class="click-meta">
                                    <span class="click-time">{formatTime(click.clicked_at)}</span>
                                    <span class="click-device">{click.device === 'mobile' ? '📱' : '💻'}</span>
                                    {#if click.charged}
                                        <span class="click-cost">-{formatNumber(click.cost, 3)} €</span>
                                    {:else}
                                        <span class="click-free">Free</span>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
        </div>
        
        <!-- Top Products Table -->
        <div class="card table-card">
            <div class="card-header">
                <h2>Top produkty podľa klikov</h2>
            </div>
            
            {#if topProducts.length === 0}
                <div class="empty-state">
                    <span class="empty-icon">🛍️</span>
                    <p>Zatiaľ žiadne produkty</p>
                </div>
            {:else}
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Produkt</th>
                                <th>Kliky</th>
                                <th>Náklady</th>
                                <th>CPC</th>
                                <th>Podiel</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each topProducts as product, i}
                                {@const totalClicks = topProducts.reduce((a,b) => a + (b.clicks || 0), 0)}
                                {@const percent = totalClicks > 0 ? (product.clicks / totalClicks) * 100 : 0}
                                <tr>
                                    <td>
                                        <div class="product-cell">
                                            <span class="rank" class:gold={i === 0} class:silver={i === 1} class:bronze={i === 2}>{i + 1}</span>
                                            <div class="product-thumb small">
                                                {#if product.image_url}
                                                    <img src={product.image_url} alt="">
                                                {:else}
                                                    <span>📦</span>
                                                {/if}
                                            </div>
                                            <span class="product-name">{product.title}</span>
                                        </div>
                                    </td>
                                    <td><strong class="clicks-value">{formatNumber(product.clicks)}</strong></td>
                                    <td>{formatNumber(product.cost, 2)} €</td>
                                    <td>{product.clicks > 0 ? formatNumber(product.cost / product.clicks, 3) : '0,000'} €</td>
                                    <td>
                                        <div class="progress-cell">
                                            <div class="progress-bar">
                                                <div class="progress-fill" style="width: {percent}%"></div>
                                            </div>
                                            <span>{formatNumber(percent, 1)}%</span>
                                        </div>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
.stats-page { max-width: 1400px; margin: 0 auto; }

/* Header */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
}
.page-header h1 { font-size: 24px; font-weight: 700; color: #1a1a2e; margin: 0; }
.subtitle { font-size: 14px; color: #6b7280; margin: 4px 0 0; }

.period-tabs {
    display: flex;
    background: #f1f5f9;
    border-radius: 10px;
    padding: 4px;
}
.period-tabs button {
    padding: 10px 16px;
    border: none;
    background: transparent;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
}
.period-tabs button:hover { color: #1e293b; }
.period-tabs button.active {
    background: #fff;
    color: #3b82f6;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

/* Loading */
.loading-state { text-align: center; padding: 80px 20px; color: #6b7280; }
.loader {
    width: 40px; height: 40px;
    border: 3px solid #e5e7eb;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* KPI Cards */
.kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
}
.kpi-card {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 14px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    border: 1px solid #f1f5f9;
    transition: all 0.2s;
}
.kpi-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    transform: translateY(-2px);
}
.kpi-icon {
    width: 44px; height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.kpi-icon svg { width: 22px; height: 22px; }
.kpi-icon.blue { background: #dbeafe; color: #2563eb; }
.kpi-icon.pink { background: #fce7f3; color: #db2777; }
.kpi-icon.green { background: #d1fae5; color: #059669; }
.kpi-icon.orange { background: #fef3c7; color: #d97706; }

.kpi-value { display: block; font-size: 22px; font-weight: 700; color: #1e293b; }
.kpi-label { font-size: 13px; color: #6b7280; }

/* Content Grid */
.content-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 20px;
    margin-bottom: 24px;
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

.chart-summary { display: flex; gap: 12px; font-size: 13px; color: #6b7280; }
.divider { color: #d1d5db; }

.badge {
    font-size: 12px;
    font-weight: 600;
    background: #eff6ff;
    color: #3b82f6;
    padding: 4px 10px;
    border-radius: 12px;
}

/* Chart */
.chart-area { padding: 20px; min-height: 200px; }
.bar-chart { display: flex; align-items: flex-end; gap: 4px; height: 160px; }
.bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; cursor: pointer; }
.bar-track { flex: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center; }
.bar-fill {
    width: 100%; max-width: 28px;
    background: linear-gradient(180deg, #3b82f6 0%, #60a5fa 100%);
    border-radius: 4px 4px 0 0;
    min-height: 4px;
    transition: all 0.2s;
}
.bar-col:hover .bar-fill { background: linear-gradient(180deg, #2563eb 0%, #3b82f6 100%); }
.bar-date { font-size: 10px; color: #9ca3af; margin-top: 6px; }

/* Recent Clicks */
.recent-list { max-height: 360px; overflow-y: auto; }
.recent-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid #f8fafc;
    transition: background 0.15s;
}
.recent-item:hover { background: #fafbfc; }
.recent-item:last-child { border-bottom: none; }

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
.product-thumb.small { width: 36px; height: 36px; }

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

.click-meta { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.click-time { font-size: 12px; color: #9ca3af; }
.click-device { font-size: 14px; }
.click-cost {
    font-size: 11px;
    font-weight: 600;
    color: #ef4444;
    background: #fef2f2;
    padding: 2px 8px;
    border-radius: 10px;
}
.click-free {
    font-size: 11px;
    font-weight: 600;
    color: #10b981;
    background: #d1fae5;
    padding: 2px 8px;
    border-radius: 10px;
}

/* Table */
.table-wrapper { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 14px 16px; text-align: left; }
th {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: #f8fafc;
    border-bottom: 1px solid #e5e7eb;
}
td { border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #374151; }
tr:hover td { background: #fafbfc; }

.product-cell { display: flex; align-items: center; gap: 12px; }
.rank {
    width: 24px; height: 24px;
    border-radius: 6px;
    background: #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: #6b7280;
}
.rank.gold { background: #fef3c7; color: #d97706; }
.rank.silver { background: #f1f5f9; color: #475569; }
.rank.bronze { background: #ffedd5; color: #c2410c; }

.product-name {
    font-weight: 500;
    color: #1e293b;
    max-width: 280px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.clicks-value { color: #3b82f6; }

.progress-cell { display: flex; align-items: center; gap: 8px; }
.progress-bar {
    width: 80px; height: 6px;
    background: #e5e7eb;
    border-radius: 3px;
    overflow: hidden;
}
.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #60a5fa);
    border-radius: 3px;
}

/* Empty State */
.empty-state { text-align: center; padding: 40px 20px; color: #9ca3af; }
.empty-state.small { padding: 24px 16px; }
.empty-icon { font-size: 40px; margin-bottom: 8px; opacity: 0.6; display: block; }

/* Responsive */
@media (max-width: 1200px) {
    .kpi-grid { grid-template-columns: repeat(2, 1fr); }
    .content-grid { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
    .page-header { flex-direction: column; align-items: stretch; }
    .kpi-grid { grid-template-columns: 1fr; }
}
</style>
