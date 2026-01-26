<script>
    import { getContext, onMount } from 'svelte';
    import { browser } from '$app/environment';
    
    const vendorStore = getContext('vendor');
    const shopStore = getContext('shop');
    const API_BASE = getContext('API_BASE');
    
    $: vendor = $vendorStore;
    $: shop = $shopStore;
    $: isFree = shop?.display_mode !== 'cpc';
    $: storesReady = vendor !== null && shop !== null;
    
    let loading = true;
    let initialLoadDone = false;
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
    let showCategoryModal = false;
    let currentProduct = null;
    let masterSearchQuery = '';
    let masterResults = [];
    let searchingMaster = false;
    let saving = false;
    
    $: if (browser && storesReady && !initialLoadDone) {
        initialLoadDone = true;
        loadStats();
        loadProducts();
    }
    
    async function loadStats() {
        const token = localStorage.getItem('vendor_token');
        if (!token) return;
        try {
            const res = await fetch(API_BASE + '/vendor/dashboard', { headers: { 'Authorization': 'Bearer ' + token } });
            const data = await res.json();
            if (data.success && data.data?.stats) {
                const s = data.data.stats;
                stats = {
                    total: s.total_products || 0,
                    paired: s.active_offers || 0,
                    unpaired: Math.max(0, (s.total_products || 0) - (s.active_offers || 0)),
                    withoutCategories: 0,
                    pendingApprovals: 0,
                    pairingRate: s.total_products > 0 ? Math.round((s.active_offers / s.total_products) * 100) : 0
                };
            }
        } catch (e) { console.error(e); }
    }
    
    async function loadProducts() {
        loading = true;
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
                if (stats.total === 0 && totalResults > 0) stats.total = totalResults;
            }
        } catch (e) { console.error(e); }
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
    
    async function connectToMaster(masterId) {
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(API_BASE + '/vendor/products/' + masterId + '/connect', { method: 'POST', headers: { 'Authorization': 'Bearer ' + token } });
            const data = await res.json();
            if (data.success) { showConnectModal = false; masterSearchQuery = ''; masterResults = []; loadStats(); loadProducts(); }
            else alert(data.error || 'Chyba');
        } catch (e) { alert('Chyba pripojenia'); }
    }
    
    async function disconnectProduct(productId) {
        if (!confirm('Naozaj chcete odpojiť tento produkt?')) return;
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(API_BASE + '/vendor/products/' + productId + '/offer', { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } });
            const data = await res.json();
            if (data.success) { loadStats(); loadProducts(); }
            else alert(data.error || 'Chyba');
        } catch (e) { alert('Chyba'); }
    }
    
    async function saveProduct() {
        if (!currentProduct) return;
        saving = true;
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(API_BASE + '/vendor/products/' + currentProduct.id + '/offer', {
                method: 'PUT',
                headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
                body: JSON.stringify({ price: parseFloat(currentProduct.price) || 0, stock_status: currentProduct.stock_status, min_price: parseFloat(currentProduct.min_price) || null, max_price: parseFloat(currentProduct.max_price) || null })
            });
            const data = await res.json();
            if (data.success) { showEditModal = false; loadProducts(); }
            else alert(data.error || 'Chyba');
        } catch (e) { alert('Chyba'); }
        saving = false;
    }
    
    function handleSearch() { currentPage = 1; loadProducts(); }
    function handleFilterChange(f) { filter = f; currentPage = 1; loadProducts(); }
    function handlePerPageChange() { currentPage = 1; loadProducts(); }
    function goToPage(p) { currentPage = p; loadProducts(); }
    function refresh() { searchQuery = ''; filter = 'all'; currentPage = 1; loadStats(); loadProducts(); }
    function openConnectModal() { masterSearchQuery = ''; masterResults = []; showConnectModal = true; }
    function openEditModal(p) { currentProduct = { ...p, min_price: p.min_price || '', max_price: p.max_price || '' }; showEditModal = true; }
    function openCategoryModal(p) { currentProduct = { ...p }; showCategoryModal = true; }
    function viewOffers(p) {
        if (isFree) window.open('/?s=' + encodeURIComponent(p.title || p.name), '_blank');
        else if (p.permalink || p.url) window.open(p.permalink || p.url, '_blank');
        else alert('Produkt ešte nie je publikovaný');
    }
    
    function formatNumber(n) { return (n || 0).toLocaleString('sk-SK'); }
    function formatPrice(p) { return (p || 0).toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'; }
    const placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50"%3E%3Crect fill="%23f1f5f9" width="50" height="50" rx="6"/%3E%3C/svg%3E';
</script>

{#if !storesReady}
    <div class="loading-box"><div class="spinner"></div><p>Načítavam...</p></div>
{:else}
<div class="page">
    {#if isFree}
    <div class="free-banner">
        🔓 <strong>FREE režim</strong> — Produkty sú len vo fulltextovom vyhľadávaní.
        <a href="/vendor-dashboard/ppc">⚡ Aktivovať PAID</a>
    </div>
    {/if}
    
    <!-- STATS -->
    <div class="stats">
        <button class="stat" class:active={filter === 'all'} on:click={() => handleFilterChange('all')}>
            <span class="num">{formatNumber(stats.total)}</span>
            <span class="lbl">Celkom produktov</span>
        </button>
        <button class="stat" class:active={filter === 'paired'} on:click={() => handleFilterChange('paired')} class:disabled={isFree}>
            <span class="num">{isFree ? '—' : formatNumber(stats.paired)}</span>
            <span class="lbl">Spárované {#if !isFree}({stats.pairingRate}%){/if}</span>
        </button>
        <button class="stat" class:active={filter === 'unpaired'} on:click={() => handleFilterChange('unpaired')} class:disabled={isFree}>
            <span class="num">{isFree ? '—' : formatNumber(stats.unpaired)}</span>
            <span class="lbl">Nespárované</span>
        </button>
        <button class="stat" class:active={filter === 'no_category'} on:click={() => handleFilterChange('no_category')} class:disabled={isFree}>
            <span class="num">{isFree ? formatNumber(stats.total) : formatNumber(stats.withoutCategories)}</span>
            <span class="lbl">Bez kategórie</span>
        </button>
        <button class="stat" class:active={filter === 'pending'} on:click={() => handleFilterChange('pending')} class:disabled={isFree}>
            <span class="num">{isFree ? '—' : formatNumber(stats.pendingApprovals)}</span>
            <span class="lbl">Na schválenie</span>
        </button>
    </div>
    
    <!-- TOOLBAR -->
    <div class="toolbar">
        <input type="text" placeholder="🔍 Hľadať master produkt (názov, ID)..." bind:value={searchQuery} on:keypress={(e) => e.key === 'Enter' && handleSearch()}>
        <button class="btn blue" on:click={handleSearch}>🔍 Hľadať</button>
        <button class="btn gray" on:click={refresh}>🔄 Obnoviť</button>
        <select bind:value={filter} on:change={() => handleFilterChange(filter)}>
            <option value="all">Všetky produkty</option>
            <option value="paired">Spárované</option>
            <option value="unpaired">Nespárované</option>
            <option value="no_category">Bez kategórie</option>
            <option value="pending">Na schválenie</option>
        </select>
        <select bind:value={perPage} on:change={handlePerPageChange}>
            <option value={10}>10 / strana</option>
            <option value={25}>25 / strana</option>
            <option value={50}>50 / strana</option>
        </select>
    </div>
    
    <div class="action-row">
        <button class="btn green" on:click={openConnectModal}>➕ Pripojiť sa k master produktu</button>
        <span class="info">📊 Zobrazených {products.length} z {formatNumber(totalResults)} produktov</span>
    </div>
    
    <!-- TABLE -->
    <div class="table-wrap">
        <table>
            <thead>
                <tr>
                    <th>IMG</th>
                    <th>MASTER PRODUKT</th>
                    <th>ID</th>
                    <th>CENA</th>
                    <th>STAV</th>
                    <th>PREDAJCOV</th>
                    <th>BUY BOX</th>
                    <th>KATEGÓRIA</th>
                    <th>AKCIE</th>
                </tr>
            </thead>
            <tbody>
                {#if loading}
                    <tr><td colspan="9" class="center"><div class="spinner small"></div> Načítavam...</td></tr>
                {:else if products.length === 0}
                    <tr><td colspan="9" class="center empty">📦 Žiadne produkty</td></tr>
                {:else}
                    {#each products as p}
                        <tr>
                            <td><img src={p.image_url || p.master_image || placeholder} alt="" class="thumb" on:error={(e) => e.target.src = placeholder}></td>
                            <td class="name"><strong>{p.title || p.master_title || p.name || '-'}</strong></td>
                            <td><code>{p.id?.slice(0,8) || '-'}</code></td>
                            <td class="price">{formatPrice(p.price)}</td>
                            <td>{#if p.stock_status === 'instock'}<span class="stock in">✓ Skladom</span>{:else}<span class="stock out">✗ Vypredané</span>{/if}</td>
                            <td class="center">{p.vendors_count || 1}</td>
                            <td class="center">{#if p.is_buybox}🏆{:else}—{/if}</td>
                            <td>{#if p.category}<span class="cat">{p.category}</span>{:else}<span class="nocat">❌ Bez kategórie</span>{/if}</td>
                            <td class="actions">
                                <button on:click={() => openEditModal(p)}>📝 Upraviť</button>
                                <button on:click={() => openCategoryModal(p)}>🏷️ Kategórie</button>
                                <button on:click={() => viewOffers(p)}>👁️ Ponuky ({p.vendors_count || 1})</button>
                                <button class="red" on:click={() => disconnectProduct(p.id)}>🔌 Odpojiť</button>
                            </td>
                        </tr>
                    {/each}
                {/if}
            </tbody>
        </table>
    </div>
    
    {#if totalPages > 1}
    <div class="pagination">
        <button disabled={currentPage === 1} on:click={() => goToPage(currentPage - 1)}>‹</button>
        {#each Array(Math.min(totalPages, 7)) as _, i}
            <button class:active={currentPage === i + 1} on:click={() => goToPage(i + 1)}>{i + 1}</button>
        {/each}
        <button disabled={currentPage === totalPages} on:click={() => goToPage(currentPage + 1)}>›</button>
    </div>
    {/if}
</div>
{/if}

<!-- CONNECT MODAL -->
{#if showConnectModal}
<div class="modal-bg" on:click={() => showConnectModal = false} on:keydown={() => {}} role="button" tabindex="0">
    <div class="modal" on:click|stopPropagation>
        <div class="modal-head"><h3>➕ Pripojiť sa k master produktu</h3><button on:click={() => showConnectModal = false}>&times;</button></div>
        <div class="modal-body">
            <label>Vyhľadať master produkt</label>
            <input type="text" placeholder="Názov, EAN alebo ID..." bind:value={masterSearchQuery} on:input={searchMasterProducts}>
            {#if searchingMaster}<p class="searching">Hľadám...</p>
            {:else if masterResults.length > 0}
                <div class="results">
                    {#each masterResults as m}
                        <div class="result" on:click={() => connectToMaster(m.id)} on:keydown={() => {}} role="button" tabindex="0">
                            <img src={m.image_url || placeholder} alt="">
                            <div><strong>{m.title || m.name}</strong><br><small>ID: {m.id}</small></div>
                            <button class="btn green small">Pripojiť</button>
                        </div>
                    {/each}
                </div>
            {:else if masterSearchQuery.length >= 2}<p class="noresults">Žiadne výsledky</p>{/if}
        </div>
    </div>
</div>
{/if}

<!-- EDIT MODAL -->
{#if showEditModal && currentProduct}
<div class="modal-bg" on:click={() => showEditModal = false} on:keydown={() => {}} role="button" tabindex="0">
    <div class="modal wide" on:click|stopPropagation>
        <div class="modal-head"><h3>📝 Upraviť ponuku</h3><button on:click={() => showEditModal = false}>&times;</button></div>
        <div class="modal-body">
            <div class="form-group">
                <label>Názov produktu (iba čítanie)</label>
                <input type="text" value={currentProduct.title || currentProduct.name || ''} disabled>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Vaša cena (€) <span class="instant">⚡ Okamžite</span></label>
                    <input type="number" step="0.01" bind:value={currentProduct.price} required>
                </div>
                <div class="form-group">
                    <label>Stav skladu <span class="instant">⚡ Okamžite</span></label>
                    <select bind:value={currentProduct.stock_status}>
                        <option value="instock">Skladom</option>
                        <option value="outofstock">Vypredané</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Minimálna cena (€) <span class="instant">⚡ Okamžite</span></label>
                    <input type="number" step="0.01" bind:value={currentProduct.min_price} placeholder="Voliteľné">
                </div>
                <div class="form-group">
                    <label>Maximálna cena (€) <span class="instant">⚡ Okamžite</span></label>
                    <input type="number" step="0.01" bind:value={currentProduct.max_price} placeholder="Voliteľné">
                </div>
            </div>
        </div>
        <div class="modal-foot">
            <button class="btn gray" on:click={() => showEditModal = false}>Zrušiť</button>
            <button class="btn blue" on:click={saveProduct} disabled={saving}>{saving ? 'Ukladám...' : '💾 Uložiť zmeny'}</button>
        </div>
    </div>
</div>
{/if}

<!-- CATEGORY MODAL -->
{#if showCategoryModal && currentProduct}
<div class="modal-bg" on:click={() => showCategoryModal = false} on:keydown={() => {}} role="button" tabindex="0">
    <div class="modal" on:click|stopPropagation>
        <div class="modal-head"><h3>🏷️ Kategórie produktu</h3><button on:click={() => showCategoryModal = false}>&times;</button></div>
        <div class="modal-body">
            <p><strong>{currentProduct.title || currentProduct.name}</strong></p>
            {#if isFree}
                <div class="free-notice">🔒 Kategórie je možné upravovať len v PAID režime. <a href="/vendor-dashboard/ppc">Aktivovať PAID</a></div>
            {:else}
                <p>Aktuálna kategória: <strong>{currentProduct.category || 'Bez kategórie'}</strong></p>
            {/if}
        </div>
        <div class="modal-foot"><button class="btn gray" on:click={() => showCategoryModal = false}>Zavrieť</button></div>
    </div>
</div>
{/if}

<style>
    .page { width: 100%; }
    .loading-box { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; gap: 12px; color: #64748b; }
    .spinner { width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; }
    .spinner.small { width: 20px; height: 20px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    .free-banner { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; color: #92400e; }
    .free-banner a { color: #d97706; font-weight: 600; margin-left: 12px; }
    
    .stats { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
    .stat { flex: 1; min-width: 140px; padding: 16px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; text-align: left; transition: all 0.2s; }
    .stat:hover { border-color: #3b82f6; }
    .stat.active { border-color: #3b82f6; background: #eff6ff; }
    .stat.disabled { opacity: 0.6; }
    .stat .num { display: block; font-size: 24px; font-weight: 700; color: #1e293b; }
    .stat .lbl { font-size: 12px; color: #64748b; }
    
    .toolbar { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
    .toolbar input { flex: 1; min-width: 200px; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 6px; }
    .toolbar select { padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; background: #fff; }
    
    .btn { padding: 10px 16px; border: none; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; }
    .btn.blue { background: #3b82f6; color: #fff; }
    .btn.gray { background: #f1f5f9; color: #475569; }
    .btn.green { background: #10b981; color: #fff; }
    .btn.small { padding: 6px 12px; font-size: 12px; }
    
    .action-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
    .info { color: #64748b; font-size: 13px; }
    
    .table-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; min-width: 900px; }
    th { padding: 12px; text-align: left; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
    td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    tr:hover { background: #f8fafc; }
    .thumb { width: 45px; height: 45px; object-fit: cover; border-radius: 6px; }
    .name { max-width: 180px; } .name strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    code { background: #f1f5f9; padding: 3px 6px; border-radius: 4px; font-size: 11px; }
    .price { font-weight: 600; color: #059669; }
    .center { text-align: center; }
    .stock { font-size: 12px; font-weight: 500; } .stock.in { color: #10b981; } .stock.out { color: #ef4444; }
    .cat { background: #eff6ff; color: #3b82f6; padding: 3px 8px; border-radius: 12px; font-size: 11px; }
    .nocat { color: #ef4444; font-size: 12px; }
    .empty { padding: 40px; color: #94a3b8; }
    
    .actions { display: flex; flex-direction: column; gap: 4px; }
    .actions button { padding: 6px 10px; border: 1px solid #e2e8f0; background: #fff; border-radius: 4px; font-size: 11px; cursor: pointer; text-align: left; transition: all 0.15s; }
    .actions button:hover { background: #f1f5f9; border-color: #3b82f6; }
    .actions button.red:hover { background: #fef2f2; border-color: #ef4444; color: #dc2626; }
    
    .pagination { display: flex; gap: 4px; justify-content: center; padding: 16px; }
    .pagination button { padding: 8px 12px; border: 1px solid #e2e8f0; background: #fff; border-radius: 4px; cursor: pointer; }
    .pagination button.active { background: #3b82f6; color: #fff; border-color: #3b82f6; }
    .pagination button:disabled { opacity: 0.5; }
    
    .modal-bg { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; }
    .modal { background: #fff; border-radius: 10px; width: 90%; max-width: 480px; max-height: 85vh; overflow: hidden; }
    .modal.wide { max-width: 600px; }
    .modal-head { padding: 14px 18px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; }
    .modal-head h3 { margin: 0; font-size: 15px; }
    .modal-head button { background: none; border: none; font-size: 22px; cursor: pointer; color: #94a3b8; }
    .modal-body { padding: 18px; max-height: calc(85vh - 120px); overflow-y: auto; }
    .modal-foot { padding: 12px 18px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 8px; }
    
    .form-group { margin-bottom: 14px; }
    .form-group label { display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 6px; }
    .form-group input, .form-group select { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; }
    .form-group input:disabled { background: #f1f5f9; color: #64748b; }
    .form-row { display: flex; gap: 12px; }
    .form-row .form-group { flex: 1; }
    .instant { background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; }
    
    .results { max-height: 280px; overflow-y: auto; }
    .result { display: flex; align-items: center; gap: 10px; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 6px; cursor: pointer; }
    .result:hover { background: #f8fafc; border-color: #3b82f6; }
    .result img { width: 40px; height: 40px; object-fit: cover; border-radius: 4px; }
    .result div { flex: 1; } .result strong { font-size: 13px; } .result small { color: #64748b; font-size: 11px; }
    .searching, .noresults { text-align: center; padding: 20px; color: #64748b; }
    .free-notice { background: #fef3c7; padding: 16px; border-radius: 6px; text-align: center; color: #92400e; }
    .free-notice a { color: #d97706; font-weight: 600; }
    
    @media (max-width: 768px) {
        .stats { flex-direction: column; }
        .toolbar { flex-direction: column; }
        .form-row { flex-direction: column; }
    }
</style>
