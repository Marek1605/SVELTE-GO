<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { api } from '$lib/api';
    
    let searchQuery = '';
    let categories = [];
    let topProducts = [];
    let categoryProducts = [];
    let stats = { products: 0, categories: 0 };
    let loaded = false;
    let heroTitle = 'Nájdite *najnižšiu cenu* za pár sekúnd';
    let heroSubtitle = 'Porovnávame ceny z overených obchodov na jednom mieste.';
    let homeCatSections = 3;
    let showHow = true;
    let showVendor = true;
    let hoveredCat = null;
    let hiddenCats = new Set();

    function totalProducts(cat) {
        let c = cat.product_count || 0;
        if (cat.children) for (const ch of cat.children) c += totalProducts(ch);
        return c;
    }
    function handleSearch(e) { e.preventDefault(); if (searchQuery.trim()) window.location.href = `/hladat?q=${encodeURIComponent(searchQuery)}`; }
    function fmtPrice(p) { return (p || 0).toFixed(2).replace('.', ','); }
    function fmtNum(n) { return (n || 0).toLocaleString('sk-SK'); }
    function getEmoji(name) {
        const l = (name || '').toLowerCase();
        const m = {'auto':'🚗','dom':'🏠','záhrad':'🌿','domáce':'🔌','spotreb':'🔌','elektro':'📱','hrač':'🧸','hudob':'🎸','hry':'🎮','it':'💻','podnik':'🏢','potrav':'🍎','dieťa':'👶','foto':'📸','zviera':'🐾','šport':'⚽','zdrav':'💊','priemys':'🏭','obuv':'👟','oblieč':'👕','nábyt':'🛋️','knih':'📚','kozmet':'💄','nást':'🔧','kuchy':'🍳'};
        for (const [k, v] of Object.entries(m)) { if (l.includes(k)) return v; }
        return '📦';
    }
    const popularTags = ['notebook', 'iPhone 16', 'televízor', 'slúchadlá', 'Samsung Galaxy', 'vysávač'];

    onMount(async () => {
        // Load hidden cats from localStorage (same as layout)
        try {
            const hidden = localStorage.getItem('mp_hidden_cats');
            if (hidden) hiddenCats = new Set(JSON.parse(hidden));
        } catch(e) {}

        try {
            const r = await fetch('/api/v1/site/settings');
            const d = await r.json();
            if (d?.success && d?.data) {
                if (d.data.hero_title) heroTitle = d.data.hero_title;
                if (d.data.hero_subtitle) heroSubtitle = d.data.hero_subtitle;
                homeCatSections = parseInt(d.data.home_category_sections) || 3;
                showHow = d.data.show_how_it_works !== 'false';
                showVendor = d.data.show_vendor_cta !== 'false';
            }
        } catch(e) {}

        // Use same categories as layout (from parent layout data) and apply same filter
        const navCats = $page.data?.navCategories || [];
        if (navCats.length > 0) {
            categories = navCats.filter(cat => !hiddenCats.has(cat.id));
        } else {
            // Fallback: fetch directly
            try {
                const r = await api.getCategoriesTree();
                if (r?.success && Array.isArray(r.data)) categories = r.data.filter(cat => !hiddenCats.has(cat.id));
                else if (Array.isArray(r)) categories = r.filter(cat => !hiddenCats.has(cat.id));
            } catch(e) {}
        }

        try {
            const r = await api.getProducts('limit=8&sort=popular');
            if (r?.success && r?.data?.items) { topProducts = r.data.items; stats.products = r.data.total || topProducts.length; }
            else if (r?.items) topProducts = r.items;
        } catch(e) {}

        stats.categories = categories.length;
        loaded = true;

        const top = categories.filter(c => totalProducts(c) > 0).slice(0, homeCatSections);
        for (const cat of top) {
            try {
                const r = await api.getProducts(`category=${cat.slug}&limit=4&sort=popular`);
                let items = r?.success && r?.data?.items ? r.data.items : r?.items || [];
                if (items.length > 0) categoryProducts = [...categoryProducts, { name: cat.name, slug: cat.slug, products: items, children: cat.children || [] }];
            } catch(e) {}
        }
    });
</script>

<svelte:head>
    <title>MegaPrice — Porovnávač cien | Najlepšie ceny z overených obchodov</title>
    <meta name="description" content="Porovnajte ceny produktov z overených slovenských e-shopov. Nájdite najlepšiu ponuku na elektroniku, domácnosť a ďalšie.">
</svelte:head>

<div class="hp">

    <!-- ═══════ HERO SEARCH ═══════ -->
    <section class="hero">
        <div class="hero__inner">
            <h1 class="hero__h">{@html heroTitle.replace(/\*([^*]+)\*/g, '<em>$1</em>')}</h1>
            <p class="hero__sub">{heroSubtitle}</p>
            <form class="hero__bar" on:submit={handleSearch}>
                <svg class="hero__bar-ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.5"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" placeholder="Čo hľadáte? napr. iPhone, notebook..." bind:value={searchQuery}>
                <button type="submit">Hľadať</button>
            </form>
            <div class="hero__tags">
                <span>Populárne:</span>
                {#each popularTags as t}<a href="/hladat?q={encodeURIComponent(t)}">{t}</a>{/each}
            </div>
        </div>
    </section>

    <!-- ═══════ TRUST STRIP ═══════ -->
    <div class="trust">
        <div class="trust__i"><strong>{fmtNum(stats.products)}+</strong><span>produktov</span></div>
        <div class="trust__sep"></div>
        <div class="trust__i"><strong>{stats.categories}</strong><span>kategórií</span></div>
        <div class="trust__sep"></div>
        <div class="trust__i"><strong>Overené</strong><span>e-shopy</span></div>
        <div class="trust__sep"></div>
        <div class="trust__i"><strong>Denne</strong><span>aktualizované</span></div>
    </div>

    <!-- ═══════ CATEGORIES ═══════ -->
    {#if categories.length > 0}
    <section class="cats">
        <div class="cats__top">
            <h2 class="cats__title">Kategórie</h2>
            <a href="/kategorie" class="cats__all">Všetky kategórie →</a>
        </div>
        <div class="cats__rail">
            {#each categories as cat}
                <a href="/kategoria/{cat.slug}" class="catpill"
                   on:mouseenter={() => hoveredCat = cat.id}
                   on:mouseleave={() => hoveredCat = null}>
                    <span class="catpill__ico">
                        {#if cat.image_url}<img src={cat.image_url} alt="">{:else}<span>{getEmoji(cat.name)}</span>{/if}
                    </span>
                    <span class="catpill__body">
                        <span class="catpill__name">{cat.name}</span>
                        {#if totalProducts(cat) > 0}
                            <span class="catpill__count">{fmtNum(totalProducts(cat))}</span>
                        {/if}
                    </span>
                    {#if cat.children && cat.children.length > 0 && hoveredCat === cat.id}
                        <span class="catpill__subs">
                            {#each cat.children.slice(0, 4) as sub}
                                <span>{sub.name}</span>
                            {/each}
                            {#if cat.children.length > 4}<span class="catpill__more">+{cat.children.length - 4}</span>{/if}
                        </span>
                    {/if}
                </a>
            {/each}
        </div>
    </section>
    {/if}

    <!-- ═══════ TOP PRODUCTS ═══════ -->
    {#if topProducts.length > 0}
    <section class="psec">
        <div class="psec__in">
            <div class="psec__head">
                <h2>🔥 Najporovnávanejšie</h2>
                <a href="/produkty">Všetky produkty →</a>
            </div>
            <div class="pgrid">
                {#each topProducts as p, i}
                <a href="/produkt/{p.slug}" class="pcard">
                    {#if i < 3}<span class="pcard__badge pcard__badge--{i+1}">TOP {i+1}</span>{/if}
                    <div class="pcard__img">
                        {#if p.image_url}<img src={p.image_url} alt={p.title}>{:else}<span class="pcard__ph">📷</span>{/if}
                    </div>
                    <div class="pcard__body">
                        {#if p.brand}<span class="pcard__brand">{p.brand}</span>{/if}
                        <h3 class="pcard__title">{p.title}</h3>
                        <div class="pcard__foot">
                            <div class="pcard__price">
                                {#if p.price_min}<span class="pcard__from">od</span>{/if}
                                <span class="pcard__val">{fmtPrice(p.price_min || p.price)} €</span>
                            </div>
                            {#if p.offer_count > 0}
                                <span class="pcard__offers">{p.offer_count} {p.offer_count === 1 ? 'obchod' : p.offer_count < 5 ? 'obchody' : 'obchodov'}</span>
                            {/if}
                        </div>
                        <span class="pcard__cta">Porovnať ceny</span>
                    </div>
                </a>
                {/each}
            </div>
        </div>
    </section>
    {/if}

    <!-- ═══════ CATEGORY PRODUCT SECTIONS ═══════ -->
    {#each categoryProducts as cs}
    <section class="psec psec--alt">
        <div class="psec__in">
            <div class="psec__head">
                <div>
                    <h2>{cs.name}</h2>
                    {#if cs.children.length > 0}
                        <div class="psec__chips">
                            {#each cs.children.slice(0, 6) as sub}
                                <a href="/kategoria/{sub.slug}" class="chip">{sub.name}</a>
                            {/each}
                            {#if cs.children.length > 6}
                                <a href="/kategoria/{cs.slug}" class="chip chip--more">+{cs.children.length - 6}</a>
                            {/if}
                        </div>
                    {/if}
                </div>
                <a href="/kategoria/{cs.slug}">Zobraziť všetky →</a>
            </div>
            <div class="pgrid">
                {#each cs.products as p}
                <a href="/produkt/{p.slug}" class="pcard">
                    <div class="pcard__img">
                        {#if p.image_url}<img src={p.image_url} alt={p.title}>{:else}<span class="pcard__ph">📷</span>{/if}
                    </div>
                    <div class="pcard__body">
                        {#if p.brand}<span class="pcard__brand">{p.brand}</span>{/if}
                        <h3 class="pcard__title">{p.title}</h3>
                        <div class="pcard__foot">
                            <div class="pcard__price">
                                {#if p.price_min}<span class="pcard__from">od</span>{/if}
                                <span class="pcard__val">{fmtPrice(p.price_min || p.price)} €</span>
                            </div>
                            {#if p.offer_count > 0}
                                <span class="pcard__offers">{p.offer_count} {p.offer_count === 1 ? 'obchod' : p.offer_count < 5 ? 'obchody' : 'obchodov'}</span>
                            {/if}
                        </div>
                        <span class="pcard__cta">Porovnať ceny</span>
                    </div>
                </a>
                {/each}
            </div>
        </div>
    </section>
    {/each}

    <!-- ═══════ HOW IT WORKS ═══════ -->
    {#if showHow}
    <section class="how">
        <div class="how__in">
            <h2>Ako to funguje</h2>
            <div class="how__row">
                <div class="how__s"><div class="how__n">1</div><h3>Vyhľadajte</h3><p>Nájdite produkt alebo prechádzajte kategórie</p></div>
                <div class="how__arr">→</div>
                <div class="how__s"><div class="how__n">2</div><h3>Porovnajte</h3><p>Zobrazíme ponuky z viacerých overených obchodov</p></div>
                <div class="how__arr">→</div>
                <div class="how__s"><div class="how__n">3</div><h3>Ušetrite</h3><p>Vyberte najnižšiu cenu a nakúpte priamo v e-shope</p></div>
            </div>
        </div>
    </section>
    {/if}

    <!-- ═══════ VENDOR CTA ═══════ -->
    {#if showVendor}
    <section class="vcta">
        <div class="vcta__in">
            <div class="vcta__txt">
                <h2>Predávate online?</h2>
                <p>Pridajte svoj e-shop na MegaPrice. Platíte len za kliknutia zákazníkov.</p>
                <div class="vcta__perks">
                    <span>✓ CPC od 0,05 €</span>
                    <span>✓ XML/CSV feed</span>
                    <span>✓ Registrácia zadarmo</span>
                </div>
                <a href="/pre-predajcov" class="vcta__btn">Začať predávať →</a>
            </div>
            <div class="vcta__card">
                <div class="vcta__row"><span>CPC od</span><strong>0,05 €</strong></div>
                <div class="vcta__row"><span>Registrácia</span><strong>Zadarmo</strong></div>
                <div class="vcta__row"><span>Feed import</span><strong>XML / CSV</strong></div>
            </div>
        </div>
    </section>
    {/if}

</div>

<style>
/* ═══════════════════════════════ */
/* BASE                            */
/* ═══════════════════════════════ */
.hp { background: #f8f9fb; }

/* ═══════════════════════════════ */
/* HERO                            */
/* ═══════════════════════════════ */
.hero {
    background: #0f172a; color: #fff; text-align: center;
    padding: 44px 0 36px; position: relative; overflow: hidden;
}
.hero::before {
    content: ''; position: absolute; inset: 0; pointer-events: none;
    background: radial-gradient(ellipse at 25% 20%, rgba(196,149,106,0.1), transparent 55%),
                radial-gradient(ellipse at 75% 80%, rgba(99,102,241,0.06), transparent 45%);
}
.hero__inner { position: relative; max-width: 620px; margin: 0 auto; padding: 0 20px; }
.hero__h { font-size: 30px; font-weight: 800; line-height: 1.15; margin: 0 0 6px; letter-spacing: -0.4px; }
.hero__h :global(em) { font-style: normal; color: #c4956a; }
.hero__sub { font-size: 15px; color: rgba(255,255,255,0.55); margin: 0 0 22px; }
.hero__bar {
    display: flex; align-items: center; background: #fff;
    border-radius: 12px; padding: 4px; position: relative;
    box-shadow: 0 6px 24px rgba(0,0,0,0.2);
}
.hero__bar-ico { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); pointer-events: none; }
.hero__bar input {
    flex: 1; border: none; background: none; padding: 12px 10px 12px 40px;
    font-size: 15px; color: #1e293b; outline: none; min-width: 0; border-radius: 8px;
}
.hero__bar input::placeholder { color: #94a3b8; }
.hero__bar button {
    padding: 11px 22px; background: #c4956a; color: #fff; border: none;
    border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer;
    transition: background 0.15s; white-space: nowrap;
}
.hero__bar button:hover { background: #b8875c; }
.hero__tags { margin-top: 14px; display: flex; flex-wrap: wrap; justify-content: center; gap: 5px; }
.hero__tags > span { font-size: 11px; color: rgba(255,255,255,0.35); }
.hero__tags a {
    padding: 3px 9px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 5px; font-size: 11px; color: rgba(255,255,255,0.45); transition: all 0.15s;
}
.hero__tags a:hover { color: #c4956a; border-color: rgba(196,149,106,0.25); background: rgba(196,149,106,0.1); }

/* ═══════════════════════════════ */
/* TRUST STRIP                     */
/* ═══════════════════════════════ */
.trust {
    display: flex; align-items: center; justify-content: center; gap: 12px;
    padding: 12px 16px; background: #fff; border-bottom: 1px solid #eef0f2;
}
.trust__i { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #64748b; }
.trust__i strong { color: #0f172a; font-weight: 700; }
.trust__sep { width: 3px; height: 3px; border-radius: 50%; background: #cbd5e1; }

/* ═══════════════════════════════ */
/* CATEGORIES                      */
/* ═══════════════════════════════ */
.cats { padding: 20px 0 8px; background: #fff; }
.cats__top { display: flex; justify-content: space-between; align-items: center; padding: 0 20px; margin-bottom: 12px; }
.cats__title { font-size: 17px; font-weight: 700; color: #0f172a; margin: 0; }
.cats__all { font-size: 12px; font-weight: 600; color: #c4956a; white-space: nowrap; }

.cats__rail {
    display: flex; gap: 8px; overflow-x: auto; -webkit-overflow-scrolling: touch;
    padding: 0 20px 12px; scroll-snap-type: x proximity; scrollbar-width: none;
}
.cats__rail::-webkit-scrollbar { display: none; }

.catpill {
    flex-shrink: 0; display: flex; align-items: center; gap: 10px;
    padding: 8px 14px 8px 8px; background: #fff; border: 1.5px solid #e5e7eb;
    border-radius: 12px; scroll-snap-align: start; transition: all 0.2s;
    position: relative; min-width: 140px;
}
.catpill:hover, .catpill:active { border-color: #c4956a; box-shadow: 0 2px 8px rgba(196,149,106,0.1); }
.catpill__ico {
    width: 40px; height: 40px; border-radius: 10px; background: #f8f9fb;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; flex-shrink: 0;
}
.catpill__ico img { width: 100%; height: 100%; object-fit: cover; }
.catpill__ico > span { font-size: 20px; }
.catpill__body { display: flex; flex-direction: column; min-width: 0; }
.catpill__name { font-size: 13px; font-weight: 600; color: #1f2937; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.catpill__count { font-size: 10px; color: #94a3b8; }

/* Subcategory tooltip on hover (desktop only) */
.catpill__subs {
    display: none; position: absolute; left: 0; top: 100%; margin-top: 4px;
    background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;
    padding: 8px 10px; box-shadow: 0 8px 20px rgba(0,0,0,0.1); z-index: 50;
    min-width: 160px; gap: 4px; flex-direction: column;
}
.catpill__subs span { font-size: 12px; color: #4b5563; padding: 2px 0; white-space: nowrap; }
.catpill__more { color: #c4956a !important; font-weight: 600; }
@media (hover: hover) { .catpill:hover .catpill__subs { display: flex; } }

/* ═══════════════════════════════ */
/* PRODUCT SECTIONS                */
/* ═══════════════════════════════ */
.psec { padding: 24px 0; }
.psec--alt { background: #fff; }
.psec__in { max-width: 1200px; margin: 0 auto; padding: 0 16px; }
.psec__head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; gap: 8px; }
.psec__head h2 { font-size: 17px; font-weight: 700; color: #0f172a; margin: 0; }
.psec__head > a, .psec__head > div + a { font-size: 12px; font-weight: 600; color: #c4956a; white-space: nowrap; margin-top: 2px; }
.psec__chips { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
.chip {
    padding: 3px 8px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 5px;
    font-size: 11px; color: #64748b; transition: all 0.15s; white-space: nowrap;
}
.chip:hover { border-color: #c4956a; color: #c4956a; background: #fdf8f4; }
.chip--more { font-weight: 700; color: #c4956a; background: #fdf8f4; border-color: #e8d5c2; }

/* ═══════════════════════════════ */
/* PRODUCT CARDS                   */
/* ═══════════════════════════════ */
.pgrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }

.pcard {
    display: flex; flex-direction: column; background: #fff;
    border: 1px solid #e8eaed; border-radius: 10px; overflow: hidden;
    transition: all 0.2s; position: relative;
}
.pcard:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); transform: translateY(-2px); border-color: #d1d5db; }
.pcard__badge {
    position: absolute; top: 8px; left: 8px; z-index: 2;
    padding: 2px 7px; border-radius: 5px; font-size: 10px; font-weight: 800; color: #fff;
    letter-spacing: 0.3px;
}
.pcard__badge--1 { background: linear-gradient(135deg, #f59e0b, #d97706); }
.pcard__badge--2 { background: linear-gradient(135deg, #94a3b8, #64748b); }
.pcard__badge--3 { background: linear-gradient(135deg, #d97706, #92400e); }
.pcard__img {
    height: 150px; background: #fafbfc; display: flex; align-items: center;
    justify-content: center; padding: 10px;
}
.pcard__img img { max-width: 100%; max-height: 100%; object-fit: contain; mix-blend-mode: multiply; }
.pcard__ph { font-size: 28px; opacity: 0.12; }
.pcard__body { padding: 10px 12px 12px; flex: 1; display: flex; flex-direction: column; }
.pcard__brand { font-size: 10px; font-weight: 700; color: #c4956a; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 1px; }
.pcard__title {
    font-size: 13px; font-weight: 500; line-height: 1.35; margin: 0 0 8px; color: #1e293b;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.pcard__foot { margin-top: auto; display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px; }
.pcard__from { font-size: 10px; color: #94a3b8; }
.pcard__val { font-size: 17px; font-weight: 800; color: #0f172a; }
.pcard__offers { font-size: 10px; color: #64748b; white-space: nowrap; }
.pcard__cta {
    display: block; text-align: center; padding: 7px;
    background: #fdf8f4; border-radius: 6px; font-size: 12px;
    font-weight: 600; color: #c4956a; transition: all 0.15s;
}
.pcard:hover .pcard__cta { background: #c4956a; color: #fff; }

/* ═══════════════════════════════ */
/* HOW                             */
/* ═══════════════════════════════ */
.how { padding: 28px 0; background: #fff; border-top: 1px solid #f0f0f0; }
.how__in { max-width: 780px; margin: 0 auto; padding: 0 20px; text-align: center; }
.how__in h2 { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 20px; }
.how__row { display: flex; align-items: flex-start; gap: 6px; }
.how__s { flex: 1; text-align: center; }
.how__n {
    width: 32px; height: 32px; background: #c4956a; color: #fff; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 800; margin: 0 auto 8px;
}
.how__s h3 { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
.how__s p { font-size: 12px; color: #64748b; line-height: 1.4; margin: 0; }
.how__arr { color: #d1d5db; font-size: 18px; margin-top: 8px; flex-shrink: 0; }

/* ═══════════════════════════════ */
/* VENDOR CTA                      */
/* ═══════════════════════════════ */
.vcta { padding: 32px 0; background: #0f172a; color: #fff; }
.vcta__in { max-width: 920px; margin: 0 auto; padding: 0 20px; display: flex; align-items: center; gap: 40px; }
.vcta__txt { flex: 1; }
.vcta__txt h2 { font-size: 22px; font-weight: 800; margin: 0 0 6px; }
.vcta__txt > p { font-size: 14px; color: rgba(255,255,255,0.55); margin: 0 0 14px; }
.vcta__perks { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 18px; }
.vcta__perks span { font-size: 13px; color: #c4956a; font-weight: 600; }
.vcta__btn {
    display: inline-block; padding: 11px 24px; background: #c4956a; color: #fff;
    border-radius: 8px; font-size: 14px; font-weight: 700; transition: background 0.15s;
}
.vcta__btn:hover { background: #b8875c; }
.vcta__card {
    flex-shrink: 0; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px; padding: 16px 20px; min-width: 180px;
}
.vcta__row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px; }
.vcta__row:last-child { border: none; }
.vcta__row span { color: rgba(255,255,255,0.4); }
.vcta__row strong { color: #c4956a; font-weight: 700; }

/* ═══════════════════════════════ */
/* TABLET                          */
/* ═══════════════════════════════ */
@media (max-width: 1024px) {
    .pgrid { grid-template-columns: repeat(3, 1fr); }
}

/* ═══════════════════════════════ */
/* MOBILE                          */
/* ═══════════════════════════════ */
@media (max-width: 768px) {
    /* Hero */
    .hero { padding: 24px 0 20px; }
    .hero__inner { padding: 0 16px; }
    .hero__h { font-size: 20px; margin-bottom: 4px; }
    .hero__sub { font-size: 13px; margin-bottom: 14px; }
    .hero__bar { border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
    .hero__bar input { padding: 10px 8px 10px 36px; font-size: 14px; }
    .hero__bar-ico { left: 12px; width: 16px; height: 16px; }
    .hero__bar button { padding: 10px 14px; font-size: 13px; }
    .hero__tags { gap: 4px; margin-top: 10px; }
    .hero__tags > span { font-size: 10px; }
    .hero__tags a { font-size: 10px; padding: 2px 7px; }

    /* Trust */
    .trust { gap: 6px; padding: 8px 10px; }
    .trust__i { gap: 3px; font-size: 11px; }

    /* Categories */
    .cats { padding: 16px 0 4px; }
    .cats__top { padding: 0 16px; margin-bottom: 8px; }
    .cats__title { font-size: 15px; }
    .cats__all { font-size: 11px; }
    .cats__rail { gap: 6px; padding: 0 16px 8px; }
    .catpill { min-width: 120px; padding: 6px 10px 6px 6px; border-radius: 10px; gap: 8px; }
    .catpill__ico { width: 34px; height: 34px; border-radius: 8px; }
    .catpill__ico > span { font-size: 17px; }
    .catpill__name { font-size: 12px; }
    .catpill__count { font-size: 9px; }
    .catpill__subs { display: none !important; }

    /* Sections */
    .psec { padding: 16px 0; }
    .psec__in { padding: 0 12px; }
    .psec__head { margin-bottom: 10px; }
    .psec__head h2 { font-size: 15px; }
    .psec__head > a, .psec__head > div + a { font-size: 11px; }
    .psec__chips { gap: 3px; margin-top: 4px; }
    .chip { font-size: 10px; padding: 2px 6px; border-radius: 4px; }

    /* Products */
    .pgrid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .pcard { border-radius: 8px; }
    .pcard__img { height: 110px; padding: 6px; }
    .pcard__body { padding: 8px 8px 10px; }
    .pcard__brand { font-size: 9px; }
    .pcard__title { font-size: 11px; margin-bottom: 4px; }
    .pcard__val { font-size: 15px; }
    .pcard__from { font-size: 9px; }
    .pcard__offers { font-size: 9px; }
    .pcard__cta { padding: 6px; font-size: 11px; }
    .pcard__badge { top: 4px; left: 4px; padding: 2px 5px; font-size: 9px; border-radius: 4px; }

    /* How */
    .how { padding: 20px 0; }
    .how__in h2 { font-size: 15px; margin-bottom: 14px; }
    .how__row { gap: 4px; }
    .how__n { width: 28px; height: 28px; font-size: 11px; }
    .how__s h3 { font-size: 12px; }
    .how__s p { font-size: 10px; }
    .how__arr { font-size: 14px; margin-top: 6px; }

    /* Vendor */
    .vcta { padding: 24px 0; }
    .vcta__in { flex-direction: column; text-align: center; gap: 16px; padding: 0 16px; }
    .vcta__txt h2 { font-size: 18px; }
    .vcta__txt > p { font-size: 12px; }
    .vcta__perks { justify-content: center; gap: 8px; }
    .vcta__perks span { font-size: 12px; }
    .vcta__btn { font-size: 13px; padding: 10px 20px; }
    .vcta__card { width: 100%; max-width: 220px; }
    .vcta__row { font-size: 12px; }
}

@media (max-width: 380px) {
    .hero__h { font-size: 18px; }
    .hero__bar button { padding: 9px 12px; font-size: 12px; }
    .catpill { min-width: 110px; }
    .catpill__ico { width: 30px; height: 30px; }
    .catpill__name { font-size: 11px; }
    .pgrid { gap: 6px; }
    .pcard__img { height: 90px; }
    .pcard__val { font-size: 13px; }
    .pcard__title { font-size: 10px; }
}
</style>
