import { PUBLIC_API_URL } from '$env/static/public';

const API_URL = PUBLIC_API_URL || 'http://localhost:8080/api/v1';

async function fetchApi(endpoint, options = {}) {
    const url = API_URL + endpoint;
    try {
        const response = await fetch(url, { 
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options 
        });
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
    getProductBySlug: (slug) => fetchApi('/products/slug/' + slug),
    getProductOffers: (id) => fetchApi('/products/' + id + '/offers'),
    getCategories: () => fetchApi('/categories'),
    getCategoriesTree: () => fetchApi('/categories/tree'),
    getCategory: (slug, params = '') => fetchApi('/categories/' + slug + (params ? '?' + params : '')),
    getCategoryFull: (slug, params = '') => fetchApi('/categories/' + slug + '/full' + (params ? '?' + params : '')),
    getAttributeStats: () => fetchApi('/attributes/stats'),
    getFilterSettings: () => fetchApi('/filters'),
    saveFilterSettings: (data) => fetchApi('/filters', { method: 'POST', body: JSON.stringify(data) }),
    search: (query) => fetchApi('/search?q=' + encodeURIComponent(query)),
    getDashboard: () => fetchApi('/admin/dashboard'),
    getFeeds: () => fetchApi('/admin/feeds'),
    createFeed: (data) => fetchApi('/admin/feeds', { method: 'POST', body: JSON.stringify(data) }),
    startImport: (id) => fetchApi('/admin/feeds/' + id + '/import', { method: 'POST' }),
    getImportProgress: (id) => fetchApi('/admin/feeds/' + id + '/progress')
};

export function formatPrice(price) {
    if (price === null || price === undefined) return '0,00 €';
    return price.toFixed(2).replace('.', ',') + ' €';
}

export default api;
