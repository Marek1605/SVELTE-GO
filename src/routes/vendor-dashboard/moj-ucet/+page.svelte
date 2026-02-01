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
    let activeTab = 'profile';
    
    // Profile data
    let formData = {
        company_name: '',
        contact_person: '',
        phone: '',
        email: ''
    };
    
    // Billing data
    let billingData = {
        ico: '',
        dic: '',
        ic_dph: '',
        billing_address: '',
        billing_city: '',
        billing_zip: '',
        billing_country: 'SK'
    };
    
    // Password data
    let passwordData = {
        current: '',
        new: '',
        confirm: ''
    };
    
    // Notification settings
    let notifications = {
        email_orders: true,
        email_clicks: false,
        email_reports: true,
        email_news: true
    };
    
    // API settings
    let apiKey = '';
    let showApiKey = false;
    
    onMount(() => {
        if (vendor) {
            formData = {
                company_name: vendor.company_name || '',
                contact_person: vendor.contact_person || '',
                phone: vendor.phone || '',
                email: vendor.email || ''
            };
            billingData = {
                ico: vendor.ico || '',
                dic: vendor.dic || '',
                ic_dph: vendor.ic_dph || '',
                billing_address: vendor.billing_address || '',
                billing_city: vendor.billing_city || '',
                billing_zip: vendor.billing_zip || '',
                billing_country: vendor.billing_country || 'SK'
            };
            apiKey = vendor.api_key || '';
        }
    });
    
    $: if (vendor) {
        formData = {
            company_name: vendor.company_name || '',
            contact_person: vendor.contact_person || '',
            phone: vendor.phone || '',
            email: vendor.email || ''
        };
    }
    
    async function saveProfile() {
        loading = true;
        message = null;
        
        const token = localStorage.getItem('vendor_token');
        
        try {
            const res = await fetch(`${API_BASE}/vendor/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            
            if (data.success) {
                message = { type: 'success', text: 'Profil bol aktualizovaný' };
                vendorStore.update(v => ({ ...v, ...formData }));
            } else {
                message = { type: 'error', text: data.error || 'Chyba pri ukladaní' };
            }
        } catch (e) {
            message = { type: 'error', text: 'Chyba pri komunikácii so serverom' };
        }
        
        loading = false;
    }
    
    async function saveBilling() {
        loading = true;
        message = null;
        
        const token = localStorage.getItem('vendor_token');
        
        try {
            const res = await fetch(`${API_BASE}/vendor/billing`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(billingData)
            });
            const data = await res.json();
            
            if (data.success) {
                message = { type: 'success', text: 'Fakturačné údaje boli aktualizované' };
                vendorStore.update(v => ({ ...v, ...billingData }));
            } else {
                message = { type: 'error', text: data.error || 'Chyba pri ukladaní' };
            }
        } catch (e) {
            message = { type: 'error', text: 'Chyba pri komunikácii so serverom' };
        }
        
        loading = false;
    }
    
    async function changePassword() {
        if (passwordData.new.length < 6) {
            message = { type: 'error', text: 'Nové heslo musí mať minimálne 6 znakov' };
            return;
        }
        
        if (passwordData.new !== passwordData.confirm) {
            message = { type: 'error', text: 'Heslá sa nezhodujú' };
            return;
        }
        
        loading = true;
        message = null;
        
        const token = localStorage.getItem('vendor_token');
        
        try {
            const res = await fetch(`${API_BASE}/vendor/password`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    current_password: passwordData.current,
                    new_password: passwordData.new
                })
            });
            const data = await res.json();
            
            if (data.success) {
                message = { type: 'success', text: 'Heslo bolo zmenené' };
                passwordData = { current: '', new: '', confirm: '' };
            } else {
                message = { type: 'error', text: data.error || 'Chyba pri zmene hesla' };
            }
        } catch (e) {
            message = { type: 'error', text: 'Chyba pri komunikácii so serverom' };
        }
        
        loading = false;
    }
    
    async function saveNotifications() {
        loading = true;
        message = null;
        
        const token = localStorage.getItem('vendor_token');
        
        try {
            const res = await fetch(`${API_BASE}/vendor/notifications`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(notifications)
            });
            const data = await res.json();
            
            if (data.success) {
                message = { type: 'success', text: 'Nastavenia notifikácií boli uložené' };
            } else {
                message = { type: 'error', text: data.error || 'Chyba pri ukladaní' };
            }
        } catch (e) {
            message = { type: 'error', text: 'Chyba pri komunikácii so serverom' };
        }
        
        loading = false;
    }
    
    async function regenerateApiKey() {
        if (!confirm('Naozaj chcete vygenerovať nový API kľúč? Starý kľúč prestane fungovať.')) return;
        
        loading = true;
        const token = localStorage.getItem('vendor_token');
        
        try {
            const res = await fetch(`${API_BASE}/vendor/api-key`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            
            if (data.success) {
                apiKey = data.api_key;
                message = { type: 'success', text: 'Nový API kľúč bol vygenerovaný' };
            } else {
                message = { type: 'error', text: data.error || 'Chyba pri generovaní' };
            }
        } catch (e) {
            message = { type: 'error', text: 'Chyba pri komunikácii so serverom' };
        }
        
        loading = false;
    }
    
    function copyApiKey() {
        navigator.clipboard.writeText(apiKey);
        message = { type: 'success', text: 'API kľúč bol skopírovaný' };
    }
    
    function getStatusBadge(status) {
        const badges = {
            'active': { class: 'success', text: 'Aktívny', icon: '✓' },
            'pending': { class: 'warning', text: 'Čaká na schválenie', icon: '⏳' },
            'suspended': { class: 'danger', text: 'Pozastavený', icon: '⚠' }
        };
        return badges[status] || badges['pending'];
    }
</script>

<div class="account-page">
    <!-- Header -->
    <div class="page-header">
        <div class="header-content">
            <div class="header-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </div>
            <div>
                <h1>Môj účet</h1>
                <p class="subtitle">Správa vášho profilu a nastavení účtu</p>
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
    
    <div class="account-layout">
        <!-- Sidebar with Account Status -->
        <div class="account-sidebar">
            <div class="status-card">
                <h3>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="20" x2="18" y2="10"></line>
                        <line x1="12" y1="20" x2="12" y2="4"></line>
                        <line x1="6" y1="20" x2="6" y2="14"></line>
                    </svg>
                    Stav účtu
                </h3>
                
                <div class="status-grid">
                    <div class="status-item">
                        <span class="status-label">Stav</span>
                        {@const badge = getStatusBadge(vendor?.status)}
                        <span class="status-badge badge-{badge.class}">
                            {badge.icon} {badge.text}
                        </span>
                    </div>
                    
                    <div class="status-item">
                        <span class="status-label">Režim</span>
                        <span class="status-badge badge-info">
                            {#if vendor?.subscription === 'premium'}
                                ⭐ PREMIUM
                            {:else}
                                🆓 FREE
                            {/if}
                        </span>
                    </div>
                    
                    <div class="status-item">
                        <span class="status-label">Kredit</span>
                        <span class="status-value credit">{(vendor?.credit || 0).toFixed(2)} €</span>
                    </div>
                    
                    <div class="status-item">
                        <span class="status-label">Produktov</span>
                        <span class="status-value">{vendor?.product_count || 0}</span>
                    </div>
                    
                    <div class="status-item">
                        <span class="status-label">Obchodov</span>
                        <span class="status-value">{vendor?.shop_count || 1}</span>
                    </div>
                    
                    <div class="status-item">
                        <span class="status-label">Registrácia</span>
                        <span class="status-value small">
                            {vendor?.created_at ? new Date(vendor.created_at).toLocaleDateString('sk-SK') : '-'}
                        </span>
                    </div>
                </div>
                
                <a href="/vendor-dashboard/ppc" class="btn btn-upgrade">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="16"></line>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                    Dobiť kredit
                </a>
            </div>
            
            <!-- Navigation Tabs -->
            <nav class="account-nav">
                <button class:active={activeTab === 'profile'} on:click={() => activeTab = 'profile'}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Základné údaje
                </button>
                <button class:active={activeTab === 'billing'} on:click={() => activeTab = 'billing'}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                        <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                    Fakturačné údaje
                </button>
                <button class:active={activeTab === 'password'} on:click={() => activeTab = 'password'}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    Zmena hesla
                </button>
                <button class:active={activeTab === 'notifications'} on:click={() => activeTab = 'notifications'}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    Notifikácie
                </button>
                <button class:active={activeTab === 'api'} on:click={() => activeTab = 'api'}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="16 18 22 12 16 6"></polyline>
                        <polyline points="8 6 2 12 8 18"></polyline>
                    </svg>
                    API prístup
                </button>
            </nav>
        </div>
        
        <!-- Main Content -->
        <div class="account-content">
            {#if activeTab === 'profile'}
                <div class="card">
                    <div class="card-header">
                        <h2>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            Základné údaje
                        </h2>
                        <p>Upravte svoje kontaktné informácie</p>
                    </div>
                    
                    <form on:submit|preventDefault={saveProfile} class="form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="company_name">Názov spoločnosti *</label>
                                <input type="text" id="company_name" bind:value={formData.company_name} placeholder="Názov vašej firmy" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="contact_person">Kontaktná osoba *</label>
                                <input type="text" id="contact_person" bind:value={formData.contact_person} placeholder="Meno a priezvisko" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="phone">Telefón</label>
                                <input type="tel" id="phone" bind:value={formData.phone} placeholder="+421 900 000 000">
                            </div>
                            
                            <div class="form-group">
                                <label for="email">E-mail</label>
                                <input type="email" id="email" bind:value={formData.email} disabled>
                                <span class="form-hint">E-mail nie je možné zmeniť</span>
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
                                    </svg>
                                    Uložiť zmeny
                                {/if}
                            </button>
                        </div>
                    </form>
                </div>
            
            {:else if activeTab === 'billing'}
                <div class="card">
                    <div class="card-header">
                        <h2>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                <line x1="1" y1="10" x2="23" y2="10"></line>
                            </svg>
                            Fakturačné údaje
                        </h2>
                        <p>Údaje pre vystavenie faktúr</p>
                    </div>
                    
                    <form on:submit|preventDefault={saveBilling} class="form">
                        <div class="form-row three">
                            <div class="form-group">
                                <label for="ico">IČO</label>
                                <input type="text" id="ico" bind:value={billingData.ico} placeholder="12345678">
                            </div>
                            
                            <div class="form-group">
                                <label for="dic">DIČ</label>
                                <input type="text" id="dic" bind:value={billingData.dic} placeholder="2012345678">
                            </div>
                            
                            <div class="form-group">
                                <label for="ic_dph">IČ DPH</label>
                                <input type="text" id="ic_dph" bind:value={billingData.ic_dph} placeholder="SK2012345678">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="billing_address">Fakturačná adresa</label>
                            <input type="text" id="billing_address" bind:value={billingData.billing_address} placeholder="Ulica a číslo">
                        </div>
                        
                        <div class="form-row three">
                            <div class="form-group">
                                <label for="billing_city">Mesto</label>
                                <input type="text" id="billing_city" bind:value={billingData.billing_city} placeholder="Mesto">
                            </div>
                            
                            <div class="form-group">
                                <label for="billing_zip">PSČ</label>
                                <input type="text" id="billing_zip" bind:value={billingData.billing_zip} placeholder="12345">
                            </div>
                            
                            <div class="form-group">
                                <label for="billing_country">Krajina</label>
                                <select id="billing_country" bind:value={billingData.billing_country}>
                                    <option value="SK">Slovensko</option>
                                    <option value="CZ">Česká republika</option>
                                    <option value="HU">Maďarsko</option>
                                    <option value="PL">Poľsko</option>
                                    <option value="AT">Rakúsko</option>
                                </select>
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
                                    Uložiť fakturačné údaje
                                {/if}
                            </button>
                        </div>
                    </form>
                </div>
            
            {:else if activeTab === 'password'}
                <div class="card">
                    <div class="card-header">
                        <h2>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            Zmena hesla
                        </h2>
                        <p>Pre vašu bezpečnosť zmeňte heslo pravidelne</p>
                    </div>
                    
                    <form on:submit|preventDefault={changePassword} class="form">
                        <div class="form-group">
                            <label for="current_password">Aktuálne heslo</label>
                            <input type="password" id="current_password" bind:value={passwordData.current} required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="new_password">Nové heslo</label>
                                <input type="password" id="new_password" bind:value={passwordData.new} minlength="6" required>
                                <span class="form-hint">Minimálne 6 znakov</span>
                            </div>
                            
                            <div class="form-group">
                                <label for="confirm_password">Potvrdenie hesla</label>
                                <input type="password" id="confirm_password" bind:value={passwordData.confirm} required>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary" disabled={loading}>
                                {#if loading}
                                    <span class="spinner"></span> Mením heslo...
                                {:else}
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                    Zmeniť heslo
                                {/if}
                            </button>
                        </div>
                    </form>
                </div>
            
            {:else if activeTab === 'notifications'}
                <div class="card">
                    <div class="card-header">
                        <h2>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                            Nastavenie notifikácií
                        </h2>
                        <p>Zvoľte aké e-mailové notifikácie chcete dostávať</p>
                    </div>
                    
                    <form on:submit|preventDefault={saveNotifications} class="form">
                        <div class="toggle-list">
                            <label class="toggle-item">
                                <div class="toggle-info">
                                    <span class="toggle-title">Nové objednávky</span>
                                    <span class="toggle-desc">Upozornenia pri nových objednávkach z vašich produktov</span>
                                </div>
                                <input type="checkbox" bind:checked={notifications.email_orders}>
                                <span class="toggle-switch"></span>
                            </label>
                            
                            <label class="toggle-item">
                                <div class="toggle-info">
                                    <span class="toggle-title">Denné reporty kliknutí</span>
                                    <span class="toggle-desc">Denný súhrn kliknutí na vaše produkty</span>
                                </div>
                                <input type="checkbox" bind:checked={notifications.email_clicks}>
                                <span class="toggle-switch"></span>
                            </label>
                            
                            <label class="toggle-item">
                                <div class="toggle-info">
                                    <span class="toggle-title">Týždenné reporty</span>
                                    <span class="toggle-desc">Týždenný súhrn výkonu vašich obchodov</span>
                                </div>
                                <input type="checkbox" bind:checked={notifications.email_reports}>
                                <span class="toggle-switch"></span>
                            </label>
                            
                            <label class="toggle-item">
                                <div class="toggle-info">
                                    <span class="toggle-title">Novinky a tipy</span>
                                    <span class="toggle-desc">Informácie o nových funkciách a tipy na optimalizáciu</span>
                                </div>
                                <input type="checkbox" bind:checked={notifications.email_news}>
                                <span class="toggle-switch"></span>
                            </label>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary" disabled={loading}>
                                {#if loading}
                                    <span class="spinner"></span> Ukladám...
                                {:else}
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                    </svg>
                                    Uložiť nastavenia
                                {/if}
                            </button>
                        </div>
                    </form>
                </div>
            
            {:else if activeTab === 'api'}
                <div class="card">
                    <div class="card-header">
                        <h2>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="16 18 22 12 16 6"></polyline>
                                <polyline points="8 6 2 12 8 18"></polyline>
                            </svg>
                            API prístup
                        </h2>
                        <p>Integrujte váš e-shop priamo s MegaPrice API</p>
                    </div>
                    
                    <div class="api-section">
                        <div class="api-key-box">
                            <label>Váš API kľúč</label>
                            <div class="api-key-input">
                                <input type={showApiKey ? 'text' : 'password'} value={apiKey || 'Zatiaľ nevygenerovaný'} readonly>
                                <button type="button" class="btn-icon" on:click={() => showApiKey = !showApiKey} title={showApiKey ? 'Skryť' : 'Zobraziť'}>
                                    {#if showApiKey}
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    {:else}
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    {/if}
                                </button>
                                {#if apiKey}
                                    <button type="button" class="btn-icon" on:click={copyApiKey} title="Kopírovať">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                        </svg>
                                    </button>
                                {/if}
                            </div>
                        </div>
                        
                        <button type="button" class="btn btn-secondary" on:click={regenerateApiKey} disabled={loading}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="23 4 23 10 17 10"></polyline>
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                            </svg>
                            {apiKey ? 'Vygenerovať nový kľúč' : 'Vygenerovať API kľúč'}
                        </button>
                        
                        <div class="api-docs">
                            <h4>Dokumentácia API</h4>
                            <p>Pre integráciu s vašim e-shopom použite nasledujúce endpointy:</p>
                            
                            <div class="endpoint">
                                <code>GET /api/v1/products</code>
                                <span>Zoznam vašich produktov</span>
                            </div>
                            
                            <div class="endpoint">
                                <code>POST /api/v1/products</code>
                                <span>Pridanie nového produktu</span>
                            </div>
                            
                            <div class="endpoint">
                                <code>PUT /api/v1/products/:id</code>
                                <span>Aktualizácia produktu</span>
                            </div>
                            
                            <a href="/docs/api" class="btn btn-link" target="_blank">
                                Kompletná dokumentácia →
                            </a>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    .account-page {
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
    
    /* Layout */
    .account-layout {
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 1.5rem;
    }
    
    @media (max-width: 900px) {
        .account-layout {
            grid-template-columns: 1fr;
        }
    }
    
    /* Sidebar */
    .account-sidebar {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .status-card {
        background: white;
        border-radius: 12px;
        padding: 1.25rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    
    .status-card h3 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0 0 1rem 0;
        font-size: 1rem;
        color: #333;
    }
    
    .status-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
        margin-bottom: 1rem;
    }
    
    .status-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    
    .status-label {
        font-size: 0.75rem;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .status-value {
        font-size: 1.1rem;
        font-weight: 600;
        color: #333;
    }
    
    .status-value.credit {
        color: #0ea5e9;
    }
    
    .status-value.small {
        font-size: 0.9rem;
    }
    
    .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.25rem 0.5rem;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;
    }
    
    .badge-success {
        background: #d4edda;
        color: #155724;
    }
    
    .badge-warning {
        background: #fff3cd;
        color: #856404;
    }
    
    .badge-danger {
        background: #f8d7da;
        color: #721c24;
    }
    
    .badge-info {
        background: #e3f2fd;
        color: #1565c0;
    }
    
    .btn-upgrade {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        width: 100%;
        padding: 0.75rem;
        background: linear-gradient(135deg, #0ea5e9, #0284c7);
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
    }
    
    .btn-upgrade:hover {
        background: linear-gradient(135deg, #0284c7, #0369a1);
    }
    
    /* Navigation */
    .account-nav {
        background: white;
        border-radius: 12px;
        padding: 0.5rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    
    .account-nav button {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.75rem 1rem;
        background: none;
        border: none;
        border-radius: 8px;
        font-size: 0.9rem;
        color: #555;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .account-nav button:hover {
        background: #f5f5f5;
        color: #333;
    }
    
    .account-nav button.active {
        background: #e3f2fd;
        color: #1976d2;
        font-weight: 600;
    }
    
    /* Content */
    .account-content {
        min-width: 0;
    }
    
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
        gap: 1.25rem;
    }
    
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }
    
    .form-row.three {
        grid-template-columns: repeat(3, 1fr);
    }
    
    @media (max-width: 600px) {
        .form-row, .form-row.three {
            grid-template-columns: 1fr;
        }
    }
    
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
    }
    
    .form-group label {
        font-size: 0.875rem;
        font-weight: 500;
        color: #444;
    }
    
    .form-group input,
    .form-group select {
        padding: 0.75rem 1rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 0.95rem;
        transition: border-color 0.2s, box-shadow 0.2s;
    }
    
    .form-group input:focus,
    .form-group select:focus {
        outline: none;
        border-color: #1976d2;
        box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
    }
    
    .form-group input:disabled {
        background: #f5f5f5;
        color: #888;
    }
    
    .form-hint {
        font-size: 0.8rem;
        color: #888;
    }
    
    .form-actions {
        padding-top: 0.5rem;
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
    
    .btn-secondary {
        background: #f5f5f5;
        color: #333;
        border: 1px solid #ddd;
    }
    
    .btn-secondary:hover:not(:disabled) {
        background: #eee;
    }
    
    .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    .btn-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 8px;
        cursor: pointer;
        color: #555;
    }
    
    .btn-icon:hover {
        background: #eee;
        color: #333;
    }
    
    .btn-link {
        background: none;
        color: #1976d2;
        padding: 0;
        text-decoration: none;
    }
    
    .btn-link:hover {
        text-decoration: underline;
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
    
    /* Toggle List */
    .toggle-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
    
    .toggle-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 1.25rem;
        background: #f9f9f9;
        border-radius: 10px;
        cursor: pointer;
        transition: background 0.2s;
    }
    
    .toggle-item:hover {
        background: #f0f0f0;
    }
    
    .toggle-info {
        flex: 1;
    }
    
    .toggle-title {
        display: block;
        font-weight: 600;
        color: #333;
        margin-bottom: 0.15rem;
    }
    
    .toggle-desc {
        display: block;
        font-size: 0.85rem;
        color: #666;
    }
    
    .toggle-item input {
        display: none;
    }
    
    .toggle-switch {
        position: relative;
        width: 48px;
        height: 26px;
        background: #ddd;
        border-radius: 13px;
        transition: background 0.2s;
    }
    
    .toggle-switch::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 20px;
        height: 20px;
        background: white;
        border-radius: 50%;
        transition: transform 0.2s;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    
    .toggle-item input:checked + .toggle-switch {
        background: #4caf50;
    }
    
    .toggle-item input:checked + .toggle-switch::after {
        transform: translateX(22px);
    }
    
    /* API Section */
    .api-section {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
    
    .api-key-box label {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        color: #444;
        margin-bottom: 0.5rem;
    }
    
    .api-key-input {
        display: flex;
        gap: 0.5rem;
    }
    
    .api-key-input input {
        flex: 1;
        padding: 0.75rem 1rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-family: monospace;
        font-size: 0.9rem;
        background: #f5f5f5;
    }
    
    .api-docs {
        background: #f9f9f9;
        border-radius: 10px;
        padding: 1.25rem;
    }
    
    .api-docs h4 {
        margin: 0 0 0.5rem 0;
        font-size: 1rem;
        color: #333;
    }
    
    .api-docs > p {
        margin: 0 0 1rem 0;
        font-size: 0.9rem;
        color: #666;
    }
    
    .endpoint {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem 1rem;
        background: white;
        border-radius: 6px;
        margin-bottom: 0.5rem;
    }
    
    .endpoint code {
        font-family: monospace;
        font-size: 0.85rem;
        color: #1976d2;
        background: #e3f2fd;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
    }
    
    .endpoint span {
        font-size: 0.85rem;
        color: #666;
    }
    
    .api-docs .btn-link {
        margin-top: 0.5rem;
    }
</style>
