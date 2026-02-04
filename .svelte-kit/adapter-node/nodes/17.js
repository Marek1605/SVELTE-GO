import * as server from '../entries/pages/produkt/_slug_/_page.server.ts.js';

export const index = 17;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/produkt/_slug_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/produkt/[slug]/+page.server.ts";
export const imports = ["_app/immutable/nodes/17.DQR1rfEk.js","_app/immutable/chunks/62sxw8SM.js","_app/immutable/chunks/D0QH3NT1.js","_app/immutable/chunks/DldpiVGX.js","_app/immutable/chunks/CanS3UQf.js","_app/immutable/chunks/BSOId-2s.js","_app/immutable/chunks/CqQQmUBq.js"];
export const stylesheets = ["_app/immutable/assets/17.Nz5YYXmX.css"];
export const fonts = [];
