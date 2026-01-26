<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    
    const API_BASE = import.meta.env.VITE_API_URL || 'http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io/api/v1';
    
    let searchQuery = '';
    let products = [];
    let loading = false;
    let total = 0;
    let currentPage = 1;
    let perPage = 20;
    let totalPages = 1;
    let searched = false;
    
    $: query = $page.url.searchParams.get('q') || '';
    
    onMount(async () => {
        if (!browser) return;
        searchQuery = query;
        if (query) {
            await search();
        }
    });
    
    async function search() {
        if (!searchQuery.trim()) return;
        loading = true;
        searched = true;
        
        try {
            // Skúsime rôzne formáty API
            const res = await fetch(API_BASE + '/products?search=' + encodeURIComponent(searchQuery) + '&page=' + currentPage + '&limit=' + perPage);
            const data = await res.json();
            
            if (data.success) {
                products = data.data?.items || data.data?.products || data.data || [];
                total = data.data?.total || data.meta?.total || products.length;
                totalPages = Math.ceil(total / perPage) || 1;
            } else {
                products = [];
                total = 0;
            }
        } catch (e) {
            console.error('Search error:', e);
            products = [];
            total = 0;
        }
        loading = false;
    }
    
    function handleSearch(e) {
        e?.preventDefault();
        currentPage = 1;
        const url = new URL(window.location.href);
        url.searchParams.set('q', searchQuery);
        window.history.pushState({}, '', url);
        search();
    }
    
    function handlePageChange(p) {
        currentPage = p;
        search();
        window.scrollTo(0, 0);
    }
    
    function formatPrice(price) {
        return (price || 0).toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    }
</script>

<svelte:head>
    <title>{searchQuery ? 'Výsledky: ' + searchQuery : 'Vyhľadávanie'} | MegaPrice</title>
</svelte:head>

<div class="search-page">
    <div class="search-header">
        <h1>🔍 Vyhľadávanie</h1>
        <form on:submit={handleSearch} class="search-form">
            <input type="text" bind:value={searchQuery} placeholder="Hľadať produkty..." class="search-input">
            <button type="submit" class="search-btn">Hľadať</button>
        </form>
    </div>
    
    {#if searched}
    <div class="search-info">
        Výsledky pre: <strong>"{query || searchQuery}"</strong> • Nájdených <strong>{total}</strong> produktov
    </div>
    {/if}
    
    {#if loading}
    <div class="loading">
        <div class="spinner"></div>
        <p>Hľadám produkty...</p>
    </div>
    {:else if searched && products.length === 0}
    <div class="empty">
        <div class="empty-icon">🔍</div>
        <h3>Žiadne výsledky</h3>
        <p>Pre hľadaný výraz "{query || searchQuery}" sme nenašli žiadne produkty.</p>
    </div>
    {:else if products.length > 0}
    <div class="products-grid">
        {#each products as product}
        <a href="/produkt/{product.slug || product.id}" class="product-card">
            <div class="product-img">
                <img src={product.image_url || 'https://via.placeholder.com/200'} alt={product.title} on:error={(e) => e.target.src = 'https://via.placeholder.com/200'}>
            </div>
            <div class="product-info">
                <h3 class="product-title">{product.title || product.name}</h3>
                <div class="product-price">{formatPrice(product.price_min || product.price)}</div>
                {#if product.offer_count > 0}
                <div class="product-offers">{product.offer_count} ponúk</div>
                {/if}
            </div>
        </a>
        {/each}
    </div>
    
    {#if totalPages > 1}
    <div class="pagination">
        <button class="page-btn" on:click={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>‹ Predošlá</button>
        {#each Array(Math.min(totalPages, 5)) as _, i}
            <button class="page-btn" class:active={currentPage === i + 1} on:click={() => handlePageChange(i + 1)}>{i + 1}</button>
        {/each}
        <button class="page-btn" on:click={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Ďalšia ›</button>
    </div>
    {/if}
    {:else if !searched}
    <div class="empty">
        <div class="empty-icon">🔍</div>
        <h3>Zadajte hľadaný výraz</h3>
        <p>Napíšte názov produktu, značku alebo kategóriu.</p>
    </div>
    {/if}
</div>

<style>
    .search-page { max-width: 1200px; margin: 0 auto; padding: 24px; }
    .search-header { margin-bottom: 24px; }
    .search-header h1 { font-size: 24px; margin: 0 0 16px; color: #1F2937; }
    .search-form { display: flex; gap: 12px; }
    .search-input { flex: 1; padding: 14px 18px; border: 2px solid #E5E7EB; border-radius: 10px; font-size: 16px; }
    .search-input:focus { outline: none; border-color: #F97316; }
    .search-btn { padding: 14px 28px; background: #F97316; color: #fff; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; }
    .search-btn:hover { background: #EA580C; }
    .search-info { padding: 14px 18px; background: #F9FAFB; border-radius: 10px; margin-bottom: 24px; font-size: 14px; color: #374151; }
    .loading, .empty { text-align: center; padding: 60px 20px; color: #6B7280; }
    .spinner { width: 40px; height: 40px; border: 4px solid #E5E7EB; border-top-color: #F97316; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-icon { font-size: 48px; margin-bottom: 16px; }
    .empty h3 { margin: 0 0 8px; color: #374151; }
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; margin-bottom: 24px; }
    .product-card { background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; text-decoration: none; transition: all 0.2s; }
    .product-card:hover { border-color: #F97316; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-2px); }
    .product-img { aspect-ratio: 1; background: #F9FAFB; display: flex; align-items: center; justify-content: center; padding: 16px; }
    .product-img img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .product-info { padding: 16px; }
    .product-title { font-size: 14px; font-weight: 500; color: #1F2937; margin: 0 0 8px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .product-price { font-size: 18px; font-weight: 700; color: #059669; }
    .product-offers { font-size: 12px; color: #6B7280; margin-top: 4px; }
    .pagination { display: flex; gap: 6px; justify-content: center; }
    .page-btn { padding: 10px 16px; border: 1px solid #E5E7EB; background: #fff; border-radius: 8px; cursor: pointer; font-size: 14px; }
    .page-btn:hover:not(:disabled) { border-color: #F97316; }
    .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .page-btn.active { background: #F97316; color: #fff; border-color: #F97316; }
</style>
