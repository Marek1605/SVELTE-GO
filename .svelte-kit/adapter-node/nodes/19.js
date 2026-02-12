import * as server from '../entries/pages/produkt/_slug_/_page.server.ts.js';

export const index = 19;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/produkt/_slug_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/produkt/[slug]/+page.server.ts";
export const imports = ["_app/immutable/nodes/19.TOswUf-L.js","_app/immutable/chunks/DegHwCHz.js","_app/immutable/chunks/D0QH3NT1.js","_app/immutable/chunks/BS8_HMP2.js","_app/immutable/chunks/DwtPztOd.js","_app/immutable/chunks/D7CC4F_9.js"];
export const stylesheets = ["_app/immutable/assets/19.Nz5YYXmX.css"];
export const fonts = [];
