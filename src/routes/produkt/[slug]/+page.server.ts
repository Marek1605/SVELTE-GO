import { api } from '$lib/api';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const { slug } = params;
	
	try {
		// Load product detail with offers
		const [detailRes, offersRes] = await Promise.all([
			api.getProductDetail(slug),
			api.getProductOffers(slug).catch(() => ({ data: { offers: [] } }))
		]);
		
		if (!detailRes?.success || !detailRes?.data?.product) {
			throw error(404, 'Produkt nenájdený');
		}
		
		const { product, category, ancestors, attributes } = detailRes.data;
		const offers = offersRes?.data?.offers || [];
		
		// If no offers from offers endpoint, create one from product data
		if (offers.length === 0 && product.price_min) {
			offers.push({
				id: product.id,
				product_id: product.id,
				vendor_id: 'default',
				vendor_name: 'MegaPrice.sk',
				vendor_logo: null,
				vendor_rating: 4.8,
				vendor_reviews: 1250,
				price: product.price_min,
				shipping_price: product.price_min >= 49 ? 0 : 2.99,
				delivery_days: '1-2',
				stock_status: 'instock',
				stock_quantity: 10,
				affiliate_url: null,
				is_megabuy: true,
				can_add_to_cart: true,
				is_best_price: true,
				position: 1
			});
		}
		
		return {
			product,
			category,
			ancestors,
			attributes,
			offers
		};
	} catch (err: any) {
		if (err?.status === 404) {
			throw error(404, 'Produkt nenájdený');
		}
		console.error('Error loading product:', err);
		throw error(500, 'Chyba pri načítaní produktu');
	}
}
