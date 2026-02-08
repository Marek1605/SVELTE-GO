import * as server from '../entries/pages/kategoria/_slug_/_page.server.ts.js';

export const index = 17;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/kategoria/_slug_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/kategoria/[slug]/+page.server.ts";
export const imports = ["_app/immutable/nodes/17.BicT1JH1.js","_app/immutable/chunks/DFArySuv.js","_app/immutable/chunks/BCvDt_cB.js","_app/immutable/chunks/s82JoINO.js","_app/immutable/chunks/BHaQRAdm.js","_app/immutable/chunks/CqQQmUBq.js","_app/immutable/chunks/DIl3ZwIa.js","_app/immutable/chunks/BpLCBJTw.js","_app/immutable/chunks/CLJYrkef.js"];
export const stylesheets = ["_app/immutable/assets/17.8UcdqEYZ.css"];
export const fonts = [];
