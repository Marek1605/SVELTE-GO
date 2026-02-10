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
		client: {start:"_app/immutable/entry/start.fOsSHsyT.js",app:"_app/immutable/entry/app.BCYRxjuv.js",imports:["_app/immutable/entry/start.fOsSHsyT.js","_app/immutable/chunks/CodC8iEl.js","_app/immutable/chunks/DegHwCHz.js","_app/immutable/chunks/DcdZDViH.js","_app/immutable/entry/app.BCYRxjuv.js","_app/immutable/chunks/DegHwCHz.js","_app/immutable/chunks/DwtPztOd.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-D8HZ_JF3.js')),
			__memo(() => import('./chunks/1-B7wOmI19.js')),
			__memo(() => import('./chunks/2-CtpQPx-G.js')),
			__memo(() => import('./chunks/3-CG4NvLUJ.js')),
			__memo(() => import('./chunks/4-DP4YbhTp.js')),
			__memo(() => import('./chunks/5-CwdloCVq.js')),
			__memo(() => import('./chunks/6-w7MqLMDR.js')),
			__memo(() => import('./chunks/7-C-A5K_E0.js')),
			__memo(() => import('./chunks/8-DhnSnIyY.js')),
			__memo(() => import('./chunks/9-DOx2k50U.js')),
			__memo(() => import('./chunks/10-DRsSC__f.js')),
			__memo(() => import('./chunks/11--aTfIYxf.js')),
			__memo(() => import('./chunks/12--C49vygG.js')),
			__memo(() => import('./chunks/13-DCjf_BmF.js')),
			__memo(() => import('./chunks/14-zWX_U2qZ.js')),
			__memo(() => import('./chunks/15-D3dgxMYJ.js')),
			__memo(() => import('./chunks/16-dAAw40ob.js')),
			__memo(() => import('./chunks/17-CzF2fNAz.js')),
			__memo(() => import('./chunks/18-DqxcnbfU.js')),
			__memo(() => import('./chunks/19-DFDK574K.js')),
			__memo(() => import('./chunks/20-XaVHZfA1.js')),
			__memo(() => import('./chunks/21-DUX94e4X.js')),
			__memo(() => import('./chunks/22-BK4OxQGD.js')),
			__memo(() => import('./chunks/23-D4mC2qPb.js')),
			__memo(() => import('./chunks/24-yO_RATH4.js')),
			__memo(() => import('./chunks/25-DTVkTjWy.js')),
			__memo(() => import('./chunks/26-kuHvrrTi.js')),
			__memo(() => import('./chunks/27-Cwjrgve6.js')),
			__memo(() => import('./chunks/28-BvDgk3B7.js')),
			__memo(() => import('./chunks/29-DS1Mj8hm.js')),
			__memo(() => import('./chunks/30-BrNjPjwR.js'))
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
				id: "/admin/pending-shops",
				pattern: /^\/admin\/pending-shops\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/admin/products",
				pattern: /^\/admin\/products\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/admin/vendor-offers",
				pattern: /^\/admin\/vendor-offers\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/admin/vendors",
				pattern: /^\/admin\/vendors\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 15 },
				endpoint: null
			},
			{
				id: "/hladat",
				pattern: /^\/hladat\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 16 },
				endpoint: null
			},
			{
				id: "/kategoria/[slug]",
				pattern: /^\/kategoria\/([^/]+?)\/?$/,
				params: [{"name":"slug","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 17 },
				endpoint: null
			},
			{
				id: "/prihlasenie-predajcu",
				pattern: /^\/prihlasenie-predajcu\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 18 },
				endpoint: null
			},
			{
				id: "/produkt/[slug]",
				pattern: /^\/produkt\/([^/]+?)\/?$/,
				params: [{"name":"slug","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 19 },
				endpoint: null
			},
			{
				id: "/registracia-predajcu",
				pattern: /^\/registracia-predajcu\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 20 },
				endpoint: null
			},
			{
				id: "/vendor-dashboard",
				pattern: /^\/vendor-dashboard\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 21 },
				endpoint: null
			},
			{
				id: "/vendor-dashboard/konverzie",
				pattern: /^\/vendor-dashboard\/konverzie\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 22 },
				endpoint: null
			},
			{
				id: "/vendor-dashboard/moj-ucet",
				pattern: /^\/vendor-dashboard\/moj-ucet\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 23 },
				endpoint: null
			},
			{
				id: "/vendor-dashboard/nastavenia-predaja",
				pattern: /^\/vendor-dashboard\/nastavenia-predaja\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 24 },
				endpoint: null
			},
			{
				id: "/vendor-dashboard/ppc",
				pattern: /^\/vendor-dashboard\/ppc\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 25 },
				endpoint: null
			},
			{
				id: "/vendor-dashboard/pridat-obchod",
				pattern: /^\/vendor-dashboard\/pridat-obchod\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 26 },
				endpoint: null
			},
			{
				id: "/vendor-dashboard/produkty",
				pattern: /^\/vendor-dashboard\/produkty\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 27 },
				endpoint: null
			},
			{
				id: "/vendor-dashboard/reporty",
				pattern: /^\/vendor-dashboard\/reporty\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 28 },
				endpoint: null
			},
			{
				id: "/vendor-dashboard/statistiky",
				pattern: /^\/vendor-dashboard\/statistiky\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 29 },
				endpoint: null
			},
			{
				id: "/vendor-dashboard/xml-feedy",
				pattern: /^\/vendor-dashboard\/xml-feedy\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 30 },
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
