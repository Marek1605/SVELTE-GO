import { api } from '$lib/api';

export async function load({ fetch }) {
	try {
		const [categoriesRes, productsRes] = await Promise.all([
			api.getCategories().catch(() => ({ success: false })),
			api.getProducts('limit=8').catch(() => ({ success: false }))
		]);

		return {
			stats: {
				products: productsRes.success ? productsRes.data?.total || 0 : 0,
				categories: categoriesRes.success ? categoriesRes.data?.length || 0 : 0
			},
			categories: categoriesRes.success ? categoriesRes.data : [],
			products: productsRes.success ? productsRes.data?.items || [] : []
		};
	} catch (e) {
		console.error('Homepage load error:', e);
		return {
			stats: null,
			categories: [],
			products: []
		};
	}
}
