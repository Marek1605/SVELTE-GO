<script lang="ts">
	import { api } from '$lib/api';
	
	export let data;
	
	let feeds = data.feeds || [];
	let showModal = false;
	let editingFeed: any = null;
	let showImportModal = false;
	let importProgress: any = null;
	let previewLoading = false;
	let feedPreview: any = null;
	let previewError = '';
	let activeTab = 'fields';
	let progressInterval: any = null;
	
	const targetFields = [
		{ value: '', label: '-- Ignorovať --' },
		{ value: 'title', label: 'Názov produktu' },
		{ value: 'description', label: 'Popis' },
		{ value: 'price', label: 'Cena' },
		{ value: 'ean', label: 'EAN' },
		{ value: 'sku', label: 'SKU' },
		{ value: 'brand', label: 'Značka' },
		{ value: 'image_url', label: 'Obrázok' },
		{ value: 'url', label: 'URL produktu' },
		{ value: 'category', label: 'Kategória' },
	];
	
	let formData = {
		name: '',
		url: '',
		type: 'xml',
		schedule: 'daily',
		is_active: true,
		xml_item_path: 'SHOPITEM',
		field_mapping: {} as Record<string, string>
	};
	
	async function loadFeeds() {
		const res = await api.getFeeds();
		if (res.success) feeds = res.data || [];
	}
	
	function openAddModal() {
		editingFeed = null;
		formData = { name: '', url: '', type: 'xml', schedule: 'daily', is_active: true, xml_item_path: 'SHOPITEM', field_mapping: {} };
		feedPreview = null;
		previewError = '';
		showModal = true;
	}
	
	function openEditModal(feed: any) {
		editingFeed = feed;
		formData = { ...feed, field_mapping: feed.field_mapping || {} };
		feedPreview = null;
		previewError = '';
		showModal = true;
	}
	
	async function previewFeed() {
		if (!formData.url) { previewError = 'Zadajte URL feedu'; return; }
		previewLoading = true;
		previewError = '';
		try {
			const res = await api.previewFeed({ url: formData.url, type: formData.type, xml_item_path: formData.xml_item_path });
			if (res.success) feedPreview = res.data;
			else previewError = res.error || 'Nepodarilo sa načítať feed';
		} catch (e) {
			previewError = 'Chyba: ' + (e as Error).message;
		}
		previewLoading = false;
	}
	
	async function saveFeed() {
		const res = editingFeed ? await api.updateFeed(editingFeed.id, formData) : await api.createFeed(formData);
		if (res.success) { showModal = false; await loadFeeds(); }
		else alert(res.error || 'Chyba');
	}
	
	async function deleteFeed(id: string) {
		if (!confirm('Naozaj zmazať?')) return;
		await api.deleteFeed(id);
		await loadFeeds();
	}
	
	async function startImport(feed: any) {
		showImportModal = true;
		importProgress = { status: 'starting', percent: 0, message: 'Spúšťam...' };
		await api.startImport(feed.id);
		progressInterval = setInterval(async () => {
			const p = await api.getImportProgress(feed.id);
			if (p.success) {
				importProgress = p.data;
				if (p.data?.status === 'completed' || p.data?.status === 'error') {
					clearInterval(progressInterval);
					await loadFeeds();
				}
			}
		}, 1000);
	}
	
	function closeImportModal() {
		if (progressInterval) clearInterval(progressInterval);
		showImportModal = false;
	}
</script>

<svelte:head><title>Feed Import - Admin</title></svelte:head>

<div class="admin-header">
	<div>
		<h1 class="admin-title">Feed Import</h1>
		<p class="admin-subtitle">Správa produktových feedov</p>
	</div>
	<button class="mp-btn mp-btn--primary" on:click={openAddModal}>➕ Pridať feed</button>
</div>

<div class="admin-table-wrapper">
	<div class="admin-table-header">
		<h3 class="admin-table-title">Zoznam feedov ({feeds.length})</h3>
	</div>
	
	{#if feeds.length === 0}
		<div style="padding: 60px 20px; text-align: center; color: var(--mp-text-muted);">
			<div style="font-size: 3rem; margin-bottom: 16px;">📥</div>
			<div style="margin-bottom: 20px;">Zatiaľ nemáte žiadne feedy</div>
			<button class="mp-btn mp-btn--primary" on:click={openAddModal}>➕ Pridať feed</button>
		</div>
	{:else}
		<table class="admin-table">
			<thead><tr><th>Názov</th><th>URL</th><th>Typ</th><th>Produkty</th><th>Stav</th><th>Akcie</th></tr></thead>
			<tbody>
				{#each feeds as feed}
					<tr>
						<td><strong>{feed.name}</strong></td>
						<td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;">{feed.url}</td>
						<td><span class="status-badge status-badge--info">{feed.type?.toUpperCase()}</span></td>
						<td>{feed.product_count || 0}</td>
						<td><span class="status-badge" class:status-badge--success={feed.is_active} class:status-badge--warning={!feed.is_active}>{feed.is_active ? '● Aktívny' : '○ Neaktívny'}</span></td>
						<td>
							<div style="display: flex; gap: 8px;">
								<button class="mp-btn mp-btn--primary" style="padding: 6px 12px; font-size: 0.8125rem;" on:click={() => startImport(feed)}>▶️</button>
								<button class="mp-btn mp-btn--secondary" style="padding: 6px 12px; font-size: 0.8125rem;" on:click={() => openEditModal(feed)}>✏️</button>
								<button class="mp-btn mp-btn--secondary" style="padding: 6px 12px; font-size: 0.8125rem;" on:click={() => deleteFeed(feed.id)}>🗑️</button>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>

{#if showModal}
	<div class="modal-overlay" on:click|self={() => showModal = false}>
		<div class="modal" style="max-width: 900px;">
			<div class="modal__header">
				<h2 class="modal__title">{editingFeed ? 'Upraviť feed' : 'Nový feed'}</h2>
				<button class="modal__close" on:click={() => showModal = false}>✕</button>
			</div>
			<div class="modal__body">
				<div class="form-row">
					<div class="form-group"><label class="form-label">Názov</label><input class="form-input" bind:value={formData.name} /></div>
					<div class="form-group"><label class="form-label">Typ</label><select class="form-select" bind:value={formData.type}><option value="xml">XML</option><option value="csv">CSV</option><option value="json">JSON</option></select></div>
				</div>
				<div class="form-group"><label class="form-label">URL feedu</label><input class="form-input" bind:value={formData.url} /></div>
				{#if formData.type === 'xml'}
					<div class="form-row">
						<div class="form-group"><label class="form-label">XML Item Path</label><input class="form-input" bind:value={formData.xml_item_path} /></div>
						<div class="form-group"><label class="form-label">Plán</label><select class="form-select" bind:value={formData.schedule}><option value="hourly">Hodina</option><option value="daily">Denne</option><option value="weekly">Týždeň</option></select></div>
					</div>
				{/if}
				<div class="form-group"><label style="display: flex; gap: 8px; cursor: pointer;"><input type="checkbox" bind:checked={formData.is_active} /><span>Aktívny</span></label></div>
				
				<div style="margin: 20px 0; padding-top: 20px; border-top: 1px solid var(--mp-border-light);">
					<button class="mp-btn mp-btn--secondary" on:click={previewFeed} disabled={previewLoading}>{previewLoading ? '⏳ Načítavam...' : '👁️ Náhľad'}</button>
				</div>
				
				{#if previewError}<div style="padding: 16px; background: #fee2e2; color: #991b1b; border-radius: 8px;">⚠️ {previewError}</div>{/if}
				
				{#if feedPreview}
					<div class="tabs">
						<button class="tab" class:tab--active={activeTab === 'fields'} on:click={() => activeTab = 'fields'}>📋 Polia ({feedPreview.fields?.length || 0})</button>
						<button class="tab" class:tab--active={activeTab === 'mapping'} on:click={() => activeTab = 'mapping'}>🔗 Mapovanie</button>
						<button class="tab" class:tab--active={activeTab === 'sample'} on:click={() => activeTab = 'sample'}>📄 Ukážka ({feedPreview.total_items})</button>
					</div>
					
					{#if activeTab === 'fields'}
						<div style="display: flex; flex-wrap: wrap; gap: 8px;">{#each feedPreview.fields || [] as f}<span class="status-badge status-badge--info">{f}</span>{/each}</div>
					{/if}
					{#if activeTab === 'mapping'}
						<table class="admin-table"><thead><tr><th>Feed</th><th>Mapovať na</th></tr></thead><tbody>
							{#each feedPreview.fields || [] as f}<tr><td><code>{f}</code></td><td><select class="form-select" bind:value={formData.field_mapping[f]}>{#each targetFields as t}<option value={t.value}>{t.label}</option>{/each}</select></td></tr>{/each}
						</tbody></table>
					{/if}
					{#if activeTab === 'sample'}
						<div style="max-height: 300px; overflow: auto;">{#each feedPreview.sample || [] as item, i}<div style="padding: 12px; background: var(--mp-bg-light); border-radius: 8px; margin-bottom: 8px;"><strong>#{i+1}</strong><pre style="margin-top: 8px; white-space: pre-wrap; font-size: 0.75rem;">{JSON.stringify(item, null, 2)}</pre></div>{/each}</div>
					{/if}
				{/if}
			</div>
			<div class="modal__footer">
				<button class="mp-btn mp-btn--secondary" on:click={() => showModal = false}>Zrušiť</button>
				<button class="mp-btn mp-btn--primary" on:click={saveFeed}>{editingFeed ? 'Uložiť' : 'Vytvoriť'}</button>
			</div>
		</div>
	</div>
{/if}

{#if showImportModal}
	<div class="modal-overlay">
		<div class="modal" style="max-width: 500px;">
			<div class="modal__header"><h2 class="modal__title">Import</h2></div>
			<div class="modal__body">
				{#if importProgress}
					<div style="text-align: center; margin-bottom: 24px;">
						<div style="font-size: 3rem;">{importProgress.status === 'completed' ? '✅' : importProgress.status === 'error' ? '❌' : '⏳'}</div>
						<div style="font-size: 1.125rem; font-weight: 600;">{importProgress.message || 'Prebieha...'}</div>
						<div style="color: var(--mp-text-muted);">{importProgress.processed || 0} / {importProgress.total || 0}</div>
					</div>
					<div class="progress"><div class="progress__bar" style="width: {importProgress.percent || 0}%">{importProgress.percent || 0}%</div></div>
					{#if importProgress.status === 'completed'}
						<div style="margin-top: 20px; padding: 16px; background: var(--mp-bg-light); border-radius: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; text-align: center;">
							<div><div style="font-size: 1.5rem; font-weight: 700; color: var(--mp-success);">{importProgress.created || 0}</div><div style="font-size: 0.8125rem; color: var(--mp-text-muted);">Vytvorených</div></div>
							<div><div style="font-size: 1.5rem; font-weight: 700; color: var(--mp-primary);">{importProgress.updated || 0}</div><div style="font-size: 0.8125rem; color: var(--mp-text-muted);">Aktualizovaných</div></div>
						</div>
					{/if}
				{/if}
			</div>
			<div class="modal__footer">
				<button class="mp-btn mp-btn--primary" on:click={closeImportModal}>{importProgress?.status === 'completed' || importProgress?.status === 'error' ? 'Zavrieť' : 'Zrušiť'}</button>
			</div>
		</div>
	</div>
{/if}
