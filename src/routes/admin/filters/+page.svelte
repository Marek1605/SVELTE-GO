<script lang="ts">
	import { api } from '$lib/api';
	import { onMount } from 'svelte';
	
	let allAttributes: { name: string; count: number }[] = [];
	let selectedAttributes: string[] = [];
	let loading = true;
	let saving = false;
	let searchQuery = '';
	
	$: filteredAttributes = allAttributes.filter(a => 
		a.name.toLowerCase().includes(searchQuery.toLowerCase())
	);
	
	onMount(async () => {
		await loadData();
	});
	
	async function loadData() {
		loading = true;
		try {
			const [attrsRes, settingsRes] = await Promise.all([
				api.getAttributeStats(),
				api.getFilterSettings()
			]);
			
			if (attrsRes.success) allAttributes = attrsRes.data || [];
			if (settingsRes.success) selectedAttributes = settingsRes.data?.filterable_attributes || [];
		} catch (e) {
			console.error(e);
		}
		loading = false;
	}
	
	function toggleAttribute(name: string) {
		if (selectedAttributes.includes(name)) {
			selectedAttributes = selectedAttributes.filter(a => a !== name);
		} else {
			selectedAttributes = [...selectedAttributes, name];
		}
	}
	
	async function saveSettings() {
		saving = true;
		try {
			await api.updateFilterSettings({ filterable_attributes: selectedAttributes });
			alert('Nastavenia uložené!');
		} catch (e) {
			alert('Chyba pri ukladaní');
		}
		saving = false;
	}
	
	function selectTop(count: number) {
		selectedAttributes = allAttributes.slice(0, count).map(a => a.name);
	}
	
	function clearAll() {
		selectedAttributes = [];
	}
</script>

<svelte:head><title>Konfigurácia filtrov - Admin</title></svelte:head>

<div class="admin-header">
	<div>
		<h1 class="admin-title">Konfigurácia filtrov</h1>
		<p class="admin-subtitle">Vyberte atribúty, ktoré sa zobrazia ako filtre na kategóriách</p>
	</div>
	<button class="mp-btn mp-btn--primary" on:click={saveSettings} disabled={saving}>
		{saving ? '⏳ Ukladám...' : '💾 Uložiť nastavenia'}
	</button>
</div>

{#if loading}
	<div class="admin-table-wrapper" style="padding: 60px; text-align: center;">
		<div style="font-size: 2rem; margin-bottom: 16px;">⏳</div>
		<div>Načítavam atribúty...</div>
	</div>
{:else}
	<!-- Quick Actions -->
	<div class="admin-table-wrapper" style="margin-bottom: 24px;">
		<div style="padding: 16px; display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
			<input 
				type="text" 
				class="form-input" 
				placeholder="Hľadať atribúty..." 
				bind:value={searchQuery}
				style="max-width: 300px;"
			/>
			
			<div style="display: flex; gap: 8px; margin-left: auto;">
				<button class="mp-btn mp-btn--secondary" on:click={() => selectTop(10)}>Top 10</button>
				<button class="mp-btn mp-btn--secondary" on:click={() => selectTop(20)}>Top 20</button>
				<button class="mp-btn mp-btn--secondary" on:click={clearAll}>Zrušiť všetko</button>
			</div>
		</div>
	</div>
	
	<!-- Selected Count -->
	<div style="margin-bottom: 16px; padding: 12px 16px; background: var(--mp-primary-light); border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
		<span>Vybraných atribútov: <strong>{selectedAttributes.length}</strong></span>
		<span style="color: var(--mp-text-muted);">Celkom: {allAttributes.length} atribútov</span>
	</div>
	
	<!-- Attributes Grid -->
	<div class="admin-table-wrapper">
		<div style="padding: 16px; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">
			{#each filteredAttributes as attr}
				<button
					class="attr-item"
					class:attr-item--selected={selectedAttributes.includes(attr.name)}
					on:click={() => toggleAttribute(attr.name)}
				>
					<span class="attr-item__check">
						{selectedAttributes.includes(attr.name) ? '✓' : ''}
					</span>
					<span class="attr-item__name">{attr.name}</span>
					<span class="attr-item__count">{attr.count.toLocaleString()}×</span>
				</button>
			{:else}
				<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--mp-text-muted);">
					Žiadne atribúty nenájdené
				</div>
			{/each}
		</div>
	</div>
{/if}

<style>
	.attr-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		background: var(--mp-bg-light);
		border: 2px solid transparent;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.15s ease;
		text-align: left;
		width: 100%;
	}
	
	.attr-item:hover {
		background: var(--mp-bg-gray);
	}
	
	.attr-item--selected {
		background: var(--mp-primary-light);
		border-color: var(--mp-primary);
	}
	
	.attr-item__check {
		width: 24px;
		height: 24px;
		border: 2px solid var(--mp-border-medium);
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.875rem;
		font-weight: 700;
		flex-shrink: 0;
	}
	
	.attr-item--selected .attr-item__check {
		background: var(--mp-primary);
		border-color: var(--mp-primary);
		color: white;
	}
	
	.attr-item__name {
		flex: 1;
		font-weight: 500;
	}
	
	.attr-item__count {
		font-size: 0.8125rem;
		color: var(--mp-text-muted);
	}
</style>
