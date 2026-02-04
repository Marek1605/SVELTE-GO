

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/offers/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/10.iwSOKV9o.js","_app/immutable/chunks/62sxw8SM.js","_app/immutable/chunks/DldpiVGX.js","_app/immutable/chunks/CanS3UQf.js"];
export const stylesheets = ["_app/immutable/assets/10.CsRJGQdZ.css"];
export const fonts = [];
