<script>
    import { adminFetch } from '$lib/adminApi.js';
    import { onMount } from 'svelte';

    let currentStyle = 'cards';
    let currentTagStyle = 'chips';
    let currentPriceStyle = 'default';
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

    const tagStyles = [
        { id: 'dots', name: 'Bodky', desc: 'Farebné bodky + oddeľovač, minimalistický', icon: '⚬' },
        { id: 'chips', name: 'Čipy', desc: 'Zaoblené 8px čipy, jemná výplň, moderný look', icon: '◻' },
        { id: 'underline', name: 'Podčiarknutie', desc: 'Text so spodným farebným akcentom', icon: '▁' },
        { id: 'inline', name: 'Inline', desc: 'Ikony + text bez pozadia, čistý Apple-like štýl', icon: '→' },
    ];

    const priceStyles = [
        { id: 'default', name: 'Zelená', desc: 'Najlacnejšia cena zelená, ostatné čierne', icon: '💚' },
        { id: 'accent', name: 'Border', desc: 'Zelený border vľavo pri najlacnejšej', icon: '▎' },
        { id: 'pill', name: 'Pill', desc: 'Najlacnejšia cena v zelenom pozadí', icon: '💊' },
        { id: 'underline', name: 'Podčiarknutie', desc: 'Zelené podčiarknutie najlacnejšej', icon: '▁' },
    ];

    onMount(async () => {
        try {
            const res = await adminFetch('/admin/site-settings');
            if (res.success && res.data) {
                currentStyle = res.data.offers_style || 'cards';
                currentTagStyle = res.data.tags_style || 'chips';
                currentPriceStyle = res.data.price_style || 'default';
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

    async function saveTagStyle(id) {
        saving = true;
        message = '';
        currentTagStyle = id;
        try {
            const res = await adminFetch('/admin/toggle-ui-setting', {
                method: 'POST',
                body: JSON.stringify({ key: 'tags_style', value: id })
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

    async function savePriceStyle(id) {
        saving = true;
        message = '';
        currentPriceStyle = id;
        try {
            const res = await adminFetch('/admin/toggle-ui-setting', {
                method: 'POST',
                body: JSON.stringify({ key: 'price_style', value: id })
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
                    <div class="dp__demo-row dp__demo-card">
                        <div class="dp__demo-logo green">PR</div>
                        <div class="dp__demo-info">
                            <strong>Profibuy.sk</strong>
                            <small>★ 4.8 (124) <span class="dp__badge-green">Najlepšia cena</span></small>
                        </div>
                        <span class="dp__demo-price green">51,73 €</span>
                        <span class="dp__demo-btn">Do obchodu ↗</span>
                    </div>
                    <div class="dp__demo-row dp__demo-card">
                        <div class="dp__demo-logo gray">HR</div>
                        <div class="dp__demo-info">
                            <strong>HračkyPro.sk</strong>
                            <small>★ 4.5 (89)</small>
                        </div>
                        <span class="dp__demo-price">54,90 €</span>
                        <span class="dp__demo-btn">Do obchodu ↗</span>
                    </div>
                {:else if currentStyle === 'ranking'}
                    <div class="dp__demo-row dp__demo-card">
                        <div class="dp__demo-rank green-bg">1</div>
                        <div class="dp__demo-logo green">PR</div>
                        <div class="dp__demo-info">
                            <strong>Profibuy.sk</strong>
                            <small>★ 4.8 (124) <span class="dp__badge-green">Najlepšia cena</span></small>
                        </div>
                        <span class="dp__demo-price green">51,73 €</span>
                        <span class="dp__demo-btn">Do obchodu ↗</span>
                    </div>
                    <div class="dp__demo-row dp__demo-card">
                        <div class="dp__demo-rank">2</div>
                        <div class="dp__demo-logo gray">HR</div>
                        <div class="dp__demo-info">
                            <strong>HračkyPro.sk</strong>
                            <small>★ 4.5 (89)</small>
                        </div>
                        <span class="dp__demo-price">54,90 €</span>
                        <span class="dp__demo-btn">Do obchodu ↗</span>
                    </div>
                {:else}
                    <div class="dp__demo-row dp__demo-minimal green-tint">
                        <div class="dp__demo-logo green sm">PR</div>
                        <div class="dp__demo-info">
                            <strong>Profibuy.sk</strong>
                            <small>★ 4.8 <span class="dp__badge-green">Najlepšia cena</span></small>
                        </div>
                        <span class="dp__demo-price green">51,73 €</span>
                        <span class="dp__demo-btn sm">Do obchodu ↗</span>
                    </div>
                    <div class="dp__demo-row dp__demo-minimal">
                        <div class="dp__demo-logo gray sm">HR</div>
                        <div class="dp__demo-info">
                            <strong>HračkyPro.sk</strong>
                            <small>★ 4.5</small>
                        </div>
                        <span class="dp__demo-price">54,90 €</span>
                        <span class="dp__demo-btn sm">Do obchodu ↗</span>
                    </div>
                {/if}
            </div>
        </div>

        <!-- TAG STYLE SECTION -->
        <div class="dp__section-divider"></div>
        <div class="dp__header" style="margin-top:32px">
            <h1>🏷️ Štýl tagov</h1>
            <p>Vyberte vizuál informačných tagov (Skladom, Doprava, Hodnotenie) pri ponukách</p>
        </div>

        <div class="dp__grid dp__grid--4">
            {#each tagStyles as ts}
                <button 
                    class="dp__card" 
                    class:active={currentTagStyle === ts.id}
                    on:click={() => saveTagStyle(ts.id)}
                    disabled={saving}
                >
                    <div class="dp__card-icon">{ts.icon}</div>
                    <div class="dp__card-name">{ts.name}</div>
                    <div class="dp__card-desc">{ts.desc}</div>
                    {#if currentTagStyle === ts.id}
                        <div class="dp__card-active">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>
                            Aktívny
                        </div>
                    {/if}
                </button>
            {/each}
        </div>

        <!-- Tag preview -->
        <div class="dp__preview">
            <h2>Náhľad tagov</h2>
            <div class="dp__preview-box">
                <div class="dp__demo-row dp__demo-card dp__demo-card--best">
                    <div class="dp__demo-logo green">PR</div>
                    <div class="dp__demo-tags">
                        {#if currentTagStyle === 'dots'}
                            <span class="dp__tag-dot green"></span><span class="dp__tag-text green">Skladom</span>
                            <span class="dp__tag-sep">|</span>
                            <span class="dp__tag-dot green"></span><span class="dp__tag-text green">Zdarma</span>
                            <span class="dp__tag-sep">|</span>
                            <span class="dp__tag-text">★ 4.5 (0)</span>
                        {:else if currentTagStyle === 'chips'}
                            <span class="dp__tag-chip green">✓ Skladom</span>
                            <span class="dp__tag-chip green">🚚 Zdarma</span>
                            <span class="dp__tag-chip">★ 4.5 (0)</span>
                        {:else if currentTagStyle === 'underline'}
                            <span class="dp__tag-uline green">✓ Skladom</span>
                            <span class="dp__tag-uline green">Zdarma</span>
                            <span class="dp__tag-text">★ 4.5 (0)</span>
                        {:else}
                            <span class="dp__tag-inline green">✓ Skladom</span>
                            <span class="dp__tag-inline green">🚚 Zdarma</span>
                            <span class="dp__tag-inline">★ 4.5 (0)</span>
                        {/if}
                    </div>
                    <span class="dp__demo-price green">3,15 €</span>
                    <span class="dp__demo-btn">Do obchodu ↗</span>
                </div>
            </div>
        </div>

        <!-- PRICE STYLE SECTION -->
        <div class="dp__section-divider"></div>
        <div class="dp__header" style="margin-top:32px">
            <h1>💰 Štýl ceny</h1>
            <p>Ako zvýrazniť najlacnejšiu ponuku</p>
        </div>

        <div class="dp__grid dp__grid--4">
            {#each priceStyles as ps}
                <button 
                    class="dp__card" 
                    class:active={currentPriceStyle === ps.id}
                    on:click={() => savePriceStyle(ps.id)}
                    disabled={saving}
                >
                    <div class="dp__card-icon">{ps.icon}</div>
                    <div class="dp__card-name">{ps.name}</div>
                    <div class="dp__card-desc">{ps.desc}</div>
                    {#if currentPriceStyle === ps.id}
                        <div class="dp__card-active">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>
                            Aktívny
                        </div>
                    {/if}
                </button>
            {/each}
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
.dp__demo-card:first-child { border-color: rgba(5,150,105,0.25); }
.dp__demo-minimal { border-bottom: 1px solid #f3f4f6; border-radius: 0; }
.dp__demo-minimal:last-child { border-bottom: none; }
.dp__demo-minimal.green-tint { background: rgba(5,150,105,0.04); }

.dp__demo-logo {
    width: 36px; height: 36px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; flex-shrink: 0;
}
.dp__demo-logo.green { background: linear-gradient(135deg, #059669, #10b981); color: #fff; }
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

.dp__demo-price { font-size: 16px; font-weight: 800; color: #111; white-space: nowrap; }
.dp__demo-price.green { color: #047857; }

.dp__demo-btn {
    padding: 8px 16px; border-radius: 10px; font-size: 12px; font-weight: 700;
    background: linear-gradient(135deg, #c4956a, #b8875c); color: #fff; white-space: nowrap;
}
.dp__demo-btn.sm { padding: 6px 12px; font-size: 11px; }

@media (max-width: 700px) {
    .dp__grid { grid-template-columns: 1fr; }
    .dp__grid--4 { grid-template-columns: 1fr 1fr; }
}

/* 4-column grid for tags */
.dp__grid--4 { grid-template-columns: repeat(4, 1fr); }

/* Section divider */
.dp__section-divider { height: 1px; background: #eef0f4; margin: 28px 0 0; }

/* Tag preview styles */
.dp__demo-tags { flex: 1; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.dp__tag-dot { width: 6px; height: 6px; border-radius: 50%; background: #94a3b8; display: inline-block; }
.dp__tag-dot.green { background: #059669; }
.dp__tag-text { font-size: 12px; color: #64748b; }
.dp__tag-text.green { color: #059669; font-weight: 600; }
.dp__tag-sep { color: #e5e7eb; font-size: 12px; }
.dp__tag-chip { font-size: 10px; font-weight: 600; color: #64748b; background: #f1f5f9; padding: 4px 10px; border-radius: 8px; }
.dp__tag-chip.green { color: #047857; background: #f0fdf4; }
.dp__tag-uline { font-size: 12px; font-weight: 600; color: #64748b; padding-bottom: 3px; border-bottom: 2px solid #d1d5db; }
.dp__tag-uline.green { color: #059669; border-bottom-color: #059669; }
.dp__tag-inline { font-size: 12px; font-weight: 500; color: #6b7280; }
.dp__tag-inline.green { color: #059669; font-weight: 600; }
</style>
