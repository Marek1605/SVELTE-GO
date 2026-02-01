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
    
    let formData = {
        company_name: '',
        contact_person: '',
        phone: '',
        email: ''
    };
    
    let passwordData = {
        current: '',
        new: '',
        confirm: ''
    };
    
    onMount(() => {
        if (vendor) {
            formData = {
                company_name: vendor.company_name || '',
                contact_person: vendor.contact_person || '',
                phone: vendor.phone || '',
                email: vendor.email || ''
            };
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
</script>

<div class="account-container">
    <div class="page-header">
        <h1>
            <span class="header-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </span>
            Môj účet
        </h1>
    </div>
    
    {#if message}
        <div class="message {message.type}">
            <span>{message.type === 'success' ? '✓' : '!'}</span>
            {message.text}
            <button class="close-btn" on:click={() => message = null}>×</button>
        </div>
    {/if}
    
    <div class="account-grid">
        <!-- Základné údaje -->
        <div class="card">
            <div class="card-header">
                <div class="card-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                    </svg>
                </div>
                <h2>Základné údaje</h2>
            </div>
            
            <form on:submit|preventDefault={saveProfile} class="form">
                <div class="form-group">
                    <label for="company_name">Názov spoločnosti</label>
                    <input type="text" id="company_name" bind:value={formData.company_name} placeholder="Názov vašej firmy">
                </div>
                
                <div class="form-group">
                    <label for="contact_person">Kontaktná osoba</label>
                    <input type="text" id="contact_person" bind:value={formData.contact_person} placeholder="Meno a priezvisko">
                </div>
                
                <div class="form-group">
                    <label for="phone">Telefón</label>
                    <input type="tel" id="phone" bind:value={formData.phone} placeholder="+421 900 000 000">
                </div>
                
                <div class="form-group">
                    <label for="email">E-mail</label>
                    <input type="email" id="email" bind:value={formData.email} disabled>
                    <span class="hint">E-mail nie je možné zmeniť</span>
                </div>
                
                <button type="submit" class="btn btn-primary" disabled={loading}>
                    {#if loading}
                        <span class="spinner"></span> Ukladám...
                    {:else}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                        Uložiť zmeny
                    {/if}
                </button>
            </form>
        </div>
        
        <!-- Stav účtu -->
        <div class="card">
            <div class="card-header">
                <div class="card-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="20" x2="18" y2="10"></line>
                        <line x1="12" y1="20" x2="12" y2="4"></line>
                        <line x1="6" y1="20" x2="6" y2="14"></line>
                    </svg>
                </div>
                <h2>Stav účtu</h2>
            </div>
            
            <div class="status-grid">
                <div class="status-item">
                    <span class="status-label">Stav</span>
                    <span class="status-value">
                        {#if vendor?.status === 'active'}
                            <span class="badge badge-success">✓ Aktívny</span>
                        {:else if vendor?.status === 'pending'}
                            <span class="badge badge-warning">⏳ Čaká na schválenie</span>
                        {:else}
                            <span class="badge badge-error">✕ Neaktívny</span>
                        {/if}
                    </span>
                </div>
                
                <div class="status-item">
                    <span class="status-label">Režim</span>
                    <span class="status-value">
                        {#if shop?.display_mode === 'cpc'}
                            <span class="badge badge-info">💰 CPC</span>
                        {:else}
                            <span class="badge badge-default">🆓 FREE</span>
                        {/if}
                    </span>
                </div>
                
                <div class="status-item">
                    <span class="status-label">Kredit</span>
                    <span class="status-value credit">{(shop?.credit_balance || 0).toFixed(2)} €</span>
                </div>
                
                <div class="status-item">
                    <span class="status-label">Počet produktov</span>
                    <span class="status-value">{shop?.total_offers || 0}</span>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Zmena hesla -->
    <div class="card card-full">
        <div class="card-header">
            <div class="card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
            </div>
            <h2>Zmena hesla</h2>
        </div>
        
        <form on:submit|preventDefault={changePassword} class="form form-inline">
            <div class="form-row">
                <div class="form-group">
                    <label for="current">Aktuálne heslo</label>
                    <input type="password" id="current" bind:value={passwordData.current} placeholder="••••••••">
                </div>
                
                <div class="form-group">
                    <label for="new">Nové heslo</label>
                    <input type="password" id="new" bind:value={passwordData.new} placeholder="Min. 6 znakov">
                </div>
                
                <div class="form-group">
                    <label for="confirm">Potvrdenie hesla</label>
                    <input type="password" id="confirm" bind:value={passwordData.confirm} placeholder="Zopakujte heslo">
                </div>
            </div>
            
            <button type="submit" class="btn btn-secondary" disabled={loading}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Zmeniť heslo
            </button>
        </form>
    </div>
</div>

<style>
    .account-container {
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
    .account-grid {
        display: grid;
        grid-template-columns: 1.2fr 0.8fr;
        gap: 20px;
        margin-bottom: 20px;
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
    
    .form-group label {
        display: block;
        font-size: 13px;
        font-weight: 500;
        color: #374151;
        margin-bottom: 6px;
    }
    
    .form-group input {
        width: 100%;
        padding: 10px 14px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        font-size: 14px;
        transition: border-color 0.2s, box-shadow 0.2s;
    }
    
    .form-group input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .form-group input:disabled {
        background: #f9fafb;
        color: #6b7280;
    }
    
    .hint {
        font-size: 12px;
        color: #9ca3af;
        margin-top: 4px;
        display: block;
    }
    
    .form-inline .form-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
    }
    
    /* Buttons */
    .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 20px;
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
    
    .btn-secondary {
        background: #f1f5f9;
        color: #475569;
    }
    
    .btn-secondary:hover:not(:disabled) {
        background: #e2e8f0;
    }
    
    .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    /* Status Grid */
    .status-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
    }
    
    .status-item {
        padding: 16px;
        background: #f8fafc;
        border-radius: 10px;
    }
    
    .status-label {
        display: block;
        font-size: 12px;
        color: #6b7280;
        margin-bottom: 6px;
    }
    
    .status-value {
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
    }
    
    .status-value.credit {
        color: #10b981;
        font-size: 20px;
    }
    
    /* Badges */
    .badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
    }
    
    .badge-success { background: #d1fae5; color: #065f46; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-error { background: #fee2e2; color: #991b1b; }
    .badge-info { background: #dbeafe; color: #1e40af; }
    .badge-default { background: #f1f5f9; color: #475569; }
    
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
        .account-grid {
            grid-template-columns: 1fr;
        }
        
        .form-inline .form-row {
            grid-template-columns: 1fr;
        }
        
        .status-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
