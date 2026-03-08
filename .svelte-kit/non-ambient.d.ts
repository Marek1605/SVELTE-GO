
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/admin" | "/admin/ai-settings" | "/admin/categories" | "/admin/feeds" | "/admin/feeds/new" | "/admin/filters" | "/admin/offers" | "/admin/pages" | "/admin/pending-shops" | "/admin/product-stats" | "/admin/products" | "/admin/settings" | "/admin/taxonomy" | "/admin/top-produkty" | "/admin/vendor-offers" | "/admin/vendor-requests" | "/admin/vendors" | "/hladat" | "/impressum" | "/kategoria" | "/kategoria/[slug]" | "/kontakt" | "/ochrana-osobnych-udajov" | "/podmienky-pouzivania" | "/prihlasenie-predajcu" | "/produkt" | "/produkt/[slug]" | "/registracia-predajcu" | "/vendor-dashboard" | "/vendor-dashboard/konverzie" | "/vendor-dashboard/moj-ucet" | "/vendor-dashboard/nastavenia-predaja" | "/vendor-dashboard/ppc" | "/vendor-dashboard/pridat-obchod" | "/vendor-dashboard/produkty" | "/vendor-dashboard/reporty" | "/vendor-dashboard/statistiky" | "/vendor-dashboard/xml-feedy" | "/vseobecne-obchodne-podmienky" | "/zasady-cookies";
		RouteParams(): {
			"/kategoria/[slug]": { slug: string };
			"/produkt/[slug]": { slug: string }
		};
		LayoutParams(): {
			"/": { slug?: string };
			"/admin": Record<string, never>;
			"/admin/ai-settings": Record<string, never>;
			"/admin/categories": Record<string, never>;
			"/admin/feeds": Record<string, never>;
			"/admin/feeds/new": Record<string, never>;
			"/admin/filters": Record<string, never>;
			"/admin/offers": Record<string, never>;
			"/admin/pages": Record<string, never>;
			"/admin/pending-shops": Record<string, never>;
			"/admin/product-stats": Record<string, never>;
			"/admin/products": Record<string, never>;
			"/admin/settings": Record<string, never>;
			"/admin/taxonomy": Record<string, never>;
			"/admin/top-produkty": Record<string, never>;
			"/admin/vendor-offers": Record<string, never>;
			"/admin/vendor-requests": Record<string, never>;
			"/admin/vendors": Record<string, never>;
			"/hladat": Record<string, never>;
			"/impressum": Record<string, never>;
			"/kategoria": { slug?: string };
			"/kategoria/[slug]": { slug: string };
			"/kontakt": Record<string, never>;
			"/ochrana-osobnych-udajov": Record<string, never>;
			"/podmienky-pouzivania": Record<string, never>;
			"/prihlasenie-predajcu": Record<string, never>;
			"/produkt": { slug?: string };
			"/produkt/[slug]": { slug: string };
			"/registracia-predajcu": Record<string, never>;
			"/vendor-dashboard": Record<string, never>;
			"/vendor-dashboard/konverzie": Record<string, never>;
			"/vendor-dashboard/moj-ucet": Record<string, never>;
			"/vendor-dashboard/nastavenia-predaja": Record<string, never>;
			"/vendor-dashboard/ppc": Record<string, never>;
			"/vendor-dashboard/pridat-obchod": Record<string, never>;
			"/vendor-dashboard/produkty": Record<string, never>;
			"/vendor-dashboard/reporty": Record<string, never>;
			"/vendor-dashboard/statistiky": Record<string, never>;
			"/vendor-dashboard/xml-feedy": Record<string, never>;
			"/vseobecne-obchodne-podmienky": Record<string, never>;
			"/zasady-cookies": Record<string, never>
		};
		Pathname(): "/" | "/admin" | "/admin/" | "/admin/ai-settings" | "/admin/ai-settings/" | "/admin/categories" | "/admin/categories/" | "/admin/feeds" | "/admin/feeds/" | "/admin/feeds/new" | "/admin/feeds/new/" | "/admin/filters" | "/admin/filters/" | "/admin/offers" | "/admin/offers/" | "/admin/pages" | "/admin/pages/" | "/admin/pending-shops" | "/admin/pending-shops/" | "/admin/product-stats" | "/admin/product-stats/" | "/admin/products" | "/admin/products/" | "/admin/settings" | "/admin/settings/" | "/admin/taxonomy" | "/admin/taxonomy/" | "/admin/top-produkty" | "/admin/top-produkty/" | "/admin/vendor-offers" | "/admin/vendor-offers/" | "/admin/vendor-requests" | "/admin/vendor-requests/" | "/admin/vendors" | "/admin/vendors/" | "/hladat" | "/hladat/" | "/impressum" | "/impressum/" | "/kategoria" | "/kategoria/" | `/kategoria/${string}` & {} | `/kategoria/${string}/` & {} | "/kontakt" | "/kontakt/" | "/ochrana-osobnych-udajov" | "/ochrana-osobnych-udajov/" | "/podmienky-pouzivania" | "/podmienky-pouzivania/" | "/prihlasenie-predajcu" | "/prihlasenie-predajcu/" | "/produkt" | "/produkt/" | `/produkt/${string}` & {} | `/produkt/${string}/` & {} | "/registracia-predajcu" | "/registracia-predajcu/" | "/vendor-dashboard" | "/vendor-dashboard/" | "/vendor-dashboard/konverzie" | "/vendor-dashboard/konverzie/" | "/vendor-dashboard/moj-ucet" | "/vendor-dashboard/moj-ucet/" | "/vendor-dashboard/nastavenia-predaja" | "/vendor-dashboard/nastavenia-predaja/" | "/vendor-dashboard/ppc" | "/vendor-dashboard/ppc/" | "/vendor-dashboard/pridat-obchod" | "/vendor-dashboard/pridat-obchod/" | "/vendor-dashboard/produkty" | "/vendor-dashboard/produkty/" | "/vendor-dashboard/reporty" | "/vendor-dashboard/reporty/" | "/vendor-dashboard/statistiky" | "/vendor-dashboard/statistiky/" | "/vendor-dashboard/xml-feedy" | "/vendor-dashboard/xml-feedy/" | "/vseobecne-obchodne-podmienky" | "/vseobecne-obchodne-podmienky/" | "/zasady-cookies" | "/zasady-cookies/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}