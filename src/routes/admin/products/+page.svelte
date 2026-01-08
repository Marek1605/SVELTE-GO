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
            
            if (data.success && data.data) {
                products = data.data.items || data.data || [];
                totalCount = data.data.total || products.length;
            } else {
                products = [];
                totalCount = 0;
            }
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
            if (data.success && data.data) {
                categories = data.data.items || data.data || [];
            }
        } catch (err) {
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
        currentPage = 1;
        loadProducts();
    }

    function changePage(page) {
        currentPage = page;
        loadProducts();
    }

    function formatPrice(price) {
        if (!price) return '-';
        return price.toFixed(2) + ' €';
    }

    $: totalPages = Math.ceil(totalCount / perPage);
</script>

<div class="products-page">
    <div class="page-header">
        <h1>Produkty</h1>
        <p>{totalCount} produktov celkom</p>
    </div>

    <div class="filters">
        <input type="text" placeholder="Hľadať..." bind:value={searchQuery}>
        <select bind:value={selectedCategory}>
            <option value="">Všetky kategórie</option>
            {#each categories as cat}
                <option value={cat.slug}>{cat.name}</option>
            {/each}
        </select>
        <input type="number" placeholder="Cena od" bind:value={priceMin}>
        <input type="number" placeholder="Cena do" bind:value={priceMax}>
        <button on:click={applyFilters}>Filtrovať</button>
        <button on:click={resetFilters}>Reset</button>
    </div>

    <div class="table-wrap">
        {#if loading}
            <p>Načítavam...</p>
        {:else if products.length === 0}
            <p>Žiadne produkty</p>
        {:else}
            <table>
                <thead>
                    <tr>
                        <th>Obrázok</th>
                        <th>Názov</th>
                        <th>Kategória</th>
                        <th>Značka</th>
                        <th>Cena</th>
                        <th>EAN</th>
                    </tr>
                </thead>
                <tbody>
                    {#each products as p}
                        <tr>
                            <td><img src={p.image_url} alt="" style="width:50px;height:50px;object-fit:contain"></td>
                            <td>{p.title || p.name}</td>
                            <td>{p.category_name || '-'}</td>
                            <td>{p.brand || '-'}</td>
                            <td>{formatPrice(p.price_min)}</td>
                            <td>{p.ean || '-'}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}
    </div>

    {#if totalPages > 1}
        <div class="pagination">
            <button disabled={currentPage === 1} on:click={() => changePage(currentPage - 1)}>Predošlá</button>
            <span>Strana {currentPage} z {totalPages}</span>
            <button disabled={currentPage === totalPages} on:click={() => changePage(currentPage + 1)}>Ďalšia</button>
        </div>
    {/if}
</div>

<style>
.products-page { padding: 24px; }
.page-header h1 { margin: 0; }
.page-header p { color: #64748b; margin: 4px 0 20px; }
.filters { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
.filters input, .filters select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; }
.filters button { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; background: #b8860b; color: white; }
.filters button:last-child { background: #e2e8f0; color: #333; }
.table-wrap { background: white; border-radius: 12px; overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; padding: 12px; background: #f8fafc; font-size: 12px; text-transform: uppercase; color: #64748b; }
td { padding: 12px; border-bottom: 1px solid #f1f5f9; }
tr:hover { background: #fafafa; }
.pagination { display: flex; justify-content: center; gap: 16px; align-items: center; margin-top: 20px; }
.pagination button { padding: 8px 16px; border: 1px solid #ddd; border-radius: 6px; background: white; cursor: pointer; }
.pagination button:disabled { opacity: 0.5; }
</style>
