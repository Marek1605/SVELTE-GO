<script>
    import { onMount } from 'svelte';
    
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
    
    let offers = [];
    let shops = [];
    let loading = true;
    let total = 0;
    let page = 1;
    let limit = 50;
    let totalPages = 1;
    
    // Filters
    let selectedShop = '';
    let searchQuery = '';
    let statusFilter = '';
    
    onMount(async () => {
        await Promise.all([loadOffers(), loadShops()]);
    });
    
    async function loadShops() {
        try {
            const res = await fetch(`${API_BASE}/admin/shops`);
            const data = await res.json();
            if (data.success) {
                shops = data.data || [];
            }
        } catch (e) {
            console.error('Error loading shops:', e);
        }
    }
    
    async function loadOffers() {
        loading = true;
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });
            if (selectedShop) params.append('shop_id', selectedShop);
            if (searchQuery) params.append('search', searchQuery);
            if (statusFilter) params.append('status', statusFilter);
            
            const res = await fetch(`${API_BASE}/admin/vendor-offers?${params}`);
            const data = await res.json();
            
            if (data.success) {
                offers = data.data || [];
                total = data.meta?.total || offers.length;
                totalPages = Math.ceil(total / limit);
            }
        } catch (e) {
            console.error('Error loading offers:', e);
        }
        loading = false;
    }
    
    function formatPrice(price) {
        return new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR' }).format(price || 0);
    }
    
    function handleSearch() {
        page = 1;
        loadOffers();
    }
    
    function prevPage() {
        if (page > 1) {
            page--;
            loadOffers();
        }
    }
    
    function nextPage() {
        if (page < totalPages) {
            page++;
            loadOffers();
        }
    }
    
    function getShopName(shopId) {
        const shop = shops.find(s => s.id === shopId);
        return shop?.shop_name || 'Neznámy';
    }
</script>

<div class="page">
    <div class="header">
        <h1>🏪 Ponuky vendorov</h1>
        <p class="subtitle">Všetky ponuky od predajcov napárované na master produkty</p>
    </div>
    
    <!-- Stats -->
    <div class="stats-row">
        <div class="stat-card">
            <span class="stat-value">{total}</span>
            <span class="stat-label">Celkom ponúk</span>
        </div>
        <div class="stat-card">
            <span class="stat-value">{shops.length}</span>
            <span class="stat-label">Obchodov</span>
        </div>
    </div>
    
    <!-- Filters -->
    <div class="filters">
        <input 
            type="text" 
            placeholder="Hľadať (názov, EAN...)" 
            bind:value={searchQuery}
            on:keypress={(e) => e.key === 'Enter' && handleSearch()}
        />
        
        <select bind:value={selectedShop} on:change={handleSearch}>
            <option value="">Všetky obchody</option>
            {#each shops as shop}
                <option value={shop.id}>{shop.shop_name}</option>
            {/each}
        </select>
        
        <select bind:value={statusFilter} on:change={handleSearch}>
            <option value="">Všetky stavy</option>
            <option value="active">Aktívne</option>
            <option value="inactive">Neaktívne</option>
        </select>
        
        <button class="btn primary" on:click={handleSearch}>🔍 Filtrovať</button>
    </div>
    
    <!-- Table -->
    {#if loading}
        <div class="loading">Načítavam...</div>
    {:else if offers.length === 0}
        <div class="empty">
            <p>😔 Žiadne ponuky nenájdené</p>
        </div>
    {:else}
        <div class="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>Obrázok</th>
                        <th>Produkt</th>
                        <th>Obchod</th>
                        <th>Cena</th>
                        <th>Stav skladu</th>
                        <th>Status</th>
                        <th>EAN</th>
                    </tr>
                </thead>
                <tbody>
                    {#each offers as offer}
                        <tr>
                            <td class="img-cell">
                                {#if offer.image_url}
                                    <img src={offer.image_url} alt="" />
                                {:else}
                                    <div class="no-img">📦</div>
                                {/if}
                            </td>
                            <td>
                                <div class="product-title">{offer.title || 'Bez názvu'}</div>
                                {#if offer.product_title && offer.product_title !== offer.title}
                                    <div class="master-title">Master: {offer.product_title}</div>
                                {/if}
                            </td>
                            <td>
                                <span class="shop-badge">{offer.shop_name || getShopName(offer.shop_id)}</span>
                            </td>
                            <td class="price">{formatPrice(offer.price)}</td>
                            <td>
                                <span class="stock-badge" class:instock={offer.stock_status === 'instock'}>
                                    {offer.stock_status === 'instock' ? '✓ Skladom' : '✗ Nedostupné'}
                                </span>
                            </td>
                            <td>
                                <span class="status-badge" class:active={offer.status === 'active' || offer.is_active}>
                                    {offer.status === 'active' || offer.is_active ? 'Aktívna' : 'Neaktívna'}
                                </span>
                            </td>
                            <td class="ean">{offer.ean || '-'}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        
        <!-- Pagination -->
        <div class="pagination">
            <button on:click={prevPage} disabled={page <= 1}>← Predchádzajúca</button>
            <span>Strana {page} z {totalPages} ({total} ponúk)</span>
            <button on:click={nextPage} disabled={page >= totalPages}>Nasledujúca →</button>
        </div>
    {/if}
</div>

<style>
    .page {
        padding: 20px;
        max-width: 1400px;
        margin: 0 auto;
    }
    
    .header h1 {
        margin: 0 0 5px;
        font-size: 24px;
    }
    
    .subtitle {
        color: #666;
        margin: 0 0 20px;
    }
    
    .stats-row {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
    }
    
    .stat-card {
        background: #fff;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 15px 25px;
        display: flex;
        flex-direction: column;
    }
    
    .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: #2563eb;
    }
    
    .stat-label {
        font-size: 13px;
        color: #666;
    }
    
    .filters {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
        flex-wrap: wrap;
    }
    
    .filters input, .filters select {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
    }
    
    .filters input {
        min-width: 200px;
    }
    
    .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
    }
    
    .btn.primary {
        background: #2563eb;
        color: white;
    }
    
    .table-wrapper {
        background: #fff;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        overflow: hidden;
    }
    
    table {
        width: 100%;
        border-collapse: collapse;
    }
    
    th, td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #eee;
    }
    
    th {
        background: #f8f9fa;
        font-weight: 600;
        font-size: 13px;
        color: #555;
    }
    
    .img-cell {
        width: 60px;
    }
    
    .img-cell img {
        width: 50px;
        height: 50px;
        object-fit: contain;
        border-radius: 4px;
        background: #f5f5f5;
    }
    
    .no-img {
        width: 50px;
        height: 50px;
        background: #f5f5f5;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
    }
    
    .product-title {
        font-weight: 500;
        max-width: 300px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    
    .master-title {
        font-size: 11px;
        color: #888;
        margin-top: 2px;
    }
    
    .shop-badge {
        background: #e0f2fe;
        color: #0369a1;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
    }
    
    .price {
        font-weight: 600;
        color: #16a34a;
    }
    
    .stock-badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        background: #fee2e2;
        color: #dc2626;
    }
    
    .stock-badge.instock {
        background: #dcfce7;
        color: #16a34a;
    }
    
    .status-badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        background: #f3f4f6;
        color: #6b7280;
    }
    
    .status-badge.active {
        background: #dbeafe;
        color: #2563eb;
    }
    
    .ean {
        font-family: monospace;
        font-size: 12px;
        color: #666;
    }
    
    .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
        padding: 20px;
    }
    
    .pagination button {
        padding: 8px 16px;
        border: 1px solid #ddd;
        background: #fff;
        border-radius: 6px;
        cursor: pointer;
    }
    
    .pagination button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .loading, .empty {
        text-align: center;
        padding: 60px 20px;
        color: #666;
    }
    
    .empty p {
        font-size: 18px;
    }
</style>
