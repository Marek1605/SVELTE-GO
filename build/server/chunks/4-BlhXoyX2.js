import { a as api } from './api-LKUo2gxl.js';
import './index2-CbPqsRYI.js';
import './false-CRHihH2U.js';

async function load$1({ data }) {
  return data;
}

var _page_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load$1
});

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
const component = async () => component_cache ??= (await import('./_page.svelte-BXQj4Sth.js')).default;
const universal_id = "src/routes/+page.ts";
const server_id = "src/routes/+page.server.ts";
const imports = ["_app/immutable/nodes/4.4CFYgHcD.js","_app/immutable/chunks/DGgboO4P.js","_app/immutable/chunks/D0QH3NT1.js","_app/immutable/chunks/C_DwOGRg.js","_app/immutable/chunks/CbG7B7V5.js","_app/immutable/chunks/6Gw1KJqh.js","_app/immutable/chunks/Bt-Xh7oU.js"];
const stylesheets = ["_app/immutable/assets/4.Dys217rw.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets, _page_ts as universal, universal_id };
//# sourceMappingURL=4-BlhXoyX2.js.map
