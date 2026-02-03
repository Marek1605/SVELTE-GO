

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.CCyxvV6m.js","_app/immutable/chunks/vSoWG56B.js","_app/immutable/chunks/3kR5jQW9.js","_app/immutable/chunks/BSOId-2s.js","_app/immutable/chunks/CqQQmUBq.js"];
export const stylesheets = ["_app/immutable/assets/5.dm4t25-O.css"];
export const fonts = [];
