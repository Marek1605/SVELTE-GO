<script>
    import { onMount, onDestroy } from 'svelte';
    import { api } from '$lib/api';

    let settings = { ai_provider: 'openai', openai_api_key: '', anthropic_api_key: '', ai_model_openai: 'gpt-4o-mini', ai_model_anthropic: 'claude-3-haiku-20240307' };
    let loading = true;
    let saving = false;
    let saveMsg = '';

    let job = null;
    let polling = null;
    let starting = false;

    let displayStats = null;

    onMount(async () => {
        await loadSettings();
        await loadProgress();
        await loadDisplayStats();
        loading = false;
    });

    onDestroy(() => { if (polling) clearInterval(polling); });

    async function loadSettings() {
        try {
            const res = await api.get('/admin/ai/settings');
            if (res?.success && res.data) {
                settings = { ...settings, ...res.data };
            }
        } catch (e) { console.error(e); }
    }

    async function saveSettings() {
        saving = true; saveMsg = '';
        try {
            const res = await api.post('/admin/ai/settings', settings);
            saveMsg = res?.success ? '✅ Uložené' : '❌ ' + (res?.error || 'Chyba');
        } catch (e) { saveMsg = '❌ Chyba pripojenia'; }
        saving = false;
        setTimeout(() => saveMsg = '', 3000);
    }

    async function loadProgress() {
        try {
            const res = await api.get('/admin/ai/bulk-categorize/progress');
            if (res?.success && res.data) {
                job = res.data;
                if (job.status === 'running' && !polling) {
                    polling = setInterval(loadProgress, 2000);
                }
                if (job.status !== 'running' && polling) {
                    clearInterval(polling); polling = null;
                }
            }
        } catch (e) { console.error(e); }
    }

    async function loadDisplayStats() {
        try {
            const res = await api.get('/admin/ai/display-mode-stats');
            if (res?.success) displayStats = res.data;
        } catch (e) { console.error(e); }
    }

    async function startCategorization() {
        if (!confirm('Spustiť AI kategorizáciu nespárovaných ponúk? Toto môže trvať dlhšie.')) return;
        starting = true;
        try {
            const res = await api.post('/admin/ai/bulk-categorize', {});
            if (res?.success) {
                job = { status: 'running', total_offers: res.unmatched, processed: 0, percent: 0 };
                polling = setInterval(loadProgress, 2000);
            } else {
                alert(res?.error || 'Chyba');
            }
        } catch (e) { alert('Chyba pripojenia'); }
        starting = false;
    }

    async function cancelCategorization() {
        if (!confirm('Zastaviť kategorizáciu?')) return;
        await api.post('/admin/ai/bulk-categorize/cancel', {});
        if (polling) { clearInterval(polling); polling = null; }
        await loadProgress();
    }

    function fmt(n) { return (n || 0).toLocaleString('sk-SK'); }
</script>

<svelte:head><title>AI Nastavenia | Admin</title></svelte:head>

<div class="page">
    <h1>🤖 AI Kategorizácia & Nastavenia</h1>

    {#if loading}
        <div class="loading">Načítavam...</div>
    {:else}

    <!-- Display Mode Stats -->
    {#if displayStats}
    <div class="section">
        <h2>📊 Prehľad systému</h2>
        <div class="stats-grid">
            <div class="stat"><span class="n">{fmt(displayStats.shops?.total)}</span><span class="l">Obchodov</span></div>
            <div class="stat free"><span class="n">{fmt(displayStats.shops?.free)}</span><span class="l">FREE režim</span></div>
            <div class="stat paid"><span class="n">{fmt(displayStats.shops?.paid)}</span><span class="l">PAID režim</span></div>
            <div class="stat"><span class="n">{fmt(displayStats.offers?.total)}</span><span class="l">Ponúk celkom</span></div>
            <div class="stat ok"><span class="n">{fmt(displayStats.matching?.matched)}</span><span class="l">Spárovaných</span></div>
            <div class="stat warn"><span class="n">{fmt(displayStats.matching?.unmatched)}</span><span class="l">Nespárovaných</span></div>
        </div>
    </div>
    {/if}

    <!-- AI Settings -->
    <div class="section">
        <h2>⚙️ AI Nastavenia</h2>
        <p class="desc">Nastavte API kľúče pre AI kategorizáciu produktov. Kľúče sú bezpečne uložené v databáze.</p>

        <div class="form-row">
            <label>AI Provider</label>
            <select bind:value={settings.ai_provider}>
                <option value="openai">OpenAI (GPT-4o-mini)</option>
                <option value="anthropic">Anthropic (Claude Haiku)</option>
            </select>
        </div>

        <div class="form-row">
            <label>OpenAI API kľúč</label>
            <input type="password" bind:value={settings.openai_api_key} placeholder="sk-proj-...">
            <small>Získajte na <a href="https://platform.openai.com/api-keys" target="_blank">platform.openai.com</a></small>
        </div>

        <div class="form-row">
            <label>Anthropic API kľúč</label>
            <input type="password" bind:value={settings.anthropic_api_key} placeholder="sk-ant-...">
            <small>Získajte na <a href="https://console.anthropic.com" target="_blank">console.anthropic.com</a></small>
        </div>

        <div class="form-row">
            <label>OpenAI Model</label>
            <select bind:value={settings.ai_model_openai}>
                <option value="gpt-4o-mini">GPT-4o-mini (najlacnejší)</option>
                <option value="gpt-4o">GPT-4o (najlepší)</option>
                <option value="gpt-3.5-turbo">GPT-3.5-turbo</option>
            </select>
        </div>

        <div class="form-row">
            <label>Anthropic Model</label>
            <select bind:value={settings.ai_model_anthropic}>
                <option value="claude-3-haiku-20240307">Claude 3 Haiku (najlacnejší)</option>
                <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
            </select>
        </div>

        <div class="actions">
            <button class="btn blue" on:click={saveSettings} disabled={saving}>
                {saving ? 'Ukladám...' : '💾 Uložiť nastavenia'}
            </button>
            {#if saveMsg}<span class="msg">{saveMsg}</span>{/if}
        </div>
    </div>

    <!-- Bulk Categorization -->
    <div class="section">
        <h2>🧠 Hromadná AI kategorizácia</h2>
        <p class="desc">
            AI analyzuje nespárované ponuky, nájde alebo vytvorí správne kategórie a zaradí produkty.
            Ponuky sa najprv pokúsi spárovať cez EAN/názov, až potom použije AI.
        </p>

        <div class="flow">
            <div class="step">1️⃣ EAN match</div>
            <div class="arrow">→</div>
            <div class="step">2️⃣ Fuzzy názov</div>
            <div class="arrow">→</div>
            <div class="step">3️⃣ AI kategorizácia</div>
            <div class="arrow">→</div>
            <div class="step">4️⃣ Nový produkt + kategória</div>
        </div>

        {#if job}
        <div class="job-status" class:running={job.status === 'running'} class:done={job.status === 'completed'} class:err={job.status === 'failed'}>
            <div class="job-header">
                <span class="job-badge" class:running={job.status === 'running'} class:done={job.status === 'completed'} class:err={job.status === 'failed' || job.status === 'cancelled'}>
                    {job.status === 'running' ? '⏳ Prebieha' : job.status === 'completed' ? '✅ Dokončené' : job.status === 'failed' ? '❌ Zlyhalo' : '⛔ Zrušené'}
                </span>
                <span class="job-provider">{job.provider?.toUpperCase()}</span>
            </div>

            {#if job.status === 'running'}
            <div class="progress-bar"><div class="progress-fill" style="width:{job.percent || 0}%"></div></div>
            <div class="progress-text">{fmt(job.processed)} / {fmt(job.total_offers)} ({job.percent || 0}%)</div>
            {/if}

            <div class="job-stats">
                <span>📦 Spracovaných: <b>{fmt(job.processed)}</b></span>
                <span>✅ Spárovaných: <b>{fmt(job.matched)}</b></span>
                <span>🆕 Nových produktov: <b>{fmt(job.new_products)}</b></span>
                <span>📁 Nových kategórií: <b>{fmt(job.new_categories)}</b></span>
                <span>❌ Chýb: <b>{fmt(job.errors)}</b></span>
            </div>

            {#if job.error_log}
            <div class="error-log">{job.error_log}</div>
            {/if}
        </div>
        {/if}

        <div class="actions">
            {#if job?.status === 'running'}
                <button class="btn red" on:click={cancelCategorization}>⛔ Zastaviť</button>
            {:else}
                <button class="btn green" on:click={startCategorization} disabled={starting || !displayStats?.matching?.unmatched}>
                    {starting ? 'Spúšťam...' : `🚀 Spustiť kategorizáciu (${fmt(displayStats?.matching?.unmatched || 0)} nespárovaných)`}
                </button>
            {/if}
            <button class="btn outline" on:click={loadProgress}>🔄 Obnoviť</button>
        </div>
    </div>

    <!-- How it works -->
    <div class="section info-section">
        <h2>ℹ️ Ako to funguje</h2>
        <div class="info-grid">
            <div class="info-card">
                <h3>🔓 FREE režim</h3>
                <p>Vendor ponuky sú viditeľné iba vo fulltextovom vyhľadávaní. Niesú zaradené v kategóriách.</p>
            </div>
            <div class="info-card">
                <h3>💳 PAID režim</h3>
                <p>Ponuky sa zobrazujú v kategóriách, na stránkach produktov s porovnaním cien. CPC účtovanie aktívne.</p>
            </div>
            <div class="info-card">
                <h3>🤖 AI kategorizácia</h3>
                <p>AI analyzuje nespárované ponuky a zaradí ich do správnych kategórií. Ak kategória neexistuje, vytvorí novú.</p>
            </div>
            <div class="info-card">
                <h3>🔄 Prepínanie režimov</h3>
                <p>Keď vendor prepne na FREE, ponuky zmiznú z kategórií (ale zostávajú v DB). Pri PAID sa vrátia.</p>
            </div>
        </div>
    </div>

    {/if}
</div>

<style>
    .page{width:100%;max-width:1100px;margin:0 auto;padding:20px}
    h1{font-size:24px;margin:0 0 24px;color:#1e293b}
    h2{font-size:18px;margin:0 0 8px;color:#1e293b}
    .loading{text-align:center;padding:40px;color:#64748b}
    .desc{color:#64748b;font-size:14px;margin:0 0 20px;line-height:1.5}
    .section{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:20px}
    .stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:16px}
    .stat{padding:16px;background:#f8fafc;border-radius:8px;text-align:center;border:2px solid #e2e8f0}
    .stat .n{display:block;font-size:24px;font-weight:700;color:#1e293b}
    .stat .l{font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.3px}
    .stat.free{border-color:#fbbf24;background:#fffbeb}.stat.paid{border-color:#10b981;background:#ecfdf5}
    .stat.ok{border-color:#10b981;background:#ecfdf5}.stat.warn{border-color:#f59e0b;background:#fffbeb}
    .form-row{margin-bottom:16px}
    .form-row label{display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:6px}
    .form-row input,.form-row select{width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;box-sizing:border-box}
    .form-row input:focus,.form-row select:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.1)}
    .form-row small{display:block;margin-top:4px;color:#9ca3af;font-size:12px}
    .form-row small a{color:#3b82f6}
    .actions{display:flex;gap:10px;align-items:center;margin-top:20px;flex-wrap:wrap}
    .msg{font-size:14px;font-weight:500}
    .btn{padding:10px 20px;border:none;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;transition:all .15s}
    .btn.blue{background:#3b82f6;color:#fff}.btn.blue:hover{background:#2563eb}
    .btn.green{background:#10b981;color:#fff}.btn.green:hover{background:#059669}
    .btn.red{background:#ef4444;color:#fff}.btn.red:hover{background:#dc2626}
    .btn.outline{background:#fff;color:#475569;border:1px solid #d1d5db}.btn.outline:hover{border-color:#3b82f6;color:#3b82f6}
    .btn:disabled{opacity:.5;cursor:not-allowed}
    .flow{display:flex;gap:8px;align-items:center;margin:16px 0;flex-wrap:wrap}
    .step{background:#eff6ff;color:#1d4ed8;padding:8px 14px;border-radius:8px;font-size:13px;font-weight:500}
    .arrow{color:#94a3b8;font-size:18px}
    .job-status{margin:20px 0;padding:20px;border-radius:10px;border:2px solid #e2e8f0;background:#f8fafc}
    .job-status.running{border-color:#3b82f6;background:#eff6ff}
    .job-status.done{border-color:#10b981;background:#ecfdf5}
    .job-status.err{border-color:#ef4444;background:#fef2f2}
    .job-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
    .job-badge{padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600}
    .job-badge.running{background:#dbeafe;color:#1d4ed8}
    .job-badge.done{background:#d1fae5;color:#065f46}
    .job-badge.err{background:#fee2e2;color:#991b1b}
    .job-provider{font-size:12px;color:#64748b;font-weight:600}
    .progress-bar{height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;margin-bottom:8px}
    .progress-fill{height:100%;background:#3b82f6;border-radius:4px;transition:width .3s}
    .progress-text{text-align:center;font-size:13px;color:#475569;margin-bottom:12px}
    .job-stats{display:flex;gap:16px;flex-wrap:wrap;font-size:13px;color:#475569}
    .job-stats b{color:#1e293b}
    .error-log{margin-top:12px;padding:10px;background:#fef2f2;border-radius:6px;font-size:12px;color:#991b1b;font-family:monospace;max-height:100px;overflow-y:auto}
    .info-section{background:#f8fafc}
    .info-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-top:16px}
    .info-card{background:#fff;padding:16px;border-radius:8px;border:1px solid #e2e8f0}
    .info-card h3{font-size:14px;margin:0 0 6px;color:#1e293b}
    .info-card p{font-size:13px;color:#64748b;margin:0;line-height:1.5}
    @media(max-width:768px){.stats-grid{grid-template-columns:repeat(2,1fr)}.flow{flex-direction:column}.arrow{transform:rotate(90deg)}}
</style>
