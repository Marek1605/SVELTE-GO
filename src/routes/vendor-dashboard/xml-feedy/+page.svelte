<script>
    import { getContext, onMount } from 'svelte';
    import { browser } from '$app/environment';
    
    const vendorStore = getContext('vendor');
    const shopStore = getContext('shop');
    const API_BASE = getContext('API_BASE');
    
    $: vendor = $vendorStore;
    $: shop = $shopStore;
    
    let loading = true;
    let feeds = [];
    let showNewFeedModal = false;
    let showEditFeedModal = false;
    let currentFeed = null;
    let message = null;
    
    let newFeed = {
        name: '',
        feed_url: '',
        feed_type: 'xml',
        xml_item_path: 'SHOP/SHOPITEM'
    };
    
    onMount(async () => {
        if (!browser) return;
        await loadFeeds();
    });
    
    async function loadFeeds() {
        loading = true;
        const token = localStorage.getItem('vendor_token');
        if (!token) return;
        
        try {
            const res = await fetch(`${API_BASE}/vendor/feeds`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                feeds = data.data || [];
            }
        } catch (e) {
            console.error('Error loading feeds:', e);
        }
        loading = false;
    }
    
    async function createFeed() {
        const token = localStorage.getItem('vendor_token');
        
        try {
            const res = await fetch(`${API_BASE}/vendor/feeds`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newFeed)
            });
            const data = await res.json();
            
            if (data.success) {
                message = { type: 'success', text: 'Feed bol vytvorený' };
                showNewFeedModal = false;
                newFeed = { name: '', feed_url: '', feed_type: 'xml', xml_item_path: 'SHOP/SHOPITEM' };
                await loadFeeds();
            } else {
                message = { type: 'error', text: data.error || 'Chyba pri vytváraní feedu' };
            }
        } catch (e) {
            message = { type: 'error', text: 'Chyba pri komunikácii so serverom' };
        }
    }
    
    async function updateFeed() {
        if (!currentFeed) return;
        
        const token = localStorage.getItem('vendor_token');
        
        try {
            const res = await fetch(`${API_BASE}/vendor/feeds/${currentFeed.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(currentFeed)
            });
            const data = await res.json();
            
            if (data.success) {
                message = { type: 'success', text: 'Feed bol aktualizovaný' };
                showEditFeedModal = false;
                await loadFeeds();
            } else {
                message = { type: 'error', text: data.error || 'Chyba pri aktualizácii feedu' };
            }
        } catch (e) {
            message = { type: 'error', text: 'Chyba pri komunikácii so serverom' };
        }
    }
    
    async function deleteFeed(feed) {
        if (!confirm(`Naozaj chcete zmazať feed "${feed.name}"?`)) return;
        
        const token = localStorage.getItem('vendor_token');
        
        try {
            const res = await fetch(`${API_BASE}/vendor/feeds/${feed.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (data.success) {
                message = { type: 'success', text: 'Feed bol zmazaný' };
                await loadFeeds();
            } else {
                message = { type: 'error', text: data.error || 'Chyba pri mazaní feedu' };
            }
        } catch (e) {
            message = { type: 'error', text: 'Chyba pri komunikácii so serverom' };
        }
    }
    
    async function startImport(feed) {
        const token = localStorage.getItem('vendor_token');
        
        message = { type: 'info', text: `Spúšťam import pre "${feed.name}"...` };
        
        try {
            const res = await fetch(`${API_BASE}/vendor/feeds/${feed.id}/import`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (data.success) {
                message = { type: 'success', text: 'Import bol spustený' };
                await loadFeeds();
            } else {
                message = { type: 'error', text: data.error || 'Chyba pri spúšťaní importu' };
            }
        } catch (e) {
            message = { type: 'error', text: 'Chyba pri komunikácii so serverom' };
        }
    }
    
    function editFeed(feed) {
        currentFeed = { ...feed };
        showEditFeedModal = true;
    }
    
    function formatDate(dateStr) {
        if (!dateStr) return 'Nikdy';
        return new Date(dateStr).toLocaleDateString('sk-SK', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    function getStatusBadge(status) {
        switch (status) {
            case 'active': return { class: 'badge-success', label: 'Aktívny' };
            case 'paused': return { class: 'badge-warning', label: 'Pozastavený' };
            case 'error': return { class: 'badge-danger', label: 'Chyba' };
            default: return { class: 'badge-secondary', label: status };
        }
    }
</script>

<div class="feeds-container">
    <div class="feeds-header">
        <div>
        </div>
        <button class="btn-primary" on:click={() => showNewFeedModal = true}>
            + Pridať feed
        </button>
    </div>
    
    {#if message}
        <div class="message {message.type}">
            {message.text}
            <button on:click={() => message = null}>×</button>
        </div>
    {/if}
    
    {#if loading}
        <div class="loading">
            <div class="spinner"></div>
            <p>Načítavam feedy...</p>
        </div>
    {:else if feeds.length === 0}
        <div class="empty-state">
            <span class="empty-icon">📄</span>
            <h3>Žiadne feedy</h3>
            <p>Pridajte váš prvý XML feed pre automatický import produktov</p>
            <button class="btn-primary" on:click={() => showNewFeedModal = true}>
                + Pridať feed
            </button>
        </div>
    {:else}
        <div class="feeds-list">
            {#each feeds as feed}
                {@const statusBadge = getStatusBadge(feed.status)}
                <div class="feed-card">
                    <div class="feed-header">
                        <div class="feed-info">
                            <h3>{feed.name}</h3>
                            <span class="feed-url">{feed.feed_url}</span>
                        </div>
                        <span class="badge {statusBadge.class}">{statusBadge.label}</span>
                    </div>
                    
                    <div class="feed-stats">
                        <div class="feed-stat">
                            <span class="stat-value">{feed.total_offers || 0}</span>
                            <span class="stat-label">Produktov</span>
                        </div>
                        <div class="feed-stat">
                            <span class="stat-value">{feed.feed_type?.toUpperCase() || 'XML'}</span>
                            <span class="stat-label">Typ</span>
                        </div>
                        <div class="feed-stat">
                            <span class="stat-value">{formatDate(feed.last_import)}</span>
                            <span class="stat-label">Posledný import</span>
                        </div>
                    </div>
                    
                    {#if feed.last_error}
                        <div class="feed-error">
                            <span>⚠️ {feed.last_error}</span>
                        </div>
                    {/if}
                    
                    <div class="feed-actions">
                        <button class="btn-action btn-import" on:click={() => startImport(feed)}>
                            🔄 Importovať
                        </button>
                        <button class="btn-action btn-edit" on:click={() => editFeed(feed)}>
                            ✎ Upraviť
                        </button>
                        <button class="btn-action btn-delete" on:click={() => deleteFeed(feed)}>
                            🗑 Zmazať
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<!-- New Feed Modal -->
{#if showNewFeedModal}
    <div class="modal-overlay" on:click={() => showNewFeedModal = false} on:keydown={() => {}}>
        <div class="modal" on:click|stopPropagation on:keydown|stopPropagation>
            <div class="modal-header">
                <h2>Nový XML Feed</h2>
                <button class="close-btn" on:click={() => showNewFeedModal = false}>×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Názov feedu</label>
                    <input type="text" bind:value={newFeed.name} placeholder="Napr. Hlavný katalóg">
                </div>
                <div class="form-group">
                    <label>URL feedu</label>
                    <input type="url" bind:value={newFeed.feed_url} placeholder="https://vas-eshop.sk/feed.xml">
                </div>
                <div class="form-group">
                    <label>Typ feedu</label>
                    <select bind:value={newFeed.feed_type}>
                        <option value="xml">XML (Heureka)</option>
                        <option value="csv">CSV</option>
                        <option value="json">JSON</option>
                    </select>
                </div>
                {#if newFeed.feed_type === 'xml'}
                    <div class="form-group">
                        <label>XML cesta k produktom</label>
                        <input type="text" bind:value={newFeed.xml_item_path} placeholder="SHOP/SHOPITEM">
                        <small>Napr. pre Heureka XML: SHOP/SHOPITEM</small>
                    </div>
                {/if}
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" on:click={() => showNewFeedModal = false}>Zrušiť</button>
                <button class="btn-primary" on:click={createFeed}>Vytvoriť feed</button>
            </div>
        </div>
    </div>
{/if}

<!-- Edit Feed Modal -->
{#if showEditFeedModal && currentFeed}
    <div class="modal-overlay" on:click={() => showEditFeedModal = false} on:keydown={() => {}}>
        <div class="modal" on:click|stopPropagation on:keydown|stopPropagation>
            <div class="modal-header">
                <h2>Upraviť feed</h2>
                <button class="close-btn" on:click={() => showEditFeedModal = false}>×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Názov feedu</label>
                    <input type="text" bind:value={currentFeed.name}>
                </div>
                <div class="form-group">
                    <label>URL feedu</label>
                    <input type="url" bind:value={currentFeed.feed_url}>
                </div>
                <div class="form-group">
                    <label>Typ feedu</label>
                    <select bind:value={currentFeed.feed_type}>
                        <option value="xml">XML (Heureka)</option>
                        <option value="csv">CSV</option>
                        <option value="json">JSON</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Stav</label>
                    <select bind:value={currentFeed.status}>
                        <option value="active">Aktívny</option>
                        <option value="paused">Pozastavený</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" on:click={() => showEditFeedModal = false}>Zrušiť</button>
                <button class="btn-primary" on:click={updateFeed}>Uložiť zmeny</button>
            </div>
        </div>
    </div>
{/if}

<style>
.feeds-container {
    max-width: 1000px;
    margin: 0 auto;
}

.feeds-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
}

.feeds-header h1 {
    font-size: 28px;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 8px 0;
}

.feeds-header p {
    color: #6b7280;
    margin: 0;
}

.message {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.message.success { background: #d1fae5; color: #065f46; }
.message.error { background: #fee2e2; color: #991b1b; }
.message.info { background: #dbeafe; color: #1e40af; }

.message button {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    opacity: 0.7;
}

.loading {
    text-align: center;
    padding: 60px;
    color: #6b7280;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e5e7eb;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.empty-icon {
    font-size: 64px;
    display: block;
    margin-bottom: 16px;
    opacity: 0.5;
}

.empty-state h3 {
    font-size: 18px;
    color: #374151;
    margin: 0 0 8px 0;
}

.empty-state p {
    color: #6b7280;
    margin: 0 0 20px 0;
}

/* Feed Cards */
.feeds-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.feed-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.feed-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
}

.feed-info h3 {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 4px 0;
}

.feed-url {
    font-size: 12px;
    color: #6b7280;
    word-break: break-all;
}

.badge {
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
}

.badge-success { background: #d1fae5; color: #065f46; }
.badge-warning { background: #fef3c7; color: #92400e; }
.badge-danger { background: #fee2e2; color: #991b1b; }
.badge-secondary { background: #f3f4f6; color: #6b7280; }

.feed-stats {
    display: flex;
    gap: 24px;
    margin-bottom: 16px;
    padding: 12px 0;
    border-top: 1px solid #e5e7eb;
    border-bottom: 1px solid #e5e7eb;
}

.feed-stat {
    display: flex;
    flex-direction: column;
}

.stat-value {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
}

.stat-label {
    font-size: 12px;
    color: #6b7280;
}

.feed-error {
    background: #fef2f2;
    color: #991b1b;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 13px;
    margin-bottom: 16px;
}

.feed-actions {
    display: flex;
    gap: 8px;
}

.btn-action {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-import {
    background: #dbeafe;
    color: #1e40af;
}

.btn-import:hover {
    background: #bfdbfe;
}

.btn-edit {
    background: #f3f4f6;
    color: #374151;
}

.btn-edit:hover {
    background: #e5e7eb;
}

.btn-delete {
    background: #fee2e2;
    color: #991b1b;
}

.btn-delete:hover {
    background: #fecaca;
}

/* Buttons */
.btn-primary, .btn-secondary {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-primary {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
}

.btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
    background: #f1f5f9;
    color: #374151;
}

.btn-secondary:hover {
    background: #e2e8f0;
}

/* Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
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
    display: flex;
    flex-direction: column;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
}

.close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #6b7280;
}

.modal-body {
    padding: 20px;
    overflow-y: auto;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 20px;
    border-top: 1px solid #e5e7eb;
}

.form-group {
    margin-bottom: 16px;
}

.form-group label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 6px;
}

.form-group input,
.form-group select {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
}

.form-group input:focus,
.form-group select:focus {
    outline: none;
    border-color: #3b82f6;
}

.form-group small {
    display: block;
    font-size: 12px;
    color: #9ca3af;
    margin-top: 4px;
}

@media (max-width: 768px) {
    .feeds-header {
        flex-direction: column;
        gap: 16px;
    }
    
    .feed-stats {
        flex-wrap: wrap;
    }
    
    .feed-actions {
        flex-wrap: wrap;
    }
}
</style>
