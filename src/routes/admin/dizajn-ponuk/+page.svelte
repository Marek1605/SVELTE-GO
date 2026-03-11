<script>
    import { adminFetch } from '$lib/adminApi.js';
    import { onMount } from 'svelte';

    let currentStyle = 'cards';
    let saving = false;
    let message = '';
    let loading = true;

    const styles = [
        { 
            id: 'cards', 
            name: 'Karty', 
            desc: 'Samostatné karty s border okolo každej ponuky',
            icon: '🃏'
        },
        { 
            id: 'ranking', 
            name: 'Ranking', 
            desc: 'Poradové číslo pri každej ponuke, pocit rebríčka',
            icon: '🏆'
        },
        { 
            id: 'minimal', 
            name: 'Minimál', 
            desc: 'Bez kariet, len riadky oddelené čiarou, čistý look',
            icon: '✨'
        }
    ];

    onMount(async () => {
        try {
            const res = await adminFetch('/admin/site-settings');
            if (res.success && res.data) {
                currentStyle = res.data.offers_style || 'cards';
            }
        } catch (e) { console.error(e); }
        loading = false;
    });

    async function saveStyle(id) {
        saving = true;
        message = '';
        currentStyle = id;
        try {
            const res = await adminFetch('/admin/toggle-ui-setting', {
                method: 'POST',
                body: JSON.stringify({ key: 'offers_style', value: id })
            });
            if (res.success) {
                message = 'Uložené ✓';
                setTimeout(() => message = '', 2000);
            } else {
                message = res.error || 'Chyba';
            }
        } catch (e) {
            message = 'Chyba pri ukladaní';
        }
        saving = false;
    }
</script>

<div class="dp">
    <div class="dp__header">
        <h1>🎨 Dizajn ponúk</h1>
        <p>Vyberte si štýl zobrazovania ponúk na produktovej stránke</p>
    </div>

    {#if loading}
        <div class="dp__loading">Načítavam...</div>
    {:else}
        <div class="dp__grid">
            {#each styles as s}
                <button 
                    class="dp__card" 
                    class:active={currentStyle === s.id}
                    on:click={() => saveStyle(s.id)}
                    disabled={saving}
                >
                    <div class="dp__card-icon">{s.icon}</div>
                    <div class="dp__card-name">{s.name}</div>
                    <div class="dp__card-desc">{s.desc}</div>
                    {#if currentStyle === s.id}
                        <div class="dp__card-active">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>
                            Aktívny
                        </div>
                    {/if}
                </button>
            {/each}
        </div>

        {#if message}
            <div class="dp__msg" class:success={message.includes('✓')}>
                {message}
            </div>
        {/if}

        <div class="dp__preview">
            <h2>Náhľad</h2>
            <div class="dp__preview-box">
                {#if currentStyle === 'cards'}
                    <div class="dp__demo-row dp__demo-card dp__demo-card--best">
                        <div class="dp__demo-logo green">PR</div>
                        <div class="dp__demo-info">
                            <strong>Profibuy.sk</strong>
                            <small>★ 4.5 (0) <span class="dp__badge-green">↘ Najlepšia cena</span> <span class="dp__badge-amber">● Odporúčaná</span></small>
                        </div>
                        <div class="dp__demo-price-block">
                            <span class="dp__demo-price green">18,85 €</span>
                            <small class="dp__demo-ship green">Doprava zdarma</small>
                        </div>
                        <span class="dp__demo-btn">Do obchodu ↗</span>
                    </div>
                    <div class="dp__demo-row dp__demo-card dp__demo-card--rec">
                        <div class="dp__demo-logo amber">HR</div>
                        <div class="dp__demo-info">
                            <strong>HračkyPro.sk</strong>
                            <small>★ 4.5 (89) <span class="dp__badge-amber">● Odporúčaná</span></small>
                        </div>
                        <div class="dp__demo-price-block">
                            <span class="dp__demo-price">21,90 €</span>
                            <small class="dp__demo-ship">+ 2,99 € doprava</small>
                        </div>
                        <span class="dp__demo-btn">Do obchodu ↗</span>
                    </div>
                    <div class="dp__demo-row dp__demo-card">
                        <div class="dp__demo-logo gray">ME</div>
                        <div class="dp__demo-info">
                            <strong>MegaBuy.sk</strong>
                            <small>★ 4.2 (45)</small>
                        </div>
                        <div class="dp__demo-price-block">
                            <span class="dp__demo-price">23,50 €</span>
                            <small class="dp__demo-ship green">Doprava zdarma</small>
                        </div>
                        <span class="dp__demo-btn">Do obchodu ↗</span>
                    </div>
                {:else if currentStyle === 'ranking'}
                    <div class="dp__demo-row dp__demo-card dp__demo-card--best">
                        <div class="dp__demo-rank green-bg">1</div>
                        <div class="dp__demo-logo green">PR</div>
                        <div class="dp__demo-info">
                            <strong>Profibuy.sk</strong>
                            <small>★ 4.5 (0) <span class="dp__badge-green">↘ Najlepšia cena</span></small>
                        </div>
                        <div class="dp__demo-price-block">
                            <span class="dp__demo-price green">18,85 €</span>
                            <small class="dp__demo-ship green">Doprava zdarma</small>
                        </div>
                        <span class="dp__demo-btn">Do obchodu ↗</span>
                    </div>
                    <div class="dp__demo-row dp__demo-card dp__demo-card--rec">
                        <div class="dp__demo-rank">2</div>
                        <div class="dp__demo-logo amber">HR</div>
                        <div class="dp__demo-info">
                            <strong>HračkyPro.sk</strong>
                            <small>★ 4.5 (89) <span class="dp__badge-amber">● Odporúčaná</span></small>
                        </div>
                        <div class="dp__demo-price-block">
                            <span class="dp__demo-price">21,90 €</span>
                            <small class="dp__demo-ship">+ 2,99 € doprava</small>
                        </div>
                        <span class="dp__demo-btn">Do obchodu ↗</span>
                    </div>
                    <div class="dp__demo-row dp__demo-card">
                        <div class="dp__demo-rank">3</div>
                        <div class="dp__demo-logo gray">ME</div>
                        <div class="dp__demo-info">
                            <strong>MegaBuy.sk</strong>
                            <small>★ 4.2 (45)</small>
                        </div>
                        <div class="dp__demo-price-block">
                            <span class="dp__demo-price">23,50 €</span>
                            <small class="dp__demo-ship green">Doprava zdarma</small>
                        </div>
                        <span class="dp__demo-btn">Do obchodu ↗</span>
                    </div>
                {:else}
                    <div class="dp__demo-row dp__demo-minimal green-tint">
                        <div class="dp__demo-logo green sm">PR</div>
                        <div class="dp__demo-info">
                            <strong>Profibuy.sk</strong>
                            <small>★ 4.5 <span class="dp__badge-green">↘ Najlepšia cena</span></small>
                        </div>
                        <div class="dp__demo-price-block">
                            <span class="dp__demo-price green">18,85 €</span>
                            <small class="dp__demo-ship green">Doprava zdarma</small>
                        </div>
                        <span class="dp__demo-btn sm">Do obchodu ↗</span>
                    </div>
                    <div class="dp__demo-row dp__demo-minimal">
                        <div class="dp__demo-logo gray sm">HR</div>
                        <div class="dp__demo-info">
                            <strong>HračkyPro.sk</strong>
                            <small>★ 4.5 (89)</small>
                        </div>
                        <div class="dp__demo-price-block">
                            <span class="dp__demo-price">21,90 €</span>
                            <small class="dp__demo-ship">+ 2,99 € doprava</small>
                        </div>
                        <span class="dp__demo-btn sm">Do obchodu ↗</span>
                    </div>
                    <div class="dp__demo-row dp__demo-minimal">
                        <div class="dp__demo-logo gray sm">ME</div>
                        <div class="dp__demo-info">
                            <strong>MegaBuy.sk</strong>
                            <small>★ 4.2 (45)</small>
                        </div>
                        <div class="dp__demo-price-block">
                            <span class="dp__demo-price">23,50 €</span>
                            <small class="dp__demo-ship green">Doprava zdarma</small>
                        </div>
                        <span class="dp__demo-btn sm">Do obchodu ↗</span>
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</div>

<style>
.dp { max-width: 900px; }
.dp__header { margin-bottom: 28px; }
.dp__header h1 { font-size: 22px; font-weight: 700; color: #111; margin: 0 0 6px; }
.dp__header p { font-size: 14px; color: #64748b; margin: 0; }
.dp__loading { text-align: center; padding: 40px; color: #94a3b8; }

.dp__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px; }

.dp__card {
    background: #fff;
    border: 2px solid #eef0f4;
    border-radius: 16px;
    padding: 24px 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
}
.dp__card:hover { border-color: #c4956a; box-shadow: 0 4px 16px rgba(196,149,106,0.12); }
.dp__card.active { border-color: #c4956a; background: #fdfaf7; box-shadow: 0 4px 16px rgba(196,149,106,0.15); }

.dp__card-icon { font-size: 32px; margin-bottom: 10px; }
.dp__card-name { font-size: 16px; font-weight: 700; color: #111; margin-bottom: 6px; }
.dp__card-desc { font-size: 12px; color: #64748b; line-height: 1.5; }

.dp__card-active {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-top: 12px;
    font-size: 12px;
    font-weight: 600;
    color: #059669;
    background: #ecfdf5;
    padding: 4px 12px;
    border-radius: 20px;
}

.dp__msg {
    text-align: center;
    padding: 10px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 20px;
    background: #fef2f2;
    color: #dc2626;
}
.dp__msg.success { background: #ecfdf5; color: #059669; }

.dp__preview { margin-top: 12px; }
.dp__preview h2 { font-size: 16px; font-weight: 600; color: #111; margin: 0 0 12px; }
.dp__preview-box {
    background: #fff;
    border: 1px solid #eef0f4;
    border-radius: 14px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.dp__demo-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
}
.dp__demo-card { border: 1.5px solid #eef0f4; border-radius: 12px; }
.dp__demo-minimal { border-bottom: 1px solid #f3f4f6; border-radius: 0; }
.dp__demo-minimal:last-child { border-bottom: none; }
.dp__demo-minimal.green-tint { background: rgba(5,150,105,0.04); }

.dp__demo-logo {
    width: 36px; height: 36px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; flex-shrink: 0;
}
.dp__demo-logo.green { background: linear-gradient(135deg, #059669, #10b981); color: #fff; }
.dp__demo-logo.amber { background: linear-gradient(135deg, #d97706, #b45309); color: #fff; }
.dp__demo-logo.gray { background: #f1f5f9; color: #64748b; }
.dp__demo-logo.sm { width: 30px; height: 30px; font-size: 10px; }

.dp__demo-rank {
    width: 28px; height: 28px; border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 800; background: #f8f9fb; color: #94a3b8;
    border: 1px solid #eee; flex-shrink: 0;
}
.dp__demo-rank.green-bg { background: #ecfdf5; color: #047857; border-color: rgba(5,150,105,0.2); }

.dp__demo-info { flex: 1; }
.dp__demo-info strong { font-size: 13px; color: #111; display: block; }
.dp__demo-info small { font-size: 11px; color: #6b7280; }

.dp__badge-green {
    font-size: 9px; font-weight: 600; color: #047857;
    background: #ecfdf5; padding: 1px 6px; border-radius: 4px;
    border: 1px solid rgba(5,150,105,0.2); margin-left: 4px;
}
.dp__badge-amber {
    font-size: 9px; font-weight: 600; color: #b45309;
    background: #fffbeb; padding: 1px 6px; border-radius: 4px;
    border: 1px solid #fde68a; margin-left: 4px;
}

.dp__demo-price-block { text-align: right; flex-shrink: 0; }
.dp__demo-price { font-size: 16px; font-weight: 800; color: #111; white-space: nowrap; display: block; }
.dp__demo-price.green { color: #047857; }
.dp__demo-ship { font-size: 10px; color: #94a3b8; display: block; margin-top: 1px; }
.dp__demo-ship.green { color: #16a34a; }

.dp__demo-btn {
    padding: 8px 16px; border-radius: 10px; font-size: 12px; font-weight: 700;
    background: linear-gradient(135deg, #c4956a, #b8875c); color: #fff; white-space: nowrap;
}
.dp__demo-btn.sm { padding: 6px 12px; font-size: 11px; }

.dp__demo-card--best { border-color: rgba(5,150,105,0.25); box-shadow: 0 1px 6px rgba(5,150,105,0.08); }
.dp__demo-card--rec:not(.dp__demo-card--best) { border-color: rgba(196,149,106,0.3); box-shadow: 0 1px 6px rgba(196,149,106,0.08); }

@media (max-width: 700px) {
    .dp__grid { grid-template-columns: 1fr; }
}
</style>
