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
	() => import('./nodes/30')
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
		"/admin/pending-shops": [12,[2]],
		"/admin/products": [13,[2]],
		"/admin/vendor-offers": [14,[2]],
		"/admin/vendors": [15,[2]],
		"/hladat": [16],
		"/kategoria/[slug]": [~17],
		"/prihlasenie-predajcu": [18],
		"/produkt/[slug]": [~19],
		"/registracia-predajcu": [20],
		"/vendor-dashboard": [21,[3]],
		"/vendor-dashboard/konverzie": [22,[3]],
		"/vendor-dashboard/moj-ucet": [23,[3]],
		"/vendor-dashboard/nastavenia-predaja": [24,[3]],
		"/vendor-dashboard/ppc": [25,[3]],
		"/vendor-dashboard/pridat-obchod": [26,[3]],
		"/vendor-dashboard/produkty": [27,[3]],
		"/vendor-dashboard/reporty": [28,[3]],
		"/vendor-dashboard/statistiky": [29,[3]],
		"/vendor-dashboard/xml-feedy": [30,[3]]
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