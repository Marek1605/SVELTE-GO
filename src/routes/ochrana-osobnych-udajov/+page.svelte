<script>
    import { onMount } from 'svelte';
    let activeSection = '';
    let showMobileToc = false;
    const sections = [
        { id: 'cl1', label: 'Čl. 1 – Prevádzkovateľ' },
        { id: 'cl2', label: 'Čl. 2 – Osobné údaje' },
        { id: 'cl3', label: 'Čl. 3 – Účely spracúvania' },
        { id: 'cl4', label: 'Čl. 4 – Doba uchovávania' },
        { id: 'cl5', label: 'Čl. 5 – Príjemcovia údajov' },
        { id: 'cl6', label: 'Čl. 6 – Vaše práva' },
        { id: 'cl7', label: 'Čl. 7 – Bezpečnosť' },
        { id: 'cl8', label: 'Čl. 8 – Zmeny zásad' },
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
    <title>Ochrana osobných údajov | MegaPrice.sk</title>
    <meta name="description" content="Zásady ochrany osobných údajov portálu MegaPrice.sk v súlade s GDPR a zákonom č. 18/2018 Z. z.">
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
                    <a href="/zasady-cookies">Zásady cookies</a>
                    <a href="/impressum">Impressum</a>
                </div>
            </div>
        </aside>
        <main class="legal-content">
            <div class="legal-hero">
                <span class="legal-badge">GDPR</span>
                <h1>Zásady ochrany osobných údajov</h1>
                <p class="legal-sub">Privacy Policy portálu MegaPrice.sk</p>
                <div class="legal-meta">
                    <span>Platné od: <strong>1. januára 2025</strong></span>
                    <span class="meta-sep">·</span>
                    <span>Aktualizované: <strong>4. marca 2026</strong></span>
                </div>
            </div>

            <p class="legal-intro">Tieto Zásady vysvetľujú, ako Megabuy s.r.o. zhromažďuje, spracúva a chráni osobné údaje návštevníkov, registrovaných používateľov a inzerentov portálu MegaPrice.sk v súlade s nariadením GDPR a zákonom č. 18/2018 Z. z.</p>

            <section id="cl1">
                <h2>Článok 1 – Prevádzkovateľ osobných údajov</h2>
                <div class="info-card">
                    <div class="info-row"><span class="info-label">Obchodné meno:</span> Megabuy s.r.o.</div>
                    <div class="info-row"><span class="info-label">IČO:</span> 57211019</div>
                    <div class="info-row"><span class="info-label">DIČ:</span> 2122614351</div>
                    <div class="info-row"><span class="info-label">Sídlo:</span> Necpaly 90, 038 12 Necpaly</div>
                    <div class="info-row"><span class="info-label">GDPR kontakt:</span> <a href="mailto:gdpr@megaprice.sk">gdpr@megaprice.sk</a></div>
                </div>
                <p>Prevádzkovateľ nemá povinnosť menovať zodpovednú osobu (DPO), avšak otázky súvisiace s ochranou osobných údajov adresujte na vyššie uvedený e-mail.</p>
            </section>

            <section id="cl2">
                <h2>Článok 2 – Aké osobné údaje spracúvame</h2>
                <h3>2.1 Návštevníci Portálu (bez registrácie)</h3>
                <ul>
                    <li>IP adresa (anonymizovaná po 26 mesiacoch)</li>
                    <li>Typ prehliadača a operačného systému</li>
                    <li>Stránky navštívené na Portáli a čas návštevy</li>
                    <li>Zdroj návštevy (odkiaľ ste prišli na Portál)</li>
                </ul>
                <h3>2.2 Registrovaní používatelia</h3>
                <ul>
                    <li>Meno a priezvisko (voliteľné)</li>
                    <li>E-mailová adresa</li>
                    <li>Zašifrované heslo</li>
                    <li>História vyhľadávaní a obľúbených produktov (ak je aktivovaná)</li>
                </ul>
                <h3>2.3 Inzerenti (obchodní partneri)</h3>
                <ul>
                    <li>Kontaktné osoby: meno, priezvisko, e-mail, telefón</li>
                    <li>Fakturačné údaje: názov firmy, IČO, IČ DPH, adresa</li>
                    <li>Prihlasovacie údaje (e-mail, zašifrované heslo)</li>
                    <li>Údaje o kampaniach, kliknutiach a platbách</li>
                </ul>
            </section>

            <section id="cl3">
                <h2>Článok 3 – Účely a právny základ spracúvania</h2>
                <p>Osobné údaje spracúvame na základe nasledovných právnych základov podľa čl. 6 GDPR:</p>
                <div class="basis-grid">
                    <div class="basis-card">
                        <div class="basis-icon">📋</div>
                        <div class="basis-title">Plnenie zmluvy</div>
                        <div class="basis-ref">čl. 6 ods. 1 písm. b)</div>
                        <div class="basis-desc">Správa účtov inzerentov, fakturácia, technická podpora</div>
                    </div>
                    <div class="basis-card">
                        <div class="basis-icon">🛡️</div>
                        <div class="basis-title">Oprávnený záujem</div>
                        <div class="basis-ref">čl. 6 ods. 1 písm. f)</div>
                        <div class="basis-desc">Bezpečnosť, prevencia podvodov, analytika, zlepšovanie služieb</div>
                    </div>
                    <div class="basis-card">
                        <div class="basis-icon">✅</div>
                        <div class="basis-title">Súhlas</div>
                        <div class="basis-ref">čl. 6 ods. 1 písm. a)</div>
                        <div class="basis-desc">Marketingová komunikácia, newsletter, personalizácia</div>
                    </div>
                    <div class="basis-card">
                        <div class="basis-icon">⚖️</div>
                        <div class="basis-title">Zákonná povinnosť</div>
                        <div class="basis-ref">čl. 6 ods. 1 písm. c)</div>
                        <div class="basis-desc">Uchovávanie daňových dokladov (10 rokov, zákon č. 431/2002 Z. z.)</div>
                    </div>
                </div>
            </section>

            <section id="cl4">
                <h2>Článok 4 – Doba uchovávania údajov</h2>
                <div class="retention-table">
                    <div class="ret-row"><span class="ret-type">Analytické dáta (anonymizované)</span><span class="ret-time">26 mesiacov</span></div>
                    <div class="ret-row"><span class="ret-type">Registračné údaje</span><span class="ret-time">Doba trvania účtu + 3 roky</span></div>
                    <div class="ret-row"><span class="ret-type">Fakturačné a účtovné doklady</span><span class="ret-time">10 rokov od vystavenia</span></div>
                    <div class="ret-row"><span class="ret-type">Komunikácia so zákazníkmi</span><span class="ret-time">3 roky od posledného kontaktu</span></div>
                    <div class="ret-row"><span class="ret-type">Údaje na základe súhlasu</span><span class="ret-time">Do odvolania súhlasu</span></div>
                </div>
            </section>

            <section id="cl5">
                <h2>Článok 5 – Príjemcovia osobných údajov</h2>
                <p>Osobné údaje môžeme zdieľať s nasledovnými kategóriami príjemcov:</p>
                <ul>
                    <li>Poskytovatelia cloudových a serverových služieb (Hetzner Online GmbH, Nemecko – EHP)</li>
                    <li>Poskytovateľ platobnej brány a bankové inštitúcie</li>
                    <li>Účtovní poradcovia (spracúvajú fakturačné údaje)</li>
                    <li>Poskytovatelia e-mailových služieb (napr. SMTP gateway)</li>
                    <li>Orgány verejnej moci v prípadoch zákonom stanovenej povinnosti</li>
                </ul>
                <div class="highlight-box green">
                    <span class="material-icons-round" style="color:#10b981">verified</span>
                    <div>Údaje <strong>nepredávame</strong> tretím stranám na marketingové účely. Prenos do tretích krajín mimo EHP realizujeme len na základe štandardných zmluvných doložiek schválených Európskou komisiou.</div>
                </div>
            </section>

            <section id="cl6">
                <h2>Článok 6 – Vaše práva</h2>
                <p>Ako dotknutá osoba máte nasledovné práva podľa GDPR:</p>
                <div class="rights-grid">
                    <div class="right-item"><strong>Právo na prístup</strong> <span class="right-ref">(čl. 15)</span><br>Získať potvrdenie a kópiu vašich údajov</div>
                    <div class="right-item"><strong>Právo na opravu</strong> <span class="right-ref">(čl. 16)</span><br>Požiadať o opravu nesprávnych údajov</div>
                    <div class="right-item"><strong>Právo na vymazanie</strong> <span class="right-ref">(čl. 17)</span><br>Požiadať o vymazanie údajov</div>
                    <div class="right-item"><strong>Právo na obmedzenie</strong> <span class="right-ref">(čl. 18)</span><br>Pozastaviť spracúvanie</div>
                    <div class="right-item"><strong>Právo na prenosnosť</strong> <span class="right-ref">(čl. 20)</span><br>Údaje v strojovo čitateľnom formáte</div>
                    <div class="right-item"><strong>Právo namietať</strong> <span class="right-ref">(čl. 21)</span><br>Namietať voči oprávnenému záujmu</div>
                </div>
                <div class="info-card">
                    <p style="margin:0; font-size:14px; line-height:1.6;">Svoju žiadosť zasielajte na <a href="mailto:gdpr@megaprice.sk" style="color:#c4956a; font-weight:600;">gdpr@megaprice.sk</a>. Odpovieme do 30 dní. Máte tiež právo podať sťažnosť na <strong>Úrad na ochranu osobných údajov SR</strong>, Hraničná 12, 820 07 Bratislava.</p>
                </div>
            </section>

            <section id="cl7">
                <h2>Článok 7 – Bezpečnosť</h2>
                <p>Prijali sme primerané technické a organizačné opatrenia na ochranu osobných údajov, vrátane: šifrovania prenosu (HTTPS/TLS), šifrovania hesiel (bcrypt), pravidelného zálohovania, obmedzenia prístupu na princípe najmenších privilégií a monitorovania bezpečnostných udalostí.</p>
            </section>

            <section id="cl8">
                <h2>Článok 8 – Zmeny Zásad</h2>
                <p>O podstatných zmenách Zásad budeme informovať zverejnením nových Zásad na Portáli a v prípade registrovaných používateľov aj e-mailom. Aktuálna verzia je vždy dostupná na tejto stránke.</p>
            </section>

            <div class="legal-footer-nav">
                <a href="/podmienky-pouzivania">← Podmienky používania</a>
                <a href="/zasady-cookies">Zásady cookies →</a>
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
    section h3 { font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; color: #334155; margin: 20px 0 10px; }
    section p { font-family: 'DM Sans', sans-serif; font-size: 14.5px; line-height: 1.75; color: #374151; margin: 0 0 12px; }
    section ul { margin: 8px 0 16px 20px; } section li { font-family: 'DM Sans', sans-serif; font-size: 14px; line-height: 1.7; color: #475569; margin-bottom: 6px; }
    section a { color: #c4956a; text-decoration: none; } section a:hover { text-decoration: underline; }
    .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 20px; margin: 12px 0 16px; }
    .info-row { font-family: 'DM Sans', sans-serif; font-size: 14px; color: #334155; padding: 4px 0; display: flex; gap: 6px; flex-wrap: wrap; }
    .info-label { font-weight: 600; color: #0f172a; min-width: 130px; }
    .highlight-box { display: flex; gap: 12px; padding: 14px 18px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; margin: 14px 0; align-items: flex-start; }
    .highlight-box div { font-family: 'DM Sans', sans-serif; font-size: 14px; line-height: 1.6; color: #1e40af; }
    .highlight-box.green { background: #ecfdf5; border-color: #a7f3d0; }
    .highlight-box.green div { color: #065f46; }

    /* GDPR specific */
    .basis-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }
    .basis-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; }
    .basis-icon { font-size: 20px; margin-bottom: 6px; }
    .basis-title { font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 14px; color: #0f172a; }
    .basis-ref { font-size: 11px; color: #94a3b8; margin-bottom: 6px; }
    .basis-desc { font-family: 'DM Sans', sans-serif; font-size: 13px; color: #64748b; line-height: 1.5; }

    .retention-table { border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin: 12px 0; }
    .ret-row { display: flex; justify-content: space-between; padding: 12px 16px; font-family: 'DM Sans', sans-serif; font-size: 14px; border-bottom: 1px solid #f1f5f9; align-items: center; gap: 12px; }
    .ret-row:last-child { border-bottom: none; }
    .ret-row:nth-child(even) { background: #f8fafc; }
    .ret-type { color: #334155; font-weight: 500; }
    .ret-time { color: #64748b; text-align: right; font-size: 13px; white-space: nowrap; }

    .rights-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 16px 0; }
    .right-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; font-family: 'DM Sans', sans-serif; font-size: 13px; color: #475569; line-height: 1.5; }
    .right-item strong { color: #0f172a; font-size: 13px; }
    .right-ref { font-size: 11px; color: #94a3b8; }

    .legal-footer-nav { display: flex; gap: 16px; padding-top: 24px; border-top: 1px solid #e2e8f0; margin-top: 40px; flex-wrap: wrap; }
    .legal-footer-nav a { font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; color: #c4956a; text-decoration: none; padding: 10px 18px; background: #fdf8f4; border-radius: 8px; }
    .legal-footer-nav a:hover { background: #faebd7; }
    @media (max-width: 768px) {
        .legal-sidebar { display: none; } .legal-layout { grid-template-columns: 1fr; gap: 0; }
        .mobile-toc-btn { display: flex; } .mobile-toc { display: block; }
        .legal-hero h1 { font-size: 24px; } .legal-hero { padding: 20px 0 20px; }
        .info-row { flex-direction: column; gap: 2px; } .info-label { min-width: auto; }
        section h2 { font-size: 19px; } .highlight-box { flex-direction: column; gap: 8px; }
        .basis-grid { grid-template-columns: 1fr; } .rights-grid { grid-template-columns: 1fr; }
        .ret-row { flex-direction: column; gap: 4px; } .ret-time { text-align: left; }
    }
</style>
