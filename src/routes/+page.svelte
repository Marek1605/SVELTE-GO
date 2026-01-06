<script lang="ts">
	import { formatPrice } from '$lib/api';
	
	export let data;
	
	$: categories = data.popularCategories || [];
	$: featuredProducts = data.featuredProducts || [];
	$: stats = data.stats || { products: 0, categories: 0, vendors: 0 };
	
	let searchQuery = '';
	
	function handleSearch(e: Event) {
		e.preventDefault();
		if (searchQuery.trim()) {
			window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
		}
	}
</script>

<svelte:head>
	<title>MegaPrice.sk - Porovnávač cien | Nájdite najlepšie ceny</title>
	<meta name="description" content="Porovnajte ceny z 500+ obchodov na jednom mieste. Nájdite najlepšie ponuky a ušetrite na elektronike, domácnosti, móde a ďalších kategóriách.">
</svelte:head>

<!-- Hero Section -->
<section class="mp-hero">
	<div class="mp-container">
		<div class="mp-hero__inner">
			<h1 class="mp-hero__title">
				Porovnajte ceny z <span class="mp-hero__highlight">500+ obchodov</span>
			</h1>
			<p class="mp-hero__subtitle">
				Nájdite najlepšie ponuky a ušetrite. Jeden vyhľadávač, všetky ceny.
			</p>
			<form class="mp-hero__search" on:submit={handleSearch}>
				<input 
					type="text" 
					placeholder="Čo hľadáte? (napr. iPhone 15, Samsung TV...)"
					bind:value={searchQuery}
				>
				<button type="submit">🔍 Hľadať</button>
			</form>
		</div>
	</div>
</section>

<!-- Stats -->
<section class="mp-section">
	<div class="mp-container">
		<div class="mp-stats">
			<div class="mp-stat">
				<div class="mp-stat__icon">📦</div>
				<div class="mp-stat__number">{stats.products?.toLocaleString() || '5 000'}+</div>
				<div class="mp-stat__label">Produktov</div>
			</div>
			<div class="mp-stat">
				<div class="mp-stat__icon">🏷️</div>
				<div class="mp-stat__number">{stats.categories || '500'}+</div>
				<div class="mp-stat__label">Kategórií</div>
			</div>
			<div class="mp-stat">
				<div class="mp-stat__icon">🏪</div>
				<div class="mp-stat__number">{stats.vendors || '500'}+</div>
				<div class="mp-stat__label">Obchodov</div>
			</div>
			<div class="mp-stat">
				<div class="mp-stat__icon">💰</div>
				<div class="mp-stat__number">24/7</div>
				<div class="mp-stat__label">Aktualizácie</div>
			</div>
		</div>
	</div>
</section>

<!-- Popular Categories -->
<section class="mp-section mp-section--gray">
	<div class="mp-container">
		<div class="mp-section__header">
			<div>
				<span class="mp-section__label">Preskúmajte</span>
				<h2 class="mp-section__title">Populárne kategórie</h2>
			</div>
			<a href="/kategorie" class="mp-section__link">Všetky kategórie →</a>
		</div>
		
		<div class="mp-categories-grid">
			{#each categories as cat}
				<a href="/kategoria/{cat.slug}" class="mp-category-card">
					<div class="mp-category-card__icon">{cat.icon || '📦'}</div>
					<span class="mp-category-card__name">{cat.name}</span>
					<span class="mp-category-card__count">{cat.product_count} produktov</span>
				</a>
			{/each}
		</div>
	</div>
</section>

<!-- Featured Products -->
{#if featuredProducts.length > 0}
	<section class="mp-section">
		<div class="mp-container">
			<div class="mp-section__header">
				<div>
					<span class="mp-section__label">Odporúčame</span>
					<h2 class="mp-section__title">Najobľúbenejšie produkty</h2>
				</div>
				<a href="/produkty" class="mp-section__link">Všetky produkty →</a>
			</div>
			
			<div class="mp-products-grid">
				{#each featuredProducts as product}
					<article class="mp-product-card">
						<a href="/produkt/{product.slug}" class="mp-product-card__image">
							{#if product.image_url}
								<img src={product.image_url} alt={product.title} loading="lazy">
							{:else}
								<div class="mp-product-card__placeholder">📷</div>
							{/if}
						</a>
						<div class="mp-product-card__content">
							{#if product.brand}
								<span class="mp-product-card__brand">{product.brand}</span>
							{/if}
							<h3 class="mp-product-card__title">
								<a href="/produkt/{product.slug}">{product.title}</a>
							</h3>
							<div class="mp-product-card__price-section">
								<span class="mp-product-card__price-label">od</span>
								<span class="mp-product-card__price">{formatPrice(product.price_min)}</span>
								{#if product.offer_count > 1}
									<div class="mp-product-card__offers">
										<span>📊</span>
										{product.offer_count} ponúk
									</div>
								{/if}
							</div>
							<a href="/produkt/{product.slug}" class="mp-product-card__btn">
								Porovnať ceny
							</a>
						</div>
					</article>
				{/each}
			</div>
		</div>
	</section>
{/if}

<!-- Why Choose Us -->
<section class="mp-section mp-section--gray">
	<div class="mp-container">
		<div class="mp-section__header">
			<div>
				<span class="mp-section__label">Prečo MegaPrice</span>
				<h2 class="mp-section__title">Vaše výhody</h2>
			</div>
		</div>
		
		<div class="mp-benefits-grid">
			<div class="mp-benefit-card">
				<div class="mp-benefit-card__icon">🔍</div>
				<h3 class="mp-benefit-card__title">Jednoduché porovnanie</h3>
				<p class="mp-benefit-card__text">Porovnajte ceny z stoviek obchodov na jednom mieste bez zbytočného klikania.</p>
			</div>
			<div class="mp-benefit-card">
				<div class="mp-benefit-card__icon">💰</div>
				<h3 class="mp-benefit-card__title">Najlepšie ceny</h3>
				<p class="mp-benefit-card__text">Garantujeme zobrazenie najnižších cien od overených predajcov.</p>
			</div>
			<div class="mp-benefit-card">
				<div class="mp-benefit-card__icon">⚡</div>
				<h3 class="mp-benefit-card__title">Aktuálne ponuky</h3>
				<p class="mp-benefit-card__text">Ceny aktualizujeme niekoľkokrát denne, aby ste nepremeškali žiadnu akciu.</p>
			</div>
			<div class="mp-benefit-card">
				<div class="mp-benefit-card__icon">✅</div>
				<h3 class="mp-benefit-card__title">Overené obchody</h3>
				<p class="mp-benefit-card__text">Spolupracujeme len s overenými a spoľahlivými e-shopmi.</p>
			</div>
		</div>
	</div>
</section>

<style>
	.mp-product-card__placeholder {
		font-size: 3rem;
		opacity: 0.3;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}
	
	.mp-benefits-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--mp-space-4);
	}
	
	@media (max-width: 991px) {
		.mp-benefits-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	
	@media (max-width: 600px) {
		.mp-benefits-grid {
			grid-template-columns: 1fr;
		}
	}
	
	.mp-benefit-card {
		background: white;
		border-radius: var(--mp-radius-xl);
		padding: var(--mp-space-6);
		text-align: center;
		box-shadow: var(--mp-shadow-sm);
		transition: all 0.2s;
	}
	
	.mp-benefit-card:hover {
		box-shadow: var(--mp-shadow-md);
		transform: translateY(-2px);
	}
	
	.mp-benefit-card__icon {
		font-size: 3rem;
		margin-bottom: var(--mp-space-3);
	}
	
	.mp-benefit-card__title {
		font-size: var(--mp-font-size-lg);
		font-weight: 700;
		color: var(--mp-secondary);
		margin-bottom: var(--mp-space-2);
	}
	
	.mp-benefit-card__text {
		font-size: var(--mp-font-size-sm);
		color: var(--mp-text-light);
		line-height: 1.6;
	}
</style>
