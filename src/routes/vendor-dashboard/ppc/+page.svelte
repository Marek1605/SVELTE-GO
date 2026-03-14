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
    
    // Payment settings from admin
    let paymentSettings = {
        payment_iban: '',
        payment_swift: '',
        payment_bank_name: '',
        payment_card_enabled: 'false'
    };
    
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
    $: cardEnabled = paymentSettings.payment_card_enabled === 'true';
    
    const packages = [
        { id: 1, amount: 10, bonusPct: 0, popular: false },
        { id: 2, amount: 25, bonusPct: 5, popular: false },
        { id: 3, amount: 50, bonusPct: 10, popular: true },
        { id: 4, amount: 100, bonusPct: 15, popular: false },
        { id: 5, amount: 250, bonusPct: 20, popular: false }
    ];
    
    let customAmount = '';
    let useCustom = false;
    $: customBonus = Number(customAmount) >= 200 ? 20 : Number(customAmount) >= 100 ? 15 : Number(customAmount) >= 50 ? 10 : Number(customAmount) >= 25 ? 5 : 0;
    $: customBonusAmount = Math.round(Number(customAmount) * customBonus / 100);
    $: selectedAmount = useCustom ? Number(customAmount) : (selectedPackage?.amount || 0);
    $: selectedBonusPct = useCustom ? customBonus : (selectedPackage?.bonusPct || 0);
    $: selectedTotal = useCustom ? Number(customAmount) + customBonusAmount : (selectedPackage ? selectedPackage.amount + Math.round(selectedPackage.amount * selectedPackage.bonusPct / 100) : 0);
    
    onMount(async () => {
        if (!browser) return;
        await Promise.all([loadStats(), loadTransactions(), loadPaymentSettings()]);
    });
    
    async function loadPaymentSettings() {
        const token = localStorage.getItem('vendor_token');
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE}/vendor/payment-settings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.data) {
                paymentSettings = { ...paymentSettings, ...data.data };
                // If card is disabled and selected, switch to bank
                if (!cardEnabled && paymentMethod === 'card') {
                    paymentMethod = 'bank_transfer';
                }
            }
        } catch (e) {
            console.error('Error loading payment settings:', e);
        }
    }
    
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
                message = { type: 'success', text: `Režim bol zmenený na ${mode === 'free' ? 'Zadarmo' : 'Platený PPC'}` };
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
    {#if message}
        <div class="ppc-message {message.type}">
            {message.text}
            <button on:click={() => message = null}>×</button>
        </div>
    {/if}
    
    <!-- Stats s jednotnými štvorcovými ikonami -->
    <div class="mkma-stats-grid">
        <div class="mkma-stat-card">
            <div class="mkma-stat-icon s1"><span class="material-icons-round">ads_click</span></div>
            <div class="mkma-stat-body">
                <p class="mkma-stat-value">{formatNumber(stats.totalClicks)}</p>
                <h3>Preklikov (30 dní)</h3>
            </div>
        </div>
        <div class="mkma-stat-card">
            <div class="mkma-stat-icon s2"><span class="material-icons-round">payments</span></div>
            <div class="mkma-stat-body">
                <p class="mkma-stat-value">{formatNumber(stats.totalCost, 2)} €</p>
                <h3>Minutý kredit (30 dní)</h3>
            </div>
        </div>
        <div class="mkma-stat-card">
            <div class="mkma-stat-icon s3"><span class="material-icons-round">bar_chart</span></div>
            <div class="mkma-stat-body">
                <p class="mkma-stat-value">{formatNumber(avgCpc, 3)} €</p>
                <h3>Priemerný CPC</h3>
            </div>
        </div>
        <div class="mkma-stat-card">
            <div class="mkma-stat-icon s4"><span class="material-icons-round">track_changes</span></div>
            <div class="mkma-stat-body">
                <p class="mkma-stat-value">{formatNumber(stats.conversionRate, 1)}%</p>
                <h3>Konverzný pomer</h3>
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
                
                <h3>Vyberte si balík kreditu</h3>
                <div class="ppc-packages">
                    {#each packages as pkg}
                        <button 
                            class="ppc-package" 
                            class:selected={!useCustom && selectedPackage?.id === pkg.id}
                            class:popular={pkg.popular}
                            on:click={() => { selectedPackage = pkg; useCustom = false; }}
                        >
                            {#if pkg.popular}
                                <span class="ppc-package-badge">Najobľúbenejší</span>
                            {/if}
                            <div class="ppc-package-amount">{pkg.amount} €</div>
                            {#if pkg.bonusPct > 0}
                                <div class="ppc-package-bonus">+ {pkg.bonusPct}% bonus</div>
                            {/if}
                            <div class="ppc-package-total">= {pkg.amount + Math.round(pkg.amount * pkg.bonusPct / 100)} € kredit</div>
                        </button>
                    {/each}
                </div>
                {#if !useCustom && selectedPackage}
                    <div class="ppc-custom-projected" style="margin-top:8px">
                        Po dobití: <strong>{formatNumber(currentCredit + selectedPackage.amount + Math.round(selectedPackage.amount * selectedPackage.bonusPct / 100), 2)} €</strong>
                    </div>
                {/if}
                
                <div class="ppc-custom-amount">
                    <h4>Alebo zadajte vlastnú čiastku</h4>
                    <div class="ppc-custom-row">
                        <input type="number" class="ppc-custom-input" placeholder="€" bind:value={customAmount} on:focus={() => { useCustom = true; selectedPackage = null; }} min="5" step="1">
                        {#if useCustom && Number(customAmount) >= 5}
                            <span class="ppc-custom-info">
                                {#if customBonus > 0}
                                    {customAmount} € + {customBonus}% bonus = <strong>{Number(customAmount) + customBonusAmount} € kredit</strong>
                                {:else}
                                    <strong>{customAmount} € kredit</strong>
                                {/if}
                            </span>
                        {/if}
                    </div>
                    {#if useCustom && Number(customAmount) >= 5}
                        <div class="ppc-custom-projected">
                            Po dobití: <strong>{formatNumber(currentCredit + Number(customAmount) + customBonusAmount, 2)} €</strong>
                        </div>
                    {/if}
                    <p class="ppc-custom-note">Min. 5 €. Bonus: 25€+ = 5%, 50€+ = 10%, 100€+ = 15%, 200€+ = 20%</p>
                </div>
                
                <div class="ppc-payment-method">
                    <h4>Spôsob platby</h4>
                    <div class="ppc-payment-options">
                        <label class="ppc-payment-option" class:selected={paymentMethod === 'bank_transfer'}>
                            <input type="radio" bind:group={paymentMethod} value="bank_transfer">
                            <span class="ppc-payment-icon">🏦</span>
                            <span class="ppc-payment-label">Bankový prevod</span>
                        </label>
                        {#if cardEnabled}
                            <label class="ppc-payment-option" class:selected={paymentMethod === 'card'}>
                                <input type="radio" bind:group={paymentMethod} value="card">
                                <span class="ppc-payment-icon">💳</span>
                                <span class="ppc-payment-label">Platobná karta</span>
                            </label>
                        {/if}
                    </div>
                </div>
                
                <button class="ppc-submit-btn" on:click={requestTopup} disabled={loading || (!selectedPackage && !useCustom) || (useCustom && Number(customAmount) < 5)}>
                    {loading ? 'Spracovávam...' : `Prejsť na platbu ${selectedAmount > 0 ? selectedAmount + ' €' : ''}`}
                </button>
                
                {#if paymentMethod === 'bank_transfer' && paymentSettings.payment_iban}
                    <div class="ppc-bank-info">
                        <h4>Platobné údaje</h4>
                        <p><strong>IBAN:</strong> {paymentSettings.payment_iban}</p>
                        {#if paymentSettings.payment_swift}
                            <p><strong>SWIFT:</strong> {paymentSettings.payment_swift}</p>
                        {/if}
                        {#if paymentSettings.payment_bank_name}
                            <p><strong>Banka:</strong> {paymentSettings.payment_bank_name}</p>
                        {/if}
                        <p><strong>Variabilný symbol:</strong> {shop?.id || vendor?.id || '---'}</p>
                        <p class="ppc-note">Po prijatí platby bude kredit pripísaný do 24 hodín.</p>
                    </div>
                {:else if paymentMethod === 'bank_transfer' && !paymentSettings.payment_iban}
                    <div class="ppc-bank-info">
                        <h4>Platobné údaje</h4>
                        <p class="ppc-note">Platobné údaje ešte neboli nastavené administrátorom. Kontaktujte nás.</p>
                    </div>
                {/if}
            </div>
            
        {:else if activeTab === 'mode'}
            <div class="ppc-mode">
                <h3>Režim zobrazovania ponúk</h3>
                <p class="ppc-mode-desc">Vyberte, ako chcete zobrazovať vaše ponuky na MegaBuy.</p>
                
                <div class="ppc-mode-options">
                    <div class="ppc-mode-option" class:active={displayMode === 'free'}>
                        <div class="ppc-mode-header">
                            <span class="ppc-mode-icon">🆓</span>
                            <h4>Zadarmo</h4>
                        </div>
                        <ul class="ppc-mode-features">
                            <li>✓ Zobrazenie iba vo fulltextovom vyhľadávaní</li>
                            <li>✓ Nezaradené v kategóriách</li>
                            <li>✓ Bez poplatkov za prekliky</li>
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
                            <h4>Platený PPC</h4>
                        </div>
                        <ul class="ppc-mode-features">
                            <li>✓ Zobrazenie v kategóriách aj vo vyhľadávaní</li>
                            <li>✓ Prednostné pozície v porovnaní ponúk</li>
                            <li>✓ Platba za preklik (PPC) podľa cenníka</li>
                            <li>✓ Detailné štatistiky a reporty</li>
                        </ul>
                        {#if currentCredit > 0}
                            <button class="ppc-mode-btn" class:selected={displayMode === 'cpc'}
                                on:click={() => updateDisplayMode('cpc')} disabled={loading || displayMode === 'cpc'}>
                                {displayMode === 'cpc' ? '✓ Aktívny' : 'Aktivovať'}
                            </button>
                        {:else}
                            <p class="ppc-mode-note">Pre aktiváciu plateného režimu najskôr <a href="#topup" on:click={() => activeTab = 'topup'}>dobite kredit</a>.</p>
                        {/if}
                    </div>
                </div>
                
                <!-- Cenník preklikov -->
                <div class="ppc-pricing">
                    <h4>💰 Cenník preklikov (PPC)</h4>
                    <p class="ppc-pricing-desc">Cena za preklik závisí od ceny produktu. Účtuje sa iba v platenom režime.</p>
                    <table class="ppc-pricing-table">
                        <thead>
                            <tr>
                                <th>Cena produktu</th>
                                <th>Cena za preklik</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>do 10 €</td><td><strong>0,01 €</strong></td></tr>
                            <tr><td>10 – 50 €</td><td><strong>0,02 €</strong></td></tr>
                            <tr><td>50 – 100 €</td><td><strong>0,03 €</strong></td></tr>
                            <tr><td>100 – 500 €</td><td><strong>0,05 €</strong></td></tr>
                            <tr><td>nad 500 €</td><td><strong>0,10 €</strong></td></tr>
                        </tbody>
                    </table>
                    <p class="ppc-pricing-note">
                        <a href="/cennik-preklikov" target="_blank">Stiahnuť kompletný cenník preklikov (PDF) →</a>
                    </p>
                </div>
                
                <div class="ppc-mode-info">
                    <h4>ℹ️ Ako funguje platený PPC režim?</h4>
                    <p>V platenom režime sa za každý preklik na váš produkt automaticky strhne čiastka z vášho kreditu podľa cenníka vyššie.</p>
                    <ul>
                        <li>Vaše ponuky budú zobrazené v kategóriách a na popredných pozíciách</li>
                        <li>Vo voľnom režime sa ponuky zobrazujú iba vo fulltextovom vyhľadávaní</li>
                        <li>Pri vyčerpaní kreditu sa automaticky prepne na režim Zadarmo</li>
                        <li>Môžete kedykoľvek manuálne prepnúť medzi režimami</li>
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
    .mkma-stat-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.mkma-stat-icon .material-icons-round { font-size: 20px; }
    .mkma-stat-icon.s1 { background: #eef2ff; color: #6366f1; } .mkma-stat-icon.s2 { background: #ecfeff; color: #06b6d4; }
    .mkma-stat-icon.s3 { background: #ecfdf5; color: #10b981; } .mkma-stat-icon.s4 { background: #fffbeb; color: #f59e0b; }
    .mkma-stat-body { flex: 1; min-width: 0; }
    .mkma-stat-value { font-size: 18px; font-weight: 800; color: #0f172a; line-height: 1.1; margin: 0; }
    .mkma-stat-card h3 { font-size: 11px; font-weight: 500; color: #94a3b8; margin: 2px 0 0 0; }
    
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
        padding: 13px;
        background: linear-gradient(135deg, #c4956a, #b8875c);
        color: white;
        border: none;
        border-radius: 10px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 3px 12px rgba(196,149,106,0.3);
    }
    
    .ppc-submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(196,149,106,0.4); }
    .ppc-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    
    /* Custom amount */
    .ppc-custom-amount { margin-top: 20px; padding-top: 20px; border-top: 1px solid #f0f0f0; }
    .ppc-custom-amount h4 { font-size: 14px; margin-bottom: 10px; color: #374151; }
    .ppc-custom-row { display: flex; align-items: center; gap: 12px; margin-bottom: 6px; }
    .ppc-custom-input { width: 90px; padding: 8px 12px; border: 2px solid #d1d5db; border-radius: 8px; font-size: 15px; font-weight: 600; color: #111; outline: none; transition: border-color 0.2s; }
    .ppc-custom-input:focus { border-color: #c4956a; box-shadow: 0 0 0 3px rgba(196,149,106,0.15); }
    .ppc-custom-info { font-size: 13px; color: #059669; }
    .ppc-custom-info strong { font-weight: 700; }
    .ppc-custom-projected { font-size: 12px; color: #6b7280; margin-bottom: 4px; padding: 4px 0; }
    .ppc-custom-projected strong { color: #1f2937; }
    .ppc-custom-note { font-size: 11px; color: #94a3b8; margin: 0; }
    
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
    
    .ppc-mode-btn { width: 100%; padding: 10px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; background: #e5e7eb; color: #374151; font-size: 13px; }
    .ppc-mode-btn.selected { background: #c4956a; color: white; }
    .ppc-mode-btn:disabled { cursor: not-allowed; }
    
    .ppc-mode-note { font-size: 13px; color: #6b7280; }
    .ppc-mode-note a { color: #c4956a; }
    
    .ppc-mode-info { background: #faf8f5; border: 1px solid #e8ddd0; border-radius: 10px; padding: 20px; }
    .ppc-mode-info h4 { margin-bottom: 12px; color: #6b5e4f; }
    .ppc-mode-info ul { margin: 12px 0 0 20px; color: #374151; }
    .ppc-mode-info li { margin: 6px 0; font-size: 13px; }
    
    /* Pricing */
    .ppc-pricing { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin-top: 20px; }
    .ppc-pricing h4 { margin: 0 0 8px; font-size: 16px; }
    .ppc-pricing-desc { font-size: 13px; color: #6b7280; margin: 0 0 16px; }
    .ppc-pricing-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    .ppc-pricing-table th { padding: 10px 14px; text-align: left; background: #f8fafc; border-bottom: 2px solid #e5e7eb; font-size: 13px; font-weight: 600; color: #374151; }
    .ppc-pricing-table td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #475569; }
    .ppc-pricing-table td strong { color: #059669; font-weight: 700; }
    .ppc-pricing-table tbody tr:hover { background: #f8fffe; }
    .ppc-pricing-note { font-size: 12px; color: #94a3b8; margin: 0; }
    .ppc-pricing-note a { color: #c4956a; text-decoration: none; }
    .ppc-pricing-note a:hover { text-decoration: underline; }
    
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
