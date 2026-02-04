import * as server from '../entries/pages/kategoria/_slug_/_page.server.ts.js';

export const index = 15;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/kategoria/_slug_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/kategoria/[slug]/+page.server.ts";
export const imports = ["_app/immutable/nodes/15.DvHwqpQT.js","_app/immutable/chunks/62sxw8SM.js","_app/immutable/chunks/DldpiVGX.js","_app/immutable/chunks/CanS3UQf.js","_app/immutable/chunks/BSOId-2s.js","_app/immutable/chunks/CqQQmUBq.js","_app/immutable/chunks/BgEU-LZt.js","_app/immutable/chunks/CsU7STv7.js"];
export const stylesheets = ["_app/immutable/assets/15.8UcdqEYZ.css"];
export const fonts = [];
