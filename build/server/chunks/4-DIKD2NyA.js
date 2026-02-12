import { a as api } from './api-CQ8XOMuJ.js';

async function load() {
  try {
    let categories = [];
    const catResult = await api.getCategoriesTree();
    if (catResult?.success && catResult?.data) {
      categories = Array.isArray(catResult.data) ? catResult.data : [];
    } else if (Array.isArray(catResult)) {
      categories = catResult;
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
const component = async () => component_cache ??= (await import('./_page.svelte-D-E6H3NW.js')).default;
const server_id = "src/routes/+page.server.ts";
const imports = ["_app/immutable/nodes/4.CIyFbS3G.js","_app/immutable/chunks/DegHwCHz.js","_app/immutable/chunks/D0QH3NT1.js","_app/immutable/chunks/BS8_HMP2.js","_app/immutable/chunks/DwtPztOd.js"];
const stylesheets = ["_app/immutable/assets/4.DblDWZ44.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=4-DIKD2NyA.js.map
