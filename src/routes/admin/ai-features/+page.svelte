<script>
    import { onMount } from 'svelte';

    const API = 'http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io/api/v1';
    
    function getAuth() { return window.__adminAuth || ''; }

    let loading = true;
    let saving = false;
    let data = null;
    let selectedModel = '';
    let message = '';
    let messageType = '';

    async function loadSettings() {
        loading = true;
        try {
            const res = await fetch(`${API}/admin/ai/public-settings`, { headers: { 'Authorization': getAuth() } });
            const json = await res.json();
            if (json.success) {
                data = json.data;
                selectedModel = data.public_model || (data.provider === 'anthropic' ? 'claude-3-5-haiku-20241022' : 'gpt-4o-mini');
            }
        } catch(e) { showMsg('Chyba načítania', 'error'); }
        loading = false;
    }

    async function saveModel() {
        saving = true;
        try {
            const res = await fetch(`${API}/admin/ai/public-settings`, {
                method: 'POST',
                headers: { 'Authorization': getAuth(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: selectedModel })
            });
            const json = await res.json();
            if (json.success) showMsg('Model uložený: ' + selectedModel, 'success');
            else showMsg(json.error || 'Chyba', 'error');
        } catch(e) { showMsg('Chyba ukladania', 'error'); }
        saving = false;
    }

    async function clearReviews() {
        if (!confirm('Naozaj chceš vymazať všetky AI recenzie? Budú sa generovať nanovo.')) return;
        try {
            const res = await fetch(`${API}/admin/ai/clear-reviews`, {
                method: 'POST',
                headers: { 'Authorization': getAuth() }
            });
            const json = await res.json();
            if (json.success) { showMsg(json.message, 'success'); loadSettings(); }
        } catch(e) { showMsg('Chyba', 'error'); }
    }

    function showMsg(text, type) {
        message = text; messageType = type;
        setTimeout(() => { message = ''; }, 4000);
    }

    function fmtCost(cost) {
        if (!cost) return '0.000';
        return cost.toFixed(4);
    }

    function fmtTokens(tokens) {
        if (!tokens) return '0';
        if (tokens >= 1000000) return (tokens / 1000000).toFixed(1) + 'M';
        if (tokens >= 1000) return (tokens / 1000).toFixed(1) + 'k';
        return tokens.toString();
    }

    function actionLabel(action) {
        const map = {
            'chat_chat': '💬 Chat',
            'chat_describe': '📝 Popis',
            'review': '⭐ Recenzia'
        };
        return map[action] || action;
    }

    onMount(() => { loadSettings(); });
</script>

<div class="aip">
    <div class="aip__header">
        <h1 class="aip__title">🤖 AI Funkcie</h1>
        <p class="aip__subtitle">Nastavenia AI chatu, recenzií a spotreby tokenov</p>
    </div>

    {#if message}
    <div class="aip__msg aip__msg--{messageType}">{message}</div>
    {/if}

    {#if loading}
    <div class="aip__loading">
        <div class="aip__spinner"></div>
        Načítavam...
    </div>
    {:else if data}

    <!-- Stats Cards -->
    <div class="aip__cards">
        <div class="aip__card aip__card--today">
            <div class="aip__card-label">Dnes</div>
            <div class="aip__card-value">{data.today?.requests || 0}</div>
            <div class="aip__card-sub">požiadaviek</div>
            <div class="aip__card-detail">
                <span>{fmtTokens(data.today?.tokens)} tokenov</span>
                <span class="aip__card-cost">${fmtCost(data.today?.cost)}</span>
            </div>
        </div>
        <div class="aip__card aip__card--week">
            <div class="aip__card-label">Tento týždeň</div>
            <div class="aip__card-value">{data.week?.requests || 0}</div>
            <div class="aip__card-sub">požiadaviek</div>
            <div class="aip__card-detail">
                <span>{fmtTokens(data.week?.tokens)} tokenov</span>
                <span class="aip__card-cost">${fmtCost(data.week?.cost)}</span>
            </div>
        </div>
        <div class="aip__card aip__card--total">
            <div class="aip__card-label">Celkom</div>
            <div class="aip__card-value">{data.total?.requests || 0}</div>
            <div class="aip__card-sub">požiadaviek</div>
            <div class="aip__card-detail">
                <span>{fmtTokens(data.total?.tokens)} tokenov</span>
                <span class="aip__card-cost">${fmtCost(data.total?.cost)}</span>
            </div>
        </div>
        <div class="aip__card aip__card--cache">
            <div class="aip__card-label">Uložené recenzie</div>
            <div class="aip__card-value">{data.cached_reviews || 0}</div>
            <div class="aip__card-sub">v cache (zadarmo)</div>
            <div class="aip__card-detail">
                <button class="aip__clear-btn" on:click={clearReviews}>Vymazať cache</button>
            </div>
        </div>
    </div>

    <!-- Model Selection -->
    <div class="aip__section">
        <h2 class="aip__section-title">Model pre verejné AI funkcie</h2>
        <p class="aip__section-desc">Tento model sa používa pre AI chat, recenzie a odporúčania. API kľúč sa použije z <a href="/admin/ai-settings">AI Kategorizácia</a>.</p>
        
        <div class="aip__models">
            {#each data.models || [] as model}
            {@const isSelected = selectedModel === model.id}
            {@const isCurrentProvider = model.provider === data.provider}
            <button
                class="aip__model"
                class:aip__model--selected={isSelected}
                class:aip__model--disabled={!isCurrentProvider}
                on:click={() => { if (isCurrentProvider) selectedModel = model.id; }}
                disabled={!isCurrentProvider}
            >
                <div class="aip__model-head">
                    <span class="aip__model-name">{model.name}</span>
                    {#if isSelected}<span class="aip__model-check">✓</span>{/if}
                </div>
                <div class="aip__model-provider">{model.provider === 'openai' ? 'OpenAI' : 'Anthropic'}</div>
                <div class="aip__model-meta">
                    <span class="aip__model-speed" class:fast={model.speed === 'fast'} class:medium={model.speed === 'medium'}>
                        {model.speed === 'fast' ? '⚡ Rýchly' : '🔄 Stredný'}
                    </span>
                    <span class="aip__model-quality">
                        {model.quality === 'excellent' ? '🏆 Výborný' : model.quality === 'good' ? '👍 Dobrý' : '📋 Základný'}
                    </span>
                </div>
                <div class="aip__model-price">
                    <span>Input: ${model.input_cost}/1M</span>
                    <span>Output: ${model.output_cost}/1M</span>
                </div>
                {#if !isCurrentProvider}
                <div class="aip__model-note">Prepni provider na "{model.provider}" v AI Kategorizácii</div>
                {/if}
            </button>
            {/each}
        </div>

        <button class="aip__save-btn" on:click={saveModel} disabled={saving}>
            {saving ? 'Ukladám...' : 'Uložiť model'}
        </button>
    </div>

    <!-- Usage by Action -->
    {#if data.by_action && data.by_action.length > 0}
    <div class="aip__section">
        <h2 class="aip__section-title">Spotreba podľa typu</h2>
        <table class="aip__table">
            <thead>
                <tr>
                    <th>Akcia</th>
                    <th>Počet</th>
                    <th>Tokeny</th>
                    <th>Náklady</th>
                </tr>
            </thead>
            <tbody>
                {#each data.by_action as row}
                <tr>
                    <td>{actionLabel(row.action)}</td>
                    <td>{row.count}</td>
                    <td>{fmtTokens(row.tokens)}</td>
                    <td class="aip__cost-cell">${fmtCost(row.cost)}</td>
                </tr>
                {/each}
            </tbody>
        </table>
    </div>
    {/if}

    <!-- Daily Usage -->
    {#if data.by_day && data.by_day.length > 0}
    <div class="aip__section">
        <h2 class="aip__section-title">Denná spotreba (14 dní)</h2>
        
        <!-- Simple bar chart -->
        <div class="aip__chart">
            {@const maxTokens = Math.max(...data.by_day.map(d => d.tokens), 1)}
            {#each data.by_day as day}
            <div class="aip__chart-bar-wrap">
                <div class="aip__chart-bar" style="height: {Math.max(4, (day.tokens / maxTokens) * 120)}px">
                    <span class="aip__chart-tooltip">{fmtTokens(day.tokens)} tok / ${fmtCost(day.cost)}</span>
                </div>
                <div class="aip__chart-label">{day.date.slice(5)}</div>
                <div class="aip__chart-count">{day.count}×</div>
            </div>
            {/each}
        </div>
    </div>
    {/if}

    <!-- Cost Estimate -->
    <div class="aip__section aip__section--info">
        <h2 class="aip__section-title">💡 Odhad nákladov</h2>
        <div class="aip__info-grid">
            <div class="aip__info-item">
                <strong>AI Chat (1 otázka)</strong>
                <span>~300-600 tokenov ≈ ${selectedModel === 'gpt-4o-mini' ? '0.0003' : selectedModel === 'gpt-4o' ? '0.004' : '0.002'}</span>
            </div>
            <div class="aip__info-item">
                <strong>AI Recenzia (1 produkt)</strong>
                <span>~500-1000 tokenov ≈ ${selectedModel === 'gpt-4o-mini' ? '0.0005' : selectedModel === 'gpt-4o' ? '0.007' : '0.003'}</span>
            </div>
            <div class="aip__info-item">
                <strong>100 recenzií</strong>
                <span>≈ ${selectedModel === 'gpt-4o-mini' ? '0.05' : selectedModel === 'gpt-4o' ? '0.70' : '0.30'}</span>
            </div>
            <div class="aip__info-item">
                <strong>1000 chatov/deň</strong>
                <span>≈ ${selectedModel === 'gpt-4o-mini' ? '0.30' : selectedModel === 'gpt-4o' ? '4.00' : '2.00'}/deň</span>
            </div>
        </div>
        <p class="aip__info-note">Recenzie sa ukladajú do cache — každý produkt sa platí len raz. Opakované zobrazenia sú zadarmo.</p>
    </div>

    {/if}
</div>

<style>
.aip { max-width: 960px; margin: 0 auto; padding: 24px 16px; }
.aip__header { margin-bottom: 28px; }
.aip__title { font-size: 24px; font-weight: 700; color: #1f2937; margin: 0 0 4px; }
.aip__subtitle { font-size: 14px; color: #6b7280; margin: 0; }

.aip__msg { padding: 12px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; margin-bottom: 20px; }
.aip__msg--success { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
.aip__msg--error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

.aip__loading { display: flex; align-items: center; gap: 12px; padding: 40px; color: #6b7280; font-size: 14px; }
.aip__spinner { width: 20px; height: 20px; border: 2px solid #e5e7eb; border-top-color: #c4956a; border-radius: 50%; animation: aispin 0.6s linear infinite; }
@keyframes aispin { to { transform: rotate(360deg); } }

/* Stats Cards */
.aip__cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 28px; }
.aip__card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; }
.aip__card--today { border-left: 3px solid #10b981; }
.aip__card--week { border-left: 3px solid #3b82f6; }
.aip__card--total { border-left: 3px solid #8b5cf6; }
.aip__card--cache { border-left: 3px solid #f59e0b; }
.aip__card-label { font-size: 12px; color: #6b7280; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
.aip__card-value { font-size: 32px; font-weight: 700; color: #1f2937; line-height: 1.2; }
.aip__card-sub { font-size: 13px; color: #9ca3af; margin-bottom: 8px; }
.aip__card-detail { display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #6b7280; }
.aip__card-cost { font-weight: 600; color: #059669; }
.aip__clear-btn { background: none; border: 1px solid #fbbf24; color: #92400e; font-size: 11px; padding: 3px 10px; border-radius: 6px; cursor: pointer; font-weight: 500; }
.aip__clear-btn:hover { background: #fef3c7; }

/* Sections */
.aip__section { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
.aip__section--info { background: #fffbeb; border-color: #fde68a; }
.aip__section-title { font-size: 16px; font-weight: 600; color: #1f2937; margin: 0 0 6px; }
.aip__section-desc { font-size: 13px; color: #6b7280; margin: 0 0 18px; }
.aip__section-desc a { color: #c4956a; text-decoration: underline; }

/* Model Cards */
.aip__models { display: grid; grid-template-columns: repeat(auto-fill, minmax(175px, 1fr)); gap: 10px; margin-bottom: 18px; }
.aip__model { background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 10px; padding: 14px; text-align: left; cursor: pointer; transition: all 0.15s; }
.aip__model:hover:not(:disabled) { border-color: #c4956a; background: #fff; }
.aip__model--selected { border-color: #c4956a !important; background: #fff !important; box-shadow: 0 0 0 3px rgba(196,149,106,0.15); }
.aip__model--disabled { opacity: 0.4; cursor: not-allowed; }
.aip__model-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.aip__model-name { font-size: 14px; font-weight: 600; color: #1f2937; }
.aip__model-check { color: #c4956a; font-weight: 700; font-size: 16px; }
.aip__model-provider { font-size: 11px; color: #9ca3af; margin-bottom: 8px; }
.aip__model-meta { display: flex; gap: 8px; margin-bottom: 6px; }
.aip__model-speed, .aip__model-quality { font-size: 11px; padding: 2px 6px; border-radius: 4px; background: #f3f4f6; color: #6b7280; }
.aip__model-speed.fast { background: #ecfdf5; color: #065f46; }
.aip__model-speed.medium { background: #eff6ff; color: #1e40af; }
.aip__model-price { font-size: 11px; color: #9ca3af; display: flex; flex-direction: column; gap: 1px; }
.aip__model-note { font-size: 10px; color: #ef4444; margin-top: 6px; font-style: italic; }

.aip__save-btn { background: linear-gradient(135deg, #c4956a, #b8875c); color: #fff; border: none; padding: 10px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
.aip__save-btn:hover { opacity: 0.9; }
.aip__save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Table */
.aip__table { width: 100%; border-collapse: collapse; font-size: 14px; }
.aip__table th { text-align: left; padding: 10px 12px; border-bottom: 2px solid #e5e7eb; font-weight: 600; color: #374151; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
.aip__table td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #4b5563; }
.aip__table tr:hover td { background: #f9fafb; }
.aip__cost-cell { font-weight: 600; color: #059669; }

/* Chart */
.aip__chart { display: flex; align-items: flex-end; gap: 6px; padding: 16px 0; overflow-x: auto; }
.aip__chart-bar-wrap { display: flex; flex-direction: column; align-items: center; min-width: 42px; }
.aip__chart-bar { width: 28px; background: linear-gradient(180deg, #c4956a, #ddb896); border-radius: 4px 4px 0 0; position: relative; cursor: pointer; transition: opacity 0.2s; min-height: 4px; }
.aip__chart-bar:hover { opacity: 0.8; }
.aip__chart-tooltip { display: none; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background: #1f2937; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 10px; white-space: nowrap; margin-bottom: 4px; }
.aip__chart-bar:hover .aip__chart-tooltip { display: block; }
.aip__chart-label { font-size: 10px; color: #9ca3af; margin-top: 4px; }
.aip__chart-count { font-size: 10px; color: #6b7280; font-weight: 500; }

/* Info Grid */
.aip__info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin: 16px 0; }
.aip__info-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: rgba(255,255,255,0.7); border-radius: 8px; font-size: 13px; }
.aip__info-item strong { color: #92400e; }
.aip__info-item span { color: #059669; font-weight: 600; }
.aip__info-note { font-size: 12px; color: #92400e; margin: 12px 0 0; font-style: italic; }

@media (max-width: 640px) {
    .aip__cards { grid-template-columns: 1fr 1fr; }
    .aip__models { grid-template-columns: 1fr; }
}
</style>
