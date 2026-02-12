import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/nodes/0.CrS4Vyse.js","_app/immutable/chunks/DegHwCHz.js","_app/immutable/chunks/DwtPztOd.js","_app/immutable/chunks/BS8_HMP2.js","_app/immutable/chunks/CaMOcnVO.js","_app/immutable/chunks/BBG6Qqdj.js","_app/immutable/chunks/DESAkHRw.js"];
export const stylesheets = ["_app/immutable/assets/0.CQHcm-bd.css"];
export const fonts = [];
