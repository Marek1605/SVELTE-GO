<script>
    import { getContext, onMount } from 'svelte';
    import { browser } from '$app/environment';
    
    const shopStore = getContext('shop');
    const API_BASE = getContext('API_BASE');
    
    $: shop = $shopStore;
    
    let activeTab = 'html';
    let loading = true;
    let stats = {
        total_conversions: 0,
        total_revenue: 0,
        conversion_rate: 0,
        avg_order_value: 0,
        conversions_change: 12.5
    };
    let recentConversions = [];
    
    $: trackingCode = shop?.id ? `MKP-${shop.id.substring(0, 8).toUpperCase()}` : 'MKP-XXXXXXXX';
    $: trackingUrl = API_BASE ? `${API_BASE}/track/conversion` : 'https://megaprice.sk/api/v1/track/conversion';
    
    onMount(async () => {
        if (!browser) return;
        await loadConversionStats();
        loading = false;
    });
    
    async function loadConversionStats() {
        const token = localStorage.getItem('vendor_token');
        if (!token) return;
        
        try {
            const res = await fetch(`${API_BASE}/vendor/analytics`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.data) {
                stats = { ...stats, ...data.data };
                recentConversions = data.data.recent_conversions || [];
            }
        } catch (e) {
            console.log('Analytics endpoint not available yet');
        }
    }
    
    function copyToClipboard(elementId) {
        const el = document.getElementById(elementId);
        if (el) {
            navigator.clipboard.writeText(el.value || el.textContent);
            showToast('Skopírované do schránky!');
        }
    }
    
    function copyCode(codeId) {
        const el = document.getElementById(codeId);
        if (el) {
            navigator.clipboard.writeText(el.textContent);
            showToast('Kód skopírovaný!');
        }
    }
    
    let toastMessage = '';
    let showToastVisible = false;
    
    function showToast(msg) {
        toastMessage = msg;
        showToastVisible = true;
        setTimeout(() => showToastVisible = false, 2000);
    }
    
    function formatNumber(num, decimals = 0) {
        return (num || 0).toLocaleString('sk-SK', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }
    
    function formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('sk-SK', { 
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    }
</script>

<div class="conv-page">
    <!-- Toast -->
    {#if showToastVisible}
        <div class="conv-toast">{toastMessage}</div>
    {/if}
    
    <!-- Stats Cards -->
    <div class="conv-stats">
        <div class="conv-stat conv-stat-success">
            <div class="conv-stat-icon">✅</div>
            <div class="conv-stat-content">
                <span class="conv-stat-label">Celkom konverzií</span>
                <span class="conv-stat-value">{formatNumber(stats.total_conversions)}</span>
                <span class="conv-stat-change positive">↑ {stats.conversions_change}%</span>
            </div>
        </div>
        
        <div class="conv-stat">
            <div class="conv-stat-icon">💰</div>
            <div class="conv-stat-content">
                <span class="conv-stat-label">Celkové tržby</span>
                <span class="conv-stat-value">{formatNumber(stats.total_revenue, 2)} €</span>
                <span class="conv-stat-note">z konverzií</span>
            </div>
        </div>
        
        <div class="conv-stat">
            <div class="conv-stat-icon">📊</div>
            <div class="conv-stat-content">
                <span class="conv-stat-label">Konverzný pomer</span>
                <span class="conv-stat-value">{formatNumber(stats.conversion_rate, 1)}%</span>
                <span class="conv-stat-note">z klikov</span>
            </div>
        </div>
        
        <div class="conv-stat">
            <div class="conv-stat-icon">🛒</div>
            <div class="conv-stat-content">
                <span class="conv-stat-label">Priem. objednávka</span>
                <span class="conv-stat-value">{formatNumber(stats.avg_order_value, 2)} €</span>
            </div>
        </div>
    </div>
    
    <!-- Tracking Setup Card -->
    <div class="conv-card conv-tracking-card">
        <div class="conv-card-header conv-card-header-warning">
            <h3>🔧 Nastavenie merania konverzií</h3>
            <span class="conv-badge">Dôležité</span>
        </div>
        <div class="conv-card-body">
            <p class="conv-intro">
                Pre správne meranie konverzií je potrebné vložiť tracking kód na vašu <strong>"Thank You" stránku</strong> 
                (stránka po úspešnom nákupe vo vašom e-shope).
            </p>
            
            <!-- Credentials -->
            <div class="conv-credentials">
                <div class="conv-credential">
                    <label>Váš Tracking Code</label>
                    <div class="conv-input-group">
                        <input type="text" value={trackingCode} readonly id="tracking-code" class="conv-input">
                        <button class="conv-copy-btn" on:click={() => copyToClipboard('tracking-code')}>📋</button>
                    </div>
                </div>
                <div class="conv-credential">
                    <label>Tracking URL</label>
                    <div class="conv-input-group">
                        <input type="text" value={trackingUrl} readonly id="tracking-url" class="conv-input">
                        <button class="conv-copy-btn" on:click={() => copyToClipboard('tracking-url')}>📋</button>
                    </div>
                </div>
            </div>
            
            <!-- Platform Tabs -->
            <div class="conv-tabs">
                <button class="conv-tab" class:active={activeTab === 'html'} on:click={() => activeTab = 'html'}>
                    🌐 HTML / Univerzálne
                </button>
                <button class="conv-tab" class:active={activeTab === 'woocommerce'} on:click={() => activeTab = 'woocommerce'}>
                    🛒 WooCommerce
                </button>
                <button class="conv-tab" class:active={activeTab === 'shoptet'} on:click={() => activeTab = 'shoptet'}>
                    🏪 Shoptet
                </button>
                <button class="conv-tab" class:active={activeTab === 'gtm'} on:click={() => activeTab = 'gtm'}>
                    📊 Google Tag Manager
                </button>
            </div>
            
            <!-- HTML Tab -->
            {#if activeTab === 'html'}
                <div class="conv-code-section">
                    <div class="conv-code-header">
                        <span>Tracking skript pre Thank You stránku</span>
                        <button class="conv-copy-btn conv-copy-btn-light" on:click={() => copyCode('code-html')}>📋 Kopírovať kód</button>
                    </div>
                    <pre id="code-html" class="conv-code">&lt;!-- MegaPrice.sk Conversion Tracking --&gt;
&lt;script&gt;
(function() {'{'}
    var config = {'{'}
        trackingCode: '{trackingCode}',
        trackingUrl: '{trackingUrl}'
    {'}'};

    // ⚠️ DÔLEŽITÉ: Nahraďte tieto hodnoty skutočnými dátami z objednávky
    var orderData = {'{'}
        order_id: 'ORDER-12345',           // ID vašej objednávky
        customer_email: 'zakaznik@email.sk',
        customer_name: 'Ján Novák',
        order_value: 49.99                  // Celková suma objednávky v EUR
    {'}'};

    if (orderData.order_id && orderData.customer_email) {'{'}
        fetch(config.trackingUrl, {'{'}
            method: 'POST',
            headers: {'{'} 'Content-Type': 'application/json' {'}'},
            body: JSON.stringify({'{'}
                tracking_code: config.trackingCode,
                ...orderData
            {'}'})
        {'}'}).then(r => r.json())
          .then(d => console.log('MegaPrice: Conversion tracked', d))
          .catch(e => console.error('MegaPrice: Error', e));
    {'}'}
{'}'})();
&lt;/script&gt;</pre>
                </div>
            {/if}
            
            <!-- WooCommerce Tab -->
            {#if activeTab === 'woocommerce'}
                <div class="conv-code-section">
                    <div class="conv-code-header">
                        <span>Pridajte do functions.php vašej témy</span>
                        <button class="conv-copy-btn conv-copy-btn-light" on:click={() => copyCode('code-woo')}>📋 Kopírovať kód</button>
                    </div>
                    <pre id="code-woo" class="conv-code">&lt;?php
// MegaPrice.sk Conversion Tracking pre WooCommerce
add_action('woocommerce_thankyou', 'megaprice_track_conversion', 10, 1);
function megaprice_track_conversion($order_id) {'{'}
    if (!$order_id) return;
    
    $order = wc_get_order($order_id);
    if (!$order) return;
    
    $tracking_code = '{trackingCode}';
    $tracking_url = '{trackingUrl}';
    ?&gt;
    &lt;script&gt;
    fetch('&lt;?php echo $tracking_url; ?&gt;', {'{'}
        method: 'POST',
        headers: {'{'} 'Content-Type': 'application/json' {'}'},
        body: JSON.stringify({'{'}
            tracking_code: '&lt;?php echo $tracking_code; ?&gt;',
            order_id: '&lt;?php echo $order->get_order_number(); ?&gt;',
            customer_email: '&lt;?php echo $order->get_billing_email(); ?&gt;',
            customer_name: '&lt;?php echo $order->get_billing_first_name() . " " . $order->get_billing_last_name(); ?&gt;',
            order_value: &lt;?php echo $order->get_total(); ?&gt;
        {'}'})
    {'}'});
    &lt;/script&gt;
    &lt;?php
{'}'}</pre>
                </div>
            {/if}
            
            <!-- Shoptet Tab -->
            {#if activeTab === 'shoptet'}
                <div class="conv-code-section">
                    <div class="conv-code-header">
                        <span>Pre Shoptet - vložte do "Vlastný kód na ďakovnej stránke"</span>
                        <button class="conv-copy-btn conv-copy-btn-light" on:click={() => copyCode('code-shoptet')}>📋 Kopírovať kód</button>
                    </div>
                    <pre id="code-shoptet" class="conv-code">&lt;!-- MegaPrice.sk Conversion Tracking pre Shoptet --&gt;
&lt;script&gt;
(function() {'{'}
    var config = {'{'}
        trackingCode: '{trackingCode}',
        trackingUrl: '{trackingUrl}'
    {'}'};

    // Shoptet premenné - automaticky nahradené systémom
    var orderData = {'{'}
        order_id: '{'{'}orderCode{'}'}',
        customer_email: '{'{'}customerEmail{'}'}',
        customer_name: '{'{'}customerName{'}'}',
        order_value: parseFloat('{'{'}orderPriceWithVat{'}'}'.replace(',', '.'))
    {'}'};

    if (orderData.order_id && orderData.customer_email) {'{'}
        fetch(config.trackingUrl, {'{'}
            method: 'POST',
            headers: {'{'} 'Content-Type': 'application/json' {'}'},
            body: JSON.stringify({'{'}
                tracking_code: config.trackingCode,
                ...orderData
            {'}'})
        {'}'});
    {'}'}
{'}'})();
&lt;/script&gt;</pre>
                    <div class="conv-note conv-note-info">
                        <strong>📍 Kde nájsť v Shoptete:</strong><br>
                        Nastavenia → Nastavenia eshopu → Vzhľad a obsah → Vlastný kód → Thank you stránka
                    </div>
                </div>
            {/if}
            
            <!-- GTM Tab -->
            {#if activeTab === 'gtm'}
                <div class="conv-code-section">
                    <div class="conv-code-header">
                        <span>Google Tag Manager - Custom HTML Tag</span>
                        <button class="conv-copy-btn conv-copy-btn-light" on:click={() => copyCode('code-gtm')}>📋 Kopírovať kód</button>
                    </div>
                    <pre id="code-gtm" class="conv-code">&lt;script&gt;
// MegaPrice.sk Conversion Tracking - GTM
(function() {'{'}
    var config = {'{'}
        trackingCode: '{trackingCode}',
        trackingUrl: '{trackingUrl}'
    {'}'};

    // Použite dataLayer premenné z vášho GTM
    var orderData = {'{'}
        order_id: {'{'}transactionId{'}'},
        customer_email: {'{'}customerEmail{'}'},
        customer_name: {'{'}customerName{'}'},
        order_value: {'{'}transactionTotal{'}'}
    {'}'};

    if (orderData.order_id && orderData.customer_email) {'{'}
        fetch(config.trackingUrl, {'{'}
            method: 'POST',
            headers: {'{'} 'Content-Type': 'application/json' {'}'},
            body: JSON.stringify({'{'}
                tracking_code: config.trackingCode,
                ...orderData
            {'}'})
        {'}'});
    {'}'}
{'}'})();
&lt;/script&gt;</pre>
                    <div class="conv-note conv-note-info">
                        <strong>⚙️ Nastavenie triggeru:</strong><br>
                        Vytvorte trigger typu "Page View" s podmienkou: Page Path contains "thank" alebo "dakujeme"
                    </div>
                </div>
            {/if}
        </div>
    </div>
    
    <!-- Recent Conversions -->
    <div class="conv-card">
        <div class="conv-card-header">
            <h3>🛍️ Posledné konverzie</h3>
        </div>
        <div class="conv-card-body">
            {#if recentConversions.length > 0}
                <div class="conv-table-wrap">
                    <table class="conv-table">
                        <thead>
                            <tr>
                                <th>Objednávka</th>
                                <th>Zákazník</th>
                                <th>Hodnota</th>
                                <th>Dátum</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each recentConversions as conv}
                                <tr>
                                    <td><code class="conv-order-id">{conv.order_id}</code></td>
                                    <td>
                                        <div class="conv-customer">
                                            <strong>{conv.customer_name || 'Neuvedené'}</strong>
                                            <small>{conv.customer_email}</small>
                                        </div>
                                    </td>
                                    <td><strong>{formatNumber(conv.order_value, 2)} €</strong></td>
                                    <td>{formatDate(conv.conversion_date)}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {:else}
                <div class="conv-empty">
                    <div class="conv-empty-icon">📊</div>
                    <h4>Zatiaľ žiadne konverzie</h4>
                    <p>Po nastavení tracking kódu sa tu zobrazia vaše konverzie</p>
                </div>
            {/if}
        </div>
    </div>
    
    <!-- How It Works -->
    <div class="conv-card conv-how-it-works">
        <div class="conv-card-header">
            <h3>💡 Ako meranie konverzií funguje?</h3>
        </div>
        <div class="conv-card-body">
            <div class="conv-steps">
                <div class="conv-step">
                    <div class="conv-step-num">1</div>
                    <div class="conv-step-content">
                        <h4>Zákazník klikne</h4>
                        <p>Zákazník klikne na váš produkt na MegaPrice.sk a je presmerovaný na váš e-shop</p>
                    </div>
                </div>
                <div class="conv-step">
                    <div class="conv-step-num">2</div>
                    <div class="conv-step-content">
                        <h4>Nákup vo vašom e-shope</h4>
                        <p>Zákazník dokončí nákup vo vašom e-shope</p>
                    </div>
                </div>
                <div class="conv-step">
                    <div class="conv-step-num">3</div>
                    <div class="conv-step-content">
                        <h4>Tracking zaznamená konverziu</h4>
                        <p>Váš tracking kód odošle informáciu o úspešnom nákupe</p>
                    </div>
                </div>
                <div class="conv-step">
                    <div class="conv-step-num">4</div>
                    <div class="conv-step-content">
                        <h4>Štatistiky & ROI</h4>
                        <p>Vidíte presné dáta o konverziách a návratnosti investície</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .conv-page { max-width: 1200px; margin: 0 auto; }
    
    .conv-toast {
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #1f2937;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
    }
    
    @keyframes slideIn {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    .conv-header { margin-bottom: 24px; }
    .conv-header h1 { font-size: 28px; font-weight: 700; color: #1f2937; margin: 0 0 8px; }
    .conv-header p { color: #6b7280; margin: 0; }
    
    .conv-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    
    .conv-stat {
        background: white;
        border-radius: 12px;
        padding: 20px;
        display: flex;
        gap: 16px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    
    .conv-stat-success { border-left: 4px solid #10b981; }
    .conv-stat-icon { font-size: 28px; }
    .conv-stat-content { display: flex; flex-direction: column; }
    .conv-stat-label { font-size: 13px; color: #6b7280; margin-bottom: 4px; }
    .conv-stat-value { font-size: 26px; font-weight: 700; color: #1f2937; }
    .conv-stat-change { font-size: 13px; margin-top: 4px; }
    .conv-stat-change.positive { color: #10b981; }
    .conv-stat-note { font-size: 12px; color: #9ca3af; margin-top: 4px; }
    
    .conv-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        margin-bottom: 24px;
        overflow: hidden;
    }
    
    .conv-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .conv-card-header h3 { font-size: 16px; font-weight: 600; margin: 0; }
    .conv-card-header-warning { background: linear-gradient(135deg, #fef3c7, #fde68a); }
    
    .conv-badge {
        padding: 4px 12px;
        background: #f59e0b;
        color: white;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
    }
    
    .conv-card-body { padding: 20px; }
    
    .conv-intro { margin-bottom: 20px; color: #4b5563; line-height: 1.6; }
    
    .conv-credentials { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 24px; }
    
    .conv-credential label {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 6px;
    }
    
    .conv-input-group { display: flex; gap: 8px; }
    
    .conv-input {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-family: 'SF Mono', Monaco, monospace;
        font-size: 14px;
        background: #f9fafb;
    }
    
    .conv-copy-btn {
        padding: 10px 14px;
        background: #f3f4f6;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 14px;
    }
    
    .conv-copy-btn:hover { background: #e5e7eb; }
    .conv-copy-btn-light { background: #4b5563; border-color: #6b7280; color: white; }
    .conv-copy-btn-light:hover { background: #374151; }
    
    .conv-tabs { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
    
    .conv-tab {
        padding: 10px 16px;
        background: #f3f4f6;
        border: none;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .conv-tab:hover { background: #e5e7eb; }
    .conv-tab.active { background: #3b82f6; color: white; }
    
    .conv-code-section { margin-top: 16px; }
    
    .conv-code-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: #374151;
        border-radius: 10px 10px 0 0;
        color: #e5e7eb;
        font-size: 13px;
    }
    
    .conv-code {
        margin: 0;
        padding: 16px;
        background: #1f2937;
        border-radius: 0 0 10px 10px;
        overflow-x: auto;
        font-size: 13px;
        line-height: 1.5;
        color: #e5e7eb;
        white-space: pre-wrap;
        word-break: break-all;
    }
    
    .conv-note {
        margin-top: 16px;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 13px;
    }
    
    .conv-note-info {
        background: #f0f9ff;
        border: 1px solid #bae6fd;
        color: #0369a1;
    }
    
    .conv-table-wrap { overflow-x: auto; }
    
    .conv-table { width: 100%; border-collapse: collapse; }
    
    .conv-table th, .conv-table td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .conv-table th { font-weight: 600; color: #374151; background: #f9fafb; }
    
    .conv-order-id {
        padding: 2px 8px;
        background: #f3f4f6;
        border-radius: 4px;
        font-size: 12px;
    }
    
    .conv-customer { display: flex; flex-direction: column; }
    .conv-customer small { color: #9ca3af; font-size: 12px; }
    
    .conv-empty { text-align: center; padding: 48px 20px; }
    .conv-empty-icon { font-size: 48px; margin-bottom: 12px; opacity: 0.5; }
    .conv-empty h4 { margin: 0 0 8px; color: #374151; }
    .conv-empty p { margin: 0; color: #9ca3af; }
    
    .conv-steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; }
    
    .conv-step { display: flex; gap: 16px; }
    
    .conv-step-num {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 16px;
        flex-shrink: 0;
    }
    
    .conv-step-content h4 { margin: 0 0 4px; font-size: 15px; color: #1f2937; }
    .conv-step-content p { margin: 0; font-size: 13px; color: #6b7280; line-height: 1.5; }
    
    @media (max-width: 768px) {
        .conv-tabs { flex-direction: column; }
        .conv-credentials { grid-template-columns: 1fr; }
        .conv-stats { grid-template-columns: 1fr 1fr; }
    }
</style>
