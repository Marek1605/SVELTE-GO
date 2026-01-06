<script>
    import { onMount } from 'svelte';
    import { api } from '$lib/api';
    
    let attributes = [];
    let filterSettings = {};
    let loading = true;
    let saving = false;
    let message = '';
    
    async function loadData() {
        loading = true;
        try {
            const [statsResult, settingsResult] = await Promise.all([
                api.getAttributeStats(),
                api.getFilterSettings()
            ]);
            
            if (statsResult?.success && statsResult?.data) {
                attributes = statsResult.data || [];
            } else if (Array.isArray(statsResult)) {
                attributes = statsResult;
            }
            
            if (settingsResult?.success && settingsResult?.data) {
                filterSettings = settingsResult.data || {};
            } else if (settingsResult && !settingsResult.success) {
                filterSettings = {};
            }
        } catch (err) {
            console.error('Error loading filter data:', err);
        }
        loading = false;
    }
    
    function toggleFilter(attrName) {
        if (!filterSettings.enabled) filterSettings.enabled = [];
        
        const idx = filterSettings.enabled.indexOf(attrName);
        if (idx === -1) {
            filterSettings.enabled = [...filterSettings.enabled, attrName];
        } else {
            filterSettings.enabled = filterSettings.enabled.filter(n => n !== attrName);
        }
    }
    
    async function saveSettings() {
        saving = true;
        message = '';
        try {
            const result = await api.saveFilterSettings(filterSettings);
            if (result?.success) {
                message = '✅ Nastavenia uložené';
            } else {
                message = '❌ Chyba pri ukladaní';
            }
        } catch (err) {
            message = '❌ Chyba pri ukladaní';
        }
        saving = false;
        setTimeout(() => message = '', 3000);
    }
    
    onMount(() => {
        loadData();
    });
</script>

<svelte:head>
    <title>Filtre | Admin | MegaPrice</title>
</svelte:head>

<div class="admin-page">
    <div class="admin-header">
        <h1 class="admin-title">Nastavenie filtrov</h1>
        <button class="btn btn--primary" on:click={saveSettings} disabled={saving}>
            {saving ? '⏳ Ukladám...' : '💾 Uložiť'}
        </button>
    </div>
    
    {#if message}
        <div class="message">{message}</div>
    {/if}
    
    <div class="admin-card">
        {#if loading}
            <div class="admin-loading">Načítavam atribúty...</div>
        {:else if attributes.length === 0}
            <div class="admin-empty">
                <span class="admin-empty__icon">🎛️</span>
                <p>Žiadne atribúty na konfiguráciu</p>
            </div>
        {:else}
            <div class="filters-list">
                <p class="filters-intro">Vyberte atribúty, ktoré sa majú zobrazovať ako filtre na stránkach kategórií:</p>
                
                {#each attributes as attr}
                    <label class="filter-item">
                        <input 
                            type="checkbox" 
                            checked={filterSettings.enabled?.includes(attr.name)}
                            on:change={() => toggleFilter(attr.name)}
                        >
                        <div class="filter-item__info">
                            <span class="filter-item__name">{attr.name}</span>
                            <span class="filter-item__count">{attr.product_count || attr.total_values || 0} hodnôt</span>
                        </div>
                    </label>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
.admin-page { max-width: 800px; }

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

.message {
    padding: 12px 16px;
    background: #f0fdf4;
    border: 1px solid #86efac;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 14px;
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

.filters-list { padding: 24px; }

.filters-intro {
    font-size: 14px;
    color: #64748b;
    margin-bottom: 20px;
}

.filter-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    background: #f8fafc;
    border-radius: 10px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.15s;
}

.filter-item:hover {
    background: #f1f5f9;
}

.filter-item input[type="checkbox"] {
    width: 20px;
    height: 20px;
    accent-color: #c4956a;
}

.filter-item__name {
    font-weight: 500;
    color: #1e293b;
}

.filter-item__count {
    font-size: 13px;
    color: #64748b;
    margin-left: 8px;
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
}

.btn--primary {
    background: #c4956a;
    color: #fff;
}

.btn--primary:hover { background: #b8875c; }
.btn:disabled { opacity: 0.7; cursor: wait; }
</style>
