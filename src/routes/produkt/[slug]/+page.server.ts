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
            // Return empty product with error instead of throwing
            return {
                product: null,
                attributes: [],
                images: [],
                error: result.error || 'Nepodarilo sa načítať produkt'
            };
        }
        
        // Get product from response
        const product = result?.data || result;
        
        if (!product || !product.id) {
            throw error(404, 'Produkt nenájdený');
        }
        
        return {
            product,
            attributes: product.attributes || [],
            images: product.images || (product.image_url ? [product.image_url] : [])
        };
    } catch (err) {
        // If it's already a SvelteKit error, re-throw it
        if (err?.status) {
            throw err;
        }
        console.error('Error loading product:', slug, err);
        // Return empty product instead of throwing 500
        return {
            product: null,
            attributes: [],
            images: [],
            error: 'Chyba pri načítaní produktu'
        };
    }
}
