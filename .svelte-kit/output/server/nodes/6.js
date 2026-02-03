

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/categories/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/6.-RKdZRG5.js","_app/immutable/chunks/vSoWG56B.js","_app/immutable/chunks/Dysy-sLZ.js","_app/immutable/chunks/3kR5jQW9.js"];
export const stylesheets = ["_app/immutable/assets/6.D332XUwe.css"];
export const fonts = [];
