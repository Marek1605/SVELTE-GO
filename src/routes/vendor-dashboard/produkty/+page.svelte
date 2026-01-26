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
                
                if (stats.total === 0 && totalResults > 0) {
                    stats.total = totalResults;
                }
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
            const res = await fetch(API_BASE + '/products/search?q=' + encodeURIComponent(masterSearchQuery) + '&limit=20', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();
            masterResults = data.data?.products || data.data || [];
        } catch (e) {
            console.error('Search error:', e);
        }
        searchingMaster = false;
    }
    
    function handleSearch() { currentPage = 1; loadProducts(); }
    function handleFilterChange(newFilter) { filter = newFilter; currentPage = 1; loadProducts(); }
    function handlePerPageChange() { currentPage = 1; loadProducts(); }
    function goToPage(page) { currentPage = page; loadProducts(); }
    function openConnectModal() { masterSearchQuery = ''; masterResults = []; showConnectModal = true; }
    function openEditModal(product) { currentProduct = { ...product }; showEditModal = true; }
    
    function formatNumber(num) { return (num || 0).toLocaleString('sk-SK'); }
    function formatPrice(price) { return (price || 0).toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'; }
    
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
        <a href="/vendor-dashboard/ppc" class="mkmp-btn-upgrade">⚡ Aktivovať PAID režim</a>
    </div>
    {/if}
    
    <!-- 5 STAT KARIET -->
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
    
    <!-- CONNECT BUTTON -->
    <div class="mkmp-connect-row">
        <button class="mkmp-btn mkmp-btn-green" on:click={openConnectModal}>➕ Pripojiť sa k master produktu</button>
    </div>
    
    <!-- RESULTS INFO -->
    <div class="mkmp-results-bar">
        📊 Zobrazených {formatNumber(products.length)} z {formatNumber(totalResults)} produktov
    </div>
    
    <!-- TABLE -->
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
                    <tr><td colspan="9" class="mkmp-loading"><div class="mkmp-spinner"></div> Načítavam...</td></tr>
                {:else if products.length === 0}
                    <tr><td colspan="9" class="mkmp-empty"><div class="mkmp-empty-icon">📦</div><p>Žiadne produkty</p></td></tr>
                {:else}
                    {#each products as product}
                        <tr>
                            <td><img src={product.image_url || product.master_image || placeholderImage} alt="" class="mkmp-thumb" on:error={(e) => e.target.src = placeholderImage}></td>
                            <td class="mkmp-name"><strong>{product.title || product.master_title || product.name || '-'}</strong></td>
                            <td><span class="mkmp-id">{product.id || '-'}</span></td>
                            <td class="mkmp-price">{formatPrice(product.price)}</td>
                            <td>{#if product.stock_status === 'instock'}<span class="mkmp-instock">✓ Skladom</span>{:else}<span class="mkmp-outstock">✗ Vypredané</span>{/if}</td>
                            <td class="mkmp-center">{product.vendors_count || 1}</td>
                            <td class="mkmp-center">{#if product.is_buybox}<span class="mkmp-buybox">🏆</span>{:else}-{/if}</td>
                            <td>{#if product.category}<span class="mkmp-cat">{product.category}</span>{:else}<span class="mkmp-nocat">✗ Bez kategórie</span>{/if}</td>
                            <td class="mkmp-actions">
                                <button class="mkmp-act-btn mkmp-edit" on:click={() => openEditModal(product)}>✏️</button>
                                <a href={product.affiliate_url || product.url || '#'} target="_blank" class="mkmp-act-btn mkmp-view">👁️</a>
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
            <button class="mkmp-pg-btn" disabled={currentPage === 1} on:click={() => goToPage(currentPage - 1)}>←</button>
            {#each Array(Math.min(totalPages, 7)) as _, i}
                <button class="mkmp-pg-btn" class:active={currentPage === i + 1} on:click={() => goToPage(i + 1)}>{i + 1}</button>
            {/each}
            <button class="mkmp-pg-btn" disabled={currentPage === totalPages} on:click={() => goToPage(currentPage + 1)}>→</button>
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
                <input type="text" class="mkmp-input mkmp-full" placeholder="Zadajte názov, EAN alebo ID..." bind:value={masterSearchQuery} on:input={searchMasterProducts}>
                {#if searchingMaster}
                    <p class="mkmp-searching">Hľadám...</p>
                {:else if masterResults.length > 0}
                    <div class="mkmp-results">
                        {#each masterResults as result}
                            <div class="mkmp-result-item">
                                <img src={result.image_url || placeholderImage} alt="">
                                <div><strong>{result.title || result.name}</strong><br><small>ID: {result.id}</small></div>
                                <button class="mkmp-btn mkmp-btn-green mkmp-btn-sm">Pripojiť</button>
                            </div>
                        {/each}
                    </div>
                {:else if masterSearchQuery.length >= 2}
                    <p class="mkmp-noresults">Žiadne výsledky</p>
                {/if}
            </div>
        </div>
    </div>
{/if}

<!-- EDIT MODAL -->
{#if showEditModal && currentProduct}
    <div class="mkmp-modal">
        <div class="mkmp-modal-bg" on:click={() => showEditModal = false} on:keydown={() => {}} role="button" tabindex="0"></div>
        <div class="mkmp-modal-box">
            <div class="mkmp-modal-head">
                <h3>📝 Upraviť ponuku</h3>
                <button class="mkmp-modal-close" on:click={() => showEditModal = false}>&times;</button>
            </div>
            <div class="mkmp-modal-body">
                <div class="mkmp-form-group"><label>Názov</label><input type="text" class="mkmp-input mkmp-full" bind:value={currentProduct.title}></div>
                <div class="mkmp-form-group"><label>Cena (€)</label><input type="number" step="0.01" class="mkmp-input mkmp-full" bind:value={currentProduct.price}></div>
                <div class="mkmp-form-group"><label>Stav</label>
                    <select class="mkmp-select mkmp-full" bind:value={currentProduct.stock_status}>
                        <option value="instock">Skladom</option>
                        <option value="outofstock">Vypredané</option>
                    </select>
                </div>
                <div class="mkmp-modal-foot">
                    <button class="mkmp-btn mkmp-btn-gray" on:click={() => showEditModal = false}>Zrušiť</button>
                    <button class="mkmp-btn mkmp-btn-blue">Uložiť</button>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    .mkmp-page { width: 100%; }
    .mkmp-loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; gap: 16px; }
    .mkmp-spinner { width: 40px; height: 40px; border: 3px solid #E5E7EB; border-top-color: #3B82F6; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    .mkmp-free-banner { display: flex; align-items: center; gap: 16px; background: linear-gradient(135deg, #FEF3C7, #FDE68A); border: 2px solid #F59E0B; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px; }
    .mkmp-free-banner-icon { font-size: 32px; }
    .mkmp-free-banner-content { flex: 1; color: #92400E; font-size: 14px; }
    .mkmp-btn-upgrade { background: linear-gradient(135deg, #F59E0B, #D97706); color: #fff; padding: 12px 24px; font-weight: 700; border-radius: 8px; text-decoration: none; }
    
    .mkmp-stats-row { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .mkmp-stat-card { flex: 1; min-width: 150px; display: flex; align-items: center; gap: 12px; padding: 16px; background: #fff; border: 2px solid #E5E7EB; border-radius: 12px; cursor: pointer; transition: all 0.2s; }
    .mkmp-stat-card:hover { border-color: #3B82F6; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59,130,246,0.15); }
    .mkmp-stat-card.active { border-color: #3B82F6; background: #EFF6FF; }
    .mkmp-stat-card.mkmp-stat-disabled { background: #F9FAFB; opacity: 0.8; }
    .mkmp-stat-card.mkmp-stat-warning { background: #FFFBEB; border-color: #FCD34D; }
    .mkmp-stat-icon { font-size: 28px; }
    .mkmp-stat-info { display: flex; flex-direction: column; }
    .mkmp-stat-number { font-size: 22px; font-weight: 700; color: #1F2937; }
    .mkmp-stat-number.mkmp-text-muted { color: #9CA3AF; }
    .mkmp-stat-label { font-size: 12px; color: #6B7280; }
    .mkmp-stat-percent { font-size: 11px; color: #10B981; font-weight: 600; }
    .mkmp-stat-upgrade { font-size: 10px; color: #F59E0B; font-weight: 600; background: #FEF3C7; padding: 2px 6px; border-radius: 4px; margin-top: 4px; }
    
    .mkmp-toolbar { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
    .mkmp-search-group { display: flex; gap: 8px; flex: 1; min-width: 300px; }
    .mkmp-filter-group { display: flex; gap: 8px; }
    .mkmp-input { padding: 10px 14px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 14px; flex: 1; }
    .mkmp-select { padding: 10px 14px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 14px; background: #fff; }
    
    .mkmp-btn { padding: 10px 16px; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
    .mkmp-btn-blue { background: #3B82F6; color: #fff; }
    .mkmp-btn-gray { background: #F3F4F6; color: #374151; }
    .mkmp-btn-green { background: #10B981; color: #fff; }
    .mkmp-btn-sm { padding: 6px 12px; font-size: 12px; }
    
    .mkmp-connect-row { margin-bottom: 16px; }
    .mkmp-results-bar { padding: 12px 16px; background: #F9FAFB; border-radius: 8px; margin-bottom: 16px; font-size: 14px; color: #6B7280; }
    
    .mkmp-table-box { background: #fff; border-radius: 12px; border: 1px solid #E5E7EB; overflow-x: auto; }
    .mkmp-table { width: 100%; border-collapse: collapse; min-width: 900px; }
    .mkmp-table th { padding: 12px; text-align: left; font-size: 11px; font-weight: 600; color: #6B7280; text-transform: uppercase; background: #F9FAFB; border-bottom: 1px solid #E5E7EB; }
    .mkmp-table td { padding: 12px; border-bottom: 1px solid #E5E7EB; font-size: 13px; vertical-align: middle; }
    .mkmp-table tr:hover { background: #F9FAFB; }
    
    .mkmp-thumb { width: 50px; height: 50px; object-fit: cover; border-radius: 8px; border: 1px solid #E5E7EB; }
    .mkmp-name { max-width: 200px; } .mkmp-name strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .mkmp-id { background: #EFF6FF; color: #3B82F6; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-family: monospace; }
    .mkmp-price { font-weight: 600; color: #059669; }
    .mkmp-center { text-align: center; }
    .mkmp-instock { color: #10B981; font-weight: 500; }
    .mkmp-outstock { color: #EF4444; font-weight: 500; }
    .mkmp-buybox { font-size: 16px; }
    .mkmp-cat { background: #EFF6FF; color: #3B82F6; padding: 4px 10px; border-radius: 20px; font-size: 11px; }
    .mkmp-nocat { color: #EF4444; font-size: 12px; }
    
    .mkmp-actions { display: flex; gap: 6px; }
    .mkmp-act-btn { width: 32px; height: 32px; border: none; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; text-decoration: none; }
    .mkmp-edit { background: #EFF6FF; color: #3B82F6; }
    .mkmp-view { background: #F0FDF4; color: #10B981; }
    
    .mkmp-loading, .mkmp-empty { text-align: center; padding: 60px; color: #6B7280; }
    .mkmp-empty-icon { font-size: 48px; margin-bottom: 16px; }
    
    .mkmp-pagination { display: flex; gap: 6px; justify-content: center; padding: 16px; }
    .mkmp-pg-btn { padding: 8px 14px; border: 1px solid #E5E7EB; background: #fff; border-radius: 6px; cursor: pointer; }
    .mkmp-pg-btn.active { background: #3B82F6; color: #fff; border-color: #3B82F6; }
    .mkmp-pg-btn:disabled { opacity: 0.5; }
    
    .mkmp-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 99999; }
    .mkmp-modal-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); }
    .mkmp-modal-box { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff; border-radius: 12px; width: 90%; max-width: 500px; max-height: 80vh; overflow: hidden; }
    .mkmp-modal-head { padding: 16px 20px; border-bottom: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: center; background: #F9FAFB; }
    .mkmp-modal-head h3 { margin: 0; font-size: 16px; }
    .mkmp-modal-close { background: none; border: none; font-size: 24px; cursor: pointer; }
    .mkmp-modal-body { padding: 20px; max-height: calc(80vh - 60px); overflow-y: auto; }
    .mkmp-modal-foot { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
    .mkmp-form-group { margin-bottom: 16px; }
    .mkmp-form-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
    .mkmp-full { width: 100%; }
    
    .mkmp-results { max-height: 300px; overflow-y: auto; }
    .mkmp-result-item { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid #E5E7EB; border-radius: 8px; margin-bottom: 8px; }
    .mkmp-result-item img { width: 50px; height: 50px; object-fit: cover; border-radius: 6px; }
    .mkmp-result-item div { flex: 1; }
    .mkmp-searching, .mkmp-noresults { text-align: center; padding: 20px; color: #6B7280; }
    
    @media (max-width: 768px) {
        .mkmp-stats-row { flex-direction: column; }
        .mkmp-stat-card { min-width: 100%; }
        .mkmp-toolbar { flex-direction: column; }
        .mkmp-search-group, .mkmp-filter-group { width: 100%; }
    }
</style>
