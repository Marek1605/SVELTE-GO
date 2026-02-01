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
    
    // Shop form data
    let shopData = {
        shop_name: '',
        shop_url: '',
        shop_logo: '',
        shop_description: '',
        shipping_price: 0,
        delivery_days: '2-3'
    };
    
    onMount(() => {
        if (shop) {
            shopData = {
                shop_name: shop.shop_name || '',
                shop_url: shop.shop_url || '',
                shop_logo: shop.shop_logo || '',
                shop_description: shop.shop_description || '',
                shipping_price: shop.shipping_price || 0,
                delivery_days: shop.delivery_days || '2-3'
            };
        }
    });
    
    $: if (shop) {
        shopData = {
            shop_name: shop.shop_name || '',
            shop_url: shop.shop_url || '',
            shop_logo: shop.shop_logo || '',
            shop_description: shop.shop_description || '',
            shipping_price: shop.shipping_price || 0,
            delivery_days: shop.delivery_days || '2-3'
        };
    }
    
    async function saveSettings() {
        loading = true;
        message = null;
        
        const token = localStorage.getItem('vendor_token');
        
        try {
            const res = await fetch(`${API_BASE}/vendor/shop`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(shopData)
            });
            const data = await res.json();
            
            if (data.success) {
                message = { type: 'success', text: 'Nastavenia boli uložené' };
                shopStore.update(s => ({ ...s, ...shopData }));
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
    <div class="settings-header">
        <h1>🛒 Nastavenia predaja</h1>
        <p>Nastavte ako sa váš obchod zobrazuje zákazníkom</p>
    </div>
    
    {#if message}
        <div class="message {message.type}">
            {message.text}
            <button on:click={() => message = null}>×</button>
        </div>
    {/if}
    
    <div class="settings-grid">
        <!-- Shop Info -->
        <div class="settings-section">
            <h2>🏪 Informácie o obchode</h2>
            <form on:submit|preventDefault={saveSettings}>
                <div class="form-group">
                    <label for="shop_name">Názov obchodu</label>
                    <input 
                        type="text" 
                        id="shop_name" 
                        bind:value={shopData.shop_name}
                        placeholder="Váš obchod"
                        required
                    >
                </div>
                
                <div class="form-group">
                    <label for="shop_url">URL vášho e-shopu</label>
                    <input 
                        type="url" 
                        id="shop_url" 
                        bind:value={shopData.shop_url}
                        placeholder="https://www.vas-eshop.sk"
                    >
                </div>
                
                <div class="form-group">
                    <label for="shop_logo">Logo (URL obrázka)</label>
                    <input 
                        type="url" 
                        id="shop_logo" 
                        bind:value={shopData.shop_logo}
                        placeholder="https://www.vas-eshop.sk/logo.png"
                    >
                    {#if shopData.shop_logo}
                        <div class="logo-preview">
                            <img src={shopData.shop_logo} alt="Logo" on:error={(e) => e.target.style.display = 'none'}>
                        </div>
                    {/if}
                </div>
                
                <div class="form-group">
                    <label for="shop_description">Popis obchodu</label>
                    <textarea 
                        id="shop_description" 
                        bind:value={shopData.shop_description}
                        placeholder="Krátky popis vášho obchodu..."
                        rows="3"
                    ></textarea>
                </div>
                
                <button type="submit" class="btn-primary" disabled={loading}>
                    {loading ? 'Ukladám...' : 'Uložiť zmeny'}
                </button>
            </form>
        </div>
        
        <!-- Delivery Settings -->
        <div class="settings-section">
            <h2>🚚 Nastavenia doručenia</h2>
            <form on:submit|preventDefault={saveSettings}>
                <div class="form-group">
                    <label for="shipping_price">Predvolená cena dopravy (€)</label>
                    <input 
                        type="number" 
                        id="shipping_price" 
                        bind:value={shopData.shipping_price}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                    >
                    <small>Táto cena sa použije ak nie je uvedená pri konkrétnom produkte</small>
                </div>
                
                <div class="form-group">
                    <label for="delivery_days">Dodacia doba</label>
                    <select id="delivery_days" bind:value={shopData.delivery_days}>
                        <option value="1">Do 24 hodín</option>
                        <option value="1-2">1-2 dni</option>
                        <option value="2-3">2-3 dni</option>
                        <option value="3-5">3-5 dní</option>
                        <option value="5-7">5-7 dní</option>
                        <option value="7-14">7-14 dní</option>
                        <option value="14+">Viac ako 14 dní</option>
                    </select>
                    <small>Predvolená dodacia doba pre vaše produkty</small>
                </div>
                
                <button type="submit" class="btn-primary" disabled={loading}>
                    {loading ? 'Ukladám...' : 'Uložiť zmeny'}
                </button>
            </form>
        </div>
        
        <!-- Display Mode Info -->
        <div class="settings-section info-section">
            <h2>📊 Režim zobrazovania</h2>
            <div class="display-mode-info">
                <div class="current-mode">
                    <span class="mode-label">Aktuálny režim:</span>
                    {#if shop?.display_mode === 'cpc'}
                        <span class="mode-badge cpc">💰 CPC (Platba za klik)</span>
                    {:else}
                        <span class="mode-badge free">🆓 FREE (Zadarmo)</span>
                    {/if}
                </div>
                
                <div class="mode-description">
                    {#if shop?.display_mode === 'cpc'}
                        <p>Vaše ponuky sú zobrazované prednostne. Za každý preklik na váš produkt je automaticky strhnutý kredit.</p>
                        <p><strong>Aktuálny kredit:</strong> {(shop?.credit_balance || 0).toLocaleString('sk-SK', { minimumFractionDigits: 2 })} €</p>
                    {:else}
                        <p>Vaše ponuky sú zobrazované na konci zoznamu. Pre prednostné zobrazenie aktivujte CPC režim.</p>
                    {/if}
                </div>
                
                <a href="/vendor-dashboard/ppc" class="btn-secondary">
                    ⚙️ Spravovať PPC & Kredit
                </a>
            </div>
        </div>
    </div>
</div>

<style>
.settings-container {
    max-width: 1000px;
    margin: 0 auto;
}

.settings-header {
    margin-bottom: 24px;
}

.settings-header h1 {
    font-size: 28px;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 8px 0;
}

.settings-header p {
    color: #6b7280;
    margin: 0;
}

.message {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.message.success {
    background: #d1fae5;
    color: #065f46;
}

.message.error {
    background: #fee2e2;
    color: #991b1b;
}

.message button {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    opacity: 0.7;
}

.settings-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
}

.settings-section {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.settings-section.info-section {
    grid-column: 1 / -1;
}

.settings-section h2 {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 20px 0;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e7eb;
}

.form-group {
    margin-bottom: 16px;
}

.form-group label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 6px;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #3b82f6;
}

.form-group small {
    display: block;
    font-size: 12px;
    color: #9ca3af;
    margin-top: 4px;
}

.logo-preview {
    margin-top: 12px;
    padding: 12px;
    background: #f8fafc;
    border-radius: 8px;
    text-align: center;
}

.logo-preview img {
    max-width: 150px;
    max-height: 60px;
    object-fit: contain;
}

.btn-primary, .btn-secondary {
    display: inline-block;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    text-align: center;
}

.btn-primary {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
    background: #f1f5f9;
    color: #374151;
}

.btn-secondary:hover {
    background: #e2e8f0;
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Display Mode Info */
.display-mode-info {
    padding: 16px;
    background: #f8fafc;
    border-radius: 8px;
}

.current-mode {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
}

.mode-label {
    font-weight: 500;
    color: #374151;
}

.mode-badge {
    padding: 6px 14px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 14px;
}

.mode-badge.cpc {
    background: #dbeafe;
    color: #1e40af;
}

.mode-badge.free {
    background: #d1fae5;
    color: #065f46;
}

.mode-description {
    margin-bottom: 16px;
}

.mode-description p {
    margin: 8px 0;
    color: #6b7280;
    font-size: 14px;
}

@media (max-width: 768px) {
    .settings-grid {
        grid-template-columns: 1fr;
    }
    
    .settings-section.info-section {
        grid-column: auto;
    }
}
</style>
