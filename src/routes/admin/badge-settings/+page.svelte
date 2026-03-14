<script>
    import { onMount } from 'svelte';

    const API_BASE = typeof window !== 'undefined' ? window.location.origin + '/api/v1' : '';
    
    let activeTab = 'ai-recommended';
    let loading = false;
    let categories = [];
    let aiRecommended = [];
    let msg = '';

    async function apiFetch(url, opts = {}) {
        const token = typeof window !== 'undefined' ? window.__adminAuth : '';
        const res = await fetch(API_BASE + url, {
            ...opts,
            headers: { 'Authorization': token || '', 'Content-Type': 'application/json', ...(opts.headers || {}) }
        });
        return res.json();
    }

    onMount(async () => {
        await loadCategories();
    });

    async function loadCategories() {
        loading = true;
        try {
            const res = await apiFetch('/admin/categories?limit=999');
            const all = res?.data?.categories || res?.data || [];
            // Leaf categories only
            const parentIds = new Set(all.filter(c => c.parent_id).map(c => c.parent_id));
            categories = all.filter(c => !parentIds.has(c.id) && c.product_count > 0).sort((a,b) => b.product_count - a.product_count);
            // Load AI recommended for each
            for (const cat of categories.slice(0, 50)) {
                try {
                    const r = await fetch(`${API_BASE}/ai/recommended/${cat.id}`);
                    const j = await r.json();
                    if (j.success && j.data?.product_id) {
                        aiRecommended = [...aiRecommended, { category_id: cat.id, product_id: j.data.product_id }];
                    }
                } catch(e) {}
            }
        } catch(e) { console.error(e); }
        loading = false;
    }

    function getRecommendedForCat(catId) {
        return aiRecommended.find(r => r.category_id === catId)?.product_id || 0;
    }

    async function resetAiRecommended(catId) {
        msg = '';
        try {
            const res = await fetch(`${API_BASE}/ai/recommended/${catId}`);
            const j = await res.json();
            if (j.success && j.data?.product_id) {
                aiRecommended = aiRecommended.filter(r => r.category_id !== catId);
                aiRecommended = [...aiRecommended, { category_id: catId, product_id: j.data.product_id }];
                msg = `Kategória ${catId}: nový AI odporúčaný produkt #${j.data.product_id}`;
            }
        } catch(e) { msg = 'Chyba'; }
    }

    // Badge styles data for preview
    const badgeStyles = [
        { id: 'orbit', name: 'Orbit Core', desc: 'Gradient s orbitujúcim krúžkom', category: 'AI odporúča' },
        { id: 'gold', name: 'Zlatý gradient', desc: 'Najlepšia voľba badge', category: 'TOP 1' },
        { id: 'blue', name: 'Modrý gradient', desc: 'Obľúbený produkt badge', category: 'TOP 2-3' },
        { id: 'ribbon', name: 'Ribbon číslo', desc: 'Číslo pozície v kategórii', category: 'Rank 1-50' },
    ];
</script>

<svelte:head>
    <title>Badge nastavenia | Admin</title>
</svelte:head>

<div class="page">
    <div class="header">
        <h1>🏅 Badge nastavenia</h1>
        <p class="subtitle">Správa AI odporúčaní a badge štýlov na produktoch</p>
    </div>

    <div class="tabs">
        <button class="tab" class:active={activeTab === 'ai-recommended'} on:click={() => activeTab = 'ai-recommended'}>
            🤖 AI odporúča
        </button>
        <button class="tab" class:active={activeTab === 'badge-preview'} on:click={() => activeTab = 'badge-preview'}>
            🎨 Badge štýly
        </button>
        <button class="tab" class:active={activeTab === 'help'} on:click={() => activeTab = 'help'}>
            ℹ️ Ako to funguje
        </button>
    </div>

    {#if msg}
        <div class="alert">{msg}</div>
    {/if}

    {#if activeTab === 'ai-recommended'}
    <div class="section">
        <div class="section-header">
            <h2>AI odporúčané produkty</h2>
            <p>Jeden produkt v každej kategórii dostane exkluzívny "AI odporúča" badge. Aktuálne sa vyberá náhodne z top 10 produktov.</p>
        </div>

        {#if loading}
            <div class="loading">Načítavam kategórie...</div>
        {:else}
            <div class="cat-grid">
                {#each categories.slice(0, 50) as cat}
                    {@const recId = getRecommendedForCat(cat.id)}
                    <div class="cat-card">
                        <div class="cat-card__header">
                            <span class="cat-card__name">{cat.name}</span>
                            <span class="cat-card__count">{cat.product_count} produktov</span>
                        </div>
                        <div class="cat-card__body">
                            {#if recId}
                                <div class="cat-card__rec">
                                    <span class="cat-card__badge">
                                        <span class="ai-badge-mini">
                                            <svg viewBox="0 0 16 16" width="8" height="8" fill="#fff"><path d="M8 1l2.5 5 5.5.8-4 3.9.9 5.3L8 13.3l-4.9 2.7.9-5.3-4-3.9 5.5-.8z"/></svg>
                                        </span>
                                        AI
                                    </span>
                                    Produkt #{recId}
                                </div>
                            {:else}
                                <span class="cat-card__none">Žiadny</span>
                            {/if}
                        </div>
                        <button class="cat-card__btn" on:click={() => resetAiRecommended(cat.id)}>
                            🔄 Nový náhodný
                        </button>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
    {/if}

    {#if activeTab === 'badge-preview'}
    <div class="section">
        <div class="section-header">
            <h2>Aktuálne badge štýly</h2>
            <p>Prehľad všetkých badge štýlov zobrazovaných na produktoch.</p>
        </div>

        <div class="preview-grid">
            <!-- AI Orbit Core -->
            <div class="preview-card">
                <div class="preview-card__label">AI odporúča (Orbit Core)</div>
                <div class="preview-card__demo">
                    <span class="badge-demo badge-ai">
                        <span class="badge-ai__icon">
                            <svg viewBox="0 0 16 16" width="10" height="10" fill="#fff"><path d="M8 1l2.5 5 5.5.8-4 3.9.9 5.3L8 13.3l-4.9 2.7.9-5.3-4-3.9 5.5-.8z"/></svg>
                            <span class="badge-ai__orb"></span>
                        </span>
                        AI odporúča
                    </span>
                </div>
                <div class="preview-card__info">1 produkt per kategória. Gradient purple-blue s orbitujúcim krúžkom.</div>
            </div>

            <!-- Najlepšia voľba -->
            <div class="preview-card">
                <div class="preview-card__label">Najlepšia voľba (TOP 1)</div>
                <div class="preview-card__demo">
                    <span class="badge-demo badge-gold">Najlepšia voľba</span>
                </div>
                <div class="preview-card__info">Rank #1 v kategórii. Zlatý gradient.</div>
            </div>

            <!-- Obľúbený -->
            <div class="preview-card">
                <div class="preview-card__label">Obľúbený produkt (TOP 2-3)</div>
                <div class="preview-card__demo">
                    <span class="badge-demo badge-blue">Obľúbený produkt</span>
                </div>
                <div class="preview-card__info">Rank #2-3 v kategórii. Modrý gradient.</div>
            </div>

            <!-- Rank ribbon -->
            <div class="preview-card">
                <div class="preview-card__label">Rank číslo (1-50)</div>
                <div class="preview-card__demo" style="display:flex;gap:6px">
                    <span class="badge-demo badge-rank badge-rank--gold">1</span>
                    <span class="badge-demo badge-rank badge-rank--blue">5</span>
                    <span class="badge-demo badge-rank badge-rank--gray">25</span>
                </div>
                <div class="preview-card__info">Pozícia produktu v rebríčku kategórie.</div>
            </div>
        </div>
    </div>
    {/if}

    {#if activeTab === 'help'}
    <div class="section">
        <div class="section-header">
            <h2>Ako fungujú badges</h2>
        </div>
        <div class="help-content">
            <div class="help-block">
                <h3>🤖 AI odporúča</h3>
                <p>Exkluzívny badge pre <strong>1 produkt</strong> v každej listovej kategórii. Aktuálne sa vyberá náhodne z top 10 produktov podľa ranking score. V budúcnosti bude AI (OpenAI) analyzovať produkty a inteligentne vyberať najlepší produkt na odporúčanie.</p>
                <p>Badge sa zobrazuje na kategórii (list aj grid view) aj na detaile produktu.</p>
            </div>
            <div class="help-block">
                <h3>⭐ Najlepšia voľba / Obľúbený</h3>
                <p>Automaticky sa priraďujú podľa poradia v kategórii. #1 = Najlepšia voľba (zlatý), #2-3 = Obľúbený (modrý). Poradie závisí od ranking score, počtu ponúk a popularity.</p>
            </div>
            <div class="help-block">
                <h3>🧠 AI Recenzie</h3>
                <p>Keď zákazník klikne na záložku "Recenzie", automaticky sa vygeneruje AI recenzia s hodnotením, kladmi, zápormi a verdiktom. Recenzia sa <strong>uloží do databázy</strong> pri prvom generovaní — ďalšie zobrazenia nepoužívajú API kredity.</p>
            </div>
            <div class="help-block">
                <h3>💬 AI Asistent</h3>
                <p>Na detaile produktu funguje AI chat. Zákazník môže kliknúť na rýchle tlačidlá (Viac o produkte, Pre koho?, Oplatí sa?) alebo napísať vlastnú otázku. AI dostane kontext produktu (názov, kategóriu, cenu, popis) a odpovie v slovenčine.</p>
            </div>
        </div>
    </div>
    {/if}
</div>

<style>
.page { max-width: 1000px; margin: 0 auto; padding: 0 16px; }
.header { margin: 0 0 24px; }
.header h1 { font-size: 22px; font-weight: 700; color: #1f2937; margin: 0 0 4px; }
.subtitle { font-size: 14px; color: #6b7280; margin: 0; }

.tabs { display: flex; gap: 4px; margin: 0 0 20px; border-bottom: 1px solid #e5e7eb; }
.tab { padding: 10px 16px; font-size: 13px; font-weight: 500; color: #6b7280; border: none; background: none; cursor: pointer; border-bottom: 2px solid transparent; transition: all .15s; }
.tab:hover { color: #374151; }
.tab.active { color: #7c3aed; border-bottom-color: #7c3aed; }

.alert { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin: 0 0 16px; }

.section-header { margin: 0 0 16px; }
.section-header h2 { font-size: 17px; font-weight: 600; color: #1f2937; margin: 0 0 4px; }
.section-header p { font-size: 13px; color: #6b7280; margin: 0; line-height: 1.5; }

.loading { text-align: center; padding: 40px 0; color: #6b7280; font-size: 14px; }

/* Category grid */
.cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
.cat-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; transition: border-color .15s; }
.cat-card:hover { border-color: #c4b5fd; }
.cat-card__header { display: flex; justify-content: space-between; align-items: center; margin: 0 0 8px; }
.cat-card__name { font-size: 13px; font-weight: 600; color: #1f2937; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
.cat-card__count { font-size: 11px; color: #9ca3af; flex-shrink: 0; margin-left: 8px; }
.cat-card__body { margin: 0 0 8px; }
.cat-card__rec { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #374151; }
.cat-card__badge { display: inline-flex; align-items: center; gap: 3px; font-size: 9px; font-weight: 600; padding: 2px 6px 2px 3px; border-radius: 8px; background: linear-gradient(135deg, #7c3aed, #3b82f6); color: #fff; }
.ai-badge-mini { width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; }
.cat-card__none { font-size: 12px; color: #d1d5db; }
.cat-card__btn { display: block; width: 100%; padding: 6px; font-size: 11px; font-weight: 500; border: 1px solid #e5e7eb; background: #fafafa; color: #6b7280; border-radius: 6px; cursor: pointer; transition: all .15s; }
.cat-card__btn:hover { background: #f3f0ff; border-color: #c4b5fd; color: #7c3aed; }

/* Preview cards */
.preview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
.preview-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; }
.preview-card__label { font-size: 12px; font-weight: 600; color: #374151; margin: 0 0 12px; }
.preview-card__demo { padding: 16px; background: #f9fafb; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin: 0 0 10px; }
.preview-card__info { font-size: 11px; color: #9ca3af; line-height: 1.4; }

/* Badge demos */
.badge-demo { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 20px; white-space: nowrap; }
.badge-ai { padding: 4px 12px 4px 6px; border-radius: 12px; border: 1px solid #e9d5ff; background: linear-gradient(135deg, #7c3aed, #3b82f6); color: #fff; }
.badge-ai__icon { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; position: relative; }
.badge-ai__orb { position: absolute; width: 16px; height: 16px; border: 1.5px dashed rgba(255,255,255,0.4); border-radius: 50%; animation: orb 4s linear infinite; }
@keyframes orb { to { transform: rotate(360deg); } }
.badge-gold { background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; }
.badge-blue { background: linear-gradient(135deg, #3b82f6, #60a5fa); color: #fff; }
.badge-rank { min-width: 26px; height: 24px; padding: 0 8px; font-weight: 800; font-size: 12px; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
.badge-rank--gold { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #78350f; }
.badge-rank--blue { background: linear-gradient(135deg, #60a5fa, #3b82f6); color: #fff; }
.badge-rank--gray { background: #e2e8f0; color: #64748b; }

/* Help */
.help-content { display: flex; flex-direction: column; gap: 16px; }
.help-block { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; }
.help-block h3 { font-size: 14px; font-weight: 600; color: #1f2937; margin: 0 0 6px; }
.help-block p { font-size: 13px; color: #4b5563; line-height: 1.6; margin: 0 0 4px; }
.help-block p:last-child { margin: 0; }
.help-block strong { font-weight: 600; color: #1f2937; }
</style>
