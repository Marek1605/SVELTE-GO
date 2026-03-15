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
    let topups = [];
    let selectedTopup = null;
    let selectedPackage = null;
    let paymentMethod = 'bank_transfer';
    let message = null;
    let myShops = [];
    let selectedShopId = '';
    
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
    let showPaymentPage = false;
    let paymentData = null;
    $: customBonus = Number(customAmount) >= 200 ? 20 : Number(customAmount) >= 100 ? 15 : Number(customAmount) >= 50 ? 10 : Number(customAmount) >= 25 ? 5 : 0;
    $: customBonusAmount = Math.round(Number(customAmount) * customBonus / 100);
    $: selectedAmount = useCustom ? Number(customAmount) : (selectedPackage?.amount || 0);
    $: selectedBonusPct = useCustom ? customBonus : (selectedPackage?.bonusPct || 0);
    $: selectedTotal = useCustom ? Number(customAmount) + customBonusAmount : (selectedPackage ? selectedPackage.amount + Math.round(selectedPackage.amount * selectedPackage.bonusPct / 100) : 0);
    
    onMount(async () => {
        if (!browser) return;
        await Promise.all([loadStats(), loadTransactions(), loadPaymentSettings(), loadMyShops(), loadTopups()]);
        if (myShops.length > 0 && !selectedShopId) selectedShopId = myShops[0].id;
    });
    
    async function loadMyShops() {
        const token = localStorage.getItem('vendor_token');
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE}/vendor/my-shops`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success && data.data) myShops = data.data;
        } catch (e) { console.error(e); }
    }
    
    $: selectedShopBilling = myShops.find(s => s.id === selectedShopId);
    $: effectiveBilling = (() => {
        const s = selectedShopBilling;
        if (s && (s.billing_name || s.billing_ico)) {
            return { name: s.billing_name, ico: s.billing_ico, dic: s.billing_dic, ic_dph: s.billing_ic_dph, address: s.billing_address, city: s.billing_city, zip: s.billing_zip, email: s.billing_email, source: 'shop' };
        }
        return { name: vendor?.company_name || '', ico: vendor?.ico || '', dic: vendor?.dic || '', ic_dph: vendor?.ic_dph || '', address: vendor?.address || '', city: vendor?.city || '', zip: vendor?.zip || '', email: vendor?.email || '', source: 'vendor' };
    })();

    let editBilling = false;
    let billingForm = { billing_name:'', billing_ico:'', billing_dic:'', billing_ic_dph:'', billing_address:'', billing_city:'', billing_zip:'', billing_email:'' };
    let billingSaving = false, billingMsg = null;

    function startEditBilling() {
        const s = selectedShopBilling || {};
        billingForm = {
            billing_name: s.billing_name || vendor?.company_name || '',
            billing_ico: s.billing_ico || vendor?.ico || '',
            billing_dic: s.billing_dic || vendor?.dic || '',
            billing_ic_dph: s.billing_ic_dph || vendor?.ic_dph || '',
            billing_address: s.billing_address || vendor?.address || '',
            billing_city: s.billing_city || vendor?.city || '',
            billing_zip: s.billing_zip || vendor?.zip || '',
            billing_email: s.billing_email || vendor?.email || ''
        };
        editBilling = true;
    }

    async function saveBilling() {
        if (!selectedShopId) return;
        billingSaving = true; billingMsg = null;
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(`${API_BASE}/vendor/shop-billing`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ shop_id: selectedShopId, ...billingForm })
            });
            const data = await res.json();
            if (data.success) {
                billingMsg = { type: 'success', text: 'Fakturačné údaje uložené ✓' };
                editBilling = false;
                await loadMyShops();
            } else { billingMsg = { type: 'error', text: data.error || 'Chyba' }; }
        } catch(e) { billingMsg = { type: 'error', text: 'Chyba pripojenia' }; }
        billingSaving = false;
        setTimeout(() => billingMsg = null, 5000);
    }
    
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

    async function loadTopups() {
        const token = localStorage.getItem('vendor_token');
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE}/vendor/credit/topups`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success && data.data) topups = data.data;
        } catch (e) { console.error('Error loading topups:', e); }
    }

    async function downloadPDF(topupId, type, label) {
        const token = localStorage.getItem('vendor_token');
        try {
            const r = await fetch(`${API_BASE}/vendor/invoice-pdf/${topupId}?type=${type}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (r.ok) { const b = await r.blob(); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `${label}.pdf`; a.click(); URL.revokeObjectURL(a.href); }
            else { const e = await r.json().catch(() => ({})); alert(e.error || 'Chyba pri sťahovaní PDF'); }
        } catch(e) { alert('Chyba pripojenia'); }
    }

    async function loadTopupDetail(topupId) {
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(`${API_BASE}/vendor/credit/topup/${topupId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) selectedTopup = data.data;
            else alert(data.error || 'Chyba');
        } catch(e) { console.error(e); }
    }
    
    async function requestTopup() {
        if (!selectedPackage && !useCustom) {
            message = { type: 'error', text: 'Vyberte balík kreditu alebo zadajte vlastnú čiastku' };
            return;
        }
        if (useCustom && Number(customAmount) < 5) {
            message = { type: 'error', text: 'Minimálna suma je 5 €' };
            return;
        }
        
        loading = true;
        const token = localStorage.getItem('vendor_token');
        
        const amount = useCustom ? Number(customAmount) : selectedPackage.amount;
        const bonusPct = useCustom ? customBonus : selectedPackage.bonusPct;
        const bonusAmt = useCustom ? customBonusAmount : Math.round(selectedPackage.amount * selectedPackage.bonusPct / 100);
        const totalCred = amount + bonusAmt;
        
        try {
            const res = await fetch(`${API_BASE}/vendor/credit/topup-v2`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: amount,
                    bonus_pct: bonusPct,
                    bonus_amount: bonusAmt,
                    total_credit: totalCred,
                    payment_method: paymentMethod,
                    shop_id: selectedShopId || undefined
                })
            });
            const data = await res.json();
            
            if (data.success) {
                paymentData = {
                    topup_id: data.topup_id,
                    amount: amount,
                    bonus_pct: bonusPct,
                    bonus_amount: bonusAmt,
                    total_credit: totalCred,
                    ...data.payment
                };
                showPaymentPage = true;
                loadTopups(); // refresh list
                if (data.sf_warning) {
                    console.warn('SF warning:', data.sf_warning);
                }
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
            {#if showPaymentPage && paymentData}
            <!-- PAYMENT PAGE -->
            <div class="ppc-payment-page">
                <button class="ppc-back-btn" on:click={() => { showPaymentPage = false; paymentData = null; loadTopups(); }}>← Späť na výber</button>
                
                <div class="ppc-payment-summary">
                    <div class="ppc-payment-icon">🏦</div>
                    <h3>Platobné údaje</h3>
                    <p class="ppc-payment-subtitle">Uhraďte nasledujúcu sumu bankovým prevodom</p>
                </div>

                <div class="ppc-payment-details">
                    <div class="ppc-payment-amount-box">
                        <span class="ppc-payment-label-sm">Suma na úhradu</span>
                        <span class="ppc-payment-amount-big">{formatNumber(paymentData.amount, 2)} €</span>
                        {#if paymentData.bonus_pct > 0}
                            <span class="ppc-payment-bonus-info">+ {paymentData.bonus_pct}% bonus = {formatNumber(paymentData.total_credit, 2)} € kredit</span>
                        {/if}
                    </div>

                    <div class="ppc-payment-bank-details">
                        <div class="ppc-bank-row">
                            <span class="ppc-bank-label">Názov účtu</span>
                            <span class="ppc-bank-value">{paymentData.bank_account_name || 'Megabuy s.r.o.'}</span>
                        </div>
                        <div class="ppc-bank-row">
                            <span class="ppc-bank-label">IBAN</span>
                            <span class="ppc-bank-value ppc-iban">{paymentData.bank_iban || '—'}</span>
                            <button class="ppc-copy-btn" on:click={() => { navigator.clipboard.writeText(paymentData.bank_iban); }}>📋</button>
                        </div>
                        <div class="ppc-bank-row">
                            <span class="ppc-bank-label">SWIFT/BIC</span>
                            <span class="ppc-bank-value">{paymentData.bank_swift || 'TATRSKBX'}</span>
                        </div>
                        <div class="ppc-bank-row">
                            <span class="ppc-bank-label">Banka</span>
                            <span class="ppc-bank-value">{paymentData.bank_name || 'Tatra banka'}</span>
                        </div>
                        <div class="ppc-bank-row highlight">
                            <span class="ppc-bank-label">Variabilný symbol</span>
                            <span class="ppc-bank-value ppc-vs">{paymentData.variable_symbol}</span>
                            <button class="ppc-copy-btn" on:click={() => { navigator.clipboard.writeText(paymentData.variable_symbol); }}>📋</button>
                        </div>
                        <div class="ppc-bank-row">
                            <span class="ppc-bank-label">Suma</span>
                            <span class="ppc-bank-value">{formatNumber(paymentData.amount, 2)} €</span>
                        </div>
                    </div>

                    {#if paymentData.bank_iban}
                    <div class="ppc-qr-section">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SPD*1.0*ACC:{paymentData.bank_iban.replace(/\s/g,'')}*AM:{paymentData.amount}*CC:EUR*X-VS:{paymentData.variable_symbol}*MSG:MegaBuy+kredit" alt="QR platba" class="ppc-qr-img" />
                        <p class="ppc-qr-label">Naskenujte QR kód v bankovej aplikácii</p>
                    </div>
                    {/if}

                    {#if paymentData.sf_proforma_no}
                    <div class="ppc-proforma-info" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
                        <div>
                            <span style="font-weight:600">✅ Zálohová faktúra <strong>{paymentData.sf_proforma_no}</strong> bola vytvorená</span>
                            <p style="margin:4px 0 0;font-size:12px;color:#6b7280">Bola odoslaná na e-mail uvedený vo fakturačných údajoch.</p>
                        </div>
                        {#if paymentData.topup_id}
                        <button style="display:inline-flex;align-items:center;gap:4px;padding:8px 16px;background:#3b82f6;color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer"
                           on:click={() => downloadPDF(paymentData.topup_id, 'proforma', 'ZF-' + paymentData.sf_proforma_no)}>📄 Stiahnuť PDF</button>
                        {/if}
                    </div>
                    {:else}
                    <div style="padding:12px 16px;background:#fef3c7;border:1px solid #fde68a;border-radius:10px;font-size:13px;color:#92400e;margin-bottom:12px">
                        ⚠️ Zálohová faktúra nebola automaticky vytvorená (SuperFaktúra nie je nakonfigurovaná). Po úhrade vás bude kontaktovať administrátor.
                    </div>
                    {/if}

                    <div class="ppc-payment-notice">
                        <strong>ℹ️ Dôležité informácie</strong>
                        <p>Kredit bude pripísaný po úhrade zálohovej faktúry (zvyčajne do 2 pracovných dní).</p>
                        <p>Po pripísaní platby vám automaticky vystavíme riadnu faktúru a pošleme ju na e-mail.</p>
                    </div>
                </div>
            </div>

            {:else}
            <!-- TOPUP FORM -->
            <div class="ppc-topup">
                <!-- Aktuálny kredit info - zvýraznené pri dobíjaní -->
                <div class="ppc-current-credit-info">
                    <span class="ppc-cci-label">Aktuálny kredit:</span>
                    <span class="ppc-cci-value" class:low={currentCredit < 5}>{formatNumber(currentCredit, 2)} €</span>
                </div>

                <div class="ppc-bank-notice">
                    Kredit bude pripísaný po úhrade zálohovej faktúry a pripísaní platby na náš účet (zvyčajne do 2 pracovných dní). Zálohovú faktúru dostanete na e-mail uvedený vo fakturačných údajoch.
                </div>
                
                <h3>Zadajte sumu</h3>
                <div class="ppc-custom-amount" style="margin-top:0;padding-top:0;border-top:none">
                    <div class="ppc-custom-row">
                        <input type="number" class="ppc-custom-input" style="width:120px;font-size:18px;padding:10px 14px" placeholder="€" bind:value={customAmount} on:focus={() => { useCustom = true; selectedPackage = null; }} min="5" step="1">
                        {#if useCustom && Number(customAmount) >= 5}
                            <span class="ppc-custom-info">
                                {#if customBonus > 0}
                                    {customAmount} € + {customBonus}% bonus = <strong>{Number(customAmount) + customBonusAmount} € kredit</strong>
                                {:else}
                                    <strong>{customAmount} € kredit</strong>
                                {/if}
                            </span>
                        {:else if useCustom && customAmount !== '' && Number(customAmount) > 0 && Number(customAmount) < 5}
                            <span style="font-size:13px;color:#dc2626;font-weight:600">⚠️ Minimálna suma je 5 €</span>
                        {/if}
                    </div>
                    {#if useCustom && Number(customAmount) >= 5}
                        <div class="ppc-custom-projected">
                            Po dobití: <strong>{formatNumber(currentCredit + Number(customAmount) + customBonusAmount, 2)} €</strong>
                        </div>
                    {/if}
                    <p class="ppc-custom-note" style="margin-top:6px">Minimálna suma: 5 €. Od 25 € bonus až do 20 %.</p>
                </div>

                <h4 style="font-size:13px;color:#6b7280;margin:20px 0 10px">Alebo vyberte balík</h4>
                <div class="ppc-packages ppc-packages-sm">
                    {#each packages as pkg}
                        <button 
                            class="ppc-package" 
                            class:selected={!useCustom && selectedPackage?.id === pkg.id}
                            class:popular={pkg.popular}
                            on:click={() => { selectedPackage = pkg; useCustom = false; customAmount = ''; }}
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

                {#if myShops.length > 0}
                <div class="ppc-billing-section">
                    <h4>Fakturačné údaje</h4>
                    {#if myShops.length > 1}
                    <select class="ppc-billing-select" bind:value={selectedShopId} style="margin-bottom:10px">
                        {#each myShops as s}
                            <option value={s.id}>
                                {s.shop_name}{s.billing_name ? ` — ${s.billing_name}` : ''}{s.billing_ico ? ` (IČO: ${s.billing_ico})` : ''}
                            </option>
                        {/each}
                    </select>
                    {/if}

                    {#if !editBilling}
                    <div style="padding:12px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;font-size:13px">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                            <span style="font-weight:600;color:#374151">
                                {effectiveBilling.name || 'Bez názvu'}
                                {#if effectiveBilling.source === 'vendor'}
                                    <span style="font-size:10px;padding:2px 6px;background:#fef3c7;color:#92400e;border-radius:4px;margin-left:6px">z profilu</span>
                                {:else}
                                    <span style="font-size:10px;padding:2px 6px;background:#d1fae5;color:#065f46;border-radius:4px;margin-left:6px">obchod</span>
                                {/if}
                            </span>
                            <button style="font-size:11px;color:#3b82f6;background:none;border:none;cursor:pointer;font-weight:600" on:click={startEditBilling}>✏️ Upraviť</button>
                        </div>
                        <div style="color:#64748b;line-height:1.7">
                            {#if effectiveBilling.ico}IČO: {effectiveBilling.ico}{/if}
                            {#if effectiveBilling.dic} · DIČ: {effectiveBilling.dic}{/if}
                            {#if effectiveBilling.ic_dph} · IČ DPH: {effectiveBilling.ic_dph}{/if}
                            {#if effectiveBilling.address}<br>{effectiveBilling.address}, {effectiveBilling.zip} {effectiveBilling.city}{/if}
                            {#if effectiveBilling.email}<br>📧 {effectiveBilling.email}{/if}
                        </div>
                    </div>
                    {:else}
                    <div style="padding:14px;background:#eff6ff;border:1px solid #93c5fd;border-radius:10px">
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
                            <div><label style="font-size:11px;font-weight:600;display:block;margin-bottom:2px">Obchodné meno *</label>
                                <input type="text" bind:value={billingForm.billing_name} style="width:100%;padding:7px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;box-sizing:border-box"></div>
                            <div><label style="font-size:11px;font-weight:600;display:block;margin-bottom:2px">IČO *</label>
                                <input type="text" bind:value={billingForm.billing_ico} style="width:100%;padding:7px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;box-sizing:border-box"></div>
                            <div><label style="font-size:11px;font-weight:600;display:block;margin-bottom:2px">DIČ</label>
                                <input type="text" bind:value={billingForm.billing_dic} style="width:100%;padding:7px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;box-sizing:border-box"></div>
                            <div><label style="font-size:11px;font-weight:600;display:block;margin-bottom:2px">IČ DPH</label>
                                <input type="text" bind:value={billingForm.billing_ic_dph} style="width:100%;padding:7px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;box-sizing:border-box"></div>
                            <div><label style="font-size:11px;font-weight:600;display:block;margin-bottom:2px">Ulica a číslo</label>
                                <input type="text" bind:value={billingForm.billing_address} style="width:100%;padding:7px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;box-sizing:border-box"></div>
                            <div style="display:grid;grid-template-columns:100px 1fr;gap:6px">
                                <div><label style="font-size:11px;font-weight:600;display:block;margin-bottom:2px">PSČ</label>
                                    <input type="text" bind:value={billingForm.billing_zip} style="width:100%;padding:7px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;box-sizing:border-box"></div>
                                <div><label style="font-size:11px;font-weight:600;display:block;margin-bottom:2px">Mesto</label>
                                    <input type="text" bind:value={billingForm.billing_city} style="width:100%;padding:7px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;box-sizing:border-box"></div>
                            </div>
                            <div style="grid-column:1/-1"><label style="font-size:11px;font-weight:600;display:block;margin-bottom:2px">Fakturačný e-mail</label>
                                <input type="email" bind:value={billingForm.billing_email} style="width:100%;padding:7px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;box-sizing:border-box"></div>
                        </div>
                        <div style="display:flex;gap:8px;align-items:center">
                            <button class="ppc-submit-btn" style="max-width:180px;padding:8px 16px;font-size:13px" on:click={saveBilling} disabled={billingSaving}>{billingSaving ? 'Ukladám...' : '💾 Uložiť'}</button>
                            <button style="font-size:12px;background:none;border:1px solid #d1d5db;padding:7px 14px;border-radius:6px;cursor:pointer" on:click={() => editBilling = false}>Zrušiť</button>
                            {#if billingMsg}<span style="font-size:12px;font-weight:500;color:{billingMsg.type === 'success' ? '#16a34a' : '#dc2626'}">{billingMsg.text}</span>{/if}
                        </div>
                    </div>
                    {/if}
                </div>
                {/if}
                
                <button class="ppc-submit-btn" on:click={requestTopup} disabled={loading || (!selectedPackage && !useCustom) || (useCustom && Number(customAmount) < 5)}>
                    {loading ? 'Spracovávam...' : `Prejsť na platbu ${selectedAmount > 0 ? selectedAmount + ' €' : ''}`}
                </button>
            </div>
            {/if}
            
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
                <!-- TOPUPS / INVOICES -->
                {#if topups.length > 0}
                <div style="margin-bottom:28px">
                    <h3 style="margin-bottom:14px">📋 Dobíjania kreditu</h3>
                    <div style="border:1px solid #e5e7eb;border-radius:10px;overflow-x:auto">
                        <table style="width:100%;border-collapse:collapse;min-width:700px">
                            <thead>
                                <tr style="background:#f8fafc">
                                    <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase">Dátum</th>
                                    <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase">Suma</th>
                                    <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase">Kredit</th>
                                    <th style="padding:10px 8px;text-align:center;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase">VS</th>
                                    <th style="padding:10px 8px;text-align:center;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase">Stav</th>
                                    <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase">Faktúry</th>
                                    <th style="padding:10px 8px;text-align:center;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each topups as t}
                                <tr style="border-top:1px solid #f1f5f9;cursor:pointer;transition:background .15s" 
                                    class:selected-row={selectedTopup?.id === t.id}
                                    on:click={() => loadTopupDetail(t.id)}>
                                    <td style="padding:10px 12px;font-size:12px;color:#6b7280;white-space:nowrap">{formatDate(t.created_at)}</td>
                                    <td style="padding:10px 12px;text-align:right;font-weight:700;color:#1f2937">{formatNumber(t.amount, 2)} €</td>
                                    <td style="padding:10px 12px;text-align:right;font-weight:600;color:#059669">
                                        {formatNumber(t.total_credit, 2)} €
                                        {#if t.bonus_pct > 0}<span style="font-size:10px;color:#10b981;margin-left:4px">+{t.bonus_pct}%</span>{/if}
                                    </td>
                                    <td style="padding:10px 8px;text-align:center"><code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:11px">{t.variable_symbol}</code></td>
                                    <td style="padding:10px 8px;text-align:center">
                                        {#if t.status === 'pending'}
                                            <span style="padding:3px 10px;border-radius:10px;font-size:10px;font-weight:600;background:#fef3c7;color:#92400e">Čaká na platbu</span>
                                        {:else if t.status === 'paid'}
                                            <span style="padding:3px 10px;border-radius:10px;font-size:10px;font-weight:600;background:#d1fae5;color:#065f46">Zaplatené</span>
                                        {:else}
                                            <span style="padding:3px 10px;border-radius:10px;font-size:10px;font-weight:600;background:#f1f5f9;color:#6b7280">{t.status}</span>
                                        {/if}
                                    </td>
                                    <td style="padding:10px 12px;text-align:center;white-space:nowrap" on:click|stopPropagation>
                                        {#if t.sf_proforma_no}
                                            <button style="font-size:11px;color:#3b82f6;background:#eff6ff;border:1px solid #bfdbfe;padding:3px 8px;border-radius:5px;cursor:pointer;margin-right:4px"
                                                on:click={() => downloadPDF(t.id, 'proforma', 'ZF-' + t.sf_proforma_no)}>
                                                📄 ZF
                                            </button>
                                        {/if}
                                        {#if t.sf_invoice_no}
                                            <button style="font-size:11px;color:#059669;background:#ecfdf5;border:1px solid #a7f3d0;padding:3px 8px;border-radius:5px;cursor:pointer"
                                                on:click={() => downloadPDF(t.id, 'invoice', 'FA-' + t.sf_invoice_no)}>
                                                📄 FA
                                            </button>
                                        {/if}
                                        {#if !t.sf_proforma_no && !t.sf_invoice_no}
                                            <span style="color:#94a3b8;font-size:11px">—</span>
                                        {/if}
                                    </td>
                                    <td style="padding:10px 8px;text-align:center;color:#94a3b8;font-size:14px">›</td>
                                </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>

                    <!-- TOPUP DETAIL PANEL -->
                    {#if selectedTopup}
                    <div style="margin-top:16px;background:#fff;border:2px solid {selectedTopup.status === 'paid' ? '#10b981' : '#f59e0b'};border-radius:12px;padding:20px;position:relative">
                        <button style="position:absolute;top:12px;right:16px;background:none;border:none;font-size:18px;color:#94a3b8;cursor:pointer" on:click={() => selectedTopup = null}>✕</button>
                        
                        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
                            <span style="font-size:28px">{selectedTopup.status === 'paid' ? '✅' : '🏦'}</span>
                            <div>
                                <h4 style="margin:0;font-size:16px;color:#1f2937">
                                    {selectedTopup.status === 'paid' ? 'Zaplatené' : 'Čaká na platbu'} — {formatNumber(selectedTopup.amount, 2)} €
                                </h4>
                                <p style="margin:2px 0 0;font-size:12px;color:#6b7280">
                                    {formatDate(selectedTopup.created_at)}
                                    {#if selectedTopup.paid_at} · Zaplatené: {formatDate(selectedTopup.paid_at)}{/if}
                                    {#if selectedTopup.bonus_pct > 0} · Bonus +{selectedTopup.bonus_pct}% = {formatNumber(selectedTopup.total_credit, 2)} € kredit{/if}
                                </p>
                            </div>
                        </div>

                        {#if selectedTopup.status === 'pending' && selectedTopup.bank_iban}
                        <!-- PAYMENT DETAILS -->
                        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:16px">
                            <div style="display:flex;padding:10px 16px;border-bottom:1px solid #f1f5f9;align-items:center">
                                <span style="font-size:12px;color:#6b7280;width:130px;flex-shrink:0">Názov účtu</span>
                                <span style="font-size:13px;font-weight:600;color:#1f2937">{selectedTopup.bank_account_name || 'Megabuy s.r.o.'}</span>
                            </div>
                            <div style="display:flex;padding:10px 16px;border-bottom:1px solid #f1f5f9;align-items:center">
                                <span style="font-size:12px;color:#6b7280;width:130px;flex-shrink:0">IBAN</span>
                                <span style="font-size:13px;font-weight:600;color:#1f2937;font-family:monospace;letter-spacing:1px">{selectedTopup.bank_iban}</span>
                                <button style="margin-left:8px;background:none;border:1px solid #e2e8f0;border-radius:4px;padding:2px 6px;cursor:pointer;font-size:11px" on:click={() => navigator.clipboard.writeText(selectedTopup.bank_iban)}>📋</button>
                            </div>
                            <div style="display:flex;padding:10px 16px;border-bottom:1px solid #f1f5f9;align-items:center">
                                <span style="font-size:12px;color:#6b7280;width:130px;flex-shrink:0">SWIFT/BIC</span>
                                <span style="font-size:13px;font-weight:600;color:#1f2937">{selectedTopup.bank_swift || 'TATRSKBX'}</span>
                            </div>
                            <div style="display:flex;padding:10px 16px;border-bottom:1px solid #f1f5f9;align-items:center;background:#fffbeb">
                                <span style="font-size:12px;color:#6b7280;width:130px;flex-shrink:0">Variabilný symbol</span>
                                <span style="font-size:15px;font-weight:700;color:#b45309;font-family:monospace">{selectedTopup.variable_symbol}</span>
                                <button style="margin-left:8px;background:none;border:1px solid #e2e8f0;border-radius:4px;padding:2px 6px;cursor:pointer;font-size:11px" on:click={() => navigator.clipboard.writeText(selectedTopup.variable_symbol)}>📋</button>
                            </div>
                            <div style="display:flex;padding:10px 16px;align-items:center">
                                <span style="font-size:12px;color:#6b7280;width:130px;flex-shrink:0">Suma</span>
                                <span style="font-size:14px;font-weight:700;color:#1f2937">{formatNumber(selectedTopup.amount, 2)} €</span>
                            </div>
                        </div>

                        <!-- QR CODE -->
                        <div style="text-align:center;padding:16px;background:#fff;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:16px">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SPD*1.0*ACC:{selectedTopup.bank_iban?.replace(/\s/g,'')}*AM:{selectedTopup.amount}*CC:EUR*X-VS:{selectedTopup.variable_symbol}*MSG:MegaBuy+kredit" alt="QR platba" style="width:180px;height:180px;border-radius:8px" />
                            <p style="font-size:11px;color:#6b7280;margin:10px 0 0">Naskenujte QR kód v bankovej aplikácii</p>
                        </div>
                        {/if}

                        <!-- INVOICES -->
                        <div style="display:flex;gap:10px;flex-wrap:wrap">
                            {#if selectedTopup.sf_proforma_no}
                                <button style="display:flex;align-items:center;gap:6px;padding:8px 16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;color:#1d4ed8"
                                    on:click={() => downloadPDF(selectedTopup.id, 'proforma', 'ZF-' + selectedTopup.sf_proforma_no)}>
                                    📄 Stiahnuť zálohovú faktúru ({selectedTopup.sf_proforma_no})
                                </button>
                            {/if}
                            {#if selectedTopup.sf_invoice_no}
                                <button style="display:flex;align-items:center;gap:6px;padding:8px 16px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;color:#065f46"
                                    on:click={() => downloadPDF(selectedTopup.id, 'invoice', 'FA-' + selectedTopup.sf_invoice_no)}>
                                    📄 Stiahnuť faktúru ({selectedTopup.sf_invoice_no})
                                </button>
                            {/if}
                            {#if !selectedTopup.sf_proforma_no && !selectedTopup.sf_invoice_no}
                                <p style="font-size:12px;color:#94a3b8;margin:0">SuperFaktúra nie je nakonfigurovaná — faktúry nie sú dostupné.</p>
                            {/if}
                        </div>
                    </div>
                    {/if}
                </div>
                {/if}

                <!-- TRANSACTIONS -->
                <h3>💳 História transakcií</h3>
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

    /* Smaller packages variant */
    .ppc-packages-sm { grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 12px; }
    .ppc-packages-sm .ppc-package { padding: 10px 8px; border-radius: 8px; }
    .ppc-packages-sm .ppc-package-amount { font-size: 18px; }
    .ppc-packages-sm .ppc-package-bonus { font-size: 11px; margin: 2px 0; }
    .ppc-packages-sm .ppc-package-total { font-size: 10px; margin-top: 4px; }
    .ppc-packages-sm .ppc-package-badge { font-size: 8px; padding: 2px 6px; top: -8px; }
    
    /* Payment */
    .ppc-payment-method { margin: 24px 0; }
    .ppc-payment-method h4 { font-size: 14px; font-weight: 600; margin-bottom: 12px; }
    .ppc-payment-options { display: flex; gap: 10px; }
    
    .ppc-payment-option {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        background: #f8fafc;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 13px;
    }
    
    .ppc-payment-option.selected { border-color: #3b82f6; background: #eff6ff; }
    .ppc-payment-option input { display: none; }
    .ppc-payment-icon { font-size: 18px; }
    .ppc-payment-label { font-weight: 500; font-size: 13px; }
    
    .ppc-submit-btn {
        max-width: 320px;
        width: 100%;
        padding: 11px 24px;
        background: linear-gradient(135deg, #c4956a, #b8875c);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 2px 8px rgba(196,149,106,0.25);
    }
    
    .ppc-submit-btn:hover:not(:disabled) { box-shadow: 0 4px 14px rgba(196,149,106,0.35); }
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
    
    tr.selected-row { background: #eff6ff !important; }
    tr:hover:not(.selected-row) { background: #f8fafc; }
    
    .ppc-transactions-table { overflow-x: auto; }
    .ppc-transactions-table table { width: 100%; border-collapse: collapse; }
    .ppc-transactions-table th, .ppc-transactions-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    .ppc-transactions-table th { font-weight: 600; color: #374151; background: #f8fafc; }
    
    .ppc-tx-type { display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 500; }
    .ppc-tx-type.topup { background: #d1fae5; color: #065f46; }
    .ppc-tx-type.click { background: #fee2e2; color: #991b1b; }
    
    .ppc-tx-amount.positive { color: #10b981; font-weight: 600; }
    .ppc-tx-amount.negative { color: #ef4444; font-weight: 600; }
    
    /* Payment Page */
    .ppc-bank-notice { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 14px; font-size: 12px; color: #78716c; line-height: 1.6; margin-bottom: 16px; }
    .ppc-bank-notice strong { color: #92400e; }
    .ppc-billing-section { margin-bottom: 16px; }
    .ppc-billing-section h4 { font-size: 13px; font-weight: 600; color: #374151; margin: 0 0 6px; }
    .ppc-billing-select { width: 100%; padding: 10px 12px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 12px; color: #1f2937; background: #fff; cursor: pointer; transition: border-color 0.2s; }
    .ppc-billing-select:focus { border-color: #c4956a; outline: none; box-shadow: 0 0 0 3px rgba(196,149,106,0.12); }
    .ppc-payment-page { max-width: 560px; }
    .ppc-back-btn { background: none; border: none; color: #6b7280; font-size: 13px; cursor: pointer; padding: 0; margin-bottom: 16px; display: flex; align-items: center; gap: 4px; }
    .ppc-back-btn:hover { color: #c4956a; }
    .ppc-payment-summary { text-align: center; margin-bottom: 24px; }
    .ppc-payment-icon { font-size: 36px; margin-bottom: 8px; }
    .ppc-payment-summary h3 { font-size: 20px; font-weight: 700; margin: 0 0 4px; color: #1f2937; }
    .ppc-payment-subtitle { font-size: 13px; color: #6b7280; margin: 0; }
    
    .ppc-payment-amount-box { text-align: center; padding: 16px; background: #f8fafc; border-radius: 10px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
    .ppc-payment-label-sm { font-size: 11px; color: #6b7280; display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .ppc-payment-amount-big { font-size: 32px; font-weight: 800; color: #1f2937; display: block; }
    .ppc-payment-bonus-info { font-size: 12px; color: #059669; display: block; margin-top: 4px; }
    
    .ppc-payment-bank-details { background: #fff; border: 1.5px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 20px; }
    .ppc-bank-row { display: flex; align-items: center; padding: 10px 16px; border-bottom: 1px solid #f1f5f9; }
    .ppc-bank-row:last-child { border-bottom: none; }
    .ppc-bank-row.highlight { background: #fffbeb; }
    .ppc-bank-label { font-size: 12px; color: #6b7280; width: 130px; flex-shrink: 0; }
    .ppc-bank-value { font-size: 13px; font-weight: 600; color: #1f2937; flex: 1; }
    .ppc-iban { font-family: monospace; letter-spacing: 1px; font-size: 12px; }
    .ppc-vs { font-family: monospace; font-size: 15px; color: #b45309; }
    .ppc-copy-btn { background: none; border: 1px solid #e2e8f0; border-radius: 4px; padding: 2px 6px; cursor: pointer; font-size: 11px; flex-shrink: 0; }
    .ppc-copy-btn:hover { background: #f1f5f9; }
    
    .ppc-qr-section { text-align: center; margin-bottom: 20px; padding: 16px; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; }
    .ppc-qr-img { width: 180px; height: 180px; margin: 0 auto; display: block; border-radius: 8px; }
    .ppc-qr-label { font-size: 11px; color: #6b7280; margin: 10px 0 0; }
    
    .ppc-proforma-info { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 14px; font-size: 12px; color: #16a34a; margin-bottom: 16px; text-align: center; }
    
    .ppc-payment-notice { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; }
    .ppc-payment-notice strong { font-size: 13px; color: #1f2937; display: block; margin-bottom: 8px; }
    .ppc-payment-notice p { font-size: 12px; color: #6b7280; margin: 0 0 6px; line-height: 1.5; }
    .ppc-payment-notice p:last-child { margin-bottom: 0; }

    @media (max-width: 768px) {
        .ppc-tabs { overflow-x: auto; }
        .ppc-payment-options { flex-direction: column; }
        .ppc-packages { grid-template-columns: repeat(2, 1fr); }
        .ppc-bank-label { width: 100px; font-size: 11px; }
        .ppc-payment-amount-big { font-size: 26px; }
    }
</style>
