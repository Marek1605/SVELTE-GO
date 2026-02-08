

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/filters/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/10.CLS2ANTy.js","_app/immutable/chunks/DFArySuv.js","_app/immutable/chunks/BCvDt_cB.js","_app/immutable/chunks/s82JoINO.js"];
export const stylesheets = ["_app/immutable/assets/10.C2f2_owv.css"];
export const fonts = [];
