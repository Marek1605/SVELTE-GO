<script>
    import { getContext, onMount } from 'svelte';
    import { browser } from '$app/environment';
    
    const vendorStore = getContext('vendor');
    const shopStore = getContext('shop');
    const API_BASE = getContext('API_BASE');
    
    $: vendor = $vendorStore;
    $: shop = $shopStore;
    $: isFree = shop?.display_mode !== 'cpc';
    
    // Wait for stores to be ready
    $: storesReady = vendor !== null && shop !== null;
    
    // Stav
    let loading = true;
    let initialLoadDone = false;
    let products = [];
    let stats = {
        total: 0,
        paired: 0,
        unpaired: 0,
        withoutCategories: 0,
        pendingApprovals: 0,
        pairingRate: 0
    };
    
    // Filtre a pagination
    let searchQuery = '';
    let filter = 'all';
    let perPage = 10;
    let currentPage = 1;
    let totalPages = 1;
    let totalResults = 0;
    
    // Modaly
    let showEditModal = false;
    let showConnectModal = false;
    let showCategoryModal = false;
    let currentProduct = null;
    let masterSearchQuery = '';
    let masterResults = [];
    let searchingMaster = false;
    
    // Load products when stores become ready
    $: if (browser && storesReady && !initialLoadDone) {
        initialLoadDone = true;
        loadProducts();
    }
    
    onMount(async () => {
        // Initial load is now handled reactively above
    });
    
    async function loadProducts() {
        loading = true;
        const token = localStorage.getItem('vendor_token');
        if (!token) {
            loading = false;
            return;
        }
        
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                per_page: perPage.toString(),
                filter: filter,
                search: searchQuery
            });
            
            const res = await fetch(`${API_BASE}/vendor/products?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (data.success) {
                // API vracia data.data ako pole a data.meta pre pagination
                products = data.data || [];
                totalResults = data.meta?.total || 0;
                totalPages = data.meta?.pages || Math.ceil(totalResults / perPage);
                
                // Vypočítaj štatistiky z produktov
                stats = {
                    total: totalResults,
                    paired: products.filter(p => p.product_id).length,
                    unpaired: products.filter(p => !p.product_id).length,
                    withoutCategories: products.filter(p => !p.category).length,
                    pendingApprovals: 0,
                    pairingRate: totalResults > 0 ? Math.round((products.filter(p => p.product_id).length / products.length) * 100) : 0
                };
            }
        } catch (e) {
            console.error('Error loading products:', e);
        }
        loading = false;
    }
    
    async function searchMasterProducts() {
        if (masterSearchQuery.length < 2) return;
        searchingMaster = true;
        
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(`${API_BASE}/products/search?q=${encodeURIComponent(masterSearchQuery)}&limit=20`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            masterResults = data.data?.products || data.data || [];
        } catch (e) {
            console.error('Error searching products:', e);
        }
        searchingMaster = false;
    }
    
    function handleSearch() {
        currentPage = 1;
        loadProducts();
    }
    
    function handleFilterChange(newFilter) {
        filter = newFilter;
        currentPage = 1;
        loadProducts();
    }
    
    function handlePerPageChange() {
        currentPage = 1;
        loadProducts();
    }
    
    function goToPage(page) {
        currentPage = page;
        loadProducts();
    }
    
    function openConnectModal() {
        masterSearchQuery = '';
        masterResults = [];
        showConnectModal = true;
    }
    
    function formatNumber(num, decimals = 0) {
        return (num || 0).toLocaleString('sk-SK', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }
    
    function formatPrice(price) {
        return (price || 0).toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    }
    
    // Placeholder image
    const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"%3E%3Crect fill="%23f3f4f6" width="50" height="50"/%3E%3Ctext fill="%239ca3af" font-size="8" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EIMG%3C/text%3E%3C/svg%3E';
</script>

{#if !storesReady}
    <div class="mkmp-loading-container">
        <div class="mkmp-spinner"></div>
        <p>Načítavam dáta...</p>
    </div>
{:else}
<div class="mkmp-page">
    <!-- FREE REŽIM BANNER -->
    {#if isFree}
        <div class="mkmp-free-banner">
            <div class="mkmp-free-banner-icon">🔓</div>
            <div class="mkmp-free-banner-content">
                <strong>FREE režim</strong> - Vaše produkty sú zobrazené iba vo fulltextovom vyhľadávaní. 
                Pre zobrazenie v kategóriách a "Kde kúpiť" tabuľke aktivujte platený režim.
            </div>
            <a href="/vendor-dashboard/ppc" class="mkmp-btn mkmp-btn-upgrade">
                ⚡ Aktivovať PAID režim
            </a>
        </div>
    {/if}
    
    <!-- 5 BIELYCH KARIET -->
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
    
    <!-- TOOLBAR -->
    <div class="mkmp-toolbar">
        <div class="mkmp-search-group">
            <input 
                type="text" 
                class="mkmp-input" 
                placeholder="🔍 Hľadať produkt (názov, EAN)..."
                bind:value={searchQuery}
                on:keypress={(e) => e.key === 'Enter' && handleSearch()}
            >
            <button class="mkmp-btn mkmp-btn-blue" on:click={handleSearch}>🔍 Hľadať</button>
            <button class="mkmp-btn mkmp-btn-gray" on:click={loadProducts}>🔄 Obnoviť</button>
        </div>
        
        <div class="mkmp-filter-group">
            <select class="mkmp-select" bind:value={filter} on:change={() => handleFilterChange(filter)}>
                <option value="all">Všetky produkty</option>
                {#if !isFree}
                    <option value="paired">Spárované</option>
                    <option value="unpaired">Nespárované</option>
                    <option value="no_category">Bez kategórie</option>
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
    
    <!-- CONNECT BUTTON -->
    <div class="mkmp-connect-row">
        <button class="mkmp-btn mkmp-btn-green" on:click={openConnectModal}>
            ➕ Pripojiť sa k master produktu
        </button>
    </div>
    
    <!-- RESULTS INFO -->
    <div class="mkmp-results-bar">
        <span>📊 Zobrazených {formatNumber(products.length)} z {formatNumber(totalResults)} produktov</span>
    </div>
    
    <!-- PRODUCTS TABLE -->
    <div class="mkmp-table-box">
        <table class="mkmp-table">
            <thead>
                <tr>
                    <th>IMG</th>
                    <th>PRODUKT</th>
                    <th>EAN</th>
                    <th>CENA</th>
                    <th>STAV</th>
                    <th>KATEGÓRIA</th>
                    <th>AKCIE</th>
                </tr>
            </thead>
            <tbody>
                {#if loading}
                    <tr>
                        <td colspan="7" class="mkmp-loading">
                            <div class="mkmp-spinner"></div>
                            Načítavam produkty...
                        </td>
                    </tr>
                {:else if products.length === 0}
                    <tr>
                        <td colspan="7" class="mkmp-empty">
                            <div class="mkmp-empty-icon">📦</div>
                            <p>Zatiaľ nemáte žiadne produkty</p>
                            <small>Nahrajte XML feed alebo pridajte produkty manuálne</small>
                        </td>
                    </tr>
                {:else}
                    {#each products as product}
                        <tr>
                            <td>
                                <img 
                                    src={product.master_image || product.image_url || placeholderImage} 
                                    alt={product.title || product.master_title || product.name} 
                                    class="mkmp-product-thumbnail"
                                    on:error={(e) => e.target.src = placeholderImage}
                                >
                            </td>
                            <td class="mkmp-product-name">
                                <strong>{product.title || product.master_title || product.name || '-'}</strong>
                            </td>
                            <td>{product.external_id || product.ean || '-'}</td>
                            <td>{formatPrice(product.price)}</td>
                            <td>
                                {#if product.stock_status === 'instock'}
                                    <span class="mkmp-stock-instock">✓ Skladom</span>
                                {:else}
                                    <span class="mkmp-stock-outofstock">✗ Vypredané</span>
                                {/if}
                            </td>
                            <td>
                                {#if product.category}
                                    <span class="mkmp-category-badge">{product.category}</span>
                                {:else}
                                    <span class="mkmp-no-category">✗ Bez kategórie</span>
                                {/if}
                            </td>
                            <td class="mkmp-actions">
                                <button class="mkmp-action-btn mkmp-edit-btn" title="Upraviť">
                                    ✏️
                                </button>
                                <a href={product.affiliate_url || product.url || '#'} target="_blank" rel="noopener" class="mkmp-action-btn mkmp-view-btn" title="Zobraziť v obchode">
                                    👁️
                                </a>
                            </td>
                        </tr>
                    {/each}
                {/if}
            </tbody>
        </table>
    </div>
    
    <!-- PAGINATION -->
    {#if totalPages > 1}
        <div class="mkmp-pagination">
            <button 
                class="mkmp-page-btn" 
                disabled={currentPage === 1}
                on:click={() => goToPage(currentPage - 1)}
            >
                ←
            </button>
            
            {#each Array(Math.min(totalPages, 7)) as _, i}
                {@const pageNum = i + 1}
                <button 
                    class="mkmp-page-btn" 
                    class:mkmp-page-active={currentPage === pageNum}
                    on:click={() => goToPage(pageNum)}
                >
                    {pageNum}
                </button>
            {/each}
            
            <button 
                class="mkmp-page-btn" 
                disabled={currentPage === totalPages}
                on:click={() => goToPage(currentPage + 1)}
            >
                →
            </button>
        </div>
    {/if}
</div>
{/if}

<!-- CONNECT MODAL -->
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
                    <input 
                        type="text" 
                        class="mkmp-input mkmp-full-input"
                        placeholder="Zadajte názov, EAN alebo ID produktu..."
                        bind:value={masterSearchQuery}
                        on:input={searchMasterProducts}
                    >
                </div>
                
                {#if searchingMaster}
                    <div class="mkmp-loading-small">
                        <div class="mkmp-spinner-small"></div>
                        Hľadám...
                    </div>
                {:else if masterResults.length > 0}
                    <div class="mkmp-master-results">
                        {#each masterResults as result}
                            <div class="mkmp-master-item">
                                <h5>{result.title || result.name}</h5>
                                <p>EAN: {result.external_id || result.ean || '-'} | ID: {result.id}</p>
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

<style>
    .mkmp-page { width: 100%; max-width: 100%; }
    
    .mkmp-loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 300px;
        gap: 16px;
    }
    .mkmp-loading-container p {
        color: #6B7280;
        font-size: 14px;
    }
    .mkmp-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #E5E7EB;
        border-top-color: #3B82F6;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .mkmp-free-banner {
        display: flex; align-items: center; gap: 16px;
        background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
        border: 2px solid #F59E0B; border-radius: 12px;
        padding: 16px 20px; margin-bottom: 20px;
    }
    .mkmp-free-banner-icon { font-size: 32px; flex-shrink: 0; }
    .mkmp-free-banner-content { flex: 1; color: #92400E; font-size: 14px; }
    
    .mkmp-stats-row { display: flex; gap: 16px; margin-bottom: 20px; }
    .mkmp-stat-card {
        flex: 1; display: flex; align-items: center; gap: 12px;
        padding: 16px; background: #fff; border: 2px solid #E5E7EB;
        border-radius: 12px; cursor: pointer; transition: all 0.2s;
    }
    .mkmp-stat-card:hover { border-color: #3B82F6; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15); }
    .mkmp-stat-card.active { border-color: #3B82F6; background: #EFF6FF; }
    .mkmp-stat-card.mkmp-stat-disabled { opacity: 0.7; }
    .mkmp-stat-card.mkmp-stat-warning { border-color: #F59E0B; background: #FFFBEB; }
    .mkmp-stat-icon { font-size: 28px; }
    .mkmp-stat-info { display: flex; flex-direction: column; }
    .mkmp-stat-number { font-size: 24px; font-weight: 700; color: #1F2937; }
    .mkmp-stat-number.mkmp-text-muted { color: #9CA3AF; }
    .mkmp-stat-label { font-size: 13px; color: #6B7280; }
    .mkmp-stat-percent { font-size: 11px; color: #10B981; font-weight: 600; }
    .mkmp-stat-upgrade { font-size: 11px; color: #F59E0B; font-weight: 600; }
    
    .mkmp-toolbar { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
    .mkmp-search-group { display: flex; gap: 8px; flex: 1; min-width: 300px; }
    .mkmp-filter-group { display: flex; gap: 8px; }
    .mkmp-input { padding: 10px 14px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 14px; flex: 1; }
    .mkmp-input:focus { outline: none; border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
    .mkmp-select { padding: 10px 14px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 14px; background: #fff; cursor: pointer; }
    
    .mkmp-btn { padding: 10px 16px; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
    .mkmp-btn-blue { background: #3B82F6; color: #fff; }
    .mkmp-btn-blue:hover { background: #2563EB; }
    .mkmp-btn-gray { background: #F3F4F6; color: #374151; }
    .mkmp-btn-gray:hover { background: #E5E7EB; }
    .mkmp-btn-green { background: #10B981; color: #fff; }
    .mkmp-btn-green:hover { background: #059669; }
    .mkmp-btn-upgrade { background: #F59E0B; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; }
    .mkmp-btn-upgrade:hover { background: #D97706; }
    
    .mkmp-connect-row { margin-bottom: 16px; }
    .mkmp-results-bar { padding: 12px 16px; background: #F9FAFB; border-radius: 8px; margin-bottom: 16px; font-size: 14px; color: #6B7280; }
    
    .mkmp-table-box { background: #fff; border-radius: 12px; border: 1px solid #E5E7EB; overflow: hidden; }
    .mkmp-table { width: 100%; border-collapse: collapse; }
    .mkmp-table thead { background: #F9FAFB; }
    .mkmp-table th { padding: 14px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #E5E7EB; }
    .mkmp-table td { padding: 14px 16px; border-bottom: 1px solid #E5E7EB; font-size: 14px; color: #1F2937; vertical-align: middle; }
    .mkmp-table tbody tr:hover { background: #F9FAFB; }
    
    .mkmp-product-thumbnail { width: 50px; height: 50px; object-fit: cover; border-radius: 8px; border: 1px solid #E5E7EB; }
    .mkmp-product-name { max-width: 300px; }
    .mkmp-product-name strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .mkmp-stock-instock { color: #10B981; font-weight: 500; }
    .mkmp-stock-outofstock { color: #EF4444; font-weight: 500; }
    .mkmp-category-badge { display: inline-block; padding: 4px 10px; background: #EFF6FF; color: #3B82F6; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .mkmp-no-category { color: #EF4444; font-size: 13px; }
    
    .mkmp-actions { display: flex; gap: 6px; }
    .mkmp-action-btn { width: 32px; height: 32px; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; text-decoration: none; }
    .mkmp-edit-btn { background: #EFF6FF; color: #3B82F6; }
    .mkmp-edit-btn:hover { background: #3B82F6; color: white; }
    .mkmp-view-btn { background: #F0FDF4; color: #10B981; }
    .mkmp-view-btn:hover { background: #10B981; color: white; }
    
    .mkmp-loading, .mkmp-empty { text-align: center; padding: 60px 20px; color: #6B7280; }
    .mkmp-empty-icon { font-size: 48px; margin-bottom: 16px; }
    .mkmp-spinner { display: inline-block; width: 36px; height: 36px; border: 4px solid #E5E7EB; border-top-color: #3B82F6; border-radius: 50%; animation: mkmp-spin 0.8s linear infinite; margin-bottom: 12px; }
    @keyframes mkmp-spin { to { transform: rotate(360deg); } }
    
    .mkmp-pagination { display: flex; gap: 6px; justify-content: center; padding: 16px; }
    .mkmp-page-btn { padding: 8px 14px; border: 1px solid #E5E7EB; background: #fff; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s; }
    .mkmp-page-btn:hover:not(:disabled) { background: #F9FAFB; border-color: #3B82F6; }
    .mkmp-page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .mkmp-page-active { background: #3B82F6 !important; color: #fff !important; border-color: #3B82F6 !important; }
    
    .mkmp-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 999999; }
    .mkmp-modal-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); }
    .mkmp-modal-box { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff; border-radius: 12px; width: 90%; max-width: 600px; max-height: 80vh; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.3); }
    .mkmp-modal-head { padding: 16px 20px; border-bottom: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: center; background: #F9FAFB; }
    .mkmp-modal-head h3 { margin: 0; font-size: 16px; color: #1F2937; }
    .mkmp-modal-close { background: none; border: none; font-size: 24px; color: #6B7280; cursor: pointer; line-height: 1; }
    .mkmp-modal-close:hover { color: #1F2937; }
    .mkmp-modal-body { padding: 20px; max-height: calc(80vh - 60px); overflow-y: auto; }
    .mkmp-form-group { margin-bottom: 14px; }
    .mkmp-form-group label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
    .mkmp-full-input { width: 100%; }
    .mkmp-master-results { max-height: 300px; overflow-y: auto; }
    .mkmp-master-item { padding: 12px; border: 1px solid #E5E7EB; border-radius: 8px; margin-bottom: 8px; cursor: pointer; transition: all 0.2s; }
    .mkmp-master-item:hover { background: #F9FAFB; border-color: #3B82F6; }
    .mkmp-master-item h5 { margin: 0 0 4px; font-size: 14px; color: #1F2937; }
    .mkmp-master-item p { margin: 0; font-size: 12px; color: #6B7280; }
    .mkmp-loading-small { display: flex; align-items: center; gap: 8px; color: #6B7280; padding: 16px 0; }
    .mkmp-spinner-small { width: 20px; height: 20px; border: 3px solid #E5E7EB; border-top-color: #3B82F6; border-radius: 50%; animation: mkmp-spin 0.8s linear infinite; }
    .mkmp-no-results { color: #6B7280; text-align: center; padding: 20px; }
    
    @media (max-width: 1100px) { .mkmp-stats-row { flex-wrap: wrap; } .mkmp-stat-card { flex: 1 1 calc(33.333% - 12px); min-width: 150px; } }
    @media (max-width: 768px) { .mkmp-stat-card { flex: 1 1 calc(50% - 12px); } .mkmp-toolbar { flex-direction: column; } .mkmp-search-group, .mkmp-filter-group { width: 100%; } .mkmp-free-banner { flex-direction: column; text-align: center; } }
    @media (max-width: 500px) { .mkmp-stat-card { flex: 1 1 100%; } }
</style>
