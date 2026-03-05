<script>
    import { onMount } from 'svelte';
    let activeSection = '';
    let showMobileToc = false;
    const sections = [
        { id: 'cl1', label: 'Čl. 1 – Prevádzkovateľ' },
        { id: 'cl2', label: 'Čl. 2 – Charakter Portálu' },
        { id: 'cl3', label: 'Čl. 3 – Používanie' },
        { id: 'cl4', label: 'Čl. 4 – Recenzie' },
        { id: 'cl5', label: 'Čl. 5 – Zodpovednosť' },
        { id: 'cl6', label: 'Čl. 6 – Duševné vlastníctvo' },
        { id: 'cl7', label: 'Čl. 7 – Záverečné' },
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
    <title>Podmienky používania | MegaBuy.sk</title>
    <meta name="description" content="Podmienky používania portálu MegaBuy.sk pre návštevníkov. Pravidlá prístupu a využívania webovej stránky.">
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
                    <a href="/ochrana-osobnych-udajov">Ochrana osobných údajov</a>
                    <a href="/zasady-cookies">Zásady cookies</a>
                    <a href="/impressum">Impressum</a>
                </div>
            </div>
        </aside>

        <main class="legal-content">
            <div class="legal-hero">
                <span class="legal-badge">PRÁVNY DOKUMENT</span>
                <h1>Podmienky používania</h1>
                <p class="legal-sub">Pre návštevníkov portálu MegaBuy.sk</p>
                <div class="legal-meta">
                    <span>Platné od: <strong>1. januára 2025</strong></span>
                    <span class="meta-sep">·</span>
                    <span>Aktualizované: <strong>4. marca 2026</strong></span>
                </div>
            </div>

            <p class="legal-intro">Tieto podmienky používania upravujú pravidlá prístupu a využívania webovej stránky MegaBuy.sk pre bežných návštevníkov a registrovaných používateľov.</p>

            <section id="cl1">
                <h2>Článok 1 – Prevádzkovateľ</h2>
                <div class="info-card">
                    <div class="info-row"><span class="info-label">Prevádzkovateľ:</span> Megabuy s.r.o., IČO: 57211019, DIČ: 2122614351</div>
                    <div class="info-row"><span class="info-label">Sídlo:</span> Necpaly 90, 038 12 Necpaly</div>
                    <div class="info-row"><span class="info-label">Kontakt:</span> <a href="mailto:info@megabuy.sk">info@megabuy.sk</a></div>
                </div>
            </section>

            <section id="cl2">
                <h2>Článok 2 – Charakter Portálu a poskytované informácie</h2>
                <p>2.1 MegaBuy.sk je nezávislý porovnávač cien produktov. Portál zhromažďuje a zobrazuje informácie o produktoch a cenách z externých zdrojov (internetových obchodov) s cieľom uľahčiť spotrebiteľom porovnanie cien.</p>
                <p>2.2 Informácie zobrazované na Portáli (vrátane cien, dostupnosti a popisov produktov) pochádzajú priamo od inzerentov a môžu obsahovať nepresnosti alebo oneskorené aktualizácie. Prevádzkovateľ vynaloží primerané úsilie na zabezpečenie aktuálnosti údajov.</p>
                <div class="highlight-box">
                    <span class="material-icons-round" style="color:#3b82f6">info</span>
                    <div>
                        <strong>2.3</strong> Prevádzkovateľ neprevádzkuje internetový obchod, neuzatvára kúpne zmluvy a nie je stranou obchodného vzťahu medzi návštevníkom a inzerentom. Akýkoľvek nákup sa uskutočňuje priamo na webe príslušného obchodu za jeho podmienok.
                    </div>
                </div>
                <p>2.4 Portál zobrazuje produkty rôznych obchodov. Poradie zobrazenia môže byť ovplyvnené výškou CPC, ktorú inzerent nastavil, ako aj algoritmickými faktormi (relevancia, hodnotenie obchodu, dostupnosť).</p>
            </section>

            <section id="cl3">
                <h2>Článok 3 – Používanie Portálu</h2>
                <p>3.1 Portál je voľne prístupný všetkým návštevníkom bez nutnosti registrácie.</p>
                <p>3.2 Návštevník sa zaväzuje používať Portál len na zákonné účely a spôsobom, ktorý nenarúša práva tretích osôb ani prevádzkovanie Portálu.</p>
                <p>3.3 Je zakázané:</p>
                <ul>
                    <li>Automatické sťahovanie obsahu Portálu (scraping) bez predchádzajúceho písomného súhlasu Prevádzkovateľa</li>
                    <li>Akékoľvek pokusy o narušenie bezpečnosti alebo dostupnosti Portálu</li>
                    <li>Zavádzajúce používanie recenzného systému (falošné hodnotenia)</li>
                    <li>Šírenie nevyžiadanej komunikácie (spam) prostredníctvom komunikačných nástrojov Portálu</li>
                </ul>
            </section>

            <section id="cl4">
                <h2>Článok 4 – Recenzie a hodnotenia</h2>
                <p>4.1 Registrovaní používatelia môžu zanechávať hodnotenia produktov a obchodov.</p>
                <p>4.2 Recenzie musia byť pravdivé, vychádzať z vlastnej skúsenosti a nesmú obsahovať vulgárny, diskriminačný ani inak nevhodný obsah.</p>
                <p>4.3 Prevádzkovateľ si vyhradzuje právo odstrániť recenzie, ktoré porušujú tieto pravidlá.</p>
                <p>4.4 Uverejnením recenzie udeľuje jej autor Prevádzkovateľovi nevýhradnú licenciu na jej zobrazovanie a šírenie na Portáli.</p>
            </section>

            <section id="cl5">
                <h2>Článok 5 – Vylúčenie zodpovednosti</h2>
                <p>5.1 Portál a všetky informácie na ňom sú poskytované „tak ako sú" (as is). Prevádzkovateľ nezaručuje nepretržitú dostupnosť Portálu, aktuálnosť cien ani úplnosť zobrazovaných informácií.</p>
                <p>5.2 Prevádzkovateľ nenesie zodpovednosť za prípadné škody vzniknuté v súvislosti s využívaním Portálu alebo dôverou v informácie na ňom zobrazené.</p>
                <p>5.3 Prevádzkovateľ nezodpovedá za obsah externých webových stránok, na ktoré Portál odkazuje.</p>
            </section>

            <section id="cl6">
                <h2>Článok 6 – Duševné vlastníctvo</h2>
                <p>6.1 Všetok obsah Portálu (dizajn, texty, databáza, zdrojový kód, logá) je chránený autorským právom a je výlučným vlastníctvom Prevádzkovateľa, pokiaľ nie je uvedené inak.</p>
                <p>6.2 Je zakázané kopírovať, rozmnožovať, upravovať alebo distribuovať akýkoľvek obsah Portálu bez predchádzajúceho písomného súhlasu Prevádzkovateľa.</p>
            </section>

            <section id="cl7">
                <h2>Článok 7 – Zmeny podmienok a záverečné ustanovenia</h2>
                <p>7.1 Prevádzkovateľ si vyhradzuje právo kedykoľvek zmeniť tieto Podmienky. Aktuálna verzia je vždy dostupná na stránke <a href="/podmienky-pouzivania">megabuy.sk/podmienky-pouzivania</a>.</p>
                <p>7.2 Pokračovaním v používaní Portálu po zverejnení zmien návštevník vyjadruje súhlas s novými podmienkami.</p>
                <p>7.3 Tieto podmienky sa riadia právom Slovenskej republiky.</p>
            </section>

            <div class="legal-footer-nav">
                <a href="/vseobecne-obchodne-podmienky">← VOP pre inzerentov</a>
                <a href="/ochrana-osobnych-udajov">Ochrana osobných údajov →</a>
            </div>
        </main>
    </div>
</div>

<style>
    @import url('https://fonts.googleapis.com/icon?family=Material+Icons+Round');
    .legal-page { max-width: 1200px; margin: 0 auto; padding: 0 16px; }
    .legal-layout { display: grid; grid-template-columns: 220px 1fr; gap: 40px; align-items: start; }
    .legal-sidebar { display: block; }
    .toc-sticky { position: sticky; top: 90px; }
    .toc-header { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; margin-bottom: 12px; padding-left: 12px; }
    .toc-nav { display: flex; flex-direction: column; gap: 1px; }
    .toc-nav button { display: block; width: 100%; text-align: left; background: none; border: none; border-left: 2px solid transparent; padding: 6px 12px; font-size: 12.5px; color: #64748b; cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif; line-height: 1.4; }
    .toc-nav button:hover { color: #1e293b; background: #f8fafc; }
    .toc-nav button.active { border-left-color: #c4956a; color: #1e293b; font-weight: 600; background: #fdf8f4; }
    .toc-links { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 6px; padding-left: 12px; }
    .toc-links a { font-size: 12px; color: #94a3b8; text-decoration: none; }
    .toc-links a:hover { color: #c4956a; }
    .mobile-toc-btn { display: none; width: 100%; padding: 12px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; font-weight: 500; color: #475569; cursor: pointer; margin-bottom: 12px; font-family: 'DM Sans', sans-serif; align-items: center; justify-content: space-between; }
    .mobile-toc { display: none; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px; margin-bottom: 16px; max-height: 300px; overflow-y: auto; }
    .mobile-toc button { display: block; width: 100%; text-align: left; background: none; border: none; padding: 8px 12px; font-size: 13px; color: #475569; cursor: pointer; border-radius: 6px; font-family: 'DM Sans', sans-serif; }
    .mobile-toc button:hover { background: #f1f5f9; }
    .mobile-toc button.active { background: #fdf8f4; color: #92400e; font-weight: 600; }
    .legal-content { min-width: 0; padding-bottom: 80px; }
    .legal-hero { padding: 32px 0 28px; border-bottom: 1px solid #e2e8f0; margin-bottom: 32px; }
    .legal-badge { display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #c4956a; background: #fdf8f4; padding: 4px 10px; border-radius: 4px; margin-bottom: 12px; }
    .legal-hero h1 { font-family: 'Source Serif 4', Georgia, serif; font-size: 32px; font-weight: 700; color: #0f172a; margin: 0 0 6px; line-height: 1.2; }
    .legal-sub { font-size: 16px; color: #64748b; margin: 0 0 16px; font-family: 'DM Sans', sans-serif; }
    .legal-meta { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #94a3b8; font-family: 'DM Sans', sans-serif; flex-wrap: wrap; }
    .legal-meta strong { color: #475569; font-weight: 600; }
    .meta-sep { color: #cbd5e1; }
    .legal-intro { font-size: 15px; color: #475569; line-height: 1.7; margin-bottom: 36px; padding: 16px 20px; background: #f8fafc; border-left: 3px solid #c4956a; border-radius: 0 8px 8px 0; font-family: 'DM Sans', sans-serif; }
    section { margin-bottom: 36px; scroll-margin-top: 90px; }
    section h2 { font-family: 'Source Serif 4', Georgia, serif; font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 16px; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9; }
    section p { font-family: 'DM Sans', sans-serif; font-size: 14.5px; line-height: 1.75; color: #374151; margin: 0 0 12px; }
    section ul { margin: 8px 0 16px 20px; }
    section li { font-family: 'DM Sans', sans-serif; font-size: 14px; line-height: 1.7; color: #475569; margin-bottom: 6px; }
    section a { color: #c4956a; text-decoration: none; }
    section a:hover { text-decoration: underline; }
    .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 20px; margin: 12px 0 16px; }
    .info-row { font-family: 'DM Sans', sans-serif; font-size: 14px; color: #334155; padding: 4px 0; display: flex; gap: 6px; flex-wrap: wrap; }
    .info-label { font-weight: 600; color: #0f172a; min-width: 130px; }
    .highlight-box { display: flex; gap: 12px; padding: 14px 18px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; margin: 14px 0; align-items: flex-start; }
    .highlight-box div { font-family: 'DM Sans', sans-serif; font-size: 14px; line-height: 1.6; color: #1e40af; }
    .highlight-box strong { font-weight: 700; }
    .legal-footer-nav { display: flex; gap: 16px; padding-top: 24px; border-top: 1px solid #e2e8f0; margin-top: 40px; flex-wrap: wrap; }
    .legal-footer-nav a { font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; color: #c4956a; text-decoration: none; padding: 10px 18px; background: #fdf8f4; border-radius: 8px; transition: all 0.15s; }
    .legal-footer-nav a:hover { background: #faebd7; }
    @media (max-width: 768px) {
        .legal-sidebar { display: none; }
        .legal-layout { grid-template-columns: 1fr; gap: 0; }
        .mobile-toc-btn { display: flex; }
        .mobile-toc { display: block; }
        .legal-hero h1 { font-size: 24px; }
        .legal-hero { padding: 20px 0 20px; }
        .info-row { flex-direction: column; gap: 2px; }
        .info-label { min-width: auto; }
        section h2 { font-size: 19px; }
        .highlight-box { flex-direction: column; gap: 8px; }
    }
</style>
