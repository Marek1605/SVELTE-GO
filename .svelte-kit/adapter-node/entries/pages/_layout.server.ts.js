import { a as api } from "../../chunks/api.js";
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
export {
  load
};
