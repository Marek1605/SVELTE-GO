

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/categories/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/6.BA-hFo2r.js","_app/immutable/chunks/62sxw8SM.js","_app/immutable/chunks/DldpiVGX.js","_app/immutable/chunks/CanS3UQf.js"];
export const stylesheets = ["_app/immutable/assets/6.D332XUwe.css"];
export const fonts = [];
