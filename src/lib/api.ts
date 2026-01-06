import { PUBLIC_API_URL } from '$env/static/public';

const API_URL = PUBLIC_API_URL || 'http://localhost:8080/api/v1';

async function fetchApi(endpoint, options = {}) {
        const url = API_URL + endpoint;
        const defaultOptions = { headers: { 'Content-Type': 'application/json', ...options.headers } };
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
        getProducts: (params = '') => fetchApi('/products' + (params ? '?' + params : '')),
        getProduct: (slug) => fetchApi('/products/slug/' + slug),
        getProductDetail: (slug) => fetchApi('/products/slug/' + slug + '/detail'),
        getProductOffers: (id) => fetchApi('/products/' + id + '/offers'),
        getCategories: () => fetchApi('/categories'),
        getCategoriesTree: () => fetchApi('/categories/tree'),
        getCategory: (slug, params = '') => fetchApi('/categories/' + slug + (params ? '?' + params : '')),
        getCategoryFull: (slug, params = '') => fetchApi('/categories/' + slug + '/full' + (params ? '?' + params : '')),
        getAttributeStats: (categoryId) => fetchApi('/attributes/stats' + (categoryId ? '?category_id=' + categoryId : '')),
        getFilterSettings: () => fetchApi('/filters'),
        saveFilterSettings: (data) => fetchApi('/filters', { method: 'POST', body: JSON.stringify(data) }),
        search: (query) => fetchApi('/search?q=' + encodeURIComponent(query)),
        autocomplete: (query) => fetchApi('/autocomplete?q=' + encodeURIComponent(query)),
        getDashboard: () => fetchApi('/admin/dashboard'),
        adminGetProducts: (params = '') => fetchApi('/admin/products' + (params ? '?' + params : '')),
        adminGetProduct: (id) => fetchApi('/admin/products/' + id),
        adminCreateProduct: (data) => fetchApi('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
        adminUpdateProduct: (id, data) => fetchApi('/admin/products/' + id, { method: 'PUT', body: JSON.stringify(data) }),
        adminDeleteProduct: (id) => fetchApi('/admin/products/' + id, { method: 'DELETE' }),
        adminDeleteAllProducts: () => fetchApi('/admin/products', { method: 'DELETE' }),
        getFeeds: () => fetchApi('/admin/feeds'),
        getFeed: (id) => fetchApi('/admin/feeds/' + id),
        createFeed: (data) => fetchApi('/admin/feeds', { method: 'POST', body: JSON.stringify(data) }),
        updateFeed: (id, data) => fetchApi('/admin/feeds/' + id, { method: 'PUT', body: JSON.stringify(data) }),
        deleteFeed: (id) => fetchApi('/admin/feeds/' + id, { method: 'DELETE' }),
        previewFeed: (data) => fetchApi('/admin/feeds/preview', { method: 'POST', body: JSON.stringify(data) }),
        startImport: (id) => fetchApi('/admin/feeds/' + id + '/import', { method: 'POST' }),
        getImportProgress: (id) => fetchApi('/admin/feeds/' + id + '/progress')
};

export function formatPrice(price) {
        if (price === null || price === undefined) return '0,00 €';
        return price.toFixed(2).replace('.', ',') + ' €';
}

export default api;
