import { c as create_ssr_component, a as subscribe, e as each, b as add_attribute, d as escape } from "../../../chunks/ssr.js";
import { p as page } from "../../../chunks/stores.js";
const css = {
  code: "*{box-sizing:border-box}body{margin:0;padding:0;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;background:#f1f5f9}.admin-wrapper.svelte-3bjqoe.svelte-3bjqoe{display:flex;min-height:100vh}.sidebar.svelte-3bjqoe.svelte-3bjqoe{width:220px;background:#1e293b;color:white;position:fixed;top:0;left:0;height:100vh;display:flex;flex-direction:column;z-index:100}.logo.svelte-3bjqoe.svelte-3bjqoe{padding:24px 20px;border-bottom:1px solid #334155}.logo.svelte-3bjqoe a.svelte-3bjqoe{text-decoration:none;color:white;display:block}.logo.svelte-3bjqoe strong.svelte-3bjqoe{display:block;font-size:20px;color:#fbbf24}.logo.svelte-3bjqoe span.svelte-3bjqoe{font-size:12px;color:#94a3b8}.nav.svelte-3bjqoe.svelte-3bjqoe{flex:1;padding:16px 0}.nav-link.svelte-3bjqoe.svelte-3bjqoe{display:block;padding:12px 20px;color:#94a3b8;text-decoration:none;font-size:14px;transition:all 0.2s;border-left:3px solid transparent}.nav-link.svelte-3bjqoe.svelte-3bjqoe:hover{background:#334155;color:white}.nav-link.active.svelte-3bjqoe.svelte-3bjqoe{background:#334155;color:white;border-left-color:#fbbf24}.sidebar-footer.svelte-3bjqoe.svelte-3bjqoe{padding:16px 0;border-top:1px solid #334155}.main-content.svelte-3bjqoe.svelte-3bjqoe{flex:1;margin-left:220px;min-height:100vh;background:#f8fafc}",
  map: `{"version":3,"file":"+layout@.svelte","sources":["+layout@.svelte"],"sourcesContent":["<script>\\n    import { page } from '$app/stores';\\n    \\n    const menuItems = [\\n        { href: '/admin', label: 'Dashboard', icon: '📊' },\\n        { href: '/admin/products', label: 'Produkty', icon: '📦' },\\n        { href: '/admin/vendors', label: 'Predajcovia', icon: '👥' },\\n        { href: '/admin/vendor-offers', label: 'Ponuky vendorov', icon: '🏪' },\\n        { href: '/admin/offers', label: 'Feedy predajcov', icon: '📥' },\\n        { href: '/admin/feeds', label: 'Feed Import', icon: '📥' },\\n        { href: '/admin/categories', label: 'Kategórie', icon: '📁' },\\n        { href: '/admin/filters', label: 'Filtre', icon: '🎛️' },\\n    ];\\n<\/script>\\n\\n<svelte:head>\\n    <title>Admin | MegaPrice</title>\\n    <meta name=\\"robots\\" content=\\"noindex\\">\\n</svelte:head>\\n\\n<div class=\\"admin-wrapper\\">\\n    <aside class=\\"sidebar\\">\\n        <div class=\\"logo\\">\\n            <a href=\\"/admin\\">\\n                <strong>MegaPrice</strong>\\n                <span>Admin Panel</span>\\n            </a>\\n        </div>\\n        \\n        <nav class=\\"nav\\">\\n            {#each menuItems as item}\\n                <a \\n                    href={item.href} \\n                    class=\\"nav-link\\"\\n                    class:active={$page.url.pathname === item.href || \\n                                  ($page.url.pathname.startsWith(item.href + '/') && item.href !== '/admin') ||\\n                                  ($page.url.pathname === item.href)}\\n                >\\n                    {item.label}\\n                </a>\\n            {/each}\\n        </nav>\\n        \\n        <div class=\\"sidebar-footer\\">\\n            <a href=\\"/\\" class=\\"nav-link\\" target=\\"_blank\\">\\n                Zobraziť web\\n            </a>\\n        </div>\\n    </aside>\\n    \\n    <main class=\\"main-content\\">\\n        <slot />\\n    </main>\\n</div>\\n\\n<style>\\n    :global(*) {\\n        box-sizing: border-box;\\n    }\\n    \\n    :global(body) {\\n        margin: 0;\\n        padding: 0;\\n        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\\n        background: #f1f5f9;\\n    }\\n\\n    .admin-wrapper {\\n        display: flex;\\n        min-height: 100vh;\\n    }\\n\\n    .sidebar {\\n        width: 220px;\\n        background: #1e293b;\\n        color: white;\\n        position: fixed;\\n        top: 0;\\n        left: 0;\\n        height: 100vh;\\n        display: flex;\\n        flex-direction: column;\\n        z-index: 100;\\n    }\\n\\n    .logo {\\n        padding: 24px 20px;\\n        border-bottom: 1px solid #334155;\\n    }\\n\\n    .logo a {\\n        text-decoration: none;\\n        color: white;\\n        display: block;\\n    }\\n\\n    .logo strong {\\n        display: block;\\n        font-size: 20px;\\n        color: #fbbf24;\\n    }\\n\\n    .logo span {\\n        font-size: 12px;\\n        color: #94a3b8;\\n    }\\n\\n    .nav {\\n        flex: 1;\\n        padding: 16px 0;\\n    }\\n\\n    .nav-link {\\n        display: block;\\n        padding: 12px 20px;\\n        color: #94a3b8;\\n        text-decoration: none;\\n        font-size: 14px;\\n        transition: all 0.2s;\\n        border-left: 3px solid transparent;\\n    }\\n\\n    .nav-link:hover {\\n        background: #334155;\\n        color: white;\\n    }\\n\\n    .nav-link.active {\\n        background: #334155;\\n        color: white;\\n        border-left-color: #fbbf24;\\n    }\\n\\n    .sidebar-footer {\\n        padding: 16px 0;\\n        border-top: 1px solid #334155;\\n    }\\n\\n    .main-content {\\n        flex: 1;\\n        margin-left: 220px;\\n        min-height: 100vh;\\n        background: #f8fafc;\\n    }\\n</style>\\n"],"names":[],"mappings":"AAwDY,CAAG,CACP,UAAU,CAAE,UAChB,CAEQ,IAAM,CACV,MAAM,CAAE,CAAC,CACT,OAAO,CAAE,CAAC,CACV,WAAW,CAAE,aAAa,CAAC,CAAC,kBAAkB,CAAC,CAAC,UAAU,CAAC,CAAC,MAAM,CAAC,CAAC,UAAU,CAC9E,UAAU,CAAE,OAChB,CAEA,0CAAe,CACX,OAAO,CAAE,IAAI,CACb,UAAU,CAAE,KAChB,CAEA,oCAAS,CACL,KAAK,CAAE,KAAK,CACZ,UAAU,CAAE,OAAO,CACnB,KAAK,CAAE,KAAK,CACZ,QAAQ,CAAE,KAAK,CACf,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,MAAM,CAAE,KAAK,CACb,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,OAAO,CAAE,GACb,CAEA,iCAAM,CACF,OAAO,CAAE,IAAI,CAAC,IAAI,CAClB,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,OAC7B,CAEA,mBAAK,CAAC,eAAE,CACJ,eAAe,CAAE,IAAI,CACrB,KAAK,CAAE,KAAK,CACZ,OAAO,CAAE,KACb,CAEA,mBAAK,CAAC,oBAAO,CACT,OAAO,CAAE,KAAK,CACd,SAAS,CAAE,IAAI,CACf,KAAK,CAAE,OACX,CAEA,mBAAK,CAAC,kBAAK,CACP,SAAS,CAAE,IAAI,CACf,KAAK,CAAE,OACX,CAEA,gCAAK,CACD,IAAI,CAAE,CAAC,CACP,OAAO,CAAE,IAAI,CAAC,CAClB,CAEA,qCAAU,CACN,OAAO,CAAE,KAAK,CACd,OAAO,CAAE,IAAI,CAAC,IAAI,CAClB,KAAK,CAAE,OAAO,CACd,eAAe,CAAE,IAAI,CACrB,SAAS,CAAE,IAAI,CACf,UAAU,CAAE,GAAG,CAAC,IAAI,CACpB,WAAW,CAAE,GAAG,CAAC,KAAK,CAAC,WAC3B,CAEA,qCAAS,MAAO,CACZ,UAAU,CAAE,OAAO,CACnB,KAAK,CAAE,KACX,CAEA,SAAS,mCAAQ,CACb,UAAU,CAAE,OAAO,CACnB,KAAK,CAAE,KAAK,CACZ,iBAAiB,CAAE,OACvB,CAEA,2CAAgB,CACZ,OAAO,CAAE,IAAI,CAAC,CAAC,CACf,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,OAC1B,CAEA,yCAAc,CACV,IAAI,CAAE,CAAC,CACP,WAAW,CAAE,KAAK,CAClB,UAAU,CAAE,KAAK,CACjB,UAAU,CAAE,OAChB"}`
};
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  const menuItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: "📊"
    },
    {
      href: "/admin/products",
      label: "Produkty",
      icon: "📦"
    },
    {
      href: "/admin/vendors",
      label: "Predajcovia",
      icon: "👥"
    },
    {
      href: "/admin/vendor-offers",
      label: "Ponuky vendorov",
      icon: "🏪"
    },
    {
      href: "/admin/offers",
      label: "Feedy predajcov",
      icon: "📥"
    },
    {
      href: "/admin/feeds",
      label: "Feed Import",
      icon: "📥"
    },
    {
      href: "/admin/categories",
      label: "Kategórie",
      icon: "📁"
    },
    {
      href: "/admin/filters",
      label: "Filtre",
      icon: "🎛️"
    }
  ];
  $$result.css.add(css);
  $$unsubscribe_page();
  return `${$$result.head += `<!-- HEAD_svelte-cv1sig_START -->${$$result.title = `<title>Admin | MegaPrice</title>`, ""}<meta name="robots" content="noindex"><!-- HEAD_svelte-cv1sig_END -->`, ""} <div class="admin-wrapper svelte-3bjqoe"><aside class="sidebar svelte-3bjqoe"><div class="logo svelte-3bjqoe" data-svelte-h="svelte-1ytc4lp"><a href="/admin" class="svelte-3bjqoe"><strong class="svelte-3bjqoe">MegaPrice</strong> <span class="svelte-3bjqoe">Admin Panel</span></a></div> <nav class="nav svelte-3bjqoe">${each(menuItems, (item) => {
    return `<a${add_attribute("href", item.href, 0)} class="${[
      "nav-link svelte-3bjqoe",
      $page.url.pathname === item.href || $page.url.pathname.startsWith(item.href + "/") && item.href !== "/admin" || $page.url.pathname === item.href ? "active" : ""
    ].join(" ").trim()}">${escape(item.label)} </a>`;
  })}</nav> <div class="sidebar-footer svelte-3bjqoe" data-svelte-h="svelte-12ovyy3"><a href="/" class="nav-link svelte-3bjqoe" target="_blank">Zobraziť web</a></div></aside> <main class="main-content svelte-3bjqoe">${slots.default ? slots.default({}) : ``}</main> </div>`;
});
export {
  Layout as default
};
