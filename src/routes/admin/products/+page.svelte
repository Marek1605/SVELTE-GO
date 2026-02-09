<script>
    import { onMount } from 'svelte';
    const API_BASE = 'http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io/api/v1';
    let products = [], categories = [], loading = true, totalCount = 0, currentPage = 1, perPage = 20;
    let searchQuery = '', selectedCategory = '', priceMin = '', priceMax = '', sortBy = 'created_at', sortOrder = 'desc';
    let selectedIds = new Set(), selectAll = false, showEditModal = false, editProduct = null;
    $: totalPages = Math.ceil(totalCount / perPage);

    onMount(() => { loadProducts(); loadCategories(); });

    async function loadProducts() {
        loading = true;
        const params = new URLSearchParams({ page: currentPage, limit: perPage, sort: sortBy, order: sortOrder });
        if (searchQuery) params.set('search', searchQuery);
        if (selectedCategory) params.set('category', selectedCategory);
        if (priceMin) params.set('price_min', priceMin);
        if (priceMax) params.set('price_max', priceMax);
        try {
            const res = await fetch(API_BASE + '/admin/products?' + params.toString());
            const data = await res.json();
            if (data.success && data.data) { products = data.data.items || []; totalCount = data.data.total || 0; }
            else { products = []; totalCount = 0; }
        } catch (e) { products = []; }
        loading = false; selectedIds = new Set(); selectAll = false;
    }
    async function loadCategories() {
        try { const r = await (await fetch(API_BASE + '/categories')).json(); categories = r.data?.items || (Array.isArray(r.data) ? r.data : []); } catch(e) {}
    }
    function applyFilters() { currentPage = 1; loadProducts(); }
    function resetFilters() { searchQuery = ''; selectedCategory = ''; priceMin = ''; priceMax = ''; sortBy = 'created_at'; sortOrder = 'desc'; applyFilters(); }
    function goToPage(p) { if (p >= 1 && p <= totalPages) { currentPage = p; loadProducts(); } }
    function getPaginationPages(cur, tot) {
        if (tot <= 9) return Array.from({length: tot}, (_, i) => i + 1);
        const p = [1]; if (cur > 4) p.push('...'); for (let i = Math.max(2, cur-2); i <= Math.min(tot-1, cur+2); i++) p.push(i); if (cur < tot-3) p.push('...'); p.push(tot); return p;
    }
    function toggleSelect(id) { selectedIds.has(id) ? selectedIds.delete(id) : selectedIds.add(id); selectedIds = new Set(selectedIds); }
    function toggleAll() { selectAll = !selectAll; selectedIds = selectAll ? new Set(products.map(p => p.id)) : new Set(); }
    function openEdit(p) { editProduct = { ...p }; showEditModal = true; }
    async function saveEdit() {
        const r = await (await fetch(API_BASE + '/admin/products/' + editProduct.id, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(editProduct) })).json();
        if (r.success) { showEditModal = false; loadProducts(); } else alert(r.error || 'Chyba');
    }
    async function deleteProduct(id) {
        if (!confirm('Zmazať produkt? Ponuky budú odpojené.')) return;
        await fetch(API_BASE + '/admin/products/' + id, { method: 'DELETE' }); loadProducts();
    }
    async function bulkDelete() {
        if (!selectedIds.size || !confirm(`Zmazať ${selectedIds.size} produktov?`)) return;
        await fetch(API_BASE + '/admin/products/bulk', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({action:'delete', ids: [...selectedIds]}) }); loadProducts();
    }
    async function deleteAll() {
        if (!confirm(`⚠️ Zmazať VŠETKÝCH ${totalCount} produktov?`) || !confirm('Naozaj? Zmažú sa aj ponuky!')) return;
        await fetch(API_BASE + '/admin/products/all', { method: 'DELETE' }); loadProducts();
    }
    function fmt(p) { return p ? p.toFixed(2) + ' €' : '-'; }
    function fmtD(d) { return d ? new Date(d).toLocaleDateString('sk') : '-'; }
</script>

<div class="page">
    <div class="hdr"><h1>📦 Produkty</h1>
        <div class="hdr-r">
            <span class="cnt">{totalCount.toLocaleString()} celkom</span>
            {#if selectedIds.size > 0}<button class="btn danger" on:click={bulkDelete}>🗑️ Zmazať ({selectedIds.size})</button>{/if}
            <button class="btn dng-o" on:click={deleteAll}>🗑️ Všetky</button>
        </div>
    </div>
    <div class="flt">
        <input type="text" placeholder="Hľadať..." bind:value={searchQuery} on:keydown={e => e.key==='Enter' && applyFilters()}>
        <select bind:value={selectedCategory}><option value="">Všetky kat.</option>{#each categories as c}<option value={c.slug||c.id}>{c.name}</option>{/each}</select>
        <input type="number" placeholder="Od" bind:value={priceMin} style="width:70px">
        <input type="number" placeholder="Do" bind:value={priceMax} style="width:70px">
        <select bind:value={sortBy}><option value="created_at">Dátum</option><option value="title">Názov</option><option value="price">Cena</option></select>
        <select bind:value={sortOrder}><option value="desc">↓</option><option value="asc">↑</option></select>
        <button class="btn pri" on:click={applyFilters}>🔍</button>
        <button class="btn" on:click={resetFilters}>✕</button>
        <select bind:value={perPage} on:change={() => { currentPage=1; loadProducts(); }}><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option></select>
    </div>

    {#if loading}<div class="empty">Načítavam...</div>
    {:else if !products.length}<div class="empty">Žiadne produkty</div>
    {:else}
    <table>
        <thead><tr>
            <th><input type="checkbox" checked={selectAll} on:change={toggleAll}></th>
            <th>IMG</th><th>NÁZOV</th><th>KATEGÓRIA</th><th>ZNAČKA</th><th>CENA</th><th>EAN</th><th>PONUKY</th><th>PÔVOD</th><th>DÁTUM</th><th>AKCIE</th>
        </tr></thead>
        <tbody>{#each products as p}
            <tr class:sel={selectedIds.has(p.id)}>
                <td><input type="checkbox" checked={selectedIds.has(p.id)} on:change={() => toggleSelect(p.id)}></td>
                <td class="ic">{#if p.image_url}<img src={p.image_url} alt="" class="th">{:else}<span class="ni">-</span>{/if}</td>
                <td class="tc"><strong>{(p.title||'').substring(0,55)}{(p.title||'').length>55?'…':''}</strong><small>{(p.id||'').substring(0,8)}</small></td>
                <td><span class="bg cat">{p.category_name||'—'}</span></td>
                <td><span class="bg br">{p.brand||'—'}</span></td>
                <td class="pr">{fmt(p.price_min)}</td>
                <td class="ean">{p.ean||'—'}</td>
                <td class="c">{p.offer_count||0}</td>
                <td>{#if p.origin_shop}<span class="bg or">{p.origin_shop}</span>{:else}<span class="bg mn">Manual</span>{/if}</td>
                <td class="dt">{fmtD(p.created_at)}</td>
                <td class="act"><button class="btn sm" on:click={() => openEdit(p)}>✏️</button><button class="btn sm danger" on:click={() => deleteProduct(p.id)}>🗑️</button></td>
            </tr>
        {/each}</tbody>
    </table>
    <div class="pg">
        <button disabled={currentPage===1} on:click={() => goToPage(1)}>««</button>
        <button disabled={currentPage===1} on:click={() => goToPage(currentPage-1)}>‹</button>
        {#each getPaginationPages(currentPage, totalPages) as pg}{#if pg==='...'}<span class="dots">…</span>{:else}<button class:active={currentPage===pg} on:click={() => goToPage(pg)}>{pg}</button>{/if}{/each}
        <button disabled={currentPage===totalPages} on:click={() => goToPage(currentPage+1)}>›</button>
        <button disabled={currentPage===totalPages} on:click={() => goToPage(totalPages)}>»»</button>
        <span class="pi">Str. {currentPage} z {totalPages}</span>
    </div>
    {/if}
</div>

{#if showEditModal && editProduct}
<div class="modal-bg" on:click={() => showEditModal=false}><div class="modal" on:click|stopPropagation>
    <div class="mh"><h3>✏️ Upraviť produkt</h3><button on:click={() => showEditModal=false}>×</button></div>
    <div class="mb">
        {#if editProduct.origin_shop}<div class="oi">📦 Importované z: <strong>{editProduct.origin_shop}</strong></div>{/if}
        {#if editProduct.image_url}<img src={editProduct.image_url} alt="" class="ei">{/if}
        <label>Názov<input bind:value={editProduct.title}></label>
        <label>Popis<textarea bind:value={editProduct.description} rows="3"></textarea></label>
        <div class="rw"><label>EAN<input bind:value={editProduct.ean}></label><label>Značka<input bind:value={editProduct.brand}></label></div>
        <label>Obrázok URL<input bind:value={editProduct.image_url}></label>
        <label>Kategória<select bind:value={editProduct.category_id}><option value="">Bez kat.</option>{#each categories as c}<option value={c.id}>{c.name}</option>{/each}</select></label>
        <div class="ii">ID: {editProduct.id}</div>
    </div>
    <div class="mf"><button class="btn" on:click={() => showEditModal=false}>Zrušiť</button><button class="btn pri" on:click={saveEdit}>💾 Uložiť</button></div>
</div></div>
{/if}

<style>
    .page{padding:20px;max-width:1400px;margin:0 auto}
    .hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px}
    .hdr h1{margin:0;font-size:22px}.hdr-r{display:flex;gap:8px;align-items:center}.cnt{color:#64748b;font-size:13px}
    .flt{display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;align-items:center}
    .flt input,.flt select{padding:5px 8px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px}
    .flt input[type="text"]{min-width:180px}
    .btn{padding:5px 10px;border:1px solid #e2e8f0;background:#fff;border-radius:5px;cursor:pointer;font-size:12px}
    .btn.pri{background:#3b82f6;color:#fff;border-color:#3b82f6}
    .btn.danger{background:#ef4444;color:#fff;border-color:#ef4444}
    .btn.dng-o{color:#ef4444;border-color:#ef4444}
    .btn.sm{padding:3px 6px;font-size:11px}
    table{width:100%;border-collapse:collapse;font-size:12px}
    th{text-align:left;padding:6px 5px;background:#f8fafc;border-bottom:2px solid #e2e8f0;font-size:10px;color:#64748b;text-transform:uppercase}
    td{padding:6px 5px;border-bottom:1px solid #f1f5f9;vertical-align:middle}
    tr:hover{background:#f8fafc}tr.sel{background:#eff6ff}
    .ic{width:36px}.th{width:32px;height:32px;object-fit:cover;border-radius:3px}.ni{color:#cbd5e1}
    .tc strong{display:block;font-size:12px}.tc small{color:#94a3b8;font-size:10px}
    .pr{color:#059669;font-weight:600}.ean{font-family:monospace;font-size:10px;color:#64748b}.c{text-align:center}
    .dt{font-size:10px;color:#94a3b8}.act{white-space:nowrap}
    .bg{display:inline-block;padding:1px 5px;border-radius:3px;font-size:10px}
    .bg.cat{background:#dbeafe;color:#1d4ed8}.bg.br{background:#fef3c7;color:#92400e}
    .bg.or{background:#d1fae5;color:#065f46}.bg.mn{background:#f1f5f9;color:#64748b}
    .pg{display:flex;gap:3px;justify-content:center;align-items:center;padding:14px;flex-wrap:wrap}
    .pg button{padding:5px 9px;border:1px solid #e2e8f0;background:#fff;border-radius:4px;cursor:pointer;font-size:11px}
    .pg button.active{background:#3b82f6;color:#fff}.pg button:disabled{opacity:.4;cursor:not-allowed}
    .pg .dots{padding:5px 3px;color:#94a3b8}.pg .pi{margin-left:10px;font-size:11px;color:#64748b}
    .empty{text-align:center;padding:40px;color:#94a3b8}
    .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;z-index:1000}
    .modal{background:#fff;border-radius:10px;width:90%;max-width:560px;max-height:90vh;overflow-y:auto}
    .mh{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid #e2e8f0}
    .mh h3{margin:0;font-size:16px}.mh button{background:none;border:none;font-size:18px;cursor:pointer}
    .mb{padding:18px}.mb label{display:block;margin-bottom:10px;font-size:12px;font-weight:600;color:#374151}
    .mb input,.mb textarea,.mb select{width:100%;padding:7px;border:1px solid #e2e8f0;border-radius:5px;margin-top:3px;font-size:12px;box-sizing:border-box}
    .rw{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .mf{display:flex;justify-content:flex-end;gap:8px;padding:14px 18px;border-top:1px solid #e2e8f0}
    .oi{padding:7px 10px;background:#d1fae5;border-radius:5px;margin-bottom:10px;font-size:12px}
    .ei{max-width:100px;max-height:100px;border-radius:5px;margin-bottom:10px}.ii{font-size:10px;color:#94a3b8;margin-top:6px}
</style>
