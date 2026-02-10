import { a as api } from "../../../../chunks/api.js";
import { error } from "@sveltejs/kit";
async function load({ params }) {
  const { slug } = params;
  try {
    const result = await api.getProductBySlug(slug);
    if (result?.success === false) {
      if (result.status === 404) {
        throw error(404, "Produkt nenájdený");
      }
      return {
        product: null,
        attributes: [],
        images: [],
        error: result.error || "Nepodarilo sa načítať produkt"
      };
    }
    const product = result?.data || result;
    if (!product || !product.id) {
      throw error(404, "Produkt nenájdený");
    }
    return {
      product,
      attributes: product.attributes || [],
      images: product.images || (product.image_url ? [product.image_url] : [])
    };
  } catch (err) {
    if (err?.status) {
      throw err;
    }
    console.error("Error loading product:", slug, err);
    return {
      product: null,
      attributes: [],
      images: [],
      error: "Chyba pri načítaní produktu"
    };
  }
}
export {
  load
};
