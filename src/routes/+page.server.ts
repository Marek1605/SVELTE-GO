import { api } from '$lib/api';

export async function load({ fetch }) {
	try {
		const [statsRes, categoriesRes, productsRes] = await Promise.all([
			api.getStats().catch(() => ({ success: false })),
			api.getCategoriesTree().catch(() => ({ success: false })),
			api.getFeaturedProducts().catch(() => ({ success: false }))
		]);

		return {
			stats: statsRes.success ? statsRes.data : null,
			categories: categoriesRes.success ? categoriesRes.data : [],
			products: productsRes.success ? productsRes.data : []
		};
	} catch (e) {
		return {
			stats: null,
			categories: [],
			products: []
		};
	}
}
