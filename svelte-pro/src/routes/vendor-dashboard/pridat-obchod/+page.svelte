<script>
    import { getContext } from 'svelte';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    
    const API_BASE = getContext('API_BASE');
    const vendorStore = getContext('vendor');
    
    $: vendor = $vendorStore;
    
    let step = 1; // 1 = basic info, 2 = billing
    let loading = false;
    let error = '';
    let success = false;
    
    // Step 1 - Basic info
    let shopName = '';
    let shopUrl = '';
    
    // Step 2 - Billing
    let copyFromVendor = true;
    let billingCountry = 'SK';
    let icoInput = '';
    let icoLoading = false;
    let icoFound = false;
    let icoError = '';
    
    let billing = {
        company: '',
        ico: '',
        dic: '',
        ic_dph: '',
        address: '',
        city: '',
        zip: '',
        country: 'SK',
        contact_person: '',
        phone: '',
        email: ''
    };
    
    // Auto-fill from vendor on mount
    $: if (vendor && copyFromVendor) {
        billing = {
            company: vendor.company_name || '',
            ico: vendor.ico || '',
            dic: vendor.dic || '',
            ic_dph: vendor.ic_dph || '',
            address: vendor.billing_address || vendor.address || '',
            city: vendor.billing_city || vendor.city || '',
            zip: vendor.billing_zip || vendor.postal_code || '',
            country: vendor.billing_country || 'SK',
            contact_person: vendor.contact_person || '',
            phone: vendor.phone || '',
            email: vendor.email || ''
        };
        billingCountry = billing.country;
    }
    
    function nextStep() {
        if (!shopName.trim()) {
            error = 'Zadajte názov obchodu';
            return;
        }
        error = '';
        step = 2;
    }
    
    function prevStep() {
        step = 1;
        error = '';
    }
    
    async function lookupICO() {
        if (!icoInput.trim()) {
            icoError = 'Zadajte IČO';
            return;
        }
        
        icoLoading = true;
        icoError = '';
        icoFound = false;
        
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(`${API_BASE}/vendor/ico-lookup?ico=${encodeURIComponent(icoInput)}&country=${billingCountry}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (data.success && data.data?.found) {
                const d = data.data;
                billing = {
                    ...billing,
                    company: d.company_name || billing.company,
                    ico: d.ico || icoInput,
                    dic: d.dic || billing.dic,
                    ic_dph: d.ic_dph || billing.ic_dph,
                    address: d.street || billing.address,
                    city: d.city || billing.city,
                    zip: d.postal_code || billing.zip,
                    country: d.country || billingCountry
                };
                icoFound = true;
                copyFromVendor = false;
            } else {
                icoError = 'IČO nenájdené. Vyplňte údaje manuálne.';
                billing.ico = icoInput;
                copyFromVendor = false;
            }
        } catch (e) {
            icoError = 'Chyba pri vyhľadávaní. Vyplňte údaje manuálne.';
            billing.ico = icoInput;
        }
        icoLoading = false;
    }
    
    function toggleCopyFromVendor() {
        copyFromVendor = !copyFromVendor;
        if (copyFromVendor && vendor) {
            billing = {
                company: vendor.company_name || '',
                ico: vendor.ico || '',
                dic: vendor.dic || '',
                ic_dph: vendor.ic_dph || '',
                address: vendor.billing_address || vendor.address || '',
                city: vendor.billing_city || vendor.city || '',
                zip: vendor.billing_zip || vendor.postal_code || '',
                country: vendor.billing_country || 'SK',
                contact_person: vendor.contact_person || '',
                phone: vendor.phone || '',
                email: vendor.email || ''
            };
        }
    }
    
    async function createShop() {
        loading = true;
        error = '';
        
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(`${API_BASE}/vendor/shops`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    shop_name: shopName,
                    shop_url: shopUrl,
                    copy_from_vendor: copyFromVendor,
                    billing_company: billing.company,
                    billing_ico: billing.ico,
                    billing_dic: billing.dic,
                    billing_ic_dph: billing.ic_dph,
                    billing_address: billing.address,
                    billing_city: billing.city,
                    billing_zip: billing.zip,
                    billing_country: billing.country,
                    billing_contact_person: billing.contact_person,
                    billing_phone: billing.phone,
                    billing_email: billing.email
                })
            });
            
            const data = await res.json();
            if (data.success) {
                success = true;
            } else {
                error = data.error || data.message || 'Chyba pri vytváraní obchodu';
            }
        } catch (e) {
            error = 'Chyba pripojenia';
        }
        loading = false;
    }
</script>

<div class="asp-page">
    {#if success}
        <!-- Success screen -->
        <div class="asp-card asp-success-card">
            <div class="asp-success-icon">
                <span class="material-icons-round">check_circle</span>
            </div>
            <h1>Obchod bol vytvorený!</h1>
            <p>Váš nový obchod <strong>{shopName}</strong> čaká na schválenie administrátorom. O aktivácii vás budeme informovať.</p>
            <div class="asp-status-badge pending">
                <span class="material-icons-round">schedule</span>
                Čaká na schválenie
            </div>
            <a href="/vendor-dashboard" class="asp-btn asp-btn-primary asp-btn-full">
                <span class="material-icons-round">arrow_back</span>
                Späť na Dashboard
            </a>
        </div>
    {:else}
        <!-- Form -->
        <div class="asp-card">
            <!-- Header -->
            <div class="asp-header">
                <h1>
                    <span class="material-icons-round">add_business</span>
                    Pridať nový obchod
                </h1>
                <p>Vytvorte nový obchod pre správu produktov. Po vytvorení bude obchod čakať na schválenie.</p>
            </div>
            
            <!-- Steps indicator -->
            <div class="asp-steps">
                <div class="asp-step" class:active={step === 1} class:done={step > 1}>
                    <div class="asp-step-num">{step > 1 ? '✓' : '1'}</div>
                    <span>Základné údaje</span>
                </div>
                <div class="asp-step-line" class:active={step > 1}></div>
                <div class="asp-step" class:active={step === 2}>
                    <div class="asp-step-num">2</div>
                    <span>Fakturačné údaje</span>
                </div>
            </div>
            
            {#if error}
                <div class="asp-error">
                    <span class="material-icons-round">error</span>
                    {error}
                </div>
            {/if}
            
            <!-- Step 1: Basic Info -->
            {#if step === 1}
                <div class="asp-form">
                    <div class="asp-field">
                        <label>Názov obchodu <span class="req">*</span></label>
                        <input type="text" bind:value={shopName} placeholder="Napr. MôjEshop.sk" />
                        <span class="asp-hint">Názov vášho e-shopu, ako sa bude zobrazovať zákazníkom</span>
                    </div>
                    
                    <div class="asp-field">
                        <label>URL obchodu</label>
                        <input type="url" bind:value={shopUrl} placeholder="https://www.mojeshop.sk" />
                        <span class="asp-hint">Webová adresa vášho e-shopu (nepovinné)</span>
                    </div>
                    
                    <div class="asp-actions">
                        <a href="/vendor-dashboard" class="asp-btn asp-btn-ghost">
                            <span class="material-icons-round">arrow_back</span>
                            Späť
                        </a>
                        <button class="asp-btn asp-btn-primary" on:click={nextStep}>
                            Pokračovať
                            <span class="material-icons-round">arrow_forward</span>
                        </button>
                    </div>
                </div>
            {/if}
            
            <!-- Step 2: Billing -->
            {#if step === 2}
                <div class="asp-form">
                    <!-- Copy toggle -->
                    <div class="asp-toggle-row">
                        <label class="asp-toggle">
                            <input type="checkbox" checked={copyFromVendor} on:change={toggleCopyFromVendor} />
                            <span class="asp-toggle-slider"></span>
                        </label>
                        <span class="asp-toggle-label">Použiť fakturačné údaje z hlavného účtu</span>
                    </div>
                    
                    <!-- ICO Lookup -->
                    {#if !copyFromVendor}
                        <div class="asp-ico-section">
                            <div class="asp-ico-header">
                                <span class="material-icons-round">search</span>
                                Vyhľadať podľa IČO
                            </div>
                            <div class="asp-ico-row">
                                <div class="asp-ico-country">
                                    <select bind:value={billingCountry}>
                                        <option value="SK">🇸🇰 SK</option>
                                        <option value="CZ">🇨🇿 CZ</option>
                                    </select>
                                </div>
                                <input type="text" bind:value={icoInput} placeholder="Zadajte IČO" class="asp-ico-input"
                                    on:keydown={(e) => e.key === 'Enter' && lookupICO()} />
                                <button class="asp-btn asp-btn-secondary" on:click={lookupICO} disabled={icoLoading}>
                                    {#if icoLoading}
                                        <span class="asp-spinner"></span>
                                    {:else}
                                        <span class="material-icons-round">search</span>
                                    {/if}
                                    Hľadať
                                </button>
                            </div>
                            {#if icoFound}
                                <div class="asp-ico-found">
                                    <span class="material-icons-round">check_circle</span>
                                    Údaje boli nájdené a predvyplnené. Skontrolujte ich a prípadne upravte.
                                </div>
                            {/if}
                            {#if icoError}
                                <div class="asp-ico-error">{icoError}</div>
                            {/if}
                        </div>
                    {/if}
                    
                    <!-- Billing form fields -->
                    <div class="asp-field-grid">
                        <div class="asp-field full">
                            <label>Názov spoločnosti</label>
                            <input type="text" bind:value={billing.company} placeholder="s.r.o. / SZČO" disabled={copyFromVendor} />
                        </div>
                        
                        <div class="asp-field">
                            <label>IČO</label>
                            <input type="text" bind:value={billing.ico} placeholder="12345678" disabled={copyFromVendor} />
                        </div>
                        <div class="asp-field">
                            <label>DIČ</label>
                            <input type="text" bind:value={billing.dic} placeholder="2012345678" disabled={copyFromVendor} />
                        </div>
                        <div class="asp-field">
                            <label>IČ DPH</label>
                            <input type="text" bind:value={billing.ic_dph} placeholder="SK2012345678" disabled={copyFromVendor} />
                        </div>
                        <div class="asp-field">
                            <label>Krajina</label>
                            <select bind:value={billing.country} disabled={copyFromVendor}>
                                <option value="SK">Slovensko</option>
                                <option value="CZ">Česko</option>
                            </select>
                        </div>
                        
                        <div class="asp-field full">
                            <label>Ulica a číslo</label>
                            <input type="text" bind:value={billing.address} placeholder="Hlavná 1" disabled={copyFromVendor} />
                        </div>
                        <div class="asp-field">
                            <label>Mesto</label>
                            <input type="text" bind:value={billing.city} placeholder="Bratislava" disabled={copyFromVendor} />
                        </div>
                        <div class="asp-field">
                            <label>PSČ</label>
                            <input type="text" bind:value={billing.zip} placeholder="01001" disabled={copyFromVendor} />
                        </div>
                    </div>
                    
                    <div class="asp-divider"></div>
                    
                    <div class="asp-field-grid">
                        <div class="asp-field">
                            <label>Kontaktná osoba</label>
                            <input type="text" bind:value={billing.contact_person} placeholder="Meno Priezvisko" disabled={copyFromVendor} />
                        </div>
                        <div class="asp-field">
                            <label>Telefón</label>
                            <input type="tel" bind:value={billing.phone} placeholder="+421 9XX XXX XXX" disabled={copyFromVendor} />
                        </div>
                        <div class="asp-field full">
                            <label>Fakturačný email</label>
                            <input type="email" bind:value={billing.email} placeholder="fakturacia@firma.sk" disabled={copyFromVendor} />
                        </div>
                    </div>
                    
                    <div class="asp-info">
                        <span class="material-icons-round">info</span>
                        Po vytvorení obchodu bude potrebné schválenie administrátorom. Kredit je zdieľaný pre všetky vaše obchody.
                    </div>
                    
                    <div class="asp-actions">
                        <button class="asp-btn asp-btn-ghost" on:click={prevStep}>
                            <span class="material-icons-round">arrow_back</span>
                            Späť
                        </button>
                        <button class="asp-btn asp-btn-primary" on:click={createShop} disabled={loading}>
                            {#if loading}
                                <span class="asp-spinner"></span>
                                Vytváram...
                            {:else}
                                <span class="material-icons-round">add_business</span>
                                Vytvoriť obchod
                            {/if}
                        </button>
                    </div>
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
    .asp-page { max-width: 640px; margin: 0 auto; padding: 24px 16px; }
    
    .asp-card {
        background: white;
        border-radius: 12px;
        padding: 28px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    }
    
    .asp-header h1 {
        font-size: 22px;
        font-weight: 700;
        color: #0f172a;
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0 0 6px;
    }
    .asp-header h1 .material-icons-round { color: #3b82f6; font-size: 28px; }
    .asp-header p { color: #64748b; font-size: 14px; margin: 0 0 24px; }
    
    /* Steps */
    .asp-steps {
        display: flex;
        align-items: center;
        gap: 0;
        margin-bottom: 24px;
        padding: 16px;
        background: #f8fafc;
        border-radius: 8px;
    }
    .asp-step {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #94a3b8;
        font-size: 13px;
        font-weight: 500;
    }
    .asp-step.active { color: #3b82f6; }
    .asp-step.done { color: #10b981; }
    .asp-step-num {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #e2e8f0;
        color: #64748b;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 600;
    }
    .asp-step.active .asp-step-num { background: #3b82f6; color: white; }
    .asp-step.done .asp-step-num { background: #10b981; color: white; }
    .asp-step-line {
        flex: 1;
        height: 2px;
        background: #e2e8f0;
        margin: 0 12px;
    }
    .asp-step-line.active { background: #10b981; }
    
    /* Error */
    .asp-error {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #fef2f2;
        color: #dc2626;
        padding: 12px 14px;
        border-radius: 8px;
        font-size: 14px;
        margin-bottom: 20px;
        border: 1px solid #fecaca;
    }
    .asp-error .material-icons-round { font-size: 18px; }
    
    /* Form */
    .asp-form { display: flex; flex-direction: column; gap: 0; }
    
    .asp-field { margin-bottom: 16px; }
    .asp-field label {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 5px;
    }
    .asp-field label .req { color: #ef4444; }
    .asp-field input, .asp-field select {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 14px;
        color: #0f172a;
        background: white;
        transition: border-color 0.15s;
    }
    .asp-field input:focus, .asp-field select:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
    }
    .asp-field input:disabled, .asp-field select:disabled {
        background: #f9fafb;
        color: #6b7280;
        cursor: not-allowed;
    }
    .asp-hint { font-size: 12px; color: #9ca3af; margin-top: 4px; display: block; }
    
    /* Grid */
    .asp-field-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0 16px;
    }
    .asp-field-grid .asp-field.full { grid-column: 1 / -1; }
    
    /* Toggle */
    .asp-toggle-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
        padding: 12px 14px;
        background: #f0f9ff;
        border-radius: 8px;
        border: 1px solid #bae6fd;
    }
    .asp-toggle { position: relative; width: 44px; height: 24px; flex-shrink: 0; }
    .asp-toggle input { opacity: 0; width: 0; height: 0; }
    .asp-toggle-slider {
        position: absolute;
        cursor: pointer;
        inset: 0;
        background: #cbd5e1;
        border-radius: 24px;
        transition: 0.2s;
    }
    .asp-toggle-slider::before {
        content: '';
        position: absolute;
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background: white;
        border-radius: 50%;
        transition: 0.2s;
    }
    .asp-toggle input:checked + .asp-toggle-slider { background: #3b82f6; }
    .asp-toggle input:checked + .asp-toggle-slider::before { transform: translateX(20px); }
    .asp-toggle-label { font-size: 14px; color: #334155; font-weight: 500; }
    
    /* ICO Lookup */
    .asp-ico-section {
        background: #fafafa;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        padding: 16px;
        margin-bottom: 20px;
    }
    .asp-ico-header {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 12px;
    }
    .asp-ico-header .material-icons-round { font-size: 18px; color: #6b7280; }
    .asp-ico-row { display: flex; gap: 8px; align-items: stretch; }
    .asp-ico-country select {
        height: 100%;
        padding: 8px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 14px;
        background: white;
    }
    .asp-ico-input {
        flex: 1;
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 14px;
    }
    .asp-ico-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
    .asp-ico-found {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #059669;
        font-size: 13px;
        margin-top: 10px;
        padding: 8px 10px;
        background: #ecfdf5;
        border-radius: 6px;
    }
    .asp-ico-found .material-icons-round { font-size: 16px; }
    .asp-ico-error { color: #dc2626; font-size: 13px; margin-top: 8px; }
    
    /* Divider */
    .asp-divider { height: 1px; background: #e5e7eb; margin: 8px 0 16px; }
    
    /* Info box */
    .asp-info {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        background: #fffbeb;
        border: 1px solid #fde68a;
        color: #92400e;
        padding: 12px 14px;
        border-radius: 8px;
        font-size: 13px;
        line-height: 1.5;
        margin-top: 8px;
    }
    .asp-info .material-icons-round { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
    
    /* Actions */
    .asp-actions {
        display: flex;
        gap: 12px;
        margin-top: 24px;
        justify-content: space-between;
    }
    
    .asp-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        border: none;
        text-decoration: none;
        transition: all 0.15s;
    }
    .asp-btn .material-icons-round { font-size: 18px; }
    .asp-btn-primary { background: #3b82f6; color: white; }
    .asp-btn-primary:hover { background: #2563eb; }
    .asp-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .asp-btn-secondary { background: #f1f5f9; color: #475569; border: 1px solid #d1d5db; }
    .asp-btn-secondary:hover { background: #e2e8f0; }
    .asp-btn-secondary:disabled { opacity: 0.6; }
    .asp-btn-ghost { background: transparent; color: #64748b; }
    .asp-btn-ghost:hover { background: #f1f5f9; }
    .asp-btn-full { width: 100%; justify-content: center; margin-top: 16px; }
    
    /* Spinner */
    .asp-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
    }
    .asp-btn-secondary .asp-spinner {
        border-color: rgba(0,0,0,0.15);
        border-top-color: #475569;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    /* Success card */
    .asp-success-card { text-align: center; padding: 40px 28px; }
    .asp-success-icon .material-icons-round { font-size: 64px; color: #10b981; }
    .asp-success-card h1 { font-size: 22px; margin: 16px 0 8px; color: #0f172a; }
    .asp-success-card p { color: #64748b; font-size: 14px; margin: 0 0 20px; line-height: 1.6; }
    .asp-status-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 8px;
    }
    .asp-status-badge.pending { background: #fef3c7; color: #92400e; }
    .asp-status-badge .material-icons-round { font-size: 16px; }
    
    @media (max-width: 640px) {
        .asp-field-grid { grid-template-columns: 1fr; }
        .asp-ico-row { flex-direction: column; }
        .asp-steps { flex-direction: column; gap: 8px; }
        .asp-step-line { width: 2px; height: 16px; margin: 0; }
    }
</style>
