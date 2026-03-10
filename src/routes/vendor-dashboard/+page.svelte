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
    
    let modeInfoOpen = false;
    let modeLoading = false;
    let modeMessage = null;
    
    async function toggleMode(mode) {
        modeLoading = true;
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(`${API_BASE}/vendor/display-mode`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ display_mode: mode })
            });
            const data = await res.json();
            if (data.success) {
                shopStore.update(s => ({ ...s, display_mode: mode }));
                modeMessage = { type: 'success', text: `Režim zmenený na ${mode === 'free' ? 'Zadarmo' : 'Platený PPC'}` };
            } else {
                modeMessage = { type: 'error', text: data.error || 'Chyba pri zmene režimu' };
            }
        } catch (e) {
            modeMessage = { type: 'error', text: 'Chyba pri komunikácii so serverom' };
        }
        modeLoading = false;
        setTimeout(() => modeMessage = null, 4000);
    }
    
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
    
    function sklonuj(n, one, few, many) {
        if (n === 1) return one;
        if (n >= 2 && n <= 4) return few;
        return many;
    }
    
    function formatNumber(num, decimals = 0) {
        return (num || 0).toLocaleString('sk-SK', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }
</script>

<div class="mkma-dashboard">
    <!-- Stats Grid -->
    <div class="mkma-stats-grid">
        <div class="mkma-stat-card">
            <div class="mkma-stat-icon clicks">
                <span class="material-icons-round">ads_click</span>
            </div>
            <div class="mkma-stat-body">
                <p class="mkma-stat-value">{formatNumber(stats.clicks)}</p>
                <h3>{sklonuj(stats.clicks, "Preklik (30 dní)", "Prekliky (30 dní)", "Preklikov (30 dní)")}</h3>
            </div>
        </div>
        
        <div class="mkma-stat-card">
            <div class="mkma-stat-icon products">
                <span class="material-icons-round">inventory_2</span>
            </div>
            <div class="mkma-stat-body">
                <p class="mkma-stat-value">{formatNumber(shop?.total_offers || stats.totalProducts)}</p>
                <h3>{sklonuj(shop?.total_offers || stats.totalProducts, "Produkt", "Produkty", "Produktov")}</h3>
            </div>
        </div>
        
        <div class="mkma-stat-card">
            <div class="mkma-stat-icon conversions">
                <span class="material-icons-round">verified</span>
            </div>
            <div class="mkma-stat-body">
                <p class="mkma-stat-value">{formatNumber(stats.conversions)}</p>
                <h3>{sklonuj(stats.conversions, "Konverzia", "Konverzie", "Konverzií")}</h3>
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

    <!-- Režim zobrazovania -->
    <div class="mkma-mode-section">
        <div class="mkma-mode-header">
            <span class="mkma-section-title" style="margin-bottom:0">Režim zobrazovania</span>
            <button class="mkma-info-icon" on:click={() => modeInfoOpen = !modeInfoOpen} title="Čo je to?">
                <span class="material-icons-round">info_outline</span>
            </button>
        </div>
        
        {#if modeInfoOpen}
        <div class="mkma-mode-tooltip">
            <p><strong>Zadarmo (FREE)</strong> — Vaše ponuky sa zobrazujú iba vo fulltextovom vyhľadávaní, nezaradené v kategóriách. Prekliky sa neúčtujú.</p>
            <p><strong>Platený (PPC)</strong> — Vaše ponuky sa zobrazujú aj v kategóriách a na popredných pozíciách. Za každý preklik sa účtuje poplatok podľa <a href="/vendor-dashboard/ppc">cenníka preklikov</a>.</p>
        </div>
        {/if}

        {#if modeMessage}
        <div class="mkma-mode-msg {modeMessage.type}">{modeMessage.text}</div>
        {/if}
        
        <div class="mkma-mode-cards">
            <div class="mkma-mode-card" class:active={displayMode === 'free'}>
                <div class="mkma-mode-card-top">
                    <span class="mkma-mode-card-icon">🆓</span>
                    <strong>Zadarmo</strong>
                </div>
                <p>Zobrazenie vo vyhľadávaní, bez poplatkov</p>
                <button class="mkma-mode-card-btn" class:active={displayMode === 'free'}
                    on:click={() => toggleMode('free')} disabled={modeLoading || displayMode === 'free'}>
                    {displayMode === 'free' ? '✓ Aktívny' : 'Aktivovať'}
                </button>
            </div>
            <div class="mkma-mode-card" class:active={displayMode === 'cpc'}>
                <div class="mkma-mode-card-top">
                    <span class="mkma-mode-card-icon">💰</span>
                    <strong>Platený PPC</strong>
                </div>
                <p>Zobrazenie v kategóriách, platba za preklik</p>
                {#if currentCredit > 0}
                <button class="mkma-mode-card-btn paid" class:active={displayMode === 'cpc'}
                    on:click={() => toggleMode('cpc')} disabled={modeLoading || displayMode === 'cpc'}>
                    {displayMode === 'cpc' ? '✓ Aktívny' : 'Aktivovať'}
                </button>
                {:else}
                <p class="mkma-mode-card-note">Najskôr <a href="/vendor-dashboard/ppc">dobite kredit</a></p>
                {/if}
            </div>
        </div>
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
        border-radius: 10px;
        padding: 12px 14px;
        display: flex;
        align-items: center;
        gap: 12px;
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
        width: 36px; height: 36px;
        border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
    }
    .mkma-stat-icon .material-icons-round { font-size: 20px; }
    .mkma-stat-icon.clicks { background: #eef2ff; color: #6366f1; }
    .mkma-stat-icon.products { background: #ecfeff; color: #06b6d4; }
    .mkma-stat-icon.conversions { background: #ecfdf5; color: #10b981; }
    .mkma-stat-icon.credit { background: #fffbeb; color: #f59e0b; }
    
    .mkma-stat-body { flex: 1; min-width: 0; }
    .mkma-stat-value {
        font-size: 18px; font-weight: 800; color: #0f172a;
        line-height: 1.1; letter-spacing: -0.3px; margin: 0;
    }
    .mkma-stat-card h3 {
        font-size: 11px; font-weight: 500; color: #94a3b8;
        margin: 2px 0 0 0;
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

    /* Mode Section — compact, site style */
    .mkma-mode-section { background: #fff; border: 1px solid #e8ebef; border-radius: 10px; padding: 14px; margin-bottom: 16px; }
    .mkma-mode-header { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
    .mkma-info-icon { background: none; border: none; cursor: pointer; padding: 0; color: #94a3b8; display: flex; }
    .mkma-info-icon:hover { color: #c4956a; }
    .mkma-info-icon .material-icons-round { font-size: 16px; }
    .mkma-mode-tooltip { background: #faf8f5; border: 1px solid #e8ddd0; border-radius: 8px; padding: 12px; margin-bottom: 10px; font-size: 12px; color: #6b5e4f; line-height: 1.5; }
    .mkma-mode-tooltip p { margin: 0 0 6px; }
    .mkma-mode-tooltip p:last-child { margin: 0; }
    .mkma-mode-tooltip a { color: #c4956a; text-decoration: underline; }
    .mkma-mode-msg { padding: 6px 10px; border-radius: 6px; font-size: 12px; margin-bottom: 10px; }
    .mkma-mode-msg.success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
    .mkma-mode-msg.error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .mkma-mode-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .mkma-mode-card { border: 1.5px solid #e8ebef; border-radius: 8px; padding: 12px; transition: all 0.2s; }
    .mkma-mode-card.active { border-color: #c4956a; background: #faf8f5; }
    .mkma-mode-card-top { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
    .mkma-mode-card-top strong { font-size: 13px; color: #1e293b; }
    .mkma-mode-card-icon { font-size: 16px; }
    .mkma-mode-card p { font-size: 11px; color: #64748b; margin: 0 0 8px; line-height: 1.3; }
    .mkma-mode-card-btn { width: 100%; padding: 6px; border: 1px solid #e2e8f0; border-radius: 6px; background: #fff; font-size: 12px; font-weight: 600; color: #475569; cursor: pointer; transition: all 0.15s; }
    .mkma-mode-card-btn:hover:not(:disabled) { border-color: #c4956a; color: #c4956a; }
    .mkma-mode-card-btn.active { background: #c4956a; color: #fff; border-color: #c4956a; cursor: default; }
    .mkma-mode-card-btn.paid:not(.active):hover:not(:disabled) { border-color: #c4956a; color: #b8875c; }
    .mkma-mode-card-note { font-size: 10px; color: #94a3b8; }
    .mkma-mode-card-note a { color: #c4956a; }

    /* Responsive */
    @media (max-width: 1200px) {
        .mkma-stats-grid { grid-template-columns: repeat(2, 1fr); }
        .mkma-actions-grid { grid-template-columns: repeat(2, 1fr); }
    }
    
    @media (max-width: 768px) {
        .mkma-stats-grid { grid-template-columns: 1fr; }
        .mkma-settings-grid { grid-template-columns: 1fr; }
        .mkma-actions-grid { grid-template-columns: repeat(2, 1fr); }
        .mkma-mode-cards { grid-template-columns: 1fr; }
    }
</style>
