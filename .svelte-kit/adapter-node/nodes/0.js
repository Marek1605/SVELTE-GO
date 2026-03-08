import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/nodes/0.BiNGFZHb.js","_app/immutable/chunks/DGgboO4P.js","_app/immutable/chunks/CbG7B7V5.js","_app/immutable/chunks/C_DwOGRg.js","_app/immutable/chunks/DL2c-URW.js","_app/immutable/chunks/B7V5RW9k.js","_app/immutable/chunks/BhXPZtR1.js"];
export const stylesheets = ["_app/immutable/assets/0.B5WPhZje.css"];
export const fonts = [];
