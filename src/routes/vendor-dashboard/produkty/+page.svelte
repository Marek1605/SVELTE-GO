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
    let currentProduct = null;
    let masterSearchQuery = '';
    let masterResults = [];
    let searchingMaster = false;
    let selectedMasterId = '';
    let connectPrice = '';
    let saving = false;
    
    // Notification
    let notification = { show: false, message: '', type: 'success' };
    
    // Edit form data
    let editForm = {
        price: '',
        stock_status: 'instock',
        product_url: ''
    };
    
    // Load products when stores become ready
    $: if (browser && storesReady && !initialLoadDone) {
        initialLoadDone = true;
        loadProducts();
        loadStats();
    }
    
    function showNotification(message, type = 'success') {
        notification = { show: true, message, type };
        setTimeout(() => {
            notification = { ...notification, show: false };
        }, 3000);
    }
    
    async function loadStats() {
        const token = localStorage.getItem('vendor_token');
        if (!token) return;
        
        try {
            const res = await fetch(`${API_BASE}/vendor/products/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (data.success) {
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
            console.error('Error loading stats:', e);
        }
    }
    
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
                products = data.data?.products || data.data || [];
                totalResults = data.data?.total || data.meta?.total || 0;
                totalPages = data.data?.total_pages || data.meta?.pages || Math.ceil(totalResults / perPage);
            }
        } catch (e) {
            console.error('Error loading products:', e);
        }
        loading = false;
    }
    
    async function searchMasterProducts() {
        if (masterSearchQuery.length < 2) {
            masterResults = [];
            return;
        }
        searchingMaster = true;
        
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(`${API_BASE}/vendor/masters/search?search=${encodeURIComponent(masterSearchQuery)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            masterResults = data.data || [];
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
        if (page < 1 || page > totalPages) return;
        currentPage = page;
        loadProducts();
    }
    
    function handleRefresh() {
        searchQuery = '';
        filter = 'all';
        currentPage = 1;
        loadStats();
        loadProducts();
    }
    
    // =====================
    // CONNECT MODAL
    // =====================
    function openConnectModal() {
        masterSearchQuery = '';
        masterResults = [];
        selectedMasterId = '';
        connectPrice = '';
        showConnectModal = true;
    }
    
    function selectMaster(master) {
        selectedMasterId = master.id;
        showNotification(`Vybraný: ${master.title}`, 'success');
    }
    
    async function connectToMaster() {
        if (!selectedMasterId) {
            showNotification('Vyberte master produkt', 'error');
            return;
        }
        if (!connectPrice || parseFloat(connectPrice) <= 0) {
            showNotification('Zadajte platnú cenu', 'error');
            return;
        }
        
        saving = true;
        const token = localStorage.getItem('vendor_token');
        
        try {
            const res = await fetch(`${API_BASE}/vendor/products/connect`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    master_id: selectedMasterId,
                    price: parseFloat(connectPrice)
                })
            });
            const data = await res.json();
            
            if (data.success) {
                showNotification('✅ ' + (data.message || 'Produkt bol pripojený'), 'success');
                showConnectModal = false;
                loadProducts();
                loadStats();
            } else {
                showNotification('❌ ' + (data.error || 'Chyba pri pripájaní'), 'error');
            }
        } catch (e) {
            showNotification('❌ Chyba pri pripájaní', 'error');
        }
        saving = false;
    }
    
    // =====================
    // EDIT MODAL
    // =====================
    function openEditModal(product) {
        currentProduct = product;
        editForm = {
            price: product.price || '',
            stock_status: product.stock_status || 'instock',
            product_url: product.product_url || product.affiliate_url || ''
        };
        showEditModal = true;
    }
    
    async function saveProduct() {
        if (!currentProduct) return;
        
        saving = true;
        const token = localStorage.getItem('vendor_token');
        
        try {
            const res = await fetch(`${API_BASE}/vendor/products/${currentProduct.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    price: parseFloat(editForm.price),
                    stock_status: editForm.stock_status,
                    product_url: editForm.product_url
                })
            });
            const data = await res.json();
            
            if (data.success) {
                showNotification('✅ Produkt bol uložený', 'success');
                showEditModal = false;
                loadProducts();
            } else {
                showNotification('❌ ' + (data.error || 'Chyba pri ukladaní'), 'error');
            }
        } catch (e) {
            showNotification('❌ Chyba pri ukladaní', 'error');
        }
        saving = false;
    }
    
    // =====================
    // VIEW PRODUCT
    // =====================
    function viewProduct(product) {
        const url = product.permalink || product.product_url || product.affiliate_url;
        if (url) {
            window.open(url, '_blank');
        } else {
            showNotification('URL produktu nie je dostupná', 'error');
        }
    }
    
    function formatNumber(num) {
        return (num || 0).toLocaleString('sk-SK');
    }
    
    function formatPrice(price) {
        return (price || 0).toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    }
    
    // Placeholder image
    const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Crect fill="%23f3f4f6" width="60" height="60"/%3E%3Ctext fill="%239ca3af" font-size="10" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EIMG%3C/text%3E%3C/svg%3E';
    
    // Generate pagination array
    function getPaginationArray() {
        const pages = [];
        const maxVisible = 7;
        
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 4) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    }
</script>

<!-- NOTIFICATION -->
{#if notification.show}
    <div class="mkmp-notification mkmp-notification-{notification.type}">
        {notification.message}
    </div>
{/if}

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
            <div class="mkmp-search-input-wrap">
                <span class="mkmp-search-icon">🔍</span>
                <input 
                    type="text" 
                    class="mkmp-search-input" 
                    placeholder="Hľadať produkt (názov, EAN)..."
                    bind:value={searchQuery}
                    on:keypress={(e) => e.key === 'Enter' && handleSearch()}
                >
            </div>
            <button class="mkmp-btn mkmp-btn-blue" on:click={handleSearch}>
                <span>🔍</span> Hľadať
            </button>
            <button class="mkmp-btn mkmp-btn-outline" on:click={handleRefresh}>
                <span>🔄</span> Obnoviť
            </button>
        </div>
        
        <div class="mkmp-filter-group">
            <select class="mkmp-select" bind:value={filter} on:change={() => handleFilterChange(filter)}>
                <option value="all">Všetky produkty</option>
                {#if !isFree}
                    <option value="paired">Spárované</option>
                    <option value="unpaired">Nespárované</option>
                    <option value="with_category">Zaradené v kategórii</option>
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
            <span>➕</span> Pripojiť sa k master produktu
        </button>
    </div>
    
    <!-- RESULTS INFO -->
    <div class="mkmp-results-bar">
        {#if totalResults === 0}
            <span>📊 Žiadne produkty</span>
        {:else}
            <span>📊 Zobrazených {products.length} z {formatNumber(totalResults)} produktov</span>
        {/if}
    </div>
    
    <!-- PRODUCTS TABLE -->
    <div class="mkmp-table-box">
        <table class="mkmp-table">
            <thead>
                <tr>
                    <th class="th-img">IMG</th>
                    <th class="th-product">PRODUKT</th>
                    <th class="th-ean">EAN</th>
                    <th class="th-price">CENA</th>
                    <th class="th-status">STAV</th>
                    <th class="th-category">KATEGÓRIA</th>
                    <th class="th-actions">AKCIE</th>
                </tr>
            </thead>
            <tbody>
                {#if loading}
                    <tr>
                        <td colspan="7" class="mkmp-loading-cell">
                            <div class="mkmp-spinner"></div>
                            <span>Načítavam produkty...</span>
                        </td>
                    </tr>
                {:else if products.length === 0}
                    <tr>
                        <td colspan="7" class="mkmp-empty-cell">
                            <div class="mkmp-empty-icon">📦</div>
                            <p>Zatiaľ nemáte žiadne produkty</p>
                            <small>Nahrajte XML feed alebo pridajte produkty manuálne</small>
                        </td>
                    </tr>
                {:else}
                    {#each products as product}
                        <tr>
                            <td class="td-img">
                                <img 
                                    src={product.image_url || product.thumbnail || placeholderImage} 
                                    alt={product.title || product.name} 
                                    class="mkmp-product-img"
                                    on:error={(e) => e.target.src = placeholderImage}
                                >
                            </td>
                            <td class="td-product">
                                <span class="mkmp-product-title">{product.title || product.name || 'Bez názvu'}</span>
                            </td>
                            <td class="td-ean">
                                <span class="mkmp-ean">{product.ean || product.external_id || '-'}</span>
                            </td>
                            <td class="td-price">
                                <span class="mkmp-price">{formatPrice(product.price)}</span>
                            </td>
                            <td class="td-status">
                                {#if product.stock_status === 'instock' || product.stock === 'Skladom'}
                                    <span class="mkmp-status mkmp-status-instock">✓ Skladom</span>
                                {:else}
                                    <span class="mkmp-status mkmp-status-outofstock">✗ Vypredané</span>
                                {/if}
                            </td>
                            <td class="td-category">
                                {#if isFree}
                                    <a href="/vendor-dashboard/ppc" class="mkmp-category-free">✗ Bez kategórie</a>
                                {:else if product.categories && product.categories.length > 0}
                                    <span class="mkmp-category-name">{product.categories.join(', ')}</span>
                                {:else}
                                    <span class="mkmp-category-none">✗ Bez kategórie</span>
                                {/if}
                            </td>
                            <td class="td-actions">
                                <button 
                                    class="mkmp-action-btn mkmp-action-edit" 
                                    title="Upraviť"
                                    on:click={() => openEditModal(product)}
                                >
                                    ✏️
                                </button>
                                <button 
                                    class="mkmp-action-btn mkmp-action-view" 
                                    title="Zobraziť"
                                    on:click={() => viewProduct(product)}
                                >
                                    👁️
                                </button>
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
                on:click={() => goToPage(1)}
            >
                «
            </button>
            <button 
                class="mkmp-page-btn" 
                disabled={currentPage === 1}
                on:click={() => goToPage(currentPage - 1)}
            >
                ‹
            </button>
            
            {#each getPaginationArray() as pageNum}
                {#if pageNum === '...'}
                    <span class="mkmp-page-dots">...</span>
                {:else}
                    <button 
                        class="mkmp-page-btn" 
                        class:mkmp-page-active={currentPage === pageNum}
                        on:click={() => goToPage(pageNum)}
                    >
                        {pageNum}
                    </button>
                {/if}
            {/each}
            
            <button 
                class="mkmp-page-btn" 
                disabled={currentPage === totalPages}
                on:click={() => goToPage(currentPage + 1)}
            >
                ›
            </button>
            <button 
                class="mkmp-page-btn" 
                disabled={currentPage === totalPages}
                on:click={() => goToPage(totalPages)}
            >
                »
            </button>
        </div>
    {/if}
</div>
{/if}

<!-- ===================== -->
<!-- CONNECT MODAL -->
<!-- ===================== -->
{#if showConnectModal}
    <div class="mkmp-modal-overlay" on:click={() => showConnectModal = false} on:keydown={() => {}} role="button" tabindex="0">
        <div class="mkmp-modal" on:click|stopPropagation={() => {}} on:keydown={() => {}} role="dialog">
            <div class="mkmp-modal-header">
                <h3>➕ Pripojiť sa k master produktu</h3>
                <button class="mkmp-modal-close" on:click={() => showConnectModal = false}>&times;</button>
            </div>
            <div class="mkmp-modal-body">
                <div class="mkmp-form-group">
                    <label>Hľadať master produkt (názov, EAN, ID)</label>
                    <input 
                        type="text" 
                        class="mkmp-input"
                        placeholder="Zadajte názov, EAN alebo ID produktu..."
                        bind:value={masterSearchQuery}
                        on:input={searchMasterProducts}
                    >
                </div>
                
                {#if searchingMaster}
                    <div class="mkmp-search-loading">
                        <div class="mkmp-spinner-small"></div>
                        <span>Hľadám...</span>
                    </div>
                {:else if masterResults.length > 0}
                    <div class="mkmp-master-list">
                        {#each masterResults as result}
                            <div 
                                class="mkmp-master-item" 
                                class:selected={result.id === selectedMasterId}
                                on:click={() => selectMaster(result)}
                                on:keydown={(e) => e.key === 'Enter' && selectMaster(result)}
                                role="button"
                                tabindex="0"
                            >
                                <img 
                                    src={result.image_url || placeholderImage} 
                                    alt={result.title}
                                    class="mkmp-master-img"
                                    on:error={(e) => e.target.src = placeholderImage}
                                >
                                <div class="mkmp-master-info">
                                    <strong>{result.title}</strong>
                                    <span>ID: {result.id} {result.ean ? `| EAN: ${result.ean}` : ''}</span>
                                </div>
                                {#if result.id === selectedMasterId}
                                    <span class="mkmp-master-check">✓</span>
                                {/if}
                            </div>
                        {/each}
                    </div>
                {:else if masterSearchQuery.length >= 2}
                    <p class="mkmp-no-results">Žiadne výsledky pre "{masterSearchQuery}"</p>
                {/if}
                
                <div class="mkmp-form-group">
                    <label>Vaša cena (€) *</label>
                    <input 
                        type="number" 
                        step="0.01"
                        min="0"
                        class="mkmp-input"
                        placeholder="Zadajte vašu cenu..."
                        bind:value={connectPrice}
                    >
                </div>
                
                <div class="mkmp-modal-actions">
                    <button class="mkmp-btn mkmp-btn-outline" on:click={() => showConnectModal = false}>Zrušiť</button>
                    <button class="mkmp-btn mkmp-btn-green" on:click={connectToMaster} disabled={saving || !selectedMasterId}>
                        {saving ? 'Ukladám...' : '➕ Pripojiť'}
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

<!-- ===================== -->
<!-- EDIT MODAL -->
<!-- ===================== -->
{#if showEditModal && currentProduct}
    <div class="mkmp-modal-overlay" on:click={() => showEditModal = false} on:keydown={() => {}} role="button" tabindex="0">
        <div class="mkmp-modal" on:click|stopPropagation={() => {}} on:keydown={() => {}} role="dialog">
            <div class="mkmp-modal-header">
                <h3>✏️ Upraviť ponuku</h3>
                <button class="mkmp-modal-close" on:click={() => showEditModal = false}>&times;</button>
            </div>
            <div class="mkmp-modal-body">
                <div class="mkmp-form-group">
                    <label>Názov produktu</label>
                    <input type="text" class="mkmp-input mkmp-input-disabled" value={currentProduct.title || currentProduct.name || ''} disabled>
                </div>
                
                <div class="mkmp-form-row">
                    <div class="mkmp-form-group">
                        <label>Vaša cena (€) *</label>
                        <input 
                            type="number" 
                            step="0.01"
                            min="0"
                            class="mkmp-input"
                            bind:value={editForm.price}
                        >
                    </div>
                    
                    <div class="mkmp-form-group">
                        <label>Dostupnosť *</label>
                        <select class="mkmp-select" bind:value={editForm.stock_status}>
                            <option value="instock">Skladom</option>
                            <option value="outofstock">Vypredané</option>
                        </select>
                    </div>
                </div>
                
                <div class="mkmp-form-group">
                    <label>URL produktu v e-shope</label>
                    <input 
                        type="url" 
                        class="mkmp-input"
                        placeholder="https://vas-eshop.sk/produkt..."
                        bind:value={editForm.product_url}
                    >
                </div>
                
                <div class="mkmp-product-info">
                    <p><span>EAN:</span> <strong>{currentProduct.ean || currentProduct.external_id || '-'}</strong></p>
                    <p><span>ID:</span> <strong>{currentProduct.id || currentProduct.master_id || '-'}</strong></p>
                </div>
                
                <div class="mkmp-modal-actions">
                    <button class="mkmp-btn mkmp-btn-outline" on:click={() => showEditModal = false}>Zrušiť</button>
                    <button class="mkmp-btn mkmp-btn-blue" on:click={saveProduct} disabled={saving}>
                        {saving ? 'Ukladám...' : '💾 Uložiť zmeny'}
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    /* ============================= */
    /* BASE STYLES */
    /* ============================= */
    .mkmp-page {
        width: 100%;
        max-width: 100%;
    }
    
    /* ============================= */
    /* NOTIFICATION */
    /* ============================= */
    .mkmp-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 14px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 9999999;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }
    .mkmp-notification-success { background: #10B981; color: white; }
    .mkmp-notification-error { background: #EF4444; color: white; }
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    /* ============================= */
    /* LOADING */
    /* ============================= */
    .mkmp-loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 300px;
        gap: 16px;
    }
    .mkmp-loading-container p { color: #6B7280; font-size: 14px; }
    .mkmp-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #E5E7EB;
        border-top-color: #3B82F6;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }
    .mkmp-spinner-small {
        width: 20px;
        height: 20px;
        border: 2px solid #E5E7EB;
        border-top-color: #3B82F6;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    /* ============================= */
    /* FREE BANNER */
    /* ============================= */
    .mkmp-free-banner {
        display: flex;
        align-items: center;
        gap: 16px;
        background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
        border: 2px solid #F59E0B;
        border-radius: 12px;
        padding: 16px 20px;
        margin-bottom: 20px;
    }
    .mkmp-free-banner-icon { font-size: 32px; flex-shrink: 0; }
    .mkmp-free-banner-content { flex: 1; color: #92400E; font-size: 14px; }
    
    /* ============================= */
    /* STAT CARDS */
    /* ============================= */
    .mkmp-stats-row {
        display: flex;
        gap: 16px;
        margin-bottom: 24px;
    }
    .mkmp-stat-card {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 20px;
        background: #fff;
        border: 2px solid #E5E7EB;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s;
    }
    .mkmp-stat-card:hover {
        border-color: #3B82F6;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    }
    .mkmp-stat-card.active {
        border-color: #3B82F6;
        background: #EFF6FF;
    }
    .mkmp-stat-card.mkmp-stat-disabled { opacity: 0.7; }
    .mkmp-stat-card.mkmp-stat-warning { border-color: #F59E0B; background: #FFFBEB; }
    .mkmp-stat-icon { font-size: 28px; }
    .mkmp-stat-info { display: flex; flex-direction: column; }
    .mkmp-stat-number { font-size: 28px; font-weight: 700; color: #1F2937; }
    .mkmp-stat-number.mkmp-text-muted { color: #9CA3AF; }
    .mkmp-stat-label { font-size: 13px; color: #6B7280; margin-top: 2px; }
    .mkmp-stat-percent { font-size: 12px; color: #10B981; font-weight: 600; margin-top: 4px; }
    .mkmp-stat-upgrade { font-size: 11px; color: #F59E0B; font-weight: 600; margin-top: 4px; }
    
    /* ============================= */
    /* TOOLBAR */
    /* ============================= */
    .mkmp-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        margin-bottom: 16px;
        flex-wrap: wrap;
    }
    .mkmp-search-group {
        display: flex;
        gap: 8px;
        flex: 1;
        min-width: 400px;
    }
    .mkmp-search-input-wrap {
        position: relative;
        flex: 1;
    }
    .mkmp-search-icon {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 14px;
        pointer-events: none;
    }
    .mkmp-search-input {
        width: 100%;
        padding: 12px 14px 12px 40px;
        border: 1px solid #E5E7EB;
        border-radius: 8px;
        font-size: 14px;
        background: #fff;
    }
    .mkmp-search-input:focus {
        outline: none;
        border-color: #3B82F6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    .mkmp-filter-group {
        display: flex;
        gap: 8px;
    }
    
    /* ============================= */
    /* BUTTONS */
    /* ============================= */
    .mkmp-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 12px 18px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s;
    }
    .mkmp-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .mkmp-btn-blue { background: #3B82F6; color: #fff; }
    .mkmp-btn-blue:hover:not(:disabled) { background: #2563EB; }
    .mkmp-btn-outline { background: #fff; color: #374151; border: 1px solid #E5E7EB; }
    .mkmp-btn-outline:hover:not(:disabled) { background: #F9FAFB; border-color: #D1D5DB; }
    .mkmp-btn-green { background: #10B981; color: #fff; }
    .mkmp-btn-green:hover:not(:disabled) { background: #059669; }
    .mkmp-btn-upgrade {
        background: #F59E0B;
        color: #fff;
        text-decoration: none;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 600;
        display: inline-block;
    }
    .mkmp-btn-upgrade:hover { background: #D97706; }
    
    /* ============================= */
    /* SELECT */
    /* ============================= */
    .mkmp-select {
        padding: 12px 14px;
        border: 1px solid #E5E7EB;
        border-radius: 8px;
        font-size: 14px;
        background: #fff;
        cursor: pointer;
        min-width: 150px;
    }
    .mkmp-select:focus {
        outline: none;
        border-color: #3B82F6;
    }
    
    /* ============================= */
    /* CONNECT ROW */
    /* ============================= */
    .mkmp-connect-row {
        margin-bottom: 16px;
    }
    
    /* ============================= */
    /* RESULTS BAR */
    /* ============================= */
    .mkmp-results-bar {
        padding: 12px 16px;
        background: #F9FAFB;
        border-radius: 8px;
        margin-bottom: 16px;
        font-size: 14px;
        color: #6B7280;
    }
    
    /* ============================= */
    /* TABLE */
    /* ============================= */
    .mkmp-table-box {
        background: #fff;
        border-radius: 12px;
        border: 1px solid #E5E7EB;
        overflow: hidden;
    }
    .mkmp-table {
        width: 100%;
        border-collapse: collapse;
    }
    .mkmp-table thead {
        background: #F9FAFB;
    }
    .mkmp-table th {
        padding: 14px 16px;
        text-align: left;
        font-size: 12px;
        font-weight: 600;
        color: #6B7280;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 1px solid #E5E7EB;
    }
    .mkmp-table td {
        padding: 12px 16px;
        border-bottom: 1px solid #E5E7EB;
        font-size: 14px;
        color: #1F2937;
        vertical-align: middle;
    }
    .mkmp-table tbody tr:hover {
        background: #F9FAFB;
    }
    .mkmp-table tbody tr:last-child td {
        border-bottom: none;
    }
    
    /* Table column widths */
    .th-img { width: 80px; }
    .th-product { width: auto; }
    .th-ean { width: 120px; }
    .th-price { width: 100px; }
    .th-status { width: 100px; }
    .th-category { width: 140px; }
    .th-actions { width: 100px; text-align: center; }
    
    /* Product image */
    .mkmp-product-img {
        width: 50px;
        height: 50px;
        object-fit: contain;
        border-radius: 8px;
        border: 1px solid #E5E7EB;
        background: #fff;
    }
    
    /* Product title */
    .mkmp-product-title {
        display: block;
        max-width: 350px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 500;
    }
    
    /* EAN */
    .mkmp-ean {
        color: #6B7280;
        font-size: 13px;
    }
    
    /* Price */
    .mkmp-price {
        font-weight: 600;
        color: #1F2937;
    }
    
    /* Status */
    .mkmp-status {
        font-weight: 500;
        font-size: 13px;
    }
    .mkmp-status-instock { color: #10B981; }
    .mkmp-status-outofstock { color: #EF4444; }
    
    /* Category */
    .mkmp-category-name {
        color: #3B82F6;
        font-size: 13px;
    }
    .mkmp-category-none {
        color: #EF4444;
        font-size: 13px;
    }
    .mkmp-category-free {
        color: #EF4444;
        font-size: 13px;
        text-decoration: none;
    }
    .mkmp-category-free:hover {
        text-decoration: underline;
    }
    
    /* Actions */
    .td-actions {
        text-align: center;
    }
    .mkmp-action-btn {
        width: 36px;
        height: 36px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin: 0 2px;
    }
    .mkmp-action-edit {
        background: #FEF3C7;
        color: #92400E;
    }
    .mkmp-action-edit:hover {
        background: #F59E0B;
        color: white;
    }
    .mkmp-action-view {
        background: #E0E7FF;
        color: #4338CA;
    }
    .mkmp-action-view:hover {
        background: #6366F1;
        color: white;
    }
    
    /* Loading & Empty cells */
    .mkmp-loading-cell, .mkmp-empty-cell {
        text-align: center;
        padding: 60px 20px !important;
        color: #6B7280;
    }
    .mkmp-loading-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
    }
    .mkmp-empty-icon {
        font-size: 48px;
        margin-bottom: 8px;
    }
    .mkmp-empty-cell p {
        margin: 0 0 4px;
        font-size: 16px;
        color: #374151;
    }
    .mkmp-empty-cell small {
        color: #9CA3AF;
    }
    
    /* ============================= */
    /* PAGINATION */
    /* ============================= */
    .mkmp-pagination {
        display: flex;
        gap: 6px;
        justify-content: center;
        padding: 20px;
        align-items: center;
    }
    .mkmp-page-btn {
        min-width: 36px;
        height: 36px;
        padding: 0 12px;
        border: 1px solid #E5E7EB;
        background: #fff;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s;
        color: #374151;
    }
    .mkmp-page-btn:hover:not(:disabled) {
        background: #F9FAFB;
        border-color: #3B82F6;
        color: #3B82F6;
    }
    .mkmp-page-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    .mkmp-page-active {
        background: #3B82F6 !important;
        color: #fff !important;
        border-color: #3B82F6 !important;
    }
    .mkmp-page-dots {
        padding: 0 8px;
        color: #9CA3AF;
    }
    
    /* ============================= */
    /* MODAL */
    /* ============================= */
    .mkmp-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        padding: 20px;
    }
    .mkmp-modal {
        background: #fff;
        border-radius: 16px;
        width: 100%;
        max-width: 550px;
        max-height: 90vh;
        overflow: hidden;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
    }
    .mkmp-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 18px 24px;
        border-bottom: 1px solid #E5E7EB;
        background: #F9FAFB;
    }
    .mkmp-modal-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #1F2937;
    }
    .mkmp-modal-close {
        background: none;
        border: none;
        font-size: 28px;
        color: #6B7280;
        cursor: pointer;
        line-height: 1;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
    }
    .mkmp-modal-close:hover {
        background: #E5E7EB;
        color: #1F2937;
    }
    .mkmp-modal-body {
        padding: 24px;
        max-height: calc(90vh - 80px);
        overflow-y: auto;
    }
    .mkmp-modal-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 24px;
        padding-top: 20px;
        border-top: 1px solid #E5E7EB;
    }
    
    /* ============================= */
    /* FORM */
    /* ============================= */
    .mkmp-form-group {
        margin-bottom: 16px;
    }
    .mkmp-form-group label {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 6px;
    }
    .mkmp-input {
        width: 100%;
        padding: 12px 14px;
        border: 1px solid #E5E7EB;
        border-radius: 8px;
        font-size: 14px;
        background: #fff;
    }
    .mkmp-input:focus {
        outline: none;
        border-color: #3B82F6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    .mkmp-input-disabled {
        background: #F3F4F6;
        color: #6B7280;
        cursor: not-allowed;
    }
    .mkmp-form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
    }
    
    /* ============================= */
    /* MASTER SEARCH */
    /* ============================= */
    .mkmp-search-loading {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 20px;
        color: #6B7280;
        justify-content: center;
    }
    .mkmp-master-list {
        max-height: 250px;
        overflow-y: auto;
        margin-bottom: 16px;
        border: 1px solid #E5E7EB;
        border-radius: 8px;
    }
    .mkmp-master-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-bottom: 1px solid #E5E7EB;
        cursor: pointer;
        transition: all 0.2s;
    }
    .mkmp-master-item:last-child {
        border-bottom: none;
    }
    .mkmp-master-item:hover {
        background: #F9FAFB;
    }
    .mkmp-master-item.selected {
        background: #EFF6FF;
        border-color: #3B82F6;
    }
    .mkmp-master-img {
        width: 45px;
        height: 45px;
        object-fit: contain;
        border-radius: 6px;
        border: 1px solid #E5E7EB;
        background: #fff;
    }
    .mkmp-master-info {
        flex: 1;
    }
    .mkmp-master-info strong {
        display: block;
        font-size: 14px;
        color: #1F2937;
        margin-bottom: 2px;
    }
    .mkmp-master-info span {
        font-size: 12px;
        color: #6B7280;
    }
    .mkmp-master-check {
        width: 24px;
        height: 24px;
        background: #10B981;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: bold;
    }
    .mkmp-no-results {
        text-align: center;
        padding: 20px;
        color: #6B7280;
    }
    
    /* ============================= */
    /* PRODUCT INFO IN MODAL */
    /* ============================= */
    .mkmp-product-info {
        background: #F9FAFB;
        padding: 12px 16px;
        border-radius: 8px;
        margin-top: 8px;
    }
    .mkmp-product-info p {
        margin: 0 0 4px;
        font-size: 13px;
        color: #6B7280;
    }
    .mkmp-product-info p:last-child {
        margin-bottom: 0;
    }
    .mkmp-product-info span {
        display: inline-block;
        width: 40px;
    }
    .mkmp-product-info strong {
        color: #1F2937;
    }
    
    /* ============================= */
    /* RESPONSIVE */
    /* ============================= */
    @media (max-width: 1200px) {
        .mkmp-stats-row {
            flex-wrap: wrap;
        }
        .mkmp-stat-card {
            flex: 1 1 calc(33.333% - 12px);
            min-width: 180px;
        }
    }
    @media (max-width: 900px) {
        .mkmp-stat-card {
            flex: 1 1 calc(50% - 8px);
        }
        .mkmp-toolbar {
            flex-direction: column;
            align-items: stretch;
        }
        .mkmp-search-group {
            min-width: 100%;
        }
        .mkmp-filter-group {
            justify-content: flex-end;
        }
    }
    @media (max-width: 600px) {
        .mkmp-stat-card {
            flex: 1 1 100%;
        }
        .mkmp-free-banner {
            flex-direction: column;
            text-align: center;
        }
        .mkmp-form-row {
            grid-template-columns: 1fr;
        }
        .mkmp-table {
            font-size: 12px;
        }
        .mkmp-table th, .mkmp-table td {
            padding: 8px 10px;
        }
        .mkmp-product-title {
            max-width: 150px;
        }
    }
</style>
