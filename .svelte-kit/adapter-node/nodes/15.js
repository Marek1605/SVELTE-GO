import * as server from '../entries/pages/kategoria/_slug_/_page.server.ts.js';

export const index = 15;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/kategoria/_slug_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/kategoria/[slug]/+page.server.ts";
export const imports = ["_app/immutable/nodes/15.DHKUbX8q.js","_app/immutable/chunks/vSoWG56B.js","_app/immutable/chunks/Dysy-sLZ.js","_app/immutable/chunks/3kR5jQW9.js","_app/immutable/chunks/BSOId-2s.js","_app/immutable/chunks/CqQQmUBq.js","_app/immutable/chunks/PYawpRMu.js","_app/immutable/chunks/u4Us65iY.js"];
export const stylesheets = ["_app/immutable/assets/15.D3cqhzpV.css"];
export const fonts = [];
