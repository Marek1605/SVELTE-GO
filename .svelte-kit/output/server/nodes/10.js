

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/filters/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/10.CMtO4bk3.js","_app/immutable/chunks/DegHwCHz.js","_app/immutable/chunks/BS8_HMP2.js","_app/immutable/chunks/DwtPztOd.js"];
export const stylesheets = ["_app/immutable/assets/10.C2f2_owv.css"];
export const fonts = [];
