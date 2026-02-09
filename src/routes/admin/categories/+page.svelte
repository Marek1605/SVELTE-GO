<script>
    import { onMount } from 'svelte';
    const API = 'http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io/api/v1';

    let categories = [];
    let loading = true;
    let searchQuery = '';
    let filterMode = ''; // '', 'no_image', 'empty'
    let selectedIds = new Set();
    let selectAll = false;
    let expandedIds = new Set();
    let showEditModal = false;
    let editCat = null;
    let editImageUrl = '';
    let savingId = null;
    let regeneratingId = null;
    let regeneratingAll = false;
    let deleting = false;

    onMount(loadCategories);

    async function loadCategories() {
        loading = true;
        try {
            const res = await fetch(`${API}/admin/categories`);
            const data = await res.json();
            if (data.success && data.data) categories = Array.isArray(data.data) ? data.data : (data.data?.data || []);
            else if (Array.isArray(data)) categories = data;
            else categories = [];
        } catch (e) { categories = []; }
        loading = false;
    }

    function flatten(cats, level = 0, parentPath = '') {
        let r = [];
        cats.forEach(c => {
            const path = parentPath ? `${parentPath} › ${c.name}` : c.name;
            r.push({ ...c, level, path, hasChildren: !!(c.children?.length) });
            if (c.children?.length && expandedIds.has(c.id)) {
                r = r.concat(flatten(c.children, level + 1, path));
            }
        });
        return r;
    }

    function flattenAll(cats, level = 0, parentPath = '') {
        let r = [];
        cats.forEach(c => {
            const path = parentPath ? `${parentPath} › ${c.name}` : c.name;
            r.push({ ...c, level, path, hasChildren: !!(c.children?.length) });
            if (c.children?.length) r = r.concat(flattenAll(c.children, level + 1, path));
        });
        return r;
    }

    $: allFlat = flattenAll(categories);
    $: treeFlat = (expandedIds, flatten(categories));

    $: filtered = (() => {
        let list = searchQuery ? allFlat : treeFlat;
        if (searchQuery) list = list.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.path.toLowerCase().includes(searchQuery.toLowerCase()));
        if (filterMode === 'no_image') list = list.filter(c => !c.image_url);
        if (filterMode === 'empty') list = list.filter(c => (c.product_count || 0) === 0);
        return list;
    })();

    $: stats = {
        total: allFlat.length,
        withImage: allFlat.filter(c => c.image_url).length,
        noImage: allFlat.filter(c => !c.image_url).length,
        empty: allFlat.filter(c => (c.product_count || 0) === 0).length
    };

    function toggle(id) {
        if (expandedIds.has(id)) expandedIds.delete(id); else expandedIds.add(id);
        expandedIds = expandedIds;
    }

    function expandAll() { allFlat.filter(c => c.hasChildren).forEach(c => expandedIds.add(c.id)); expandedIds = expandedIds; }
    function collapseAll() { expandedIds = new Set(); }

    function toggleSelect(id) {
        if (selectedIds.has(id)) selectedIds.delete(id); else selectedIds.add(id);
        selectedIds = selectedIds;
    }
    function toggleSelectAll() {
        if (selectAll) { selectedIds = new Set(); selectAll = false; }
        else { selectedIds = new Set(filtered.map(c => c.id)); selectAll = true; }
    }

    async function bulkDelete() {
        if (selectedIds.size === 0) return;
        if (!confirm(`Zmazať ${selectedIds.size} kategórií? Produkty zostanú bez kategórie.`)) return;
        deleting = true;
        for (const id of selectedIds) {
            await fetch(`${API}/admin/categories/${id}`, { method: 'DELETE' });
        }
        selectedIds = new Set(); selectAll = false; deleting = false;
        await loadCategories();
    }

    async function deleteAll() {
        if (!confirm(`Zmazať VŠETKÝCH ${stats.total} kategórií?\n\nTáto akcia je nevratná!`)) return;
        deleting = true;
        await fetch(`${API}/admin/categories/all`, { method: 'DELETE' });
        deleting = false;
        await loadCategories();
    }

    function openEdit(cat) { editCat = { ...cat }; editImageUrl = cat.image_url || ''; showEditModal = true; }

    async function saveEdit() {
        if (!editCat) return;
        savingId = editCat.id;
        await fetch(`${API}/admin/categories/${editCat.id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: editCat.name, image_url: editImageUrl, slug: editCat.slug })
        });
        savingId = null; showEditModal = false;
        await loadCategories();
    }

    async function regenImage(id) {
        regeneratingId = id;
        await fetch(`${API}/admin/categories/${id}/regenerate-image`, { method: 'POST' });
        regeneratingId = null;
        await loadCategories();
    }

    async function regenAll() {
        if (!confirm('Pregenerovať obrázky pre všetky kategórie?')) return;
        regeneratingAll = true;
        await fetch(`${API}/admin/categories/regenerate-all-images`, { method: 'POST' });
        regeneratingAll = false;
        await loadCategories();
    }

    async function deleteCat(id, name) {
        if (!confirm(`Zmazať "${name}"?`)) return;
        await fetch(`${API}/admin/categories/${id}`, { method: 'DELETE' });
        await loadCategories();
    }
</script>

<svelte:head><title>Kategórie | Admin</title></svelte:head>

<div class="page">
    <div class="header">
        <div>
            <h1>📁 Kategórie</h1>
            <p class="sub">{stats.total} kategórií · {stats.withImage} s obrázkom · {stats.noImage} bez · {stats.empty} prázdnych</p>
        </div>
        <div class="actions">
            <button class="btn sm" on:click={regenAll} disabled={regeneratingAll}>{regeneratingAll ? '⏳...' : '🖼️ Pregenerovať'}</button>
            <button class="btn sm red outline" on:click={deleteAll} disabled={deleting}>🗑️ Zmazať všetky</button>
        </div>
    </div>

    <div class="toolbar">
        <div class="left">
            <input type="text" placeholder="Hľadať..." bind:value={searchQuery} class="search">
            <select bind:value={filterMode}>
                <option value="">Všetky</option>
                <option value="no_image">❌ Bez obrázka ({stats.noImage})</option>
                <option value="empty">📭 Prázdne ({stats.empty})</option>
            </select>
            <button class="btn xs" on:click={expandAll}>➕ Rozbaliť</button>
            <button class="btn xs" on:click={collapseAll}>➖ Zbaliť</button>
        </div>
        <div class="right">
            {#if selectedIds.size > 0}
                <span class="sel-count">{selectedIds.size} vybraných</span>
                <button class="btn sm red" on:click={bulkDelete} disabled={deleting}>{deleting ? '⏳' : '🗑️'} Zmazať</button>
            {/if}
        </div>
    </div>

    {#if loading}
        <div class="center">Načítavam...</div>
    {:else}
        <div class="table-wrap">
            <table>
                <thead><tr>
                    <th class="w28"><input type="checkbox" checked={selectAll} on:change={toggleSelectAll}></th>
                    <th class="w32"></th>
                    <th>NÁZOV</th>
                    <th class="w80">PRODUKTOV</th>
                    <th class="w100">AKCIE</th>
                </tr></thead>
                <tbody>
                    {#each filtered as cat}
                        <tr class:selected={selectedIds.has(cat.id)} class:empty-cat={!cat.product_count}>
                            <td><input type="checkbox" checked={selectedIds.has(cat.id)} on:change={() => toggleSelect(cat.id)}></td>
                            <td class="thumb">
                                {#if cat.image_url}
                                    <img src={cat.image_url} alt="" width="24" height="24">
                                {:else}
                                    <span class="no-img">📁</span>
                                {/if}
                            </td>
                            <td>
                                <div class="name-cell" style="padding-left:{cat.level * 20}px">
                                    {#if cat.hasChildren && !searchQuery}
                                        <button class="expand-btn" on:click={() => toggle(cat.id)}>
                                            {expandedIds.has(cat.id) ? '▼' : '▶'}
                                        </button>
                                    {/if}
                                    <span class="cat-name">{cat.name}</span>
                                    {#if searchQuery && cat.level > 0}
                                        <span class="cat-path">{cat.path}</span>
                                    {/if}
                                </div>
                            </td>
                            <td class="count">{cat.product_count || 0}</td>
                            <td class="act">
                                <button class="ico-btn" on:click={() => regenImage(cat.id)} title="Pregenerovať obrázok" disabled={regeneratingId === cat.id}>
                                    {regeneratingId === cat.id ? '⏳' : '🖼️'}
                                </button>
                                <button class="ico-btn" on:click={() => openEdit(cat)} title="Upraviť">✏️</button>
                                <button class="ico-btn red" on:click={() => deleteCat(cat.id, cat.name)} title="Zmazať">🗑️</button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        <div class="footer">{filtered.length} z {stats.total} kategórií</div>
    {/if}
</div>

{#if showEditModal && editCat}
<div class="modal-bg" on:click={() => showEditModal = false}>
    <div class="modal" on:click|stopPropagation>
        <div class="modal-h"><h3>✏️ Upraviť: {editCat.name}</h3><button on:click={() => showEditModal = false}>×</button></div>
        <div class="modal-b">
            <label>Názov<input type="text" bind:value={editCat.name}></label>
            <label>Slug<input type="text" bind:value={editCat.slug}></label>
            <label>Obrázok URL<input type="text" bind:value={editImageUrl} placeholder="https://..."></label>
            {#if editImageUrl}<img src={editImageUrl} alt="" class="preview-img">{/if}
        </div>
        <div class="modal-f">
            <button class="btn" on:click={() => showEditModal = false}>Zrušiť</button>
            <button class="btn primary" on:click={saveEdit} disabled={savingId}>{savingId ? 'Ukladám...' : 'Uložiť'}</button>
        </div>
    </div>
</div>
{/if}

<style>
    .page{max-width:1200px;margin:0 auto;padding:16px}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px}
    h1{font-size:22px;margin:0;color:#1e293b}
    .sub{color:#64748b;font-size:13px;margin:2px 0 0}
    .actions{display:flex;gap:8px}
    .toolbar{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap}
    .left,.right{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
    .search{padding:6px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;width:180px}
    select{padding:6px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:12px}
    .sel-count{font-size:12px;color:#475569;font-weight:500}
    .btn{padding:7px 14px;border:none;border-radius:6px;font-size:13px;font-weight:500;cursor:pointer;background:#3b82f6;color:#fff}
    .btn:hover{opacity:.9}.btn:disabled{opacity:.4;cursor:not-allowed}
    .btn.sm{padding:5px 10px;font-size:12px}.btn.xs{padding:4px 8px;font-size:11px;background:#f1f5f9;color:#475569;border:1px solid #d1d5db}
    .btn.red{background:#ef4444}.btn.outline{background:#fff;color:#ef4444;border:1px solid #ef4444}
    .btn.primary{background:#3b82f6;color:#fff}
    .center{text-align:center;padding:40px;color:#64748b}
    .table-wrap{background:#fff;border:1px solid #e2e8f0;border-radius:8px;overflow:auto;max-height:70vh}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th{text-align:left;padding:6px 8px;background:#f8fafc;color:#64748b;font-size:10px;font-weight:600;text-transform:uppercase;border-bottom:1px solid #e2e8f0;position:sticky;top:0;z-index:1}
    td{padding:4px 8px;border-bottom:1px solid #f1f5f9}
    tr:hover{background:#f8fafc}tr.selected{background:#eff6ff}
    tr.empty-cat{opacity:.6}
    .w28{width:28px}.w32{width:32px}.w80{width:80px;text-align:center}.w100{width:100px}
    .thumb img{width:24px;height:24px;object-fit:cover;border-radius:3px;display:block}
    .no-img{font-size:14px;opacity:.3}
    .name-cell{display:flex;align-items:center;gap:4px}
    .expand-btn{background:none;border:none;cursor:pointer;font-size:10px;color:#94a3b8;padding:2px 4px;min-width:16px}
    .expand-btn:hover{color:#3b82f6}
    .cat-name{font-weight:500;color:#1e293b;font-size:13px}
    .cat-path{font-size:10px;color:#94a3b8;margin-left:6px}
    .count{text-align:center;font-weight:600;color:#475569;font-size:12px}
    .act{display:flex;gap:2px}
    .ico-btn{background:none;border:none;cursor:pointer;font-size:13px;padding:2px 4px;border-radius:4px;opacity:.6}
    .ico-btn:hover{opacity:1;background:#f1f5f9}.ico-btn.red:hover{background:#fef2f2}
    .ico-btn:disabled{opacity:.3;cursor:not-allowed}
    .footer{text-align:center;padding:8px;font-size:12px;color:#94a3b8}
    .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;z-index:100}
    .modal{background:#fff;border-radius:12px;width:440px;max-width:95vw;box-shadow:0 20px 60px rgba(0,0,0,.2)}
    .modal-h{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid #e2e8f0}
    .modal-h h3{margin:0;font-size:16px}.modal-h button{background:none;border:none;font-size:20px;cursor:pointer;color:#94a3b8}
    .modal-b{padding:20px;display:flex;flex-direction:column;gap:12px}
    .modal-b label{display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;color:#374151}
    .modal-b input{padding:8px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:13px}
    .preview-img{max-width:100px;max-height:60px;border-radius:4px;margin-top:4px}
    .modal-f{display:flex;justify-content:flex-end;gap:8px;padding:16px 20px;border-top:1px solid #e2e8f0}
</style>
