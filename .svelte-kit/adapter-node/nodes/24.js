import * as server from '../entries/pages/kategoria/_slug_/_page.server.ts.js';

export const index = 24;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/kategoria/_slug_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/kategoria/[slug]/+page.server.ts";
export const imports = ["_app/immutable/nodes/24.B_WQqXUe.js","_app/immutable/chunks/DGgboO4P.js","_app/immutable/chunks/D0QH3NT1.js","_app/immutable/chunks/C_DwOGRg.js","_app/immutable/chunks/CbG7B7V5.js","_app/immutable/chunks/6Gw1KJqh.js","_app/immutable/chunks/Bt-Xh7oU.js","_app/immutable/chunks/B7V5RW9k.js","_app/immutable/chunks/BhXPZtR1.js","_app/immutable/chunks/DL2c-URW.js"];
export const stylesheets = ["_app/immutable/assets/24._ptM5JMh.css"];
export const fonts = [];
