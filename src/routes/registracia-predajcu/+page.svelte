<script lang="ts">
    import { goto } from '$app/navigation';
    import { auth } from '$lib/stores/auth';
    import { onMount } from 'svelte';

    let email = '';
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
        if (password !== passwordConfirm) { error = 'Heslá sa nezhodujú'; return; }
        if (password.length < 6) { error = 'Heslo musí mať aspoň 6 znakov'; return; }
        if (!terms) { error = 'Musíte súhlasiť s obchodnými podmienkami'; return; }

        loading = true;
        const result = await auth.register({ email, password });
        if (result.success) {
            success = true;
        } else {
            error = result.error || 'Chyba pri registrácii';
        }
        loading = false;
    }
</script>

<svelte:head>
    <title>Registrácia predajcu | MegaBuy</title>
</svelte:head>

<div class="auth-page">
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <a href="/" class="logo"><span class="logo-text">megabuy</span></a>
                <h1>Staňte sa predajcom</h1>
                <p>Začnite predávať na našom marketplace už dnes</p>
            </div>

            {#if success}
                <div class="success-message">
                    <div class="success-icon">✅</div>
                    <h2>Registrácia úspešná!</h2>
                    <p>Váš účet bol vytvorený. Pre pridanie obchodu je potrebné vyplniť fakturačné údaje v sekcii <strong>Môj účet</strong>.</p>
                    <div class="credit-bonus">
                        <span class="bonus-icon">🎁</span>
                        <div>
                            <strong>Bonus 100 € kredit</strong>
                            <p>Po vyplnení fakturačných údajov vám automaticky pripíšeme 100 € na PPC kredit!</p>
                        </div>
                    </div>
                    <a href="/prihlasenie-predajcu" class="btn btn-primary">🔐 Prihlásiť sa</a>
                </div>
            {:else}
                <form on:submit|preventDefault={handleSubmit} class="auth-form">
                    {#if error}
                        <div class="alert alert-error"><span>⚠️</span> {error}</div>
                    {/if}

                    <div class="form-group">
                        <label for="email">E-mail *</label>
                        <input type="email" id="email" bind:value={email} placeholder="vas@email.sk" required />
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
                            <span>Súhlasím s <a href="/vseobecne-obchodne-podmienky" target="_blank">obchodnými podmienkami</a> a <a href="/ochrana-osobnych-udajov" target="_blank">ochranou osobných údajov</a></span>
                        </label>
                    </div>

                    <button type="submit" class="btn btn-primary" disabled={loading}>
                        {#if loading}<span class="spinner"></span> Registrujem...{:else}📝 Registrovať sa{/if}
                    </button>

                    <div class="social-divider"><span>alebo</span></div>

                    <button type="button" class="btn btn-social btn-google" disabled>
                        <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                        Google (čoskoro)
                    </button>
                    <button type="button" class="btn btn-social btn-apple" disabled>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                        Apple (čoskoro)
                    </button>
                </form>

                <div class="auth-footer">
                    <p>Už máte účet?</p>
                    <a href="/prihlasenie-predajcu" class="btn btn-secondary">🔐 Prihlásiť sa</a>
                </div>
            {/if}
        </div>

        <div class="auth-info">
            <h2>Ako to funguje?</h2>
            <div class="steps">
                <div class="step"><div class="step-number">1</div><div class="step-content"><h3>Registrácia</h3><p>Stačí e-mail a heslo</p></div></div>
                <div class="step"><div class="step-number">2</div><div class="step-content"><h3>Fakturačné údaje</h3><p>Vyplňte údaje a získajte <strong>100 € kredit zadarmo</strong></p></div></div>
                <div class="step"><div class="step-number">3</div><div class="step-content"><h3>Pridajte e-shop</h3><p>Importujte XML feed alebo pridajte ručne</p></div></div>
                <div class="step"><div class="step-number">4</div><div class="step-content"><h3>Získajte zákazníkov</h3><p>Vaše produkty sa zobrazia tisícom ľudí</p></div></div>
            </div>
        </div>
    </div>
</div>

<style>
    .auth-page { min-height: 100vh; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); display: flex; align-items: center; justify-content: center; padding: 20px; }
    .auth-container { display: grid; grid-template-columns: 1.2fr 1fr; max-width: 960px; width: 100%; background: white; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); overflow: hidden; }
    @media (max-width: 900px) { .auth-container { grid-template-columns: 1fr; } .auth-info { display: none; } }
    .auth-card { padding: 40px; }
    .auth-header { text-align: center; margin-bottom: 28px; }
    .logo { display: inline-block; margin-bottom: 20px; text-decoration: none; }
    .logo-text { font-size: 28px; font-weight: 700; color: #f97316; }
    .auth-header h1 { font-size: 22px; color: #1e293b; margin: 0 0 6px 0; }
    .auth-header p { color: #64748b; margin: 0; font-size: 14px; }
    .auth-form { display: flex; flex-direction: column; gap: 16px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 4px; }
    .form-group label { font-weight: 500; color: #374151; font-size: 13px; }
    .form-group input[type="text"], .form-group input[type="email"], .form-group input[type="password"] {
        padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 15px; transition: border-color 0.2s, box-shadow 0.2s;
    }
    .form-group input:focus { outline: none; border-color: #f97316; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1); }
    .checkbox-group { margin-top: 4px; }
    .checkbox-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 14px; }
    .checkbox-label input { width: 18px; height: 18px; }
    .checkbox-label a { color: #f97316; }
    .btn { padding: 12px 24px; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none; }
    .btn-primary { background: #f97316; color: white; }
    .btn-primary:hover { background: #ea580c; }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
    .btn-secondary { background: #f1f5f9; color: #1e293b; }
    .btn-social { background: white; border: 1px solid #e2e8f0; color: #374151; font-size: 14px; padding: 10px 20px; }
    .btn-social:disabled { opacity: 0.5; cursor: not-allowed; }
    .social-divider { display: flex; align-items: center; gap: 12px; margin: 4px 0; color: #94a3b8; font-size: 13px; }
    .social-divider::before, .social-divider::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }
    .alert { padding: 12px 16px; border-radius: 8px; display: flex; align-items: center; gap: 8px; font-size: 14px; }
    .alert-error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .auth-footer { margin-top: 24px; text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0; }
    .auth-footer p { color: #64748b; margin: 0 0 12px 0; font-size: 14px; }
    .auth-info { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 40px; display: flex; flex-direction: column; justify-content: center; color: white; }
    .auth-info h2 { font-size: 22px; margin: 0 0 28px 0; }
    .steps { display: flex; flex-direction: column; gap: 24px; }
    .step { display: flex; gap: 16px; }
    .step-number { width: 36px; height: 36px; background: #f97316; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
    .step-content h3 { margin: 0 0 4px 0; font-size: 16px; }
    .step-content p { margin: 0; font-size: 14px; opacity: 0.8; }
    .step-content strong { color: #fbbf24; }
    .success-message { text-align: center; padding: 20px; }
    .success-icon { font-size: 64px; margin-bottom: 16px; }
    .success-message h2 { color: #16a34a; margin: 0 0 12px 0; }
    .success-message > p { color: #64748b; margin: 0 0 20px 0; }
    .credit-bonus { display: flex; align-items: flex-start; gap: 14px; text-align: left; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px solid #fbbf24; border-radius: 12px; padding: 16px; margin-bottom: 24px; }
    .bonus-icon { font-size: 32px; flex-shrink: 0; }
    .credit-bonus strong { color: #92400e; display: block; margin-bottom: 4px; }
    .credit-bonus p { margin: 0; font-size: 13px; color: #78350f; }
    .spinner { width: 16px; height: 16px; border: 2px solid transparent; border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
</style>
