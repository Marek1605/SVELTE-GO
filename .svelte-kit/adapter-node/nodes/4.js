import * as server from '../entries/pages/_page.server.ts.js';

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/+page.server.ts";
export const imports = ["_app/immutable/nodes/4.DrM7d-JG.js","_app/immutable/chunks/vSoWG56B.js","_app/immutable/chunks/Dysy-sLZ.js","_app/immutable/chunks/3kR5jQW9.js"];
export const stylesheets = ["_app/immutable/assets/4.CHiNi-Hl.css"];
export const fonts = [];
