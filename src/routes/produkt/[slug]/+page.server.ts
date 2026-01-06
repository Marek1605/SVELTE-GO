import { api } from '$lib/api';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const { slug } = params;
    
    try {
        const result = await api.getProductBySlug(slug);
        
        if (!result?.success || !result?.data) {
            throw error(404, 'Produkt nenájdený');
        }
        
        const product = result.data;
        
        return {
            product,
            attributes: product.attributes || [],
            images: product.images || (product.image_url ? [product.image_url] : [])
        };
    } catch (err) {
        if (err?.status === 404) {
            throw error(404, 'Produkt nenájdený');
        }
        console.error('Error loading product:', err);
        throw error(500, 'Chyba pri načítaní produktu');
    }
}
