<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { api, formatPrice } from '$lib/api';
	
	export let data;
	
	let products = data.products || [];
	let total = data.total || 0;
	let currentPage = data.page || 1;
	let searchQuery = $page.url.searchParams.get('search') || '';
	let selectedIds: string[] = [];
	let selectAll = false;
	
	$: totalPages = Math.ceil(total / 20);
	
	async function search() {
		const params = new URLSearchParams();
		if (searchQuery) params.set('search', searchQuery);
		goto(`/admin/products?${params}`);
	}
	
	function goToPage(p: number) {
		const params = new URLSearchParams($page.url.searchParams);
		params.set('page', p.toString());
		goto(`/admin/products?${params}`);
	}
	
	function toggleSelectAll() {
		if (selectAll) {
			selectedIds = products.map((p: any) => p.id);
		} else {
			selectedIds = [];
		}
	}
	
	async function deleteSelected() {
		if (!selectedIds.length || !confirm(`Zmazať ${selectedIds.length} produktov?`)) return;
		await api.bulkDeleteProducts(selectedIds);
		selectedIds = [];
		selectAll = false;
		window.location.reload();
	}
	
	async function deleteProduct(id: string) {
		if (!confirm('Zmazať produkt?')) return;
		await api.deleteProduct(id);
		window.location.reload();
	}
</script>

<svelte:head><title>Produkty - Admin</title></svelte:head>

<div class="admin-header">
	<div>
		<h1 class="admin-title">Produkty</h1>
		<p class="admin-subtitle">Celkom {total.toLocaleString()} produktov</p>
	</div>
</div>

<!-- Filters -->
<div class="admin-table-wrapper" style="margin-bottom: 24px;">
	<div style="padding: 16px; display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
		<form on:submit|preventDefault={search} style="display: flex; flex: 1; max-width: 400px; gap: 8px;">
			<input type="text" class="form-input" placeholder="Hľadať produkty..." bind:value={searchQuery} />
			<button type="submit" class="mp-btn mp-btn--primary">🔍</button>
		</form>
		
		{#if selectedIds.length > 0}
			<button class="mp-btn mp-btn--secondary" style="background: #fee2e2; color: #991b1b;" on:click={deleteSelected}>
				🗑️ Zmazať vybrané ({selectedIds.length})
			</button>
		{/if}
	</div>
</div>

<!-- Products Table -->
<div class="admin-table-wrapper">
	<table class="admin-table">
		<thead>
			<tr>
				<th style="width: 40px;">
					<input type="checkbox" bind:checked={selectAll} on:change={toggleSelectAll} />
				</th>
				<th>Produkt</th>
				<th>Kategória</th>
				<th>Cena</th>
				<th>Ponuky</th>
				<th>Stav</th>
				<th>Akcie</th>
			</tr>
		</thead>
		<tbody>
			{#each products as product}
				<tr>
					<td>
						<input type="checkbox" bind:group={selectedIds} value={product.id} />
					</td>
					<td>
						<div style="display: flex; align-items: center; gap: 12px;">
							<div style="width: 48px; height: 48px; background: var(--mp-bg-light); border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
								{#if product.image_url}
									<img src={product.image_url} alt="" style="max-width: 100%; max-height: 100%;" />
								{:else}
									<span style="opacity: 0.3;">📦</span>
								{/if}
							</div>
							<div>
								<div style="font-weight: 600;">{product.title}</div>
								{#if product.brand}
									<div style="font-size: 0.8125rem; color: var(--mp-text-muted);">{product.brand}</div>
								{/if}
							</div>
						</div>
					</td>
					<td>{product.category_name || '-'}</td>
					<td>
						{#if product.price_min}
							<span style="font-weight: 600; color: var(--mp-danger);">{formatPrice(product.price_min)}</span>
						{:else}
							-
						{/if}
					</td>
					<td>{product.offer_count || 0}</td>
					<td>
						<span class="status-badge" class:status-badge--success={product.is_active} class:status-badge--warning={!product.is_active}>
							{product.is_active ? '● Aktívny' : '○ Neaktívny'}
						</span>
					</td>
					<td>
						<div style="display: flex; gap: 8px;">
							<a href="/produkt/{product.slug}" target="_blank" class="mp-btn mp-btn--secondary" style="padding: 6px 12px; font-size: 0.8125rem;">👁️</a>
							<button class="mp-btn mp-btn--secondary" style="padding: 6px 12px; font-size: 0.8125rem;" on:click={() => deleteProduct(product.id)}>🗑️</button>
						</div>
					</td>
				</tr>
			{:else}
				<tr>
					<td colspan="7" style="text-align: center; padding: 40px; color: var(--mp-text-muted);">
						Žiadne produkty
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
	
	<!-- Pagination -->
	{#if totalPages > 1}
		<div style="padding: 16px; display: flex; justify-content: center; gap: 8px; border-top: 1px solid var(--mp-border-light);">
			<button class="mp-btn mp-btn--secondary" disabled={currentPage <= 1} on:click={() => goToPage(currentPage - 1)}>←</button>
			
			{#each Array(Math.min(totalPages, 5)) as _, i}
				{@const p = currentPage <= 3 ? i + 1 : currentPage + i - 2}
				{#if p > 0 && p <= totalPages}
					<button 
						class="mp-btn" 
						class:mp-btn--primary={p === currentPage}
						class:mp-btn--secondary={p !== currentPage}
						on:click={() => goToPage(p)}
					>
						{p}
					</button>
				{/if}
			{/each}
			
			<button class="mp-btn mp-btn--secondary" disabled={currentPage >= totalPages} on:click={() => goToPage(currentPage + 1)}>→</button>
		</div>
	{/if}
</div>
