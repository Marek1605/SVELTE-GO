<script>
    import { getContext, onMount } from 'svelte';
    import { browser } from '$app/environment';
    
    const vendorStore = getContext('vendor');
    const shopStore = getContext('shop');
    const API_BASE = getContext('API_BASE');
    
    $: vendor = $vendorStore;
    $: shop = $shopStore;
    $: isFree = shop?.display_mode !== 'cpc';
    
    let loading = true;
    let loadError = false;
    let products = [];
    let stats = { total: 0, paired: 0, unpaired: 0, withoutCategories: 0, pendingApprovals: 0, pairingRate: 0 };
    
    let searchQuery = '';
    let filter = 'all';
    let perPage = 10;
    let currentPage = 1;
    let totalPages = 1;
    let totalResults = 0;
    
    let showConnectModal = false;
    let showEditModal = false;
    let showAddManualModal = false;
    let currentProduct = null;
    let editTab = 'price';
    let masterSearchQuery = '';
    let masterResults = [];
    let searchingMaster = false;
    let saving = false;
    let message = null;
    
    let manualEan = '';
    let manualPrice = '';
    let manualUrl = '';
    let searchingEan = false;
    let eanProduct = null;
    let eanError = '';
    
    let categorySearchQuery = '';
    let categoryResults = [];
    let searchingCategories = false;
    let selectedCategory = null;
    let categoryNote = '';
    let savingRequest = false;
    let categorySearchTimer;
    
    const placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect fill="%23f1f5f9" width="40" height="40" rx="4"/%3E%3C/svg%3E';
    
    onMount(async () => {
        if (!browser) return;
        const timeout = setTimeout(() => { if (loading) { loading = false; loadError = true; } }, 10000);
        await loadProducts();
        clearTimeout(timeout);
    });
    
    async function loadProducts() {
        loading = true; loadError = false;
        const token = localStorage.getItem('vendor_token');
        if (!token) { loading = false; return; }
        try {
            const params = new URLSearchParams({ page: currentPage.toString(), per_page: perPage.toString(), filter, search: searchQuery });
            const res = await fetch(API_BASE + '/vendor/products?' + params.toString(), { headers: { 'Authorization': 'Bearer ' + token } });
            const data = await res.json();
            if (data.success) {
                products = data.data || [];
                totalResults = data.meta?.total || products.length;
                totalPages = data.meta?.pages || Math.ceil(totalResults / perPage);
                if (data.stats) {
                    stats = {
                        total: data.stats.total || 0, paired: data.stats.paired || 0,
                        unpaired: data.stats.unpaired || 0, withoutCategories: data.stats.without_category || 0,
                        pendingApprovals: 0,
                        pairingRate: data.stats.total > 0 ? Math.round((data.stats.paired / data.stats.total) * 100) : 0
                    };
                }
            }
        } catch (e) { console.error(e); loadError = true; }
        loading = false;
    }
    
    async function searchMasterProducts() {
        if (masterSearchQuery.length < 2) return;
        searchingMaster = true;
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(API_BASE + '/products/search?q=' + encodeURIComponent(masterSearchQuery) + '&limit=20', { headers: { 'Authorization': 'Bearer ' + token } });
            const data = await res.json();
            masterResults = data.data?.products || data.data || [];
        } catch (e) { console.error(e); }
        searchingMaster = false;
    }
    
    async function searchByEan() {
        if (!manualEan || manualEan.length < 8) { eanError = 'Min. 8 znakov'; return; }
        searchingEan = true; eanError = ''; eanProduct = null;
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(API_BASE + '/products/search?q=' + encodeURIComponent(manualEan) + '&limit=1', { headers: { 'Authorization': 'Bearer ' + token } });
            const data = await res.json();
            const r = data.data?.products || data.data || [];
            if (r.length > 0) eanProduct = r[0]; else eanError = 'Nenájdený';
        } catch (e) { eanError = 'Chyba'; }
        searchingEan = false;
    }
    
    async function connectWithEan() {
        if (!eanProduct) return; saving = true;
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(API_BASE + '/vendor/products/' + eanProduct.id + '/connect', { 
                method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
                body: JSON.stringify({ price: parseFloat(manualPrice) || 0, affiliate_url: manualUrl || '' })
            });
            const data = await res.json();
            if (data.success) { showAddManualModal = false; manualEan=''; manualPrice=''; manualUrl=''; eanProduct=null; loadProducts(); }
            else alert(data.error || 'Chyba');
        } catch (e) { alert('Chyba'); }
        saving = false;
    }
    
    async function connectToMaster(masterId) {
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(API_BASE + '/vendor/products/' + masterId + '/connect', { method: 'POST', headers: { 'Authorization': 'Bearer ' + token } });
            const data = await res.json();
            if (data.success) { showConnectModal = false; masterSearchQuery=''; masterResults=[]; loadProducts(); }
            else alert(data.error || 'Chyba');
        } catch (e) { alert('Chyba'); }
    }
    
    async function disconnectProduct(productId) {
        if (!confirm('Odpojiť tento produkt?')) return;
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(API_BASE + '/vendor/products/' + productId + '/offer', { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } });
            const data = await res.json();
            if (data.success) loadProducts(); else alert(data.error || 'Chyba');
        } catch (e) { alert('Chyba'); }
    }
    
    async function saveProduct() {
        if (!currentProduct) return; saving = true;
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(API_BASE + '/vendor/products/' + currentProduct.id + '/offer', {
                method: 'PUT', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
                body: JSON.stringify({ price: parseFloat(currentProduct.price)||0, min_price: parseFloat(currentProduct.min_price)||null, max_price: parseFloat(currentProduct.max_price)||null, affiliate_url: currentProduct.affiliate_url||'' })
            });
            const data = await res.json();
            if (data.success) { showEditModal = false; loadProducts(); message = { type:'success', text:'✅ Uložené' }; }
            else alert(data.error || 'Chyba');
        } catch (e) { alert('Chyba'); }
        saving = false;
    }
    
    function searchCategories() {
        clearTimeout(categorySearchTimer);
        categorySearchTimer = setTimeout(async () => {
            if (categorySearchQuery.length < 2) { categoryResults = []; return; }
            searchingCategories = true;
            const token = localStorage.getItem('vendor_token');
            try {
                const res = await fetch(API_BASE + '/vendor/search-categories?q=' + encodeURIComponent(categorySearchQuery), { headers: { 'Authorization': 'Bearer ' + token } });
                const data = await res.json();
                categoryResults = data.data || [];
            } catch (e) { console.error(e); }
            searchingCategories = false;
        }, 300);
    }
    
    async function submitCategoryRequest() {
        if (!selectedCategory || !currentProduct) return; savingRequest = true;
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(API_BASE + '/vendor/requests', {
                method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
                body: JSON.stringify({ offer_id: currentProduct.id, request_type: 'category_change', requested_category: selectedCategory.path || selectedCategory.name, requested_category_id: selectedCategory.id, vendor_note: categoryNote })
            });
            const data = await res.json();
            if (data.success) { showEditModal = false; message = { type:'success', text:'✅ Žiadosť o zmenu kategórie odoslaná.' }; }
            else { message = { type:'error', text: data.error || 'Chyba' }; }
        } catch (e) { message = { type:'error', text:'Chyba pripojenia' }; }
        savingRequest = false;
    }
    
    function handleSearch() { currentPage = 1; loadProducts(); }
    function handleFilterChange(f) { filter = f; currentPage = 1; loadProducts(); }
    function goToPage(p) { if (p >= 1 && p <= totalPages) { currentPage = p; loadProducts(); } }
    function getPaginationPages(c, t) {
        if (t <= 9) return Array.from({length: t}, (_, i) => i + 1);
        const p = [1]; if (c > 4) p.push('...');
        for (let i = Math.max(2, c-2); i <= Math.min(t-1, c+2); i++) p.push(i);
        if (c < t-3) p.push('...'); p.push(t); return p;
    }
    function refresh() { searchQuery=''; filter='all'; currentPage=1; loadProducts(); }
    function openConnectModal() { masterSearchQuery=''; masterResults=[]; showConnectModal=true; }
    function openAddManualModal() { manualEan=''; manualPrice=''; manualUrl=''; eanProduct=null; eanError=''; showAddManualModal=true; }
    function openEditModal(p) { 
        currentProduct = { ...p, min_price: p.min_price||'', max_price: p.max_price||'', affiliate_url: p.affiliate_url||'' }; 
        editTab='price'; categorySearchQuery=''; categoryResults=[]; selectedCategory=null; categoryNote='';
        showEditModal = true; 
    }
    function formatNumber(n) { return (n||0).toLocaleString('sk-SK'); }
    function formatPrice(p) { return (p||0).toLocaleString('sk-SK', { minimumFractionDigits:2, maximumFractionDigits:2 }) + ' €'; }
</script>

<div class="page">
    {#if message}<div class="msg {message.type}" on:click={() => message=null}>{message.text} <button on:click|stopPropagation={() => message=null}>×</button></div>{/if}
    
    {#if isFree}<div class="free-banner">🔓 <strong>FREE</strong> — len fulltextové vyhľadávanie. <a href="/vendor-dashboard/ppc">⚡ Aktivovať PAID</a></div>{/if}
    
    <div class="stats">
        <button class="stat" class:active={filter==='all'} on:click={() => handleFilterChange('all')}><span class="num">{formatNumber(stats.total)}</span><span class="lbl">Celkom</span></button>
        <button class="stat" class:active={filter==='paired'} on:click={() => handleFilterChange('paired')}><span class="num">{formatNumber(stats.paired)}</span><span class="lbl">Spárované ({stats.pairingRate}%)</span></button>
        <button class="stat" class:active={filter==='unpaired'} on:click={() => handleFilterChange('unpaired')}><span class="num">{formatNumber(stats.unpaired)}</span><span class="lbl">Nespárované</span></button>
        <button class="stat" class:active={filter==='no_category'} on:click={() => handleFilterChange('no_category')}><span class="num">{formatNumber(stats.withoutCategories)}</span><span class="lbl">Bez kategórie</span></button>
    </div>
    
    <div class="toolbar">
        <input type="text" placeholder="🔍 Hľadať produkt..." bind:value={searchQuery} on:keypress={(e) => e.key==='Enter' && handleSearch()}>
        <button class="btn blue" on:click={handleSearch}>🔍</button>
        <button class="btn gray" on:click={refresh}>🔄</button>
        <select bind:value={perPage} on:change={() => { currentPage=1; loadProducts(); }}>
            <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option>
        </select>
    </div>
    
    <div class="action-row">
        <div class="action-buttons">
            <button class="btn green" on:click={openConnectModal}>➕ Pripojiť k produktu</button>
            <button class="btn blue" on:click={openAddManualModal}>📦 Pridať cez EAN</button>
        </div>
        <span class="info">{products.length} z {formatNumber(totalResults)}</span>
    </div>
    
    {#if loading}
        <div class="loading-box"><div class="spinner"></div><p>Načítavam...</p></div>
    {:else if loadError}
        <div class="error-box"><h3>⚠️ Chyba</h3><button class="btn blue" on:click={refresh}>🔄 Znova</button></div>
    {:else if products.length === 0}
        <div class="empty-state">
            <div class="empty-icon">📦</div><h3>Žiadne produkty</h3><p>Začnite pridávať produkty</p>
            <div class="empty-options">
                <div class="empty-option" on:click={openConnectModal} on:keydown={() => {}} role="button" tabindex="0"><span class="option-icon">🔗</span><h4>Pripojiť k existujúcemu</h4><p>Vyhľadajte v databáze</p></div>
                <div class="empty-option" on:click={openAddManualModal} on:keydown={() => {}} role="button" tabindex="0"><span class="option-icon">📦</span><h4>Pridať cez EAN</h4><p>Zadajte EAN kód</p></div>
            </div>
            <div class="empty-hint">💡 Pre hromadný import: <a href="/vendor-dashboard/xml-feedy">XML Feed</a></div>
        </div>
    {:else}
        <div class="table-wrap">
            <table>
                <thead><tr>
                    <th style="width:36px"></th><th>PRODUKT</th><th>CENA</th><th>STAV</th><th class="center">N</th><th>KATEGÓRIA</th><th style="width:160px">AKCIE</th>
                </tr></thead>
                <tbody>
                    {#each products as p}
                    <tr>
                        <td><img src={p.image_url || p.master_image || placeholder} alt="" class="thumb" on:error={(e) => e.target.src = placeholder}></td>
                        <td class="name"><strong>{p.title || p.master_title || p.name || '-'}</strong><span class="id-code">{p.id?.slice(0,8)}</span></td>
                        <td class="price">{formatPrice(p.price)}</td>
                        <td>{#if p.stock_status==='instock'}<span class="stock in">Skladom</span>{:else}<span class="stock out">Vypredané</span>{/if}</td>
                        <td class="center">{p.vendors_count || 1}</td>
                        <td>{#if p.category}<span class="cat">{p.category}</span>{:else}<span class="nocat">—</span>{/if}</td>
                        <td class="actions">
                            <button on:click={() => openEditModal(p)} title="Upraviť">✏️ Upraviť</button>
                            {#if p.product_id && p.master_slug}<a href="/produkt/{p.master_slug}" target="_blank" class="action-link" title="Zobraziť ponuku">↗ Ponuka</a>
                            {:else if p.product_id}<a href="/produkt/{p.product_id}" target="_blank" class="action-link">↗ Ponuka</a>{/if}
                            <button class="red" on:click={() => disconnectProduct(p.id)} title="Odpojiť">✕</button>
                        </td>
                    </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        {#if totalPages > 1}
        <div class="pagination">
            <button disabled={currentPage===1} on:click={() => goToPage(1)}>««</button>
            <button disabled={currentPage===1} on:click={() => goToPage(currentPage-1)}>‹</button>
            {#each getPaginationPages(currentPage, totalPages) as pg}
                {#if pg==='...'}<span class="dots">…</span>{:else}<button class:active={currentPage===pg} on:click={() => goToPage(pg)}>{pg}</button>{/if}
            {/each}
            <button disabled={currentPage===totalPages} on:click={() => goToPage(currentPage+1)}>›</button>
            <button disabled={currentPage===totalPages} on:click={() => goToPage(totalPages)}>»»</button>
            <span class="page-info">{currentPage}/{totalPages}</span>
        </div>
        {/if}
    {/if}
</div>

<!-- EDIT MODAL -->
{#if showEditModal && currentProduct}
<div class="modal-bg" on:click={() => showEditModal=false} on:keydown={() => {}} role="button" tabindex="0">
    <div class="modal wide" on:click|stopPropagation>
        <div class="modal-head"><h3>✏️ Upraviť produkt</h3><button on:click={() => showEditModal=false}>&times;</button></div>
        <div class="tabs">
            <button class:active={editTab==='price'} on:click={() => editTab='price'}>💰 Cena & URL</button>
            <button class:active={editTab==='category'} on:click={() => editTab='category'}>🏷️ Kategória</button>
        </div>
        <div class="modal-body">
            <div class="product-preview">
                <img src={currentProduct.image_url || currentProduct.master_image || placeholder} alt="" class="preview-img" on:error={(e) => e.target.src = placeholder}>
                <div class="preview-info">
                    <h4>{currentProduct.title || currentProduct.master_title || currentProduct.name}</h4>
                    {#if currentProduct.ean}<span class="preview-id">EAN: {currentProduct.ean}</span>{/if}
                    {#if currentProduct.category}<span class="preview-cat">{currentProduct.category}</span>{/if}
                </div>
            </div>
            {#if editTab==='price'}
                <div class="form-row">
                    <div class="form-group"><label>Cena (€) *</label><input type="number" step="0.01" bind:value={currentProduct.price}></div>
                    <div class="form-group"><label>Min</label><input type="number" step="0.01" bind:value={currentProduct.min_price} placeholder="—"></div>
                    <div class="form-group"><label>Max</label><input type="number" step="0.01" bind:value={currentProduct.max_price} placeholder="—"></div>
                </div>
                <div class="form-group"><label>Affiliate URL</label><input type="url" bind:value={currentProduct.affiliate_url} placeholder="https://..."></div>
            {:else}
                <p style="margin:0 0 10px;font-size:13px;color:#64748b">Aktuálna: <strong>{currentProduct.category || 'Bez kategórie'}</strong></p>
                <div class="form-group"><label>Vyhľadať novú kategóriu</label><input type="text" placeholder="Začnite písať..." bind:value={categorySearchQuery} on:input={searchCategories}></div>
                {#if searchingCategories}<p class="searching">Hľadám...</p>
                {:else if categoryResults.length > 0}
                    <div class="results">{#each categoryResults as cat}
                        <div class="result" class:selected={selectedCategory?.id===cat.id} on:click={() => selectedCategory=cat} on:keydown={() => {}} role="button" tabindex="0">
                            <div><strong>{cat.path || cat.name}</strong><br><small>{cat.product_count} produktov</small></div>
                            {#if selectedCategory?.id===cat.id}<span class="check">✓</span>{/if}
                        </div>
                    {/each}</div>
                {:else if categorySearchQuery.length >= 2}<p class="noresults">Žiadne kategórie</p>{/if}
                {#if selectedCategory}
                    <div class="selected-cat">Nová: <strong>{selectedCategory.path || selectedCategory.name}</strong></div>
                    <div class="form-group"><label>Poznámka</label><input type="text" placeholder="Dôvod zmeny..." bind:value={categoryNote}></div>
                    <div class="ai-info">ℹ️ Žiadosť bude odoslaná na schválenie administrátorovi.</div>
                {/if}
            {/if}
        </div>
        <div class="modal-foot">
            <button class="btn gray" on:click={() => showEditModal=false}>Zrušiť</button>
            {#if editTab==='price'}
                <button class="btn blue" on:click={saveProduct} disabled={saving}>{saving ? '...' : '💾 Uložiť'}</button>
            {:else if selectedCategory}
                <button class="btn blue" on:click={submitCategoryRequest} disabled={savingRequest}>{savingRequest ? '...' : '📩 Odoslať žiadosť'}</button>
            {/if}
        </div>
    </div>
</div>
{/if}

<!-- CONNECT MODAL -->
{#if showConnectModal}
<div class="modal-bg" on:click={() => showConnectModal=false} on:keydown={() => {}} role="button" tabindex="0">
    <div class="modal" on:click|stopPropagation>
        <div class="modal-head"><h3>➕ Pripojiť k produktu</h3><button on:click={() => showConnectModal=false}>&times;</button></div>
        <div class="modal-body">
            <label>Vyhľadať master produkt</label>
            <input type="text" placeholder="Názov, EAN alebo ID..." bind:value={masterSearchQuery} on:input={searchMasterProducts}>
            {#if searchingMaster}<p class="searching">Hľadám...</p>
            {:else if masterResults.length > 0}
                <div class="results">{#each masterResults as m}
                    <div class="result" on:click={() => connectToMaster(m.id)} on:keydown={() => {}} role="button" tabindex="0">
                        <img src={m.image_url || placeholder} alt="">
                        <div><strong>{m.title || m.name}</strong><br><small>{m.id}</small></div>
                        <button class="btn green small">Pripojiť</button>
                    </div>
                {/each}</div>
            {:else if masterSearchQuery.length >= 2}<p class="noresults">Žiadne výsledky</p>{/if}
        </div>
    </div>
</div>
{/if}

<!-- EAN MODAL -->
{#if showAddManualModal}
<div class="modal-bg" on:click={() => showAddManualModal=false} on:keydown={() => {}} role="button" tabindex="0">
    <div class="modal" on:click|stopPropagation>
        <div class="modal-head"><h3>📦 Pridať cez EAN</h3><button on:click={() => showAddManualModal=false}>&times;</button></div>
        <div class="modal-body">
            <div class="form-group"><label>EAN / GTIN</label>
                <div class="ean-input-row"><input type="text" placeholder="8594000000000" bind:value={manualEan} on:keypress={(e) => e.key==='Enter' && searchByEan()}>
                <button class="btn blue" on:click={searchByEan} disabled={searchingEan}>{searchingEan ? '...' : '🔍'}</button></div>
                {#if eanError}<p class="ean-error">{eanError}</p>{/if}
            </div>
            {#if eanProduct}
                <div class="ean-result">
                    <div class="ean-product"><img src={eanProduct.image_url || placeholder} alt=""><div><strong>{eanProduct.title || eanProduct.name}</strong><small>{eanProduct.id}</small></div></div>
                    <div class="form-group"><label>Cena (€) *</label><input type="number" step="0.01" bind:value={manualPrice}></div>
                    <div class="form-group"><label>URL</label><input type="url" bind:value={manualUrl} placeholder="https://..."></div>
                </div>
            {/if}
        </div>
        {#if eanProduct}<div class="modal-foot"><button class="btn gray" on:click={() => showAddManualModal=false}>Zrušiť</button><button class="btn green" on:click={connectWithEan} disabled={saving}>{saving ? '...' : '✅ Pripojiť'}</button></div>{/if}
    </div>
</div>
{/if}

<style>
    .page { width: 100%; }
    .msg { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-radius:8px; margin-bottom:12px; font-size:13px; cursor:pointer; }
    .msg.success { background:#d1fae5; color:#065f46; } .msg.error { background:#fee2e2; color:#991b1b; }
    .msg button { background:none; border:none; font-size:16px; cursor:pointer; }
    .free-banner { background:#fef3c7; border:1px solid #f59e0b; border-radius:8px; padding:10px 14px; margin-bottom:12px; color:#92400e; font-size:13px; }
    .free-banner a { color:#d97706; font-weight:600; margin-left:8px; }
    .loading-box,.error-box { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:200px; gap:12px; color:#64748b; background:white; border-radius:12px; padding:40px; }
    .spinner { width:28px; height:28px; border:3px solid #e2e8f0; border-top-color:#3b82f6; border-radius:50%; animation:spin .8s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .stats { display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap; }
    .stat { flex:1; min-width:110px; padding:10px 12px; background:#fff; border:1px solid #e2e8f0; border-radius:8px; cursor:pointer; text-align:left; transition:all .2s; }
    .stat:hover { border-color:#3b82f6; } .stat.active { border-color:#3b82f6; background:#eff6ff; }
    .stat .num { display:block; font-size:20px; font-weight:700; color:#1e293b; }
    .stat .lbl { font-size:11px; color:#64748b; }
    .toolbar { display:flex; gap:6px; margin-bottom:10px; }
    .toolbar input { flex:1; min-width:150px; padding:8px 12px; border:1px solid #d1d5db; border-radius:6px; font-size:13px; }
    .toolbar select { padding:8px; border:1px solid #d1d5db; border-radius:6px; background:#fff; font-size:13px; }
    .btn { padding:8px 14px; border:none; border-radius:6px; font-size:12px; font-weight:500; cursor:pointer; }
    .btn.blue { background:#3b82f6; color:#fff; } .btn.gray { background:#f1f5f9; color:#475569; }
    .btn.green { background:#10b981; color:#fff; } .btn.small { padding:4px 10px; font-size:11px; }
    .btn:disabled { opacity:.5; cursor:not-allowed; }
    .action-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
    .action-buttons { display:flex; gap:6px; } .info { color:#94a3b8; font-size:12px; }
    .table-wrap { background:#fff; border:1px solid #e2e8f0; border-radius:8px; overflow-x:auto; }
    table { width:100%; border-collapse:collapse; }
    th { padding:7px 10px; text-align:left; font-size:10px; font-weight:600; color:#94a3b8; text-transform:uppercase; background:#f8fafc; border-bottom:1px solid #e2e8f0; }
    td { padding:5px 10px; border-bottom:1px solid #f1f5f9; vertical-align:middle; font-size:13px; }
    tr:hover { background:#fafbfc; }
    .thumb { width:32px; height:32px; object-fit:cover; border-radius:4px; }
    .name strong { display:block; font-size:12px; line-height:1.3; max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .id-code { font-size:9px; color:#94a3b8; font-family:monospace; }
    .price { font-weight:600; color:#059669; white-space:nowrap; font-size:13px; }
    .center { text-align:center; }
    .stock { font-size:11px; font-weight:500; } .stock.in { color:#10b981; } .stock.out { color:#ef4444; }
    .cat { background:#eff6ff; color:#3b82f6; padding:2px 7px; border-radius:10px; font-size:11px; white-space:nowrap; }
    .nocat { color:#cbd5e1; font-size:11px; }
    .actions { display:flex; gap:3px; align-items:center; }
    .actions button,.actions .action-link { padding:3px 7px; border:1px solid #e2e8f0; background:#fff; border-radius:4px; font-size:11px; cursor:pointer; white-space:nowrap; text-decoration:none; color:inherit; display:inline-block; }
    .actions button:hover,.actions .action-link:hover { background:#f1f5f9; border-color:#3b82f6; }
    .actions .action-link { color:#3b82f6; }
    .actions button.red { color:#94a3b8; border-color:#f1f5f9; } .actions button.red:hover { color:#ef4444; border-color:#ef4444; background:#fef2f2; }
    .pagination { display:flex; gap:3px; justify-content:center; align-items:center; padding:10px; }
    .pagination button { padding:5px 9px; border:1px solid #e2e8f0; background:#fff; border-radius:4px; cursor:pointer; font-size:12px; }
    .pagination button.active { background:#3b82f6; color:#fff; border-color:#3b82f6; }
    .pagination button:disabled { opacity:.4; cursor:not-allowed; }
    .pagination .dots { padding:5px 3px; color:#94a3b8; }
    .pagination .page-info { margin-left:8px; font-size:12px; color:#94a3b8; }
    .empty-state { background:white; border-radius:12px; padding:48px 32px; text-align:center; }
    .empty-icon { font-size:48px; margin-bottom:12px; }
    .empty-state h3 { font-size:18px; margin:0 0 4px; } .empty-state > p { color:#6b7280; margin:0 0 24px; }
    .empty-options { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:12px; max-width:460px; margin:0 auto 20px; }
    .empty-option { padding:16px; background:#f8fafc; border:2px solid #e5e7eb; border-radius:10px; cursor:pointer; text-align:left; transition:all .2s; }
    .empty-option:hover { border-color:#3b82f6; background:#eff6ff; }
    .option-icon { font-size:24px; } .empty-option h4 { margin:6px 0 2px; font-size:13px; } .empty-option p { margin:0; font-size:11px; color:#6b7280; }
    .empty-hint { background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px; padding:8px 12px; font-size:12px; color:#0369a1; max-width:300px; margin:0 auto; }
    .empty-hint a { color:#0284c7; font-weight:600; }
    .modal-bg { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,.5); display:flex; align-items:center; justify-content:center; z-index:9999; }
    .modal { background:#fff; border-radius:10px; width:90%; max-width:480px; max-height:85vh; overflow:hidden; }
    .modal.wide { max-width:580px; }
    .modal-head { padding:10px 14px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; background:#f8fafc; }
    .modal-head h3 { margin:0; font-size:14px; } .modal-head button { background:none; border:none; font-size:20px; cursor:pointer; color:#94a3b8; }
    .modal-body { padding:14px; max-height:calc(85vh - 130px); overflow-y:auto; }
    .modal-foot { padding:10px 14px; border-top:1px solid #e2e8f0; display:flex; justify-content:flex-end; gap:8px; }
    .tabs { display:flex; border-bottom:1px solid #e2e8f0; }
    .tabs button { flex:1; padding:9px; border:none; background:none; font-size:13px; font-weight:500; color:#64748b; cursor:pointer; border-bottom:2px solid transparent; transition:all .2s; }
    .tabs button.active { color:#3b82f6; border-bottom-color:#3b82f6; background:#f8fafc; }
    .tabs button:hover { background:#f8fafc; }
    .product-preview { display:flex; align-items:center; gap:10px; padding:10px; background:#f8fafc; border-radius:8px; margin-bottom:12px; border:1px solid #e2e8f0; }
    .preview-img { width:44px; height:44px; object-fit:contain; border-radius:6px; background:#fff; border:1px solid #e2e8f0; }
    .preview-info h4 { margin:0; font-size:13px; color:#1e293b; }
    .preview-id { font-size:10px; color:#94a3b8; font-family:monospace; display:block; }
    .preview-cat { font-size:10px; color:#3b82f6; background:#eff6ff; padding:1px 5px; border-radius:8px; display:inline-block; margin-top:2px; }
    .form-group { margin-bottom:10px; } .form-group label { display:block; font-size:11px; font-weight:600; color:#475569; margin-bottom:3px; }
    .form-group input { width:100%; padding:7px 10px; border:1px solid #d1d5db; border-radius:6px; font-size:13px; box-sizing:border-box; }
    .form-group input:focus { outline:none; border-color:#3b82f6; box-shadow:0 0 0 2px rgba(59,130,246,.1); }
    .form-row { display:flex; gap:8px; } .form-row .form-group { flex:1; }
    .results { max-height:180px; overflow-y:auto; margin-top:6px; }
    .result { display:flex; align-items:center; gap:8px; padding:7px; border:1px solid #e2e8f0; border-radius:6px; margin-bottom:3px; cursor:pointer; transition:all .15s; }
    .result:hover { background:#f8fafc; border-color:#3b82f6; } .result.selected { background:#f0fdf4; border-color:#10b981; }
    .result img { width:32px; height:32px; object-fit:cover; border-radius:4px; }
    .result div { flex:1; } .result strong { font-size:12px; } .result small { color:#64748b; font-size:10px; }
    .check { color:#10b981; font-weight:700; font-size:16px; }
    .searching,.noresults { text-align:center; padding:14px; color:#64748b; font-size:13px; }
    .selected-cat { background:#d1fae5; color:#065f46; padding:7px 10px; border-radius:6px; font-size:12px; margin:8px 0; }
    .ai-info { background:#f0f9ff; border:1px solid #bae6fd; border-radius:6px; padding:7px 10px; font-size:11px; color:#0369a1; }
    .ean-input-row { display:flex; gap:6px; } .ean-input-row input { flex:1; }
    .ean-error { color:#dc2626; font-size:12px; margin:4px 0 0; }
    .ean-result { margin-top:10px; padding-top:10px; border-top:1px solid #e5e7eb; }
    .ean-product { display:flex; align-items:center; gap:8px; padding:8px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; margin-bottom:10px; }
    .ean-product img { width:36px; height:36px; object-fit:cover; border-radius:4px; }
    .ean-product strong { display:block; font-size:12px; } .ean-product small { color:#6b7280; font-size:10px; }
    @media (max-width:768px) { .stats{flex-direction:column} .toolbar{flex-direction:column} .form-row{flex-direction:column} .actions{flex-direction:column} }
</style>
