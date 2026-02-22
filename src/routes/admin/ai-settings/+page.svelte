<script>
    import { onMount, onDestroy } from 'svelte';
    import { adminFetch as apiFetch } from '$lib/adminApi.js';
    const API_BASE = 'http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io/api/v1';
    let settings = { ai_provider: 'openai', openai_api_key: '', anthropic_api_key: '', ai_model_openai: 'gpt-4o-mini', ai_model_anthropic: 'claude-sonnet-4-20250514' };
    let loading = true, saving = false, saveMsg = '';

    const openaiModels = [
        { value: 'gpt-4o', label: 'GPT-4o (najlepší)' },
        { value: 'gpt-4o-mini', label: 'GPT-4o Mini (lacnejší)' },
        { value: 'gpt-4.1', label: 'GPT-4.1' },
        { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
        { value: 'gpt-4.1-nano', label: 'GPT-4.1 Nano (najlacnejší)' },
        { value: 'o4-mini', label: 'o4-mini (reasoning)' },
    ];
    const anthropicModels = [
        { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4 (odporúčaný)' },
        { value: 'claude-haiku-4-20250414', label: 'Claude Haiku 4 (lacnejší)' },
        { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
        { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (najlacnejší)' },
    ];
    $: currentModels = settings.ai_provider === 'anthropic' ? anthropicModels : openaiModels;
    $: currentModelKey = settings.ai_provider === 'anthropic' ? 'ai_model_anthropic' : 'ai_model_openai';
    let shops = [], selectedShopId = '', reportShopId = '', cleanupShopId = '';
    let job = null, polling = null, starting = false, displayStats = null;
    let catMode = 'fast';
    let reportData = [], reportStats = {}, reportTotal = 0, reportPage = 1, reportTotalPages = 1, reportLoading = false, reportFilter = 'all';
    let cleanupLoading = false, cleanupMsg = '';
    let activeTab = 'settings';

    // AUDIT
    let auditLoading = false, auditIssues = [], auditStats = {}, auditFilter = 'all';
    let fixingId = '', fixMsg = '';

    onMount(async () => { await Promise.all([loadSettings(), loadShops(), loadProgress(), loadDisplayStats()]); loading = false; });
    onDestroy(() => { if (polling) clearInterval(polling); });

    // apiFetch imported from $lib/adminApi.js
    async function loadSettings() { const r = await apiFetch('/admin/ai/settings'); if (r?.success && r.data) settings = { ...settings, ...r.data }; }
    async function loadShops() { const r = await apiFetch('/admin/shops'); if (r?.success) shops = r.data || []; }
    async function saveSettings() { saving = true; saveMsg = ''; const r = await apiFetch('/admin/ai/settings', { method: 'POST', body: JSON.stringify(settings) }); saveMsg = r?.success ? '✅ Uložené' : '❌ ' + (r?.error || 'Chyba'); saving = false; setTimeout(() => saveMsg = '', 3000); }
    async function loadProgress() { const r = await apiFetch('/admin/ai/bulk-categorize/progress'); if (r?.success && r.data) { job = r.data; if (job.status === 'running' && !polling) polling = setInterval(loadProgress, 2000); if (job.status !== 'running' && polling) { clearInterval(polling); polling = null; } } }
    async function loadDisplayStats() { const r = await apiFetch('/admin/ai/display-mode-stats'); if (r?.success) displayStats = r.data; }
    async function startCategorization() { if (!selectedShopId) { alert('Vyberte obchod'); return; } const sn = shops.find(s => s.id === selectedShopId)?.shop_name || ''; const modeNames = {fast: '⚡ RÝCHLU', precise: '🎯 PRESNÚ', ultra: '🔬 VEĽMI PRESNÚ'}; if (!confirm(`Spustiť ${modeNames[catMode] || '⚡ RÝCHLU'} AI kategorizáciu pre "${sn}"?`)) return; starting = true; const r = await apiFetch('/admin/ai/bulk-categorize', { method: 'POST', body: JSON.stringify({ shop_id: selectedShopId, mode: catMode }) }); if (r?.success) { job = { status: 'running', total_offers: r.unmatched, processed: 0, percent: 0 }; polling = setInterval(loadProgress, 2000); } else alert(r?.error || 'Chyba'); starting = false; }
    async function cancelCategorization() { if (!confirm('Zastaviť?')) return; await apiFetch('/admin/ai/bulk-categorize/cancel', { method: 'POST' }); if (polling) { clearInterval(polling); polling = null; } await loadProgress(); }
    async function loadReport() { reportLoading = true; let u = `/admin/ai/categorization-report?page=${reportPage}&per_page=50&match_type=${reportFilter}`; if (reportShopId) u += `&shop_id=${reportShopId}`; const r = await apiFetch(u); if (r?.success) { reportData = r.data || []; reportStats = r.stats || {}; reportTotal = r.total || 0; reportTotalPages = r.total_pages || 1; } reportLoading = false; }
    function changeReportFilter(f) { reportFilter = f; reportPage = 1; loadReport(); }
    function changeReportPage(p) { if (p >= 1 && p <= reportTotalPages) { reportPage = p; loadReport(); } }
    function changeReportShop() { reportPage = 1; loadReport(); }
    function downloadCSV() { let u = `${API_BASE}/admin/ai/categorization-report/csv`; if (reportShopId) u += `?shop_id=${reportShopId}`; window.open(u, '_blank'); }
    function downloadXLSX() { let u = `${API_BASE}/admin/ai/categorization-report/csv?format=xlsx`; if (reportShopId) u += `&shop_id=${reportShopId}`; window.open(u, '_blank'); }
    function switchToReport() { activeTab = 'report'; if (reportData.length === 0) loadReport(); }
    async function runCleanup(delP, delC, delAllC = false) { if (!cleanupShopId) { alert('Vyberte obchod'); return; } const sn = shops.find(s => s.id === cleanupShopId)?.shop_name || ''; let m = `Vyčistiť pre "${sn}":\n`; if (delP) m += '- Zmazať AI produkty\n'; if (delAllC) m += '- Zmazať VŠETKY kategórie pre tohto vendora!\n'; else if (delC) m += '- Zmazať prázdne kategórie\n'; if (!confirm(m + '\nPokračovať?')) return; cleanupLoading = true; cleanupMsg = ''; const r = await apiFetch('/admin/ai/cleanup', { method: 'POST', body: JSON.stringify({ shop_id: cleanupShopId, delete_products: delP, delete_categories: delC, delete_all_categories: delAllC }) }); if (r?.success) { cleanupMsg = '✅ ' + r.message; if (r.logs?.length) cleanupMsg += '\n' + r.logs.join('\n'); await loadDisplayStats(); if (reportData.length > 0) loadReport(); } else { cleanupMsg = '❌ ' + (r?.error || 'Chyba'); } cleanupLoading = false; setTimeout(() => cleanupMsg = '', 15000); }
    function fmt(n) { return (n || 0).toLocaleString('sk-SK'); }
    function shortDate(s) { if (!s) return '—'; return s.length > 19 ? s.slice(0, 19).replace('T', ' ') : s; }

    // AUDIT functions
    async function runAudit() { auditLoading = true; auditIssues = []; const r = await apiFetch('/admin/ai/tree-audit'); if (r?.success) { auditIssues = r.issues || []; auditStats = r.stats || {}; } else { alert(r?.error || 'Chyba'); } auditLoading = false; }
    function switchToAudit() { activeTab = 'audit'; if (auditIssues.length === 0 && !auditLoading) runAudit(); }
    $: filteredAuditIssues = auditFilter === 'all' ? auditIssues : auditIssues.filter(i => i.type === auditFilter);
    async function applyFix(issue, action, newName = '') {
        fixingId = issue.id; fixMsg = '';
        const body = { category_id: issue.category_id, action };
        if (action === 'rename') { const suggested = issue.suggestion?.replace('Premenovať na: "', '').replace('"', '') || ''; body.new_name = newName || prompt('Nový názov:', suggested); if (!body.new_name) { fixingId = ''; return; } }
        if (action === 'delete' && !confirm(`Zmazať kategóriu "${issue.name}"?`)) { fixingId = ''; return; }
        const r = await apiFetch('/admin/ai/apply-fix', { method: 'POST', body: JSON.stringify(body) });
        if (r?.success) { fixMsg = '✅ ' + r.message; auditIssues = auditIssues.filter(i => i.id !== issue.id); } else { fixMsg = '❌ ' + (r?.error || 'Chyba'); }
        fixingId = ''; setTimeout(() => fixMsg = '', 5000);
    }
    function typeLabel(t) { switch(t) { case 'foreign': return '🌍 Cudzí jazyk'; case 'duplicate': return '🔁 Duplicita'; case 'empty_branch': return '📭 Prázdna'; case 'too_deep': return '📏 Príliš hlboká'; case 'illogical': return '⚠️ Nelogická'; default: return t; } }
    function sevColor(s) { switch(s) { case 'high': return '#ef4444'; case 'medium': return '#f59e0b'; default: return '#6b7280'; } }
</script>

<svelte:head><title>AI Kategorizácia | Admin</title></svelte:head>

<div class="page">
    <div class="page-head">
        <h1>🤖 AI Kategorizácia</h1>
        <div class="tab-bar">
            <button class="tab" class:active={activeTab === 'settings'} on:click={() => activeTab = 'settings'}>⚙️ Nastavenia</button>
            <button class="tab" class:active={activeTab === 'report'} on:click={switchToReport}>📊 Report</button>
            <button class="tab" class:active={activeTab === 'audit'} on:click={switchToAudit}>🔍 Audit stromu</button>
            <button class="tab" class:active={activeTab === 'cleanup'} on:click={() => activeTab = 'cleanup'}>🗑️ Vyčistenie</button>
        </div>
    </div>

    {#if loading}<div class="loading">Načítavam...</div>{:else}

    <!-- ============ SETTINGS TAB ============ -->
    {#if activeTab === 'settings'}
    {#if displayStats}
    <div class="section">
        <h2>📊 Prehľad</h2>
        <div class="stats-grid">
            <div class="stat"><span class="n">{fmt(displayStats.shops?.total)}</span><span class="l">Obchodov</span></div>
            <div class="stat ok"><span class="n">{fmt(displayStats.matching?.matched)}</span><span class="l">Spárovaných</span></div>
            <div class="stat warn"><span class="n">{fmt(displayStats.matching?.unmatched)}</span><span class="l">Nespárovaných</span></div>
            <div class="stat"><span class="n">{fmt(displayStats.offers?.total)}</span><span class="l">Ponúk</span></div>
        </div>
    </div>
    {/if}
    <div class="section">
        <h2>⚙️ AI Nastavenia</h2>
        <div class="form-grid">
            <div class="form-row"><label>AI Provider</label><select bind:value={settings.ai_provider}><option value="openai">OpenAI</option><option value="anthropic">Anthropic</option></select></div>
            <div class="form-row"><label>Model</label><select bind:value={settings[currentModelKey]}>{#each currentModels as m}<option value={m.value}>{m.label}</option>{/each}</select><span class="model-hint">Aktuálny: <code>{settings[currentModelKey]}</code></span></div>
            <div class="form-row"><label>OpenAI API kľúč</label><input type="password" bind:value={settings.openai_api_key} placeholder="sk-proj-..."></div>
            <div class="form-row"><label>Anthropic API kľúč</label><input type="password" bind:value={settings.anthropic_api_key} placeholder="sk-ant-..."></div>
        </div>
        <div class="actions"><button class="btn blue" on:click={saveSettings} disabled={saving}>{saving ? 'Ukladám...' : '💾 Uložiť'}</button>{#if saveMsg}<span class="msg">{saveMsg}</span>{/if}</div>
    </div>
    <div class="section">
        <h2>🧠 Hromadná AI kategorizácia</h2>
        <div class="flow"><div class="step">1️⃣ EAN</div><div class="arrow">→</div><div class="step">2️⃣ Fuzzy</div><div class="arrow">→</div><div class="step">3️⃣ Feed kat.</div><div class="arrow">→</div><div class="step">4️⃣ AI</div><div class="arrow">→</div><div class="step">5️⃣ Nový produkt</div></div>
        <div class="form-row"><label>Obchod</label><select bind:value={selectedShopId}><option value="">-- Vyberte --</option>{#each shops as shop}<option value={shop.id}>{shop.shop_name}</option>{/each}</select></div>
        <div class="form-row" style="margin-top:10px"><label>Režim kategorizácie</label>
            <div class="mode-selector">
                <button class="mode-btn" class:active={catMode==='fast'} on:click={() => catMode='fast'}>
                    <span class="mode-icon">⚡</span><strong>Rýchla</strong><span class="mode-desc">Feed match → hotovo (AI len keď nenájde)</span>
                </button>
                <button class="mode-btn" class:active={catMode==='precise'} on:click={() => catMode='precise'}>
                    <span class="mode-icon">🎯</span><strong>Presná</strong><span class="mode-desc">AI overí KAŽDÝ match (pomalšie, presnejšie)</span>
                </button>
                <button class="mode-btn" class:active={catMode==='ultra'} on:click={() => catMode='ultra'}>
                    <span class="mode-icon">🔬</span><strong>Veľmi presná</strong><span class="mode-desc">Názov + popis + atribúty + referencie (najpomalšie)</span>
                </button>
            </div>
        </div>
        {#if job}
        <div class="job-status" class:running={job.status==='running'} class:done={job.status==='completed'}>
            <span class="job-badge {job.status}">{job.status === 'running' ? '⏳ Prebieha' : job.status === 'completed' ? '✅ Hotovo' : '⛔ '+job.status}</span>
            {#if job.status === 'running'}<div class="progress-bar"><div class="progress-fill" style="width:{job.percent||0}%"></div></div><div class="progress-text">{fmt(job.processed)} / {fmt(job.total_offers)} ({job.percent||0}%)</div>{/if}
            <div class="job-stats"><span>📦 {fmt(job.processed)}</span><span>✅ {fmt(job.matched)}</span><span>🆕 {fmt(job.new_products)}</span><span>📁 {fmt(job.new_categories)}</span><span>❌ {fmt(job.errors)}</span></div>
        </div>
        {/if}
        <div class="actions">
            {#if job?.status === 'running'}<button class="btn red" on:click={cancelCategorization}>⛔ Zastaviť</button>
            {:else}<button class="btn green" on:click={startCategorization} disabled={starting || !selectedShopId}>{starting ? '⏳...' : '🚀 Spustiť'}</button>{/if}
            <button class="btn outline" on:click={loadProgress}>🔄 Obnoviť</button>
        </div>
    </div>

    <!-- ============ REPORT TAB ============ -->
    {:else if activeTab === 'report'}
    <div class="section">
        <div class="report-head"><div><h2>📊 Report kategorizácie</h2><p class="desc">Feed kategória vs. priradená kategória — všetky typy párovania</p></div><div class="export-btns"><button class="xlsx-btn" on:click={downloadXLSX}>📥 Excel (XLSX)</button><button class="csv-btn" on:click={downloadCSV}>📥 CSV</button></div></div>
        <div class="stats-grid stats-sm">
            <div class="stat"><span class="n">{fmt(reportStats.total_products)}</span><span class="l">Produktov</span></div>
            <div class="stat ok"><span class="n">{fmt(reportStats.total_matched)}</span><span class="l">EAN</span></div>
            <div class="stat"><span class="n">{fmt(reportStats.total_fulltext)}</span><span class="l">Fulltext</span></div>
            <div class="stat warn"><span class="n">{fmt(reportStats.total_created)}</span><span class="l">AI vytv.</span></div>
            <div class="stat"><span class="n">{fmt(reportStats.total_categories)}</span><span class="l">Kategórií</span></div>
            <div class="stat paid"><span class="n">{fmt(reportStats.new_categories)}</span><span class="l">Nových 24h</span></div>
        </div>
        <div class="filter-row">
            <select bind:value={reportShopId} on:change={changeReportShop}><option value="">Všetky obchody</option>{#each shops as shop}<option value={shop.id}>{shop.shop_name}</option>{/each}</select>
            <div class="filter-tabs">
                <button class:active={reportFilter==='all'} on:click={() => changeReportFilter('all')}>Všetky</button>
                <button class:active={reportFilter==='created'} on:click={() => changeReportFilter('created')}>🤖 AI</button>
                <button class:active={reportFilter==='matched'} on:click={() => changeReportFilter('matched')}>📦 EAN</button>
                <button class:active={reportFilter==='fulltext'} on:click={() => changeReportFilter('fulltext')}>🔍 FT</button>
            </div>
        </div>
        {#if reportLoading}<div class="loading">Načítavam...</div>
        {:else if reportData.length === 0}<div class="empty-msg">Žiadne záznamy</div>
        {:else}
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Typ</th><th>Ponuka</th><th>Feed kategória</th><th>→</th><th>Priradená (plná cesta)</th><th>Značka</th><th>Cena</th><th>Obchod</th><th>Dátum</th></tr></thead><tbody>
            {#each reportData as row}
            <tr class="row-{row.match_type}">
                <td>{#if row.match_type==='created'}<span class="badge ai">AI</span>{:else if row.match_type==='matched'}<span class="badge ean">EAN</span>{:else if row.match_type==='fulltext'}<span class="badge ft">FT</span>{:else}<span class="badge">{row.match_type||'?'}</span>{/if}</td>
                <td class="td-title"><a href="/produkt/{row.product_slug}" target="_blank">{row.offer_title?.length > 50 ? row.offer_title.slice(0,50)+'...' : row.offer_title}</a></td>
                <td class="td-feed" title={row.feed_category}>{row.feed_category || '—'}</td>
                <td class="td-arrow">{#if row.feed_category && row.category_path && !row.category_path.includes(row.feed_category?.split('|')[0]?.trim())}<span class="changed">⚠️</span>{:else}<span class="same">✓</span>{/if}</td>
                <td class="td-path">{#each (row.category_path||'—').split(' > ') as part, i}{#if i > 0}<span class="sep"> › </span>{/if}<span class:leaf={i===(row.category_path||'').split(' > ').length-1}>{part}</span>{/each}</td>
                <td class="td-brand">{row.brand||'—'}</td>
                <td class="td-price">{row.price ? row.price.toFixed(2)+'€' : '—'}</td>
                <td class="td-shop">{row.shop_name||'—'}</td>
                <td class="td-date">{shortDate(row.offer_created)}</td>
            </tr>
            {/each}
        </tbody></table></div>
        {#if reportTotalPages > 1}<div class="pag"><button disabled={reportPage<=1} on:click={() => changeReportPage(reportPage-1)}>‹</button><span>{reportPage}/{reportTotalPages} ({fmt(reportTotal)})</span><button disabled={reportPage>=reportTotalPages} on:click={() => changeReportPage(reportPage+1)}>›</button></div>{/if}
        {/if}
    </div>

    <!-- ============ AUDIT TAB ============ -->
    {:else if activeTab === 'audit'}
    <div class="section">
        <div class="audit-head">
            <div>
                <h2>🔍 Audit stromu kategórií</h2>
                <p class="desc">AI kontrola cudzích názvov, duplicít, prázdnych vetiev a nelogických štruktúr</p>
            </div>
            <button class="btn blue" on:click={runAudit} disabled={auditLoading}>{auditLoading ? '⏳ Analyzujem...' : '🔄 Spustiť audit'}</button>
        </div>

        {#if auditStats.total}
        <div class="stats-grid stats-sm">
            <div class="stat"><span class="n">{fmt(auditStats.total)}</span><span class="l">Kategórií</span></div>
            <div class="stat" class:warn={auditStats.issues > 0}><span class="n">{fmt(auditStats.issues)}</span><span class="l">Problémov</span></div>
            <div class="stat" class:warn={auditStats.foreign > 0}><span class="n">{fmt(auditStats.foreign || 0)}</span><span class="l">Cudzí jazyk</span></div>
            <div class="stat"><span class="n">{fmt(auditStats.duplicate || 0)}</span><span class="l">Duplicity</span></div>
            <div class="stat"><span class="n">{fmt(auditStats.empty_branch || 0)}</span><span class="l">Prázdne</span></div>
        </div>
        {/if}

        {#if fixMsg}<div class="cleanup-result">{fixMsg}</div>{/if}

        {#if auditIssues.length > 0}
        <div class="filter-tabs" style="margin-bottom:12px">
            <button class:active={auditFilter==='all'} on:click={() => auditFilter='all'}>Všetky ({auditIssues.length})</button>
            <button class:active={auditFilter==='foreign'} on:click={() => auditFilter='foreign'}>🌍 Cudzie ({auditIssues.filter(i=>i.type==='foreign').length})</button>
            <button class:active={auditFilter==='duplicate'} on:click={() => auditFilter='duplicate'}>🔁 Duplicity ({auditIssues.filter(i=>i.type==='duplicate').length})</button>
            <button class:active={auditFilter==='empty_branch'} on:click={() => auditFilter='empty_branch'}>📭 Prázdne ({auditIssues.filter(i=>i.type==='empty_branch').length})</button>
            <button class:active={auditFilter==='too_deep'} on:click={() => auditFilter='too_deep'}>📏 Hlboké ({auditIssues.filter(i=>i.type==='too_deep').length})</button>
        </div>

        <div class="audit-list">
            {#each filteredAuditIssues as issue (issue.id)}
            <div class="audit-item">
                <div class="audit-row">
                    <span class="audit-type">{typeLabel(issue.type)}</span>
                    <span class="audit-sev" style="color:{sevColor(issue.severity)}">{issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '⚪'}</span>
                    <strong class="audit-name">{issue.name}</strong>
                    <span class="audit-path">{issue.full_path}</span>
                </div>
                <div class="audit-detail">{issue.detail}</div>
                {#if issue.suggestion}<div class="audit-suggestion">💡 {issue.suggestion}</div>{/if}
                <div class="audit-actions">
                    {#if issue.type === 'foreign' && issue.suggestion}
                        <button class="btn-sm green" on:click={() => applyFix(issue, 'rename', issue.suggestion.replace('Premenovať na: "','').replace('"',''))} disabled={fixingId===issue.id}>✅ Premenovať</button>
                    {/if}
                    {#if issue.type === 'foreign'}
                        <button class="btn-sm blue" on:click={() => applyFix(issue, 'rename')} disabled={fixingId===issue.id}>✏️ Vlastný názov</button>
                    {/if}
                    {#if issue.type === 'empty_branch' || issue.type === 'duplicate'}
                        <button class="btn-sm red" on:click={() => applyFix(issue, 'delete')} disabled={fixingId===issue.id}>🗑️ Zmazať</button>
                    {/if}
                    <button class="btn-sm outline" on:click={() => auditIssues = auditIssues.filter(i => i.id !== issue.id)}>✖ Ignorovať</button>
                </div>
            </div>
            {/each}
        </div>
        {:else if !auditLoading}
        <div class="empty-msg">✅ Žiadne problémy nenájdené! Strom kategórií je v poriadku.</div>
        {/if}
    </div>

    <!-- ============ CLEANUP TAB ============ -->
    {:else if activeTab === 'cleanup'}
    <div class="section">
        <h2>🗑️ Vyčistenie AI kategorizácie</h2>
        <p class="desc">Zmazať AI-vytvorené produkty a kategórie pre obchod → možnosť opakovať kategorizáciu.</p>
        <div class="cleanup-warn">⚠️ <strong>Pozor:</strong> Nezvratná akcia. Údaje budú permanentne zmazané.</div>
        <div class="form-row"><label>Obchod</label><select bind:value={cleanupShopId}><option value="">-- Vyberte --</option>{#each shops as shop}<option value={shop.id}>{shop.shop_name}</option>{/each}</select></div>
        <div class="cleanup-actions">
            <button class="btn orange" on:click={() => runCleanup(false,true,false)} disabled={cleanupLoading||!cleanupShopId}>{cleanupLoading ? '⏳...' : '📁 Zmazať prázdne kategórie'}</button>
            <button class="btn red" on:click={() => runCleanup(false,false,true)} disabled={cleanupLoading||!cleanupShopId}>📁💀 Zmazať VŠETKY kategórie</button>
            <button class="btn red" on:click={() => runCleanup(true,false,false)} disabled={cleanupLoading||!cleanupShopId}>🗑️ Zmazať AI produkty</button>
            <button class="btn darkred" on:click={() => runCleanup(true,false,true)} disabled={cleanupLoading||!cleanupShopId}>💣 Zmazať produkty + kategórie</button>
        </div>
        {#if cleanupMsg}<div class="cleanup-result">{cleanupMsg}</div>{/if}
    </div>
    {/if}
    {/if}
</div>

<style>
.page{width:100%;max-width:1300px;margin:0 auto;padding:20px}
.page-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px}
h1{font-size:24px;margin:0;color:#1e293b} h2{font-size:18px;margin:0 0 8px;color:#1e293b}
.loading{text-align:center;padding:40px;color:#64748b} .desc{color:#64748b;font-size:14px;margin:0 0 16px}
.section{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:20px}
.tab-bar{display:flex;gap:4px;background:#f1f5f9;padding:4px;border-radius:10px}
.tab{padding:8px 18px;border:none;background:none;border-radius:8px;font-size:13px;font-weight:600;color:#64748b;cursor:pointer}
.tab.active{background:#fff;color:#1e293b;box-shadow:0 1px 3px rgba(0,0,0,.1)}
.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px;margin:16px 0}
.stats-sm{margin-bottom:16px}
.stat{padding:14px 12px;background:#f8fafc;border-radius:8px;text-align:center;border:2px solid #e2e8f0}
.stat .n{display:block;font-size:22px;font-weight:700;color:#1e293b} .stat .l{font-size:11px;color:#64748b;text-transform:uppercase}
.stat.ok{border-color:#10b981;background:#ecfdf5} .stat.warn{border-color:#f59e0b;background:#fffbeb} .stat.paid{border-color:#10b981;background:#ecfdf5}
.form-grid{display:grid;gap:14px} .form-row{display:flex;flex-direction:column;gap:6px}
.form-row label{font-size:13px;font-weight:600;color:#374151}
.form-row input,.form-row select{padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px}
.form-row input:focus,.form-row select:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.1)}
.model-hint{font-size:12px;color:#64748b;margin-top:2px} .model-hint code{background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:11px;color:#1e293b}
.actions{display:flex;gap:10px;align-items:center;margin-top:16px;flex-wrap:wrap} .msg{font-size:14px;font-weight:500}
.btn{padding:10px 20px;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:.15s}
.btn.blue{background:#3b82f6;color:#fff} .btn.green{background:#10b981;color:#fff} .btn.red{background:#ef4444;color:#fff}
.btn.orange{background:#f59e0b;color:#fff} .btn.darkred{background:#991b1b;color:#fff}
.btn.outline{background:#fff;color:#475569;border:1px solid #d1d5db} .btn:disabled{opacity:.5;cursor:not-allowed}
.flow{display:flex;gap:6px;align-items:center;margin:14px 0;flex-wrap:wrap}
.step{background:#eff6ff;color:#1d4ed8;padding:6px 12px;border-radius:6px;font-size:12px;font-weight:600} .arrow{color:#94a3b8}
.job-status{margin:16px 0;padding:16px;border-radius:10px;border:2px solid #e2e8f0;background:#f8fafc}
.job-status.running{border-color:#3b82f6;background:#eff6ff} .job-status.done{border-color:#10b981;background:#ecfdf5}
.job-badge{padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;background:#e2e8f0}
.job-badge.running{background:#dbeafe;color:#1d4ed8} .job-badge.completed{background:#d1fae5;color:#065f46}
.progress-bar{height:6px;background:#e2e8f0;border-radius:3px;overflow:hidden;margin:8px 0}
.progress-fill{height:100%;background:#3b82f6;border-radius:3px;transition:width .3s}
.progress-text{text-align:center;font-size:12px;color:#475569;margin-bottom:10px}
.job-stats{display:flex;gap:14px;flex-wrap:wrap;font-size:13px;color:#475569}
.report-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:16px}
.export-btns{display:flex;gap:8px}
.csv-btn{padding:10px 20px;background:#059669;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap}
.csv-btn:hover{background:#047857}
.xlsx-btn{padding:10px 20px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap}
.xlsx-btn:hover{background:#1d4ed8}
.filter-row{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:16px}
.filter-row select{padding:8px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:13px}
.filter-tabs{display:flex;gap:2px;background:#f1f5f9;padding:3px;border-radius:8px}
.filter-tabs button{padding:6px 14px;border:none;background:none;border-radius:6px;font-size:12px;font-weight:600;color:#64748b;cursor:pointer}
.filter-tabs button.active{background:#fff;color:#1e293b;box-shadow:0 1px 2px rgba(0,0,0,.08)}
.tbl-wrap{overflow-x:auto;border:1px solid #e2e8f0;border-radius:10px}
.tbl{width:100%;border-collapse:collapse;font-size:12px}
.tbl thead{background:#f8fafc} .tbl th{padding:10px 8px;text-align:left;font-weight:600;color:#374151;border-bottom:2px solid #e2e8f0;white-space:nowrap;font-size:11px;text-transform:uppercase}
.tbl td{padding:8px;border-bottom:1px solid #f1f5f9;vertical-align:middle} .tbl tr:hover{background:#fafbfc}
tr.row-created{background:#fffbeb} tr.row-matched{background:#f0fdf4} tr.row-fulltext{background:#eff6ff}
.badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase}
.badge.ai{background:#fef3c7;color:#92400e} .badge.ean{background:#d1fae5;color:#065f46} .badge.ft{background:#dbeafe;color:#1e40af}
.td-title a{color:#2563eb;text-decoration:none} .td-title a:hover{text-decoration:underline}
.td-feed{max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#6b7280}
.td-arrow{text-align:center} .changed{color:#d97706} .same{color:#059669}
.td-path{font-size:11px} .sep{color:#d1d5db} .leaf{font-weight:600;color:#1e293b}
.td-brand{color:#6b7280} .td-shop{color:#6b7280;font-size:11px} .td-date{font-size:11px;color:#9ca3af;white-space:nowrap}
.td-price{text-align:right;font-weight:600}
.pag{display:flex;align-items:center;justify-content:center;gap:12px;margin-top:16px;font-size:13px;color:#64748b}
.pag button{width:34px;height:34px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;cursor:pointer;font-size:16px;font-weight:600}
.pag button:hover:not(:disabled){border-color:#3b82f6;color:#3b82f6} .pag button:disabled{opacity:.3;cursor:not-allowed}
.empty-msg{padding:40px;text-align:center;color:#64748b;background:#f8fafc;border-radius:8px}
.cleanup-warn{padding:14px 18px;background:#fef3c7;border:1px solid #fbbf24;border-radius:10px;color:#92400e;font-size:13px;margin-bottom:20px;line-height:1.5}
.cleanup-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}
.cleanup-result{margin-top:16px;padding:14px;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;font-size:14px;font-weight:500;color:#166534;white-space:pre-line}
.audit-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:16px}
.audit-list{display:flex;flex-direction:column;gap:8px}
.audit-item{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px}
.audit-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.audit-type{font-size:12px;font-weight:600;background:#eff6ff;color:#1d4ed8;padding:2px 8px;border-radius:4px}
.audit-sev{font-size:14px}
.audit-name{font-size:14px;color:#1e293b}
.audit-path{font-size:11px;color:#64748b;margin-left:auto}
.audit-detail{font-size:13px;color:#475569;margin:6px 0 2px}
.audit-suggestion{font-size:13px;color:#059669;font-weight:500;margin:4px 0}
.audit-actions{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}
.btn-sm{padding:5px 12px;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer}
.btn-sm.green{background:#10b981;color:#fff} .btn-sm.blue{background:#3b82f6;color:#fff}
.btn-sm.red{background:#ef4444;color:#fff} .btn-sm.outline{background:#fff;color:#64748b;border:1px solid #d1d5db}
.mode-selector{display:flex;gap:10px;margin-top:4px}
.mode-btn{display:flex;flex-direction:column;align-items:center;gap:4px;padding:14px 20px;border:2px solid #e2e8f0;border-radius:10px;background:#f8fafc;cursor:pointer;transition:.15s;flex:1;text-align:center}
.mode-btn:hover{border-color:#94a3b8;background:#f1f5f9}
.mode-btn.active{border-color:#3b82f6;background:#eff6ff;box-shadow:0 0 0 3px rgba(59,130,246,.15)}
.mode-icon{font-size:24px} .mode-btn strong{font-size:14px;color:#1e293b} .mode-desc{font-size:11px;color:#64748b}
@media(max-width:768px){.stats-grid{grid-template-columns:repeat(2,1fr)} .report-head,.filter-row,.cleanup-actions{flex-direction:column}}
</style>
