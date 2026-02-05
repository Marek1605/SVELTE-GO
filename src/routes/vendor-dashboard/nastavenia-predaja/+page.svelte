<script>
    import { getContext, onMount } from 'svelte';
    
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
        name: '',
        url: '',
        description: '',
        logo_url: '',
        email: '',
        phone: ''
    };
    
    // Delivery settings
    let deliveryData = {
        delivery_days: 3,
        min_order_value: 0,
        free_shipping_from: 0,
        delivery_info: '',
        shipping_methods: []
    };
    
    // Payment settings
    let paymentData = {
        payment_methods: [],
        cod_fee: 0,
        bank_transfer_discount: 0
    };
    
    // Returns settings
    let returnsData = {
        return_days: 14,
        return_policy: '',
        warranty_info: ''
    };
    
    // Available options
    const shippingOptions = [
        { id: 'courier', name: 'Kuriér', icon: '🚚' },
        { id: 'post', name: 'Slovenská pošta', icon: '📮' },
        { id: 'packeta', name: 'Zásielkovňa', icon: '📦' },
        { id: 'pickup', name: 'Osobný odber', icon: '🏪' },
        { id: 'dpd', name: 'DPD', icon: '🚛' },
        { id: 'gls', name: 'GLS', icon: '📬' }
    ];
    
    const paymentOptions = [
        { id: 'card', name: 'Platba kartou', icon: '💳' },
        { id: 'bank', name: 'Bankový prevod', icon: '🏦' },
        { id: 'cod', name: 'Dobierka', icon: '💵' },
        { id: 'gpay', name: 'Google Pay', icon: '📱' },
        { id: 'applepay', name: 'Apple Pay', icon: '🍎' }
    ];
    
    onMount(() => {
        if (shop) {
            shopData = {
                name: shop.name || '',
                url: shop.url || '',
                description: shop.description || '',
                logo_url: shop.logo_url || '',
                email: shop.email || '',
                phone: shop.phone || ''
            };
            deliveryData = {
                delivery_days: shop.delivery_days || 3,
                min_order_value: shop.min_order_value || 0,
                free_shipping_from: shop.free_shipping_from || 0,
                delivery_info: shop.delivery_info || '',
                shipping_methods: shop.shipping_methods || []
            };
            paymentData = {
                payment_methods: shop.payment_methods || [],
                cod_fee: shop.cod_fee || 0,
                bank_transfer_discount: shop.bank_transfer_discount || 0
            };
            returnsData = {
                return_days: shop.return_days || 14,
                return_policy: shop.return_policy || '',
                warranty_info: shop.warranty_info || ''
            };
        }
    });
    
    $: if (shop) {
        shopData = {
            name: shop.name || '',
            url: shop.url || '',
            description: shop.description || '',
            logo_url: shop.logo_url || '',
            email: shop.email || '',
            phone: shop.phone || ''
        };
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
    
    async function saveDelivery() {
        loading = true;
        message = null;
        
        const token = localStorage.getItem('vendor_token');
        
        try {
            const res = await fetch(`${API_BASE}/vendor/shop/delivery`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(deliveryData)
            });
            const data = await res.json();
            
            if (data.success) {
                message = { type: 'success', text: 'Nastavenia doručenia boli uložené' };
                shopStore.update(s => ({ ...s, ...deliveryData }));
            } else {
                message = { type: 'error', text: data.error || 'Chyba pri ukladaní' };
            }
        } catch (e) {
            message = { type: 'error', text: 'Chyba pri komunikácii so serverom' };
        }
        
        loading = false;
    }
    
    async function savePayment() {
        loading = true;
        message = null;
        
        const token = localStorage.getItem('vendor_token');
        
        try {
            const res = await fetch(`${API_BASE}/vendor/shop/payment`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });
            const data = await res.json();
            
            if (data.success) {
                message = { type: 'success', text: 'Platobné nastavenia boli uložené' };
                shopStore.update(s => ({ ...s, ...paymentData }));
            } else {
                message = { type: 'error', text: data.error || 'Chyba pri ukladaní' };
            }
        } catch (e) {
            message = { type: 'error', text: 'Chyba pri komunikácii so serverom' };
        }
        
        loading = false;
    }
    
    async function saveReturns() {
        loading = true;
        message = null;
        
        const token = localStorage.getItem('vendor_token');
        
        try {
            const res = await fetch(`${API_BASE}/vendor/shop/returns`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(returnsData)
            });
            const data = await res.json();
            
            if (data.success) {
                message = { type: 'success', text: 'Podmienky vrátenia boli uložené' };
                shopStore.update(s => ({ ...s, ...returnsData }));
            } else {
                message = { type: 'error', text: data.error || 'Chyba pri ukladaní' };
            }
        } catch (e) {
            message = { type: 'error', text: 'Chyba pri komunikácii so serverom' };
        }
        
        loading = false;
    }
    
    function toggleShipping(id) {
        if (deliveryData.shipping_methods.includes(id)) {
            deliveryData.shipping_methods = deliveryData.shipping_methods.filter(m => m !== id);
        } else {
            deliveryData.shipping_methods = [...deliveryData.shipping_methods, id];
        }
    }
    
    function togglePayment(id) {
        if (paymentData.payment_methods.includes(id)) {
            paymentData.payment_methods = paymentData.payment_methods.filter(m => m !== id);
        } else {
            paymentData.payment_methods = [...paymentData.payment_methods, id];
        }
    }
</script>

<div class="settings-page">
    <!-- Header -->
    <div class="page-header">
        <div class="header-content">
            <div class="header-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
            </div>
            <div>
                <h1>Nastavenia predaja</h1>
                <p class="subtitle">Konfigurácia vášho e-shopu a predajných podmienok</p>
            </div>
        </div>
    </div>
    
    {#if message}
        <div class="alert alert-{message.type}">
            <span class="alert-icon">{message.type === 'success' ? '✓' : '⚠'}</span>
            <span>{message.text}</span>
            <button class="alert-close" on:click={() => message = null}>×</button>
        </div>
    {/if}
    
    <!-- Tabs Navigation -->
    <div class="tabs-nav">
        <button class:active={activeTab === 'shop'} on:click={() => activeTab = 'shop'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Informácie o obchode
        </button>
        <button class:active={activeTab === 'delivery'} on:click={() => activeTab = 'delivery'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            Doručenie
        </button>
        <button class:active={activeTab === 'payment'} on:click={() => activeTab = 'payment'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
            Platby
        </button>
        <button class:active={activeTab === 'returns'} on:click={() => activeTab = 'returns'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            Vrátenie tovaru
        </button>
    </div>
    
    <!-- Tab Content -->
    <div class="tab-content">
        {#if activeTab === 'shop'}
            <div class="card">
                <div class="card-header">
                    <h2>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        </svg>
                        Základné informácie o obchode
                    </h2>
                    <p>Tieto údaje sa zobrazujú zákazníkom na porovnávači</p>
                </div>
                
                <form on:submit|preventDefault={saveShopInfo} class="form">
                    <div class="form-section">
                        <h3>Identifikácia obchodu</h3>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="shop_name">Názov obchodu *</label>
                                <input type="text" id="shop_name" bind:value={shopData.name} placeholder="Názov vášho e-shopu" required>
                                <span class="form-hint">Tento názov sa zobrazí zákazníkom</span>
                            </div>
                            
                            <div class="form-group">
                                <label for="shop_url">URL obchodu *</label>
                                <input type="url" id="shop_url" bind:value={shopData.url} placeholder="https://www.vas-eshop.sk" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="shop_description">Popis obchodu</label>
                            <textarea id="shop_description" bind:value={shopData.description} placeholder="Krátky popis vášho obchodu pre zákazníkov..." rows="3"></textarea>
                            <span class="form-hint">Max. 500 znakov</span>
                        </div>
                        
                        <div class="form-group">
                            <label for="logo_url">URL loga</label>
                            <div class="logo-input">
                                <input type="url" id="logo_url" bind:value={shopData.logo_url} placeholder="https://...">
                                {#if shopData.logo_url}
                                    <div class="logo-preview">
                                        <img src={shopData.logo_url} alt="Logo" on:error={(e) => e.target.style.display = 'none'}>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3>Kontaktné údaje</h3>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="shop_email">Kontaktný e-mail</label>
                                <input type="email" id="shop_email" bind:value={shopData.email} placeholder="info@vas-eshop.sk">
                            </div>
                            
                            <div class="form-group">
                                <label for="shop_phone">Telefón</label>
                                <input type="tel" id="shop_phone" bind:value={shopData.phone} placeholder="+421 900 000 000">
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
                                </svg>
                                Uložiť informácie
                            {/if}
                        </button>
                    </div>
                </form>
            </div>
        
        {:else if activeTab === 'delivery'}
            <div class="card">
                <div class="card-header">
                    <h2>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="1" y="3" width="15" height="13"></rect>
                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                            <circle cx="5.5" cy="18.5" r="2.5"></circle>
                            <circle cx="18.5" cy="18.5" r="2.5"></circle>
                        </svg>
                        Nastavenia doručenia
                    </h2>
                    <p>Konfigurácia dopravy a doručenia pre váš obchod</p>
                </div>
                
                <form on:submit|preventDefault={saveDelivery} class="form">
                    <div class="form-section">
                        <h3>Základné parametre</h3>
                        
                        <div class="form-row three">
                            <div class="form-group">
                                <label for="delivery_days">Štandardná doba doručenia (dni)</label>
                                <input type="number" id="delivery_days" bind:value={deliveryData.delivery_days} min="1" max="30">
                            </div>
                            
                            <div class="form-group">
                                <label for="min_order">Minimálna hodnota objednávky (€)</label>
                                <input type="number" id="min_order" bind:value={deliveryData.min_order_value} min="0" step="0.01">
                                <span class="form-hint">0 = bez minimálnej hodnoty</span>
                            </div>
                            
                            <div class="form-group">
                                <label for="free_shipping">Doprava zdarma od (€)</label>
                                <input type="number" id="free_shipping" bind:value={deliveryData.free_shipping_from} min="0" step="0.01">
                                <span class="form-hint">0 = bez dopravy zdarma</span>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="delivery_info">Informácie o doručení</label>
                            <textarea id="delivery_info" bind:value={deliveryData.delivery_info} placeholder="Informácie o spôsoboch a cenách doručenia..." rows="3"></textarea>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3>Spôsoby doručenia</h3>
                        <p class="section-desc">Vyberte všetky spôsoby doručenia, ktoré ponúkate</p>
                        
                        <div class="options-grid">
                            {#each shippingOptions as option}
                                <label class="option-card" class:selected={deliveryData.shipping_methods.includes(option.id)}>
                                    <input type="checkbox" checked={deliveryData.shipping_methods.includes(option.id)} on:change={() => toggleShipping(option.id)}>
                                    <span class="option-icon">{option.icon}</span>
                                    <span class="option-name">{option.name}</span>
                                    <span class="option-check">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </span>
                                </label>
                            {/each}
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary" disabled={loading}>
                            {#if loading}
                                <span class="spinner"></span> Ukladám...
                            {:else}
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                </svg>
                                Uložiť nastavenia doručenia
                            {/if}
                        </button>
                    </div>
                </form>
            </div>
        
        {:else if activeTab === 'payment'}
            <div class="card">
                <div class="card-header">
                    <h2>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                            <line x1="1" y1="10" x2="23" y2="10"></line>
                        </svg>
                        Platobné nastavenia
                    </h2>
                    <p>Konfigurácia platobných metód vášho obchodu</p>
                </div>
                
                <form on:submit|preventDefault={savePayment} class="form">
                    <div class="form-section">
                        <h3>Akceptované platobné metódy</h3>
                        <p class="section-desc">Vyberte všetky platobné metódy, ktoré akceptujete</p>
                        
                        <div class="options-grid">
                            {#each paymentOptions as option}
                                <label class="option-card" class:selected={paymentData.payment_methods.includes(option.id)}>
                                    <input type="checkbox" checked={paymentData.payment_methods.includes(option.id)} on:change={() => togglePayment(option.id)}>
                                    <span class="option-icon">{option.icon}</span>
                                    <span class="option-name">{option.name}</span>
                                    <span class="option-check">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </span>
                                </label>
                            {/each}
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3>Dodatočné poplatky a zľavy</h3>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="cod_fee">Poplatok za dobierku (€)</label>
                                <input type="number" id="cod_fee" bind:value={paymentData.cod_fee} min="0" step="0.01">
                                <span class="form-hint">0 = bez poplatku</span>
                            </div>
                            
                            <div class="form-group">
                                <label for="bank_discount">Zľava pri bankovom prevode (%)</label>
                                <input type="number" id="bank_discount" bind:value={paymentData.bank_transfer_discount} min="0" max="100" step="0.1">
                                <span class="form-hint">0 = bez zľavy</span>
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
                                </svg>
                                Uložiť platobné nastavenia
                            {/if}
                        </button>
                    </div>
                </form>
            </div>
        
        {:else if activeTab === 'returns'}
            <div class="card">
                <div class="card-header">
                    <h2>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="1 4 1 10 7 10"></polyline>
                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                        </svg>
                        Vrátenie tovaru a reklamácie
                    </h2>
                    <p>Nastavenia podmienok vrátenia a záručnej doby</p>
                </div>
                
                <form on:submit|preventDefault={saveReturns} class="form">
                    <div class="form-section">
                        <h3>Podmienky vrátenia</h3>
                        
                        <div class="form-group">
                            <label for="return_days">Lehota na vrátenie tovaru (dni)</label>
                            <input type="number" id="return_days" bind:value={returnsData.return_days} min="14" max="365">
                            <span class="form-hint">Zákonné minimum je 14 dní</span>
                        </div>
                        
                        <div class="form-group">
                            <label for="return_policy">Podmienky vrátenia</label>
                            <textarea id="return_policy" bind:value={returnsData.return_policy} placeholder="Popíšte podmienky vrátenia tovaru..." rows="4"></textarea>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3>Záručné podmienky</h3>
                        
                        <div class="form-group">
                            <label for="warranty_info">Informácie o záruke</label>
                            <textarea id="warranty_info" bind:value={returnsData.warranty_info} placeholder="Informácie o záručnej dobe a podmienkach reklamácie..." rows="4"></textarea>
                        </div>
                    </div>
                    
                    <div class="info-box">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        <div>
                            <strong>Legislatívna povinnosť</strong>
                            <p>Podľa zákona o ochrane spotrebiteľa máte povinnosť akceptovať vrátenie tovaru do 14 dní od jeho prevzatia bez udania dôvodu.</p>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary" disabled={loading}>
                            {#if loading}
                                <span class="spinner"></span> Ukladám...
                            {:else}
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                </svg>
                                Uložiť podmienky vrátenia
                            {/if}
                        </button>
                    </div>
                </form>
            </div>
        {/if}
    </div>
</div>

<style>
    .settings-page {
        padding: 0;
    }
    
    .page-header {
        background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
        color: white;
        padding: 2rem;
        border-radius: 16px;
        margin-bottom: 1.5rem;
    }
    
    .header-content {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .header-icon {
        width: 56px;
        height: 56px;
        background: rgba(255,255,255,0.15);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .page-header h1 {
        margin: 0;
        font-size: 1.75rem;
        font-weight: 700;
    }
    
    .subtitle {
        margin: 0.25rem 0 0 0;
        opacity: 0.85;
        font-size: 0.95rem;
    }
    
    /* Alert */
    .alert {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 1.25rem;
        border-radius: 10px;
        margin-bottom: 1.5rem;
        font-weight: 500;
    }
    
    .alert-success {
        background: #d4edda;
        color: #155724;
    }
    
    .alert-error {
        background: #f8d7da;
        color: #721c24;
    }
    
    .alert-icon {
        font-size: 1.25rem;
    }
    
    .alert-close {
        margin-left: auto;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        opacity: 0.5;
        line-height: 1;
    }
    
    .alert-close:hover {
        opacity: 1;
    }
    
    /* Tabs Navigation */
    .tabs-nav {
        display: flex;
        gap: 0.5rem;
        background: white;
        padding: 0.5rem;
        border-radius: 12px;
        margin-bottom: 1.5rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        overflow-x: auto;
    }
    
    .tabs-nav button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.25rem;
        background: none;
        border: none;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 500;
        color: #555;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
    }
    
    .tabs-nav button:hover {
        background: #f5f5f5;
        color: #333;
    }
    
    .tabs-nav button.active {
        background: #1976d2;
        color: white;
    }
    
    /* Card */
    .card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    
    .card-header {
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #eee;
    }
    
    .card-header h2 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0 0 0.25rem 0;
        font-size: 1.25rem;
        color: #333;
    }
    
    .card-header p {
        margin: 0;
        color: #666;
        font-size: 0.9rem;
    }
    
    /* Form */
    .form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
    
    .form-section {
        padding-bottom: 1.5rem;
        border-bottom: 1px solid #f0f0f0;
    }
    
    .form-section:last-of-type {
        border-bottom: none;
        padding-bottom: 0;
    }
    
    .form-section h3 {
        margin: 0 0 1rem 0;
        font-size: 1rem;
        font-weight: 600;
        color: #333;
    }
    
    .section-desc {
        margin: -0.5rem 0 1rem 0;
        font-size: 0.875rem;
        color: #666;
    }
    
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }
    
    .form-row.three {
        grid-template-columns: repeat(3, 1fr);
    }
    
    @media (max-width: 768px) {
        .form-row, .form-row.three {
            grid-template-columns: 1fr;
        }
    }
    
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        margin-bottom: 1rem;
    }
    
    .form-group:last-child {
        margin-bottom: 0;
    }
    
    .form-group label {
        font-size: 0.875rem;
        font-weight: 500;
        color: #444;
    }
    
    .form-group input,
    .form-group textarea,
    .form-group select {
        padding: 0.75rem 1rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 0.95rem;
        transition: border-color 0.2s, box-shadow 0.2s;
        font-family: inherit;
    }
    
    .form-group textarea {
        resize: vertical;
        min-height: 80px;
    }
    
    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
        outline: none;
        border-color: #1976d2;
        box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
    }
    
    .form-hint {
        font-size: 0.8rem;
        color: #888;
    }
    
    .form-actions {
        padding-top: 0.5rem;
    }
    
    /* Logo Input */
    .logo-input {
        display: flex;
        gap: 1rem;
        align-items: flex-start;
    }
    
    .logo-input input {
        flex: 1;
        padding: 0.75rem 1rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 0.95rem;
    }
    
    .logo-preview {
        width: 60px;
        height: 60px;
        border: 1px solid #ddd;
        border-radius: 8px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f9f9f9;
    }
    
    .logo-preview img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }
    
    /* Options Grid */
    .options-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 0.75rem;
    }
    
    .option-card {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem;
        background: #f9f9f9;
        border: 2px solid transparent;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .option-card:hover {
        background: #f0f0f0;
    }
    
    .option-card.selected {
        background: #e3f2fd;
        border-color: #1976d2;
    }
    
    .option-card input {
        display: none;
    }
    
    .option-icon {
        font-size: 1.75rem;
    }
    
    .option-name {
        font-size: 0.85rem;
        font-weight: 500;
        color: #333;
        text-align: center;
    }
    
    .option-check {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        width: 20px;
        height: 20px;
        background: #1976d2;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transform: scale(0.5);
        transition: all 0.2s;
    }
    
    .option-check svg {
        stroke: white;
    }
    
    .option-card.selected .option-check {
        opacity: 1;
        transform: scale(1);
    }
    
    /* Info Box */
    .info-box {
        display: flex;
        gap: 1rem;
        padding: 1rem 1.25rem;
        background: #fff8e1;
        border-radius: 10px;
        border-left: 4px solid #ffc107;
    }
    
    .info-box svg {
        flex-shrink: 0;
        color: #f57c00;
    }
    
    .info-box strong {
        display: block;
        margin-bottom: 0.25rem;
        color: #e65100;
    }
    
    .info-box p {
        margin: 0;
        font-size: 0.9rem;
        color: #5d4037;
    }
    
    /* Buttons */
    .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .btn-primary {
        background: #1976d2;
        color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
        background: #1565c0;
    }
    
    .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    .spinner {
        display: inline-block;
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
</style>
