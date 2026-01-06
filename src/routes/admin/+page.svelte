<script>
    import { onMount } from 'svelte';
    import { api } from '$lib/api';
    
    let stats = {
        products: 0,
        categories: 0,
        feeds: 0
    };
    let loading = true;
    
    onMount(async () => {
        try {
            const result = await api.getDashboard();
            if (result?.success && result?.data) {
                stats = result.data;
            } else if (result && !result.success) {
                // Use defaults
            }
        } catch (err) {
            console.error('Dashboard error:', err);
        }
        loading = false;
    });
</script>

<svelte:head>
    <title>Dashboard | Admin | MegaPrice</title>
</svelte:head>

<div class="admin-page">
    <div class="admin-header">
        <h1 class="admin-title">Dashboard</h1>
    </div>
    
    {#if loading}
        <div class="admin-loading">Načítavam...</div>
    {:else}
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-card__icon">📦</div>
                <div class="stat-card__content">
                    <div class="stat-card__number">{stats.products?.toLocaleString() || 0}</div>
                    <div class="stat-card__label">Produktov</div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-card__icon">📁</div>
                <div class="stat-card__content">
                    <div class="stat-card__number">{stats.categories?.toLocaleString() || 0}</div>
                    <div class="stat-card__label">Kategórií</div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-card__icon">📥</div>
                <div class="stat-card__content">
                    <div class="stat-card__number">{stats.feeds || 0}</div>
                    <div class="stat-card__label">Feed zdrojov</div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-card__icon">🏷️</div>
                <div class="stat-card__content">
                    <div class="stat-card__number">{stats.attributes?.toLocaleString() || 0}</div>
                    <div class="stat-card__label">Atribútov</div>
                </div>
            </div>
        </div>
        
        <div class="admin-section">
            <h2>Rýchle akcie</h2>
            <div class="quick-actions">
                <a href="/admin/products" class="quick-action">
                    <span class="quick-action__icon">📦</span>
                    <span class="quick-action__text">Spravovať produkty</span>
                </a>
                <a href="/admin/feeds" class="quick-action">
                    <span class="quick-action__icon">📥</span>
                    <span class="quick-action__text">Importovať feed</span>
                </a>
                <a href="/admin/categories" class="quick-action">
                    <span class="quick-action__icon">📁</span>
                    <span class="quick-action__text">Spravovať kategórie</span>
                </a>
                <a href="/admin/filters" class="quick-action">
                    <span class="quick-action__icon">🎛️</span>
                    <span class="quick-action__text">Nastaviť filtre</span>
                </a>
            </div>
        </div>
    {/if}
</div>

<style>
.admin-page {
    max-width: 1200px;
}

.admin-header {
    margin-bottom: 32px;
}

.admin-title {
    font-size: 28px;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
}

.admin-loading {
    text-align: center;
    padding: 60px;
    color: #64748b;
}

/* Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 40px;
}

.stat-card {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.stat-card__icon {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #c4956a20, #c4956a10);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
}

.stat-card__number {
    font-size: 28px;
    font-weight: 700;
    color: #1e293b;
}

.stat-card__label {
    font-size: 14px;
    color: #64748b;
}

/* Section */
.admin-section {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.admin-section h2 {
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 20px 0;
}

/* Quick Actions */
.quick-actions {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
}

.quick-action {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 24px;
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    text-decoration: none;
    transition: all 0.2s;
}

.quick-action:hover {
    border-color: #c4956a;
    background: #faf8f5;
}

.quick-action__icon {
    font-size: 32px;
}

.quick-action__text {
    font-size: 14px;
    font-weight: 500;
    color: #1e293b;
    text-align: center;
}

/* Responsive */
@media (max-width: 1024px) {
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    .quick-actions {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 600px) {
    .stats-grid,
    .quick-actions {
        grid-template-columns: 1fr;
    }
}
</style>
