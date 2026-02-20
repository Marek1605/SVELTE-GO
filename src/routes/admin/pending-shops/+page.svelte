<script>
    import { adminFetch, adminRawFetch, API_BASE } from '$lib/adminApi.js';
    import { onMount } from 'svelte';
    
    
    
    let shops = [];
    let loading = true;
    let error = null;
    let selectedShop = null;
    let rejectReason = '';
    let showRejectModal = false;
    
    onMount(loadPendingShops);
    
    async function loadPendingShops() {
        loading = true;
        try {
            const res = await adminRawFetch(`${API_BASE}/admin/pending-shops`);
            const data = await res.json();
            if (data.success) {
                shops = data.data || [];
            } else {
                error = data.error;
            }
        } catch (e) {
            error = 'Chyba pri načítaní';
        }
        loading = false;
    }
    
    async function approveShop(shop) {
        if (!confirm(`Schváliť obchod "${shop.shop_name}"?`)) return;
        
        try {
            const res = await adminRawFetch(`${API_BASE}/admin/shops/${shop.id}/approve`, {
                method: 'POST'
            });
            const data = await res.json();
            if (data.success) {
                await loadPendingShops();
            } else {
                alert('Chyba: ' + (data.error || data.message));
            }
        } catch (e) {
            alert('Chyba pri schvaľovaní');
        }
    }
    
    function openRejectModal(shop) {
        selectedShop = shop;
        rejectReason = '';
        showRejectModal = true;
    }
    
    async function rejectShop() {
        try {
            const res = await adminRawFetch(`${API_BASE}/admin/shops/${selectedShop.id}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: rejectReason })
            });
            const data = await res.json();
            if (data.success) {
                showRejectModal = false;
                await loadPendingShops();
            } else {
                alert('Chyba: ' + (data.error || data.message));
            }
        } catch (e) {
            alert('Chyba pri zamietnutí');
        }
    }
    
    function formatDate(d) {
        if (!d) return '-';
        return new Date(d).toLocaleString('sk-SK');
    }
</script>

<div class="ps-page">
    <div class="ps-header">
        <h1>
            <span class="material-icons-round">pending_actions</span>
            Obchody čakajúce na schválenie
        </h1>
        <span class="ps-count">{shops.length}</span>
    </div>
    
    {#if loading}
        <div class="ps-loading">
            <div class="ps-spinner"></div>
            Načítavam...
        </div>
    {:else if error}
        <div class="ps-error">{error}</div>
    {:else if shops.length === 0}
        <div class="ps-empty">
            <span class="material-icons-round">check_circle</span>
            <p>Žiadne obchody nečakajú na schválenie</p>
        </div>
    {:else}
        <div class="ps-list">
            {#each shops as shop}
                <div class="ps-card">
                    <div class="ps-card-header">
                        <div class="ps-card-title">
                            <h2>{shop.shop_name}</h2>
                            {#if shop.shop_url}
                                <a href={shop.shop_url} target="_blank" class="ps-url">{shop.shop_url}</a>
                            {/if}
                        </div>
                        <div class="ps-card-meta">
                            <span class="ps-badge">Čaká na schválenie</span>
                            <span class="ps-date">{formatDate(shop.created_at)}</span>
                        </div>
                    </div>
                    
                    <div class="ps-card-vendor">
                        <span class="material-icons-round">person</span>
                        <strong>{shop.vendor_company}</strong>
                        <span class="ps-email">({shop.vendor_email})</span>
                    </div>
                    
                    {#if shop.billing}
                        <div class="ps-billing">
                            <h3>
                                <span class="material-icons-round">receipt_long</span>
                                Fakturačné údaje
                            </h3>
                            <div class="ps-billing-grid">
                                {#if shop.billing.company}
                                    <div class="ps-billing-item">
                                        <span class="ps-bl">Firma</span>
                                        <span>{shop.billing.company}</span>
                                    </div>
                                {/if}
                                {#if shop.billing.ico}
                                    <div class="ps-billing-item">
                                        <span class="ps-bl">IČO</span>
                                        <span>{shop.billing.ico}</span>
                                    </div>
                                {/if}
                                {#if shop.billing.dic}
                                    <div class="ps-billing-item">
                                        <span class="ps-bl">DIČ</span>
                                        <span>{shop.billing.dic}</span>
                                    </div>
                                {/if}
                                {#if shop.billing.ic_dph}
                                    <div class="ps-billing-item">
                                        <span class="ps-bl">IČ DPH</span>
                                        <span>{shop.billing.ic_dph}</span>
                                    </div>
                                {/if}
                                {#if shop.billing.address}
                                    <div class="ps-billing-item full">
                                        <span class="ps-bl">Adresa</span>
                                        <span>{shop.billing.address}, {shop.billing.zip} {shop.billing.city}, {shop.billing.country}</span>
                                    </div>
                                {/if}
                                {#if shop.billing.contact_person}
                                    <div class="ps-billing-item">
                                        <span class="ps-bl">Kontakt</span>
                                        <span>{shop.billing.contact_person}</span>
                                    </div>
                                {/if}
                                {#if shop.billing.phone}
                                    <div class="ps-billing-item">
                                        <span class="ps-bl">Telefón</span>
                                        <span>{shop.billing.phone}</span>
                                    </div>
                                {/if}
                                {#if shop.billing.email}
                                    <div class="ps-billing-item">
                                        <span class="ps-bl">Email</span>
                                        <span>{shop.billing.email}</span>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    {/if}
                    
                    <div class="ps-card-actions">
                        <button class="ps-btn ps-btn-approve" on:click={() => approveShop(shop)}>
                            <span class="material-icons-round">check</span>
                            Schváliť
                        </button>
                        <button class="ps-btn ps-btn-reject" on:click={() => openRejectModal(shop)}>
                            <span class="material-icons-round">close</span>
                            Zamietnuť
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
    
    <!-- Reject modal -->
    {#if showRejectModal}
        <div class="ps-overlay" on:click={() => showRejectModal = false}></div>
        <div class="ps-modal">
            <h2>Zamietnuť obchod: {selectedShop?.shop_name}</h2>
            <div class="ps-modal-field">
                <label>Dôvod zamietnutia (voliteľné)</label>
                <textarea bind:value={rejectReason} placeholder="Napíšte dôvod zamietnutia..." rows="3"></textarea>
            </div>
            <div class="ps-modal-actions">
                <button class="ps-btn ps-btn-ghost" on:click={() => showRejectModal = false}>Zrušiť</button>
                <button class="ps-btn ps-btn-reject" on:click={rejectShop}>Zamietnuť</button>
            </div>
        </div>
    {/if}
</div>

<style>
    .ps-page { padding: 0; }
    
    .ps-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 24px;
    }
    .ps-header h1 {
        font-size: 20px;
        font-weight: 700;
        color: #0f172a;
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
    }
    .ps-header h1 .material-icons-round { color: #f59e0b; font-size: 24px; }
    .ps-count {
        background: #f59e0b;
        color: white;
        font-size: 12px;
        font-weight: 700;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .ps-loading { text-align: center; padding: 40px; color: #64748b; }
    .ps-spinner {
        width: 24px;
        height: 24px;
        border: 3px solid #e2e8f0;
        border-top-color: #3b82f6;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        display: inline-block;
        margin-right: 8px;
        vertical-align: middle;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    .ps-error { color: #dc2626; padding: 20px; background: #fef2f2; border-radius: 8px; }
    
    .ps-empty {
        text-align: center;
        padding: 60px 20px;
        color: #64748b;
    }
    .ps-empty .material-icons-round { font-size: 48px; color: #10b981; display: block; margin-bottom: 12px; }
    
    .ps-list { display: flex; flex-direction: column; gap: 16px; }
    
    .ps-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        border-left: 4px solid #f59e0b;
    }
    
    .ps-card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;
    }
    .ps-card-title h2 { font-size: 18px; font-weight: 600; color: #0f172a; margin: 0 0 4px; }
    .ps-url { font-size: 13px; color: #3b82f6; text-decoration: none; }
    .ps-url:hover { text-decoration: underline; }
    .ps-card-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
    .ps-badge {
        background: #fef3c7;
        color: #92400e;
        font-size: 11px;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: 4px;
        text-transform: uppercase;
    }
    .ps-date { font-size: 12px; color: #94a3b8; }
    
    .ps-card-vendor {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        color: #475569;
        margin-bottom: 16px;
    }
    .ps-card-vendor .material-icons-round { font-size: 18px; color: #94a3b8; }
    .ps-email { color: #94a3b8; }
    
    .ps-billing {
        background: #f8fafc;
        border-radius: 8px;
        padding: 14px;
        margin-bottom: 16px;
    }
    .ps-billing h3 {
        font-size: 13px;
        font-weight: 600;
        color: #64748b;
        display: flex;
        align-items: center;
        gap: 6px;
        margin: 0 0 10px;
        text-transform: uppercase;
        letter-spacing: 0.03em;
    }
    .ps-billing h3 .material-icons-round { font-size: 16px; }
    .ps-billing-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
    }
    .ps-billing-item {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }
    .ps-billing-item.full { grid-column: 1 / -1; }
    .ps-bl { font-size: 11px; color: #94a3b8; font-weight: 500; text-transform: uppercase; }
    .ps-billing-item span:last-child { font-size: 14px; color: #1e293b; }
    
    .ps-card-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    }
    
    .ps-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition: all 0.15s;
    }
    .ps-btn .material-icons-round { font-size: 18px; }
    .ps-btn-approve { background: #10b981; color: white; }
    .ps-btn-approve:hover { background: #059669; }
    .ps-btn-reject { background: #fee2e2; color: #dc2626; }
    .ps-btn-reject:hover { background: #fecaca; }
    .ps-btn-ghost { background: transparent; color: #64748b; }
    .ps-btn-ghost:hover { background: #f1f5f9; }
    
    /* Modal */
    .ps-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.4);
        z-index: 1000;
    }
    .ps-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 12px;
        padding: 24px;
        width: 400px;
        max-width: 90vw;
        z-index: 1001;
        box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }
    .ps-modal h2 { font-size: 16px; margin: 0 0 16px; color: #0f172a; }
    .ps-modal-field label { display: block; font-size: 13px; font-weight: 500; color: #475569; margin-bottom: 6px; }
    .ps-modal-field textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 14px;
        resize: vertical;
    }
    .ps-modal-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 16px;
    }
</style>
