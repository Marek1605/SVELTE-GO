import { api } from '$lib/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const slug = params.slug;
	
	try {
		const res = await api.getProductBySlug(slug);
		if (res.success) {
			return {
				product: res.data
			};
		}
	} catch (e) {
		console.error('Failed to load product:', e);
	}
	
	return {
		product: null
	};
};
