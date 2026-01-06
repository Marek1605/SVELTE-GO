import { api } from '$lib/api';

export async function load({ url }) {
	const params = new URLSearchParams();
	params.set('page', url.searchParams.get('page') || '1');
	params.set('limit', url.searchParams.get('limit') || '20');
	if (url.searchParams.get('search')) params.set('search', url.searchParams.get('search')!);
	
	try {
		const res = await api.getAdminProducts(params);
		return {
			products: res.success ? res.data?.items || [] : [],
			total: res.success ? res.data?.total || 0 : 0,
			page: parseInt(url.searchParams.get('page') || '1'),
			limit: 20
		};
	} catch (e) {
		return { products: [], total: 0, page: 1, limit: 20 };
	}
}
