<script lang="ts">
    import { goto } from '$app/navigation';
    import { auth } from '$lib/stores/auth';
    import { onMount } from 'svelte';

    let firstName = '';
    let lastName = '';
    let email = '';
    let shopName = '';
    let shopUrl = '';
    let password = '';
    let passwordConfirm = '';
    let terms = false;
    let error = '';
    let success = false;
    let loading = false;

    onMount(() => {
        const unsubscribe = auth.subscribe(state => {
            if (!state.loading && state.isLoggedIn) {
                goto('/vendor-dashboard');
            }
        });
        return unsubscribe;
    });

    async function handleSubmit() {
        error = '';
        
        if (password !== passwordConfirm) {
            error = 'Heslá sa nezhodujú';
            return;
        }

        if (password.length < 6) {
            error = 'Heslo musí mať aspoň 6 znakov';
            return;
        }

        if (!terms) {
            error = 'Musíte súhlasiť s obchodnými podmienkami';
            return;
        }

        loading = true;

        const result = await auth.register({
            first_name: firstName,
            last_name: lastName,
            email,
            password,
            password_confirm: passwordConfirm,
            shop_name: shopName,
            shop_url: shopUrl,
            terms
        });

        if (result.success) {
            success = true;
        } else {
            error = result.error || 'Chyba pri registrácii';
        }

        loading = false;
    }
</script>

<svelte:head>
    <title>Registrácia predajcu | MegaPrice</title>
</svelte:head>

<div class="auth-page">
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <a href="/" class="logo">
                    <span class="logo-text">megaprice</span>
                </a>
                <h1>Staňte sa predajcom</h1>
                <p>Začnite predávať na našom marketplace už dnes</p>
            </div>

            {#if success}
                <div class="success-message">
                    <div class="success-icon">✅</div>
                    <h2>Registrácia úspešná!</h2>
                    <p>Váš účet bol vytvorený a čaká na schválenie. Budeme vás informovať emailom, keď bude váš účet aktívny.</p>
                    <a href="/prihlasenie-predajcu" class="btn btn-primary">
                        🔐 Prihlásiť sa
                    </a>
                </div>
            {:else}
                <form on:submit|preventDefault={handleSubmit} class="auth-form">
                    {#if error}
                        <div class="alert alert-error">
                            <span>⚠️</span> {error}
                        </div>
                    {/if}

                    <div class="form-row">
                        <div class="form-group">
                            <label for="firstName">Meno *</label>
                            <input type="text" id="firstName" bind:value={firstName} required />
                        </div>
                        <div class="form-group">
                            <label for="lastName">Priezvisko *</label>
                            <input type="text" id="lastName" bind:value={lastName} required />
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="email">E-mail *</label>
                        <input type="email" id="email" bind:value={email} placeholder="vas@email.sk" required />
                    </div>

                    <div class="form-group">
                        <label for="shopName">Názov obchodu *</label>
                        <input type="text" id="shopName" bind:value={shopName} placeholder="Môj E-shop" required />
                        <small>Tento názov sa zobrazí zákazníkom</small>
                    </div>

                    <div class="form-group">
                        <label for="shopUrl">URL vášho e-shopu *</label>
                        <input type="url" id="shopUrl" bind:value={shopUrl} placeholder="https://www.vas-eshop.sk" required />
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="password">Heslo *</label>
                            <input type="password" id="password" bind:value={password} placeholder="Min. 6 znakov" required />
                        </div>
                        <div class="form-group">
                            <label for="passwordConfirm">Potvrdenie hesla *</label>
                            <input type="password" id="passwordConfirm" bind:value={passwordConfirm} required />
                        </div>
                    </div>

                    <div class="form-group checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" bind:checked={terms} />
                            <span>Súhlasím s <a href="/obchodne-podmienky" target="_blank">obchodnými podmienkami</a></span>
                        </label>
                    </div>

                    <button type="submit" class="btn btn-primary" disabled={loading}>
                        {#if loading}
                            <span class="spinner"></span> Registrujem...
                        {:else}
                            📝 Registrovať sa
                        {/if}
                    </button>
                </form>

                <div class="auth-footer">
                    <p>Už máte účet?</p>
                    <a href="/prihlasenie-predajcu" class="btn btn-secondary">
                        🔐 Prihlásiť sa
                    </a>
                </div>
            {/if}
        </div>

        <div class="auth-info">
            <h2>Ako to funguje?</h2>
            <div class="steps">
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h3>Registrácia</h3>
                        <p>Vyplňte formulár a počkajte na schválenie</p>
                    </div>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h3>Nahrajte produkty</h3>
                        <p>Importujte XML feed alebo pridajte ručne</p>
                    </div>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h3>Získajte zákazníkov</h3>
                        <p>Vaše produkty sa zobrazia tisícom ľudí</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .auth-page {
        min-height: 100vh;
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    }

    .auth-container {
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        max-width: 1000px;
        width: 100%;
        background: white;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        overflow: hidden;
    }

    @media (max-width: 900px) {
        .auth-container {
            grid-template-columns: 1fr;
        }
        .auth-info {
            display: none;
        }
    }

    .auth-card {
        padding: 40px;
    }

    .auth-header {
        text-align: center;
        margin-bottom: 28px;
    }

    .logo {
        display: inline-block;
        margin-bottom: 20px;
        text-decoration: none;
    }

    .logo-text {
        font-size: 28px;
        font-weight: 700;
        color: #f97316;
    }

    .auth-header h1 {
        font-size: 22px;
        color: #1e293b;
        margin: 0 0 6px 0;
    }

    .auth-header p {
        color: #64748b;
        margin: 0;
        font-size: 14px;
    }

    .auth-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .form-group label {
        font-weight: 500;
        color: #374151;
        font-size: 13px;
    }

    .form-group input[type="text"],
    .form-group input[type="email"],
    .form-group input[type="password"],
    .form-group input[type="url"] {
        padding: 10px 14px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 15px;
        transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-group input:focus {
        outline: none;
        border-color: #f97316;
        box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    }

    .form-group small {
        color: #64748b;
        font-size: 12px;
    }

    .checkbox-group {
        margin-top: 4px;
    }

    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        font-size: 14px;
    }

    .checkbox-label input {
        width: 18px;
        height: 18px;
    }

    .checkbox-label a {
        color: #f97316;
    }

    .btn {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        text-decoration: none;
    }

    .btn-primary {
        background: #f97316;
        color: white;
    }

    .btn-primary:hover {
        background: #ea580c;
    }

    .btn-primary:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .btn-secondary {
        background: #f1f5f9;
        color: #1e293b;
    }

    .alert {
        padding: 12px 16px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
    }

    .alert-error {
        background: #fef2f2;
        color: #dc2626;
        border: 1px solid #fecaca;
    }

    .auth-footer {
        margin-top: 24px;
        text-align: center;
        padding-top: 20px;
        border-top: 1px solid #e2e8f0;
    }

    .auth-footer p {
        color: #64748b;
        margin: 0 0 12px 0;
        font-size: 14px;
    }

    .auth-info {
        background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
        padding: 40px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        color: white;
    }

    .auth-info h2 {
        font-size: 22px;
        margin: 0 0 28px 0;
    }

    .steps {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .step {
        display: flex;
        gap: 16px;
    }

    .step-number {
        width: 36px;
        height: 36px;
        background: #f97316;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        flex-shrink: 0;
    }

    .step-content h3 {
        margin: 0 0 4px 0;
        font-size: 16px;
    }

    .step-content p {
        margin: 0;
        font-size: 14px;
        opacity: 0.8;
    }

    .success-message {
        text-align: center;
        padding: 20px;
    }

    .success-icon {
        font-size: 64px;
        margin-bottom: 16px;
    }

    .success-message h2 {
        color: #16a34a;
        margin: 0 0 12px 0;
    }

    .success-message p {
        color: #64748b;
        margin: 0 0 24px 0;
    }

    .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid transparent;
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }
</style>
