<script>
    import { onMount } from 'svelte';
    import { api } from '$lib/api';
    
    let categories = [];
    let loading = true;
    let searchQuery = '';
    
    async function loadCategories() {
        loading = true;
        try {
            const result = await api.getCategoriesTree();
            if (result?.success && result?.data) {
                categories = result.data || [];
            } else if (Array.isArray(result)) {
                categories = result;
            }
        } catch (err) {
            console.error('Error loading categories:', err);
        }
        loading = false;
    }
    
    $: filteredCategories = searchQuery 
        ? categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : categories;
    
    onMount(() => {
        loadCategories();
    });
</script>

<svelte:head>
    <title>Kategórie | Admin | MegaPrice</title>
</svelte:head>

<div class="admin-page">
    <div class="admin-header">
        <h1 class="admin-title">Kategórie</h1>
        <span class="admin-count">{categories.length} kategórií</span>
    </div>
    
    <div class="admin-toolbar">
        <input 
            type="text" 
            class="admin-search-input"
            placeholder="Hľadať kategórie..."
            bind:value={searchQuery}
        >
    </div>
    
    <div class="admin-card">
        {#if loading}
            <div class="admin-loading">Načítavam kategórie...</div>
        {:else if filteredCategories.length === 0}
            <div class="admin-empty">
                <span class="admin-empty__icon">📁</span>
                <p>Žiadne kategórie</p>
            </div>
        {:else}
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Názov</th>
                        <th>Slug</th>
                        <th>Produktov</th>
                        <th>Akcie</th>
                    </tr>
                </thead>
                <tbody>
                    {#each filteredCategories as category}
                        <tr>
                            <td>
                                <div class="category-cell">
                                    <span class="category-cell__icon">{category.icon || '📁'}</span>
                                    <span class="category-cell__name">{category.name}</span>
                                </div>
                            </td>
                            <td><code>{category.slug}</code></td>
                            <td><span class="badge">{category.product_count || 0}</span></td>
                            <td>
                                <a href="/kategoria/{category.slug}" target="_blank" class="btn btn--sm">👁️</a>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}
    </div>
</div>

<style>
.admin-page { max-width: 1200px; }

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

.admin-toolbar { margin-bottom: 20px; }

.admin-search-input {
    padding: 12px 16px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    width: 100%;
    max-width: 400px;
    outline: none;
}

.admin-search-input:focus { border-color: #c4956a; }

.admin-card {
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
}

.admin-table tr:hover { background: #fafafa; }

.category-cell {
    display: flex;
    align-items: center;
    gap: 10px;
}

.category-cell__icon { font-size: 20px; }
.category-cell__name { font-weight: 500; }

code {
    font-size: 12px;
    background: #f1f5f9;
    padding: 4px 8px;
    border-radius: 4px;
}

.badge {
    display: inline-block;
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 6px;
    background: #dbeafe;
    color: #1e40af;
}

.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 10px;
    background: #f1f5f9;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    text-decoration: none;
    cursor: pointer;
}

.btn:hover { background: #e2e8f0; }
</style>
