<script>
    import { onMount } from 'svelte';
    let activeSection = '';
    let showMobileToc = false;
    const sections = [
        { id: 'cl1', label: 'Čl. 1 – Čo sú cookies' },
        { id: 'cl2', label: 'Čl. 2 – Kategórie cookies' },
        { id: 'cl3', label: 'Čl. 3 – Správa súhlasu' },
        { id: 'cl4', label: 'Čl. 4 – Nastavenia prehliadača' },
        { id: 'cl5', label: 'Čl. 5 – Tretie strany' },
        { id: 'cl6', label: 'Čl. 6 – Kontakt' },
    ];
    onMount(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) activeSection = e.target.id; });
        }, { rootMargin: '-80px 0px -70% 0px' });
        sections.forEach(s => { const el = document.getElementById(s.id); if (el) observer.observe(el); });
        return () => observer.disconnect();
    });
    function scrollTo(id) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); showMobileToc = false; }
</script>

<svelte:head>
    <title>Zásady cookies | MegaBuy.sk</title>
    <meta name="description" content="Zásady používania súborov cookie na portáli MegaBuy.sk.">
    <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
</svelte:head>

<div class="legal-page">
    <button class="mobile-toc-btn" on:click={() => showMobileToc = !showMobileToc}>
        <span class="material-icons-round" style="font-size:18px">list</span> Obsah dokumentu
        <span class="material-icons-round" style="font-size:18px">{showMobileToc ? 'expand_less' : 'expand_more'}</span>
    </button>
    {#if showMobileToc}
        <nav class="mobile-toc">
            {#each sections as s}<button class:active={activeSection === s.id} on:click={() => scrollTo(s.id)}>{s.label}</button>{/each}
        </nav>
    {/if}
    <div class="legal-layout">
        <aside class="legal-sidebar">
            <div class="toc-sticky">
                <div class="toc-header">Obsah</div>
                <nav class="toc-nav">
                    {#each sections as s}<button class:active={activeSection === s.id} on:click={() => scrollTo(s.id)}>{s.label}</button>{/each}
                </nav>
                <div class="toc-links">
                    <a href="/vseobecne-obchodne-podmienky">VOP pre inzerentov</a>
                    <a href="/podmienky-pouzivania">Podmienky používania</a>
                    <a href="/ochrana-osobnych-udajov">Ochrana osobných údajov</a>
                    <a href="/impressum">Impressum</a>
                </div>
            </div>
        </aside>
        <main class="legal-content">
            <div class="legal-hero">
                <span class="legal-badge">ePRIVACY</span>
                <h1>Zásady používania súborov cookie</h1>
                <p class="legal-sub">Cookie Policy portálu MegaBuy.sk</p>
                <div class="legal-meta">
                    <span>Platné od: <strong>1. januára 2025</strong></span>
                    <span class="meta-sep">·</span>
                    <span>Aktualizované: <strong>4. marca 2026</strong></span>
                </div>
            </div>

            <p class="legal-intro">Tieto Zásady vysvetľujú, aké súbory cookie a podobné technológie používame na MegaBuy.sk, na aký účel a aké máte možnosti voľby. Súlad so zákonom č. 452/2021 Z. z. o elektronických komunikáciách a nariadením GDPR.</p>

            <section id="cl1">
                <h2>Článok 1 – Čo sú súbory cookie</h2>
                <p>Súbory cookie sú malé textové súbory, ktoré webová stránka ukladá vo vašom prehliadači počas návštevy. Umožňujú stránke zapamätať si vaše nastavenia, predvoľby a zlepšiť váš zážitok z používania.</p>
            </section>

            <section id="cl2">
                <h2>Článok 2 – Kategórie cookies, ktoré používame</h2>

                <h3>🔒 2.1 Nevyhnutné cookies <span class="always-on">vždy aktívne</span></h3>
                <p>Tieto cookies sú nevyhnutné pre správne fungovanie Portálu a nemožno ich vypnúť. Právny základ: oprávnený záujem.</p>
                <div class="cookie-table">
                    <div class="cookie-header"><span>Názov</span><span>Účel</span><span>Trvanie</span></div>
                    <div class="cookie-row"><span class="cookie-name">session_id</span><span>Správa prihlásenia</span><span>Relácia</span></div>
                    <div class="cookie-row"><span class="cookie-name">csrf_token</span><span>Ochrana pred CSRF útokmi</span><span>Relácia</span></div>
                    <div class="cookie-row"><span class="cookie-name">cookie_consent</span><span>Uloženie vašej voľby ohľadom cookies</span><span>12 mesiacov</span></div>
                    <div class="cookie-row"><span class="cookie-name">currency_pref</span><span>Nastavenie meny</span><span>30 dní</span></div>
                </div>

                <h3>📊 2.2 Analytické cookies <span class="consent-req">vyžadujú súhlas</span></h3>
                <p>Pomáhajú nám pochopiť, ako návštevníci využívajú Portál. Všetky dáta sú anonymizované a agregované. Právny základ: súhlas (čl. 6 ods. 1 písm. a GDPR).</p>
                <div class="cookie-table">
                    <div class="cookie-header"><span>Názov</span><span>Účel</span><span>Trvanie</span></div>
                    <div class="cookie-row"><span class="cookie-name">_ga, _gid</span><span>Google Analytics (anonymizovaná IP)</span><span>2 roky / 24 h</span></div>
                    <div class="cookie-row"><span class="cookie-name">mp_pageview</span><span>Vlastná analytika MegaBuy.sk</span><span>90 dní</span></div>
                </div>

                <h3>⚙️ 2.3 Funkčné cookies <span class="consent-req">vyžadujú súhlas</span></h3>
                <p>Umožňujú rozšírené funkcie a personalizáciu.</p>
                <div class="cookie-table">
                    <div class="cookie-header"><span>Názov</span><span>Účel</span><span>Trvanie</span></div>
                    <div class="cookie-row"><span class="cookie-name">watchlist</span><span>Sledovaný zoznam produktov</span><span>6 mesiacov</span></div>
                    <div class="cookie-row"><span class="cookie-name">recent_searches</span><span>Posledné vyhľadávania</span><span>30 dní</span></div>
                    <div class="cookie-row"><span class="cookie-name">ui_theme</span><span>Preferovaný vzhľad (svetlý/tmavý)</span><span>12 mesiacov</span></div>
                </div>

                <h3>📢 2.4 Marketingové cookies <span class="consent-req">vyžadujú súhlas</span></h3>
                <p>Prevádzkovateľ tieto cookies nevyužíva v aktuálnej verzii Portálu. Ak budú v budúcnosti zavedené, bude na ne vyžiadaný osobitný súhlas.</p>
            </section>

            <section id="cl3">
                <h2>Článok 3 – Správa súhlasu (CMP)</h2>
                <p>Pri prvej návšteve Portálu sa zobrazí cookie banner (Consent Management Platform), kde môžete udeliť alebo odmietnuť súhlas s jednotlivými kategóriami cookies. Svoj súhlas môžete kedykoľvek zmeniť v nastaveniach cookies.</p>
                <div class="highlight-box">
                    <span class="material-icons-round" style="color:#f59e0b">warning</span>
                    <div><strong>Vek:</strong> Na udelenie súhlasu musíte mať minimálne 16 rokov (zákon č. 18/2018 Z. z., § 15). Pre mladších používateľov požadujeme súhlas zákonného zástupcu.</div>
                </div>
            </section>

            <section id="cl4">
                <h2>Článok 4 – Správa cookies v prehliadači</h2>
                <p>Okrem nášho CMP môžete spravovať cookies priamo v nastaveniach vášho prehliadača:</p>
                <div class="browser-grid">
                    <div class="browser-item"><strong>Chrome</strong><br>Nastavenia → Ochrana súkromia → Súbory cookie</div>
                    <div class="browser-item"><strong>Firefox</strong><br>Nastavenia → Súkromie a bezpečnosť</div>
                    <div class="browser-item"><strong>Safari</strong><br>Predvoľby → Súkromie</div>
                    <div class="browser-item"><strong>Edge</strong><br>Nastavenia → Súkromie, vyhľadávanie a služby</div>
                </div>
                <p>Upozorňujeme, že zakázanie nevyhnutných cookies môže narušiť funkčnosť Portálu.</p>
            </section>

            <section id="cl5">
                <h2>Článok 5 – Tretie strany</h2>
                <p>Na Portáli môžu byť integrované nástroje tretích strán s vlastnými cookies. Aktuálne používame:</p>
                <ul>
                    <li><strong>Google Analytics</strong> (Google LLC, USA) – analytika návštevnosti; <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">podmienky ochrany súkromia</a></li>
                    <li><strong>Google Fonts</strong> (Google LLC) – načítanie fontov; načítanie fontu môže zaznamenávať IP adresu</li>
                </ul>
            </section>

            <section id="cl6">
                <h2>Článok 6 – Kontakt a zmeny</h2>
                <p>Otázky ohľadom cookies zasielajte na <a href="mailto:gdpr@megabuy.sk">gdpr@megabuy.sk</a>. Tieto Zásady môžeme aktualizovať. Každá zmena bude oznámená aktualizáciou dátumu v záhlaví dokumentu.</p>
            </section>

            <div class="legal-footer-nav">
                <a href="/ochrana-osobnych-udajov">← Ochrana osobných údajov</a>
                <a href="/impressum">Impressum →</a>
            </div>
        </main>
    </div>
</div>

<style>
    @import url('https://fonts.googleapis.com/icon?family=Material+Icons+Round');
    .legal-page { max-width: 1200px; margin: 0 auto; padding: 0 16px; }
    .legal-layout { display: grid; grid-template-columns: 220px 1fr; gap: 40px; align-items: start; }
    .legal-sidebar { display: block; } .toc-sticky { position: sticky; top: 90px; }
    .toc-header { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; margin-bottom: 12px; padding-left: 12px; }
    .toc-nav { display: flex; flex-direction: column; gap: 1px; }
    .toc-nav button { display: block; width: 100%; text-align: left; background: none; border: none; border-left: 2px solid transparent; padding: 6px 12px; font-size: 12.5px; color: #64748b; cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif; line-height: 1.4; }
    .toc-nav button:hover { color: #1e293b; background: #f8fafc; }
    .toc-nav button.active { border-left-color: #c4956a; color: #1e293b; font-weight: 600; background: #fdf8f4; }
    .toc-links { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 6px; padding-left: 12px; }
    .toc-links a { font-size: 12px; color: #94a3b8; text-decoration: none; } .toc-links a:hover { color: #c4956a; }
    .mobile-toc-btn { display: none; width: 100%; padding: 12px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; font-weight: 500; color: #475569; cursor: pointer; margin-bottom: 12px; font-family: 'DM Sans', sans-serif; align-items: center; justify-content: space-between; }
    .mobile-toc { display: none; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px; margin-bottom: 16px; max-height: 300px; overflow-y: auto; }
    .mobile-toc button { display: block; width: 100%; text-align: left; background: none; border: none; padding: 8px 12px; font-size: 13px; color: #475569; cursor: pointer; border-radius: 6px; font-family: 'DM Sans', sans-serif; }
    .mobile-toc button:hover { background: #f1f5f9; } .mobile-toc button.active { background: #fdf8f4; color: #92400e; font-weight: 600; }
    .legal-content { min-width: 0; padding-bottom: 80px; }
    .legal-hero { padding: 32px 0 28px; border-bottom: 1px solid #e2e8f0; margin-bottom: 32px; }
    .legal-badge { display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #c4956a; background: #fdf8f4; padding: 4px 10px; border-radius: 4px; margin-bottom: 12px; }
    .legal-hero h1 { font-family: 'Source Serif 4', Georgia, serif; font-size: 32px; font-weight: 700; color: #0f172a; margin: 0 0 6px; line-height: 1.2; }
    .legal-sub { font-size: 16px; color: #64748b; margin: 0 0 16px; font-family: 'DM Sans', sans-serif; }
    .legal-meta { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #94a3b8; font-family: 'DM Sans', sans-serif; flex-wrap: wrap; }
    .legal-meta strong { color: #475569; } .meta-sep { color: #cbd5e1; }
    .legal-intro { font-size: 15px; color: #475569; line-height: 1.7; margin-bottom: 36px; padding: 16px 20px; background: #f8fafc; border-left: 3px solid #c4956a; border-radius: 0 8px 8px 0; font-family: 'DM Sans', sans-serif; }
    section { margin-bottom: 36px; scroll-margin-top: 90px; }
    section h2 { font-family: 'Source Serif 4', Georgia, serif; font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 16px; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9; }
    section h3 { font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; color: #334155; margin: 24px 0 10px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    section p { font-family: 'DM Sans', sans-serif; font-size: 14.5px; line-height: 1.75; color: #374151; margin: 0 0 12px; }
    section ul { margin: 8px 0 16px 20px; } section li { font-family: 'DM Sans', sans-serif; font-size: 14px; line-height: 1.7; color: #475569; margin-bottom: 6px; }
    section a { color: #c4956a; text-decoration: none; } section a:hover { text-decoration: underline; }
    .highlight-box { display: flex; gap: 12px; padding: 14px 18px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; margin: 14px 0; align-items: flex-start; }
    .highlight-box div { font-family: 'DM Sans', sans-serif; font-size: 14px; line-height: 1.6; color: #92400e; }

    /* Cookie-specific */
    .always-on { font-size: 11px; font-weight: 600; color: #10b981; background: #ecfdf5; padding: 2px 8px; border-radius: 4px; }
    .consent-req { font-size: 11px; font-weight: 600; color: #f59e0b; background: #fffbeb; padding: 2px 8px; border-radius: 4px; }
    .cookie-table { border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin: 12px 0 20px; font-family: 'DM Sans', sans-serif; }
    .cookie-header { display: grid; grid-template-columns: 140px 1fr 100px; padding: 10px 14px; background: #f1f5f9; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .cookie-row { display: grid; grid-template-columns: 140px 1fr 100px; padding: 10px 14px; font-size: 13px; color: #475569; border-top: 1px solid #f1f5f9; }
    .cookie-name { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; color: #0f172a; font-weight: 600; }
    .browser-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 12px 0; }
    .browser-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; font-family: 'DM Sans', sans-serif; font-size: 13px; color: #475569; line-height: 1.5; }
    .browser-item strong { color: #0f172a; }

    .legal-footer-nav { display: flex; gap: 16px; padding-top: 24px; border-top: 1px solid #e2e8f0; margin-top: 40px; flex-wrap: wrap; }
    .legal-footer-nav a { font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; color: #c4956a; text-decoration: none; padding: 10px 18px; background: #fdf8f4; border-radius: 8px; }
    .legal-footer-nav a:hover { background: #faebd7; }
    @media (max-width: 768px) {
        .legal-sidebar { display: none; } .legal-layout { grid-template-columns: 1fr; gap: 0; }
        .mobile-toc-btn { display: flex; } .mobile-toc { display: block; }
        .legal-hero h1 { font-size: 24px; } .legal-hero { padding: 20px 0 20px; }
        section h2 { font-size: 19px; } .highlight-box { flex-direction: column; gap: 8px; }
        .cookie-header, .cookie-row { grid-template-columns: 110px 1fr 80px; font-size: 12px; padding: 8px 10px; }
        .browser-grid { grid-template-columns: 1fr; }
    }
</style>
