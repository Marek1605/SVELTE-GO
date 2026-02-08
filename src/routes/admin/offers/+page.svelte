<script>
    import { onMount, onDestroy } from 'svelte';
    
    // Use relative URL for same-domain API or env variable for cross-domain
    const API_BASE = import.meta.env.VITE_API_URL || 'http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io/api/v1';
    
    let feeds = [];
    let shops = [];
    let stats = { total_feeds: 0, active_feeds: 0, today_imported: 0, running_imports: 0 };
    let loading = true;
    let error = null;
    
    let showNewFeedModal = false;
    let showEditModal = false;
    let showMappingModal = false;
    let showImportModal = false;
    let showNewShopModal = false;
    
    let currentFeed = null;
    let previewData = null;
    let previewLoading = false;
    let sourceFields = [];
    let fieldMapping = {};
    let importProgress = null;
    let progressInterval = null;
    
    let newFeed = { shop_id: '', name: '', feed_url: '', feed_type: 'xml', xml_item_path: 'SHOPITEM', csv_delimiter: ';', match_by: 'ean', match_mode: 'ean', is_active: true };
    let newShop = { shop_name: '', shop_url: '', display_mode: 'free', cpc_rate: 0.05 };
    
    const targetFields = [
        { key: 'ean', label: 'EAN / GTIN', description: 'Čiarový kód pre párovanie' },
        { key: 'sku', label: 'SKU / Kód', description: 'Interný kód produktu' },
        { key: 'title', label: 'Názov', required: true, description: 'Názov produktu' },
        { key: 'description', label: 'Popis', description: 'Popis produktu' },
        { key: 'price', label: 'Cena', required: true, description: 'Cena s DPH' },
        { key: 'url', label: 'URL odkaz', required: true, description: 'Odkaz na produkt v eshope' },
        { key: 'image', label: 'Obrázok', description: 'URL hlavného obrázka' },
        { key: 'category', label: 'Kategória', description: 'Kategória produktu' },
        { key: 'brand', label: 'Značka', description: 'Výrobca / značka' },
        { key: 'stock_status', label: 'Stav skladu', description: 'instock / outofstock' },
        { key: 'stock_quantity', label: 'Množstvo', description: 'Počet kusov na sklade' },
        { key: 'delivery', label: 'Dodanie', description: 'Doba dodania' },
    ];
    
    onMount(loadData);
    onDestroy(() => { if (progressInterval) clearInterval(progressInterval); });
    
    async function loadData() {
        loading = true; error = null;
        try {
            const [fRes, sRes] = await Promise.all([
                fetch(`${API_BASE}/admin/offer-feeds/`),
                fetch(`${API_BASE}/admin/shops`)
            ]);
            const fData = await fRes.json();
            const sData = await sRes.json();
            if (fData.success) { feeds = fData.data || []; stats = fData.stats || stats; }
            if (sData.success) { shops = sData.data || []; }
        } catch (e) { error = 'Chyba: ' + e.message; }
        loading = false;
    }
    
    async function createFeed() {
        try {
            const res = await fetch(`${API_BASE}/admin/offer-feeds/`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newFeed)
            });
            const data = await res.json();
            if (data.success) { showNewFeedModal = false; newFeed = { shop_id: '', name: '', feed_url: '', feed_type: 'xml', xml_item_path: 'SHOPITEM', csv_delimiter: ';', match_by: 'ean', match_mode: 'ean', is_active: true }; await loadData(); }
            else alert('Chyba: ' + (data.error || 'Neznáma'));
        } catch (e) { alert('Chyba: ' + e.message); }
    }
    
    async function updateFeed() {
        if (!currentFeed) return;
        try {
            const res = await fetch(`${API_BASE}/admin/offer-feeds/${currentFeed.id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentFeed)
            });
            if ((await res.json()).success) { showEditModal = false; await loadData(); }
        } catch (e) { alert('Chyba: ' + e.message); }
    }
    
    async function deleteFeed(feed) {
        if (!confirm(`Zmazať "${feed.name}"?`)) return;
        await fetch(`${API_BASE}/admin/offer-feeds/${feed.id}`, { method: 'DELETE' });
        await loadData();
    }
    
    function editFeed(feed) { currentFeed = { ...feed }; showEditModal = true; }
    
    async function loadPreview(feed = null) {
        const url = feed?.feed_url || currentFeed?.feed_url || newFeed.feed_url;
        const type = feed?.feed_type || currentFeed?.feed_type || newFeed.feed_type;
        const xmlPath = feed?.xml_item_path || currentFeed?.xml_item_path || newFeed.xml_item_path;
        if (!url) { alert('Zadajte URL'); return; }
        previewLoading = true; previewData = null;
        try {
            const res = await fetch(`${API_BASE}/admin/offer-feeds/preview`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, type, xml_item_path: xmlPath, limit: 5 })
            });
            const data = await res.json();
            if (data.success) {
                previewData = data;
                sourceFields = data.fields || [];
                if (data.auto_mappings) data.auto_mappings.forEach(m => { fieldMapping[m.target_field] = m.source_field; });
            } else previewData = { error: data.error };
        } catch (e) { previewData = { error: e.message }; }
        previewLoading = false;
    }
    
    function openMapping(feed) { currentFeed = { ...feed }; fieldMapping = { ...(feed.field_mapping || {}) }; showMappingModal = true; loadPreview(feed); }
    
    async function saveMappings() {
        if (!currentFeed) return;
        await fetch(`${API_BASE}/admin/offer-feeds/${currentFeed.id}/mappings`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mappings: fieldMapping })
        });
        showMappingModal = false; await loadData();
    }
    
    async function startImport(feed) {
        currentFeed = feed;
        importProgress = { status: 'starting', message: 'Spúšťam...', percent: 0, total: 0, processed: 0, created: 0, updated: 0, matched: 0, skipped: 0, errors: 0, logs: [] };
        showImportModal = true;
        try {
            const res = await fetch(`${API_BASE}/admin/offer-feeds/${feed.id}/import`, { method: 'POST' });
            if ((await res.json()).success) progressInterval = setInterval(() => pollProgress(feed.id), 1000);
            else { importProgress.status = 'error'; importProgress.message = 'Chyba spustenia'; }
        } catch (e) { importProgress.status = 'error'; importProgress.message = e.message; }
    }
    
    async function pollProgress(feedId) {
        try {
            const res = await fetch(`${API_BASE}/admin/offer-feeds/${feedId}/progress`);
            const data = await res.json();
            if (data.success && data.data) {
                importProgress = data.data;
                if (['completed', 'error', 'cancelled'].includes(data.data.status)) {
                    clearInterval(progressInterval); progressInterval = null; await loadData();
                }
            }
        } catch (e) { console.error(e); }
    }
    
    async function stopImport() {
        if (!currentFeed) return;
        await fetch(`${API_BASE}/admin/offer-feeds/${currentFeed.id}/stop`, { method: 'POST' });
        clearInterval(progressInterval); progressInterval = null;
        importProgress.status = 'cancelled'; importProgress.message = 'Zastavené';
    }
    
    function closeImportModal() { if (progressInterval) clearInterval(progressInterval); showImportModal = false; }
    
    async function createShop() {
        try {
            const res = await fetch(`${API_BASE}/admin/shops`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newShop)
            });
            if ((await res.json()).success) { showNewShopModal = false; newShop = { shop_name: '', shop_url: '', display_mode: 'free', cpc_rate: 0.05 }; await loadData(); }
        } catch (e) { alert('Chyba: ' + e.message); }
    }
    
    function formatDate(d) { return d ? new Date(d).toLocaleString('sk-SK') : 'Nikdy'; }
    function getStatus(s) { return { active: '🟢', idle: '⚪', running: '🔵', error: '🔴', completed: '✅', cancelled: '🟡' }[s] || '⚪'; }
</script>

<svelte:head><title>Ponuky predajcov | Admin</title></svelte:head>

<div class="page">
    <div class="header">
        <div>
            <h1>📦 Ponuky predajcov</h1>
            <p>Import ponúk od predajcov podľa EAN/SKU</p>
        </div>
        <div class="actions">
            <button class="btn secondary" on:click={() => showNewShopModal = true}>🏪 Nový obchod</button>
            <button class="btn primary" on:click={() => showNewFeedModal = true}>➕ Nový feed</button>
        </div>
    </div>
    
    {#if error}<div class="alert error">❌ {error} <button on:click={loadData}>Znova</button></div>{/if}
    
    <div class="stats">
        <div class="stat"><span class="icon">📡</span><div><strong>{stats.active_feeds}/{stats.total_feeds}</strong><small>Feedov</small></div></div>
        <div class="stat"><span class="icon">📦</span><div><strong>{stats.today_imported}</strong><small>Dnes</small></div></div>
        <div class="stat {stats.running_imports > 0 ? 'active' : ''}"><span class="icon">{stats.running_imports > 0 ? '⏳' : '💤'}</span><div><strong>{stats.running_imports}</strong><small>Beží</small></div></div>
        <div class="stat"><span class="icon">🏪</span><div><strong>{shops.length}</strong><small>Obchodov</small></div></div>
    </div>
    
    <div class="card">
        <div class="card-head"><h2>📡 Feed Importy</h2><button class="btn small" on:click={loadData}>🔄</button></div>
        {#if loading}
            <div class="loading"><div class="spinner"></div> Načítavam...</div>
        {:else if feeds.length === 0}
            <div class="empty">📭 Žiadne feedy<br><button class="btn primary" on:click={() => showNewFeedModal = true}>➕ Pridať</button></div>
        {:else}
            <table>
                <thead><tr><th>Feed</th><th>Obchod</th><th>Typ</th><th>Režim</th><th>Stav</th><th>Ponúk</th><th>Import</th><th>Akcie</th></tr></thead>
                <tbody>
                    {#each feeds as f}
                        <tr>
                            <td><strong>{f.name}</strong><br><small>{f.feed_url?.substring(0,40)}...</small></td>
                            <td>{f.shop_name || '—'}</td>
                            <td><span class="badge">{f.feed_type?.toUpperCase()}</span></td>
                            <td><span class="badge" class:mode-fulltext={f.match_mode === 'fulltext'} class:mode-ean={!f.match_mode || f.match_mode === 'ean'} class:mode-ai={f.match_mode === 'ai'}>{f.match_mode === 'ai' ? '🤖 AI' : f.match_mode === 'fulltext' ? '🔍 Fulltext' : '📦 EAN'}</span></td>
                            <td>{getStatus(f.sync_status)} {f.sync_status}</td>
                            <td>{f.total_offers || 0} {#if f.matched_offers}<span class="green">({f.matched_offers})</span>{/if}</td>
                            <td>{formatDate(f.last_import_at)}</td>
                            <td class="actions">
                                {#if f.sync_status === 'running'}
                                    <button class="btn small warning" on:click={stopImport}>⏹</button>
                                {:else}
                                    <button class="btn small success" on:click={() => startImport(f)}>▶</button>
                                {/if}
                                <button class="btn small" on:click={() => openMapping(f)}>🔗</button>
                                <button class="btn small" on:click={() => editFeed(f)}>✏️</button>
                                <button class="btn small danger" on:click={() => deleteFeed(f)}>🗑️</button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}
    </div>
</div>

<!-- NEW FEED MODAL -->
{#if showNewFeedModal}
<div class="modal-bg" on:click={() => showNewFeedModal = false}>
    <div class="modal" on:click|stopPropagation>
        <div class="modal-head"><h3>➕ Nový Feed</h3><button on:click={() => showNewFeedModal = false}>×</button></div>
        <div class="modal-body">
            <label>Obchod *<select bind:value={newFeed.shop_id}><option value="">-- Vyberte --</option>{#each shops as s}<option value={s.id}>{s.shop_name}</option>{/each}</select></label>
            <label>Názov *<input bind:value={newFeed.name} placeholder="Môj Feed"></label>
            <label>URL *<input bind:value={newFeed.feed_url} placeholder="https://..."><button class="btn small" on:click={() => loadPreview()}>🔍 Test</button></label>
            <div class="row">
                <label>Typ<select bind:value={newFeed.feed_type}><option value="xml">XML</option><option value="csv">CSV</option><option value="json">JSON</option></select></label>
                <label>Match<select bind:value={newFeed.match_by}><option value="ean">EAN</option><option value="sku">SKU</option></select></label>
                <label>Režim<select bind:value={newFeed.match_mode}><option value="fulltext">🔍 Len fulltext</option><option value="ean">📦 EAN + Fuzzy</option><option value="ai">🤖 EAN + Fuzzy + AI</option></select></label>
            </div>
            {#if newFeed.feed_type === 'xml'}
                <label>XPath<input bind:value={newFeed.xml_item_path} placeholder="SHOP/SHOPITEM">
                    <div class="presets"><button class="btn xs" on:click={() => newFeed.xml_item_path = 'SHOP/SHOPITEM'}>Heureka</button><button class="btn xs" on:click={() => newFeed.xml_item_path = 'channel/item'}>Google</button></div>
                </label>
            {/if}
            <label class="check"><input type="checkbox" bind:checked={newFeed.is_active}> Aktívny</label>
        </div>
        <div class="modal-foot"><button class="btn" on:click={() => showNewFeedModal = false}>Zrušiť</button><button class="btn primary" on:click={createFeed}>Vytvoriť</button></div>
    </div>
</div>
{/if}

<!-- EDIT MODAL -->
{#if showEditModal && currentFeed}
<div class="modal-bg" on:click={() => showEditModal = false}>
    <div class="modal" on:click|stopPropagation>
        <div class="modal-head"><h3>✏️ Upraviť</h3><button on:click={() => showEditModal = false}>×</button></div>
        <div class="modal-body">
            <label>Obchod<select bind:value={currentFeed.shop_id}>{#each shops as s}<option value={s.id}>{s.shop_name}</option>{/each}</select></label>
            <label>Názov<input bind:value={currentFeed.name}></label>
            <label>URL<input bind:value={currentFeed.feed_url}></label>
            <div class="row">
                <label>Typ<select bind:value={currentFeed.feed_type}><option value="xml">XML</option><option value="csv">CSV</option><option value="json">JSON</option></select></label>
                <label>Match<select bind:value={currentFeed.match_by}><option value="ean">EAN</option><option value="sku">SKU</option></select></label>
                <label>Režim<select bind:value={currentFeed.match_mode}><option value="fulltext">🔍 Len fulltext</option><option value="ean">📦 EAN + Fuzzy</option><option value="ai">🤖 EAN + Fuzzy + AI</option></select></label>
            </div>
            {#if currentFeed.feed_type === 'xml'}<label>XPath<input bind:value={currentFeed.xml_item_path}></label>{/if}
            <label class="check"><input type="checkbox" bind:checked={currentFeed.is_active}> Aktívny</label>
        </div>
        <div class="modal-foot"><button class="btn" on:click={() => showEditModal = false}>Zrušiť</button><button class="btn primary" on:click={updateFeed}>Uložiť</button></div>
    </div>
</div>
{/if}

<!-- MAPPING MODAL -->
{#if showMappingModal && currentFeed}
<div class="modal-bg" on:click={() => showMappingModal = false}>
    <div class="modal wide" on:click|stopPropagation>
        <div class="modal-head"><h3>🔗 Mapovanie polí: {currentFeed.name}</h3><button on:click={() => showMappingModal = false}>×</button></div>
        <div class="modal-body">
            {#if previewLoading}
                <div class="loading"><div class="spinner"></div> Sťahujem a analyzujem feed...</div>
            {:else if previewData?.error}
                <div class="alert error">❌ {previewData.error}</div>
                <button class="btn primary" on:click={() => loadPreview(currentFeed)}>🔄 Skúsiť znova</button>
            {:else if sourceFields.length > 0}
                <div class="mapping-info">
                    <span>📊 Nájdených <strong>{sourceFields.length}</strong> polí</span>
                    <span>📦 Položiek: <strong>{previewData?.total_items || '?'}</strong></span>
                    {#if previewData?.auto_mappings?.length}
                        <span class="auto-mapped">✨ Auto-mapované: {previewData.auto_mappings.length}</span>
                    {/if}
                </div>
                <table class="mapping">
                    <thead><tr><th>Cieľové pole</th><th></th><th>Zdrojové pole z feedu</th><th>Ukážka hodnoty</th></tr></thead>
                    <tbody>
                        {#each targetFields as t}
                            <tr class:mapped={fieldMapping[t.key]}>
                                <td>
                                    <strong>{t.label}</strong>
                                    {#if t.required}<span class="req">*</span>{/if}
                                    {#if t.description}<small class="desc">{t.description}</small>{/if}
                                </td>
                                <td class="arrow">→</td>
                                <td>
                                    <select bind:value={fieldMapping[t.key]} class:filled={fieldMapping[t.key]}>
                                        <option value="">-- Vyber pole --</option>
                                        {#each sourceFields as f}
                                            <option value={f}>{f}</option>
                                        {/each}
                                    </select>
                                </td>
                                <td class="preview-val">
                                    {#if fieldMapping[t.key] && previewData?.preview?.[0]}
                                        {String(previewData.preview[0][fieldMapping[t.key]] || '—').substring(0, 50)}
                                    {:else}
                                        <span class="empty-val">—</span>
                                    {/if}
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
                {#if previewData?.preview?.length}
                    <details class="preview-section">
                        <summary>📋 Ukážka dát ({previewData.preview.length} položiek)</summary>
                        <div class="preview-wrap">
                            <table>
                                <thead><tr>{#each sourceFields.slice(0, 8) as f}<th>{f}</th>{/each}</tr></thead>
                                <tbody>
                                    {#each previewData.preview.slice(0, 5) as item}
                                        <tr>{#each sourceFields.slice(0, 8) as f}<td>{String(item[f] || '').substring(0, 40)}</td>{/each}</tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    </details>
                {/if}
            {:else}
                <div class="empty-state">
                    <p>Klikni pre načítanie polí z feedu</p>
                    <button class="btn primary lg" on:click={() => loadPreview(currentFeed)}>🔍 Načítať polia z feedu</button>
                </div>
            {/if}
        </div>
        <div class="modal-foot">
            <button class="btn" on:click={() => showMappingModal = false}>Zrušiť</button>
            <button class="btn primary" on:click={saveMappings} disabled={!sourceFields.length}>💾 Uložiť mapovanie</button>
        </div>
    </div>
</div>
{/if}

<!-- IMPORT MODAL -->
{#if showImportModal && importProgress}
<div class="modal-bg">
    <div class="modal" on:click|stopPropagation>
        <div class="modal-head"><h3>{importProgress.status === 'completed' ? '✅ Hotovo' : importProgress.status === 'error' ? '❌ Chyba' : '⏳ Import...'}</h3></div>
        <div class="modal-body">
            <div class="progress"><div class="bar" style="width:{importProgress.percent}%"></div></div>
            <p class="msg">{importProgress.message}</p>
            <div class="import-stats">
                <div><strong>{importProgress.processed}/{importProgress.total}</strong><small>Spracované</small></div>
                <div class="green"><strong>{importProgress.created}</strong><small>Vytvorené</small></div>
                <div class="blue"><strong>{importProgress.updated}</strong><small>Aktualizované</small></div>
                <div class="purple"><strong>{importProgress.matched}</strong><small>Spárované</small></div>
                <div><strong>{importProgress.skipped}</strong><small>Preskočené</small></div>
                <div class="red"><strong>{importProgress.errors}</strong><small>Chyby</small></div>
            </div>
            {#if importProgress.logs?.length}
                <div class="logs"><div class="logs-head">📋 Log</div><div class="logs-body">{#each importProgress.logs as l}<div>{l}</div>{/each}</div></div>
            {/if}
        </div>
        <div class="modal-foot">
            {#if ['processing','initialized','starting'].includes(importProgress.status)}<button class="btn warning" on:click={stopImport}>⏹ Stop</button>
            {:else}<button class="btn primary" on:click={closeImportModal}>Zavrieť</button>{/if}
        </div>
    </div>
</div>
{/if}

<!-- NEW SHOP MODAL -->
{#if showNewShopModal}
<div class="modal-bg" on:click={() => showNewShopModal = false}>
    <div class="modal" on:click|stopPropagation>
        <div class="modal-head"><h3>🏪 Nový obchod</h3><button on:click={() => showNewShopModal = false}>×</button></div>
        <div class="modal-body">
            <label>Názov *<input bind:value={newShop.shop_name} placeholder="Môj E-shop"></label>
            <label>URL<input bind:value={newShop.shop_url} placeholder="https://..."></label>
            <label>Režim<select bind:value={newShop.display_mode}><option value="free">FREE</option><option value="paid">PAID (CPC)</option></select></label>
            <label>CPC sadzba<input type="number" step="0.01" bind:value={newShop.cpc_rate}></label>
        </div>
        <div class="modal-foot"><button class="btn" on:click={() => showNewShopModal = false}>Zrušiť</button><button class="btn primary" on:click={createShop}>Vytvoriť</button></div>
    </div>
</div>
{/if}

<style>
    .page { padding: 24px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 4px 0 0; color: #64748b; }
    .actions { display: flex; gap: 8px; }
    
    .btn { padding: 10px 18px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s; }
    .btn.primary { background: #f97316; color: white; }
    .btn.primary:hover { background: #ea580c; }
    .btn.secondary { background: #f1f5f9; color: #1e293b; }
    .btn.success { background: #22c55e; color: white; }
    .btn.warning { background: #f59e0b; color: white; }
    .btn.danger { background: #ef4444; color: white; }
    .btn.small { padding: 6px 12px; font-size: 13px; }
    .btn.xs { padding: 4px 8px; font-size: 11px; }
    
    .alert { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
    .alert.error { background: #fee2e2; color: #dc2626; }
    
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat { background: white; padding: 16px; border-radius: 12px; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .stat.active { background: linear-gradient(135deg, #dbeafe, #eff6ff); }
    .stat .icon { font-size: 28px; }
    .stat strong { font-size: 22px; display: block; }
    .stat small { color: #64748b; font-size: 12px; }
    
    .card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
    .card-head { padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
    .card-head h2 { margin: 0; font-size: 18px; }
    
    .loading, .empty { padding: 40px; text-align: center; color: #64748b; }
    .spinner { width: 24px; height: 24px; border: 3px solid #e2e8f0; border-top-color: #f97316; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; margin-right: 8px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #f1f5f9; }
    th { background: #f8fafc; font-weight: 600; font-size: 12px; text-transform: uppercase; color: #64748b; }
    td { font-size: 14px; }
    td.actions { white-space: nowrap; }
    td.actions button { margin-right: 4px; }
    
    .badge { background: #e2e8f0; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .badge.mode-fulltext { background: #fef3c7; color: #92400e; }
    .badge.mode-ean { background: #dbeafe; color: #1d4ed8; }
    .badge.mode-ai { background: #d1fae5; color: #065f46; }
    .green { color: #22c55e; }
    .blue { color: #3b82f6; }
    .purple { color: #8b5cf6; }
    .red { color: #ef4444; }
    
    .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 16px; width: 90%; max-width: 500px; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column; }
    .modal.wide { max-width: 900px; }
    .modal-head { padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
    .modal-head h3 { margin: 0; }
    .modal-head button { background: none; border: none; font-size: 24px; cursor: pointer; color: #94a3b8; }
    .modal-body { padding: 20px; overflow-y: auto; flex: 1; }
    .modal-foot { padding: 16px 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 8px; }
    
    label { display: block; margin-bottom: 16px; font-weight: 500; font-size: 14px; }
    label input, label select { display: block; width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; margin-top: 4px; }
    label input:focus, label select:focus { outline: none; border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.1); }
    label.check { display: flex; align-items: center; gap: 8px; }
    label.check input { width: auto; margin: 0; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .presets { margin-top: 8px; display: flex; gap: 4px; }
    .req { color: #ef4444; margin-left: 2px; }
    
    .mapping th, .mapping td { padding: 8px 12px; }
    .mapping .preview { max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #64748b; font-size: 12px; }
    .mapping tr.mapped { background: #f0fdf4; }
    .mapping .arrow { width: 30px; text-align: center; color: #94a3b8; }
    .mapping .desc { display: block; font-size: 11px; color: #94a3b8; font-weight: normal; margin-top: 2px; }
    .mapping select { min-width: 180px; padding: 8px 10px; border: 1px solid #e2e8f0; border-radius: 6px; }
    .mapping select.filled { border-color: #22c55e; background: #f0fdf4; }
    .mapping .preview-val { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #64748b; font-size: 12px; font-family: monospace; background: #f8fafc; padding: 4px 8px; border-radius: 4px; }
    .mapping .empty-val { color: #cbd5e1; }
    
    .mapping-info { display: flex; gap: 16px; padding: 12px 16px; background: #f8fafc; border-radius: 8px; margin-bottom: 16px; font-size: 13px; }
    .mapping-info .auto-mapped { color: #22c55e; font-weight: 500; }
    
    .empty-state { padding: 60px 20px; text-align: center; }
    .empty-state p { color: #64748b; margin-bottom: 16px; }
    .btn.lg { padding: 14px 28px; font-size: 16px; }
    
    .preview-section { margin-top: 20px; }
    .preview-section summary { cursor: pointer; padding: 12px; background: #f8fafc; border-radius: 8px; font-weight: 500; }
    .preview-section summary:hover { background: #f1f5f9; }
    
    .preview-wrap { overflow-x: auto; margin-top: 16px; }
    .preview-wrap table { font-size: 12px; }
    .preview-wrap th, .preview-wrap td { padding: 6px 10px; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    
    .progress { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin-bottom: 12px; }
    .progress .bar { height: 100%; background: linear-gradient(90deg, #f97316, #fb923c); transition: width 0.3s; }
    .msg { text-align: center; color: #64748b; margin-bottom: 16px; }
    .import-stats { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; text-align: center; margin-bottom: 16px; }
    .import-stats div { padding: 8px; background: #f8fafc; border-radius: 8px; }
    .import-stats strong { display: block; font-size: 18px; }
    .import-stats small { font-size: 10px; color: #64748b; }
    
    .logs { background: #1e293b; border-radius: 8px; overflow: hidden; margin-top: 16px; }
    .logs-head { padding: 8px 12px; background: #0f172a; color: #94a3b8; font-size: 12px; }
    .logs-body { padding: 12px; max-height: 150px; overflow-y: auto; font-family: monospace; font-size: 11px; color: #cbd5e1; }
    .logs-body div { margin-bottom: 4px; }
</style>
