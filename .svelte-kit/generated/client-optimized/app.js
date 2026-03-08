export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14'),
	() => import('./nodes/15'),
	() => import('./nodes/16'),
	() => import('./nodes/17'),
	() => import('./nodes/18'),
	() => import('./nodes/19'),
	() => import('./nodes/20'),
	() => import('./nodes/21'),
	() => import('./nodes/22'),
	() => import('./nodes/23'),
	() => import('./nodes/24'),
	() => import('./nodes/25'),
	() => import('./nodes/26'),
	() => import('./nodes/27'),
	() => import('./nodes/28'),
	() => import('./nodes/29'),
	() => import('./nodes/30'),
	() => import('./nodes/31'),
	() => import('./nodes/32'),
	() => import('./nodes/33'),
	() => import('./nodes/34'),
	() => import('./nodes/35'),
	() => import('./nodes/36'),
	() => import('./nodes/37'),
	() => import('./nodes/38'),
	() => import('./nodes/39'),
	() => import('./nodes/40'),
	() => import('./nodes/41'),
	() => import('./nodes/42')
];

export const server_loads = [0];

export const dictionary = {
		"/": [~4],
		"/admin": [5,[2]],
		"/admin/ai-settings": [6,[2]],
		"/admin/categories": [7,[2]],
		"/admin/feeds": [8,[2]],
		"/admin/feeds/new": [9,[2]],
		"/admin/filters": [10,[2]],
		"/admin/offers": [11,[2]],
		"/admin/pages": [12,[2]],
		"/admin/pending-shops": [13,[2]],
		"/admin/product-stats": [14,[2]],
		"/admin/products": [15,[2]],
		"/admin/settings": [16,[2]],
		"/admin/taxonomy": [17,[2]],
		"/admin/top-produkty": [18,[2]],
		"/admin/vendor-offers": [19,[2]],
		"/admin/vendor-requests": [20,[2]],
		"/admin/vendors": [21,[2]],
		"/hladat": [22],
		"/impressum": [23],
		"/kategoria/[slug]": [~24],
		"/kontakt": [25],
		"/ochrana-osobnych-udajov": [26],
		"/podmienky-pouzivania": [27],
		"/prihlasenie-predajcu": [28],
		"/produkt/[slug]": [~29],
		"/registracia-predajcu": [30],
		"/vendor-dashboard": [31,[3]],
		"/vendor-dashboard/konverzie": [32,[3]],
		"/vendor-dashboard/moj-ucet": [33,[3]],
		"/vendor-dashboard/nastavenia-predaja": [34,[3]],
		"/vendor-dashboard/ppc": [35,[3]],
		"/vendor-dashboard/pridat-obchod": [36,[3]],
		"/vendor-dashboard/produkty": [37,[3]],
		"/vendor-dashboard/reporty": [38,[3]],
		"/vendor-dashboard/statistiky": [39,[3]],
		"/vendor-dashboard/xml-feedy": [40,[3]],
		"/vseobecne-obchodne-podmienky": [41],
		"/zasady-cookies": [42]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
	
	reroute: (() => {}),
	transport: {}
};

export const decoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.decode]));
export const encoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.encode]));

export const hash = false;

export const decode = (type, value) => decoders[type](value);

export { default as root } from '../root.svelte';