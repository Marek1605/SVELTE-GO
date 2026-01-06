<script lang="ts">
	export let data;
	
	$: categoriesTree = data.categoriesTree || [];
	$: flatCategories = data.flatCategories || [];
	
	let viewMode: 'tree' | 'flat' = 'tree';
	let searchQuery = '';
	let expandedCategories: Set<string> = new Set();
	
	// Filter categories by search
	$: filteredFlat = searchQuery 
		? flatCategories.filter((cat: any) => 
			cat.name.toLowerCase().includes(searchQuery.toLowerCase())
		)
		: flatCategories;
	
	function toggleExpand(categoryId: string) {
		if (expandedCategories.has(categoryId)) {
			expandedCategories.delete(categoryId);
		} else {
			expandedCategories.add(categoryId);
		}
		expandedCategories = new Set(expandedCategories);
	}
	
	function getCategoryIcon(slug: string, name: string): string {
		const iconMap: Record<string, string> = {
			'elektronika': '📱', 'mobily': '📱', 'notebooky': '💻', 'pocitace': '🖥️',
			'flash-disk': '💾', 'ssd': '💿', 'routery': '📡', 'mysi': '🖱️',
			'kable': '🔌', 'hdmi': '🔌', 'krmivo': '🐕', 'mokre-krmivo': '🐕',
			'suche-krmivo': '🐈', 'lego': '🧱', 'hracky': '🧸', 'dom': '🏠',
			'zahrada': '🌳', 'moda': '👗', 'sport': '⚽', 'auto': '🚗',
			'zdravie': '💊', 'baterie': '🔋'
		};
		
		for (const [key, icon] of Object.entries(iconMap)) {
			if (slug.includes(key) || name.toLowerCase().includes(key)) return icon;
		}
		return '📦';
	}
</script>

<svelte:head>
	<title>Všetky kategórie | MegaPrice.sk</title>
	<meta name="description" content="Prehliadajte všetky kategórie produktov na MegaPrice.sk">
</svelte:head>

<div class="mp-categories-page">
	<div class="mp-container">
		<div class="mp-page-header">
			<h1>Všetky kategórie</h1>
			<p>{flatCategories.length} kategórií</p>
		</div>
		
		<!-- Controls -->
		<div class="mp-categories-controls">
			<div class="mp-search-box">
				<input 
					type="text" 
					placeholder="Hľadať kategóriu..."
					bind:value={searchQuery}
				>
				<span class="mp-search-icon">🔍</span>
			</div>
			<div class="mp-view-toggle">
				<button 
					class:active={viewMode === 'tree'} 
					on:click={() => viewMode = 'tree'}
				>
					🌳 Stromová
				</button>
				<button 
					class:active={viewMode === 'flat'} 
					on:click={() => viewMode = 'flat'}
				>
					📋 Zoznam
				</button>
			</div>
		</div>
		
		{#if viewMode === 'tree' && !searchQuery}
			<!-- Tree View -->
			<div class="mp-categories-tree">
				{#each categoriesTree as category}
					<div class="mp-tree-item">
						<div class="mp-tree-item__header">
							{#if category.children && category.children.length > 0}
								<button 
									class="mp-tree-item__toggle"
									class:expanded={expandedCategories.has(category.id)}
									on:click={() => toggleExpand(category.id)}
								>
									{expandedCategories.has(category.id) ? '▼' : '▶'}
								</button>
							{:else}
								<span class="mp-tree-item__spacer"></span>
							{/if}
							<a href="/kategoria/{category.slug}" class="mp-tree-item__link">
								<span class="mp-tree-item__icon">{category.icon || getCategoryIcon(category.slug, category.name)}</span>
								<span class="mp-tree-item__name">{category.name}</span>
								<span class="mp-tree-item__count">({category.product_count})</span>
							</a>
						</div>
						
						{#if category.children && category.children.length > 0 && expandedCategories.has(category.id)}
							<div class="mp-tree-item__children">
								{#each category.children as child}
									<div class="mp-tree-item mp-tree-item--child">
										<div class="mp-tree-item__header">
											{#if child.children && child.children.length > 0}
												<button 
													class="mp-tree-item__toggle"
													class:expanded={expandedCategories.has(child.id)}
													on:click={() => toggleExpand(child.id)}
												>
													{expandedCategories.has(child.id) ? '▼' : '▶'}
												</button>
											{:else}
												<span class="mp-tree-item__spacer"></span>
											{/if}
											<a href="/kategoria/{child.slug}" class="mp-tree-item__link">
												<span class="mp-tree-item__icon">{child.icon || getCategoryIcon(child.slug, child.name)}</span>
												<span class="mp-tree-item__name">{child.name}</span>
												<span class="mp-tree-item__count">({child.product_count})</span>
											</a>
										</div>
										
										{#if child.children && child.children.length > 0 && expandedCategories.has(child.id)}
											<div class="mp-tree-item__children">
												{#each child.children as grandchild}
													<div class="mp-tree-item mp-tree-item--grandchild">
														<a href="/kategoria/{grandchild.slug}" class="mp-tree-item__link">
															<span class="mp-tree-item__spacer"></span>
															<span class="mp-tree-item__icon">{grandchild.icon || '📦'}</span>
															<span class="mp-tree-item__name">{grandchild.name}</span>
															<span class="mp-tree-item__count">({grandchild.product_count})</span>
														</a>
													</div>
												{/each}
											</div>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{:else}
			<!-- Flat/Grid View -->
			<div class="mp-categories-grid-full">
				{#each filteredFlat as cat}
					<a href="/kategoria/{cat.slug}" class="mp-category-card-flat">
						<span class="mp-category-card-flat__icon">{cat.icon || getCategoryIcon(cat.slug, cat.name)}</span>
						<div class="mp-category-card-flat__info">
							<span class="mp-category-card-flat__name">{cat.name}</span>
							<span class="mp-category-card-flat__count">{cat.product_count} produktov</span>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.mp-categories-page {
		padding: var(--mp-space-6) 0;
	}
	
	.mp-page-header {
		margin-bottom: var(--mp-space-6);
	}
	
	.mp-page-header h1 {
		font-size: var(--mp-font-size-3xl);
		font-weight: 800;
		color: var(--mp-secondary);
		margin-bottom: var(--mp-space-1);
	}
	
	.mp-page-header p {
		color: var(--mp-text-light);
	}
	
	.mp-categories-controls {
		display: flex;
		gap: var(--mp-space-4);
		margin-bottom: var(--mp-space-6);
		flex-wrap: wrap;
	}
	
	.mp-search-box {
		flex: 1;
		min-width: 250px;
		position: relative;
	}
	
	.mp-search-box input {
		width: 100%;
		padding: 12px 16px 12px 44px;
		border: 1px solid var(--mp-border);
		border-radius: var(--mp-radius-lg);
		font-size: var(--mp-font-size-base);
	}
	
	.mp-search-box input:focus {
		outline: none;
		border-color: var(--mp-primary);
	}
	
	.mp-search-icon {
		position: absolute;
		left: 16px;
		top: 50%;
		transform: translateY(-50%);
	}
	
	.mp-view-toggle {
		display: flex;
		gap: 4px;
		background: var(--mp-bg-gray);
		padding: 4px;
		border-radius: var(--mp-radius-lg);
	}
	
	.mp-view-toggle button {
		padding: 8px 16px;
		border: none;
		border-radius: var(--mp-radius-md);
		background: transparent;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.mp-view-toggle button.active {
		background: white;
		box-shadow: var(--mp-shadow-sm);
	}
	
	/* Tree View */
	.mp-categories-tree {
		background: white;
		border-radius: var(--mp-radius-xl);
		padding: var(--mp-space-4);
	}
	
	.mp-tree-item {
		border-bottom: 1px solid var(--mp-border-light);
	}
	
	.mp-tree-item:last-child {
		border-bottom: none;
	}
	
	.mp-tree-item__header {
		display: flex;
		align-items: center;
		padding: var(--mp-space-2) 0;
	}
	
	.mp-tree-item__toggle {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		cursor: pointer;
		font-size: 10px;
		color: var(--mp-text-light);
	}
	
	.mp-tree-item__spacer {
		width: 24px;
	}
	
	.mp-tree-item__link {
		display: flex;
		align-items: center;
		gap: var(--mp-space-2);
		flex: 1;
		padding: var(--mp-space-2);
		border-radius: var(--mp-radius-md);
		transition: background 0.2s;
	}
	
	.mp-tree-item__link:hover {
		background: var(--mp-bg-gray);
	}
	
	.mp-tree-item__icon {
		font-size: 1.2em;
	}
	
	.mp-tree-item__name {
		font-weight: 500;
		color: var(--mp-text-primary);
	}
	
	.mp-tree-item__count {
		color: var(--mp-text-light);
		font-size: var(--mp-font-size-sm);
	}
	
	.mp-tree-item__children {
		padding-left: var(--mp-space-6);
	}
	
	.mp-tree-item--child .mp-tree-item__name {
		font-weight: 400;
	}
	
	.mp-tree-item--grandchild {
		border-bottom: none;
	}
	
	.mp-tree-item--grandchild .mp-tree-item__link {
		padding-left: var(--mp-space-6);
	}
	
	/* Flat Grid View */
	.mp-categories-grid-full {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--mp-space-3);
	}
	
	.mp-category-card-flat {
		display: flex;
		align-items: center;
		gap: var(--mp-space-3);
		padding: var(--mp-space-4);
		background: white;
		border-radius: var(--mp-radius-lg);
		box-shadow: var(--mp-shadow-sm);
		transition: all 0.2s;
	}
	
	.mp-category-card-flat:hover {
		box-shadow: var(--mp-shadow-md);
		transform: translateY(-2px);
	}
	
	.mp-category-card-flat__icon {
		font-size: 2rem;
	}
	
	.mp-category-card-flat__info {
		display: flex;
		flex-direction: column;
	}
	
	.mp-category-card-flat__name {
		font-weight: 600;
		color: var(--mp-text-primary);
	}
	
	.mp-category-card-flat__count {
		font-size: var(--mp-font-size-sm);
		color: var(--mp-text-light);
	}
</style>
