<script>
    import { getContext, onMount } from 'svelte';
    
    const vendorStore = getContext('vendor');
    const API_BASE = getContext('API_BASE');
    
    $: vendor = $vendorStore;
    
    let activeTab = 'profile';
    let loading = false;
    let message = null;
    
    let formData = {
        company_name: '',
        contact_person: '',
        phone: '',
        email: ''
    };
    
    let billingData = {
        billing_name: '',
        ico: '',
        dic: '',
        ic_dph: '',
        street: '',
        city: '',
        zip: '',
        country: 'SK',
        billing_email: '',
        billing_phone: '',
        vat_payer: false,
        vat_payer_type: 'standard'
    };
    let billingLocked = false;
    let billingCompleted = false;
    let icoLookupLoading = false;
    let creditBonusShown = false;
    
    let passwordData = {
        current_password: '',
        new_password: '',
        confirm_password: ''
    };
    
    let notifications = {
        email_orders: true,
        email_marketing: false,
        email_reports: true
    };
    
    let apiKey = '';
    
    onMount(() => {
        if (vendor) {
            formData = {
                company_name: vendor.company_name || '',
                contact_person: vendor.contact_person || '',
                phone: vendor.phone || '',
                email: vendor.email || ''
            };
            apiKey = vendor.api_key || '';
        }
        loadBillingData();
    });
    
    async function loadBillingData() {
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(`${API_BASE}/vendor/billing-data`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                billingData = {
                    billing_name: data.data.billing_name || '',
                    ico: data.data.ico || '',
                    dic: data.data.dic || '',
                    ic_dph: data.data.ic_dph || '',
                    street: data.data.street || '',
                    city: data.data.city || '',
                    zip: data.data.zip || '',
                    country: data.data.country || 'SK',
                    billing_email: data.data.billing_email || '',
                    billing_phone: data.data.billing_phone || '',
                    vat_payer: data.data.vat_payer || false,
                    vat_payer_type: data.data.vat_payer_type || 'standard'
                };
                billingLocked = data.data.billing_locked || false;
                billingCompleted = data.data.billing_completed || false;
            }
        } catch (e) { console.error('Failed to load billing', e); }
    }
    
    async function lookupICO() {
        if (!billingData.ico || billingData.ico.length < 6) {
            message = { type: 'error', text: 'Zadajte platné IČO (min. 6 znakov)' };
            return;
        }
        icoLookupLoading = true;
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(`${API_BASE}/vendor/ico-lookup?ico=${billingData.ico}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.data?.found) {
                const d = data.data;
                billingData.billing_name = d.company_name || billingData.billing_name;
                billingData.street = d.street || billingData.street;
                billingData.city = d.city || billingData.city;
                billingData.zip = d.postal_code || billingData.zip;
                billingData.dic = d.dic || billingData.dic;
                billingData.ic_dph = d.ic_dph || billingData.ic_dph;
                if (d.ic_dph) billingData.vat_payer = true;
                message = { type: 'success', text: `Údaje predvyplnené z registra: ${d.company_name}` };
            } else {
                message = { type: 'error', text: 'IČO nenájdené v registri. Vyplňte údaje manuálne.' };
            }
        } catch (e) {
            message = { type: 'error', text: 'Chyba pri vyhľadávaní IČO' };
        }
        icoLookupLoading = false;
    }
    
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
                message = { type: 'success', text: 'Profil bol úspešne uložený' };
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
        if (billingLocked) {
            message = { type: 'error', text: 'Fakturačné údaje sú uzamknuté. Pre zmenu kontaktujte fakturacia@megabuy.sk' };
            return;
        }
        
        if (!billingData.billing_name || !billingData.ico || !billingData.street || !billingData.city || !billingData.zip) {
            message = { type: 'error', text: 'Vyplňte všetky povinné polia (obchodné meno, IČO, adresa)' };
            return;
        }
        
        if (!confirm('Po uložení nebude možné údaje meniť priamo. Zmenu bude možné vykonať cez e-mail fakturacia@megabuy.sk. Pokračovať?')) {
            return;
        }
        
        loading = true;
        message = null;
        
        const token = localStorage.getItem('vendor_token');
        
        try {
            const res = await fetch(`${API_BASE}/vendor/billing-data`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(billingData)
            });
            const data = await res.json();
            
            if (data.success) {
                billingLocked = true;
                billingCompleted = true;
                if (data.credit_granted) {
                    creditBonusShown = true;
                    message = { type: 'success', text: `Fakturačné údaje uložené. 🎁 Bonus ${data.credit_amount} € bol pripísaný na váš kredit!` };
                } else {
                    message = { type: 'success', text: 'Fakturačné údaje boli uložené' };
                }
                vendorStore.update(v => ({ ...v, billing_completed: true }));
            } else {
                message = { type: 'error', text: data.error || 'Chyba pri ukladaní' };
            }
        } catch (e) {
            message = { type: 'error', text: 'Chyba pri komunikácii so serverom' };
        }
        
        loading = false;
    }
    
    async function changePassword() {
        if (passwordData.new_password !== passwordData.confirm_password) {
            message = { type: 'error', text: 'Heslá sa nezhodujú' };
            return;
        }
        
        if (passwordData.new_password.length < 6) {
            message = { type: 'error', text: 'Heslo musí mať aspoň 6 znakov' };
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
                    current_password: passwordData.current_password,
                    new_password: passwordData.new_password
                })
            });
            const data = await res.json();
            
            if (data.success) {
                message = { type: 'success', text: 'Heslo bolo zmenené' };
                passwordData = { current_password: '', new_password: '', confirm_password: '' };
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
        if (!confirm('Naozaj chcete vygenerovať nový API kľúč? Starý kľúč prestane fungovať.')) {
            return;
        }
        
        loading = true;
        
        const token = localStorage.getItem('vendor_token');
        
        try {
            const res = await fetch(`${API_BASE}/vendor/api-key`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
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
</script>

<div class="account-page">
    
    {#if message}
        <div class="alert alert-{message.type}">
            <span class="alert-icon">{message.type === 'success' ? '✓' : '⚠'}</span>
            <span>{message.text}</span>
            <button class="alert-close" on:click={() => message = null}>×</button>
        </div>
    {/if}
    
    <div class="content-grid">
        <div class="main-content">
            <div class="tabs-nav">
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
            </div>
            
            <div class="tab-content">
                {#if activeTab === 'profile'}
                    <div class="card">
                        <div class="card-header">
                            <h2>Základné údaje</h2>
                            <p>Vaše kontaktné informácie</p>
                        </div>
                        
                        <form on:submit|preventDefault={saveProfile} class="form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="company_name">Názov firmy / E-shopu</label>
                                    <input type="text" id="company_name" bind:value={formData.company_name} placeholder="Váš e-shop s.r.o.">
                                </div>
                                
                                <div class="form-group">
                                    <label for="contact_person">Kontaktná osoba</label>
                                    <input type="text" id="contact_person" bind:value={formData.contact_person} placeholder="Meno a priezvisko">
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
                                    {#if loading}Ukladám...{:else}Uložiť zmeny{/if}
                                </button>
                            </div>
                        </form>
                    </div>
                
                {:else if activeTab === 'billing'}
                    <div class="card">
                        <div class="card-header">
                            <h2>Fakturačné údaje</h2>
                            <p>Údaje pre faktúry a daňové doklady</p>
                        </div>
                        
                        {#if billingLocked}
                            <!-- READ-ONLY Heureka-style view -->
                            <div class="billing-locked-view">
                                <div class="locked-badge">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                    Fakturačné údaje sú uložené
                                </div>
                                
                                <div class="billing-readonly-grid">
                                    <div class="billing-field">
                                        <span class="field-label">Obchodné meno</span>
                                        <span class="field-value">{billingData.billing_name || '—'}</span>
                                    </div>
                                    <div class="billing-field">
                                        <span class="field-label">IČO</span>
                                        <span class="field-value">{billingData.ico || '—'}</span>
                                    </div>
                                    <div class="billing-field">
                                        <span class="field-label">DIČ</span>
                                        <span class="field-value">{billingData.dic || '—'}</span>
                                    </div>
                                    <div class="billing-field">
                                        <span class="field-label">IČ DPH</span>
                                        <span class="field-value">{billingData.ic_dph || '—'}</span>
                                    </div>
                                    <div class="billing-field">
                                        <span class="field-label">Platca DPH</span>
                                        <span class="field-value">{billingData.vat_payer ? (billingData.vat_payer_type === 'paragraph_7' ? 'Áno (§7 — registrácia podľa DPH)' : 'Áno (klasický platca)') : 'Nie'}</span>
                                    </div>
                                    <div class="billing-field full-width">
                                        <span class="field-label">Adresa</span>
                                        <span class="field-value">{billingData.street}, {billingData.zip} {billingData.city}, {billingData.country === 'SK' ? 'Slovensko' : billingData.country === 'CZ' ? 'Česko' : billingData.country}</span>
                                    </div>
                                    <div class="billing-field">
                                        <span class="field-label">Fakturačný e-mail</span>
                                        <span class="field-value">{billingData.billing_email || '—'}</span>
                                    </div>
                                    <div class="billing-field">
                                        <span class="field-label">Telefón</span>
                                        <span class="field-value">{billingData.billing_phone || '—'}</span>
                                    </div>
                                </div>
                                
                                <div class="change-request-box">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                        <polyline points="22,6 12,13 2,6"></polyline>
                                    </svg>
                                    <div>
                                        <strong>Potrebujete zmeniť fakturačné údaje?</strong>
                                        <p>Napíšte nám na <a href="mailto:fakturacia@megabuy.sk">fakturacia@megabuy.sk</a> s popisom požadovanej zmeny.</p>
                                    </div>
                                </div>
                            </div>
                        {:else}
                            <!-- EDITABLE form with ICO auto-fill -->
                            {#if !billingCompleted}
                                <div class="billing-bonus-banner">
                                    <span class="bonus-emoji">🎁</span>
                                    <div>
                                        <strong>Vyplňte fakturačné údaje a získajte 100 € kredit!</strong>
                                        <p>Po prvom uložení fakturačných údajov vám automaticky pripíšeme 100 € bonus na PPC kredit.</p>
                                    </div>
                                </div>
                            {/if}
                            
                            <form on:submit|preventDefault={saveBilling} class="form">
                                <!-- ICO lookup -->
                                <div class="ico-lookup-row">
                                    <div class="form-group" style="flex:1">
                                        <label for="ico">IČO *</label>
                                        <input type="text" id="ico" bind:value={billingData.ico} placeholder="12345678" required>
                                    </div>
                                    <button type="button" class="btn btn-secondary ico-btn" on:click={lookupICO} disabled={icoLookupLoading || !billingData.ico}>
                                        {#if icoLookupLoading}
                                            <span class="spinner-sm"></span>
                                        {:else}
                                            🔍
                                        {/if}
                                        Vyhľadať v registri
                                    </button>
                                </div>
                                
                                <div class="form-group">
                                    <label for="billing_name">Obchodné meno / Názov firmy *</label>
                                    <input type="text" id="billing_name" bind:value={billingData.billing_name} placeholder="Firma s.r.o." required>
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="dic">DIČ</label>
                                        <input type="text" id="dic" bind:value={billingData.dic} placeholder="2012345678">
                                    </div>
                                    <div class="form-group">
                                        <label for="ic_dph">IČ DPH</label>
                                        <input type="text" id="ic_dph" bind:value={billingData.ic_dph} placeholder="SK2012345678">
                                    </div>
                                </div>
                                
                                <!-- VAT Payer toggle -->
                                <div class="vat-section">
                                    <label class="vat-toggle-label">
                                        <span>Ste platca DPH?</span>
                                        <label class="toggle">
                                            <input type="checkbox" bind:checked={billingData.vat_payer}>
                                            <span class="toggle-slider"></span>
                                        </label>
                                    </label>
                                    
                                    {#if billingData.vat_payer}
                                        <div class="vat-type-options">
                                            <label class="radio-label">
                                                <input type="radio" bind:group={billingData.vat_payer_type} value="standard">
                                                <span>Klasický platca DPH</span>
                                            </label>
                                            <label class="radio-label">
                                                <input type="radio" bind:group={billingData.vat_payer_type} value="paragraph_7">
                                                <span>Registrácia podľa §7 (len DPH z dovozu služieb)</span>
                                            </label>
                                        </div>
                                    {/if}
                                </div>
                                
                                <div class="form-group">
                                    <label for="street">Ulica a číslo *</label>
                                    <input type="text" id="street" bind:value={billingData.street} placeholder="Hlavná 1" required>
                                </div>
                                
                                <div class="form-row three">
                                    <div class="form-group">
                                        <label for="city">Mesto *</label>
                                        <input type="text" id="city" bind:value={billingData.city} placeholder="Bratislava" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="zip">PSČ *</label>
                                        <input type="text" id="zip" bind:value={billingData.zip} placeholder="81101" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="country">Krajina</label>
                                        <select id="country" bind:value={billingData.country}>
                                            <option value="SK">Slovensko</option>
                                            <option value="CZ">Česko</option>
                                            <option value="HU">Maďarsko</option>
                                            <option value="PL">Poľsko</option>
                                            <option value="AT">Rakúsko</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="billing_email">Fakturačný e-mail</label>
                                        <input type="email" id="billing_email" bind:value={billingData.billing_email} placeholder="fakturacia@firma.sk">
                                    </div>
                                    <div class="form-group">
                                        <label for="billing_phone">Telefón</label>
                                        <input type="text" id="billing_phone" bind:value={billingData.billing_phone} placeholder="+421 900 000 000">
                                    </div>
                                </div>
                                
                                <div class="lock-warning">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                        <line x1="12" y1="9" x2="12" y2="13"></line>
                                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                    </svg>
                                    <span>Po uložení bude zmena možná len cez e-mail na <a href="mailto:fakturacia@megabuy.sk">fakturacia@megabuy.sk</a></span>
                                </div>
                                
                                <div class="form-actions">
                                    <button type="submit" class="btn btn-primary" disabled={loading}>
                                        {#if loading}Ukladám...{:else}💾 Uložiť fakturačné údaje{/if}
                                    </button>
                                </div>
                            </form>
                        {/if}
                    </div>
                
                {:else if activeTab === 'password'}
                    <div class="card">
                        <div class="card-header">
                            <h2>Zmena hesla</h2>
                            <p>Aktualizujte svoje prihlasovacie heslo</p>
                        </div>
                        
                        <form on:submit|preventDefault={changePassword} class="form">
                            <div class="form-group">
                                <label for="current_password">Aktuálne heslo</label>
                                <input type="password" id="current_password" bind:value={passwordData.current_password} required>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="new_password">Nové heslo</label>
                                    <input type="password" id="new_password" bind:value={passwordData.new_password} required minlength="6">
                                    <span class="form-hint">Minimálne 6 znakov</span>
                                </div>
                                
                                <div class="form-group">
                                    <label for="confirm_password">Potvrďte nové heslo</label>
                                    <input type="password" id="confirm_password" bind:value={passwordData.confirm_password} required>
                                </div>
                            </div>
                            
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary" disabled={loading}>
                                    {#if loading}Mením heslo...{:else}Zmeniť heslo{/if}
                                </button>
                            </div>
                        </form>
                    </div>
                
                {:else if activeTab === 'notifications'}
                    <div class="card">
                        <div class="card-header">
                            <h2>E-mailové notifikácie</h2>
                            <p>Nastavte si, aké e-maily chcete dostávať</p>
                        </div>
                        
                        <form on:submit|preventDefault={saveNotifications} class="form">
                            <div class="notification-list">
                                <label class="notification-item">
                                    <div class="notification-info">
                                        <strong>Objednávky a konverzie</strong>
                                        <span>Notifikácie o nových objednávkach cez váš e-shop</span>
                                    </div>
                                    <div class="toggle">
                                        <input type="checkbox" bind:checked={notifications.email_orders}>
                                        <span class="toggle-slider"></span>
                                    </div>
                                </label>
                                
                                <label class="notification-item">
                                    <div class="notification-info">
                                        <strong>Týždenné reporty</strong>
                                        <span>Súhrn štatistík a výkonnosti za týždeň</span>
                                    </div>
                                    <div class="toggle">
                                        <input type="checkbox" bind:checked={notifications.email_reports}>
                                        <span class="toggle-slider"></span>
                                    </div>
                                </label>
                                
                                <label class="notification-item">
                                    <div class="notification-info">
                                        <strong>Marketingové novinky</strong>
                                        <span>Informácie o nových funkciách a akciách</span>
                                    </div>
                                    <div class="toggle">
                                        <input type="checkbox" bind:checked={notifications.email_marketing}>
                                        <span class="toggle-slider"></span>
                                    </div>
                                </label>
                            </div>
                            
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary" disabled={loading}>
                                    {#if loading}Ukladám...{:else}Uložiť nastavenia{/if}
                                </button>
                            </div>
                        </form>
                    </div>
                
                {:else if activeTab === 'api'}
                    <div class="card">
                        <div class="card-header">
                            <h2>API prístup</h2>
                            <p>Prístupové údaje pre integráciu</p>
                        </div>
                        
                        <div class="api-section">
                            <div class="form-group">
                                <label>Váš API kľúč</label>
                                <div class="api-key-row">
                                    <input type="text" value={apiKey || 'Nie je vygenerovaný'} readonly class="api-input">
                                    <button type="button" class="btn btn-secondary" on:click={copyApiKey} disabled={!apiKey}>
                                        Kopírovať
                                    </button>
                                    <button type="button" class="btn btn-outline" on:click={regenerateApiKey} disabled={loading}>
                                        Nový kľúč
                                    </button>
                                </div>
                                <span class="form-hint">Tento kľúč použite pre autentifikáciu API volaní</span>
                            </div>
                            
                            <div class="api-docs">
                                <h3>Dokumentácia API</h3>
                                <p>Pre integráciu s vaším e-shopom použite nasledujúce endpointy:</p>
                                
                                <div class="endpoint">
                                    <code>GET /api/v1/products</code>
                                    <span>Zoznam vašich produktov</span>
                                </div>
                                
                                <div class="endpoint">
                                    <code>POST /api/v1/conversion</code>
                                    <span>Zaznamenanie konverzie</span>
                                </div>
                                
                                <div class="endpoint">
                                    <code>GET /api/v1/stats</code>
                                    <span>Štatistiky a reporty</span>
                                </div>
                            </div>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
        
        <div class="sidebar">
            <div class="status-card">
                <h3>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    Stav účtu
                </h3>
                
                <div class="status-grid">
                    <div class="status-item">
                        <span class="status-label">Stav</span>
                        {#if vendor?.status === 'active'}
                            <span class="status-badge badge-success">✓ Aktívny</span>
                        {:else if vendor?.status === 'suspended'}
                            <span class="status-badge badge-danger">⚠ Pozastavený</span>
                        {:else}
                            <span class="status-badge badge-warning">⏳ Čaká na schválenie</span>
                        {/if}
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
                        <span class="status-value credit">{(vendor?.credit_balance || 0).toFixed(2)} €</span>
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
    
    .content-grid {
        display: grid;
        grid-template-columns: 1fr 300px;
        gap: 1.5rem;
    }
    
    @media (max-width: 1024px) {
        .content-grid {
            grid-template-columns: 1fr;
        }
        .sidebar {
            order: -1;
        }
    }
    
    .tabs-nav {
        display: flex;
        gap: 0.5rem;
        background: white;
        padding: 0.5rem;
        border-radius: 12px;
        margin-bottom: 1.5rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        flex-wrap: wrap;
    }
    
    .tabs-nav button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
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
        margin: 0 0 0.25rem 0;
        font-size: 1.25rem;
        color: #333;
    }
    
    .card-header p {
        margin: 0;
        color: #666;
        font-size: 0.9rem;
    }
    
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
    
    @media (max-width: 768px) {
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
        cursor: not-allowed;
    }
    
    .form-hint {
        font-size: 0.8rem;
        color: #888;
    }
    
    .form-actions {
        padding-top: 0.5rem;
    }
    
    .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
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
        background: #e3f2fd;
        color: #1976d2;
    }
    
    .btn-outline {
        background: white;
        border: 1px solid #ddd;
        color: #555;
    }
    
    .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    .notification-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .notification-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        background: #f9f9f9;
        border-radius: 10px;
        cursor: pointer;
        transition: background 0.2s;
    }
    
    .notification-item:hover {
        background: #f0f0f0;
    }
    
    .notification-info strong {
        display: block;
        margin-bottom: 0.25rem;
        color: #333;
    }
    
    .notification-info span {
        font-size: 0.85rem;
        color: #666;
    }
    
    .toggle {
        position: relative;
        width: 50px;
        height: 26px;
    }
    
    .toggle input {
        opacity: 0;
        width: 0;
        height: 0;
    }
    
    .toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: #ccc;
        border-radius: 26px;
        transition: 0.3s;
    }
    
    .toggle-slider:before {
        position: absolute;
        content: "";
        height: 20px;
        width: 20px;
        left: 3px;
        bottom: 3px;
        background: white;
        border-radius: 50%;
        transition: 0.3s;
    }
    
    .toggle input:checked + .toggle-slider {
        background: #1976d2;
    }
    
    .toggle input:checked + .toggle-slider:before {
        transform: translateX(24px);
    }
    
    .api-section {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
    
    .api-key-row {
        display: flex;
        gap: 0.5rem;
    }
    
    .api-input {
        flex: 1;
        font-family: monospace;
        background: #f5f5f5;
    }
    
    .api-docs {
        background: #f9f9f9;
        border-radius: 10px;
        padding: 1.25rem;
    }
    
    .api-docs h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1rem;
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
        padding: 0.75rem;
        background: white;
        border-radius: 6px;
        margin-bottom: 0.5rem;
    }
    
    .endpoint code {
        background: #1e3a5f;
        color: #4fc3f7;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.85rem;
    }
    
    .endpoint span {
        font-size: 0.9rem;
        color: #666;
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
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-bottom: 1rem;
    }
    
    .status-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
        border-bottom: 1px solid #f0f0f0;
    }
    
    .status-item:last-child {
        border-bottom: none;
    }
    
    .status-label {
        font-size: 0.85rem;
        color: #666;
    }
    
    .status-value {
        font-weight: 600;
        color: #333;
    }
    
    .status-value.credit {
        color: #2e7d32;
    }
    
    .status-value.small {
        font-size: 0.85rem;
    }
    
    .status-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
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
        width: 100%;
        background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
        color: white;
        margin-top: 0.5rem;
    }
    
    .btn-upgrade:hover {
        background: linear-gradient(135deg, #f57c00 0%, #e65100 100%);
    }
    
    /* Billing locked view */
    .billing-locked-view {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }
    
    .locked-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: #e8f5e9;
        color: #2e7d32;
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.85rem;
        width: fit-content;
    }
    
    .billing-readonly-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }
    
    .billing-field {
        padding: 0.75rem;
        background: #f9fafb;
        border-radius: 8px;
        border: 1px solid #f0f0f0;
    }
    
    .billing-field.full-width {
        grid-column: 1 / -1;
    }
    
    .field-label {
        display: block;
        font-size: 0.75rem;
        color: #888;
        margin-bottom: 0.25rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .field-value {
        font-weight: 600;
        color: #333;
        font-size: 0.95rem;
    }
    
    .change-request-box {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 1rem 1.25rem;
        background: #f0f4ff;
        border: 1px solid #bfdbfe;
        border-radius: 10px;
        margin-top: 0.5rem;
    }
    
    .change-request-box strong {
        display: block;
        color: #1e40af;
        margin-bottom: 0.25rem;
    }
    
    .change-request-box p {
        margin: 0;
        font-size: 0.85rem;
        color: #3b82f6;
    }
    
    .change-request-box a {
        color: #1d4ed8;
        font-weight: 600;
    }
    
    /* Billing form */
    .billing-bonus-banner {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 1rem 1.25rem;
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        border: 1px solid #fbbf24;
        border-radius: 10px;
        margin-bottom: 1.25rem;
    }
    
    .bonus-emoji {
        font-size: 1.75rem;
        flex-shrink: 0;
    }
    
    .billing-bonus-banner strong {
        display: block;
        color: #92400e;
        margin-bottom: 0.25rem;
    }
    
    .billing-bonus-banner p {
        margin: 0;
        font-size: 0.85rem;
        color: #78350f;
    }
    
    .ico-lookup-row {
        display: flex;
        align-items: flex-end;
        gap: 0.75rem;
    }
    
    .ico-btn {
        white-space: nowrap;
        height: 42px;
        font-size: 0.85rem !important;
        padding: 0 1rem !important;
    }
    
    .spinner-sm {
        width: 14px;
        height: 14px;
        border: 2px solid #ccc;
        border-top-color: #1976d2;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
        display: inline-block;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .vat-section {
        padding: 1rem;
        background: #f9fafb;
        border-radius: 10px;
        border: 1px solid #e5e7eb;
    }
    
    .vat-toggle-label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-weight: 600;
        color: #374151;
        cursor: pointer;
    }
    
    .vat-type-options {
        margin-top: 0.75rem;
        padding-top: 0.75rem;
        border-top: 1px solid #e5e7eb;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .radio-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        color: #555;
        cursor: pointer;
    }
    
    .radio-label input[type="radio"] {
        width: 16px;
        height: 16px;
    }
    
    .lock-warning {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        background: #fffbeb;
        border: 1px solid #fde68a;
        border-radius: 8px;
        font-size: 0.85rem;
        color: #92400e;
    }
    
    .lock-warning a {
        color: #d97706;
        font-weight: 600;
    }
</style>
