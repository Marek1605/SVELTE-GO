<script>
    import { getContext, onMount } from 'svelte';
    import { browser } from '$app/environment';
    
    const vendorStore = getContext('vendor');
    const shopStore = getContext('shop');
    const API_BASE = getContext('API_BASE');
    
    $: vendor = $vendorStore;
    $: shop = $shopStore;
    
    let loading = true;
    let period = '30days';
    let clicksByDay = [];
    let topProducts = [];
    
    // Overview stats
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
            // Load overview stats
            const statsRes = await fetch(`${API_BASE}/vendor/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const statsData = await statsRes.json();
            if (statsData.success && statsData.data) {
                stats = { ...stats, ...statsData.data };
            }
            
            // Load detailed stats
            const detailRes = await fetch(`${API_BASE}/vendor/statistics?period=${period}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const detailData = await detailRes.json();
            if (detailData.success && detailData.data) {
                clicksByDay = detailData.data.clicks_by_day || [];
                topProducts = detailData.data.top_products || [];
            }
        } catch (e) {
            console.error('Error loading stats:', e);
        }
        loading = false;
    }
    
    function formatNumber(num, decimals = 0) {
        return (num || 0).toLocaleString('sk-SK', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }
    
    function changePeriod(newPeriod) {
        period = newPeriod;
        loadData();
    }
    
    // Calculate chart data
    $: maxClicks = Math.max(...clicksByDay.map(d => d.clicks || 0), 1);
</script>

<div class="stats-container">
    <!-- Overview Cards -->
    <div class="mkma-stats-grid">
        <div class="mkma-stat-card">
            <div class="mkma-stat-icon clicks"><span>👆</span></div>
            <div class="mkma-stat-body">
                <p class="mkma-stat-value">{formatNumber(stats.totalClicks)}</p>
                <h3>Celkom preklikov</h3>
            </div>
        </div>
        <div class="mkma-stat-card">
            <div class="mkma-stat-icon cost"><span>💸</span></div>
            <div class="mkma-stat-body">
                <p class="mkma-stat-value">{formatNumber(stats.totalCost, 2)} €</p>
                <h3>Minutý kredit</h3>
            </div>
        </div>
        <div class="mkma-stat-card">
            <div class="mkma-stat-icon cpc"><span>📊</span></div>
            <div class="mkma-stat-body">
                <p class="mkma-stat-value">{formatNumber(stats.avgCpc, 3)} €</p>
                <h3>Priemerný CPC</h3>
            </div>
        </div>
        <div class="mkma-stat-card">
            <div class="mkma-stat-icon conv"><span>🎯</span></div>
            <div class="mkma-stat-body">
                <p class="mkma-stat-value">{formatNumber(stats.conversionRate, 1)}%</p>
                <h3>Konverzia</h3>
            </div>
        </div>
    </div>
    
    <div class="stats-header">
        <div class="period-selector">
            <button class:active={period === '7days'} on:click={() => changePeriod('7days')}>7 dní</button>
            <button class:active={period === '30days'} on:click={() => changePeriod('30days')}>30 dní</button>
            <button class:active={period === '90days'} on:click={() => changePeriod('90days')}>90 dní</button>
            <button class:active={period === 'year'} on:click={() => changePeriod('year')}>Rok</button>
        </div>
    </div>
    
    {#if loading}
        <div class="loading">
            <div class="spinner"></div>
            <p>Načítavam štatistiky...</p>
        </div>
    {:else}
        
        <!-- Clicks Chart -->
        <div class="chart-section">
            <h2>Prekliky za obdobie</h2>
            <div class="chart-container">
                {#if clicksByDay.length === 0}
                    <div class="no-data">
                        <span class="no-data-icon">📊</span>
                        <p>Zatiaľ žiadne dáta</p>
                    </div>
                {:else}
                    <div class="bar-chart">
                        {#each clicksByDay as day}
                            <div class="bar-item">
                                <div class="bar-wrapper">
                                    <div 
                                        class="bar" 
                                        style="height: {(day.clicks / maxClicks) * 100}%"
                                        title="{day.day}: {day.clicks} klikov, {formatNumber(day.cost, 2)} €"
                                    ></div>
                                </div>
                                <span class="bar-label">{day.day?.split('-')[2] || ''}</span>
                            </div>
                        {/each}
                    </div>
                    <div class="chart-legend">
                        <span>Celkom: {formatNumber(clicksByDay.reduce((a, b) => a + (b.clicks || 0), 0))} klikov</span>
                        <span>Náklady: {formatNumber(clicksByDay.reduce((a, b) => a + (b.cost || 0), 0), 2)} €</span>
                    </div>
                {/if}
            </div>
        </div>
        
        <!-- Top Products -->
        <div class="table-section">
            <h2>Top produkty podľa klikov</h2>
            {#if topProducts.length === 0}
                <div class="no-data">
                    <span class="no-data-icon">🛍️</span>
                    <p>Zatiaľ žiadne produkty</p>
                </div>
            {:else}
                <div class="products-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Produkt</th>
                                <th>Kliky</th>
                                <th>Náklady</th>
                                <th>CPC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each topProducts as product}
                                <tr>
                                    <td class="product-cell">
                                        {#if product.image_url}
                                            <img src={product.image_url} alt="" class="product-thumb">
                                        {/if}
                                        <span class="product-title">{product.title}</span>
                                    </td>
                                    <td>{formatNumber(product.clicks)}</td>
                                    <td>{formatNumber(product.cost, 2)} €</td>
                                    <td>{product.clicks > 0 ? formatNumber(product.cost / product.clicks, 3) : '0,000'} €</td>
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
.stats-container {
    max-width: 1200px;
    margin: 0 auto;
}

.stats-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
}

.stats-header h1 {
    font-size: 28px;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
}

.period-selector {
    display: flex;
    gap: 8px;
    background: #f1f5f9;
    padding: 4px;
    border-radius: 10px;
}

.period-selector button {
    padding: 8px 16px;
    border: none;
    background: transparent;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
}

.period-selector button:hover {
    color: #1f2937;
}

.period-selector button.active {
    background: white;
    color: #3b82f6;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.loading {
    text-align: center;
    padding: 60px;
    color: #6b7280;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e5e7eb;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Stats Grid */
.mkma-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
.mkma-stat-card { background: #fff; border: 1px solid #e8ebef; border-radius: 10px; padding: 12px 14px; display: flex; align-items: center; gap: 12px; transition: all 0.15s; position: relative; overflow: hidden; }
.mkma-stat-card::before { content: ''; position: absolute; top: 0; left: 0; width: 3px; height: 100%; border-radius: 0 3px 3px 0; opacity: 0; transition: opacity 0.15s; }
.mkma-stat-card:hover::before { opacity: 1; }
.mkma-stat-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); transform: translateY(-1px); }
.mkma-stat-card:nth-child(1)::before { background: #6366f1; }
.mkma-stat-card:nth-child(2)::before { background: #06b6d4; }
.mkma-stat-card:nth-child(3)::before { background: #10b981; }
.mkma-stat-card:nth-child(4)::before { background: #f59e0b; }
.mkma-stat-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 18px; }
.mkma-stat-icon.clicks { background: #eef2ff; }
.mkma-stat-icon.cost { background: #ecfeff; }
.mkma-stat-icon.cpc { background: #ecfdf5; }
.mkma-stat-icon.conv { background: #fffbeb; }
.mkma-stat-body { flex: 1; min-width: 0; }
.mkma-stat-value { font-size: 18px; font-weight: 800; color: #0f172a; line-height: 1.1; margin: 0; }
.mkma-stat-card h3 { font-size: 11px; font-weight: 500; color: #94a3b8; margin: 2px 0 0 0; }

/* Chart Section */
.chart-section, .table-section {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.chart-section h2, .table-section h2 {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 20px 0;
}

.chart-container {
    min-height: 200px;
}

.no-data {
    text-align: center;
    padding: 40px;
    color: #9ca3af;
}

.no-data-icon {
    font-size: 48px;
    display: block;
    margin-bottom: 12px;
    opacity: 0.5;
}

/* Bar Chart */
.bar-chart {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    height: 200px;
    padding: 0 10px;
}

.bar-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 0;
}

.bar-wrapper {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
}

.bar {
    width: 100%;
    max-width: 30px;
    background: linear-gradient(180deg, #3b82f6, #60a5fa);
    border-radius: 4px 4px 0 0;
    min-height: 4px;
    transition: height 0.3s;
}

.bar:hover {
    background: linear-gradient(180deg, #2563eb, #3b82f6);
}

.bar-label {
    font-size: 10px;
    color: #9ca3af;
    margin-top: 4px;
}

.chart-legend {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-top: 16px;
    font-size: 13px;
    color: #6b7280;
}

/* Table */
.products-table {
    overflow-x: auto;
}

.products-table table {
    width: 100%;
    border-collapse: collapse;
}

.products-table th,
.products-table td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
}

.products-table th {
    font-weight: 600;
    color: #374151;
    background: #f8fafc;
}

.product-cell {
    display: flex;
    align-items: center;
    gap: 12px;
}

.product-thumb {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 6px;
    background: #f1f5f9;
}

.product-title {
    font-weight: 500;
    color: #1f2937;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

@media (max-width: 768px) {
    .mkma-stats-grid { grid-template-columns: repeat(2, 1fr); }
    .stats-header {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .period-selector {
        width: 100%;
        justify-content: space-between;
    }
    
    .bar-chart {
        overflow-x: auto;
        padding-bottom: 10px;
    }
}
</style>
