<script>
    import { adminFetch, adminRawFetch, API_BASE } from '$lib/adminApi.js';
    import { onMount } from 'svelte';

    let products = [], loading = true, total = 0, page = 1, pages = 1;
    let totalViews = 0, totalClicks = 0, avgScore = 0;
    let sortBy = 'ranking_score', search = '', categoryFilter = '';
    let categories = [], leafCategories = [];
    
    // Ranking settings
    let rankingMode = 'views';
    let rankingModes = [];
    let recalculating = false;
    let recalcMessage = '';
    let showSettings = false;

    // Per-category stats
    let categoryStats = null;
    let loadingCatStats = false;

    onMount(() => { loadAll(); });

    async function loadAll() {
        await Promise.all([loadStats(), loadRankingSettings(), loadCategories()]);
    }

    async function loadStats() {
        loading = true;
        const params = new URLSearchParams({ page, limit: 50, sort: sortBy });
        if (search) params.set('search', search);
        if (categoryFilter) params.set('category', categoryFilter);
        try {
            const res = await adminRawFetch(API_BASE + '/admin/product-stats?' + params);
            const data = await res.json();
            if (data?.data) {
                products = data.data.products || [];
                total = data.data.total || 0;
                pages = data.data.pages || 1;
                totalViews = data.data.total_views || 0;
                totalClicks = data.data.total_clicks || 0;
                avgScore = data.data.avg_score || 0;
            }
        } catch (e) { console.error(e); }
        loading = false;
    }

    async function loadRankingSettings() {
        try {
            const res = await adminRawFetch(API_BASE + '/admin/ranking-settings');
            const data = await res.json();
            if (data?.data) {
                rankingMode = data.data.mode || 'views';
                rankingModes = data.data.modes || [];
            }
        } catch (e) { console.error(e); }
    }

    async function loadCategories() {
        try {
            const res = await adminRawFetch(API_BASE + '/admin/categories?limit=999');
            const data = await res.json();
            const all = data?.data?.categories || data?.data || [];
            categories = all;
            // Build leaf detection
            const parentIds = new Set(all.filter(c => c.parent_id).map(c => c.parent_id));
            leafCategories = all.filter(c => !parentIds.has(c.id) && c.product_count > 0);
        } catch (e) { console.error(e); }
    }

    async function saveRankingMode() {
        recalculating = true;
        recalcMessage = '';
        try {
            const res = await adminRawFetch(API_BASE + '/admin/ranking-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: rankingMode })
            });
            const data = await res.json();
            recalcMessage = data.message || 'Hotovo';
            await loadStats();
        } catch (e) { recalcMessage = 'Chyba: ' + e.message; }
        recalculating = false;
    }

    async function recalculate() {
        recalculating = true;
        recalcMessage = '';
        try {
            const res = await adminRawFetch(API_BASE + '/admin/recalculate-rankings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: rankingMode })
            });
            const data = await res.json();
            recalcMessage = data.message || 'Hotovo';
            await loadStats();
        } catch (e) { recalcMessage = 'Chyba: ' + e.message; }
        recalculating = false;
    }

    function applyFilters() { page = 1; loadStats(); }
    function goPage(p) { page = p; loadStats(); }
    function setSort(s) { sortBy = s; page = 1; loadStats(); }

    function getRankBadge(rank) {
        if (rank === 1) return { cls: 'rank--gold', label: '①', icon: '👑' };
        if (rank === 2) return { cls: 'rank--silver', label: '②', icon: '🥈' };
        if (rank === 3) return { cls: 'rank--bronze', label: '③', icon: '🥉' };
        if (rank <= 10) return { cls: 'rank--hot', label: `#${rank}`, icon: '🔥' };
        if (rank <= 25) return { cls: 'rank--warm', label: `#${rank}`, icon: '' };
        return { cls: 'rank--normal', label: `#${rank}`, icon: '' };
    }

    function formatNum(n) {
        if (!n) return '0';
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
        return n.toString();
    }

    function getCTR(views, clicks) {
        if (!views || views === 0) return '0%';
        return ((clicks / views) * 100).toFixed(1) + '%';
    }

    $: globalCTR = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0';
    $: selectedModeName = rankingModes.find(m => m.id === rankingMode)?.name || rankingMode;
</script>

<div class="top-page">
    <!-- HEADER -->
    <div class="top-header">
        <div class="top-header__left">
            <h1>📊 Rebríčky produktov</h1>
            <p>Pozícia produktov v koncových kategóriách na základe reálnych štatistík</p>
        </div>
        <div class="top-header__actions">
            <button class="btn btn--outline" on:click={() => showSettings = !showSettings}>
                ⚙️ Nastavenia rebríčkov
            </button>
            <button class="btn btn--primary" on:click={recalculate} disabled={recalculating}>
                {recalculating ? '⏳ Prepočítavam...' : '🔄 Prepočítať rebríčky'}
            </button>
        </div>
    </div>

    <!-- SETTINGS PANEL -->
    {#if showSettings}
        <div class="settings-panel">
            <h3>Nastavenia rebríčkov</h3>
            <p class="settings-desc">Vyberte metódu podľa ktorej sa zoraďujú produkty v koncových kategóriách (1-50).</p>
            <div class="mode-grid">
                {#each rankingModes as mode}
                    <button class="mode-card" class:active={rankingMode === mode.id} on:click={() => rankingMode = mode.id}>
                        <div class="mode-card__icon">
                            {#if mode.id === 'views'}👁️
                            {:else if mode.id === 'clicks'}🖱️
                            {:else if mode.id === 'ctr'}📈
                            {:else}⚡{/if}
                        </div>
                        <div class="mode-card__name">{mode.name}</div>
                        <div class="mode-card__desc">{mode.description}</div>
                        {#if rankingMode === mode.id}
                            <div class="mode-card__check">✓</div>
                        {/if}
                    </button>
                {/each}
            </div>
            <div class="settings-actions">
                <button class="btn btn--primary" on:click={saveRankingMode} disabled={recalculating}>
                    {recalculating ? '⏳ Ukladám...' : '💾 Uložiť a prepočítať'}
                </button>
                {#if recalcMessage}
                    <span class="settings-msg">{recalcMessage}</span>
                {/if}
            </div>
        </div>
    {/if}

    <!-- STATS CARDS -->
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-card__icon">👁️</div>
            <div class="stat-card__data">
                <div class="stat-card__val">{formatNum(totalViews)}</div>
                <div class="stat-card__label">Celkom zobrazení</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-card__icon">🖱️</div>
            <div class="stat-card__data">
                <div class="stat-card__val">{formatNum(totalClicks)}</div>
                <div class="stat-card__label">Prekliky na eshopy</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-card__icon">📈</div>
            <div class="stat-card__data">
                <div class="stat-card__val">{globalCTR}%</div>
                <div class="stat-card__label">Konverzný pomer (CTR)</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-card__icon">⚡</div>
            <div class="stat-card__data">
                <div class="stat-card__val">{avgScore}</div>
                <div class="stat-card__label">Priemerné skóre</div>
            </div>
        </div>
        <div class="stat-card stat-card--mode">
            <div class="stat-card__icon">🏆</div>
            <div class="stat-card__data">
                <div class="stat-card__val">{selectedModeName}</div>
                <div class="stat-card__label">Aktívny rebríček</div>
            </div>
        </div>
    </div>

    <!-- FILTERS -->
    <div class="filters">
        <div class="filters__search">
            <input type="text" placeholder="Hľadať produkt..." bind:value={search} on:keydown={(e) => e.key === 'Enter' && applyFilters()}>
        </div>
        <div class="filters__cat">
            <select bind:value={categoryFilter} on:change={applyFilters}>
                <option value="">Všetky kategórie</option>
                <optgroup label="── Koncové kategórie ──">
                    {#each leafCategories.sort((a,b) => a.name.localeCompare(b.name)) as cat}
                        <option value={cat.slug}>{cat.name} ({cat.product_count})</option>
                    {/each}
                </optgroup>
            </select>
        </div>
        <div class="filters__sort">
            <select bind:value={sortBy} on:change={applyFilters}>
                <option value="ranking_score">🏆 Podľa skóre</option>
                <option value="views">👁️ Podľa zobrazení</option>
                <option value="clicks">🖱️ Podľa preklikov</option>
                <option value="ctr">📈 Podľa CTR</option>
                <option value="newest">🕐 Najnovšie</option>
                <option value="offers">🏪 Podľa počtu ponúk</option>
            </select>
        </div>
        <button class="btn btn--sm" on:click={applyFilters}>Filtrovať</button>
    </div>

    <!-- RESULTS INFO -->
    <div class="results-info">
        <span>{total} produktov</span>
        {#if categoryFilter}
            <span class="results-info__cat">v kategórii: <strong>{categoryFilter}</strong></span>
        {/if}
    </div>

    <!-- TABLE -->
    {#if loading}
        <div class="loading">Načítavam rebríčky...</div>
    {:else if products.length === 0}
        <div class="empty">Žiadne produkty s aktívnymi ponukami.</div>
    {:else}
        <div class="table-wrap">
            <table class="top-table">
                <thead>
                    <tr>
                        <th class="th-rank">Pozícia</th>
                        <th class="th-product">Produkt</th>
                        <th class="th-cat">Kategória</th>
                        <th class="th-num" on:click={() => setSort('views')}>
                            👁️ Zobrazenia
                            {#if sortBy === 'views'}<span class="sort-arrow">▼</span>{/if}
                        </th>
                        <th class="th-num" on:click={() => setSort('clicks')}>
                            🖱️ Prekliky
                            {#if sortBy === 'clicks'}<span class="sort-arrow">▼</span>{/if}
                        </th>
                        <th class="th-num" on:click={() => setSort('ctr')}>
                            📈 CTR
                            {#if sortBy === 'ctr'}<span class="sort-arrow">▼</span>{/if}
                        </th>
                        <th class="th-num" on:click={() => setSort('ranking_score')}>
                            ⚡ Skóre
                            {#if sortBy === 'ranking_score'}<span class="sort-arrow">▼</span>{/if}
                        </th>
                        <th class="th-num">Ponuky</th>
                        <th class="th-price">Cena</th>
                    </tr>
                </thead>
                <tbody>
                    {#each products as product}
                        {@const badge = getRankBadge(product.rank)}
                        <tr class="top-row {badge.cls}">
                            <td class="td-rank">
                                <div class="rank-badge {badge.cls}">
                                    {#if badge.icon}<span class="rank-icon">{badge.icon}</span>{/if}
                                    <span class="rank-num">{product.rank}</span>
                                </div>
                            </td>
                            <td class="td-product">
                                <div class="product-cell">
                                    <div class="product-cell__img">
                                        {#if product.image_url}
                                            <img src={product.image_url} alt="" loading="lazy">
                                        {:else}
                                            <span>📦</span>
                                        {/if}
                                    </div>
                                    <div class="product-cell__info">
                                        <a href="/produkt/{product.slug}" target="_blank" class="product-cell__title">{product.title}</a>
                                        {#if product.brand}
                                            <span class="product-cell__brand">{product.brand}</span>
                                        {/if}
                                    </div>
                                </div>
                            </td>
                            <td class="td-cat">
                                <span class="cat-badge">{product.category_name}</span>
                            </td>
                            <td class="td-num">
                                <div class="stat-val">{formatNum(product.view_count)}</div>
                                <div class="stat-bar">
                                    <div class="stat-bar__fill stat-bar__fill--views" style="width: {Math.min(100, (product.view_count / Math.max(products[0]?.view_count || 1, 1)) * 100)}%"></div>
                                </div>
                            </td>
                            <td class="td-num">
                                <div class="stat-val">{formatNum(product.click_count)}</div>
                                <div class="stat-bar">
                                    <div class="stat-bar__fill stat-bar__fill--clicks" style="width: {Math.min(100, (product.click_count / Math.max(products[0]?.click_count || 1, 1)) * 100)}%"></div>
                                </div>
                            </td>
                            <td class="td-num">
                                <div class="stat-val" class:stat-val--hot={product.ctr > 5}>{product.ctr}%</div>
                            </td>
                            <td class="td-num">
                                <div class="stat-val stat-val--score">{product.ranking_score?.toFixed(1) || 0}</div>
                            </td>
                            <td class="td-num">
                                <span class="offers-badge">{product.offer_count}</span>
                            </td>
                            <td class="td-price">
                                {#if product.price_min > 0}
                                    <span class="price">{product.price_min.toFixed(2)} €</span>
                                {/if}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <!-- PAGINATION -->
        {#if pages > 1}
            <div class="pagination">
                <button disabled={page <= 1} on:click={() => goPage(page - 1)}>← Predch.</button>
                <span>{page} / {pages}</span>
                <button disabled={page >= pages} on:click={() => goPage(page + 1)}>Ďalšia →</button>
            </div>
        {/if}
    {/if}
</div>

<style>
    .top-page { max-width: 1400px; margin: 0 auto; }
    
    /* HEADER */
    .top-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .top-header h1 { font-size: 24px; font-weight: 700; color: #1e293b; margin: 0; }
    .top-header p { font-size: 14px; color: #64748b; margin: 4px 0 0; }
    .top-header__actions { display: flex; gap: 8px; }
    
    /* BUTTONS */
    .btn { padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; }
    .btn--primary { background: #3b82f6; color: #fff; }
    .btn--primary:hover { background: #2563eb; }
    .btn--primary:disabled { background: #93c5fd; cursor: wait; }
    .btn--outline { background: #fff; color: #475569; border: 1px solid #e2e8f0; }
    .btn--outline:hover { background: #f8fafc; border-color: #cbd5e1; }
    .btn--sm { padding: 6px 12px; font-size: 12px; background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; border-radius: 6px; }
    .btn--sm:hover { background: #e2e8f0; }

    /* SETTINGS PANEL */
    .settings-panel { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .settings-panel h3 { font-size: 16px; font-weight: 700; margin: 0 0 4px; }
    .settings-desc { font-size: 13px; color: #64748b; margin: 0 0 16px; }
    .mode-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 16px; }
    .mode-card { position: relative; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 10px; padding: 16px; text-align: left; cursor: pointer; transition: all 0.15s; }
    .mode-card:hover { border-color: #93c5fd; background: #eff6ff; }
    .mode-card.active { border-color: #3b82f6; background: #eff6ff; }
    .mode-card__icon { font-size: 24px; margin-bottom: 8px; }
    .mode-card__name { font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
    .mode-card__desc { font-size: 12px; color: #64748b; line-height: 1.4; }
    .mode-card__check { position: absolute; top: 10px; right: 10px; width: 22px; height: 22px; background: #3b82f6; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
    .settings-actions { display: flex; align-items: center; gap: 12px; }
    .settings-msg { font-size: 13px; color: #059669; font-weight: 500; }

    /* STATS CARDS */
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 24px; }
    .stat-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; display: flex; align-items: center; gap: 12px; }
    .stat-card__icon { font-size: 28px; }
    .stat-card__val { font-size: 22px; font-weight: 800; color: #1e293b; }
    .stat-card__label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; font-weight: 500; }
    .stat-card--mode { background: linear-gradient(135deg, #eff6ff, #dbeafe); border-color: #93c5fd; }

    /* FILTERS */
    .filters { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
    .filters__search input { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; width: 240px; }
    .filters__search input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
    .filters__cat select, .filters__sort select { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; background: #fff; cursor: pointer; }

    .results-info { font-size: 13px; color: #64748b; margin-bottom: 12px; display: flex; gap: 8px; align-items: center; }
    .results-info__cat { background: #eff6ff; color: #3b82f6; padding: 2px 8px; border-radius: 4px; font-size: 12px; }

    /* TABLE */
    .table-wrap { overflow-x: auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; }
    .top-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .top-table thead { background: #f8fafc; border-bottom: 2px solid #e2e8f0; }
    .top-table th { padding: 10px 12px; text-align: left; font-weight: 600; color: #475569; font-size: 12px; white-space: nowrap; cursor: pointer; user-select: none; }
    .top-table th:hover { color: #1e293b; }
    .th-rank { width: 70px; text-align: center; }
    .th-num { text-align: center; }
    .th-cat { width: 140px; }
    .th-price { width: 100px; text-align: right; }
    .sort-arrow { color: #3b82f6; font-size: 10px; }
    
    .top-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    .top-row:hover { background: #fafbfd; }
    .top-row.rank--gold { background: linear-gradient(90deg, #fffbeb 0%, transparent 40%); }
    .top-row.rank--silver { background: linear-gradient(90deg, #f8fafc 0%, transparent 40%); }
    .top-row.rank--bronze { background: linear-gradient(90deg, #fef3e1 0%, transparent 40%); }

    /* RANK BADGE */
    .td-rank { text-align: center; }
    .rank-badge { display: inline-flex; flex-direction: column; align-items: center; gap: 1px; min-width: 36px; }
    .rank-icon { font-size: 16px; line-height: 1; }
    .rank-num { font-size: 16px; font-weight: 800; }
    .rank-badge.rank--gold .rank-num { color: #d97706; }
    .rank-badge.rank--silver .rank-num { color: #6b7280; }
    .rank-badge.rank--bronze .rank-num { color: #b45309; }
    .rank-badge.rank--hot .rank-num { color: #ef4444; font-size: 14px; }
    .rank-badge.rank--warm .rank-num { color: #f59e0b; font-size: 14px; }
    .rank-badge.rank--normal .rank-num { color: #94a3b8; font-size: 13px; }

    /* PRODUCT CELL */
    .product-cell { display: flex; align-items: center; gap: 10px; }
    .product-cell__img { width: 44px; height: 44px; border-radius: 6px; overflow: hidden; background: #f1f5f9; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
    .product-cell__img img { width: 100%; height: 100%; object-fit: contain; }
    .product-cell__img span { font-size: 18px; }
    .product-cell__title { font-weight: 600; color: #1e293b; text-decoration: none; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 13px; line-height: 1.3; }
    .product-cell__title:hover { color: #3b82f6; }
    .product-cell__brand { font-size: 11px; color: #94a3b8; display: block; margin-top: 2px; }

    .cat-badge { font-size: 11px; background: #f1f5f9; color: #64748b; padding: 2px 8px; border-radius: 4px; white-space: nowrap; }

    /* STAT CELLS */
    .td-num { text-align: center; }
    .stat-val { font-weight: 700; font-size: 13px; color: #1e293b; }
    .stat-val--hot { color: #ef4444; }
    .stat-val--score { color: #8b5cf6; }
    .stat-bar { width: 60px; height: 4px; background: #f1f5f9; border-radius: 2px; margin: 3px auto 0; }
    .stat-bar__fill { height: 100%; border-radius: 2px; transition: width 0.3s; }
    .stat-bar__fill--views { background: linear-gradient(90deg, #93c5fd, #3b82f6); }
    .stat-bar__fill--clicks { background: linear-gradient(90deg, #86efac, #22c55e); }

    .offers-badge { display: inline-block; background: #f0fdf4; color: #16a34a; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 12px; }
    .price { font-weight: 700; color: #1e293b; white-space: nowrap; }

    /* PAGINATION */
    .pagination { display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 16px; padding: 12px; }
    .pagination button { padding: 6px 14px; border: 1px solid #e2e8f0; background: #fff; border-radius: 6px; cursor: pointer; font-size: 13px; }
    .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
    .pagination button:hover:not(:disabled) { background: #f1f5f9; }
    .pagination span { font-size: 13px; color: #64748b; }

    /* STATES */
    .loading, .empty { text-align: center; padding: 60px 20px; color: #94a3b8; font-size: 14px; }

    @media (max-width: 768px) {
        .top-header { flex-direction: column; }
        .stats-grid { grid-template-columns: repeat(2, 1fr); }
        .filters { flex-direction: column; }
        .filters__search input { width: 100%; }
    }
</style>
