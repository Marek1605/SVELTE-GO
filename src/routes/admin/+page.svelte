<script lang="ts">
	export let data;
	
	$: dashboard = data.dashboard || {
		products: 1250,
		categories: 85,
		vendors: 42,
		feeds: 8
	};
</script>

<svelte:head>
	<title>Dashboard - Admin | MegaPrice</title>
</svelte:head>

<div class="admin-header">
	<div>
		<h1 class="admin-title">Dashboard</h1>
		<p class="admin-subtitle">Prehľad systému MegaPrice</p>
	</div>
</div>

<!-- Stats Cards -->
<div class="admin-stats">
	<div class="admin-stat-card">
		<div class="admin-stat-card__header">
			<div class="admin-stat-card__icon admin-stat-card__icon--blue">📦</div>
		</div>
		<div class="admin-stat-card__value">{dashboard.products?.toLocaleString() || 0}</div>
		<div class="admin-stat-card__label">Produktov</div>
	</div>
	
	<div class="admin-stat-card">
		<div class="admin-stat-card__header">
			<div class="admin-stat-card__icon admin-stat-card__icon--green">📁</div>
		</div>
		<div class="admin-stat-card__value">{dashboard.categories || 0}</div>
		<div class="admin-stat-card__label">Kategórií</div>
	</div>
	
	<div class="admin-stat-card">
		<div class="admin-stat-card__header">
			<div class="admin-stat-card__icon admin-stat-card__icon--yellow">🏪</div>
		</div>
		<div class="admin-stat-card__value">{dashboard.vendors || 0}</div>
		<div class="admin-stat-card__label">Obchodov</div>
	</div>
	
	<div class="admin-stat-card">
		<div class="admin-stat-card__header">
			<div class="admin-stat-card__icon admin-stat-card__icon--purple">📥</div>
		</div>
		<div class="admin-stat-card__value">{dashboard.feeds || 0}</div>
		<div class="admin-stat-card__label">Aktívnych feedov</div>
	</div>
</div>

<!-- Quick Actions -->
<div class="admin-table-wrapper" style="margin-bottom: 24px;">
	<div class="admin-table-header">
		<h3 class="admin-table-title">Rýchle akcie</h3>
	</div>
	<div style="padding: 20px; display: flex; gap: 12px; flex-wrap: wrap;">
		<a href="/admin/feeds" class="mp-btn mp-btn--primary">
			📥 Importovať feed
		</a>
		<a href="/admin/products" class="mp-btn mp-btn--secondary">
			📦 Spravovať produkty
		</a>
		<a href="/admin/filters" class="mp-btn mp-btn--secondary">
			🎛️ Nastaviť filtre
		</a>
	</div>
</div>

<!-- System Status -->
<div class="admin-table-wrapper">
	<div class="admin-table-header">
		<h3 class="admin-table-title">Stav systému</h3>
	</div>
	<table class="admin-table">
		<tbody>
			<tr>
				<td>Databáza PostgreSQL</td>
				<td><span class="status-badge status-badge--success">● Online</span></td>
			</tr>
			<tr>
				<td>Elasticsearch</td>
				<td><span class="status-badge status-badge--success">● Online</span></td>
			</tr>
			<tr>
				<td>Redis Cache</td>
				<td><span class="status-badge status-badge--success">● Online</span></td>
			</tr>
			<tr>
				<td>Posledná synchronizácia</td>
				<td>Dnes o 14:30</td>
			</tr>
		</tbody>
	</table>
</div>
