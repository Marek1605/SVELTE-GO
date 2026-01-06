<script lang="ts">
	import { formatPrice } from '$lib/api';
	
	export let data;
	
	let searchQuery = '';
	
	const defaultCategories = [
		{ name: 'Elektronika', slug: 'elektronika', icon: '📱', product_count: 12500 },
		{ name: 'Móda', slug: 'moda', icon: '👗', product_count: 8420 },
		{ name: 'Dom a záhrada', slug: 'dom-zahrada', icon: '🏠', product_count: 5680 },
		{ name: 'Šport', slug: 'sport', icon: '⚽', product_count: 3240 },
		{ name: 'Auto-moto', slug: 'auto-moto', icon: '🚗', product_count: 2890 },
		{ name: 'Zdravie a krása', slug: 'zdravie-krasa', icon: '💄', product_count: 4120 },
	];
	
	const defaultProducts = [
		{ id: '1', title: 'iPhone 15 Pro Max 256GB', slug: 'iphone-15-pro-max', brand: 'Apple', price_min: 1299, price_max: 1499, image_url: '', offer_count: 12 },
		{ id: '2', title: 'Samsung Galaxy S24 Ultra', slug: 'samsung-galaxy-s24-ultra', brand: 'Samsung', price_min: 1199, price_max: 1399, image_url: '', offer_count: 15 },
		{ id: '3', title: 'MacBook Air M3 13"', slug: 'macbook-air-m3', brand: 'Apple', price_min: 1099, price_max: 1299, image_url: '', offer_count: 8 },
		{ id: '4', title: 'Sony PlayStation 5', slug: 'playstation-5', brand: 'Sony', price_min: 499, price_max: 549, image_url: '', offer_count: 20 },
	];
	
	$: categories = data.categories?.length ? data.categories : defaultCategories;
	$: products = data.products?.length ? data.products : defaultProducts;
	$: stats = data.stats || { products: 125420, vendors: 520, categories: 1250 };
	
	function handleSearch(e: Event) {
		e.preventDefault();
		if (searchQuery.trim()) {
			window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
		}
	}
</script>

<svelte:head>
	<title>MegaPrice - Porovnávač cien | Najlepšie ceny na Slovensku</title>
	<meta name="description" content="Porovnajte ceny z viac ako 500 obchodov. Nájdite najlepšie ponuky na elektroniku, módu, dom a záhradu a ďalšie kategórie.">
</svelte:head>

<!-- Hero Section -->
<section class="mp-hero">
	<div class="mp-container mp-hero__inner">
		<h1 class="mp-hero__title">
			Porovnajte ceny z <span class="mp-hero__highlight">tisícov obchodov</span>
		</h1>
		<p class="mp-hero__subtitle">
			Nájdite najlepšie ceny na Slovensku. Ušetrite čas aj peniaze s MegaPrice.
		</p>
		<form class="mp-hero__search" on:submit={handleSearch}>
			<input 
				type="text" 
				placeholder="Čo hľadáte? Napr. iPhone, televízor, topánky..."
				bind:value={searchQuery}
			/>
			<button type="submit">🔍 Hľadať</button>
		</form>
	</div>
</section>

<!-- Stats Section -->
<section class="mp-stats">
	<div class="mp-stat">
		<div class="mp-stat__icon">📦</div>
		<div class="mp-stat__number">{stats.products?.toLocaleString() || '125,420'}</div>
		<div class="mp-stat__label">Produktov</div>
	</div>
	<div class="mp-stat">
		<div class="mp-stat__icon">🏪</div>
		<div class="mp-stat__number">{stats.vendors || '520'}+</div>
		<div class="mp-stat__label">Obchodov</div>
	</div>
	<div class="mp-stat">
		<div class="mp-stat__icon">📁</div>
		<div class="mp-stat__number">{stats.categories?.toLocaleString() || '1,250'}</div>
		<div class="mp-stat__label">Kategórií</div>
	</div>
	<div class="mp-stat">
		<div class="mp-stat__icon">👥</div>
		<div class="mp-stat__number">50,000+</div>
		<div class="mp-stat__label">Používateľov</div>
	</div>
</section>

<!-- Categories Section -->
<section class="mp-section">
	<div class="mp-container">
		<div class="mp-section__header">
			<div>
				<div class="mp-section__label">Preskúmajte</div>
				<h2 class="mp-section__title">Populárne kategórie</h2>
			</div>
			<a href="/kategorie" class="mp-section__link">
				Všetky kategórie →
			</a>
		</div>
		
		<div class="mp-categories-grid">
			{#each categories.slice(0, 6) as cat}
				<a href="/kategoria/{cat.slug}" class="mp-category-card">
					<div class="mp-category-card__icon">{cat.icon || '📦'}</div>
					<div class="mp-category-card__name">{cat.name}</div>
					<div class="mp-category-card__count">{(cat.product_count || 0).toLocaleString()} produktov</div>
				</a>
			{/each}
		</div>
	</div>
</section>

<!-- Featured Products Section -->
<section class="mp-section mp-section--gray">
	<div class="mp-container">
		<div class="mp-section__header">
			<div>
				<div class="mp-section__label">Odporúčame</div>
				<h2 class="mp-section__title">Najlepšie ponuky</h2>
			</div>
			<a href="/produkty" class="mp-section__link">
				Všetky produkty →
			</a>
		</div>
		
		<div class="mp-products-grid">
			{#each products.slice(0, 8) as product}
				<a href="/produkt/{product.slug}" class="mp-product-card">
					{#if product.price_max && product.price_min < product.price_max}
						<div class="mp-product-card__badge">
							-{Math.round((1 - product.price_min / product.price_max) * 100)}%
						</div>
					{/if}
					
					<div class="mp-product-card__image">
						{#if product.image_url}
							<img src={product.image_url} alt={product.title} />
						{:else}
							<span style="font-size: 3rem; opacity: 0.3;">📦</span>
						{/if}
					</div>
					
					<div class="mp-product-card__content">
						{#if product.brand}
							<div class="mp-product-card__brand">{product.brand}</div>
						{/if}
						<h3 class="mp-product-card__title">{product.title}</h3>
						
						<div class="mp-product-card__rating">
							<div class="mp-product-card__stars">
								{#each [1,2,3,4,5] as star}
									<span>{star <= 4 ? '⭐' : '☆'}</span>
								{/each}
							</div>
							<span class="mp-product-card__reviews">(24)</span>
						</div>
						
						<div class="mp-product-card__price">
							<span class="mp-product-card__price-current">
								{formatPrice(product.price_min)}
							</span>
							{#if product.price_max && product.price_min < product.price_max}
								<span class="mp-product-card__price-old">
									{formatPrice(product.price_max)}
								</span>
							{/if}
						</div>
						
						<div class="mp-product-card__offers">
							📊 {product.offer_count || 0} ponúk na porovnanie
						</div>
						
						<span class="mp-product-card__btn">
							Porovnať ceny
						</span>
					</div>
				</a>
			{/each}
		</div>
	</div>
</section>

<!-- How it works -->
<section class="mp-section">
	<div class="mp-container">
		<div style="text-align: center; margin-bottom: 40px;">
			<div class="mp-section__label">Jednoduché</div>
			<h2 class="mp-section__title">Ako to funguje</h2>
		</div>
		
		<div class="mp-steps">
			<div class="mp-step">
				<div class="mp-step__number">1</div>
				<div class="mp-step__icon">🔍</div>
				<div class="mp-step__title">Vyhľadajte produkt</div>
				<div class="mp-step__desc">Zadajte názov produktu alebo prechádzajte kategórie a nájdite to, čo hľadáte.</div>
			</div>
			<div class="mp-step">
				<div class="mp-step__number">2</div>
				<div class="mp-step__icon">📊</div>
				<div class="mp-step__title">Porovnajte ceny</div>
				<div class="mp-step__desc">Zobrazte si ponuky z rôznych obchodov a porovnajte ceny, dostupnosť aj hodnotenia.</div>
			</div>
			<div class="mp-step">
				<div class="mp-step__number">3</div>
				<div class="mp-step__icon">💰</div>
				<div class="mp-step__title">Ušetrite peniaze</div>
				<div class="mp-step__desc">Vyberte najlepšiu ponuku a nakúpte výhodne. V priemere ušetríte až 23%!</div>
			</div>
		</div>
	</div>
</section>

<!-- Newsletter -->
<section class="mp-section">
	<div class="mp-container">
		<div class="mp-newsletter">
			<h2 class="mp-newsletter__title">Nepremeškajte zľavy</h2>
			<p class="mp-newsletter__subtitle">Prihláste sa na odber a dostávajte najlepšie ponuky priamo do schránky</p>
			<form class="mp-newsletter__form">
				<input type="email" class="mp-newsletter__input" placeholder="Váš email" />
				<button type="submit" class="mp-newsletter__submit">Prihlásiť sa</button>
			</form>
		</div>
	</div>
</section>
