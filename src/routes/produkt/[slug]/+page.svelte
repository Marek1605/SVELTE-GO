<script>
    import { formatPrice } from '$lib/api';
    import { onMount } from 'svelte';
    
    export let data;
    
    $: product = data.product;
    $: attributes = data.attributes || [];
    $: images = data.images || [];
    
    let currentImageIndex = 0;
    let lightboxOpen = false;
    let isWishlisted = false;
    let isCompared = false;
    
    $: mainImage = images[currentImageIndex] || product?.image_url || '';
    $: lowestPrice = product?.price_min || 0;
    $: freeShipping = lowestPrice >= 49;
    $: offerCount = product?.offer_count || 1;
    
    function selectImage(i) { currentImageIndex = i; }
    function openLightbox() { lightboxOpen = true; document.body.style.overflow = 'hidden'; }
    function closeLightbox() { lightboxOpen = false; document.body.style.overflow = ''; }
    function prevImage() { currentImageIndex = (currentImageIndex - 1 + images.length) % images.length; }
    function nextImage() { currentImageIndex = (currentImageIndex + 1) % images.length; }
    
    function toggleWishlist() {
        const list = JSON.parse(localStorage.getItem('mp_wishlist') || '[]');
        const idx = list.indexOf(product.id);
        if (idx === -1) { list.push(product.id); isWishlisted = true; }
        else { list.splice(idx, 1); isWishlisted = false; }
        localStorage.setItem('mp_wishlist', JSON.stringify(list));
    }
    
    function toggleCompare() {
        const list = JSON.parse(localStorage.getItem('mp_compare') || '[]');
        const idx = list.indexOf(product.id);
        if (idx === -1 && list.length < 4) { list.push(product.id); isCompared = true; }
        else if (idx !== -1) { list.splice(idx, 1); isCompared = false; }
        localStorage.setItem('mp_compare', JSON.stringify(list));
    }
    
    onMount(() => {
        const wishlist = JSON.parse(localStorage.getItem('mp_wishlist') || '[]');
        const compare = JSON.parse(localStorage.getItem('mp_compare') || '[]');
        isWishlisted = wishlist.includes(product?.id);
        isCompared = compare.includes(product?.id);
        
        const handleKey = (e) => {
            if (!lightboxOpen) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'ArrowRight') nextImage();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    });
</script>

<svelte:head>
    <title>{product?.title || 'Produkt'} | MegaPrice.sk</title>
    <meta name="description" content="Porovnajte ceny {product?.title}. {offerCount} ponúk od {formatPrice(lowestPrice)}">
</svelte:head>

<div class="mp-single">
    <div class="mp-container">
        <!-- Breadcrumb -->
        <nav class="mp-breadcrumb">
            <a href="/">Domov</a>
            <span class="mp-breadcrumb__sep">/</span>
            <span>{product?.title}</span>
        </nav>
        
        {#if product}
            <!-- Mobile Price Bar -->
            <div class="mp-mobile-price-bar">
                <div class="mp-mobile-price">{formatPrice(lowestPrice)}</div>
                {#if freeShipping}
                    <div class="mp-mobile-shipping">✓ Doprava zdarma</div>
                {/if}
            </div>
            
            <!-- Main Layout -->
            <div class="mp-product-top">
                <!-- Gallery -->
                <div class="mp-gallery-wrapper">
                    <div class="mp-gallery">
                        <div class="mp-main-img">
                            <div class="mp-main-img__wrap" on:click={openLightbox}>
                                {#if mainImage}
                                    <img src={mainImage} alt={product.title} class="mp-main-img__img">
                                {:else}
                                    <div class="mp-main-img__placeholder">📷</div>
                                {/if}
                                <div class="mp-main-img__zoom">🔍</div>
                            </div>
                        </div>
                        
                        {#if images.length > 1}
                            <div class="mp-thumbs">
                                {#each images as img, i}
                                    <button class="mp-thumb" class:active={i === currentImageIndex} on:click={() => selectImage(i)}>
                                        <img src={img} alt="">
                                    </button>
                                {/each}
                            </div>
                        {/if}
                    </div>
                </div>
                
                <!-- Content -->
                <div class="mp-content">
                    {#if product.brand}
                        <div class="mp-brand">{product.brand}</div>
                    {/if}
                    
                    <h1 class="mp-title">{product.title}</h1>
                    
                    <div class="mp-meta">
                        {#if product.ean}
                            <span>EAN: {product.ean}</span>
                        {/if}
                        <span>{offerCount} {offerCount === 1 ? 'ponuka' : 'ponúk'}</span>
                    </div>
                    
                    <!-- Actions -->
                    <div class="mp-actions">
                        <button class="mp-action-btn" class:active={isWishlisted} on:click={toggleWishlist}>
                            <svg viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                            <span>{isWishlisted ? 'V obľúbených' : 'Obľúbené'}</span>
                        </button>
                        <button class="mp-action-btn" class:active={isCompared} on:click={toggleCompare}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                            </svg>
                            <span>{isCompared ? 'V porovnaní' : 'Porovnať'}</span>
                        </button>
                    </div>
                    
                    <!-- Short Description -->
                    {#if product.description}
                        <div class="mp-short-desc">
                            <p>{@html product.description.slice(0, 300)}{product.description.length > 300 ? '...' : ''}</p>
                        </div>
                    {/if}
                    
                    <!-- Quick Attributes -->
                    {#if attributes.length > 0}
                        <div class="mp-quick-attrs">
                            {#each attributes.slice(0, 6) as attr}
                                <div class="mp-quick-attr">
                                    <span class="mp-quick-attr__name">{attr.name}:</span>
                                    <span class="mp-quick-attr__value">{attr.value}</span>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
                
                <!-- Buy Box -->
                <div class="mp-buybox">
                    <div class="mp-buybox__inner">
                        <div class="mp-winner">
                            <span class="mp-winner__icon">🏆</span>
                            <span class="mp-winner__text">Najlepšia cena</span>
                        </div>
                        
                        <div class="mp-buybox__header">
                            <div class="mp-buybox__logo">MP</div>
                            <div class="mp-buybox__vendor">
                                <div class="mp-buybox__name">MegaPrice.sk</div>
                                <div class="mp-buybox__rating">
                                    <svg viewBox="0 0 24 24" fill="#fbbf24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                    <span>4.8 (1250)</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mp-buybox__badges">
                            <span class="mp-buybox__badge mp-buybox__badge--stock">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                Skladom
                            </span>
                            <span class="mp-buybox__badge">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                                1-2 dni
                            </span>
                        </div>
                        
                        <div class="mp-buybox__price-row">
                            <span class="mp-buybox__price">{formatPrice(lowestPrice)}</span>
                            <span class="mp-buybox__shipping" class:paid={!freeShipping}>
                                {freeShipping ? '✓ Doprava zdarma' : '+ 2,99 € doprava'}
                            </span>
                        </div>
                        
                        <button class="mp-cta">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                            <span>Do košíka</span>
                        </button>
                        <div class="mp-megabuy-label">Predaj cez MegaBuy</div>
                        
                        {#if offerCount > 1}
                            <a href="#ponuky" class="mp-more-offers">Zobraziť všetky ponuky ({offerCount}) →</a>
                        {/if}
                    </div>
                </div>
            </div>
            
            <!-- Tabs Navigation -->
            <div class="mp-nav">
                <a href="#ponuky" class="mp-nav__btn active">📊 Porovnanie cien</a>
                <a href="#popis" class="mp-nav__btn">📄 Popis</a>
                <a href="#parametre" class="mp-nav__btn">📋 Parametre</a>
            </div>
            
            <!-- Offers Section -->
            <section id="ponuky" class="mp-section">
                <div class="mp-offers">
                    <div class="mp-offers__header">
                        <h2>Porovnanie ponúk</h2>
                        <span class="mp-offers__count">{offerCount} predajcov</span>
                    </div>
                    
                    <div class="mp-offer mp-offer--best">
                        <div class="mp-offer__vendor">
                            <div class="mp-offer__logo">MP</div>
                            <div class="mp-offer__info">
                                <div class="mp-offer__name">MegaPrice.sk</div>
                                <div class="mp-offer__rating">
                                    <svg viewBox="0 0 24 24" fill="#fbbf24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                    4.8 (1250)
                                </div>
                            </div>
                        </div>
                        <div class="mp-offer__stock in">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            Skladom
                        </div>
                        <div class="mp-offer__delivery">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                            1-2 dni
                        </div>
                        <div class="mp-offer__price-col">
                            <div class="mp-offer__price">{formatPrice(lowestPrice)}</div>
                            <div class="mp-offer__shipping">{freeShipping ? 'Doprava zdarma' : '+ 2,99 € doprava'}</div>
                        </div>
                        <div class="mp-offer__cta-col">
                            <button class="mp-offer__cta">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                                Do košíka
                            </button>
                            <span class="mp-offer__megabuy">Predaj cez MegaBuy</span>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- Description Section -->
            <section id="popis" class="mp-section">
                <div class="mp-card">
                    <h2 class="mp-section__title">📄 Popis produktu</h2>
                    {#if product.description}
                        <div class="mp-desc">{@html product.description}</div>
                    {:else}
                        <p class="mp-empty-text">Popis nie je k dispozícii.</p>
                    {/if}
                </div>
            </section>
            
            <!-- Parameters Section -->
            <section id="parametre" class="mp-section">
                <div class="mp-card">
                    <h2 class="mp-section__title">📋 Parametre</h2>
                    {#if attributes.length > 0}
                        <div class="mp-params">
                            {#each attributes as attr}
                                <div class="mp-param">
                                    <span class="mp-param__name">{attr.name}</span>
                                    <span class="mp-param__value">{attr.value}</span>
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <p class="mp-empty-text">Parametre nie sú k dispozícii.</p>
                    {/if}
                </div>
            </section>
        {:else}
            <div class="mp-empty">
                <div class="mp-empty__icon">🔍</div>
                <h1>Produkt nenájdený</h1>
                <a href="/" class="mp-btn">Späť na hlavnú</a>
            </div>
        {/if}
    </div>
</div>

<!-- Lightbox -->
{#if lightboxOpen}
    <div class="mp-lightbox" on:click={closeLightbox}>
        <button class="mp-lightbox__close">✕</button>
        <button class="mp-lightbox__nav mp-lightbox__nav--prev" on:click|stopPropagation={prevImage}>‹</button>
        <img src={mainImage} alt={product?.title} class="mp-lightbox__img" on:click|stopPropagation>
        <button class="mp-lightbox__nav mp-lightbox__nav--next" on:click|stopPropagation={nextImage}>›</button>
        <div class="mp-lightbox__counter">{currentImageIndex + 1} / {images.length}</div>
    </div>
{/if}

<style>
:root {
    --mp-primary: #ff6b35;
    --mp-primary-dark: #e55a2b;
    --mp-success: #16a34a;
    --mp-text: #1f2937;
    --mp-text-light: #6b7280;
    --mp-border: #e5e7eb;
    --mp-bg: #f9fafb;
}

.mp-single { padding: 16px 0 60px; background: #fff; }
.mp-container { max-width: 1280px; margin: 0 auto; padding: 0 20px; }

/* Breadcrumb */
.mp-breadcrumb { display: flex; flex-wrap: wrap; gap: 6px; font-size: 12px; color: var(--mp-text-light); margin-bottom: 16px; }
.mp-breadcrumb a { color: var(--mp-text-light); text-decoration: none; }
.mp-breadcrumb a:hover { color: var(--mp-primary); }
.mp-breadcrumb__sep { color: #d1d5db; }

/* Mobile Price */
.mp-mobile-price-bar { display: none; }

/* Layout */
.mp-product-top { display: grid; grid-template-columns: 380px 1fr 380px; gap: 24px; margin-bottom: 32px; align-items: start; }

/* Gallery */
.mp-gallery-wrapper { position: sticky; top: 20px; }
.mp-main-img__wrap { background: var(--mp-bg); border-radius: 16px; padding: 20px; cursor: zoom-in; position: relative; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; }
.mp-main-img__img { max-width: 100%; max-height: 100%; object-fit: contain; }
.mp-main-img__placeholder { font-size: 5rem; opacity: 0.3; }
.mp-main-img__zoom { position: absolute; bottom: 12px; right: 12px; background: white; padding: 6px 12px; border-radius: 8px; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.mp-thumbs { display: flex; gap: 8px; margin-top: 12px; overflow-x: auto; }
.mp-thumb { width: 64px; height: 64px; border: 2px solid transparent; border-radius: 10px; padding: 4px; cursor: pointer; background: var(--mp-bg); }
.mp-thumb.active { border-color: var(--mp-primary); }
.mp-thumb img { width: 100%; height: 100%; object-fit: contain; }

/* Content */
.mp-brand { font-size: 12px; font-weight: 600; color: var(--mp-primary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
.mp-title { font-size: 24px; font-weight: 700; color: var(--mp-text); line-height: 1.3; margin-bottom: 12px; }
.mp-meta { display: flex; gap: 16px; font-size: 13px; color: var(--mp-text-light); margin-bottom: 20px; }
.mp-actions { display: flex; gap: 12px; margin-bottom: 20px; }
.mp-action-btn { display: flex; align-items: center; gap: 8px; padding: 10px 16px; border: 1px solid var(--mp-border); border-radius: 10px; background: white; color: var(--mp-text-light); font-size: 13px; cursor: pointer; transition: all 0.2s; }
.mp-action-btn svg { width: 18px; height: 18px; }
.mp-action-btn:hover, .mp-action-btn.active { border-color: var(--mp-primary); color: var(--mp-primary); }
.mp-short-desc { font-size: 14px; color: var(--mp-text-light); line-height: 1.7; margin-bottom: 20px; }
.mp-quick-attrs { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.mp-quick-attr { font-size: 13px; padding: 10px 12px; background: var(--mp-bg); border-radius: 8px; }
.mp-quick-attr__name { color: var(--mp-text-light); }
.mp-quick-attr__value { color: var(--mp-text); font-weight: 500; margin-left: 4px; }

/* Buy Box */
.mp-buybox { position: sticky; top: 20px; }
.mp-buybox__inner { background: #fff; border-radius: 20px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.04), 0 10px 30px rgba(0,0,0,0.1); }
.mp-winner { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--mp-border); }
.mp-winner__icon { font-size: 24px; }
.mp-winner__text { font-size: 14px; font-weight: 600; color: var(--mp-success); }
.mp-buybox__header { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
.mp-buybox__logo { width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #ff6b35, #e55a2b); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
.mp-buybox__name { font-size: 16px; font-weight: 600; color: var(--mp-text); }
.mp-buybox__rating { font-size: 13px; color: var(--mp-text-light); display: flex; align-items: center; gap: 4px; margin-top: 2px; }
.mp-buybox__rating svg { width: 14px; height: 14px; }
.mp-buybox__badges { display: flex; gap: 16px; margin-bottom: 16px; font-size: 13px; }
.mp-buybox__badge { display: flex; align-items: center; gap: 6px; color: var(--mp-text-light); }
.mp-buybox__badge--stock { color: var(--mp-success); font-weight: 500; }
.mp-buybox__badge svg { width: 16px; height: 16px; }
.mp-buybox__price-row { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 16px; }
.mp-buybox__price { font-size: 32px; font-weight: 800; color: #111; }
.mp-buybox__shipping { font-size: 13px; color: var(--mp-success); }
.mp-buybox__shipping.paid { color: var(--mp-text-light); }
.mp-cta { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 16px 28px; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; border: none; background: linear-gradient(135deg, #ff6b35, #e55a2b); color: #fff; box-shadow: 0 4px 16px rgba(255,107,53,0.4); transition: all 0.2s; }
.mp-cta:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(255,107,53,0.5); }
.mp-cta svg { width: 20px; height: 20px; }
.mp-megabuy-label { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 8px; }
.mp-more-offers { display: block; text-align: center; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--mp-border); font-size: 14px; color: var(--mp-primary); text-decoration: none; font-weight: 500; }
.mp-more-offers:hover { text-decoration: underline; }

/* Navigation */
.mp-nav { display: flex; gap: 8px; margin-bottom: 24px; border-bottom: 2px solid var(--mp-border); }
.mp-nav__btn { padding: 14px 24px; font-size: 15px; font-weight: 600; color: var(--mp-text-light); text-decoration: none; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.2s; }
.mp-nav__btn:hover, .mp-nav__btn.active { color: var(--mp-primary); border-bottom-color: var(--mp-primary); }

/* Sections */
.mp-section { margin-bottom: 32px; }
.mp-section__title { font-size: 20px; font-weight: 700; color: var(--mp-text); margin-bottom: 20px; }
.mp-card { background: white; border-radius: 20px; padding: 28px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }

/* Offers */
.mp-offers { background: white; border-radius: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); overflow: hidden; }
.mp-offers__header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--mp-border); }
.mp-offers__header h2 { font-size: 18px; font-weight: 700; margin: 0; }
.mp-offers__count { font-size: 13px; color: var(--mp-text-light); }
.mp-offer { display: grid; grid-template-columns: 220px 100px 120px 160px 160px; align-items: center; gap: 16px; padding: 20px 24px; border-bottom: 1px solid var(--mp-border); }
.mp-offer--best { background: rgba(255,107,53,0.03); }
.mp-offer__vendor { display: flex; align-items: center; gap: 14px; }
.mp-offer__logo { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, #ff6b35, #e55a2b); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; }
.mp-offer__name { font-size: 15px; font-weight: 600; color: var(--mp-text); }
.mp-offer__rating { font-size: 12px; color: var(--mp-text-light); display: flex; align-items: center; gap: 4px; }
.mp-offer__rating svg { width: 12px; height: 12px; }
.mp-offer__stock { font-size: 13px; color: var(--mp-text-light); display: flex; align-items: center; gap: 6px; }
.mp-offer__stock.in { color: var(--mp-success); font-weight: 500; }
.mp-offer__stock svg { width: 16px; height: 16px; }
.mp-offer__delivery { font-size: 13px; color: var(--mp-text-light); display: flex; align-items: center; gap: 6px; }
.mp-offer__delivery svg { width: 16px; height: 16px; }
.mp-offer__price-col { text-align: right; }
.mp-offer__price { font-size: 20px; font-weight: 700; color: var(--mp-text); }
.mp-offer__shipping { font-size: 12px; color: var(--mp-success); }
.mp-offer__cta-col { text-align: right; }
.mp-offer__cta { display: inline-flex; align-items: center; gap: 8px; padding: 12px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; background: linear-gradient(135deg, #ff6b35, #e55a2b); color: white; transition: all 0.2s; }
.mp-offer__cta:hover { transform: translateY(-1px); }
.mp-offer__cta svg { width: 16px; height: 16px; }
.mp-offer__megabuy { display: block; font-size: 11px; color: #9ca3af; margin-top: 6px; }

/* Description & Params */
.mp-desc { font-size: 15px; line-height: 1.8; color: var(--mp-text); }
.mp-params { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.mp-param { display: flex; justify-content: space-between; padding: 12px 16px; background: var(--mp-bg); border-radius: 10px; font-size: 14px; }
.mp-param__name { color: var(--mp-text-light); }
.mp-param__value { color: var(--mp-text); font-weight: 500; }
.mp-empty-text { color: var(--mp-text-light); font-style: italic; }

/* Lightbox */
.mp-lightbox { position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: 10000; display: flex; align-items: center; justify-content: center; }
.mp-lightbox__close { position: absolute; top: 20px; right: 20px; width: 44px; height: 44px; background: rgba(255,255,255,0.1); border: none; border-radius: 50%; color: white; font-size: 24px; cursor: pointer; }
.mp-lightbox__nav { position: absolute; top: 50%; transform: translateY(-50%); width: 50px; height: 50px; background: rgba(255,255,255,0.1); border: none; border-radius: 50%; color: white; font-size: 28px; cursor: pointer; }
.mp-lightbox__nav--prev { left: 20px; }
.mp-lightbox__nav--next { right: 20px; }
.mp-lightbox__img { max-width: 90%; max-height: 90%; object-fit: contain; }
.mp-lightbox__counter { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); color: white; font-size: 14px; }

/* Empty */
.mp-empty { text-align: center; padding: 60px 20px; }
.mp-empty__icon { font-size: 4rem; margin-bottom: 20px; }
.mp-btn { display: inline-block; padding: 14px 28px; background: var(--mp-primary); color: white; border-radius: 10px; text-decoration: none; font-weight: 600; }

/* Responsive */
@media (max-width: 1200px) {
    .mp-product-top { grid-template-columns: 320px 1fr 340px; gap: 20px; }
}
@media (max-width: 1000px) {
    .mp-product-top { grid-template-columns: 280px 1fr 300px; gap: 16px; }
    .mp-offer { grid-template-columns: 1fr 80px 100px 120px 140px; }
}
@media (max-width: 900px) {
    .mp-product-top { grid-template-columns: 1fr; }
    .mp-mobile-price-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .mp-mobile-price { font-size: 24px; font-weight: 800; color: #111; }
    .mp-mobile-shipping { font-size: 12px; color: var(--mp-success); font-weight: 500; }
    .mp-gallery-wrapper { position: relative; top: auto; }
    .mp-buybox { position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999; border-radius: 20px 20px 0 0; box-shadow: 0 -4px 24px rgba(0,0,0,0.15); background: white; }
    .mp-buybox__inner { padding: 16px 20px; }
    .mp-winner, .mp-buybox__header, .mp-buybox__badges, .mp-more-offers { display: none; }
    .mp-buybox__price-row { margin-bottom: 12px; }
    .mp-single { padding-bottom: 140px; }
    .mp-offer { grid-template-columns: 1fr; gap: 12px; }
    .mp-offer__price-col, .mp-offer__cta-col { text-align: left; }
}
@media (max-width: 600px) {
    .mp-params { grid-template-columns: 1fr; }
    .mp-quick-attrs { grid-template-columns: 1fr; }
}
</style>
