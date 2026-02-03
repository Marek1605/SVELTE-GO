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
	() => import('./nodes/28')
];

export const server_loads = [];

export const dictionary = {
		"/": [~4],
		"/admin": [5,[2]],
		"/admin/categories": [6,[2]],
		"/admin/feeds": [7,[2]],
		"/admin/feeds/new": [8,[2]],
		"/admin/filters": [9,[2]],
		"/admin/offers": [10,[2]],
		"/admin/products": [11,[2]],
		"/admin/vendor-offers": [12,[2]],
		"/admin/vendors": [13,[2]],
		"/hladat": [14],
		"/kategoria/[slug]": [~15],
		"/prihlasenie-predajcu": [16],
		"/produkt/[slug]": [~17],
		"/registracia-predajcu": [18],
		"/vendor-dashboard": [19,[3]],
		"/vendor-dashboard/konverzie": [20,[3]],
		"/vendor-dashboard/moj-ucet": [21,[3]],
		"/vendor-dashboard/nastavenia-predaja": [22,[3]],
		"/vendor-dashboard/ppc": [23,[3]],
		"/vendor-dashboard/pridat-obchod": [24,[3]],
		"/vendor-dashboard/produkty": [25,[3]],
		"/vendor-dashboard/reporty": [26,[3]],
		"/vendor-dashboard/statistiky": [27,[3]],
		"/vendor-dashboard/xml-feedy": [28,[3]]
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