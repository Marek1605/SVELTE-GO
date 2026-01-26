<script>
    import { onMount } from 'svelte';
    
    const GO_API = 'http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io';

    let categories = [];
    let loading = true;
    let searchQuery = '';
    let deleting = false;
    let viewMode = 'tree'; // 'tree' or 'flat'

    onMount(loadCategories);

    async function loadCategories() {
        loading = true;
        try {
            const res = await fetch(GO_API + '/api/v1/admin/categories');
            const data = await res.json();
            
            if (data.success && data.data) {
                categories = Array.isArray(data.data) ? data.data : 
                             (data.data?.data ? data.data.data : []);
            } else if (Array.isArray(data)) {
                categories = data;
            } else {
                categories = [];
            }
        } catch (err) {
            console.error('Error:', err);
            categories = [];
        }
        loading = false;
    }

    async function deleteAllCategories() {
        if (!confirm('Naozaj chcete vymazať VŠETKY kategórie?')) return;
        if (!confirm('Toto je nevratná akcia! Pokračovať?')) return;
        
        deleting = true;
        try {
            const res = await fetch(GO_API + '/api/v1/admin/categories/all', { method: 'DELETE' });
            const result = await res.json();
            
            if (result.success) {
                alert('Kategórie vymazané!');
                await loadCategories();
            } else {
                alert('Chyba: ' + (result.error || 'Neznáma chyba'));
            }
        } catch (err) {
            alert('Chyba: ' + err.message);
        }
        deleting = false;
    }

    async function deleteAllProducts() {
        if (!confirm('Naozaj chcete vymazať VŠETKY produkty?')) return;
        if (!confirm('Toto je nevratná akcia! Pokračovať?')) return;
        
        deleting = true;
        try {
            const res = await fetch(GO_API + '/api/v1/admin/products/all', { method: 'DELETE' });
            const result = await res.json();
            
            if (result.success) {
                alert('Vymazaných ' + result.deleted + ' produktov');
            } else {
                alert('Chyba: ' + (result.error || 'Neznáma chyba'));
            }
        } catch (err) {
            alert('Chyba: ' + err.message);
        }
        deleting = false;
    }

    function getTotalCount(cats) {
        let count = cats.length;
        cats.forEach(cat => {
            if (cat.children?.length) {
                count += getTotalCount(cat.children);
            }
        });
        return count;
    }

    function flattenCategories(cats, level = 0) {
        let result = [];
        cats.forEach(cat => {
            result.push({ ...cat, level });
            if (cat.children?.length) {
                result = result.concat(flattenCategories(cat.children, level + 1));
            }
        });
        return result;
    }

    $: filteredCategories = searchQuery
        ? flattenCategories(categories).filter(c => 
            c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.slug?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : (viewMode === 'flat' ? flattenCategories(categories) : categories);
    
    $: totalCount = getTotalCount(categories);
</script>

<div class="categories-page">
    <div class="page-header">
        <div>
            <h1>Kategórie</h1>
            <p class="subtitle">{totalCount} kategórií celkom</p>
        </div>
        <div class="header-actions">
            <button class="btn btn-danger" on:click={deleteAllCategories} disabled={deleting}>
                Vymazať kategórie
            </button>
            <button class="btn btn-danger" on:click={deleteAllProducts} disabled={deleting}>
                Vymazať produkty
            </button>
        </div>
    </div>

    <div class="toolbar">
        <input 
            type="text" 
            placeholder="Hľadať kategóriu..." 
            bind:value={searchQuery}
            class="search-input"
        >
        <div class="view-toggle">
            <button 
                class="toggle-btn" 
                class:active={viewMode === 'tree'}
                on:click={() => viewMode = 'tree'}
            >
                Strom
            </button>
            <button 
                class="toggle-btn"
                class:active={viewMode === 'flat'}
                on:click={() => viewMode = 'flat'}
            >
                Zoznam
            </button>
        </div>
    </div>

    <div class="card">
        {#if loading}
            <div class="loading">Načítavam...</div>
        {:else if filteredCategories.length === 0}
            <div class="empty">
                {#if searchQuery}
                    Žiadne kategórie pre "{searchQuery}"
                {:else}
                    Žiadne kategórie. Importujte feed pre vytvorenie kategórií.
                {/if}
            </div>
        {:else}
            <table class="categories-table">
                <thead>
                    <tr>
                        <th>Názov</th>
                        <th>Slug</th>
                        <th class="text-right">Produktov</th>
                    </tr>
                </thead>
                <tbody>
                    {#if viewMode === 'tree' && !searchQuery}
                        {#each filteredCategories as cat}
                            <tr class="parent-row">
                                <td>
                                    <strong>{cat.name}</strong>
                                    {#if cat.children?.length}
                                        <span class="children-count">({cat.children.length})</span>
                                    {/if}
                                </td>
                                <td><code>{cat.slug}</code></td>
                                <td class="text-right">{cat.product_count || 0}</td>
                            </tr>
                            {#if cat.children?.length}
                                {#each cat.children as child}
                                    <tr class="child-row">
                                        <td style="padding-left: 32px;">
                                            ↳ {child.name}
                                            {#if child.children?.length}
                                                <span class="children-count">({child.children.length})</span>
                                            {/if}
                                        </td>
                                        <td><code>{child.slug}</code></td>
                                        <td class="text-right">{child.product_count || 0}</td>
                                    </tr>
                                    {#if child.children?.length}
                                        {#each child.children as grandchild}
                                            <tr class="grandchild-row">
                                                <td style="padding-left: 56px;">
                                                    ↳ {grandchild.name}
                                                </td>
                                                <td><code>{grandchild.slug}</code></td>
                                                <td class="text-right">{grandchild.product_count || 0}</td>
                                            </tr>
                                        {/each}
                                    {/if}
                                {/each}
                            {/if}
                        {/each}
                    {:else}
                        {#each filteredCategories as cat}
                            <tr>
                                <td style="padding-left: {(cat.level || 0) * 24 + 16}px;">
                                    {#if cat.level > 0}↳{/if}
                                    {cat.name}
                                </td>
                                <td><code>{cat.slug}</code></td>
                                <td class="text-right">{cat.product_count || 0}</td>
                            </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>
        {/if}
    </div>
</div>

<style>
.categories-page {
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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

.header-actions {
    display: flex;
    gap: 12px;
}

.toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    gap: 16px;
    flex-wrap: wrap;
}

.search-input {
    padding: 10px 16px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    width: 300px;
}

.view-toggle {
    display: flex;
    background: #f1f5f9;
    border-radius: 8px;
    overflow: hidden;
}

.toggle-btn {
    padding: 8px 16px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 13px;
}

.toggle-btn.active {
    background: white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.btn {
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.btn-danger {
    background: #fee2e2;
    color: #dc2626;
}

.btn-danger:hover {
    background: #fecaca;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    overflow: hidden;
}

.loading, .empty {
    text-align: center;
    padding: 60px 20px;
    color: #64748b;
}

.categories-table {
    width: 100%;
    border-collapse: collapse;
}

.categories-table th {
    text-align: left;
    padding: 14px 16px;
    background: #f8fafc;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    color: #64748b;
    border-bottom: 1px solid #e2e8f0;
}

.categories-table td {
    padding: 12px 16px;
    border-bottom: 1px solid #f1f5f9;
}

.categories-table tr:hover {
    background: #fafafa;
}

.parent-row {
    background: #fefce8;
}

.parent-row:hover {
    background: #fef9c3 !important;
}

.child-row {
    background: #f0fdf4;
}

.child-row:hover {
    background: #dcfce7 !important;
}

.grandchild-row {
    background: #f0f9ff;
}

.grandchild-row:hover {
    background: #e0f2fe !important;
}

.cat-icon {
    margin-right: 8px;
}

.children-count {
    color: #64748b;
    font-size: 12px;
    margin-left: 8px;
}

code {
    background: #f1f5f9;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    color: #64748b;
}

.text-right {
    text-align: right;
}
</style>
