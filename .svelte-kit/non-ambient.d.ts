
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
		RouteId(): "/" | "/admin" | "/admin/ai-settings" | "/admin/categories" | "/admin/feeds" | "/admin/feeds/new" | "/admin/filters" | "/admin/offers" | "/admin/pending-shops" | "/admin/products" | "/admin/vendor-offers" | "/admin/vendors" | "/hladat" | "/kategoria" | "/kategoria/[slug]" | "/prihlasenie-predajcu" | "/produkt" | "/produkt/[slug]" | "/registracia-predajcu" | "/vendor-dashboard" | "/vendor-dashboard/konverzie" | "/vendor-dashboard/moj-ucet" | "/vendor-dashboard/nastavenia-predaja" | "/vendor-dashboard/ppc" | "/vendor-dashboard/pridat-obchod" | "/vendor-dashboard/produkty" | "/vendor-dashboard/reporty" | "/vendor-dashboard/statistiky" | "/vendor-dashboard/xml-feedy";
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
			"/admin/pending-shops": Record<string, never>;
			"/admin/products": Record<string, never>;
			"/admin/vendor-offers": Record<string, never>;
			"/admin/vendors": Record<string, never>;
			"/hladat": Record<string, never>;
			"/kategoria": { slug?: string };
			"/kategoria/[slug]": { slug: string };
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
			"/vendor-dashboard/xml-feedy": Record<string, never>
		};
		Pathname(): "/" | "/admin" | "/admin/" | "/admin/ai-settings" | "/admin/ai-settings/" | "/admin/categories" | "/admin/categories/" | "/admin/feeds" | "/admin/feeds/" | "/admin/feeds/new" | "/admin/feeds/new/" | "/admin/filters" | "/admin/filters/" | "/admin/offers" | "/admin/offers/" | "/admin/pending-shops" | "/admin/pending-shops/" | "/admin/products" | "/admin/products/" | "/admin/vendor-offers" | "/admin/vendor-offers/" | "/admin/vendors" | "/admin/vendors/" | "/hladat" | "/hladat/" | "/kategoria" | "/kategoria/" | `/kategoria/${string}` & {} | `/kategoria/${string}/` & {} | "/prihlasenie-predajcu" | "/prihlasenie-predajcu/" | "/produkt" | "/produkt/" | `/produkt/${string}` & {} | `/produkt/${string}/` & {} | "/registracia-predajcu" | "/registracia-predajcu/" | "/vendor-dashboard" | "/vendor-dashboard/" | "/vendor-dashboard/konverzie" | "/vendor-dashboard/konverzie/" | "/vendor-dashboard/moj-ucet" | "/vendor-dashboard/moj-ucet/" | "/vendor-dashboard/nastavenia-predaja" | "/vendor-dashboard/nastavenia-predaja/" | "/vendor-dashboard/ppc" | "/vendor-dashboard/ppc/" | "/vendor-dashboard/pridat-obchod" | "/vendor-dashboard/pridat-obchod/" | "/vendor-dashboard/produkty" | "/vendor-dashboard/produkty/" | "/vendor-dashboard/reporty" | "/vendor-dashboard/reporty/" | "/vendor-dashboard/statistiky" | "/vendor-dashboard/statistiky/" | "/vendor-dashboard/xml-feedy" | "/vendor-dashboard/xml-feedy/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}