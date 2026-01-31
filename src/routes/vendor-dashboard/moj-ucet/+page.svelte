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
    let profile = {
        company_name: '',
        contact_person: '',
        phone: '',
        email: '',
        ico: '',
        dic: '',
        ic_dph: '',
        street: '',
        city: '',
        zip: '',
        country: 'Slovensko',
        avatar_url: ''
    };
    
    // Billing data
    let billing = {
        bank_account: '',
        iban: '',
        swift: '',
        bank_name: ''
    };
    
    // Notifications
    let notifications = {
        notify_new_click: true,
        notify_low_credit: true,
        notify_daily_summary: false,
        notify_weekly_summary: true,
        notify_monthly_report: true,
        notify_new_conversion: true,
        notify_product_issues: true,
        notify_system_updates: true,
        low_credit_threshold: 5,
        summary_email: ''
    };
    
    // Password
    let passwordData = {
        current: '',
        new: '',
        confirm: ''
    };
    
    // Invoices & Login history
    let invoices = [];
    let loginHistory = [];
    
    onMount(async () => {
        await loadProfile();
        await loadNotifications();
        await loadInvoices();
        await loadLoginHistory();
    });
    
    async function loadProfile() {
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(`${API_BASE}/vendor/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.data) {
                profile = { ...profile, ...data.data };
                billing = {
                    bank_account: data.data.bank_account || '',
                    iban: data.data.iban || '',
                    swift: data.data.swift || '',
                    bank_name: data.data.bank_name || ''
                };
            }
        } catch (e) { console.error(e); }
    }
    
    async function loadNotifications() {
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(`${API_BASE}/vendor/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.data) {
                notifications = { ...notifications, ...data.data };
            }
        } catch (e) { console.error(e); }
    }
    
    async function loadInvoices() {
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(`${API_BASE}/vendor/invoices`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) invoices = data.data || [];
        } catch (e) { console.error(e); }
    }
    
    async function loadLoginHistory() {
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(`${API_BASE}/vendor/login-history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) loginHistory = data.data || [];
        } catch (e) { console.error(e); }
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
                body: JSON.stringify(profile)
            });
            const data = await res.json();
            
            if (data.success) {
                message = { type: 'success', text: 'Profil bol aktualizovaný' };
                vendorStore.update(v => ({ ...v, ...profile }));
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
                body: JSON.stringify(billing)
            });
            const data = await res.json();
            
            if (data.success) {
                message = { type: 'success', text: 'Fakturačné údaje boli aktualizované' };
            } else {
                message = { type: 'error', text: data.error || 'Chyba pri ukladaní' };
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
    
    function formatDate(date) {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('sk-SK', { 
            day: '2-digit', month: '2-digit', year: 'numeric' 
        });
    }
    
    function formatDateTime(date) {
        if (!date) return '-';
        return new Date(date).toLocaleString('sk-SK', { 
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }
</script>

<div class="account-page">
    <div class="page-header">
        <div class="header-content">
            <h1>👤 Môj účet</h1>
            <p>Správa profilu, fakturácie a nastavení účtu</p>
        </div>
        <div class="account-summary">
            <div class="summary-item">
                <span class="label">Stav účtu</span>
                {#if vendor?.status === 'active'}
                    <span class="badge success">✓ Aktívny</span>
                {:else if vendor?.status === 'pending'}
                    <span class="badge warning">⏳ Čaká na schválenie</span>
                {:else}
                    <span class="badge">{vendor?.status || '-'}</span>
                {/if}
            </div>
            <div class="summary-item">
                <span class="label">Kredit</span>
                <span class="value credit">{(shop?.credit_balance || 0).toLocaleString('sk-SK', { minimumFractionDigits: 2 })} €</span>
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
        <button class:active={activeTab === 'profile'} on:click={() => activeTab = 'profile'}>
            📋 Firemné údaje
        </button>
        <button class:active={activeTab === 'billing'} on:click={() => activeTab = 'billing'}>
            🏦 Fakturácia
        </button>
        <button class:active={activeTab === 'notifications'} on:click={() => activeTab = 'notifications'}>
            🔔 Notifikácie
        </button>
        <button class:active={activeTab === 'security'} on:click={() => activeTab = 'security'}>
            🔐 Bezpečnosť
        </button>
        <button class:active={activeTab === 'invoices'} on:click={() => activeTab = 'invoices'}>
            📄 Faktúry
        </button>
    </div>
    
    <div class="tab-content">
        {#if activeTab === 'profile'}
            <form on:submit|preventDefault={saveProfile} class="settings-form">
                <div class="form-section">
                    <h3>Základné informácie</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Názov spoločnosti *</label>
                            <input type="text" bind:value={profile.company_name} placeholder="Názov vašej firmy" required>
                        </div>
                        <div class="form-group">
                            <label>Kontaktná osoba</label>
                            <input type="text" bind:value={profile.contact_person} placeholder="Meno a priezvisko">
                        </div>
                        <div class="form-group">
                            <label>E-mail</label>
                            <input type="email" value={profile.email} disabled>
                            <small>E-mail nie je možné zmeniť</small>
                        </div>
                        <div class="form-group">
                            <label>Telefón</label>
                            <input type="tel" bind:value={profile.phone} placeholder="+421 900 000 000">
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>Identifikačné údaje</h3>
                    <div class="form-grid cols-3">
                        <div class="form-group">
                            <label>IČO</label>
                            <input type="text" bind:value={profile.ico} placeholder="12345678">
                        </div>
                        <div class="form-group">
                            <label>DIČ</label>
                            <input type="text" bind:value={profile.dic} placeholder="1234567890">
                        </div>
                        <div class="form-group">
                            <label>IČ DPH</label>
                            <input type="text" bind:value={profile.ic_dph} placeholder="SK1234567890">
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>Adresa sídla</h3>
                    <div class="form-grid">
                        <div class="form-group full-width">
                            <label>Ulica a číslo</label>
                            <input type="text" bind:value={profile.street} placeholder="Hlavná 123">
                        </div>
                        <div class="form-group">
                            <label>Mesto</label>
                            <input type="text" bind:value={profile.city} placeholder="Bratislava">
                        </div>
                        <div class="form-group">
                            <label>PSČ</label>
                            <input type="text" bind:value={profile.zip} placeholder="831 01">
                        </div>
                        <div class="form-group full-width">
                            <label>Krajina</label>
                            <select bind:value={profile.country}>
                                <option value="Slovensko">Slovensko</option>
                                <option value="Česko">Česko</option>
                                <option value="Maďarsko">Maďarsko</option>
                                <option value="Poľsko">Poľsko</option>
                                <option value="Rakúsko">Rakúsko</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn-primary" disabled={loading}>
                        {loading ? 'Ukladám...' : '💾 Uložiť profil'}
                    </button>
                </div>
            </form>
        {/if}
        
        {#if activeTab === 'billing'}
            <form on:submit|preventDefault={saveBilling} class="settings-form">
                <div class="form-section">
                    <h3>🏦 Bankové údaje</h3>
                    <p class="section-desc">Tieto údaje sa použijú pre príjem platieb a vyplatenie provízií.</p>
                    
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Názov banky</label>
                            <input type="text" bind:value={billing.bank_name} placeholder="Slovenská sporiteľňa">
                        </div>
                        <div class="form-group">
                            <label>Číslo účtu</label>
                            <input type="text" bind:value={billing.bank_account} placeholder="1234567890/0900">
                        </div>
                        <div class="form-group">
                            <label>IBAN</label>
                            <input type="text" bind:value={billing.iban} placeholder="SK89 0900 0000 0012 3456 7890">
                        </div>
                        <div class="form-group">
                            <label>BIC/SWIFT</label>
                            <input type="text" bind:value={billing.swift} placeholder="GIBASKBX">
                        </div>
                    </div>
                </div>
                
                <div class="info-box">
                    <div class="info-icon">ℹ️</div>
                    <div class="info-content">
                        <strong>Informácia</strong>
                        <p>Bankové údaje sa použijú pre automatický výpočet provízií a vystavovanie faktúr.</p>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn-primary" disabled={loading}>
                        {loading ? 'Ukladám...' : '💾 Uložiť bankové údaje'}
                    </button>
                </div>
            </form>
        {/if}
        
        {#if activeTab === 'notifications'}
            <form on:submit|preventDefault={saveNotifications} class="settings-form">
                <div class="form-section">
                    <h3>📧 E-mailové notifikácie</h3>
                    
                    <div class="form-group" style="max-width: 400px; margin-bottom: 24px;">
                        <label>E-mail pre súhrny (voliteľné)</label>
                        <input type="email" bind:value={notifications.summary_email} placeholder="Rovnaký ako prihlasovací e-mail">
                        <small>Ak necháte prázdne, použije sa váš prihlasovací e-mail</small>
                    </div>
                    
                    <div class="notification-grid">
                        <label class="toggle-item">
                            <input type="checkbox" bind:checked={notifications.notify_new_click}>
                            <span class="toggle-label">
                                <strong>Nové prekliky</strong>
                                <small>Notifikácia pri každom prekliku na váš produkt</small>
                            </span>
                        </label>
                        
                        <label class="toggle-item">
                            <input type="checkbox" bind:checked={notifications.notify_new_conversion}>
                            <span class="toggle-label">
                                <strong>Nové konverzie</strong>
                                <small>Notifikácia keď zákazník dokončí objednávku</small>
                            </span>
                        </label>
                        
                        <label class="toggle-item">
                            <input type="checkbox" bind:checked={notifications.notify_low_credit}>
                            <span class="toggle-label">
                                <strong>Nízky kredit</strong>
                                <small>Upozornenie keď kredit klesne pod stanovenú hranicu</small>
                            </span>
                        </label>
                        
                        <label class="toggle-item">
                            <input type="checkbox" bind:checked={notifications.notify_product_issues}>
                            <span class="toggle-label">
                                <strong>Problémy s produktami</strong>
                                <small>Upozornenie na chyby vo feedoch alebo produktoch</small>
                            </span>
                        </label>
                        
                        <label class="toggle-item">
                            <input type="checkbox" bind:checked={notifications.notify_daily_summary}>
                            <span class="toggle-label">
                                <strong>Denný súhrn</strong>
                                <small>Súhrn štatistík každý deň ráno</small>
                            </span>
                        </label>
                        
                        <label class="toggle-item">
                            <input type="checkbox" bind:checked={notifications.notify_weekly_summary}>
                            <span class="toggle-label">
                                <strong>Týždenný súhrn</strong>
                                <small>Súhrn štatistík každý pondelok</small>
                            </span>
                        </label>
                        
                        <label class="toggle-item">
                            <input type="checkbox" bind:checked={notifications.notify_monthly_report}>
                            <span class="toggle-label">
                                <strong>Mesačný report</strong>
                                <small>Detailný report na začiatku každého mesiaca</small>
                            </span>
                        </label>
                        
                        <label class="toggle-item">
                            <input type="checkbox" bind:checked={notifications.notify_system_updates}>
                            <span class="toggle-label">
                                <strong>Systémové aktualizácie</strong>
                                <small>Novinky a dôležité zmeny na platforme</small>
                            </span>
                        </label>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>⚠️ Hranica nízkého kreditu</h3>
                    <div class="form-group" style="max-width: 300px;">
                        <label>Upozorniť keď kredit klesne pod</label>
                        <div class="input-with-suffix">
                            <input type="number" bind:value={notifications.low_credit_threshold} min="0" step="0.5">
                            <span class="suffix">€</span>
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn-primary" disabled={loading}>
                        {loading ? 'Ukladám...' : '💾 Uložiť notifikácie'}
                    </button>
                </div>
            </form>
        {/if}
        
        {#if activeTab === 'security'}
            <div class="security-content">
                <div class="form-section">
                    <h3>🔑 Zmena hesla</h3>
                    <form on:submit|preventDefault={changePassword} class="password-form">
                        <div class="form-group">
                            <label>Aktuálne heslo</label>
                            <input type="password" bind:value={passwordData.current} placeholder="Zadajte aktuálne heslo" required>
                        </div>
                        <div class="form-group">
                            <label>Nové heslo</label>
                            <input type="password" bind:value={passwordData.new} placeholder="Minimálne 6 znakov" required>
                        </div>
                        <div class="form-group">
                            <label>Potvrdenie hesla</label>
                            <input type="password" bind:value={passwordData.confirm} placeholder="Zopakujte nové heslo" required>
                        </div>
                        <button type="submit" class="btn-secondary" disabled={loading}>
                            {loading ? 'Mením...' : '🔐 Zmeniť heslo'}
                        </button>
                    </form>
                </div>
                
                <div class="form-section">
                    <h3>📜 História prihlásení</h3>
                    <p class="section-desc">Posledných 20 prihlásení do vášho účtu</p>
                    
                    {#if loginHistory.length > 0}
                        <div class="login-history-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Dátum a čas</th>
                                        <th>IP adresa</th>
                                        <th>Zariadenie</th>
                                        <th>Stav</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each loginHistory as login}
                                        <tr>
                                            <td>{formatDateTime(login.login_at)}</td>
                                            <td><code>{login.ip_address || '-'}</code></td>
                                            <td>{login.device || 'Neznáme'}</td>
                                            <td>
                                                {#if login.success}
                                                    <span class="badge success small">✓ Úspešné</span>
                                                {:else}
                                                    <span class="badge error small">✗ Neúspešné</span>
                                                {/if}
                                            </td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    {:else}
                        <div class="empty-state small">
                            <p>Žiadna história prihlásení</p>
                        </div>
                    {/if}
                </div>
            </div>
        {/if}
        
        {#if activeTab === 'invoices'}
            <div class="invoices-content">
                <div class="form-section">
                    <h3>📄 Faktúry za CPC služby</h3>
                    <p class="section-desc">Mesačné faktúry za využívanie CPC reklamy</p>
                    
                    {#if invoices.length > 0}
                        <div class="invoices-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Číslo faktúry</th>
                                        <th>Dátum</th>
                                        <th>Obdobie</th>
                                        <th>Suma</th>
                                        <th>Stav</th>
                                        <th>Akcie</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each invoices as invoice}
                                        <tr>
                                            <td><strong>{invoice.invoice_number}</strong></td>
                                            <td>{formatDate(invoice.invoice_date)}</td>
                                            <td>{formatDate(invoice.period_from)} - {formatDate(invoice.period_to)}</td>
                                            <td class="amount">{invoice.total_amount?.toLocaleString('sk-SK', { minimumFractionDigits: 2 })} €</td>
                                            <td>
                                                {#if invoice.status === 'paid'}
                                                    <span class="badge success small">Zaplatená</span>
                                                {:else if invoice.status === 'overdue'}
                                                    <span class="badge error small">Po splatnosti</span>
                                                {:else}
                                                    <span class="badge warning small">Nezaplatená</span>
                                                {/if}
                                            </td>
                                            <td>
                                                {#if invoice.pdf_url}
                                                    <a href={invoice.pdf_url} target="_blank" class="btn-link">📥 PDF</a>
                                                {:else}
                                                    -
                                                {/if}
                                            </td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    {:else}
                        <div class="empty-state">
                            <div class="empty-icon">📄</div>
                            <h4>Zatiaľ žiadne faktúry</h4>
                            <p>Faktúry sa generujú automaticky na konci každého mesiaca za CPC služby.</p>
                        </div>
                    {/if}
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
.account-page { max-width: 1100px; margin: 0 auto; }

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
}

.header-content h1 {
    font-size: 28px;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 4px 0;
}

.header-content p { color: #6b7280; margin: 0; }

.account-summary { display: flex; gap: 24px; }

.summary-item {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.summary-item .label { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
.summary-item .value { font-size: 18px; font-weight: 700; }
.summary-item .value.credit { color: #10b981; }

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
.message button { background: none; border: none; font-size: 20px; cursor: pointer; opacity: 0.7; }

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

.section-desc { color: #6b7280; font-size: 14px; margin: -8px 0 16px 0; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
.form-group { margin-bottom: 0; }
.form-group.full-width { grid-column: 1 / -1; }

.form-group label {
    display: block;
    font-size: 13px;
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
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input:disabled { background: #f9fafb; color: #9ca3af; cursor: not-allowed; }
.form-group small { display: block; font-size: 12px; color: #9ca3af; margin-top: 4px; }

.input-with-suffix { display: flex; align-items: center; }
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

.notification-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.toggle-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    background: #f9fafb;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;
}

.toggle-item:hover { background: #f3f4f6; }
.toggle-item input[type="checkbox"] { width: 18px; height: 18px; margin-top: 2px; cursor: pointer; }
.toggle-label { display: flex; flex-direction: column; }
.toggle-label strong { font-size: 14px; color: #1f2937; }
.toggle-label small { font-size: 12px; color: #6b7280; margin-top: 2px; }

.info-box {
    display: flex;
    gap: 12px;
    padding: 16px;
    background: #eff6ff;
    border-radius: 8px;
    margin-bottom: 24px;
}

.info-icon { font-size: 20px; }
.info-content strong { display: block; color: #1e40af; margin-bottom: 4px; }
.info-content p { color: #3b82f6; font-size: 13px; margin: 0; }

.password-form { max-width: 400px; }
.password-form .form-group { margin-bottom: 16px; }

.login-history-table, .invoices-table { overflow-x: auto; }

table { width: 100%; border-collapse: collapse; }
table th, table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
table th { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; background: #f9fafb; }
table td { font-size: 14px; color: #374151; }
table td code { font-family: monospace; font-size: 12px; background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
table td.amount { font-weight: 600; }

.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; }
.badge.small { padding: 2px 8px; font-size: 11px; }
.badge.success { background: #d1fae5; color: #065f46; }
.badge.warning { background: #fef3c7; color: #92400e; }
.badge.error { background: #fee2e2; color: #991b1b; }

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
.btn-link { color: #3b82f6; text-decoration: none; font-size: 13px; font-weight: 500; }
.btn-link:hover { text-decoration: underline; }

.empty-state { text-align: center; padding: 48px 24px; }
.empty-state.small { padding: 24px; }
.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-state h4 { font-size: 16px; color: #374151; margin: 0 0 8px 0; }
.empty-state p { color: #6b7280; font-size: 14px; margin: 0; }

@media (max-width: 768px) {
    .page-header { flex-direction: column; }
    .account-summary { width: 100%; justify-content: space-between; }
    .summary-item { align-items: flex-start; }
    .tabs { flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .tabs button { padding: 10px 16px; font-size: 13px; }
    .form-grid, .form-grid.cols-3, .notification-grid { grid-template-columns: 1fr; }
    .tab-content { padding: 16px; }
}
</style>
