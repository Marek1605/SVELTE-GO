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
    let reviewData = { reviews: [], total: 0, avg_rating: 0, distribution: [] };
    let reviewLoading = false;
    let showReviewForm = false;
    let reviewForm = { author_name: '', rating: 5, title: '', body: '', pros: '', cons: '', verification_code: '' };
    let reviewSubmitting = false;
    let reviewMessage = '';
    let offersStyle = data.offersStyle || 'cards';

    async function loadReviews() {
        if (reviewData.reviews.length > 0 || reviewLoading) return;
        reviewLoading = true;
        try {
            const res = await fetch(`/api/products/${product.id}/reviews`);
            const json = await res.json();
            if (json.success) reviewData = json.data;
        } catch(e) { console.error(e); }
        reviewLoading = false;
    }

    async function submitReview() {
        reviewSubmitting = true;
        reviewMessage = '';
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...reviewForm, product_id: product.id })
            });
            const json = await res.json();
            reviewMessage = json.message || (json.success ? 'Odoslané!' : 'Chyba');
            if (json.success) {
                showReviewForm = false;
                reviewForm = { author_name: '', rating: 5, title: '', body: '', pros: '', cons: '', verification_code: '' };
                reviewData = { ...reviewData, reviews: [], total: 0 };
                loadReviews();
            }
        } catch(e) { reviewMessage = 'Chyba pri odosielaní'; }
        reviewSubmitting = false;
    }
    let offersFilter = 'all';
    let aiOpen = false;
    let infoOpen = false;
    let stickyBarEl;
    
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
        
        // Sticky bar — show when buybox scrolls out of view
        const buyboxEl = document.querySelector('.mp-buybox');
        let observer;
        if (buyboxEl && stickyBarEl) {
            observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) {
                        stickyBarEl.classList.add('visible');
                    } else {
                        stickyBarEl.classList.remove('visible');
                    }
                });
            }, { threshold: 0 });
            observer.observe(buyboxEl);
        }
        
        const handleKey = (e) => {
            if (!lightboxOpen) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'ArrowRight') nextImage();
        };
        window.addEventListener('keydown', handleKey);
        return () => {
            window.removeEventListener('keydown', handleKey);
            if (observer) observer.disconnect();
        };
    });
</script>

<svelte:head>
    <title>{product?.title || 'Produkt'} | MegaBuy.sk</title>
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
                        {product.description.replace(/<[^>]*>/g, '').slice(0, 150)}
                        <a href="#popis" class="mp-info__more" on:click|preventDefault={() => activeTab = 'desc'}>Ďalšie informácie →</a>
                    </p>
                {/if}
                
                <!-- Action Buttons -->
                <div class="mp-info__actions">
                    <button class="mp-info__action" class:active={isWishlisted} on:click={toggleWishlist} title="Pridať do obľúbených">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                    </button>
                    <button class="mp-info__action" class:active={isCompared} on:click={toggleCompare} title="Porovnať">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                        </svg>
                    </button>
                </div>
                
                <!-- AI Assistant — expandable -->
                <div class="mp-ai-box">
                    <button class="mp-ai-toggle" class:open={aiOpen} on:click={() => aiOpen = !aiOpen}>
                        <span class="mp-ai-toggle__icon">✨</span>
                        <div class="mp-ai-toggle__text"><strong>AI Asistent</strong><span>Opýtajte sa na produkt</span></div>
                        <svg class="mp-ai-toggle__arrow" class:open={aiOpen} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    {#if aiOpen}
                    <div class="mp-ai-panel">
                        <div class="mp-ai-actions">
                            <button class="mp-ai-action">💬 Opýtať sa</button>
                            <button class="mp-ai-action">🔄 Alternatívy</button>
                            <button class="mp-ai-action">📊 Cenový vývoj</button>
                            <button class="mp-ai-action">⭐ Recenzie</button>
                        </div>
                        <div class="mp-ai-input">
                            <input type="text" placeholder="Napíšte otázku o produkte...">
                            <button class="mp-ai-send">→</button>
                        </div>
                    </div>
                    {/if}
                </div>
            </div>
            
            <!-- Buy Box -->
            <div class="mp-buybox">
                <div class="mp-buybox__badge">
                    <span>⭐</span> Odporúčaná ponuka
                </div>
                
                {#if bestOffer}
                <div class="mp-buybox__header">
                    <div class="mp-buybox__logo">
                        {#if bestOffer.shop_logo}
                            <img src={bestOffer.shop_logo} alt={bestOffer.shop_name} class="mp-buybox__logo-img">
                        {:else}
                            <span style="font-size:10px;color:#6b7280;font-weight:700;">{bestOffer.shop_name?.toLowerCase() || 'shop'}</span>
                        {/if}
                    </div>
                    <div class="mp-buybox__vendor">
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
                    <span class="mp-buybox__mobile-rec">⭐ Odporúčaná · {bestOffer.shop_name || 'Obchod'}</span>
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
                <a href="/go/{bestOffer.id}" target="_blank" rel="noopener noreferrer" class="mp-buybox__cta">
                    Do obchodu
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
                </a>
                {/if}
                {:else}
                <div class="mp-buybox__header">
                    <div class="mp-buybox__logo">MP</div>
                    <div class="mp-buybox__vendor">
                        <div class="mp-buybox__name">MegaBuy.sk</div>
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
        
        <!-- Mobile Sticky Bar (appears when scrolled past buybox) -->
        {#if bestOffer}
        <div class="mp-sticky-bar" bind:this={stickyBarEl}>
            <div class="mp-sticky-bar__info">
                <div class="mp-sticky-bar__shop">⭐ {bestOffer.shop_name || 'Obchod'}</div>
                <div style="display:flex;align-items:baseline;gap:8px">
                    <span class="mp-sticky-bar__price">{formatPrice(bestOffer.price || lowestPrice)}</span>
                    <span class="mp-sticky-bar__shipping">{bestOffer.shipping === 0 ? 'Doprava zdarma' : `+ ${formatPrice(bestOffer.shipping || 0)}`}</span>
                </div>
            </div>
            {#if bestOffer.is_master || bestOffer.display_mode === 'master'}
                <a href="/kosik?add={product?.id}" class="mp-sticky-bar__cta">Do obchodu <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg></a>
            {:else}
                <a href="/go/{bestOffer.id}" target="_blank" rel="noopener" class="mp-sticky-bar__cta">Do obchodu <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg></a>
            {/if}
        </div>
        {/if}
        
        <!-- Tabs Navigation -->
        <div class="mp-tabs">
            <button class="mp-tabs__btn" class:active={activeTab === 'offers'} on:click={() => activeTab = 'offers'}>Kde kúpiť</button>
                <button class="mp-tabs__btn" class:active={activeTab === 'reviews'} on:click={() => { activeTab = 'reviews'; loadReviews(); }}>
                    Recenzie {#if reviewData.total > 0}<span class="mp-tabs__count">({reviewData.total})</span>{/if}
                </button>
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
                        <svg viewBox="0 0 24 24" fill="none" stroke="#c4956a" stroke-width="2" width="20" height="20"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                        Porovnanie ponúk
                        <span class="mp-offers__count">{offers.length} {offers.length === 1 ? 'obchod' : offers.length < 5 ? 'obchody' : 'obchodov'}</span>
                    </div>
                    <div class="mp-offers__right">
                        {#if offers.length > 1}
                            <span class="mp-offers__save">Ušetrite {formatPrice((offers[offers.length-1]?.price || 0) - (offers[0]?.price || 0))}</span>
                        {/if}
                        <div class="mp-offers__filters">
                            <button class="mp-offers__filter" class:active={offersFilter === 'all'} on:click={() => offersFilter = 'all'}>Všetky</button>
                            <button class="mp-offers__filter" class:active={offersFilter === 'instock'} on:click={() => offersFilter = 'instock'}>Skladom</button>
                        </div>
                    </div>
                </div>
                
                <div class="mp-offers__list" class:style-ranking={offersStyle === 'ranking'} class:style-minimal={offersStyle === 'minimal'}>
                    {#each filteredOffers as offer, i}
                        <div class="mp-offers__row" class:cheapest={i === 0} class:rec-row={offer.id === bestOffer?.id}>
                            {#if offersStyle === 'ranking'}
                                <div class="mp-offers__rank">{i + 1}</div>
                            {/if}
                            <div class="mp-offers__vendor">
                                <div class="mp-offers__logo" class:cheapest-logo={i === 0 && !offer.shop_logo} class:rec-logo={offer.id === bestOffer?.id && i !== 0 && !offer.shop_logo}>
                                    {#if offer.shop_logo}
                                        <img src={offer.shop_logo} alt={offer.shop_name} class="mp-offers__logo-img">
                                    {:else}
                                        <span class="mp-offers__logo-text">{offer.shop_name?.toLowerCase() || 'shop'}</span>
                                    {/if}
                                </div>
                                <div class="mp-offers__vendor-info">
                                    {#if i === 0 || offer.id === bestOffer?.id}
                                    <div class="mp-offers__badges">
                                        {#if i === 0}
                                            <span class="mp-offers__cheap-badge"><svg viewBox="0 0 24 24" fill="none" stroke="#047857" stroke-width="2.5" width="10" height="10" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg> Najlepšia cena</span>
                                        {/if}
                                        {#if offer.id === bestOffer?.id}
                                            <span class="mp-offers__rec-badge"><svg viewBox="0 0 24 24" fill="#b45309" width="10" height="10"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10" fill="none" stroke="#fff" stroke-width="2.5"/></svg> Odporúčaná ponuka</span>
                                        {/if}
                                    </div>
                                    {/if}
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
                                {#if offer.price > (offers[0]?.price || 0) + 0.01}
                                    <div class="mp-offers__diff">+{formatPrice(offer.price - (offers[0]?.price || 0))}</div>
                                {/if}
                            </div>
                            
                            <div class="mp-offers__cta-col">
                                {#if offer.is_master || offer.display_mode === 'master'}
                                    <a href="/kosik?add={product?.id}" class="mp-offers__cta cart">
                                        Do košíka
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
                                    </a>
                                {:else}
                                    <a href="/go/{offer.id}" class="mp-offers__cta affiliate" target="_blank" rel="noopener">
                                        Do obchodu
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
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
            
            {#if activeTab === 'reviews'}
            <section class="mp-reviews">
                <!-- Rating summary -->
                <div class="rv-summary">
                    <div class="rv-summary__big">
                        <span class="rv-summary__num">{reviewData.avg_rating?.toFixed(1) || '0.0'}</span>
                        <div class="rv-summary__stars">
                            {#each Array(5) as _, s}
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="{s < Math.round(reviewData.avg_rating || 0) ? '#fbbf24' : 'none'}" stroke="{s < Math.round(reviewData.avg_rating || 0) ? '#fbbf24' : '#d1d5db'}" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            {/each}
                        </div>
                        <span class="rv-summary__total">{reviewData.total} {reviewData.total === 1 ? 'recenzia' : reviewData.total < 5 ? 'recenzie' : 'recenzií'}</span>
                    </div>
                    <div class="rv-summary__bars">
                        {#each [5,4,3,2,1] as star}
                            {@const cnt = reviewData.distribution?.find(d => d.stars === star)?.count || 0}
                            <div class="rv-bar">
                                <span class="rv-bar__label">{star} ★</span>
                                <div class="rv-bar__track"><div class="rv-bar__fill" style="width:{reviewData.total > 0 ? (cnt/reviewData.total*100) : 0}%"></div></div>
                                <span class="rv-bar__count">{cnt}</span>
                            </div>
                        {/each}
                    </div>
                    <button class="rv-write-btn" on:click={() => showReviewForm = !showReviewForm}>
                        ✏️ Napísať recenziu
                    </button>
                </div>

                <!-- Review form -->
                {#if showReviewForm}
                <div class="rv-form">
                    <h3>Vaša recenzia</h3>
                    <div class="rv-form__stars">
                        {#each Array(5) as _, s}
                            <button class="rv-form__star" on:click={() => reviewForm.rating = s + 1}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="{s < reviewForm.rating ? '#fbbf24' : 'none'}" stroke="{s < reviewForm.rating ? '#fbbf24' : '#d1d5db'}" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            </button>
                        {/each}
                    </div>
                    <input type="text" placeholder="Vaše meno" bind:value={reviewForm.author_name} class="rv-form__input">
                    <input type="text" placeholder="Titulok recenzie" bind:value={reviewForm.title} class="rv-form__input">
                    <textarea placeholder="Vaša skúsenosť s produktom..." bind:value={reviewForm.body} class="rv-form__textarea" rows="4"></textarea>
                    <div class="rv-form__row">
                        <input type="text" placeholder="👍 Klady" bind:value={reviewForm.pros} class="rv-form__input rv-form__input--half">
                        <input type="text" placeholder="👎 Zápory" bind:value={reviewForm.cons} class="rv-form__input rv-form__input--half">
                    </div>
                    <input type="text" placeholder="Overovací kód (ak máte)" bind:value={reviewForm.verification_code} class="rv-form__input rv-form__input--code">
                    {#if reviewMessage}<p class="rv-form__msg">{reviewMessage}</p>{/if}
                    <button class="rv-form__submit" on:click={submitReview} disabled={reviewSubmitting}>
                        {reviewSubmitting ? 'Odosielam...' : 'Odoslať recenziu'}
                    </button>
                </div>
                {/if}

                <!-- Reviews list -->
                {#if reviewLoading}
                    <div class="rv-loading">Načítavam recenzie...</div>
                {:else if reviewData.reviews.length === 0}
                    <div class="rv-empty">
                        <p>Zatiaľ žiadne recenzie. Buďte prvý!</p>
                    </div>
                {:else}
                    <div class="rv-list">
                        {#each reviewData.reviews as review}
                            <div class="rv-item">
                                <div class="rv-item__head">
                                    <div class="rv-item__stars">
                                        {#each Array(5) as _, s}
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="{s < review.rating ? '#fbbf24' : '#e5e7eb'}" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                        {/each}
                                    </div>
                                    <span class="rv-item__author">{review.author_name}</span>
                                    {#if review.verified_purchase}<span class="rv-item__verified">✓ Overený nákup</span>{/if}
                                    <span class="rv-item__date">{new Date(review.created_at).toLocaleDateString('sk-SK')}</span>
                                </div>
                                {#if review.title}<h4 class="rv-item__title">{review.title}</h4>{/if}
                                {#if review.body}<p class="rv-item__body">{review.body}</p>{/if}
                                {#if review.pros}<p class="rv-item__pros">👍 {review.pros}</p>{/if}
                                {#if review.cons}<p class="rv-item__cons">👎 {review.cons}</p>{/if}
                            </div>
                        {/each}
                    </div>
                {/if}
            </section>
            {/if}

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
    max-width: 1500px;
    margin: 0 auto;
    padding: 0 32px;
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
    background: #fff;
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
    gap: 10px;
    margin-bottom: 20px;
}

.mp-info__action {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    padding: 0;
    border: 1px solid #f0f0f0;
    border-radius: 50%;
    background: #fff;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s;
}
.mp-info__action:hover { border-color: #c4956a; color: #c4956a; background: #fdf8f5; transform: scale(1.05); }
.mp-info__action.active { border-color: #c4956a; color: #c4956a; background: #fdf8f5; }

/* AI Assistant — expandable */
.mp-ai-box { margin-top: 8px; max-width: 50%; }
.mp-ai-toggle {
    width: 100%; display: flex; align-items: center; gap: 10px; padding: 12px 16px;
    background: linear-gradient(135deg, #1e293b, #334155); color: #fff;
    border: none; border-radius: 14px; cursor: pointer; transition: all 0.2s;
}
.mp-ai-toggle.open { border-radius: 14px 14px 0 0; background: #0f172a; }
.mp-ai-toggle__icon { font-size: 18px; }
.mp-ai-toggle__text { flex: 1; text-align: left; }
.mp-ai-toggle__text strong { display: block; font-size: 13px; }
.mp-ai-toggle__text span { font-size: 11px; opacity: 0.6; }
.mp-ai-toggle__arrow { transition: transform 0.2s; }
.mp-ai-toggle__arrow.open { transform: rotate(180deg); }
.mp-ai-panel { background: #0f172a; border-radius: 0 0 14px 14px; padding: 14px; }
.mp-ai-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 10px; }
.mp-ai-action { display: flex; align-items: center; gap: 6px; padding: 10px 12px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff; font-size: 12px; font-weight: 600; cursor: pointer; }
.mp-ai-action:hover { background: rgba(255,255,255,0.1); }
.mp-ai-input { display: flex; gap: 6px; }
.mp-ai-input input { flex: 1; padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: #fff; font-size: 13px; outline: none; }
.mp-ai-send { padding: 10px 16px; background: #c4956a; border: none; border-radius: 10px; color: #fff; font-weight: 700; cursor: pointer; }

/* =============================================
   BUY BOX - EXACT MEGAPRICE.SK STYLE
   ============================================= */
.mp-buybox {
    background: #fff;
    border-radius: 16px;
    padding: 20px;
    border: 1px solid #f0f0f0;
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
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
.mp-buybox__info-btn { width: 20px; height: 20px; border-radius: 50%; border: 1px solid #d1d5db; background: #fff; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; color: #94a3b8; margin-left: 4px; padding: 0; }
.mp-buybox__info-tooltip { background: #f8f9fa; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; margin-bottom: 12px; font-size: 12px; color: #64748b; line-height: 1.6; }
.mp-buybox__info-tooltip strong { color: #1f2937; display: block; margin-bottom: 4px; }
.mp-buybox__trust { background: #fffbeb; border-radius: 8px; padding: 8px 10px; margin-bottom: 14px; font-size: 11px; color: #92400e; line-height: 1.5; display: flex; align-items: center; gap: 6px; }

.mp-buybox__header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
}

.mp-buybox__logo {
    width: 80px;
    height: 36px;
    border-radius: 8px;
    background: transparent;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 11px;
    color: #9ca3af;
    overflow: hidden;
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
    text-decoration: none;
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
.mp-buybox__mobile-rec { display: none; font-size: 10px; font-weight: 700; color: #d97706; }

/* =============================================
   TABS
   ============================================= */
.mp-tabs {
    display: flex;
    gap: 0;
    border-bottom: 1px solid #f0f0f0;
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
    background: #fafafa;
    border-bottom: 1px solid #f0f0f0;
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
    border: 1px solid #f0f0f0;
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
    border: 1px solid #f0f0f0;
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
    width: 100px;
    height: 40px;
    border-radius: 8px;
    background: transparent;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: #9ca3af;
    flex-shrink: 0;
    overflow: hidden;
}
.mp-offers__logo-text { font-size: 11px; font-weight: 700; color: inherit; text-transform: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 6px; }

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
    padding: 10px 18px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.15s;
    border: none;
    white-space: nowrap;
    background: #c4956a;
    color: #fff;
    box-shadow: 0 2px 8px rgba(196,149,106,0.25);
}

.mp-offers__cta:hover {
    background: #b8875c;
    box-shadow: 0 4px 12px rgba(196,149,106,0.35);
}

.mp-offers__cta.cart {
    background: #c4956a;
    color: #fff;
}
.mp-offers__cta.cart:hover {
    background: #b8875c;
}

/* Badges */
.mp-offers__badges { display: flex; gap: 5px; margin-bottom: 3px; flex-wrap: wrap; }
.mp-offers__rec-badge { display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 600; color: #b45309; background: #fffbeb; padding: 3px 8px; border-radius: 6px; border: 1px solid #fde68a; white-space: nowrap; }
.mp-offers__cheap-badge { display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 600; color: #047857; background: #ecfdf5; padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(5,150,105,0.2); white-space: nowrap; }
.mp-offers__diff { font-size: 10px; color: #ef4444; margin-top: 2px; }
.mp-offers__save { background: #f0fdf4; color: #16a34a; font-size: 11px; font-weight: 700; padding: 5px 12px; border-radius: 20px; }
.mp-offers__subtitle { font-size: 11px; color: #94a3b8; padding: 0 16px 8px; }
.mp-offers__right { display: flex; align-items: center; gap: 8px; }
.mp-offers__info-banner { display: flex; gap: 12px; align-items: flex-start; background: #fff; border: 1px solid #eef0f4; border-radius: 14px; padding: 16px; margin: 16px 16px 0; }
.mp-offers__info-icon { width: 36px; height: 36px; border-radius: 10px; background: #fef3c7; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
.mp-offers__info-banner strong { font-size: 13px; color: #1f2937; display: block; margin-bottom: 4px; }
.mp-offers__info-banner p { margin: 0; font-size: 12px; color: #64748b; line-height: 1.6; }
.mp-offers__note { text-align: center; font-size: 11px; color: #94a3b8; margin: 12px 16px 0; }

/* Bottom recommendation info */
.mp-rec-info { display: flex; gap: 14px; align-items: flex-start; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 14px; padding: 18px; margin: 24px 0 0; }
.mp-rec-info__icon { font-size: 22px; flex-shrink: 0; margin-top: 2px; }
.mp-rec-info strong { font-size: 14px; color: #92400e; display: block; margin-bottom: 6px; }
.mp-rec-info p { margin: 0; font-size: 13px; color: #78716c; line-height: 1.6; }

/* Logo images */
.mp-buybox__logo-img { width: 100%; height: 100%; object-fit: contain; }
.mp-offers__logo-img { width: 100%; height: 100%; object-fit: contain; }

/* Cheapest offer — green glow */
.mp-offers__row.cheapest { border: 1.5px solid rgba(34,197,94,0.3); box-shadow: 0 0 20px rgba(34,197,94,0.1), 0 2px 8px rgba(34,197,94,0.06); }
.mp-offers__row.cheapest:hover { border-color: rgba(34,197,94,0.5); box-shadow: 0 0 24px rgba(34,197,94,0.15), 0 4px 12px rgba(34,197,94,0.08); }
.mp-offers__logo.cheapest-logo { background: #16a34a; color: #fff; border-color: #16a34a; }
.mp-offers__row.cheapest .mp-offers__price { color: #059669; }

/* Recommended offer — amber glow */
.mp-offers__row.rec-row:not(.cheapest) { border: 1.5px solid rgba(217,119,6,0.25); box-shadow: 0 0 20px rgba(217,119,6,0.08), 0 2px 8px rgba(217,119,6,0.04); }
.mp-offers__row.rec-row:not(.cheapest):hover { border-color: rgba(217,119,6,0.4); box-shadow: 0 0 24px rgba(217,119,6,0.12); }
.mp-offers__logo.rec-logo { background: linear-gradient(135deg, #d97706, #b45309); color: #fff; border-color: #d97706; }

/* When both cheapest + recommended — green glow wins, both badges show */
.mp-offers__row.cheapest.rec-row { box-shadow: 0 0 20px rgba(34,197,94,0.1), 0 0 16px rgba(217,119,6,0.06); }

/* Ranking style */
.mp-offers__rank { width: 32px; height: 32px; border-radius: 8px; background: #f1f5f9; color: #64748b; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
.mp-offers__row.cheapest .mp-offers__rank { background: #059669; color: #fff; }
.style-ranking .mp-offers__row { display: flex; align-items: center; gap: 14px; padding: 14px 18px; }
.style-ranking .mp-offers__vendor { flex: 1; min-width: 0; }
.style-ranking .mp-offers__stock { flex-shrink: 0; }
.style-ranking .mp-offers__delivery { flex-shrink: 0; }
.style-ranking .mp-offers__price-col { flex-shrink: 0; text-align: right; min-width: 90px; }
.style-ranking .mp-offers__cta-col { flex-shrink: 0; }

/* Minimal style */
.style-minimal .mp-offers__row { border: none; border-radius: 0; border-bottom: 1px solid #f1f5f9; box-shadow: none; padding: 12px 0; margin: 0; }
.style-minimal .mp-offers__row:last-child { border-bottom: none; }
.style-minimal .mp-offers__row:hover { background: #fafbfc; box-shadow: none; }
.style-minimal .mp-offers__row.cheapest { border: none; border-bottom: 1px solid #f1f5f9; box-shadow: none; }
.style-minimal .mp-offers__row.rec-row:not(.cheapest) { border: none; border-bottom: 1px solid #f1f5f9; box-shadow: none; }

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
    background: #fafafa;
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
        position: static;
        border-radius: 16px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        border-top: none;
    }
    .mp-buybox__badge { display: inline-flex; }
    .mp-buybox__header { display: flex; }
    .mp-buybox__meta { display: flex; }
    .mp-buybox__more { display: block; }
    .mp-buybox__name { display: none; }
    .mp-buybox__trust, .mp-buybox__info-tooltip { display: none; }
    .mp-buybox__mobile-rec { display: none; }
    .mp-buybox__price-row { margin-bottom: 16px; }
    .mp-buybox__cta { border-radius: 10px; }
    .mp-product { padding-bottom: 80px; }
    
    /* Sticky bar at bottom — shown via JS when scrolled past buybox */
    .mp-sticky-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 999;
        background: #fff;
        border-radius: 14px 14px 0 0;
        box-shadow: 0 -4px 24px rgba(0,0,0,0.12);
        border-top: 2px solid rgba(196,149,106,0.3);
        padding: 10px 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        transform: translateY(100%);
        transition: transform 0.3s ease;
    }
    .mp-sticky-bar.visible {
        transform: translateY(0);
    }
    .mp-sticky-bar__info { flex: 1; min-width: 0; }
    .mp-sticky-bar__shop { font-size: 10px; font-weight: 600; color: #92400e; }
    .mp-sticky-bar__price { font-size: 20px; font-weight: 800; color: #111; }
    .mp-sticky-bar__shipping { font-size: 11px; color: #16a34a; }
    .mp-sticky-bar__cta {
        display: flex; align-items: center; justify-content: center; gap: 6px;
        padding: 11px 20px; border-radius: 10px; font-size: 13px; font-weight: 700;
        background: linear-gradient(135deg, #c4956a, #b8875c); color: #fff;
        box-shadow: 0 4px 14px rgba(196,149,106,0.35);
        white-space: nowrap; text-decoration: none;
    }
    
    .mp-offers__row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        padding: 12px 14px;
        position: relative;
    }
    /* Vendor: logo + badges inline */
    .mp-offers__vendor { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
    .mp-offers__logo { width: 80px; height: 34px; border-radius: 6px; font-size: 10px; }
    .mp-offers__vendor-info { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; flex: 1; }
    .mp-offers__vendor-rating { font-size: 11px; }
    .mp-offers__badges { display: flex; gap: 4px; }
    .mp-offers__cheap-badge { font-size: 8px; padding: 2px 5px; border-radius: 4px; }
    .mp-offers__rec-badge { font-size: 8px; padding: 2px 5px; border-radius: 4px; }
    /* Price right side */
    .mp-offers__price-col { text-align: right; flex-shrink: 0; }
    .mp-offers__price { font-size: 15px; }
    /* Bottom row */
    .mp-offers__stock { font-size: 11px; }
    .mp-offers__delivery { font-size: 11px; }
    .mp-offers__cta-col { margin-left: auto; }
    .mp-offers__cta { padding: 8px 14px; font-size: 12px; }
    /* Ranking mobile */
    .style-ranking .mp-offers__row { flex-wrap: wrap; gap: 8px; }
    .style-ranking .mp-offers__rank { width: 26px; height: 26px; font-size: 12px; }
    .style-ranking .mp-offers__vendor { flex: 1; min-width: 50%; }
    .mp-ai-box { max-width: 100%; }
    .mp-ai-box { max-width: 100%; }
    .mp-offers__header { flex-wrap: wrap; }
    .mp-offers__right { width: 100%; justify-content: space-between; margin-top: 4px; }
    .mp-offers__info-banner { margin: 12px 12px 0; padding: 12px; }
    .mp-offers__note { margin: 8px 12px 0; }
}

@media (max-width: 600px) {
    .mp-gallery__thumbs { flex-direction: row; order: 2; }
    .mp-gallery { flex-direction: column; }
    .mp-params__grid { grid-template-columns: 1fr; }
    .mp-ai-actions { grid-template-columns: 1fr 1fr; }
}

/* ═══ REVIEWS ═══ */
.rv-summary { display: flex; gap: 24px; align-items: flex-start; padding: 20px; background: #f9fafb; border-radius: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.rv-summary__big { text-align: center; min-width: 120px; }
.rv-summary__num { font-size: 42px; font-weight: 800; color: #111; display: block; line-height: 1; }
.rv-summary__stars { display: flex; gap: 2px; justify-content: center; margin: 6px 0; }
.rv-summary__total { font-size: 13px; color: #6b7280; }
.rv-summary__bars { flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: 4px; }
.rv-bar { display: flex; align-items: center; gap: 8px; }
.rv-bar__label { font-size: 12px; font-weight: 600; color: #6b7280; width: 30px; text-align: right; }
.rv-bar__track { flex: 1; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
.rv-bar__fill { height: 100%; background: linear-gradient(90deg, #fbbf24, #f59e0b); border-radius: 4px; transition: width 0.3s; }
.rv-bar__count { font-size: 12px; color: #94a3b8; width: 24px; }
.rv-write-btn { padding: 10px 20px; background: #c4956a; color: #fff; border: none; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; white-space: nowrap; align-self: center; }
.rv-write-btn:hover { background: #b8875c; }
.rv-form { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
.rv-form h3 { font-size: 16px; margin: 0 0 12px; }
.rv-form__stars { display: flex; gap: 4px; margin-bottom: 12px; }
.rv-form__star { background: none; border: none; cursor: pointer; padding: 2px; }
.rv-form__input { width: 100%; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; margin-bottom: 8px; }
.rv-form__input--half { width: calc(50% - 4px); }
.rv-form__input--code { max-width: 260px; font-family: monospace; }
.rv-form__textarea { width: 100%; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; margin-bottom: 8px; resize: vertical; font-family: inherit; }
.rv-form__row { display: flex; gap: 8px; }
.rv-form__msg { font-size: 13px; color: #16a34a; margin: 8px 0; }
.rv-form__submit { padding: 12px 28px; background: #c4956a; color: #fff; border: none; border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer; }
.rv-form__submit:disabled { opacity: 0.5; }
.rv-loading, .rv-empty { text-align: center; padding: 32px; color: #6b7280; font-size: 14px; }
.rv-list { display: flex; flex-direction: column; gap: 0; }
.rv-item { padding: 16px 0; border-bottom: 1px solid #f3f4f6; }
.rv-item:last-child { border-bottom: none; }
.rv-item__head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }
.rv-item__stars { display: flex; gap: 1px; }
.rv-item__author { font-size: 13px; font-weight: 600; color: #1f2937; }
.rv-item__verified { font-size: 11px; color: #16a34a; font-weight: 600; background: #f0fdf4; padding: 2px 8px; border-radius: 100px; }
.rv-item__date { font-size: 11px; color: #94a3b8; margin-left: auto; }
.rv-item__title { font-size: 15px; font-weight: 600; margin: 4px 0 6px; color: #111; }
.rv-item__body { font-size: 14px; color: #374151; line-height: 1.5; margin: 0 0 6px; }
.rv-item__pros { font-size: 13px; color: #16a34a; margin: 2px 0; }
.rv-item__cons { font-size: 13px; color: #dc2626; margin: 2px 0; }
</style>
