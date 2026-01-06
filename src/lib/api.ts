import { PUBLIC_API_URL } from '$env/static/public';

const API_URL = PUBLIC_API_URL || 'http://localhost:8080/api/v1';

async function fetchApi(endpoint: string, options: RequestInit = {}) {
	const url = API_URL + endpoint;
	
	const defaultOptions: RequestInit = {
		headers: {
			'Content-Type': 'application/json',
			...options.headers
		}
	};
	
	try {
		const response = await fetch(url, { ...defaultOptions, ...options });
		
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.error || 'API request failed: ' + response.status);
		}
		
		return await response.json();
	} catch (error) {
		console.error('API Error:', endpoint, error);
		throw error;
	}
}

export const api = {
	// =====================
	// PRODUCTS
	// =====================
	getProducts: (params = '') => fetchApi('/products' + (params ? '?' + params : '')),
	getProduct: (slug: string) => fetchApi('/products/' + slug),
	getProductBySlug: (slug: string) => fetchApi('/products/' + slug),
	getProductDetail: (slug: string) => fetchApi('/products/' + slug + '/detail'),
	getProductOffers: (slugOrId: string) => fetchApi('/products/' + slugOrId + '/offers'),
	
	// =====================
	// CATEGORIES
	// =====================
	getCategories: () => fetchApi('/categories'),
	getCategoriesTree: () => fetchApi('/categories/tree'),
	getCategory: (slug: string) => fetchApi('/categories/' + slug),
	getCategoryFull: (slug: string) => fetchApi('/categories/' + slug + '/full'),
	
	// =====================
	// ATTRIBUTES & FILTERS
	// =====================
	getAttributeStats: (categoryId?: string) => fetchApi('/attributes/stats' + (categoryId ? '?category_id=' + categoryId : '')),
	getFilterSettings: () => fetchApi('/filters'),
	saveFilterSettings: (data: any) => fetchApi('/filters', { method: 'POST', body: JSON.stringify(data) }),
	
	// =====================
	// SEARCH
	// =====================
	search: (query: string) => fetchApi('/search?q=' + encodeURIComponent(query)),
	autocomplete: (query: string) => fetchApi('/autocomplete?q=' + encodeURIComponent(query)),
	
	// =====================
	// ADMIN - DASHBOARD
	// =====================
	getDashboard: () => fetchApi('/admin/dashboard'),
	
	// =====================
	// ADMIN - PRODUCTS
	// =====================
	adminGetProducts: (params = '') => fetchApi('/admin/products' + (params ? '?' + params : '')),
	adminGetProduct: (id: string) => fetchApi('/admin/products/' + id),
	adminCreateProduct: (data: any) => fetchApi('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
	adminUpdateProduct: (id: string, data: any) => fetchApi('/admin/products/' + id, { method: 'PUT', body: JSON.stringify(data) }),
	adminDeleteProduct: (id: string) => fetchApi('/admin/products/' + id, { method: 'DELETE' }),
	adminDeleteAllProducts: () => fetchApi('/admin/products', { method: 'DELETE' }),
	bulkDeleteProducts: (ids: string[]) => fetchApi('/admin/products/bulk', { method: 'DELETE', body: JSON.stringify({ ids }) }),
	deleteProduct: (id: string) => fetchApi('/admin/products/' + id, { method: 'DELETE' }),
	
	// =====================
	// ADMIN - CATEGORIES
	// =====================
	adminGetCategories: () => fetchApi('/admin/categories'),
	adminGetCategory: (id: string) => fetchApi('/admin/categories/' + id),
	adminCreateCategory: (data: any) => fetchApi('/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
	adminUpdateCategory: (id: string, data: any) => fetchApi('/admin/categories/' + id, { method: 'PUT', body: JSON.stringify(data) }),
	adminDeleteCategory: (id: string) => fetchApi('/admin/categories/' + id, { method: 'DELETE' }),
	
	// =====================
	// ADMIN - VENDORS
	// =====================
	adminGetVendors: () => fetchApi('/admin/vendors'),
	
	// =====================
	// FEEDS
	// =====================
	getFeeds: () => fetchApi('/admin/feeds'),
	getFeed: (id: string) => fetchApi('/admin/feeds/' + id),
	createFeed: (data: any) => fetchApi('/admin/feeds', { method: 'POST', body: JSON.stringify(data) }),
	updateFeed: (id: string, data: any) => fetchApi('/admin/feeds/' + id, { method: 'PUT', body: JSON.stringify(data) }),
	deleteFeed: (id: string) => fetchApi('/admin/feeds/' + id, { method: 'DELETE' }),
	previewFeed: (id: string) => fetchApi('/admin/feeds/' + id + '/preview', { method: 'POST' }),
	startImport: (id: string) => fetchApi('/admin/feeds/' + id + '/import', { method: 'POST' }),
	getImportProgress: (id: string) => fetchApi('/admin/feeds/' + id + '/progress')
};

// =====================
// UTILITY FUNCTIONS
// =====================
export function formatPrice(price: number | null | undefined): string {
	if (price === null || price === undefined) return '0,00 €';
	return price.toFixed(2).replace('.', ',') + ' €';
}

export function formatNumber(num: number): string {
	return num.toLocaleString('sk-SK');
}

export function slugify(text: string): string {
	return text
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');
}

export default api;
