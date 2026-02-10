import { a as api } from "../../chunks/api.js";
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
export {
  load
};
