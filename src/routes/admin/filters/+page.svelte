<script lang="ts">
        import { api } from '$lib/api';
        
        export let data;
        
        let attributes = data.attributes || [];
        let enabledFilters: string[] = data.enabledFilters || [];
        let saving = false;
        let message = '';
        
        // Sort by value count
        $: sortedAttributes = [...attributes].sort((a, b) => b.total_values - a.total_values);
        
        function toggleFilter(name: string) {
                if (enabledFilters.includes(name)) {
                        enabledFilters = enabledFilters.filter(f => f !== name);
                } else {
                        enabledFilters = [...enabledFilters, name];
                }
        }
        
        function selectAll() {
                enabledFilters = attributes.map(a => a.name);
        }
        
        function deselectAll() {
                enabledFilters = [];
        }
        
        async function saveSettings() {
                saving = true;
                message = '';
                
                try {
                        await api.saveFilterSettings({ enabled_filters: enabledFilters });
                        message = 'Nastavenia uložené!';
                        setTimeout(() => message = '', 3000);
                } catch (error) {
                        message = 'Chyba pri ukladaní!';
                        console.error(error);
                }
                
                saving = false;
        }
</script>

<svelte:head>
        <title>Filtre | Admin | MegaPrice</title>
</svelte:head>

<div class="admin-header">
        <h1 class="admin-title">Nastavenia filtrov</h1>
        <div style="display: flex; gap: 12px; align-items: center;">
                {#if message}
                        <span class="admin-badge admin-badge--success">{message}</span>
                {/if}
                <button class="admin-btn admin-btn--primary" on:click={saveSettings} disabled={saving}>
                        {saving ? '⏳ Ukladám...' : '💾 Uložiť nastavenia'}
                </button>
        </div>
</div>

<div class="admin-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div>
                        <h2 style="margin: 0; font-size: 1.1rem;">Dostupné atribúty</h2>
                        <p style="margin: 4px 0 0; color: var(--mp-text-light); font-size: 0.875rem;">
                                Vyberte atribúty, ktoré sa zobrazia ako filtre v kategóriách
                        </p>
                </div>
                <div style="display: flex; gap: 8px;">
                        <button class="admin-btn admin-btn--secondary" on:click={selectAll}>
                                ✓ Vybrať všetky
                        </button>
                        <button class="admin-btn admin-btn--secondary" on:click={deselectAll}>
                                ✗ Zrušiť výber
                        </button>
                </div>
        </div>
        
        <div style="margin-bottom: 16px; padding: 12px; background: var(--mp-bg-gray); border-radius: 8px;">
                <strong>Aktívnych filtrov:</strong> {enabledFilters.length} z {attributes.length}
        </div>
        
        <div class="admin-filters-list">
                {#each sortedAttributes as attr}
                        <div class="admin-filter-item" class:selected={enabledFilters.includes(attr.name)}>
                                <div class="admin-filter-item__info">
                                        <input 
                                                type="checkbox" 
                                                class="admin-filter-item__checkbox"
                                                checked={enabledFilters.includes(attr.name)}
                                                on:change={() => toggleFilter(attr.name)}
                                        >
                                        <div>
                                                <div class="admin-filter-item__name">{attr.name}</div>
                                                <div class="admin-filter-item__values">
                                                        {attr.values?.slice(0, 5).map(v => v.value).join(', ')}{attr.values?.length > 5 ? '...' : ''}
                                                </div>
                                        </div>
                                </div>
                                <div class="admin-filter-item__count">
                                        {attr.total_values} hodnôt
                                </div>
                        </div>
                {/each}
        </div>
</div>

<style>
        .admin-filter-item.selected {
                border-color: var(--mp-primary);
                background: rgba(255, 107, 53, 0.05);
        }
</style>
