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
	let activeTab = 'info';
	let progressInterval: any = null;
	
	// Automatické mapovanie pre Heureka XML feed
	const autoMappedFields: Record<string, string> = {
		'PRODUCT_ID': 'Externé ID produktu',
		'ITEM_ID': 'ID položky',
		'PRODUCT': 'Názov (krátky)',
		'PRODUCTNAME': 'Názov produktu ✓',
		'DESCRIPTION': 'Popis ✓',
		'PRICE_VAT': 'Cena s DPH ✓',
		'IMGURL': 'Hlavný obrázok ✓',
		'IMGURL_ALTERNATIVE': 'Alternatívne obrázky ✓ (automaticky)',
		'URL': 'URL produktu ✓',
		'EAN': 'EAN kód ✓',
		'MANUFACTURER': 'Výrobca/Značka ✓',
		'CATEGORYTEXT': 'Kategória ✓ (automaticky vytvorí)',
		'ITEM_TYPE': 'Typ (new/used)',
		'DELIVERY_DATE': 'Dodacia lehota',
		'DELIVERY': 'Doprava (ignorované)',
		'DELIVERY_ID': 'ID dopravy',
		'DELIVERY_PRICE': 'Cena dopravy',
		'DELIVERY_PRICE_COD': 'Cena dobierky',
		'PARAM': 'Atribút ✓ (automaticky všetky)',
		'PARAM_NAME': 'Názov atribútu',
		'VAL': 'Hodnota atribútu',
	};
	
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
		activeTab = 'info';
		showModal = true;
	}
	
	function openEditModal(feed: any) {
		editingFeed = feed;
		formData = { ...feed, field_mapping: feed.field_mapping || {} };
		feedPreview = null;
		previewError = '';
		activeTab = 'info';
		showModal = true;
	}
	
	async function previewFeed() {
		if (!formData.url) { previewError = 'Zadajte URL feedu'; return; }
		previewLoading = true;
		previewError = '';
		try {
			const res = await api.previewFeed({ url: formData.url, type: formData.type, xml_item_path: formData.xml_item_path });
			if (res.success) {
				feedPreview = res.data;
				activeTab = 'fields';
			}
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
		if (!confirm('Naozaj zmazať tento feed?')) return;
		await api.deleteFeed(id);
		await loadFeeds();
	}
	
	async function startImport(feed: any) {
		showImportModal = true;
		importProgress = { status: 'starting', percent: 0, message: 'Spúšťam...', logs: [] };
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
	
	function getFieldDescription(field: string): string {
		return autoMappedFields[field] || 'Neznáme pole';
	}
	
	function isAutoMapped(field: string): boolean {
		const auto = ['PRODUCTNAME', 'PRODUCT', 'DESCRIPTION', 'PRICE_VAT', 'IMGURL', 'IMGURL_ALTERNATIVE', 'URL', 'EAN', 'MANUFACTURER', 'CATEGORYTEXT', 'PARAM', 'PARAM_NAME', 'VAL', 'PRODUCT_ID', 'ITEM_ID'];
		return auto.includes(field);
	}
</script>

<svelte:head><title>Feed Import - Admin</title></svelte:head>

<div class="admin-header">
	<div>
		<h1 class="admin-title">Feed Import</h1>
		<p class="admin-subtitle">Správa produktových feedov (Heureka XML, CSV, JSON)</p>
	</div>
	<button class="mp-btn mp-btn--primary" on:click={openAddModal}>➕ Pridať feed</button>
</div>

<!-- Info box -->
<div class="info-box">
	<div class="info-box__icon">💡</div>
	<div class="info-box__content">
		<strong>Automatický import</strong>
		<p>Import automaticky spracováva štandardné Heureka XML feedy vrátane všetkých obrázkov (IMGURL_ALTERNATIVE) a atribútov (PARAM/VAL). Kategórie sa vytvárajú automaticky.</p>
	</div>
</div>

<div class="admin-table-wrapper">
	<div class="admin-table-header">
		<h3 class="admin-table-title">Zoznam feedov ({feeds.length})</h3>
	</div>
	
	{#if feeds.length === 0}
		<div class="empty-state">
			<div class="empty-state__icon">📥</div>
			<div class="empty-state__text">Zatiaľ nemáte žiadne feedy</div>
			<button class="mp-btn mp-btn--primary" on:click={openAddModal}>➕ Pridať feed</button>
		</div>
	{:else}
		<table class="admin-table">
			<thead>
				<tr>
					<th>Názov</th>
					<th>URL</th>
					<th>Typ</th>
					<th>Produkty</th>
					<th>Posledný import</th>
					<th>Stav</th>
					<th>Akcie</th>
				</tr>
			</thead>
			<tbody>
				{#each feeds as feed}
					<tr>
						<td><strong>{feed.name}</strong></td>
						<td class="url-cell" title={feed.url}>{feed.url}</td>
						<td><span class="status-badge status-badge--info">{feed.type?.toUpperCase()}</span></td>
						<td><strong>{feed.product_count || 0}</strong></td>
						<td>{feed.last_import ? new Date(feed.last_import).toLocaleString('sk') : '—'}</td>
						<td>
							<span class="status-badge" class:status-badge--success={feed.is_active} class:status-badge--warning={!feed.is_active}>
								{feed.is_active ? '● Aktívny' : '○ Neaktívny'}
							</span>
						</td>
						<td>
							<div class="action-buttons">
								<button class="mp-btn mp-btn--success mp-btn--sm" on:click={() => startImport(feed)} title="Spustiť import">▶️ Import</button>
								<button class="mp-btn mp-btn--secondary mp-btn--sm" on:click={() => openEditModal(feed)} title="Upraviť">✏️</button>
								<button class="mp-btn mp-btn--danger mp-btn--sm" on:click={() => deleteFeed(feed.id)} title="Zmazať">🗑️</button>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>

<!-- Add/Edit Modal -->
{#if showModal}
	<div class="modal-overlay" on:click|self={() => showModal = false}>
		<div class="modal modal--large">
			<div class="modal__header">
				<h2 class="modal__title">{editingFeed ? 'Upraviť feed' : 'Nový feed'}</h2>
				<button class="modal__close" on:click={() => showModal = false}>✕</button>
			</div>
			<div class="modal__body">
				<!-- Basic info -->
				<div class="form-section">
					<h3 class="form-section__title">Základné informácie</h3>
					<div class="form-row">
						<div class="form-group">
							<label class="form-label">Názov feedu</label>
							<input class="form-input" bind:value={formData.name} placeholder="napr. MegaBuy Heureka" />
						</div>
						<div class="form-group">
							<label class="form-label">Typ feedu</label>
							<select class="form-select" bind:value={formData.type}>
								<option value="xml">XML (Heureka)</option>
								<option value="csv">CSV</option>
								<option value="json">JSON</option>
							</select>
						</div>
					</div>
					<div class="form-group">
						<label class="form-label">URL feedu</label>
						<input class="form-input" bind:value={formData.url} placeholder="https://example.sk/xml/heureka" />
					</div>
					{#if formData.type === 'xml'}
						<div class="form-row">
							<div class="form-group">
								<label class="form-label">XML Item Path</label>
								<input class="form-input" bind:value={formData.xml_item_path} placeholder="SHOPITEM" />
								<small class="form-hint">Element obsahujúci jeden produkt (štandard: SHOPITEM)</small>
							</div>
							<div class="form-group">
								<label class="form-label">Automatický import</label>
								<select class="form-select" bind:value={formData.schedule}>
									<option value="manual">Manuálne</option>
									<option value="hourly">Každú hodinu</option>
									<option value="daily">Denne</option>
									<option value="weekly">Týždenne</option>
								</select>
							</div>
						</div>
					{/if}
					<div class="form-group">
						<label class="checkbox-label">
							<input type="checkbox" bind:checked={formData.is_active} />
							<span>Feed je aktívny</span>
						</label>
					</div>
				</div>
				
				<!-- Preview button -->
				<div class="preview-section">
					<button class="mp-btn mp-btn--secondary mp-btn--lg" on:click={previewFeed} disabled={previewLoading || !formData.url}>
						{previewLoading ? '⏳ Načítavam feed...' : '👁️ Načítať náhľad feedu'}
					</button>
					{#if !formData.url}
						<small class="form-hint">Zadajte URL feedu pre náhľad</small>
					{/if}
				</div>
				
				{#if previewError}
					<div class="alert alert--error">⚠️ {previewError}</div>
				{/if}
				
				<!-- Preview tabs -->
				{#if feedPreview}
					<div class="tabs">
						<button class="tab" class:tab--active={activeTab === 'info'} on:click={() => activeTab = 'info'}>
							ℹ️ Info
						</button>
						<button class="tab" class:tab--active={activeTab === 'fields'} on:click={() => activeTab = 'fields'}>
							📋 Polia ({feedPreview.fields?.length || 0})
						</button>
						<button class="tab" class:tab--active={activeTab === 'attributes'} on:click={() => activeTab = 'attributes'}>
							🏷️ Atribúty ({feedPreview.attributes?.length || 0})
						</button>
						<button class="tab" class:tab--active={activeTab === 'sample'} on:click={() => activeTab = 'sample'}>
							📄 Ukážka
						</button>
					</div>
					
					<div class="tab-content">
						{#if activeTab === 'info'}
							<div class="info-grid">
								<div class="info-card">
									<div class="info-card__value">{feedPreview.total_items}+</div>
									<div class="info-card__label">Produktov vo feede</div>
								</div>
								<div class="info-card">
									<div class="info-card__value">{feedPreview.fields?.length || 0}</div>
									<div class="info-card__label">Polí</div>
								</div>
								<div class="info-card">
									<div class="info-card__value">{feedPreview.attributes?.length || 0}</div>
									<div class="info-card__label">Typov atribútov</div>
								</div>
							</div>
							
							<div class="auto-import-info">
								<h4>✅ Automaticky sa importuje:</h4>
								<ul>
									<li><strong>Produkty</strong> - názov, popis, cena, EAN, značka</li>
									<li><strong>Obrázky</strong> - hlavný + všetky alternatívne</li>
									<li><strong>Kategórie</strong> - automaticky vytvorené z CATEGORYTEXT</li>
									<li><strong>Atribúty</strong> - všetky PARAM/VAL páry pre filtrovanie</li>
								</ul>
							</div>
						{/if}
						
						{#if activeTab === 'fields'}
							<div class="fields-grid">
								{#each feedPreview.fields || [] as field}
									<div class="field-item" class:field-item--auto={isAutoMapped(field)}>
										<code class="field-item__name">{field}</code>
										<span class="field-item__desc">{getFieldDescription(field)}</span>
									</div>
								{/each}
							</div>
							<div class="legend">
								<span class="legend__item"><span class="legend__color legend__color--auto"></span> Automaticky mapované</span>
								<span class="legend__item"><span class="legend__color legend__color--ignore"></span> Ignorované</span>
							</div>
						{/if}
						
						{#if activeTab === 'attributes'}
							{#if feedPreview.attributes?.length > 0}
								<div class="attributes-list">
									{#each feedPreview.attributes as attr}
										<div class="attribute-item">
											<span class="attribute-item__name">{attr.name}</span>
											<span class="attribute-item__count">{attr.count}x</span>
										</div>
									{/each}
								</div>
								<p class="form-hint">Všetky tieto atribúty sa automaticky importujú a môžu byť použité pre filtrovanie produktov.</p>
							{:else}
								<p class="empty-hint">Žiadne atribúty nenájdené v náhľade</p>
							{/if}
						{/if}
						
						{#if activeTab === 'sample'}
							<div class="sample-list">
								{#each feedPreview.sample || [] as item, i}
									<details class="sample-item">
										<summary class="sample-item__header">
											<strong>#{i+1}</strong> {item.PRODUCTNAME || item.PRODUCT || 'Produkt'}
											{#if item.PRICE_VAT}<span class="sample-item__price">{item.PRICE_VAT} €</span>{/if}
										</summary>
										<pre class="sample-item__code">{JSON.stringify(item, null, 2)}</pre>
									</details>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			</div>
			<div class="modal__footer">
				<button class="mp-btn mp-btn--secondary" on:click={() => showModal = false}>Zrušiť</button>
				<button class="mp-btn mp-btn--primary" on:click={saveFeed} disabled={!formData.name || !formData.url}>
					{editingFeed ? 'Uložiť zmeny' : 'Vytvoriť feed'}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Import Progress Modal -->
{#if showImportModal}
	<div class="modal-overlay">
		<div class="modal modal--medium">
			<div class="modal__header">
				<h2 class="modal__title">Import feedu</h2>
			</div>
			<div class="modal__body">
				{#if importProgress}
					<div class="import-status">
						<div class="import-status__icon">
							{#if importProgress.status === 'completed'}✅
							{:else if importProgress.status === 'error'}❌
							{:else}⏳{/if}
						</div>
						<div class="import-status__message">{importProgress.message || 'Prebieha...'}</div>
						<div class="import-status__count">{importProgress.processed || 0} / {importProgress.total || 0}</div>
					</div>
					
					<div class="progress">
						<div class="progress__bar" style="width: {importProgress.percent || 0}%">
							{importProgress.percent || 0}%
						</div>
					</div>
					
					{#if importProgress.status === 'completed' || importProgress.status === 'error'}
						<div class="import-results">
							<div class="import-result">
								<div class="import-result__value import-result__value--success">{importProgress.created || 0}</div>
								<div class="import-result__label">Vytvorených</div>
							</div>
							<div class="import-result">
								<div class="import-result__value import-result__value--info">{importProgress.updated || 0}</div>
								<div class="import-result__label">Aktualizovaných</div>
							</div>
							<div class="import-result">
								<div class="import-result__value import-result__value--error">{importProgress.errors || 0}</div>
								<div class="import-result__label">Chýb</div>
							</div>
						</div>
					{/if}
					
					{#if importProgress.logs?.length > 0}
						<details class="import-logs">
							<summary>📋 Logy ({importProgress.logs.length})</summary>
							<div class="import-logs__content">
								{#each importProgress.logs.slice(-10) as log}
									<div class="import-logs__line">{log}</div>
								{/each}
							</div>
						</details>
					{/if}
				{/if}
			</div>
			<div class="modal__footer">
				<button class="mp-btn mp-btn--primary" on:click={closeImportModal}>
					{importProgress?.status === 'completed' || importProgress?.status === 'error' ? 'Zavrieť' : 'Skryť'}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.info-box {
		display: flex;
		gap: 16px;
		padding: 16px 20px;
		background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%);
		border: 1px solid #7dd3fc;
		border-radius: 12px;
		margin-bottom: 24px;
	}
	.info-box__icon { font-size: 1.5rem; }
	.info-box__content p { margin: 4px 0 0; color: #0369a1; font-size: 0.875rem; }
	
	.empty-state {
		padding: 60px 20px;
		text-align: center;
		color: var(--mp-text-muted);
	}
	.empty-state__icon { font-size: 3rem; margin-bottom: 16px; }
	.empty-state__text { margin-bottom: 20px; }
	
	.url-cell {
		max-width: 250px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	
	.action-buttons {
		display: flex;
		gap: 8px;
	}
	
	.mp-btn--sm { padding: 6px 12px; font-size: 0.8125rem; }
	.mp-btn--lg { padding: 12px 24px; }
	.mp-btn--success { background: var(--mp-success); color: white; }
	.mp-btn--danger { background: #ef4444; color: white; }
	.mp-btn--danger:hover { background: #dc2626; }
	
	.modal--large { max-width: 900px; }
	.modal--medium { max-width: 550px; }
	
	.form-section { margin-bottom: 24px; }
	.form-section__title {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 16px;
		padding-bottom: 8px;
		border-bottom: 1px solid var(--mp-border-light);
	}
	
	.form-hint {
		display: block;
		margin-top: 4px;
		font-size: 0.75rem;
		color: var(--mp-text-muted);
	}
	
	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
	}
	
	.preview-section {
		padding: 20px;
		background: var(--mp-bg-light);
		border-radius: 8px;
		text-align: center;
		margin-bottom: 20px;
	}
	
	.alert { padding: 16px; border-radius: 8px; margin-bottom: 16px; }
	.alert--error { background: #fee2e2; color: #991b1b; }
	
	.tabs {
		display: flex;
		gap: 4px;
		border-bottom: 2px solid var(--mp-border-light);
		margin-bottom: 20px;
	}
	.tab {
		padding: 12px 16px;
		background: none;
		border: none;
		cursor: pointer;
		font-size: 0.875rem;
		color: var(--mp-text-muted);
		border-bottom: 2px solid transparent;
		margin-bottom: -2px;
		transition: all 0.2s;
	}
	.tab:hover { color: var(--mp-text); }
	.tab--active {
		color: var(--mp-primary);
		border-bottom-color: var(--mp-primary);
		font-weight: 600;
	}
	
	.tab-content { min-height: 200px; }
	
	.info-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
		margin-bottom: 24px;
	}
	.info-card {
		padding: 20px;
		background: var(--mp-bg-light);
		border-radius: 12px;
		text-align: center;
	}
	.info-card__value { font-size: 2rem; font-weight: 700; color: var(--mp-primary); }
	.info-card__label { font-size: 0.8125rem; color: var(--mp-text-muted); }
	
	.auto-import-info {
		padding: 16px;
		background: #f0fdf4;
		border: 1px solid #86efac;
		border-radius: 8px;
	}
	.auto-import-info h4 { margin: 0 0 12px; color: #166534; }
	.auto-import-info ul { margin: 0; padding-left: 20px; }
	.auto-import-info li { margin: 4px 0; color: #166534; }
	
	.fields-grid {
		display: grid;
		gap: 8px;
		max-height: 300px;
		overflow-y: auto;
	}
	.field-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 14px;
		background: var(--mp-bg-light);
		border-radius: 8px;
		border-left: 3px solid #d1d5db;
	}
	.field-item--auto { border-left-color: var(--mp-success); background: #f0fdf4; }
	.field-item__name { font-family: monospace; font-size: 0.875rem; }
	.field-item__desc { font-size: 0.8125rem; color: var(--mp-text-muted); }
	
	.legend {
		display: flex;
		gap: 20px;
		margin-top: 16px;
		padding-top: 16px;
		border-top: 1px solid var(--mp-border-light);
	}
	.legend__item { display: flex; align-items: center; gap: 8px; font-size: 0.8125rem; }
	.legend__color { width: 12px; height: 12px; border-radius: 2px; }
	.legend__color--auto { background: var(--mp-success); }
	.legend__color--ignore { background: #d1d5db; }
	
	.attributes-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 8px;
		max-height: 300px;
		overflow-y: auto;
	}
	.attribute-item {
		display: flex;
		justify-content: space-between;
		padding: 10px 14px;
		background: var(--mp-bg-light);
		border-radius: 8px;
	}
	.attribute-item__name { font-weight: 500; }
	.attribute-item__count { color: var(--mp-text-muted); font-size: 0.8125rem; }
	
	.empty-hint { text-align: center; color: var(--mp-text-muted); padding: 40px; }
	
	.sample-list { display: grid; gap: 8px; }
	.sample-item {
		background: var(--mp-bg-light);
		border-radius: 8px;
		overflow: hidden;
	}
	.sample-item__header {
		padding: 12px 16px;
		cursor: pointer;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.sample-item__price { color: var(--mp-primary); font-weight: 600; }
	.sample-item__code {
		margin: 0;
		padding: 16px;
		background: #1e293b;
		color: #e2e8f0;
		font-size: 0.75rem;
		overflow-x: auto;
		white-space: pre-wrap;
	}
	
	.import-status { text-align: center; margin-bottom: 24px; }
	.import-status__icon { font-size: 3rem; margin-bottom: 8px; }
	.import-status__message { font-size: 1.125rem; font-weight: 600; margin-bottom: 4px; }
	.import-status__count { color: var(--mp-text-muted); }
	
	.progress {
		height: 24px;
		background: var(--mp-bg-light);
		border-radius: 12px;
		overflow: hidden;
	}
	.progress__bar {
		height: 100%;
		background: linear-gradient(90deg, var(--mp-primary), var(--mp-primary-dark));
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.75rem;
		font-weight: 600;
		transition: width 0.3s;
	}
	
	.import-results {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
		margin-top: 24px;
		padding: 20px;
		background: var(--mp-bg-light);
		border-radius: 12px;
	}
	.import-result { text-align: center; }
	.import-result__value { font-size: 1.75rem; font-weight: 700; }
	.import-result__value--success { color: var(--mp-success); }
	.import-result__value--info { color: var(--mp-primary); }
	.import-result__value--error { color: #ef4444; }
	.import-result__label { font-size: 0.8125rem; color: var(--mp-text-muted); }
	
	.import-logs { margin-top: 16px; }
	.import-logs summary {
		cursor: pointer;
		padding: 8px;
		background: var(--mp-bg-light);
		border-radius: 8px;
	}
	.import-logs__content {
		margin-top: 8px;
		padding: 12px;
		background: #1e293b;
		border-radius: 8px;
		max-height: 150px;
		overflow-y: auto;
	}
	.import-logs__line {
		font-family: monospace;
		font-size: 0.75rem;
		color: #94a3b8;
		padding: 2px 0;
	}
</style>
