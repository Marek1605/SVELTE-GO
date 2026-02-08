import { PUBLIC_API_URL } from '$env/static/public';

const API_URL = PUBLIC_API_URL || 'http://localhost:8080/api/v1';

async function fetchApi(endpoint, options = {}) {
    const url = API_URL + endpoint;
    try {
        const response = await fetch(url, { 
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options 
        });
        
        const data = await response.json().catch(() => null);
        
        if (!response.ok) {
            console.error('API Error:', endpoint, response.status, data);
            return { 
                success: false, 
                error: data?.error || 'API request failed: ' + response.status,
                status: response.status
            };
        }
        
        // Wrap in success format if not already
        if (data && typeof data === 'object' && !('success' in data)) {
            return { success: true, data: data };
        }
        
        return data;
    } catch (error) {
        console.error('API Fetch Error:', endpoint, error.message);
        return { 
            success: false, 
            error: error.message || 'Network error',
            status: 0
        };
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
    return Number(price).toFixed(2).replace('.', ',') + ' €';
}

export default api;

// Admin delete functions
api.deleteAllCategories = () => fetchApi('/admin/categories/all', { method: 'DELETE' });
api.deleteAllProducts = () => fetchApi('/admin/products/all', { method: 'DELETE' });

// Generic API methods for AI settings and other dynamic endpoints
api.get = (endpoint) => fetchApi(endpoint);
api.post = (endpoint, data) => fetchApi(endpoint, { method: 'POST', body: JSON.stringify(data) });
api.put = (endpoint, data) => fetchApi(endpoint, { method: 'PUT', body: JSON.stringify(data) });
api.delete = (endpoint) => fetchApi(endpoint, { method: 'DELETE' });
