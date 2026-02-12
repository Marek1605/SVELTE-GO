import * as server from '../entries/pages/kategoria/_slug_/_page.server.ts.js';

export const index = 17;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/kategoria/_slug_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/kategoria/[slug]/+page.server.ts";
export const imports = ["_app/immutable/nodes/17.BVCl0E9-.js","_app/immutable/chunks/DegHwCHz.js","_app/immutable/chunks/D0QH3NT1.js","_app/immutable/chunks/BS8_HMP2.js","_app/immutable/chunks/DwtPztOd.js","_app/immutable/chunks/D7CC4F_9.js","_app/immutable/chunks/BBG6Qqdj.js","_app/immutable/chunks/DESAkHRw.js","_app/immutable/chunks/CaMOcnVO.js"];
export const stylesheets = ["_app/immutable/assets/17.Bwf9yh3X.css"];
export const fonts = [];
