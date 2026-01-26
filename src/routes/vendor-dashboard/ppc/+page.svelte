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
    
    // Štatistiky
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
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
</script>

<div class="mkcpc-container">
    <!-- Header s aktuálnym kreditom -->
    <div class="mkcpc-header">
        <h1>💰 PPC & Kredit</h1>
        <div class="mkcpc-balance-box" class:low={currentCredit <= 5}>
            <span class="mkcpc-balance-label">Aktuálny kredit:</span>
            <span class="mkcpc-balance-value">{formatNumber(currentCredit, 2)} €</span>
            {#if currentCredit <= 5}
                <span class="mkcpc-balance-warning">⚠️ Nízky kredit!</span>
            {/if}
        </div>
    </div>
    
    {#if message}
        <div class="mkcpc-message {message.type}">
            {message.text}
            <button on:click={() => message = null}>×</button>
        </div>
    {/if}
    
    <!-- Quick Stats -->
    <div class="mkcpc-stats-grid">
        <div class="mkcpc-stat-card">
            <span class="mkcpc-stat-icon">👆</span>
            <div class="mkcpc-stat-content">
                <span class="mkcpc-stat-value">{formatNumber(stats.totalClicks)}</span>
                <span class="mkcpc-stat-label">Preklikov (30 dní)</span>
            </div>
        </div>
        <div class="mkcpc-stat-card">
            <span class="mkcpc-stat-icon">💸</span>
            <div class="mkcpc-stat-content">
                <span class="mkcpc-stat-value">{formatNumber(stats.totalCost, 2)} €</span>
                <span class="mkcpc-stat-label">Minutý kredit (30 dní)</span>
            </div>
        </div>
        <div class="mkcpc-stat-card">
            <span class="mkcpc-stat-icon">📊</span>
            <div class="mkcpc-stat-content">
                <span class="mkcpc-stat-value">{formatNumber(avgCpc, 3)} €</span>
                <span class="mkcpc-stat-label">Priemerný CPC</span>
            </div>
        </div>
        <div class="mkcpc-stat-card">
            <span class="mkcpc-stat-icon">🎯</span>
            <div class="mkcpc-stat-content">
                <span class="mkcpc-stat-value">{formatNumber(stats.conversionRate, 1)}%</span>
                <span class="mkcpc-stat-label">Konverzný pomer</span>
            </div>
        </div>
    </div>
    
    <!-- Credit Overview Bar -->
    <div class="mkcpc-credit-overview">
        <div class="mkcpc-credit-bar">
            <div class="mkcpc-credit-bar-spent" style="width: {spentPercent}%"></div>
            <div class="mkcpc-credit-bar-remaining" style="width: {remainingPercent}%"></div>
        </div>
        <div class="mkcpc-credit-legend">
            <span class="mkcpc-legend-item spent">● Minuté: {formatNumber(stats.totalCost, 2)} €</span>
            <span class="mkcpc-legend-item remaining">● Zostatok: {formatNumber(currentCredit, 2)} €</span>
        </div>
        <p class="mkcpc-credit-hint">
            Pri priemernom CPC {formatNumber(avgCpc, 3)} € vám zostáva <strong>~{formatNumber(remainingClicks)} klikov</strong>
        </p>
    </div>
    
    <!-- Tabs -->
    <div class="mkcpc-tabs">
        <button class="mkcpc-tab" class:active={activeTab === 'topup'} on:click={() => activeTab = 'topup'}>
            💵 Dobiť kredit
        </button>
        <button class="mkcpc-tab" class:active={activeTab === 'mode'} on:click={() => activeTab = 'mode'}>
            ⚙️ Režim zobrazovania
        </button>
        <button class="mkcpc-tab" class:active={activeTab === 'history'} on:click={() => activeTab = 'history'}>
            📋 História transakcií
        </button>
    </div>
    
    <!-- Tab Content -->
    <div class="mkcpc-tab-content">
        {#if activeTab === 'topup'}
            <div class="mkcpc-topup">
                <h3>Vyberte balík kreditu</h3>
                <div class="mkcpc-packages">
                    {#each packages as pkg}
                        <button 
                            class="mkcpc-package" 
                            class:selected={selectedPackage?.id === pkg.id}
                            class:popular={pkg.popular}
                            on:click={() => selectedPackage = pkg}
                        >
                            {#if pkg.popular}
                                <span class="mkcpc-package-badge">Najobľúbenejší</span>
                            {/if}
                            <div class="mkcpc-package-amount">{pkg.amount} €</div>
                            {#if pkg.bonus > 0}
                                <div class="mkcpc-package-bonus">+ {pkg.bonus} € bonus</div>
                            {/if}
                            <div class="mkcpc-package-total">= {pkg.amount + pkg.bonus} € kredit</div>
                        </button>
                    {/each}
                </div>
                
                <div class="mkcpc-payment-method">
                    <h4>Spôsob platby</h4>
                    <div class="mkcpc-payment-options">
                        <label class="mkcpc-payment-option" class:selected={paymentMethod === 'bank_transfer'}>
                            <input type="radio" bind:group={paymentMethod} value="bank_transfer">
                            <span class="mkcpc-payment-icon">🏦</span>
                            <span class="mkcpc-payment-label">Bankový prevod</span>
                        </label>
                        <label class="mkcpc-payment-option" class:selected={paymentMethod === 'card'}>
                            <input type="radio" bind:group={paymentMethod} value="card">
                            <span class="mkcpc-payment-icon">💳</span>
                            <span class="mkcpc-payment-label">Platobná karta</span>
                        </label>
                    </div>
                </div>
                
                <button class="mkcpc-submit-btn" on:click={requestTopup} disabled={loading || !selectedPackage}>
                    {loading ? 'Spracovávam...' : 'Objednať kredit'}
                </button>
                
                {#if paymentMethod === 'bank_transfer'}
                    <div class="mkcpc-bank-info">
                        <h4>Platobné údaje</h4>
                        <p><strong>IBAN:</strong> SK12 3456 7890 1234 5678 9012</p>
                        <p><strong>Variabilný symbol:</strong> {vendor?.id || '---'}</p>
                        <p class="mkcpc-note">Po prijatí platby bude kredit pripísaný do 24 hodín.</p>
                    </div>
                {/if}
            </div>
            
        {:else if activeTab === 'mode'}
            <div class="mkcpc-mode">
                <h3>Režim zobrazovania ponúk</h3>
                <p class="mkcpc-mode-desc">
                    Vyberte, ako chcete zobrazovať vaše ponuky na MegaPrice.
                </p>
                
                <div class="mkcpc-mode-options">
                    <div class="mkcpc-mode-option" class:active={displayMode === 'free'}>
                        <div class="mkcpc-mode-header">
                            <span class="mkcpc-mode-icon">🆓</span>
                            <h4>FREE režim</h4>
                        </div>
                        <ul class="mkcpc-mode-features">
                            <li>✓ Zobrazenie na konci zoznamu</li>
                            <li>✓ Bez poplatkov</li>
                            <li>✓ Základná viditeľnosť</li>
                        </ul>
                        <button 
                            class="mkcpc-mode-btn" 
                            class:selected={displayMode === 'free'}
                            on:click={() => updateDisplayMode('free')}
                            disabled={loading || displayMode === 'free'}
                        >
                            {displayMode === 'free' ? '✓ Aktívny' : 'Aktivovať'}
                        </button>
                    </div>
                    
                    <div class="mkcpc-mode-option" class:active={displayMode === 'cpc'}>
                        <div class="mkcpc-mode-header">
                            <span class="mkcpc-mode-icon">💰</span>
                            <h4>PAID režim</h4>
                        </div>
                        <ul class="mkcpc-mode-features">
                            <li>✓ Prednostné zobrazenie</li>
                            <li>✓ Platba za preklik (CPC)</li>
                            <li>✓ Vyššia viditeľnosť</li>
                            <li>✓ Detailné štatistiky</li>
                        </ul>
                        {#if currentCredit > 0}
                            <button 
                                class="mkcpc-mode-btn" 
                                class:selected={displayMode === 'cpc'}
                                on:click={() => updateDisplayMode('cpc')}
                                disabled={loading || displayMode === 'cpc'}
                            >
                                {displayMode === 'cpc' ? '✓ Aktívny' : 'Aktivovať'}
                            </button>
                        {:else}
                            <p class="mkcpc-mode-note">Pre aktiváciu PAID režimu najskôr <a href="#topup" on:click={() => activeTab = 'topup'}>dobite kredit</a>.</p>
                        {/if}
                    </div>
                </div>
                
                <div class="mkcpc-mode-info">
                    <h4>ℹ️ Ako funguje PAID režim?</h4>
                    <p>V PAID režime sa za každý preklik na váš produkt automaticky strhne čiastka z vášho kreditu podľa cenníka kategórií.</p>
                    <ul>
                        <li>Vaše ponuky budú zobrazené na popredných pozíciách</li>
                        <li>Pri vyčerpaní kreditu sa automaticky prepne na FREE režim</li>
                        <li>Môžete kedykoľvek manuálne prepnúť späť na FREE</li>
                    </ul>
                </div>
            </div>
            
        {:else if activeTab === 'history'}
            <div class="mkcpc-history">
                <h3>História transakcií</h3>
                {#if transactions.length === 0}
                    <div class="mkcpc-empty">
                        <span class="mkcpc-empty-icon">📋</span>
                        <p>Zatiaľ žiadne transakcie</p>
                    </div>
                {:else}
                    <div class="mkcpc-transactions-table">
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
                                                <span class="mkcpc-tx-type topup">💵 Dobíjanie</span>
                                            {:else if tx.type === 'click'}
                                                <span class="mkcpc-tx-type click">👆 Preklik</span>
                                            {:else}
                                                <span class="mkcpc-tx-type other">{tx.type}</span>
                                            {/if}
                                        </td>
                                        <td class="mkcpc-tx-amount {tx.amount >= 0 ? 'positive' : 'negative'}">
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
.mkcpc-container {
    max-width: 1200px;
    margin: 0 auto;
}

.mkcpc-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
}

.mkcpc-header h1 {
    font-size: 28px;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
}

.mkcpc-balance-box {
    display: flex;
    align-items: center;
    gap: 12px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    padding: 12px 24px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.mkcpc-balance-box.low {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.mkcpc-balance-label {
    font-size: 14px;
    opacity: 0.9;
}

.mkcpc-balance-value {
    font-size: 24px;
    font-weight: 700;
}

.mkcpc-balance-warning {
    font-size: 13px;
    background: rgba(255,255,255,0.2);
    padding: 4px 8px;
    border-radius: 6px;
}

.mkcpc-message {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.mkcpc-message.success {
    background: #d1fae5;
    color: #065f46;
}

.mkcpc-message.error {
    background: #fee2e2;
    color: #991b1b;
}

.mkcpc-message button {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    opacity: 0.7;
}

/* Stats Grid */
.mkcpc-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
}

.mkcpc-stat-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.mkcpc-stat-icon {
    font-size: 32px;
}

.mkcpc-stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
    display: block;
}

.mkcpc-stat-label {
    font-size: 13px;
    color: #6b7280;
}

/* Credit Overview */
.mkcpc-credit-overview {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.mkcpc-credit-bar {
    height: 12px;
    background: #e5e7eb;
    border-radius: 6px;
    overflow: hidden;
    display: flex;
}

.mkcpc-credit-bar-spent {
    background: linear-gradient(90deg, #ef4444, #f87171);
    transition: width 0.3s;
}

.mkcpc-credit-bar-remaining {
    background: linear-gradient(90deg, #10b981, #34d399);
    transition: width 0.3s;
}

.mkcpc-credit-legend {
    display: flex;
    gap: 20px;
    margin-top: 12px;
    font-size: 13px;
}

.mkcpc-legend-item.spent { color: #ef4444; }
.mkcpc-legend-item.remaining { color: #10b981; }

.mkcpc-credit-hint {
    margin-top: 12px;
    font-size: 14px;
    color: #6b7280;
}

/* Tabs */
.mkcpc-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    border-bottom: 2px solid #e5e7eb;
    padding-bottom: 0;
}

.mkcpc-tab {
    padding: 12px 20px;
    background: none;
    border: none;
    font-size: 14px;
    font-weight: 500;
    color: #6b7280;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    transition: all 0.2s;
}

.mkcpc-tab:hover {
    color: #374151;
}

.mkcpc-tab.active {
    color: #3b82f6;
    border-bottom-color: #3b82f6;
}

.mkcpc-tab-content {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

/* Packages */
.mkcpc-packages {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 16px;
    margin: 20px 0;
}

.mkcpc-package {
    position: relative;
    background: #f8fafc;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
}

.mkcpc-package:hover {
    border-color: #3b82f6;
    transform: translateY(-2px);
}

.mkcpc-package.selected {
    border-color: #3b82f6;
    background: #eff6ff;
}

.mkcpc-package.popular {
    border-color: #f59e0b;
}

.mkcpc-package-badge {
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
}

.mkcpc-package-amount {
    font-size: 28px;
    font-weight: 700;
    color: #1f2937;
}

.mkcpc-package-bonus {
    font-size: 14px;
    color: #10b981;
    font-weight: 600;
    margin: 4px 0;
}

.mkcpc-package-total {
    font-size: 12px;
    color: #6b7280;
    margin-top: 8px;
}

/* Payment Method */
.mkcpc-payment-method {
    margin: 24px 0;
}

.mkcpc-payment-method h4 {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 12px;
}

.mkcpc-payment-options {
    display: flex;
    gap: 12px;
}

.mkcpc-payment-option {
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

.mkcpc-payment-option.selected {
    border-color: #3b82f6;
    background: #eff6ff;
}

.mkcpc-payment-option input {
    display: none;
}

.mkcpc-payment-icon {
    font-size: 24px;
}

.mkcpc-payment-label {
    font-weight: 500;
}

.mkcpc-submit-btn {
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

.mkcpc-submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.mkcpc-submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.mkcpc-bank-info {
    margin-top: 24px;
    padding: 20px;
    background: #f0f9ff;
    border-radius: 10px;
    border: 1px solid #bae6fd;
}

.mkcpc-bank-info h4 {
    margin-bottom: 12px;
}

.mkcpc-bank-info p {
    margin: 8px 0;
}

.mkcpc-note {
    font-size: 13px;
    color: #6b7280;
    margin-top: 12px;
}

/* Mode Options */
.mkcpc-mode-desc {
    color: #6b7280;
    margin-bottom: 20px;
}

.mkcpc-mode-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
}

.mkcpc-mode-option {
    background: #f8fafc;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px;
    transition: all 0.2s;
}

.mkcpc-mode-option.active {
    border-color: #10b981;
    background: #f0fdf4;
}

.mkcpc-mode-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
}

.mkcpc-mode-icon {
    font-size: 28px;
}

.mkcpc-mode-header h4 {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
}

.mkcpc-mode-features {
    list-style: none;
    padding: 0;
    margin: 0 0 16px 0;
}

.mkcpc-mode-features li {
    padding: 6px 0;
    font-size: 14px;
    color: #374151;
}

.mkcpc-mode-btn {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    background: #e5e7eb;
    color: #374151;
}

.mkcpc-mode-btn.selected {
    background: #10b981;
    color: white;
}

.mkcpc-mode-btn:disabled {
    cursor: not-allowed;
}

.mkcpc-mode-note {
    font-size: 13px;
    color: #6b7280;
}

.mkcpc-mode-note a {
    color: #3b82f6;
}

.mkcpc-mode-info {
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 10px;
    padding: 20px;
}

.mkcpc-mode-info h4 {
    margin-bottom: 12px;
}

.mkcpc-mode-info ul {
    margin: 12px 0 0 20px;
    color: #374151;
}

.mkcpc-mode-info li {
    margin: 6px 0;
}

/* Transactions */
.mkcpc-empty {
    text-align: center;
    padding: 60px 20px;
    color: #6b7280;
}

.mkcpc-empty-icon {
    font-size: 48px;
    display: block;
    margin-bottom: 12px;
    opacity: 0.5;
}

.mkcpc-transactions-table {
    overflow-x: auto;
}

.mkcpc-transactions-table table {
    width: 100%;
    border-collapse: collapse;
}

.mkcpc-transactions-table th,
.mkcpc-transactions-table td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
}

.mkcpc-transactions-table th {
    font-weight: 600;
    color: #374151;
    background: #f8fafc;
}

.mkcpc-tx-type {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
}

.mkcpc-tx-type.topup {
    background: #d1fae5;
    color: #065f46;
}

.mkcpc-tx-type.click {
    background: #fee2e2;
    color: #991b1b;
}

.mkcpc-tx-amount.positive {
    color: #10b981;
    font-weight: 600;
}

.mkcpc-tx-amount.negative {
    color: #ef4444;
    font-weight: 600;
}

@media (max-width: 768px) {
    .mkcpc-header {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .mkcpc-tabs {
        overflow-x: auto;
    }
    
    .mkcpc-payment-options {
        flex-direction: column;
    }
}
</style>
