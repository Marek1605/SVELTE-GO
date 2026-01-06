<script>
    import { onMount } from 'svelte';
    import { api } from '$lib/api';
    
    let products = [];
    let total = 0;
    let page = 1;
    let limit = 20;
    let totalPages = 1;
    let loading = true;
    let searchQuery = '';
    
    async function loadProducts() {
        loading = true;
        try {
            const params = `page=${page}&limit=${limit}${searchQuery ? '&search=' + encodeURIComponent(searchQuery) : ''}`;
            const result = await api.getProducts(params);
            
            if (result?.success && result?.data) {
                products = result.data.items || result.data || [];
                total = result.data.total || products.length;
                totalPages = result.data.pages || Math.ceil(total / limit);
            } else if (result?.items) {
                products = result.items;
                total = result.total || products.length;
                totalPages = result.pages || Math.ceil(total / limit);
            } else if (Array.isArray(result)) {
                products = result;
                total = result.length;
            }
        } catch (err) {
            console.error('Error loading products:', err);
            products = [];
        }
        loading = false;
    }
    
    function handleSearch() {
        page = 1;
        loadProducts();
    }
    
    function goToPage(p) {
        if (p < 1 || p > totalPages) return;
        page = p;
        loadProducts();
    }
    
    onMount(() => {
        loadProducts();
    });
</script>

<svelte:head>
    <title>Produkty | Admin | MegaPrice</title>
</svelte:head>

<div class="admin-page">
    <div class="admin-header">
        <h1 class="admin-title">Produkty</h1>
        <span class="admin-count">Celkom {total.toLocaleString()} produktov</span>
    </div>
    
    <!-- Search -->
    <div class="admin-toolbar">
        <form class="admin-search" on:submit|preventDefault={handleSearch}>
            <input 
                type="text" 
                placeholder="Hľadať produkty..."
                bind:value={searchQuery}
            >
            <button type="submit">🔍</button>
        </form>
    </div>
    
    <!-- Products Table -->
    <div class="admin-table-wrap">
        {#if loading}
            <div class="admin-loading">Načítavam produkty...</div>
        {:else if products.length === 0}
            <div class="admin-empty">
                <span class="admin-empty__icon">📦</span>
                <p>Žiadne produkty</p>
            </div>
        {:else}
            <table class="admin-table">
                <thead>
                    <tr>
                        <th><input type="checkbox"></th>
                        <th>Produkt</th>
                        <th>Kategória</th>
                        <th>Cena</th>
                        <th>Ponuky</th>
                        <th>Stav</th>
                        <th>Akcie</th>
                    </tr>
                </thead>
                <tbody>
                    {#each products as product}
                        <tr>
                            <td><input type="checkbox"></td>
                            <td>
                                <div class="product-cell">
                                    <div class="product-cell__image">
                                        {#if product.image_url}
                                            <img src={product.image_url} alt="">
                                        {:else}
                                            <span>📷</span>
                                        {/if}
                                    </div>
                                    <div class="product-cell__info">
                                        <a href="/admin/products/{product.id}" class="product-cell__title">
                                            {product.title}
                                        </a>
                                        {#if product.brand}
                                            <span class="product-cell__brand">{product.brand}</span>
                                        {/if}
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="badge">{product.category_name || '-'}</span>
                            </td>
                            <td>
                                <strong>{(product.price_min || product.price || 0).toFixed(2)} €</strong>
                            </td>
                            <td>
                                <span class="badge badge--info">{product.offer_count || 1}</span>
                            </td>
                            <td>
                                <span class="badge badge--success">Aktívny</span>
                            </td>
                            <td>
                                <div class="actions">
                                    <a href="/produkt/{product.slug}" target="_blank" class="btn btn--sm">👁️</a>
                                    <a href="/admin/products/{product.id}" class="btn btn--sm">✏️</a>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
            
            <!-- Pagination -->
            {#if totalPages > 1}
                <div class="pagination">
                    <button class="pagination__btn" disabled={page === 1} on:click={() => goToPage(page - 1)}>
                        ← Predošlá
                    </button>
                    <span class="pagination__info">Strana {page} z {totalPages}</span>
                    <button class="pagination__btn" disabled={page === totalPages} on:click={() => goToPage(page + 1)}>
                        Ďalšia →
                    </button>
                </div>
            {/if}
        {/if}
    </div>
</div>

<style>
.admin-page {
    max-width: 1400px;
}

.admin-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
}

.admin-title {
    font-size: 28px;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
}

.admin-count {
    font-size: 14px;
    color: #64748b;
    background: #f1f5f9;
    padding: 6px 12px;
    border-radius: 20px;
}

/* Toolbar */
.admin-toolbar {
    margin-bottom: 20px;
}

.admin-search {
    display: flex;
    max-width: 400px;
}

.admin-search input {
    flex: 1;
    padding: 12px 16px;
    border: 2px solid #e2e8f0;
    border-right: none;
    border-radius: 8px 0 0 8px;
    font-size: 14px;
    outline: none;
}

.admin-search input:focus {
    border-color: #c4956a;
}

.admin-search button {
    padding: 12px 20px;
    background: #c4956a;
    border: none;
    border-radius: 0 8px 8px 0;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
}

/* Table */
.admin-table-wrap {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    overflow: hidden;
}

.admin-loading, .admin-empty {
    text-align: center;
    padding: 60px 20px;
    color: #64748b;
}

.admin-empty__icon {
    font-size: 48px;
    display: block;
    margin-bottom: 12px;
}

.admin-table {
    width: 100%;
    border-collapse: collapse;
}

.admin-table th {
    text-align: left;
    padding: 14px 16px;
    background: #f8fafc;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    color: #64748b;
    border-bottom: 1px solid #e2e8f0;
}

.admin-table td {
    padding: 14px 16px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 14px;
    vertical-align: middle;
}

.admin-table tr:hover {
    background: #fafafa;
}

/* Product Cell */
.product-cell {
    display: flex;
    align-items: center;
    gap: 12px;
}

.product-cell__image {
    width: 50px;
    height: 50px;
    background: #f8fafc;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
}

.product-cell__image img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.product-cell__title {
    font-weight: 500;
    color: #1e293b;
    text-decoration: none;
    display: block;
    margin-bottom: 2px;
}

.product-cell__title:hover {
    color: #c4956a;
}

.product-cell__brand {
    font-size: 12px;
    color: #64748b;
}

/* Badge */
.badge {
    display: inline-block;
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 6px;
    background: #f1f5f9;
    color: #475569;
}

.badge--success {
    background: #dcfce7;
    color: #166534;
}

.badge--info {
    background: #dbeafe;
    color: #1e40af;
}

/* Actions */
.actions {
    display: flex;
    gap: 6px;
}

.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 12px;
    background: #f1f5f9;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    text-decoration: none;
    cursor: pointer;
    transition: background 0.15s;
}

.btn:hover {
    background: #e2e8f0;
}

.btn--sm {
    padding: 6px 10px;
}

/* Pagination */
.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 20px;
    border-top: 1px solid #f1f5f9;
}

.pagination__btn {
    padding: 8px 16px;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s;
}

.pagination__btn:hover:not(:disabled) {
    background: #f8fafc;
    border-color: #c4956a;
}

.pagination__btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.pagination__info {
    font-size: 14px;
    color: #64748b;
}

@media (max-width: 1024px) {
    .admin-table {
        font-size: 13px;
    }
    .admin-table th, .admin-table td {
        padding: 10px 12px;
    }
}
</style>
