import { api } from '$lib/api';

export async function load() {
    try {
        let categories = [];
        const catResult = await api.getCategoriesTree();
        if (catResult?.success && catResult?.data) {
            categories = Array.isArray(catResult.data) ? catResult.data : [];
        } else if (Array.isArray(catResult)) {
            categories = catResult;
        }
        
        // Popular products (most offers = most compared)
        let products = [];
        const prodResult = await api.getProducts('limit=8&sort=popular');
        if (prodResult?.success && prodResult?.data?.items) {
            products = prodResult.data.items;
        } else if (prodResult?.items) {
            products = prodResult.items;
        } else if (Array.isArray(prodResult?.data)) {
            products = prodResult.data.slice(0, 8);
        }
        
        // Count real stats
        const totalProducts = prodResult?.data?.total || prodResult?.total || products.length || 0;
        const totalCategories = categories.length || 0;
        
        return {
            categories,
            products,
            stats: {
                products: totalProducts,
                categories: totalCategories,
                shops: 0,
                updates: '24/7'
            }
        };
    } catch (err) {
        console.error('Error loading homepage:', err);
        return {
            categories: [],
            products: [],
            stats: { products: 0, categories: 0, shops: 0, updates: '24/7' }
        };
    }
}
