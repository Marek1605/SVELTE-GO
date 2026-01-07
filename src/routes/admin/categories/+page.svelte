<script>
    import { onMount } from 'svelte';
    import { api } from '$lib/api';
    import { PUBLIC_API_URL } from '$env/static/public';

    const API_BASE = PUBLIC_API_URL || '';
    
    let categories = [];
    let loading = true;
    let searchQuery = '';
    let deleting = false;

    async function loadCategories() {
        loading = true;
        try {
            const result = await api.getCategoriesTree();
            if (result?.success && result?.data) {
                categories = Array.isArray(result.data) ? result.data : 
                             (result.data?.data ? result.data.data : []);
            } else if (Array.isArray(result)) {
                categories = result;
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
        if (!confirm('Ste si istý? Toto sa nedá vrátiť!')) return;
        
        deleting = true;
        try {
            const res = await fetch(API_BASE + '/admin/categories/all', { method: 'DELETE' });
            const result = await res.json();
            alert(result.success ? `Vymazaných ${result.deleted} kategórií` : 'Chyba: ' + (result.error || 'Neznáma'));
            await loadCategories();
        } catch (err) {
            alert('Chyba: ' + err.message);
        }
        deleting = false;
    }

    async function deleteAllProducts() {
        if (!confirm('Naozaj chcete vymazať VŠETKY produkty?')) return;
        if (!confirm('Ste si istý? Toto sa nedá vrátiť!')) return;
        
        deleting = true;
        try {
            const res = await fetch(API_BASE + '/admin/products/all', { method: 'DELETE' });
            const result = await res.json();
            alert(result.success ? `Vymazaných ${result.deleted} produktov` : 'Chyba: ' + (result.error || 'Neznáma'));
        } catch (err) {
            alert('Chyba: ' + err.message);
        }
        deleting = false;
    }

    $: filteredCategories = searchQuery
        ? categories.filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase()))
        : categories;

    onMount(loadCategories);
</script>

<div class="admin-page">
    <div class="admin-header">
        <h1>Kategórie</h1>
        <span class="badge">{categories.length} kategórií</span>
    </div>

    <div class="toolbar">
        <input type="text" placeholder="Hľadať..." bind:value={searchQuery}>
        <div class="actions">
            <button class="btn danger" on:click={deleteAllCategories} disabled={deleting}>
                🗑️ Vymazať kategórie
            </button>
            <button class="btn danger" on:click={deleteAllProducts} disabled={deleting}>
                🗑️ Vymazať produkty
            </button>
        </div>
    </div>

    <div class="card">
        {#if loading}
            <p class="center">Načítavam...</p>
        {:else if filteredCategories.length === 0}
            <p class="center">Žiadne kategórie</p>
        {:else}
            <table>
                <thead>
                    <tr>
                        <th>Názov</th>
                        <th>Slug</th>
                        <th>Produktov</th>
                    </tr>
                </thead>
                <tbody>
                    {#each filteredCategories as cat}
                        <tr>
                            <td>{cat.icon || '📁'} {cat.name}</td>
                            <td><code>{cat.slug}</code></td>
                            <td>{cat.product_count || 0}</td>
                        </tr>
                        {#if cat.children?.length}
                            {#each cat.children as child}
                                <tr class="child">
                                    <td style="padding-left:24px">↳ {child.name}</td>
                                    <td><code>{child.slug}</code></td>
                                    <td>{child.product_count || 0}</td>
                                </tr>
                            {/each}
                        {/if}
                    {/each}
                </tbody>
            </table>
        {/if}
    </div>
</div>

<style>
.admin-page { padding: 20px; max-width: 1200px; margin: 0 auto; }
.admin-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.admin-header h1 { margin: 0; font-size: 24px; }
.badge { background: #e2e8f0; padding: 4px 12px; border-radius: 12px; font-size: 14px; }
.toolbar { display: flex; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.toolbar input { padding: 10px 14px; border: 1px solid #ddd; border-radius: 6px; width: 300px; }
.actions { display: flex; gap: 8px; }
.btn { padding: 10px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
.btn.danger { background: #fee2e2; color: #dc2626; }
.btn:disabled { opacity: 0.5; }
.card { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
.center { text-align: center; padding: 40px; color: #666; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; padding: 12px 16px; background: #f8fafc; font-size: 12px; text-transform: uppercase; color: #64748b; }
td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; }
tr:hover { background: #fafafa; }
tr.child { background: #f8fafc; }
code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
</style>
