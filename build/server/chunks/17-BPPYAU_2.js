import { a as api } from './api-CQ8XOMuJ.js';
import './utils-DmZwNubP.js';

async function load({ params, url }) {
  const { slug } = params;
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "24");
  const sort = url.searchParams.get("sort") || "newest";
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

const index = 17;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DAAvUDrI.js')).default;
const server_id = "src/routes/kategoria/[slug]/+page.server.ts";
const imports = ["_app/immutable/nodes/17.BVCl0E9-.js","_app/immutable/chunks/DegHwCHz.js","_app/immutable/chunks/D0QH3NT1.js","_app/immutable/chunks/BS8_HMP2.js","_app/immutable/chunks/DwtPztOd.js","_app/immutable/chunks/D7CC4F_9.js","_app/immutable/chunks/BBG6Qqdj.js","_app/immutable/chunks/DESAkHRw.js","_app/immutable/chunks/CaMOcnVO.js"];
const stylesheets = ["_app/immutable/assets/17.Bwf9yh3X.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=17-BPPYAU_2.js.map
