import { a as api } from './api-Ca5DsObU.js';
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

const index = 17;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-B6Ivz29q.js')).default;
const server_id = "src/routes/produkt/[slug]/+page.server.ts";
const imports = ["_app/immutable/nodes/17.DZnTxg9P.js","_app/immutable/chunks/vSoWG56B.js","_app/immutable/chunks/D0QH3NT1.js","_app/immutable/chunks/Dysy-sLZ.js","_app/immutable/chunks/3kR5jQW9.js","_app/immutable/chunks/BSOId-2s.js","_app/immutable/chunks/CqQQmUBq.js"];
const stylesheets = ["_app/immutable/assets/17.Nz5YYXmX.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=17-BaXHFYh8.js.map
