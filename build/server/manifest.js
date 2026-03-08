const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.Bufd-QzZ.js",app:"_app/immutable/entry/app.CHR7if0h.js",imports:["_app/immutable/entry/start.Bufd-QzZ.js","_app/immutable/chunks/B7V5RW9k.js","_app/immutable/chunks/DGgboO4P.js","_app/immutable/chunks/BhXPZtR1.js","_app/immutable/entry/app.CHR7if0h.js","_app/immutable/chunks/DGgboO4P.js","_app/immutable/chunks/CbG7B7V5.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-Ce2U0p4k.js')),
			__memo(() => import('./chunks/1-DPdkkJIW.js')),
			__memo(() => import('./chunks/2-CME8w-ph.js')),
			__memo(() => import('./chunks/3-BJKlSMMO.js')),
			__memo(() => import('./chunks/4-BlhXoyX2.js')),
			__memo(() => import('./chunks/5-CR_LS2tb.js')),
			__memo(() => import('./chunks/6-D4EcOA2D.js')),
			__memo(() => import('./chunks/7-BZCyGgLD.js')),
			__memo(() => import('./chunks/8-DXWUVC6_.js')),
			__memo(() => import('./chunks/9-C8oG-CfJ.js')),
			__memo(() => import('./chunks/10-B1MYjmwc.js')),
			__memo(() => import('./chunks/11-D8tv0eCE.js')),
			__memo(() => import('./chunks/12-DIAR83tO.js')),
			__memo(() => import('./chunks/13-Rs1B2eMT.js')),
			__memo(() => import('./chunks/14-CwqJ6pF4.js')),
			__memo(() => import('./chunks/15-Bta6AVuR.js')),
			__memo(() => import('./chunks/16-BRerweUq.js')),
			__memo(() => import('./chunks/17-DKHGk8Ow.js')),
			__memo(() => import('./chunks/18-BDxbh_xk.js')),
			__memo(() => import('./chunks/19-BIL6FNy8.js')),
			__memo(() => import('./chunks/20-TfhUR3yZ.js')),
			__memo(() => import('./chunks/21-Cc3AnrMp.js')),
			__memo(() => import('./chunks/22-Q20IyCWC.js')),
			__memo(() => import('./chunks/23-73KmElPr.js')),
			__memo(() => import('./chunks/24-CbZSMbfz.js')),
			__memo(() => import('./chunks/25-BnN8bT9A.js')),
			__memo(() => import('./chunks/26-dtvW0rfY.js')),
			__memo(() => import('./chunks/27-ap5HRgfA.js')),
			__memo(() => import('./chunks/28-I_61xNQX.js')),
			__memo(() => import('./chunks/29-BFORHbro.js')),
			__memo(() => import('./chunks/30-B3fHRROG.js')),
			__memo(() => import('./chunks/31-DxSgb9_j.js')),
			__memo(() => import('./chunks/32-B5bjus8-.js')),
			__memo(() => import('./chunks/33-CzM9aj0h.js')),
			__memo(() => import('./chunks/34-CjbRFsKt.js')),
			__memo(() => import('./chunks/35-BcydDZ2c.js')),
			__memo(() => import('./chunks/36-6S_KTcWF.js')),
			__memo(() => import('./chunks/37-DWleS2YR.js')),
			__memo(() => import('./chunks/38-C1MOdwCY.js')),
			__memo(() => import('./chunks/39-DuQCsP2O.js')),
			__memo(() => import('./chunks/40-Cz4Icucg.js')),
			__memo(() => import('./chunks/41-It5Jgvn4.js')),
			__memo(() => import('./chunks/42-BR80TdwV.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/admin",
				pattern: /^\/admin\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/admin/ai-settings",
				pattern: /^\/admin\/ai-settings\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/admin/categories",
				pattern: /^\/admin\/categories\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/admin/feeds",
				pattern: /^\/admin\/feeds\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/admin/feeds/new",
				pattern: /^\/admin\/feeds\/new\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/admin/filters",
				pattern: /^\/admin\/filters\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/admin/offers",
				pattern: /^\/admin\/offers\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/admin/pages",
				pattern: /^\/admin\/pages\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/admin/pending-shops",
				pattern: /^\/admin\/pending-shops\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/admin/product-stats",
				pattern: /^\/admin\/product-stats\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/admin/products",
				pattern: /^\/admin\/products\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 15 },
				endpoint: null
			},
			{
				id: "/admin/settings",
				pattern: /^\/admin\/settings\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 16 },
				endpoint: null
			},
			{
				id: "/admin/taxonomy",
				pattern: /^\/admin\/taxonomy\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 17 },
				endpoint: null
			},
			{
				id: "/admin/top-produkty",
				pattern: /^\/admin\/top-produkty\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 18 },
				endpoint: null
			},
			{
				id: "/admin/vendor-offers",
				pattern: /^\/admin\/vendor-offers\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 19 },
				endpoint: null
			},
			{
				id: "/admin/vendor-requests",
				pattern: /^\/admin\/vendor-requests\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 20 },
				endpoint: null
			},
			{
				id: "/admin/vendors",
				pattern: /^\/admin\/vendors\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 21 },
				endpoint: null
			},
			{
				id: "/hladat",
				pattern: /^\/hladat\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 22 },
				endpoint: null
			},
			{
				id: "/impressum",
				pattern: /^\/impressum\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 23 },
				endpoint: null
			},
			{
				id: "/kategoria/[slug]",
				pattern: /^\/kategoria\/([^/]+?)\/?$/,
				params: [{"name":"slug","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 24 },
				endpoint: null
			},
			{
				id: "/kontakt",
				pattern: /^\/kontakt\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 25 },
				endpoint: null
			},
			{
				id: "/ochrana-osobnych-udajov",
				pattern: /^\/ochrana-osobnych-udajov\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 26 },
				endpoint: null
			},
			{
				id: "/podmienky-pouzivania",
				pattern: /^\/podmienky-pouzivania\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 27 },
				endpoint: null
			},
			{
				id: "/prihlasenie-predajcu",
				pattern: /^\/prihlasenie-predajcu\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 28 },
				endpoint: null
			},
			{
				id: "/produkt/[slug]",
				pattern: /^\/produkt\/([^/]+?)\/?$/,
				params: [{"name":"slug","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 29 },
				endpoint: null
			},
			{
				id: "/registracia-predajcu",
				pattern: /^\/registracia-predajcu\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 30 },
				endpoint: null
			},
			{
				id: "/vendor-dashboard",
				pattern: /^\/vendor-dashboard\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 31 },
				endpoint: null
			},
			{
				id: "/vendor-dashboard/konverzie",
				pattern: /^\/vendor-dashboard\/konverzie\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 32 },
				endpoint: null
			},
			{
				id: "/vendor-dashboard/moj-ucet",
				pattern: /^\/vendor-dashboard\/moj-ucet\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 33 },
				endpoint: null
			},
			{
				id: "/vendor-dashboard/nastavenia-predaja",
				pattern: /^\/vendor-dashboard\/nastavenia-predaja\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 34 },
				endpoint: null
			},
			{
				id: "/vendor-dashboard/ppc",
				pattern: /^\/vendor-dashboard\/ppc\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 35 },
				endpoint: null
			},
			{
				id: "/vendor-dashboard/pridat-obchod",
				pattern: /^\/vendor-dashboard\/pridat-obchod\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 36 },
				endpoint: null
			},
			{
				id: "/vendor-dashboard/produkty",
				pattern: /^\/vendor-dashboard\/produkty\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 37 },
				endpoint: null
			},
			{
				id: "/vendor-dashboard/reporty",
				pattern: /^\/vendor-dashboard\/reporty\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 38 },
				endpoint: null
			},
			{
				id: "/vendor-dashboard/statistiky",
				pattern: /^\/vendor-dashboard\/statistiky\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 39 },
				endpoint: null
			},
			{
				id: "/vendor-dashboard/xml-feedy",
				pattern: /^\/vendor-dashboard\/xml-feedy\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 40 },
				endpoint: null
			},
			{
				id: "/vseobecne-obchodne-podmienky",
				pattern: /^\/vseobecne-obchodne-podmienky\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 41 },
				endpoint: null
			},
			{
				id: "/zasady-cookies",
				pattern: /^\/zasady-cookies\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 42 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set([]);

export { manifest, prerendered };
//# sourceMappingURL=manifest.js.map
