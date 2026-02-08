import { a as api } from './api-DdJpwjrX.js';
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

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 19;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DxrRpyZ7.js')).default;
const server_id = "src/routes/produkt/[slug]/+page.server.ts";
const imports = ["_app/immutable/nodes/19.D3XFTiYA.js","_app/immutable/chunks/DFArySuv.js","_app/immutable/chunks/D0QH3NT1.js","_app/immutable/chunks/BCvDt_cB.js","_app/immutable/chunks/s82JoINO.js","_app/immutable/chunks/BHaQRAdm.js","_app/immutable/chunks/CqQQmUBq.js"];
const stylesheets = ["_app/immutable/assets/19.Nz5YYXmX.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=19-ByeO7jCW.js.map
