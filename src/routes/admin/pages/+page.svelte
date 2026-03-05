<script>
    import { onMount } from 'svelte';
    
    const API_BASE = typeof window !== 'undefined' ? window.location.origin + '/api/v1' : '';
    
    let pages = [
        { 
            id: 'vop', 
            title: 'Všeobecné obchodné podmienky',
            subtitle: 'VOP pre inzerentov (B2B)',
            route: '/vseobecne-obchodne-podmienky',
            icon: '📋',
            status: 'active',
            sections: 13,
        },
        { 
            id: 'podmienky', 
            title: 'Podmienky používania',
            subtitle: 'Pre návštevníkov (B2C)',
            route: '/podmienky-pouzivania',
            icon: '📝',
            status: 'active',
            sections: 7,
        },
        { 
            id: 'gdpr', 
            title: 'Ochrana osobných údajov',
            subtitle: 'Privacy Policy – GDPR',
            route: '/ochrana-osobnych-udajov',
            icon: '🔒',
            status: 'active',
            sections: 8,
        },
        { 
            id: 'cookies', 
            title: 'Zásady cookies',
            subtitle: 'Cookie Policy – ePrivacy',
            route: '/zasady-cookies',
            icon: '🍪',
            status: 'active',
            sections: 6,
        },
        { 
            id: 'impressum', 
            title: 'Impressum',
            subtitle: 'Firemné údaje – povinné EÚ',
            route: '/impressum',
            icon: '🏢',
            status: 'active',
            sections: 4,
        },
    ];
    
    let companyInfo = {
        name: 'Megabuy s.r.o.',
        ico: '57211019',
        city: 'Žilina',
        email: 'info@megabuy.sk',
        gdpr_email: 'gdpr@megabuy.sk',
        web: 'https://www.megabuy.sk',
        valid_from: '1. januára 2025',
        updated: '4. marca 2026',
    };
    
    let saving = false;
    let msg = '';
    let footerLinks = true;
    
    async function apiFetch(url, opts = {}) {
        const token = localStorage.getItem('admin_token');
        const res = await fetch(API_BASE + url, {
            ...opts,
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...(opts.headers || {}) }
        });
        return res.json();
    }
    
    onMount(async () => {
        // Load saved company info from admin settings
        try {
            const res = await apiFetch('/admin/site-settings');
            if (res?.data?.legal_company_info) {
                try { companyInfo = JSON.parse(res.data.legal_company_info); } catch(e) {}
            }
            if (res?.data?.legal_footer_links !== undefined) {
                footerLinks = res.data.legal_footer_links !== 'false';
            }
        } catch(e) {}
    });
    
    async function saveCompanyInfo() {
        saving = true; msg = '';
        try {
            await apiFetch('/admin/toggle-ui-setting', {
                method: 'POST',
                body: JSON.stringify({ key: 'legal_company_info', value: JSON.stringify(companyInfo) })
            });
            await apiFetch('/admin/toggle-ui-setting', {
                method: 'POST',
                body: JSON.stringify({ key: 'legal_footer_links', value: footerLinks ? 'true' : 'false' })
            });
            msg = '✅ Uložené';
        } catch(e) {
            msg = '❌ Chyba pri ukladaní';
        }
        saving = false;
        setTimeout(() => msg = '', 3000);
    }
    
    function openPage(route) {
        window.open(route, '_blank');
    }
</script>

<svelte:head><title>Stránky | Admin</title></svelte:head>

<div class="pages-admin">
    <div class="pages-header">
        <div>
            <h1>📄 Stránky</h1>
            <p class="subtitle">Správa právnych a informačných stránok</p>
        </div>
    </div>
    
    <!-- Pages list -->
    <div class="pages-grid">
        {#each pages as page}
            <div class="page-card">
                <div class="page-card-top">
                    <span class="page-icon">{page.icon}</span>
                    <div class="page-info">
                        <h3>{page.title}</h3>
                        <p>{page.subtitle}</p>
                    </div>
                    <span class="page-status" class:active={page.status === 'active'}>
                        {page.status === 'active' ? '● Aktívna' : '○ Neaktívna'}
                    </span>
                </div>
                <div class="page-card-meta">
                    <span class="meta-item"><code>{page.route}</code></span>
                    <span class="meta-item">{page.sections} článkov</span>
                </div>
                <div class="page-card-actions">
                    <button class="btn-view" on:click={() => openPage(page.route)}>
                        👁️ Zobraziť
                    </button>
                    <button class="btn-copy" on:click={() => { navigator.clipboard.writeText(window.location.origin + page.route); }}>
                        📋 Kopírovať URL
                    </button>
                </div>
            </div>
        {/each}
    </div>
    
    <!-- Company info editor -->
    <div class="section-card">
        <div class="section-header">
            <h2>🏢 Firemné údaje</h2>
            <p>Tieto údaje sa zobrazujú vo všetkých právnych dokumentoch. Zmeny sa prejavia po úprave zdrojových súborov stránok.</p>
        </div>
        <div class="form-grid">
            <div class="form-group">
                <label>Obchodné meno</label>
                <input type="text" bind:value={companyInfo.name}>
            </div>
            <div class="form-group">
                <label>IČO</label>
                <input type="text" bind:value={companyInfo.ico}>
            </div>
            <div class="form-group">
                <label>Sídlo</label>
                <input type="text" bind:value={companyInfo.city}>
            </div>
            <div class="form-group">
                <label>E-mail (všeobecný)</label>
                <input type="email" bind:value={companyInfo.email}>
            </div>
            <div class="form-group">
                <label>E-mail (GDPR)</label>
                <input type="email" bind:value={companyInfo.gdpr_email}>
            </div>
            <div class="form-group">
                <label>Web</label>
                <input type="url" bind:value={companyInfo.web}>
            </div>
            <div class="form-group">
                <label>Platné od</label>
                <input type="text" bind:value={companyInfo.valid_from}>
            </div>
            <div class="form-group">
                <label>Aktualizované</label>
                <input type="text" bind:value={companyInfo.updated}>
            </div>
        </div>
        
        <div class="section-footer">
            <label class="toggle-row">
                <input type="checkbox" bind:checked={footerLinks}>
                <span>Zobraziť odkazy na právne stránky v pätičke webu</span>
            </label>
            <div class="save-row">
                <button class="btn-save" on:click={saveCompanyInfo} disabled={saving}>
                    {saving ? 'Ukladám...' : '💾 Uložiť údaje'}
                </button>
                {#if msg}<span class="save-msg">{msg}</span>{/if}
            </div>
        </div>
    </div>
    
    <!-- Quick links -->
    <div class="section-card">
        <div class="section-header">
            <h2>🔗 Rýchle odkazy pre pätu webu</h2>
            <p>HTML kód pre vloženie do footer sekcie:</p>
        </div>
        <div class="code-block">
            <code>&lt;a href="/vseobecne-obchodne-podmienky"&gt;VOP&lt;/a&gt; · &lt;a href="/podmienky-pouzivania"&gt;Podmienky&lt;/a&gt; · &lt;a href="/ochrana-osobnych-udajov"&gt;Ochrana údajov&lt;/a&gt; · &lt;a href="/zasady-cookies"&gt;Cookies&lt;/a&gt; · &lt;a href="/impressum"&gt;Impressum&lt;/a&gt;</code>
        </div>
    </div>
</div>

<style>
.pages-admin { max-width: 960px; }

.pages-header { margin-bottom: 24px; }
.pages-header h1 { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
.subtitle { font-size: 14px; color: #64748b; margin: 0; }

.pages-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 28px; }

.page-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; transition: all 0.15s; }
.page-card:hover { border-color: #c4956a; box-shadow: 0 2px 12px rgba(196,149,106,0.1); }
.page-card-top { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
.page-icon { font-size: 28px; flex-shrink: 0; }
.page-info { flex: 1; min-width: 0; }
.page-info h3 { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 2px; }
.page-info p { font-size: 12px; color: #94a3b8; margin: 0; }
.page-status { font-size: 11px; font-weight: 600; white-space: nowrap; }
.page-status.active { color: #10b981; }
.page-card-meta { display: flex; gap: 12px; margin-bottom: 12px; }
.meta-item { font-size: 12px; color: #64748b; }
.meta-item code { font-size: 11px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #475569; }
.page-card-actions { display: flex; gap: 8px; }
.btn-view, .btn-copy { flex: 1; padding: 7px 10px; border: 1px solid #e2e8f0; border-radius: 6px; background: #fff; font-size: 12px; cursor: pointer; transition: all 0.15s; color: #475569; }
.btn-view:hover { background: #f8fafc; border-color: #c4956a; color: #c4956a; }
.btn-copy:hover { background: #f8fafc; }

.section-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
.section-header { margin-bottom: 20px; }
.section-header h2 { font-size: 17px; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
.section-header p { font-size: 13px; color: #94a3b8; margin: 0; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-group label { font-size: 12px; font-weight: 600; color: #64748b; }
.form-group input { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; color: #1e293b; transition: border-color 0.15s; }
.form-group input:focus { outline: none; border-color: #c4956a; }

.section-footer { margin-top: 20px; padding-top: 16px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
.toggle-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #475569; cursor: pointer; }
.toggle-row input { accent-color: #c4956a; }
.save-row { display: flex; align-items: center; gap: 10px; }
.btn-save { padding: 8px 18px; background: #c4956a; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
.btn-save:hover { background: #a87d58; }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.save-msg { font-size: 13px; font-weight: 500; }

.code-block { background: #0f172a; border-radius: 8px; padding: 14px 18px; overflow-x: auto; }
.code-block code { font-size: 12px; color: #94a3b8; line-height: 1.6; white-space: pre-wrap; word-break: break-all; }

@media (max-width: 768px) {
    .pages-grid { grid-template-columns: 1fr; }
    .form-grid { grid-template-columns: 1fr; }
    .section-footer { flex-direction: column; align-items: flex-start; }
}
</style>
