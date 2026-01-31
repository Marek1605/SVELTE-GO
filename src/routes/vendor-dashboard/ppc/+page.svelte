<script>
    import { getContext, onMount } from 'svelte';
    import { browser } from '$app/environment';
    
    const shopStore = getContext('shop');
    const API_BASE = getContext('API_BASE');
    
    $: shop = $shopStore;
    $: creditBalance = shop?.credit_balance || 0;
    
    let activeTab = 'overview';
    let loading = true;
    let transactions = [];
    let stats = { total_spent: 0, total_clicks: 0, avg_cpc: 0 };
    
    const creditPackages = [
        { amount: 10, bonus: 0, price: 10, popular: false },
        { amount: 25, bonus: 5, price: 25, popular: false },
        { amount: 50, bonus: 15, price: 50, popular: true },
        { amount: 100, bonus: 35, price: 100, popular: false },
        { amount: 200, bonus: 80, price: 200, popular: false },
    ];
    
    onMount(async () => {
        if (!browser) return;
        loading = false;
    });
    
    function formatNumber(num, decimals = 2) {
        return (num || 0).toLocaleString('sk-SK', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }
    
    async function buyCredit(pkg) {
        alert(`Dobíjanie ${pkg.amount + pkg.bonus} € za ${pkg.price} € - platobná brána bude čoskoro dostupná`);
    }
</script>

<div class="ppc-page">
    <div class="ppc-header">
        <h1>💰 PPC & Kredit</h1>
        <p>Spravujte svoj kredit a sledujte PPC výdavky</p>
    </div>
    
    <div class="ppc-credit-bar">
        <div class="ppc-credit-main">
            <div class="ppc-credit-icon">💳</div>
            <div class="ppc-credit-info">
                <span class="ppc-credit-label">Aktuálny kredit</span>
                <span class="ppc-credit-value" class:low={creditBalance < 5}>{formatNumber(creditBalance)} €</span>
            </div>
        </div>
        <div class="ppc-credit-stats">
            <div class="ppc-mini-stat">
                <span class="ppc-mini-label">Minuté</span>
                <span class="ppc-mini-value">{formatNumber(stats.total_spent)} €</span>
            </div>
            <div class="ppc-mini-stat">
                <span class="ppc-mini-label">Kliky</span>
                <span class="ppc-mini-value">{formatNumber(stats.total_clicks, 0)}</span>
            </div>
        </div>
    </div>
    
    <div class="ppc-tabs">
        <button class="ppc-tab" class:active={activeTab === 'overview'} on:click={() => activeTab = 'overview'}>📊 Prehľad</button>
        <button class="ppc-tab" class:active={activeTab === 'topup'} on:click={() => activeTab = 'topup'}>➕ Dobiť kredit</button>
        <button class="ppc-tab" class:active={activeTab === 'history'} on:click={() => activeTab = 'history'}>📋 História</button>
    </div>
    
    {#if activeTab === 'overview'}
        <div class="ppc-section">
            <h3>📈 Ako funguje PPC?</h3>
            <div class="ppc-steps">
                <div class="ppc-step"><div class="ppc-step-num">1</div><div><h4>Nabijete kredit</h4><p>Vyberte balíček</p></div></div>
                <div class="ppc-step"><div class="ppc-step-num">2</div><div><h4>Zákazník klikne</h4><p>Za klik sa strhne poplatok</p></div></div>
                <div class="ppc-step"><div class="ppc-step-num">3</div><div><h4>Sledujete výsledky</h4><p>Kliky, konverzie, ROI</p></div></div>
            </div>
        </div>
    {/if}
    
    {#if activeTab === 'topup'}
        <div class="ppc-section">
            <h3>💳 Vyberte si balíček</h3>
            <div class="ppc-packages">
                {#each creditPackages as pkg}
                    <div class="ppc-package" class:popular={pkg.popular}>
                        {#if pkg.popular}<div class="ppc-package-badge">Najobľúbenejší</div>{/if}
                        <div class="ppc-package-amount">{pkg.amount + pkg.bonus} €</div>
                        {#if pkg.bonus > 0}<div class="ppc-package-bonus">+{pkg.bonus} € bonus</div>{/if}
                        <div class="ppc-package-price">za {pkg.price} €</div>
                        <button class="ppc-package-btn" on:click={() => buyCredit(pkg)}>Kúpiť</button>
                    </div>
                {/each}
            </div>
        </div>
    {/if}
    
    {#if activeTab === 'history'}
        <div class="ppc-section">
            <div class="ppc-empty"><div class="ppc-empty-icon">📋</div><p>Zatiaľ žiadne transakcie</p></div>
        </div>
    {/if}
</div>

<style>
    .ppc-page { max-width: 1200px; margin: 0 auto; }
    .ppc-header { margin-bottom: 24px; }
    .ppc-header h1 { font-size: 28px; font-weight: 700; color: #1f2937; margin: 0 0 8px; }
    .ppc-header p { color: #6b7280; margin: 0; }
    
    .ppc-credit-bar {
        display: flex; justify-content: space-between; align-items: center;
        background: linear-gradient(135deg, #1e40af, #3b82f6);
        border-radius: 16px; padding: 24px; color: white; margin-bottom: 24px;
        flex-wrap: wrap; gap: 20px;
    }
    .ppc-credit-main { display: flex; align-items: center; gap: 16px; }
    .ppc-credit-icon { font-size: 40px; }
    .ppc-credit-label { font-size: 14px; opacity: 0.9; display: block; }
    .ppc-credit-value { font-size: 36px; font-weight: 700; }
    .ppc-credit-value.low { color: #fbbf24; }
    .ppc-credit-stats { display: flex; gap: 32px; }
    .ppc-mini-stat { text-align: center; }
    .ppc-mini-label { font-size: 12px; opacity: 0.8; display: block; }
    .ppc-mini-value { font-size: 20px; font-weight: 600; }
    
    .ppc-tabs { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
    .ppc-tab { padding: 12px 20px; background: white; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; font-weight: 500; cursor: pointer; }
    .ppc-tab:hover { background: #f9fafb; }
    .ppc-tab.active { background: #3b82f6; color: white; border-color: #3b82f6; }
    
    .ppc-section { background: white; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .ppc-section h3 { font-size: 18px; font-weight: 600; margin: 0 0 20px; }
    
    .ppc-steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; }
    .ppc-step { display: flex; gap: 16px; }
    .ppc-step-num { width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
    .ppc-step h4 { margin: 0 0 4px; font-size: 15px; }
    .ppc-step p { margin: 0; font-size: 13px; color: #6b7280; }
    
    .ppc-packages { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; }
    .ppc-package { background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 12px; padding: 24px; text-align: center; position: relative; }
    .ppc-package:hover { border-color: #3b82f6; }
    .ppc-package.popular { border-color: #3b82f6; background: #f0f9ff; }
    .ppc-package-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #3b82f6; color: white; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; }
    .ppc-package-amount { font-size: 32px; font-weight: 700; color: #1f2937; }
    .ppc-package-bonus { color: #10b981; font-size: 14px; font-weight: 500; margin: 4px 0; }
    .ppc-package-price { color: #6b7280; font-size: 14px; margin-bottom: 16px; }
    .ppc-package-btn { width: 100%; padding: 10px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .ppc-package-btn:hover { background: #2563eb; }
    
    .ppc-empty { text-align: center; padding: 48px; }
    .ppc-empty-icon { font-size: 48px; opacity: 0.5; margin-bottom: 12px; }
    
    @media (max-width: 768px) {
        .ppc-credit-bar { flex-direction: column; text-align: center; }
        .ppc-packages { grid-template-columns: 1fr 1fr; }
    }
</style>
