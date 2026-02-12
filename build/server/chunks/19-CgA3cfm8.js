import { a as api } from './api-CQ8XOMuJ.js';
import { e as error } from './index-C0AsGGWp.js';
import './utils-DmZwNubP.js';

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
        offers: [],
        error: result.error || "Nepodarilo sa načítať produkt"
      };
    }
    const product = result?.data || result;
    if (!product || !product.id) {
      throw error(404, "Produkt nenájdený");
    }
    let offers = [];
    try {
      const offersResult = await api.getProductOffers(product.id);
      if (offersResult?.success && offersResult?.data) {
        offers = Array.isArray(offersResult.data) ? offersResult.data : offersResult.data.offers || [];
      }
    } catch (e) {
      console.error("Error loading offers for product:", product.id, e);
    }
    product.offers = offers;
    return {
      product,
      attributes: product.attributes || [],
      images: product.images || (product.image_url ? [product.image_url] : []),
      offers
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
      offers: [],
      error: "Chyba pri načítaní produktu"
    };
  }
}

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 19;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DV7cpDN_.js')).default;
const server_id = "src/routes/produkt/[slug]/+page.server.ts";
const imports = ["_app/immutable/nodes/19.TOswUf-L.js","_app/immutable/chunks/DegHwCHz.js","_app/immutable/chunks/D0QH3NT1.js","_app/immutable/chunks/BS8_HMP2.js","_app/immutable/chunks/DwtPztOd.js","_app/immutable/chunks/D7CC4F_9.js"];
const stylesheets = ["_app/immutable/assets/19.Nz5YYXmX.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=19-CgA3cfm8.js.map
