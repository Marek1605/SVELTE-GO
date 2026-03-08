import * as server from '../entries/pages/produkt/_slug_/_page.server.ts.js';

export const index = 29;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/produkt/_slug_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/produkt/[slug]/+page.server.ts";
export const imports = ["_app/immutable/nodes/29.DdVaz2Sl.js","_app/immutable/chunks/DGgboO4P.js","_app/immutable/chunks/D0QH3NT1.js","_app/immutable/chunks/C_DwOGRg.js","_app/immutable/chunks/CbG7B7V5.js","_app/immutable/chunks/6Gw1KJqh.js","_app/immutable/chunks/Bt-Xh7oU.js"];
export const stylesheets = ["_app/immutable/assets/29.BcrQBKlB.css"];
export const fonts = [];
