<script>
    import { onMount } from 'svelte';
    import { PUBLIC_API_URL } from '$env/static/public';

    const API_BASE = PUBLIC_API_URL || '';

    let products = [];
    let categories = [];
    let loading = true;
    let totalCount = 0;
    let currentPage = 1;
    let perPage = 20;

    // Filtre
    let searchQuery = '';
    let selectedCategory = '';
    let priceMin = '';
    let priceMax = '';
    let sortBy = 'created_at';
    let sortOrder = 'desc';

    onMount(() => {
        loadProducts();
        loadCategories();
    });

    async function loadProducts() {
        loading = true;
        try {
            const params = new URLSearchParams();
            params.set('page', currentPage.toString());
            params.set('limit', perPage.toString());
            
            if (searchQuery) params.set('search', searchQuery);
            if (selectedCategory) params.set('category', selectedCategory);
            if (priceMin) params.set('price_min', priceMin);
            if (priceMax) params.set('price_max', priceMax);
            params.set('sort', sortBy);
            params.set('order', sortOrder);

            const res = await fetch(API_BASE + '/products?' + params.toString());
            const data = await res.json();
            
            console.log('Products API response:', data);
            
            if (data.success && data.data) {
                // API vracia {data: {items: [...], total: X}}
                if (data.data.items) {
                    products = data.data.items;
                    totalCount = data.data.total || products.length;
                } else if (Array.isArray(data.data)) {
                    products = data.data;
                    totalCount = data.pagination?.total || products.length;
                } else {
                    products = [];
                    totalCount = 0;
                }
            } else {
                products = [];
                totalCount = 0;
            }
            
            console.log('Loaded products:', products.length);
        } catch (err) {
            console.error('Error:', err);
            products = [];
        }
        loading = false;
    }

    async function loadCategories() {
        try {
            const res = await fetch(API_BASE + '/categories');
            const data = await res.json();
            console.log('Categories response:', data);
            
            if (data.success && data.data) {
                if (data.data.items) {
                    categories = data.data.items;
                } else if (Array.isArray(data.data)) {
                    categories = data.data;
                } else {
                    categories = [];
                }
            } else {
                categories = [];
            }
        } catch (err) {
            console.error('Categories error:', err);
            categories = [];
        }
    }

    function applyFilters() {
        currentPage = 1;
        loadProducts();
    }

    function resetFilters() {
        searchQuery = '';
        selectedCategory = '';
        priceMin = '';
        priceMax = '';
        sortBy = 'created_at';
        sortOrder = 'desc';
        currentPage = 1;
        loadProducts();
    }

    function changePage(page) {
        currentPage = page;
        loadProducts();
    }

    function formatPrice(price) {
        if (!price) return '-';
        return new Intl.NumberFormat('sk-SK', { 
            style: 'currency', 
            currency: 'EUR' 
        }).format(price);
    }

    $: totalPages = Math.ceil(totalCount / perPage);
</script>

<div class="products-page">
    <div class="page-header">
        <div>
            <h1>Produkty</h1>
            <p class="subtitle">{totalCount} produktov celkom</p>
        </div>
    </div>

    <!-- Filtre -->
    <div class="filters-card">
        <div class="filters-row">
            <div class="filter-group">
                <label>Hľadať</label>
                <input 
                    type="text" 
                    placeholder="Názov, EAN, značka..." 
                    bind:value={searchQuery}
                    on:keyup={(e) => e.key === 'Enter' && applyFilters()}
                >
            </div>
            
            <div class="filter-group">
                <label>Kategória</label>
                <select bind:value={selectedCategory}>
                    <option value="">Všetky kategórie</option>
                    {#each categories as cat}
                        <option value={cat.slug}>{cat.name}</option>
                    {/each}
                </select>
            </div>
            
            <div class="filter-group filter-group-small">
                <label>Cena od</label>
                <input type="number" placeholder="0" bind:value={priceMin}>
            </div>
            
            <div class="filter-group filter-group-small">
                <label>Cena do</label>
                <input type="number" placeholder="999" bind:value={priceMax}>
            </div>
            
            <div class="filter-group">
                <label>Zoradiť</label>
                <select bind:value={sortBy} on:change={applyFilters}>
                    <option value="created_at">Dátum pridania</option>
                    <option value="title">Názov</option>
                    <option value="price_min">Cena</option>
                </select>
            </div>
            
            <div class="filter-group filter-group-small">
                <label>Poradie</label>
                <select bind:value={sortOrder} on:change={applyFilters}>
                    <option value="desc">Zostupne</option>
                    <option value="asc">Vzostupne</option>
                </select>
            </div>
        </div>
        
        <div class="filters-actions">
            <button class="btn btn-primary" on:click={applyFilters}>Filtrovať</button>
            <button class="btn" on:click={resetFilters}>Zrušiť filtre</button>
        </div>
    </div>

    <!-- Tabuľka produktov -->
    <div class="table-card">
        {#if loading}
            <div class="loading">Načítavam...</div>
        {:else if products.length === 0}
            <div class="empty">Žiadne produkty</div>
        {:else}
            <table class="products-table">
                <thead>
                    <tr>
                        <th style="width: 60px">Obrázok</th>
                        <th>Názov</th>
                        <th>Kategória</th>
                        <th>Značka</th>
                        <th>Cena</th>
                        <th>EAN</th>
                    </tr>
                </thead>
                <tbody>
                    {#each products as product}
                        <tr>
                            <td>
                                {#if product.image_url}
                                    <img src={product.image_url} alt="" class="product-thumb">
                                {:else}
                                    <div class="no-image">-</div>
                                {/if}
                            </td>
                            <td>
                                <a href="/produkt/{product.slug}" target="_blank" class="product-link">
                                    {product.title || product.name || '-'}
                                </a>
                            </td>
                            <td>{product.category?.name || product.category_name || '-'}</td>
                            <td>{product.brand || '-'}</td>
                            <td>{formatPrice(product.price_min || product.price)}</td>
                            <td><code>{product.ean || '-'}</code></td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}
    </div>

    <!-- Stránkovanie -->
    {#if totalPages > 1}
        <div class="pagination">
            <button 
                class="page-btn" 
                disabled={currentPage === 1}
                on:click={() => changePage(currentPage - 1)}
            >
                Predchádzajúca
            </button>
            
            <span class="page-info">
                Strana {currentPage} z {totalPages}
            </span>
            
            <button 
                class="page-btn"
                disabled={currentPage === totalPages}
                on:click={() => changePage(currentPage + 1)}
            >
                Ďalšia
            </button>
        </div>
    {/if}
</div>

<style>
.products-page {
    padding: 24px;
    max-width: 1400px;
    margin: 0 auto;
}

.page-header {
    margin-bottom: 24px;
}

.page-header h1 {
    margin: 0;
    font-size: 28px;
    color: #1e293b;
}

.subtitle {
    margin: 4px 0 0;
    color: #64748b;
}

.filters-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.filters-row {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 16px;
}

.filter-group {
    flex: 1;
    min-width: 150px;
}

.filter-group-small {
    flex: 0.5;
    min-width: 100px;
}

.filter-group label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 6px;
}

.filter-group input,
.filter-group select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 14px;
    box-sizing: border-box;
}

.filters-actions {
    display: flex;
    gap: 12px;
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    background: #f1f5f9;
    color: #334155;
}

.btn:hover {
    background: #e2e8f0;
}

.btn-primary {
    background: #b8860b;
    color: white;
}

.btn-primary:hover {
    background: #996f0a;
}

.table-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.loading, .empty {
    text-align: center;
    padding: 60px;
    color: #64748b;
}

.products-table {
    width: 100%;
    border-collapse: collapse;
}

.products-table th {
    text-align: left;
    padding: 14px 16px;
    background: #f8fafc;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    color: #64748b;
    border-bottom: 1px solid #e2e8f0;
}

.products-table td {
    padding: 12px 16px;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
}

.products-table tr:hover {
    background: #fafafa;
}

.product-thumb {
    width: 50px;
    height: 50px;
    object-fit: contain;
    border-radius: 6px;
    background: #f8fafc;
}

.no-image {
    width: 50px;
    height: 50px;
    background: #f1f5f9;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
}

.product-link {
    color: #1e293b;
    text-decoration: none;
    font-weight: 500;
}

.product-link:hover {
    color: #b8860b;
}

code {
    background: #f1f5f9;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    color: #64748b;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    margin-top: 24px;
}

.page-btn {
    padding: 10px 20px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    font-size: 14px;
}

.page-btn:hover:not(:disabled) {
    background: #f8fafc;
}

.page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.page-info {
    color: #64748b;
    font-size: 14px;
}
</style>
