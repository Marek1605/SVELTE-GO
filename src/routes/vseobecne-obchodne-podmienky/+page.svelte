<script>
    import { onMount } from 'svelte';
    
    let activeSection = '';
    let showMobileToc = false;
    
    const sections = [
        { id: 'cl1', label: 'Čl. 1 – Prevádzkovateľ' },
        { id: 'cl2', label: 'Čl. 2 – Pojmy' },
        { id: 'cl3', label: 'Čl. 3 – Registrácia' },
        { id: 'cl4', label: 'Čl. 4 – Služby' },
        { id: 'cl5', label: 'Čl. 5 – XML feed' },
        { id: 'cl6', label: 'Čl. 6 – CPC a kredit' },
        { id: 'cl7', label: 'Čl. 7 – Práva inzerenta' },
        { id: 'cl8', label: 'Čl. 8 – Práva prevádzkovateľa' },
        { id: 'cl9', label: 'Čl. 9 – Zodpovednosť' },
        { id: 'cl10', label: 'Čl. 10 – Duševné vlastníctvo' },
        { id: 'cl11', label: 'Čl. 11 – Ukončenie zmluvy' },
        { id: 'cl12', label: 'Čl. 12 – Riešenie sporov' },
        { id: 'cl13', label: 'Čl. 13 – Záverečné' },
    ];
    
    onMount(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) activeSection = e.target.id;
            });
        }, { rootMargin: '-80px 0px -70% 0px' });
        
        sections.forEach(s => {
            const el = document.getElementById(s.id);
            if (el) observer.observe(el);
        });
        
        return () => observer.disconnect();
    });
    
    function scrollTo(id) {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        showMobileToc = false;
    }
</script>

<svelte:head>
    <title>Všeobecné obchodné podmienky | MegaPrice.sk</title>
    <meta name="description" content="Všeobecné obchodné podmienky pre inzerentov na CPC porovnávači cien MegaPrice.sk. Platné od 1. januára 2025.">
    <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
</svelte:head>

<div class="legal-page">
    <!-- Mobile TOC toggle -->
    <button class="mobile-toc-btn" on:click={() => showMobileToc = !showMobileToc}>
        <span class="material-icons-round" style="font-size:18px">list</span>
        Obsah dokumentu
        <span class="material-icons-round" style="font-size:18px">{showMobileToc ? 'expand_less' : 'expand_more'}</span>
    </button>
    
    {#if showMobileToc}
        <nav class="mobile-toc">
            {#each sections as s}
                <button class:active={activeSection === s.id} on:click={() => scrollTo(s.id)}>{s.label}</button>
            {/each}
        </nav>
    {/if}

    <div class="legal-layout">
        <!-- Desktop sidebar TOC -->
        <aside class="legal-sidebar">
            <div class="toc-sticky">
                <div class="toc-header">Obsah</div>
                <nav class="toc-nav">
                    {#each sections as s}
                        <button class:active={activeSection === s.id} on:click={() => scrollTo(s.id)}>{s.label}</button>
                    {/each}
                </nav>
                <div class="toc-links">
                    <a href="/podmienky-pouzivania">Podmienky používania</a>
                    <a href="/ochrana-osobnych-udajov">Ochrana osobných údajov</a>
                    <a href="/zasady-cookies">Zásady cookies</a>
                    <a href="/impressum">Impressum</a>
                </div>
            </div>
        </aside>
        
        <!-- Content -->
        <main class="legal-content">
            <div class="legal-hero">
                <span class="legal-badge">PRÁVNY DOKUMENT</span>
                <h1>Všeobecné obchodné podmienky</h1>
                <p class="legal-sub">Pre inzerentov platformy MegaPrice.sk</p>
                <div class="legal-meta">
                    <span>Platné od: <strong>1. januára 2025</strong></span>
                    <span class="meta-sep">·</span>
                    <span>Aktualizované: <strong>4. marca 2026</strong></span>
                </div>
            </div>

            <p class="legal-intro">
                Tieto Všeobecné obchodné podmienky (ďalej len „VOP") upravujú zmluvný vzťah medzi prevádzkovateľom 
                porovnávacieho portálu MegaPrice.sk a inzerentmi (obchodnými partnermi), ktorí využívajú služby CPC 
                porovnávača cien na propagáciu svojich produktov.
            </p>

            <!-- Článok 1 -->
            <section id="cl1">
                <h2>Článok 1 – Prevádzkovateľ a identifikácia</h2>
                <div class="info-card">
                    <div class="info-row"><span class="info-label">Obchodné meno:</span> Megabuy s.r.o.</div>
                    <div class="info-row"><span class="info-label">Sídlo:</span> Necpaly 90, 038 12 Necpaly</div>
                    <div class="info-row"><span class="info-label">IČO:</span> 57211019</div>
                    <div class="info-row"><span class="info-label">DIČ:</span> 2122614351</div>
                    <div class="info-row"><span class="info-label">IČ DPH:</span> SK2122614351 <em style="font-size:12px; color:#94a3b8">(§7a – registrácia pre služby)</em></div>
                    <div class="info-row"><span class="info-label">Registrácia:</span> Obchodný register Okresného súdu Žilina</div>
                    <div class="info-row"><span class="info-label">E-mail:</span> <a href="/cdn-cgi/l/email-protection#761f181019361b13111706041f151358051d"><span class="__cf_email__" data-cfemail="e48d8a828ba48981838594968d8781ca978f">[email&#160;protected]</span></a></div>
                    <div class="info-row"><span class="info-label">Web:</span> <a href="https://www.megaprice.sk">https://www.megaprice.sk</a></div>
                </div>
                <p>(ďalej len „Prevádzkovateľ")</p>
            </section>

            <!-- Článok 2 -->
            <section id="cl2">
                <h2>Článok 2 – Vymedzenie pojmov</h2>
                <dl class="def-list">
                    <dt>Portál</dt>
                    <dd>Webová stránka dostupná na adrese www.megaprice.sk, ktorá umožňuje porovnávanie cien produktov rôznych internetových obchodov.</dd>
                    <dt>Inzerent</dt>
                    <dd>Fyzická alebo právnická osoba prevádzkujúca elektronický obchod, ktorá uzavrela s Prevádzkovateľom zmluvu o poskytovaní služieb a umiestňuje svoje ponuky na Portáli.</dd>
                    <dt>CPC (Cost Per Click)</dt>
                    <dd>Model spoplatňovania, pri ktorom Inzerent platí za každé kliknutie používateľa na odkaz vedúci na web Inzerenta.</dd>
                    <dt>Produktový feed / XML feed</dt>
                    <dd>Štruktúrovaný dátový súbor vo formáte XML obsahujúci informácie o produktoch Inzerenta.</dd>
                    <dt>Kredit</dt>
                    <dd>Finančná záloha vložená Inzerentom na jeho účet v systéme MegaPrice.sk, z ktorej sa odpočítavajú poplatky za kliknutia.</dd>
                    <dt>Kampaň</dt>
                    <dd>Súbor nastavení určujúcich, za akú CPC cenu a za akých podmienok sú produkty Inzerenta zobrazované na Portáli.</dd>
                </dl>
            </section>

            <!-- Článok 3 -->
            <section id="cl3">
                <h2>Článok 3 – Uzatvorenie zmluvy a registrácia</h2>
                <p>3.1 Zmluva medzi Inzerentom a Prevádzkovateľom sa uzatvára registráciou Inzerenta na Portáli a akceptáciou týchto VOP. Kliknutím na tlačidlo „Súhlasím s VOP" Inzerent potvrdzuje, že sa s týmito VOP oboznámil a súhlasí s nimi.</p>
                <p>3.2 Registrácia je podmienená uvedením pravdivých a úplných identifikačných údajov. Inzerent je povinný bezodkladne aktualizovať svoje údaje v prípade ich zmeny.</p>
                <p>3.3 Prevádzkovateľ si vyhradzuje právo odmietnuť registráciu bez uvedenia dôvodu, najmä ak by obsah ponúkaných produktov bol v rozpore s platnou legislatívou.</p>
                <p>3.4 Inzerent môže byť fyzická osoba – podnikateľ (živnostník) alebo právnická osoba. Inzerent potvrdzuje, že jeho podnikateľská činnosť je riadne registrovaná podľa platných zákonov Slovenskej republiky.</p>
            </section>

            <!-- Článok 4 -->
            <section id="cl4">
                <h2>Článok 4 – Predmet a rozsah služieb</h2>
                <p>4.1 Prevádzkovateľ poskytuje Inzerentovi nasledovné služby:</p>
                <ul>
                    <li>Zaradenie produktov Inzerenta do databázy Portálu na základe importu XML feedu alebo manuálneho zadania</li>
                    <li>Zobrazovanie produktov Inzerenta v porovnávacích výpisoch na Portáli</li>
                    <li>Presmerovanie návštevníkov Portálu na stránky Inzerenta prostredníctvom platených odkazov (CPC model)</li>
                    <li>Prístup k štatistikám a prehľadom kliknutí, výdavkov a výkonu kampane prostredníctvom partnerského rozhrania</li>
                    <li>Technická podpora pri integrácii XML feedu</li>
                </ul>
                <p>4.2 Prevádzkovateľ si vyhradzuje právo meniť, upravovať alebo dočasne prerušiť poskytovanie služieb, pričom o plánovaných zmenách bude Inzerentov informovať minimálne 14 dní vopred.</p>
            </section>

            <!-- Článok 5 -->
            <section id="cl5">
                <h2>Článok 5 – XML feed a technická integrácia</h2>
                <p>5.1 Inzerent je povinný dodávať produktový XML feed v štandardizovanom formáte podľa špecifikácie zverejnenej Prevádzkovateľom na Portáli. Odporúčaný formát vychádza z bežne používaného XML štandardu pre slovenské porovnávače cien.</p>
                <p>5.2 Inzerent zodpovedá za správnosť, aktuálnosť a úplnosť dát v XML feede. Feed musí obsahovať najmä: názov produktu, URL adresu produktu na webe Inzerenta, cenu, EAN kód (ak je dostupný), dostupnosť a kategóriu.</p>
                <p>5.3 Inzerent súhlasí s tým, že Prevádzkovateľ môže automaticky importovať a spracovávať obsah feedu, vrátane kategorizácie produktov pomocou automatizovaných nástrojov (AI kategorizácia).</p>
                <div class="highlight-box">
                    <span class="material-icons-round" style="color:#f59e0b">warning</span>
                    <div>
                        <strong>5.4</strong> Akákoľvek zmena URL adresy XML feedu musí byť vopred schválená Prevádzkovateľom. 
                        Neoprávnená zmena URL adresy feedu môže viesť k dočasnému pozastaveniu kampane.
                    </div>
                </div>
                <p>5.5 Inzerent nesmie do XML feedu zaraďovať produkty, ktoré sú zakázané zákonom, vrátane ale bez obmedzenia na: zbrane a strelivo, narkotické látky, falšovaný tovar, lieky na predpis bez oprávnenia, a produkty porušujúce práva duševného vlastníctva.</p>
            </section>

            <!-- Článok 6 -->
            <section id="cl6">
                <h2>Článok 6 – CPC ceny a kredit</h2>
                <p>6.1 Inzerent hradí Prevádzkovateľovi odplatu za každé kliknutie (CPC) na odkaz vedúci na web Inzerenta. Aktuálny cenník minimálnych CPC cien je dostupný v partnerskom rozhraní.</p>
                <p>6.2 Prevádzkovateľ nie je platiteľom DPH podľa § 4 zákona č. 222/2004 Z. z. (je registrovaný podľa § 7a pre prijímanie služieb zo zahraničia). Ceny za CPC kliknutia sú preto uvádzané ako konečné, bez DPH.</p>
                <p>6.3 Systém funguje na princípe predplateného kreditu. Inzerent vloží kredit na svoj účet vopred. Kliknutia sú odpočítavané v reálnom čase. Ak kredit klesne na nulu, zobrazovanie produktov Inzerenta bude pozastavené.</p>
                <div class="info-card compact">
                    <div class="info-row"><span class="info-label">Minimálne dobíjanie:</span> 10 EUR</div>
                    <div class="info-row"><span class="info-label">Kredit:</span> Nevratný (okrem ukončenia zmluvy)</div>
                    <div class="info-row"><span class="info-label">Vrátenie pri ukončení:</span> Do 30 dní, zníž. o 20 % admin. poplatok</div>
                </div>
                <p>6.5 Inzerent môže nastaviť denný alebo mesačný limit výdavkov v partnerskom rozhraní. Prevádzkovateľ negarantuje presné dodržanie limitu z technických dôvodov (oneskorenie spracovania).</p>
                <p>6.6 Prevádzkovateľ vystaví účtovný doklad (faktúru) za každé dobíjanie kreditu. Faktúra nebude obsahovať DPH, keďže Prevádzkovateľ nie je platiteľom DPH podľa § 4. Faktúra bude dostupná v elektronickej forme v partnerskom rozhraní.</p>
            </section>

            <!-- Článok 7 -->
            <section id="cl7">
                <h2>Článok 7 – Práva a povinnosti Inzerenta</h2>
                <h3>7.1 Inzerent je oprávnený:</h3>
                <ul>
                    <li>Pristupovať k partnerskému rozhraniu a spravovať svoje kampane</li>
                    <li>Nastaviť CPC ceny pre jednotlivé produkty alebo kategórie</li>
                    <li>Zobrazovať svoje produkty v porovnávacích výpisoch na Portáli</li>
                    <li>Využívať štatistické nástroje dostupné v partnerskom rozhraní</li>
                    <li>Kontaktovať technickú podporu Prevádzkovateľa</li>
                </ul>
                <h3>7.2 Inzerent je povinný:</h3>
                <ul>
                    <li>Udržiavať aktuálne a správne údaje vo svojom profile a XML feede</li>
                    <li>Dodržiavať zákon č. 108/2024 Z. z. o ochrane spotrebiteľa a zákon č. 22/2004 Z. z. o elektronickom obchode</li>
                    <li>Nešíriť zavádzajúce alebo nepravdivé informácie o produktoch</li>
                    <li>Zabezpečiť, aby URL adresy v XML feede boli funkčné a dostupné</li>
                    <li>Informovať Prevádzkovateľa o zmenách vo svojej podnikateľskej činnosti</li>
                    <li>Nepokúšať sa o obchádzanie CPC systému (napr. klikanie na vlastné reklamy)</li>
                </ul>
            </section>

            <!-- Článok 8 -->
            <section id="cl8">
                <h2>Článok 8 – Práva a povinnosti Prevádzkovateľa</h2>
                <h3>8.1 Prevádzkovateľ je povinný:</h3>
                <ul>
                    <li>Zobrazovať produkty Inzerenta v súlade s nastaveniami jeho kampane a dostupným kreditom</li>
                    <li>Poskytovať prístup k partnerskému rozhraniu s štatistikami kliknutí</li>
                    <li>Informovať Inzerenta o plánovaných výpadkoch alebo zmenách Portálu s minimálne 48-hodinovým predstihom</li>
                    <li>Chrániť osobné a obchodné údaje Inzerenta v súlade s GDPR a zákonom č. 18/2018 Z. z.</li>
                </ul>
                <h3>8.2 Prevádzkovateľ má právo:</h3>
                <ul>
                    <li>Odmietnuť alebo odstrániť produkty, ktoré porušujú tieto VOP alebo platnú legislatívu</li>
                    <li>Upraviť cenník CPC cien s výpovednou lehotou 30 dní</li>
                    <li>Dočasne pozastaviť kampane Inzerenta v prípade podozrenia na podvodné kliknutia</li>
                    <li>Zrušiť účet Inzerenta v prípade závažného porušenia VOP</li>
                </ul>
            </section>

            <!-- Článok 9 -->
            <section id="cl9">
                <h2>Článok 9 – Záruky a zodpovednosť</h2>
                <p>9.1 Prevádzkovateľ nezaručuje konkrétny počet kliknutí ani výšku obratu Inzerenta. Portál slúži ako reklamný a porovnávací nástroj.</p>
                <p>9.2 Prevádzkovateľ nezodpovedá za škody vzniknuté:</p>
                <ul>
                    <li>Výpadkami internetu alebo technickými problémami na strane tretích strán</li>
                    <li>Chybami v dátach poskytnutých Inzerentom</li>
                    <li>Konaním tretích osôb (vrátane neplatných kliknutí od botov, pokiaľ Prevádzkovateľ prijal primerané opatrenia na ich filtráciu)</li>
                </ul>
                <p>9.3 Celková zodpovednosť Prevádzkovateľa voči Inzerentovi za akékoľvek škody je obmedzená na výšku kreditu zaplatého Inzerentom za posledných 3 mesiacov.</p>
                <p>9.4 Prevádzkovateľ implementuje anti-click-fraud opatrenia a v prípade preukázateľného podvodu (napr. botový traffic) vráti príslušný kredit Inzerentovi.</p>
            </section>

            <!-- Článok 10 -->
            <section id="cl10">
                <h2>Článok 10 – Ochrana duševného vlastníctva</h2>
                <p>10.1 Inzerent udeľuje Prevádzkovateľovi bezodplatnú, nevýhradnú licenciu na používanie produktových fotografií, názvov, popisov a iného obsahu obsiahnutého v XML feede na účely zobrazenia na Portáli.</p>
                <p>10.2 Inzerent zodpovedá za to, že obsah XML feedu neporušuje práva duševného vlastníctva tretích osôb. V prípade nárokov tretích osôb vyplývajúcich z porušenia práv obsahom feedu Inzerent odškodní Prevádzkovateľa.</p>
                <p>10.3 Prevádzkovateľ je vlastníkom všetkých práv k Portálu, jeho dizajnu, zdrojovému kódu, databáze a ostatným prvkom.</p>
            </section>

            <!-- Článok 11 -->
            <section id="cl11">
                <h2>Článok 11 – Trvanie a ukončenie zmluvy</h2>
                <p>11.1 Zmluva sa uzatvára na dobu neurčitú.</p>
                <p>11.2 Každá zmluvná strana môže zmluvu vypovedať písomne (e-mailom) s 30-dňovou výpovednou lehotou.</p>
                <p>11.3 Prevádzkovateľ môže vypovedať zmluvu s okamžitou účinnosťou, ak:</p>
                <ul>
                    <li>Inzerent závažne alebo opakovane porušuje tieto VOP</li>
                    <li>Inzerent je v omeškaní s úhradou pohľadávok voči Prevádzkovateľovi</li>
                    <li>Inzerent bol právoplatne odsúdený za trestný čin súvisiaci s jeho podnikateľskou činnosťou</li>
                </ul>
                <p>11.4 Po ukončení zmluvy budú produkty Inzerenta odstránené z Portálu do 5 pracovných dní. Nevyužitý kredit bude vrátený do 30 dní od ukončenia zmluvy.</p>
            </section>

            <!-- Článok 12 -->
            <section id="cl12">
                <h2>Článok 12 – Riešenie sporov</h2>
                <p>12.1 Zmluvné strany sa zaväzujú riešiť spory prednostne mimosúdnou cestou.</p>
                <p>12.2 Inzerent – spotrebiteľ – má právo obrátiť sa na Slovenskú obchodnú inšpekciu (SOI), Prievozská 32, 827 99 Bratislava 27, alebo na platformu riešenia sporov online: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener">https://ec.europa.eu/consumers/odr</a></p>
                <p>12.3 Pre obchodné spory medzi podnikateľmi je príslušný Okresný súd v Žiline podľa sídla Prevádzkovateľa.</p>
                <p>12.4 Tieto VOP sa riadia právnym poriadkom Slovenskej republiky, konkrétne Obchodným zákonníkom (zákon č. 513/1991 Zb. v znení neskorších predpisov) a súvisiacimi právnymi predpismi SR.</p>
            </section>

            <!-- Článok 13 -->
            <section id="cl13">
                <h2>Článok 13 – Záverečné ustanovenia</h2>
                <p>13.1 Prevádzkovateľ si vyhradzuje právo meniť tieto VOP. O každej zmene bude Inzerent informovaný e-mailom minimálne 30 dní pred nadobudnutím účinnosti nových VOP.</p>
                <p>13.2 Ak sa niektoré ustanovenie VOP stane neplatným alebo nevymáhateľným, ostatné ustanovenia zostávajú v platnosti.</p>
                <p>13.3 Tieto VOP nadobúdajú platnosť a účinnosť dňom 1. januára 2025 a nahrádzajú všetky predchádzajúce verzie.</p>
            </section>

            <div class="legal-footer-nav">
                <a href="/podmienky-pouzivania">Podmienky používania →</a>
                <a href="/ochrana-osobnych-udajov">Ochrana osobných údajov →</a>
            </div>
        </main>
    </div>
</div>

<style>
    @import url('https://fonts.googleapis.com/icon?family=Material+Icons+Round');
    
    .legal-page { max-width: 1200px; margin: 0 auto; padding: 0 16px; }
    
    .legal-layout { display: grid; grid-template-columns: 220px 1fr; gap: 40px; align-items: start; }
    
    /* Sidebar */
    .legal-sidebar { display: block; }
    .toc-sticky { position: sticky; top: 90px; }
    .toc-header { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; margin-bottom: 12px; padding-left: 12px; }
    .toc-nav { display: flex; flex-direction: column; gap: 1px; }
    .toc-nav button { display: block; width: 100%; text-align: left; background: none; border: none; border-left: 2px solid transparent; padding: 6px 12px; font-size: 12.5px; color: #64748b; cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif; line-height: 1.4; }
    .toc-nav button:hover { color: #1e293b; background: #f8fafc; }
    .toc-nav button.active { border-left-color: #c4956a; color: #1e293b; font-weight: 600; background: #fdf8f4; }
    .toc-links { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 6px; padding-left: 12px; }
    .toc-links a { font-size: 12px; color: #94a3b8; text-decoration: none; transition: color 0.15s; }
    .toc-links a:hover { color: #c4956a; }
    
    /* Mobile TOC */
    .mobile-toc-btn { display: none; width: 100%; padding: 12px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; font-weight: 500; color: #475569; cursor: pointer; margin-bottom: 12px; font-family: 'DM Sans', sans-serif; align-items: center; justify-content: space-between; }
    .mobile-toc { display: none; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px; margin-bottom: 16px; max-height: 300px; overflow-y: auto; }
    .mobile-toc button { display: block; width: 100%; text-align: left; background: none; border: none; padding: 8px 12px; font-size: 13px; color: #475569; cursor: pointer; border-radius: 6px; font-family: 'DM Sans', sans-serif; }
    .mobile-toc button:hover { background: #f1f5f9; }
    .mobile-toc button.active { background: #fdf8f4; color: #92400e; font-weight: 600; }
    
    /* Content */
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
    section h3 { font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; color: #334155; margin: 20px 0 10px; }
    section p { font-family: 'DM Sans', sans-serif; font-size: 14.5px; line-height: 1.75; color: #374151; margin: 0 0 12px; }
    section ul { margin: 8px 0 16px 20px; padding: 0; }
    section li { font-family: 'DM Sans', sans-serif; font-size: 14px; line-height: 1.7; color: #475569; margin-bottom: 6px; }
    section a { color: #c4956a; text-decoration: none; }
    section a:hover { text-decoration: underline; }
    
    /* Info card */
    .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 20px; margin: 12px 0 16px; }
    .info-card.compact { padding: 12px 16px; }
    .info-row { font-family: 'DM Sans', sans-serif; font-size: 14px; color: #334155; padding: 4px 0; display: flex; gap: 6px; flex-wrap: wrap; }
    .info-label { font-weight: 600; color: #0f172a; min-width: 130px; }
    
    /* Highlight box */
    .highlight-box { display: flex; gap: 12px; padding: 14px 18px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; margin: 14px 0; align-items: flex-start; }
    .highlight-box div { font-family: 'DM Sans', sans-serif; font-size: 14px; line-height: 1.6; color: #92400e; }
    .highlight-box strong { font-weight: 700; }
    
    /* Definition list */
    .def-list { margin: 0; padding: 0; }
    .def-list dt { font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 14px; }
    .def-list dt:first-child { margin-top: 0; }
    .def-list dd { font-family: 'DM Sans', sans-serif; font-size: 14px; line-height: 1.7; color: #475569; margin: 4px 0 0 0; }
    
    /* Footer nav */
    .legal-footer-nav { display: flex; gap: 16px; padding-top: 24px; border-top: 1px solid #e2e8f0; margin-top: 40px; flex-wrap: wrap; }
    .legal-footer-nav a { font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; color: #c4956a; text-decoration: none; padding: 10px 18px; background: #fdf8f4; border-radius: 8px; transition: all 0.15s; }
    .legal-footer-nav a:hover { background: #faebd7; }
    
    /* Mobile */
    @media (max-width: 768px) {
        .legal-sidebar { display: none; }
        .legal-layout { grid-template-columns: 1fr; gap: 0; }
        .mobile-toc-btn { display: flex; }
        .mobile-toc { display: block; }
        .legal-hero h1 { font-size: 24px; }
        .legal-hero { padding: 20px 0 20px; }
        .info-row { flex-direction: column; gap: 2px; }
        .info-label { min-width: auto; }
        .def-grid { grid-template-columns: 1fr; }
        .retention-table { font-size: 12px; }
    }
</style>