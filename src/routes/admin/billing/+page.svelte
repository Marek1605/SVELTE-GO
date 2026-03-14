<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { adminFetch } from '$lib/adminApi.js';
    
    let loading = true;
    let saving = false;
    let message = null;
    let activeTab = 'settings';
    let testResult = null;
    
    let settings = {
        provider: 'superfaktura',
        sf_email: '', sf_apikey: '', sf_company_id: '', sf_sandbox: false,
        bank_name: 'Tatra banka', bank_iban: '', bank_swift: 'TATRSKBX', bank_account_name: 'Megabuy s.r.o.',
        auto_invoice: true, send_invoice_email: true,
        invoice_language: 'slo', invoice_email_from: 'fakturacia@megabuy.sk',
        sf_connected: false
    };
    
    let topups = [];
    let topupStats = { pending_count: 0, pending_sum: 0, paid_count: 0, paid_sum: 0 };
    let topupFilter = '';
    let topupLoading = false;
    
    onMount(async () => {
        if (!browser) return;
        await loadSettings();
        await loadTopups();
        loading = false;
    });
    
    async function loadSettings() {
        try {
            const res = await adminFetch('/admin/billing-settings');
            if (res.success && res.data) settings = { ...settings, ...res.data };
        } catch (e) { console.error(e); }
    }
    
    async function saveSettings() {
        saving = true; message = null;
        try {
            const res = await adminFetch('/admin/billing-settings', { method: 'POST', body: JSON.stringify(settings) });
            message = res.success ? { type: 'success', text: 'Nastavenia uložené ✓' } : { type: 'error', text: res.error || 'Chyba' };
        } catch (e) { message = { type: 'error', text: 'Chyba pri ukladaní' }; }
        saving = false;
    }
    
    async function testConnection() {
        testResult = null;
        try {
            const res = await adminFetch('/admin/billing-settings/test', { method: 'POST' });
            testResult = res.success ? { type: 'success', text: res.message } : { type: 'error', text: res.error };
        } catch (e) { testResult = { type: 'error', text: 'Chyba pripojenia' }; }
    }
    
    async function loadTopups() {
        topupLoading = true;
        try {
            const res = await adminFetch('/admin/topups?status=' + topupFilter);
            if (res.success) { topups = res.data || []; topupStats = res.stats || topupStats; }
        } catch (e) { console.error(e); }
        topupLoading = false;
    }
    
    async function markPaid(topupId) {
        if (!confirm('Naozaj chcete potvrdiť platbu? Kredit bude pridaný vendorovi.')) return;
        try {
            const res = await adminFetch('/admin/topups/' + topupId + '/mark-paid', { method: 'POST' });
            if (res.success) {
                message = { type: 'success', text: res.message };
                await loadTopups();
            } else {
                message = { type: 'error', text: res.error };
            }
        } catch (e) { message = { type: 'error', text: 'Chyba' }; }
    }
    
    async function cancelTopup(topupId) {
        if (!confirm('Zrušiť tento topup?')) return;
        try {
            const res = await adminFetch('/admin/topups/' + topupId + '/cancel', { method: 'POST' });
            if (res.success) await loadTopups();
        } catch (e) {}
    }
    
    function formatDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('sk-SK') + ' ' + new Date(d).toLocaleTimeString('sk-SK', {hour:'2-digit',minute:'2-digit'}); }
    function formatPrice(p) { return (p || 0).toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'; }
</script>

<div class="bp">
    <div class="bp-header">
        <h1>💰 Fakturácia & CPC Kredit</h1>
    </div>
    
    {#if message}
    <div class="bp-msg {message.type}" on:click={() => message = null}>{message.text}</div>
    {/if}
    
    <div class="bp-tabs">
        <button class:active={activeTab === 'settings'} on:click={() => activeTab = 'settings'}>⚙️ Nastavenia</button>
        <button class:active={activeTab === 'topups'} on:click={() => { activeTab = 'topups'; loadTopups(); }}>📋 Dobíjanie kreditu</button>
    </div>
    
    {#if activeTab === 'settings'}
    <div class="bp-section">
        <h2>🔗 SuperFaktúra</h2>
        <p class="bp-desc">Pripojte SuperFaktúru pre automatické vystavovanie zálohových a riadnych faktúr.</p>
        
        <div class="bp-grid">
            <div class="bp-field">
                <label>E-mail</label>
                <input type="email" bind:value={settings.sf_email} placeholder="vas@email.sk">
            </div>
            <div class="bp-field">
                <label>API kľúč</label>
                <input type="text" bind:value={settings.sf_apikey} placeholder="API kľúč zo SuperFaktúry">
            </div>
            <div class="bp-field">
                <label>Company ID</label>
                <input type="text" bind:value={settings.sf_company_id} placeholder="ID spoločnosti">
            </div>
            <div class="bp-field">
                <label>&nbsp;</label>
                <label class="bp-check">
                    <input type="checkbox" bind:checked={settings.sf_sandbox}> Sandbox mód (testovanie)
                </label>
            </div>
        </div>
        
        <div class="bp-actions">
            <button class="bp-btn test" on:click={testConnection}>🔌 Otestovať pripojenie</button>
            {#if testResult}
                <span class="bp-test-result {testResult.type}">{testResult.text}</span>
            {/if}
        </div>
    </div>
    
    <div class="bp-section">
        <h2>🏦 Bankové údaje</h2>
        <p class="bp-desc">Tieto údaje sa zobrazia vendorom pri platbe bankovým prevodom.</p>
        
        <div class="bp-grid">
            <div class="bp-field">
                <label>Názov účtu</label>
                <input type="text" bind:value={settings.bank_account_name} placeholder="Megabuy s.r.o.">
            </div>
            <div class="bp-field">
                <label>IBAN</label>
                <input type="text" bind:value={settings.bank_iban} placeholder="SK00 0000 0000 0000 0000 0000">
            </div>
            <div class="bp-field">
                <label>SWIFT/BIC</label>
                <input type="text" bind:value={settings.bank_swift} placeholder="TATRSKBX">
            </div>
            <div class="bp-field">
                <label>Banka</label>
                <input type="text" bind:value={settings.bank_name} placeholder="Tatra banka">
            </div>
        </div>
    </div>
    
    <div class="bp-section">
        <h2>📧 Fakturácia</h2>
        <div class="bp-grid">
            <div class="bp-field">
                <label>Fakturačný e-mail (od)</label>
                <input type="email" bind:value={settings.invoice_email_from} placeholder="fakturacia@megabuy.sk">
            </div>
            <div class="bp-field">
                <label>Jazyk faktúry</label>
                <select bind:value={settings.invoice_language}>
                    <option value="slo">Slovenčina</option>
                    <option value="cze">Čeština</option>
                    <option value="eng">Angličtina</option>
                </select>
            </div>
            <div class="bp-field">
                <label>&nbsp;</label>
                <label class="bp-check"><input type="checkbox" bind:checked={settings.auto_invoice}> Automaticky vystaviť faktúru po zaplatení</label>
            </div>
            <div class="bp-field">
                <label>&nbsp;</label>
                <label class="bp-check"><input type="checkbox" bind:checked={settings.send_invoice_email}> Odoslať faktúru e-mailom vendorovi</label>
            </div>
        </div>
    </div>
    
    <div class="bp-save-row">
        <button class="bp-btn save" on:click={saveSettings} disabled={saving}>{saving ? 'Ukladám...' : '💾 Uložiť nastavenia'}</button>
    </div>
    
    {:else if activeTab === 'topups'}
    
    <div class="bp-stats">
        <div class="bp-stat pending">
            <span class="bp-stat-num">{topupStats.pending_count}</span>
            <span class="bp-stat-label">Čaká na platbu</span>
            <span class="bp-stat-sum">{formatPrice(topupStats.pending_sum)}</span>
        </div>
        <div class="bp-stat paid">
            <span class="bp-stat-num">{topupStats.paid_count}</span>
            <span class="bp-stat-label">Zaplatené</span>
            <span class="bp-stat-sum">{formatPrice(topupStats.paid_sum)}</span>
        </div>
    </div>
    
    <div class="bp-filter-row">
        <select bind:value={topupFilter} on:change={loadTopups}>
            <option value="">Všetky</option>
            <option value="pending">Čakajúce</option>
            <option value="paid">Zaplatené</option>
            <option value="cancelled">Zrušené</option>
        </select>
        <button class="bp-btn small" on:click={loadTopups}>🔄 Obnoviť</button>
    </div>
    
    <div class="bp-table-wrap">
        <table>
            <thead>
                <tr>
                    <th>Dátum</th>
                    <th>Obchod</th>
                    <th>E-mail</th>
                    <th>Suma</th>
                    <th>Bonus</th>
                    <th>Kredit</th>
                    <th>VS</th>
                    <th>Stav</th>
                    <th>Faktúra</th>
                    <th>Akcie</th>
                </tr>
            </thead>
            <tbody>
                {#each topups as t}
                <tr class:pending={t.status === 'pending'} class:paid={t.status === 'paid'}>
                    <td class="date">{formatDate(t.created_at)}</td>
                    <td><strong>{t.shop_name || '—'}</strong><br><small>{t.vendor_company || ''}</small></td>
                    <td class="email">{t.vendor_email || '—'}</td>
                    <td class="price">{formatPrice(t.amount)}</td>
                    <td>{t.bonus_pct > 0 ? `+${t.bonus_pct}%` : '—'}</td>
                    <td class="credit">{formatPrice(t.total_credit)}</td>
                    <td><code>{t.variable_symbol}</code></td>
                    <td>
                        {#if t.status === 'pending'}
                            <span class="badge pending">Čaká</span>
                        {:else if t.status === 'paid'}
                            <span class="badge paid">Zaplatené</span>
                        {:else}
                            <span class="badge cancelled">Zrušené</span>
                        {/if}
                    </td>
                    <td>
                        {#if t.sf_proforma_no}<small>ZF: {t.sf_proforma_no}</small><br>{/if}
                        {#if t.sf_invoice_no}<small>FA: {t.sf_invoice_no}</small>{/if}
                    </td>
                    <td class="actions">
                        {#if t.status === 'pending'}
                            <button class="bp-btn small green" on:click={() => markPaid(t.id)}>✓ Zaplatené</button>
                            <button class="bp-btn small red" on:click={() => cancelTopup(t.id)}>✗</button>
                        {:else}
                            <span class="done">—</span>
                        {/if}
                    </td>
                </tr>
                {:else}
                <tr><td colspan="10" class="empty">Žiadne topupy</td></tr>
                {/each}
            </tbody>
        </table>
    </div>
    {/if}
</div>

<style>
    .bp { padding: 0; }
    .bp-header { margin-bottom: 20px; }
    .bp-header h1 { font-size: 22px; font-weight: 700; color: #1f2937; margin: 0; }
    
    .bp-msg { padding: 8px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; cursor: pointer; }
    .bp-msg.success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
    .bp-msg.error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    
    .bp-tabs { display: flex; gap: 0; border-bottom: 2px solid #e5e7eb; margin-bottom: 20px; }
    .bp-tabs button { padding: 10px 18px; border: none; background: none; font-size: 13px; font-weight: 600; color: #6b7280; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.2s; }
    .bp-tabs button.active { color: #c4956a; border-bottom-color: #c4956a; }
    .bp-tabs button:hover { color: #1f2937; }
    
    .bp-section { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin-bottom: 16px; }
    .bp-section h2 { font-size: 16px; font-weight: 700; margin: 0 0 4px; color: #1f2937; }
    .bp-desc { font-size: 12px; color: #6b7280; margin: 0 0 16px; }
    
    .bp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .bp-field label { display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 4px; }
    .bp-field input, .bp-field select { width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; box-sizing: border-box; }
    .bp-field input:focus, .bp-field select:focus { outline: none; border-color: #c4956a; box-shadow: 0 0 0 2px rgba(196,149,106,0.15); }
    .bp-check { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #374151; cursor: pointer; padding-top: 8px; }
    .bp-check input { width: auto; }
    
    .bp-actions { display: flex; align-items: center; gap: 12px; margin-top: 12px; }
    .bp-test-result { font-size: 12px; font-weight: 500; }
    .bp-test-result.success { color: #16a34a; }
    .bp-test-result.error { color: #dc2626; }
    
    .bp-btn { padding: 8px 16px; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
    .bp-btn.test { background: #f1f5f9; color: #475569; }
    .bp-btn.test:hover { background: #e2e8f0; }
    .bp-btn.save { background: #c4956a; color: #fff; padding: 10px 24px; }
    .bp-btn.save:hover { background: #b8875c; }
    .bp-btn.save:disabled { opacity: 0.5; }
    .bp-btn.small { padding: 5px 10px; font-size: 11px; }
    .bp-btn.small.green { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
    .bp-btn.small.green:hover { background: #dcfce7; }
    .bp-btn.small.red { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .bp-btn.small.red:hover { background: #fee2e2; }
    .bp-save-row { text-align: right; }
    
    /* Topups tab */
    .bp-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
    .bp-stat { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; text-align: center; }
    .bp-stat.pending { border-left: 3px solid #f59e0b; }
    .bp-stat.paid { border-left: 3px solid #16a34a; }
    .bp-stat-num { font-size: 28px; font-weight: 800; display: block; color: #1f2937; }
    .bp-stat-label { font-size: 12px; color: #6b7280; display: block; }
    .bp-stat-sum { font-size: 14px; font-weight: 600; color: #475569; display: block; margin-top: 4px; }
    
    .bp-filter-row { display: flex; gap: 8px; margin-bottom: 12px; align-items: center; }
    .bp-filter-row select { padding: 6px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; }
    
    .bp-table-wrap { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; min-width: 900px; }
    th { padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; background: #f8fafc; border-bottom: 1px solid #e5e7eb; }
    td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; font-size: 12px; vertical-align: middle; }
    tr:hover { background: #f8fafc; }
    tr.pending { background: #fffbeb; }
    .date { white-space: nowrap; color: #6b7280; font-size: 11px; }
    .email { font-size: 11px; color: #6b7280; }
    .price { font-weight: 700; color: #1f2937; }
    .credit { font-weight: 700; color: #059669; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
    .badge { padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
    .badge.pending { background: #fef3c7; color: #92400e; }
    .badge.paid { background: #d1fae5; color: #065f46; }
    .badge.cancelled { background: #f1f5f9; color: #6b7280; }
    .actions { white-space: nowrap; }
    .empty { text-align: center; padding: 24px; color: #94a3b8; }
    .done { color: #94a3b8; }
    
    @media (max-width: 768px) {
        .bp-grid { grid-template-columns: 1fr; }
        .bp-stats { grid-template-columns: 1fr; }
    }
</style>
