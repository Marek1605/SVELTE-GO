import { api } from '$lib/api';

export async function load() {
	try {
		const res = await api.getFeeds();
		return {
			feeds: res.success ? res.data : []
		};
	} catch (e) {
		return { feeds: [] };
	}
}
