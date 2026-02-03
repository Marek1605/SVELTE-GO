import { a as api } from './api-Ca5DsObU.js';

async function load() {
  try {
    let categories = [];
    const catResult = await api.getCategoriesTree();
    if (catResult?.success && catResult?.data) {
      categories = Array.isArray(catResult.data) ? catResult.data.slice(0, 8) : [];
    } else if (Array.isArray(catResult)) {
      categories = catResult.slice(0, 8);
    }
    let products = [];
    const prodResult = await api.getProducts("limit=8&sort=newest");
    if (prodResult?.success && prodResult?.data?.items) {
      products = prodResult.data.items;
    } else if (prodResult?.items) {
      products = prodResult.items;
    } else if (Array.isArray(prodResult?.data)) {
      products = prodResult.data.slice(0, 8);
    }
    return {
      categories,
      products,
      stats: {
        products: 4998,
        categories: 531,
        shops: 500,
        updates: "24/7"
      }
    };
  } catch (err) {
    console.error("Error loading homepage:", err);
    return {
      categories: [],
      products: [],
      stats: {
        products: 4998,
        categories: 531,
        shops: 500,
        updates: "24/7"
      }
    };
  }
}

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 4;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DsEU3bkS.js')).default;
const server_id = "src/routes/+page.server.ts";
const imports = ["_app/immutable/nodes/4.DrM7d-JG.js","_app/immutable/chunks/vSoWG56B.js","_app/immutable/chunks/Dysy-sLZ.js","_app/immutable/chunks/3kR5jQW9.js"];
const stylesheets = ["_app/immutable/assets/4.CHiNi-Hl.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=4-AZpa5tsV.js.map
