<script lang="ts">
	import { formatPrice } from '$lib/api';
	import { onMount } from 'svelte';
	
	export let data;
	
	$: product = data.product;
	$: category = data.category;
	$: ancestors = data.ancestors || [];
	$: attributes = data.attributes || [];
	$: offers = data.offers || [];
	$: images = product?.images || (product?.image_url ? [product.image_url] : []);
	
	let currentImageIndex = 0;
	let showAllOffers = false;
	let offerFilter = 'all';
	let isInWishlist = false;
	let isInCompare = false;
	
	// Best offer (lowest price)
	$: bestOffer = offers.length > 0 ? offers[0] : null;
	
	// Filtered offers
	$: filteredOffers = offers.filter((o: any) => {
		if (offerFilter === 'instock') return o.stock_status === 'instock';
		return true;
	});
	
	// Offers to display (limit initially)
	$: displayedOffers = showAllOffers ? filteredOffers : filteredOffers.slice(0, 5);
	
	onMount(() => {
		// Check wishlist/compare status
		try {
			const wishlist = JSON.parse(localStorage.getItem('mp_wishlist') || '[]');
			const compare = JSON.parse(localStorage.getItem('mp_compare') || '[]');
			isInWishlist = wishlist.includes(product?.id);
			isInCompare = compare.includes(product?.id);
		} catch (e) {}
	});
	
	function changeImage(index: number) {
		currentImageIndex = index;
	}
	
	function prevImage() {
		currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
	}
	
	function nextImage() {
		currentImageIndex = (currentImageIndex + 1) % images.length;
	}
	
	function toggleWishlist() {
		try {
			let wishlist = JSON.parse(localStorage.getItem('mp_wishlist') || '[]');
			if (isInWishlist) {
				wishlist = wishlist.filter((id: string) => id !== product.id);
			} else {
				wishlist.push(product.id);
			}
			localStorage.setItem('mp_wishlist', JSON.stringify(wishlist));
			isInWishlist = !isInWishlist;
			// Update badge
			document.querySelectorAll('[data-badge="wishlist"]').forEach((el: any) => {
				el.textContent = wishlist.length;
				el.style.display = wishlist.length > 0 ? 'flex' : 'none';
			});
		} catch (e) {}
	}
	
	function toggleCompare() {
		try {
			let compare = JSON.parse(localStorage.getItem('mp_compare') || '[]');
			if (isInCompare) {
				compare = compare.filter((id: string) => id !== product.id);
			} else {
				if (compare.length >= 4) {
					alert('Môžete porovnať maximálne 4 produkty');
					return;
				}
				compare.push(product.id);
			}
			localStorage.setItem('mp_compare', JSON.stringify(compare));
			isInCompare = !isInCompare;
			// Update badge
			document.querySelectorAll('[data-badge="compare"]').forEach((el: any) => {
				el.textContent = compare.length;
				el.style.display = compare.length > 0 ? 'flex' : 'none';
			});
		} catch (e) {}
	}
	
	async function addToCart(offer: any) {
		if (!offer.can_add_to_cart) return;
		
		const btn = document.getElementById(`cart-btn-${offer.id}`);
		if (!btn) return;
		
		btn.classList.add('loading');
		btn.innerHTML = '<span class="spinner"></span> Pridávam...';
		
		// Simulate API call - replace with actual cart endpoint
		await new Promise(r => setTimeout(r, 1000));
		
		btn.classList.remove('loading');
		btn.classList.add('success');
		btn.innerHTML = '✓ Pridané!';
		
		setTimeout(() => {
			btn.classList.remove('success');
			btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> Do košíka';
		}, 2500);
	}
</script>

<svelte:head>
	<title>{product?.title || 'Produkt'} | MegaPrice.sk</title>
	<meta name="description" content={product?.description?.slice(0, 160) || ''}>
</svelte:head>

<div class="mp-single-product">
	<div class="mp-container">
		<!-- Breadcrumb -->
		<nav class="mp-breadcrumb">
			<a href="/">Domov</a>
			<span class="mp-breadcrumb__sep">/</span>
			{#each ancestors as ancestor}
				<a href="/kategoria/{ancestor.slug}">{ancestor.name}</a>
				<span class="mp-breadcrumb__sep">/</span>
			{/each}
			{#if category}
				<a href="/kategoria/{category.slug}">{category.name}</a>
				<span class="mp-breadcrumb__sep">/</span>
			{/if}
			<span>{product?.title}</span>
		</nav>

		{#if product}
			<!-- Main Product Section -->
			<div class="mp-product-top">
				<!-- Gallery -->
				<div class="mp-gallery">
					{#if images.length > 1}
						<div class="mp-gallery__thumbs">
							{#each images as img, i}
								<button 
									class="mp-gallery__thumb" 
									class:active={i === currentImageIndex}
									on:click={() => changeImage(i)}
								>
									<img src={img} alt="Thumbnail {i + 1}">
								</button>
							{/each}
						</div>
					{/if}
					<div class="mp-gallery__main">
						<div class="mp-gallery__main-img">
							{#if images.length > 0}
								<img src={images[currentImageIndex]} alt={product.title}>
							{:else}
								<div class="mp-gallery__placeholder">📷</div>
							{/if}
						</div>
						{#if images.length > 1}
							<button class="mp-gallery__nav mp-gallery__nav--prev" on:click={prevImage}>❮</button>
							<button class="mp-gallery__nav mp-gallery__nav--next" on:click={nextImage}>❯</button>
						{/if}
					</div>
				</div>

				<!-- Product Info -->
				<div class="mp-product-info">
					{#if product.brand}
						<span class="mp-product-info__brand">{product.brand}</span>
					{/if}
					
					<h1 class="mp-product-info__title">{product.title}</h1>
					
					<div class="mp-product-info__meta">
						{#if product.ean}
							<span class="mp-product-info__ean">EAN: {product.ean}</span>
						{/if}
						{#if product.rating}
							<div class="mp-product-info__rating">
								<div class="mp-product-info__stars">
									{#each Array(5) as _, i}
										<span>{i < Math.round(product.rating) ? '⭐' : '☆'}</span>
									{/each}
								</div>
								<span>{product.rating.toFixed(1)}</span>
								{#if product.review_count}
									<span>({product.review_count} hodnotení)</span>
								{/if}
							</div>
						{/if}
					</div>
					
					{#if product.description}
						<div class="mp-product-desc">
							{@html product.description.slice(0, 300)}{product.description.length > 300 ? '...' : ''}
						</div>
					{/if}
					
					<!-- Action Buttons -->
					<div class="mp-product-actions">
						<button 
							class="mp-action-btn" 
							class:active={isInWishlist}
							on:click={toggleWishlist}
						>
							<svg viewBox="0 0 24 24" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2">
								<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
							</svg>
							{isInWishlist ? 'V obľúbených' : 'Pridať do obľúbených'}
						</button>
						<button 
							class="mp-action-btn"
							class:active={isInCompare}
							on:click={toggleCompare}
						>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<line x1="18" y1="20" x2="18" y2="10"/>
								<line x1="12" y1="20" x2="12" y2="4"/>
								<line x1="6" y1="20" x2="6" y2="14"/>
							</svg>
							{isInCompare ? 'V porovnaní' : 'Porovnať'}
						</button>
					</div>
				</div>

				<!-- Buy Box -->
				{#if bestOffer}
					<div class="mp-buybox">
						<div class="mp-buybox__header">
							<div class="mp-buybox__logo">
								{#if bestOffer.vendor_logo}
									<img src={bestOffer.vendor_logo} alt={bestOffer.vendor_name}>
								{:else}
									{bestOffer.vendor_name.slice(0, 2).toUpperCase()}
								{/if}
							</div>
							<div class="mp-buybox__vendor-info">
								<div class="mp-buybox__vendor-name">{bestOffer.vendor_name}</div>
								<div class="mp-buybox__vendor-rating">
									<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
									{bestOffer.vendor_rating.toFixed(1)} ({bestOffer.vendor_reviews})
								</div>
							</div>
						</div>
						
						<div class="mp-buybox__badges">
							<span class="mp-buybox__badge stock">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
								{bestOffer.stock_status === 'instock' ? 'Skladom' : 'Na objednávku'}
							</span>
							<span class="mp-buybox__badge">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
								{bestOffer.delivery_days} dni
							</span>
						</div>
						
						<div class="mp-buybox__price-row">
							<span class="mp-buybox__price">{formatPrice(bestOffer.price)}</span>
							<span class="mp-buybox__shipping" class:paid={bestOffer.shipping_price > 0}>
								{bestOffer.shipping_price > 0 ? `+ ${formatPrice(bestOffer.shipping_price)} doprava` : '✓ Doprava zdarma'}
							</span>
						</div>
						
						{#if bestOffer.can_add_to_cart}
							<button 
								class="mp-buybox__cta"
								id="cart-btn-{bestOffer.id}"
								on:click={() => addToCart(bestOffer)}
							>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<circle cx="9" cy="21" r="1"/>
									<circle cx="20" cy="21" r="1"/>
									<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
								</svg>
								Do košíka
							</button>
							<div class="mp-buybox__label">Predaj cez MegaBuy</div>
						{:else}
							<a 
								href={bestOffer.affiliate_url || '#'}
								class="mp-buybox__cta"
								target="_blank"
								rel="nofollow noopener"
							>
								Do obchodu
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
									<polyline points="15 3 21 3 21 9"/>
									<line x1="10" y1="14" x2="21" y2="3"/>
								</svg>
							</a>
						{/if}
						
						{#if offers.length > 1}
							<a href="#ponuky" class="mp-buybox__more">
								Zobraziť všetkých {offers.length} ponúk →
							</a>
						{/if}
					</div>
				{:else}
					<div class="mp-buybox mp-buybox--empty">
						<p>Momentálne nie sú dostupné žiadne ponuky.</p>
					</div>
				{/if}
			</div>

			<!-- Offers Section -->
			{#if offers.length > 0}
				<section class="mp-offers-section" id="ponuky">
					<div class="mp-offers-header">
						<h2>Porovnanie ponúk</h2>
						<span class="mp-offers-header__count">{offers.length} predajcov</span>
					</div>
					
					<div class="mp-offers-filters">
						<button 
							class="mp-offers-filter" 
							class:active={offerFilter === 'all'}
							on:click={() => offerFilter = 'all'}
						>
							Všetky
						</button>
						<button 
							class="mp-offers-filter"
							class:active={offerFilter === 'instock'}
							on:click={() => offerFilter = 'instock'}
						>
							Skladom
						</button>
					</div>
					
					<div class="mp-offers-list">
						{#each displayedOffers as offer, i}
							<div class="mp-offer-card" class:best={offer.is_best_price}>
								<div class="mp-offer-card__vendor">
									<div class="mp-offer-card__logo">
										{#if offer.vendor_logo}
											<img src={offer.vendor_logo} alt={offer.vendor_name}>
										{:else}
											{offer.vendor_name.slice(0, 2).toLowerCase()}
										{/if}
									</div>
									<div>
										<div class="mp-offer-card__vendor-name">{offer.vendor_name}</div>
										<div class="mp-offer-card__vendor-rating">
											<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
											{offer.vendor_rating.toFixed(1)} ({offer.vendor_reviews})
										</div>
									</div>
								</div>
								
								<div class="mp-offer-card__stock" class:in={offer.stock_status === 'instock'} class:out={offer.stock_status !== 'instock'}>
									{#if offer.stock_status === 'instock'}
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
										Skladom
									{:else}
										Na obj.
									{/if}
								</div>
								
								<div class="mp-offer-card__delivery">
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<rect x="1" y="3" width="15" height="13"/>
										<polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
										<circle cx="5.5" cy="18.5" r="2.5"/>
										<circle cx="18.5" cy="18.5" r="2.5"/>
									</svg>
									{offer.delivery_days} dni
								</div>
								
								<div class="mp-offer-card__price-col">
									<div class="mp-offer-card__price">{formatPrice(offer.price)}</div>
									{#if offer.shipping_price > 0}
										<div class="mp-offer-card__shipping paid">+ {formatPrice(offer.shipping_price)} doprava</div>
									{:else}
										<div class="mp-offer-card__shipping">Doprava zdarma</div>
									{/if}
								</div>
								
								<div class="mp-offer-card__cta">
									{#if offer.can_add_to_cart}
										<button 
											class="mp-offer-card__btn cart"
											id="cart-btn-{offer.id}"
											on:click={() => addToCart(offer)}
										>
											<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
												<circle cx="9" cy="21" r="1"/>
												<circle cx="20" cy="21" r="1"/>
												<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
											</svg>
											Do košíka
										</button>
										<span class="mp-offer-card__megabuy-label">Predaj cez MegaBuy</span>
									{:else}
										<a 
											href={offer.affiliate_url || '#'}
											class="mp-offer-card__btn affiliate"
											target="_blank"
											rel="nofollow noopener"
										>
											Do obchodu
											<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
												<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
												<polyline points="15 3 21 3 21 9"/>
												<line x1="10" y1="14" x2="21" y2="3"/>
											</svg>
										</a>
									{/if}
								</div>
							</div>
						{/each}
					</div>
					
					{#if filteredOffers.length > 5 && !showAllOffers}
						<button class="mp-offers-more" on:click={() => showAllOffers = true}>
							Zobraziť ďalších {filteredOffers.length - 5}
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<polyline points="6 9 12 15 18 9"/>
							</svg>
						</button>
					{/if}
				</section>
			{/if}

			<!-- Attributes -->
			{#if attributes.length > 0}
				<section class="mp-attributes">
					<h2>Parametre</h2>
					<div class="mp-attributes__grid">
						{#each attributes as attr}
							<div class="mp-attributes__item">
								<span class="mp-attributes__label">{attr.name}</span>
								<span class="mp-attributes__value">{attr.value}</span>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Full Description -->
			{#if product.description && product.description.length > 300}
				<section class="mp-description">
					<h2>Popis produktu</h2>
					<div class="mp-description__content">
						{@html product.description}
					</div>
				</section>
			{/if}
		{:else}
			<div class="mp-empty">
				<div class="mp-empty__icon">🔍</div>
				<h1 class="mp-empty__title">Produkt nenájdený</h1>
				<p class="mp-empty__text">Tento produkt neexistuje alebo bol odstránený.</p>
				<a href="/" class="mp-btn mp-btn--primary">Späť na hlavnú stránku</a>
			</div>
		{/if}
	</div>
</div>

<style>
	.mp-gallery__nav {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 36px;
		height: 36px;
		background: white;
		border: none;
		border-radius: 50%;
		box-shadow: 0 2px 8px rgba(0,0,0,0.15);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		z-index: 2;
	}
	
	.mp-gallery__nav:hover {
		background: var(--mp-primary);
		color: white;
	}
	
	.mp-gallery__nav--prev { left: 8px; }
	.mp-gallery__nav--next { right: 8px; }
	
	.mp-gallery__placeholder {
		font-size: 4rem;
		opacity: 0.3;
	}
	
	.mp-action-btn.active {
		border-color: var(--mp-primary);
		color: var(--mp-primary);
		background: rgba(255, 107, 53, 0.05);
	}
	
	.mp-offer-card.best {
		border: 2px solid var(--mp-primary);
		background: rgba(255, 107, 53, 0.02);
	}
	
	.mp-offers-more {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 100%;
		padding: 16px;
		margin-top: 16px;
		background: white;
		border: 1px solid var(--mp-border);
		border-radius: var(--mp-radius-lg);
		font-weight: 600;
		color: var(--mp-primary);
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.mp-offers-more:hover {
		border-color: var(--mp-primary);
		background: rgba(255, 107, 53, 0.05);
	}
	
	.mp-offers-more svg {
		width: 20px;
		height: 20px;
	}
	
	.mp-description {
		margin-top: var(--mp-space-8);
		background: white;
		border-radius: var(--mp-radius-xl);
		padding: var(--mp-space-6);
	}
	
	.mp-description h2 {
		font-size: var(--mp-font-size-xl);
		font-weight: 700;
		color: var(--mp-secondary);
		margin-bottom: var(--mp-space-4);
	}
	
	.mp-description__content {
		font-size: var(--mp-font-size-base);
		line-height: 1.7;
		color: var(--mp-text-secondary);
	}
	
	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255,255,255,0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		display: inline-block;
	}
	
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
	
	.mp-buybox__cta.loading {
		opacity: 0.7;
		pointer-events: none;
	}
	
	.mp-buybox__cta.success {
		background: linear-gradient(135deg, #10b981, #059669) !important;
	}
	
	.mp-offer-card__btn.loading {
		opacity: 0.7;
		pointer-events: none;
	}
	
	.mp-offer-card__btn.success {
		background: linear-gradient(135deg, #10b981, #059669) !important;
		color: white !important;
	}
</style>
