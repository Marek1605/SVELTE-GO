import { a as api } from './api-LKUo2gxl.js';
import './utils-DmZwNubP.js';
import './index2-CbPqsRYI.js';
import './false-CRHihH2U.js';

async function load({ params, url }) {
  const { slug } = params;
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "24");
  const sort = url.searchParams.get("sort") || "popular";
  const minPrice = url.searchParams.get("min_price") || "";
  const maxPrice = url.searchParams.get("max_price") || "";
  const brand = url.searchParams.get("brand") || "";
  try {
    const queryParams = new URLSearchParams();
    queryParams.set("page", page.toString());
    queryParams.set("limit", limit.toString());
    queryParams.set("sort", sort);
    if (minPrice) queryParams.set("min_price", minPrice);
    if (maxPrice) queryParams.set("max_price", maxPrice);
    if (brand) queryParams.set("brand", brand);
    let categoryData;
    try {
      categoryData = await api.getCategory(slug, queryParams.toString());
    } catch (fetchErr) {
      console.error("API fetch error for category:", slug, fetchErr);
      return {
        category: { name: slug, slug },
        ancestors: [],
        children: [],
        products: [],
        total: 0,
        page,
        limit,
        total_pages: 1,
        attributes: [],
        brands: [],
        priceRange: { min: 0, max: 1e3 },
        error: "Nepodarilo sa načítať kategóriu"
      };
    }
    if (!categoryData) {
      return {
        category: { name: slug, slug },
        ancestors: [],
        children: [],
        products: [],
        total: 0,
        page,
        limit,
        total_pages: 1,
        attributes: [],
        brands: [],
        priceRange: { min: 0, max: 1e3 },
        error: "Kategória nenájdená"
      };
    }
    if (categoryData.success === false) {
      return {
        category: { name: slug, slug },
        ancestors: [],
        children: [],
        products: [],
        total: 0,
        page,
        limit,
        total_pages: 1,
        attributes: [],
        brands: [],
        priceRange: { min: 0, max: 1e3 },
        error: categoryData.error || "Kategória nenájdená"
      };
    }
    const data = categoryData.data || categoryData;
    return {
      category: data.category || { name: slug, slug },
      ancestors: data.ancestors || [],
      children: data.children || [],
      products: data.products?.items || data.products || [],
      total: data.products?.total || data.total || 0,
      page: data.products?.page || page,
      limit: data.products?.limit || limit,
      total_pages: data.products?.pages || data.total_pages || 1,
      attributes: data.filters?.attributes || data.attributes || [],
      brands: data.filters?.brands || data.brands || [],
      priceRange: data.filters?.price_range || data.priceRange || { min: 0, max: 1e3 }
    };
  } catch (err) {
    console.error("Error loading category:", slug, err);
    return {
      category: { name: slug, slug },
      ancestors: [],
      children: [],
      products: [],
      total: 0,
      page,
      limit,
      total_pages: 1,
      attributes: [],
      brands: [],
      priceRange: { min: 0, max: 1e3 },
      error: "Chyba pri načítaní kategórie"
    };
  }
}

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 24;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-IwM12axd.js')).default;
const server_id = "src/routes/kategoria/[slug]/+page.server.ts";
const imports = ["_app/immutable/nodes/24.B_WQqXUe.js","_app/immutable/chunks/DGgboO4P.js","_app/immutable/chunks/D0QH3NT1.js","_app/immutable/chunks/C_DwOGRg.js","_app/immutable/chunks/CbG7B7V5.js","_app/immutable/chunks/6Gw1KJqh.js","_app/immutable/chunks/Bt-Xh7oU.js","_app/immutable/chunks/B7V5RW9k.js","_app/immutable/chunks/BhXPZtR1.js","_app/immutable/chunks/DL2c-URW.js"];
const stylesheets = ["_app/immutable/assets/24._ptM5JMh.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=24-CbZSMbfz.js.map
