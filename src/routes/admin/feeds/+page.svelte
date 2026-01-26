<script>
    import { onMount, onDestroy } from 'svelte';
    import { api } from '$lib/api';
    import { PUBLIC_API_URL } from '$env/static/public';

    const API_BASE = PUBLIC_API_URL || '';

    let feeds = [];
    let loading = true;
    let showAddModal = false;
    let showImportModal = false;
    let selectedFeed = null;
    let importProgress = null;
    let progressInterval = null;

    // New feed form
    let newFeed = {
        name: '',
        url: '',
        type: 'xml',
        schedule: 'daily',
        is_active: true,
        xml_item_path: 'SHOPITEM',
        field_mapping: {},
        category_separator: '|',
        import_params: true,
        import_alt_images: true
    };

    let previewLoading = false;
    let feedPreview = null;
    let previewError = '';
    let activePreviewTab = 'fields';
    let editMode = false;
    let editingFeedId = null;

    const targetFields = [
        { value: '', label: '-- Ignorovať --' },
        { value: 'title', label: 'Názov produktu' },
        { value: 'description', label: 'Popis' },
        { value: 'price', label: 'Cena' },
        { value: 'ean', label: 'EAN' },
        { value: 'brand', label: 'Značka' },
        { value: 'image_url', label: 'Hlavný obrázok' },
        { value: 'alt_images', label: 'Alternatívne obrázky' },
        { value: 'url', label: 'URL produktu' },
        { value: 'category', label: 'Kategória' },
        { value: 'external_id', label: 'Externé ID' },
        { value: 'delivery_date', label: 'Dodacia lehota' },
        { value: 'stock', label: 'Sklad' },
    ];

    onMount(() => {
        loadFeeds();
    });

    onDestroy(() => {
        if (progressInterval) clearInterval(progressInterval);
    });

    async function loadFeeds() {
        loading = true;
        try {
            const res = await fetch('http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io/api/v1/admin/feeds');
            const data = await res.json();
            feeds = data.success ? (data.data || []) : [];
        } catch (err) {
            console.error('Error loading feeds:', err);
            feeds = [];
        }
        loading = false;
    }

    async function previewFeed() {
        if (!newFeed.url) {
            previewError = 'Zadajte URL feedu';
            return;
        }

        previewLoading = true;
        previewError = '';
        feedPreview = null;

        try {
            const res = await fetch('http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io/api/v1/admin/feeds/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: newFeed.url,
                    type: newFeed.type,
                    xml_item_path: newFeed.xml_item_path
                })
            });

            const data = await res.json();

            if (data.success) {
                feedPreview = data.data;
                // Auto-map common fields
                autoMapFields();
            } else {
                previewError = data.error || 'Nepodarilo sa načítať feed';
            }
        } catch (err) {
            previewError = 'Chyba pri načítavaní feedu: ' + err.message;
        }

        previewLoading = false;
    }

    function autoMapFields() {
        if (!feedPreview?.fields) return;
        
        const mapping = {};
        const fieldMap = {
            'PRODUCTNAME': 'title',
            'PRODUCT': 'title',
            'NAME': 'title',
            'DESCRIPTION': 'description',
            'PRICE_VAT': 'price',
            'PRICE': 'price',
            'EAN': 'ean',
            'MANUFACTURER': 'brand',
            'BRAND': 'brand',
            'IMGURL': 'image_url',
            'IMAGE': 'image_url',
            'URL': 'url',
            'CATEGORYTEXT': 'category',
            'CATEGORY': 'category'
        };

        feedPreview.fields.forEach(field => {
            const upper = field.toUpperCase();
            if (fieldMap[upper]) {
                mapping[field] = fieldMap[upper];
            }
        });

        newFeed.field_mapping = mapping;
    }

    async function saveFeed() {
        if (!newFeed.name || !newFeed.url) {
            alert('Vyplňte názov a URL feedu');
            return;
        }

        try {
            const res = await fetch('http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io/api/v1/admin/feeds', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newFeed)
            });

            const data = await res.json();

            if (data.success) {
                showAddModal = false;
                resetForm();
                loadFeeds();
            } else {
                alert(data.error || 'Chyba pri ukladaní');
            }
        } catch (err) {
            alert('Chyba: ' + err.message);
        }
    }

    async function deleteFeed(id, name) {
        if (!confirm(`Vymazať feed "${name}"?`)) return;

        try {
            await fetch('http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io/api/v1/admin/feeds/' + id, { method: 'DELETE' });
            loadFeeds();
        } catch (err) {
            alert('Chyba pri mazaní');
        }
    }

    async function startImport(feed) {
        selectedFeed = feed;
        showImportModal = true;
        importProgress = {
            status: 'downloading',
            message: 'Sťahujem feed...',
            total: 0,
            processed: 0,
            created: 0,
            updated: 0,
            errors: 0,
            percent: 0,
            logs: ['Spúšťam import...']
        };

        try {
            await fetch('http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io/api/v1/admin/feeds/' + feed.id + '/import', { method: 'POST' });

            // Poll for progress
            progressInterval = setInterval(async () => {
                try {
                    const res = await fetch('http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io/api/v1/admin/feeds/' + feed.id + '/progress');
                    const data = await res.json();
                    
                    if (data.success && data.data) {
                        importProgress = data.data;
                        
                        if (data.data.status === 'completed' || data.data.status === 'error') {
                            clearInterval(progressInterval);
                            progressInterval = null;
                            loadFeeds();
                        }
                    }
                } catch (err) {
                    console.error('Progress error:', err);
                }
            }, 1000);
        } catch (err) {
            importProgress = { ...importProgress, status: 'error', message: err.message };
        }
    }

    function resetForm() {
        newFeed = {
            name: '',
            url: '',
            type: 'xml',
            schedule: 'daily',
            is_active: true,
            xml_item_path: 'SHOPITEM',
            field_mapping: {},
            category_separator: '|',
            import_params: true,
            import_alt_images: true
        };
        feedPreview = null;
        previewError = '';
        editMode = false;
        editingFeedId = null;
    }

    function editFeed(feed) {
        editMode = true;
        editingFeedId = feed.id;
        newFeed = {
            name: feed.name,
            url: feed.url,
            type: feed.type || 'xml',
            schedule: feed.schedule || 'daily',
            is_active: feed.is_active,
            xml_item_path: feed.xml_item_path || 'SHOPITEM',
            field_mapping: feed.field_mapping || {},
            category_separator: feed.category_separator || '|',
            import_params: feed.import_params !== false,
            import_alt_images: feed.import_alt_images !== false
        };
        showAddModal = true;
    }

    async function updateFeed() {
        if (!newFeed.name || !newFeed.url) {
            alert('Vyplňte názov a URL feedu');
            return;
        }

        try {
            const res = await fetch('http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io/api/v1/admin/feeds/' + editingFeedId, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newFeed)
            });

            const data = await res.json();

            if (data.success) {
                showAddModal = false;
                resetForm();
                loadFeeds();
            } else {
                alert(data.error || 'Chyba pri ukladaní');
            }
        } catch (err) {
            alert('Chyba: ' + err.message);
        }
    }

    function closeImportModal() {
        showImportModal = false;
        if (progressInterval) {
            clearInterval(progressInterval);
            progressInterval = null;
        }
    }

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('sk-SK');
    }
</script>

<div class="feeds-page">
    <div class="page-header">
        <div>
            <h1>Feed Import</h1>
            <p class="subtitle">Import produktov z XML/CSV feedov</p>
        </div>
        <button class="btn btn-primary" on:click={() => showAddModal = true}>
            + Pridať feed
        </button>
    </div>

    {#if loading}
        <div class="loading">Načítavam...</div>
    {:else if feeds.length === 0}
        <div class="empty-state">
            <div class="empty-icon">FEED</div>
            <h3>Žiadne feedy</h3>
            <p>Pridajte svoj prvý XML/CSV feed pre import produktov</p>
            <button class="btn btn-primary" on:click={() => showAddModal = true}>
                + Pridať feed
            </button>
        </div>
    {:else}
        <div class="feeds-grid">
            {#each feeds as feed}
                <div class="feed-card">
                    <div class="feed-header">
                        <div class="feed-icon">
                            {#if feed.type === 'xml'}XML{:else if feed.type === 'csv'}CSV{:else}JSON{/if}
                        </div>
                        <div class="feed-info">
                            <h3>{feed.name}</h3>
                            <span class="feed-type">{feed.type.toUpperCase()}</span>
                        </div>
                        <div class="feed-status" class:active={feed.is_active}>
                            {feed.is_active ? 'Aktívny' : 'Neaktívny'}
                        </div>
                    </div>

                    <div class="feed-url">{feed.url}</div>

                    <div class="feed-stats">
                        <div class="stat">
                            <span class="stat-value">{feed.product_count || 0}</span>
                            <span class="stat-label">produktov</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">{feed.schedule || 'manual'}</span>
                            <span class="stat-label">plán</span>
                        </div>
                    </div>

                    {#if feed.last_import}
                        <div class="feed-last-import">
                            Posledný import: {formatDate(feed.last_import)}
                        </div>
                    {/if}

                    {#if feed.field_mapping && Object.keys(feed.field_mapping).length > 0}
                        <div class="feed-mapping">
                            <strong>Mapovanie:</strong>
                            {#each Object.entries(feed.field_mapping).filter(([k, v]) => v) as [field, target]}
                                <span class="mapping-tag">{field} → {target}</span>
                            {/each}
                        </div>
                    {/if}

                    <div class="feed-actions">
                        <button class="btn btn-edit" on:click={() => editFeed(feed)}>
                            Upraviť
                        </button>
                        <button class="btn btn-success" on:click={() => startImport(feed)}>
                            Importovať
                        </button>
                        <button class="btn btn-danger" on:click={() => deleteFeed(feed.id, feed.name)}>
                            Zmazať
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<!-- Add Feed Modal -->
{#if showAddModal}
    <div class="modal-overlay" on:click={() => { showAddModal = false; resetForm(); }}>
        <div class="modal modal-lg" on:click|stopPropagation>
            <div class="modal-header">
                <h2>{editMode ? 'Upraviť feed' : 'Pridať nový feed'}</h2>
                <button class="modal-close" on:click={() => { showAddModal = false; resetForm(); }}>×</button>
            </div>

            <div class="modal-body">
                <div class="form-row">
                    <div class="form-group">
                        <label>Názov feedu</label>
                        <input type="text" bind:value={newFeed.name} placeholder="Napr. Heureka XML">
                    </div>
                    <div class="form-group">
                        <label>Typ</label>
                        <select bind:value={newFeed.type}>
                            <option value="xml">XML</option>
                            <option value="csv">CSV</option>
                            <option value="json">JSON</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label>URL feedu</label>
                    <div class="input-with-button">
                        <input type="url" bind:value={newFeed.url} placeholder="https://example.com/feed.xml">
                        <button class="btn" on:click={previewFeed} disabled={previewLoading}>
                            {previewLoading ? 'Načítavam...' : 'Načítať'}
                        </button>
                    </div>
                </div>

                {#if newFeed.type === 'xml'}
                    <div class="form-group">
                        <label>XML element produktu</label>
                        <input type="text" bind:value={newFeed.xml_item_path} placeholder="SHOPITEM">
                        <small>Štandardne SHOPITEM pre Heureka feedy</small>
                    </div>
                {/if}

                <div class="form-row">
                    <div class="form-group">
                        <label>Plán importu</label>
                        <select bind:value={newFeed.schedule}>
                            <option value="manual">Manuálne</option>
                            <option value="hourly">Každú hodinu</option>
                            <option value="daily">Denne</option>
                            <option value="weekly">Týždenne</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>&nbsp;</label>
                        <label class="checkbox-label">
                            <input type="checkbox" bind:checked={newFeed.is_active}>
                            <span>Aktívny feed</span>
                        </label>
                    </div>
                </div>

                <div class="settings-section">
                    <h4>Nastavenia importu</h4>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Oddeľovač kategórií</label>
                            <select bind:value={newFeed.category_separator}>
                                <option value="|">| (pipe)</option>
                                <option value=">">> (väčší)</option>
                                <option value="/">/  (lomka)</option>
                                <option value="-">- (pomlčka)</option>
                            </select>
                            <small>Napr. "Elektronika | Mobily | iPhone"</small>
                        </div>
                        <div class="form-group">
                            <label>Automatický import</label>
                            <label class="checkbox-label">
                                <input type="checkbox" bind:checked={newFeed.import_alt_images}>
                                <span>Alternatívne obrázky (IMGURL_ALTERNATIVE)</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" bind:checked={newFeed.import_params}>
                                <span>PARAM atribúty</span>
                            </label>
                        </div>
                    </div>
                </div>

                {#if previewError}
                    <div class="alert alert-error">{previewError}</div>
                {/if}

                {#if feedPreview}
                    <div class="preview-section">
                        <div class="preview-tabs">
                            <button 
                                class="preview-tab" 
                                class:active={activePreviewTab === 'fields'}
                                on:click={() => activePreviewTab = 'fields'}
                            >
                                Polia ({feedPreview.fields?.length || 0})
                            </button>
                            <button 
                                class="preview-tab"
                                class:active={activePreviewTab === 'attributes'}
                                on:click={() => activePreviewTab = 'attributes'}
                            >
                                Atribúty ({feedPreview.attributes?.length || 0})
                            </button>
                            <button 
                                class="preview-tab"
                                class:active={activePreviewTab === 'sample'}
                                on:click={() => activePreviewTab = 'sample'}
                            >
                                Ukážka
                            </button>
                            <span class="preview-count">
                                {feedPreview.total_items || 0} položiek
                            </span>
                        </div>

                        <div class="preview-content">
                            {#if activePreviewTab === 'fields'}
                                <table class="mapping-table">
                                    <thead>
                                        <tr>
                                            <th>Pole z feedu</th>
                                            <th>Ukážka</th>
                                            <th>Mapovať na</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {#each (feedPreview.fields || []).filter(f => !f.startsWith('_')) as field}
                                            <tr>
                                                <td><strong>{field}</strong></td>
                                                <td class="sample-cell">
                                                    {String(feedPreview.sample?.[0]?.[field] || '-').substring(0, 80)}
                                                </td>
                                                <td>
                                                    <select 
                                                        bind:value={newFeed.field_mapping[field]}
                                                        class="mapping-select"
                                                    >
                                                        {#each targetFields as tf}
                                                            <option value={tf.value}>{tf.label}</option>
                                                        {/each}
                                                    </select>
                                                </td>
                                            </tr>
                                        {/each}
                                    </tbody>
                                </table>
                            {:else if activePreviewTab === 'attributes'}
                                {#if feedPreview.attributes?.length > 0}
                                    <p class="info-text">PARAM atribúty nájdené vo feede (budú automaticky importované):</p>
                                    <div class="attr-grid">
                                        {#each feedPreview.attributes.sort((a, b) => b.count - a.count) as attr}
                                            <div class="attr-item">
                                                <span class="attr-name">{attr.name}</span>
                                                <span class="attr-count">{attr.count}×</span>
                                            </div>
                                        {/each}
                                    </div>
                                {:else}
                                    <div class="empty-preview">Žiadne PARAM atribúty</div>
                                {/if}
                            {:else if activePreviewTab === 'sample'}
                                <div class="sample-data">
                                    <pre>{JSON.stringify(feedPreview.sample?.[0] || {}, null, 2)}</pre>
                                </div>
                            {/if}
                        </div>
                    </div>
                {/if}
            </div>

            <div class="modal-footer">
                <button class="btn" on:click={() => { showAddModal = false; resetForm(); }}>Zrušiť</button>
                {#if editMode}
                    <button class="btn btn-primary" on:click={updateFeed}>Uložiť zmeny</button>
                {:else}
                    <button class="btn btn-primary" on:click={saveFeed}>Uložiť feed</button>
                {/if}
            </div>
        </div>
    </div>
{/if}

<!-- Import Progress Modal -->
{#if showImportModal && importProgress}
    <div class="modal-overlay">
        <div class="modal">
            <div class="modal-header">
                <h2>
                    {#if importProgress.status === 'completed'}
                        Import dokončený
                    {:else if importProgress.status === 'error'}
                        Import zlyhal
                    {:else}
                        Import prebieha...
                    {/if}
                </h2>
            </div>

            <div class="modal-body">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: {importProgress.percent}%">
                        {importProgress.percent}%
                    </div>
                </div>

                <p class="progress-message">{importProgress.message}</p>

                <div class="progress-stats">
                    <div class="progress-stat">
                        <div class="stat-value">{importProgress.total}</div>
                        <div class="stat-label">Celkom</div>
                    </div>
                    <div class="progress-stat">
                        <div class="stat-value text-green">{importProgress.created}</div>
                        <div class="stat-label">Vytvorené</div>
                    </div>
                    <div class="progress-stat">
                        <div class="stat-value text-blue">{importProgress.updated}</div>
                        <div class="stat-label">Aktualizované</div>
                    </div>
                    <div class="progress-stat">
                        <div class="stat-value text-red">{importProgress.errors}</div>
                        <div class="stat-label">Chyby</div>
                    </div>
                </div>

                <div class="progress-logs">
                    {#each (importProgress.logs || []).slice(-15) as log}
                        <div class="log-line">{log}</div>
                    {/each}
                </div>
            </div>

            <div class="modal-footer">
                {#if importProgress.status === 'completed' || importProgress.status === 'error'}
                    <button class="btn btn-primary" on:click={closeImportModal}>Zavrieť</button>
                {/if}
            </div>
        </div>
    </div>
{/if}

<style>
.feeds-page {
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

.loading, .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #64748b;
}

.empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
}

.empty-state h3 {
    margin: 0 0 8px;
    color: #1e293b;
}

.feeds-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
}

.feed-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.feed-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.feed-icon {
    font-size: 14px;
    font-weight: 700;
    background: #f1f5f9;
    padding: 8px 12px;
    border-radius: 8px;
    color: #64748b;
}

.feed-info h3 {
    margin: 0;
    font-size: 18px;
}

.feed-type {
    font-size: 11px;
    background: #e2e8f0;
    padding: 2px 8px;
    border-radius: 4px;
}

.feed-status {
    margin-left: auto;
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 12px;
    background: #f1f5f9;
    color: #64748b;
}

.feed-status.active {
    background: #dcfce7;
    color: #16a34a;
}

.feed-url {
    font-size: 12px;
    color: #64748b;
    word-break: break-all;
    padding: 8px;
    background: #f8fafc;
    border-radius: 6px;
    margin-bottom: 12px;
}

.feed-stats {
    display: flex;
    gap: 24px;
    margin-bottom: 12px;
}

.stat {
    text-align: center;
}

.stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #1e293b;
}

.stat-label {
    font-size: 12px;
    color: #64748b;
}

.feed-last-import {
    font-size: 12px;
    color: #64748b;
    margin-bottom: 12px;
}

.feed-mapping {
    font-size: 12px;
    margin-bottom: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
}

.mapping-tag {
    background: #e0f2fe;
    color: #0369a1;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
}

.feed-actions {
    display: flex;
    gap: 8px;
}

/* Buttons */
.btn {
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    background: #f1f5f9;
    color: #334155;
    display: inline-flex;
    align-items: center;
    gap: 6px;
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

.btn-edit {
    background: #e0f2fe;
    color: #0369a1;
}

.btn-edit:hover {
    background: #bae6fd;
}

.btn-success {
    background: #dcfce7;
    color: #166534;
}

.btn-success:hover {
    background: #bbf7d0;
}

.btn-danger {
    background: #fee2e2;
    color: #dc2626;
}

.btn-danger:hover {
    background: #fecaca;
}

/* Modal */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
}

.modal {
    background: white;
    border-radius: 16px;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.modal-lg {
    max-width: 900px;
}

.modal-header {
    padding: 20px 24px;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h2 {
    margin: 0;
    font-size: 20px;
}

.modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #64748b;
}

.modal-body {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
}

.modal-footer {
    padding: 16px 24px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

/* Form */
.form-row {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 16px;
}

.form-group {
    margin-bottom: 16px;
}

.form-group label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
    color: #374151;
}

.form-group input,
.form-group select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
}

.form-group small {
    display: block;
    margin-top: 4px;
    color: #6b7280;
    font-size: 12px;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 10px 0;
}

.checkbox-label input {
    width: 18px;
    height: 18px;
}

.settings-section {
    background: #f8fafc;
    border-radius: 8px;
    padding: 16px;
    margin-top: 8px;
}

.settings-section h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #374151;
}

.input-with-button {
    display: flex;
    gap: 8px;
}

.input-with-button input {
    flex: 1;
}

.alert {
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 16px;
}

.alert-error {
    background: #fee2e2;
    color: #dc2626;
}

/* Preview */
.preview-section {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
    margin-top: 16px;
}

.preview-tabs {
    display: flex;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
}

.preview-tab {
    padding: 12px 20px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    color: #64748b;
}

.preview-tab.active {
    background: white;
    color: #1e293b;
    font-weight: 600;
    border-bottom: 2px solid #b8860b;
}

.preview-count {
    margin-left: auto;
    padding: 12px 20px;
    color: #16a34a;
    font-weight: 600;
}

.preview-content {
    padding: 16px;
    max-height: 400px;
    overflow-y: auto;
}

.mapping-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}

.mapping-table th {
    text-align: left;
    padding: 10px;
    background: #f8fafc;
    font-weight: 600;
}

.mapping-table td {
    padding: 10px;
    border-bottom: 1px solid #f1f5f9;
}

.sample-cell {
    color: #64748b;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.mapping-select {
    padding: 6px 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 13px;
    width: 100%;
}

.info-text {
    color: #64748b;
    font-size: 13px;
    margin-bottom: 12px;
}

.auto-info {
    background: #dcfce7;
    color: #166534;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 13px;
    margin-bottom: 12px;
}

.auto-info strong {
    color: #14532d;
}

.attr-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.attr-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: #f1f5f9;
    border-radius: 6px;
    font-size: 13px;
}

.attr-name {
    font-weight: 500;
}

.attr-count {
    color: #64748b;
    font-size: 12px;
}

.empty-preview {
    text-align: center;
    padding: 40px;
    color: #64748b;
}

.sample-data {
    background: #1e293b;
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
}

.sample-data pre {
    margin: 0;
    color: #e2e8f0;
    font-size: 12px;
    white-space: pre-wrap;
}

/* Progress */
.progress-bar {
    height: 24px;
    background: #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 16px;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #b8860b, #d4a017);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 12px;
    transition: width 0.3s;
}

.progress-message {
    text-align: center;
    color: #64748b;
    margin-bottom: 20px;
}

.progress-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 20px;
}

.progress-stat {
    text-align: center;
    padding: 12px;
    background: #f8fafc;
    border-radius: 8px;
}

.progress-stat .stat-value {
    font-size: 28px;
    font-weight: 700;
}

.progress-stat .stat-label {
    font-size: 12px;
    color: #64748b;
}

.text-green { color: #16a34a; }
.text-blue { color: #2563eb; }
.text-red { color: #dc2626; }

.progress-logs {
    background: #1e293b;
    border-radius: 8px;
    padding: 12px;
    max-height: 200px;
    overflow-y: auto;
}

.log-line {
    font-family: monospace;
    font-size: 12px;
    color: #94a3b8;
    padding: 2px 0;
}
</style>
