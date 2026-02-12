import { a as api } from './api-CQ8XOMuJ.js';

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
const component = async () => component_cache ??= (await import('./_layout.svelte-CdygQki4.js')).default;
const server_id = "src/routes/+layout.server.ts";
const imports = ["_app/immutable/nodes/0.CrS4Vyse.js","_app/immutable/chunks/DegHwCHz.js","_app/immutable/chunks/DwtPztOd.js","_app/immutable/chunks/BS8_HMP2.js","_app/immutable/chunks/CaMOcnVO.js","_app/immutable/chunks/BBG6Qqdj.js","_app/immutable/chunks/DESAkHRw.js"];
const stylesheets = ["_app/immutable/assets/0.CQHcm-bd.css"];
const fonts = [];

export { component, fonts, imports, index, _layout_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=0-DGI1doE2.js.map
