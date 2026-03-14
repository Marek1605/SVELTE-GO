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
        
        // Load product rank in category (server-side = reliable)
        let productRank = 0;
        let isAiRecommended = false;
        
        if (product.category_id) {
            // Get AI recommended for this category
            try {
                const aiRes = await api.get(`/ai/recommended/${product.category_id}`);
                if (aiRes?.success && aiRes?.data?.product_id === product.id) {
                    isAiRecommended = true;
                }
            } catch (e) {}
            
            // Get category products to determine rank
            try {
                const catSlug = product.category_slug;
                if (catSlug) {
                    const catRes = await api.get(`/categories/${catSlug}`);
                    const catProducts = catRes?.data?.products || catRes?.products || [];
                    const idx = catProducts.findIndex(p => p.id === product.id);
                    if (idx >= 0) productRank = idx + 1;
                }
            } catch (e) {
                console.error('Error loading rank:', e);
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
