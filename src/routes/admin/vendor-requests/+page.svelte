<script>
    import { onMount } from 'svelte';
    
    const API_BASE = '/api/admin';
    let requests = [];
    let stats = { total: 0, pending: 0, approved: 0, rejected: 0 };
    let loading = true;
    let filter = 'pending';
    let message = null;
    let resolveNote = '';
    let showResolveModal = false;
    let resolveAction = '';
    let resolveTarget = null;
    let showImportModal = false;
    let importJson = '';
    let importing = false;
    let shops = [];
    let selectedShop = '';
    
    function getAuth() {
        const u = localStorage.getItem('admin_user') || 'megaprice';
        const p = localStorage.getItem('admin_pass') || 'MegaAdmin2026!';
        return 'Basic ' + btoa(u + ':' + p);
    }
    
    onMount(() => { loadRequests(); loadShops(); });
    
    async function loadShops() {
        try {
            const res = await fetch(API_BASE + '/shops', { headers: { 'Authorization': getAuth() } });
            const data = await res.json();
            shops = data.data || [];
        } catch(e) {}
    }
    
    async function loadRequests() {
        loading = true;
        try {
            let url = API_BASE + '/vendor-requests?status=' + filter;
            if (selectedShop) url += '&shop_id=' + selectedShop;
            const res = await fetch(url, { headers: { 'Authorization': getAuth() } });
            const data = await res.json();
            requests = data.data || [];
            stats = data.stats || stats;
        } catch(e) { console.error(e); }
        loading = false;
    }
    
    function openResolve(req, action) {
        resolveTarget = req;
        resolveAction = action;
        resolveNote = '';
        showResolveModal = true;
    }
    
    async function submitResolve() {
        if (!resolveTarget) return;
        try {
            const res = await fetch(API_BASE + '/vendor-requests/' + resolveTarget.id + '/resolve', {
                method: 'POST',
                headers: { 'Authorization': getAuth(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: resolveAction, admin_note: resolveNote })
            });
            const data = await res.json();
            if (data.success) {
                message = { type: 'success', text: '✅ ' + data.message };
                showResolveModal = false;
                loadRequests();
            } else {
                message = { type: 'error', text: data.error };
            }
        } catch(e) { message = { type: 'error', text: 'Chyba pripojenia' }; }
    }
    
    async function exportJSON() {
        try {
            let url = API_BASE + '/vendor-requests/export-json?status=pending';
            if (selectedShop) url += '&shop_id=' + selectedShop;
            const res = await fetch(url, { headers: { 'Authorization': getAuth() } });
            const blob = await res.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'vendor-requests-export.json';
            a.click();
            message = { type: 'success', text: '📥 JSON exportovaný. Nahrajte ho do Claude/ChatGPT na spracovanie AI.' };
        } catch(e) { message = { type: 'error', text: 'Chyba pri exporte' }; }
    }
    
    async function importAIResults() {
        if (!importJson.trim()) return;
        importing = true;
        try {
            let parsed;
            try { parsed = JSON.parse(importJson); } catch(e) {
                message = { type: 'error', text: 'Neplatný JSON formát' };
                importing = false;
                return;
            }
            const res = await fetch(API_BASE + '/vendor-requests/import-json', {
                method: 'POST',
                headers: { 'Authorization': getAuth(), 'Content-Type': 'application/json' },
                body: JSON.stringify(parsed)
            });
            const data = await res.json();
            if (data.success) {
                message = { type: 'success', text: '✅ ' + data.message };
                showImportModal = false;
                importJson = '';
                loadRequests();
            } else {
                message = { type: 'error', text: data.error };
            }
        } catch(e) { message = { type: 'error', text: 'Chyba pri importe' }; }
        importing = false;
    }
    
    function getTypeLabel(type) {
        return { category_change: '🏷️ Zmena kategórie', pair_product: '🔗 Párovanie' }[type] || type;
    }
    function getStatusBadge(status) {
        return { pending: '⏳ Čaká', approved: '✅ Schválená', rejected: '❌ Zamietnutá' }[status] || status;
    }
    function getStatusClass(status) {
        return { pending: 'badge-warn', approved: 'badge-ok', rejected: 'badge-err' }[status] || '';
    }
    function formatDate(d) {
        if (!d) return '-';
        return new Date(d).toLocaleString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
</script>

<div class="page">
    <div class="page-head">
        <h1>📩 Žiadosti vendorov</h1>
        <p>Schvaľovanie zmien kategórií a párovania produktov</p>
    </div>
    
    {#if message}
        <div class="msg {message.type}">
            {message.text}
            <button on:click={() => message = null}>×</button>
        </div>
    {/if}
    
    <!-- STATS -->
    <div class="stats-row">
        <button class="stat-card" class:active={filter==='all'} on:click={() => { filter='all'; loadRequests(); }}>
            <span class="num">{stats.total}</span>
            <span class="lbl">Celkom</span>
        </button>
        <button class="stat-card warn" class:active={filter==='pending'} on:click={() => { filter='pending'; loadRequests(); }}>
            <span class="num">{stats.pending}</span>
            <span class="lbl">⏳ Čaká</span>
        </button>
        <button class="stat-card ok" class:active={filter==='approved'} on:click={() => { filter='approved'; loadRequests(); }}>
            <span class="num">{stats.approved}</span>
            <span class="lbl">✅ Schválené</span>
        </button>
        <button class="stat-card err" class:active={filter==='rejected'} on:click={() => { filter='rejected'; loadRequests(); }}>
            <span class="num">{stats.rejected}</span>
            <span class="lbl">❌ Zamietnuté</span>
        </button>
    </div>
    
    <!-- TOOLBAR -->
    <div class="toolbar">
        <select bind:value={selectedShop} on:change={loadRequests}>
            <option value="">Všetci predajcovia</option>
            {#each shops as s}
                <option value={s.id}>{s.name}</option>
            {/each}
        </select>
        <div class="toolbar-right">
            <button class="btn green" on:click={exportJSON}>📤 Export JSON pre AI</button>
            <button class="btn blue" on:click={() => { importJson=''; showImportModal=true; }}>📥 Import AI výsledkov</button>
            <button class="btn gray" on:click={loadRequests}>🔄 Obnoviť</button>
        </div>
    </div>
    
    <!-- REQUESTS LIST -->
    {#if loading}
        <div class="loading">Načítavam...</div>
    {:else if requests.length === 0}
        <div class="empty">
            <div class="empty-icon">📭</div>
            <h3>Žiadne žiadosti</h3>
            <p>Vendori zatiaľ nepodali žiadne žiadosti o zmenu.</p>
        </div>
    {:else}
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>DÁTUM</th>
                        <th>OBCHOD</th>
                        <th>TYP</th>
                        <th>PRODUKT</th>
                        <th>DETAIL ŽIADOSTI</th>
                        <th>EAN</th>
                        <th>STAV</th>
                        <th>AKCIE</th>
                    </tr>
                </thead>
                <tbody>
                    {#each requests as r}
                        <tr>
                            <td class="small">{formatDate(r.created_at)}</td>
                            <td><strong>{r.shop_name || '—'}</strong></td>
                            <td>{getTypeLabel(r.request_type)}</td>
                            <td class="product-cell">
                                <strong>{r.offer_title || '—'}</strong>
                                {#if r.offer_price}<br><span class="price">{r.offer_price.toFixed(2)} €</span>{/if}
                            </td>
                            <td class="detail-cell">
                                {#if r.request_type === 'category_change'}
                                    <span class="from">{r.current_category || 'Bez kategórie'}</span>
                                    <span class="arrow">→</span>
                                    <span class="to">{r.requested_category}</span>
                                {:else}
                                    <span class="to">Párovať na: {r.target_product_title || '—'}</span>
                                {/if}
                                {#if r.vendor_note}<br><em class="note">„{r.vendor_note}"</em>{/if}
                                {#if r.ai_reason}<br><span class="ai-note">🤖 {r.ai_reason}</span>{/if}
                            </td>
                            <td class="small">
                                {#if r.offer_ean}
                                    <code>{r.offer_ean}</code>
                                    {#if r.target_product_ean}
                                        <br>vs <code>{r.target_product_ean}</code>
                                        {#if r.offer_ean === r.target_product_ean}
                                            <span class="match">✓</span>
                                        {:else}
                                            <span class="nomatch">✗</span>
                                        {/if}
                                    {/if}
                                {:else}—{/if}
                            </td>
                            <td><span class="badge {getStatusClass(r.status)}">{getStatusBadge(r.status)}</span></td>
                            <td class="actions">
                                {#if r.status === 'pending'}
                                    <button class="btn-sm ok" on:click={() => openResolve(r, 'approve')}>✅ Schváliť</button>
                                    <button class="btn-sm err" on:click={() => openResolve(r, 'reject')}>❌ Zamietnuť</button>
                                {:else}
                                    <span class="small">{r.admin_note || '—'}</span>
                                {/if}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>

<!-- RESOLVE MODAL -->
{#if showResolveModal && resolveTarget}
<div class="modal-bg" on:click={() => showResolveModal=false} on:keydown={() => {}} role="button" tabindex="0">
    <div class="modal" on:click|stopPropagation>
        <div class="modal-head">
            <h3>{resolveAction === 'approve' ? '✅ Schváliť' : '❌ Zamietnuť'} žiadosť</h3>
            <button on:click={() => showResolveModal=false}>&times;</button>
        </div>
        <div class="modal-body">
            <div class="resolve-info">
                <p><strong>{resolveTarget.offer_title}</strong></p>
                <p>{getTypeLabel(resolveTarget.request_type)}: 
                    {#if resolveTarget.request_type === 'category_change'}
                        {resolveTarget.current_category || 'Bez kategórie'} → <strong>{resolveTarget.requested_category}</strong>
                    {:else}
                        Párovať na: <strong>{resolveTarget.target_product_title}</strong>
                    {/if}
                </p>
                {#if resolveTarget.offer_ean && resolveTarget.target_product_ean}
                    <p>EAN ponuka: <code>{resolveTarget.offer_ean}</code> vs cieľ: <code>{resolveTarget.target_product_ean}</code>
                        {#if resolveTarget.offer_ean === resolveTarget.target_product_ean}
                            <span class="match">✓ Zhoduje sa</span>
                        {:else}
                            <span class="nomatch">✗ Neshoduje sa!</span>
                        {/if}
                    </p>
                {/if}
            </div>
            <div class="form-group">
                <label>Poznámka admin (voliteľné)</label>
                <input type="text" bind:value={resolveNote} placeholder="Dôvod schválenia/zamietnutia...">
            </div>
        </div>
        <div class="modal-foot">
            <button class="btn gray" on:click={() => showResolveModal=false}>Zrušiť</button>
            <button class="btn {resolveAction === 'approve' ? 'green' : 'red'}" on:click={submitResolve}>
                {resolveAction === 'approve' ? '✅ Schváliť' : '❌ Zamietnuť'}
            </button>
        </div>
    </div>
</div>
{/if}

<!-- IMPORT MODAL -->
{#if showImportModal}
<div class="modal-bg" on:click={() => showImportModal=false} on:keydown={() => {}} role="button" tabindex="0">
    <div class="modal wide" on:click|stopPropagation>
        <div class="modal-head">
            <h3>📥 Import AI výsledkov</h3>
            <button on:click={() => showImportModal=false}>&times;</button>
        </div>
        <div class="modal-body">
            <div class="ai-info">
                <strong>Postup:</strong><br>
                1. Kliknite "Export JSON pre AI" pre stiahnutie žiadostí<br>
                2. Nahrajte JSON do Claude alebo ChatGPT<br>
                3. AI vráti výsledky — skopírujte JSON odpoveď<br>
                4. Vložte ho sem a kliknite Import
            </div>
            <div class="form-group">
                <label>JSON výsledky z AI</label>
                <textarea rows="12" bind:value={importJson} placeholder='&#123;"results": [&#123;"request_id": "...", "ai_decision": "approve", "ai_reason": "..."&#125;]&#125;'></textarea>
            </div>
        </div>
        <div class="modal-foot">
            <button class="btn gray" on:click={() => showImportModal=false}>Zrušiť</button>
            <button class="btn blue" on:click={importAIResults} disabled={importing || !importJson.trim()}>
                {importing ? 'Importujem...' : '📥 Importovať a aplikovať'}
            </button>
        </div>
    </div>
</div>
{/if}

<style>
    .page { width: 100%; }
    .page-head { margin-bottom: 20px; }
    .page-head h1 { font-size: 22px; margin: 0 0 4px 0; }
    .page-head p { color: #64748b; margin: 0; font-size: 14px; }
    
    .msg { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-radius: 8px; margin-bottom: 12px; font-size: 14px; }
    .msg.success { background: #d1fae5; color: #065f46; }
    .msg.error { background: #fee2e2; color: #991b1b; }
    .msg button { background: none; border: none; font-size: 18px; cursor: pointer; }
    
    .stats-row { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
    .stat-card { flex: 1; min-width: 120px; padding: 16px; background: #fff; border: 2px solid #e2e8f0; border-radius: 10px; cursor: pointer; text-align: center; transition: all 0.2s; }
    .stat-card:hover { border-color: #94a3b8; }
    .stat-card.active { border-color: #3b82f6; background: #eff6ff; }
    .stat-card.warn .num { color: #f59e0b; }
    .stat-card.ok .num { color: #10b981; }
    .stat-card.err .num { color: #ef4444; }
    .stat-card .num { display: block; font-size: 28px; font-weight: 700; color: #1e293b; }
    .stat-card .lbl { font-size: 12px; color: #64748b; }
    
    .toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
    .toolbar select { padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 6px; background: #fff; }
    .toolbar-right { display: flex; gap: 8px; margin-left: auto; }
    
    .btn { padding: 10px 16px; border: none; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; }
    .btn.blue { background: #3b82f6; color: #fff; } .btn.blue:hover { background: #2563eb; }
    .btn.green { background: #10b981; color: #fff; } .btn.green:hover { background: #059669; }
    .btn.gray { background: #f1f5f9; color: #475569; } .btn.gray:hover { background: #e2e8f0; }
    .btn.red { background: #ef4444; color: #fff; } .btn.red:hover { background: #dc2626; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    
    .loading { text-align: center; padding: 60px; color: #64748b; }
    .empty { text-align: center; padding: 60px; background: #fff; border-radius: 12px; }
    .empty-icon { font-size: 48px; }
    .empty h3 { margin: 12px 0 4px; }
    .empty p { color: #64748b; }
    
    .table-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; min-width: 1000px; }
    th { padding: 12px; text-align: left; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
    td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: top; font-size: 13px; }
    tr:hover { background: #f8fafc; }
    
    .small { font-size: 11px; color: #64748b; }
    .price { color: #059669; font-weight: 600; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
    
    .product-cell strong { font-size: 13px; color: #1e293b; }
    .detail-cell .from { color: #ef4444; text-decoration: line-through; }
    .detail-cell .arrow { margin: 0 6px; color: #94a3b8; }
    .detail-cell .to { color: #10b981; font-weight: 500; }
    .detail-cell .note { font-size: 12px; color: #94a3b8; }
    .detail-cell .ai-note { font-size: 12px; color: #7c3aed; background: #f5f3ff; padding: 2px 6px; border-radius: 4px; }
    
    .match { color: #10b981; font-weight: 700; margin-left: 4px; }
    .nomatch { color: #ef4444; font-weight: 700; margin-left: 4px; }
    
    .badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
    .badge-warn { background: #fef3c7; color: #92400e; }
    .badge-ok { background: #d1fae5; color: #065f46; }
    .badge-err { background: #fee2e2; color: #991b1b; }
    
    .actions { display: flex; flex-direction: column; gap: 4px; }
    .btn-sm { padding: 6px 10px; border: 1px solid #e2e8f0; background: #fff; border-radius: 4px; font-size: 11px; cursor: pointer; }
    .btn-sm.ok:hover { background: #d1fae5; border-color: #10b981; }
    .btn-sm.err:hover { background: #fee2e2; border-color: #ef4444; }
    
    .modal-bg { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; }
    .modal { background: #fff; border-radius: 10px; width: 90%; max-width: 500px; max-height: 85vh; overflow: hidden; }
    .modal.wide { max-width: 700px; }
    .modal-head { padding: 14px 18px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; }
    .modal-head h3 { margin: 0; font-size: 15px; }
    .modal-head button { background: none; border: none; font-size: 22px; cursor: pointer; color: #94a3b8; }
    .modal-body { padding: 18px; max-height: calc(85vh - 120px); overflow-y: auto; }
    .modal-foot { padding: 12px 18px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 8px; }
    
    .resolve-info { background: #f8fafc; padding: 14px; border-radius: 8px; margin-bottom: 14px; border: 1px solid #e2e8f0; }
    .resolve-info p { margin: 0 0 4px 0; font-size: 13px; }
    
    .form-group { margin-bottom: 14px; }
    .form-group label { display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 6px; }
    .form-group input, .form-group textarea { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; font-family: inherit; }
    .form-group textarea { resize: vertical; font-family: 'SF Mono', monospace; font-size: 12px; }
    
    .ai-info { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 14px; font-size: 13px; color: #0369a1; margin-bottom: 14px; line-height: 1.6; }
    
    @media (max-width: 768px) {
        .stats-row { flex-direction: column; }
        .toolbar { flex-direction: column; }
        .toolbar-right { margin-left: 0; flex-wrap: wrap; }
    }
</style>
