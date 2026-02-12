

export const index = 7;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/categories/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/7.CA9FQn_q.js","_app/immutable/chunks/DegHwCHz.js","_app/immutable/chunks/BS8_HMP2.js","_app/immutable/chunks/DwtPztOd.js"];
export const stylesheets = ["_app/immutable/assets/7.B-SLHxCx.css"];
export const fonts = [];
