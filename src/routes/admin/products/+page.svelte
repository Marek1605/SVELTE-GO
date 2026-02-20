<script>
    import { adminFetch, adminRawFetch, API_BASE } from '$lib/adminApi.js';
    import { onMount } from 'svelte';

    let products = [], categories = [], loading = true, totalCount = 0, currentPage = 1, perPage = 20;
    let searchQuery = '', selectedCategory = '', priceMin = '', priceMax = '', sortBy = 'created_at', sortOrder = 'desc';
    let selectedIds = new Set(), selectAll = false;
    let showEditModal = false, editProduct = null, saving = false;
    let showFilters = true;

    $: totalPages = Math.ceil(totalCount / perPage);
    $: selectedCount = selectedIds.size;

    onMount(() => { loadProducts(); loadCategories(); });

    async function loadProducts() {
        loading = true;
        const params = new URLSearchParams({ page: currentPage, limit: perPage, sort: sortBy, order: sortOrder });
        if (searchQuery) params.set('search', searchQuery);
        if (selectedCategory) params.set('category', selectedCategory);
        if (priceMin) params.set('price_min', priceMin);
        if (priceMax) params.set('price_max', priceMax);
        try {
            const res = await adminRawFetch(API_BASE + '/admin/products?' + params);
            const data = await res.json();
            products = data?.data?.items || []; totalCount = data?.data?.total || 0;
        } catch (e) { console.error(e); products = []; totalCount = 0; }
        loading = false; selectedIds = new Set(); selectAll = false;
    }

    async function loadCategories() {
        try { const r = await (await adminRawFetch(API_BASE + '/categories')).json(); categories = r?.data?.items || (Array.isArray(r?.data) ? r.data : []); } catch(e) {}
    }

    function applyFilters() { currentPage = 1; loadProducts(); }
    function resetFilters() { searchQuery=''; selectedCategory=''; priceMin=''; priceMax=''; sortBy='created_at'; sortOrder='desc'; applyFilters(); }
    function goToPage(p) { if (p>=1 && p<=totalPages) { currentPage=p; loadProducts(); } }
    function getPages(c, t) {
        if (t<=9) return Array.from({length:t},(_,i)=>i+1);
        const p=[1]; if(c>4) p.push('...'); for(let i=Math.max(2,c-2);i<=Math.min(t-1,c+2);i++) p.push(i); if(c<t-3) p.push('...'); p.push(t); return p;
    }
    function toggleSel(id) { selectedIds.has(id)?selectedIds.delete(id):selectedIds.add(id); selectedIds=new Set(selectedIds); }
    function toggleAll() { selectAll=!selectAll; selectedIds=selectAll?new Set(products.map(p=>p.id)):new Set(); }

    function openEdit(p) { editProduct={...p}; showEditModal=true; }
    async function saveEdit() {
        saving = true;
        try {
            const r = await (await adminRawFetch(API_BASE+'/admin/products/'+editProduct.id, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({
                title: editProduct.title, description: editProduct.description||'', brand: editProduct.brand||'',
                ean: editProduct.ean||'', image_url: editProduct.image_url||'', category_id: editProduct.category_id||null
            })})).json();
            if(r.success) { showEditModal=false; loadProducts(); } else alert(r.error||'Chyba');
        } catch(e) { alert(e.message); }
        saving = false;
    }
    async function deleteOne(id) {
        if(!confirm('Zmazať produkt? Ponuky budú odpojené.')) return;
        await adminRawFetch(API_BASE+'/admin/products/'+id,{method:'DELETE'}); loadProducts();
    }
    async function bulkDelete() {
        if(!selectedIds.size||!confirm(`Zmazať ${selectedIds.size} produktov?`)) return;
        await adminRawFetch(API_BASE+'/admin/products/bulk',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'delete',ids:[...selectedIds]})}); loadProducts();
    }
    async function deleteAll() {
        const c = prompt(`Zmazať VŠETKÝCH ${totalCount} produktov? Napíš "ZMAZAT" pre potvrdenie:`);
        if(c!=='ZMAZAT') return;
        await adminRawFetch(API_BASE+'/admin/products/all',{method:'DELETE'}); loadProducts();
    }
    function fmt(p) { return p ? Number(p).toFixed(2)+' €' : '—'; }
    function fmtD(d) { return d ? new Date(d).toLocaleDateString('sk-SK') : '—'; }
</script>

<div class="page">
    <div class="toolbar">
        <div class="toolbar-left">
            <h1>📦 Produkty</h1>
            <span class="total-badge">{totalCount.toLocaleString()} celkom</span>
        </div>
        <div class="toolbar-right">
            {#if selectedCount > 0}
                <button class="btn danger" on:click={bulkDelete}>🗑️ Zmazať vybrané ({selectedCount})</button>
            {/if}
            <button class="btn outline-danger" on:click={deleteAll}>⚠️ Zmazať všetky</button>
            <button class="btn outline" on:click={() => showFilters=!showFilters}>{showFilters?'▲ Skryť':'▼ Filtre'}</button>
        </div>
    </div>

    {#if showFilters}
    <div class="filter-panel">
        <div class="filter-row">
            <div class="filter-group">
                <label>Hľadať</label>
                <input type="text" placeholder="Názov, EAN, značka..." bind:value={searchQuery} on:keydown={e=>e.key==='Enter'&&applyFilters()}>
            </div>
            <div class="filter-group">
                <label>Kategória</label>
                <select bind:value={selectedCategory}>
                    <option value="">Všetky</option>
                    {#each categories as c}<option value={c.slug||c.id}>{c.name}</option>{/each}
                </select>
            </div>
            <div class="filter-group narrow">
                <label>Cena od</label>
                <input type="number" placeholder="0" bind:value={priceMin}>
            </div>
            <div class="filter-group narrow">
                <label>Cena do</label>
                <input type="number" placeholder="∞" bind:value={priceMax}>
            </div>
            <div class="filter-group">
                <label>Zoradiť</label>
                <select bind:value={sortBy}>
                    <option value="created_at">Dátum pridania</option>
                    <option value="title">Názov A-Z</option>
                    <option value="price">Cena</option>
                </select>
            </div>
            <div class="filter-group narrow">
                <label>Poradie</label>
                <select bind:value={sortOrder}>
                    <option value="desc">↓ Zostupne</option>
                    <option value="asc">↑ Vzostupne</option>
                </select>
            </div>
        </div>
        <div class="filter-actions">
            <button class="btn primary" on:click={applyFilters}>🔍 Filtrovať</button>
            <button class="btn" on:click={resetFilters}>✕ Reset</button>
            <div class="per-page">
                <label>Na stránku:</label>
                <select bind:value={perPage} on:change={()=>{currentPage=1;loadProducts();}}>
                    <option value={20}>20</option><option value={50}>50</option><option value={100}>100</option>
                </select>
            </div>
        </div>
    </div>
    {/if}

    {#if loading}
        <div class="state">⏳ Načítavam produkty...</div>
    {:else if !products.length}
        <div class="state">📭 Žiadne produkty</div>
    {:else}
    <div class="table-wrap">
        <table>
            <thead><tr>
                <th class="w30"><input type="checkbox" checked={selectAll} on:change={toggleAll}></th>
                <th class="w50">IMG</th>
                <th>NÁZOV</th>
                <th>KATEGÓRIA</th>
                <th>ZNAČKA</th>
                <th class="w80">CENA</th>
                <th>EAN</th>
                <th class="w50">PONUKY</th>
                <th>PÔVOD</th>
                <th class="w80">DÁTUM</th>
                <th class="w100">AKCIE</th>
            </tr></thead>
            <tbody>{#each products as p (p.id)}
                <tr class:selected={selectedIds.has(p.id)}>
                    <td><input type="checkbox" checked={selectedIds.has(p.id)} on:change={()=>toggleSel(p.id)}></td>
                    <td>{#if p.image_url}<img src={p.image_url} alt="" class="thumb">{:else}<div class="no-img">📷</div>{/if}</td>
                    <td class="name-cell">
                        <div class="name-title">{(p.title||'').substring(0,65)}{(p.title||'').length>65?'…':''}</div>
                        <div class="name-id">{(p.id||'').substring(0,8)}</div>
                    </td>
                    <td>{#if p.category_name}<span class="tag blue">{p.category_name}</span>{:else}<span class="tag gray">—</span>{/if}</td>
                    <td>{#if p.brand}<span class="tag yellow">{p.brand}</span>{:else}—{/if}</td>
                    <td class="price">{fmt(p.price_min)}</td>
                    <td class="mono">{p.ean||'—'}</td>
                    <td class="center">{p.offer_count||0}</td>
                    <td>{#if p.origin_shop}<span class="tag green">{p.origin_shop}</span>{:else}<span class="tag gray">manuálne</span>{/if}</td>
                    <td class="date">{fmtD(p.created_at)}</td>
                    <td class="actions">
                        <button class="icon-btn" on:click={()=>openEdit(p)} title="Upraviť">✏️</button>
                        <button class="icon-btn danger" on:click={()=>deleteOne(p.id)} title="Zmazať">🗑️</button>
                    </td>
                </tr>
            {/each}</tbody>
        </table>
    </div>

    <div class="pagination">
        <button disabled={currentPage===1} on:click={()=>goToPage(1)}>⏮</button>
        <button disabled={currentPage===1} on:click={()=>goToPage(currentPage-1)}>◀</button>
        {#each getPages(currentPage, totalPages) as pg}
            {#if pg==='...'}<span class="ellipsis">…</span>
            {:else}<button class:active={currentPage===pg} on:click={()=>goToPage(pg)}>{pg}</button>{/if}
        {/each}
        <button disabled={currentPage>=totalPages} on:click={()=>goToPage(currentPage+1)}>▶</button>
        <button disabled={currentPage>=totalPages} on:click={()=>goToPage(totalPages)}>⏭</button>
        <span class="page-label">Strana {currentPage} z {totalPages}</span>
    </div>
    {/if}
</div>

{#if showEditModal && editProduct}
<div class="overlay" on:click={()=>showEditModal=false} role="dialog">
    <div class="dialog" on:click|stopPropagation>
        <div class="dialog-header">
            <h2>✏️ Upraviť produkt</h2>
            <button class="close-btn" on:click={()=>showEditModal=false}>×</button>
        </div>
        <div class="dialog-body">
            {#if editProduct.origin_shop}
                <div class="origin-banner">📦 Importované z: <strong>{editProduct.origin_shop}</strong></div>
            {/if}
            <div class="form-row">
                {#if editProduct.image_url}<img src={editProduct.image_url} alt="" class="preview-img">{/if}
            </div>
            <div class="form-group"><label>Názov</label><input bind:value={editProduct.title}></div>
            <div class="form-group"><label>Popis</label><textarea bind:value={editProduct.description} rows="3"></textarea></div>
            <div class="form-grid-2">
                <div class="form-group"><label>EAN</label><input bind:value={editProduct.ean}></div>
                <div class="form-group"><label>Značka</label><input bind:value={editProduct.brand}></div>
            </div>
            <div class="form-group"><label>Obrázok URL</label><input bind:value={editProduct.image_url} placeholder="https://..."></div>
            <div class="form-group">
                <label>Kategória</label>
                <select bind:value={editProduct.category_id}>
                    <option value="">— Bez kategórie —</option>
                    {#each categories as c}<option value={c.id}>{c.name}</option>{/each}
                </select>
            </div>
            <div class="meta-info">🆔 {editProduct.id} · 📅 {fmtD(editProduct.created_at)}</div>
        </div>
        <div class="dialog-footer">
            <button class="btn" on:click={()=>showEditModal=false}>Zrušiť</button>
            <button class="btn primary" on:click={saveEdit} disabled={saving}>{saving?'Ukladám...':'💾 Uložiť'}</button>
        </div>
    </div>
</div>
{/if}

<style>
    .page { padding: 24px; max-width: 1500px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    
    .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
    .toolbar-left { display: flex; align-items: center; gap: 12px; }
    .toolbar-left h1 { margin: 0; font-size: 24px; font-weight: 700; }
    .toolbar-right { display: flex; gap: 8px; flex-wrap: wrap; }
    .total-badge { background: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }

    .filter-panel { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 16px; }
    .filter-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
    .filter-group { display: flex; flex-direction: column; gap: 4px; min-width: 140px; flex: 1; }
    .filter-group.narrow { max-width: 100px; flex: 0 0 100px; }
    .filter-group label { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .filter-group input, .filter-group select { padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; background: #fff; }
    .filter-actions { display: flex; gap: 8px; align-items: center; }
    .per-page { margin-left: auto; display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748b; }
    .per-page select { padding: 6px; border: 1px solid #d1d5db; border-radius: 4px; }

    .btn { padding: 7px 14px; border: 1px solid #d1d5db; background: #fff; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all .15s; }
    .btn:hover { background: #f1f5f9; }
    .btn.primary { background: #3b82f6; color: #fff; border-color: #3b82f6; }
    .btn.primary:hover { background: #2563eb; }
    .btn.danger { background: #ef4444; color: #fff; border-color: #ef4444; }
    .btn.outline-danger { color: #ef4444; border-color: #fca5a5; }
    .btn.outline-danger:hover { background: #fef2f2; }
    .btn.outline { color: #64748b; }

    .table-wrap { overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 10px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead { background: #f1f5f9; }
    th { text-align: left; padding: 10px 8px; font-size: 10px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; white-space: nowrap; }
    td { padding: 10px 8px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    tr:hover { background: #f8fafc; }
    tr.selected { background: #eff6ff; }
    .w30 { width: 30px; } .w50 { width: 50px; } .w80 { width: 80px; } .w100 { width: 100px; }

    .thumb { width: 40px; height: 40px; object-fit: cover; border-radius: 6px; border: 1px solid #e2e8f0; }
    .no-img { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: #f1f5f9; border-radius: 6px; font-size: 16px; }
    .name-cell .name-title { font-weight: 600; color: #1e293b; line-height: 1.3; }
    .name-cell .name-id { font-size: 10px; color: #94a3b8; font-family: monospace; margin-top: 2px; }
    .price { font-weight: 700; color: #059669; white-space: nowrap; }
    .mono { font-family: monospace; font-size: 11px; color: #64748b; }
    .center { text-align: center; font-weight: 600; }
    .date { font-size: 11px; color: #94a3b8; white-space: nowrap; }
    .actions { white-space: nowrap; display: flex; gap: 4px; }

    .tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; }
    .tag.blue { background: #dbeafe; color: #1d4ed8; }
    .tag.yellow { background: #fef3c7; color: #92400e; }
    .tag.green { background: #d1fae5; color: #065f46; }
    .tag.gray { background: #f1f5f9; color: #94a3b8; }

    .icon-btn { background: none; border: 1px solid transparent; cursor: pointer; padding: 4px 6px; border-radius: 4px; font-size: 14px; transition: all .15s; }
    .icon-btn:hover { background: #f1f5f9; border-color: #e2e8f0; }
    .icon-btn.danger:hover { background: #fef2f2; border-color: #fca5a5; }

    .pagination { display: flex; gap: 4px; justify-content: center; align-items: center; padding: 16px; flex-wrap: wrap; }
    .pagination button { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; border: 1px solid #e2e8f0; background: #fff; border-radius: 6px; cursor: pointer; font-size: 12px; transition: all .15s; }
    .pagination button:hover:not(:disabled) { background: #f1f5f9; }
    .pagination button.active { background: #3b82f6; color: #fff; border-color: #3b82f6; }
    .pagination button:disabled { opacity: 0.3; cursor: not-allowed; }
    .ellipsis { padding: 0 4px; color: #94a3b8; }
    .page-label { margin-left: 12px; font-size: 12px; color: #64748b; }

    .state { text-align: center; padding: 60px 20px; color: #94a3b8; font-size: 16px; }

    .overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(2px); }
    .dialog { background: #fff; border-radius: 14px; width: 92%; max-width: 620px; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
    .dialog-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; border-bottom: 1px solid #e2e8f0; }
    .dialog-header h2 { margin: 0; font-size: 18px; }
    .close-btn { background: none; border: none; font-size: 22px; cursor: pointer; color: #94a3b8; padding: 4px; }
    .close-btn:hover { color: #1e293b; }
    .dialog-body { padding: 24px; }
    .dialog-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid #e2e8f0; background: #f8fafc; border-radius: 0 0 14px 14px; }

    .form-group { margin-bottom: 14px; }
    .form-group label { display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 4px; }
    .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 9px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 13px; box-sizing: border-box; transition: border .15s; }
    .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
    .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .origin-banner { padding: 10px 14px; background: #d1fae5; border-radius: 8px; margin-bottom: 14px; font-size: 13px; border: 1px solid #a7f3d0; }
    .preview-img { max-width: 120px; max-height: 120px; border-radius: 8px; border: 1px solid #e2e8f0; }
    .meta-info { font-size: 11px; color: #94a3b8; margin-top: 8px; padding-top: 8px; border-top: 1px solid #f1f5f9; }
</style>
