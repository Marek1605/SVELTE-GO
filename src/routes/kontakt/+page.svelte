<script>
    import { onMount } from 'svelte';
    let activeSection = 'info';
    const sections = [
        { id: 'info', label: 'Dôležité upozornenie' },
        { id: 'company', label: 'Prevádzkovateľ' },
        { id: 'contact', label: 'Kontaktné údaje' },
        { id: 'soi', label: 'Orgán dozoru' },
        { id: 'gdpr', label: 'Ochrana údajov' },
    ];
    let mobileOpen = false;
    onMount(() => {
        const obs = new IntersectionObserver(entries => {
            for (const e of entries) { if (e.isIntersecting) activeSection = e.target.id; }
        }, { rootMargin: '-80px 0px -60% 0px' });
        sections.forEach(s => { const el = document.getElementById(s.id); if (el) obs.observe(el); });
        return () => obs.disconnect();
    });
</script>

<svelte:head>
    <title>Kontakt | MegaPrice.sk</title>
    <meta name="description" content="Kontaktné údaje prevádzkovateľa portálu MegaPrice.sk – Megabuy s.r.o.">
    <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
</svelte:head>

<div class="legal-page">
    <aside class="legal-sidebar">
        <nav>
            <p class="sidebar-title">Obsah</p>
            {#each sections as s}
                <a href="#{s.id}" class="sidebar-link" class:active={activeSection === s.id}>{s.label}</a>
            {/each}
            <div class="sidebar-divider"></div>
            <p class="sidebar-title" style="margin-top:12px">Právne dokumenty</p>
            <a href="/vseobecne-obchodne-podmienky" class="sidebar-link">VOP pre inzerentov</a>
            <a href="/podmienky-pouzivania" class="sidebar-link">Podmienky používania</a>
            <a href="/ochrana-osobnych-udajov" class="sidebar-link">Ochrana údajov</a>
            <a href="/zasady-cookies" class="sidebar-link">Zásady cookies</a>
            <a href="/impressum" class="sidebar-link">Impressum</a>
        </nav>
    </aside>

    <main class="legal-content">
        <button class="mobile-toc-btn" on:click={() => mobileOpen = !mobileOpen}>☰ Obsah</button>
        {#if mobileOpen}
            <div class="mobile-toc">
                {#each sections as s}
                    <a href="#{s.id}" on:click={() => mobileOpen = false}>{s.label}</a>
                {/each}
            </div>
        {/if}

        <div class="legal-header">
            <h1>Kontakt</h1>
            <p class="legal-subtitle">Portál MegaPrice.sk – porovnávač cien</p>
        </div>

        <!-- SECTION: Dôležité upozornenie -->
        <section id="info">
            <div class="warning-box">
                <div class="warning-icon">⚠️</div>
                <div>
                    <h3>Upozornenie – nie sme internetový obchod!</h3>
                    <p>Webová stránka <strong>MegaPrice.sk</strong> funguje výhradne ako <strong>nezávislý porovnávač cien</strong>. Naším cieľom je pomôcť vám nájsť najvýhodnejšiu ponuku medzi registrovanými e-shopmi. Žiadny tovar priamo nepredávame, neskladujeme ani nedoručujeme.</p>
                    <p style="margin-top:10px">Pre uskutočnenie nákupu kliknite pri vybranej ponuke na tlačidlo <strong>„Do obchodu"</strong> — presmerujeme vás na web konkrétneho predajcu, kde transakciu realizujete podľa jeho vlastných obchodných podmienok.</p>
                </div>
            </div>
            <div class="info-note">
                <p>Poradie zobrazenia produktov a obchodov na portáli môže byť ovplyvnené výškou CPC ponuky inzerenta (model cost-per-click). Informácie o produktoch (ceny, dostupnosť, popisy) pochádzajú priamo od inzerentov a môžu obsahovať nepresnosti.</p>
            </div>
        </section>

        <!-- SECTION: Prevádzkovateľ -->
        <section id="company">
            <h2>Prevádzkovateľ portálu</h2>
            <div class="company-grid">
                <div class="company-card">
                    <div class="card-icon">🏢</div>
                    <h4>Obchodné údaje</h4>
                    <div class="card-rows">
                        <div class="card-row"><span>Obchodné meno:</span><strong>Megabuy s.r.o.</strong></div>
                        <div class="card-row"><span>Sídlo:</span><strong>Necpaly 90, 038 12 Necpaly</strong></div>
                        <div class="card-row"><span>IČO:</span><strong>57211019</strong></div>
                        <div class="card-row"><span>DIČ:</span><strong>2122614351</strong></div>
                        <div class="card-row"><span>IČ DPH:</span><strong>SK2122614351</strong></div>
                        <div class="card-row"><span>Registrácia DPH:</span><strong>§7a – pre prijímanie služieb zo zahraničia</strong></div>
                    </div>
                </div>
                <div class="company-card">
                    <div class="card-icon">📋</div>
                    <h4>Registrácia</h4>
                    <div class="card-rows">
                        <div class="card-row"><span>Register:</span><strong>Obchodný register Okresného súdu Žilina</strong></div>
                        <div class="card-row"><span>Oddiel:</span><strong>Sro</strong></div>
                        <div class="card-row"><span>Web portálu:</span><strong><a href="https://www.megaprice.sk">www.megaprice.sk</a></strong></div>
                    </div>
                </div>
            </div>
        </section>

        <!-- SECTION: Kontaktné údaje -->
        <section id="contact">
            <h2>Kontaktné údaje</h2>
            <div class="contact-grid">
                <div class="contact-card">
                    <div class="contact-icon">📧</div>
                    <h4>E-mail</h4>
                    <p>Všeobecné otázky, spolupráca, podpora:</p>
                    <a href="mailto:info@megaprice.sk" class="contact-link">info@megaprice.sk</a>
                </div>
                <div class="contact-card">
                    <div class="contact-icon">📞</div>
                    <h4>Telefón</h4>
                    <p>Pracovné dni, 9:00 – 17:00:</p>
                    <a href="tel:+421904558068" class="contact-link">+421 904 558 068</a>
                </div>
                <div class="contact-card">
                    <div class="contact-icon">🔒</div>
                    <h4>Ochrana osobných údajov</h4>
                    <p>GDPR, žiadosti o výmaz, práva dotknutých osôb:</p>
                    <a href="mailto:gdpr@megaprice.sk" class="contact-link">gdpr@megaprice.sk</a>
                </div>
            </div>
            
            <div class="bank-section">
                <h3>🏦 Bankové spojenie</h3>
                <div class="bank-grid">
                    <div class="bank-row"><span>IBAN:</span><strong>SK13 1100 0000 0029 4527 8297</strong></div>
                    <div class="bank-row"><span>Banka:</span><strong>Tatra banka, a.s.</strong></div>
                    <div class="bank-row"><span>SWIFT/BIC:</span><strong>TATRSKBX</strong></div>
                </div>
            </div>
        </section>

        <!-- SECTION: Orgán dozoru -->
        <section id="soi">
            <h2>Orgán dozoru</h2>
            <div class="company-grid">
                <div class="company-card">
                    <div class="card-icon">🏛️</div>
                    <h4>Slovenská obchodná inšpekcia</h4>
                    <div class="card-rows">
                        <div class="card-row"><span>Inšpektorát:</span><strong>SOI pre Žilinský kraj</strong></div>
                        <div class="card-row"><span>Adresa:</span><strong>Predmestská 71, P.O. BOX B-89, 011 79 Žilina</strong></div>
                        <div class="card-row"><span>Odbor:</span><strong>Technickej kontroly výrobkov a ochrany spotrebiteľa</strong></div>
                        <div class="card-row"><span>Tel.:</span><strong>041/763 21 30</strong></div>
                        <div class="card-row"><span>E-mail:</span><strong><a href="mailto:za@soi.sk">za@soi.sk</a></strong></div>
                        <div class="card-row"><span>Web:</span><strong><a href="https://www.soi.sk" target="_blank" rel="noopener">www.soi.sk</a></strong></div>
                    </div>
                </div>
                <div class="company-card">
                    <div class="card-icon">🛡️</div>
                    <h4>Úrad na ochranu osobných údajov SR</h4>
                    <div class="card-rows">
                        <div class="card-row"><span>Adresa:</span><strong>Hraničná 12, 820 07 Bratislava</strong></div>
                        <div class="card-row"><span>Tel.:</span><strong>02/3231 3214</strong></div>
                        <div class="card-row"><span>Web:</span><strong><a href="https://dataprotection.gov.sk" target="_blank" rel="noopener">dataprotection.gov.sk</a></strong></div>
                    </div>
                </div>
            </div>
        </section>

        <!-- SECTION: Ochrana údajov -->
        <section id="gdpr">
            <h2>Ochrana osobných údajov</h2>
            <p>Podrobné informácie o tom, ako spracúvame vaše osobné údaje, nájdete v nasledujúcich dokumentoch:</p>
            <div class="links-grid">
                <a href="/ochrana-osobnych-udajov" class="doc-link">
                    <span class="doc-icon">🔒</span>
                    <div>
                        <strong>Zásady ochrany osobných údajov</strong>
                        <small>GDPR – práva dotknutých osôb, účely spracúvania, príjemcovia</small>
                    </div>
                </a>
                <a href="/zasady-cookies" class="doc-link">
                    <span class="doc-icon">🍪</span>
                    <div>
                        <strong>Zásady používania cookies</strong>
                        <small>Kategórie cookies, správa súhlasu, nastavenia prehliadača</small>
                    </div>
                </a>
            </div>
        </section>

        <div class="footer-nav">
            <a href="/impressum">← Impressum</a>
            <a href="/vseobecne-obchodne-podmienky">VOP →</a>
        </div>
    </main>
</div>

<style>
    :global(body) { margin: 0; }
    .legal-page { display: flex; min-height: 100vh; font-family: 'DM Sans', sans-serif; color: #1e293b; background: #f8fafc; }
    .legal-sidebar { width: 240px; flex-shrink: 0; padding: 32px 20px; position: sticky; top: 0; height: 100vh; overflow-y: auto; background: #fff; border-right: 1px solid #e2e8f0; }
    .sidebar-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin: 0 0 8px; }
    .sidebar-link { display: block; font-size: 13px; padding: 6px 10px; margin: 2px 0; color: #64748b; border-radius: 6px; text-decoration: none; transition: all 0.15s; }
    .sidebar-link:hover { color: #c4956a; background: #faf6f2; }
    .sidebar-link.active { color: #c4956a; background: #faf6f2; font-weight: 600; }
    .sidebar-divider { height: 1px; background: #e2e8f0; margin: 14px 0; }
    .legal-content { flex: 1; max-width: 780px; padding: 40px 48px 80px; }
    .legal-header { margin-bottom: 32px; }
    .legal-header h1 { font-family: 'Source Serif 4', serif; font-size: 32px; font-weight: 700; margin: 0 0 6px; }
    .legal-subtitle { font-size: 15px; color: #94a3b8; margin: 0; }
    section { margin-bottom: 40px; }
    h2 { font-family: 'Source Serif 4', serif; font-size: 22px; font-weight: 700; margin: 0 0 16px; padding-bottom: 10px; border-bottom: 2px solid #f1f5f9; }

    /* Warning box */
    .warning-box { display: flex; gap: 16px; padding: 24px; background: linear-gradient(135deg, #fef3c7, #fde68a33); border: 1px solid #f59e0b44; border-radius: 12px; margin-bottom: 16px; }
    .warning-icon { font-size: 32px; flex-shrink: 0; }
    .warning-box h3 { font-size: 17px; font-weight: 700; color: #92400e; margin: 0 0 8px; }
    .warning-box p { font-size: 14px; color: #78350f; line-height: 1.7; margin: 0; }
    .info-note { padding: 14px 18px; background: #f1f5f9; border-radius: 8px; font-size: 13px; color: #64748b; line-height: 1.6; }

    /* Company grid */
    .company-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .company-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 22px; }
    .card-icon { font-size: 24px; margin-bottom: 8px; }
    .company-card h4 { font-size: 15px; font-weight: 700; margin: 0 0 14px; color: #0f172a; }
    .card-rows { display: flex; flex-direction: column; gap: 8px; }
    .card-row { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; font-size: 13px; }
    .card-row span { color: #94a3b8; flex-shrink: 0; }
    .card-row strong { color: #1e293b; text-align: right; }
    .card-row a { color: #c4956a; text-decoration: none; }
    .card-row a:hover { text-decoration: underline; }

    /* Contact grid */
    .contact-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .contact-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 22px; text-align: center; }
    .contact-icon { font-size: 28px; margin-bottom: 8px; }
    .contact-card h4 { font-size: 14px; font-weight: 700; margin: 0 0 6px; color: #0f172a; }
    .contact-card p { font-size: 12px; color: #94a3b8; margin: 0 0 10px; line-height: 1.5; }
    .contact-link { display: inline-block; padding: 6px 14px; background: #faf6f2; color: #c4956a; font-size: 13px; font-weight: 600; border-radius: 6px; text-decoration: none; transition: all 0.15s; }
    .contact-link:hover { background: #c4956a; color: #fff; }

    /* Bank section */
    .bank-section { margin-top: 20px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 22px; }
    .bank-section h3 { font-size: 16px; font-weight: 700; margin: 0 0 14px; color: #0f172a; }
    .bank-grid { display: flex; flex-direction: column; gap: 8px; }
    .bank-row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; font-size: 14px; }
    .bank-row span { color: #94a3b8; }
    .bank-row strong { color: #1e293b; font-family: 'DM Sans', monospace; letter-spacing: 0.3px; }

    /* Links grid */
    .links-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 16px; }
    .doc-link { display: flex; gap: 12px; align-items: flex-start; padding: 18px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; text-decoration: none; color: inherit; transition: all 0.15s; }
    .doc-link:hover { border-color: #c4956a; box-shadow: 0 2px 12px rgba(196,149,106,0.1); }
    .doc-icon { font-size: 24px; flex-shrink: 0; }
    .doc-link strong { display: block; font-size: 14px; color: #0f172a; margin-bottom: 2px; }
    .doc-link small { font-size: 12px; color: #94a3b8; }

    .footer-nav { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
    .footer-nav a { padding: 8px 16px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; color: #64748b; text-decoration: none; transition: all 0.15s; }
    .footer-nav a:hover { border-color: #c4956a; color: #c4956a; }

    .mobile-toc-btn { display: none; }
    .mobile-toc { display: none; }

    @media (max-width: 900px) {
        .legal-sidebar { display: none; }
        .legal-content { padding: 20px 18px 60px; }
        .mobile-toc-btn { display: block; position: sticky; top: 10px; z-index: 10; padding: 8px 14px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; cursor: pointer; margin-bottom: 16px; }
        .mobile-toc { display: flex; flex-direction: column; gap: 4px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; margin-bottom: 16px; }
        .mobile-toc a { padding: 6px 10px; font-size: 13px; color: #64748b; text-decoration: none; border-radius: 4px; }
        .mobile-toc a:hover { background: #faf6f2; color: #c4956a; }
        .company-grid, .links-grid { grid-template-columns: 1fr; }
        .contact-grid { grid-template-columns: 1fr; }
    }
</style>
