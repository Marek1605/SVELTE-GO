<script>
    import { getContext } from 'svelte';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    
    const API_BASE = getContext('API_BASE');
    
    let shopName = '';
    let shopUrl = '';
    let loading = false;
    let error = '';
    
    async function createShop() {
        if (!shopName.trim()) {
            error = 'Zadajte názov obchodu';
            return;
        }
        
        loading = true;
        error = '';
        
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(`${API_BASE}/vendor/shops`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    shop_name: shopName,
                    shop_url: shopUrl
                })
            });
            
            const data = await res.json();
            if (data.success) {
                goto('/vendor-dashboard');
            } else {
                error = data.message || 'Chyba pri vytváraní obchodu';
            }
        } catch (e) {
            error = 'Chyba pripojenia';
        }
        loading = false;
    }
</script>

<div class="add-shop-page">
    <div class="add-shop-card">
        <h1>➕ Pridať nový obchod</h1>
        <p>Vytvorte nový obchod pre správu produktov</p>
        
        {#if error}
            <div class="add-shop-error">{error}</div>
        {/if}
        
        <div class="add-shop-form">
            <div class="form-group">
                <label>Názov obchodu *</label>
                <input type="text" bind:value={shopName} placeholder="Môj E-shop" />
            </div>
            
            <div class="form-group">
                <label>URL obchodu</label>
                <input type="url" bind:value={shopUrl} placeholder="https://moj-eshop.sk" />
            </div>
            
            <div class="form-actions">
                <a href="/vendor-dashboard" class="btn btn-secondary">← Späť</a>
                <button class="btn btn-primary" on:click={createShop} disabled={loading}>
                    {loading ? 'Vytváram...' : 'Vytvoriť obchod'}
                </button>
            </div>
        </div>
    </div>
</div>

<style>
    .add-shop-page { max-width: 500px; margin: 40px auto; padding: 0 20px; }
    .add-shop-card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .add-shop-card h1 { font-size: 24px; margin: 0 0 8px; }
    .add-shop-card p { color: #6b7280; margin: 0 0 24px; }
    .add-shop-error { background: #fee2e2; color: #dc2626; padding: 12px; border-radius: 8px; margin-bottom: 16px; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-weight: 500; margin-bottom: 6px; }
    .form-group input { width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 15px; }
    .form-actions { display: flex; gap: 12px; margin-top: 24px; }
    .btn { padding: 12px 24px; border-radius: 8px; font-weight: 500; cursor: pointer; text-decoration: none; display: inline-block; }
    .btn-secondary { background: #f3f4f6; border: 1px solid #d1d5db; color: #374151; }
    .btn-primary { background: #3b82f6; border: none; color: white; flex: 1; }
    .btn-primary:hover { background: #2563eb; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
