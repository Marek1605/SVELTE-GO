import { api } from '$lib/api';
import { error } from '@sveltejs/kit';

export async function load({ params, url }) {
	const { slug } = params;
	
	// Get query params
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '24');
	const sort = url.searchParams.get('sort') || 'newest';
	const minPrice = url.searchParams.get('min_price') || '';
	const maxPrice = url.searchParams.get('max_price') || '';
	const brand = url.searchParams.get('brand') || '';
	
	try {
		// Try new full endpoint first
		const queryParams = new URLSearchParams();
		queryParams.set('page', page.toString());
		queryParams.set('limit', limit.toString());
		queryParams.set('sort', sort);
		if (minPrice) queryParams.set('min_price', minPrice);
		if (maxPrice) queryParams.set('max_price', maxPrice);
		if (brand) queryParams.set('brand', brand);
		
		let categoryData;
		
		try {
			// Try new endpoint with full hierarchy
			categoryData = await api.getCategoryFull(slug + '?' + queryParams.toString());
		} catch (e) {
			// Fallback to old endpoint
			categoryData = await api.getCategory(slug + '?' + queryParams.toString());
		}
		
		if (!categoryData?.success) {
			throw error(404, 'Kategória nenájdená');
		}
		
		const data = categoryData.data;
		
		return {
			category: data.category || data,
			ancestors: data.ancestors || [],
			children: data.children || [],
			products: data.products || [],
			total: data.total || 0,
			page: data.page || page,
			limit: data.limit || limit,
			total_pages: data.total_pages || Math.ceil((data.total || 0) / limit),
			brands: data.brands || [],
			filters: {
				minPrice,
				maxPrice,
				brand,
				sort
			}
		};
	} catch (err: any) {
		if (err?.status === 404) {
			throw error(404, 'Kategória nenájdená');
		}
		console.error('Error loading category:', err);
		throw error(500, 'Chyba pri načítaní kategórie');
	}
}
