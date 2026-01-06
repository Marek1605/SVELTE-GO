<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { api } from '$lib/api';
	
	export let data;
	
	let category = data.category || null;
	let products = data.products?.items || [];
	let total = data.products?.total || 0;
	let currentPage = data.products?.page || 1;
	let totalPages = data.products?.pages || 1;
	let filters = data.filters || {};
	
	let loading = false;
	let selectedSort = 'newest';
	let selectedBrands: string[] = [];
	let priceMin = '';
	let priceMax = '';
	let selectedAttributes: Record<string, string[]> = {};
	
	const sortOptions = [
		{ value: 'newest', label: 'Najnovšie' },
		{ value: 'price_asc', label: 'Najlacnejšie' },
		{ value: 'price_desc', label: 'Najdrahšie' },
		{ value: 'title_asc', label: 'Názov A-Z' },
		{ value: 'popular', label: 'Najpopulárnejšie' },
	];
	
	async function loadProducts() {
		loading = true;
		
		const params = new URLSearchParams();
		params.set('page', currentPage.toString());
		params.set('sort', selectedSort);
		
		if (priceMin) params.set('min_price', priceMin);
		if (priceMax) params.set('max_price', priceMax);
		if (selectedBrands.length === 1) params.set('brand', selectedBrands[0]);
		
		// Build attributes filter
		const attrFilters: string[] = [];
		for (const [name, values] of Object.entries(selectedAttributes)) {
			for (const value of values) {
				attrFilters.push(`${name}:${value}`);
			}
		}
		if (attrFilters.length > 0) {
			params.set('attributes', attrFilters.join(','));
		}
		
		try {
			const res = await api.getCategory($page.params.slug, params.toString());
			if (res.success) {
				products = res.data.products.items;
				total = res.data.products.total;
				totalPages = res.data.products.pages;
			}
		} catch (e) {
			console.error('Failed to load products:', e);
		}
		
		loading = false;
	}
	
	function handleSort(event: Event) {
		selectedSort = (event.target as HTMLSelectElement).value;
		currentPage = 1;
		loadProducts();
	}
	
	function handleBrandToggle(brand: string) {
		if (selectedBrands.includes(brand)) {
			selectedBrands = selectedBrands.filter(b => b !== brand);
		} else {
			selectedBrands = [...selectedBrands, brand];
		}
		currentPage = 1;
		loadProducts();
	}
	
	function handleAttributeToggle(attrName: string, value: string) {
		if (!selectedAttributes[attrName]) {
			selectedAttributes[attrName] = [];
		}
		
		if (selectedAttributes[attrName].includes(value)) {
			selectedAttributes[attrName] = selectedAttributes[attrName].filter(v => v !== value);
			if (selectedAttributes[attrName].length === 0) {
				delete selectedAttributes[attrName];
			}
		} else {
			selectedAttributes[attrName] = [...selectedAttributes[attrName], value];
		}
		
		selectedAttributes = { ...selectedAttributes };
		currentPage = 1;
		loadProducts();
	}
	
	function handlePriceFilter() {
		currentPage = 1;
		loadProducts();
	}
	
	function clearFilters() {
		selectedBrands = [];
		selectedAttributes = {};
		priceMin = '';
		priceMax = '';
		currentPage = 1;
		loadProducts();
	}
	
	function goToPage(p: number) {
		if (p >= 1 && p <= totalPages) {
			currentPage = p;
			loadProducts();
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}
	
	$: hasActiveFilters = selectedBrands.length > 0 || Object.keys(selectedAttributes).length > 0 || priceMin || priceMax;
</script>

<svelte:head>
	<title>{category?.name || 'Kategória'} | MegaPrice</title>
</svelte:head>

{#if !category}
	<div class="container">
		<div class="not-found">
			<h1>Kategória nenájdená</h1>
			<p>Táto kategória neexistuje alebo bola zmazaná.</p>
			<a href="/" class="mp-btn mp-btn--primary">Späť na hlavnú stránku</a>
		</div>
	</div>
{:else}
	<div class="category-page">
		<!-- Breadcrumb -->
		<div class="breadcrumb">
			<a href="/">Domov</a>
			<span class="breadcrumb__sep">/</span>
			<span class="breadcrumb__current">{category.name}</span>
		</div>
		
		<!-- Header -->
		<div class="category-header">
			<h1 class="category-title">{category.name}</h1>
			<p class="category-count">{total} produktov</p>
		</div>
		
		<div class="category-layout">
			<!-- Filters Sidebar -->
			<aside class="filters-sidebar">
				<div class="filters-header">
					<h3>Filtre</h3>
					{#if hasActiveFilters}
						<button class="filters-clear" on:click={clearFilters}>Zrušiť všetky</button>
					{/if}
				</div>
				
				<!-- Price Filter -->
				{#if filters.price_range}
					<div class="filter-group">
						<h4 class="filter-title">Cena</h4>
						<div class="price-inputs">
							<input 
								type="number" 
								placeholder="Od" 
								bind:value={priceMin}
								on:change={handlePriceFilter}
								class="price-input"
							/>
							<span>–</span>
							<input 
								type="number" 
								placeholder="Do" 
								bind:value={priceMax}
								on:change={handlePriceFilter}
								class="price-input"
							/>
							<span>€</span>
						</div>
					</div>
				{/if}
				
				<!-- Brands Filter -->
				{#if filters.brands?.length > 0}
					<div class="filter-group">
						<h4 class="filter-title">Značka</h4>
						<div class="filter-options">
							{#each filters.brands.slice(0, 15) as brand}
								<label class="filter-option">
									<input 
										type="checkbox" 
										checked={selectedBrands.includes(brand.name)}
										on:change={() => handleBrandToggle(brand.name)}
									/>
									<span class="filter-option__label">{brand.name}</span>
									<span class="filter-option__count">({brand.count})</span>
								</label>
							{/each}
						</div>
					</div>
				{/if}
				
				<!-- Attribute Filters -->
				{#if filters.attributes?.length > 0}
					{#each filters.attributes.slice(0, 10) as attr}
						<div class="filter-group">
							<h4 class="filter-title">{attr.name}</h4>
							<div class="filter-options">
								{#each attr.values.slice(0, 10) as val}
									<label class="filter-option">
										<input 
											type="checkbox" 
											checked={selectedAttributes[attr.name]?.includes(val.value)}
											on:change={() => handleAttributeToggle(attr.name, val.value)}
										/>
										<span class="filter-option__label">{val.value}</span>
										<span class="filter-option__count">({val.count})</span>
									</label>
								{/each}
							</div>
						</div>
					{/each}
				{/if}
			</aside>
			
			<!-- Products Grid -->
			<main class="products-main">
				<!-- Sort Bar -->
				<div class="sort-bar">
					<div class="sort-bar__left">
						{#if hasActiveFilters}
							<span class="active-filters-count">{total} výsledkov</span>
						{/if}
					</div>
					<div class="sort-bar__right">
						<label class="sort-label">
							Zoradiť:
							<select class="sort-select" value={selectedSort} on:change={handleSort}>
								{#each sortOptions as opt}
									<option value={opt.value}>{opt.label}</option>
								{/each}
							</select>
						</label>
					</div>
				</div>
				
				<!-- Products -->
				{#if loading}
					<div class="loading">
						<div class="loading-spinner"></div>
						<p>Načítavam produkty...</p>
					</div>
				{:else if products.length === 0}
					<div class="no-products">
						<p>Žiadne produkty nenájdené</p>
						{#if hasActiveFilters}
							<button class="mp-btn mp-btn--secondary" on:click={clearFilters}>Zrušiť filtre</button>
						{/if}
					</div>
				{:else}
					<div class="products-grid">
						{#each products as product}
							<a href="/produkt/{product.slug}" class="product-card">
								<div class="product-card__image">
									{#if product.image_url}
										<img src={product.image_url} alt={product.title} loading="lazy" />
									{:else}
										<div class="product-card__no-image">📷</div>
									{/if}
								</div>
								<div class="product-card__content">
									<h3 class="product-card__title">{product.title}</h3>
									{#if product.brand}
										<p class="product-card__brand">{product.brand}</p>
									{/if}
									<div class="product-card__footer">
										<div class="product-card__price">
											{#if product.price_min > 0}
												<span class="price-value">{product.price_min.toFixed(2)} €</span>
												{#if product.offer_count > 1}
													<span class="price-offers">z {product.offer_count} obchodov</span>
												{/if}
											{:else}
												<span class="price-unavailable">Nedostupné</span>
											{/if}
										</div>
									</div>
								</div>
							</a>
						{/each}
					</div>
					
					<!-- Pagination -->
					{#if totalPages > 1}
						<div class="pagination">
							<button 
								class="pagination__btn" 
								disabled={currentPage === 1}
								on:click={() => goToPage(currentPage - 1)}
							>
								← Predošlá
							</button>
							
							<div class="pagination__pages">
								{#each Array(Math.min(totalPages, 7)) as _, i}
									{@const pageNum = totalPages <= 7 ? i + 1 : 
										currentPage <= 4 ? i + 1 :
										currentPage >= totalPages - 3 ? totalPages - 6 + i :
										currentPage - 3 + i}
									<button 
										class="pagination__page" 
										class:pagination__page--active={pageNum === currentPage}
										on:click={() => goToPage(pageNum)}
									>
										{pageNum}
									</button>
								{/each}
							</div>
							
							<button 
								class="pagination__btn" 
								disabled={currentPage === totalPages}
								on:click={() => goToPage(currentPage + 1)}
							>
								Ďalšia →
							</button>
						</div>
					{/if}
				{/if}
			</main>
		</div>
	</div>
{/if}

<style>
	.container { max-width: 1400px; margin: 0 auto; padding: 40px 20px; }
	
	.not-found {
		text-align: center;
		padding: 80px 20px;
	}
	.not-found h1 { font-size: 2rem; margin-bottom: 16px; }
	.not-found p { color: var(--mp-text-muted); margin-bottom: 24px; }
	
	.category-page { max-width: 1400px; margin: 0 auto; padding: 20px; }
	
	.breadcrumb {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.875rem;
		color: var(--mp-text-muted);
		margin-bottom: 20px;
	}
	.breadcrumb a { color: var(--mp-primary); text-decoration: none; }
	.breadcrumb a:hover { text-decoration: underline; }
	.breadcrumb__sep { color: #cbd5e1; }
	
	.category-header { margin-bottom: 24px; }
	.category-title { font-size: 1.75rem; font-weight: 700; margin-bottom: 4px; }
	.category-count { color: var(--mp-text-muted); }
	
	.category-layout {
		display: grid;
		grid-template-columns: 280px 1fr;
		gap: 32px;
	}
	
	@media (max-width: 1024px) {
		.category-layout { grid-template-columns: 1fr; }
		.filters-sidebar { display: none; }
	}
	
	.filters-sidebar {
		background: white;
		border-radius: 12px;
		padding: 20px;
		height: fit-content;
		position: sticky;
		top: 20px;
		box-shadow: 0 1px 3px rgba(0,0,0,0.1);
	}
	
	.filters-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		padding-bottom: 16px;
		border-bottom: 1px solid var(--mp-border-light);
	}
	.filters-header h3 { font-size: 1.125rem; font-weight: 600; }
	.filters-clear {
		background: none;
		border: none;
		color: var(--mp-primary);
		font-size: 0.875rem;
		cursor: pointer;
	}
	
	.filter-group {
		margin-bottom: 24px;
	}
	.filter-title {
		font-size: 0.9375rem;
		font-weight: 600;
		margin-bottom: 12px;
	}
	
	.price-inputs {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.price-input {
		width: 80px;
		padding: 8px 10px;
		border: 1px solid var(--mp-border-light);
		border-radius: 6px;
		font-size: 0.875rem;
	}
	
	.filter-options {
		display: flex;
		flex-direction: column;
		gap: 8px;
		max-height: 200px;
		overflow-y: auto;
	}
	
	.filter-option {
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
		font-size: 0.875rem;
	}
	.filter-option input {
		width: 16px;
		height: 16px;
		accent-color: var(--mp-primary);
	}
	.filter-option__count {
		color: var(--mp-text-muted);
		font-size: 0.8125rem;
	}
	
	.products-main { min-height: 400px; }
	
	.sort-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		padding: 12px 16px;
		background: white;
		border-radius: 8px;
		box-shadow: 0 1px 2px rgba(0,0,0,0.05);
	}
	
	.active-filters-count {
		font-size: 0.875rem;
		color: var(--mp-text-muted);
	}
	
	.sort-label {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.875rem;
	}
	.sort-select {
		padding: 8px 12px;
		border: 1px solid var(--mp-border-light);
		border-radius: 6px;
		font-size: 0.875rem;
		background: white;
		cursor: pointer;
	}
	
	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60px 20px;
		color: var(--mp-text-muted);
	}
	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 3px solid var(--mp-border-light);
		border-top-color: var(--mp-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 16px;
	}
	@keyframes spin { to { transform: rotate(360deg); } }
	
	.no-products {
		text-align: center;
		padding: 60px 20px;
		background: white;
		border-radius: 12px;
	}
	
	.products-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 20px;
	}
	
	.product-card {
		background: white;
		border-radius: 12px;
		overflow: hidden;
		text-decoration: none;
		color: inherit;
		box-shadow: 0 1px 3px rgba(0,0,0,0.1);
		transition: transform 0.2s, box-shadow 0.2s;
	}
	.product-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 25px rgba(0,0,0,0.15);
	}
	
	.product-card__image {
		aspect-ratio: 1;
		background: #f8fafc;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}
	.product-card__image img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		padding: 12px;
	}
	.product-card__no-image {
		font-size: 3rem;
		color: #cbd5e1;
	}
	
	.product-card__content {
		padding: 16px;
	}
	.product-card__title {
		font-size: 0.9375rem;
		font-weight: 500;
		line-height: 1.4;
		margin-bottom: 4px;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.product-card__brand {
		font-size: 0.8125rem;
		color: var(--mp-text-muted);
		margin-bottom: 12px;
	}
	
	.product-card__price {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.price-value {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--mp-primary);
	}
	.price-offers {
		font-size: 0.75rem;
		color: var(--mp-text-muted);
	}
	.price-unavailable {
		font-size: 0.875rem;
		color: var(--mp-text-muted);
	}
	
	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 8px;
		margin-top: 32px;
		padding: 20px;
	}
	
	.pagination__btn {
		padding: 10px 20px;
		background: white;
		border: 1px solid var(--mp-border-light);
		border-radius: 8px;
		cursor: pointer;
		font-size: 0.875rem;
		transition: all 0.2s;
	}
	.pagination__btn:hover:not(:disabled) {
		border-color: var(--mp-primary);
		color: var(--mp-primary);
	}
	.pagination__btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.pagination__pages {
		display: flex;
		gap: 4px;
	}
	.pagination__page {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: white;
		border: 1px solid var(--mp-border-light);
		border-radius: 8px;
		cursor: pointer;
		font-size: 0.875rem;
		transition: all 0.2s;
	}
	.pagination__page:hover {
		border-color: var(--mp-primary);
		color: var(--mp-primary);
	}
	.pagination__page--active {
		background: var(--mp-primary);
		border-color: var(--mp-primary);
		color: white;
	}
</style>
