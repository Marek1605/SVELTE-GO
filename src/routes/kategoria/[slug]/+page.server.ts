import { api } from '$lib/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const slug = params.slug;
	const queryString = url.searchParams.toString();
	
	try {
		const res = await api.getCategory(slug, queryString);
		if (res.success) {
			return {
				category: res.data.category,
				products: res.data.products,
				filters: res.data.filters
			};
		}
	} catch (e) {
		console.error('Failed to load category:', e);
	}
	
	return {
		category: null,
		products: { items: [], total: 0, page: 1, pages: 1 },
		filters: {}
	};
};
