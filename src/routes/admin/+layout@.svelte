<script>
    import { page } from '$app/stores';
    
    const menuItems = [
        { href: '/admin', label: 'Dashboard', icon: '📊' },
        { href: '/admin/products', label: 'Produkty', icon: '📦' },
        { href: '/admin/vendors', label: 'Predajcovia', icon: '👥' },
        { href: '/admin/vendor-offers', label: 'Ponuky vendorov', icon: '🏪' },
        { href: '/admin/offers', label: 'Feedy predajcov', icon: '📥' },
        { href: '/admin/feeds', label: 'Feed Import', icon: '📥' },
        { href: '/admin/categories', label: 'Kategórie', icon: '📁' },
        { href: '/admin/filters', label: 'Filtre', icon: '🎛️' },
    ];
</script>

<svelte:head>
    <title>Admin | MegaPrice</title>
    <meta name="robots" content="noindex">
</svelte:head>

<!-- This resets ALL parent layouts because of @ in filename -->

<div class="admin-wrapper">
    <aside class="sidebar">
        <div class="logo">
            <a href="/admin">
                <strong>MegaPrice</strong>
                <span>Admin Panel</span>
            </a>
        </div>
        
        <nav class="nav">
            {#each menuItems as item}
                <a 
                    href={item.href} 
                    class="nav-link"
                    class:active={$page.url.pathname === item.href || 
                                  ($page.url.pathname.startsWith(item.href + '/') && item.href !== '/admin') ||
                                  ($page.url.pathname === item.href)}
                >
                    {item.label}
                </a>
            {/each}
        </nav>
        
        <div class="sidebar-footer">
            <a href="/" class="nav-link" target="_blank">
                Zobraziť web
            </a>
        </div>
    </aside>
    
    <main class="main-content">
        <slot />
    </main>
</div>

<style>
    :global(*) {
        box-sizing: border-box;
    }
    
    :global(body) {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #f1f5f9;
    }

    .admin-wrapper {
        display: flex;
        min-height: 100vh;
    }

    .sidebar {
        width: 220px;
        background: #1e293b;
        color: white;
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        display: flex;
        flex-direction: column;
        z-index: 100;
    }

    .logo {
        padding: 24px 20px;
        border-bottom: 1px solid #334155;
    }

    .logo a {
        text-decoration: none;
        color: white;
        display: block;
    }

    .logo strong {
        display: block;
        font-size: 20px;
        color: #fbbf24;
    }

    .logo span {
        font-size: 12px;
        color: #94a3b8;
    }

    .nav {
        flex: 1;
        padding: 16px 0;
    }

    .nav-link {
        display: block;
        padding: 12px 20px;
        color: #94a3b8;
        text-decoration: none;
        font-size: 14px;
        transition: all 0.2s;
        border-left: 3px solid transparent;
    }

    .nav-link:hover {
        background: #334155;
        color: white;
    }

    .nav-link.active {
        background: #334155;
        color: white;
        border-left-color: #fbbf24;
    }

    .sidebar-footer {
        padding: 16px 0;
        border-top: 1px solid #334155;
    }

    .main-content {
        flex: 1;
        margin-left: 220px;
        min-height: 100vh;
        background: #f8fafc;
    }
</style>
