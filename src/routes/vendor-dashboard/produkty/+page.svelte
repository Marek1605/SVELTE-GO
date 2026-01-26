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
    
    $: if (browser && storesReady && !initialLoadDone) {
        initialLoadDone = true;
        loadStats();
        loadProducts();
    }
    
    async function loadStats() {
        const token = localStorage.getItem('vendor_token');
        if (!token) return;
        try {
            const res = await fetch(API_BASE + '/vendor/products/stats', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();
            if (data.success && data.data) {
                stats = {
                    total: data.data.total || 0,
                    paired: data.data.paired || 0,
                    unpaired: data.data.unpaired || 0,
                    withoutCategories: data.data.without_categories || 0,
                    pendingApprovals: data.data.pending_approvals || 0,
                    pairingRate: data.data.pairing_rate || 0
                };
            }
        } catch (e) {
            console.error('Stats error:', e);
        }
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
            }
        } catch (e) {
            console.error('Products error:', e);
        }
        loading = false;
    }
    
    async function searchMasterProducts() {
        if (masterSearchQuery.length < 2) return;
        searchingMaster = true;
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(API_BASE + '/vendor/masters/search?search=' + encodeURIComponent(masterSearchQuery), {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();
            masterResults = data.data || [];
        } catch (e) {
            console.error('Search error:', e);
        }
        searchingMaster = false;
    }
    
    async function connectToMaster(masterId) {
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(API_BASE + '/vendor/products/connect', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
                body: JSON.stringify({ master_id: masterId })
            });
            const data = await res.json();
            if (data.success) {
                showConnectModal = false;
                masterSearchQuery = '';
                masterResults = [];
                loadStats();
                loadProducts();
            } else {
                alert(data.error || 'Chyba');
            }
        } catch (e) {
            alert('Chyba pri pripájaní');
        }
    }
    
    function handleSearch() { currentPage = 1; loadProducts(); }
    function handleFilterChange(newFilter) { filter = newFilter; currentPage = 1; loadProducts(); }
    function handlePerPageChange() { currentPage = 1; loadProducts(); }
    function goToPage(page) { currentPage = page; loadProducts(); }
    
    function openConnectModal() {
        masterSearchQuery = '';
        masterResults = [];
        showConnectModal = true;
    }
    
    function openEditModal(product) {
        currentProduct = { ...product };
        showEditModal = true;
    }
    
    function openCategoryModal(product) {
        currentProduct = { ...product };
        showCategoryModal = true;
    }
    
    function formatNumber(num) {
        return (num || 0).toLocaleString('sk-SK');
    }
    
    function formatPrice(price) {
        return (price || 0).toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    }
    
    const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"%3E%3Crect fill="%23f3f4f6" width="50" height="50"/%3E%3Ctext fill="%239ca3af" font-size="8" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EIMG%3C/text%3E%3C/svg%3E';
</script>

{#if !storesReady}
    <div class="mkmp-loading-container">
        <div class="mkmp-spinner"></div>
        <p>Načítavam dáta...</p>
    </div>
{:else}
<div class="mkmp-page">
    
    {#if isFree}
    <div class="mkmp-free-banner">
        <div class="mkmp-free-banner-icon">🔓</div>
        <div class="mkmp-free-banner-content">
            <strong>FREE režim</strong> - Vaše produkty sú zobrazené iba vo fulltextovom vyhľadávaní. 
            Pre zobrazenie v kategóriách a "Kde kúpiť" tabuľke aktivujte platený režim.
        </div>
        <a href="/vendor-dashboard/ppc" class="mkmp-btn mkmp-btn-upgrade">⚡ Aktivovať PAID režim</a>
    </div>
    {/if}
    
    <div class="mkmp-stats-row">
        <button class="mkmp-stat-card" class:active={filter === 'all'} on:click={() => handleFilterChange('all')}>
            <span class="mkmp-stat-icon">📦</span>
            <div class="mkmp-stat-info">
                <span class="mkmp-stat-number">{formatNumber(stats.total)}</span>
                <span class="mkmp-stat-label">Celkom produktov</span>
            </div>
        </button>
        
        {#if isFree}
            <button class="mkmp-stat-card mkmp-stat-disabled" on:click={() => window.location.href = '/vendor-dashboard/ppc'}>
                <span class="mkmp-stat-icon">🔗</span>
                <div class="mkmp-stat-info">
                    <span class="mkmp-stat-number mkmp-text-muted">0</span>
                    <span class="mkmp-stat-label">Spárované</span>
                    <span class="mkmp-stat-upgrade">🔒 Aktivovať PAID</span>
                </div>
            </button>
            <button class="mkmp-stat-card mkmp-stat-disabled" on:click={() => window.location.href = '/vendor-dashboard/ppc'}>
                <span class="mkmp-stat-icon">⚠️</span>
                <div class="mkmp-stat-info">
                    <span class="mkmp-stat-number mkmp-text-muted">0</span>
                    <span class="mkmp-stat-label">Nespárované</span>
                    <span class="mkmp-stat-upgrade">🔒 Aktivovať PAID</span>
                </div>
            </button>
            <button class="mkmp-stat-card mkmp-stat-warning" on:click={() => window.location.href = '/vendor-dashboard/ppc'}>
                <span class="mkmp-stat-icon">📂</span>
                <div class="mkmp-stat-info">
                    <span class="mkmp-stat-number">{formatNumber(stats.total)}</span>
                    <span class="mkmp-stat-label">Bez kategórie</span>
                    <span class="mkmp-stat-upgrade">🔒 FREE režim</span>
                </div>
            </button>
            <button class="mkmp-stat-card mkmp-stat-disabled" on:click={() => window.location.href = '/vendor-dashboard/ppc'}>
                <span class="mkmp-stat-icon">⏳</span>
                <div class="mkmp-stat-info">
                    <span class="mkmp-stat-number mkmp-text-muted">0</span>
                    <span class="mkmp-stat-label">Na schválenie</span>
                    <span class="mkmp-stat-upgrade">🔒 Aktivovať PAID</span>
                </div>
            </button>
        {:else}
            <button class="mkmp-stat-card" class:active={filter === 'paired'} on:click={() => handleFilterChange('paired')}>
                <span class="mkmp-stat-icon">🔗</span>
                <div class="mkmp-stat-info">
                    <span class="mkmp-stat-number">{formatNumber(stats.paired)}</span>
                    <span class="mkmp-stat-label">Spárované</span>
                    <span class="mkmp-stat-percent">{stats.pairingRate}% spárovaných</span>
                </div>
            </button>
            <button class="mkmp-stat-card" class:active={filter === 'unpaired'} on:click={() => handleFilterChange('unpaired')}>
                <span class="mkmp-stat-icon">⚠️</span>
                <div class="mkmp-stat-info">
                    <span class="mkmp-stat-number">{formatNumber(stats.unpaired)}</span>
                    <span class="mkmp-stat-label">Nespárované</span>
                </div>
            </button>
            <button class="mkmp-stat-card" class:active={filter === 'no_category'} on:click={() => handleFilterChange('no_category')}>
                <span class="mkmp-stat-icon">📂</span>
                <div class="mkmp-stat-info">
                    <span class="mkmp-stat-number">{formatNumber(stats.withoutCategories)}</span>
                    <span class="mkmp-stat-label">Bez kategórie</span>
                </div>
            </button>
            <button class="mkmp-stat-card" class:active={filter === 'pending'} on:click={() => handleFilterChange('pending')}>
                <span class="mkmp-stat-icon">⏳</span>
                <div class="mkmp-stat-info">
                    <span class="mkmp-stat-number">{formatNumber(stats.pendingApprovals)}</span>
                    <span class="mkmp-stat-label">Na schválenie</span>
                </div>
            </button>
        {/if}
    </div>
    
    <div class="mkmp-toolbar">
        <div class="mkmp-search-group">
            <input type="text" class="mkmp-input" placeholder="🔍 Hľadať master produkt (názov, ID)..." bind:value={searchQuery} on:keypress={(e) => e.key === 'Enter' && handleSearch()}>
            <button class="mkmp-btn mkmp-btn-blue" on:click={handleSearch}>🔍 Hľadať</button>
            <button class="mkmp-btn mkmp-btn-gray" on:click={() => { loadStats(); loadProducts(); }}>🔄 Obnoviť</button>
        </div>
        <div class="mkmp-filter-group">
            <select class="mkmp-select" bind:value={filter} on:change={() => handleFilterChange(filter)}>
                <option value="all">Všetky master produkty</option>
                {#if !isFree}
                    <option value="with_category">Zaradené v kategorii</option>
                    <option value="no_category">Nezaradené produkty</option>
                    <option value="pending">Na schválenie</option>
                {/if}
            </select>
            <select class="mkmp-select" bind:value={perPage} on:change={handlePerPageChange}>
                <option value={5}>5 / strana</option>
                <option value={10}>10 / strana</option>
                <option value={25}>25 / strana</option>
                <option value={50}>50 / strana</option>
            </select>
        </div>
    </div>
    
    <div class="mkmp-connect-row">
        <button class="mkmp-btn mkmp-btn-green" on:click={openConnectModal}>➕ Pripojiť sa k master produktu</button>
    </div>
    
    <div class="mkmp-results-bar">
        <span>📊 Zobrazených {formatNumber(products.length)} z {formatNumber(totalResults)} produktov</span>
    </div>
    
    <div class="mkmp-table-box">
        <table class="mkmp-table">
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
                    <tr><td colspan="9" class="mkmp-loading"><div class="mkmp-spinner"></div> Načítavam produkty...</td></tr>
                {:else if products.length === 0}
                    <tr><td colspan="9" class="mkmp-empty"><div class="mkmp-empty-icon">📦</div><p>Zatiaľ nemáte žiadne produkty</p><small>Nahrajte XML feed alebo pridajte produkty manuálne</small></td></tr>
                {:else}
                    {#each products as product}
                        <tr>
                            <td>
                                <img src={product.master_image || product.image_url || placeholderImage} alt={product.title || product.name} class="mkmp-product-thumbnail" on:error={(e) => e.target.src = placeholderImage}>
                            </td>
                            <td class="mkmp-product-name">
                                <strong>{product.master_title || product.title || product.name || '-'}</strong>
                                {#if product.ean}<br><small class="mkmp-ean">EAN: {product.ean}</small>{/if}
                            </td>
                            <td><span class="mkmp-id-badge">{product.master_id || product.id || '-'}</span></td>
                            <td class="mkmp-price">{formatPrice(product.price)}</td>
                            <td>
                                {#if product.stock_status === 'instock'}
                                    <span class="mkmp-stock-instock">✓ Skladom</span>
                                {:else}
                                    <span class="mkmp-stock-outofstock">✗ Vypredané</span>
                                {/if}
                            </td>
                            <td class="mkmp-center">
                                <span class="mkmp-vendors-count">{product.vendors_count || 1}</span>
                            </td>
                            <td class="mkmp-center">
                                {#if product.is_buybox}
                                    <span class="mkmp-buybox-yes">🏆 Áno</span>
                                {:else}
                                    <span class="mkmp-buybox-no">-</span>
                                {/if}
                            </td>
                            <td>
                                {#if product.category}
                                    <button class="mkmp-category-badge" on:click={() => openCategoryModal(product)}>{product.category}</button>
                                {:else}
                                    <span class="mkmp-no-category">✗ Bez kategórie</span>
                                {/if}
                            </td>
                            <td class="mkmp-actions">
                                <button class="mkmp-action-btn mkmp-edit-btn" title="Upraviť" on:click={() => openEditModal(product)}>✏️</button>
                                <a href={product.affiliate_url || product.url || '#'} target="_blank" rel="noopener" class="mkmp-action-btn mkmp-view-btn" title="Zobraziť v obchode">👁️</a>
                            </td>
                        </tr>
                    {/each}
                {/if}
            </tbody>
        </table>
    </div>
    
    {#if totalPages > 1}
        <div class="mkmp-pagination">
            <button class="mkmp-page-btn" disabled={currentPage === 1} on:click={() => goToPage(currentPage - 1)}>←</button>
            {#each Array(Math.min(totalPages, 7)) as _, i}
                {@const pageNum = i + 1}
                <button class="mkmp-page-btn" class:mkmp-page-active={currentPage === pageNum} on:click={() => goToPage(pageNum)}>{pageNum}</button>
            {/each}
            {#if totalPages > 7}<span class="mkmp-page-dots">...</span>{/if}
            <button class="mkmp-page-btn" disabled={currentPage === totalPages} on:click={() => goToPage(currentPage + 1)}>→</button>
        </div>
    {/if}
</div>
{/if}

{#if showConnectModal}
    <div class="mkmp-modal">
        <div class="mkmp-modal-bg" on:click={() => showConnectModal = false} on:keydown={() => {}} role="button" tabindex="0"></div>
        <div class="mkmp-modal-box">
            <div class="mkmp-modal-head">
                <h3>➕ Pripojiť sa k master produktu</h3>
                <button class="mkmp-modal-close" on:click={() => showConnectModal = false}>&times;</button>
            </div>
            <div class="mkmp-modal-body">
                <div class="mkmp-form-group">
                    <label>Vyhľadajte master produkt</label>
                    <input type="text" class="mkmp-input mkmp-full-input" placeholder="Zadajte názov, EAN alebo ID produktu..." bind:value={masterSearchQuery} on:input={searchMasterProducts}>
                </div>
                {#if searchingMaster}
                    <div class="mkmp-loading-small"><div class="mkmp-spinner-small"></div> Hľadám...</div>
                {:else if masterResults.length > 0}
                    <div class="mkmp-master-results">
                        {#each masterResults as result}
                            <div class="mkmp-master-item" on:click={() => connectToMaster(result.id)} on:keydown={() => {}} role="button" tabindex="0">
                                <img src={result.image_url || placeholderImage} alt={result.title} class="mkmp-master-thumb">
                                <div class="mkmp-master-info">
                                    <h5>{result.title || result.name}</h5>
                                    <p>EAN: {result.ean || '-'} | ID: {result.id}</p>
                                </div>
                                <button class="mkmp-btn mkmp-btn-green mkmp-btn-sm">Pripojiť</button>
                            </div>
                        {/each}
                    </div>
                {:else if masterSearchQuery.length >= 2}
                    <p class="mkmp-no-results">Žiadne výsledky pre "{masterSearchQuery}"</p>
                {/if}
            </div>
        </div>
    </div>
{/if}

{#if showEditModal && currentProduct}
    <div class="mkmp-modal">
        <div class="mkmp-modal-bg" on:click={() => showEditModal = false} on:keydown={() => {}} role="button" tabindex="0"></div>
        <div class="mkmp-modal-box">
            <div class="mkmp-modal-head">
                <h3>📝 Upraviť ponuku</h3>
                <button class="mkmp-modal-close" on:click={() => showEditModal = false}>&times;</button>
            </div>
            <div class="mkmp-modal-body">
                <div class="mkmp-form-group">
                    <label>Názov produktu</label>
                    <input type="text" class="mkmp-input mkmp-full-input" bind:value={currentProduct.title}>
                </div>
                <div class="mkmp-form-group">
                    <label>Cena (€)</label>
                    <input type="number" step="0.01" class="mkmp-input mkmp-full-input" bind:value={currentProduct.price}>
                </div>
                <div class="mkmp-form-group">
                    <label>Stav skladu</label>
                    <select class="mkmp-select mkmp-full-input" bind:value={currentProduct.stock_status}>
                        <option value="instock">Skladom</option>
                        <option value="outofstock">Vypredané</option>
                    </select>
                </div>
                <div class="mkmp-modal-footer">
                    <button class="mkmp-btn mkmp-btn-gray" on:click={() => showEditModal = false}>Zrušiť</button>
                    <button class="mkmp-btn mkmp-btn-blue">Uložiť zmeny</button>
                </div>
            </div>
        </div>
    </div>
{/if}

{#if showCategoryModal && currentProduct}
    <div class="mkmp-modal">
        <div class="mkmp-modal-bg" on:click={() => showCategoryModal = false} on:keydown={() => {}} role="button" tabindex="0"></div>
        <div class="mkmp-modal-box">
            <div class="mkmp-modal-head">
                <h3>🏷️ Kategórie produktu</h3>
                <button class="mkmp-modal-close" on:click={() => showCategoryModal = false}>&times;</button>
            </div>
            <div class="mkmp-modal-body">
                <p><strong>{currentProduct.title || currentProduct.name}</strong></p>
                <p>Aktuálna kategória: <span class="mkmp-category-badge">{currentProduct.category || 'Bez kategórie'}</span></p>
            </div>
        </div>
    </div>
{/if}

<style>
    .mkmp-page { width: 100%; max-width: 100%; }
    .mkmp-loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; gap: 16px; }
    .mkmp-loading-container p { color: #6B7280; font-size: 14px; }
    .mkmp-spinner { width: 40px; height: 40px; border: 3px solid #E5E7EB; border-top-color: #3B82F6; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    .mkmp-free-banner { display: flex; align-items: center; gap: 16px; background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border: 2px solid #F59E0B; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px; }
    .mkmp-free-banner-icon { font-size: 32px; flex-shrink: 0; }
    .mkmp-free-banner-content { flex: 1; color: #92400E; font-size: 14px; }
    .mkmp-btn-upgrade { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: #fff; padding: 12px 24px; font-weight: 700; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4); }
    
    .mkmp-stats-row { display: flex; gap: 12px; margin-bottom: 20px; }
    .mkmp-stat-card { flex: 1; display: flex; align-items: center; gap: 12px; padding: 16px; background: #fff; border: 1px solid #E5E7EB; border-radius: 10px; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .mkmp-stat-card:hover { border-color: #3B82F6; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15); }
    .mkmp-stat-card.active { border-color: #3B82F6; background: #EFF6FF; }
    .mkmp-stat-card.mkmp-stat-disabled { background: #F9FAFB; opacity: 0.8; }
    .mkmp-stat-card.mkmp-stat-warning { background: #FFFBEB; border-color: #FCD34D; }
    .mkmp-stat-icon { font-size: 32px; }
    .mkmp-stat-info { display: flex; flex-direction: column; }
    .mkmp-stat-number { font-size: 24px; font-weight: 700; color: #1F2937; }
    .mkmp-stat-number.mkmp-text-muted { color: #9CA3AF; }
    .mkmp-stat-label { font-size: 12px; color: #6B7280; }
    .mkmp-stat-percent { font-size: 11px; color: #10B981; font-weight: 600; }
    .mkmp-stat-upgrade { font-size: 10px; color: #F59E0B; font-weight: 600; background: #FEF3C7; padding: 2px 6px; border-radius: 4px; margin-top: 4px; }
    
    .mkmp-toolbar { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
    .mkmp-search-group { display: flex; gap: 8px; flex: 1; min-width: 300px; }
    .mkmp-filter-group { display: flex; gap: 8px; }
    .mkmp-input { padding: 10px 14px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 14px; flex: 1; }
    .mkmp-input:focus { outline: none; border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
    .mkmp-select { padding: 10px 14px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 14px; background: #fff; cursor: pointer; }
    
    .mkmp-btn { padding: 10px 16px; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .mkmp-btn-blue { background: #3B82F6; color: #fff; }
    .mkmp-btn-blue:hover { background: #2563EB; }
    .mkmp-btn-gray { background: #F3F4F6; color: #374151; }
    .mkmp-btn-gray:hover { background: #E5E7EB; }
    .mkmp-btn-green { background: #10B981; color: #fff; }
    .mkmp-btn-green:hover { background: #059669; }
    .mkmp-btn-sm { padding: 6px 12px; font-size: 12px; }
    
    .mkmp-connect-row { margin-bottom: 16px; }
    .mkmp-results-bar { padding: 12px 16px; background: #F9FAFB; border-radius: 8px; margin-bottom: 16px; font-size: 14px; color: #6B7280; }
    
    .mkmp-table-box { background: #fff; border-radius: 12px; border: 1px solid #E5E7EB; overflow: hidden; }
    .mkmp-table { width: 100%; border-collapse: collapse; }
    .mkmp-table thead { background: #F9FAFB; }
    .mkmp-table th { padding: 14px 12px; text-align: left; font-size: 11px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #E5E7EB; }
    .mkmp-table td { padding: 12px; border-bottom: 1px solid #E5E7EB; font-size: 13px; color: #1F2937; vertical-align: middle; }
    .mkmp-table tbody tr:hover { background: #F9FAFB; }
    
    .mkmp-product-thumbnail { width: 50px; height: 50px; object-fit: cover; border-radius: 8px; border: 1px solid #E5E7EB; }
    .mkmp-product-name { max-width: 250px; }
    .mkmp-product-name strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .mkmp-ean { color: #9CA3AF; font-size: 11px; }
    .mkmp-id-badge { background: #EFF6FF; color: #3B82F6; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .mkmp-price { font-weight: 600; color: #059669; }
    .mkmp-center { text-align: center; }
    .mkmp-vendors-count { background: #F3F4F6; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .mkmp-buybox-yes { color: #F59E0B; font-weight: 600; }
    .mkmp-buybox-no { color: #9CA3AF; }
    .mkmp-stock-instock { color: #10B981; font-weight: 500; }
    .mkmp-stock-outofstock { color: #EF4444; font-weight: 500; }
    .mkmp-category-badge { display: inline-block; padding: 4px 10px; background: #EFF6FF; color: #3B82F6; border-radius: 20px; font-size: 11px; font-weight: 500; border: none; cursor: pointer; }
    .mkmp-category-badge:hover { background: #DBEAFE; }
    .mkmp-no-category { color: #EF4444; font-size: 12px; }
    
    .mkmp-actions { display: flex; gap: 6px; }
    .mkmp-action-btn { width: 32px; height: 32px; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; text-decoration: none; }
    .mkmp-edit-btn { background: #EFF6FF; color: #3B82F6; }
    .mkmp-edit-btn:hover { background: #3B82F6; color: white; }
    .mkmp-view-btn { background: #F0FDF4; color: #10B981; }
    .mkmp-view-btn:hover { background: #10B981; color: white; }
    
    .mkmp-loading, .mkmp-empty { text-align: center; padding: 60px 20px; color: #6B7280; }
    .mkmp-empty-icon { font-size: 48px; margin-bottom: 16px; }
    
    .mkmp-pagination { display: flex; gap: 6px; justify-content: center; padding: 16px; }
    .mkmp-page-btn { padding: 8px 14px; border: 1px solid #E5E7EB; background: #fff; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; }
    .mkmp-page-btn:hover:not(:disabled) { background: #F9FAFB; border-color: #3B82F6; }
    .mkmp-page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .mkmp-page-active { background: #3B82F6 !important; color: #fff !important; border-color: #3B82F6 !important; }
    .mkmp-page-dots { padding: 8px; color: #6B7280; }
    
    .mkmp-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 999999; }
    .mkmp-modal-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); }
    .mkmp-modal-box { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff; border-radius: 12px; width: 90%; max-width: 600px; max-height: 80vh; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.3); }
    .mkmp-modal-head { padding: 16px 20px; border-bottom: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: center; background: #F9FAFB; }
    .mkmp-modal-head h3 { margin: 0; font-size: 16px; color: #1F2937; }
    .mkmp-modal-close { background: none; border: none; font-size: 24px; color: #6B7280; cursor: pointer; }
    .mkmp-modal-body { padding: 20px; max-height: calc(80vh - 60px); overflow-y: auto; }
    .mkmp-modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #E5E7EB; }
    .mkmp-form-group { margin-bottom: 16px; }
    .mkmp-form-group label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
    .mkmp-full-input { width: 100%; }
    
    .mkmp-master-results { max-height: 350px; overflow-y: auto; }
    .mkmp-master-item { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid #E5E7EB; border-radius: 8px; margin-bottom: 8px; cursor: pointer; transition: all 0.2s; }
    .mkmp-master-item:hover { background: #F9FAFB; border-color: #3B82F6; }
    .mkmp-master-thumb { width: 50px; height: 50px; object-fit: cover; border-radius: 6px; }
    .mkmp-master-info { flex: 1; }
    .mkmp-master-info h5 { margin: 0 0 4px; font-size: 14px; color: #1F2937; }
    .mkmp-master-info p { margin: 0; font-size: 12px; color: #6B7280; }
    .mkmp-loading-small { display: flex; align-items: center; gap: 8px; color: #6B7280; padding: 16px 0; }
    .mkmp-spinner-small { width: 20px; height: 20px; border: 3px solid #E5E7EB; border-top-color: #3B82F6; border-radius: 50%; animation: spin 0.8s linear infinite; }
    .mkmp-no-results { color: #6B7280; text-align: center; padding: 20px; }
    
    @media (max-width: 1100px) { .mkmp-stats-row { flex-wrap: wrap; } .mkmp-stat-card { flex: 1 1 calc(33.333% - 12px); min-width: 150px; } }
    @media (max-width: 768px) { .mkmp-stat-card { flex: 1 1 calc(50% - 12px); } .mkmp-toolbar { flex-direction: column; } .mkmp-search-group, .mkmp-filter-group { width: 100%; } .mkmp-free-banner { flex-direction: column; text-align: center; } }
    @media (max-width: 500px) { .mkmp-stat-card { flex: 1 1 100%; } }
</style>
