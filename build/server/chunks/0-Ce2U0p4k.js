import { a as api } from './api-LKUo2gxl.js';
import './index2-CbPqsRYI.js';
import './false-CRHihH2U.js';

async function load() {
  try {
    const res = await api.getCategoriesTree();
    let categories = [];
    if (res?.success && Array.isArray(res.data)) {
      categories = res.data;
    } else if (Array.isArray(res)) {
      categories = res;
    }
    console.log("[layout.server] Categories loaded:", categories.length);
    return { navCategories: categories };
  } catch (e) {
    console.error("[layout.server] Failed:", e);
    return { navCategories: [] };
  }
}

var _layout_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 0;
let component_cache;
const component = async () => component_cache ??= (await import('./_layout.svelte-D4l_mcAr.js')).default;
const server_id = "src/routes/+layout.server.ts";
const imports = ["_app/immutable/nodes/0.BiNGFZHb.js","_app/immutable/chunks/DGgboO4P.js","_app/immutable/chunks/CbG7B7V5.js","_app/immutable/chunks/C_DwOGRg.js","_app/immutable/chunks/DL2c-URW.js","_app/immutable/chunks/B7V5RW9k.js","_app/immutable/chunks/BhXPZtR1.js"];
const stylesheets = ["_app/immutable/assets/0.B5WPhZje.css"];
const fonts = [];

export { component, fonts, imports, index, _layout_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=0-Ce2U0p4k.js.map
