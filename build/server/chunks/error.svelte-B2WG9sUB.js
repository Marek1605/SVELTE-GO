import { c as create_ssr_component, b as subscribe, f as escape } from './ssr-gQyPUVaC.js';
import { p as page } from './stores-Bj-s4BaA.js';
import './ssr2-BzBrVqhc.js';
import './state.svelte-C5sH4JvD.js';

const Error = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$unsubscribe_page();
  return `<h1>${escape($page.status)}</h1> <p>${escape($page.error?.message)}</p>`;
});

export { Error as default };
//# sourceMappingURL=error.svelte-B2WG9sUB.js.map
