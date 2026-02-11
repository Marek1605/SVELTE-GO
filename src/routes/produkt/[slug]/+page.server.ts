import { api } from '$lib/api';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const { slug } = params;
    
    try {
        const result = await api.getProductBySlug(slug);
        
        // Handle API error response
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
        
        // Get product from response
        const product = result?.data || result;
        
        if (!product || !product.id) {
            throw error(404, 'Produkt nenájdený');
        }
        
        // Load offers for this product
        let offers = [];
        try {
            const offersResult = await api.getProductOffers(product.id);
            if (offersResult?.success && offersResult?.data) {
                offers = Array.isArray(offersResult.data) ? offersResult.data : (offersResult.data.offers || []);
            }
        } catch (e) {
            console.error('Error loading offers for product:', product.id, e);
        }
        
        // Attach offers to product so the component can access them via product.offers
        product.offers = offers;
        
        return {
            product,
            attributes: product.attributes || [],
            images: product.images || (product.image_url ? [product.image_url] : []),
            offers
        };
    } catch (err) {
        if (err?.status) {
            throw err;
        }
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
