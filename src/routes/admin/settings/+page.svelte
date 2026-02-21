<script>
    import { adminFetch, adminRawFetch, API_BASE } from '$lib/adminApi.js';
    import { onMount } from 'svelte';


    let loading = true;
    let systemInfo = null;
    let cleaningImages = false;
    let cleanupMsg = '';

    // Site settings
    let siteName = 'MegaPrice';
    let siteDescription = 'Porovnávač cien';
    let logoUrl = '';
    let logoFile = null;
    let uploadingLogo = false;
    let settingsMsg = '';
    let savingSettings = false;
    let logoSize = 40;

    // UI visibility
    let showCart = true;
    let showAccount = true;
    let showWishlist = true;
    let showCompare = true;

    // Homepage settings
    let heroTitle = 'Nájdite *najnižšiu cenu* za pár sekúnd';
    let heroSubtitle = 'Porovnávame ceny z overených obchodov na jednom mieste.';
    let homeCategorySections = 3;
    let showHowItWorks = true;
    let showVendorCta = true;
    let savingHome = false;
    let homeMsg = '';

    // Price drops settings
    let priceDropMode = 'auto';
    let priceDropLimit = 6;
    let priceDropProductIds = '';
    let priceDropSelected = [];
    let priceDropSearchResults = [];
    let dropsSearchTimer;
    let savingDrops = false;
    let dropsMsg = '';

    onMount(async () => {
        await Promise.all([loadSystemInfo(), loadSiteSettings(), loadPriceDropSettings()]);
        loading = false;
    });

    async function apiFetch(endpoint, opts = {}) {
        try {
            const res = await adminRawFetch(`${API_BASE}${endpoint}`, {
                headers: { 'Content-Type': 'application/json', ...opts.headers },
                ...opts
            });
            return await res.json();
        } catch (e) { return { success: false, error: e.message }; }
    }

    async function loadSystemInfo() {
        const res = await apiFetch('/admin/system-info');
        if (res?.success) systemInfo = res.data;
    }

    async function loadSiteSettings() {
        const res = await apiFetch('/admin/site-settings');
        if (res?.success && res.data) {
            siteName = res.data.site_name || 'MegaPrice';
            siteDescription = res.data.site_description || '';
            logoUrl = res.data.logo_url || '';
            logoSize = parseInt(res.data.logo_size) || 40;
            showCart = res.data.show_cart !== 'false';
            showAccount = res.data.show_account !== 'false';
            showWishlist = res.data.show_wishlist !== 'false';
            showCompare = res.data.show_compare !== 'false';
            heroTitle = res.data.hero_title || heroTitle;
            heroSubtitle = res.data.hero_subtitle || heroSubtitle;
            homeCategorySections = parseInt(res.data.home_category_sections) || 3;
            showHowItWorks = res.data.show_how_it_works !== 'false';
            showVendorCta = res.data.show_vendor_cta !== 'false';
        }
    }

    async function saveSiteSettings() {
        savingSettings = true; settingsMsg = '';
        const res = await apiFetch('/admin/site-settings', {
            method: 'POST',
            body: JSON.stringify({ site_name: siteName, site_description: siteDescription, logo_size: logoSize.toString() })
        });
        settingsMsg = res?.success ? '✅ Uložené' : '❌ ' + (res?.error || 'Chyba');
        savingSettings = false;
        setTimeout(() => settingsMsg = '', 3000);
    }

    let logoSizeTimer;
    function onLogoSizeChange() {
        clearTimeout(logoSizeTimer);
        logoSizeTimer = setTimeout(async () => {
            await apiFetch('/admin/site-settings', {
                method: 'POST',
                body: JSON.stringify({ site_name: siteName, site_description: siteDescription, logo_size: logoSize.toString() })
            });
        }, 400);
    }

    function handleLogoSelect(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { alert('Vyberte obrázok (PNG, JPG, SVG, WebP)'); return; }
        if (file.size > 5 * 1024 * 1024) { alert('Max 5MB'); return; }
        logoFile = file;
    }

    async function uploadLogo() {
        if (!logoFile) return;
        uploadingLogo = true;
        try {
            const formData = new FormData();
            formData.append('logo', logoFile);
            const res = await adminRawFetch(`${API_BASE}/admin/upload-logo`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data?.success) {
                logoUrl = data.url + '?t=' + Date.now();
                logoFile = null;
                settingsMsg = '✅ Logo nahrané';
            } else {
                settingsMsg = '❌ ' + (data?.error || 'Chyba');
            }
        } catch (e) { settingsMsg = '❌ ' + e.message; }
        uploadingLogo = false;
        setTimeout(() => settingsMsg = '', 3000);
    }

    async function removeLogo() {
        if (!confirm('Odstrániť logo?')) return;
        const res = await apiFetch('/admin/remove-logo', { method: 'POST' });
        if (res?.success) { logoUrl = ''; settingsMsg = '✅ Logo odstránené'; }
        setTimeout(() => settingsMsg = '', 3000);
    }

    async function cleanupOrphanedImages() {
        if (!confirm('Zmazať všetky osirotené obrázky? (Obrázky bez referencie v DB)')) return;
        cleaningImages = true; cleanupMsg = '';
        const res = await apiFetch('/admin/cleanup-orphaned-images', { method: 'POST' });
        if (res?.success) cleanupMsg = `✅ ${res.message}`;
        else cleanupMsg = '❌ ' + (res?.error || 'Chyba');
        cleaningImages = false;
        await loadSystemInfo();
        setTimeout(() => cleanupMsg = '', 8000);
    }

    async function deleteAllImages() {
        if (!confirm('⚠️ POZOR: Zmazať VŠETKY obrázky z disku? Toto je nevratná akcia!')) return;
        if (!confirm('Naozaj? Toto zmaže všetky uložené obrázky!')) return;
        cleaningImages = true; cleanupMsg = '';
        const res = await apiFetch('/admin/delete-all-images', { method: 'POST' });
        if (res?.success) cleanupMsg = `✅ ${res.message}`;
        else cleanupMsg = '❌ ' + (res?.error || 'Chyba');
        cleaningImages = false;
        await loadSystemInfo();
    }

    async function toggleHideEmpty() {
        const newVal = !(systemInfo?.hide_empty);
        const res = await apiFetch('/admin/toggle-hide-empty', { method: 'POST', body: JSON.stringify({ hide_empty: newVal }) });
        if (res?.success) { systemInfo = { ...systemInfo, hide_empty: newVal }; }
    }

    let deletingCategories = false;
    let catCleanupMsg = '';
    async function deleteEmptyCategories() {
        if (!confirm(`Zmazať ${fmt(systemInfo?.empty_categories || 0)} prázdnych kategórií? (bez produktov)`)) return;
        deletingCategories = true; catCleanupMsg = '';
        const res = await apiFetch('/admin/delete-empty-categories', { method: 'POST' });
        if (res?.success) catCleanupMsg = `✅ Zmazaných: ${res.deleted}, Zostáva: ${res.remaining}`;
        else catCleanupMsg = '❌ ' + (res?.error || 'Chyba');
        deletingCategories = false;
        await loadSystemInfo();
        setTimeout(() => catCleanupMsg = '', 8000);
    }

    function fmt(n) { return (n || 0).toLocaleString('sk-SK'); }

    async function toggleUISetting(key, value) {
        await apiFetch('/admin/toggle-ui-setting', {
            method: 'POST',
            body: JSON.stringify({ key, value })
        });
    }

    async function saveHomeSettings() {
        savingHome = true; homeMsg = '';
        const keys = {
            hero_title: heroTitle,
            hero_subtitle: heroSubtitle,
            home_category_sections: homeCategorySections.toString(),
            show_how_it_works: showHowItWorks ? 'true' : 'false',
            show_vendor_cta: showVendorCta ? 'true' : 'false'
        };
        for (const [k, v] of Object.entries(keys)) {
            await apiFetch('/admin/toggle-ui-setting', {
                method: 'POST',
                body: JSON.stringify({ key: k, value: v })
            });
        }
        savingHome = false;
        homeMsg = '✅ Uložené';
        setTimeout(() => homeMsg = '', 3000);
    }

    async function loadPriceDropSettings() {
        const res = await apiFetch('/admin/price-drops');
        if (res?.success && res.data) {
            priceDropMode = res.data.price_drops_mode || 'auto';
            priceDropLimit = parseInt(res.data.price_drops_limit) || 6;
            priceDropProductIds = res.data.price_drops_product_ids || '';
            if (priceDropProductIds && priceDropMode === 'manual') {
                await loadSelectedProducts();
            }
        }
    }

    async function loadSelectedProducts() {
        const ids = priceDropProductIds.split(',').filter(s => s.trim());
        if (ids.length === 0) return;
        const res = await apiFetch('/admin/price-drops/search?q=');
        // Instead, fetch each by searching
        for (const id of ids) {
            const r = await apiFetch('/admin/price-drops/search?q=' + id);
            if (r?.success && r.data) {
                const found = r.data.find(p => String(p.id) === id.trim());
                if (found && !priceDropSelected.some(s => s.id === found.id)) {
                    priceDropSelected = [...priceDropSelected, found];
                }
            }
        }
    }

    function searchDropProducts(query) {
        clearTimeout(dropsSearchTimer);
        if (query.length < 2) { priceDropSearchResults = []; return; }
        dropsSearchTimer = setTimeout(async () => {
            const res = await apiFetch('/admin/price-drops/search?q=' + encodeURIComponent(query));
            if (res?.success && res.data) {
                priceDropSearchResults = res.data.filter(p => !priceDropSelected.some(s => s.id === p.id));
            }
        }, 300);
    }

    function addDropProduct(product) {
        priceDropSelected = [...priceDropSelected, product];
        priceDropSearchResults = priceDropSearchResults.filter(p => p.id !== product.id);
    }

    function removeDropProduct(id) {
        priceDropSelected = priceDropSelected.filter(p => p.id !== id);
    }

    async function savePriceDropSettings() {
        savingDrops = true; dropsMsg = '';
        const ids = priceDropSelected.map(p => p.id).join(',');
        const res = await apiFetch('/admin/price-drops', {
            method: 'POST',
            body: JSON.stringify({ mode: priceDropMode, limit: priceDropLimit, product_ids: ids })
        });
        dropsMsg = res?.success ? '✅ Uložené' : '❌ Chyba';
        savingDrops = false;
        setTimeout(() => dropsMsg = '', 3000);
    }
</script>

<svelte:head><title>Nastavenia | Admin</title></svelte:head>

<div class="page">
    <h1>⚙️ Nastavenia</h1>

    {#if loading}
        <div class="loading">Načítavam...</div>
    {:else}

    <!-- SITE SETTINGS -->
    <div class="section">
        <h2>🌐 Stránka</h2>
        <p class="desc">Základné nastavenia webu - názov, popis a logo.</p>

        <div class="settings-grid">
            <div class="settings-left">
                <div class="form-row">
                    <label for="site_name">Názov webu</label>
                    <input id="site_name" type="text" bind:value={siteName} placeholder="MegaPrice">
                </div>
                <div class="form-row">
                    <label for="site_desc">Popis webu</label>
                    <input id="site_desc" type="text" bind:value={siteDescription} placeholder="Porovnávač cien">
                </div>
                <div class="actions">
                    <button class="btn blue" on:click={saveSiteSettings} disabled={savingSettings}>
                        {savingSettings ? 'Ukladám...' : '💾 Uložiť'}
                    </button>
                    {#if settingsMsg}<span class="msg">{settingsMsg}</span>{/if}
                </div>
            </div>

            <div class="logo-section">
                <label>Logo</label>
                <div class="logo-preview">
                    {#if logoUrl}
                        <img src={logoUrl} alt="Logo" class="logo-img" />
                    {:else}
                        <div class="logo-placeholder">
                            <span class="logo-text">{siteName || 'Logo'}</span>
                            <small>Žiadne logo nahrané</small>
                        </div>
                    {/if}
                </div>
                <div class="logo-actions">
                    <label class="btn outline sm upload-btn">
                        📎 Vybrať súbor
                        <input type="file" accept="image/*" on:change={handleLogoSelect} hidden>
                    </label>
                    {#if logoFile}
                        <span class="file-name">{logoFile.name}</span>
                        <button class="btn green sm" on:click={uploadLogo} disabled={uploadingLogo}>
                            {uploadingLogo ? '⏳...' : '⬆️ Nahrať'}
                        </button>
                    {/if}
                    {#if logoUrl}
                        <button class="btn red sm" on:click={removeLogo}>✕</button>
                    {/if}
                </div>
                <small class="hint">PNG, JPG, SVG alebo WebP. Max 5 MB. Odporúčaná šírka: 200-400px.</small>
                <div class="logo-size-control">
                    <label>Veľkosť loga: <strong>{logoSize}px</strong></label>
                    <div class="logo-size-row">
                        <span class="size-label">20px</span>
                        <input type="range" min="20" max="120" step="2" bind:value={logoSize} on:input={onLogoSizeChange}>
                        <span class="size-label">120px</span>
                    </div>
                    <div class="logo-size-preview" style="height:{logoSize}px;width:{Math.round(logoSize * 4)}px">
                        {#if logoUrl}
                            <img src={logoUrl} alt="Preview" style="height:{logoSize}px" />
                        {:else}
                            <span style="font-size:{Math.max(12, logoSize * 0.5)}px">Logo</span>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- UI ELEMENTS VISIBILITY -->
    <div class="section">
        <h2>🎨 Prvky rozhrania</h2>
        <p class="desc">Zobrazenie alebo skrytie prvkov v hlavičke webu.</p>

        <div class="ui-toggles">
            <div class="ui-toggle-row">
                <div class="ui-toggle-info">
                    <span class="ui-toggle-icon">🛒</span>
                    <div>
                        <strong>Košík</strong>
                        <small>Tlačidlo košíka v hlavičke</small>
                    </div>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" bind:checked={showCart} on:change={() => toggleUISetting('show_cart', showCart)}>
                    <span class="toggle-slider"></span>
                    <span class="toggle-label">{showCart ? 'Zobrazený' : 'Skrytý'}</span>
                </label>
            </div>

            <div class="ui-toggle-row">
                <div class="ui-toggle-info">
                    <span class="ui-toggle-icon">👤</span>
                    <div>
                        <strong>Môj účet</strong>
                        <small>Tlačidlo účtu v hlavičke</small>
                    </div>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" bind:checked={showAccount} on:change={() => toggleUISetting('show_account', showAccount)}>
                    <span class="toggle-slider"></span>
                    <span class="toggle-label">{showAccount ? 'Zobrazený' : 'Skrytý'}</span>
                </label>
            </div>

            <div class="ui-toggle-row">
                <div class="ui-toggle-info">
                    <span class="ui-toggle-icon">❤️</span>
                    <div>
                        <strong>Obľúbené</strong>
                        <small>Wishlist tlačidlo v hlavičke</small>
                    </div>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" bind:checked={showWishlist} on:change={() => toggleUISetting('show_wishlist', showWishlist)}>
                    <span class="toggle-slider"></span>
                    <span class="toggle-label">{showWishlist ? 'Zobrazené' : 'Skryté'}</span>
                </label>
            </div>

            <div class="ui-toggle-row">
                <div class="ui-toggle-info">
                    <span class="ui-toggle-icon">⚖️</span>
                    <div>
                        <strong>Porovnanie</strong>
                        <small>Tlačidlo porovnania v hlavičke</small>
                    </div>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" bind:checked={showCompare} on:change={() => toggleUISetting('show_compare', showCompare)}>
                    <span class="toggle-slider"></span>
                    <span class="toggle-label">{showCompare ? 'Zobrazené' : 'Skryté'}</span>
                </label>
            </div>
        </div>
    </div>

    <!-- HOMEPAGE SETTINGS -->
    <div class="section">
        <h2>🏠 Úvodná stránka</h2>
        <div class="form-group">
            <label>Hlavný nadpis (Hero) <small style="color:#94a3b8;font-weight:400">— text medzi *hviezdičkami* bude zvýraznený</small></label>
            <input type="text" bind:value={heroTitle} placeholder="Nájdite *najnižšiu cenu* za pár sekúnd">
        </div>
        <div class="form-group">
            <label>Podnadpis</label>
            <input type="text" bind:value={heroSubtitle} placeholder="Porovnávame ceny z overených obchodov...">
        </div>
        <div class="form-group">
            <label>Počet sekcií kategórií s produktami</label>
            <div style="display:flex;align-items:center;gap:12px">
                <input type="range" min="0" max="6" bind:value={homeCategorySections} style="flex:1;accent-color:#c4956a">
                <span style="font-weight:700;min-width:24px;text-align:center">{homeCategorySections}</span>
            </div>
        </div>
        <div class="ui-toggle-row">
            <div class="ui-toggle-info">
                <span class="ui-toggle-icon">📋</span>
                <div>
                    <span class="ui-toggle-name">Ako to funguje</span>
                    <span class="ui-toggle-desc">Sekcia s 3 krokmi pre nových zákazníkov</span>
                </div>
            </div>
            <label class="toggle-switch">
                <input type="checkbox" bind:checked={showHowItWorks}>
                <span class="toggle-slider"></span>
                <span class="toggle-label">{showHowItWorks ? 'Zobrazené' : 'Skryté'}</span>
            </label>
        </div>
        <div class="ui-toggle-row">
            <div class="ui-toggle-info">
                <span class="ui-toggle-icon">🏪</span>
                <div>
                    <span class="ui-toggle-name">Ste predajca?</span>
                    <span class="ui-toggle-desc">CTA sekcia pre získanie nových predajcov</span>
                </div>
            </div>
            <label class="toggle-switch">
                <input type="checkbox" bind:checked={showVendorCta}>
                <span class="toggle-slider"></span>
                <span class="toggle-label">{showVendorCta ? 'Zobrazené' : 'Skryté'}</span>
            </label>
        </div>
        <div style="margin-top:16px;display:flex;align-items:center;gap:12px">
            <button class="btn-save" on:click={saveHomeSettings} disabled={savingHome}>
                {savingHome ? 'Ukladám...' : '💾 Uložiť nastavenia úvodnej stránky'}
            </button>
            {#if homeMsg}<span class="save-msg">{homeMsg}</span>{/if}
        </div>
    </div>

    <!-- PRICE DROPS SETTINGS -->
    <div class="section">
        <h2>📉 Cenové poklesy</h2>
        <p class="desc">Nastavte, ktoré produkty sa zobrazia v sekcii cenových poklesov na hlavnej stránke.</p>

        <div class="drops-mode">
            <button class="mode-opt" class:active={priceDropMode === 'auto'} on:click={() => priceDropMode = 'auto'}>
                <span class="mode-radio">{priceDropMode === 'auto' ? '●' : '○'}</span>
                <div><strong>Automaticky</strong><small>Zobrazí produkty s najväčším cenovým poklesom</small></div>
            </button>
            <button class="mode-opt" class:active={priceDropMode === 'manual'} on:click={() => priceDropMode = 'manual'}>
                <span class="mode-radio">{priceDropMode === 'manual' ? '●' : '○'}</span>
                <div><strong>Manuálne</strong><small>Vyberte konkrétne produkty ručne</small></div>
            </button>
        </div>

        {#if priceDropMode === 'auto'}
        <div class="field" style="margin-top:16px">
            <label>Počet produktov: <strong>{priceDropLimit}</strong></label>
            <input type="range" min="2" max="12" bind:value={priceDropLimit} style="width:100%;max-width:300px">
        </div>
        {/if}

        {#if priceDropMode === 'manual'}
        <div style="margin-top:16px">
            <label class="field-label">Vyhľadať produkt</label>
            <input type="text" class="input" placeholder="Názov produktu..." on:input={(e) => searchDropProducts(e.target.value)} style="max-width:400px">
            
            {#if priceDropSearchResults.length > 0}
            <div class="drops-results">
                {#each priceDropSearchResults as p}
                <button class="drops-result" on:click={() => addDropProduct(p)}>
                    <div class="drops-result__img">{#if p.image_url}<img src={p.image_url} alt="">{:else}📦{/if}</div>
                    <div class="drops-result__info">
                        <span>{p.title}</span>
                        <span class="drops-result__price">{p.price_min?.toFixed(2)} € {#if p.price_old > 0}<s>{p.price_old?.toFixed(2)} €</s>{/if} {#if p.drop_pct > 0}<em>-{Math.round(p.drop_pct)}%</em>{/if}</span>
                    </div>
                    <span class="drops-result__add">+ Pridať</span>
                </button>
                {/each}
            </div>
            {/if}

            {#if priceDropSelected.length > 0}
            <div class="drops-selected">
                <label class="field-label">Vybrané produkty ({priceDropSelected.length})</label>
                {#each priceDropSelected as p, i}
                <div class="drops-sel">
                    <span class="drops-sel__num">{i + 1}</span>
                    <div class="drops-sel__img">{#if p.image_url}<img src={p.image_url} alt="">{:else}📦{/if}</div>
                    <div class="drops-sel__info">{p.title}</div>
                    <button class="drops-sel__rm" on:click={() => removeDropProduct(p.id)}>✕</button>
                </div>
                {/each}
            </div>
            {/if}
        </div>
        {/if}

        <div style="margin-top:16px;display:flex;align-items:center;gap:12px">
            <button class="btn-save" on:click={savePriceDropSettings} disabled={savingDrops}>
                {savingDrops ? 'Ukladám...' : '💾 Uložiť cenové poklesy'}
            </button>
            {#if dropsMsg}<span class="save-msg">{dropsMsg}</span>{/if}
        </div>
    </div>

    <!-- SYSTEM INFO -->
    {#if systemInfo}
    <div class="section">
        <h2>🖥️ Stav systému</h2>
        <div class="stats-grid">
            <div class="stat"><span class="n">{fmt(systemInfo.products)}</span><span class="l">Produktov</span></div>
            <div class="stat"><span class="n">{fmt(systemInfo.categories)}</span><span class="l">Kategórií</span></div>
            <div class="stat warn"><span class="n">{fmt(systemInfo.empty_categories)}</span><span class="l">Prázdnych kat.</span></div>
            <div class="stat"><span class="n">{fmt(systemInfo.offers)}</span><span class="l">Ponúk</span></div>
            <div class="stat"><span class="n">{fmt(systemInfo.disk_images)}</span><span class="l">Obrázkov na disku</span></div>
            <div class="stat" class:warn={systemInfo.orphaned_estimate > 0}><span class="n">{fmt(systemInfo.orphaned_estimate)}</span><span class="l">Osirotených obr.</span></div>
            <div class="stat"><span class="n">{systemInfo.disk_size_gb} GB</span><span class="l">Miesto na disku</span></div>
            <div class="stat" class:ok={systemInfo.ai_status === 'completed'} class:running={systemInfo.ai_status === 'running'}>
                <span class="n">{systemInfo.ai_status === 'running' ? '⏳' : systemInfo.ai_status === 'completed' ? '✅' : '⏸️'}</span>
                <span class="l">AI stav</span>
            </div>
        </div>

        <div class="system-actions">
            <div class="system-row">
                <div>
                    <strong>🖼️ Osirotené obrázky</strong>
                    <p class="desc">Súbory na disku bez referencie v DB ({fmt(systemInfo.orphaned_estimate)} súborov, {systemInfo.disk_size_gb} GB)</p>
                </div>
                <div class="btn-group">
                    <button class="btn orange" on:click={cleanupOrphanedImages} disabled={cleaningImages}>
                        {cleaningImages ? '⏳ Mažem...' : '🧹 Vyčistiť osirotené'}
                    </button>
                    <button class="btn red sm" on:click={deleteAllImages} disabled={cleaningImages}>🗑️ Zmazať všetky</button>
                </div>
            </div>
            {#if cleanupMsg}<div class="msg cleanup-msg">{cleanupMsg}</div>{/if}

            <div class="system-row">
                <div>
                    <strong>📁 Prázdne kategórie</strong>
                    <p class="desc">Skryť kategórie bez produktov na webe ({fmt(systemInfo.empty_categories)} prázdnych). Na mazanie použite AI Kategorizácia → Vyčistenie.</p>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" checked={systemInfo.hide_empty} on:change={toggleHideEmpty}>
                    <span class="toggle-slider"></span>
                    <span class="toggle-label">{systemInfo.hide_empty ? 'Skryté' : 'Zobrazené'}</span>
                </label>
            </div>
        </div>

        <button class="btn outline sm" on:click={loadSystemInfo} style="margin-top:12px">🔄 Obnoviť info</button>
    </div>
    {/if}

    {/if}
</div>

<style>
    .page{width:100%;max-width:1100px;margin:0 auto;padding:20px}
    h1{font-size:24px;margin:0 0 24px;color:#1e293b}
    h2{font-size:18px;margin:0 0 8px;color:#1e293b}
    .loading{text-align:center;padding:40px;color:#64748b}
    .desc{color:#64748b;font-size:14px;margin:0 0 12px;line-height:1.5}
    .section{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:20px}

    /* Settings grid */
    .settings-grid{display:grid;grid-template-columns:1fr 300px;gap:32px;margin-top:16px}
    .settings-left{display:flex;flex-direction:column;gap:16px}

    /* Logo section */
    .logo-section{display:flex;flex-direction:column;gap:10px}
    .logo-section > label{font-size:13px;font-weight:600;color:#374151}
    .logo-preview{width:100%;min-height:120px;background:#f8fafc;border:2px dashed #d1d5db;border-radius:12px;display:flex;align-items:center;justify-content:center;overflow:hidden}
    .logo-img{max-width:100%;max-height:160px;object-fit:contain;padding:12px}
    .logo-placeholder{text-align:center;padding:20px;color:#94a3b8}
    .logo-text{display:block;font-size:28px;font-weight:700;color:#ff6b35;margin-bottom:4px}
    .logo-placeholder small{font-size:12px}
    .logo-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
    .file-name{font-size:12px;color:#64748b;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .upload-btn{cursor:pointer}
    .hint{color:#9ca3af;font-size:11px;line-height:1.4}

    /* Logo size control */
    .logo-size-control{margin-top:8px;padding:12px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0}
    .logo-size-control label{font-size:12px;font-weight:600;color:#475569;display:block;margin-bottom:6px}
    .logo-size-control strong{color:#1e293b}
    .logo-size-row{display:flex;align-items:center;gap:8px}
    .size-label{font-size:11px;color:#94a3b8;white-space:nowrap}
    .logo-size-row input[type="range"]{flex:1;accent-color:#3b82f6;height:6px}
    .logo-size-preview{margin-top:8px;background:#fff;border:1px dashed #d1d5db;border-radius:6px;display:flex;align-items:center;justify-content:center;overflow:hidden;transition:all .2s}
    .logo-size-preview img{max-width:100%;object-fit:contain}
    .logo-size-preview span{color:#94a3b8;font-weight:600}

    /* Stats */
    .stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-top:16px}
    .stat{padding:16px;background:#f8fafc;border-radius:8px;text-align:center;border:2px solid #e2e8f0}
    .stat .n{display:block;font-size:24px;font-weight:700;color:#1e293b}
    .stat .l{font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.3px}
    .stat.ok{border-color:#10b981;background:#ecfdf5}.stat.warn{border-color:#f59e0b;background:#fffbeb}
    .stat.running{border-color:#3b82f6;background:#eff6ff}

    /* Form */
    .form-row{display:flex;flex-direction:column;gap:6px}
    .form-row label{font-size:13px;font-weight:600;color:#374151}
    .form-row input{padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px}
    .form-row input:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.1)}
    .actions{display:flex;gap:10px;align-items:center;margin-top:8px;flex-wrap:wrap}
    .msg{font-size:14px;font-weight:500}

    /* Buttons */
    .btn{padding:10px 20px;border:none;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;transition:.15s}
    .btn.blue{background:#3b82f6;color:#fff}.btn.blue:hover{background:#2563eb}
    .btn.green{background:#10b981;color:#fff}.btn.green:hover{background:#059669}
    .btn.red{background:#ef4444;color:#fff}.btn.red:hover{background:#dc2626}
    .btn.outline{background:#fff;color:#475569;border:1px solid #d1d5db}.btn.outline:hover{border-color:#3b82f6;color:#3b82f6}
    .btn.orange{background:#f59e0b;color:#fff}.btn.orange:hover{background:#d97706}
    .btn.sm{padding:6px 12px;font-size:12px}
    .btn-group{display:flex;gap:6px;align-items:center}
    .btn:disabled{opacity:.5;cursor:not-allowed}

    /* System actions */
    .system-actions{margin-top:20px;display:flex;flex-direction:column;gap:16px}
    .system-row{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;gap:16px;flex-wrap:wrap}
    .system-row strong{font-size:14px;color:#1e293b}
    .system-row .desc{margin:2px 0 0;font-size:12px}
    .cleanup-msg{display:block;padding:8px 12px;background:#ecfdf5;border-radius:6px;font-size:13px}

    /* Toggle */
    .toggle-switch{display:flex;align-items:center;gap:10px;cursor:pointer;user-select:none}
    .toggle-switch input{display:none}
    .toggle-slider{position:relative;width:44px;height:24px;background:#cbd5e1;border-radius:12px;transition:.2s;flex-shrink:0}
    .toggle-slider::after{content:'';position:absolute;top:3px;left:3px;width:18px;height:18px;background:#fff;border-radius:50%;transition:.2s}
    .toggle-switch input:checked + .toggle-slider{background:#10b981}
    .toggle-switch input:checked + .toggle-slider::after{left:23px}
    .toggle-label{font-size:13px;font-weight:500;color:#475569;white-space:nowrap}

    /* UI toggles */
    .ui-toggles{display:flex;flex-direction:column;gap:0;margin-top:12px}
    .ui-toggle-row{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid #f1f5f9;gap:16px}
    .ui-toggle-row:last-child{border-bottom:none}
    .ui-toggle-info{display:flex;align-items:center;gap:12px}
    .ui-toggle-icon{font-size:20px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:#f1f5f9;border-radius:8px;flex-shrink:0}
    .ui-toggle-info strong{display:block;font-size:14px;color:#1e293b}
    .ui-toggle-info small{color:#64748b;font-size:12px}

    @media(max-width:768px){
        .settings-grid{grid-template-columns:1fr}
        .stats-grid{grid-template-columns:repeat(2,1fr)}
    }

    /* Homepage settings */
    .form-group{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
    .form-group label{font-size:13px;font-weight:600;color:#374151}
    .form-group input[type="text"]{padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;width:100%;box-sizing:border-box}
    .form-group input[type="text"]:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.1)}
    .btn-save{padding:10px 20px;background:#10b981;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:.15s}
    .btn-save:hover{background:#059669}
    .btn-save:disabled{opacity:.5;cursor:not-allowed}
    .save-msg{font-size:14px;font-weight:500;color:#10b981}
    .ui-toggle-name{display:block;font-size:14px;font-weight:600;color:#1e293b}
    .ui-toggle-desc{display:block;font-size:12px;color:#64748b}

    /* Price drops */
    .drops-mode{display:flex;gap:8px;margin-top:8px}
    .mode-opt{display:flex;align-items:flex-start;gap:10px;padding:14px 16px;background:#fff;border:2px solid #e5e7eb;border-radius:10px;text-align:left;cursor:pointer;transition:.15s;flex:1}
    .mode-opt:hover{border-color:#c4956a}
    .mode-opt.active{border-color:#c4956a;background:#fef7f0}
    .mode-radio{font-size:18px;color:#c4956a;flex-shrink:0;margin-top:2px}
    .mode-opt strong{display:block;font-size:14px;color:#1e293b}
    .mode-opt small{display:block;font-size:12px;color:#64748b;margin-top:2px}
    .drops-results{margin-top:8px;border:1px solid #e5e7eb;border-radius:8px;max-height:300px;overflow-y:auto}
    .drops-result{display:flex;align-items:center;gap:10px;padding:8px 12px;width:100%;text-align:left;border:none;background:none;border-bottom:1px solid #f3f4f6;cursor:pointer;transition:background .1s}
    .drops-result:hover{background:#f8fafc}
    .drops-result:last-child{border-bottom:none}
    .drops-result__img{width:36px;height:36px;border-radius:6px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;font-size:14px}
    .drops-result__img img{width:100%;height:100%;object-fit:cover}
    .drops-result__info{flex:1;min-width:0}
    .drops-result__info span:first-child{display:block;font-size:13px;font-weight:500;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .drops-result__price{display:block;font-size:12px;color:#64748b}
    .drops-result__price s{color:#94a3b8;margin-left:4px}
    .drops-result__price em{color:#059669;font-style:normal;font-weight:600;margin-left:4px}
    .drops-result__add{padding:4px 10px;background:#ecfdf5;color:#059669;border-radius:6px;font-size:11px;font-weight:700;white-space:nowrap;flex-shrink:0}
    .drops-selected{margin-top:16px}
    .drops-sel{display:flex;align-items:center;gap:8px;padding:8px 12px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:4px}
    .drops-sel__num{width:22px;height:22px;border-radius:6px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#64748b;flex-shrink:0}
    .drops-sel__img{width:32px;height:32px;border-radius:6px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;font-size:12px}
    .drops-sel__img img{width:100%;height:100%;object-fit:cover}
    .drops-sel__info{flex:1;font-size:13px;font-weight:500;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .drops-sel__rm{width:24px;height:24px;border-radius:6px;background:#fef2f2;border:none;color:#ef4444;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;font-size:13px}
    .drops-sel__rm:hover{background:#ef4444;color:#fff}
    .field-label{display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:6px}
    .input{padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;width:100%;box-sizing:border-box}
    .input:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.1)}
</style>
