<script>
    import { getContext, onMount } from 'svelte';
    import { browser } from '$app/environment';
    
    const vendorStore = getContext('vendor');
    const shopStore = getContext('shop');
    const API_BASE = getContext('API_BASE');
    
    $: vendor = $vendorStore;
    $: shop = $shopStore;
    
    let loading = true;
    let days = 30;
    let showTrackingCode = false;
    let trackingCode = '';
    
    let analytics = {
        daily_clicks: [],
        daily_conversions: [],
        totals: {
            clicks: 0,
            cost: 0,
            conversions: 0,
            revenue: 0,
            conversion_rate: 0,
            roi: 0
        }
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
            const res = await fetch(`${API_BASE}/vendor/analytics?days=${days}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.data) {
                analytics = data.data;
                trackingCode = data.data.tracking_code || '';
            }
        } catch (e) {
            console.error('Error loading analytics:', e);
        }
        loading = false;
    }
    
    function formatNumber(num, decimals = 0) {
        return (num || 0).toLocaleString('sk-SK', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }
    
    function changeDays(newDays) {
        days = newDays;
        loadData();
    }
    
    function copyTrackingCode() {
        navigator.clipboard.writeText(trackingCode);
        alert('Tracking kód bol skopírovaný!');
    }
    
    $: maxClicks = Math.max(...(analytics.daily_clicks || []).map(d => d.clicks || 0), 1);
    $: maxConversions = Math.max(...(analytics.daily_conversions || []).map(d => d.conversions || 0), 1);
</script>

<div class="analytics-page">
    <div class="page-header">
        <div class="header-left">
            <h1>📊 Analytika & Konverzie</h1>
            <p class="subtitle">Sledujte výkon vašich produktov a konverzie</p>
        </div>
        <div class="header-actions">
            <div class="period-tabs">
                <button class:active={days === 7} on:click={() => changeDays(7)}>7 dní</button>
                <button class:active={days === 30} on:click={() => changeDays(30)}>30 dní</button>
                <button class:active={days === 90} on:click={() => changeDays(90)}>90 dní</button>
            </div>
            <button class="tracking-btn" on:click={() => showTrackingCode = !showTrackingCode}>
                🔗 Tracking kód
            </button>
        </div>
    </div>
    
    {#if loading}
        <div class="loading-state">
            <div class="loader"></div>
            <p>Načítavam analytiku...</p>
        </div>
    {:else}
        <!-- KPI Cards -->
        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-icon blue">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"/></svg>
                </div>
                <div class="kpi-content">
                    <span class="kpi-value">{formatNumber(analytics.totals.clicks)}</span>
                    <span class="kpi-label">Kliky</span>
                </div>
            </div>
            
            <div class="kpi-card">
                <div class="kpi-icon green">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
                </div>
                <div class="kpi-content">
                    <span class="kpi-value">{formatNumber(analytics.totals.conversions)}</span>
                    <span class="kpi-label">Konverzie</span>
                </div>
            </div>
            
            <div class="kpi-card">
                <div class="kpi-icon purple">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                </div>
                <div class="kpi-content">
                    <span class="kpi-value">{formatNumber(analytics.totals.revenue, 2)} €</span>
                    <span class="kpi-label">Tržby</span>
                </div>
            </div>
            
            <div class="kpi-card">
                <div class="kpi-icon orange">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/></svg>
                </div>
                <div class="kpi-content">
                    <span class="kpi-value">{formatNumber(analytics.totals.conversion_rate, 2)}%</span>
                    <span class="kpi-label">Konverzný pomer</span>
                </div>
            </div>
        </div>
        
        <!-- Additional Stats -->
        <div class="stats-row">
            <div class="stat-box">
                <span class="stat-label">Náklady na kliky</span>
                <span class="stat-value cost">{formatNumber(analytics.totals.cost, 2)} €</span>
            </div>
            <div class="stat-box">
                <span class="stat-label">Priemerná cena konverzie</span>
                <span class="stat-value">{analytics.totals.conversions > 0 ? formatNumber(analytics.totals.cost / analytics.totals.conversions, 2) : '0,00'} €</span>
            </div>
            <div class="stat-box">
                <span class="stat-label">ROI</span>
                <span class="stat-value" class:positive={analytics.totals.roi > 0} class:negative={analytics.totals.roi < 0}>
                    {analytics.totals.roi > 0 ? '+' : ''}{formatNumber(analytics.totals.roi, 1)}%
                </span>
            </div>
            <div class="stat-box">
                <span class="stat-label">Priemerná hodnota objednávky</span>
                <span class="stat-value">{analytics.totals.conversions > 0 ? formatNumber(analytics.totals.revenue / analytics.totals.conversions, 2) : '0,00'} €</span>
            </div>
        </div>
        
        <!-- Charts -->
        <div class="charts-grid">
            <div class="card">
                <div class="card-header">
                    <h2>📈 Kliky za obdobie</h2>
                </div>
                <div class="chart-area">
                    {#if (analytics.daily_clicks || []).length === 0}
                        <div class="empty-state">
                            <p>Zatiaľ žiadne dáta</p>
                        </div>
                    {:else}
                        <div class="bar-chart">
                            {#each analytics.daily_clicks as day}
                                <div class="bar-col" title="{day.clicks} klikov">
                                    <div class="bar-track">
                                        <div class="bar-fill blue" style="height: {Math.max(4, (day.clicks / maxClicks) * 100)}%"></div>
                                    </div>
                                    <span class="bar-date">{day.day?.split('-')[2] || ''}</span>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h2>🎯 Konverzie za obdobie</h2>
                </div>
                <div class="chart-area">
                    {#if (analytics.daily_conversions || []).length === 0}
                        <div class="empty-state">
                            <p>Zatiaľ žiadne konverzie</p>
                            <span class="hint">Pridajte tracking kód na váš web</span>
                        </div>
                    {:else}
                        <div class="bar-chart">
                            {#each analytics.daily_conversions as day}
                                <div class="bar-col" title="{day.conversions} konverzií, {formatNumber(day.revenue, 2)} €">
                                    <div class="bar-track">
                                        <div class="bar-fill green" style="height: {Math.max(4, (day.conversions / maxConversions) * 100)}%"></div>
                                    </div>
                                    <span class="bar-date">{day.day?.split('-')[2] || ''}</span>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>
        </div>
        
        <!-- Tracking Code Section -->
        {#if showTrackingCode}
            <div class="card tracking-card">
                <div class="card-header">
                    <h2>🔗 Tracking kód pre váš e-shop</h2>
                    <button class="copy-btn" on:click={copyTrackingCode}>📋 Kopírovať</button>
                </div>
                <div class="card-body">
                    <div class="tracking-info">
                        <div class="info-box">
                            <h4>📌 Ako nainštalovať tracking</h4>
                            <ol>
                                <li>Skopírujte tracking kód nižšie</li>
                                <li>Vložte ho do <code>&lt;head&gt;</code> sekcie vášho webu</li>
                                <li>Na stránke poďakovania (po objednávke) pridajte conversion tracking</li>
                            </ol>
                        </div>
                    </div>
                    
                    <div class="code-block">
                        <pre>{trackingCode}</pre>
                    </div>
                    
                    <div class="tracking-help">
                        <h4>💡 Príklad použitia na Thank You page</h4>
                        <div class="code-block small">
                            <pre>&lt;script&gt;
mp.track('conversion', {'{'}
  order_id: '12345',
  order_value: 99.90,
  products: [{'{'}id: 'SKU123', qty: 1{'}'}]
{'}'});
&lt;/script&gt;</pre>
                        </div>
                    </div>
                </div>
            </div>
        {/if}
        
        <!-- How it works -->
        <div class="card info-card">
            <div class="card-header">
                <h2>❓ Ako funguje tracking konverzií?</h2>
            </div>
            <div class="card-body">
                <div class="steps-grid">
                    <div class="step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <strong>Zákazník klikne</strong>
                            <p>Na váš produkt na MegaPrice.sk</p>
                        </div>
                    </div>
                    <div class="step-arrow">→</div>
                    <div class="step">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <strong>Prejde na váš e-shop</strong>
                            <p>S tracking parametrami</p>
                        </div>
                    </div>
                    <div class="step-arrow">→</div>
                    <div class="step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <strong>Dokončí objednávku</strong>
                            <p>Na vašom e-shope</p>
                        </div>
                    </div>
                    <div class="step-arrow">→</div>
                    <div class="step">
                        <div class="step-number">4</div>
                        <div class="step-content">
                            <strong>Konverzia sa zaznamená</strong>
                            <p>Automaticky cez tracking kód</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
.analytics-page { max-width: 1400px; margin: 0 auto; }

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

.header-actions { display: flex; gap: 12px; align-items: center; }

.period-tabs {
    display: flex;
    background: #f1f5f9;
    border-radius: 10px;
    padding: 4px;
}
.period-tabs button {
    padding: 8px 14px;
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

.tracking-btn {
    padding: 10px 16px;
    background: #10b981;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}
.tracking-btn:hover { background: #059669; }

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
    margin-bottom: 20px;
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
.kpi-icon.green { background: #d1fae5; color: #059669; }
.kpi-icon.purple { background: #ede9fe; color: #7c3aed; }
.kpi-icon.orange { background: #fef3c7; color: #d97706; }

.kpi-value { display: block; font-size: 22px; font-weight: 700; color: #1e293b; }
.kpi-label { font-size: 13px; color: #6b7280; }

/* Stats Row */
.stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 24px;
}
.stat-box {
    background: #f8fafc;
    border-radius: 10px;
    padding: 16px;
    text-align: center;
}
.stat-label { display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px; }
.stat-value { font-size: 18px; font-weight: 700; color: #1e293b; }
.stat-value.cost { color: #ef4444; }
.stat-value.positive { color: #10b981; }
.stat-value.negative { color: #ef4444; }

/* Charts Grid */
.charts-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
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
.card-body { padding: 20px; }

/* Chart */
.chart-area { padding: 20px; min-height: 180px; }
.bar-chart { display: flex; align-items: flex-end; gap: 4px; height: 140px; }
.bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; cursor: pointer; }
.bar-track { flex: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center; }
.bar-fill {
    width: 100%; max-width: 24px;
    border-radius: 4px 4px 0 0;
    min-height: 4px;
    transition: all 0.2s;
}
.bar-fill.blue { background: linear-gradient(180deg, #3b82f6 0%, #60a5fa 100%); }
.bar-fill.green { background: linear-gradient(180deg, #10b981 0%, #34d399 100%); }
.bar-date { font-size: 10px; color: #9ca3af; margin-top: 6px; }

/* Tracking Card */
.tracking-card { margin-bottom: 24px; }
.copy-btn {
    padding: 8px 14px;
    background: #f1f5f9;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}
.copy-btn:hover { background: #e2e8f0; }

.tracking-info { margin-bottom: 20px; }
.info-box {
    background: #eff6ff;
    border-radius: 10px;
    padding: 16px 20px;
}
.info-box h4 { margin: 0 0 12px; font-size: 14px; color: #1e40af; }
.info-box ol { margin: 0; padding-left: 20px; font-size: 13px; color: #1e293b; }
.info-box li { margin-bottom: 6px; }
.info-box code { background: #dbeafe; padding: 2px 6px; border-radius: 4px; font-size: 12px; }

.code-block {
    background: #1e293b;
    border-radius: 10px;
    padding: 16px 20px;
    overflow-x: auto;
}
.code-block pre {
    margin: 0;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 12px;
    color: #e2e8f0;
    white-space: pre-wrap;
    line-height: 1.6;
}
.code-block.small { padding: 12px 16px; }
.code-block.small pre { font-size: 11px; }

.tracking-help { margin-top: 20px; }
.tracking-help h4 { margin: 0 0 12px; font-size: 14px; color: #374151; }

/* Steps */
.steps-grid {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}
.step {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    flex: 1;
}
.step-number {
    width: 32px; height: 32px;
    background: #3b82f6;
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
    flex-shrink: 0;
}
.step-content strong { display: block; font-size: 14px; color: #1e293b; margin-bottom: 2px; }
.step-content p { margin: 0; font-size: 12px; color: #6b7280; }
.step-arrow { font-size: 20px; color: #d1d5db; }

/* Empty State */
.empty-state { text-align: center; padding: 40px 20px; color: #9ca3af; }
.empty-state p { margin: 0; }
.hint { font-size: 12px; color: #9ca3af; display: block; margin-top: 4px; }

/* Responsive */
@media (max-width: 1200px) {
    .kpi-grid, .stats-row { grid-template-columns: repeat(2, 1fr); }
    .charts-grid { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
    .page-header { flex-direction: column; }
    .header-actions { width: 100%; flex-direction: column; }
    .kpi-grid, .stats-row { grid-template-columns: 1fr; }
    .steps-grid { flex-direction: column; }
    .step-arrow { transform: rotate(90deg); }
}
</style>
