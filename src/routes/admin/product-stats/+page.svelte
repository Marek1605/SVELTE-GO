<script>
    import { adminFetch, adminRawFetch, API_BASE } from '$lib/adminApi.js';
    import { onMount } from 'svelte';

    let products = [], loading = true, total = 0, page = 1, pages = 1;
    let totalViews = 0, totalClicks = 0, avgScore = 0;
    let sortBy = 'ranking_score', search = '', categoryFilter = '';
    let categories = [];
    
    // Ranking settings
    let rankingMode = 'views';
    let rankingModes = [];
    let recalculating = false;
    let recalcMessage = '';

    onMount(() => { loadStats(); loadRankingSettings(); loadCategories(); });

    async function loadStats() {
        loading = true;
        const params = new URLSearchParams({ page, limit: 30, sort: sortBy });
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
        } catch (e) {}
    }

    async function loadCategories() {
        try {
            const res = await adminRawFetch(API_BASE + '/admin/categories?limit=200');
            const data = await res.json();
            categories = data?.data?.items || data?.data || [];
        } catch (e) {}
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
            recalcMessage = data.message || 'Hotovo!';
            await loadStats();
        } catch (e) { recalcMessage = 'Chyba: ' + e.message; }
        recalculating = false;
    }

    async function recalculateRankings() {
        recalculating = true;
        recalcMessage = '';
        try {
            const res = await adminRawFetch(API_BASE + '/admin/recalculate-rankings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: rankingMode })
            });
            const data = await res.json();
            recalcMessage = data.message || 'Hotovo!';
            await loadStats();
        } catch (e) { recalcMessage = 'Chyba: ' + e.message; }
        recalculating = false;
    }

    function changePage(p) { page = p; loadStats(); }
    function changeSort(s) { sortBy = s; page = 1; loadStats(); }
    function doSearch() { page = 1; loadStats(); }

    function formatNum(n) { return (n || 0).toLocaleString('sk-SK'); }
    function formatCtr(v, c) { return v > 0 ? ((c / v) * 100).toFixed(1) + '%' : '—'; }
</script>

<svelte:head><title>TOP & Štatistiky | Admin</title></svelte:head>

<div class="ps">
    <div class="ps__head">
        <h1>📊 TOP Produkty & Štatistiky</h1>
        <p>Zobrazenia, prekliky, konverzie a ranking produktov</p>
    </div>

    <!-- Summary cards -->
    <div class="ps__cards">
        <div class="ps__card">
            <span class="ps__card-icon">👁️</span>
            <div>
                <span class="ps__card-val">{formatNum(totalViews)}</span>
                <span class="ps__card-label">Celkom zobrazení</span>
            </div>
        </div>
        <div class="ps__card">
            <span class="ps__card-icon">🖱️</span>
            <div>
                <span class="ps__card-val">{formatNum(totalClicks)}</span>
                <span class="ps__card-label">Celkom preklikov</span>
            </div>
        </div>
        <div class="ps__card">
            <span class="ps__card-icon">📈</span>
            <div>
                <span class="ps__card-val">{totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0'}%</span>
                <span class="ps__card-label">Priemerné CTR</span>
            </div>
        </div>
        <div class="ps__card">
            <span class="ps__card-icon">🏆</span>
            <div>
                <span class="ps__card-val">{formatNum(total)}</span>
                <span class="ps__card-label">Aktívnych produktov</span>
            </div>
        </div>
    </div>

    <!-- Ranking mode selector -->
    <div class="ps__ranking">
        <h2>🎯 Ranking mód</h2>
        <div class="ps__modes">
            {#each rankingModes as mode}
                <label class="ps__mode" class:active={rankingMode === mode.id}>
                    <input type="radio" name="mode" value={mode.id} bind:group={rankingMode}>
                    <span class="ps__mode-name">{mode.name}</span>
                    <span class="ps__mode-desc">{mode.description}</span>
                </label>
            {/each}
        </div>
        <div class="ps__ranking-actions">
            <button class="ps__btn ps__btn--primary" on:click={saveRankingMode} disabled={recalculating}>
                {recalculating ? '⏳ Prepočítavam...' : '💾 Uložiť a prepočítať'}
            </button>
            <button class="ps__btn" on:click={recalculateRankings} disabled={recalculating}>
                🔄 Len prepočítať
            </button>
            {#if recalcMessage}
                <span class="ps__msg">{recalcMessage}</span>
            {/if}
        </div>
    </div>

    <!-- Filters -->
    <div class="ps__filters">
        <input type="text" placeholder="Hľadať produkt..." bind:value={search} on:keydown={(e) => e.key === 'Enter' && doSearch()}>
        <select bind:value={categoryFilter} on:change={doSearch}>
            <option value="">Všetky kategórie</option>
            {#each categories as cat}
                <option value={cat.slug}>{cat.name}</option>
            {/each}
        </select>
        <button class="ps__btn" on:click={doSearch}>🔍 Hľadať</button>
    </div>

    <!-- Sort tabs -->
    <div class="ps__sort-tabs">
        <button class:active={sortBy === 'ranking_score'} on:click={() => changeSort('ranking_score')}>🏆 Ranking</button>
        <button class:active={sortBy === 'views'} on:click={() => changeSort('views')}>👁️ Zobrazenia</button>
        <button class:active={sortBy === 'clicks'} on:click={() => changeSort('clicks')}>🖱️ Prekliky</button>
        <button class:active={sortBy === 'ctr'} on:click={() => changeSort('ctr')}>📈 CTR</button>
        <button class:active={sortBy === 'offers'} on:click={() => changeSort('offers')}>🏪 Ponuky</button>
        <button class:active={sortBy === 'newest'} on:click={() => changeSort('newest')}>🕐 Najnovšie</button>
    </div>

    <!-- Product table -->
    {#if loading}
        <div class="ps__loading">Načítavam...</div>
    {:else}
        <div class="ps__table-wrap">
            <table class="ps__table">
                <thead>
                    <tr>
                        <th class="ps__th--rank">#</th>
                        <th>Produkt</th>
                        <th class="ps__th--cat">Kategória</th>
                        <th class="ps__th--num">Zobrazenia</th>
                        <th class="ps__th--num">Prekliky</th>
                        <th class="ps__th--num">CTR</th>
                        <th class="ps__th--num">Ponuky</th>
                        <th class="ps__th--num">Skóre</th>
                    </tr>
                </thead>
                <tbody>
                    {#each products as p, i}
                        <tr class="ps__row" class:ps__row--top={p.rank <= 3}>
                            <td class="ps__rank">
                                {#if p.rank === 1}
                                    <span class="ps__medal ps__medal--1">🥇</span>
                                {:else if p.rank === 2}
                                    <span class="ps__medal ps__medal--2">🥈</span>
                                {:else if p.rank === 3}
                                    <span class="ps__medal ps__medal--3">🥉</span>
                                {:else}
                                    <span class="ps__rank-num">{p.rank}</span>
                                {/if}
                            </td>
                            <td class="ps__product">
                                <div class="ps__product-inner">
                                    {#if p.image_url}
                                        <img src={p.image_url} alt="" class="ps__thumb">
                                    {:else}
                                        <div class="ps__thumb-empty">📦</div>
                                    {/if}
                                    <div>
                                        <a href="/produkt/{p.slug}" target="_blank" class="ps__title">{p.title}</a>
                                        {#if p.brand}<span class="ps__brand">{p.brand}</span>{/if}
                                        <span class="ps__price">{p.price_min?.toFixed(2) || '0.00'} €</span>
                                    </div>
                                </div>
                            </td>
                            <td class="ps__cat">{p.category_name}</td>
                            <td class="ps__num">{formatNum(p.view_count)}</td>
                            <td class="ps__num">{formatNum(p.click_count)}</td>
                            <td class="ps__num ps__ctr">{formatCtr(p.view_count, p.click_count)}</td>
                            <td class="ps__num">{p.offer_count}</td>
                            <td class="ps__num ps__score">{p.ranking_score?.toFixed(1)}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        {#if pages > 1}
            <div class="ps__pag">
                <button disabled={page <= 1} on:click={() => changePage(page - 1)}>‹</button>
                <span>Strana {page} z {pages} ({formatNum(total)} produktov)</span>
                <button disabled={page >= pages} on:click={() => changePage(page + 1)}>›</button>
            </div>
        {/if}
    {/if}
</div>

<style>
.ps { padding: 0; }
.ps__head { margin-bottom: 24px; }
.ps__head h1 { font-size: 24px; font-weight: 800; margin: 0 0 4px; }
.ps__head p { color: #6b7280; font-size: 14px; margin: 0; }

/* Summary cards */
.ps__cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
.ps__card { display: flex; align-items: center; gap: 12px; padding: 16px; background: #fff; border: 1px solid #eef0f4; border-radius: 12px; }
.ps__card-icon { font-size: 28px; }
.ps__card-val { font-size: 22px; font-weight: 800; color: #111; display: block; }
.ps__card-label { font-size: 12px; color: #6b7280; }

/* Ranking mode */
.ps__ranking { background: #fff; border: 1px solid #eef0f4; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
.ps__ranking h2 { font-size: 16px; font-weight: 700; margin: 0 0 12px; }
.ps__modes { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 16px; }
.ps__mode { display: flex; flex-direction: column; gap: 2px; padding: 12px 16px; border: 2px solid #eef0f4; border-radius: 10px; cursor: pointer; transition: all 0.15s; }
.ps__mode:hover { border-color: #c4956a; }
.ps__mode.active { border-color: #c4956a; background: #fef7f0; }
.ps__mode input { display: none; }
.ps__mode-name { font-size: 14px; font-weight: 700; color: #1f2937; }
.ps__mode-desc { font-size: 12px; color: #6b7280; }
.ps__ranking-actions { display: flex; align-items: center; gap: 8px; }
.ps__btn { padding: 8px 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
.ps__btn:hover { border-color: #c4956a; }
.ps__btn--primary { background: #c4956a; color: #fff; border-color: #c4956a; }
.ps__btn--primary:hover { background: #b8875c; }
.ps__btn:disabled { opacity: 0.5; cursor: not-allowed; }
.ps__msg { font-size: 13px; color: #16a34a; font-weight: 500; }

/* Filters */
.ps__filters { display: flex; gap: 8px; margin-bottom: 16px; }
.ps__filters input, .ps__filters select { padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; }
.ps__filters input { flex: 1; max-width: 300px; }

/* Sort tabs */
.ps__sort-tabs { display: flex; gap: 4px; margin-bottom: 16px; border-bottom: 2px solid #f3f4f6; padding-bottom: 0; }
.ps__sort-tabs button { padding: 8px 14px; border: none; background: none; font-size: 13px; font-weight: 600; color: #6b7280; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.15s; }
.ps__sort-tabs button:hover { color: #c4956a; }
.ps__sort-tabs button.active { color: #c4956a; border-bottom-color: #c4956a; }

/* Table */
.ps__table-wrap { overflow-x: auto; background: #fff; border: 1px solid #eef0f4; border-radius: 12px; }
.ps__table { width: 100%; border-collapse: collapse; font-size: 13px; }
.ps__table thead { background: #f8f9fb; }
.ps__table th { padding: 10px 14px; text-align: left; font-weight: 600; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #eef0f4; white-space: nowrap; }
.ps__th--rank { width: 50px; text-align: center; }
.ps__th--num { width: 90px; text-align: right; }
.ps__th--cat { width: 150px; }

.ps__row { border-bottom: 1px solid #f3f4f6; transition: background 0.1s; }
.ps__row:hover { background: #fafbfc; }
.ps__row--top { background: #fffbf7; }

.ps__rank { text-align: center; vertical-align: middle; padding: 8px; }
.ps__medal { font-size: 22px; }
.ps__rank-num { font-size: 14px; font-weight: 700; color: #9ca3af; }

.ps__product { padding: 8px 14px; }
.ps__product-inner { display: flex; align-items: center; gap: 10px; }
.ps__thumb { width: 40px; height: 40px; border-radius: 6px; object-fit: contain; background: #f9fafb; flex-shrink: 0; }
.ps__thumb-empty { width: 40px; height: 40px; border-radius: 6px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.ps__title { font-size: 13px; font-weight: 600; color: #1f2937; display: block; max-width: 350px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ps__title:hover { color: #c4956a; }
.ps__brand { font-size: 10px; color: #9ca3af; text-transform: uppercase; }
.ps__price { font-size: 12px; font-weight: 700; color: #374151; }
.ps__cat { padding: 8px 14px; color: #6b7280; font-size: 12px; }
.ps__num { padding: 8px 14px; text-align: right; font-weight: 600; color: #374151; }
.ps__ctr { color: #c4956a; }
.ps__score { color: #16a34a; font-weight: 800; }

.ps__loading { text-align: center; padding: 40px; color: #6b7280; }

.ps__pag { display: flex; justify-content: center; align-items: center; gap: 12px; padding: 16px; }
.ps__pag button { padding: 6px 14px; border: 1px solid #e5e7eb; border-radius: 6px; background: #fff; cursor: pointer; font-weight: 600; }
.ps__pag button:disabled { opacity: 0.4; cursor: not-allowed; }
.ps__pag span { font-size: 13px; color: #6b7280; }

@media (max-width: 768px) {
    .ps__cards { grid-template-columns: repeat(2, 1fr); }
    .ps__modes { grid-template-columns: 1fr; }
    .ps__filters { flex-wrap: wrap; }
}
</style>
