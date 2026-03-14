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
                product: null, attributes: [], images: [], offers: [],
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
        } catch (e) {}
        product.offers = offers;
        
        // Load site settings
        let offersStyle = 'cards', tagsStyle = 'chips', priceStyle = 'default';
        try {
            const s = await api.get('/site/settings');
            offersStyle = s?.data?.offers_style || s?.offers_style || 'cards';
            tagsStyle = s?.data?.tags_style || s?.tags_style || 'chips';
            priceStyle = s?.data?.price_style || s?.price_style || 'default';
        } catch (e) {}
        
        // Rank and AI recommended come directly from product API
        const productRank = product.product_rank || 0;
        const isAiRecommended = product.is_ai_recommended || false;
        
        return {
            product,
            attributes: product.attributes || [],
            images: product.images || (product.image_url ? [product.image_url] : []),
            offers,
            offersStyle, tagsStyle, priceStyle,
            productRank,
            isAiRecommended
        };
    } catch (err) {
        if (err?.status) throw err;
        console.error('Error loading product:', slug, err);
        return {
            product: null, attributes: [], images: [], offers: [],
            error: 'Chyba pri načítaní produktu'
        };
    }
}
