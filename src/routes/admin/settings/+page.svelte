<script>
    import { onMount } from 'svelte';

    const API_BASE = 'http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io/api/v1';

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

    onMount(async () => {
        await Promise.all([loadSystemInfo(), loadSiteSettings()]);
        loading = false;
    });

    async function apiFetch(endpoint, opts = {}) {
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, {
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
            const res = await fetch(`${API_BASE}/admin/upload-logo`, {
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
    .toggle-slider{position:relative;width:44px;height:24px;background:#cbd5e1;border-radius:12px;transition:.2s}
    .toggle-slider::after{content:'';position:absolute;top:3px;left:3px;width:18px;height:18px;background:#fff;border-radius:50%;transition:.2s}
    .toggle-switch input:checked + .toggle-slider{background:#10b981}
    .toggle-switch input:checked + .toggle-slider::after{left:23px}
    .toggle-label{font-size:13px;font-weight:500;color:#475569}

    @media(max-width:768px){
        .settings-grid{grid-template-columns:1fr}
        .stats-grid{grid-template-columns:repeat(2,1fr)}
    }
</style>
