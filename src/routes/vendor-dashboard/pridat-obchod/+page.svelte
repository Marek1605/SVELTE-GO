<script>
    import { getContext } from 'svelte';
    import { goto } from '$app/navigation';
    
    const API_BASE = getContext('API_BASE');
    
    let shopName = '';
    let shopUrl = '';
    let shopLogo = '';
    let loading = false;
    let error = '';
    
    async function createShop() {
        if (!shopName.trim()) {
            error = 'Názov obchodu je povinný';
            return;
        }
        
        loading = true;
        error = '';
        
        try {
            const token = localStorage.getItem('vendor_token');
            const res = await fetch(`${API_BASE}/vendor/shops`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    shop_name: shopName,
                    shop_url: shopUrl,
                    shop_logo: shopLogo
                })
            });
            
            const data = await res.json();
            
            if (data.success) {
                // Presmeruj na dashboard a refreshni
                window.location.href = '/vendor-dashboard';
            } else {
                error = data.error || 'Nepodarilo sa vytvoriť obchod';
            }
        } catch (e) {
            error = 'Chyba pri vytváraní obchodu';
        }
        
        loading = false;
    }
</script>

<div class="page">
    <div class="page-header">
        <a href="/vendor-dashboard" class="back-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Späť
        </a>
        <h1>Pridať nový obchod</h1>
        <p>Vytvorte nový obchod pre predaj vašich produktov</p>
    </div>
    
    <div class="form-card">
        {#if error}
            <div class="error-message">{error}</div>
        {/if}
        
        <div class="form-group">
            <label for="shopName">Názov obchodu *</label>
            <input 
                type="text" 
                id="shopName" 
                bind:value={shopName}
                placeholder="napr. Môj Elektro Shop"
                class:error={error && !shopName}
            />
        </div>
        
        <div class="form-group">
            <label for="shopUrl">URL obchodu</label>
            <input 
                type="url" 
                id="shopUrl" 
                bind:value={shopUrl}
                placeholder="https://www.vas-obchod.sk"
            />
            <span class="help-text">Webová adresa vášho e-shopu</span>
        </div>
        
        <div class="form-group">
            <label for="shopLogo">Logo obchodu (URL)</label>
            <input 
                type="url" 
                id="shopLogo" 
                bind:value={shopLogo}
                placeholder="https://www.vas-obchod.sk/logo.png"
            />
            <span class="help-text">URL adresa loga vášho obchodu</span>
        </div>
        
        <div class="form-actions">
            <a href="/vendor-dashboard" class="btn btn-secondary">Zrušiť</a>
            <button class="btn btn-primary" on:click={createShop} disabled={loading}>
                {#if loading}
                    Vytváranie...
                {:else}
                    Vytvoriť obchod
                {/if}
            </button>
        </div>
    </div>
</div>

<style>
    .page {
        max-width: 600px;
        margin: 0 auto;
    }
    
    .page-header {
        margin-bottom: 32px;
    }
    
    .back-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: #5f6d7e;
        text-decoration: none;
        font-size: 14px;
        margin-bottom: 16px;
    }
    
    .back-link:hover {
        color: #0079bf;
    }
    
    .page-header h1 {
        font-size: 28px;
        font-weight: 700;
        color: #1a2b3c;
        margin: 0 0 8px;
    }
    
    .page-header p {
        color: #5f6d7e;
        margin: 0;
    }
    
    .form-card {
        background: #fff;
        border-radius: 12px;
        padding: 32px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    
    .error-message {
        background: #fff5f5;
        border: 1px solid #feb2b2;
        color: #c53030;
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 24px;
        font-size: 14px;
    }
    
    .form-group {
        margin-bottom: 24px;
    }
    
    .form-group label {
        display: block;
        font-weight: 600;
        color: #1a2b3c;
        margin-bottom: 8px;
        font-size: 14px;
    }
    
    .form-group input {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid #e0e6ed;
        border-radius: 8px;
        font-size: 15px;
        transition: all 0.2s;
    }
    
    .form-group input:focus {
        outline: none;
        border-color: #0079bf;
        box-shadow: 0 0 0 3px rgba(0,121,191,0.1);
    }
    
    .form-group input.error {
        border-color: #e53e3e;
    }
    
    .help-text {
        display: block;
        font-size: 13px;
        color: #8a94a6;
        margin-top: 6px;
    }
    
    .form-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 32px;
        padding-top: 24px;
        border-top: 1px solid #e0e6ed;
    }
    
    .btn {
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }
    
    .btn-secondary {
        background: #fff;
        border: 1px solid #e0e6ed;
        color: #5f6d7e;
    }
    
    .btn-secondary:hover {
        background: #f5f7fa;
    }
    
    .btn-primary {
        background: #0079bf;
        border: none;
        color: #fff;
    }
    
    .btn-primary:hover {
        background: #006aa8;
    }
    
    .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
</style>
