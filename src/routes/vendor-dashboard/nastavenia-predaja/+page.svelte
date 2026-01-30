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
    let activeTab = 'shop';
    
    // Shop info
    let shopData = {
        shop_name: '',
        shop_url: '',
        shop_logo: '',
        shop_description: ''
    };
    
    // Sales settings
    let salesSettings = {
        return_days: 14,
        warranty_months: 24,
        return_policy: '',
        warranty_info: '',
        auto_accept_returns: false,
        free_shipping_threshold: 0,
        min_order_value: 0,
        payment_methods: ['card', 'transfer', 'cod'],
        invoice_prefix: 'MP',
        invoice_note: '',
        vacation_mode: false,
        vacation_message: ''
    };
    
    // Shipping methods
    let shippingMethods = [];
    let editingMethod = null;
    let showMethodModal = false;
    let methodForm = {
        id: null,
        name: '',
        price: 0,
        free_from: null,
        delivery_days: '2-3',
        carrier: '',
        is_default: false,
        is_active: true
    };
    
    const availablePaymentMethods = [
        { id: 'card', name: 'Platobná karta', icon: '💳' },
        { id: 'transfer', name: 'Bankový prevod', icon: '🏦' },
        { id: 'cod', name: 'Dobierka', icon: '📦' },
        { id: 'gpay', name: 'Google Pay', icon: '📱' },
        { id: 'applepay', name: 'Apple Pay', icon: '🍎' },
        { id: 'paypal', name: 'PayPal', icon: '💰' }
    ];
    
    const carriers = [
        'Slovenská pošta',
        'GLS',
        'DPD',
        'Packeta (Zásielkovňa)',
        'SPS',
        'Kuriér 123',
        'Osobný odber',
        'Iné'
    ];
    
    onMount(async () => {
        if (shop) {
            shopData = {
                shop_name: shop.shop_name || '',
                shop_url: shop.shop_url || '',
                shop_logo: shop.shop_logo || '',
                shop_description: shop.shop_description || ''
            };
        }
        await loadSalesSettings();
        await loadShippingMethods();
    });
    
    $: if (shop) {
        shopData = {
            shop_name: shop.shop_name || '',
            shop_url: shop.shop_url || '',
            shop_logo: shop.shop_logo || '',
            shop_description: shop.shop_description || ''
        };
    }
    
    async function loadSalesSettings() {
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(`${API_BASE}/vendor/sales-settings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.data) {
                salesSettings = { ...salesSettings, ...data.data };
                if (typeof salesSettings.payment_methods === 'string') {
                    try {
                        salesSettings.payment_methods = JSON.parse(salesSettings.payment_methods);
                    } catch (e) {
                        salesSettings.payment_methods = ['card', 'transfer', 'cod'];
                    }
                }
            }
        } catch (e) { console.error(e); }
    }
    
    async function loadShippingMethods() {
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(`${API_BASE}/vendor/shipping-methods`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) shippingMethods = data.data || [];
        } catch (e) { console.error(e); }
    }
    
    async function saveShopInfo() {
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
                message = { type: 'success', text: 'Informácie o obchode boli uložené' };
                shopStore.update(s => ({ ...s, ...shopData }));
            } else {
                message = { type: 'error', text: data.error || 'Chyba pri ukladaní' };
            }
        } catch (e) {
            message = { type: 'error', text: 'Chyba pri komunikácii so serverom' };
        }
        loading = false;
    }
    
    async function saveSalesSettings() {
        loading = true;
        message = null;
        const token = localStorage.getItem('vendor_token');
        
        try {
            const res = await fetch(`${API_BASE}/vendor/sales-settings`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(salesSettings)
            });
            const data = await res.json();
            
            if (data.success) {
                message = { type: 'success', text: 'Nastavenia predaja boli uložené' };
            } else {
                message = { type: 'error', text: data.error || 'Chyba pri ukladaní' };
            }
        } catch (e) {
            message = { type: 'error', text: 'Chyba pri komunikácii so serverom' };
        }
        loading = false;
    }
    
    function openMethodModal(method = null) {
        if (method) {
            methodForm = { ...method };
        } else {
            methodForm = {
                id: null,
                name: '',
                price: 0,
                free_from: null,
                delivery_days: '2-3',
                carrier: '',
                is_default: false,
                is_active: true
            };
        }
        showMethodModal = true;
    }
    
    async function saveShippingMethod() {
        loading = true;
        const token = localStorage.getItem('vendor_token');
        
        try {
            const res = await fetch(`${API_BASE}/vendor/shipping-methods`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(methodForm)
            });
            const data = await res.json();
            
            if (data.success) {
                message = { type: 'success', text: 'Spôsob dopravy bol uložený' };
                showMethodModal = false;
                await loadShippingMethods();
            } else {
                message = { type: 'error', text: data.error || 'Chyba pri ukladaní' };
            }
        } catch (e) {
            message = { type: 'error', text: 'Chyba pri komunikácii so serverom' };
        }
        loading = false;
    }
    
    async function deleteShippingMethod(id) {
        if (!confirm('Naozaj chcete odstrániť tento spôsob dopravy?')) return;
        
        const token = localStorage.getItem('vendor_token');
        
        try {
            const res = await fetch(`${API_BASE}/vendor/shipping-methods/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (data.success) {
                message = { type: 'success', text: 'Spôsob dopravy bol odstránený' };
                await loadShippingMethods();
            } else {
                message = { type: 'error', text: data.error || 'Chyba pri odstraňovaní' };
            }
        } catch (e) {
            message = { type: 'error', text: 'Chyba pri komunikácii so serverom' };
        }
    }
    
    function togglePaymentMethod(methodId) {
        if (salesSettings.payment_methods.includes(methodId)) {
            salesSettings.payment_methods = salesSettings.payment_methods.filter(m => m !== methodId);
        } else {
            salesSettings.payment_methods = [...salesSettings.payment_methods, methodId];
        }
    }
</script>

<div class="settings-page">
    <div class="page-header">
        <div class="header-content">
            <h1>🛒 Nastavenia predaja</h1>
            <p>Nastavte ako sa váš obchod zobrazuje zákazníkom</p>
        </div>
        <div class="header-status">
            {#if salesSettings.vacation_mode}
                <span class="vacation-badge">🏖️ Dovolenkový režim aktívny</span>
            {/if}
            <div class="mode-badge">
                {#if shop?.display_mode === 'cpc'}
                    <span class="badge cpc">💰 CPC</span>
                {:else}
                    <span class="badge free">🆓 FREE</span>
                {/if}
            </div>
        </div>
    </div>
    
    {#if message}
        <div class="message {message.type}">
            <span>{message.text}</span>
            <button on:click={() => message = null}>×</button>
        </div>
    {/if}
    
    <div class="tabs">
        <button class:active={activeTab === 'shop'} on:click={() => activeTab = 'shop'}>
            🏪 Obchod
        </button>
        <button class:active={activeTab === 'shipping'} on:click={() => activeTab = 'shipping'}>
            🚚 Doprava
        </button>
        <button class:active={activeTab === 'returns'} on:click={() => activeTab = 'returns'}>
            ↩️ Vratky & Záruka
        </button>
        <button class:active={activeTab === 'payments'} on:click={() => activeTab = 'payments'}>
            💳 Platby
        </button>
        <button class:active={activeTab === 'invoices'} on:click={() => activeTab = 'invoices'}>
            📄 Faktúry
        </button>
        <button class:active={activeTab === 'vacation'} on:click={() => activeTab = 'vacation'}>
            🏖️ Dovolenka
        </button>
    </div>
    
    <div class="tab-content">
        
        <!-- SHOP INFO TAB -->
        {#if activeTab === 'shop'}
            <form on:submit|preventDefault={saveShopInfo} class="settings-form">
                <div class="form-section">
                    <h3>Základné informácie o obchode</h3>
                    
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Názov obchodu *</label>
                            <input type="text" bind:value={shopData.shop_name} placeholder="Váš obchod" required>
                        </div>
                        <div class="form-group">
                            <label>URL e-shopu</label>
                            <input type="url" bind:value={shopData.shop_url} placeholder="https://www.vas-eshop.sk">
                        </div>
                        <div class="form-group full-width">
                            <label>Logo (URL obrázka)</label>
                            <input type="url" bind:value={shopData.shop_logo} placeholder="https://www.vas-eshop.sk/logo.png">
                            {#if shopData.shop_logo}
                                <div class="logo-preview">
                                    <img src={shopData.shop_logo} alt="Logo" on:error={(e) => e.target.style.display = 'none'}>
                                </div>
                            {/if}
                        </div>
                        <div class="form-group full-width">
                            <label>Popis obchodu</label>
                            <textarea bind:value={shopData.shop_description} placeholder="Krátky popis vášho obchodu pre zákazníkov..." rows="3"></textarea>
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>Minimálna objednávka & Doprava zdarma</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Minimálna hodnota objednávky</label>
                            <div class="input-with-suffix">
                                <input type="number" bind:value={salesSettings.min_order_value} min="0" step="0.01">
                                <span class="suffix">€</span>
                            </div>
                            <small>0 = bez minimálnej hodnoty</small>
                        </div>
                        <div class="form-group">
                            <label>Doprava zdarma od</label>
                            <div class="input-with-suffix">
                                <input type="number" bind:value={salesSettings.free_shipping_threshold} min="0" step="0.01">
                                <span class="suffix">€</span>
                            </div>
                            <small>0 = doprava zdarma nie je aktívna</small>
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn-primary" disabled={loading}>
                        {loading ? 'Ukladám...' : '💾 Uložiť informácie'}
                    </button>
                </div>
            </form>
        {/if}
        
        <!-- SHIPPING TAB -->
        {#if activeTab === 'shipping'}
            <div class="shipping-content">
                <div class="section-header">
                    <div>
                        <h3>🚚 Spôsoby dopravy</h3>
                        <p class="section-desc">Nastavte dostupné spôsoby dopravy pre váš obchod</p>
                    </div>
                    <button class="btn-primary" on:click={() => openMethodModal()}>
                        + Pridať dopravu
                    </button>
                </div>
                
                {#if shippingMethods.length > 0}
                    <div class="shipping-list">
                        {#each shippingMethods as method}
                            <div class="shipping-card" class:inactive={!method.is_active}>
                                <div class="shipping-info">
                                    <div class="shipping-name">
                                        <strong>{method.name}</strong>
                                        {#if method.is_default}
                                            <span class="default-badge">Predvolená</span>
                                        {/if}
                                        {#if !method.is_active}
                                            <span class="inactive-badge">Neaktívna</span>
                                        {/if}
                                    </div>
                                    <div class="shipping-details">
                                        {#if method.carrier}
                                            <span>📦 {method.carrier}</span>
                                        {/if}
                                        <span>⏱️ {method.delivery_days} dní</span>
                                    </div>
                                </div>
                                <div class="shipping-price">
                                    <div class="price">{method.price?.toFixed(2)} €</div>
                                    {#if method.free_from}
                                        <small>Zdarma od {method.free_from} €</small>
                                    {/if}
                                </div>
                                <div class="shipping-actions">
                                    <button class="btn-icon" on:click={() => openMethodModal(method)} title="Upraviť">✏️</button>
                                    <button class="btn-icon danger" on:click={() => deleteShippingMethod(method.id)} title="Odstrániť">🗑️</button>
                                </div>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div class="empty-state">
                        <div class="empty-icon">🚚</div>
                        <h4>Žiadne spôsoby dopravy</h4>
                        <p>Pridajte prvý spôsob dopravy pre váš obchod</p>
                        <button class="btn-secondary" on:click={() => openMethodModal()}>
                            + Pridať dopravu
                        </button>
                    </div>
                {/if}
            </div>
        {/if}
        
        <!-- RETURNS TAB -->
        {#if activeTab === 'returns'}
            <form on:submit|preventDefault={saveSalesSettings} class="settings-form">
                <div class="form-section">
                    <h3>↩️ Politika vrátenia tovaru</h3>
                    
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Lehota na vrátenie tovaru</label>
                            <div class="input-with-suffix">
                                <input type="number" bind:value={salesSettings.return_days} min="0" max="365">
                                <span class="suffix">dní</span>
                            </div>
                            <small>Zákonná lehota je 14 dní</small>
                        </div>
                        <div class="form-group">
                            <label>Záručná doba</label>
                            <div class="input-with-suffix">
                                <input type="number" bind:value={salesSettings.warranty_months} min="0" max="120">
                                <span class="suffix">mesiacov</span>
                            </div>
                            <small>Zákonná záruka je 24 mesiacov</small>
                        </div>
                        <div class="form-group full-width">
                            <label>Podmienky vrátenia tovaru</label>
                            <textarea bind:value={salesSettings.return_policy} placeholder="Popíšte vaše podmienky pre vrátenie tovaru..." rows="4"></textarea>
                        </div>
                        <div class="form-group full-width">
                            <label>Informácie o záruke</label>
                            <textarea bind:value={salesSettings.warranty_info} placeholder="Popíšte záručné podmienky pre vaše produkty..." rows="4"></textarea>
                        </div>
                    </div>
                    
                    <label class="toggle-item standalone">
                        <input type="checkbox" bind:checked={salesSettings.auto_accept_returns}>
                        <span class="toggle-label">
                            <strong>Automaticky akceptovať žiadosti o vrátenie</strong>
                            <small>Žiadosti o vrátenie v zákonnej lehote budú automaticky schválené</small>
                        </span>
                    </label>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn-primary" disabled={loading}>
                        {loading ? 'Ukladám...' : '💾 Uložiť nastavenia'}
                    </button>
                </div>
            </form>
        {/if}
        
        <!-- PAYMENTS TAB -->
        {#if activeTab === 'payments'}
            <form on:submit|preventDefault={saveSalesSettings} class="settings-form">
                <div class="form-section">
                    <h3>💳 Akceptované platobné metódy</h3>
                    <p class="section-desc">Vyberte platobné metódy, ktoré akceptujete</p>
                    
                    <div class="payment-methods-grid">
                        {#each availablePaymentMethods as method}
                            <label class="payment-method-card" class:selected={salesSettings.payment_methods.includes(method.id)}>
                                <input 
                                    type="checkbox" 
                                    checked={salesSettings.payment_methods.includes(method.id)}
                                    on:change={() => togglePaymentMethod(method.id)}
                                >
                                <span class="method-icon">{method.icon}</span>
                                <span class="method-name">{method.name}</span>
                                <span class="checkmark">✓</span>
                            </label>
                        {/each}
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn-primary" disabled={loading}>
                        {loading ? 'Ukladám...' : '💾 Uložiť platobné metódy'}
                    </button>
                </div>
            </form>
        {/if}
        
        <!-- INVOICES TAB -->
        {#if activeTab === 'invoices'}
            <form on:submit|preventDefault={saveSalesSettings} class="settings-form">
                <div class="form-section">
                    <h3>📄 Nastavenia faktúr</h3>
                    
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Prefix čísla faktúry</label>
                            <input type="text" bind:value={salesSettings.invoice_prefix} placeholder="MP" maxlength="10">
                            <small>Príklad: {salesSettings.invoice_prefix || 'MP'}-2024-001</small>
                        </div>
                        <div class="form-group full-width">
                            <label>Poznámka na faktúre</label>
                            <textarea bind:value={salesSettings.invoice_note} placeholder="Voliteľná poznámka, ktorá sa zobrazí na každej faktúre..." rows="3"></textarea>
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn-primary" disabled={loading}>
                        {loading ? 'Ukladám...' : '💾 Uložiť nastavenia faktúr'}
                    </button>
                </div>
            </form>
        {/if}
        
        <!-- VACATION TAB -->
        {#if activeTab === 'vacation'}
            <form on:submit|preventDefault={saveSalesSettings} class="settings-form">
                <div class="form-section">
                    <h3>🏖️ Dovolenkový režim</h3>
                    <p class="section-desc">Dočasne pozastavte prijímanie objednávok počas dovolenky</p>
                    
                    <label class="toggle-item standalone vacation-toggle" class:active={salesSettings.vacation_mode}>
                        <input type="checkbox" bind:checked={salesSettings.vacation_mode}>
                        <span class="toggle-label">
                            <strong>Aktivovať dovolenkový režim</strong>
                            <small>Vaše produkty budú skryté a nebudete prijímať nové objednávky</small>
                        </span>
                    </label>
                    
                    {#if salesSettings.vacation_mode}
                        <div class="form-group" style="margin-top: 20px;">
                            <label>Správa pre zákazníkov</label>
                            <textarea 
                                bind:value={salesSettings.vacation_message} 
                                placeholder="Momentálne sme na dovolenke. Objednávky začneme vybavovať od..."
                                rows="3"
                            ></textarea>
                            <small>Táto správa sa zobrazí zákazníkom pri pokuse o objednávku</small>
                        </div>
                    {/if}
                </div>
                
                {#if salesSettings.vacation_mode}
                    <div class="warning-box">
                        <div class="warning-icon">⚠️</div>
                        <div class="warning-content">
                            <strong>Upozornenie</strong>
                            <p>Počas dovolenkového režimu vaše produkty nebudú zobrazené v porovnávači a nebudú vám účtované žiadne CPC poplatky.</p>
                        </div>
                    </div>
                {/if}
                
                <div class="form-actions">
                    <button type="submit" class="btn-primary" disabled={loading}>
                        {loading ? 'Ukladám...' : '💾 Uložiť nastavenia'}
                    </button>
                </div>
            </form>
        {/if}
    </div>
</div>

<!-- Shipping Method Modal -->
{#if showMethodModal}
    <div class="modal-overlay" on:click={() => showMethodModal = false}>
        <div class="modal" on:click|stopPropagation>
            <div class="modal-header">
                <h3>{methodForm.id ? 'Upraviť dopravu' : 'Pridať dopravu'}</h3>
                <button class="modal-close" on:click={() => showMethodModal = false}>×</button>
            </div>
            <form on:submit|preventDefault={saveShippingMethod}>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Názov *</label>
                        <input type="text" bind:value={methodForm.name} placeholder="napr. Kuriér GLS" required>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Cena</label>
                            <div class="input-with-suffix">
                                <input type="number" bind:value={methodForm.price} min="0" step="0.01">
                                <span class="suffix">€</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Zdarma od (voliteľné)</label>
                            <div class="input-with-suffix">
                                <input type="number" bind:value={methodForm.free_from} min="0" step="0.01" placeholder="—">
                                <span class="suffix">€</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Prepravca</label>
                            <select bind:value={methodForm.carrier}>
                                <option value="">— Vybrať —</option>
                                {#each carriers as carrier}
                                    <option value={carrier}>{carrier}</option>
                                {/each}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Dodacia doba</label>
                            <select bind:value={methodForm.delivery_days}>
                                <option value="1">Do 24 hodín</option>
                                <option value="1-2">1-2 dni</option>
                                <option value="2-3">2-3 dni</option>
                                <option value="3-5">3-5 dní</option>
                                <option value="5-7">5-7 dní</option>
                                <option value="7-14">7-14 dní</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="checkbox-row">
                        <label class="checkbox-item">
                            <input type="checkbox" bind:checked={methodForm.is_default}>
                            <span>Predvolená doprava</span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" bind:checked={methodForm.is_active}>
                            <span>Aktívna</span>
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" on:click={() => showMethodModal = false}>Zrušiť</button>
                    <button type="submit" class="btn-primary" disabled={loading}>
                        {loading ? 'Ukladám...' : 'Uložiť'}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
.settings-page { max-width: 1100px; margin: 0 auto; }

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
}

.header-content h1 { font-size: 28px; font-weight: 700; color: #1f2937; margin: 0 0 4px 0; }
.header-content p { color: #6b7280; margin: 0; }

.header-status { display: flex; align-items: center; gap: 12px; }

.vacation-badge {
    background: #fef3c7;
    color: #92400e;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
}

.badge { padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; }
.badge.cpc { background: #dbeafe; color: #1e40af; }
.badge.free { background: #d1fae5; color: #065f46; }

.message {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 20px;
}
.message.success { background: #d1fae5; color: #065f46; }
.message.error { background: #fee2e2; color: #991b1b; }
.message button { background: none; border: none; font-size: 20px; cursor: pointer; }

.tabs {
    display: flex;
    gap: 4px;
    border-bottom: 2px solid #e5e7eb;
    margin-bottom: 24px;
    overflow-x: auto;
}

.tabs button {
    padding: 12px 20px;
    background: none;
    border: none;
    font-size: 14px;
    font-weight: 500;
    color: #6b7280;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    white-space: nowrap;
    transition: all 0.2s;
}

.tabs button:hover { color: #3b82f6; }
.tabs button.active { color: #3b82f6; border-bottom-color: #3b82f6; }

.tab-content {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.form-section { margin-bottom: 32px; }
.form-section:last-child { margin-bottom: 0; }

.form-section h3 {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 16px 0;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e7eb;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
}

.section-header h3 { margin-bottom: 4px; border: none; padding: 0; }
.section-desc { color: #6b7280; font-size: 14px; margin: 0; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { margin-bottom: 0; }
.form-group.full-width { grid-column: 1 / -1; }

.form-group label { display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px; }

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group small { display: block; font-size: 12px; color: #9ca3af; margin-top: 4px; }

.input-with-suffix { display: flex; }
.input-with-suffix input { border-radius: 8px 0 0 8px; }
.input-with-suffix .suffix {
    padding: 10px 14px;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-left: none;
    border-radius: 0 8px 8px 0;
    color: #6b7280;
    font-weight: 500;
}

.logo-preview {
    margin-top: 12px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 8px;
    text-align: center;
}

.logo-preview img { max-width: 150px; max-height: 60px; object-fit: contain; }

/* Shipping List */
.shipping-list { display: flex; flex-direction: column; gap: 12px; }

.shipping-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: #f9fafb;
    border-radius: 10px;
    transition: all 0.2s;
}

.shipping-card:hover { background: #f3f4f6; }
.shipping-card.inactive { opacity: 0.6; }

.shipping-info { flex: 1; }
.shipping-name { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.shipping-name strong { font-size: 15px; color: #1f2937; }

.default-badge {
    background: #dbeafe;
    color: #1e40af;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
}

.inactive-badge {
    background: #f3f4f6;
    color: #6b7280;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
}

.shipping-details { display: flex; gap: 12px; font-size: 13px; color: #6b7280; }

.shipping-price { text-align: right; }
.shipping-price .price { font-size: 18px; font-weight: 700; color: #1f2937; }
.shipping-price small { color: #10b981; font-size: 12px; }

.shipping-actions { display: flex; gap: 8px; }
.btn-icon {
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s;
}
.btn-icon:hover { background: #e5e7eb; }
.btn-icon.danger:hover { background: #fee2e2; }

/* Payment Methods */
.payment-methods-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
}

.payment-method-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 20px;
    background: #f9fafb;
    border: 2px solid transparent;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
}

.payment-method-card:hover { background: #f3f4f6; }
.payment-method-card.selected { background: #eff6ff; border-color: #3b82f6; }
.payment-method-card input { display: none; }
.method-icon { font-size: 28px; }
.method-name { font-size: 13px; font-weight: 500; color: #374151; }

.payment-method-card .checkmark {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 20px;
    height: 20px;
    background: #3b82f6;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    opacity: 0;
    transition: opacity 0.2s;
}

.payment-method-card.selected .checkmark { opacity: 1; }

/* Toggle Items */
.toggle-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    background: #f9fafb;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
}

.toggle-item.standalone { margin-top: 16px; }
.toggle-item:hover { background: #f3f4f6; }
.toggle-item input[type="checkbox"] { width: 18px; height: 18px; margin-top: 2px; cursor: pointer; }
.toggle-label { display: flex; flex-direction: column; }
.toggle-label strong { font-size: 14px; color: #1f2937; }
.toggle-label small { font-size: 12px; color: #6b7280; margin-top: 2px; }

.vacation-toggle.active { background: #fef3c7; }

/* Warning Box */
.warning-box {
    display: flex;
    gap: 12px;
    padding: 16px;
    background: #fef3c7;
    border-radius: 8px;
    margin-bottom: 24px;
}

.warning-icon { font-size: 20px; }
.warning-content strong { display: block; color: #92400e; margin-bottom: 4px; }
.warning-content p { color: #92400e; font-size: 13px; margin: 0; }

/* Buttons */
.form-actions { padding-top: 16px; border-top: 1px solid #e5e7eb; margin-top: 24px; }

.btn-primary, .btn-secondary {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-primary { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; }
.btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); }
.btn-secondary { background: #f1f5f9; color: #374151; }
.btn-secondary:hover:not(:disabled) { background: #e2e8f0; }
.btn-primary:disabled, .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

/* Empty State */
.empty-state { text-align: center; padding: 48px 24px; }
.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-state h4 { font-size: 16px; color: #374151; margin: 0 0 8px 0; }
.empty-state p { color: #6b7280; font-size: 14px; margin: 0 0 16px 0; }

/* Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
}

.modal {
    background: white;
    border-radius: 16px;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 { margin: 0; font-size: 18px; }
.modal-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #9ca3af; }

.modal-body { padding: 24px; }
.modal-body .form-group { margin-bottom: 16px; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.checkbox-row { display: flex; gap: 24px; margin-top: 8px; }
.checkbox-item { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.checkbox-item input { width: 16px; height: 16px; }

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
}

@media (max-width: 768px) {
    .page-header { flex-direction: column; }
    .tabs { flex-wrap: nowrap; -webkit-overflow-scrolling: touch; }
    .tabs button { padding: 10px 16px; font-size: 13px; }
    .form-grid, .payment-methods-grid { grid-template-columns: 1fr; }
    .tab-content { padding: 16px; }
    .shipping-card { flex-wrap: wrap; }
    .shipping-price { width: 100%; text-align: left; margin-top: 8px; }
    .form-row { grid-template-columns: 1fr; }
}
</style>
