<script lang="ts">
    import { goto } from '$app/navigation';
    import { auth } from '$lib/stores/auth';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';

    let email = '';
    let password = '';
    let rememberMe = false;
    let error = '';
    let loading = false;

    onMount(() => {
        if (!browser) return;
        
        // Check if user has saved remember me preference
        const savedEmail = localStorage.getItem('vendor_remember_email');
        if (savedEmail) {
            email = savedEmail;
            rememberMe = true;
        }
        
        // If already logged in, redirect
        const token = localStorage.getItem('vendor_token');
        if (token) {
            goto('/vendor-dashboard');
        }
    });

    async function handleSubmit() {
        error = '';
        loading = true;

        const result = await auth.login(email, password, rememberMe);
        
        if (result.success) {
            // Save email if remember me is checked
            if (rememberMe) {
                localStorage.setItem('vendor_remember_email', email);
                localStorage.setItem('vendor_remember', 'true');
            } else {
                localStorage.removeItem('vendor_remember_email');
                localStorage.removeItem('vendor_remember');
            }
            goto('/vendor-dashboard');
        } else {
            error = result.error || 'Nesprávny email alebo heslo';
        }

        loading = false;
    }
</script>

<svelte:head>
    <title>Prihlásenie predajcu | MegaBuy</title>
</svelte:head>

<div class="auth-page">
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <a href="/" class="logo">
                    <span class="logo-text">megabuy</span>
                </a>
                <h1>Prihlásenie predajcu</h1>
                <p>Prihláste sa do svojho vendor účtu</p>
            </div>

            <form on:submit|preventDefault={handleSubmit} class="auth-form">
                {#if error}
                    <div class="alert alert-error">
                        <span>⚠️</span> {error}
                    </div>
                {/if}

                <div class="form-group">
                    <label for="email">E-mail</label>
                    <input 
                        type="email" 
                        id="email" 
                        bind:value={email}
                        placeholder="vas@email.sk"
                        required
                    />
                </div>

                <div class="form-group">
                    <label for="password">Heslo</label>
                    <input 
                        type="password" 
                        id="password" 
                        bind:value={password}
                        placeholder="••••••••"
                        required
                    />
                </div>
                
                <div class="form-group-checkbox">
                    <label class="checkbox-label">
                        <input 
                            type="checkbox" 
                            bind:checked={rememberMe}
                        />
                        <span>Zostať prihlásený</span>
                    </label>
                    <a href="/zabudnute-heslo" class="forgot-link">Zabudnuté heslo?</a>
                </div>

                <button type="submit" class="btn btn-primary" disabled={loading}>
                    {#if loading}
                        <span class="spinner"></span> Prihlasujem...
                    {:else}
                        🔐 Prihlásiť sa
                    {/if}
                </button>
            </form>

            <div class="auth-footer">
                <p>Nemáte ešte účet?</p>
                <a href="/registracia-predajcu" class="btn btn-secondary">
                    📝 Registrovať sa
                </a>
            </div>
        </div>

        <div class="auth-info">
            <h2>Prečo predávať na MegaBuy?</h2>
            <ul>
                <li>✅ Tisíce zákazníkov denne</li>
                <li>✅ Jednoduché pridávanie produktov</li>
                <li>✅ XML feed import</li>
                <li>✅ Platíte len za prekliky (CPC)</li>
                <li>✅ Detailné štatistiky</li>
            </ul>
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
        grid-template-columns: 1fr 1fr;
        max-width: 900px;
        width: 100%;
        background: white;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        overflow: hidden;
    }

    @media (max-width: 768px) {
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
        margin-bottom: 32px;
    }

    .logo {
        display: inline-block;
        margin-bottom: 24px;
        text-decoration: none;
    }

    .logo-text {
        font-size: 28px;
        font-weight: 700;
        color: #f97316;
    }

    .auth-header h1 {
        font-size: 24px;
        color: #1e293b;
        margin: 0 0 8px 0;
    }

    .auth-header p {
        color: #64748b;
        margin: 0;
    }

    .auth-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .form-group label {
        font-weight: 500;
        color: #374151;
        font-size: 14px;
    }

    .form-group input {
        padding: 12px 16px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 16px;
        transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-group input:focus {
        outline: none;
        border-color: #f97316;
        box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    }
    
    .form-group-checkbox {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }
    
    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        font-size: 14px;
        color: #374151;
    }
    
    .checkbox-label input[type="checkbox"] {
        width: 18px;
        height: 18px;
        accent-color: #f97316;
        cursor: pointer;
    }
    
    .forgot-link {
        font-size: 14px;
        color: #f97316;
        text-decoration: none;
    }
    
    .forgot-link:hover {
        text-decoration: underline;
    }

    .btn {
        padding: 14px 24px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
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
        text-decoration: none;
    }

    .btn-secondary:hover {
        background: #e2e8f0;
    }

    .alert {
        padding: 12px 16px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .alert-error {
        background: #fef2f2;
        color: #dc2626;
        border: 1px solid #fecaca;
    }

    .auth-footer {
        margin-top: 32px;
        text-align: center;
        padding-top: 24px;
        border-top: 1px solid #e2e8f0;
    }

    .auth-footer p {
        color: #64748b;
        margin: 0 0 12px 0;
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
        margin: 0 0 24px 0;
    }

    .auth-info ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .auth-info li {
        padding: 12px 0;
        font-size: 16px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .auth-info li:last-child {
        border-bottom: none;
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
