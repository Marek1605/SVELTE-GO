

export const index = 20;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/vendor-dashboard/konverzie/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/20.EfybJBnN.js","_app/immutable/chunks/62sxw8SM.js","_app/immutable/chunks/DldpiVGX.js","_app/immutable/chunks/CanS3UQf.js"];
export const stylesheets = ["_app/immutable/assets/20.5bNpOr3d.css"];
export const fonts = [];
