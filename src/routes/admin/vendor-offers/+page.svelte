<script>
    import { onMount } from 'svelte';
    const API = 'http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io/api/v1';

    let offers=[], shops=[], categories=[], loading=true, error=null;
    let selectedShop='', searchQuery='', statusFilter='', matchFilter='', priceMin='', priceMax='', categoryFilter='', sortBy='created_at', sortOrder='desc';
    let page=1, limit=50, total=0, shopCount=0;
    let selectedOffers=new Set(), selectAll=false;
    let stats={total:0,matched:0,unmatched:0,active:0};
    let processing=false, processMsg='';
    let showFilters=true;
    let showEditProduct=false, editingProduct=null, savingProduct=false;

    $: totalPages = Math.ceil(total/limit)||1;
    $: selectedCount = selectedOffers.size;

    onMount(async()=>{ await loadShops(); await loadCategories(); await loadOffers(); });

    async function loadShops() { try { const d=await(await fetch(`${API}/admin/shops`)).json(); if(d.success) shops=d.data||[]; } catch(e){} }
    async function loadCategories() { try { const r=await(await fetch(`${API}/categories`)).json(); categories=r?.data?.items||(Array.isArray(r?.data)?r.data:[]); } catch(e){} }
    async function loadOffers() {
        loading=true; error=null;
        let p=`?page=${page}&limit=${limit}&sort=${sortBy}&order=${sortOrder}`;
        if(selectedShop) p+=`&shop_id=${selectedShop}`;
        if(searchQuery) p+=`&search=${encodeURIComponent(searchQuery)}`;
        if(statusFilter) p+=`&status=${statusFilter}`;
        if(matchFilter) p+=`&match=${matchFilter}`;
        if(priceMin) p+=`&price_min=${priceMin}`;
        if(priceMax) p+=`&price_max=${priceMax}`;
        if(categoryFilter) p+=`&category=${categoryFilter}`;
        try {
            const d=await(await fetch(`${API}/admin/vendor-offers${p}`)).json();
            if(d.success){offers=d.data||[];total=d.meta?.total||0;shopCount=d.meta?.shop_count||0;} else error=d.error;
        } catch(e){error=e.message;}
        await loadStats(); loading=false; selectedOffers=new Set(); selectAll=false;
    }
    async function loadStats() { try { let p=selectedShop?`?shop_id=${selectedShop}`:''; const d=await(await fetch(`${API}/admin/vendor-offers/stats${p}`)).json(); if(d.success) stats=d.data||stats; } catch(e){} }

    function applyFilters(){page=1;loadOffers();}
    function resetFilters(){searchQuery='';selectedShop='';statusFilter='';matchFilter='';priceMin='';priceMax='';categoryFilter='';sortBy='created_at';sortOrder='desc';applyFilters();}
    function goToPage(p){if(p>=1&&p<=totalPages){page=p;loadOffers();}}
    function getPages(c,t){if(t<=9)return Array.from({length:t},(_,i)=>i+1);const p=[1];if(c>4)p.push('...');for(let i=Math.max(2,c-2);i<=Math.min(t-1,c+2);i++)p.push(i);if(c<t-3)p.push('...');p.push(t);return p;}
    function toggleSel(id){selectedOffers.has(id)?selectedOffers.delete(id):selectedOffers.add(id);selectedOffers=new Set(selectedOffers);}
    function toggleAll(){selectAll=!selectAll;selectedOffers=selectAll?new Set(offers.map(o=>o.id)):new Set();}

    async function bulkDelete(){
        if(!selectedCount||!confirm(`Zmazať ${selectedCount} ponúk?`))return;
        await fetch(`${API}/admin/vendor-offers/bulk-delete`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({offer_ids:[...selectedOffers]})});
        loadOffers();
    }
    async function bulkDeleteAll(){
        if(!selectedShop){alert('Najprv vyberte obchod');return;}
        const name=shops.find(s=>s.id===selectedShop)?.shop_name||'?';
        if(!confirm(`Zmazať VŠETKY ponuky "${name}" (${fmt(total)})?`))return;
        const d=await(await fetch(`${API}/admin/vendor-offers/bulk-delete-all`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({shop_id:selectedShop,match_filter:matchFilter,status_filter:statusFilter})})).json();
        if(d.success) alert(`Zmazaných: ${d.deleted}`); loadOffers();
    }
    async function bulkDeleteWithMasters(){
        if(!selectedShop){alert('Najprv vyberte obchod');return;}
        const name=shops.find(s=>s.id===selectedShop)?.shop_name||'?';
        if(!confirm(`⚠️ POZOR! Zmazať VŠETKY ponuky "${name}" (${fmt(total)}) + MASTER PRODUKTY + MÉDIÁ?\n\nToto vymaže aj produkty vytvorené z týchto ponúk!`))return;
        processing=true; processMsg='⏳ Mažem ponuky + master produkty...';
        try{
            const d=await(await fetch(`${API}/admin/vendor-offers/bulk-delete-cleanup`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({shop_id:selectedShop,match_filter:matchFilter,status_filter:statusFilter,delete_masters:true,delete_media:true})})).json();
            if(d.success){processMsg=`✅ Ponuky: ${d.deleted_offers}, Master: ${d.deleted_masters}, Médiá: ${d.deleted_media}`;loadOffers();}
            else processMsg='❌ '+d.error;
        }catch(e){processMsg='❌ '+e.message;}
        processing=false;
    }
    async function bulkDeleteWithMedia(){
        if(!selectedShop){alert('Najprv vyberte obchod');return;}
        const name=shops.find(s=>s.id===selectedShop)?.shop_name||'?';
        if(!confirm(`Zmazať VŠETKY ponuky "${name}" (${fmt(total)}) + ich médiá?`))return;
        processing=true; processMsg='⏳ Mažem ponuky + médiá...';
        try{
            const d=await(await fetch(`${API}/admin/vendor-offers/bulk-delete-cleanup`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({shop_id:selectedShop,match_filter:matchFilter,status_filter:statusFilter,delete_masters:false,delete_media:true})})).json();
            if(d.success){processMsg=`✅ Ponuky: ${d.deleted_offers}, Médiá: ${d.deleted_media}`;loadOffers();}
            else processMsg='❌ '+d.error;
        }catch(e){processMsg='❌ '+e.message;}
        processing=false;
    }
    async function bulkAction(mode){
        if(!selectedCount){alert('Vyberte ponuky');return;}
        const lbl={ean:'EAN párovanie',ai:'AI kategorizácia',fulltext:'Fulltext'};
        if(!confirm(`Spustiť ${lbl[mode]} pre ${selectedCount} ponúk?`))return;
        processing=true; processMsg=`⏳ ${lbl[mode]} pre ${selectedCount} ponúk...`;
        try{
            const d=await(await fetch(`${API}/admin/vendor-offers/bulk-action`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({offer_ids:[...selectedOffers],mode})})).json();
            processMsg=d.success?`✅ Spárovaných: ${d.matched||0}, Nových: ${d.created||0}, Chýb: ${d.errors||0}`:'❌ '+d.error;
            if(d.success) loadOffers();
        }catch(e){processMsg='❌ '+e.message;}
        processing=false;
    }
    async function bulkActionAll(mode){
        if(!selectedShop&&mode!=='fulltext'){alert('Najprv vyberte obchod');return;}
        const lbl={ean:'EAN párovanie',ai:'AI kategorizácia',fulltext:'Fulltext'};
        if(!confirm(`Spustiť ${lbl[mode]} pre VŠETKÝCH ${fmt(total)} ponúk?`))return;
        processing=true; processMsg=`⏳ ${lbl[mode]} pre ${fmt(total)} ponúk...`;
        try{
            const d=await(await fetch(`${API}/admin/vendor-offers/bulk-action-all`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({shop_id:selectedShop,mode,match_filter:matchFilter,status_filter:statusFilter})})).json();
            processMsg=d.success?`✅ Spárovaných: ${d.matched||0}, Nových: ${d.created||0}, Chýb: ${d.errors||0}`:'❌ '+d.error;
            if(d.success) loadOffers();
        }catch(e){processMsg='❌ '+e.message;}
        processing=false;
    }

    function openProductEdit(offer) {
        if(!offer.product_id) return;
        editingProduct = { id:offer.product_id, title:offer.product_title, ean:offer.ean, brand:offer.brand, image_url:offer.image_url, category_name:offer.category_name, category_id:offer.category_id };
        showEditProduct = true;
    }
    async function saveProduct() {
        savingProduct=true;
        try{
            const r=await(await fetch(`${API}/admin/products/${editingProduct.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(editingProduct)})).json();
            if(r.success){showEditProduct=false;loadOffers();}else alert(r.error||'Chyba');
        }catch(e){alert(e.message);}
        savingProduct=false;
    }

    function fmt(n){return(n||0).toLocaleString('sk-SK');}
    function fmtPrice(p){return p?Number(p).toFixed(2)+' €':'—';}
    function trunc(s,l=55){return s&&s.length>l?s.substring(0,l)+'…':(s||'—');}
    function productUrl(o){return '/produkt/'+(o.product_slug||o.product_id);}
</script>

<svelte:head><title>Ponuky vendorov | Admin</title></svelte:head>

<div class="page">
    <div class="toolbar">
        <div class="toolbar-left"><h1>🏪 Ponuky vendorov</h1><span class="subtitle">Správa ponúk · filtrovanie · párovanie · master produkty</span></div>
        <button class="btn outline" on:click={()=>showFilters=!showFilters}>{showFilters?'▲ Skryť filtre':'▼ Zobraziť filtre'}</button>
    </div>

    <div class="stats-row">
        <div class="stat"><span class="n">{fmt(stats.total)}</span><span class="l">CELKOM</span></div>
        <div class="stat ok"><span class="n">{fmt(stats.matched)}</span><span class="l">SPÁROVANÝCH</span></div>
        <div class="stat warn"><span class="n">{fmt(stats.unmatched)}</span><span class="l">NESPÁROVANÝCH</span></div>
        <div class="stat"><span class="n">{fmt(stats.active)}</span><span class="l">AKTÍVNYCH</span></div>
        <div class="stat"><span class="n">{shopCount}</span><span class="l">OBCHODOV</span></div>
    </div>

    {#if showFilters}
    <div class="filter-panel">
        <div class="filter-grid">
            <div class="fg"><label>Obchod</label><select bind:value={selectedShop} on:change={applyFilters}><option value="">Všetky</option>{#each shops as s}<option value={s.id}>{s.shop_name} ({s.display_mode||'free'})</option>{/each}</select></div>
            <div class="fg"><label>Stav</label><select bind:value={statusFilter} on:change={applyFilters}><option value="">Všetky</option><option value="active">Aktívne</option><option value="inactive">Neaktívne</option></select></div>
            <div class="fg"><label>Párovanie</label><select bind:value={matchFilter} on:change={applyFilters}><option value="">Všetky</option><option value="matched">✅ Spárované</option><option value="unmatched">❌ Nespárované</option></select></div>
            <div class="fg"><label>Kategória</label><select bind:value={categoryFilter} on:change={applyFilters}><option value="">Všetky</option>{#each categories as c}<option value={c.slug||c.id}>{c.name}</option>{/each}</select></div>
            <div class="fg narrow"><label>Cena od</label><input type="number" placeholder="0" bind:value={priceMin}></div>
            <div class="fg narrow"><label>Cena do</label><input type="number" placeholder="∞" bind:value={priceMax}></div>
            <div class="fg"><label>Zoradiť</label><select bind:value={sortBy}><option value="created_at">Dátum</option><option value="title">Názov</option><option value="price">Cena</option><option value="shop">Obchod</option></select></div>
            <div class="fg narrow"><label>Poradie</label><select bind:value={sortOrder}><option value="desc">↓</option><option value="asc">↑</option></select></div>
        </div>
        <div class="filter-row-bottom">
            <div class="search-box">
                <input type="text" placeholder="Hľadať názov, EAN, značka..." bind:value={searchQuery} on:keydown={e=>e.key==='Enter'&&applyFilters()}>
                <button class="btn primary sm" on:click={applyFilters}>🔍</button>
            </div>
            <button class="btn sm" on:click={resetFilters}>✕ Reset</button>
            <div class="per-page"><label>Na stránku:</label><select bind:value={limit} on:change={()=>{page=1;loadOffers()}}><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option></select></div>
        </div>
    </div>
    {/if}

    <div class="bulk-bar">
        {#if selectedCount>0}
            <span class="sel-info">✓ {selectedCount} vybraných</span>
            <div class="action-group">
                <button class="btn sm ean" on:click={()=>bulkAction('ean')} disabled={processing}>📦 EAN</button>
                <button class="btn sm ai" on:click={()=>bulkAction('ai')} disabled={processing}>🤖 AI</button>
                <button class="btn sm fulltext" on:click={()=>bulkAction('fulltext')} disabled={processing}>🔍 Fulltext</button>
                <button class="btn sm danger" on:click={bulkDelete} disabled={processing}>🗑️</button>
            </div>
        {/if}
        {#if selectedShop}
            <div class="action-group-all">
                <span class="all-label">Všetky ({fmt(total)}):</span>
                <button class="btn sm ean" on:click={()=>bulkActionAll('ean')} disabled={processing}>📦 EAN</button>
                <button class="btn sm ai" on:click={()=>bulkActionAll('ai')} disabled={processing}>🤖 AI</button>
                <button class="btn sm fulltext" on:click={()=>bulkActionAll('fulltext')} disabled={processing}>🔍 Fulltext</button>
                <button class="btn sm danger-outline" on:click={bulkDeleteAll} disabled={processing}>🗑️ Zmazať</button>
                <button class="btn sm danger-master" on:click={bulkDeleteWithMasters} disabled={processing}>🗑️💀 + Master</button>
                <button class="btn sm danger-media" on:click={bulkDeleteWithMedia} disabled={processing}>🗑️🖼️ + Médiá</button>
            </div>
        {/if}
        {#if processMsg}<div class="process-msg" class:done={!processing}>{processMsg}</div>{/if}
    </div>

    {#if loading}<div class="state">⏳ Načítavam ponuky...</div>
    {:else if error}<div class="state error">❌ {error}</div>
    {:else if !offers.length}<div class="state">📭 Žiadne ponuky</div>
    {:else}
    <div class="table-wrap">
        <table>
            <thead><tr>
                <th class="w30"><input type="checkbox" checked={selectAll} on:change={toggleAll}></th>
                <th>PONUKA (OFFER)</th>
                <th>MASTER PRODUKT</th>
                <th>OBCHOD</th>
                <th class="w80">CENA</th>
                <th>EAN</th>
                <th class="w70">STAV</th>
                <th class="w80">AKCIE</th>
            </tr></thead>
            <tbody>{#each offers as o (o.id)}
                <tr class:selected={selectedOffers.has(o.id)}>
                    <td><input type="checkbox" checked={selectedOffers.has(o.id)} on:change={()=>toggleSel(o.id)}></td>
                    <td class="offer-cell">
                        {#if o.product_id}
                            <a href={productUrl(o)} target="_blank" class="offer-link">{trunc(o.title, 50)}</a>
                        {:else}
                            <div class="offer-title">{trunc(o.title, 50)}</div>
                        {/if}
                        <div class="offer-id">{(o.id||'').substring(0,8)}</div>
                    </td>
                    <td class="master-cell">
                        {#if o.product_id}
                            <div class="master-card">
                                {#if o.image_url}<img src={o.image_url} alt="" class="master-img">{/if}
                                <div class="master-info">
                                    <a href={productUrl(o)} target="_blank" class="master-link">{trunc(o.product_title,40)}</a>
                                    <div class="master-meta">
                                        {#if o.category_name}<span class="tag blue">{o.category_name}</span>{/if}
                                        {#if o.brand}<span class="tag yellow">{o.brand}</span>{/if}
                                    </div>
                                </div>
                                <button class="icon-btn" on:click={()=>openProductEdit(o)} title="Upraviť master produkt">✏️</button>
                            </div>
                        {:else}
                            <span class="tag orange">Nespárované</span>
                        {/if}
                    </td>
                    <td><span class="shop-badge">{o.shop_name||'—'}</span></td>
                    <td class="price">{fmtPrice(o.price)}</td>
                    <td class="mono">{o.ean||'—'}</td>
                    <td><span class="badge" class:active={o.is_active} class:inactive={!o.is_active}>{o.is_active?'Aktívny':'Neakt.'}</span></td>
                    <td class="actions">
                        {#if !o.product_id}
                            <button class="icon-btn" on:click={()=>{selectedOffers=new Set([o.id]);bulkAction('ai')}} title="AI kategorizácia">🤖</button>
                            <button class="icon-btn" on:click={()=>{selectedOffers=new Set([o.id]);bulkAction('ean')}} title="EAN párovanie">📦</button>
                        {/if}
                    </td>
                </tr>
            {/each}</tbody>
        </table>
    </div>

    <div class="pagination">
        <button disabled={page===1} on:click={()=>goToPage(1)}>⏮</button>
        <button disabled={page===1} on:click={()=>goToPage(page-1)}>◀</button>
        {#each getPages(page,totalPages) as pg}{#if pg==='...'}<span class="ellipsis">…</span>{:else}<button class:active={page===pg} on:click={()=>goToPage(pg)}>{pg}</button>{/if}{/each}
        <button disabled={page>=totalPages} on:click={()=>goToPage(page+1)}>▶</button>
        <button disabled={page>=totalPages} on:click={()=>goToPage(totalPages)}>⏭</button>
        <span class="page-label">Strana {page} z {totalPages} · {fmt(total)} ponúk</span>
    </div>
    {/if}
</div>

{#if showEditProduct && editingProduct}
<div class="overlay" on:click={()=>showEditProduct=false} role="dialog">
    <div class="dialog" on:click|stopPropagation>
        <div class="dialog-header">
            <h2>✏️ Upraviť master produkt</h2>
            <button class="close-btn" on:click={()=>showEditProduct=false}>×</button>
        </div>
        <div class="dialog-body">
            {#if editingProduct.image_url}<img src={editingProduct.image_url} alt="" class="preview-img">{/if}
            <div class="form-group"><label>Názov</label><input bind:value={editingProduct.title}></div>
            <div class="form-grid-2">
                <div class="form-group"><label>EAN</label><input bind:value={editingProduct.ean}></div>
                <div class="form-group"><label>Značka</label><input bind:value={editingProduct.brand}></div>
            </div>
            <div class="form-group"><label>Obrázok URL</label><input bind:value={editingProduct.image_url}></div>
            <div class="form-group"><label>Kategória</label>
                <select bind:value={editingProduct.category_id}>
                    <option value="">— Bez kategórie —</option>
                    {#each categories as c}<option value={c.id}>{c.name}</option>{/each}
                </select>
            </div>
            <div class="meta-info">🆔 {editingProduct.id}</div>
        </div>
        <div class="dialog-footer">
            <button class="btn" on:click={()=>showEditProduct=false}>Zrušiť</button>
            <button class="btn primary" on:click={saveProduct} disabled={savingProduct}>{savingProduct?'Ukladám...':'💾 Uložiť'}</button>
        </div>
    </div>
</div>
{/if}

<style>
    .page{max-width:1500px;margin:0 auto;padding:20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
    .toolbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px}
    .toolbar-left{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
    h1{font-size:22px;margin:0;font-weight:700}.subtitle{color:#64748b;font-size:13px}
    .stats-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:14px}
    .stat{padding:12px;background:#fff;border:1px solid #e2e8f0;border-radius:10px;text-align:center}
    .stat .n{display:block;font-size:22px;font-weight:700;color:#1e293b}.stat .l{font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.5px}
    .stat.ok{border-color:#10b981;background:#ecfdf5}.stat.warn{border-color:#f59e0b;background:#fffbeb}
    .filter-panel{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:14px}
    .filter-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-bottom:12px}
    .fg{display:flex;flex-direction:column;gap:3px}.fg.narrow{max-width:90px}
    .fg label{font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px}
    .fg input,.fg select{padding:7px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:12px;background:#fff}
    .filter-row-bottom{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
    .search-box{display:flex;gap:4px;flex:1;min-width:200px}.search-box input{flex:1;padding:7px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:12px}
    .per-page{margin-left:auto;display:flex;align-items:center;gap:4px;font-size:11px;color:#64748b}
    .per-page select{padding:5px;border:1px solid #d1d5db;border-radius:4px;font-size:12px}
    .bulk-bar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px;min-height:36px}
    .sel-info{font-size:13px;color:#1e293b;font-weight:600;padding:4px 10px;background:#eff6ff;border-radius:6px}
    .action-group{display:flex;gap:4px;padding:4px 8px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px}
    .action-group-all{display:flex;gap:4px;padding:4px 8px;background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;align-items:center}
    .all-label{font-size:10px;font-weight:700;color:#92400e;white-space:nowrap}
    .process-msg{font-size:12px;padding:6px 12px;background:#f0f9ff;border-radius:6px;border:1px solid #bae6fd;color:#0369a1}
    .process-msg.done{background:#ecfdf5;border-color:#a7f3d0;color:#065f46}
    .btn{padding:7px 14px;border:1px solid #d1d5db;background:#fff;border-radius:6px;cursor:pointer;font-size:12px;font-weight:500;transition:all .15s}
    .btn:hover{background:#f1f5f9}.btn.sm{padding:5px 10px;font-size:11px}
    .btn.primary{background:#3b82f6;color:#fff;border-color:#3b82f6}.btn.primary:hover{background:#2563eb}
    .btn.danger{background:#ef4444;color:#fff;border-color:#ef4444}
    .btn.danger-outline{color:#ef4444;border-color:#fca5a5;background:#fff}.btn.danger-outline:hover{background:#fef2f2}
    .btn.danger-master{color:#fff;background:#7c2d12;border-color:#7c2d12}.btn.danger-master:hover{background:#9a3412}
    .btn.danger-media{color:#fff;background:#9333ea;border-color:#9333ea}.btn.danger-media:hover{background:#7e22ce}
    .btn.outline{color:#64748b;border-color:#d1d5db}
    .btn.ean{background:#3b82f6;color:#fff;border-color:#3b82f6}
    .btn.ai{background:#059669;color:#fff;border-color:#059669}
    .btn.fulltext{background:#d97706;color:#fff;border-color:#d97706}
    .btn:disabled{opacity:.4;cursor:not-allowed}
    .table-wrap{overflow-x:auto;border:1px solid #e2e8f0;border-radius:10px;background:#fff}
    table{width:100%;border-collapse:collapse;font-size:13px}
    thead{background:#f1f5f9}
    th{text-align:left;padding:10px 8px;font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.5px;border-bottom:2px solid #e2e8f0;white-space:nowrap}
    td{padding:8px;border-bottom:1px solid #f1f5f9;vertical-align:middle}
    tr:hover{background:#f8fafc}tr.selected{background:#eff6ff}
    .w30{width:30px}.w70{width:70px}.w80{width:80px}
    .offer-cell .offer-title{font-weight:600;color:#1e293b;line-height:1.3}
    .offer-cell .offer-link{font-weight:600;color:#2563eb;line-height:1.3;text-decoration:none;display:block}
    .offer-cell .offer-link:hover{text-decoration:underline;color:#1d4ed8}
    .offer-cell .offer-id{font-size:10px;color:#94a3b8;font-family:monospace;margin-top:1px}
    .master-cell{min-width:200px}
    .master-card{display:flex;align-items:center;gap:8px;padding:4px 6px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px}
    .master-img{width:32px;height:32px;object-fit:cover;border-radius:4px;flex-shrink:0}
    .master-info{flex:1;min-width:0}
    .master-link{display:block;font-size:12px;font-weight:600;color:#2563eb;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-decoration:none}
    .master-link:hover{text-decoration:underline;color:#1d4ed8}
    .master-meta{display:flex;gap:4px;margin-top:2px;flex-wrap:wrap}
    .tag{display:inline-block;padding:1px 6px;border-radius:3px;font-size:10px;font-weight:500}
    .tag.blue{background:#dbeafe;color:#1d4ed8}.tag.yellow{background:#fef3c7;color:#92400e}
    .tag.green{background:#d1fae5;color:#065f46}.tag.orange{background:#ffedd5;color:#c2410c}
    .shop-badge{padding:2px 8px;background:#f1f5f9;border-radius:4px;font-size:11px;color:#475569;font-weight:500}
    .price{font-weight:700;color:#059669;white-space:nowrap}
    .mono{font-family:monospace;font-size:11px;color:#64748b}
    .badge{padding:2px 8px;border-radius:10px;font-size:10px;font-weight:500}
    .badge.active{background:#d1fae5;color:#065f46}.badge.inactive{background:#fee2e2;color:#991b1b}
    .actions{white-space:nowrap;display:flex;gap:2px}
    .icon-btn{background:none;border:1px solid transparent;cursor:pointer;padding:3px 5px;border-radius:4px;font-size:13px;transition:all .15s}
    .icon-btn:hover{background:#f1f5f9;border-color:#e2e8f0}
    .pagination{display:flex;gap:4px;justify-content:center;align-items:center;padding:14px;flex-wrap:wrap}
    .pagination button{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:1px solid #e2e8f0;background:#fff;border-radius:6px;cursor:pointer;font-size:11px}
    .pagination button:hover:not(:disabled){background:#f1f5f9}.pagination button.active{background:#3b82f6;color:#fff;border-color:#3b82f6}
    .pagination button:disabled{opacity:.3;cursor:not-allowed}
    .ellipsis{padding:0 4px;color:#94a3b8}.page-label{margin-left:10px;font-size:12px;color:#64748b}
    .state{text-align:center;padding:50px;color:#94a3b8;font-size:15px;background:#fff;border:1px solid #e2e8f0;border-radius:10px}
    .state.error{color:#ef4444}
    .overlay{position:fixed;inset:0;background:rgba(15,23,42,.5);display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(2px)}
    .dialog{background:#fff;border-radius:14px;width:92%;max-width:580px;max-height:90vh;overflow-y:auto;box-shadow:0 25px 50px -12px rgba(0,0,0,.25)}
    .dialog-header{display:flex;justify-content:space-between;align-items:center;padding:16px 22px;border-bottom:1px solid #e2e8f0}
    .dialog-header h2{margin:0;font-size:17px}.close-btn{background:none;border:none;font-size:20px;cursor:pointer;color:#94a3b8}
    .dialog-body{padding:22px}
    .dialog-footer{display:flex;justify-content:flex-end;gap:8px;padding:14px 22px;border-top:1px solid #e2e8f0;background:#f8fafc;border-radius:0 0 14px 14px}
    .form-group{margin-bottom:12px}.form-group label{display:block;font-size:11px;font-weight:700;color:#475569;margin-bottom:3px}
    .form-group input,.form-group textarea,.form-group select{width:100%;padding:8px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:12px;box-sizing:border-box}
    .form-group input:focus,.form-group select:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.1)}
    .form-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .preview-img{max-width:100px;max-height:100px;border-radius:6px;margin-bottom:10px;border:1px solid #e2e8f0}
    .meta-info{font-size:10px;color:#94a3b8;margin-top:6px;padding-top:6px;border-top:1px solid #f1f5f9}
</style>
