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
    
    // Form data
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
    <div class="account-header">
        <h1>👤 Môj účet</h1>
        <p>Správa vášho profilu a nastavení účtu</p>
    </div>
    
    {#if message}
        <div class="message {message.type}">
            {message.text}
            <button on:click={() => message = null}>×</button>
        </div>
    {/if}
    
    <div class="account-grid">
        <!-- Profile Section -->
        <div class="account-section">
            <h2>📋 Základné údaje</h2>
            <form on:submit|preventDefault={saveProfile}>
                <div class="form-group">
                    <label for="company_name">Názov spoločnosti</label>
                    <input 
                        type="text" 
                        id="company_name" 
                        bind:value={formData.company_name}
                        placeholder="Názov vašej firmy"
                    >
                </div>
                
                <div class="form-group">
                    <label for="contact_person">Kontaktná osoba</label>
                    <input 
                        type="text" 
                        id="contact_person" 
                        bind:value={formData.contact_person}
                        placeholder="Meno a priezvisko"
                    >
                </div>
                
                <div class="form-group">
                    <label for="phone">Telefón</label>
                    <input 
                        type="tel" 
                        id="phone" 
                        bind:value={formData.phone}
                        placeholder="+421 900 000 000"
                    >
                </div>
                
                <div class="form-group">
                    <label for="email">E-mail</label>
                    <input 
                        type="email" 
                        id="email" 
                        bind:value={formData.email}
                        disabled
                    >
                    <small>E-mail nie je možné zmeniť</small>
                </div>
                
                <button type="submit" class="btn-primary" disabled={loading}>
                    {loading ? 'Ukladám...' : 'Uložiť zmeny'}
                </button>
            </form>
        </div>
        
        <!-- Account Status -->
        <div class="account-section">
            <h2>📊 Stav účtu</h2>
            <div class="status-grid">
                <div class="status-item">
                    <span class="status-label">Stav</span>
                    <span class="status-value">
                        {#if vendor?.status === 'active'}
                            <span class="badge badge-success">✓ Aktívny</span>
                        {:else if vendor?.status === 'pending'}
                            <span class="badge badge-warning">⏳ Čaká na schválenie</span>
                        {:else}
                            <span class="badge badge-secondary">{vendor?.status || '-'}</span>
                        {/if}
                    </span>
                </div>
                <div class="status-item">
                    <span class="status-label">Režim</span>
                    <span class="status-value">
                        {#if shop?.display_mode === 'cpc'}
                            <span class="badge badge-primary">💰 CPC</span>
                        {:else}
                            <span class="badge badge-info">🆓 FREE</span>
                        {/if}
                    </span>
                </div>
                <div class="status-item">
                    <span class="status-label">Kredit</span>
                    <span class="status-value credit">{(shop?.credit_balance || 0).toLocaleString('sk-SK', { minimumFractionDigits: 2 })} €</span>
                </div>
                <div class="status-item">
                    <span class="status-label">Počet produktov</span>
                    <span class="status-value">{shop?.total_offers || 0}</span>
                </div>
            </div>
        </div>
        
        <!-- Change Password -->
        <div class="account-section">
            <h2>🔑 Zmena hesla</h2>
            <form on:submit|preventDefault={changePassword}>
                <div class="form-group">
                    <label for="current_password">Aktuálne heslo</label>
                    <input 
                        type="password" 
                        id="current_password" 
                        bind:value={passwordData.current}
                        placeholder="Zadajte aktuálne heslo"
                    >
                </div>
                
                <div class="form-group">
                    <label for="new_password">Nové heslo</label>
                    <input 
                        type="password" 
                        id="new_password" 
                        bind:value={passwordData.new}
                        placeholder="Minimálne 6 znakov"
                    >
                </div>
                
                <div class="form-group">
                    <label for="confirm_password">Potvrdenie hesla</label>
                    <input 
                        type="password" 
                        id="confirm_password" 
                        bind:value={passwordData.confirm}
                        placeholder="Zopakujte nové heslo"
                    >
                </div>
                
                <button type="submit" class="btn-secondary" disabled={loading}>
                    {loading ? 'Mením...' : 'Zmeniť heslo'}
                </button>
            </form>
        </div>
    </div>
</div>

<style>
.account-container {
    max-width: 1000px;
    margin: 0 auto;
}

.account-header {
    margin-bottom: 24px;
}

.account-header h1 {
    font-size: 28px;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 8px 0;
}

.account-header p {
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

.account-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
}

.account-section {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.account-section:last-child {
    grid-column: 1 / -1;
}

.account-section h2 {
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

.form-group input {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.2s;
}

.form-group input:focus {
    outline: none;
    border-color: #3b82f6;
}

.form-group input:disabled {
    background: #f9fafb;
    color: #9ca3af;
    cursor: not-allowed;
}

.form-group small {
    display: block;
    font-size: 12px;
    color: #9ca3af;
    margin-top: 4px;
}

.btn-primary, .btn-secondary {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
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
    color: #374151;
}

.btn-secondary:hover:not(:disabled) {
    background: #e2e8f0;
}

.btn-primary:disabled, .btn-secondary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Status Grid */
.status-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.status-item {
    display: flex;
    flex-direction: column;
    padding: 12px;
    background: #f8fafc;
    border-radius: 8px;
}

.status-label {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 4px;
}

.status-value {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
}

.status-value.credit {
    color: #10b981;
}

.badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
}

.badge-success {
    background: #d1fae5;
    color: #065f46;
}

.badge-warning {
    background: #fef3c7;
    color: #92400e;
}

.badge-primary {
    background: #dbeafe;
    color: #1e40af;
}

.badge-info {
    background: #e0f2fe;
    color: #0369a1;
}

.badge-secondary {
    background: #f3f4f6;
    color: #6b7280;
}

@media (max-width: 768px) {
    .account-grid {
        grid-template-columns: 1fr;
    }
    
    .account-section:last-child {
        grid-column: auto;
    }
    
    .status-grid {
        grid-template-columns: 1fr;
    }
}
</style>
