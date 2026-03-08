

export const index = 16;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/settings/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/16.CgnKLz3E.js","_app/immutable/chunks/DGgboO4P.js","_app/immutable/chunks/CbG7B7V5.js","_app/immutable/chunks/SZVjhAj8.js"];
export const stylesheets = ["_app/immutable/assets/16.By2qU7FW.css"];
export const fonts = [];
