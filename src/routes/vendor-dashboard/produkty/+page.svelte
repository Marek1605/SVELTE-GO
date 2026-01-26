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
    
    // Modals
    let showConnectModal = false;
    let showEditModal = false;
    let showCategoryModal = false;
    let showOffersModal = false;
    let currentProduct = null;
    let masterSearchQuery = '';
    let masterResults = [];
    let searchingMaster = false;
    let saving = false;
    let allCategories = [];
    let selectedCategories = [];
    
    $: if (browser && storesReady && !initialLoadDone) {
        initialLoadDone = true;
        loadStats();
        loadProducts();
    }
    
    async function loadStats() {
        const token = localStorage.getItem('vendor_token');
        if (!token) return;
        try {
            const res = await fetch(API_BASE + '/vendor/dashboard', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
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
        } catch (e) { console.error('Stats error:', e); }
    }
    
    async function loadProducts() {
        loading = true;
        const token = localStorage.getItem('vendor_token');
        if (!token) { loading = false; return; }
        
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                per_page: perPage.toString(),
                filter: filter,
                search: searchQuery
            });
            
            const res = await fetch(API_BASE + '/vendor/products?' + params.toString(), {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();
            
            if (data.success) {
                products = data.data || [];
                totalResults = data.meta?.total || products.length;
                totalPages = data.meta?.pages || Math.ceil(totalResults / perPage);
                if (stats.total === 0 && totalResults > 0) stats.total = totalResults;
            }
        } catch (e) { console.error('Products error:', e); }
        loading = false;
    }
    
    async function searchMasterProducts() {
        if (masterSearchQuery.length < 2) return;
        searchingMaster = true;
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(API_BASE + '/products/search?q=' + encodeURIComponent(masterSearchQuery) + '&limit=20', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();
            masterResults = data.data?.products || data.data || [];
        } catch (e) { console.error('Search error:', e); }
        searchingMaster = false;
    }
    
    async function connectToMaster(masterId) {
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(API_BASE + '/vendor/products/' + masterId + '/connect', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if (data.success) {
                showConnectModal = false;
                masterSearchQuery = '';
                masterResults = [];
                loadStats();
                loadProducts();
                showNotification('Produkt bol pripojený', 'success');
            } else {
                showNotification(data.error || 'Chyba pri pripájaní', 'error');
            }
        } catch (e) {
            showNotification('Chyba pripojenia', 'error');
        }
    }
    
    async function disconnectProduct(productId) {
        if (!confirm('Naozaj chcete odpojiť tento produkt?')) return;
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(API_BASE + '/vendor/products/' + productId + '/offer', {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();
            if (data.success) {
                loadStats();
                loadProducts();
                showNotification('Produkt bol odpojený', 'success');
            } else {
                showNotification(data.error || 'Chyba', 'error');
            }
        } catch (e) {
            showNotification('Chyba pripojenia', 'error');
        }
    }
    
    async function saveProduct() {
        if (!currentProduct) return;
        saving = true;
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(API_BASE + '/vendor/products/' + currentProduct.id + '/offer', {
                method: 'PUT',
                headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    price: parseFloat(currentProduct.price) || 0,
                    stock_status: currentProduct.stock_status,
                    affiliate_url: currentProduct.affiliate_url || ''
                })
            });
            const data = await res.json();
            if (data.success) {
                showEditModal = false;
                loadProducts();
                showNotification('Produkt bol uložený', 'success');
            } else {
                showNotification(data.error || 'Chyba', 'error');
            }
        } catch (e) {
            showNotification('Chyba pripojenia', 'error');
        }
        saving = false;
    }
    
    function showNotification(message, type) {
        // Simple alert for now
        if (type === 'error') alert('❌ ' + message);
    }
    
    function handleSearch() { currentPage = 1; loadProducts(); }
    function handleFilterChange(newFilter) { filter = newFilter; currentPage = 1; loadProducts(); }
    function handlePerPageChange() { currentPage = 1; loadProducts(); }
    function goToPage(page) { currentPage = page; loadProducts(); }
    function refresh() { searchQuery = ''; filter = 'all'; currentPage = 1; loadStats(); loadProducts(); }
    
    function openConnectModal() { masterSearchQuery = ''; masterResults = []; showConnectModal = true; }
    function openEditModal(product) { currentProduct = { ...product }; showEditModal = true; }
    function openCategoryModal(product) { currentProduct = { ...product }; showCategoryModal = true; }
    function openOffersModal(product) {
        if (isFree) {
            // FREE mode - redirect to search
            window.open('/?s=' + encodeURIComponent(product.title || product.name), '_blank');
        } else if (product.permalink || product.url) {
            window.open(product.permalink || product.url, '_blank');
        } else {
            showNotification('Produkt ešte nie je publikovaný', 'error');
        }
    }
    
    function formatNumber(num) { return (num || 0).toLocaleString('sk-SK'); }
    function formatPrice(price) { return (price || 0).toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'; }
    
    const placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Crect fill="%23f1f5f9" width="60" height="60" rx="8"/%3E%3Ctext fill="%2394a3b8" font-size="10" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EIMG%3C/text%3E%3C/svg%3E';
</script>

{#if !storesReady}
    <div class="loading-screen"><div class="spinner"></div><p>Načítavam...</p></div>
{:else}
<div class="products-page">
    
    {#if isFree}
    <div class="free-banner">
        <span class="free-icon">🔓</span>
        <div class="free-text">
            <strong>FREE režim</strong> — Produkty sú len vo fulltextovom vyhľadávaní. 
            Pre kategórie a "Kde kúpiť" aktivujte platený režim.
        </div>
        <a href="/vendor-dashboard/ppc" class="upgrade-btn">⚡ Aktivovať PAID</a>
    </div>
    {/if}
    
    <!-- STAT CARDS -->
    <div class="stats-grid">
        <button class="stat-card" class:active={filter === 'all'} on:click={() => handleFilterChange('all')}>
            <div class="stat-icon blue">📦</div>
            <div class="stat-content">
                <div class="stat-value">{formatNumber(stats.total)}</div>
                <div class="stat-label">Celkom produktov</div>
            </div>
        </button>
        
        {#if isFree}
            <button class="stat-card locked" on:click={() => window.location.href = '/vendor-dashboard/ppc'}>
                <div class="stat-icon green">🔗</div>
                <div class="stat-content">
                    <div class="stat-value muted">0</div>
                    <div class="stat-label">Spárované</div>
                    <div class="stat-lock">🔒 PAID</div>
                </div>
            </button>
            <button class="stat-card locked" on:click={() => window.location.href = '/vendor-dashboard/ppc'}>
                <div class="stat-icon orange">⚠️</div>
                <div class="stat-content">
                    <div class="stat-value muted">0</div>
                    <div class="stat-label">Nespárované</div>
                    <div class="stat-lock">🔒 PAID</div>
                </div>
            </button>
            <button class="stat-card warning" on:click={() => window.location.href = '/vendor-dashboard/ppc'}>
                <div class="stat-icon yellow">📂</div>
                <div class="stat-content">
                    <div class="stat-value">{formatNumber(stats.total)}</div>
                    <div class="stat-label">Bez kategórie</div>
                    <div class="stat-lock">🔒 FREE</div>
                </div>
            </button>
            <button class="stat-card locked" on:click={() => window.location.href = '/vendor-dashboard/ppc'}>
                <div class="stat-icon purple">⏳</div>
                <div class="stat-content">
                    <div class="stat-value muted">0</div>
                    <div class="stat-label">Na schválenie</div>
                    <div class="stat-lock">🔒 PAID</div>
                </div>
            </button>
        {:else}
            <button class="stat-card" class:active={filter === 'paired'} on:click={() => handleFilterChange('paired')}>
                <div class="stat-icon green">🔗</div>
                <div class="stat-content">
                    <div class="stat-value">{formatNumber(stats.paired)}</div>
                    <div class="stat-label">Spárované</div>
                    <div class="stat-percent">{stats.pairingRate}%</div>
                </div>
            </button>
            <button class="stat-card" class:active={filter === 'unpaired'} on:click={() => handleFilterChange('unpaired')}>
                <div class="stat-icon orange">⚠️</div>
                <div class="stat-content">
                    <div class="stat-value">{formatNumber(stats.unpaired)}</div>
                    <div class="stat-label">Nespárované</div>
                </div>
            </button>
            <button class="stat-card" class:active={filter === 'no_category'} on:click={() => handleFilterChange('no_category')}>
                <div class="stat-icon yellow">📂</div>
                <div class="stat-content">
                    <div class="stat-value">{formatNumber(stats.withoutCategories)}</div>
                    <div class="stat-label">Bez kategórie</div>
                </div>
            </button>
            <button class="stat-card" class:active={filter === 'pending'} on:click={() => handleFilterChange('pending')}>
                <div class="stat-icon purple">⏳</div>
                <div class="stat-content">
                    <div class="stat-value">{formatNumber(stats.pendingApprovals)}</div>
                    <div class="stat-label">Na schválenie</div>
                </div>
            </button>
        {/if}
    </div>
    
    <!-- TOOLBAR -->
    <div class="toolbar">
        <div class="search-box">
            <input type="text" placeholder="🔍 Hľadať master produkt (názov, ID)..." bind:value={searchQuery} on:keypress={(e) => e.key === 'Enter' && handleSearch()}>
            <button class="btn primary" on:click={handleSearch}>Hľadať</button>
            <button class="btn secondary" on:click={refresh}>🔄 Obnoviť</button>
        </div>
        <div class="filters">
            <select bind:value={filter} on:change={() => handleFilterChange(filter)}>
                <option value="all">Všetky produkty</option>
                {#if !isFree}
                    <option value="with_category">S kategóriou</option>
                    <option value="no_category">Bez kategórie</option>
                    <option value="pending">Čaká na schválenie</option>
                {/if}
            </select>
            <select bind:value={perPage} on:change={handlePerPageChange}>
                <option value={5}>5 / strana</option>
                <option value={10}>10 / strana</option>
                <option value={25}>25 / strana</option>
                <option value={50}>50 / strana</option>
            </select>
        </div>
    </div>
    
    <!-- CONNECT BTN -->
    <div class="action-bar">
        <button class="btn success" on:click={openConnectModal}>➕ Pripojiť sa k master produktu</button>
        <span class="results-info">📊 Zobrazených {products.length} z {formatNumber(totalResults)} produktov</span>
    </div>
    
    <!-- TABLE -->
    <div class="table-wrapper">
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width:60px">IMG</th>
                    <th>MASTER PRODUKT</th>
                    <th style="width:100px">ID</th>
                    <th style="width:90px">CENA</th>
                    <th style="width:90px">STAV</th>
                    <th style="width:80px">PREDAJCOV</th>
                    <th style="width:80px">BUY BOX</th>
                    <th style="width:120px">KATEGÓRIA</th>
                    <th style="width:220px">AKCIE</th>
                </tr>
            </thead>
            <tbody>
                {#if loading}
                    <tr><td colspan="9" class="loading-cell"><div class="spinner small"></div> Načítavam...</td></tr>
                {:else if products.length === 0}
                    <tr><td colspan="9" class="empty-cell">
                        <div class="empty-icon">📦</div>
                        <p>Žiadne produkty</p>
                        <small>Nahrajte XML feed alebo pridajte produkty manuálne</small>
                    </td></tr>
                {:else}
                    {#each products as product}
                        <tr>
                            <td><img src={product.image_url || product.master_image || placeholder} alt="" class="thumb" on:error={(e) => e.target.src = placeholder}></td>
                            <td class="product-name">
                                <strong>{product.title || product.master_title || product.name || '-'}</strong>
                                {#if product.has_pending}<span class="pending-badge">⏳ Pending</span>{/if}
                            </td>
                            <td><code class="id-code">{product.id?.slice(0,8) || '-'}</code></td>
                            <td class="price">{formatPrice(product.price)}</td>
                            <td>
                                {#if product.stock_status === 'instock'}
                                    <span class="stock in">✓ Skladom</span>
                                {:else}
                                    <span class="stock out">✗ Vypredané</span>
                                {/if}
                            </td>
                            <td class="center"><span class="vendor-count">{product.vendors_count || 1}</span></td>
                            <td class="center">
                                {#if isFree}
                                    <span class="no-buybox">—</span>
                                {:else if product.is_buybox}
                                    <span class="buybox">🏆 Áno</span>
                                {:else}
                                    <span class="no-buybox">—</span>
                                {/if}
                            </td>
                            <td>
                                {#if isFree}
                                    <a href="/vendor-dashboard/ppc" class="free-cat-link">🔒 FREE</a>
                                {:else if product.category}
                                    <span class="category-tag">{product.category}</span>
                                {:else}
                                    <span class="no-category">❌ Bez kategórie</span>
                                {/if}
                            </td>
                            <td class="actions-cell">
                                <button class="action-btn edit" title="Upraviť" on:click={() => openEditModal(product)}>📝</button>
                                <button class="action-btn category" title="Kategórie" on:click={() => openCategoryModal(product)}>🏷️</button>
                                <button class="action-btn offers" title="Ponuky ({product.vendors_count || 1})" on:click={() => openOffersModal(product)}>👁️</button>
                                <button class="action-btn disconnect" title="Odpojiť" on:click={() => disconnectProduct(product.id)}>🔌</button>
                            </td>
                        </tr>
                    {/each}
                {/if}
            </tbody>
        </table>
    </div>
    
    <!-- PAGINATION -->
    {#if totalPages > 1}
        <div class="pagination">
            <button class="page-btn" disabled={currentPage === 1} on:click={() => goToPage(currentPage - 1)}>‹ Predošlá</button>
            {#each Array(Math.min(totalPages, 7)) as _, i}
                <button class="page-btn" class:active={currentPage === i + 1} on:click={() => goToPage(i + 1)}>{i + 1}</button>
            {/each}
            {#if totalPages > 7}<span class="page-dots">...</span><button class="page-btn" on:click={() => goToPage(totalPages)}>{totalPages}</button>{/if}
            <button class="page-btn" disabled={currentPage === totalPages} on:click={() => goToPage(currentPage + 1)}>Ďalšia ›</button>
        </div>
    {/if}
</div>
{/if}

<!-- CONNECT MODAL -->
{#if showConnectModal}
<div class="modal-overlay" on:click={() => showConnectModal = false} on:keydown={() => {}} role="button" tabindex="0">
    <div class="modal" on:click|stopPropagation>
        <div class="modal-header">
            <h3>➕ Pripojiť sa k master produktu</h3>
            <button class="close-btn" on:click={() => showConnectModal = false}>&times;</button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label>Vyhľadať master produkt</label>
                <input type="text" placeholder="Zadajte názov, EAN alebo ID..." bind:value={masterSearchQuery} on:input={searchMasterProducts}>
            </div>
            {#if searchingMaster}
                <div class="search-loading"><div class="spinner small"></div> Hľadám...</div>
            {:else if masterResults.length > 0}
                <div class="master-list">
                    {#each masterResults as m}
                        <div class="master-item" on:click={() => connectToMaster(m.id)} on:keydown={() => {}} role="button" tabindex="0">
                            <img src={m.image_url || placeholder} alt="">
                            <div class="master-info">
                                <strong>{m.title || m.name}</strong>
                                <small>ID: {m.id} | EAN: {m.ean || '-'}</small>
                            </div>
                            <button class="btn success small">Pripojiť</button>
                        </div>
                    {/each}
                </div>
            {:else if masterSearchQuery.length >= 2}
                <p class="no-results">Žiadne výsledky pre "{masterSearchQuery}"</p>
            {/if}
        </div>
    </div>
</div>
{/if}

<!-- EDIT MODAL -->
{#if showEditModal && currentProduct}
<div class="modal-overlay" on:click={() => showEditModal = false} on:keydown={() => {}} role="button" tabindex="0">
    <div class="modal" on:click|stopPropagation>
        <div class="modal-header">
            <h3>📝 Upraviť ponuku</h3>
            <button class="close-btn" on:click={() => showEditModal = false}>&times;</button>
        </div>
        <div class="modal-body">
            <div class="product-preview">
                <img src={currentProduct.image_url || placeholder} alt="">
                <strong>{currentProduct.title || currentProduct.name}</strong>
            </div>
            <div class="form-group">
                <label>Cena (€)</label>
                <input type="number" step="0.01" bind:value={currentProduct.price}>
            </div>
            <div class="form-group">
                <label>Stav skladu</label>
                <select bind:value={currentProduct.stock_status}>
                    <option value="instock">Skladom</option>
                    <option value="outofstock">Vypredané</option>
                </select>
            </div>
            <div class="form-group">
                <label>Affiliate URL</label>
                <input type="text" bind:value={currentProduct.affiliate_url} placeholder="https://...">
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn secondary" on:click={() => showEditModal = false}>Zrušiť</button>
            <button class="btn primary" on:click={saveProduct} disabled={saving}>{saving ? 'Ukladám...' : 'Uložiť'}</button>
        </div>
    </div>
</div>
{/if}

<!-- CATEGORY MODAL -->
{#if showCategoryModal && currentProduct}
<div class="modal-overlay" on:click={() => showCategoryModal = false} on:keydown={() => {}} role="button" tabindex="0">
    <div class="modal" on:click|stopPropagation>
        <div class="modal-header">
            <h3>🏷️ Kategórie produktu</h3>
            <button class="close-btn" on:click={() => showCategoryModal = false}>&times;</button>
        </div>
        <div class="modal-body">
            <div class="product-preview">
                <img src={currentProduct.image_url || placeholder} alt="">
                <strong>{currentProduct.title || currentProduct.name}</strong>
            </div>
            {#if isFree}
                <div class="free-notice">
                    <span>🔒</span>
                    <p>Kategórie je možné upravovať len v PAID režime.</p>
                    <a href="/vendor-dashboard/ppc" class="btn success">Aktivovať PAID</a>
                </div>
            {:else}
                <div class="form-group">
                    <label>Aktuálna kategória</label>
                    <p>{currentProduct.category || 'Bez kategórie'}</p>
                </div>
            {/if}
        </div>
        <div class="modal-footer">
            <button class="btn secondary" on:click={() => showCategoryModal = false}>Zavrieť</button>
        </div>
    </div>
</div>
{/if}

<style>
    :root { --blue: #3B82F6; --green: #10B981; --orange: #F59E0B; --red: #EF4444; --purple: #8B5CF6; }
    
    .products-page { width: 100%; padding: 0; }
    
    .loading-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; gap: 16px; color: #64748b; }
    .spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: var(--blue); border-radius: 50%; animation: spin 0.8s linear infinite; }
    .spinner.small { width: 24px; height: 24px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    /* FREE BANNER */
    .free-banner { display: flex; align-items: center; gap: 16px; background: linear-gradient(135deg, #fef3c7, #fde68a); border: 2px solid var(--orange); border-radius: 16px; padding: 20px 24px; margin-bottom: 24px; }
    .free-icon { font-size: 36px; }
    .free-text { flex: 1; color: #92400e; }
    .upgrade-btn { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 12px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; box-shadow: 0 4px 14px rgba(245,158,11,0.4); transition: transform 0.2s; }
    .upgrade-btn:hover { transform: translateY(-2px); }
    
    /* STAT CARDS */
    .stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { display: flex; align-items: center; gap: 16px; padding: 20px; background: white; border: 2px solid #e2e8f0; border-radius: 16px; cursor: pointer; transition: all 0.2s; text-align: left; }
    .stat-card:hover { border-color: var(--blue); transform: translateY(-3px); box-shadow: 0 8px 25px rgba(59,130,246,0.15); }
    .stat-card.active { border-color: var(--blue); background: #eff6ff; }
    .stat-card.locked { opacity: 0.7; }
    .stat-card.warning { background: #fffbeb; border-color: #fcd34d; }
    .stat-icon { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .stat-icon.blue { background: #dbeafe; }
    .stat-icon.green { background: #d1fae5; }
    .stat-icon.orange { background: #ffedd5; }
    .stat-icon.yellow { background: #fef3c7; }
    .stat-icon.purple { background: #ede9fe; }
    .stat-content { flex: 1; }
    .stat-value { font-size: 28px; font-weight: 800; color: #1e293b; }
    .stat-value.muted { color: #94a3b8; }
    .stat-label { font-size: 13px; color: #64748b; }
    .stat-percent { font-size: 12px; color: var(--green); font-weight: 600; }
    .stat-lock { font-size: 11px; color: var(--orange); font-weight: 600; background: #fef3c7; padding: 2px 8px; border-radius: 6px; margin-top: 4px; display: inline-block; }
    
    /* TOOLBAR */
    .toolbar { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .search-box { display: flex; gap: 10px; flex: 1; min-width: 300px; }
    .search-box input { flex: 1; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; }
    .search-box input:focus { outline: none; border-color: var(--blue); }
    .filters { display: flex; gap: 10px; }
    .filters select { padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; background: white; cursor: pointer; }
    
    .btn { padding: 12px 20px; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn.primary { background: var(--blue); color: white; }
    .btn.primary:hover { background: #2563eb; }
    .btn.secondary { background: #f1f5f9; color: #475569; }
    .btn.success { background: var(--green); color: white; }
    .btn.success:hover { background: #059669; }
    .btn.small { padding: 8px 14px; font-size: 12px; }
    
    /* ACTION BAR */
    .action-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .results-info { color: #64748b; font-size: 14px; }
    
    /* TABLE */
    .table-wrapper { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { padding: 16px; text-align: left; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; }
    .data-table td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    .data-table tr:hover { background: #f8fafc; }
    
    .thumb { width: 56px; height: 56px; object-fit: cover; border-radius: 10px; border: 1px solid #e2e8f0; }
    .product-name { max-width: 200px; }
    .product-name strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #1e293b; }
    .pending-badge { display: inline-block; background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 6px; font-size: 11px; margin-left: 8px; }
    .id-code { background: #f1f5f9; padding: 4px 8px; border-radius: 6px; font-size: 11px; color: #64748b; }
    .price { font-weight: 700; color: var(--green); }
    .center { text-align: center; }
    .stock { font-weight: 600; font-size: 13px; }
    .stock.in { color: var(--green); }
    .stock.out { color: var(--red); }
    .vendor-count { background: #f1f5f9; padding: 6px 12px; border-radius: 20px; font-weight: 600; font-size: 13px; }
    .buybox { color: var(--orange); font-weight: 600; }
    .no-buybox { color: #94a3b8; }
    .category-tag { background: #eff6ff; color: var(--blue); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .no-category { color: var(--red); font-size: 12px; }
    .free-cat-link { color: var(--orange); font-weight: 600; font-size: 12px; text-decoration: none; }
    
    .actions-cell { display: flex; gap: 6px; }
    .action-btn { width: 40px; height: 40px; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; transition: all 0.2s; }
    .action-btn.edit { background: #eff6ff; color: var(--blue); }
    .action-btn.edit:hover { background: var(--blue); color: white; }
    .action-btn.category { background: #fef3c7; color: #92400e; }
    .action-btn.category:hover { background: var(--orange); color: white; }
    .action-btn.offers { background: #d1fae5; color: #065f46; }
    .action-btn.offers:hover { background: var(--green); color: white; }
    .action-btn.disconnect { background: #fee2e2; color: #b91c1c; }
    .action-btn.disconnect:hover { background: var(--red); color: white; }
    
    .loading-cell, .empty-cell { text-align: center; padding: 60px 20px; color: #64748b; }
    .empty-icon { font-size: 56px; margin-bottom: 16px; }
    
    /* PAGINATION */
    .pagination { display: flex; gap: 8px; justify-content: center; padding: 24px; }
    .page-btn { padding: 10px 16px; border: 2px solid #e2e8f0; background: white; border-radius: 10px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .page-btn:hover:not(:disabled) { border-color: var(--blue); }
    .page-btn.active { background: var(--blue); color: white; border-color: var(--blue); }
    .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .page-dots { padding: 10px; color: #94a3b8; }
    
    /* MODALS */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15,23,42,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 99999; }
    .modal { background: white; border-radius: 20px; width: 90%; max-width: 520px; max-height: 85vh; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.25); }
    .modal-header { padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; }
    .modal-header h3 { margin: 0; font-size: 18px; color: #1e293b; }
    .close-btn { background: none; border: none; font-size: 28px; color: #94a3b8; cursor: pointer; line-height: 1; }
    .close-btn:hover { color: #1e293b; }
    .modal-body { padding: 24px; max-height: calc(85vh - 140px); overflow-y: auto; }
    .modal-footer { padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px; }
    
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 8px; }
    .form-group input, .form-group select { width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; }
    .form-group input:focus, .form-group select:focus { outline: none; border-color: var(--blue); }
    
    .product-preview { display: flex; align-items: center; gap: 16px; padding: 16px; background: #f8fafc; border-radius: 12px; margin-bottom: 20px; }
    .product-preview img { width: 60px; height: 60px; object-fit: cover; border-radius: 10px; }
    
    .master-list { max-height: 350px; overflow-y: auto; }
    .master-item { display: flex; align-items: center; gap: 14px; padding: 14px; border: 2px solid #e2e8f0; border-radius: 12px; margin-bottom: 10px; cursor: pointer; transition: all 0.2s; }
    .master-item:hover { border-color: var(--blue); background: #f8fafc; }
    .master-item img { width: 50px; height: 50px; object-fit: cover; border-radius: 8px; }
    .master-info { flex: 1; }
    .master-info strong { display: block; color: #1e293b; margin-bottom: 4px; }
    .master-info small { color: #64748b; font-size: 12px; }
    
    .search-loading { display: flex; align-items: center; gap: 12px; padding: 20px; color: #64748b; }
    .no-results { text-align: center; padding: 30px; color: #64748b; }
    
    .free-notice { text-align: center; padding: 30px; background: #fef3c7; border-radius: 12px; }
    .free-notice span { font-size: 40px; }
    .free-notice p { margin: 16px 0; color: #92400e; }
    
    @media (max-width: 1200px) { .stats-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px) { 
        .stats-grid { grid-template-columns: 1fr; } 
        .toolbar { flex-direction: column; }
        .search-box { flex-direction: column; }
        .action-bar { flex-direction: column; gap: 12px; }
        .free-banner { flex-direction: column; text-align: center; }
    }
</style>
