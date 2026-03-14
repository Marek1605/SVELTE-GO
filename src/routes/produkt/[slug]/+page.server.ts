import { api } from '$lib/api';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const { slug } = params;
    
    try {
        const result = await api.getProductBySlug(slug);
        
        if (result?.success === false) {
            if (result.status === 404) {
                throw error(404, 'Produkt nenájdený');
            }
            return {
                product: null,
                attributes: [],
                images: [],
                offers: [],
                error: result.error || 'Nepodarilo sa načítať produkt'
            };
        }
        
        const product = result?.data || result;
        
        if (!product || !product.id) {
            throw error(404, 'Produkt nenájdený');
        }
        
        // Load offers
        let offers = [];
        try {
            const offersResult = await api.getProductOffers(product.id);
            if (offersResult?.success && offersResult?.data) {
                offers = Array.isArray(offersResult.data) ? offersResult.data : (offersResult.data.offers || []);
            }
        } catch (e) {
            console.error('Error loading offers:', product.id, e);
        }
        product.offers = offers;
        
        // Load site settings
        let offersStyle = 'cards';
        let tagsStyle = 'chips';
        let priceStyle = 'default';
        try {
            const settingsResult = await api.get('/site/settings');
            if (settingsResult?.data?.offers_style) offersStyle = settingsResult.data.offers_style;
            else if (settingsResult?.offers_style) offersStyle = settingsResult.offers_style;
            if (settingsResult?.data?.tags_style) tagsStyle = settingsResult.data.tags_style;
            else if (settingsResult?.tags_style) tagsStyle = settingsResult.tags_style;
            if (settingsResult?.data?.price_style) priceStyle = settingsResult.data.price_style;
            else if (settingsResult?.price_style) priceStyle = settingsResult.price_style;
        } catch (e) {}
        
        // Determine category_id from any available field
        const categoryId = product.category_id || product.categoryId || product.CategoryID || '';
        
        let productRank = 0;
        let isAiRecommended = false;
        
        if (categoryId) {
            // Check AI recommended
            try {
                const aiRes = await api.get(`/ai/recommended/${categoryId}`);
                if (aiRes?.success && aiRes?.data?.product_id === product.id) {
                    isAiRecommended = true;
                }
            } catch (e) {}
            
            // Get rank: load category products and find position
            try {
                const catSlug = product.category_slug || product.categorySlug || '';
                
                if (catSlug) {
                    const catRes = await api.get(`/categories/${catSlug}`);
                    const catData = catRes?.data || catRes || {};
                    let catProducts = catData.products || [];
                    
                    // API may return products as object/dict, array, or string
                    if (catProducts && typeof catProducts === 'object' && !Array.isArray(catProducts)) {
                        // It's a dict/object - convert values to array
                        catProducts = Object.values(catProducts);
                    }
                    if (typeof catProducts === 'string') {
                        try { catProducts = JSON.parse(catProducts); } catch(e) { catProducts = []; }
                    }
                    if (!Array.isArray(catProducts)) {
                        catProducts = [];
                    }
                    
                    if (catProducts.length > 0) {
                        const idx = catProducts.findIndex(p => p.id === product.id);
                        if (idx >= 0) productRank = idx + 1;
                    }
                }
            } catch (e) {
                console.error('[product] Error loading rank:', e?.message || e);
            }
        }
        
        return {
            product,
            attributes: product.attributes || [],
            images: product.images || (product.image_url ? [product.image_url] : []),
            offers,
            offersStyle,
            tagsStyle,
            priceStyle,
            productRank,
            isAiRecommended
        };
    } catch (err) {
        if (err?.status) throw err;
        console.error('Error loading product:', slug, err);
        return {
            product: null,
            attributes: [],
            images: [],
            offers: [],
            error: 'Chyba pri načítaní produktu'
        };
    }
}
