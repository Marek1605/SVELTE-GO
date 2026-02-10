import * as server from '../entries/pages/kategoria/_slug_/_page.server.ts.js';

export const index = 17;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/kategoria/_slug_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/kategoria/[slug]/+page.server.ts";
export const imports = ["_app/immutable/nodes/17.DIKTqHJD.js","_app/immutable/chunks/DegHwCHz.js","_app/immutable/chunks/BS8_HMP2.js","_app/immutable/chunks/DwtPztOd.js","_app/immutable/chunks/DZokexwm.js","_app/immutable/chunks/CodC8iEl.js","_app/immutable/chunks/DcdZDViH.js","_app/immutable/chunks/CvbFZo7z.js"];
export const stylesheets = ["_app/immutable/assets/17.8UcdqEYZ.css"];
export const fonts = [];
