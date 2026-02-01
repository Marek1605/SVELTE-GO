<script>
    import { getContext, onMount } from 'svelte';
    import { browser } from '$app/environment';
    
    const vendorStore = getContext('vendor');
    const shopStore = getContext('shop');
    const API_BASE = getContext('API_BASE');
    
    $: vendor = $vendorStore;
    $: shop = $shopStore;
    
    let loading = false;
    let message = null;
    
    let settings = {
        shop_name: '',
        shop_url: '',
        shop_description: '',
        return_policy: '',
        shipping_info: '',
        min_order_value: 0,
        free_shipping_threshold: 0,
        default_delivery_days: 3
    };
    
    onMount(() => {
        if (shop) {
            loadSettings();
        }
    });
    
    $: if (shop) {
        settings = {
            shop_name: shop.shop_name || '',
            shop_url: shop.shop_url || '',
            shop_description: shop.description || '',
            return_policy: shop.return_policy || '',
            shipping_info: shop.shipping_info || '',
            min_order_value: shop.min_order_value || 0,
            free_shipping_threshold: shop.free_shipping_threshold || 0,
            default_delivery_days: shop.default_delivery_days || 3
        };
    }
    
    async function loadSettings() {
        const token = localStorage.getItem('vendor_token');
        if (!token) return;
        
        try {
            const res = await fetch(`${API_BASE}/vendor/settings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.data) {
                settings = { ...settings, ...data.data };
            }
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    }
    
    async function saveSettings() {
        loading = true;
        message = null;
        
        const token = localStorage.getItem('vendor_token');
        
        try {
            const res = await fetch(`${API_BASE}/vendor/settings`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });
            const data = await res.json();
            
            if (data.success) {
                message = { type: 'success', text: 'Nastavenia boli uložené' };
                shopStore.update(s => ({ ...s, ...settings }));
            } else {
                message = { type: 'error', text: data.error || 'Chyba pri ukladaní' };
            }
        } catch (e) {
            message = { type: 'error', text: 'Chyba pri komunikácii so serverom' };
        }
        
        loading = false;
    }
</script>

<div class="settings-container">
    <div class="page-header">
        <h1>
            <span class="header-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
            </span>
            Nastavenia predaja
        </h1>
    </div>
    
    {#if message}
        <div class="message {message.type}">
            <span>{message.type === 'success' ? '✓' : '!'}</span>
            {message.text}
            <button class="close-btn" on:click={() => message = null}>×</button>
        </div>
    {/if}
    
    <form on:submit|preventDefault={saveSettings}>
        <div class="settings-grid">
            <!-- Základné informácie o obchode -->
            <div class="card">
                <div class="card-header">
                    <div class="card-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                    </div>
                    <h2>Informácie o obchode</h2>
                </div>
                
                <div class="form-group">
                    <label for="shop_name">Názov obchodu</label>
                    <input type="text" id="shop_name" bind:value={settings.shop_name} placeholder="Názov vášho e-shopu">
                    <span class="hint">Tento názov sa zobrazí zákazníkom</span>
                </div>
                
                <div class="form-group">
                    <label for="shop_url">URL obchodu</label>
                    <input type="url" id="shop_url" bind:value={settings.shop_url} placeholder="https://www.vas-eshop.sk">
                </div>
                
                <div class="form-group">
                    <label for="shop_description">Popis obchodu</label>
                    <textarea id="shop_description" bind:value={settings.shop_description} rows="3" placeholder="Krátky popis vášho obchodu pre zákazníkov..."></textarea>
                </div>
            </div>
            
            <!-- Doručenie -->
            <div class="card">
                <div class="card-header">
                    <div class="card-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="1" y="3" width="15" height="13"></rect>
                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                            <circle cx="5.5" cy="18.5" r="2.5"></circle>
                            <circle cx="18.5" cy="18.5" r="2.5"></circle>
                        </svg>
                    </div>
                    <h2>Nastavenia doručenia</h2>
                </div>
                
                <div class="form-group">
                    <label for="default_delivery_days">Štandardná doba doručenia (dni)</label>
                    <input type="number" id="default_delivery_days" bind:value={settings.default_delivery_days} min="1" max="30">
                </div>
                
                <div class="form-group">
                    <label for="min_order_value">Minimálna hodnota objednávky (€)</label>
                    <input type="number" id="min_order_value" bind:value={settings.min_order_value} min="0" step="0.01">
                    <span class="hint">0 = bez minimálnej hodnoty</span>
                </div>
                
                <div class="form-group">
                    <label for="free_shipping_threshold">Doprava zdarma od (€)</label>
                    <input type="number" id="free_shipping_threshold" bind:value={settings.free_shipping_threshold} min="0" step="0.01">
                    <span class="hint">0 = bez dopravy zdarma</span>
                </div>
                
                <div class="form-group">
                    <label for="shipping_info">Informácie o doručení</label>
                    <textarea id="shipping_info" bind:value={settings.shipping_info} rows="3" placeholder="Informácie o spôsoboch a cenách doručenia..."></textarea>
                </div>
            </div>
            
            <!-- Reklamácie a vrátenia -->
            <div class="card card-full">
                <div class="card-header">
                    <div class="card-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 11 12 14 22 4"></polyline>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                        </svg>
                    </div>
                    <h2>Reklamácie a vrátenie tovaru</h2>
                </div>
                
                <div class="form-group">
                    <label for="return_policy">Podmienky vrátenia tovaru</label>
                    <textarea id="return_policy" bind:value={settings.return_policy} rows="4" placeholder="Popíšte vaše podmienky pre vrátenie tovaru, lehoty, postup..."></textarea>
                    <span class="hint">Tieto informácie sa zobrazia zákazníkom pri vašich produktoch</span>
                </div>
            </div>
        </div>
        
        <div class="form-actions">
            <button type="submit" class="btn btn-primary" disabled={loading}>
                {#if loading}
                    <span class="spinner"></span> Ukladám...
                {:else}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    Uložiť nastavenia
                {/if}
            </button>
        </div>
    </form>
</div>

<style>
    .settings-container {
        max-width: 1000px;
        margin: 0 auto;
    }
    
    .page-header {
        margin-bottom: 24px;
    }
    
    .page-header h1 {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 24px;
        font-weight: 700;
        color: #1f2937;
        margin: 0;
    }
    
    .header-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: #f0f9ff;
        border-radius: 10px;
        color: #3b82f6;
    }
    
    /* Message */
    .message {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        border-radius: 10px;
        margin-bottom: 20px;
        font-size: 14px;
    }
    
    .message.success { background: #d1fae5; color: #065f46; }
    .message.error { background: #fee2e2; color: #991b1b; }
    
    .message span:first-child {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: currentColor;
        color: white;
        border-radius: 50%;
        font-size: 12px;
        font-weight: bold;
    }
    
    .message.success span:first-child { background: #10b981; }
    .message.error span:first-child { background: #ef4444; }
    
    .close-btn {
        margin-left: auto;
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        opacity: 0.6;
    }
    
    /* Grid */
    .settings-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 24px;
    }
    
    /* Cards */
    .card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    
    .card-full {
        grid-column: 1 / -1;
    }
    
    .card-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid #f1f5f9;
    }
    
    .card-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8fafc;
        border-radius: 10px;
        color: #64748b;
        box-shadow: 0 2px 4px rgba(0,0,0,0.06);
    }
    
    .card-header h2 {
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
        margin: 0;
    }
    
    /* Form */
    .form-group {
        margin-bottom: 16px;
    }
    
    .form-group:last-child {
        margin-bottom: 0;
    }
    
    .form-group label {
        display: block;
        font-size: 13px;
        font-weight: 500;
        color: #374151;
        margin-bottom: 6px;
    }
    
    .form-group input,
    .form-group textarea {
        width: 100%;
        padding: 10px 14px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        font-size: 14px;
        font-family: inherit;
        transition: border-color 0.2s, box-shadow 0.2s;
        resize: vertical;
    }
    
    .form-group input:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .hint {
        font-size: 12px;
        color: #9ca3af;
        margin-top: 4px;
        display: block;
    }
    
    /* Form Actions */
    .form-actions {
        display: flex;
        justify-content: flex-end;
    }
    
    /* Buttons */
    .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .btn-primary {
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }
    
    .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    /* Spinner */
    .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    @media (max-width: 768px) {
        .settings-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
