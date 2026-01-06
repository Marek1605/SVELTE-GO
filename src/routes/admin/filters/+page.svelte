<script lang="ts">
	import { api } from '$lib/api';
	import { onMount } from 'svelte';
	
	let attributes: any[] = [];
	let selectedAttributes: Set<string> = new Set();
	let loading = true;
	let saving = false;
	let searchQuery = '';
	
	onMount(async () => {
		await loadAttributes();
		await loadCurrentFilters();
	});
	
	async function loadAttributes() {
		loading = true;
		try {
			const res = await api.getAttributeStats();
			if (res.success) {
				attributes = res.data || [];
			}
		} catch (e) {
			console.error('Failed to load attributes:', e);
		}
		loading = false;
	}
	
	async function loadCurrentFilters() {
		try {
			const res = await api.getFilterSettings();
			if (res.success && res.data) {
				for (const filter of res.data) {
					selectedAttributes.add(filter.attribute_name);
				}
				selectedAttributes = selectedAttributes;
			}
		} catch (e) {
			console.error('Failed to load filters:', e);
		}
	}
	
	function toggleAttribute(name: string) {
		if (selectedAttributes.has(name)) {
			selectedAttributes.delete(name);
		} else {
			selectedAttributes.add(name);
		}
		selectedAttributes = selectedAttributes;
	}
	
	async function saveFilters() {
		saving = true;
		try {
			const filters = Array.from(selectedAttributes).map((name, index) => ({
				attribute_name: name,
				display_name: name,
				filter_type: 'checkbox',
				sort_order: index,
				is_active: true
			}));
			
			const res = await api.saveFilterSettings({ category_id: null, filters });
			if (res.success) {
				alert('Filtre boli uložené!');
			} else {
				alert('Chyba pri ukladaní: ' + (res.error || 'Neznáma chyba'));
			}
		} catch (e) {
			alert('Chyba: ' + (e as Error).message);
		}
		saving = false;
	}
	
	$: filteredAttributes = searchQuery 
		? attributes.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
		: attributes;
</script>

<svelte:head><title>Konfigurácia filtrov - Admin</title></svelte:head>

<div class="admin-header">
	<div>
		<h1 class="admin-title">Konfigurácia filtrov</h1>
		<p class="admin-subtitle">Vyberte atribúty, ktoré sa zobrazia ako filtre na kategóriách</p>
	</div>
	<button class="mp-btn mp-btn--primary" on:click={saveFilters} disabled={saving}>
		{saving ? '⏳ Ukladám...' : '💾 Uložiť filtre'}
	</button>
</div>

<div class="stats-bar">
	<div class="stat">
		<span class="stat__value">{selectedAttributes.size}</span>
		<span class="stat__label">Vybraných atribútov</span>
	</div>
	<div class="stat">
		<span class="stat__value">{attributes.length}</span>
		<span class="stat__label">Celkom atribútov</span>
	</div>
</div>

<div class="search-box">
	<input 
		type="text" 
		placeholder="🔍 Hľadať atribút..." 
		bind:value={searchQuery}
		class="form-input"
	/>
</div>

{#if loading}
	<div class="loading">
		<div class="loading-spinner"></div>
		<p>Načítavam atribúty...</p>
	</div>
{:else if attributes.length === 0}
	<div class="empty-state">
		<div class="empty-state__icon">🏷️</div>
		<h3>Žiadne atribúty</h3>
		<p>Najprv importujte produkty s atribútmi</p>
	</div>
{:else}
	<div class="attributes-grid">
		{#each filteredAttributes as attr}
			<div 
				class="attribute-card" 
				class:attribute-card--selected={selectedAttributes.has(attr.name)}
				on:click={() => toggleAttribute(attr.name)}
			>
				<div class="attribute-card__checkbox">
					{#if selectedAttributes.has(attr.name)}
						<span class="checkbox--checked">✓</span>
					{:else}
						<span class="checkbox--unchecked"></span>
					{/if}
				</div>
				<div class="attribute-card__content">
					<h4 class="attribute-card__name">{attr.name}</h4>
					<div class="attribute-card__stats">
						<span>{attr.product_count} produktov</span>
						<span>•</span>
						<span>{attr.value_count} hodnôt</span>
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}

<style>
	.stats-bar {
		display: flex;
		gap: 24px;
		margin-bottom: 24px;
	}
	.stat {
		background: white;
		padding: 16px 24px;
		border-radius: 12px;
		box-shadow: 0 1px 3px rgba(0,0,0,0.1);
	}
	.stat__value {
		display: block;
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--mp-primary);
	}
	.stat__label {
		font-size: 0.875rem;
		color: var(--mp-text-muted);
	}
	
	.search-box {
		margin-bottom: 24px;
	}
	.search-box .form-input {
		max-width: 400px;
		padding: 12px 16px;
		font-size: 1rem;
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
	
	.empty-state {
		text-align: center;
		padding: 60px 20px;
		background: white;
		border-radius: 12px;
	}
	.empty-state__icon { font-size: 3rem; margin-bottom: 16px; }
	.empty-state h3 { margin-bottom: 8px; }
	.empty-state p { color: var(--mp-text-muted); }
	
	.attributes-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 16px;
	}
	
	.attribute-card {
		display: flex;
		gap: 16px;
		padding: 16px;
		background: white;
		border: 2px solid var(--mp-border-light);
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s;
	}
	.attribute-card:hover {
		border-color: var(--mp-primary);
	}
	.attribute-card--selected {
		border-color: var(--mp-primary);
		background: #fff7ed;
	}
	
	.attribute-card__checkbox {
		flex-shrink: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.checkbox--checked {
		width: 24px;
		height: 24px;
		background: var(--mp-primary);
		color: white;
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
	}
	.checkbox--unchecked {
		width: 24px;
		height: 24px;
		border: 2px solid var(--mp-border-light);
		border-radius: 6px;
	}
	
	.attribute-card__content { flex: 1; }
	.attribute-card__name {
		font-size: 0.9375rem;
		font-weight: 600;
		margin-bottom: 4px;
	}
	.attribute-card__stats {
		display: flex;
		gap: 8px;
		font-size: 0.8125rem;
		color: var(--mp-text-muted);
	}
</style>
