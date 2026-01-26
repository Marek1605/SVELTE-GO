<script>
    import { onMount } from 'svelte';
    
    const API_BASE = import.meta.env.VITE_API_URL || 'http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io/api/v1';
    
    let vendors = [];
    let filteredVendors = [];
    let loading = true;
    let error = null;
    
    let showEditModal = false;
    let showNewShopModal = false;
    let showCreditModal = false;
    let currentVendor = null;
    let currentShop = null;
    
    // Credit modal state
    let creditVendor = null;
    let creditAmount = '';
    let creditNote = '';
    let creditLoading = false;
    let creditHistory = [];
    let loadingHistory = false;
    
    let filter = 'all'; // all, pending, active, inactive
    let searchQuery = '';
    
    onMount(loadVendors);
    
    async function loadVendors() {
        loading = true;
        error = null;
        try {
            const res = await fetch(`${API_BASE}/admin/vendors`);
            const data = await res.json();
            if (data.success) {
                vendors = data.data || [];
            } else {
                error = data.error;
            }
        } catch (e) {
            error = 'Chyba pri načítaní predajcov';
        }
        loading = false;
    }
    
    function getFilteredVendors() {
        let filtered = vendors;
        
        if (filter !== 'all') {
            filtered = filtered.filter(v => v.status === filter);
        }
        
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(v => 
                v.company_name?.toLowerCase().includes(q) ||
                v.email?.toLowerCase().includes(q) ||
                v.shop?.shop_name?.toLowerCase().includes(q)
            );
        }
        
        return filtered;
    }
    
    function editVendor(vendor) {
        currentVendor = { ...vendor };
        currentShop = vendor.shop ? { ...vendor.shop } : null;
        showEditModal = true;
    }
    
    async function saveVendor() {
        try {
            // Update vendor
            const vendorRes = await fetch(`${API_BASE}/admin/vendors/${currentVendor.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: currentVendor.status,
                    company_name: currentVendor.company_name,
                    contact_person: currentVendor.contact_person,
                    phone: currentVendor.phone,
                    notes: currentVendor.notes
                })
            });
            
            // Update shop if exists
            if (currentShop && currentShop.id) {
                await fetch(`${API_BASE}/admin/shops/${currentShop.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        shop_name: currentShop.shop_name,
                        shop_url: currentShop.shop_url,
                        shop_status: currentShop.shop_status,
                        display_mode: currentShop.display_mode,
                        cpc_rate: parseFloat(currentShop.cpc_rate) || 0.05,
                        credit_balance: parseFloat(currentShop.credit_balance) || 0,
                        shipping_price: parseFloat(currentShop.shipping_price) || 0,
                        delivery_days: currentShop.delivery_days || '2-3'
                    })
                });
            }
            
            showEditModal = false;
            await loadVendors();
        } catch (e) {
            alert('Chyba pri ukladaní: ' + e.message);
        }
    }
    
    async function approveVendor(vendor) {
        if (!confirm(`Schváliť predajcu "${vendor.company_name || vendor.email}"?`)) return;
        
        try {
            await fetch(`${API_BASE}/admin/vendors/${vendor.id}/approve`, {
                method: 'POST'
            });
            await loadVendors();
        } catch (e) {
            alert('Chyba pri schvaľovaní');
        }
    }
    
    async function rejectVendor(vendor) {
        const reason = prompt('Dôvod zamietnutia (voliteľné):');
        if (reason === null) return;
        
        try {
            await fetch(`${API_BASE}/admin/vendors/${vendor.id}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            });
            await loadVendors();
        } catch (e) {
            alert('Chyba pri zamietnutí');
        }
    }
    
    async function deleteVendor(vendor) {
        if (!confirm(`Naozaj zmazať predajcu "${vendor.company_name || vendor.email}"? Táto akcia je nevratná!`)) return;
        
        try {
            await fetch(`${API_BASE}/admin/vendors/${vendor.id}`, {
                method: 'DELETE'
            });
            await loadVendors();
        } catch (e) {
            alert('Chyba pri mazaní');
        }
    }
    
    async function addCredit(vendor) {
        creditVendor = vendor;
        creditAmount = '';
        creditNote = '';
        creditHistory = [];
        showCreditModal = true;
        
        // Load credit history
        await loadCreditHistory(vendor);
    }
    
    async function loadCreditHistory(vendor) {
        if (!vendor?.shop?.id) return;
        loadingHistory = true;
        try {
            const res = await fetch(`${API_BASE}/admin/shops/${vendor.shop.id}/credit-history`);
            const data = await res.json();
            if (data.success) {
                creditHistory = data.data || [];
            }
        } catch (e) {
            console.error('Error loading credit history:', e);
        }
        loadingHistory = false;
    }
    
    async function submitCredit() {
        const amount = parseFloat(creditAmount);
        if (isNaN(amount) || amount === 0) {
            alert('Zadajte platnú sumu');
            return;
        }
        
        creditLoading = true;
        try {
            const res = await fetch(`${API_BASE}/admin/shops/${creditVendor.shop?.id}/credit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    amount: amount,
                    note: creditNote || (amount > 0 ? 'Admin dobil kredit' : 'Admin odpísal kredit')
                })
            });
            const data = await res.json();
            
            if (data.success) {
                // Force reload data
                vendors = [];
                showCreditModal = false;
                creditVendor = null;
                creditAmount = '';
                creditNote = '';
                await loadVendors();
                alert('Kredit úspešne aktualizovaný!');
            } else {
                alert(data.error || 'Chyba pri operácii s kreditom');
            }
        } catch (e) {
            alert('Chyba pri pripojení na server');
        }
        creditLoading = false;
    }
    
    function closeCreditModal() {
        showCreditModal = false;
        creditVendor = null;
        creditAmount = '';
        creditNote = '';
        creditHistory = [];
    }
    
    function getStatusBadge(status) {
        switch(status) {
            case 'pending': return { class: 'badge-warning', label: 'Čaká na schválenie' };
            case 'active': return { class: 'badge-success', label: 'Aktívny' };
            case 'inactive': return { class: 'badge-secondary', label: 'Neaktívny' };
            case 'rejected': return { class: 'badge-danger', label: 'Zamietnutý' };
            default: return { class: 'badge-secondary', label: status };
        }
    }
    
    function getDisplayModeBadge(mode) {
        switch(mode) {
            case 'free': return { class: 'badge-info', label: 'Zadarmo' };
            case 'cpc': return { class: 'badge-primary', label: 'CPC' };
            case 'premium': return { class: 'badge-warning', label: 'Premium' };
            default: return { class: 'badge-secondary', label: mode };
        }
    }
    
    $: {
        let result = [...vendors];
        if (filter !== 'all') {
            result = result.filter(v => v.status === filter);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(v => 
                v.company_name?.toLowerCase().includes(q) ||
                v.email?.toLowerCase().includes(q) ||
                v.shop?.shop_name?.toLowerCase().includes(q)
            );
        }
        filteredVendors = result;
    }
    $: stats = {
        total: vendors.length,
        pending: vendors.filter(v => v.status === 'pending').length,
        active: vendors.filter(v => v.status === 'active').length,
        totalCredit: vendors.reduce((sum, v) => sum + (v.shop?.credit_balance || 0), 0)
    };
</script>

<div class="page-header">
    <div class="header-content">
        <h1>👥 Predajcovia</h1>
        <p>Správa registrovaných predajcov a ich obchodov</p>
    </div>
</div>

<div class="container">
    {#if error}
        <div class="alert alert-danger">{error} <button on:click={loadVendors}>Znova</button></div>
    {/if}
    
    <!-- Stats Cards -->
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
                <div class="stat-value">{stats.total}</div>
                <div class="stat-label">Celkom predajcov</div>
            </div>
        </div>
        <div class="stat-card warning">
            <div class="stat-icon">⏳</div>
            <div class="stat-content">
                <div class="stat-value">{stats.pending}</div>
                <div class="stat-label">Čaká na schválenie</div>
            </div>
        </div>
        <div class="stat-card success">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
                <div class="stat-value">{stats.active}</div>
                <div class="stat-label">Aktívnych</div>
            </div>
        </div>
        <div class="stat-card info">
            <div class="stat-icon">💰</div>
            <div class="stat-content">
                <div class="stat-value">{stats.totalCredit.toFixed(2)} €</div>
                <div class="stat-label">Celkový kredit</div>
            </div>
        </div>
    </div>
    
    <!-- Filters -->
    <div class="filters-bar">
        <div class="filter-tabs">
            <button class:active={filter === 'all'} on:click={() => filter = 'all'}>
                Všetci ({vendors.length})
            </button>
            <button class:active={filter === 'pending'} on:click={() => filter = 'pending'}>
                Čakajúci ({vendors.filter(v => v.status === 'pending').length})
            </button>
            <button class:active={filter === 'active'} on:click={() => filter = 'active'}>
                Aktívni ({vendors.filter(v => v.status === 'active').length})
            </button>
            <button class:active={filter === 'inactive'} on:click={() => filter = 'inactive'}>
                Neaktívni ({vendors.filter(v => v.status === 'inactive').length})
            </button>
        </div>
        <div class="search-box">
            <input type="text" placeholder="Hľadať predajcu..." bind:value={searchQuery}>
        </div>
    </div>
    
    <!-- Vendors Table -->
    {#if loading}
        <div class="loading">Načítavam predajcov...</div>
    {:else if filteredVendors.length === 0}
        <div class="empty-state">
            <div class="empty-icon">👥</div>
            <h3>Žiadni predajcovia</h3>
            <p>Zatiaľ sa neregistroval žiadny predajca</p>
        </div>
    {:else}
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Predajca</th>
                        <th>Obchod</th>
                        <th>Režim</th>
                        <th>Kredit</th>
                        <th>Ponuky</th>
                        <th>Stav</th>
                        <th>Registrovaný</th>
                        <th>Akcie</th>
                    </tr>
                </thead>
                <tbody>
                    {#each filteredVendors as vendor, i}
                        {@const statusBadge = getStatusBadge(vendor.status)}
                        {@const displayBadge = getDisplayModeBadge(vendor.shop?.display_mode)}
                        <tr>
                            <td class="id-cell">#{vendor.display_id || i + 1}</td>
                            <td>
                                <div class="vendor-info">
                                    <strong>{vendor.company_name || '-'}</strong>
                                    <small>{vendor.email}</small>
                                    {#if vendor.contact_person}
                                        <small class="contact">{vendor.contact_person}</small>
                                    {/if}
                                </div>
                            </td>
                            <td>
                                {#if vendor.shop}
                                    <div class="shop-info">
                                        <strong>{vendor.shop.shop_name}</strong>
                                        <small>
                                            <a href={vendor.shop.shop_url} target="_blank" rel="noopener">
                                                {vendor.shop.shop_url}
                                            </a>
                                        </small>
                                    </div>
                                {:else}
                                    <span class="no-shop">Bez obchodu</span>
                                {/if}
                            </td>
                            <td>
                                {#if vendor.shop}
                                    <span class="badge {displayBadge.class}">{displayBadge.label}</span>
                                    {#if vendor.shop.display_mode === 'cpc'}
                                        <small class="cpc-rate">{vendor.shop.cpc_rate || 0.05} €/klik</small>
                                    {/if}
                                {:else}
                                    -
                                {/if}
                            </td>
                            <td>
                                {#if vendor.shop}
                                    <span class="credit-value">{(vendor.shop.credit_balance || 0).toFixed(2)} €</span>
                                {:else}
                                    -
                                {/if}
                            </td>
                            <td>
                                {vendor.shop?.total_offers || 0}
                            </td>
                            <td>
                                <span class="badge {statusBadge.class}">{statusBadge.label}</span>
                            </td>
                            <td>
                                <small>{new Date(vendor.created_at).toLocaleDateString('sk-SK')}</small>
                            </td>
                            <td class="actions-cell">
                                {#if vendor.status === 'pending'}
                                    <button class="btn btn-sm btn-success" on:click={() => approveVendor(vendor)} title="Schváliť">
                                        ✓
                                    </button>
                                    <button class="btn btn-sm btn-danger" on:click={() => rejectVendor(vendor)} title="Zamietnuť">
                                        ✗
                                    </button>
                                {/if}
                                <button class="btn btn-sm btn-primary" on:click={() => editVendor(vendor)} title="Upraviť">
                                    ✎
                                </button>
                                {#if vendor.shop}
                                    <button class="btn btn-sm btn-info" on:click={() => addCredit(vendor)} title="Pridať kredit">
                                        💰
                                    </button>
                                {/if}
                                <button class="btn btn-sm btn-danger" on:click={() => deleteVendor(vendor)} title="Zmazať">
                                    🗑
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>

<!-- Edit Modal -->
{#if showEditModal && currentVendor}
    <div class="modal-overlay" on:click={() => showEditModal = false}>
        <div class="modal" on:click|stopPropagation>
            <div class="modal-header">
                <h2>Upraviť predajcu #{currentVendor.display_id || currentVendor.id}</h2>
                <button class="close-btn" on:click={() => showEditModal = false}>×</button>
            </div>
            <div class="modal-body">
                <div class="form-section">
                    <h3>Údaje predajcu</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Názov firmy</label>
                            <input type="text" bind:value={currentVendor.company_name}>
                        </div>
                        <div class="form-group">
                            <label>Kontaktná osoba</label>
                            <input type="text" bind:value={currentVendor.contact_person}>
                        </div>
                        <div class="form-group">
                            <label>E-mail</label>
                            <input type="email" bind:value={currentVendor.email} disabled>
                        </div>
                        <div class="form-group">
                            <label>Telefón</label>
                            <input type="text" bind:value={currentVendor.phone}>
                        </div>
                        <div class="form-group">
                            <label>Stav účtu</label>
                            <select bind:value={currentVendor.status}>
                                <option value="pending">Čaká na schválenie</option>
                                <option value="active">Aktívny</option>
                                <option value="inactive">Neaktívny</option>
                                <option value="rejected">Zamietnutý</option>
                            </select>
                        </div>
                        <div class="form-group full-width">
                            <label>Poznámky (interné)</label>
                            <textarea bind:value={currentVendor.notes} rows="2"></textarea>
                        </div>
                    </div>
                </div>
                
                {#if currentShop}
                    <div class="form-section">
                        <h3>Nastavenia obchodu</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Názov obchodu</label>
                                <input type="text" bind:value={currentShop.shop_name}>
                            </div>
                            <div class="form-group">
                                <label>URL obchodu</label>
                                <input type="url" bind:value={currentShop.shop_url}>
                            </div>
                            <div class="form-group">
                                <label>Stav obchodu</label>
                                <select bind:value={currentShop.shop_status}>
                                    <option value="pending">Čaká</option>
                                    <option value="active">Aktívny</option>
                                    <option value="inactive">Neaktívny</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Režim zobrazovania</label>
                                <select bind:value={currentShop.display_mode}>
                                    <option value="free">Zadarmo</option>
                                    <option value="cpc">CPC (platba za klik)</option>
                                    <option value="premium">Premium</option>
                                </select>
                            </div>
                            {#if currentShop.display_mode === 'cpc'}
                                <div class="form-group">
                                    <label>CPC sadzba (€/klik)</label>
                                    <input type="number" step="0.01" min="0" bind:value={currentShop.cpc_rate}>
                                </div>
                            {/if}
                            <div class="form-group">
                                <label>Kredit (€)</label>
                                <input type="number" step="0.01" min="0" bind:value={currentShop.credit_balance}>
                            </div>
                            <div class="form-group">
                                <label>Cena dopravy (€)</label>
                                <input type="number" step="0.01" min="0" bind:value={currentShop.shipping_price}>
                            </div>
                            <div class="form-group">
                                <label>Dodacia doba</label>
                                <input type="text" bind:value={currentShop.delivery_days} placeholder="2-3">
                            </div>
                        </div>
                    </div>
                {/if}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" on:click={() => showEditModal = false}>Zrušiť</button>
                <button class="btn btn-primary" on:click={saveVendor}>Uložiť zmeny</button>
            </div>
        </div>
    </div>
{/if}

<!-- Credit Modal -->
{#if showCreditModal && creditVendor}
    <div class="modal-overlay" on:click={closeCreditModal}>
        <div class="modal credit-modal" on:click|stopPropagation>
            <div class="modal-header">
                <h2>💰 Správa kreditu</h2>
                <button class="close-btn" on:click={closeCreditModal}>×</button>
            </div>
            <div class="modal-body">
                <!-- Vendor Info -->
                <div class="credit-vendor-info">
                    <div class="vendor-avatar">
                        {creditVendor.shop?.shop_name?.charAt(0) || 'V'}
                    </div>
                    <div class="vendor-details">
                        <strong>{creditVendor.shop?.shop_name || creditVendor.company_name}</strong>
                        <span class="vendor-email">{creditVendor.email}</span>
                    </div>
                    <div class="current-balance">
                        <span class="balance-label">Aktuálny kredit</span>
                        <span class="balance-amount">{(creditVendor.shop?.credit_balance || 0).toFixed(2)} €</span>
                    </div>
                </div>
                
                <!-- Credit Form -->
                <div class="credit-form">
                    <h4>Operácia s kreditom</h4>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Suma (€)</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                bind:value={creditAmount}
                                placeholder="Kladná = pridať, záporná = odobrať"
                                class="credit-input"
                            >
                            <small>Zadajte zápornú hodnotu pre odpísanie kreditu</small>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group full-width">
                            <label>Poznámka (voliteľná)</label>
                            <input 
                                type="text" 
                                bind:value={creditNote}
                                placeholder="napr. Faktura #123, Bonus za registráciu..."
                            >
                        </div>
                    </div>
                    
                    <!-- Quick amounts -->
                    <div class="quick-amounts">
                        <button class="quick-btn positive" on:click={() => creditAmount = '10'}>+10€</button>
                        <button class="quick-btn positive" on:click={() => creditAmount = '50'}>+50€</button>
                        <button class="quick-btn positive" on:click={() => creditAmount = '100'}>+100€</button>
                        <button class="quick-btn positive" on:click={() => creditAmount = '500'}>+500€</button>
                        <button class="quick-btn negative" on:click={() => creditAmount = '-10'}>-10€</button>
                        <button class="quick-btn negative" on:click={() => creditAmount = '-50'}>-50€</button>
                    </div>
                    
                    <!-- Preview -->
                    {#if creditAmount && !isNaN(parseFloat(creditAmount))}
                        <div class="credit-preview" class:positive={parseFloat(creditAmount) > 0} class:negative={parseFloat(creditAmount) < 0}>
                            <span>Nový zostatok:</span>
                            <strong>{((creditVendor.shop?.credit_balance || 0) + parseFloat(creditAmount)).toFixed(2)} €</strong>
                        </div>
                    {/if}
                </div>
                
                <!-- Credit History -->
                <div class="credit-history">
                    <h4>📊 História transakcií</h4>
                    {#if loadingHistory}
                        <div class="history-loading">Načítavam...</div>
                    {:else if creditHistory.length === 0}
                        <div class="history-empty">Žiadne transakcie</div>
                    {:else}
                        <div class="history-list">
                            {#each creditHistory.slice(0, 10) as tx}
                                <div class="history-item" class:credit={tx.amount > 0} class:debit={tx.amount < 0}>
                                    <div class="history-main">
                                        <span class="history-amount">{tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)} €</span>
                                        <span class="history-note">{tx.note || tx.description || '-'}</span>
                                    </div>
                                    <div class="history-date">
                                        {new Date(tx.created_at).toLocaleDateString('sk-SK')}
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" on:click={closeCreditModal}>Zrušiť</button>
                <button 
                    class="btn btn-primary" 
                    on:click={submitCredit}
                    disabled={creditLoading || !creditAmount || isNaN(parseFloat(creditAmount))}
                >
                    {#if creditLoading}
                        Ukladám...
                    {:else}
                        {parseFloat(creditAmount) > 0 ? '➕ Pridať kredit' : '➖ Odpísať kredit'}
                    {/if}
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .page-header {
        background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
        color: white;
        padding: 32px 40px;
    }
    
    .header-content h1 {
        margin: 0 0 8px 0;
        font-size: 28px;
    }
    
    .header-content p {
        margin: 0;
        opacity: 0.8;
    }
    
    .container {
        padding: 24px 40px;
    }
    
    .alert {
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    
    .alert-danger {
        background: #fef2f2;
        color: #dc2626;
        border: 1px solid #fecaca;
    }
    
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
        margin-bottom: 24px;
    }
    
    .stat-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 16px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .stat-icon {
        font-size: 32px;
    }
    
    .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: #1e293b;
    }
    
    .stat-label {
        font-size: 13px;
        color: #64748b;
    }
    
    .stat-card.warning .stat-value { color: #f59e0b; }
    .stat-card.success .stat-value { color: #10b981; }
    .stat-card.info .stat-value { color: #3b82f6; }
    
    .filters-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        gap: 20px;
    }
    
    .filter-tabs {
        display: flex;
        gap: 8px;
    }
    
    .filter-tabs button {
        padding: 8px 16px;
        border: 1px solid #e2e8f0;
        background: white;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.2s;
    }
    
    .filter-tabs button:hover {
        background: #f1f5f9;
    }
    
    .filter-tabs button.active {
        background: #3b82f6;
        color: white;
        border-color: #3b82f6;
    }
    
    .search-box input {
        padding: 8px 16px;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        width: 250px;
        font-size: 14px;
    }
    
    .table-container {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .data-table {
        width: 100%;
        border-collapse: collapse;
    }
    
    .data-table th {
        background: #f8fafc;
        padding: 14px 16px;
        text-align: left;
        font-size: 12px;
        text-transform: uppercase;
        color: #64748b;
        font-weight: 600;
        border-bottom: 1px solid #e2e8f0;
    }
    
    .data-table td {
        padding: 14px 16px;
        border-bottom: 1px solid #f1f5f9;
        font-size: 14px;
    }
    
    .data-table tbody tr:hover {
        background: #f8fafc;
    }
    
    .id-cell {
        font-weight: 600;
        color: #64748b;
    }
    
    .vendor-info, .shop-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }
    
    .vendor-info strong, .shop-info strong {
        font-weight: 600;
    }
    
    .vendor-info small, .shop-info small {
        font-size: 12px;
        color: #64748b;
    }
    
    .vendor-info small.contact {
        color: #94a3b8;
    }
    
    .shop-info a {
        color: #3b82f6;
        text-decoration: none;
    }
    
    .no-shop {
        color: #94a3b8;
        font-style: italic;
    }
    
    .badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 600;
    }
    
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-danger { background: #fef2f2; color: #dc2626; }
    .badge-secondary { background: #f1f5f9; color: #64748b; }
    .badge-info { background: #e0f2fe; color: #0369a1; }
    .badge-primary { background: #dbeafe; color: #1d4ed8; }
    
    .cpc-rate {
        display: block;
        font-size: 11px;
        color: #64748b;
        margin-top: 2px;
    }
    
    .credit-value {
        font-weight: 600;
        color: #10b981;
    }
    
    .actions-cell {
        white-space: nowrap;
    }
    
    .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
    }
    
    .btn-sm {
        padding: 6px 10px;
        font-size: 12px;
    }
    
    .btn-primary { background: #3b82f6; color: white; }
    .btn-success { background: #10b981; color: white; }
    .btn-danger { background: #ef4444; color: white; }
    .btn-secondary { background: #6b7280; color: white; }
    .btn-info { background: #06b6d4; color: white; }
    
    .btn:hover { opacity: 0.9; transform: translateY(-1px); }
    
    .loading, .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: #64748b;
    }
    
    .empty-icon {
        font-size: 64px;
        margin-bottom: 16px;
    }
    
    .empty-state h3 {
        margin: 0 0 8px 0;
        color: #334155;
    }
    
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
    }
    
    .modal {
        background: white;
        border-radius: 12px;
        width: 90%;
        max-width: 700px;
        max-height: 90vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
    
    .modal-header {
        padding: 20px 24px;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .modal-header h2 {
        margin: 0;
        font-size: 20px;
    }
    
    .close-btn {
        background: none;
        border: none;
        font-size: 28px;
        cursor: pointer;
        color: #64748b;
        line-height: 1;
    }
    
    .modal-body {
        padding: 24px;
        overflow-y: auto;
        flex: 1;
    }
    
    .form-section {
        margin-bottom: 24px;
    }
    
    .form-section:last-child {
        margin-bottom: 0;
    }
    
    .form-section h3 {
        margin: 0 0 16px 0;
        font-size: 16px;
        color: #334155;
        padding-bottom: 8px;
        border-bottom: 1px solid #e2e8f0;
    }
    
    .form-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
    }
    
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    
    .form-group.full-width {
        grid-column: 1 / -1;
    }
    
    .form-group label {
        font-size: 13px;
        font-weight: 500;
        color: #374151;
    }
    
    .form-group input,
    .form-group select,
    .form-group textarea {
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
    }
    
    .form-group input:disabled {
        background: #f3f4f6;
        color: #6b7280;
    }
    
    .modal-footer {
        padding: 16px 24px;
        border-top: 1px solid #e2e8f0;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
    }
    
    @media (max-width: 768px) {
        .stats-grid {
            grid-template-columns: repeat(2, 1fr);
        }
        
        .filters-bar {
            flex-direction: column;
            align-items: stretch;
        }
        
        .filter-tabs {
            flex-wrap: wrap;
        }
        
        .search-box input {
            width: 100%;
        }
        
        .form-grid {
            grid-template-columns: 1fr;
        }
    }
    
    /* Credit Modal Styles */
    .credit-modal {
        max-width: 600px;
    }
    
    .credit-vendor-info {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        background: #f8fafc;
        border-radius: 12px;
        margin-bottom: 24px;
    }
    
    .vendor-avatar {
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 20px;
    }
    
    .vendor-details {
        flex: 1;
        display: flex;
        flex-direction: column;
    }
    
    .vendor-email {
        font-size: 13px;
        color: #64748b;
    }
    
    .current-balance {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
    }
    
    .balance-label {
        font-size: 12px;
        color: #64748b;
        text-transform: uppercase;
    }
    
    .balance-amount {
        font-size: 24px;
        font-weight: 700;
        color: #059669;
    }
    
    .credit-form h4 {
        margin: 0 0 16px 0;
        font-size: 14px;
        text-transform: uppercase;
        color: #64748b;
    }
    
    .credit-input {
        font-size: 18px !important;
        padding: 12px 16px !important;
    }
    
    .credit-form small {
        display: block;
        margin-top: 4px;
        color: #94a3b8;
        font-size: 12px;
    }
    
    .quick-amounts {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin: 16px 0;
    }
    
    .quick-btn {
        padding: 8px 16px;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        background: white;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
    }
    
    .quick-btn.positive {
        color: #059669;
    }
    
    .quick-btn.positive:hover {
        background: #ecfdf5;
        border-color: #059669;
    }
    
    .quick-btn.negative {
        color: #dc2626;
    }
    
    .quick-btn.negative:hover {
        background: #fef2f2;
        border-color: #dc2626;
    }
    
    .credit-preview {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 24px;
    }
    
    .credit-preview.positive {
        background: #ecfdf5;
        color: #059669;
    }
    
    .credit-preview.negative {
        background: #fef2f2;
        color: #dc2626;
    }
    
    .credit-history {
        border-top: 1px solid #e2e8f0;
        padding-top: 16px;
    }
    
    .credit-history h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        text-transform: uppercase;
        color: #64748b;
    }
    
    .history-loading, .history-empty {
        padding: 20px;
        text-align: center;
        color: #94a3b8;
        font-size: 14px;
    }
    
    .history-list {
        max-height: 200px;
        overflow-y: auto;
    }
    
    .history-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #f1f5f9;
    }
    
    .history-item:last-child {
        border-bottom: none;
    }
    
    .history-main {
        display: flex;
        flex-direction: column;
    }
    
    .history-amount {
        font-weight: 600;
        font-size: 14px;
    }
    
    .history-item.credit .history-amount {
        color: #059669;
    }
    
    .history-item.debit .history-amount {
        color: #dc2626;
    }
    
    .history-note {
        font-size: 12px;
        color: #64748b;
    }
    
    .history-date {
        font-size: 12px;
        color: #94a3b8;
    }
</style>
