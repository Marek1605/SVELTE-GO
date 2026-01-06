<script lang="ts">
	import { formatPrice } from '$lib/api';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	
	export let data;
	
	$: category = data.category;
	$: ancestors = data.ancestors || [];
	$: children = data.children || [];
	$: products = data.products || [];
	$: brands = data.brands || [];
	$: totalProducts = data.total || 0;
	$: currentPage = data.page || 1;
	$: totalPages = data.total_pages || 1;
	
	// Filter states
	let minPrice = '';
	let maxPrice = '';
	let selectedBrand = '';
	let sort = 'newest';
	
	// Initialize from URL
	$: {
		const params = $page.url.searchParams;
		minPrice = params.get('min_price') || '';
		maxPrice = params.get('max_price') || '';
		selectedBrand = params.get('brand') || '';
		sort = params.get('sort') || 'newest';
	}
	
	function applyFilters() {
		const params = new URLSearchParams();
		if (minPrice) params.set('min_price', minPrice);
		if (maxPrice) params.set('max_price', maxPrice);
		if (selectedBrand) params.set('brand', selectedBrand);
		if (sort !== 'newest') params.set('sort', sort);
		
		const queryString = params.toString();
		goto(`/kategoria/${category.slug}${queryString ? '?' + queryString : ''}`, { replaceState: true });
	}
	
	function clearFilters() {
		minPrice = '';
		maxPrice = '';
		selectedBrand = '';
		sort = 'newest';
		goto(`/kategoria/${category.slug}`, { replaceState: true });
	}
	
	function changePage(newPage: number) {
		if (newPage < 1 || newPage > totalPages) return;
		
		const params = new URLSearchParams($page.url.searchParams);
		params.set('page', newPage.toString());
		goto(`/kategoria/${category.slug}?${params.toString()}`);
	}
</script>

<svelte:head>
	<title>{category?.name || 'Kategória'} | MegaPrice.sk</title>
	<meta name="description" content="Porovnajte ceny v kategórii {category?.name}. {totalProducts} produktov od najlepších predajcov.">
</svelte:head>

<div class="mp-category-page">
	<div class="mp-container">
		<!-- Breadcrumb -->
		<nav class="mp-breadcrumb">
			<a href="/">Domov</a>
			{#each ancestors as ancestor}
				<span class="mp-breadcrumb__sep">/</span>
				<a href="/kategoria/{ancestor.slug}">{ancestor.name}</a>
			{/each}
			<span class="mp-breadcrumb__sep">/</span>
			<span>{category?.name}</span>
		</nav>

		{#if category}
			<!-- Category Header -->
			<div class="mp-category-header">
				<h1>{category.name}</h1>
				<span class="mp-category-header__count">{totalProducts} produktov</span>
			</div>

			<!-- Subcategories (if any) -->
			{#if children.length > 0}
				<div class="mp-subcategories">
					<h2 class="mp-subcategories__title">Podkategórie</h2>
					<div class="mp-subcategories__grid">
						{#each children as child}
							<a href="/kategoria/{child.slug}" class="mp-subcategory-card">
								<span class="mp-subcategory-card__icon">{child.icon || '📦'}</span>
								<span class="mp-subcategory-card__name">{child.name}</span>
								<span class="mp-subcategory-card__count">{child.product_count} produktov</span>
							</a>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Main Content -->
			<div class="mp-category-layout">
				<!-- Filters Sidebar -->
				<aside class="mp-filters">
					<h3 class="mp-filters__title">Filtre</h3>
					
					<!-- Price Range -->
					<div class="mp-filter-group">
						<h4 class="mp-filter-group__title">Cena</h4>
						<div class="mp-price-range">
							<input 
								type="number" 
								placeholder="Od"
								bind:value={minPrice}
								on:change={applyFilters}
							>
							<span>–</span>
							<input 
								type="number" 
								placeholder="Do"
								bind:value={maxPrice}
								on:change={applyFilters}
							>
							<span>€</span>
						</div>
					</div>
					
					<!-- Brands -->
					{#if brands.length > 0}
						<div class="mp-filter-group">
							<h4 class="mp-filter-group__title">Značka</h4>
							<div class="mp-filter-group__items">
								{#each brands as brand}
									<label class="mp-filter-checkbox">
										<input 
											type="radio" 
											name="brand"
											value={brand.name}
											checked={selectedBrand === brand.name}
											on:change={() => { selectedBrand = brand.name; applyFilters(); }}
										>
										<span>{brand.name}</span>
										<span class="mp-filter-checkbox__count">({brand.count})</span>
									</label>
								{/each}
							</div>
						</div>
					{/if}
					
					<!-- Clear Filters -->
					<button class="mp-btn mp-btn--secondary" on:click={clearFilters}>
						Zrušiť filtre
					</button>
				</aside>

				<!-- Products -->
				<div class="mp-category-products">
					<!-- Toolbar -->
					<div class="mp-toolbar">
						<div class="mp-toolbar__count">
							Zobrazených {products.length} z {totalProducts}
						</div>
						<div class="mp-toolbar__sort">
							<label for="sort">Zoradiť:</label>
							<select id="sort" bind:value={sort} on:change={applyFilters}>
								<option value="newest">Najnovšie</option>
								<option value="price_asc">Najlacnejšie</option>
								<option value="price_desc">Najdrahšie</option>
								<option value="name_asc">Názov A-Z</option>
								<option value="name_desc">Názov Z-A</option>
							</select>
						</div>
					</div>

					<!-- Products Grid -->
					{#if products.length > 0}
						<div class="mp-products-grid">
							{#each products as product}
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

						<!-- Pagination -->
						{#if totalPages > 1}
							<nav class="mp-pagination">
								<button 
									class="mp-pagination__btn"
									disabled={currentPage <= 1}
									on:click={() => changePage(currentPage - 1)}
								>
									‹
								</button>
								
								{#each Array(Math.min(totalPages, 7)) as _, i}
									{@const pageNum = currentPage <= 4 ? i + 1 : currentPage + i - 3}
									{#if pageNum > 0 && pageNum <= totalPages}
										<button 
											class="mp-pagination__btn"
											class:active={pageNum === currentPage}
											on:click={() => changePage(pageNum)}
										>
											{pageNum}
										</button>
									{/if}
								{/each}
								
								<button 
									class="mp-pagination__btn"
									disabled={currentPage >= totalPages}
									on:click={() => changePage(currentPage + 1)}
								>
									›
								</button>
							</nav>
						{/if}
					{:else}
						<div class="mp-empty">
							<div class="mp-empty__icon">🔍</div>
							<h2 class="mp-empty__title">Žiadne produkty</h2>
							<p class="mp-empty__text">V tejto kategórii sme nenašli žiadne produkty.</p>
							<button class="mp-btn mp-btn--primary" on:click={clearFilters}>
								Zrušiť filtre
							</button>
						</div>
					{/if}
				</div>
			</div>
		{:else}
			<div class="mp-empty">
				<div class="mp-empty__icon">🔍</div>
				<h1 class="mp-empty__title">Kategória nenájdená</h1>
				<p class="mp-empty__text">Táto kategória neexistuje alebo bola zmazaná.</p>
				<a href="/" class="mp-btn mp-btn--primary">Späť na hlavnú stránku</a>
			</div>
		{/if}
	</div>
</div>

<style>
	.mp-subcategories {
		margin-bottom: var(--mp-space-6);
	}
	
	.mp-subcategories__title {
		font-size: var(--mp-font-size-lg);
		font-weight: 700;
		color: var(--mp-secondary);
		margin-bottom: var(--mp-space-4);
	}
	
	.mp-subcategories__grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: var(--mp-space-3);
	}
	
	.mp-subcategory-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: var(--mp-space-4);
		background: white;
		border-radius: var(--mp-radius-lg);
		box-shadow: var(--mp-shadow-sm);
		transition: all 0.2s;
		text-align: center;
	}
	
	.mp-subcategory-card:hover {
		box-shadow: var(--mp-shadow-md);
		transform: translateY(-2px);
	}
	
	.mp-subcategory-card__icon {
		font-size: 2rem;
		margin-bottom: var(--mp-space-2);
	}
	
	.mp-subcategory-card__name {
		font-weight: 600;
		color: var(--mp-text-primary);
		margin-bottom: var(--mp-space-1);
	}
	
	.mp-subcategory-card__count {
		font-size: var(--mp-font-size-xs);
		color: var(--mp-text-light);
	}
	
	.mp-category-products {
		flex: 1;
	}
	
	.mp-product-card__placeholder {
		font-size: 3rem;
		opacity: 0.3;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}
	
	.mp-toolbar__count {
		font-size: var(--mp-font-size-sm);
		color: var(--mp-text-light);
	}
</style>
