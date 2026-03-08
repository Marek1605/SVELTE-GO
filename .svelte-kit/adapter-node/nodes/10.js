

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/filters/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/10.2MbcHBm0.js","_app/immutable/chunks/DGgboO4P.js","_app/immutable/chunks/C_DwOGRg.js","_app/immutable/chunks/CbG7B7V5.js","_app/immutable/chunks/SZVjhAj8.js"];
export const stylesheets = ["_app/immutable/assets/10.C2f2_owv.css"];
export const fonts = [];
