

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/offers/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/10.Cuo0vN6D.js","_app/immutable/chunks/vSoWG56B.js","_app/immutable/chunks/Dysy-sLZ.js","_app/immutable/chunks/3kR5jQW9.js"];
export const stylesheets = ["_app/immutable/assets/10.CsRJGQdZ.css"];
export const fonts = [];
