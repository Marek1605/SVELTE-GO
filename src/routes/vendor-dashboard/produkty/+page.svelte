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
    let showCategoryModal = false;
    let showAddManualModal = false;
    let currentProduct = null;
    let editTab = 'price';
    let masterSearchQuery = '';
    let masterResults = [];
    let searchingMaster = false;
    let saving = false;
    let message = null;
    
    // Manual EAN pairing
    let manualEan = '';
    let manualPrice = '';
    let manualUrl = '';
    let searchingEan = false;
    let eanProduct = null;
    let eanError = '';
    
    // Category change request
    let categorySearchQuery = '';
    let categoryResults = [];
    let searchingCategories = false;
    let selectedCategory = null;
    let categoryNote = '';
    let savingRequest = false;
    let categorySearchTimer;
    let showCategoryTree = false;
    let categoryTree = [];
    let loadingTree = false;
    
    onMount(async () => {
        if (!browser) return;
        
        // Timeout for loading - max 10 seconds
        const timeout = setTimeout(() => {
            if (loading) {
                loading = false;
                loadError = true;
            }
        }, 10000);
        
        await loadStats();
        await loadProducts();
        
        clearTimeout(timeout);
    });
    
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
                    paired: s.matched_offers || 0,
                    unpaired: s.unmatched_offers || 0,
                    withoutCategories: 0,
                    pendingApprovals: 0,
                    pairingRate: s.total_products > 0 ? Math.round(((s.matched_offers || 0) / s.total_products) * 100) : 0
                };
            }
        } catch (e) { console.error(e); }
    }
    
    async function loadProducts() {
        loading = true;
        loadError = false;
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
                // Use stats from products endpoint
                if (data.stats) {
                    stats = {
                        total: data.stats.total || 0,
                        paired: data.stats.paired || 0,
                        unpaired: data.stats.unpaired || 0,
                        withoutCategories: data.stats.without_category || 0,
                        pendingApprovals: 0,
                        pairingRate: data.stats.total > 0 ? Math.round((data.stats.paired / data.stats.total) * 100) : 0
                    };
                }
            }
        } catch (e) { 
            console.error(e);
            loadError = true;
        }
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
        if (!manualEan || manualEan.length < 8) {
            eanError = 'Zadajte platný EAN kód (min. 8 znakov)';
            return;
        }
        searchingEan = true;
        eanError = '';
        eanProduct = null;
        
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(API_BASE + '/products/search?q=' + encodeURIComponent(manualEan) + '&limit=1', { headers: { 'Authorization': 'Bearer ' + token } });
            const data = await res.json();
            const results = data.data?.products || data.data || [];
            if (results.length > 0) {
                eanProduct = results[0];
            } else {
                eanError = 'Produkt s týmto EAN nebol nájdený v databáze';
            }
        } catch (e) { 
            eanError = 'Chyba pri vyhľadávaní';
        }
        searchingEan = false;
    }
    
    async function connectWithEan() {
        if (!eanProduct) return;
        saving = true;
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(API_BASE + '/vendor/products/' + eanProduct.id + '/connect', { 
                method: 'POST', 
                headers: { 
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    price: parseFloat(manualPrice) || 0,
                    affiliate_url: manualUrl || ''
                })
            });
            const data = await res.json();
            if (data.success) { 
                showAddManualModal = false; 
                manualEan = ''; 
                manualPrice = ''; 
                manualUrl = '';
                eanProduct = null;
                loadStats(); 
                loadProducts(); 
            }
            else alert(data.error || 'Chyba');
        } catch (e) { alert('Chyba pripojenia'); }
        saving = false;
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
                body: JSON.stringify({ 
                    price: parseFloat(currentProduct.price) || 0,
                    min_price: parseFloat(currentProduct.min_price) || null,
                    max_price: parseFloat(currentProduct.max_price) || null,
                    affiliate_url: currentProduct.affiliate_url || ''
                })
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
    function goToPage(p) { if (p >= 1 && p <= totalPages) { currentPage = p; loadProducts(); } }
    
    function getPaginationPages(current, total) {
        if (total <= 9) return Array.from({length: total}, (_, i) => i + 1);
        const pages = [];
        pages.push(1);
        if (current > 4) pages.push('...');
        for (let i = Math.max(2, current - 2); i <= Math.min(total - 1, current + 2); i++) pages.push(i);
        if (current < total - 3) pages.push('...');
        pages.push(total);
        return pages;
    }
    function refresh() { searchQuery = ''; filter = 'all'; currentPage = 1; loadStats(); loadProducts(); }
    function openConnectModal() { masterSearchQuery = ''; masterResults = []; showConnectModal = true; }
    function openAddManualModal() { manualEan = ''; manualPrice = ''; manualUrl = ''; eanProduct = null; eanError = ''; showAddManualModal = true; }
    function openEditModal(p) { 
        currentProduct = { ...p, min_price: p.min_price || '', max_price: p.max_price || '', affiliate_url: p.affiliate_url || '' }; 
        editTab = 'price';
        categorySearchQuery = ''; categoryResults = []; selectedCategory = null; categoryNote = '';
        showEditModal = true; 
    }
    function openCategoryModal(p) { 
        currentProduct = { ...p }; 
        categorySearchQuery = ''; 
        categoryResults = []; 
        selectedCategory = null; 
        categoryNote = '';
        showCategoryModal = true; 
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
    
    async function toggleCategoryTree() {
        showCategoryTree = !showCategoryTree;
        if (showCategoryTree && categoryTree.length === 0) {
            loadingTree = true;
            const token = localStorage.getItem('vendor_token');
            try {
                const res = await fetch(API_BASE + '/vendor/search-categories?q=__tree__', { headers: { 'Authorization': 'Bearer ' + token } });
                const data = await res.json();
                categoryTree = data.data || [];
            } catch (e) { console.error(e); }
            loadingTree = false;
        }
    }
    
    async function submitCategoryRequest() {
        if (!selectedCategory || !currentProduct) return;
        savingRequest = true;
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(API_BASE + '/vendor/requests', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    offer_id: currentProduct.id,
                    request_type: 'category_change',
                    requested_category: selectedCategory.path || selectedCategory.name,
                    requested_category_id: selectedCategory.id,
                    vendor_note: categoryNote
                })
            });
            const data = await res.json();
            if (data.success) {
                showCategoryModal = false;
                message = { type: 'success', text: '✅ Žiadosť o zmenu kategórie bola odoslaná na schválenie.' };
            } else {
                message = { type: 'error', text: data.error || 'Chyba pri odosielaní žiadosti' };
            }
        } catch (e) {
            message = { type: 'error', text: 'Chyba pripojenia' };
        }
        savingRequest = false;
    }
    
    function generateSlug(text) {
        if (!text) return '';
        return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    }
    
    function viewOffers(p) {
        let slug = p.master_slug || p.slug || '';
        if (!slug) {
            const title = p.master_title || p.title || p.name || '';
            slug = generateSlug(title);
        }
        if (slug) { window.open('/produkt/' + slug, '_blank'); }
        else { alert('Produkt nemá názov.'); }
    }
    
    function formatNumber(n) { return (n || 0).toLocaleString('sk-SK'); }
    function formatPrice(p) { return (p || 0).toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'; }
    const placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50"%3E%3Crect fill="%23f1f5f9" width="50" height="50" rx="6"/%3E%3C/svg%3E';
</script>

<div class="page">
    {#if message}
        <div class="msg-banner {message.type}" on:click={() => message = null}>
            {message.text}
            <button on:click|stopPropagation={() => message = null}>×</button>
        </div>
    {/if}
    
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
        <button class="stat" class:active={filter === 'paired'} on:click={() => handleFilterChange('paired')}>
            <span class="num">{formatNumber(stats.paired)}</span>
            <span class="lbl">Spárované ({stats.pairingRate}%)</span>
        </button>
        <button class="stat" class:active={filter === 'unpaired'} on:click={() => handleFilterChange('unpaired')}>
            <span class="num">{formatNumber(stats.unpaired)}</span>
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
            <option value={100}>100 / strana</option>
        </select>
    </div>
    
    <div class="action-row">
        <div class="action-buttons">
            <button class="btn green" on:click={openConnectModal}>➕ Pripojiť sa k produktu</button>
            <button class="btn blue" on:click={openAddManualModal}>📦 Pridať cez EAN</button>
        </div>
        <span class="info">📊 Zobrazených {products.length} z {formatNumber(totalResults)} produktov</span>
    </div>
    
    <!-- CONTENT -->
    {#if loading}
        <div class="loading-box">
            <div class="spinner"></div>
            <p>Načítavam produkty...</p>
        </div>
    {:else if loadError}
        <div class="error-box">
            <span class="error-icon">⚠️</span>
            <h3>Chyba pri načítaní</h3>
            <p>Nepodarilo sa načítať produkty. Skúste to znova.</p>
            <button class="btn blue" on:click={refresh}>🔄 Skúsiť znova</button>
        </div>
    {:else if products.length === 0}
        <!-- EMPTY STATE -->
        <div class="empty-state">
            <div class="empty-icon">📦</div>
            <h3>Zatiaľ nemáte žiadne produkty</h3>
            <p>Začnite pridávať produkty do vášho obchodu</p>
            
            <div class="empty-options">
                <div class="empty-option" on:click={openConnectModal} on:keydown={() => {}} role="button" tabindex="0">
                    <span class="option-icon">🔗</span>
                    <h4>Pripojiť sa k existujúcemu produktu</h4>
                    <p>Vyhľadajte produkt v našej databáze podľa názvu</p>
                </div>
                
                <div class="empty-option" on:click={openAddManualModal} on:keydown={() => {}} role="button" tabindex="0">
                    <span class="option-icon">📦</span>
                    <h4>Pridať produkt cez EAN kód</h4>
                    <p>Zadajte EAN kód produktu pre rýchle párovanie</p>
                </div>
            </div>
            
            <div class="empty-hint">
                <strong>💡 Tip:</strong> Pre hromadný import produktov použite 
                <a href="/vendor-dashboard/xml-feedy">XML Feed</a>
            </div>
        </div>
    {:else}
        <!-- TABLE -->
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th style="width:40px"></th>
                        <th>PRODUKT</th>
                        <th>EAN</th>
                        <th>CENA</th>
                        <th>STAV</th>
                        <th>PREDAJCOV</th>
                        <th>KATEGÓRIA</th>
                        <th>AKCIE</th>
                    </tr>
                </thead>
                <tbody>
                    {#each products as p}
                        <tr>
                            <td><img src={p.image_url || p.master_image || placeholder} alt="" class="thumb" on:error={(e) => e.target.src = placeholder}></td>
                            <td class="name"><strong class="clickable" on:click={() => openEditModal(p)}>{p.title || p.master_title || p.name || '-'}</strong></td>
                            <td><code class="ean">{p.ean || '—'}</code></td>
                            <td class="price">{formatPrice(p.price)}</td>
                            <td>{#if p.stock_status === 'instock'}<span class="stock in">✓ Skladom</span>{:else}<span class="stock out">✗ Vypredané</span>{/if}</td>
                            <td class="center">{p.vendors_count || 1}</td>
                            <td>{#if p.category}<span class="cat">{p.category}</span>{:else}<span class="nocat">—</span>{/if}</td>
                            <td class="actions">
                                <button on:click={() => openEditModal(p)}>✏️ Upraviť</button>
                                {#if p.product_id && p.master_slug}
                                    <a href="/produkt/{p.master_slug}" target="_blank" class="action-link">↗ Ponuka</a>
                                {:else if p.product_id}
                                    <a href="/produkt/{p.product_id}" target="_blank" class="action-link">↗ Ponuka</a>
                                {/if}
                                <button class="red" on:click={() => disconnectProduct(p.id)}>🔌 Odpojiť</button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        
        {#if totalPages > 1}
        <div class="pagination">
            <button disabled={currentPage === 1} on:click={() => goToPage(1)}>««</button>
            <button disabled={currentPage === 1} on:click={() => goToPage(currentPage - 1)}>‹</button>
            {#each getPaginationPages(currentPage, totalPages) as p}
                {#if p === '...'}
                    <span class="dots">…</span>
                {:else}
                    <button class:active={currentPage === p} on:click={() => goToPage(p)}>{p}</button>
                {/if}
            {/each}
            <button disabled={currentPage === totalPages} on:click={() => goToPage(currentPage + 1)}>›</button>
            <button disabled={currentPage === totalPages} on:click={() => goToPage(totalPages)}>»»</button>
            <span class="page-info">Str. {currentPage} z {totalPages}</span>
        </div>
        {/if}
    {/if}
</div>

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

<!-- ADD MANUAL (EAN) MODAL -->
{#if showAddManualModal}
<div class="modal-bg" on:click={() => showAddManualModal = false} on:keydown={() => {}} role="button" tabindex="0">
    <div class="modal" on:click|stopPropagation>
        <div class="modal-head"><h3>📦 Pridať produkt cez EAN</h3><button on:click={() => showAddManualModal = false}>&times;</button></div>
        <div class="modal-body">
            <div class="form-group">
                <label>EAN / GTIN kód produktu</label>
                <div class="ean-input-row">
                    <input type="text" placeholder="8594000000000" bind:value={manualEan} on:keypress={(e) => e.key === 'Enter' && searchByEan()}>
                    <button class="btn blue" on:click={searchByEan} disabled={searchingEan}>
                        {searchingEan ? '...' : '🔍 Hľadať'}
                    </button>
                </div>
                {#if eanError}<p class="ean-error">{eanError}</p>{/if}
            </div>
            
            {#if eanProduct}
                <div class="ean-result">
                    <div class="ean-product">
                        <img src={eanProduct.image_url || placeholder} alt="">
                        <div>
                            <strong>{eanProduct.title || eanProduct.name}</strong>
                            <small>ID: {eanProduct.id}</small>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Vaša predajná cena (€) *</label>
                        <input type="number" step="0.01" bind:value={manualPrice} placeholder="0.00" required>
                    </div>
                    
                    <div class="form-group">
                        <label>URL produktu vo vašom obchode</label>
                        <input type="url" bind:value={manualUrl} placeholder="https://vaseshop.sk/produkt/...">
                    </div>
                </div>
            {/if}
        </div>
        <div class="modal-foot">
            <button class="btn gray" on:click={() => showAddManualModal = false}>Zrušiť</button>
            {#if eanProduct}
                <button class="btn green" on:click={connectWithEan} disabled={saving || !manualPrice}>
                    {saving ? 'Pridávam...' : '✓ Pridať produkt'}
                </button>
            {/if}
        </div>
    </div>
</div>
{/if}

<!-- EDIT MODAL (with Category tab) -->
{#if showEditModal && currentProduct}
<div class="modal-bg" on:click={() => showEditModal = false} on:keydown={() => {}} role="button" tabindex="0">
    <div class="modal wide" on:click|stopPropagation>
        <div class="modal-head"><h3>✏️ Upraviť ponuku</h3><button on:click={() => showEditModal = false}>&times;</button></div>
        
        <div class="tabs">
            <button class:active={editTab === 'price'} on:click={() => editTab = 'price'}>💰 Cena & URL</button>
            <button class:active={editTab === 'category'} on:click={() => editTab = 'category'}>🏷️ Kategória</button>
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
            
            {#if editTab === 'price'}
                <div class="section-title">💰 Predajná cena</div>
                <div class="form-group">
                    <label>Aktuálna predajná cena (€) <span class="instant">⚡ Okamžite</span></label>
                    <input type="number" step="0.01" bind:value={currentProduct.price} required>
                    <small class="hint">Táto cena sa zobrazí zákazníkom na stránke produktu</small>
                </div>
                
                <div class="section-title">
                    📊 Automatické prispôsobenie ceny
                    <span class="info-icon" title="Systém automaticky sleduje ceny konkurencie. Ak konkurencia zníži cenu, vaša cena sa automaticky prispôsobí v rámci nastaveného rozsahu. Nikdy neklesne pod minimum a neprekročí maximum.">ⓘ</span>
                </div>
                <div class="price-info-box">
                    <p>Nastavte cenové rozpätie, v ktorom sa bude vaša cena <strong>automaticky prispôsobovať</strong> podľa konkurencie:</p>
                    <ul>
                        <li>Ak konkurencia zníži cenu — vaša cena sa primerane zníži</li>
                        <li>Ak konkurencia zvýši cenu — vaša cena sa primerane zvýši</li>
                        <li>Cena nikdy neklesne pod <strong>minimum</strong> a neprekročí <strong>maximum</strong></li>
                    </ul>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Minimálna cena (€)</label>
                        <input type="number" step="0.01" bind:value={currentProduct.min_price} placeholder="Najnižšia možná">
                    </div>
                    <div class="form-group">
                        <label>Maximálna cena (€)</label>
                        <input type="number" step="0.01" bind:value={currentProduct.max_price} placeholder="Najvyššia možná">
                    </div>
                </div>
                
                <div class="section-title">🔗 URL do vášho obchodu</div>
                <div class="form-group">
                    <label>Odkaz na produkt vo vašom e-shope</label>
                    <input type="url" bind:value={currentProduct.affiliate_url} placeholder="https://vaseshop.sk/produkt/...">
                    <small class="hint">Po kliknutí na „Kúpiť" bude zákazník presmerovaný na túto adresu</small>
                </div>
            {:else}
                <p style="margin:0 0 12px;font-size:13px;color:#64748b">Aktuálna kategória: <strong>{currentProduct.category || 'Bez kategórie'}</strong></p>
                
                <div class="form-group">
                    <label>Vyhľadať kategóriu</label>
                    <input type="text" placeholder="Začnite písať názov..." bind:value={categorySearchQuery} on:input={searchCategories}>
                </div>
                
                {#if searchingCategories}
                    <p class="searching">Hľadám...</p>
                {:else if categorySearchQuery.length >= 2 && categoryResults.length > 0}
                    <div class="results">
                        {#each categoryResults as cat}
                            <div class="result" class:selected={selectedCategory?.id === cat.id} on:click={() => selectedCategory = cat} on:keydown={() => {}} role="button" tabindex="0">
                                <div>
                                    <strong>{cat.path || cat.name}</strong>
                                    <br><small>{cat.product_count} produktov</small>
                                </div>
                                {#if selectedCategory?.id === cat.id}<span style="color:#10b981">✓</span>{/if}
                            </div>
                        {/each}
                    </div>
                {:else if categorySearchQuery.length >= 2}
                    <p class="noresults">Žiadne výsledky</p>
                {/if}
                
                <!-- Category tree toggle -->
                <div class="tree-toggle">
                    <button class="btn-link" on:click={toggleCategoryTree}>
                        {showCategoryTree ? '▼' : '▶'} Zobraziť celý strom kategórií
                    </button>
                </div>
                
                {#if showCategoryTree}
                    {#if loadingTree}
                        <p class="searching">Načítavam strom kategórií...</p>
                    {:else}
                        <div class="cat-tree">
                            {#each categoryTree as cat}
                                <div class="tree-item depth-{cat.depth}" class:selected={selectedCategory?.id === cat.id}
                                     on:click={() => selectedCategory = cat} on:keydown={() => {}} role="button" tabindex="0">
                                    <span class="tree-indent">{#each Array(cat.depth) as _}{'  '}{/each}{cat.depth > 0 ? '└ ' : ''}</span>
                                    <span class="tree-name">{cat.name}</span>
                                    <span class="tree-count">{cat.product_count}</span>
                                    {#if selectedCategory?.id === cat.id}<span class="tree-check">✓</span>{/if}
                                </div>
                            {/each}
                        </div>
                    {/if}
                {/if}
                
                {#if selectedCategory}
                    <div class="selected-cat">Nová kategória: <strong>{selectedCategory.path || selectedCategory.name}</strong></div>
                    <div class="form-group">
                        <label>Poznámka (voliteľné)</label>
                        <input type="text" placeholder="Prečo chcete zmeniť kategóriu..." bind:value={categoryNote}>
                    </div>
                    <div class="ai-info">
                        ℹ️ Žiadosť o zmenu kategórie bude odoslaná administrátorovi na schválenie.
                    </div>
                {/if}
            {/if}
        </div>
        <div class="modal-foot">
            <button class="btn gray" on:click={() => showEditModal = false}>Zrušiť</button>
            {#if editTab === 'price'}
                <button class="btn blue" on:click={saveProduct} disabled={saving}>{saving ? 'Ukladám...' : '💾 Uložiť zmeny'}</button>
            {:else if selectedCategory}
                <button class="btn blue" on:click={submitCategoryRequest} disabled={savingRequest}>
                    {savingRequest ? 'Odosielam...' : '📩 Odoslať žiadosť'}
                </button>
            {/if}
        </div>
    </div>
</div>
{/if}

<style>
    .page { width: 100%; }
    
    .loading-box, .error-box { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; gap: 12px; color: #64748b; background: white; border-radius: 12px; padding: 40px; }
    .error-box { background: #fef2f2; }
    .error-icon { font-size: 48px; }
    .error-box h3 { margin: 0; color: #991b1b; }
    .error-box p { margin: 0; color: #dc2626; }
    
    .spinner { width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    /* Empty State */
    .empty-state { background: white; border-radius: 12px; padding: 60px 40px; text-align: center; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; }
    .empty-state h3 { font-size: 20px; color: #1f2937; margin: 0 0 8px 0; }
    .empty-state > p { color: #6b7280; margin: 0 0 32px 0; }
    
    .empty-options { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; max-width: 600px; margin: 0 auto 24px; }
    .empty-option { padding: 24px; background: #f8fafc; border: 2px solid #e5e7eb; border-radius: 12px; cursor: pointer; transition: all 0.2s; text-align: left; }
    .empty-option:hover { border-color: #3b82f6; background: #eff6ff; }
    .option-icon { font-size: 32px; display: block; margin-bottom: 12px; }
    .empty-option h4 { margin: 0 0 8px 0; font-size: 15px; color: #1f2937; }
    .empty-option p { margin: 0; font-size: 13px; color: #6b7280; }
    
    .empty-hint { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #0369a1; max-width: 400px; margin: 0 auto; }
    .empty-hint a { color: #0284c7; font-weight: 600; }
    
    .free-banner { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; color: #92400e; }
    .free-banner a { color: #d97706; font-weight: 600; margin-left: 12px; }
    
    .stats { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
    .stat { flex: 1; min-width: 110px; padding: 12px 14px; background: #fff; border: 1px solid #e8ebef; border-radius: 10px; cursor: pointer; text-align: left; transition: all 0.15s; position: relative; overflow: hidden; }
    .stat::before { content: ''; position: absolute; top: 0; left: 0; width: 3px; height: 100%; border-radius: 0 3px 3px 0; opacity: 0; transition: opacity 0.15s; }
    .stat:hover::before { opacity: 1; }
    .stat:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); transform: translateY(-1px); }
    .stat:nth-child(1)::before { background: #6366f1; } .stat:nth-child(2)::before { background: #10b981; }
    .stat:nth-child(3)::before { background: #f59e0b; } .stat:nth-child(4)::before { background: #ef4444; } .stat:nth-child(5)::before { background: #06b6d4; }
    .stat.active { border-color: #3b82f6; background: #f0f7ff; }
    .stat .num { display: block; font-size: 18px; font-weight: 800; color: #0f172a; line-height: 1.1; }
    .stat .lbl { font-size: 11px; color: #94a3b8; font-weight: 500; margin-top: 2px; display: block; }
    .stat.disabled { opacity: 0.6; }
    
    .toolbar { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
    .toolbar input { flex: 1; min-width: 200px; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 6px; }
    .toolbar select { padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; background: #fff; }
    
    .btn { padding: 10px 16px; border: none; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; }
    .btn.blue { background: #3b82f6; color: #fff; }
    .btn.gray { background: #f1f5f9; color: #475569; }
    .btn.green { background: #10b981; color: #fff; }
    .btn.small { padding: 6px 12px; font-size: 12px; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    
    .action-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
    .action-buttons { display: flex; gap: 8px; }
    .info { color: #64748b; font-size: 13px; }
    
    .table-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; min-width: 900px; }
    th { padding: 12px; text-align: left; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
    td { padding: 6px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    tr:hover { background: #f8fafc; }
    .thumb { width: 34px; height: 34px; object-fit: cover; border-radius: 4px; }
    .name { max-width: 180px; } .name strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    code { background: #f1f5f9; padding: 3px 6px; border-radius: 4px; font-size: 11px; }
    .price { font-weight: 600; color: #059669; }
    .center { text-align: center; }
    .stock { font-size: 12px; font-weight: 500; } .stock.in { color: #10b981; } .stock.out { color: #ef4444; }
    .cat { background: #eff6ff; color: #3b82f6; padding: 3px 8px; border-radius: 12px; font-size: 11px; }
    .nocat { color: #ef4444; font-size: 12px; }
    
    .actions { display: flex; flex-direction: column; gap: 4px; }
    .actions { display: flex; gap: 3px; align-items: center; }
    .actions button, .actions .action-link { padding: 4px 8px; border: 1px solid #e2e8f0; background: #fff; border-radius: 4px; font-size: 11px; cursor: pointer; white-space: nowrap; text-decoration: none; color: inherit; display: inline-block; transition: all 0.15s; }
    .actions button:hover, .actions .action-link:hover { background: #f1f5f9; border-color: #3b82f6; }
    .actions .action-link { color: #3b82f6; }
    .actions button.red { color: #94a3b8; border-color: #f1f5f9; }
    .actions button.red:hover { background: #fef2f2; border-color: #ef4444; color: #dc2626; }
    
    .pagination { display: flex; gap: 4px; justify-content: center; align-items: center; padding: 16px; flex-wrap: wrap; }
    .pagination button { padding: 8px 12px; border: 1px solid #e2e8f0; background: #fff; border-radius: 4px; cursor: pointer; }
    .pagination button.active { background: #3b82f6; color: #fff; border-color: #3b82f6; }
    .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
    .pagination .dots { padding: 8px 4px; color: #94a3b8; }
    .pagination .page-info { margin-left: 12px; font-size: 13px; color: #64748b; }
    
    /* Modals */
    .modal-bg { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; }
    .modal { background: #fff; border-radius: 10px; width: 90%; max-width: 480px; max-height: 85vh; overflow: hidden; }
    .modal.wide { max-width: 700px; }
    .modal-head { padding: 14px 18px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; }
    .modal-head h3 { margin: 0; font-size: 15px; }
    .modal-head button { background: none; border: none; font-size: 22px; cursor: pointer; color: #94a3b8; }
    .modal-body { padding: 18px; max-height: calc(85vh - 120px); overflow-y: auto; }
    .modal-foot { padding: 12px 18px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 8px; }
    
    .tabs { display: flex; border-bottom: 1px solid #e2e8f0; }
    .tabs button { flex: 1; padding: 10px; border: none; background: none; font-size: 13px; font-weight: 500; color: #64748b; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; }
    .tabs button.active { color: #3b82f6; border-bottom-color: #3b82f6; background: #f8fafc; }
    .tabs button:hover { background: #f8fafc; }
    
    .selected-cat { background: #d1fae5; color: #065f46; padding: 8px 12px; border-radius: 6px; font-size: 13px; margin: 10px 0; }
    .preview-cat { font-size: 11px; color: #3b82f6; background: #eff6ff; padding: 1px 6px; border-radius: 8px; display: inline-block; margin-top: 2px; }
    
    /* EAN Modal */
    .ean-input-row { display: flex; gap: 8px; }
    .ean-input-row input { flex: 1; }
    .ean-error { color: #dc2626; font-size: 13px; margin: 8px 0 0 0; }
    .ean-result { margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
    .ean-product { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; margin-bottom: 16px; }
    .ean-product img { width: 50px; height: 50px; object-fit: cover; border-radius: 6px; }
    .ean-product strong { display: block; font-size: 14px; }
    .ean-product small { color: #6b7280; font-size: 11px; }
    
    /* Product preview */
    .product-preview { display: flex; align-items: center; gap: 14px; padding: 14px; background: #f8fafc; border-radius: 8px; margin-bottom: 18px; border: 1px solid #e2e8f0; }
    .preview-img { width: 70px; height: 70px; object-fit: contain; border-radius: 6px; background: #fff; border: 1px solid #e2e8f0; }
    .preview-info h4 { margin: 0 0 4px 0; font-size: 14px; color: #1e293b; }
    .preview-id { font-size: 11px; color: #94a3b8; font-family: monospace; }
    
    .section-title { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin: 18px 0 12px 0; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }
    .ai-info { font-size: 13px; color: #64748b; margin: 0 0 12px 0; background: #f0f9ff; padding: 10px 12px; border-radius: 6px; }
    
    .form-group { margin-bottom: 14px; }
    .form-group label { display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 6px; }
    .form-group input { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; }
    .form-group input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
    .form-row { display: flex; gap: 12px; }
    .form-row .form-group { flex: 1; }
    .hint { display: block; font-size: 11px; color: #94a3b8; margin-top: 4px; }
    .instant { background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; font-size: 10px; }
    
    .results { max-height: 280px; overflow-y: auto; }
    .result { display: flex; align-items: center; gap: 10px; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 6px; cursor: pointer; }
    .result:hover { background: #f8fafc; border-color: #3b82f6; }
    .result img { width: 40px; height: 40px; object-fit: cover; border-radius: 4px; }
    .result div { flex: 1; } .result strong { font-size: 13px; } .result small { color: #64748b; font-size: 11px; }
    .searching, .noresults { text-align: center; padding: 20px; color: #64748b; }
    .free-notice { background: #fef3c7; padding: 16px; border-radius: 6px; text-align: center; color: #92400e; }
    .free-notice a { color: #d97706; font-weight: 600; }
    
    /* Action link */
    .result.selected { background: #f0fdf4; border-color: #10b981; }
    
    .clickable { cursor: pointer; transition: all 0.15s; }
    .clickable:hover { color: #3b82f6; text-decoration: underline; }
    .ean { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 11px; color: #475569; }
    
    .price-info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; margin-bottom: 14px; font-size: 12px; color: #475569; line-height: 1.6; }
    .price-info-box p { margin: 0 0 6px 0; }
    .price-info-box ul { margin: 0; padding-left: 18px; }
    .price-info-box li { margin-bottom: 2px; }
    
    .info-icon { display: inline-block; width: 16px; height: 16px; line-height: 16px; text-align: center; background: #e2e8f0; color: #64748b; border-radius: 50%; font-size: 10px; cursor: help; margin-left: 4px; vertical-align: middle; }
    
    .tree-toggle { margin: 12px 0 8px; }
    .btn-link { background: none; border: none; color: #3b82f6; cursor: pointer; font-size: 13px; padding: 4px 0; font-weight: 500; }
    .btn-link:hover { text-decoration: underline; }
    .cat-tree { max-height: 300px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; }
    .tree-item { display: flex; align-items: center; padding: 6px 10px; cursor: pointer; font-size: 12px; border-bottom: 1px solid #f8fafc; transition: background 0.1s; }
    .tree-item:hover { background: #f0f9ff; }
    .tree-item.selected { background: #d1fae5; }
    .tree-indent { white-space: pre; color: #cbd5e1; font-family: monospace; font-size: 11px; }
    .tree-name { flex: 1; }
    .tree-count { color: #94a3b8; font-size: 10px; margin: 0 8px; }
    .tree-check { color: #10b981; font-weight: 700; }
    .depth-0 .tree-name { font-weight: 600; }
    .depth-1 { padding-left: 20px; }
    .depth-2 { padding-left: 36px; }
    .depth-3 { padding-left: 52px; }
    .depth-4 { padding-left: 68px; }
    
    /* Message banner */
    .msg-banner { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-radius: 8px; margin-bottom: 12px; font-size: 14px; }
    .msg-banner.success { background: #d1fae5; color: #065f46; }
    .msg-banner.error { background: #fee2e2; color: #991b1b; }
    .msg-banner button { background: none; border: none; font-size: 18px; cursor: pointer; opacity: 0.6; }
    
    @media (max-width: 768px) {
        .stats { flex-direction: column; }
        .toolbar { flex-direction: column; }
        .form-row { flex-direction: column; }
        .empty-options { grid-template-columns: 1fr; }
    }
</style>
