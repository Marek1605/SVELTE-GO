<script>
    import { onMount } from 'svelte';
    
    const GO_API = 'http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io';

    let categories = [];
    let loading = true;
    let searchQuery = '';
    let viewMode = 'grid'; // 'grid' or 'list'
    let regeneratingAll = false;
    let regeneratingId = null;
    let savingId = null;
    
    // Edit modal
    let showEditModal = false;
    let editCategory = null;
    let editImageUrl = '';

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

    function flattenCategories(cats, level = 0, parentName = '') {
        let result = [];
        cats.forEach(cat => {
            result.push({ 
                ...cat, 
                level, 
                parentName,
                fullPath: parentName ? `${parentName} > ${cat.name}` : cat.name
            });
            if (cat.children?.length) {
                result = result.concat(flattenCategories(cat.children, level + 1, cat.name));
            }
        });
        return result;
    }

    $: flatCategories = flattenCategories(categories);
    
    $: filteredCategories = searchQuery
        ? flatCategories.filter(c => 
            c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.slug?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : flatCategories;

    $: totalCount = flatCategories.length;
    $: withImages = flatCategories.filter(c => c.image_url).length;
    $: withoutImages = totalCount - withImages;

    async function regenerateImage(cat) {
        regeneratingId = cat.id;
        try {
            const res = await fetch(GO_API + '/api/v1/admin/categories/' + cat.id + '/regenerate-image', {
                method: 'POST'
            });
            const data = await res.json();
            
            if (data.success) {
                // Update local state
                const idx = flatCategories.findIndex(c => c.id === cat.id);
                if (idx !== -1) {
                    flatCategories[idx].image_url = data.image_url;
                }
                await loadCategories();
            } else {
                alert(data.error || 'Chyba pri generovaní');
            }
        } catch (err) {
            alert('Chyba: ' + err.message);
        }
        regeneratingId = null;
    }

    async function regenerateAllImages() {
        if (!confirm(`Pregenerovať obrázky pre všetky kategórie?\n\nToto prepíše existujúce obrázky obrázkami z produktov.`)) return;
        
        regeneratingAll = true;
        try {
            const res = await fetch(GO_API + '/api/v1/admin/categories/regenerate-all-images', {
                method: 'POST'
            });
            const data = await res.json();
            
            if (data.success) {
                alert(`✅ Pregenerovaných ${data.updated} kategórií`);
                await loadCategories();
            } else {
                alert('Chyba: ' + (data.error || 'Neznáma chyba'));
            }
        } catch (err) {
            alert('Chyba: ' + err.message);
        }
        regeneratingAll = false;
    }

    function openEditModal(cat) {
        editCategory = { ...cat };
        editImageUrl = cat.image_url || '';
        showEditModal = true;
    }

    async function saveCategory() {
        if (!editCategory) return;
        savingId = editCategory.id;
        
        try {
            const res = await fetch(GO_API + '/api/v1/admin/categories/' + editCategory.id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_url: editImageUrl })
            });
            const data = await res.json();
            
            if (data.success) {
                showEditModal = false;
                await loadCategories();
            } else {
                alert('Chyba: ' + (data.error || 'Neznáma chyba'));
            }
        } catch (err) {
            alert('Chyba: ' + err.message);
        }
        savingId = null;
    }

    function clearImage() {
        editImageUrl = '';
    }
</script>

<div class="page">
    <div class="page-header">
        <div>
            <h1>🖼️ Kategórie - Správa obrázkov</h1>
            <p class="subtitle">
                {totalCount} kategórií • 
                <span class="text-green">{withImages} s obrázkom</span> • 
                <span class="text-red">{withoutImages} bez obrázka</span>
            </p>
        </div>
        <div class="header-actions">
            <button class="btn btn-primary" on:click={regenerateAllImages} disabled={regeneratingAll}>
                {#if regeneratingAll}
                    ⏳ Generujem...
                {:else}
                    🔄 Pregenerovať všetky
                {/if}
            </button>
        </div>
    </div>

    <div class="toolbar">
        <input 
            type="text" 
            placeholder="🔍 Hľadať kategóriu..." 
            bind:value={searchQuery}
            class="search-input"
        >
        <div class="view-toggle">
            <button 
                class="toggle-btn" 
                class:active={viewMode === 'grid'}
                on:click={() => viewMode = 'grid'}
            >
                ⊞ Mriežka
            </button>
            <button 
                class="toggle-btn"
                class:active={viewMode === 'list'}
                on:click={() => viewMode = 'list'}
            >
                ☰ Zoznam
            </button>
        </div>
    </div>

    {#if loading}
        <div class="loading">⏳ Načítavam kategórie...</div>
    {:else if filteredCategories.length === 0}
        <div class="empty">
            {#if searchQuery}
                Žiadne kategórie pre "{searchQuery}"
            {:else}
                Žiadne kategórie.
            {/if}
        </div>
    {:else}
        {#if viewMode === 'grid'}
            <div class="categories-grid">
                {#each filteredCategories as cat}
                    <div class="cat-card" class:has-image={cat.image_url} class:no-image={!cat.image_url}>
                        <div class="cat-image">
                            {#if cat.image_url}
                                <img src={cat.image_url} alt={cat.name} loading="lazy">
                            {:else}
                                <div class="placeholder">📦</div>
                            {/if}
                            <div class="cat-overlay">
                                <button 
                                    class="overlay-btn" 
                                    on:click={() => regenerateImage(cat)}
                                    disabled={regeneratingId === cat.id}
                                    title="Pregenerovať z produktu"
                                >
                                    {regeneratingId === cat.id ? '⏳' : '🔄'}
                                </button>
                                <button 
                                    class="overlay-btn" 
                                    on:click={() => openEditModal(cat)}
                                    title="Upraviť ručne"
                                >
                                    ✏️
                                </button>
                            </div>
                        </div>
                        <div class="cat-info">
                            <span class="cat-level">Level {cat.level}</span>
                            <h3 class="cat-name">{cat.name}</h3>
                            <p class="cat-path">{cat.fullPath}</p>
                            <p class="cat-stats">{cat.product_count || 0} produktov</p>
                        </div>
                    </div>
                {/each}
            </div>
        {:else}
            <div class="card">
                <table class="categories-table">
                    <thead>
                        <tr>
                            <th style="width: 80px;">Obrázok</th>
                            <th>Názov</th>
                            <th>Cesta</th>
                            <th class="text-right">Produktov</th>
                            <th style="width: 120px;">Akcie</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each filteredCategories as cat}
                            <tr class:no-image={!cat.image_url}>
                                <td>
                                    <div class="table-image">
                                        {#if cat.image_url}
                                            <img src={cat.image_url} alt="">
                                        {:else}
                                            <span class="no-img">—</span>
                                        {/if}
                                    </div>
                                </td>
                                <td>
                                    <strong>{cat.name}</strong>
                                </td>
                                <td>
                                    <code>{cat.fullPath}</code>
                                </td>
                                <td class="text-right">{cat.product_count || 0}</td>
                                <td>
                                    <div class="table-actions">
                                        <button 
                                            class="btn-sm" 
                                            on:click={() => regenerateImage(cat)}
                                            disabled={regeneratingId === cat.id}
                                            title="Pregenerovať"
                                        >
                                            {regeneratingId === cat.id ? '⏳' : '🔄'}
                                        </button>
                                        <button 
                                            class="btn-sm" 
                                            on:click={() => openEditModal(cat)}
                                            title="Upraviť"
                                        >
                                            ✏️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    {/if}
</div>

<!-- Edit Modal -->
{#if showEditModal && editCategory}
<div class="modal-bg" on:click={() => showEditModal = false} on:keydown={() => {}} role="button" tabindex="0">
    <div class="modal" on:click|stopPropagation>
        <div class="modal-head">
            <h3>✏️ Upraviť kategóriu</h3>
            <button class="modal-close" on:click={() => showEditModal = false}>&times;</button>
        </div>
        <div class="modal-body">
            <div class="edit-preview">
                {#if editImageUrl}
                    <img src={editImageUrl} alt="Preview">
                {:else}
                    <div class="preview-placeholder">📦 Žiadny obrázok</div>
                {/if}
            </div>
            
            <div class="form-group">
                <label>Názov kategórie</label>
                <input type="text" value={editCategory.name} disabled>
            </div>
            
            <div class="form-group">
                <label>URL obrázka</label>
                <input 
                    type="url" 
                    bind:value={editImageUrl} 
                    placeholder="https://example.com/image.jpg"
                >
                <small>Zadajte URL obrázka alebo nechajte prázdne</small>
            </div>
            
            <div class="form-actions">
                <button class="btn btn-secondary" on:click={clearImage}>
                    🗑️ Odstrániť obrázok
                </button>
                <button 
                    class="btn btn-secondary" 
                    on:click={() => regenerateImage(editCategory)}
                    disabled={regeneratingId === editCategory.id}
                >
                    {regeneratingId === editCategory.id ? '⏳' : '🔄'} Z produktu
                </button>
            </div>
        </div>
        <div class="modal-foot">
            <button class="btn btn-secondary" on:click={() => showEditModal = false}>Zrušiť</button>
            <button class="btn btn-primary" on:click={saveCategory} disabled={savingId}>
                {savingId ? '⏳ Ukladám...' : '💾 Uložiť'}
            </button>
        </div>
    </div>
</div>
{/if}

<style>
.page {
    padding: 24px;
    max-width: 1400px;
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

.text-green { color: #16a34a; }
.text-red { color: #dc2626; }

.header-actions {
    display: flex;
    gap: 12px;
}

.toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
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

.btn-primary {
    background: #3b82f6;
    color: white;
}

.btn-primary:hover {
    background: #2563eb;
}

.btn-secondary {
    background: #f1f5f9;
    color: #475569;
}

.btn-secondary:hover {
    background: #e2e8f0;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-sm {
    padding: 6px 10px;
    border: none;
    border-radius: 6px;
    background: #f1f5f9;
    cursor: pointer;
    font-size: 14px;
}

.btn-sm:hover {
    background: #e2e8f0;
}

.loading, .empty {
    text-align: center;
    padding: 60px 20px;
    color: #64748b;
    background: white;
    border-radius: 12px;
}

/* Grid View */
.categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
}

.cat-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    transition: all 0.2s;
}

.cat-card:hover {
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    transform: translateY(-2px);
}

.cat-card.no-image {
    border: 2px dashed #fecaca;
}

.cat-image {
    position: relative;
    aspect-ratio: 1;
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
}

.cat-image img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 12px;
}

.cat-image .placeholder {
    font-size: 48px;
    opacity: 0.3;
}

.cat-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.2s;
}

.cat-card:hover .cat-overlay {
    opacity: 1;
}

.overlay-btn {
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    font-size: 18px;
    transition: all 0.2s;
}

.overlay-btn:hover {
    transform: scale(1.1);
}

.overlay-btn:disabled {
    opacity: 0.5;
}

.cat-info {
    padding: 12px;
}

.cat-level {
    font-size: 10px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.cat-name {
    margin: 4px 0;
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
}

.cat-path {
    margin: 0;
    font-size: 11px;
    color: #64748b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.cat-stats {
    margin: 8px 0 0;
    font-size: 12px;
    color: #94a3b8;
}

/* Table View */
.card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    overflow: hidden;
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
    vertical-align: middle;
}

.categories-table tr:hover {
    background: #fafafa;
}

.categories-table tr.no-image {
    background: #fef2f2;
}

.table-image {
    width: 50px;
    height: 50px;
    background: #f8fafc;
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

.table-image img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.table-image .no-img {
    color: #d1d5db;
}

.table-actions {
    display: flex;
    gap: 6px;
}

code {
    background: #f1f5f9;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    color: #64748b;
}

.text-right {
    text-align: right;
}

/* Modal */
.modal-bg {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow: hidden;
}

.modal-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #e2e8f0;
}

.modal-head h3 {
    margin: 0;
    font-size: 18px;
}

.modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #94a3b8;
}

.modal-body {
    padding: 20px;
    max-height: calc(90vh - 140px);
    overflow-y: auto;
}

.modal-foot {
    padding: 16px 20px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.edit-preview {
    width: 100%;
    aspect-ratio: 16/9;
    background: #f8fafc;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
}

.edit-preview img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

.preview-placeholder {
    font-size: 48px;
    opacity: 0.3;
}

.form-group {
    margin-bottom: 16px;
}

.form-group label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 6px;
}

.form-group input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
}

.form-group input:disabled {
    background: #f1f5f9;
    color: #64748b;
}

.form-group small {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    color: #94a3b8;
}

.form-actions {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
}

.form-actions .btn {
    flex: 1;
}
</style>
