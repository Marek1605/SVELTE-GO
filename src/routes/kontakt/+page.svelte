<script>
    import { onMount } from 'svelte';
    let activeSection = 'hero';
    const sections = [
        { id: 'hero', label: 'O nás' },
        { id: 'form', label: 'Napíšte nám' },
        { id: 'company', label: 'Prevádzkovateľ' },
        { id: 'contact', label: 'Kontaktné údaje' },
        { id: 'soi', label: 'Orgán dozoru' },
    ];
    let mobileOpen = false;
    let formName = '';
    let formEmail = '';
    let formCompany = '';
    let formPhone = '';
    let formSubject = 'vendor';
    let formMessage = '';
    let sending = false;
    let formStatus = '';
    let formError = '';
    
    async function submitForm() {
        formError = ''; formStatus = '';
        if (!formName.trim() || formName.trim().length < 2) { formError = 'Zadajte vaše meno (min. 2 znaky)'; return; }
        if (!formEmail.trim() || !formEmail.includes('@')) { formError = 'Zadajte platnú e-mailovú adresu'; return; }
        if (!formMessage.trim() || formMessage.trim().length < 10) { formError = 'Správa musí mať aspoň 10 znakov'; return; }
        sending = true;
        try {
            const res = await fetch('/api/v1/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: formName.trim(), email: formEmail.trim(), company: formCompany.trim(), phone: formPhone.trim(), subject: formSubject, message: formMessage.trim() })
            });
            const data = await res.json();
            if (data.success) {
                formStatus = data.message;
                formName = ''; formEmail = ''; formCompany = ''; formPhone = ''; formMessage = '';
            } else { formError = data.error || 'Nastala chyba. Skúste neskôr.'; }
        } catch(e) { formError = 'Chyba pripojenia. Skúste neskôr.'; }
        sending = false;
    }
    
    onMount(() => {
        const obs = new IntersectionObserver(entries => {
            for (const e of entries) { if (e.isIntersecting) activeSection = e.target.id; }
        }, { rootMargin: '-80px 0px -60% 0px' });
        sections.forEach(s => { const el = document.getElementById(s.id); if (el) obs.observe(el); });
        return () => obs.disconnect();
    });
</script>

<svelte:head>
    <title>Kontakt | MegaBuy.sk</title>
    <meta name="description" content="Kontaktujte slovenský porovnávač cien MegaBuy.sk. Pridajte svoj e-shop, riešte podporu alebo nám napíšte.">
    <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
</svelte:head>

<div class="legal-page">
    <aside class="legal-sidebar">
        <nav>
            <p class="sidebar-title">Obsah</p>
            {#each sections as s}<a href="#{s.id}" class="sidebar-link" class:active={activeSection === s.id}>{s.label}</a>{/each}
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
        {#if mobileOpen}<div class="mobile-toc">{#each sections as s}<a href="#{s.id}" on:click={() => mobileOpen = false}>{s.label}</a>{/each}</div>{/if}

        <section id="hero">
            <div class="hero-banner">
                <div class="hero-flag">🇸🇰</div>
                <h1>Slovenský porovnávač cien</h1>
                <p>MegaBuy.sk je nezávislý cenový porovnávač so sídlom na Slovensku. Pomáhame zákazníkom nájsť najlepšie ceny a e-shopom získať nových zákazníkov.</p>
            </div>
            <div class="trust-strip">
                <div class="trust-item"><span class="trust-num">🇸🇰</span><span class="trust-label">Slovenská firma<br><small>so sídlom v SR</small></span></div>
                <div class="trust-item"><span class="trust-num">CPC</span><span class="trust-label">Od 0,05 € za klik<br><small>platíte len za kliknutia</small></span></div>
                <div class="trust-item"><span class="trust-num">XML</span><span class="trust-label">Automatický import<br><small>kompatibilný feed</small></span></div>
                <div class="trust-item"><span class="trust-num">24h</span><span class="trust-label">Rýchla registrácia<br><small>do 24 hodín online</small></span></div>
            </div>
            <div class="warning-box"><div class="warning-icon">⚠️</div><div>
                <h3>Upozornenie — nie sme e-shop</h3>
                <p><strong>MegaBuy.sk</strong> funguje výhradne ako <strong>nezávislý porovnávač cien</strong>. Žiadny tovar priamo nepredávame, neskladujeme ani nedoručujeme. Pre nákup kliknite pri ponuke na <strong>„Do obchodu"</strong>.</p>
            </div></div>
        </section>

        <section id="form">
            <h2>✉️ Napíšte nám</h2>
            <p class="form-intro">Máte otázku ohľadom registrácie e-shopu, CPC kampane, XML feedu alebo čohokoľvek iného? Napíšte nám — odpovieme čo najskôr, spravidla do 24 hodín v pracovné dni.</p>
            <div class="form-card">
                <div class="form-row">
                    <div class="form-group"><label for="f-name">Meno a priezvisko <span class="req">*</span></label><input id="f-name" type="text" bind:value={formName} placeholder="Ján Novák" /></div>
                    <div class="form-group"><label for="f-email">E-mail <span class="req">*</span></label><input id="f-email" type="email" bind:value={formEmail} placeholder="jan@priklad.sk" /></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label for="f-company">Firma / E-shop <small>(voliteľné)</small></label><input id="f-company" type="text" bind:value={formCompany} placeholder="Názov vášho e-shopu" /></div>
                    <div class="form-group"><label for="f-phone">Telefón <small>(voliteľné)</small></label><input id="f-phone" type="tel" bind:value={formPhone} placeholder="+421 9XX XXX XXX" /></div>
                </div>
                <div class="form-group">
                    <label>Dôvod kontaktu</label>
                    <div class="subject-chips">
                        <button class="chip" class:active={formSubject==='vendor'} on:click={() => formSubject='vendor'}>🏪 Registrácia e-shopu</button>
                        <button class="chip" class:active={formSubject==='support'} on:click={() => formSubject='support'}>🛠️ Technická podpora</button>
                        <button class="chip" class:active={formSubject==='general'} on:click={() => formSubject='general'}>💬 Všeobecný dotaz</button>
                        <button class="chip" class:active={formSubject==='bug'} on:click={() => formSubject='bug'}>🐛 Nahlásenie chyby</button>
                    </div>
                </div>
                <div class="form-group">
                    <label for="f-msg">Správa <span class="req">*</span></label>
                    <textarea id="f-msg" bind:value={formMessage} rows="5" placeholder="Popíšte vašu požiadavku alebo otázku..."></textarea>
                    <span class="char-count">{formMessage.length} / 5000</span>
                </div>
                {#if formError}<div class="form-alert error">❌ {formError}</div>{/if}
                {#if formStatus}<div class="form-alert success">✅ {formStatus}</div>{/if}
                <button class="btn-submit" on:click={submitForm} disabled={sending}>{sending ? '⏳ Odosielam...' : '📨 Odoslať správu'}</button>
                <p class="form-note">Odoslaním súhlasíte so spracovaním údajov na účely vybavenia požiadavky. <a href="/ochrana-osobnych-udajov">Zásady ochrany údajov</a>.</p>
            </div>
        </section>

        <section id="company">
            <h2>Prevádzkovateľ portálu</h2>
            <div class="company-grid">
                <div class="company-card"><div class="card-icon">🏢</div><h4>Obchodné údaje</h4>
                    <div class="card-rows">
                        <div class="card-row"><span>Obchodné meno:</span><strong>Megabuy s.r.o.</strong></div>
                        <div class="card-row"><span>Sídlo:</span><strong>Necpaly 90, 038 12 Necpaly</strong></div>
                        <div class="card-row"><span>IČO:</span><strong>57211019</strong></div>
                        <div class="card-row"><span>DIČ:</span><strong>2122614351</strong></div>
                        <div class="card-row"><span>IČ DPH:</span><strong>SK2122614351</strong></div>
                        <div class="card-row"><span>DPH registrácia:</span><strong>§7a – pre služby zo zahraničia</strong></div>
                        <div class="card-row"><span>Registrácia:</span><strong>OR Okresného súdu Žilina</strong></div>
                    </div>
                </div>
                <div class="company-card"><div class="card-icon">🏦</div><h4>Bankové spojenie</h4>
                    <div class="card-rows">
                        <div class="card-row"><span>IBAN:</span><strong>SK13 1100 0000 0029 4527 8297</strong></div>
                        <div class="card-row"><span>Banka:</span><strong>Tatra banka, a.s.</strong></div>
                        <div class="card-row"><span>SWIFT/BIC:</span><strong>TATRSKBX</strong></div>
                    </div>
                </div>
            </div>
        </section>

        <section id="contact">
            <h2>Kontaktné údaje</h2>
            <div class="contact-grid">
                <div class="contact-card"><div class="contact-icon">📧</div><h4>E-mail</h4><a href="mailto:info@megabuy.sk" class="contact-link">info@megabuy.sk</a></div>
                <div class="contact-card"><div class="contact-icon">📞</div><h4>Telefón</h4><a href="tel:+421904558068" class="contact-link">+421 904 558 068</a></div>
                <div class="contact-card"><div class="contact-icon">🔒</div><h4>GDPR</h4><a href="mailto:gdpr@megabuy.sk" class="contact-link">gdpr@megabuy.sk</a></div>
            </div>
        </section>

        <section id="soi">
            <h2>Orgán dozoru</h2>
            <div class="company-grid">
                <div class="company-card"><div class="card-icon">🏛️</div><h4>Slovenská obchodná inšpekcia</h4>
                    <div class="card-rows">
                        <div class="card-row"><span>Inšpektorát:</span><strong>SOI pre Žilinský kraj</strong></div>
                        <div class="card-row"><span>Adresa:</span><strong>Predmestská 71, P.O. BOX B-89, 011 79 Žilina</strong></div>
                        <div class="card-row"><span>Tel.:</span><strong>041/763 21 30</strong></div>
                        <div class="card-row"><span>E-mail:</span><strong><a href="mailto:za@soi.sk">za@soi.sk</a></strong></div>
                    </div>
                </div>
                <div class="company-card"><div class="card-icon">🛡️</div><h4>Úrad na ochranu osobných údajov SR</h4>
                    <div class="card-rows">
                        <div class="card-row"><span>Adresa:</span><strong>Hraničná 12, 820 07 Bratislava</strong></div>
                        <div class="card-row"><span>Web:</span><strong><a href="https://dataprotection.gov.sk" target="_blank" rel="noopener">dataprotection.gov.sk</a></strong></div>
                    </div>
                </div>
            </div>
        </section>

        <div class="footer-nav"><a href="/impressum">← Impressum</a><a href="/vseobecne-obchodne-podmienky">VOP →</a></div>
    </main>
</div>

<style>
    :global(body){margin:0}
    .legal-page{display:flex;min-height:100vh;font-family:'DM Sans',sans-serif;color:#1e293b;background:#f8fafc}
    .legal-sidebar{width:240px;flex-shrink:0;padding:32px 20px;position:sticky;top:0;height:100vh;overflow-y:auto;background:#fff;border-right:1px solid #e2e8f0}
    .sidebar-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8;margin:0 0 8px}
    .sidebar-link{display:block;font-size:13px;padding:6px 10px;margin:2px 0;color:#64748b;border-radius:6px;text-decoration:none;transition:all .15s}
    .sidebar-link:hover{color:#c4956a;background:#faf6f2}
    .sidebar-link.active{color:#c4956a;background:#faf6f2;font-weight:600}
    .sidebar-divider{height:1px;background:#e2e8f0;margin:14px 0}
    .legal-content{flex:1;max-width:780px;padding:40px 48px 80px}
    section{margin-bottom:40px;scroll-margin-top:80px}
    h2{font-family:'Source Serif 4',serif;font-size:22px;font-weight:700;margin:0 0 16px;padding-bottom:10px;border-bottom:2px solid #f1f5f9}

    .hero-banner{background:linear-gradient(135deg,#1e3a5f 0%,#0f172a 100%);border-radius:16px;padding:36px 32px;color:#fff;margin-bottom:20px;position:relative;overflow:hidden}
    .hero-banner::after{content:'';position:absolute;right:-30px;top:-30px;width:180px;height:180px;background:rgba(196,149,106,.1);border-radius:50%}
    .hero-flag{font-size:36px;margin-bottom:10px}
    .hero-banner h1{font-family:'Source Serif 4',serif;font-size:28px;font-weight:700;margin:0 0 10px}
    .hero-banner p{font-size:15px;line-height:1.7;opacity:.85;margin:0;max-width:90%}

    .trust-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
    .trust-item{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px 14px;text-align:center}
    .trust-num{display:block;font-size:20px;font-weight:800;color:#c4956a;margin-bottom:4px}
    .trust-label{font-size:12px;color:#475569;line-height:1.4}
    .trust-label small{color:#94a3b8;font-size:11px}

    .warning-box{display:flex;gap:14px;padding:18px;background:#fefce8;border:1px solid #fde04744;border-radius:10px}
    .warning-icon{font-size:24px;flex-shrink:0}
    .warning-box h3{font-size:15px;font-weight:700;color:#92400e;margin:0 0 6px}
    .warning-box p{font-size:13px;color:#78350f;line-height:1.6;margin:0}

    .form-intro{font-size:14px;color:#64748b;line-height:1.7;margin:0 0 20px}
    .form-card{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:28px}
    .form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:0}
    .form-group{display:flex;flex-direction:column;gap:5px;margin-bottom:16px}
    .form-group label{font-size:13px;font-weight:600;color:#475569}
    .form-group label small{font-weight:400;color:#94a3b8}
    .req{color:#ef4444}
    .form-group input,.form-group textarea{padding:10px 14px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;font-family:inherit;color:#1e293b;transition:border-color .15s;resize:vertical}
    .form-group input:focus,.form-group textarea:focus{outline:none;border-color:#c4956a;box-shadow:0 0 0 3px rgba(196,149,106,.1)}
    .char-count{font-size:11px;color:#94a3b8;text-align:right}
    .subject-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}
    .chip{padding:8px 14px;border:1px solid #e2e8f0;border-radius:20px;background:#fff;font-size:13px;cursor:pointer;transition:all .15s;color:#64748b;font-family:inherit}
    .chip:hover{border-color:#c4956a;color:#c4956a}
    .chip.active{background:#faf6f2;border-color:#c4956a;color:#c4956a;font-weight:600}
    .form-alert{padding:12px 16px;border-radius:8px;font-size:14px;margin-bottom:16px}
    .form-alert.error{background:#fef2f2;color:#dc2626;border:1px solid #fecaca}
    .form-alert.success{background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0}
    .btn-submit{width:100%;padding:14px;background:#c4956a;color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;transition:all .15s;font-family:inherit}
    .btn-submit:hover{background:#a87d58}
    .btn-submit:disabled{opacity:.6;cursor:not-allowed}
    .form-note{font-size:11px;color:#94a3b8;text-align:center;margin-top:14px;line-height:1.5}
    .form-note a{color:#c4956a}

    .company-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .company-card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:22px}
    .card-icon{font-size:24px;margin-bottom:8px}
    .company-card h4{font-size:15px;font-weight:700;margin:0 0 14px;color:#0f172a}
    .card-rows{display:flex;flex-direction:column;gap:8px}
    .card-row{display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-size:13px}
    .card-row span{color:#94a3b8;flex-shrink:0}
    .card-row strong{color:#1e293b;text-align:right}
    .card-row a{color:#c4956a;text-decoration:none}
    .card-row a:hover{text-decoration:underline}

    .contact-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
    .contact-card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:22px;text-align:center}
    .contact-icon{font-size:28px;margin-bottom:8px}
    .contact-card h4{font-size:14px;font-weight:700;margin:0 0 8px;color:#0f172a}
    .contact-link{display:inline-block;padding:6px 14px;background:#faf6f2;color:#c4956a;font-size:13px;font-weight:600;border-radius:6px;text-decoration:none;transition:all .15s}
    .contact-link:hover{background:#c4956a;color:#fff}

    .footer-nav{display:flex;justify-content:space-between;margin-top:40px;padding-top:20px;border-top:1px solid #e2e8f0}
    .footer-nav a{padding:8px 16px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;color:#64748b;text-decoration:none;transition:all .15s}
    .footer-nav a:hover{border-color:#c4956a;color:#c4956a}

    .mobile-toc-btn{display:none}
    .mobile-toc{display:none}
    @media(max-width:900px){
        .legal-sidebar{display:none}
        .legal-content{padding:20px 18px 60px}
        .mobile-toc-btn{display:block;position:sticky;top:10px;z-index:10;padding:8px 14px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;cursor:pointer;margin-bottom:16px}
        .mobile-toc{display:flex;flex-direction:column;gap:4px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:10px;margin-bottom:16px}
        .mobile-toc a{padding:6px 10px;font-size:13px;color:#64748b;text-decoration:none;border-radius:4px}
        .trust-strip{grid-template-columns:repeat(2,1fr)}
        .company-grid{grid-template-columns:1fr}
        .contact-grid{grid-template-columns:1fr}
        .form-row{grid-template-columns:1fr}
        .hero-banner h1{font-size:22px}
        .hero-banner{padding:24px 20px}
    }
</style>
