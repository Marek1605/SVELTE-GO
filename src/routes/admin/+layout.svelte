<script lang="ts">
	import { page } from '$app/stores';
	
	const navItems = [
		{ icon: '📊', label: 'Dashboard', href: '/admin' },
		{ icon: '📦', label: 'Produkty', href: '/admin/products' },
		{ icon: '📥', label: 'Feed Import', href: '/admin/feeds' },
		{ icon: '🎛️', label: 'Filtre', href: '/admin/filters' },
	];
	
	const settingsItems = [
		{ icon: '📁', label: 'Kategórie', href: '/admin/categories' },
		{ icon: '🏪', label: 'Obchody', href: '/admin/vendors' },
		{ icon: '⚙️', label: 'Nastavenia', href: '/admin/settings' },
	];
</script>

<div class="admin-layout">
	<!-- Sidebar -->
	<aside class="admin-sidebar">
		<div class="admin-sidebar__header">
			<a href="/admin" class="admin-sidebar__logo">
				<div class="admin-sidebar__logo-icon">🔥</div>
				<span class="admin-sidebar__logo-text">MegaPrice</span>
			</a>
		</div>
		
		<nav class="admin-sidebar__nav">
			<div class="admin-sidebar__section">
				<div class="admin-sidebar__section-title">Hlavné</div>
				{#each navItems as item}
					<a 
						href={item.href} 
						class="admin-sidebar__link"
						class:admin-sidebar__link--active={$page.url.pathname === item.href}
					>
						<span class="admin-sidebar__link-icon">{item.icon}</span>
						<span>{item.label}</span>
					</a>
				{/each}
			</div>
			
			<div class="admin-sidebar__section">
				<div class="admin-sidebar__section-title">Nastavenia</div>
				{#each settingsItems as item}
					<a 
						href={item.href} 
						class="admin-sidebar__link"
						class:admin-sidebar__link--active={$page.url.pathname === item.href}
					>
						<span class="admin-sidebar__link-icon">{item.icon}</span>
						<span>{item.label}</span>
					</a>
				{/each}
			</div>
			
			<div class="admin-sidebar__section" style="margin-top: auto; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
				<a href="/" class="admin-sidebar__link">
					<span class="admin-sidebar__link-icon">🌐</span>
					<span>Zobraziť web</span>
				</a>
			</div>
		</nav>
	</aside>
	
	<!-- Content -->
	<div class="admin-content">
		<slot />
	</div>
</div>
