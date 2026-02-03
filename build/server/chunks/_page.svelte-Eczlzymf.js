import { c as create_ssr_component, a as subscribe, e as each, b as add_attribute, d as escape } from './ssr-C0zM4PB_.js';
import './ssr2-BzBrVqhc.js';
import './state.svelte-C5sH4JvD.js';
import { w as writable } from './index-BSCJd5Mz.js';

const feedPreview = writable(null);
const previewLoading = writable(false);
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $previewLoading, $$unsubscribe_previewLoading;
  let $$unsubscribe_feedPreview;
  $$unsubscribe_previewLoading = subscribe(previewLoading, (value) => $previewLoading = value);
  $$unsubscribe_feedPreview = subscribe(feedPreview, (value) => value);
  let feedUrl = "";
  let xmlItemPath = "SHOPITEM";
  let step = 1;
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `${$$result.head += `<!-- HEAD_svelte-1b5ayv2_START -->${$$result.title = `<title>Nový feed - Feed Importer</title>`, ""}<!-- HEAD_svelte-1b5ayv2_END -->`, ""} <div class="container mx-auto px-4 py-8 max-w-5xl"> <div class="mb-8" data-svelte-h="svelte-1v2rrb7"><a href="/admin/feeds" class="text-indigo-600 hover:text-indigo-800 text-sm mb-2 inline-flex items-center gap-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
            Späť na zoznam</a> <h1 class="text-3xl font-bold text-gray-900">Nový feed</h1></div>  <div class="flex items-center mb-8">${each([1, 2, 3], (s) => {
      return `<div class="flex items-center"><div class="${"w-10 h-10 rounded-full flex items-center justify-center font-medium " + escape(
        step >= s ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600",
        true
      )}">${escape(s)}</div> ${s < 3 ? `<div class="${"w-16 h-1 mx-2 " + escape(step > s ? "bg-indigo-600" : "bg-gray-200", true)}"></div>` : ``} </div>`;
    })} <div class="ml-4 text-sm text-gray-600">${`Načítanie feedu`}</div></div>  ${``}  ${`<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6"><h2 class="text-xl font-semibold text-gray-900 mb-6" data-svelte-h="svelte-enh83f">1. Zadajte URL feedu</h2> <div class="space-y-6"><div><label class="block text-sm font-medium text-gray-700 mb-2" data-svelte-h="svelte-12p9mpu">URL feedu *</label> <input type="url" placeholder="https://example.com/feed.xml" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"${add_attribute("value", feedUrl, 0)}></div> <div class="grid grid-cols-2 gap-6"><div><label class="block text-sm font-medium text-gray-700 mb-2" data-svelte-h="svelte-1j3r870">Typ feedu</label> <select class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"><option value="" data-svelte-h="svelte-14sbojh">Auto-detect</option><option value="xml" data-svelte-h="svelte-1d9somo">XML</option><option value="csv" data-svelte-h="svelte-12id4vm">CSV</option><option value="json" data-svelte-h="svelte-1eaf7re">JSON</option></select></div> ${`<div><label class="block text-sm font-medium text-gray-700 mb-2" data-svelte-h="svelte-392ns7">XML Item Path</label> <input type="text" placeholder="SHOPITEM" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"${add_attribute("value", xmlItemPath, 0)}></div>`} ${``}</div> <div class="flex justify-end"><button ${"disabled"} class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">${$previewLoading ? `<div class="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                            Načítavam...` : `Načítať a pokračovať
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`}</button></div></div></div>`}  ${``}  ${``}</div>`;
  } while (!$$settled);
  $$unsubscribe_previewLoading();
  $$unsubscribe_feedPreview();
  return $$rendered;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-Eczlzymf.js.map
