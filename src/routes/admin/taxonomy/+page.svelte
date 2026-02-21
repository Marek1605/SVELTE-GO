<script>
    import { onMount } from 'svelte';
    import { adminFetch, adminRawFetch, API_BASE } from '$lib/adminApi.js';

    let activeTab = 'overview';
    let loading = true;

    // Stats
    let stats = { reference_trees: { google: 0, heureka: 0 }, staging: { pending: 0, approved: 0, rejected: 0 }, live: { total: 0, with_products: 0, empty: 0 } };

    // Fetch progress
    let fetchingGoogle = false, fetchingHeureka = false, fetchMsg = '';

    // Reference tree browser
    let refSource = 'google', refSearch = '', refItems = [], refTotal = 0, refPage = 1, refLoading = false;

    // Staging
    let stagingItems = [], stagingTotal = 0, stagingPage = 1, stagingLoading = false, stagingSearch = '', stagingFilter = 'pending';
    let approving = false, rejecting = false, stagingMsg = '';

    // Import
    let importFile = null, importing = false, importMsg = '';

    onMount(async () => { await loadStats(); loading = false; });

    function fmt(n) { return (n || 0).toLocaleString('sk-SK'); }

    async function loadStats() {
        const r = await adminFetch('/admin/ai/taxonomy/stats');
        if (r?.success) stats = r.stats;
    }

    // ─── FETCH SOURCES ───
    async function fetchGoogle() {
        fetchingGoogle = true; fetchMsg = '';
        const r = await adminFetch('/admin/ai/taxonomy/fetch-google', { method: 'POST' });
        fetchMsg = r?.success ? '✅ ' + r.message : '❌ ' + (r?.error || 'Chyba');
        fetchingGoogle = false; await loadStats();
    }
    async function fetchHeureka() {
        fetchingHeureka = true; fetchMsg = '';
        const r = await adminFetch('/admin/ai/taxonomy/fetch-heureka', { method: 'POST' });
        fetchMsg = r?.success ? '✅ ' + r.message : '❌ ' + (r?.error || 'Chyba');
        fetchingHeureka = false; await loadStats();
    }

    // ─── REFERENCE TREE BROWSER ───
    async function loadRefTree() {
        refLoading = true;
        const params = new URLSearchParams({ source: refSource, page: refPage, limit: 50 });
        if (refSearch) params.set('search', refSearch);
        const r = await adminFetch(`/admin/ai/taxonomy/list?${params}`);
        if (r?.success) { refItems = r.items || []; refTotal = r.total || 0; }
        refLoading = false;
    }
    function refSearchDo() { refPage = 1; loadRefTree(); }
    function refPageChange(p) { refPage = p; loadRefTree(); }

    // ─── XLSX EXPORT ───
    function exportXLSX() {
        const auth = getAuth();
        window.open(`${API_BASE}/admin/ai/taxonomy/export-xlsx`, '_blank');
    }
    function getAuth() {
        const u = sessionStorage.getItem('adm_u'); const p = sessionStorage.getItem('adm_p');
        return (u && p) ? 'Basic ' + btoa(u + ':' + p) : '';
    }
    async function doExport() {
        const r = await adminRawFetch(`${API_BASE}/admin/ai/taxonomy/export-xlsx`);
        if (r.ok) {
            const blob = await r.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'megaprice-taxonomy.xls'; a.click();
            URL.revokeObjectURL(url);
        } else { alert('Chyba pri exporte'); }
    }

    // ─── XLSX IMPORT ───
    function handleFile(e) { importFile = e.target.files[0]; }
    async function doImport() {
        if (!importFile) { alert('Vyberte súbor'); return; }
        importing = true; importMsg = '';
        const fd = new FormData(); fd.append('file', importFile);
        try {
            const u = sessionStorage.getItem('adm_u'); const p = sessionStorage.getItem('adm_p');
            const r = await fetch(`${API_BASE}/admin/ai/taxonomy/import-xlsx`, {
                method: 'POST', body: fd,
                headers: { 'Authorization': 'Basic ' + btoa(u + ':' + p) }
            });
            const data = await r.json();
            importMsg = data?.success ? `✅ ${data.message}` : '❌ ' + (data?.error || 'Chyba');
            if (data?.success) { await loadStats(); if (activeTab === 'staging') loadStaging(); }
        } catch(e) { importMsg = '❌ ' + e.message; }
        importing = false;
    }

    // ─── STAGING ───
    async function loadStaging() {
        stagingLoading = true;
        const params = new URLSearchParams({ status: stagingFilter, page: stagingPage, limit: 50 });
        if (stagingSearch) params.set('search', stagingSearch);
        const r = await adminFetch(`/admin/ai/taxonomy/staging?${params}`);
        if (r?.success) { stagingItems = r.items || []; stagingTotal = r.total || 0; }
        stagingLoading = false;
    }
    function stagingSearchDo() { stagingPage = 1; loadStaging(); }

    async function approveAll() {
        if (!confirm('Schváliť všetky nové kategórie do live stromu?')) return;
        approving = true; stagingMsg = '';
        const r = await adminFetch('/admin/ai/taxonomy/approve', { method: 'POST', body: JSON.stringify({ approve_all: true, action: 'create_only' }) });
        stagingMsg = r?.success ? `✅ ${r.message}` : '❌ ' + (r?.error || 'Chyba');
        approving = false; await loadStats(); await loadStaging();
    }
    async function approveSelected(ids) {
        approving = true; stagingMsg = '';
        const r = await adminFetch('/admin/ai/taxonomy/approve', { method: 'POST', body: JSON.stringify({ ids }) });
        stagingMsg = r?.success ? `✅ ${r.message}` : '❌ ' + (r?.error || 'Chyba');
        approving = false; await loadStats(); await loadStaging();
    }
    async function rejectAll() {
        if (!confirm('Zamietnuť všetky pending?')) return;
        rejecting = true; stagingMsg = '';
        const r = await adminFetch('/admin/ai/taxonomy/reject', { method: 'POST', body: JSON.stringify({ reject_all: true }) });
        stagingMsg = r?.success ? `✅ ${r.message}` : '❌ ' + (r?.error || 'Chyba');
        rejecting = false; await loadStats(); await loadStaging();
    }
    async function clearStaging(status) {
        if (!confirm(`Vymazať staging (${status})?`)) return;
        await adminFetch(`/admin/ai/taxonomy/staging?status=${status}`, { method: 'DELETE' });
        await loadStats(); await loadStaging();
    }

    let selectedIds = new Set();
    function toggleSelect(id) { if (selectedIds.has(id)) selectedIds.delete(id); else selectedIds.add(id); selectedIds = selectedIds; }
    function selectAll() { if (selectedIds.size === stagingItems.length) selectedIds = new Set(); else selectedIds = new Set(stagingItems.map(i => i.ID || i.id)); selectedIds = selectedIds; }

    // ─── SETUP ───
    let setupDone = false;
    async function runSetup() { const r = await adminFetch('/admin/ai/taxonomy/setup', { method: 'POST' }); if (r?.success) setupDone = true; }

    function switchTab(t) {
        activeTab = t;
        if (t === 'browser' && refItems.length === 0) loadRefTree();
        if (t === 'staging' && stagingItems.length === 0) loadStaging();
    }
</script>

<svelte:head><title>Taxonomy Management | Admin</title></svelte:head>

<div class="page">
    <div class="page-head">
        <h1>📂 Taxonomy Management</h1>
        <div class="tab-bar">
            <button class="tab" class:active={activeTab === 'overview'} on:click={() => switchTab('overview')}>📊 Prehľad</button>
            <button class="tab" class:active={activeTab === 'browser'} on:click={() => switchTab('browser')}>🌳 Referenčné stromy</button>
            <button class="tab" class:active={activeTab === 'import'} on:click={() => switchTab('import')}>📥 Import / Export</button>
            <button class="tab" class:active={activeTab === 'staging'} on:click={() => switchTab('staging')}>✅ Staging & Schválenie</button>
        </div>
    </div>

    {#if loading}<div class="loading">Načítavam...</div>{:else}

    <!-- ════════════════ OVERVIEW TAB ════════════════ -->
    {#if activeTab === 'overview'}
    <div class="section">
        <h2>📊 Celkový prehľad</h2>
        <div class="stats-row">
            <div class="stat-group">
                <div class="stat-group-title">🌳 Referenčné stromy</div>
                <div class="stats-grid">
                    <div class="stat"><span class="n">{fmt(stats.reference_trees?.google)}</span><span class="l">Google (EN)</span></div>
                    <div class="stat"><span class="n">{fmt(stats.reference_trees?.heureka)}</span><span class="l">Heureka (SK)</span></div>
                </div>
            </div>
            <div class="stat-group">
                <div class="stat-group-title">⏳ Staging</div>
                <div class="stats-grid">
                    <div class="stat warn"><span class="n">{fmt(stats.staging?.pending)}</span><span class="l">Čaká</span></div>
                    <div class="stat ok"><span class="n">{fmt(stats.staging?.approved)}</span><span class="l">Schválené</span></div>
                    <div class="stat"><span class="n">{fmt(stats.staging?.rejected)}</span><span class="l">Zamietnuté</span></div>
                </div>
            </div>
            <div class="stat-group">
                <div class="stat-group-title">🏪 Live kategórie</div>
                <div class="stats-grid">
                    <div class="stat ok"><span class="n">{fmt(stats.live?.total)}</span><span class="l">Celkom</span></div>
                    <div class="stat"><span class="n">{fmt(stats.live?.with_products)}</span><span class="l">S produktmi</span></div>
                    <div class="stat warn"><span class="n">{fmt(stats.live?.empty)}</span><span class="l">Prázdne</span></div>
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>🔄 Stiahnuť referenčné stromy</h2>
        <p class="desc">Stiahne aktuálne kategórie z Google a Heureka.sk ako referenčné stromy pre AI a pre teba.</p>
        <div class="fetch-row">
            <div class="fetch-card">
                <div class="fetch-icon">🔵</div>
                <div class="fetch-info">
                    <strong>Google Product Taxonomy</strong>
                    <span>~5,595 kategórií (angličtina)</span>
                </div>
                <button class="btn blue" on:click={fetchGoogle} disabled={fetchingGoogle}>
                    {fetchingGoogle ? '⏳ Sťahujem...' : '📥 Stiahnuť Google'}
                </button>
            </div>
            <div class="fetch-card">
                <div class="fetch-icon">🟢</div>
                <div class="fetch-info">
                    <strong>Heureka.sk Taxonomy</strong>
                    <span>~3,000+ kategórií (slovenčina)</span>
                </div>
                <button class="btn green" on:click={fetchHeureka} disabled={fetchingHeureka}>
                    {fetchingHeureka ? '⏳ Sťahujem...' : '📥 Stiahnuť Heureka'}
                </button>
            </div>
        </div>
        {#if fetchMsg}<div class="msg-box">{fetchMsg}</div>{/if}
    </div>

    <div class="section">
        <h2>🛠️ Prvotné nastavenie</h2>
        <p class="desc">Vytvorí tabuľky pre taxonomy management (stačí raz).</p>
        <button class="btn outline" on:click={runSetup} disabled={setupDone}>{setupDone ? '✅ Hotovo' : '⚙️ Setup tabuľky'}</button>
    </div>

    <!-- ════════════════ BROWSER TAB ════════════════ -->
    {:else if activeTab === 'browser'}
    <div class="section">
        <h2>🌳 Referenčné stromy</h2>
        <div class="filter-row">
            <div class="filter-tabs">
                <button class:active={refSource==='google'} on:click={() => {refSource='google'; refPage=1; loadRefTree();}}>🔵 Google ({fmt(stats.reference_trees?.google)})</button>
                <button class:active={refSource==='heureka'} on:click={() => {refSource='heureka'; refPage=1; loadRefTree();}}>🟢 Heureka ({fmt(stats.reference_trees?.heureka)})</button>
            </div>
            <div class="search-box">
                <input type="text" bind:value={refSearch} placeholder="Hľadať..." on:keydown={(e) => e.key === 'Enter' && refSearchDo()}>
                <button class="btn-sm blue" on:click={refSearchDo}>🔍</button>
            </div>
        </div>

        {#if refLoading}<div class="loading">Načítavam...</div>
        {:else if refItems.length === 0}<div class="empty-msg">Žiadne kategórie. Najprv stiahnite strom.</div>
        {:else}
        <div class="tbl-wrap">
            <table class="tbl"><thead><tr>
                <th>ID</th><th>Cesta</th><th>Názov</th>
                {#if refSource === 'google'}<th>Preklad SK</th>{/if}
                <th>Hĺbka</th>
            </tr></thead><tbody>
                {#each refItems as item}
                <tr>
                    <td class="td-id">{item.source_id || item.SourceID || '—'}</td>
                    <td class="td-path">{#each (item.path || item.Path || '').split(' > ') as part, i}{#if i > 0}<span class="sep"> › </span>{/if}<span class:leaf={i === (item.path || item.Path || '').split(' > ').length - 1}>{part}</span>{/each}</td>
                    <td><strong>{item.name_original || item.NameOrig || ''}</strong></td>
                    {#if refSource === 'google'}<td class="td-sk">{item.name_sk || item.NameSK || '—'}</td>{/if}
                    <td class="td-depth">{item.depth || item.Depth}</td>
                </tr>
                {/each}
            </tbody></table>
        </div>
        <div class="pag">
            <button on:click={() => refPageChange(refPage - 1)} disabled={refPage <= 1}>‹</button>
            <span>Strana {refPage} z {Math.ceil(refTotal / 50)} ({fmt(refTotal)} celkom)</span>
            <button on:click={() => refPageChange(refPage + 1)} disabled={refPage >= Math.ceil(refTotal / 50)}>›</button>
        </div>
        {/if}
    </div>

    <!-- ════════════════ IMPORT / EXPORT TAB ════════════════ -->
    {:else if activeTab === 'import'}
    <div class="section">
        <h2>📤 Export XLSX</h2>
        <p class="desc">Stiahne Excel so 4 sheetmi: Google Taxonomy, Heureka SK, Aktuálne kategórie, Import šablóna. Vyplň stĺpec "PREKLAD SK" v Google sheete alebo pridaj riadky do Import sheetu.</p>
        <div class="export-flow">
            <div class="flow-step"><span class="flow-num">1</span><span>Stiahni Excel</span></div>
            <div class="flow-arrow">→</div>
            <div class="flow-step"><span class="flow-num">2</span><span>Preložíš / upravíš</span></div>
            <div class="flow-arrow">→</div>
            <div class="flow-step"><span class="flow-num">3</span><span>Importuješ naspäť</span></div>
            <div class="flow-arrow">→</div>
            <div class="flow-step"><span class="flow-num">4</span><span>Schváliš v Staging</span></div>
        </div>
        <button class="btn blue" on:click={doExport}>📥 Stiahnuť XLSX ({fmt(stats.reference_trees?.google + stats.reference_trees?.heureka)} kat.)</button>
    </div>

    <div class="section">
        <h2>📥 Import XLSX / CSV → Staging</h2>
        <p class="desc">Nahrajte upravený Excel alebo CSV súbor. Kategórie sa importujú do staging area — ešte sa NEPRIDAJÚ do live stromu!</p>
        <div class="import-area">
            <input type="file" accept=".xls,.xlsx,.csv,.txt" on:change={handleFile}>
            <button class="btn green" on:click={doImport} disabled={importing || !importFile}>
                {importing ? '⏳ Importujem...' : '📤 Importovať do Staging'}
            </button>
        </div>
        {#if importMsg}<div class="msg-box">{importMsg}</div>{/if}
        <div class="hint-box">
            <strong>Podporované formáty:</strong>
            <span>Excel XML (.xls) — exportnutý z tohto nástroja</span>
            <span>CSV / TXT — jeden riadok = jedna kategória (napr. <code>Elektronika > Notebooky > Gaming</code>)</span>
            <span>Separátory: <code>&gt;</code> alebo <code>|</code> alebo <code>/</code></span>
        </div>
    </div>

    <!-- ════════════════ STAGING TAB ════════════════ -->
    {:else if activeTab === 'staging'}
    <div class="section">
        <div class="staging-head">
            <div>
                <h2>✅ Staging — čaká na schválenie</h2>
                <p class="desc">Tu vidíš kategórie z importu. Schváľ → vytvoria sa live. Zamietni → zmažú sa.</p>
            </div>
            <div class="staging-actions">
                <button class="btn green" on:click={approveAll} disabled={approving || stats.staging?.pending === 0}>
                    {approving ? '⏳...' : `✅ Schváliť všetky (${fmt(stats.staging?.pending)})`}
                </button>
                <button class="btn red" on:click={rejectAll} disabled={rejecting || stats.staging?.pending === 0}>
                    {rejecting ? '⏳...' : '❌ Zamietnuť všetky'}
                </button>
                {#if selectedIds.size > 0}
                    <button class="btn blue" on:click={() => approveSelected([...selectedIds])}>✅ Schváliť vybrané ({selectedIds.size})</button>
                {/if}
            </div>
        </div>
        {#if stagingMsg}<div class="msg-box">{stagingMsg}</div>{/if}

        <div class="filter-row">
            <div class="filter-tabs">
                <button class:active={stagingFilter==='pending'} on:click={() => {stagingFilter='pending'; stagingPage=1; loadStaging();}}>⏳ Pending</button>
                <button class:active={stagingFilter==='approved'} on:click={() => {stagingFilter='approved'; stagingPage=1; loadStaging();}}>✅ Schválené</button>
                <button class:active={stagingFilter==='rejected'} on:click={() => {stagingFilter='rejected'; stagingPage=1; loadStaging();}}>❌ Zamietnuté</button>
                <button class:active={stagingFilter==='all'} on:click={() => {stagingFilter='all'; stagingPage=1; loadStaging();}}>Všetky</button>
            </div>
            <div class="search-box">
                <input type="text" bind:value={stagingSearch} placeholder="Hľadať..." on:keydown={(e) => e.key === 'Enter' && stagingSearchDo()}>
                <button class="btn-sm blue" on:click={stagingSearchDo}>🔍</button>
            </div>
        </div>

        {#if stagingLoading}<div class="loading">Načítavam...</div>
        {:else if stagingItems.length === 0}<div class="empty-msg">Žiadne záznamy v staging</div>
        {:else}
        <div class="tbl-wrap">
            <table class="tbl"><thead><tr>
                <th><input type="checkbox" on:change={selectAll} checked={selectedIds.size === stagingItems.length && stagingItems.length > 0}></th>
                <th>Cesta</th><th>Názov</th><th>Hĺbka</th><th>Akcia</th><th>Status</th><th>Poznámka</th>
            </tr></thead><tbody>
                {#each stagingItems as item}
                <tr class:row-create={item.action === 'create' || item.Action === 'create'} class:row-exists={item.action === 'exists' || item.Action === 'exists'}>
                    <td><input type="checkbox" checked={selectedIds.has(item.ID || item.id)} on:change={() => toggleSelect(item.ID || item.id)}></td>
                    <td class="td-path">{#each ((item.path || item.Path || '').split(' > ')) as part, i}{#if i > 0}<span class="sep"> › </span>{/if}<span class:leaf={i === (item.path || item.Path || '').split(' > ').length - 1}>{part}</span>{/each}</td>
                    <td><strong>{item.name_sk || item.NameSK || ''}</strong></td>
                    <td class="td-depth">{item.depth || item.Depth}</td>
                    <td>{#if (item.action || item.Action) === 'create'}<span class="badge new">NOVÁ</span>{:else}<span class="badge exists">EXISTUJE</span>{/if}</td>
                    <td>{#if (item.status || item.Status) === 'pending'}<span class="badge pending">⏳</span>{:else if (item.status || item.Status) === 'approved'}<span class="badge approved">✅</span>{:else}<span class="badge rejected">❌</span>{/if}</td>
                    <td class="td-note">{item.notes || item.Notes || ''}</td>
                </tr>
                {/each}
            </tbody></table>
        </div>
        <div class="pag">
            <button on:click={() => { stagingPage--; loadStaging(); }} disabled={stagingPage <= 1}>‹</button>
            <span>Strana {stagingPage} z {Math.ceil(stagingTotal / 50)} ({fmt(stagingTotal)})</span>
            <button on:click={() => { stagingPage++; loadStaging(); }} disabled={stagingPage >= Math.ceil(stagingTotal / 50)}>›</button>
        </div>
        {/if}

        <div class="cleanup-section">
            <h3>🗑️ Vyčistiť staging</h3>
            <div class="cleanup-btns">
                <button class="btn-sm outline" on:click={() => clearStaging('rejected')}>Vymazať zamietnuté</button>
                <button class="btn-sm outline" on:click={() => clearStaging('approved')}>Vymazať schválené</button>
                <button class="btn-sm red" on:click={() => clearStaging('all')}>Vymazať všetko</button>
            </div>
        </div>
    </div>
    {/if}
    {/if}
</div>

<style>
.page{padding:24px;max-width:1200px}
.page-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:24px;flex-wrap:wrap}
h1{font-size:24px;margin:0;color:#1e293b} h2{font-size:18px;margin:0 0 8px;color:#1e293b} h3{font-size:15px;margin:16px 0 8px;color:#374151}
.loading{text-align:center;padding:40px;color:#64748b} .desc{color:#64748b;font-size:14px;margin:0 0 16px}
.section{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:20px}

/* Tabs */
.tab-bar{display:flex;gap:4px;background:#f1f5f9;padding:4px;border-radius:10px}
.tab{padding:8px 18px;border:none;background:none;border-radius:8px;font-size:13px;font-weight:600;color:#64748b;cursor:pointer}
.tab.active{background:#fff;color:#1e293b;box-shadow:0 1px 3px rgba(0,0,0,.1)}

/* Stats */
.stats-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin:16px 0}
.stat-group{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px}
.stat-group-title{font-size:13px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px}
.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:8px}
.stat{padding:12px 10px;background:#fff;border-radius:8px;text-align:center;border:2px solid #e2e8f0}
.stat .n{display:block;font-size:20px;font-weight:700;color:#1e293b} .stat .l{font-size:10px;color:#64748b;text-transform:uppercase}
.stat.ok{border-color:#10b981;background:#ecfdf5} .stat.warn{border-color:#f59e0b;background:#fffbeb}

/* Fetch */
.fetch-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0}
.fetch-card{display:flex;align-items:center;gap:14px;padding:18px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px}
.fetch-icon{font-size:28px}
.fetch-info{flex:1;display:flex;flex-direction:column} .fetch-info strong{font-size:14px;color:#1e293b} .fetch-info span{font-size:12px;color:#64748b}

/* Export flow */
.export-flow{display:flex;gap:8px;align-items:center;margin:16px 0;flex-wrap:wrap}
.flow-step{display:flex;align-items:center;gap:6px;background:#eff6ff;color:#1d4ed8;padding:8px 14px;border-radius:8px;font-size:13px;font-weight:600}
.flow-num{width:22px;height:22px;background:#3b82f6;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px}
.flow-arrow{color:#94a3b8;font-size:18px}

/* Import */
.import-area{display:flex;gap:12px;align-items:center;margin:16px 0;flex-wrap:wrap}
.import-area input[type="file"]{font-size:14px}
.hint-box{margin-top:16px;padding:14px;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;font-size:13px;display:flex;flex-direction:column;gap:4px}
.hint-box code{background:#e2e8f0;padding:1px 5px;border-radius:3px;font-size:12px}

/* Buttons */
.btn{padding:10px 20px;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:.15s}
.btn.blue{background:#3b82f6;color:#fff} .btn.green{background:#10b981;color:#fff} .btn.red{background:#ef4444;color:#fff}
.btn.outline{background:#fff;color:#475569;border:1px solid #d1d5db} .btn:disabled{opacity:.5;cursor:not-allowed}
.btn-sm{padding:5px 12px;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer}
.btn-sm.blue{background:#3b82f6;color:#fff} .btn-sm.red{background:#ef4444;color:#fff}
.btn-sm.outline{background:#fff;color:#64748b;border:1px solid #d1d5db}

/* Msg */
.msg-box{margin:12px 0;padding:12px 16px;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;font-size:14px;font-weight:500;color:#166534;white-space:pre-line}

/* Filter */
.filter-row{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:16px}
.filter-tabs{display:flex;gap:2px;background:#f1f5f9;padding:3px;border-radius:8px}
.filter-tabs button{padding:6px 14px;border:none;background:none;border-radius:6px;font-size:12px;font-weight:600;color:#64748b;cursor:pointer}
.filter-tabs button.active{background:#fff;color:#1e293b;box-shadow:0 1px 2px rgba(0,0,0,.08)}
.search-box{display:flex;gap:4px} .search-box input{padding:6px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;width:200px}

/* Table */
.tbl-wrap{overflow-x:auto;border:1px solid #e2e8f0;border-radius:10px}
.tbl{width:100%;border-collapse:collapse;font-size:12px}
.tbl thead{background:#f8fafc} .tbl th{padding:10px 8px;text-align:left;font-weight:600;color:#374151;border-bottom:2px solid #e2e8f0;white-space:nowrap;font-size:11px;text-transform:uppercase}
.tbl td{padding:8px;border-bottom:1px solid #f1f5f9;vertical-align:middle} .tbl tr:hover{background:#fafbfc}
.td-id{color:#9ca3af;font-size:11px;font-family:monospace} .td-depth{text-align:center;color:#6b7280}
.td-path{font-size:11px} .sep{color:#d1d5db} .leaf{font-weight:600;color:#1e293b}
.td-sk{color:#059669;font-style:italic} .td-note{font-size:11px;color:#6b7280;max-width:160px;overflow:hidden;text-overflow:ellipsis}

/* Badges */
.badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase}
.badge.new{background:#fef3c7;color:#92400e} .badge.exists{background:#e0f2fe;color:#0369a1}
.badge.pending{background:#fef3c7;color:#92400e} .badge.approved{background:#d1fae5;color:#065f46} .badge.rejected{background:#fee2e2;color:#991b1b}
tr.row-create{background:#fffbeb} tr.row-exists{background:#f0f9ff}

/* Staging */
.staging-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap}
.staging-actions{display:flex;gap:8px;flex-wrap:wrap}
.cleanup-section{margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0}
.cleanup-btns{display:flex;gap:8px;flex-wrap:wrap}

/* Pagination */
.pag{display:flex;align-items:center;justify-content:center;gap:12px;margin-top:16px;font-size:13px;color:#64748b}
.pag button{width:34px;height:34px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;cursor:pointer;font-size:16px;font-weight:600}
.pag button:hover:not(:disabled){border-color:#3b82f6;color:#3b82f6} .pag button:disabled{opacity:.3;cursor:not-allowed}
.empty-msg{padding:40px;text-align:center;color:#64748b;background:#f8fafc;border-radius:8px}

@media(max-width:768px){
    .page-head{flex-direction:column} .stats-row{grid-template-columns:1fr}
    .fetch-row{grid-template-columns:1fr} .staging-head{flex-direction:column}
    .export-flow{flex-direction:column}
}
</style>
