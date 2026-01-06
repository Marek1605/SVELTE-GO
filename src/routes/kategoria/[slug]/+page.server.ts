import { api } from '$lib/api';
import { error } from '@sveltejs/kit';

export async function load({ params, url }) {
        const { slug } = params;
        
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '24');
        const sort = url.searchParams.get('sort') || 'newest';
        const minPrice = url.searchParams.get('min_price') || '';
        const maxPrice = url.searchParams.get('max_price') || '';
        const brand = url.searchParams.get('brand') || '';

        try {
                const queryParams = new URLSearchParams();
                queryParams.set('page', page.toString());
                queryParams.set('limit', limit.toString());
                queryParams.set('sort', sort);
                if (minPrice) queryParams.set('min_price', minPrice);
                if (maxPrice) queryParams.set('max_price', maxPrice);
                if (brand) queryParams.set('brand', brand);

                // Use getCategory which returns products with filters
                const categoryData = await api.getCategory(slug, queryParams.toString());

                if (!categoryData?.success) {
                        throw error(404, 'Kategória nenájdená');
                }

                const data = categoryData.data || categoryData;

                return {
                        category: data.category || { name: data.name, slug: data.slug, id: data.id },
                        ancestors: data.ancestors || [],
                        children: data.children || [],
                        products: data.products?.items || data.products || [],
                        total: data.products?.total || data.total || 0,
                        page: data.products?.page || page,
                        limit: data.products?.limit || limit,
                        total_pages: data.products?.pages || Math.ceil((data.products?.total || data.total || 0) / limit),
                        brands: data.brands || [],
                        filters: data.filters || []
                };
        } catch (err) {
                if (err?.status === 404) {
                        throw error(404, 'Kategória nenájdená');
                }
                console.error('Error loading category:', err);
                throw error(500, 'Chyba pri načítaní kategórie');
        }
}
