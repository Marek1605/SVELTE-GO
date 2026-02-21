<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';

    let sidebarCollapsed = false;
    let openGroups = { catalog: true, vendors: true, tools: true, system: true };

    // Auth
    let authed = false;
    let loginUser = '';
    let loginPass = '';
    let loginError = '';
    let checking = true;

    const API = 'http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io/api/v1';

    function getAuthHeader() {
        const u = localStorage.getItem('adm_u') || '';
        const p = localStorage.getItem('adm_p') || '';
        if (!u || !p) return null;
        return 'Basic ' + btoa(u + ':' + p);
    }

    // Make auth header globally accessible
    function setGlobalAuth() {
        const h = getAuthHeader();
        if (h && typeof window !== 'undefined') {
            window.__adminAuth = h;
        }
    }

    async function checkAuth() {
        checking = true;
        const h = getAuthHeader();
        if (!h) { checking = false; return; }
        try {
            const r = await fetch(`${API}/admin/dashboard`, { headers: { 'Authorization': h } });
            if (r.ok) { authed = true; setGlobalAuth(); }
            else { localStorage.removeItem('adm_u'); localStorage.removeItem('adm_p'); }
        } catch(e) {}
        checking = false;
    }

    async function doLogin() {
        loginError = '';
        const h = 'Basic ' + btoa(loginUser + ':' + loginPass);
        try {
            const r = await fetch(`${API}/admin/dashboard`, { headers: { 'Authorization': h } });
            if (r.ok) {
                localStorage.setItem('adm_u', loginUser);
                localStorage.setItem('adm_p', loginPass);
                authed = true;
                setGlobalAuth();
            } else {
                loginError = 'Nesprávne meno alebo heslo';
            }
        } catch(e) { loginError = 'Chyba pripojenia'; }
    }

    function doLogout() {
        localStorage.removeItem('adm_u');
        localStorage.removeItem('adm_p');
        window.__adminAuth = null;
        authed = false;
        loginUser = ''; loginPass = '';
    }

    onMount(() => { checkAuth(); });

    function toggleGroup(g) { openGroups[g] = !openGroups[g]; openGroups = openGroups; }
    function toggleSidebar() { sidebarCollapsed = !sidebarCollapsed; }

    const groups = [
        { key: 'catalog', label: 'Katalóg', items: [
            { href: '/admin/products', label: 'Produkty', icon: '📦' },
            { href: '/admin/product-stats', label: 'TOP & Štatistiky', icon: '📊' },
            { href: '/admin/categories', label: 'Kategórie', icon: '📁' },
            { href: '/admin/filters', label: 'Filtre', icon: '🎛️' },
        ]},
        { key: 'vendors', label: 'Predajcovia', items: [
            { href: '/admin/vendors', label: 'Zoznam predajcov', icon: '👥' },
            { href: '/admin/pending-shops', label: 'Nové obchody', icon: '⏳' },
            { href: '/admin/vendor-offers', label: 'Ponuky vendorov', icon: '🏪' },
            { href: '/admin/offers', label: 'Feedy predajcov', icon: '📋' },
        ]},
        { key: 'tools', label: 'Import & AI', items: [
            { href: '/admin/feeds', label: 'Feed Import', icon: '📥' },
            { href: '/admin/ai-settings', label: 'AI Kategorizácia', icon: '🤖' },
        ]},
        { key: 'system', label: 'Systém', items: [
            { href: '/admin/settings', label: 'Nastavenia', icon: '⚙️' },
        ]},
    ];

    function isActive(href) {
        const p = $page.url.pathname;
        if (href === '/admin') return p === '/admin';
        return p === href || p.startsWith(href + '/');
    }
    function groupHasActive(group) {
        return group.items.some(i => isActive(i.href));
    }
</script>

<svelte:head>
    <title>Admin | MegaPrice</title>
    <meta name="robots" content="noindex">
</svelte:head>

<div class="adm" class:collapsed={sidebarCollapsed}>
{#if checking}
    <div class="login-wrap"><div class="login-box"><p>Overujem...</p></div></div>
{:else if !authed}
    <div class="login-wrap">
        <div class="login-box">
            <div class="login-logo"><span>M</span></div>
            <h2>MegaPrice Admin</h2>
            <form on:submit|preventDefault={doLogin}>
                <input type="text" placeholder="Meno" bind:value={loginUser} autocomplete="username">
                <input type="password" placeholder="Heslo" bind:value={loginPass} autocomplete="current-password">
                {#if loginError}<div class="login-err">{loginError}</div>{/if}
                <button type="submit">Prihlásiť</button>
            </form>
        </div>
    </div>
{:else}
    <aside class="sb">
        <div class="sb__top">
            <a href="/admin" class="sb__logo">
                <span class="sb__logo-icon">M</span>
                {#if !sidebarCollapsed}<span class="sb__logo-text"><strong>MegaPrice</strong><small>Admin Panel</small></span>{/if}
            </a>
            <button class="sb__toggle" on:click={toggleSidebar} title={sidebarCollapsed ? 'Rozbaliť' : 'Zbaliť'}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    {#if sidebarCollapsed}<path d="M9 18l6-6-6-6"/>{:else}<path d="M15 18l-6-6 6-6"/>{/if}
                </svg>
            </button>
        </div>

        <a href="/admin" class="sb__link sb__link--dash" class:active={$page.url.pathname === '/admin'}>
            <span class="sb__link-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg></span>
            {#if !sidebarCollapsed}<span>Dashboard</span>{/if}
        </a>

        <nav class="sb__nav">
            {#each groups as group}
                <div class="sb__group" class:is-open={openGroups[group.key]} class:has-active={groupHasActive(group)}>
                    {#if !sidebarCollapsed}
                        <button class="sb__group-head" on:click={() => toggleGroup(group.key)}>
                            <span class="sb__group-label">{group.label}</span>
                            <svg class="sb__group-chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                        </button>
                    {/if}
                    {#if openGroups[group.key] || sidebarCollapsed}
                        <div class="sb__items">
                            {#each group.items as item}
                                <a href={item.href} class="sb__link" class:active={isActive(item.href)} title={sidebarCollapsed ? item.label : ''}>
                                    <span class="sb__link-icon">{item.icon}</span>
                                    {#if !sidebarCollapsed}<span>{item.label}</span>{/if}
                                </a>
                            {/each}
                        </div>
                    {/if}
                </div>
            {/each}
        </nav>

        <div class="sb__foot">
            <a href="/" class="sb__link" target="_blank" title="Zobraziť web">
                <span class="sb__link-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></span>
                {#if !sidebarCollapsed}<span>Zobraziť web</span>{/if}
            </a>
            <button class="sb__link sb__logout" on:click={doLogout} title="Odhlásiť">
                <span class="sb__link-icon">🚪</span>
                {#if !sidebarCollapsed}<span>Odhlásiť</span>{/if}
            </button>
        </div>
    </aside>

    <main class="adm__main">
        <slot />
    </main>
{/if}
</div>

<style>
:global(*){box-sizing:border-box}
:global(body){margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f1f5f9}

.adm{display:flex;min-height:100vh}

/* === SIDEBAR === */
.sb{
    width:230px;background:#0f172a;color:#fff;
    position:fixed;top:0;left:0;height:100vh;
    display:flex;flex-direction:column;z-index:100;
    transition:width 0.2s ease;overflow:hidden;
}
.adm.collapsed .sb{width:56px}

/* Top */
.sb__top{
    display:flex;align-items:center;justify-content:space-between;
    padding:14px 12px;border-bottom:1px solid #1e293b;
    min-height:54px;
}
.sb__logo{display:flex;align-items:center;gap:9px;text-decoration:none;color:#fff;overflow:hidden}
.sb__logo-icon{
    width:28px;height:28px;
    background:linear-gradient(135deg,#f59e0b,#d97706);
    border-radius:7px;display:flex;align-items:center;justify-content:center;
    font-weight:800;font-size:14px;color:#fff;flex-shrink:0;
}
.sb__logo-text{line-height:1.2;white-space:nowrap}
.sb__logo-text strong{display:block;font-size:14px;font-weight:700}
.sb__logo-text small{font-size:10px;color:#64748b;font-weight:400}
.sb__toggle{
    width:26px;height:26px;display:flex;align-items:center;justify-content:center;
    background:transparent;border:none;border-radius:6px;color:#475569;
    cursor:pointer;flex-shrink:0;transition:all 0.15s;
}
.sb__toggle:hover{color:#94a3b8;background:#1e293b}

/* Nav */
.sb__nav{flex:1;overflow-y:auto;padding:6px 0;scrollbar-width:none}
.sb__nav::-webkit-scrollbar{display:none}

/* Dashboard + links */
.sb__link{
    display:flex;align-items:center;gap:10px;
    padding:9px 14px;margin:1px 8px;
    text-decoration:none;color:#94a3b8;
    border-radius:7px;font-size:13px;font-weight:500;
    transition:all 0.12s;white-space:nowrap;overflow:hidden;
}
.sb__link:hover{color:#e2e8f0;background:#1e293b}
.sb__link.active{color:#fff;background:#1e293b;box-shadow:inset 3px 0 0 #f59e0b}
.sb__link--dash{margin:8px 8px 4px;font-weight:600}
.sb__link-icon{flex-shrink:0;width:20px;text-align:center;display:flex;align-items:center;justify-content:center;font-size:14px}

/* Group headers */
.sb__group{margin-bottom:2px}
.sb__group-head{
    display:flex;align-items:center;width:100%;
    padding:8px 16px;margin-top:4px;
    background:none;border:none;
    color:#475569;font-size:10px;font-weight:700;
    text-transform:uppercase;letter-spacing:0.8px;
    cursor:pointer;transition:color 0.15s;
}
.sb__group-head:hover{color:#94a3b8}
.sb__group-label{flex:1;text-align:left}
.sb__group-chev{color:#334155;transition:transform 0.2s;flex-shrink:0}
.sb__group.is-open .sb__group-chev{transform:rotate(180deg)}
.sb__group.has-active .sb__group-head{color:#64748b}
.sb__items{padding:0 0 4px}

/* Collapsed */
.adm.collapsed .sb__link{justify-content:center;padding:10px 0;margin:1px 4px}
.adm.collapsed .sb__link--dash{margin:6px 4px}
.adm.collapsed .sb__items{padding:0 0 6px}
.adm.collapsed .sb__group{border-bottom:1px solid #1e293b;margin-bottom:0}

/* Footer */
.sb__foot{padding:8px 0 12px;border-top:1px solid #1e293b}
.sb__foot .sb__link{color:#475569;font-size:12px}
.sb__foot .sb__link:hover{color:#94a3b8}

/* === MAIN === */
.adm__main{
    flex:1;margin-left:230px;min-height:100vh;background:#f8fafc;
    transition:margin-left 0.2s ease;
}
.adm.collapsed .adm__main{margin-left:56px}

@media(max-width:768px){
    .sb{width:56px}
    .sb__logo-text,.sb__group-head,.sb__link span:not(.sb__link-icon){display:none}
    .sb__link{justify-content:center;padding:10px 0;margin:1px 4px}
    .sb__items{padding:0 0 6px}
    .adm__main{margin-left:56px}
}
</style>
