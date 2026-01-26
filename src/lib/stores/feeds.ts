import { writable } from 'svelte/store';

export const feeds = writable([]);
export const feedsLoading = writable(false);
export const feedsError = writable(null);
export const currentFeed = writable(null);
export const feedPreview = writable(null);
export const previewLoading = writable(false);
export const importProgress = writable({});
export const targetFields = writable([]);
export const transformTypes = writable([]);
