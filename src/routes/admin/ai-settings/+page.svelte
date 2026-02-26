<script>
    import { onMount, onDestroy } from 'svelte';
    import { adminFetch as apiFetch, adminRawFetch, API_BASE } from '$lib/adminApi.js';
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
    let job = null, polling = null, starting = false, displayStats = null, catMode = 'smart', useDescriptions = false, useProductNames = true;
    let reportData = [], reportStats = {}, reportTotal = 0, reportPage = 1, reportTotalPages = 1, reportLoading = false, reportFilter = 'all';
    let cleanupLoading = false, cleanupMsg = '';
    let showImport = false, importText = '', clearBeforeImport = false, importMsg = '';
    let uploadedFileName = '';
    $: importCount = (() => { try { const p = JSON.parse(importText); return Array.isArray(p) ? p.length : (p?.mappings?.length || 0); } catch { return 0; } })();

    function handleFileUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        uploadedFileName = file.name;
        const reader = new FileReader();
        reader.onload = (ev) => { importText = ev.target.result; };
        reader.readAsText(file);
    }

    let exportLoading = false;

    async function exportMapping() {
        if (!cleanupShopId) return;
        exportLoading = true;
        try {
            const r = await apiFetch('/admin/ai/export-mapping?shop_id=' + cleanupShopId);
            if (r?.success) {
                const blob = new Blob([JSON.stringify(r, null, 2)], {type: 'application/json'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'mapping-' + (r.shop || 'export') + '.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                alert('Chyba: ' + (r?.error || 'unknown'));
            }
        } catch(e) {
            alert('Chyba: ' + e.message);
        }
        exportLoading = false;
    }

    async function importMapping() {
        if (!importText.trim()) return;
        try {
            let parsed;
            try { parsed = JSON.parse(importText.trim()); } catch(e) { importMsg = '❌ Neplatný JSON'; return; }
            let mappings = Array.isArray(parsed) ? parsed : (parsed?.mappings || null);
            if (!Array.isArray(mappings)) { importMsg = '❌ JSON musí byť pole alebo objekt s kľúčom "mappings"'; return; }
            const r = await apiFetch('/admin/ai/import-mapping', { method: 'POST', body: JSON.stringify({ mappings, clear_existing: clearBeforeImport }) });
            if (r?.success) { importMsg = '✅ ' + r.message; } else { importMsg = '❌ ' + (r?.error || 'Chyba'); }
        } catch(e) { importMsg = '❌ ' + e.message; }
        setTimeout(() => importMsg = '', 10000);
    }
    let applyLoading = false;
    let applyMsg = '';
    let applyStats = null;

    async function applyMapping() {
        if (!cleanupShopId) return;
        applyLoading = true;
        applyMsg = '';
        applyStats = null;
        try {
            const r = await apiFetch('/admin/ai/apply-mapping', { 
                method: 'POST', 
                body: JSON.stringify({ shop_id: cleanupShopId }) 
            });
            if (r?.success) {
                applyMsg = '✅ ' + r.message;
                applyStats = r.stats;
            } else {
                applyMsg = '❌ ' + (r?.error || 'Chyba');
            }
        } catch(e) {
            applyMsg = '❌ ' + e.message;
        }
        applyLoading = false;
    }

    let treeVerifyLoading = false, treeVerifySuggestions = [], treeVerifyModel = '', treeVerifySize = 0;
    let activeTab = 'settings';

    // AUDIT
    let auditLoading = false, auditIssues = [], auditStats = {}, auditFilter = 'all';
    let fixingId = '', fixMsg = '';

    // SMART RECATEGORIZE
    let smartFeeds = [], smartRoots = [], smartMappings = [], smartProvider = 'anthropic';
    let smartAnalyzing = false, smartPreviewing = false, smartApplying = false;
    let smartMsg = '', smartLogs = [], smartPhase = 'analyze'; // analyze, preview, apply
    let smartTestResult = null, smartTesting = false;

    async function smartAnalyze() {
        smartAnalyzing = true; smartFeeds = []; smartMsg = '';
        const r = await apiFetch('/admin/ai/smart-recategorize?action=analyze');
        if (r?.success) {
            smartFeeds = r.feeds || [];
            smartRoots = r.existing_roots || [];
            smartPhase = 'preview';
            smartMsg = `Nájdených ${smartFeeds.length} unikátnych feed kategórií`;
        } else { smartMsg = '❌ ' + (r?.error || 'Chyba'); }
        smartAnalyzing = false;
    }

    async function smartTestAI() {
        smartTesting = true; smartTestResult = null;
        const r = await apiFetch(`/admin/ai/test?provider=${smartProvider}`);
        smartTestResult = r;
        smartTesting = false;
    }

    async function smartPreview() {
        smartPreviewing = true; smartMappings = []; smartMsg = '';
        const feeds = smartFeeds.map(f => f.feed);
        const r = await apiFetch('/admin/ai/smart-recategorize?action=preview', {
            method: 'POST',
            body: JSON.stringify({ provider: smartProvider, feeds })
        });
        if (r?.success) {
            smartMappings = (r.mappings || []).map(m => ({...m, approved: true}));
            smartPhase = 'apply';
            smartMsg = `✅ AI navrhla ${smartMappings.length} mapovaní (${r.provider} / ${r.model})`;
        } else {
            smartMsg = '❌ ' + (r?.error || 'Chyba');
            if (r?.partial_results?.length) smartMappings = r.partial_results.map(m => ({...m, approved: true}));
        }
        smartPreviewing = false;
    }

    async function smartApply() {
        const approved = smartMappings.filter(m => m.approved);
        if (!confirm(`Aplikovať ${approved.length} mapovaní? Toto premaže existujúce kategórie produktov.`)) return;
        smartApplying = true; smartMsg = ''; smartLogs = [];
        const r = await apiFetch('/admin/ai/smart-recategorize?action=apply', {
            method: 'POST',
            body: JSON.stringify({ mappings: approved.map(m => ({ feed: m.feed, path: m.suggested })) })
        });
        if (r?.success) {
            smartMsg = '✅ ' + r.message;
            smartLogs = r.logs || [];
        } else { smartMsg = '❌ ' + (r?.error || 'Chyba'); }
        smartApplying = false;
    }

    function switchToSmart() { activeTab = 'smart'; if (smartFeeds.length === 0 && !smartAnalyzing) smartAnalyze(); }

    onMount(async () => { await Promise.all([loadSettings(), loadShops(), loadProgress(), loadDisplayStats()]); loading = false; });
    onDestroy(() => { if (polling) clearInterval(polling); });

    // apiFetch imported from $lib/adminApi.js
    async function loadSettings() { const r = await apiFetch('/admin/ai/settings'); if (r?.success && r.data) settings = { ...settings, ...r.data }; }
    async function loadShops() { const r = await apiFetch('/admin/shops'); if (r?.success) shops = r.data || []; }
    async function saveSettings() { saving = true; saveMsg = ''; const r = await apiFetch('/admin/ai/settings', { method: 'POST', body: JSON.stringify(settings) }); saveMsg = r?.success ? '✅ Uložené' : '❌ ' + (r?.error || 'Chyba'); saving = false; setTimeout(() => saveMsg = '', 3000); }
    async function loadProgress() { const r = await apiFetch('/admin/ai/bulk-categorize/progress'); if (r?.success && r.data) { job = r.data; if (job.status === 'running' && !polling) polling = setInterval(loadProgress, 2000); if (job.status !== 'running' && polling) { clearInterval(polling); polling = null; } setTimeout(() => { const el = document.querySelector('.log-content'); if (el) el.scrollTop = el.scrollHeight; }, 100); } }
    async function loadDisplayStats() { const r = await apiFetch('/admin/ai/display-mode-stats'); if (r?.success) displayStats = r.data; }
    async function startCategorization(continueFromLast = false) { if (!selectedShopId) { alert('Vyberte obchod'); return; } const sn = shops.find(s => s.id === selectedShopId)?.shop_name || ''; const modeNames = {fast:'⚡ RÝCHLU',precise:'🎯 PRESNÚ',ultra:'🔬 VEĽMI PRESNÚ',creative:'🆕 KREATÍVNU',smart:'💡 SMART',smart_create:'💡+ SMART+'}; const contMsg = continueFromLast ? ' (pokračovanie)' : ''; const descMsg = useDescriptions ? ' + popisy' : ''; if (!confirm(`Spustiť ${modeNames[catMode]||catMode} AI kategorizáciu${descMsg} pre "${sn}"${contMsg}?`)) return; starting = true; const r = await apiFetch('/admin/ai/bulk-categorize', { method: 'POST', body: JSON.stringify({ shop_id: selectedShopId, mode: catMode, continue_from_last: continueFromLast, use_descriptions: useDescriptions, use_product_names: useProductNames }) }); if (r?.success) { job = { status: 'running', total_offers: r.unmatched, processed: 0, percent: 0 }; polling = setInterval(loadProgress, 2000); } else alert(r?.error || 'Chyba'); starting = false; }
    async function cancelCategorization() { if (!confirm('Zastaviť?')) return; await apiFetch('/admin/ai/bulk-categorize/cancel', { method: 'POST' }); if (polling) { clearInterval(polling); polling = null; } await loadProgress(); }
    async function clearCache() { if (!confirm('Vymazať celú feed→kategória cache? Ďalšia kategorizácia bude pomalšia ale presnejšia.')) return; const r = await apiFetch('/admin/ai/clear-cache', { method: 'POST' }); alert(r?.message || 'Cache vymazaná'); await loadProgress(); }

    async function treeVerify(apply = false) {
        if (apply && !confirm('Aplikovať VŠETKY navrhnuté zmeny? (premenovania + zlúčenia)')) return;
        treeVerifyLoading = true;
        try {
            const r = await apiFetch('/admin/ai/tree-verify', { method: 'POST', body: JSON.stringify({ apply }) });
            if (r?.success) {
                treeVerifySuggestions = r.suggestions || [];
                treeVerifyModel = r.model || '';
                treeVerifySize = r.tree_size || 0;
                if (apply && r.applied > 0) alert(`✅ Aplikovaných ${r.applied} zmien`);
            } else { alert(r?.error || 'Chyba'); }
        } catch(e) { alert('Chyba: ' + e.message); }
        treeVerifyLoading = false;
    }

    async function applyTreeFix(suggestion) {
        const r = await apiFetch('/admin/ai/tree-verify', { method: 'POST', body: JSON.stringify({ apply: true, single: suggestion }) });
        if (r?.success) { treeVerifySuggestions = treeVerifySuggestions.filter(s => s.id !== suggestion.id); alert('✅ Opravené'); }
    }
    async function loadReport() { reportLoading = true; let u = `/admin/ai/categorization-report?page=${reportPage}&per_page=50&match_type=${reportFilter}`; if (reportShopId) u += `&shop_id=${reportShopId}`; const r = await apiFetch(u); if (r?.success) { reportData = r.data || []; reportStats = r.stats || {}; reportTotal = r.total || 0; reportTotalPages = r.total_pages || 1; } reportLoading = false; }
    function changeReportFilter(f) { reportFilter = f; reportPage = 1; loadReport(); }
    function changeReportPage(p) { if (p >= 1 && p <= reportTotalPages) { reportPage = p; loadReport(); } }
    function changeReportShop() { reportPage = 1; loadReport(); }
    async function downloadCSV() {
        let u = `${API_BASE}/admin/ai/categorization-report/csv`;
        if (reportShopId) u += `?shop_id=${reportShopId}`;
        try {
            const r = await adminRawFetch(u);
            if (!r.ok) {
                try { const j = await r.json(); alert(j.error || 'Chyba pri sťahovaní'); } catch { alert('Chyba pri sťahovaní (HTTP ' + r.status + ')'); }
                return;
            }
            const blob = await r.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'categorization-report.csv';
            a.click(); URL.revokeObjectURL(a.href);
        } catch(e) { alert('Chyba: ' + e.message); }
    }
    async function downloadXLSX() {
        let u = `${API_BASE}/admin/ai/categorization-report/csv?format=xlsx`;
        if (reportShopId) u += `&shop_id=${reportShopId}`;
        try {
            const r = await adminRawFetch(u);
            if (!r.ok) {
                try { const j = await r.json(); alert(j.error || 'Chyba pri sťahovaní'); } catch { alert('Chyba pri sťahovaní (HTTP ' + r.status + ')'); }
                return;
            }
            const blob = await r.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'categorization-report.xlsx';
            a.click(); URL.revokeObjectURL(a.href);
        } catch(e) { alert('Chyba: ' + e.message); }
    }
    function switchToReport() { activeTab = 'report'; if (reportData.length === 0) loadReport(); }
    async function runCleanup(delP, delC, delAllC = false, delMaster = false) { if (!cleanupShopId) { alert('Vyberte obchod'); return; } const sn = shops.find(s => s.id === cleanupShopId)?.shop_name || ''; let m = `Vyčistiť pre "${sn}":\n`; if (delP) m += '- Zmazať AI produkty\n'; if (delMaster) m += '- Zmazať master produkty bez ponúk\n'; if (delAllC) m += '⚠️ POZOR: Zmazať VŠETKY prázdne kategórie (vrátane Google/manuálnych)!\n'; else if (delC) m += '- Zmazať prázdne AI kategórie (len vytvorené týmto vendorom)\n'; if (!confirm(m + '\nPokračovať?')) return; if (delAllC && !confirm('NAOZAJ zmazať VŠETKY prázdne kategórie? Toto zmaže aj Google/manuálne kategórie!')) return; cleanupLoading = true; cleanupMsg = ''; const r = await apiFetch('/admin/ai/cleanup', { method: 'POST', body: JSON.stringify({ shop_id: cleanupShopId, delete_products: delP, delete_categories: delC, delete_all_categories: delAllC, delete_master_products: delMaster }) }); if (r?.success) { cleanupMsg = '✅ ' + r.message; if (r.logs?.length) cleanupMsg += '\n' + r.logs.join('\n'); await loadDisplayStats(); if (reportData.length > 0) loadReport(); } else { cleanupMsg = '❌ ' + (r?.error || 'Chyba'); } cleanupLoading = false; setTimeout(() => cleanupMsg = '', 15000); }
    function fmt(n) { return (n || 0).toLocaleString('sk-SK'); }
    function shortDate(s) { if (!s) return '—'; return s.length > 19 ? s.slice(0, 19).replace('T', ' ') : s; }

    // AUDIT functions
    let auditProvider = 'anthropic'; // default to Claude for better quality
    let fixAllLoading = false, fixAllMsg = '', fixAllLogs = [];
    async function runAudit(prov = '') {
        auditLoading = true; auditIssues = [];
        const p = prov || auditProvider;
        const r = await apiFetch(`/admin/ai/tree-audit?provider=${p}`);
        if (r?.success) { auditIssues = r.issues || []; auditStats = r.stats || {}; }
        else { alert(r?.error || 'Chyba'); }
        auditLoading = false;
    }
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
    async function fixAll() {
        if (!confirm(`🔧 Opraviť všetko pomocou ${auditProvider === 'anthropic' ? 'Claude' : 'OpenAI'}?\n\nToto:\n- Zmaže prázdne kategórie\n- Preloží cudzie názvy do slovenčiny\n- Zlúči duplicity\n\nPokračovať?`)) return;
        fixAllLoading = true; fixAllMsg = ''; fixAllLogs = [];
        const r = await apiFetch(`/admin/ai/fix-all?provider=${auditProvider}`, { method: 'POST' });
        if (r?.success) {
            fixAllMsg = '✅ ' + r.message;
            fixAllLogs = r.logs || [];
            await runAudit(); // Refresh audit
        } else { fixAllMsg = '❌ ' + (r?.error || 'Chyba'); }
        fixAllLoading = false;
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
            <button class="tab" class:active={activeTab === 'smart'} on:click={switchToSmart}>🧠 Smart Re-kategorize</button>
            <button class="tab" class:active={activeTab === 'report'} on:click={switchToReport}>📊 Report</button>
            <button class="tab" class:active={activeTab === 'audit'} on:click={switchToAudit}>🔍 Audit stromu</button>
            <button class="tab" class:active={activeTab === 'cleanup'} on:click={() => activeTab = 'cleanup'}>🗑️ Vyčistenie</button>
            <button class="tab" class:active={activeTab === 'mapping'} on:click={() => activeTab = 'mapping'}>📤 Mapovanie</button>
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
        {#if job}
        <div class="provider-info">
            <span class="prov-badge">🤖 {job.active_provider || '?'} / {job.active_model || '?'}</span>
            {#if job.remaining > 0}<span class="remaining-badge">📋 {fmt(job.remaining)} zostáva</span>{/if}
            {#if job.failed > 0}<span class="failed-badge">⏳ {fmt(job.failed)} čaká na Kreatívnu</span>{/if}
            {#if job.cache_count > 0}<span class="cache-badge">💾 {fmt(job.cache_count)} v cache</span>{/if}
        </div>
        {/if}
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
                <button class="mode-btn" class:active={catMode==='creative'} on:click={() => catMode='creative'}>
                    <span class="mode-icon">🆕</span><strong>Kreatívna</strong><span class="mode-desc">Spracuje ⏳ nezaradené — vytvorí nové kategórie</span>
                </button>
                <button class="mode-btn recommended" class:active={catMode==='smart'} on:click={() => catMode='smart'}>
                    <span class="mode-icon">💡</span><strong>Smart</strong><span class="mode-desc">AI + názov produktu — presné zaradenie do existujúcich kategórií</span>
                    <span class="mode-badge">ODPORÚČANÉ</span>
                </button>
                <button class="mode-btn" class:active={catMode==='smart_create'} on:click={() => catMode='smart_create'}>
                    <span class="mode-icon">💡+</span><strong>Smart+</strong><span class="mode-desc">Ako Smart, ale vytvára chýbajúce podkategórie (root musí existovať)</span>
                </button>
            </div>
            {#if catMode === 'smart' || catMode === 'smart_create' || catMode === 'precise' || catMode === 'ultra' || catMode === 'creative'}
            <div class="ai-options">
                <label class="option-check">
                    <input type="checkbox" bind:checked={useProductNames}>
                    🏷️ Brať do úvahy názov produktu <span class="option-hint">(presnejšie, ale drahšie — ak nie, AI použije len feed kategóriu)</span>
                </label>
                <label class="option-check">
                    <input type="checkbox" bind:checked={useDescriptions}>
                    📝 Brať do úvahy popis produktu <span class="option-hint">(presnejšie, ale pomalšie a drahšie)</span>
                </label>
            </div>
            {/if}
            </div>
        {#if job}
        <div class="job-status" class:running={job.status==='running'} class:done={job.status==='completed'}>
            <span class="job-badge {job.status}">{job.status === 'running' ? '⏳ Prebieha' : job.status === 'completed' ? '✅ Hotovo' : '⛔ '+job.status}</span>
            {#if job.status === 'running'}<div class="progress-bar"><div class="progress-fill" style="width:{job.percent||0}%"></div></div><div class="progress-text">{fmt(job.processed)} / {fmt(job.total_offers)} ({job.percent||0}%)</div>{/if}
            <div class="job-stats"><span>📦 {fmt(job.processed)}</span><span>✅ {fmt(job.matched)}</span><span>🆕 {fmt(job.new_products)}</span><span>📁 {fmt(job.new_categories)}</span><span>❌ {fmt(job.errors)}</span></div>
        </div>
        {#if job.error_log}
        <details open class="log-panel">
            <summary>📋 Live Log ({(job.error_log||'').split('\n').length} riadkov)</summary>
            <pre class="log-content">{job.error_log}</pre>
        </details>
        {/if}

        {/if}
        <div class="actions">
            {#if job?.status === 'running'}<button class="btn red" on:click={cancelCategorization}>⛔ Zastaviť</button>
            {:else}
                <button class="btn green" on:click={() => startCategorization(false)} disabled={starting || !selectedShopId}>{starting ? '⏳...' : '🚀 Spustiť'}</button>
                {#if job?.failed > 0}
                <button class="btn blue" on:click={() => startCategorization(true)} disabled={starting || !selectedShopId}>▶️ Pokračovať ({fmt(job.remaining)} zostáva)</button>
                {/if}
            {/if}
            <button class="btn outline" on:click={loadProgress}>🔄 Obnoviť</button>
            <button class="btn outline" on:click={clearCache} title="Vymaže feed→kategória cache pre čerstvý štart">🗑️ Vyčistiť cache</button>
            <button class="btn outline" on:click={() => treeVerify(false)} disabled={treeVerifyLoading} title="AI analyzuje strom a navrhne opravy názvov, skloňovania, duplikátov">🌳 AI Verifikácia stromu</button>
        </div>

        {#if treeVerifyLoading}
        <div class="tree-verify-panel"><p>⏳ AI analyzuje strom kategórií...</p></div>
        {/if}

        {#if treeVerifySuggestions.length > 0}
        <div class="tree-verify-panel">
            <h3>🌳 AI Verifikácia stromu ({treeVerifySuggestions.length} návrhov, model: {treeVerifyModel}, {treeVerifySize} kategórií)</h3>
            <div class="tree-actions">
                <button class="btn green" on:click={() => treeVerify(true)}>✅ Aplikovať všetky premenovania</button>
            </div>
            <table class="tree-table">
                <thead><tr><th>Akcia</th><th>Pôvodný názov</th><th>Nový názov</th><th>Dôvod</th></tr></thead>
                <tbody>
                {#each treeVerifySuggestions as s}
                <tr class="action-{s.action}">
                    <td><span class="action-badge {s.action}">{s.action === 'rename' ? '✏️' : s.action === 'merge' ? '🔗' : s.action === 'move' ? '📦' : '📝'} {s.action}</span></td>
                    <td>{s.old_name || ''}</td>
                    <td>{s.new_name || s.merge_into || ''}</td>
                    <td>{s.reason || ''}</td>
                </tr>
                {/each}
                </tbody>
            </table>
        </div>
        {/if}
    </div>

    <!-- ============ SMART RE-KATEGORIZE TAB ============ -->
    {:else if activeTab === 'smart'}
    <div class="section">
        <h2>🧠 Smart AI Re-kategorizácia</h2>
        <p class="desc">AI analyzuje feed kategórie a navrhne správnu štruktúru pre slovenský CPC porovnávač. Iba {smartFeeds.length || '?'} AI volaní namiesto tisícov!</p>

        <!-- AI Test -->
        <div class="smart-test">
            <div class="provider-tabs">
                <button class="prov-tab" class:active={smartProvider==='anthropic'} on:click={() => smartProvider='anthropic'}>🧠 Claude</button>
                <button class="prov-tab" class:active={smartProvider==='openai'} on:click={() => smartProvider='openai'}>🤖 OpenAI</button>
            </div>
            <button class="btn blue" on:click={smartTestAI} disabled={smartTesting}>{smartTesting ? '⏳...' : '🔌 Test AI pripojenia'}</button>
            {#if smartTestResult}
                <span class="test-result" class:ok={smartTestResult.success} class:fail={!smartTestResult.success}>
                    {smartTestResult.success ? '✅' : '❌'} {smartTestResult.message || smartTestResult.error}
                    {#if smartTestResult.key_preview} (kľúč: {smartTestResult.key_preview}){/if}
                </span>
            {/if}
        </div>

        {#if smartMsg}<div class="cleanup-result">{smartMsg}</div>{/if}

        <!-- Phase 1: Analyze -->
        {#if smartPhase === 'analyze'}
        <div class="smart-action">
            <button class="btn green" on:click={smartAnalyze} disabled={smartAnalyzing}>
                {smartAnalyzing ? '⏳ Analyzujem...' : '📊 Analyzovať feed kategórie'}
            </button>
        </div>
        {/if}

        <!-- Phase 2: Preview / Generate AI mapping -->
        {#if smartPhase === 'preview' && smartFeeds.length > 0}
        <div class="smart-summary">
            <h3>📋 Feed kategórie ({smartFeeds.length})</h3>
            <div class="smart-roots">Existujúce root: <strong>{smartRoots.join(', ')}</strong></div>
            <div class="smart-feed-preview">
                {#each smartFeeds.slice(0, 20) as f}
                <div class="feed-item"><span class="feed-count">{f.count}x</span> {f.feed} {#if f.current_path}<span class="feed-current">→ {f.current_path}</span>{/if}</div>
                {/each}
                {#if smartFeeds.length > 20}<div class="feed-more">... a ďalších {smartFeeds.length - 20}</div>{/if}
            </div>
            <button class="btn green" on:click={smartPreview} disabled={smartPreviewing}>
                {smartPreviewing ? '⏳ AI generuje mapovanie...' : `🤖 Generovať AI mapovanie (${smartProvider === 'anthropic' ? 'Claude' : 'OpenAI'})`}
            </button>
            {#if smartPreviewing}<div class="progress-text" style="margin-top:8px">Prebieha... toto môže trvať 30-60 sekúnd pre {smartFeeds.length} kategórií</div>{/if}
        </div>
        {/if}

        <!-- Phase 3: Apply mappings -->
        {#if smartPhase === 'apply' && smartMappings.length > 0}
        <div class="smart-mappings">
            <div class="smart-mappings-head">
                <h3>🗺️ AI navrhnuté mapovanie ({smartMappings.filter(m=>m.approved).length}/{smartMappings.length} schválených)</h3>
                <div class="smart-actions-top">
                    <button class="btn-sm green" on:click={() => smartMappings = smartMappings.map(m => ({...m, approved: true}))}>✅ Schváliť všetky</button>
                    <button class="btn-sm outline" on:click={() => smartMappings = smartMappings.map(m => ({...m, approved: false}))}>✖ Odmietnuť všetky</button>
                    <button class="btn green" on:click={smartApply} disabled={smartApplying || smartMappings.filter(m=>m.approved).length === 0}>
                        {smartApplying ? '⏳ Aplikujem...' : `🚀 Aplikovať (${smartMappings.filter(m=>m.approved).length})`}
                    </button>
                </div>
            </div>

            <div class="mapping-list">
                {#each smartMappings as m, i}
                <div class="mapping-item" class:rejected={!m.approved}>
                    <label class="mapping-check">
                        <input type="checkbox" bind:checked={m.approved}>
                    </label>
                    <div class="mapping-content">
                        <div class="mapping-feed">📥 {m.feed}</div>
                        <div class="mapping-arrow">→</div>
                        <div class="mapping-suggested">📁 {m.suggested_str}</div>
                        {#if m.reasoning}<div class="mapping-reason">💡 {m.reasoning}</div>{/if}
                    </div>
                </div>
                {/each}
            </div>
        </div>
        {/if}

        {#if smartLogs.length > 0}
        <div class="fix-all-logs">
            {#each smartLogs as log}<div class="log-line">{log}</div>{/each}
        </div>
        {/if}
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
            <div class="audit-controls">
                <div class="provider-tabs">
                    <button class="prov-tab" class:active={auditProvider==='anthropic'} on:click={() => { auditProvider='anthropic'; runAudit('anthropic'); }}>🧠 Claude</button>
                    <button class="prov-tab" class:active={auditProvider==='openai'} on:click={() => { auditProvider='openai'; runAudit('openai'); }}>🤖 OpenAI</button>
                </div>
                <button class="btn blue" on:click={() => runAudit()} disabled={auditLoading}>{auditLoading ? '⏳ Analyzujem...' : '🔄 Spustiť audit'}</button>
            </div>
        </div>

        {#if auditStats.total}
        <div class="stats-grid stats-sm">
            <div class="stat"><span class="n">{fmt(auditStats.total)}</span><span class="l">Kategórií</span></div>
            <div class="stat" class:warn={auditStats.issues > 0}><span class="n">{fmt(auditStats.issues)}</span><span class="l">Problémov</span></div>
            <div class="stat" class:warn={auditStats.foreign > 0}><span class="n">{fmt(auditStats.foreign || 0)}</span><span class="l">Cudzí jazyk</span></div>
            <div class="stat"><span class="n">{fmt(auditStats.duplicate || 0)}</span><span class="l">Duplicity</span></div>
            <div class="stat"><span class="n">{fmt(auditStats.empty_branch || 0)}</span><span class="l">Prázdne</span></div>
        </div>

        {#if auditStats.issues > 0}
        <div class="fix-all-section">
            <button class="btn green fix-all-btn" on:click={fixAll} disabled={fixAllLoading}>
                {fixAllLoading ? '⏳ Opravujem...' : `🔧 Opraviť všetko (${auditProvider === 'anthropic' ? 'Claude' : 'OpenAI'})`}
            </button>
            <span class="fix-all-desc">Automaticky: preloží cudzie názvy do SK, zmaže prázdne kategórie, zlúči duplicity</span>
        </div>
        {/if}
        {/if}

        {#if fixAllMsg}<div class="cleanup-result">{fixAllMsg}</div>{/if}
        {#if fixAllLogs.length > 0}<div class="fix-all-logs">{#each fixAllLogs as log}<div class="log-line">{log}</div>{/each}</div>{/if}
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
            <button class="btn darkred" on:click={() => runCleanup(true,true,false)} disabled={cleanupLoading||!cleanupShopId}>💣 Zmazať produkty + kategórie</button>
            <button class="btn darkred" on:click={() => runCleanup(true,true,false,true)} disabled={cleanupLoading||!cleanupShopId}>💀 Zmazať všetko + master</button>
        </div>
        {#if cleanupMsg}<div class="cleanup-result">{cleanupMsg}</div>{/if}
    </div>

    {:else if activeTab === 'mapping'}
    <div class="section">
        <h2>📤 Export / Import mapovanie kategórií</h2>
        <p class="desc">Export unikátnych feed kategórií → manuálne mapovanie v Claude → import späť. Zadarmo a presné!</p>
        <div class="form-row"><label>Obchod</label><select bind:value={cleanupShopId}><option value="">-- Vyberte --</option>{#each shops as shop}<option value={shop.id}>{shop.shop_name}</option>{/each}</select></div>
        <div class="cleanup-actions">
            <button class="btn blue" on:click={exportMapping} disabled={!cleanupShopId || exportLoading}>{exportLoading ? "⏳ Načítavam..." : "📤 Export feed kategórií (JSON)"}</button>
            <button class="btn green" on:click={() => showImport = !showImport}>{showImport ? '✕ Zavrieť import' : '📥 Import mapovanie'}</button>
        </div>
        {#if showImport}
        <div style="margin-top:16px;padding:16px;background:#f8f8f0;border-radius:8px;border:1px solid #ddd">
            <p style="margin-bottom:8px;font-weight:600">Nahraj JSON mapovanie (feed_category → category_id):</p>
            <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:12px">
                <label class="btn blue" style="cursor:pointer;margin:0">
                    📁 Vybrať súbor (.json)
                    <input type="file" accept=".json" style="display:none" on:change={handleFileUpload}>
                </label>
                {#if uploadedFileName}<span style="font-size:13px;color:#059669;font-weight:600">✅ {uploadedFileName}</span>{/if}
            </div>
            <details style="margin-bottom:8px">
                <summary style="cursor:pointer;font-size:13px;color:#64748b">Alebo vlož JSON manuálne</summary>
                <textarea bind:value={importText} rows="6" style="width:100%;font-family:monospace;font-size:12px;margin-top:8px" placeholder='Paste JSON mapping here...'></textarea>
            </details>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                <label style="font-size:13px"><input type="checkbox" bind:checked={clearBeforeImport}> Vymazať existujúce mapovanie</label>
                <button class="btn green" on:click={importMapping} disabled={!importText.trim()}>📥 Importovať ({importCount} mapovaní)</button>
            </div>
            {#if importMsg}<div class="cleanup-result" style="margin-top:8px">{importMsg}</div>{/if}
        </div>
        {/if}

        <hr style="margin:24px 0;border-color:#e5e5e5">
        <h3 style="margin:0 0 8px">🚀 Aplikovať mapovanie na produkty</h3>
        <p class="desc">Použije importované mapovanie na zaradenie ponúk do kategórií. <strong>Bez AI API tokenov — zadarmo a okamžite.</strong></p>
        <button class="btn orange" on:click={applyMapping} disabled={!cleanupShopId || applyLoading}>
            {applyLoading ? '⏳ Spracovávam...' : '🚀 Aplikovať mapovanie'}
        </button>
        {#if applyMsg}
        <div class="cleanup-result" style="margin-top:12px">{applyMsg}</div>
        {/if}
        {#if applyStats}
        <div style="margin-top:12px;padding:12px;background:#f0f8f0;border-radius:8px;border:1px solid #c3e6c3;font-size:13px">
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:8px">
                <div><strong>{applyStats.total_offers}</strong><br><small>Ponúk celkom</small></div>
                <div><strong>{applyStats.matched}</strong><br><small>Namapovaných</small></div>
                <div style="color:#2a7"><strong>+{applyStats.created || 0}</strong><br><small>Vytvorených</small></div>
                <div style="color:#27a"><strong>{applyStats.updated || 0}</strong><br><small>Aktualizovaných</small></div>
            </div>
            {#if applyStats.unmatched > 0}
            <div style="color:#c50;margin-top:4px">⚠️ {applyStats.unmatched} nenámapovaných ponúk</div>
            {/if}
            {#if applyStats.error_logs?.length}
            <details open style="margin-top:8px">
                <summary style="cursor:pointer;font-weight:600;color:#dc2626">🐛 Error logy (prvých {applyStats.error_logs.length})</summary>
                <pre style="margin:4px 0;padding:8px;background:#1e293b;color:#f87171;border-radius:6px;font-size:11px;overflow-x:auto;max-height:200px">{applyStats.error_logs.join('\n')}</pre>
            </details>
            {/if}
            {#if applyStats.top_unmatched?.length}
            <details style="margin-top:8px">
                <summary style="cursor:pointer;font-weight:600">Nenámapované kategórie (top {applyStats.top_unmatched.length})</summary>
                <ul style="margin:4px 0;padding-left:20px;font-size:12px">
                    {#each applyStats.top_unmatched as u}
                    <li>{u.category} ({u.count}x)</li>
                    {/each}
                </ul>
            </details>
            {/if}
        </div>
        {/if}
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
@media(max-width:768px){.stats-grid{grid-template-columns:repeat(2,1fr)} .report-head,.filter-row,.cleanup-actions{flex-direction:column} .mode-selector{flex-direction:column}}
.mode-selector{display:flex;gap:10px;margin-top:4px;flex-wrap:wrap}
.mode-btn{display:flex;flex-direction:column;align-items:center;gap:4px;padding:14px 20px;border:2px solid #e2e8f0;border-radius:10px;background:#f8fafc;cursor:pointer;transition:.15s;flex:1;text-align:center;min-width:140px}
.mode-btn:hover{border-color:#94a3b8;background:#f1f5f9}
.mode-btn.active{border-color:#3b82f6;background:#eff6ff;box-shadow:0 0 0 3px rgba(59,130,246,.15)}
.mode-icon{font-size:24px} .mode-btn strong{font-size:14px;color:#1e293b} .mode-desc{font-size:11px;color:#64748b}
.mode-btn.recommended{border-color:#22c55e;background:#f0fdf4}
.mode-btn.recommended.active{border-color:#16a34a;background:#dcfce7;box-shadow:0 0 0 3px rgba(34,197,94,.15)}
.mode-badge{background:#16a34a;color:#fff;padding:2px 8px;border-radius:4px;font-size:9px;font-weight:700;letter-spacing:.5px}
.ai-options{margin-top:8px;padding:10px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px}
.option-check{display:flex;align-items:center;gap:8px;font-size:13px;color:#334155;cursor:pointer}
.option-check input{width:16px;height:16px;accent-color:#3b82f6}
.option-hint{font-size:11px;color:#94a3b8}
.log-panel{margin-top:12px;border:1px solid #e2e8f0;border-radius:8px;background:#1e293b;overflow:hidden}
.log-panel summary{padding:8px 14px;background:#334155;color:#e2e8f0;cursor:pointer;font-size:13px;font-weight:600}
.log-content{padding:12px 14px;margin:0;font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.6;color:#94a3b8;max-height:400px;overflow-y:auto;white-space:pre-wrap;word-break:break-word}
.provider-info{display:flex;gap:8px;margin:8px 0 12px;flex-wrap:wrap}
.prov-badge{background:#eff6ff;color:#1d4ed8;padding:4px 12px;border-radius:6px;font-size:12px;font-weight:600}
.remaining-badge{background:#fefce8;color:#854d0e;padding:4px 12px;border-radius:6px;font-size:12px;font-weight:600}
.failed-badge{background:#fef3c7;color:#92400e;padding:4px 12px;border-radius:6px;font-size:12px;font-weight:600}
.cache-badge{background:#f0fdf4;color:#166534;padding:4px 12px;border-radius:6px;font-size:12px;font-weight:600}
.audit-controls{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.provider-tabs{display:flex;gap:0;border:1px solid #d1d5db;border-radius:8px;overflow:hidden}
.prov-tab{padding:8px 16px;border:none;background:#f8fafc;color:#64748b;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s}
.prov-tab.active{background:#3b82f6;color:#fff}
.prov-tab:hover:not(.active){background:#e2e8f0}
.fix-all-section{display:flex;align-items:center;gap:14px;margin:16px 0;padding:16px;background:linear-gradient(135deg,#f0fdf4,#ecfdf5);border:1px solid #86efac;border-radius:10px}
.fix-all-btn{font-size:15px;padding:12px 24px;white-space:nowrap}
.fix-all-desc{font-size:13px;color:#166534;line-height:1.4}
.fix-all-logs{margin-top:12px;padding:14px;background:#1e293b;border-radius:8px;max-height:300px;overflow-y:auto}
.fix-all-logs .log-line{font-family:monospace;font-size:12px;color:#94a3b8;padding:2px 0;border-bottom:1px solid #334155}
/* SMART RECATEGORIZE */
.smart-test{display:flex;align-items:center;gap:12px;margin:16px 0;padding:12px;background:#f8fafc;border-radius:8px;flex-wrap:wrap}
.test-result{font-size:13px;padding:4px 10px;border-radius:6px}
.test-result.ok{background:#dcfce7;color:#166534}
.test-result.fail{background:#fee2e2;color:#991b1b}
.smart-action{margin:16px 0}
.smart-summary{margin:16px 0}
.smart-roots{margin:8px 0;padding:10px;background:#eff6ff;border-radius:8px;font-size:13px;color:#1e40af}
.smart-feed-preview{max-height:300px;overflow-y:auto;border:1px solid #e2e8f0;border-radius:8px;margin:12px 0;padding:0}
.feed-item{padding:6px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;display:flex;gap:8px;align-items:center}
.feed-item:hover{background:#f8fafc}
.feed-count{background:#3b82f6;color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;min-width:32px;text-align:center;flex-shrink:0}
.feed-current{color:#94a3b8;font-size:12px;margin-left:auto;flex-shrink:0}
.feed-more{padding:8px 12px;text-align:center;color:#94a3b8;font-size:12px}
.smart-mappings{margin:16px 0}
.smart-mappings-head{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px}
.smart-actions-top{display:flex;gap:8px;align-items:center}
.mapping-list{max-height:500px;overflow-y:auto;border:1px solid #e2e8f0;border-radius:8px}
.mapping-item{display:flex;gap:10px;align-items:center;padding:8px 12px;border-bottom:1px solid #f1f5f9;transition:background .15s}
.mapping-item:hover{background:#f0f9ff}
.mapping-item.rejected{opacity:0.4;background:#fef2f2}
.mapping-check{flex-shrink:0}
.mapping-check input{width:18px;height:18px;cursor:pointer}
.mapping-content{flex:1;min-width:0;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.mapping-feed{font-size:13px;color:#64748b;flex:1;min-width:120px}
.mapping-arrow{color:#94a3b8;font-weight:700;flex-shrink:0}
.mapping-suggested{font-size:13px;font-weight:600;color:#059669;flex:1;min-width:120px}
.mapping-reason{font-size:11px;color:#94a3b8;width:100%;padding-left:28px}
.progress-text{font-size:13px;color:#3b82f6;animation:pulse 1.5s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
.tree-verify-panel{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-top:16px}
.tree-verify-panel h3{font-size:15px;margin:0 0 12px;color:#475569}
.tree-actions{margin-bottom:12px}
.tree-table{width:100%;border-collapse:collapse;font-size:13px}
.tree-table th{background:#e2e8f0;padding:6px 10px;text-align:left;font-weight:600}
.tree-table td{padding:6px 10px;border-bottom:1px solid #e2e8f0}
.action-badge{padding:2px 8px;border-radius:4px;font-size:12px;font-weight:600}
.action-badge.rename{background:#dbeafe;color:#1d4ed8}
.action-badge.merge{background:#fef3c7;color:#b45309}
.action-badge.move{background:#ede9fe;color:#7c3aed}
.action-badge.note{background:#f1f5f9;color:#64748b}
tr.action-rename{background:#eff6ff}
tr.action-merge{background:#fffbeb}
tr.action-note{background:#f8fafc}
</style>
