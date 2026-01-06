<script>
    import { page } from '$app/stores';
    import '../../app.css';
</script>

<div class="admin">
    <!-- Admin Sidebar -->
    <aside class="admin-sidebar">
        <div class="admin-sidebar__header">
            <a href="/admin" class="admin-logo">
                <span class="admin-logo__icon">⚙️</span>
                <span class="admin-logo__text">MegaPrice</span>
            </a>
        </div>
        
        <nav class="admin-nav">
            <div class="admin-nav__section">
                <div class="admin-nav__title">Hlavné</div>
                <a href="/admin" class="admin-nav__link" class:active={$page.url.pathname === '/admin'}>
                    <span class="admin-nav__icon">📊</span>
                    Dashboard
                </a>
                <a href="/admin/products" class="admin-nav__link" class:active={$page.url.pathname.startsWith('/admin/products')}>
                    <span class="admin-nav__icon">📦</span>
                    Produkty
                </a>
                <a href="/admin/feeds" class="admin-nav__link" class:active={$page.url.pathname.startsWith('/admin/feeds')}>
                    <span class="admin-nav__icon">📥</span>
                    Feed Import
                </a>
                <a href="/admin/filters" class="admin-nav__link" class:active={$page.url.pathname.startsWith('/admin/filters')}>
                    <span class="admin-nav__icon">🎛️</span>
                    Filtre
                </a>
            </div>
            
            <div class="admin-nav__section">
                <div class="admin-nav__title">Nastavenia</div>
                <a href="/admin/categories" class="admin-nav__link" class:active={$page.url.pathname.startsWith('/admin/categories')}>
                    <span class="admin-nav__icon">📁</span>
                    Kategórie
                </a>
                <a href="/admin/shops" class="admin-nav__link" class:active={$page.url.pathname.startsWith('/admin/shops')}>
                    <span class="admin-nav__icon">🏪</span>
                    Obchody
                </a>
                <a href="/admin/settings" class="admin-nav__link" class:active={$page.url.pathname.startsWith('/admin/settings')}>
                    <span class="admin-nav__icon">⚙️</span>
                    Nastavenia
                </a>
            </div>
        </nav>
        
        <div class="admin-sidebar__footer">
            <a href="/" class="admin-nav__link admin-nav__link--external">
                <span class="admin-nav__icon">🌐</span>
                Zobraziť web
            </a>
        </div>
    </aside>
    
    <!-- Admin Content -->
    <main class="admin-main">
        <slot />
    </main>
</div>

<style>
/* =============================================
   ADMIN LAYOUT - SEPARATE FROM MAIN SITE
   ============================================= */

:global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #f1f5f9;
}

.admin {
    display: flex;
    min-height: 100vh;
}

/* Sidebar */
.admin-sidebar {
    width: 260px;
    background: #1e293b;
    color: #fff;
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 100;
}

.admin-sidebar__header {
    padding: 20px;
    border-bottom: 1px solid #334155;
}

.admin-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #fff;
    text-decoration: none;
}

.admin-logo__icon {
    font-size: 24px;
}

.admin-logo__text {
    font-size: 20px;
    font-weight: 700;
    color: #c4956a;
}

/* Navigation */
.admin-nav {
    flex: 1;
    padding: 20px 0;
    overflow-y: auto;
}

.admin-nav__section {
    margin-bottom: 24px;
}

.admin-nav__title {
    padding: 0 20px 8px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #64748b;
}

.admin-nav__link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    color: #94a3b8;
    text-decoration: none;
    font-size: 14px;
    transition: all 0.15s;
}

.admin-nav__link:hover {
    background: #334155;
    color: #fff;
}

.admin-nav__link.active {
    background: #c4956a;
    color: #fff;
}

.admin-nav__icon {
    font-size: 18px;
    width: 24px;
    text-align: center;
}

.admin-nav__link--external {
    border-top: 1px solid #334155;
    margin-top: auto;
}

.admin-sidebar__footer {
    border-top: 1px solid #334155;
    padding: 10px 0;
}

/* Main Content */
.admin-main {
    flex: 1;
    margin-left: 260px;
    padding: 24px;
    min-height: 100vh;
}

/* Responsive */
@media (max-width: 1024px) {
    .admin-sidebar {
        width: 220px;
    }
    .admin-main {
        margin-left: 220px;
    }
}

@media (max-width: 768px) {
    .admin-sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s;
    }
    .admin-sidebar.open {
        transform: translateX(0);
    }
    .admin-main {
        margin-left: 0;
    }
}
</style>
