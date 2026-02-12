

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.D-J7o8cZ.js","_app/immutable/chunks/DegHwCHz.js","_app/immutable/chunks/DwtPztOd.js","_app/immutable/chunks/D7CC4F_9.js"];
export const stylesheets = ["_app/immutable/assets/5.dm4t25-O.css"];
export const fonts = [];
