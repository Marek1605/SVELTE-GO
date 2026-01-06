import { PUBLIC_API_URL } from '$env/static/public';

const API_URL = PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export function formatPrice(price: number): string {
	return new Intl.NumberFormat('sk-SK', {
		style: 'currency',
		currency: 'EUR',
		minimumFractionDigits: 2
	}).format(price);
}

export const api = {
	// Stats
	async getStats() {
		const res = await fetch(`${API_URL}/stats`);
		return res.json();
	},

	// Categories
	async getCategories() {
		const res = await fetch(`${API_URL}/categories`);
		return res.json();
	},

	async getCategoriesTree() {
		const res = await fetch(`${API_URL}/categories/tree`);
		return res.json();
	},

	async getCategoryBySlug(slug: string) {
		const res = await fetch(`${API_URL}/categories/slug/${slug}`);
		return res.json();
	},

	async getProductsByCategory(slug: string, params: URLSearchParams) {
		const res = await fetch(`${API_URL}/categories/${slug}/products?${params}`);
		return res.json();
	},

	// Products
	async getProducts(params?: URLSearchParams) {
		const url = params ? `${API_URL}/products?${params}` : `${API_URL}/products`;
		const res = await fetch(url);
		return res.json();
	},

	async getFeaturedProducts() {
		const res = await fetch(`${API_URL}/products/featured`);
		return res.json();
	},

	async getProductBySlug(slug: string) {
		const res = await fetch(`${API_URL}/products/slug/${slug}`);
		return res.json();
	},

	async getProductOffers(id: string) {
		const res = await fetch(`${API_URL}/products/${id}/offers`);
		return res.json();
	},

	// Attributes
	async getAttributeStats(categoryId?: string) {
		const url = categoryId 
			? `${API_URL}/attributes/stats?category_id=${categoryId}`
			: `${API_URL}/attributes/stats`;
		const res = await fetch(url);
		return res.json();
	},

	// Admin
	async getAdminDashboard() {
		const res = await fetch(`${API_URL}/admin/dashboard`);
		return res.json();
	},

	async getAdminProducts(params?: URLSearchParams) {
		const url = params ? `${API_URL}/admin/products?${params}` : `${API_URL}/admin/products`;
		const res = await fetch(url);
		return res.json();
	},

	async deleteProduct(id: string) {
		const res = await fetch(`${API_URL}/admin/products/${id}`, { method: 'DELETE' });
		return res.json();
	},

	async bulkDeleteProducts(ids: string[]) {
		const res = await fetch(`${API_URL}/admin/products/bulk`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ ids })
		});
		return res.json();
	},

	// Feeds
	async getFeeds() {
		const res = await fetch(`${API_URL}/admin/feeds`);
		return res.json();
	},

	async createFeed(data: any) {
		const res = await fetch(`${API_URL}/admin/feeds`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});
		return res.json();
	},

	async updateFeed(id: string, data: any) {
		const res = await fetch(`${API_URL}/admin/feeds/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});
		return res.json();
	},

	async deleteFeed(id: string) {
		const res = await fetch(`${API_URL}/admin/feeds/${id}`, { method: 'DELETE' });
		return res.json();
	},

	async previewFeed(data: { url: string; type: string; xml_item_path: string }) {
		const res = await fetch(`${API_URL}/admin/feeds/preview`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});
		return res.json();
	},

	async startImport(feedId: string) {
		const res = await fetch(`${API_URL}/admin/feeds/${feedId}/import`, { method: 'POST' });
		return res.json();
	},

	async getImportProgress(feedId: string) {
		const res = await fetch(`${API_URL}/admin/feeds/${feedId}/progress`);
		return res.json();
	},

	// Filter settings
	async getFilterSettings() {
		const res = await fetch(`${API_URL}/admin/filter-settings`);
		return res.json();
	},

	async updateFilterSettings(data: any) {
		const res = await fetch(`${API_URL}/admin/filter-settings`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});
		return res.json();
	}
};

export { API_URL };
