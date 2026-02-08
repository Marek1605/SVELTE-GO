<script>
    import { onMount } from 'svelte';

    const API_BASE = 'http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io/api/v1';

    let offers = [];
    let shops = [];
    let loading = true;
    let error = null;

    let selectedShop = '';
    let searchQuery = '';
    let statusFilter = '';
    let matchFilter = '';
    let page = 1;
    let limit = 50;
    let total = 0;
    let shopCount = 0;

    let selectedOffers = new Set();
    let selectAll = false;
    let stats = { total: 0, matched: 0, unmatched: 0, active: 0 };

    onMount(async () => {
        await loadShops();
        await loadOffers();
    });

    async function loadShops() {
        try {
            const res = await fetch(`${API_BASE}/admin/shops`);
            const data = await res.json();
            if (data.success) shops = data.data || [];
        } catch (e) { console.error(e); }
    }

    async function loadOffers() {
        loading = true; error = null;
        try {
            let params = `?page=${page}&limit=${limit}`;
            if (selectedShop) params += `&shop_id=${selectedShop}`;
            if (searchQuery) params += `&search=${encodeURIComponent(searchQuery)}`;
            if (statusFilter) params += `&status=${statusFilter}`;
            if (matchFilter) params += `&match=${matchFilter}`;

            const res = await fetch(`${API_BASE}/admin/vendor-offers${params}`);
            const data = await res.json();
            if (data.success) {
                offers = data.data || [];
                total = data.meta?.total || 0;
                shopCount = data.meta?.shop_count || 0;
            } else error = data.error;
        } catch (e) { error = e.message; }
        await loadStats();
        loading = false;
        selectedOffers = new Set();
        selectAll = false;
    }

    async function loadStats() {
        try {
            let params = selectedShop ? `?shop_id=${selectedShop}` : '';
            const res = await fetch(`${API_BASE}/admin/vendor-offers/stats${params}`);
            const data = await res.json();
            if (data.success) stats = data.data || stats;
        } catch (e) { /* optional */ }
    }

    function applyFilters() { page = 1; loadOffers(); }
    function nextPage() { if (page * limit < total) { page++; loadOffers(); } }
    function prevPage() { if (page > 1) { page--; loadOffers(); } }

    function toggleSelect(id) {
        if (selectedOffers.has(id)) selectedOffers.delete(id);
        else selectedOffers.add(id);
        selectedOffers = selectedOffers;
    }

    function toggleSelectAll() {
        if (selectAll) { selectedOffers = new Set(); selectAll = false; }
        else { selectedOffers = new Set(offers.map(o => o.id)); selectAll = true; }
    }

    async function bulkDelete() {
        if (selectedOffers.size === 0) return;
        if (!confirm(`Zmazať ${selectedOffers.size} ponúk?`)) return;
        try {
            const res = await fetch(`${API_BASE}/admin/vendor-offers/bulk-delete`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ offer_ids: [...selectedOffers] })
            });
            const data = await res.json();
            if (data.success) await loadOffers();
            else alert('Chyba: ' + (data.error || 'Neznáma'));
        } catch (e) { alert('Chyba: ' + e.message); }
    }

    async function bulkDeleteAll() {
        if (!selectedShop) { alert('Najprv vyberte obchod'); return; }
        const shopName = shops.find(s => s.id === selectedShop)?.shop_name || selectedShop;
        const filterDesc = matchFilter === 'unmatched' ? ' nespárované' : matchFilter === 'matched' ? ' spárované' : '';
        if (!confirm(`Zmazať VŠETKY${filterDesc} ponuky obchodu "${shopName}" (${fmt(stats.total)})?\n\nTáto akcia je nevratná!`)) return;
        try {
            const res = await fetch(`${API_BASE}/admin/vendor-offers/bulk-delete-all`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shop_id: selectedShop, match_filter: matchFilter, status_filter: statusFilter })
            });
            const data = await res.json();
            if (data.success) { alert(`Zmazaných: ${data.deleted}`); await loadOffers(); }
            else alert('Chyba: ' + (data.error || 'Neznáma'));
        } catch (e) { alert('Chyba: ' + e.message); }
    }

    let processing = false;
    let processMsg = '';

    async function bulkAction(mode) {
        if (selectedOffers.size === 0) { alert('Vyberte ponuky'); return; }
        const labels = { ean: 'EAN párovanie', ai: 'AI kategorizáciu', fulltext: 'Fulltext (odpárovať)' };
        if (!confirm(`Spustiť ${labels[mode]} pre ${selectedOffers.size} ponúk?`)) return;
        processing = true; processMsg = `Spracovávam ${selectedOffers.size} ponúk (${labels[mode]})...`;
        try {
            const res = await fetch(`${API_BASE}/admin/vendor-offers/bulk-action`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ offer_ids: [...selectedOffers], mode })
            });
            const data = await res.json();
            if (data.success) {
                processMsg = `✅ Hotovo! Spárovaných: ${data.matched || 0}, Nových produktov: ${data.created || 0}, Chýb: ${data.errors || 0}`;
                await loadOffers();
            } else { processMsg = '❌ ' + (data.error || 'Chyba'); }
        } catch (e) { processMsg = '❌ ' + e.message; }
        processing = false;
    }
    async function bulkActionAll(mode) {
        if (!selectedShop && mode !== 'fulltext') { alert('Najprv vyberte obchod'); return; }
        const labels = { ean: 'EAN párovanie', ai: 'AI kategorizáciu', fulltext: 'Fulltext (odpárovať)' };
        const filterDesc = matchFilter === 'unmatched' ? ' nespárovaných' : matchFilter === 'matched' ? ' spárovaných' : '';
        if (!confirm(`Spustiť ${labels[mode]} pre VŠETKÝCH${filterDesc} ${fmt(total)} ponúk?\n\nToto môže trvať dlhšie.`)) return;
        processing = true; processMsg = `Spracovávam ${fmt(total)} ponúk (${labels[mode]})...`;
        try {
            const res = await fetch(`${API_BASE}/admin/vendor-offers/bulk-action-all`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shop_id: selectedShop, mode, match_filter: matchFilter, status_filter: statusFilter })
            });
            const data = await res.json();
            if (data.success) {
                processMsg = `✅ Hotovo! Spárovaných: ${data.matched || 0}, Nových: ${data.created || 0}, Chýb: ${data.errors || 0}`;
                await loadOffers();
            } else { processMsg = '❌ ' + (data.error || 'Chyba'); }
        } catch (e) { processMsg = '❌ ' + e.message; }
        processing = false;
    }

    function fmt(n) { return (n || 0).toLocaleString('sk-SK'); }
    function fmtPrice(p) { return p ? Number(p).toFixed(2).replace('.', ',') + ' €' : '-'; }
    function truncate(s, len = 60) { return s && s.length > len ? s.substring(0, len) + '...' : (s || '-'); }
    $: totalPages = Math.ceil(total / limit) || 1;
</script>

<svelte:head><title>Ponuky vendorov | Admin</title></svelte:head>

<div class="page">
    <div class="header">
        <div><h1>🏪 Ponuky vendorov</h1><p class="subtitle">Správa ponúk od predajcov · filter, mazanie, párovanie</p></div>
    </div>

    <div class="stats-row">
        <div class="stat"><span class="n">{fmt(stats.total)}</span><span class="l">Celkom</span></div>
        <div class="stat ok"><span class="n">{fmt(stats.matched)}</span><span class="l">Spárovaných</span></div>
        <div class="stat warn"><span class="n">{fmt(stats.unmatched)}</span><span class="l">Nespárovaných</span></div>
        <div class="stat"><span class="n">{fmt(stats.active)}</span><span class="l">Aktívnych</span></div>
        <div class="stat"><span class="n">{shopCount}</span><span class="l">Obchodov</span></div>
    </div>

    <div class="filters">
        <div class="filter-row">
            <select bind:value={selectedShop} on:change={applyFilters}>
                <option value="">Všetky obchody</option>
                {#each shops as shop}
                    <option value={shop.id}>{shop.shop_name} ({shop.display_mode || 'free'})</option>
                {/each}
            </select>
            <select bind:value={statusFilter} on:change={applyFilters}>
                <option value="">Všetky stavy</option>
                <option value="active">Aktívne</option>
                <option value="inactive">Neaktívne</option>
            </select>
            <select bind:value={matchFilter} on:change={applyFilters}>
                <option value="">Všetky</option>
                <option value="matched">Spárované</option>
                <option value="unmatched">Nespárované</option>
            </select>
            <div class="search-box">
                <input type="text" placeholder="Hľadať názov, EAN..." bind:value={searchQuery} on:keydown={(e) => e.key === 'Enter' && applyFilters()}>
                <button class="btn sm blue" on:click={applyFilters}>🔍</button>
            </div>
        </div>
        <div class="bulk-row">
            {#if selectedOffers.size > 0}
                <span class="selected-count">Vybraných: <b>{selectedOffers.size}</b></span>
                <div class="action-group">
                    <button class="btn sm ean" on:click={() => bulkAction('ean')} disabled={processing}>📦 EAN párovanie</button>
                    <button class="btn sm ai" on:click={() => bulkAction('ai')} disabled={processing}>🤖 AI kategorizácia</button>
                    <button class="btn sm fulltext" on:click={() => bulkAction('fulltext')} disabled={processing}>🔍 Fulltext only</button>
                </div>
                <button class="btn sm red" on:click={bulkDelete} disabled={processing}>🗑️ Zmazať</button>
            {/if}
            {#if selectedShop}
                <div class="action-group-all">
                    <span class="all-label">Všetky ({fmt(total)}):</span>
                    <button class="btn sm ean" on:click={() => bulkActionAll('ean')} disabled={processing}>📦 EAN</button>
                    <button class="btn sm ai" on:click={() => bulkActionAll('ai')} disabled={processing}>🤖 AI</button>
                    <button class="btn sm fulltext" on:click={() => bulkActionAll('fulltext')} disabled={processing}>🔍 Fulltext</button>
                    <button class="btn sm red outline" on:click={bulkDeleteAll} disabled={processing}>🗑️ Zmazať</button>
                </div>
            {/if}
            {#if processMsg}
                <div class="process-msg" class:done={!processing}>{processMsg}</div>
            {/if}
        </div>
    </div>

    {#if loading}
        <div class="loading">Načítavam...</div>
    {:else if error}
        <div class="error">❌ {error}</div>
    {:else if offers.length === 0}
        <div class="empty">Žiadne ponuky {selectedShop ? 'pre tento obchod' : ''}</div>
    {:else}
        <div class="table-wrap">
            <table>
                <thead><tr>
                    <th class="w30"><input type="checkbox" checked={selectAll} on:change={toggleSelectAll}></th>
                    <th>NÁZOV</th><th>OBCHOD</th><th>CENA</th><th>EAN</th><th>STAV</th><th>PÁROVANÉ</th>
                </tr></thead>
                <tbody>
                    {#each offers as offer}
                        <tr class:selected={selectedOffers.has(offer.id)}>
                            <td><input type="checkbox" checked={selectedOffers.has(offer.id)} on:change={() => toggleSelect(offer.id)}></td>
                            <td class="title-cell">
                                <div class="offer-title">{truncate(offer.title, 50)}</div>
                                {#if offer.product_title}<div class="product-match">→ {truncate(offer.product_title, 40)}</div>{/if}
                            </td>
                            <td><span class="shop-badge">{offer.shop_name || '-'}</span></td>
                            <td class="price">{fmtPrice(offer.price)}</td>
                            <td class="ean">{offer.ean || '-'}</td>
                            <td><span class="badge" class:active={offer.is_active} class:inactive={!offer.is_active}>{offer.is_active ? 'Aktívny' : 'Neaktívny'}</span></td>
                            <td>
                                {#if offer.product_id}<span class="badge matched">✅ Áno</span>
                                {:else}<span class="badge unmatched">❌ Nie</span>{/if}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        <div class="pagination">
            <button class="btn sm" disabled={page <= 1} on:click={prevPage}>← Predošlá</button>
            <span class="page-info">Strana {page} z {totalPages} · {fmt(total)} ponúk</span>
            <button class="btn sm" disabled={page >= totalPages} on:click={nextPage}>Ďalšia →</button>
        </div>
    {/if}
</div>

<style>
    .page{max-width:1400px;margin:0 auto;padding:20px}
    .header{margin-bottom:20px}
    h1{font-size:24px;margin:0;color:#1e293b}
    .subtitle{color:#64748b;font-size:14px;margin:4px 0 0}
    .stats-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-bottom:16px}
    .stat{padding:14px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;text-align:center}
    .stat .n{display:block;font-size:22px;font-weight:700;color:#1e293b}
    .stat .l{font-size:11px;color:#64748b;text-transform:uppercase}
    .stat.ok{border-color:#10b981;background:#ecfdf5}.stat.warn{border-color:#f59e0b;background:#fffbeb}
    .filters{background:#fff;padding:16px;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:16px}
    .filter-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
    .filter-row select{padding:8px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;min-width:150px}
    .search-box{display:flex;gap:4px;flex:1;min-width:200px}
    .search-box input{flex:1;padding:8px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:13px}
    .bulk-row{display:flex;gap:10px;align-items:center;margin-top:10px;flex-wrap:wrap}
    .selected-count{font-size:13px;color:#475569;font-weight:500}
    .btn{padding:8px 16px;border:none;border-radius:6px;font-size:13px;font-weight:500;cursor:pointer;transition:.15s}
    .btn.sm{padding:6px 12px;font-size:12px}
    .btn.blue{background:#3b82f6;color:#fff}.btn.blue:hover{background:#2563eb}
    .btn.red{background:#ef4444;color:#fff}.btn.red:hover{background:#dc2626}
    .btn.outline{background:#fff;border:1px solid #ef4444;color:#ef4444}.btn.outline:hover{background:#fef2f2}
    .btn.ean{background:#3b82f6;color:#fff}.btn.ean:hover{background:#2563eb}
    .btn.ai{background:#059669;color:#fff}.btn.ai:hover{background:#047857}
    .btn.fulltext{background:#d97706;color:#fff}.btn.fulltext:hover{background:#b45309}
    .btn:disabled{opacity:.4;cursor:not-allowed}
    .action-group{display:flex;gap:6px;padding:4px 8px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px}
    .action-group-all{display:flex;gap:6px;padding:4px 8px;background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;align-items:center}
    .all-label{font-size:11px;font-weight:600;color:#92400e;white-space:nowrap}
    .process-msg{font-size:12px;color:#475569;padding:4px 10px;background:#f0f9ff;border-radius:6px;border:1px solid #bae6fd}
    .process-msg.done{background:#ecfdf5;border-color:#a7f3d0}
    .loading,.error,.empty{text-align:center;padding:40px;color:#64748b;background:#fff;border:1px solid #e2e8f0;border-radius:10px}
    .error{color:#ef4444}
    .table-wrap{overflow-x:auto;background:#fff;border:1px solid #e2e8f0;border-radius:10px}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th{text-align:left;padding:10px 12px;background:#f8fafc;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;border-bottom:1px solid #e2e8f0;position:sticky;top:0}
    td{padding:10px 12px;border-bottom:1px solid #f1f5f9}
    tr:hover{background:#f8fafc}tr.selected{background:#eff6ff}
    .w30{width:30px}
    .title-cell{max-width:300px}.offer-title{font-weight:500;color:#1e293b}
    .product-match{font-size:11px;color:#10b981;margin-top:2px}
    .shop-badge{padding:2px 8px;background:#f1f5f9;border-radius:4px;font-size:12px;color:#475569}
    .price{font-weight:600;color:#1e293b;white-space:nowrap}
    .ean{font-family:monospace;font-size:12px;color:#64748b}
    .badge{padding:2px 8px;border-radius:10px;font-size:11px;font-weight:500}
    .badge.active{background:#d1fae5;color:#065f46}.badge.inactive{background:#fee2e2;color:#991b1b}
    .badge.matched{background:#d1fae5;color:#065f46}.badge.unmatched{background:#fef3c7;color:#92400e}
    .pagination{display:flex;justify-content:center;align-items:center;gap:16px;padding:16px}
    .page-info{font-size:13px;color:#64748b}
</style>
