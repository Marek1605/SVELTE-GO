const node_env = globalThis.process?.env?.NODE_ENV;
var DEV = node_env && !node_env.toLowerCase().startsWith('prod');

const text_encoder = new TextEncoder();
new TextDecoder();

export { DEV as D, text_encoder as t };
//# sourceMappingURL=utils-DmZwNubP.js.map
