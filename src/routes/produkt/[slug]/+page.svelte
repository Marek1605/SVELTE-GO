<script lang="ts">
	import { api } from '$lib/api';
	
	export let data;
	
	let product = data.product || null;
	let activeImage = 0;
	
	$: allImages = product ? [product.image_url, ...(product.images || [])].filter(Boolean) : [];
	
	function formatPrice(price: number) {
		return price.toFixed(2) + ' €';
	}
</script>

<svelte:head>
	<title>{product?.title || 'Produkt'} | MegaPrice</title>
	{#if product?.description}
		<meta name="description" content={product.description.substring(0, 160)} />
	{/if}
</svelte:head>

{#if !product}
	<div class="container">
		<div class="not-found">
			<h1>Produkt nenájdený</h1>
			<p>Tento produkt neexistuje alebo bol zmazaný.</p>
			<a href="/" class="mp-btn mp-btn--primary">Späť na hlavnú stránku</a>
		</div>
	</div>
{:else}
	<div class="product-page">
		<!-- Breadcrumb -->
		<div class="breadcrumb">
			<a href="/">Domov</a>
			<span class="breadcrumb__sep">/</span>
			<span class="breadcrumb__current">{product.title}</span>
		</div>
		
		<div class="product-layout">
			<!-- Gallery -->
			<div class="product-gallery">
				<div class="gallery-main">
					{#if allImages[activeImage]}
						<img src={allImages[activeImage]} alt={product.title} />
					{:else}
						<div class="no-image">📷</div>
					{/if}
				</div>
				
				{#if allImages.length > 1}
					<div class="gallery-thumbs">
						{#each allImages as img, i}
							<button 
								class="thumb" 
								class:thumb--active={i === activeImage}
								on:click={() => activeImage = i}
							>
								<img src={img} alt="" />
							</button>
						{/each}
					</div>
				{/if}
			</div>
			
			<!-- Info -->
			<div class="product-info">
				{#if product.brand}
					<p class="product-brand">{product.brand}</p>
				{/if}
				
				<h1 class="product-title">{product.title}</h1>
				
				{#if product.ean}
					<p class="product-ean">EAN: {product.ean}</p>
				{/if}
				
				<!-- Price Box -->
				<div class="price-box">
					{#if product.price_min > 0}
						<div class="price-main">
							<span class="price-label">Najnižšia cena:</span>
							<span class="price-value">{formatPrice(product.price_min)}</span>
						</div>
						{#if product.offer_count > 1}
							<p class="price-offers">Porovnať ceny z {product.offer_count} obchodov</p>
						{/if}
					{:else}
						<p class="price-unavailable">Produkt nie je momentálne dostupný</p>
					{/if}
				</div>
				
				<!-- CTA Button -->
				<button class="mp-btn mp-btn--primary mp-btn--lg">
					🛒 Porovnať ceny
				</button>
				
				<!-- Description -->
				{#if product.description}
					<div class="product-description">
						<h3>Popis produktu</h3>
						<div class="description-text">
							{@html product.description.replace(/&hellip;/g, '...').replace(/\n/g, '<br>')}
						</div>
					</div>
				{/if}
			</div>
		</div>
		
		<!-- Attributes -->
		{#if product.attributes?.length > 0}
			<div class="product-attributes">
				<h3>Parametre</h3>
				<div class="attributes-grid">
					{#each product.attributes as attr}
						<div class="attribute-row">
							<span class="attribute-name">{attr.name}</span>
							<span class="attribute-value">{attr.value}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
	
	.not-found {
		text-align: center;
		padding: 80px 20px;
	}
	.not-found h1 { font-size: 2rem; margin-bottom: 16px; }
	.not-found p { color: var(--mp-text-muted); margin-bottom: 24px; }
	
	.product-page { max-width: 1200px; margin: 0 auto; padding: 20px; }
	
	.breadcrumb {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.875rem;
		color: var(--mp-text-muted);
		margin-bottom: 24px;
		flex-wrap: wrap;
	}
	.breadcrumb a { color: var(--mp-primary); text-decoration: none; }
	.breadcrumb a:hover { text-decoration: underline; }
	.breadcrumb__sep { color: #cbd5e1; }
	.breadcrumb__current {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 300px;
	}
	
	.product-layout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 48px;
		margin-bottom: 48px;
	}
	
	@media (max-width: 900px) {
		.product-layout {
			grid-template-columns: 1fr;
			gap: 32px;
		}
	}
	
	.product-gallery {
		background: white;
		border-radius: 16px;
		padding: 24px;
		box-shadow: 0 1px 3px rgba(0,0,0,0.1);
	}
	
	.gallery-main {
		aspect-ratio: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f8fafc;
		border-radius: 12px;
		overflow: hidden;
		margin-bottom: 16px;
	}
	.gallery-main img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}
	.no-image {
		font-size: 5rem;
		color: #cbd5e1;
	}
	
	.gallery-thumbs {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}
	.thumb {
		width: 64px;
		height: 64px;
		padding: 4px;
		background: white;
		border: 2px solid var(--mp-border-light);
		border-radius: 8px;
		cursor: pointer;
		overflow: hidden;
		transition: border-color 0.2s;
	}
	.thumb:hover { border-color: var(--mp-primary); }
	.thumb--active { border-color: var(--mp-primary); }
	.thumb img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	
	.product-info {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	
	.product-brand {
		font-size: 0.875rem;
		color: var(--mp-primary);
		font-weight: 600;
		text-transform: uppercase;
	}
	
	.product-title {
		font-size: 1.75rem;
		font-weight: 700;
		line-height: 1.3;
	}
	
	.product-ean {
		font-size: 0.875rem;
		color: var(--mp-text-muted);
	}
	
	.price-box {
		background: #fff7ed;
		border: 2px solid var(--mp-primary);
		border-radius: 12px;
		padding: 20px;
		margin: 8px 0;
	}
	.price-main {
		display: flex;
		align-items: baseline;
		gap: 12px;
	}
	.price-label {
		font-size: 0.875rem;
		color: var(--mp-text-muted);
	}
	.price-value {
		font-size: 2rem;
		font-weight: 700;
		color: var(--mp-primary);
	}
	.price-offers {
		font-size: 0.875rem;
		color: var(--mp-text-muted);
		margin-top: 4px;
	}
	.price-unavailable {
		color: var(--mp-text-muted);
	}
	
	.mp-btn--lg {
		padding: 16px 32px;
		font-size: 1.125rem;
	}
	
	.product-description {
		margin-top: 16px;
	}
	.product-description h3 {
		font-size: 1.125rem;
		font-weight: 600;
		margin-bottom: 12px;
	}
	.description-text {
		font-size: 0.9375rem;
		line-height: 1.7;
		color: var(--mp-text-muted);
	}
	
	.product-attributes {
		background: white;
		border-radius: 16px;
		padding: 24px;
		box-shadow: 0 1px 3px rgba(0,0,0,0.1);
	}
	.product-attributes h3 {
		font-size: 1.125rem;
		font-weight: 600;
		margin-bottom: 20px;
	}
	
	.attributes-grid {
		display: grid;
		gap: 0;
	}
	.attribute-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		padding: 12px 0;
		border-bottom: 1px solid var(--mp-border-light);
	}
	.attribute-row:last-child {
		border-bottom: none;
	}
	.attribute-name {
		font-weight: 500;
		color: var(--mp-text-muted);
	}
	.attribute-value {
		font-weight: 500;
	}
</style>
