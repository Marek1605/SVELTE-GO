<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	
	export let data;
	
	let searchQuery = '';
	let mobileMenuOpen = false;
	
	// Get categories from server data
	$: categories = data?.categories || [];
	
	// Check if current page is admin
	$: isAdmin = $page.url.pathname.startsWith('/admin');

	function handleSearch(e: Event) {
		e.preventDefault();
		if (searchQuery.trim()) {
			window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
		}
	}

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	// Wishlist & Compare counts (client-side)
	let wishlistCount = 0;
	let compareCount = 0;

	// Load counts on mount
	import { onMount } from 'svelte';
	onMount(() => {
		try {
			const wishlist = JSON.parse(localStorage.getItem('mp_wishlist') || '[]');
			const compare = JSON.parse(localStorage.getItem('mp_compare') || '[]');
			wishlistCount = wishlist.length;
			compareCount = compare.length;
		} catch (e) {}
	});
</script>

<!-- Admin pages get no header/footer - they have their own layout -->
{#if isAdmin}
	<slot />
{:else}
	<!-- Top Bar -->
	<div class="mp-top-bar">
		<div class="mp-container">
			<div class="mp-top-bar__content">
				<div class="mp-top-bar__promo">
					🔥 Porovnajte ceny z <strong>500+ obchodov</strong> a ušetrite!
				</div>
				<div class="mp-top-bar__links">
					<a href="/pre-obchody" class="mp-top-bar__link">
						🏪 Pre obchody
					</a>
				</div>
			</div>
		</div>
	</div>

	<!-- Header -->
	<header class="mp-header">
		<div class="mp-container">
			<div class="mp-header__inner">
				<!-- Mobile Toggle -->
				<button class="mp-mobile-toggle" on:click={toggleMobileMenu} aria-label="Menu">
					<span class="mp-mobile-toggle__bar"></span>
					<span class="mp-mobile-toggle__bar"></span>
					<span class="mp-mobile-toggle__bar"></span>
				</button>

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
						>
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
							{#if wishlistCount > 0}
								<span class="mp-header__action-badge" data-badge="wishlist">{wishlistCount}</span>
							{/if}
						</span>
						<span class="mp-header__action-text">Obľúbené</span>
					</a>
					<a href="/porovnanie" class="mp-header__action">
						<span class="mp-header__action-icon">
							📊
							{#if compareCount > 0}
								<span class="mp-header__action-badge" data-badge="compare">{compareCount}</span>
							{/if}
						</span>
						<span class="mp-header__action-text">Porovnanie</span>
					</a>
					<a href="/admin" class="mp-header__action">
						<span class="mp-header__action-icon">⚙️</span>
						<span class="mp-header__action-text">Admin</span>
					</a>
				</div>
			</div>
		</div>

		<!-- Categories Nav -->
		<nav class="mp-categories-nav">
			<div class="mp-container mp-categories-nav__inner">
				<a href="/kategorie" class="mp-categories-nav__toggle">
					☰ Kategórie
				</a>
				<ul class="mp-categories-nav__list">
					{#each categories as cat}
						<li>
							<a href="/kategoria/{cat.slug}" class="mp-categories-nav__link">
								<span class="mp-categories-nav__icon">{cat.icon}</span>
								{cat.name}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</nav>
	</header>

	<!-- Mobile Menu Overlay -->
	{#if mobileMenuOpen}
		<div class="mp-mobile-menu active">
			<div class="mp-mobile-menu__overlay" on:click={toggleMobileMenu}></div>
			<div class="mp-mobile-menu__container">
				<div class="mp-mobile-menu__header">
					<span class="mp-mobile-menu__title">Menu</span>
					<button class="mp-mobile-menu__close" on:click={toggleMobileMenu}>✕</button>
				</div>
				<div class="mp-mobile-menu__search">
					<form on:submit={handleSearch}>
						<input type="text" placeholder="Hľadať..." bind:value={searchQuery}>
						<button type="submit">🔍</button>
					</form>
				</div>
				<div class="mp-mobile-menu__categories">
					<div class="mp-mobile-menu__section-title">Kategórie</div>
					{#each categories as cat}
						<div class="mp-mobile-menu__item">
							<a href="/kategoria/{cat.slug}" class="mp-mobile-menu__link" on:click={toggleMobileMenu}>
								<span>{cat.icon} {cat.name}</span>
							</a>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<!-- Main Content -->
	<main>
		<slot />
	</main>

	<!-- Footer -->
	<footer class="mp-footer">
		<div class="mp-container">
			<div class="mp-footer__grid">
				<div class="mp-footer__brand">
					<div class="mp-footer__logo">
						<span class="mp-footer__logo-icon">🔥</span>
						<span class="mp-footer__logo-text">MegaPrice</span>
					</div>
					<p class="mp-footer__desc">
						Najväčší slovenský porovnávač cien. Porovnajte ceny z 500+ obchodov 
						a nájdite najlepšie ponuky na jednom mieste.
					</p>
					<div class="mp-footer__social">
						<a href="#" class="mp-footer__social-link" aria-label="Facebook">📘</a>
						<a href="#" class="mp-footer__social-link" aria-label="Instagram">📷</a>
						<a href="#" class="mp-footer__social-link" aria-label="Twitter">🐦</a>
					</div>
				</div>

				<div class="mp-footer__col">
					<h4 class="mp-footer__title">Kategórie</h4>
					<div class="mp-footer__links">
						{#each categories.slice(0, 6) as cat}
							<a href="/kategoria/{cat.slug}" class="mp-footer__link">{cat.name}</a>
						{/each}
					</div>
				</div>

				<div class="mp-footer__col">
					<h4 class="mp-footer__title">Informácie</h4>
					<div class="mp-footer__links">
						<a href="/o-nas" class="mp-footer__link">O nás</a>
						<a href="/kontakt" class="mp-footer__link">Kontakt</a>
						<a href="/pre-obchody" class="mp-footer__link">Pre obchody</a>
						<a href="/blog" class="mp-footer__link">Blog</a>
					</div>
				</div>

				<div class="mp-footer__col">
					<h4 class="mp-footer__title">Právne</h4>
					<div class="mp-footer__links">
						<a href="/podmienky" class="mp-footer__link">Obchodné podmienky</a>
						<a href="/ochrana-udajov" class="mp-footer__link">Ochrana údajov</a>
						<a href="/cookies" class="mp-footer__link">Cookies</a>
					</div>
				</div>
			</div>

			<div class="mp-footer__bottom">
				<div class="mp-footer__copy">
					© 2024 MegaPrice.sk. Všetky práva vyhradené.
				</div>
				<div class="mp-footer__payments">
					💳 Visa | Mastercard | Apple Pay | Google Pay
				</div>
			</div>
		</div>
	</footer>
{/if}

<style>
	/* Mobile menu styles */
	.mp-mobile-toggle {
		display: none;
		flex-direction: column;
		gap: 5px;
		padding: 8px;
		background: none;
		border: none;
		cursor: pointer;
	}

	.mp-mobile-toggle__bar {
		width: 22px;
		height: 2px;
		background: var(--mp-text-secondary);
		border-radius: 2px;
		transition: all 0.3s;
	}

	.mp-mobile-menu {
		display: none;
		position: fixed;
		inset: 0;
		z-index: 1000;
	}

	.mp-mobile-menu.active {
		display: block;
	}

	.mp-mobile-menu__overlay {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
	}

	.mp-mobile-menu__container {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		width: 300px;
		max-width: 85vw;
		background: white;
		overflow-y: auto;
	}

	.mp-mobile-menu__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px;
		border-bottom: 1px solid var(--mp-border);
	}

	.mp-mobile-menu__title {
		font-weight: 600;
		font-size: 1.125rem;
	}

	.mp-mobile-menu__close {
		padding: 8px;
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1.25rem;
	}

	.mp-mobile-menu__search {
		padding: 16px;
		border-bottom: 1px solid var(--mp-border);
	}

	.mp-mobile-menu__search form {
		display: flex;
		background: var(--mp-bg-gray);
		border-radius: 8px;
		overflow: hidden;
	}

	.mp-mobile-menu__search input {
		flex: 1;
		padding: 12px;
		border: none;
		background: none;
	}

	.mp-mobile-menu__search button {
		padding: 12px;
		background: none;
		border: none;
		cursor: pointer;
	}

	.mp-mobile-menu__categories {
		padding: 16px;
	}

	.mp-mobile-menu__section-title {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--mp-text-light);
		margin-bottom: 12px;
	}

	.mp-mobile-menu__item {
		border-bottom: 1px solid var(--mp-border-light);
	}

	.mp-mobile-menu__link {
		display: block;
		padding: 12px 0;
		color: var(--mp-text-primary);
	}

	@media (max-width: 991px) {
		.mp-mobile-toggle {
			display: flex;
		}

		.mp-search {
			display: none;
		}

		.mp-header__actions {
			margin-left: auto;
		}

		.mp-categories-nav {
			display: none;
		}

		.mp-header__action-text {
			display: none;
		}
	}

	@media (max-width: 768px) {
		.mp-logo__tagline {
			display: none;
		}

		.mp-top-bar__links {
			display: none;
		}
	}
</style>
