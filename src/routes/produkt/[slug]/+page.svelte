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
    let activeTab = 'offers';
    let offersFilter = 'all';
    
    $: mainImage = images[currentImageIndex] || product?.image_url || '';
    $: lowestPrice = product?.price_min || product?.price || 0;
    $: freeShipping = lowestPrice >= 49;
    $: offerCount = product?.offer_count || offers.length || 1;
    
    // Use real offers from API, fallback to empty array
    $: offers = product?.offers || [];
    
    // BuyBox - best offer (lowest price, first in sorted array)
    $: bestOffer = offers.length > 0 ? offers[0] : null;
    
    $: filteredOffers = offersFilter === 'instock' 
        ? offers.filter(o => o.stock_status === 'instock') 
        : offers;
    
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
</svelte:head>

<div class="mp-product">
    <div class="mp-product__container">
        
        <!-- Breadcrumb -->
        <nav class="mp-breadcrumb">
            <a href="/">Domov</a>
            {#if product?.category_slug && product?.category_name}
            <span>›</span>
            <a href="/kategoria/{product.category_slug}">{product.category_name}</a>
            {/if}
            <span>›</span>
            <span>{product?.title}</span>
        </nav>
        
        {#if product}
        <!-- Product Top Section -->
        <div class="mp-product__top">
            
            <!-- Gallery -->
            <div class="mp-gallery">
                <div class="mp-gallery__thumbs">
                    {#each images.slice(0, 5) as img, i}
                        <button 
                            class="mp-gallery__thumb" 
                            class:active={i === currentImageIndex}
                            on:click={() => selectImage(i)}
                        >
                            <img src={img} alt="">
                        </button>
                    {/each}
                </div>
                <button type="button" class="mp-gallery__main" on:click={openLightbox}>
                    {#if mainImage}
                        <img src={mainImage} alt={product.title}>
                    {:else}
                        <div class="mp-gallery__placeholder">📷</div>
                    {/if}
                </button>
            </div>
            
            <!-- Product Info -->
            <div class="mp-info">
                <h1 class="mp-info__title">{product.title}</h1>
                
                {#if product.description}
                    <p class="mp-info__desc">
                        {product.description.replace(/<[^>]*>/g, '').slice(0, 200)}...
                        <a href="#popis" class="mp-info__more">Zobraziť viac →</a>
                    </p>
                {/if}
                
                <!-- Action Buttons -->
                <div class="mp-info__actions">
                    <button class="mp-info__action" class:active={isWishlisted} on:click={toggleWishlist}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        Pridať do obľúbených
                    </button>
                    <button class="mp-info__action" class:active={isCompared} on:click={toggleCompare}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                        </svg>
                        Porovnať
                    </button>
                </div>
                
                <!-- AI Assistant Box -->
                <div class="mp-ai-box">
                    <div class="mp-ai-box__header">
                        <span class="mp-ai-box__icon">🤖</span>
                        <span>AI Asistent</span>
                    </div>
                    <div class="mp-ai-box__actions">
                        <button class="mp-ai-box__btn">💬 Opýtať sa</button>
                        <button class="mp-ai-box__btn">📊 Porovnať</button>
                        <button class="mp-ai-box__btn">🔄 Alternatívy</button>
                        <button class="mp-ai-box__btn">⭐ Recenzie</button>
                    </div>
                </div>
            </div>
            
            <!-- Buy Box -->
            <div class="mp-buybox">
                <div class="mp-buybox__badge">
                    <span>☆</span> Najlepšia ponuka
                </div>
                
                {#if bestOffer}
                <div class="mp-buybox__header">
                    <div class="mp-buybox__logo">{bestOffer.initials?.toUpperCase() || 'MP'}</div>
                    <div class="mp-buybox__vendor">
                        <div class="mp-buybox__name">{bestOffer.shop_name || 'Obchod'}</div>
                        <div class="mp-buybox__rating">
                            <svg viewBox="0 0 24 24" fill="#fbbf24" width="14" height="14"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                            {bestOffer.rating?.toFixed(1) || '4.5'} ({bestOffer.review_count || 0})
                        </div>
                    </div>
                </div>
                
                <div class="mp-buybox__meta">
                    <span class="mp-buybox__stock" class:outofstock={bestOffer.stock_status !== 'instock'}>
                        {#if bestOffer.stock_status === 'instock'}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>
                        Skladom
                        {:else}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        Nedostupné
                        {/if}
                    </span>
                    <span class="mp-buybox__delivery">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                        {bestOffer.delivery || 'Doručenie 1-3 dni'}
                    </span>
                </div>
                
                <div class="mp-buybox__price-row">
                    <span class="mp-buybox__price">{formatPrice(bestOffer.price || lowestPrice)}</span>
                    <span class="mp-buybox__shipping" class:free={bestOffer.shipping === 0 || freeShipping}>
                        {bestOffer.shipping === 0 || freeShipping ? '✓ Doprava zdarma' : `+ ${formatPrice(bestOffer.shipping || 2.99)} doprava`}
                    </span>
                </div>
                
                {#if bestOffer.is_master || bestOffer.display_mode === 'master'}
                <a href="/kosik?add={product.id}" class="mp-buybox__cta mp-buybox__cta--buy">
                    Do košíka
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                </a>
                {:else}
                <a href={bestOffer.affiliate_url || bestOffer.url || '#'} target="_blank" rel="noopener noreferrer" class="mp-buybox__cta">
                    Do obchodu
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
                {/if}
                {:else}
                <div class="mp-buybox__header">
                    <div class="mp-buybox__logo">MP</div>
                    <div class="mp-buybox__vendor">
                        <div class="mp-buybox__name">MegaPrice.sk</div>
                        <div class="mp-buybox__rating">
                            <svg viewBox="0 0 24 24" fill="#fbbf24" width="14" height="14"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                            4.8 (1250)
                        </div>
                    </div>
                </div>
                
                <div class="mp-buybox__meta">
                    <span class="mp-buybox__stock">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>
                        Skladom
                    </span>
                    <span class="mp-buybox__delivery">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                        Doručenie zajtra
                    </span>
                </div>
                
                <div class="mp-buybox__price-row">
                    <span class="mp-buybox__price">{formatPrice(lowestPrice)}</span>
                    <span class="mp-buybox__shipping" class:free={freeShipping}>
                        {freeShipping ? '✓ Doprava zdarma' : '+ 2,99 € doprava'}
                    </span>
                </div>
                
                <button class="mp-buybox__cta">
                    Do obchodu
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </button>
                {/if}
                
                <a href="#ponuky" class="mp-buybox__more">Zobraziť všetky ponuky →</a>
            </div>
        </div>
        
        <!-- Tabs Navigation -->
        <div class="mp-tabs">
            <button class="mp-tabs__btn" class:active={activeTab === 'offers'} on:click={() => activeTab = 'offers'}>Kde kúpiť</button>
            <button class="mp-tabs__btn" class:active={activeTab === 'desc'} on:click={() => activeTab = 'desc'}>Popis</button>
            <button class="mp-tabs__btn" class:active={activeTab === 'params'} on:click={() => activeTab = 'params'}>Parametre</button>
        </div>
        
        <!-- Tab Content -->
        <div class="mp-tab-content">
            
            <!-- Offers Section -->
            {#if activeTab === 'offers'}
            <section id="ponuky" class="mp-offers">
                <div class="mp-offers__header">
                    <div class="mp-offers__title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                        Porovnanie cien
                        <span class="mp-offers__count">{offers.length} {offers.length === 1 ? 'ponuka' : 'ponuky'}</span>
                    </div>
                    <div class="mp-offers__filters">
                        <button class="mp-offers__filter" class:active={offersFilter === 'all'} on:click={() => offersFilter = 'all'}>Všetky</button>
                        <button class="mp-offers__filter" class:active={offersFilter === 'instock'} on:click={() => offersFilter = 'instock'}>Skladom</button>
                    </div>
                </div>
                
                <div class="mp-offers__list">
                    {#each filteredOffers as offer}
                        <div class="mp-offers__row">
                            <div class="mp-offers__vendor">
                                <div class="mp-offers__logo">{offer.initials?.toUpperCase() || offer.shop_name?.slice(0,2).toLowerCase() || 'XX'}</div>
                                <div class="mp-offers__vendor-info">
                                    <div class="mp-offers__vendor-name">{offer.shop_name || 'Obchod'}</div>
                                    <div class="mp-offers__vendor-rating">
                                        <svg viewBox="0 0 24 24" fill="#fbbf24" width="12" height="12"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                        {offer.rating?.toFixed(1) || '4.5'} ({offer.review_count || 0})
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mp-offers__stock" class:in={offer.stock_status === 'instock'}>
                                {#if offer.stock_status === 'instock'}
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
                                {/if}
                                {offer.stock_status === 'instock' ? 'Skladom' : 'Na obj.'}
                            </div>
                            
                            <div class="mp-offers__delivery">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                                {offer.delivery || '1-3 dni'}
                            </div>
                            
                            <div class="mp-offers__price-col">
                                <div class="mp-offers__price">{formatPrice(offer.price)}</div>
                                <div class="mp-offers__shipping">{offer.shipping === 0 ? 'Doprava zdarma' : `+ ${formatPrice(offer.shipping || 0)} doprava`}</div>
                            </div>
                            
                            <div class="mp-offers__cta-col">
                                {#if offer.is_master || offer.display_mode === 'master'}
                                    <a href="/kosik?add={product?.id}" class="mp-offers__cta cart">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                                        Do košíka
                                    </a>
                                {:else}
                                    <a href={offer.affiliate_url || offer.url || '#'} class="mp-offers__cta affiliate" target="_blank" rel="noopener">
                                        Do obchodu
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                    </a>
                                {/if}
                            </div>
                        </div>
                    {/each}
                    
                    {#if filteredOffers.length === 0}
                        <div class="mp-offers__empty">
                            <p>😔 Žiadne ponuky nie sú k dispozícii</p>
                        </div>
                    {/if}
                </div>
            </section>
            {/if}
            
            <!-- Description -->
            {#if activeTab === 'desc'}
            <section id="popis" class="mp-desc">
                <h2>Popis produktu</h2>
                {#if product.description}
                    <div class="mp-desc__content">{@html product.description}</div>
                {:else}
                    <p class="mp-desc__empty">Popis nie je k dispozícii.</p>
                {/if}
            </section>
            {/if}
            
            <!-- Parameters -->
            {#if activeTab === 'params'}
            <section id="parametre" class="mp-params">
                <h2>Parametre</h2>
                {#if attributes.length > 0}
                    <div class="mp-params__grid">
                        {#each attributes as attr}
                            <div class="mp-params__row">
                                <span class="mp-params__name">{attr.name}</span>
                                <span class="mp-params__value">{attr.value}</span>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <p class="mp-params__empty">Parametre nie sú k dispozícii.</p>
                {/if}
            </section>
            {/if}
            
        </div>
        
        {:else}
        <div class="mp-empty">
            <h1>Produkt nenájdený</h1>
            <a href="/" class="mp-btn">Späť na hlavnú</a>
        </div>
        {/if}
    </div>
</div>

<!-- Lightbox -->
{#if lightboxOpen}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="mp-lightbox" on:click={closeLightbox} role="dialog" aria-modal="true">
        <button class="mp-lightbox__close" on:click={closeLightbox}>✕</button>
        <button class="mp-lightbox__nav prev" on:click|stopPropagation={prevImage}>‹</button>
        <img src={mainImage} alt="Zväčšený obrázok" class="mp-lightbox__img">
        <button class="mp-lightbox__nav next" on:click|stopPropagation={nextImage}>›</button>
        <div class="mp-lightbox__counter">{currentImageIndex + 1} / {images.length}</div>
    </div>
{/if}

<style>
/* =============================================
   PRODUCT PAGE - MEGAPRICE.SK EXACT COPY
   ============================================= */

.mp-product {
    background: #fff;
    padding: 20px 0 60px;
}

.mp-product__container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
}

/* Breadcrumb */
.mp-breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 20px;
}
.mp-breadcrumb a { color: #6b7280; }
.mp-breadcrumb a:hover { color: #c4956a; }
.mp-breadcrumb span:last-child { color: #1f2937; }

/* Product Top Layout */
.mp-product__top {
    display: grid;
    grid-template-columns: 480px 1fr 340px;
    grid-template-areas: "gallery info buybox";
    gap: 32px;
    margin-bottom: 32px;
    align-items: start;
}

.mp-gallery {
    grid-area: gallery;
    display: flex;
    gap: 12px;
}

.mp-info {
    grid-area: info;
    min-width: 0;
}

.mp-buybox {
    grid-area: buybox;
    height: fit-content;
}

/* =============================================
   GALLERY
   ============================================= */
.mp-gallery__thumbs {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex-shrink: 0;
}

.mp-gallery__thumb {
    width: 60px;
    height: 60px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    padding: 4px;
    background: #fff;
    cursor: pointer;
    transition: border-color 0.2s;
}
.mp-gallery__thumb.active { border-color: #c4956a; }
.mp-gallery__thumb img { width: 100%; height: 100%; object-fit: contain; }

.mp-gallery__main {
    flex: 1;
    max-width: 400px;
    aspect-ratio: 1;
    background: #f9fafb;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: zoom-in;
    border: none;
}
.mp-gallery__main img { max-width: 100%; max-height: 100%; object-fit: contain; }
.mp-gallery__placeholder { font-size: 5rem; opacity: 0.3; }

/* =============================================
   PRODUCT INFO
   ============================================= */
.mp-info {
    padding-top: 8px;
    min-width: 0;
}

.mp-info__title {
    font-size: 22px;
    font-weight: 600;
    color: #1f2937;
    line-height: 1.4;
    margin-bottom: 16px;
}

.mp-info__desc {
    font-size: 14px;
    color: #6b7280;
    line-height: 1.7;
    margin-bottom: 20px;
}
.mp-info__more { color: #c4956a; margin-left: 4px; }

.mp-info__actions {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
}

.mp-info__action {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #fff;
    font-size: 13px;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s;
}
.mp-info__action:hover { border-color: #c4956a; color: #c4956a; }
.mp-info__action.active { border-color: #c4956a; color: #c4956a; background: #faf7f4; }

/* AI Assistant Box */
.mp-ai-box {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 16px;
}

.mp-ai-box__header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 12px;
}
.mp-ai-box__icon { font-size: 18px; }

.mp-ai-box__actions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
}

.mp-ai-box__btn {
    padding: 10px 14px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #fff;
    font-size: 12px;
    color: #4b5563;
    cursor: pointer;
    transition: all 0.2s;
}
.mp-ai-box__btn:hover { border-color: #c4956a; color: #c4956a; }

/* =============================================
   BUY BOX - EXACT MEGAPRICE.SK STYLE
   ============================================= */
.mp-buybox {
    background: #fff;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.04), 0 10px 24px rgba(0,0,0,0.08);
    position: sticky;
    top: 100px;
    }

.mp-buybox__badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: #fef3c7;
    border: 1px solid #fbbf24;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    color: #92400e;
    margin-bottom: 16px;
}

.mp-buybox__header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e5e7eb;
}

.mp-buybox__logo {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: linear-gradient(135deg, #c4956a, #b8875c);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
}

.mp-buybox__name {
    font-size: 15px;
    font-weight: 600;
    color: #1f2937;
}

.mp-buybox__rating {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #6b7280;
    margin-top: 2px;
}

.mp-buybox__meta {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
}

.mp-buybox__stock {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    font-weight: 500;
    color: #16a34a;
}

.mp-buybox__delivery {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #6b7280;
}

.mp-buybox__price-row {
    display: flex;
    align-items: baseline;
    gap: 16px;
    margin-bottom: 16px;
}

.mp-buybox__price {
    font-size: 28px;
    font-weight: 800;
    color: #111827;
}

.mp-buybox__shipping {
    font-size: 13px;
    color: #6b7280;
}
.mp-buybox__shipping.free { color: #16a34a; }

.mp-buybox__cta {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 14px 24px;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    border: none;
    background: linear-gradient(135deg, #c4956a, #b8875c);
    color: #fff;
    box-shadow: 0 4px 14px rgba(196, 149, 106, 0.35);
    transition: all 0.2s;
    margin: 0 auto;
    max-width: 100%;
    box-sizing: border-box;
}
.mp-buybox__cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(196, 149, 106, 0.45);
}

.mp-buybox__more {
    display: block;
    text-align: center;
    margin-top: 16px;
    font-size: 13px;
    color: #c4956a;
    font-weight: 500;
}
.mp-buybox__more:hover { text-decoration: underline; }

/* =============================================
   TABS
   ============================================= */
.mp-tabs {
    display: flex;
    gap: 0;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 24px;
}

.mp-tabs__btn {
    padding: 14px 24px;
    font-size: 14px;
    font-weight: 600;
    color: #6b7280;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    margin-bottom: -1px;
    cursor: pointer;
    transition: all 0.2s;
}
.mp-tabs__btn:hover { color: #1f2937; }
.mp-tabs__btn.active {
    color: #c4956a;
    border-bottom-color: #c4956a;
    background: linear-gradient(180deg, transparent, rgba(196,149,106,0.06));
}

/* =============================================
   OFFERS SECTION - EXACT MEGAPRICE.SK STYLE
   ============================================= */
.mp-offers {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.04), 0 10px 24px rgba(0,0,0,0.08);
    overflow: hidden;
}

.mp-offers__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
}

.mp-offers__title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    font-weight: 600;
    color: #1f2937;
}
.mp-offers__title svg { color: #c4956a; }

.mp-offers__count {
    font-size: 13px;
    font-weight: 400;
    color: #6b7280;
    margin-left: 4px;
}

.mp-offers__filters {
    display: flex;
    gap: 6px;
}

.mp-offers__filter {
    padding: 6px 14px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.15s;
}
.mp-offers__filter:hover { border-color: #c4956a; color: #c4956a; }
.mp-offers__filter.active { background: #c4956a; border-color: #c4956a; color: #fff; }

.mp-offers__list {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.mp-offers__row {
    display: grid;
    grid-template-columns: minmax(180px, 1fr) 90px 90px 110px 140px;
    align-items: center;
    gap: 16px;
    padding: 14px 18px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    transition: all 0.2s;
}
.mp-offers__row:hover { border-color: #d1d5db; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }

.mp-offers__vendor {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
}

.mp-offers__logo {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: #9ca3af;
    flex-shrink: 0;
}

.mp-offers__vendor-name {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
}

.mp-offers__vendor-rating {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 12px;
    color: #6b7280;
    margin-top: 2px;
}

.mp-offers__stock {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 500;
    color: #d97706;
}
.mp-offers__stock.in { color: #16a34a; }

.mp-offers__delivery {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #6b7280;
}

.mp-offers__price-col {
    text-align: right;
}

.mp-offers__price {
    font-size: 17px;
    font-weight: 800;
    color: #111827;
}

.mp-offers__shipping {
    font-size: 11px;
    color: #16a34a;
    margin-top: 1px;
}

.mp-offers__cta-col {
    display: flex;
    justify-content: flex-end;
}

.mp-offers__cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.15s;
    border: none;
    white-space: nowrap;
}

.mp-offers__cta.affiliate {
    background: #c4956a;
    color: #fff;
}
.mp-offers__cta.affiliate:hover {
    background: #b8875c;
    box-shadow: 0 2px 8px rgba(196,149,106,0.3);
}

.mp-offers__cta.cart {
    background: #c4956a;
    color: #fff;
}
.mp-offers__cta.cart:hover {
    background: #b8875c;
    box-shadow: 0 2px 8px rgba(196,149,106,0.3);
}

/* =============================================
   DESCRIPTION & PARAMETERS
   ============================================= */
.mp-desc, .mp-params {
    background: #fff;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.mp-desc h2, .mp-params h2 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #1f2937;
}

.mp-desc__content {
    font-size: 15px;
    line-height: 1.8;
    color: #4b5563;
}

.mp-params__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.mp-params__row {
    display: flex;
    justify-content: space-between;
    padding: 12px 16px;
    background: #f9fafb;
    border-radius: 8px;
}

.mp-params__name { color: #6b7280; font-size: 14px; }
.mp-params__value { color: #1f2937; font-weight: 500; font-size: 14px; }

.mp-desc__empty, .mp-params__empty {
    color: #9ca3af;
    font-style: italic;
}

/* =============================================
   LIGHTBOX
   ============================================= */
.mp-lightbox {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.95);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.mp-lightbox__close {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 44px;
    height: 44px;
    background: rgba(255,255,255,0.1);
    border: none;
    border-radius: 50%;
    color: white;
    font-size: 24px;
    cursor: pointer;
}

.mp-lightbox__nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 50px;
    height: 50px;
    background: rgba(255,255,255,0.1);
    border: none;
    border-radius: 50%;
    color: white;
    font-size: 28px;
    cursor: pointer;
}
.mp-lightbox__nav.prev { left: 20px; }
.mp-lightbox__nav.next { right: 20px; }

.mp-lightbox__img { max-width: 90%; max-height: 90%; object-fit: contain; }

.mp-lightbox__counter {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    font-size: 14px;
}

/* =============================================
   EMPTY & BUTTON
   ============================================= */
.mp-empty { text-align: center; padding: 60px 20px; }
.mp-btn {
    display: inline-block;
    padding: 14px 28px;
    background: #c4956a;
    color: white;
    border-radius: 10px;
    font-weight: 600;
    margin-top: 20px;
}

/* =============================================
   RESPONSIVE
   ============================================= */
@media (max-width: 1400px) {
    .mp-product__top {
        grid-template-columns: 420px 1fr 320px;
        gap: 24px;
    }
}

@media (max-width: 1200px) {
    .mp-product__top {
        grid-template-columns: 380px 1fr 300px;
        gap: 20px;
    }
}

@media (max-width: 1100px) {
    .mp-product__top {
        grid-template-columns: 1fr 300px;
        grid-template-areas: 
            "gallery gallery"
            "info buybox";
    }
    .mp-gallery { justify-content: center; }
}

@media (max-width: 900px) {
    .mp-product__top {
        grid-template-columns: 1fr;
        grid-template-areas: 
            "gallery"
            "info"
            "buybox";
    }
    .mp-gallery__main { width: 100%; max-width: 400px; }
    .mp-buybox {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 999;
        border-radius: 16px 16px 0 0;
        box-shadow: 0 -4px 24px rgba(0,0,0,0.15);
    }
    .mp-buybox__badge, .mp-buybox__header, .mp-buybox__meta, .mp-buybox__more { display: none; }
    .mp-buybox__price-row { margin-bottom: 12px; }
    .mp-product { padding-bottom: 140px; }
    
    .mp-offers__row {
        grid-template-columns: 1fr auto;
        gap: 8px;
    }
    .mp-offers__vendor { grid-column: 1; grid-row: 1; }
    .mp-offers__price-col { grid-column: 2; grid-row: 1; }
    .mp-offers__stock { grid-column: 1; grid-row: 2; }
    .mp-offers__delivery { display: none; }
    .mp-offers__cta-col { grid-column: 2; grid-row: 2; }
}

@media (max-width: 600px) {
    .mp-gallery__thumbs { flex-direction: row; order: 2; }
    .mp-gallery { flex-direction: column; }
    .mp-params__grid { grid-template-columns: 1fr; }
    .mp-ai-box__actions { grid-template-columns: 1fr; }
}
</style>
