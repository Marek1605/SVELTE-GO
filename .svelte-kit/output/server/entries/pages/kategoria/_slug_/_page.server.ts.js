import { a as api } from "../../../../chunks/api.js";
import "@sveltejs/kit";
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
export {
  load
};
