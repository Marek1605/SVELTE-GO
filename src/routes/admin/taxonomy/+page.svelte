<script>
    import { onMount } from 'svelte';
    import { adminFetch, adminRawFetch, API_BASE } from '$lib/adminApi.js';

    let activeTab = 'overview';
    let loading = true;

    // Stats
    let stats = { reference_trees: { google: 0, heureka: 0 }, staging: { pending: 0, approved: 0, rejected: 0 }, live: { total: 0, with_products: 0, empty: 0 } };

    // Fetch progress
    let fetchingGoogle = false, fetchingHeureka = false, fetchMsg = '';

    // TREE VIEW
    let refSource = 'google', refSearch = '';
    let treeData = {}, treeLoading = false, treeLoaded = {};
    let expanded = {};

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
        fetchingGoogle = false; await loadStats(); treeLoaded = {};
    }
    async function fetchHeureka() {
        fetchingHeureka = true; fetchMsg = '';
        const r = await adminFetch('/admin/ai/taxonomy/fetch-heureka', { method: 'POST' });
        fetchMsg = r?.success ? '✅ ' + r.message : '❌ ' + (r?.error || 'Chyba');
        fetchingHeureka = false; await loadStats(); treeLoaded = {};
    }

    // ─── TREE: load all items, build tree ───
    async function loadTree(source) {
        if (treeLoaded[source]) return;
        treeLoading = true;
        let allItems = [];
        let page = 1;
        let hasMore = true;
        while (hasMore) {
            const r = await adminFetch(`/admin/ai/taxonomy/list?source=${source}&page=${page}&limit=500`);
            if (r?.success && r.items?.length > 0) {
                allItems = allItems.concat(r.items);
                hasMore = allItems.length < (r.total || 0);
                page++;
            } else { hasMore = false; }
        }
        treeData[source] = buildTree(allItems);
        treeLoaded[source] = true;
        treeData = treeData;
        treeLoading = false;
    }

    function buildTree(items) {
        const root = { children: {} };
        for (const item of items) {
            const path = (item.path || item.Path || '').split(' > ');
            let node = root;
            for (let i = 0; i < path.length; i++) {
                const part = path[i].trim();
                if (!part) continue;
                if (!node.children[part]) {
                    node.children[part] = { name: part, children: {}, depth: i + 1, source_id: '', name_sk: '' };
                }
                node = node.children[part];
            }
            node.source_id = item.source_id || item.SourceID || '';
            node.name_sk = item.name_sk || item.NameSK || '';
        }
        return root;
    }

    function getSorted(node) {
        if (!node?.children) return [];
        return Object.values(node.children).sort((a, b) => a.name.localeCompare(b.name, 'sk'));
    }
    function childCount(node) { return node?.children ? Object.keys(node.children).length : 0; }
    function hasKids(node) { return childCount(node) > 0; }
    function allDescendants(node) {
        let c = childCount(node);
        for (const ch of Object.values(node.children || {})) c += allDescendants(ch);
        return c;
    }
    function toggle(path) { expanded[path] = !expanded[path]; expanded = expanded; }
    function expandAll() {
        const tree = treeData[refSource];
        if (!tree) return;
        function walk(node, prefix) {
            for (const [name, child] of Object.entries(node.children || {})) {
                const p = prefix ? prefix + ' > ' + name : name;
                if (hasKids(child)) { expanded[p] = true; walk(child, p); }
            }
        }
        walk(tree, ''); expanded = expanded;
    }
    function collapseAll() { expanded = {}; }

    // ─── SEARCH within tree ───
    let searchResults = [];
    function treeSearch() {
        if (!refSearch.trim()) { searchResults = []; return; }
        const tree = treeData[refSource];
        if (!tree) return;
        searchResults = [];
        const q = refSearch.toLowerCase();
        function walk(node, path) {
            for (const [name, child] of Object.entries(node.children || {})) {
                const p = path ? path + ' > ' + name : name;
                if (name.toLowerCase().includes(q) || (child.name_sk || '').toLowerCase().includes(q)) {
                    searchResults.push({ path: p, name: child.name, name_sk: child.name_sk, depth: child.depth, kids: allDescendants(child) });
                }
                walk(child, p);
            }
        }
        walk(tree, '');
        searchResults = searchResults.slice(0, 200);
    }
    function clearSearch() { refSearch = ''; searchResults = []; }

    function switchSource(s) { refSource = s; refSearch = ''; searchResults = []; expanded = {}; loadTree(s); }

    // ─── XLSX EXPORT / IMPORT ───
    async function doExport() {
        const r = await adminRawFetch(`${API_BASE}/admin/ai/taxonomy/export-xlsx`);
        if (r.ok) {
            const blob = await r.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'megaprice-taxonomy.xls'; a.click();
            URL.revokeObjectURL(url);
        } else { alert('Chyba pri exporte'); }
    }
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

    let setupDone = false;
    async function runSetup() { const r = await adminFetch('/admin/ai/taxonomy/setup', { method: 'POST' }); if (r?.success) setupDone = true; }
    function switchTab(t) {
        activeTab = t;
        if (t === 'browser') loadTree(refSource);
        if (t === 'staging' && stagingItems.length === 0) loadStaging();
    }
    let pushing = false, pushMsg = "";
    async function pushToStaging() {
        if (!confirm(`Poslať celý ${refSource} strom do staging?`)) return;
        pushing = true; pushMsg = "";
        const r = await adminFetch("/admin/ai/taxonomy/push-to-staging", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ source: refSource }) });
        pushMsg = r?.success ? "✅ " + r.message : "❌ " + (r?.error || "Chyba");
        pushing = false;
    }
</script>

<svelte:head><title>Taxonomy Management | Admin</title></svelte:head>

<div class="page">
    <div class="page-head">
        <h1>📂 Taxonomy Management</h1>
        <div class="tab-bar">
            <button class="tab" class:active={activeTab==='overview'} on:click={() => switchTab('overview')}>📊 Prehľad</button>
            <button class="tab" class:active={activeTab==='browser'} on:click={() => switchTab('browser')}>🌳 Stromy</button>
            <button class="tab" class:active={activeTab==='import'} on:click={() => switchTab('import')}>📥 Import / Export</button>
            <button class="tab" class:active={activeTab==='staging'} on:click={() => switchTab('staging')}>✅ Staging</button>
        </div>
    </div>

    {#if loading}<div class="loading">Načítavam...</div>{:else}

    <!-- ═══════ OVERVIEW ═══════ -->
    {#if activeTab === 'overview'}
    <div class="section">
        <h2>📊 Celkový prehľad</h2>
        <div class="stats-row">
            <div class="sg"><div class="sg-t">🌳 Referenčné stromy</div><div class="sg-g"><div class="stat"><span class="n">{fmt(stats.reference_trees?.google)}</span><span class="l">Google (EN)</span></div><div class="stat"><span class="n">{fmt(stats.reference_trees?.heureka)}</span><span class="l">Heureka (SK)</span></div></div></div>
            <div class="sg"><div class="sg-t">⏳ Staging</div><div class="sg-g"><div class="stat warn"><span class="n">{fmt(stats.staging?.pending)}</span><span class="l">Čaká</span></div><div class="stat ok"><span class="n">{fmt(stats.staging?.approved)}</span><span class="l">Schválené</span></div><div class="stat"><span class="n">{fmt(stats.staging?.rejected)}</span><span class="l">Zamietnuté</span></div></div></div>
            <div class="sg"><div class="sg-t">🏪 Live</div><div class="sg-g"><div class="stat ok"><span class="n">{fmt(stats.live?.total)}</span><span class="l">Celkom</span></div><div class="stat"><span class="n">{fmt(stats.live?.with_products)}</span><span class="l">S produktmi</span></div><div class="stat warn"><span class="n">{fmt(stats.live?.empty)}</span><span class="l">Prázdne</span></div></div></div>
        </div>
    </div>
    <div class="section">
        <h2>🔄 Stiahnuť referenčné stromy</h2>
        <p class="desc">Stiahne kategórie z Google a Heureka.sk ako referenciu.</p>
        <div class="fetch-row">
            <div class="fc"><span class="fc-i">🔵</span><div class="fc-t"><strong>Google Product Taxonomy</strong><small>~5,595 kategórií (EN)</small></div><button class="btn blue" on:click={fetchGoogle} disabled={fetchingGoogle}>{fetchingGoogle ? '⏳...' : '📥 Stiahnuť'}</button></div>
            <div class="fc"><span class="fc-i">🟢</span><div class="fc-t"><strong>Heureka.sk Taxonomy</strong><small>~3,500+ kategórií (SK)</small></div><button class="btn green" on:click={fetchHeureka} disabled={fetchingHeureka}>{fetchingHeureka ? '⏳...' : '📥 Stiahnuť'}</button></div>
        </div>
        {#if fetchMsg}<div class="msg-box">{fetchMsg}</div>{/if}
    </div>
    <div class="section">
        <h2>🛠️ Setup</h2>
        <button class="btn outline" on:click={runSetup} disabled={setupDone}>{setupDone ? '✅ Hotovo' : '⚙️ Setup tabuľky'}</button>
    </div>

    <!-- ═══════ TREE BROWSER ═══════ -->
    {:else if activeTab === 'browser'}
    <div class="section">
        <div class="tree-head">
            <h2>🌳 {refSource === 'google' ? 'Google Taxonomy (EN)' : 'Heureka.sk (SK)'}</h2>
            <div class="tree-toolbar">
                <div class="filter-tabs">
                    <button class:active={refSource==='google'} on:click={() => switchSource('google')}>🔵 Google ({fmt(stats.reference_trees?.google)})</button>
                    <button class:active={refSource==='heureka'} on:click={() => switchSource('heureka')}>🟢 Heureka ({fmt(stats.reference_trees?.heureka)})</button>
                </div>
                <div class="tree-btns">
                    {#if pushMsg}<span class="msg-box" style="font-size:12px;padding:4px 10px">{pushMsg}</span>{/if}
					<button class="btn-sm green" on:click={pushToStaging} disabled={pushing}>{pushing ? "⏳..." : "📤 Do staging"}</button>
					<button class="btn-sm outline" on:click={expandAll} title="Rozbaliť">📂 Rozbaliť</button>
                    <button class="btn-sm outline" on:click={collapseAll} title="Zbaliť">📁 Zbaliť</button>
                </div>
                <div class="search-box">
                    <input type="text" bind:value={refSearch} placeholder="Hľadať..." on:keydown={(e) => e.key==='Enter' && treeSearch()}>
                    <button class="btn-sm blue" on:click={treeSearch}>🔍</button>
                    {#if refSearch}<button class="btn-sm outline" on:click={clearSearch}>✕</button>{/if}
                </div>
            </div>
        </div>

        {#if treeLoading}
            <div class="loading">⏳ Načítavam strom ({refSource})... môže trvať pár sekúnd</div>
        {:else if searchResults.length > 0}
            <div class="sr-box">
                <div class="sr-count">🔍 Nájdené: {searchResults.length}{searchResults.length >= 200 ? '+' : ''}</div>
                {#each searchResults as r}
                    <div class="sr-item">
                        <span class="sr-path">{#each r.path.split(' > ') as part, i}{#if i > 0}<span class="sep"> › </span>{/if}<span class:leaf={i === r.path.split(' > ').length - 1}>{part}</span>{/each}</span>
                        {#if r.name_sk}<span class="sr-sk">🇸🇰 {r.name_sk}</span>{/if}
                        {#if r.kids > 0}<span class="sr-kids">{r.kids}</span>{/if}
                    </div>
                {/each}
            </div>
        {:else if treeData[refSource]}
            <div class="tree">
                {#each getSorted(treeData[refSource]) as n0}
                    {@const p0 = n0.name}
                    <div class="tn">
                        <button class="tr d0" on:click={() => toggle(p0)}>
                            <span class="tw">{#if hasKids(n0)}<span class="ta" class:open={expanded[p0]}>▶</span>{:else}<span class="td">─</span>{/if}</span>
                            <span class="tl">{n0.name}</span>
                            {#if hasKids(n0)}<span class="tc">{childCount(n0)}</span>{/if}
                            {#if n0.name_sk && refSource==='google'}<span class="ts">{n0.name_sk}</span>{/if}
                        </button>
                        {#if expanded[p0]}
                            {#each getSorted(n0) as n1}
                                {@const p1 = p0+' > '+n1.name}
                                <div class="tn">
                                    <button class="tr d1" on:click={() => toggle(p1)}>
                                        <span class="tw">{#if hasKids(n1)}<span class="ta" class:open={expanded[p1]}>▶</span>{:else}<span class="td">─</span>{/if}</span>
                                        <span class="tl">{n1.name}</span>
                                        {#if hasKids(n1)}<span class="tc">{childCount(n1)}</span>{/if}
                                        {#if n1.name_sk && refSource==='google'}<span class="ts">{n1.name_sk}</span>{/if}
                                    </button>
                                    {#if expanded[p1]}
                                        {#each getSorted(n1) as n2}
                                            {@const p2 = p1+' > '+n2.name}
                                            <div class="tn">
                                                <button class="tr d2" on:click={() => toggle(p2)}>
                                                    <span class="tw">{#if hasKids(n2)}<span class="ta" class:open={expanded[p2]}>▶</span>{:else}<span class="td">─</span>{/if}</span>
                                                    <span class="tl">{n2.name}</span>
                                                    {#if hasKids(n2)}<span class="tc">{childCount(n2)}</span>{/if}
											{#if n2.name_sk && refSource==="google"}<span class="ts">{n2.name_sk}</span>{/if}
                                                </button>
                                                {#if expanded[p2]}
                                                    {#each getSorted(n2) as n3}
                                                        {@const p3 = p2+' > '+n3.name}
                                                        <div class="tn">
                                                            <button class="tr d3" on:click={() => toggle(p3)}>
                                                                <span class="tw">{#if hasKids(n3)}<span class="ta" class:open={expanded[p3]}>▶</span>{:else}<span class="td">─</span>{/if}</span>
                                                                <span class="tl">{n3.name}</span>
                                                                {#if hasKids(n3)}<span class="tc">{childCount(n3)}</span>{/if}
														{#if n3.name_sk && refSource==="google"}<span class="ts">{n3.name_sk}</span>{/if}
                                                            </button>
                                                            {#if expanded[p3]}
                                                                {#each getSorted(n3) as n4}
                                                                    {@const p4 = p3+' > '+n4.name}
                                                                    <div class="tn">
                                                                        <button class="tr d4" on:click={() => toggle(p4)}>
                                                                            <span class="tw">{#if hasKids(n4)}<span class="ta" class:open={expanded[p4]}>▶</span>{:else}<span class="td">─</span>{/if}</span>
                                                                            <span class="tl">{n4.name}</span>
                                                                            {#if hasKids(n4)}<span class="tc">{childCount(n4)}</span>{/if}
																{#if n4.name_sk && refSource==="google"}<span class="ts">{n4.name_sk}</span>{/if}
                                                                        </button>
                                                                        {#if expanded[p4]}
                                                                            {#each getSorted(n4) as n5}
                                                                                <div class="tn"><div class="tr d5"><span class="tw"><span class="td">─</span></span><span class="tl">{n5.name}</span>{#if n5.name_sk && refSource==="google"}<span class="ts">{n5.name_sk}</span>{/if}</div></div>
                                                                            {/each}
                                                                        {/if}
                                                                    </div>
                                                                {/each}
                                                            {/if}
                                                        </div>
                                                    {/each}
                                                {/if}
                                            </div>
                                        {/each}
                                    {/if}
                                </div>
                            {/each}
                        {/if}
                    </div>
                {/each}
            </div>
        {:else}
            <div class="empty-msg">Žiadne dáta. Stiahnite strom v Prehľade.</div>
        {/if}
    </div>

    <!-- ═══════ IMPORT / EXPORT ═══════ -->
    {:else if activeTab === 'import'}
    <div class="section">
        <h2>📤 Export XLSX</h2>
        <p class="desc">Excel so 4 sheetmi: Google, Heureka SK, Aktuálne kategórie, Import šablóna.</p>
        <div class="flow"><div class="fs"><span class="fn">1</span>Stiahni</div><span class="fa">→</span><div class="fs"><span class="fn">2</span>Preložíš</div><span class="fa">→</span><div class="fs"><span class="fn">3</span>Import</div><span class="fa">→</span><div class="fs"><span class="fn">4</span>Schváliš</div></div>
        <button class="btn blue" on:click={doExport}>📥 Stiahnuť XLSX</button>
    </div>
    <div class="section">
        <h2>📥 Import → Staging</h2>
        <p class="desc">Kategórie sa importujú do staging — ešte NIE do live stromu!</p>
        <div class="imp"><input type="file" accept=".xls,.xlsx,.csv,.txt" on:change={handleFile}><button class="btn green" on:click={doImport} disabled={importing||!importFile}>{importing ? '⏳...' : '📤 Import'}</button></div>
        {#if importMsg}<div class="msg-box">{importMsg}</div>{/if}
    </div>

    <!-- ═══════ STAGING ═══════ -->
    {:else if activeTab === 'staging'}
    <div class="section">
        <div class="stg-head">
            <div><h2>✅ Staging</h2><p class="desc">Schváľ → live. Zamietni → zmaže sa.</p></div>
            <div class="stg-act">
                <button class="btn green" on:click={approveAll} disabled={approving||stats.staging?.pending===0}>{approving ? '⏳' : `✅ Schváliť (${fmt(stats.staging?.pending)})`}</button>
                <button class="btn red" on:click={rejectAll} disabled={rejecting||stats.staging?.pending===0}>❌ Zamietnuť</button>
                {#if selectedIds.size > 0}<button class="btn blue" on:click={() => approveSelected([...selectedIds])}>✅ Vybrané ({selectedIds.size})</button>{/if}
            </div>
        </div>
        {#if stagingMsg}<div class="msg-box">{stagingMsg}</div>{/if}
        <div class="filter-row">
            <div class="filter-tabs">
                <button class:active={stagingFilter==='pending'} on:click={() => {stagingFilter='pending';stagingPage=1;loadStaging();}}>⏳ Pending</button>
                <button class:active={stagingFilter==='approved'} on:click={() => {stagingFilter='approved';stagingPage=1;loadStaging();}}>✅ Schválené</button>
                <button class:active={stagingFilter==='rejected'} on:click={() => {stagingFilter='rejected';stagingPage=1;loadStaging();}}>❌ Zamietnuté</button>
                <button class:active={stagingFilter==='all'} on:click={() => {stagingFilter='all';stagingPage=1;loadStaging();}}>Všetky</button>
            </div>
            <div class="search-box"><input type="text" bind:value={stagingSearch} placeholder="Hľadať..." on:keydown={(e) => e.key==='Enter' && stagingSearchDo()}><button class="btn-sm blue" on:click={stagingSearchDo}>🔍</button></div>
        </div>
        {#if stagingLoading}<div class="loading">Načítavam...</div>
        {:else if stagingItems.length === 0}<div class="empty-msg">Žiadne záznamy</div>
        {:else}
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th><input type="checkbox" on:change={selectAll}></th><th>Cesta</th><th>Názov</th><th>Hĺbka</th><th>Akcia</th><th>Status</th><th>Pozn.</th></tr></thead><tbody>
            {#each stagingItems as item}
            <tr class:rc={(item.action||item.Action)==='create'} class:re={(item.action||item.Action)==='exists'}>
                <td><input type="checkbox" checked={selectedIds.has(item.ID||item.id)} on:change={() => toggleSelect(item.ID||item.id)}></td>
                <td class="tp">{#each ((item.path||item.Path||'').split(' > ')) as part, i}{#if i > 0}<span class="sep"> › </span>{/if}<span class:leaf={i===(item.path||item.Path||'').split(' > ').length-1}>{part}</span>{/each}</td>
                <td><strong>{item.name_sk||item.NameSK||''}</strong></td>
                <td style="text-align:center">{item.depth||item.Depth}</td>
                <td>{#if (item.action||item.Action)==='create'}<span class="badge new">NOVÁ</span>{:else}<span class="badge exists">EXISTUJE</span>{/if}</td>
                <td>{#if (item.status||item.Status)==='pending'}<span class="badge pending">⏳</span>{:else if (item.status||item.Status)==='approved'}<span class="badge approved">✅</span>{:else}<span class="badge rejected">❌</span>{/if}</td>
                <td class="tn2">{item.notes||item.Notes||''}</td>
            </tr>
            {/each}
        </tbody></table></div>
        <div class="pag"><button on:click={() => {stagingPage--;loadStaging();}} disabled={stagingPage<=1}>‹</button><span>{stagingPage} / {Math.ceil(stagingTotal/50)} ({fmt(stagingTotal)})</span><button on:click={() => {stagingPage++;loadStaging();}} disabled={stagingPage>=Math.ceil(stagingTotal/50)}>›</button></div>
        {/if}
        <div class="cls"><h3>🗑️ Vyčistiť</h3><div class="cls-b"><button class="btn-sm outline" on:click={() => clearStaging('rejected')}>Zamietnuté</button><button class="btn-sm outline" on:click={() => clearStaging('approved')}>Schválené</button><button class="btn-sm red" on:click={() => clearStaging('all')}>Všetko</button></div></div>
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
.tab-bar{display:flex;gap:4px;background:#f1f5f9;padding:4px;border-radius:10px}
.tab{padding:8px 18px;border:none;background:none;border-radius:8px;font-size:13px;font-weight:600;color:#64748b;cursor:pointer}
.tab.active{background:#fff;color:#1e293b;box-shadow:0 1px 3px rgba(0,0,0,.1)}

/* Stats */
.stats-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin:16px 0}
.sg{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px}
.sg-t{font-size:12px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px}
.sg-g{display:grid;grid-template-columns:repeat(auto-fit,minmax(80px,1fr));gap:8px}
.stat{padding:10px 8px;background:#fff;border-radius:8px;text-align:center;border:2px solid #e2e8f0}
.stat .n{display:block;font-size:20px;font-weight:700;color:#1e293b} .stat .l{font-size:10px;color:#64748b;text-transform:uppercase}
.stat.ok{border-color:#10b981;background:#ecfdf5} .stat.warn{border-color:#f59e0b;background:#fffbeb}

/* Fetch */
.fetch-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:14px 0}
.fc{display:flex;align-items:center;gap:12px;padding:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px}
.fc-i{font-size:26px} .fc-t{flex:1} .fc-t strong{display:block;font-size:14px;color:#1e293b} .fc-t small{font-size:12px;color:#64748b}

/* ═══ TREE ═══ */
.tree-head{margin-bottom:16px}
.tree-toolbar{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:12px}
.tree-btns{display:flex;gap:6px}
.tree{border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;max-height:70vh;overflow-y:auto}
.tn{} 
.tr{display:flex;align-items:center;gap:4px;width:100%;padding:6px 10px;border:none;background:none;cursor:pointer;font-size:14px;text-align:left;border-bottom:1px solid #f1f5f9;transition:background .08s}
.tr:hover{background:#f0f9ff}
.tw{width:18px;flex-shrink:0;text-align:center}
.ta{font-size:10px;color:#94a3b8;display:inline-block;transition:transform .15s} .ta.open{transform:rotate(90deg)}
.td{color:#d1d5db;font-size:10px}
.tl{font-weight:500;color:#1e293b;flex:1}
.tc{font-size:10px;color:#fff;background:#94a3b8;border-radius:10px;padding:0 5px;min-width:16px;text-align:center;font-weight:700;line-height:16px}
.ts{font-size:11px;color:#059669;margin-left:auto;font-style:italic}

/* depth indentation */
.d0{padding-left:10px;font-size:15px;background:#f8fafc;font-weight:600} .d0 .tl{color:#0f172a} .d0 .tc{background:#3b82f6}
.d1{padding-left:30px} .d1 .tc{background:#64748b}
.d2{padding-left:50px;font-size:13px} .d2 .tl{font-weight:400}
.d3{padding-left:70px;font-size:13px} .d3 .tl{font-weight:400;color:#475569}
.d4{padding-left:90px;font-size:12px} .d4 .tl{color:#64748b}
.d5{padding-left:110px;font-size:12px;cursor:default} .d5 .tl{color:#94a3b8}

/* Search results */
.sr-box{border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;max-height:70vh;overflow-y:auto}
.sr-count{padding:10px 14px;background:#eff6ff;font-size:13px;font-weight:600;color:#1d4ed8;border-bottom:1px solid #e2e8f0}
.sr-item{display:flex;align-items:center;gap:8px;padding:7px 14px;border-bottom:1px solid #f1f5f9;font-size:13px}
.sr-item:hover{background:#f8fafc}
.sr-path{flex:1} .sep{color:#d1d5db} .leaf{font-weight:600;color:#1e293b}
.sr-sk{color:#059669;font-size:12px;font-style:italic}
.sr-kids{font-size:10px;color:#94a3b8;background:#f1f5f9;padding:1px 5px;border-radius:4px}

/* Export / Import */
.flow{display:flex;gap:8px;align-items:center;margin:14px 0;flex-wrap:wrap}
.fs{display:flex;align-items:center;gap:6px;background:#eff6ff;color:#1d4ed8;padding:8px 14px;border-radius:8px;font-size:13px;font-weight:600}
.fn{width:22px;height:22px;background:#3b82f6;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px}
.fa{color:#94a3b8;font-size:18px}
.imp{display:flex;gap:12px;align-items:center;margin:14px 0;flex-wrap:wrap}

/* Buttons */
.btn{padding:10px 20px;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:.15s}
.btn.blue{background:#3b82f6;color:#fff} .btn.green{background:#10b981;color:#fff} .btn.red{background:#ef4444;color:#fff}
.btn.outline{background:#fff;color:#475569;border:1px solid #d1d5db} .btn:disabled{opacity:.5;cursor:not-allowed}
.btn-sm{padding:5px 12px;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer}
.btn-sm.blue{background:#3b82f6;color:#fff} .btn-sm.red{background:#ef4444;color:#fff} .btn-sm.outline{background:#fff;color:#64748b;border:1px solid #d1d5db}
.msg-box{margin:12px 0;padding:12px 16px;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;font-size:14px;font-weight:500;color:#166534}

/* Filter / Search */
.filter-row{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:16px}
.filter-tabs{display:flex;gap:2px;background:#f1f5f9;padding:3px;border-radius:8px}
.filter-tabs button{padding:6px 14px;border:none;background:none;border-radius:6px;font-size:12px;font-weight:600;color:#64748b;cursor:pointer}
.filter-tabs button.active{background:#fff;color:#1e293b;box-shadow:0 1px 2px rgba(0,0,0,.08)}
.search-box{display:flex;gap:4px} .search-box input{padding:6px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;width:200px}

/* Table */
.tbl-wrap{overflow-x:auto;border:1px solid #e2e8f0;border-radius:10px}
.tbl{width:100%;border-collapse:collapse;font-size:12px}
.tbl thead{background:#f8fafc} .tbl th{padding:10px 8px;text-align:left;font-weight:600;color:#374151;border-bottom:2px solid #e2e8f0;font-size:11px;text-transform:uppercase}
.tbl td{padding:8px;border-bottom:1px solid #f1f5f9;vertical-align:middle} .tbl tr:hover{background:#fafbfc}
.tp{font-size:11px} .tn2{font-size:11px;color:#6b7280;max-width:140px;overflow:hidden;text-overflow:ellipsis}
.badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase}
.badge.new{background:#fef3c7;color:#92400e} .badge.exists{background:#e0f2fe;color:#0369a1}
.badge.pending{background:#fef3c7;color:#92400e} .badge.approved{background:#d1fae5;color:#065f46} .badge.rejected{background:#fee2e2;color:#991b1b}
tr.rc{background:#fffbeb} tr.re{background:#f0f9ff}

.stg-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap}
.stg-act{display:flex;gap:8px;flex-wrap:wrap}
.cls{margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0}
.cls-b{display:flex;gap:8px;flex-wrap:wrap}
.pag{display:flex;align-items:center;justify-content:center;gap:12px;margin-top:16px;font-size:13px;color:#64748b}
.pag button{width:34px;height:34px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;cursor:pointer;font-size:16px;font-weight:600}
.pag button:hover:not(:disabled){border-color:#3b82f6;color:#3b82f6} .pag button:disabled{opacity:.3}
.empty-msg{padding:40px;text-align:center;color:#64748b;background:#f8fafc;border-radius:8px}
@media(max-width:768px){.page-head,.stg-head{flex-direction:column} .stats-row,.fetch-row{grid-template-columns:1fr} .tree-toolbar{flex-direction:column}}
</style>
