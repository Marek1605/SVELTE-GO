<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import '../app.css';
    export let data;

    let searchQuery = '';
    let catnavSearchQuery = '';
    let isCollapsed = false;
    let mobileMenuOpen = false;
    let megaMenuOpen = false;
    let activeCategoryId = null;
    let activeCategoryData = null;
    let closeTimeout = null;
    let showAllCats = false;
    let expandedMobileCats = new Set();
    let mobileSearchOpen = false;

    let logoUrl = '';
    let logoSize = 40;
    let showCart = true;
    let showAccount = true;
    let showWishlist = true;
    let showCompare = true;
    let catNavStyle = 'pills';
    let hiddenCats = new Set();

    function toggleMobileCat(catId) {
        const u = new Set(expandedMobileCats);
        if (u.has(catId)) u.delete(catId); else u.add(catId);
        expandedMobileCats = u;
    }
    function closeMobileMenu() { mobileMenuOpen = false; document.body.style.overflow = ''; }
    function openMobileMenu() { mobileMenuOpen = true; document.body.style.overflow = 'hidden'; }
    function handleSearch(e) { e.preventDefault(); if (searchQuery.trim()) window.location.href = `/hladat?q=${encodeURIComponent(searchQuery)}`; }
    function handleCatnavSearch(e) { e.preventDefault(); if (catnavSearchQuery.trim()) window.location.href = `/hladat?q=${encodeURIComponent(catnavSearchQuery)}`; }
    function toggleAllCats() { showAllCats = !showAllCats; }
    function closeAllCats() { showAllCats = false; }

    function openMegaMenu(cat) {
        if (closeTimeout) { clearTimeout(closeTimeout); closeTimeout = null; }
        if (cat.children?.length > 0) { activeCategoryId = cat.id; activeCategoryData = cat; megaMenuOpen = true; }
    }
    function scheduleMegaClose() { closeTimeout = setTimeout(() => { megaMenuOpen = false; activeCategoryId = null; activeCategoryData = null; }, 150); }
    function cancelMegaClose() { if (closeTimeout) { clearTimeout(closeTimeout); closeTimeout = null; } }
    function handleCategoryMouseEnter(cat) { if (window.innerWidth > 768) openMegaMenu(cat); }
    function handleCategoryMouseLeave() { if (window.innerWidth > 768) scheduleMegaClose(); }

    $: navCategories = (data?.navCategories || []).map(cat => ({
        ...cat,
        children: (cat.children || []).map(child => ({ ...child, grandchildren: (child.children || []).slice(0, 15) }))
    }));
    $: visibleCategories = navCategories.filter(c => !hiddenCats.has(c.id));

    const emojis = {'elektronika':'📱','dom':'🏠','záhrad':'🌳','hračky':'🧸','šport':'⚽','domáce':'🔌','spotrebič':'🔌','dieťa':'👶','zviera':'🐾','zdravie':'💊','krása':'💄','auto':'🚗','oblečen':'👕','nábytok':'🪑','hobby':'🎨','hry':'🎮'};
    function getCatEmoji(name) { const l=(name||'').toLowerCase(); for(const[k,v] of Object.entries(emojis)){if(l.includes(k))return v;} return '📦'; }

    onMount(() => {
        let collapsed=false, ticking=false;
        const update=()=>{const y=window.scrollY||0;if(y>180&&!collapsed){collapsed=true;isCollapsed=true;}else if(y<130&&collapsed){collapsed=false;isCollapsed=false;}ticking=false;};
        const onScroll=()=>{if(!ticking){requestAnimationFrame(update);ticking=true;}};
        update(); window.addEventListener('scroll',onScroll,{passive:true});

        try{const s=localStorage.getItem('mp_catnav_style');if(s)catNavStyle=s;}catch(e){}
        try{const h=localStorage.getItem('mp_hidden_cats');if(h)hiddenCats=new Set(JSON.parse(h));}catch(e){}

        fetch('/api/v1/site/settings').then(r=>r.json()).then(d=>{
            if(d?.data?.logo_url)logoUrl=d.data.logo_url;
            if(d?.data?.logo_size)logoSize=parseInt(d.data.logo_size)||40;
            showCart=d?.data?.show_cart!=='false';
            showAccount=d?.data?.show_account!=='false';
            showWishlist=d?.data?.show_wishlist!=='false';
            showCompare=d?.data?.show_compare!=='false';
        }).catch(()=>{});

        return ()=>{window.removeEventListener('scroll',onScroll);if(closeTimeout)clearTimeout(closeTimeout);};
    });
</script>

{#if $page.url.pathname.startsWith('/admin') || $page.url.pathname.startsWith('/vendor-dashboard')}
    <slot />
{:else}
<div class="site">

    <!-- ===== HEADER ===== -->
    <header class="hd">
        <div class="hd__row">
            <button class="hd__burger" on:click={openMobileMenu} aria-label="Menu">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>

            <a href="/" class="hd__logo">
                {#if logoUrl}<img src={logoUrl} alt="MegaPrice" style="height:{logoSize}px" />{:else}<span class="hd__logotext">Mega<b>Price</b></span>{/if}
            </a>

            <form class="hd__search" on:submit={handleSearch}>
                <svg class="hd__sic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" placeholder="Hľadaj produkt, značku alebo kategóriu..." bind:value={searchQuery}>
                <button type="submit">Hľadať</button>
            </form>

            <nav class="hd__acts">
                {#if showAccount}<a href="/ucet" class="hd__act"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>Účet</span></a>{/if}
                {#if showWishlist}<a href="/oblubene" class="hd__act"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span>Obľúbené</span></a>{/if}
                {#if showCompare}<a href="/porovnanie" class="hd__act"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 2l4 4-4 4"/><path d="M3 6h18"/><path d="M7 14l-4 4 4 4"/><path d="M21 18H3"/></svg><span>Porovnať</span></a>{/if}
            </nav>

            <div class="hd__macts">
                <button class="hd__mbtn" on:click={() => mobileSearchOpen = !mobileSearchOpen}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button>
                {#if showAccount}<a href="/ucet" class="hd__mbtn"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></a>{/if}
            </div>
        </div>
        {#if mobileSearchOpen}
        <form class="hd__msf" on:submit={handleSearch}>
            <input type="text" placeholder="Hľadať produkt..." bind:value={searchQuery} autofocus>
            <button type="submit"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button>
        </form>
        {/if}
    </header>

    <!-- ===== CATEGORY NAV (desktop) ===== -->
    <nav class="cn" class:cn--s={isCollapsed}>
        <div class="cn__in">
            <div class="cn__list">
                {#each visibleCategories as cat (cat.id)}
                <div class="cn__item" on:mouseenter={() => handleCategoryMouseEnter(cat)} on:mouseleave={handleCategoryMouseLeave}>
                    <a href={"/kategoria/"+(cat.slug||cat.id)} class="cn__link" class:active={activeCategoryId===cat.id}>
                        {#if catNavStyle==='cards' && cat.image_url}<img src={cat.image_url} alt="" class="cn__ci">{/if}
                        {cat.name}
                    </a>
                </div>
                {/each}
                <button class="cn__more" on:click={toggleAllCats}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>
            </div>
            {#if isCollapsed}
            <form class="cn__sf" on:submit={handleCatnavSearch}><input type="text" placeholder="Hľadať..." bind:value={catnavSearchQuery}><button type="submit"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button></form>
            {/if}
        </div>
        {#if showAllCats}
        <div class="cno" on:click={closeAllCats}></div>
        <div class="cnd">
            <div class="cnd__hd"><h3>Všetky kategórie</h3><button on:click={closeAllCats}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
            <div class="cnd__g">{#each navCategories as cat}<a href={"/kategoria/"+(cat.slug||cat.id)} class="cnd__i" on:click={closeAllCats}><div class="cnd__ic">{#if cat.image_url}<img src={cat.image_url} alt="">{:else}{getCatEmoji(cat.name)}{/if}</div><span>{cat.name}</span></a>{/each}</div>
        </div>
        {/if}
        {#if megaMenuOpen && activeCategoryData}
        <div class="mega" on:mouseenter={cancelMegaClose} on:mouseleave={scheduleMegaClose}>
            <div class="mega__g">{#each activeCategoryData.children||[] as child}<div class="mega__col"><a href={"/kategoria/"+(child.slug||child.id)} class="mega__sub">{#if child.image_url}<img src={child.image_url} alt="" class="mega__si">{/if}<strong>{child.name}</strong></a>{#if child.grandchildren?.length>0}<div class="mega__links">{#each child.grandchildren as gc}<a href={"/kategoria/"+(gc.slug||gc.id)}>{gc.name}</a>{/each}</div>{/if}</div>{/each}</div>
        </div>
        {/if}
    </nav>

    <main><slot /></main>

    <footer class="ft">
        <div class="ft__in"><div class="ft__g">
            <div class="ft__c"><h4>MegaPrice</h4><p>Porovnávač cien z overených slovenských e-shopov.</p></div>
            <div class="ft__c"><h4>Kategórie</h4><ul>{#each navCategories.slice(0,6) as cat}<li><a href="/kategoria/{cat.slug}">{cat.name}</a></li>{/each}</ul></div>
            <div class="ft__c"><h4>Pre e-shopy</h4><ul><li><a href="/prihlasenie-predajcu">Pridať e-shop</a></li><li><a href="/prihlasenie-predajcu">CPC reklama</a></li></ul></div>
            <div class="ft__c"><h4>Podpora</h4><ul><li><a href="/kontakt">Kontakt</a></li><li><a href="/ochrana-osobnych-udajov">Ochrana údajov</a></li></ul></div>
        </div></div>
        <div class="ft__bot">© 2025 MegaPrice.sk</div>
    </footer>

    <nav class="bn">
        <a href="/" class="bn__i" class:bn--on={$page.url.pathname==='/'}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg><span>Domov</span></a>
        <button class="bn__i" on:click={openMobileMenu}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg><span>Kategórie</span></button>
        {#if showWishlist}<a href="/oblubene" class="bn__i"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span>Obľúbené</span></a>{/if}
        {#if showAccount}<a href="/ucet" class="bn__i"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>Účet</span></a>{/if}
    </nav>

    {#if mobileMenuOpen}
    <div class="mm__ov" on:click={closeMobileMenu}></div>
    <div class="mm">
        <div class="mm__hd">
            <span class="mm__t">Kategórie</span>
            <button class="mm__x" on:click={closeMobileMenu}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div class="mm__body">
            {#each visibleCategories as cat}
            <div class="mm__cat" class:mm__cat--o={expandedMobileCats.has(cat.id)}>
                <div class="mm__r">
                    <a href={"/kategoria/"+(cat.slug||cat.id)} class="mm__lnk" on:click={closeMobileMenu}>
                        <span class="mm__ico">{#if cat.image_url}<img src={cat.image_url} alt="">{:else}{getCatEmoji(cat.name)}{/if}</span>
                        <span class="mm__nm">{cat.name}</span>
                    </a>
                    {#if cat.children?.length > 0}
                    <button class="mm__tg" on:click={() => toggleMobileCat(cat.id)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="transform:rotate({expandedMobileCats.has(cat.id)?180:0}deg);transition:transform .2s"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    {/if}
                </div>
                {#if expandedMobileCats.has(cat.id) && cat.children?.length > 0}
                <div class="mm__subs">
                    {#each cat.children as child}
                    <a href={"/kategoria/"+(child.slug||child.id)} class="mm__s" on:click={closeMobileMenu}>
                        <span class="mm__si">{#if child.image_url}<img src={child.image_url} alt="">{:else}{getCatEmoji(child.name)}{/if}</span>
                        {child.name}
                        {#if child.grandchildren?.length > 0}<span class="mm__sc">{child.grandchildren.length}</span>{/if}
                    </a>
                    {/each}
                </div>
                {/if}
            </div>
            {/each}
        </div>
    </div>
    {/if}
</div>
{/if}

<style>
:global(*){box-sizing:border-box;margin:0;padding:0}
:global(body){font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#fff;color:#1f2937;line-height:1.5;-webkit-font-smoothing:antialiased}
:global(a){text-decoration:none;color:inherit}
:global(img){max-width:100%;height:auto}
:global(button){cursor:pointer;border:none;background:none;font-family:inherit}
.site{display:flex;flex-direction:column;min-height:100vh}

/* === HEADER === */
.hd{background:#fff;border-bottom:1px solid #eee;position:relative;z-index:1000}
.hd__row{display:flex;align-items:center;padding:10px 14px;gap:8px}
.hd__burger{display:flex;width:40px;height:40px;align-items:center;justify-content:center;border-radius:10px;color:#374151;flex-shrink:0}
.hd__burger:active{background:#f3f4f6}
.hd__logo{flex:1;display:flex;justify-content:center;align-items:center}
.hd__logo img{display:block}
.hd__logotext{font-size:20px;font-weight:400;color:#374151;letter-spacing:-.3px}
.hd__logotext b{font-weight:800;color:#c4956a}
.hd__search{display:none;flex:1;max-width:560px;position:relative}
.hd__search input{width:100%;padding:10px 16px 10px 40px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:14px;outline:none;transition:border .2s}
.hd__search input:focus{border-color:#c4956a}
.hd__sic{position:absolute;left:12px;top:50%;transform:translateY(-50%)}
.hd__search button{position:absolute;right:4px;top:50%;transform:translateY(-50%);padding:7px 16px;background:#c4956a;color:#fff;border-radius:8px;font-size:13px;font-weight:600;border:none}
.hd__search button:hover{background:#b8855c}
.hd__acts{display:none;gap:2px;margin-left:auto;flex-shrink:0}
.hd__act{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 10px;border-radius:8px;transition:.15s;color:#4b5563}
.hd__act:hover{background:#f3f4f6;color:#c4956a}
.hd__act span{font-size:10px;color:#6b7280}
.hd__macts{display:flex;gap:2px;flex-shrink:0}
.hd__mbtn{width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:10px;color:#374151}
.hd__mbtn:active{background:#f3f4f6}
.hd__msf{display:flex;padding:0 14px 10px;gap:8px}
.hd__msf input{flex:1;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:14px;outline:none}
.hd__msf input:focus{border-color:#c4956a}
.hd__msf button{width:40px;height:40px;background:#c4956a;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
@media(min-width:769px){
    .hd__row{padding:12px 32px;gap:20px}
    .hd__burger{display:none}
    .hd__logo{flex:none;justify-content:flex-start}
    .hd__logotext{font-size:22px}
    .hd__search{display:flex}
    .hd__acts{display:flex}
    .hd__macts{display:none}
    .hd__msf{display:none!important}
}

/* === CATEGORY NAV === */
.cn{background:#fff;border-bottom:1px solid #eee;position:sticky;top:0;z-index:999;display:none}
.cn--s{box-shadow:0 2px 8px rgba(0,0,0,.05)}
.cn__in{display:flex;align-items:center;max-width:1400px;margin:0 auto;padding:0 24px}
.cn__list{display:flex;overflow-x:auto;scrollbar-width:none;gap:1px;padding:6px 0;flex:1}
.cn__list::-webkit-scrollbar{display:none}
.cn__link{display:flex;align-items:center;gap:6px;padding:7px 12px;border-radius:8px;font-size:13px;font-weight:500;color:#4b5563;white-space:nowrap;transition:.15s}
.cn__link:hover,.cn__link.active{background:#f9fafb;color:#c4956a}
.cn__ci{width:22px;height:22px;border-radius:5px;object-fit:cover}
.cn__more{width:32px;height:32px;border-radius:8px;border:1px solid #e5e7eb;display:flex;align-items:center;justify-content:center;color:#6b7280;flex-shrink:0;margin-left:4px}
.cn__more:hover{border-color:#c4956a;color:#c4956a}
.cn__sf{display:flex;margin-left:12px;flex-shrink:0}
.cn__sf input{width:110px;padding:5px 10px;border:1.5px solid #e5e7eb;border-right:none;border-radius:6px 0 0 6px;font-size:12px;outline:none}
.cn__sf input:focus{border-color:#c4956a;width:140px}
.cn__sf button{padding:5px 10px;background:#c4956a;border-radius:0 6px 6px 0;display:flex;align-items:center}
@media(min-width:769px){.cn{display:block}}

.cno{position:fixed;inset:0;background:rgba(0,0,0,.3);z-index:1001}
.cnd{position:absolute;top:100%;right:20px;width:660px;max-width:92vw;max-height:65vh;background:#fff;border-radius:14px;box-shadow:0 16px 48px rgba(0,0,0,.18);z-index:1002;overflow:hidden}
.cnd__hd{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid #f3f4f6}
.cnd__hd h3{font-size:15px;font-weight:600}
.cnd__hd button{width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:#f3f4f6;border-radius:8px;color:#6b7280}
.cnd__g{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;padding:8px;max-height:calc(65vh - 56px);overflow-y:auto}
.cnd__i{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;transition:background .15s}
.cnd__i:hover{background:#fef7f0}
.cnd__ic{width:32px;height:32px;border-radius:8px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;font-size:14px}
.cnd__ic img{width:100%;height:100%;object-fit:cover}
.cnd__i span{font-size:13px;font-weight:600;color:#374151}

.mega{position:absolute;left:0;right:0;top:100%;background:#fff;border-top:1px solid #eee;box-shadow:0 16px 40px rgba(0,0,0,.1);z-index:999}
.mega__g{display:grid;grid-template-columns:repeat(4,1fr);gap:8px 16px;padding:20px 32px;max-height:50vh;overflow-y:auto}
.mega__col{padding:8px 0;border-bottom:1px solid #f5f5f5}
.mega__col:nth-last-child(-n+4){border-bottom:none}
.mega__sub{display:flex;align-items:center;gap:10px;padding:4px 0;margin-bottom:4px}
.mega__sub:hover strong{color:#c4956a}
.mega__si{width:40px;height:40px;object-fit:contain;flex-shrink:0}
.mega__sub strong{font-size:14px;font-weight:700;color:#1f2937;transition:color .15s}
.mega__links{display:flex;flex-wrap:wrap;gap:0;line-height:1.8}
.mega__links a{font-size:12px;color:#6b7280;transition:color .15s}
.mega__links a:hover{color:#c4956a}
.mega__links a::before{content:'·';color:#d1d5db;margin:0 5px}
@media(max-width:768px){.mega{display:none}}

/* === FOOTER === */
main{flex:1}
.ft{background:#1f2937;color:#fff;margin-top:auto}
.ft__in{padding:40px 20px;max-width:1200px;margin:0 auto}
.ft__g{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
.ft__c h4{font-size:14px;font-weight:700;margin-bottom:12px}
.ft__c p{font-size:13px;color:rgba(255,255,255,.6);line-height:1.7}
.ft__c ul{list-style:none}
.ft__c li{margin-bottom:6px}
.ft__c a{font-size:13px;color:rgba(255,255,255,.6)}
.ft__c a:hover{color:#fff}
.ft__bot{background:rgba(0,0,0,.2);padding:14px 20px;text-align:center;font-size:12px;color:rgba(255,255,255,.5)}
@media(min-width:769px){.ft__g{grid-template-columns:repeat(4,1fr);gap:32px}.ft__in{padding:48px 32px}.ft{padding-bottom:0}}
@media(max-width:768px){.ft{padding-bottom:64px}}

/* === BOTTOM NAV === */
.bn{position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #eee;display:none;justify-content:space-around;padding:6px 0 calc(6px + env(safe-area-inset-bottom));z-index:1100}
.bn__i{display:flex;flex-direction:column;align-items:center;gap:1px;padding:4px 12px;color:#9ca3af;font-size:10px;font-weight:500;background:none;border:none;font-family:inherit}
.bn--on,.bn__i:active{color:#c4956a}
@media(max-width:768px){.bn{display:flex}}

/* === MOBILE DRAWER === */
.mm__ov{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:2000;animation:mmF .2s}
@keyframes mmF{from{opacity:0}to{opacity:1}}
.mm{position:fixed;top:0;left:0;bottom:0;width:80vw;max-width:320px;background:#fff;z-index:2001;display:flex;flex-direction:column;animation:mmS .25s ease;box-shadow:4px 0 20px rgba(0,0,0,.15)}
@keyframes mmS{from{transform:translateX(-100%)}to{transform:translateX(0)}}
.mm__hd{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid #eee;flex-shrink:0}
.mm__t{font-size:16px;font-weight:700;color:#1f2937}
.mm__x{width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:#f3f4f6;border-radius:8px;color:#6b7280}
.mm__body{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch}
.mm__cat{border-bottom:1px solid #f5f5f5}
.mm__r{display:flex;align-items:center}
.mm__lnk{flex:1;display:flex;align-items:center;gap:10px;padding:12px 14px;color:#1f2937;font-weight:600;font-size:14px;min-width:0}
.mm__ico{width:32px;height:32px;border-radius:8px;background:#f9fafb;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;font-size:15px}
.mm__ico img{width:100%;height:100%;object-fit:cover}
.mm__nm{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mm__tg{width:44px;height:44px;display:flex;align-items:center;justify-content:center;color:#9ca3af;flex-shrink:0}
.mm__cat--o>.mm__r{background:#fafafa}
.mm__cat--o>.mm__r .mm__tg{color:#c4956a}
.mm__subs{background:#fafafa;padding:0 0 6px}
.mm__s{display:flex;align-items:center;gap:8px;padding:8px 14px 8px 44px;color:#4b5563;font-size:13px}
.mm__s:active{background:rgba(196,149,106,.06)}
.mm__si{width:22px;height:22px;border-radius:5px;background:#e5e7eb;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;font-size:10px}
.mm__si img{width:100%;height:100%;object-fit:cover}
.mm__sc{width:18px;height:18px;border-radius:4px;background:#e5e7eb;color:#6b7280;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-left:auto}
</style>
