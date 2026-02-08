import { g as getContext } from './ssr-gQyPUVaC.js';
import './ssr2-BzBrVqhc.js';
import './state.svelte-C5sH4JvD.js';

const getStores = () => {
  const stores = getContext("__svelte__");
  return {
    /** @type {typeof page} */
    page: {
      subscribe: stores.page.subscribe
    },
    /** @type {typeof navigating} */
    navigating: {
      subscribe: stores.navigating.subscribe
    },
    /** @type {typeof updated} */
    updated: stores.updated
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};

export { page as p };
//# sourceMappingURL=stores-Bj-s4BaA.js.map
