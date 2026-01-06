import { api } from '$lib/api';

export async function load({ url }) {
	const page = parseInt(url.searchParams.get('page') || '1');
	const search = url.searchParams.get('search') || '';
	
	const params = `page=${page}&limit=20${search ? '&search=' + encodeURIComponent(search) : ''}`;
	
	try {
		const res = await api.adminGetProducts(params);
		if (res.success) {
			return {
				products: res.data.items || [],
				total: res.data.total || 0,
				page: res.data.page || 1
			};
		}
	} catch (e) {
		console.error('Admin products load error:', e);
	}
	
	return {
		products: [],
		total: 0,
		page: 1
	};
}
