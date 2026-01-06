<script>
    import { onMount } from 'svelte';
    import { api } from '$lib/api';
    
    let feeds = [];
    let loading = true;
    let showAddModal = false;
    let newFeed = { name: '', url: '', type: 'xml' };
    let importing = {};
    
    async function loadFeeds() {
        loading = true;
        try {
            const result = await api.getFeeds();
            if (result?.success && result?.data) {
                feeds = result.data || [];
            } else if (Array.isArray(result)) {
                feeds = result;
            }
        } catch (err) {
            console.error('Error loading feeds:', err);
        }
        loading = false;
    }
    
    async function addFeed() {
        if (!newFeed.name || !newFeed.url) return;
        try {
            const result = await api.createFeed(newFeed);
            if (result?.success) {
                showAddModal = false;
                newFeed = { name: '', url: '', type: 'xml' };
                loadFeeds();
            }
        } catch (err) {
            console.error('Error creating feed:', err);
        }
    }
    
    async function startImport(feedId) {
        importing[feedId] = true;
        try {
            await api.startImport(feedId);
            pollProgress(feedId);
        } catch (err) {
            console.error('Error starting import:', err);
            importing[feedId] = false;
        }
    }
    
    async function pollProgress(feedId) {
        try {
            const result = await api.getImportProgress(feedId);
            if (result?.data?.status === 'running') {
                setTimeout(() => pollProgress(feedId), 2000);
            } else {
                importing[feedId] = false;
                loadFeeds();
            }
        } catch (err) {
            importing[feedId] = false;
        }
    }
    
    function closeModal() {
        showAddModal = false;
    }
    
    onMount(() => {
        loadFeeds();
    });
</script>

<svelte:head>
    <title>Feed Import | Admin | MegaPrice</title>
</svelte:head>

<div class="admin-page">
    <div class="admin-header">
        <h1 class="admin-title">Feed Import</h1>
        <button class="btn btn--primary" on:click={() => showAddModal = true}>
            + Pridať feed
        </button>
    </div>
    
    <div class="admin-card">
        {#if loading}
            <div class="admin-loading">Načítavam feedy...</div>
        {:else if feeds.length === 0}
            <div class="admin-empty">
                <span class="admin-empty__icon">📥</span>
                <p>Žiadne feed zdroje</p>
                <button class="btn btn--primary" on:click={() => showAddModal = true}>
                    Pridať prvý feed
                </button>
            </div>
        {:else}
            <div class="feeds-list">
                {#each feeds as feed}
                    <div class="feed-card">
                        <div class="feed-card__info">
                            <h3 class="feed-card__name">{feed.name}</h3>
                            <p class="feed-card__url">{feed.url}</p>
                            <div class="feed-card__meta">
                                <span>Typ: {feed.type}</span>
                                {#if feed.last_import}
                                    <span>Posledný import: {new Date(feed.last_import).toLocaleString('sk')}</span>
                                {/if}
                                {#if feed.product_count}
                                    <span>Produktov: {feed.product_count}</span>
                                {/if}
                            </div>
                        </div>
                        <div class="feed-card__actions">
                            <button 
                                class="btn" 
                                class:btn--loading={importing[feed.id]}
                                disabled={importing[feed.id]}
                                on:click={() => startImport(feed.id)}
                            >
                                {importing[feed.id] ? '⏳ Importujem...' : '▶️ Spustiť import'}
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

<!-- Add Feed Modal -->
{#if showAddModal}
    <div class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal">
            <h2 id="modal-title">Pridať nový feed</h2>
            <form on:submit|preventDefault={addFeed}>
                <div class="form-group">
                    <label for="feed-name">Názov</label>
                    <input id="feed-name" type="text" bind:value={newFeed.name} placeholder="Názov feedu" required>
                </div>
                <div class="form-group">
                    <label for="feed-url">URL</label>
                    <input id="feed-url" type="url" bind:value={newFeed.url} placeholder="https://..." required>
                </div>
                <div class="form-group">
                    <label for="feed-type">Typ</label>
                    <select id="feed-type" bind:value={newFeed.type}>
                        <option value="xml">XML</option>
                        <option value="csv">CSV</option>
                        <option value="json">JSON</option>
                    </select>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn" on:click={closeModal}>Zrušiť</button>
                    <button type="submit" class="btn btn--primary">Pridať</button>
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
.admin-page { max-width: 1200px; }

.admin-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
}

.admin-title {
    font-size: 28px;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
}

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

.feeds-list {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.feed-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    background: #f8fafc;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
}

.feed-card__name {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 4px 0;
}

.feed-card__url {
    font-size: 13px;
    color: #64748b;
    margin: 0 0 8px 0;
    word-break: break-all;
}

.feed-card__meta {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: #94a3b8;
}

.btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    background: #f1f5f9;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
}

.btn:hover { background: #e2e8f0; }

.btn--primary {
    background: #c4956a;
    color: #fff;
}

.btn--primary:hover { background: #b8875c; }

.btn--loading { opacity: 0.7; cursor: wait; }

.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal {
    background: #fff;
    border-radius: 16px;
    padding: 32px;
    width: 100%;
    max-width: 480px;
}

.modal h2 {
    font-size: 20px;
    margin: 0 0 24px 0;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 6px;
    color: #374151;
}

.form-group input,
.form-group select {
    width: 100%;
    padding: 12px 14px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
}

.form-group input:focus,
.form-group select:focus {
    border-color: #c4956a;
}

.modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 24px;
}
</style>
