<script>
    import { getContext, onMount } from 'svelte';
    import { browser } from '$app/environment';
    
    const vendorStore = getContext('vendor');
    const shopStore = getContext('shop');
    const API_BASE = getContext('API_BASE');
    
    $: vendor = $vendorStore;
    $: shop = $shopStore;
    
    let activeTab = 'topup';
    let loading = false;
    let transactions = [];
    let selectedPackage = null;
    let paymentMethod = 'bank_transfer';
    let message = null;
    
    let stats = {
        totalClicks: 0,
        chargedClicks: 0,
        totalCost: 0,
        avgCpc: 0.05,
        conversions: 0,
        conversionRate: 0
    };
    
    $: currentCredit = shop?.credit_balance || 0;
    $: displayMode = shop?.display_mode || 'free';
    $: avgCpc = stats.avgCpc || 0.05;
    $: remainingClicks = avgCpc > 0 ? Math.floor(currentCredit / avgCpc) : 0;
    $: totalCreditUsed = stats.totalCost + currentCredit;
    $: spentPercent = totalCreditUsed > 0 ? Math.min((stats.totalCost / totalCreditUsed) * 100, 100) : 0;
    $: remainingPercent = 100 - spentPercent;
    
    const packages = [
        { id: 1, amount: 10, bonus: 0, popular: false },
        { id: 2, amount: 25, bonus: 2, popular: false },
        { id: 3, amount: 50, bonus: 5, popular: true },
        { id: 4, amount: 100, bonus: 15, popular: false },
        { id: 5, amount: 250, bonus: 50, popular: false }
    ];
    
    onMount(async () => {
        if (!browser) return;
        await loadStats();
        await loadTransactions();
    });
    
    async function loadStats() {
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
    }
    
    async function loadTransactions() {
        const token = localStorage.getItem('vendor_token');
        if (!token) return;
        
        try {
            const res = await fetch(`${API_BASE}/vendor/transactions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.data) {
                transactions = data.data;
            }
        } catch (e) {
            console.error('Error loading transactions:', e);
        }
    }
    
    async function requestTopup() {
        if (!selectedPackage) {
            message = { type: 'error', text: 'Vyberte balík kreditu' };
            return;
        }
        
        loading = true;
        const token = localStorage.getItem('vendor_token');
        
        try {
            const res = await fetch(`${API_BASE}/vendor/credit/topup`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    package_id: selectedPackage.id,
                    amount: selectedPackage.amount,
                    bonus: selectedPackage.bonus,
                    payment_method: paymentMethod
                })
            });
            const data = await res.json();
            
            if (data.success) {
                message = { type: 'success', text: 'Žiadosť o dobíjanie bola odoslaná. Po prijatí platby bude kredit pripísaný.' };
                selectedPackage = null;
                await loadTransactions();
            } else {
                message = { type: 'error', text: data.error || 'Chyba pri odosielaní žiadosti' };
            }
        } catch (e) {
            message = { type: 'error', text: 'Chyba pri komunikácii so serverom' };
        }
        loading = false;
    }
    
    async function updateDisplayMode(mode) {
        loading = true;
        const token = localStorage.getItem('vendor_token');
        
        try {
            const res = await fetch(`${API_BASE}/vendor/display-mode`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ display_mode: mode })
            });
            const data = await res.json();
            
            if (data.success) {
                shopStore.update(s => ({ ...s, display_mode: mode }));
                message = { type: 'success', text: `Režim bol zmenený na ${mode.toUpperCase()}` };
            } else {
                message = { type: 'error', text: data.error || 'Chyba pri zmene režimu' };
            }
        } catch (e) {
            message = { type: 'error', text: 'Chyba pri komunikácii so serverom' };
        }
        loading = false;
    }
    
    function formatNumber(num, decimals = 0) {
        return (num || 0).toLocaleString('sk-SK', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }
    
    function formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('sk-SK', { 
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }
</script>

<div class="ppc-container">
    <!-- Header - BEZ duplicitného kreditu -->
    <div class="ppc-header">
        <h1>💰 PPC & Kredit</h1>
    </div>
    
    {#if message}
        <div class="ppc-message {message.type}">
            {message.text}
            <button on:click={() => message = null}>×</button>
        </div>
    {/if}
    
    <!-- Stats s jednotnými štvorcovými ikonami -->
    <div class="ppc-stats-grid">
        <div class="ppc-stat-card">
            <div class="ppc-stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                </svg>
            </div>
            <div class="ppc-stat-content">
                <span class="ppc-stat-value">{formatNumber(stats.totalClicks)}</span>
                <span class="ppc-stat-label">Preklikov (30 dní)</span>
            </div>
        </div>
        <div class="ppc-stat-card">
            <div class="ppc-stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
            </div>
            <div class="ppc-stat-content">
                <span class="ppc-stat-value">{formatNumber(stats.totalCost, 2)} €</span>
                <span class="ppc-stat-label">Minutý kredit (30 dní)</span>
            </div>
        </div>
        <div class="ppc-stat-card">
            <div class="ppc-stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
            </div>
            <div class="ppc-stat-content">
                <span class="ppc-stat-value">{formatNumber(avgCpc, 3)} €</span>
                <span class="ppc-stat-label">Priemerný CPC</span>
            </div>
        </div>
        <div class="ppc-stat-card">
            <div class="ppc-stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
            </div>
            <div class="ppc-stat-content">
                <span class="ppc-stat-value">{formatNumber(stats.conversionRate, 1)}%</span>
                <span class="ppc-stat-label">Konverzný pomer</span>
            </div>
        </div>
    </div>
    
    <!-- Credit Overview Bar -->
    <div class="ppc-credit-overview">
        <div class="ppc-credit-bar">
            <div class="ppc-credit-bar-spent" style="width: {spentPercent}%"></div>
            <div class="ppc-credit-bar-remaining" style="width: {remainingPercent}%"></div>
        </div>
        <div class="ppc-credit-legend">
            <span class="ppc-legend-item spent">● Minuté: {formatNumber(stats.totalCost, 2)} €</span>
            <span class="ppc-legend-item remaining">● Zostatok: {formatNumber(currentCredit, 2)} €</span>
        </div>
        <p class="ppc-credit-hint">
            Pri priemernom CPC {formatNumber(avgCpc, 3)} € vám zostáva <strong>~{formatNumber(remainingClicks)} klikov</strong>
        </p>
    </div>
    
    <!-- Tabs -->
    <div class="ppc-tabs">
        <button class="ppc-tab" class:active={activeTab === 'topup'} on:click={() => activeTab = 'topup'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            Dobiť kredit
        </button>
        <button class="ppc-tab" class:active={activeTab === 'mode'} on:click={() => activeTab = 'mode'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Režim zobrazovania
        </button>
        <button class="ppc-tab" class:active={activeTab === 'history'} on:click={() => activeTab = 'history'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            História transakcií
        </button>
    </div>
    
    <!-- Tab Content -->
    <div class="ppc-tab-content">
        {#if activeTab === 'topup'}
            <div class="ppc-topup">
                <!-- Aktuálny kredit info - zvýraznené pri dobíjaní -->
                <div class="ppc-current-credit-info">
                    <span class="ppc-cci-label">Aktuálny kredit:</span>
                    <span class="ppc-cci-value" class:low={currentCredit < 5}>{formatNumber(currentCredit, 2)} €</span>
                </div>
                
                <h3>Vyberte balík kreditu</h3>
                <div class="ppc-packages">
                    {#each packages as pkg}
                        <button 
                            class="ppc-package" 
                            class:selected={selectedPackage?.id === pkg.id}
                            class:popular={pkg.popular}
                            on:click={() => selectedPackage = pkg}
                        >
                            {#if pkg.popular}
                                <span class="ppc-package-badge">Najobľúbenejší</span>
                            {/if}
                            <div class="ppc-package-amount">{pkg.amount} €</div>
                            {#if pkg.bonus > 0}
                                <div class="ppc-package-bonus">+ {pkg.bonus} € bonus</div>
                            {/if}
                            <div class="ppc-package-total">= {pkg.amount + pkg.bonus} € kredit</div>
                        </button>
                    {/each}
                </div>
                
                <div class="ppc-payment-method">
                    <h4>Spôsob platby</h4>
                    <div class="ppc-payment-options">
                        <label class="ppc-payment-option" class:selected={paymentMethod === 'bank_transfer'}>
                            <input type="radio" bind:group={paymentMethod} value="bank_transfer">
                            <span class="ppc-payment-icon">🏦</span>
                            <span class="ppc-payment-label">Bankový prevod</span>
                        </label>
                        <label class="ppc-payment-option" class:selected={paymentMethod === 'card'}>
                            <input type="radio" bind:group={paymentMethod} value="card">
                            <span class="ppc-payment-icon">💳</span>
                            <span class="ppc-payment-label">Platobná karta</span>
                        </label>
                    </div>
                </div>
                
                <button class="ppc-submit-btn" on:click={requestTopup} disabled={loading || !selectedPackage}>
                    {loading ? 'Spracovávam...' : 'Objednať kredit'}
                </button>
                
                {#if paymentMethod === 'bank_transfer'}
                    <div class="ppc-bank-info">
                        <h4>Platobné údaje</h4>
                        <p><strong>IBAN:</strong> SK12 3456 7890 1234 5678 9012</p>
                        <p><strong>Variabilný symbol:</strong> {vendor?.id || '---'}</p>
                        <p class="ppc-note">Po prijatí platby bude kredit pripísaný do 24 hodín.</p>
                    </div>
                {/if}
            </div>
            
        {:else if activeTab === 'mode'}
            <div class="ppc-mode">
                <h3>Režim zobrazovania ponúk</h3>
                <p class="ppc-mode-desc">Vyberte, ako chcete zobrazovať vaše ponuky na MegaPrice.</p>
                
                <div class="ppc-mode-options">
                    <div class="ppc-mode-option" class:active={displayMode === 'free'}>
                        <div class="ppc-mode-header">
                            <span class="ppc-mode-icon">🆓</span>
                            <h4>FREE režim</h4>
                        </div>
                        <ul class="ppc-mode-features">
                            <li>✓ Zobrazenie na konci zoznamu</li>
                            <li>✓ Bez poplatkov</li>
                            <li>✓ Základná viditeľnosť</li>
                        </ul>
                        <button class="ppc-mode-btn" class:selected={displayMode === 'free'}
                            on:click={() => updateDisplayMode('free')} disabled={loading || displayMode === 'free'}>
                            {displayMode === 'free' ? '✓ Aktívny' : 'Aktivovať'}
                        </button>
                    </div>
                    
                    <div class="ppc-mode-option" class:active={displayMode === 'cpc'}>
                        <div class="ppc-mode-header">
                            <span class="ppc-mode-icon">💰</span>
                            <h4>PAID režim</h4>
                        </div>
                        <ul class="ppc-mode-features">
                            <li>✓ Prednostné zobrazenie</li>
                            <li>✓ Platba za preklik (CPC)</li>
                            <li>✓ Vyššia viditeľnosť</li>
                            <li>✓ Detailné štatistiky</li>
                        </ul>
                        {#if currentCredit > 0}
                            <button class="ppc-mode-btn" class:selected={displayMode === 'cpc'}
                                on:click={() => updateDisplayMode('cpc')} disabled={loading || displayMode === 'cpc'}>
                                {displayMode === 'cpc' ? '✓ Aktívny' : 'Aktivovať'}
                            </button>
                        {:else}
                            <p class="ppc-mode-note">Pre aktiváciu PAID režimu najskôr <a href="#topup" on:click={() => activeTab = 'topup'}>dobite kredit</a>.</p>
                        {/if}
                    </div>
                </div>
                
                <div class="ppc-mode-info">
                    <h4>ℹ️ Ako funguje PAID režim?</h4>
                    <p>V PAID režime sa za každý preklik na váš produkt automaticky strhne čiastka z vášho kreditu.</p>
                    <ul>
                        <li>Vaše ponuky budú zobrazené na popredných pozíciách</li>
                        <li>Pri vyčerpaní kreditu sa automaticky prepne na FREE režim</li>
                        <li>Môžete kedykoľvek manuálne prepnúť späť na FREE</li>
                    </ul>
                </div>
            </div>
            
        {:else if activeTab === 'history'}
            <div class="ppc-history">
                <h3>História transakcií</h3>
                {#if transactions.length === 0}
                    <div class="ppc-empty">
                        <span class="ppc-empty-icon">📋</span>
                        <p>Zatiaľ žiadne transakcie</p>
                    </div>
                {:else}
                    <div class="ppc-transactions-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Dátum</th>
                                    <th>Typ</th>
                                    <th>Suma</th>
                                    <th>Zostatok</th>
                                    <th>Popis</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each transactions as tx}
                                    <tr class={tx.type}>
                                        <td>{formatDate(tx.created_at)}</td>
                                        <td>
                                            {#if tx.type === 'topup'}
                                                <span class="ppc-tx-type topup">💵 Dobíjanie</span>
                                            {:else if tx.type === 'click'}
                                                <span class="ppc-tx-type click">👆 Preklik</span>
                                            {:else}
                                                <span class="ppc-tx-type other">{tx.type}</span>
                                            {/if}
                                        </td>
                                        <td class="ppc-tx-amount {tx.amount >= 0 ? 'positive' : 'negative'}">
                                            {tx.amount >= 0 ? '+' : ''}{formatNumber(tx.amount, 2)} €
                                        </td>
                                        <td>{formatNumber(tx.balance_after, 2)} €</td>
                                        <td>{tx.description || '-'}</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>

<style>
    .ppc-container { max-width: 1200px; margin: 0 auto; }
    
    .ppc-header { margin-bottom: 24px; }
    .ppc-header h1 { font-size: 24px; font-weight: 700; color: #1f2937; margin: 0; display: flex; align-items: center; gap: 10px; }
    
    /* Message */
    .ppc-message { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-radius: 10px; margin-bottom: 20px; }
    .ppc-message.success { background: #d1fae5; color: #065f46; }
    .ppc-message.error { background: #fee2e2; color: #991b1b; }
    .ppc-message button { background: none; border: none; font-size: 18px; cursor: pointer; opacity: 0.7; }
    
    /* Stats Grid - UNIFIED SQUARE ICONS */
    .ppc-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    
    .ppc-stat-card {
        display: flex;
        align-items: center;
        gap: 16px;
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    
    .ppc-stat-icon {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8fafc;
        border-radius: 10px;
        color: #64748b;
        box-shadow: 0 2px 4px rgba(0,0,0,0.06);
    }
    
    .ppc-stat-content { display: flex; flex-direction: column; }
    .ppc-stat-value { font-size: 24px; font-weight: 700; color: #1f2937; }
    .ppc-stat-label { font-size: 13px; color: #6b7280; }
    
    /* Credit Overview */
    .ppc-credit-overview { background: white; border-radius: 12px; padding: 20px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    
    .ppc-credit-bar { height: 12px; background: #f3f4f6; border-radius: 6px; overflow: hidden; display: flex; }
    .ppc-credit-bar-spent { background: #f87171; transition: width 0.3s; }
    .ppc-credit-bar-remaining { background: #34d399; transition: width 0.3s; }
    
    .ppc-credit-legend { display: flex; gap: 20px; margin-top: 12px; font-size: 13px; }
    .ppc-legend-item.spent { color: #ef4444; }
    .ppc-legend-item.remaining { color: #10b981; }
    
    .ppc-credit-hint { margin: 12px 0 0; font-size: 14px; color: #6b7280; }
    
    /* Tabs */
    .ppc-tabs { display: flex; gap: 8px; margin-bottom: 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 0; }
    
    .ppc-tab {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        color: #6b7280;
        transition: all 0.2s;
    }
    
    .ppc-tab:hover { color: #374151; }
    .ppc-tab.active { color: #3b82f6; border-bottom-color: #3b82f6; }
    
    /* Tab Content */
    .ppc-tab-content { background: white; border-radius: 0 0 12px 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    
    /* Current Credit Info - pri dobíjaní */
    .ppc-current-credit-info {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        padding: 8px 16px;
        border-radius: 8px;
        margin-bottom: 20px;
    }
    
    .ppc-cci-label { font-size: 13px; color: #166534; }
    .ppc-cci-value { font-size: 18px; font-weight: 700; color: #15803d; }
    .ppc-cci-value.low { color: #dc2626; }
    
    /* Packages */
    .ppc-topup h3 { font-size: 16px; font-weight: 600; margin-bottom: 16px; }
    
    .ppc-packages { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 24px; }
    
    .ppc-package {
        position: relative;
        background: #f8fafc;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        padding: 20px 16px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .ppc-package:hover { border-color: #3b82f6; }
    .ppc-package.selected { border-color: #3b82f6; background: #eff6ff; }
    .ppc-package.popular { border-color: #f59e0b; }
    
    .ppc-package-badge {
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        background: #f59e0b;
        color: white;
        font-size: 10px;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 10px;
        white-space: nowrap;
    }
    
    .ppc-package-amount { font-size: 28px; font-weight: 700; color: #1f2937; }
    .ppc-package-bonus { font-size: 14px; color: #10b981; font-weight: 600; margin: 4px 0; }
    .ppc-package-total { font-size: 12px; color: #6b7280; margin-top: 8px; }
    
    /* Payment */
    .ppc-payment-method { margin: 24px 0; }
    .ppc-payment-method h4 { font-size: 14px; font-weight: 600; margin-bottom: 12px; }
    .ppc-payment-options { display: flex; gap: 12px; }
    
    .ppc-payment-option {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: #f8fafc;
        border: 2px solid #e5e7eb;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .ppc-payment-option.selected { border-color: #3b82f6; background: #eff6ff; }
    .ppc-payment-option input { display: none; }
    .ppc-payment-icon { font-size: 24px; }
    .ppc-payment-label { font-weight: 500; }
    
    .ppc-submit-btn {
        width: 100%;
        padding: 16px;
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        color: white;
        border: none;
        border-radius: 10px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .ppc-submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); }
    .ppc-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    
    .ppc-bank-info { margin-top: 24px; padding: 20px; background: #f0f9ff; border-radius: 10px; border: 1px solid #bae6fd; }
    .ppc-bank-info h4 { margin-bottom: 12px; }
    .ppc-bank-info p { margin: 8px 0; }
    .ppc-note { font-size: 13px; color: #6b7280; margin-top: 12px; }
    
    /* Mode */
    .ppc-mode-desc { color: #6b7280; margin-bottom: 20px; }
    .ppc-mode-options { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 24px; }
    
    .ppc-mode-option { background: #f8fafc; border: 2px solid #e5e7eb; border-radius: 12px; padding: 24px; transition: all 0.2s; }
    .ppc-mode-option.active { border-color: #10b981; background: #f0fdf4; }
    
    .ppc-mode-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .ppc-mode-icon { font-size: 28px; }
    .ppc-mode-header h4 { font-size: 18px; font-weight: 600; margin: 0; }
    
    .ppc-mode-features { list-style: none; padding: 0; margin: 0 0 16px 0; }
    .ppc-mode-features li { padding: 6px 0; font-size: 14px; color: #374151; }
    
    .ppc-mode-btn { width: 100%; padding: 12px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; background: #e5e7eb; color: #374151; }
    .ppc-mode-btn.selected { background: #10b981; color: white; }
    .ppc-mode-btn:disabled { cursor: not-allowed; }
    
    .ppc-mode-note { font-size: 13px; color: #6b7280; }
    .ppc-mode-note a { color: #3b82f6; }
    
    .ppc-mode-info { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 20px; }
    .ppc-mode-info h4 { margin-bottom: 12px; }
    .ppc-mode-info ul { margin: 12px 0 0 20px; color: #374151; }
    .ppc-mode-info li { margin: 6px 0; }
    
    /* Transactions */
    .ppc-empty { text-align: center; padding: 60px 20px; color: #6b7280; }
    .ppc-empty-icon { font-size: 48px; display: block; margin-bottom: 12px; opacity: 0.5; }
    
    .ppc-transactions-table { overflow-x: auto; }
    .ppc-transactions-table table { width: 100%; border-collapse: collapse; }
    .ppc-transactions-table th, .ppc-transactions-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    .ppc-transactions-table th { font-weight: 600; color: #374151; background: #f8fafc; }
    
    .ppc-tx-type { display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 500; }
    .ppc-tx-type.topup { background: #d1fae5; color: #065f46; }
    .ppc-tx-type.click { background: #fee2e2; color: #991b1b; }
    
    .ppc-tx-amount.positive { color: #10b981; font-weight: 600; }
    .ppc-tx-amount.negative { color: #ef4444; font-weight: 600; }
    
    @media (max-width: 768px) {
        .ppc-tabs { overflow-x: auto; }
        .ppc-payment-options { flex-direction: column; }
        .ppc-packages { grid-template-columns: repeat(2, 1fr); }
    }
</style>
