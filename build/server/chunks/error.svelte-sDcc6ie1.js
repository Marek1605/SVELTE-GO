import { c as create_ssr_component, a as subscribe, d as escape } from './ssr-C0zM4PB_.js';
import { p as page } from './stores-DT-_6Fby.js';
import './ssr2-BzBrVqhc.js';
import './state.svelte-C5sH4JvD.js';

const Error = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$unsubscribe_page();
  return `<h1>${escape($page.status)}</h1> <p>${escape($page.error?.message)}</p>`;
});

export { Error as default };
//# sourceMappingURL=error.svelte-sDcc6ie1.js.map
