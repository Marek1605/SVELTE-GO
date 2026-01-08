<script>
    import { onMount } from 'svelte';
    
    const GO_API = 'http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io';
    
    let attributes = [];
    let filterSettings = {
        enabled: {},
        global_max_values: 10,
        show_counts: true
    };
    let loading = true;
    let saving = false;
    let message = '';
    let searchQuery = '';
    
    async function loadData() {
        loading = true;
        try {
            const statsRes = await fetch(GO_API + '/api/v1/attributes/stats');
            const statsData = await statsRes.json();
            
            if (statsData.success && statsData.data) {
                attributes = statsData.data.sort((a, b) => b.product_count - a.product_count);
            }
            
            const settingsRes = await fetch(GO_API + '/api/v1/filters');
            const settingsData = await settingsRes.json();
            
            if (settingsData.success && settingsData.data) {
                filterSettings = {
                    enabled: settingsData.data.enabled || {},
                    global_max_values: settingsData.data.global_max_values || 10,
                    show_counts: settingsData.data.show_counts !== false
                };
            }
        } catch (err) {
            console.error('Error loading filter data:', err);
        }
        loading = false;
    }
    
    function toggleAttribute(attrName) {
        if (!filterSettings.enabled[attrName]) {
            filterSettings.enabled[attrName] = {
                enabled: true,
                max_values: filterSettings.global_max_values
            };
        } else {
            filterSettings.enabled[attrName].enabled = !filterSettings.enabled[attrName].enabled;
        }
        filterSettings = { ...filterSettings };
    }
    
    function updateMaxValues(attrName, value) {
        if (!filterSettings.enabled[attrName]) {
            filterSettings.enabled[attrName] = { enabled: true, max_values: value };
        } else {
            filterSettings.enabled[attrName].max_values = value;
        }
        filterSettings = { ...filterSettings };
    }
    
    function isEnabled(attrName) {
        return filterSettings.enabled[attrName]?.enabled === true;
    }
    
    function getMaxValues(attrName) {
        return filterSettings.enabled[attrName]?.max_values || filterSettings.global_max_values;
    }
    
    function selectAll() {
        attributes.forEach(attr => {
            if (!filterSettings.enabled[attr.name]) {
                filterSettings.enabled[attr.name] = {
                    enabled: true,
                    max_values: filterSettings.global_max_values
                };
            } else {
                filterSettings.enabled[attr.name].enabled = true;
            }
        });
        filterSettings = { ...filterSettings };
    }
    
    function deselectAll() {
        Object.keys(filterSettings.enabled).forEach(key => {
            filterSettings.enabled[key].enabled = false;
        });
        filterSettings = { ...filterSettings };
    }
    
    function applyGlobalMaxToAll() {
        Object.keys(filterSettings.enabled).forEach(key => {
            filterSettings.enabled[key].max_values = filterSettings.global_max_values;
        });
        filterSettings = { ...filterSettings };
    }
    
    async function saveSettings() {
        saving = true;
        message = '';
        try {
            const res = await fetch(GO_API + '/api/v1/filters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filterSettings)
            });
            const result = await res.json();
            message = result.success ? 'success' : 'error';
        } catch (err) {
            message = 'error';
        }
        saving = false;
        setTimeout(() => message = '', 4000);
    }
    
    $: filteredAttributes = searchQuery 
        ? attributes.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : attributes;
    
    $: enabledCount = Object.values(filterSettings.enabled).filter(v => v.enabled).length;
    
    onMount(loadData);
</script>

<div class="page">
    <div class="header">
        <div class="header-left">
            <h1>Nastavenie filtrov</h1>
            <p class="subtitle">{attributes.length} atribútov • {enabledCount} aktívnych</p>
        </div>
        <div class="header-actions">
            {#if message === 'success'}
                <span class="save-msg success">✅ Uložené</span>
            {:else if message === 'error'}
                <span class="save-msg error">❌ Chyba</span>
            {/if}
            <button class="btn btn-primary" on:click={saveSettings} disabled={saving}>
                {saving ? '⏳ Ukladám...' : '💾 Uložiť'}
            </button>
        </div>
    </div>
    
    {#if loading}
        <div class="card center-card">
            <div class="spinner"></div>
            <p>Načítavam atribúty...</p>
        </div>
    {:else if attributes.length === 0}
        <div class="card center-card">
            <div class="empty-icon">📦</div>
            <h2>Žiadne atribúty</h2>
            <p>Najprv importujte produkty cez Feed Import</p>
        </div>
    {:else}
        <!-- Global Settings -->
        <div class="card settings-card">
            <h3>📐 Všeobecné nastavenia</h3>
            <div class="settings-row">
                <div class="setting">
                    <label>Predvolený max. hodnôt:</label>
                    <input type="number" bind:value={filterSettings.global_max_values} min="1" max="100">
                    <button class="btn btn-sm" on:click={applyGlobalMaxToAll}>Aplikovať na všetky</button>
                </div>
                <label class="checkbox-label">
                    <input type="checkbox" bind:checked={filterSettings.show_counts}>
                    <span>Zobrazovať počty produktov</span>
                </label>
            </div>
        </div>
        
        <!-- Toolbar -->
        <div class="toolbar">
            <input type="text" placeholder="🔍 Hľadať atribút..." bind:value={searchQuery} class="search-input">
            <div class="toolbar-btns">
                <button class="btn btn-sm" on:click={selectAll}>✓ Vybrať všetky</button>
                <button class="btn btn-sm btn-outline" on:click={deselectAll}>✗ Zrušiť výber</button>
            </div>
        </div>

        <!-- Table -->
        <div class="card">
            <table class="attr-table">
                <thead>
                    <tr>
                        <th class="th-check">Aktívny</th>
                        <th class="th-name">Názov atribútu</th>
                        <th class="th-num">Produktov</th>
                        <th class="th-num">Hodnôt</th>
                        <th class="th-max">Max. na výber</th>
                    </tr>
                </thead>
                <tbody>
                    {#each filteredAttributes as attr}
                        <tr class:enabled={isEnabled(attr.name)}>
                            <td class="td-check">
                                <label class="toggle">
                                    <input type="checkbox" checked={isEnabled(attr.name)} on:change={() => toggleAttribute(attr.name)}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </td>
                            <td class="td-name"><strong>{attr.name}</strong></td>
                            <td class="td-num"><span class="badge">{attr.product_count}</span></td>
                            <td class="td-num">{attr.total_values}</td>
                            <td class="td-max">
                                <input 
                                    type="number" 
                                    class="max-input"
                                    value={getMaxValues(attr.name)}
                                    on:change={(e) => updateMaxValues(attr.name, parseInt(e.target.value) || 10)}
                                    min="1" max="100"
                                    disabled={!isEnabled(attr.name)}
                                >
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
            
            {#if filteredAttributes.length === 0 && searchQuery}
                <div class="no-results">Žiadne atribúty pre "{searchQuery}"</div>
            {/if}
        </div>
    {/if}
</div>

<style>
.page { padding: 24px 32px; max-width: 1100px; }

.header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
}
.header-left h1 { font-size: 26px; font-weight: 700; color: #1e293b; margin: 0 0 4px; }
.subtitle { color: #64748b; font-size: 14px; margin: 0; }
.header-actions { display: flex; align-items: center; gap: 12px; }
.save-msg { font-size: 14px; font-weight: 500; }
.save-msg.success { color: #059669; }
.save-msg.error { color: #dc2626; }

.card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    margin-bottom: 20px;
    overflow: hidden;
}

.center-card { text-align: center; padding: 60px 20px; color: #64748b; }
.empty-icon { font-size: 48px; margin-bottom: 16px; }
.center-card h2 { margin: 0 0 8px; color: #334155; }

.spinner {
    width: 36px; height: 36px;
    border: 3px solid #e2e8f0;
    border-top-color: #c4956a;
    border-radius: 50%;
    margin: 0 auto 16px;
    animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.settings-card { padding: 20px 24px; }
.settings-card h3 { font-size: 15px; font-weight: 600; margin: 0 0 16px; color: #334155; }
.settings-row { display: flex; gap: 32px; flex-wrap: wrap; align-items: center; }
.setting { display: flex; align-items: center; gap: 10px; }
.setting label { font-size: 14px; color: #475569; }
.setting input[type="number"] { width: 65px; padding: 8px; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center; }

.checkbox-label {
    display: flex; align-items: center; gap: 8px;
    cursor: pointer; font-size: 14px; color: #475569;
}
.checkbox-label input { width: 18px; height: 18px; accent-color: #c4956a; }

.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 16px; flex-wrap: wrap; }
.search-input { padding: 10px 16px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; width: 260px; background: white; }
.toolbar-btns { display: flex; gap: 10px; }

.btn {
    padding: 10px 18px; border: none; border-radius: 8px;
    font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.15s;
}
.btn-primary { background: #c4956a; color: white; }
.btn-primary:hover { background: #b8875c; }
.btn-primary:disabled { opacity: 0.7; cursor: wait; }
.btn-sm { padding: 8px 14px; font-size: 13px; background: #f1f5f9; color: #475569; }
.btn-sm:hover { background: #e2e8f0; }
.btn-outline { background: white; border: 1px solid #e2e8f0; }

.attr-table { width: 100%; border-collapse: collapse; }
.attr-table th {
    text-align: left; padding: 12px 16px; background: #f8fafc;
    font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b;
    border-bottom: 1px solid #e2e8f0;
}
.attr-table td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #475569; }
.attr-table tr:hover { background: #fafafa; }
.attr-table tr.enabled { background: #fefce8; }
.attr-table tr.enabled:hover { background: #fef9c3; }

.th-check, .td-check { width: 80px; text-align: center; }
.th-name, .td-name { min-width: 180px; }
.th-num, .td-num { width: 100px; text-align: center; }
.th-max, .td-max { width: 130px; }
.td-name strong { color: #1e293b; font-weight: 500; }

/* Toggle */
.toggle { position: relative; display: inline-block; width: 44px; height: 24px; }
.toggle input { opacity: 0; width: 0; height: 0; }
.toggle-slider {
    position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
    background-color: #e2e8f0; transition: .2s; border-radius: 24px;
}
.toggle-slider:before {
    position: absolute; content: ""; height: 18px; width: 18px;
    left: 3px; bottom: 3px; background-color: white; transition: .2s;
    border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.toggle input:checked + .toggle-slider { background-color: #c4956a; }
.toggle input:checked + .toggle-slider:before { transform: translateX(20px); }

.badge { display: inline-block; background: #dbeafe; color: #1e40af; padding: 4px 10px; border-radius: 12px; font-size: 13px; font-weight: 500; }

.max-input { width: 65px; padding: 8px; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center; }
.max-input:disabled { background: #f8fafc; color: #94a3b8; cursor: not-allowed; }

.no-results { text-align: center; padding: 40px; color: #64748b; }

@media (max-width: 768px) {
    .page { padding: 16px; }
    .header { flex-direction: column; gap: 16px; }
    .toolbar { flex-direction: column; align-items: stretch; }
    .search-input { width: 100%; }
    .settings-row { flex-direction: column; gap: 12px; align-items: flex-start; }
}
</style>
