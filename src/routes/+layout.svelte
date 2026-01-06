<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	
	let searchQuery = '';
	
	const categories = [
		{ name: 'Elektronika', slug: 'elektronika', icon: '📱' },
		{ name: 'Móda', slug: 'moda', icon: '👗' },
		{ name: 'Dom a záhrada', slug: 'dom-zahrada', icon: '🏠' },
		{ name: 'Šport', slug: 'sport', icon: '⚽' },
		{ name: 'Auto-moto', slug: 'auto-moto', icon: '🚗' },
		{ name: 'Zdravie', slug: 'zdravie', icon: '💊' },
		{ name: 'Detský svet', slug: 'detsky-svet', icon: '🧸' },
		{ name: 'Hobby', slug: 'hobby', icon: '🎨' },
	];
	
	// Check if current page is admin
	$: isAdmin = $page.url.pathname.startsWith('/admin');
	
	function handleSearch(e: Event) {
		e.preventDefault();
		if (searchQuery.trim()) {
			window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
		}
	}
</script>

<!-- Admin pages get no header/footer - they have their own layout -->
{#if isAdmin}
	<slot />
{:else}
	<!-- Top Bar -->
	<div class="mp-top-bar">
		<div class="mp-container mp-top-bar__content">
			<div class="mp-top-bar__promo">
				<span>🔥</span>
				<span>Porovnajte ceny z <strong>500+ obchodov</strong> a ušetrite!</span>
			</div>
			<div class="mp-top-bar__links">
				<a href="/pre-obchody" class="mp-top-bar__link">
					<span>🏪</span>
					<span>Pre obchody</span>
				</a>
				<a href="/pomoc" class="mp-top-bar__link">
					<span>❓</span>
					<span>Pomoc</span>
				</a>
			</div>
		</div>
	</div>

	<!-- Header -->
	<header class="mp-header">
		<div class="mp-container mp-header__inner">
			<!-- Logo -->
			<a href="/" class="mp-logo">
				<div class="mp-logo__icon">🔥</div>
				<div class="mp-logo__text">
					<span class="mp-logo__name">MegaPrice</span>
					<span class="mp-logo__tagline">Porovnávač cien</span>
				</div>
			</a>
			
			<!-- Search -->
			<div class="mp-search">
				<form class="mp-search__form" on:submit={handleSearch}>
					<div class="mp-search__category">
						<select class="mp-search__select">
							<option value="">Všetky kategórie</option>
							{#each categories as cat}
								<option value={cat.slug}>{cat.name}</option>
							{/each}
						</select>
					</div>
					<input 
						type="text" 
						class="mp-search__input" 
						placeholder="Hľadať produkty, značky..."
						bind:value={searchQuery}
					/>
					<button type="submit" class="mp-search__submit">
						🔍 Hľadať
					</button>
				</form>
			</div>
			
			<!-- Actions -->
			<div class="mp-header__actions">
				<a href="/oblubene" class="mp-header__action">
					<span class="mp-header__action-icon">
						❤️
						<span class="mp-header__action-badge">3</span>
					</span>
					<span class="mp-header__action-text">Obľúbené</span>
				</a>
				<a href="/porovnanie" class="mp-header__action">
					<span class="mp-header__action-icon">📊</span>
					<span class="mp-header__action-text">Porovnanie</span>
				</a>
				<a href="/admin" class="mp-header__action">
					<span class="mp-header__action-icon">⚙️</span>
					<span class="mp-header__action-text">Admin</span>
				</a>
			</div>
		</div>
		
		<!-- Categories Nav -->
		<nav class="mp-categories-nav">
			<div class="mp-container mp-categories-nav__inner">
				<button class="mp-categories-nav__toggle">
					<span>☰</span>
					<span>Kategórie</span>
				</button>
				<ul class="mp-categories-nav__list">
					{#each categories as cat}
						<li>
							<a href="/kategoria/{cat.slug}" class="mp-categories-nav__link">
								<span class="mp-categories-nav__icon">{cat.icon}</span>
								<span>{cat.name}</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</nav>
	</header>

	<!-- Main Content -->
	<main>
		<slot />
	</main>

	<!-- Footer -->
	<footer class="mp-footer">
		<div class="mp-container">
			<div class="mp-footer__grid">
				<!-- Brand -->
				<div class="mp-footer__brand">
					<div class="mp-footer__logo">
						<div class="mp-footer__logo-icon">🔥</div>
						<span class="mp-footer__logo-text">MegaPrice</span>
					</div>
					<p class="mp-footer__desc">
						Najväčší slovenský porovnávač cien. Porovnajte ceny z viac ako 500 overených 
						e-shopov a nájdite najlepšiu ponuku.
					</p>
					<div class="mp-footer__social">
						<a href="#" class="mp-footer__social-link">📘</a>
						<a href="#" class="mp-footer__social-link">📸</a>
						<a href="#" class="mp-footer__social-link">🐦</a>
						<a href="#" class="mp-footer__social-link">📺</a>
					</div>
				</div>
				
				<!-- Links -->
				<div>
					<h4 class="mp-footer__title">Kategórie</h4>
					<div class="mp-footer__links">
						<a href="/kategoria/elektronika" class="mp-footer__link">Elektronika</a>
						<a href="/kategoria/moda" class="mp-footer__link">Móda</a>
						<a href="/kategoria/dom-zahrada" class="mp-footer__link">Dom a záhrada</a>
						<a href="/kategoria/sport" class="mp-footer__link">Šport</a>
					</div>
				</div>
				
				<div>
					<h4 class="mp-footer__title">Informácie</h4>
					<div class="mp-footer__links">
						<a href="/o-nas" class="mp-footer__link">O nás</a>
						<a href="/ako-to-funguje" class="mp-footer__link">Ako to funguje</a>
						<a href="/pre-obchody" class="mp-footer__link">Pre obchody</a>
						<a href="/kontakt" class="mp-footer__link">Kontakt</a>
					</div>
				</div>
				
				<div>
					<h4 class="mp-footer__title">Podpora</h4>
					<div class="mp-footer__links">
						<a href="/pomoc" class="mp-footer__link">Centrum pomoci</a>
						<a href="/ochrana-udajov" class="mp-footer__link">Ochrana údajov</a>
						<a href="/podmienky" class="mp-footer__link">Obchodné podmienky</a>
						<a href="/cookies" class="mp-footer__link">Cookies</a>
					</div>
				</div>
			</div>
			
			<div class="mp-footer__bottom">
				<span>© 2025 MegaPrice. Všetky práva vyhradené.</span>
				<span>Made with ❤️ in Slovakia</span>
			</div>
		</div>
	</footer>
{/if}
