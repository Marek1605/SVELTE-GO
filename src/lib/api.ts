import { PUBLIC_API_URL } from '$env/static/public';

const API_URL = PUBLIC_API_URL || 'http://localhost:8080/api/v1';

async function fetchApi(endpoint: string, options: RequestInit = {}) {
	const url = `${API_URL}${endpoint}`;
	try {
		const res = await fetch(url, {
			...options,
			headers: { 'Content-Type': 'application/json', ...options.headers },
		});
		return await res.json();
	} catch (error) {
		console.error('API Error:', error);
		return { success: false, error: 'Network error' };
	}
}

export const api = {
	getProducts: (params = '') => fetchApi('/products' + (params ? '?' + params : '')),
	getProduct: (id: string) => fetchApi('/products/' + id),
	getProductBySlug: (slug: string) => fetchApi('/products/slug/' + slug),
	getProductOffers: (id: string) => fetchApi('/products/' + id + '/offers'),
	getCategories: () => fetchApi('/categories'),
	getCategory: (slug: string, params = '') => fetchApi('/categories/' + slug + (params ? '?' + params : '')),
	getAttributeStats: (categoryId?: string) => fetchApi('/attributes/stats' + (categoryId ? '?category_id=' + categoryId : '')),
	getFilterSettings: (categoryId?: string) => fetchApi('/filters' + (categoryId ? '?category_id=' + categoryId : '')),
	saveFilterSettings: (data: any) => fetchApi('/filters', { method: 'POST', body: JSON.stringify(data) }),
	search: (query: string) => fetchApi('/search?search=' + encodeURIComponent(query)),
	autocomplete: (query: string) => fetchApi('/autocomplete?q=' + encodeURIComponent(query)),
	getDashboard: () => fetchApi('/admin/dashboard'),
	adminGetProducts: (params = '') => fetchApi('/admin/products' + (params ? '?' + params : '')),
	adminGetProduct: (id: string) => fetchApi('/admin/products/' + id),
	adminCreateProduct: (data: any) => fetchApi('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
	adminUpdateProduct: (id: string, data: any) => fetchApi('/admin/products/' + id, { method: 'PUT', body: JSON.stringify(data) }),
	adminDeleteProduct: (id: string) => fetchApi('/admin/products/' + id, { method: 'DELETE' }),
	adminDeleteAllProducts: () => fetchApi('/admin/products', { method: 'DELETE' }),
	adminGetCategories: () => fetchApi('/admin/categories'),
	adminGetCategory: (id: string) => fetchApi('/admin/categories/' + id),
	adminCreateCategory: (data: any) => fetchApi('/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
	adminUpdateCategory: (id: string, data: any) => fetchApi('/admin/categories/' + id, { method: 'PUT', body: JSON.stringify(data) }),
	adminDeleteCategory: (id: string) => fetchApi('/admin/categories/' + id, { method: 'DELETE' }),
	adminGetVendors: () => fetchApi('/admin/vendors'),
	getFeeds: () => fetchApi('/admin/feeds'),
	getFeed: (id: string) => fetchApi('/admin/feeds/' + id),
	createFeed: (data: any) => fetchApi('/admin/feeds', { method: 'POST', body: JSON.stringify(data) }),
	updateFeed: (id: string, data: any) => fetchApi('/admin/feeds/' + id, { method: 'PUT', body: JSON.stringify(data) }),
	deleteFeed: (id: string) => fetchApi('/admin/feeds/' + id, { method: 'DELETE' }),
	previewFeed: (data: any) => fetchApi('/admin/feeds/preview', { method: 'POST', body: JSON.stringify(data) }),
	startImport: (id: string) => fetchApi('/admin/feeds/' + id + '/import', { method: 'POST' }),
	getImportProgress: (id: string) => fetchApi('/admin/feeds/' + id + '/progress'),
	bulkDeleteProducts: (ids: string[]) => fetchApi('/admin/products/bulk', { method: 'DELETE', body: JSON.stringify({ ids }) }),
	deleteProduct: (id: string) => fetchApi('/admin/products/' + id, { method: 'DELETE' }),
};

export function formatPrice(price: number): string {
	return price.toFixed(2) + ' €';
}
